import axios from 'axios';
import Redis from 'ioredis';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3001';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || '5000', 10);
const STABILITY_THRESHOLD = parseFloat(process.env.STABILITY_THRESHOLD || '0.7');

// Redis client
const redis = new Redis(REDIS_URL);

// SQLite database for audit log
const dbPath = join(__dirname, '../../data/audit.db');
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    event_type TEXT NOT NULL,
    stability_score REAL NOT NULL,
    metrics TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

interface Metrics {
  latency_ms: number;
  error_rate: number;
  rps: number;
  last_error: string | null;
  requests_total: number;
  errors_total: number;
  uptime_seconds: number;
  active_faults?: {
    latency_spike: boolean;
    error_burst: boolean;
    memory_leak_sim: boolean;
  };
}

interface StabilityEvent {
  timestamp: string;
  event_type: 'degradation' | 'recovery' | 'normal';
  stability_score: number;
  metrics: Metrics;
  threshold: number;
}

class MonitorService {
  private metricsHistory: Metrics[] = [];
  private lastStabilityScore = 1.0;
  private lastEventType: string = 'normal';
  
  async start() {
    console.log('🔍 Monitor Service starting...');
    console.log(`   Target: ${TARGET_URL}`);
    console.log(`   Poll Interval: ${POLL_INTERVAL}ms`);
    console.log(`   Stability Threshold: ${STABILITY_THRESHOLD}`);
    console.log(`   Redis: ${REDIS_URL}`);
    
    // Start polling
    setInterval(() => this.poll(), POLL_INTERVAL);
    
    // Initial poll
    await this.poll();
  }
  
  async poll() {
    try {
      // Fetch metrics from target
      const response = await axios.get(`${TARGET_URL}/metrics`, {
        timeout: 5000
      });
      
      const metrics: Metrics = response.data;
      this.metricsHistory.push(metrics);
      
      // Keep only last 20 metrics
      if (this.metricsHistory.length > 20) {
        this.metricsHistory.shift();
      }
      
      // Calculate stability score
      const stabilityScore = this.calculateStabilityScore(metrics);
      
      // Determine event type
      let eventType: 'degradation' | 'recovery' | 'normal' = 'normal';
      
      if (stabilityScore < STABILITY_THRESHOLD && this.lastStabilityScore >= STABILITY_THRESHOLD) {
        eventType = 'degradation';
      } else if (stabilityScore >= STABILITY_THRESHOLD && this.lastStabilityScore < STABILITY_THRESHOLD) {
        eventType = 'recovery';
      } else if (stabilityScore < STABILITY_THRESHOLD) {
        eventType = 'degradation';
      }
      
      // Only emit events on state changes or degradation
      if (eventType !== 'normal' || this.lastEventType !== 'normal') {
        await this.emitEvent({
          timestamp: new Date().toISOString(),
          event_type: eventType,
          stability_score: stabilityScore,
          metrics,
          threshold: STABILITY_THRESHOLD
        });
      }
      
      this.lastStabilityScore = stabilityScore;
      this.lastEventType = eventType;
      
      // Log status
      const status = stabilityScore >= STABILITY_THRESHOLD ? '✅' : '⚠️';
      console.log(`${status} Stability: ${(stabilityScore * 100).toFixed(1)}% | Latency: ${metrics.latency_ms}ms | Errors: ${(metrics.error_rate * 100).toFixed(1)}%`);
      
    } catch (error) {
      console.error('❌ Failed to poll target:', error instanceof Error ? error.message : 'Unknown error');
      
      // Emit degradation event on poll failure
      await this.emitEvent({
        timestamp: new Date().toISOString(),
        event_type: 'degradation',
        stability_score: 0,
        metrics: {
          latency_ms: 0,
          error_rate: 1,
          rps: 0,
          last_error: 'Service unreachable',
          requests_total: 0,
          errors_total: 0,
          uptime_seconds: 0
        },
        threshold: STABILITY_THRESHOLD
      });
    }
  }
  
  calculateStabilityScore(metrics: Metrics): number {
    // Weighted scoring:
    // - Latency: 40% (lower is better)
    // - Error rate: 40% (lower is better)
    // - RPS: 20% (higher is better, but less critical)
    
    const latencyScore = Math.max(0, 1 - (metrics.latency_ms / 5000)); // 5000ms = 0 score
    const errorScore = Math.max(0, 1 - metrics.error_rate);
    const rpsScore = Math.min(1, metrics.rps / 10); // 10 RPS = full score
    
    const stabilityScore = (
      latencyScore * 0.4 +
      errorScore * 0.4 +
      rpsScore * 0.2
    );
    
    return Math.max(0, Math.min(1, stabilityScore));
  }
  
  async emitEvent(event: StabilityEvent) {
    try {
      // Publish to Redis
      await redis.publish('degradation-events', JSON.stringify(event));
      
      // Store in SQLite audit log
      const stmt = db.prepare(`
        INSERT INTO events (timestamp, event_type, stability_score, metrics)
        VALUES (?, ?, ?, ?)
      `);
      
      stmt.run(
        event.timestamp,
        event.event_type,
        event.stability_score,
        JSON.stringify(event.metrics)
      );
      
      console.log(`📡 Event emitted: ${event.event_type} (score: ${(event.stability_score * 100).toFixed(1)}%)`);
    } catch (error) {
      console.error('❌ Failed to emit event:', error);
    }
  }
}

// Start the monitor
const monitor = new MonitorService();
monitor.start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down monitor...');
  redis.disconnect();
  db.close();
  process.exit(0);
});
