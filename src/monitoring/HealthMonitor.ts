import { HealthCheck, HealthMetric, Anomaly } from '../types.js';

/**
 * Health Monitor - Continuously monitors application health
 */
export class HealthMonitor {
  private metrics: Map<string, HealthMetric[]> = new Map();
  private readonly retentionPeriod = 3600000; // 1 hour
  private readonly checkInterval = 10000; // 10 seconds

  constructor(private targets: string[] = []) {}

  /**
   * Start monitoring
   */
  async start(): Promise<void> {
    console.log('🔍 Health Monitor started');
    setInterval(() => this.performHealthCheck(), this.checkInterval);
  }

  /**
   * Perform health check on all targets
   */
  private async performHealthCheck(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];
    
    for (const target of this.targets) {
      const metrics = await this.collectMetrics(target);
      const status = this.evaluateHealth(metrics);
      
      checks.push({
        name: target,
        status,
        timestamp: Date.now(),
        metrics,
      });
    }

    return checks;
  }

  /**
   * Collect metrics for a target
   */
  private async collectMetrics(target: string): Promise<HealthMetric[]> {
    const metrics: HealthMetric[] = [];

    // Response time metric
    const responseTime = await this.measureResponseTime(target);
    metrics.push({
      timestamp: Date.now(),
      metricName: 'response_time',
      value: responseTime,
      threshold: 1000,
      status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'degraded' : 'critical',
    });

    // Error rate metric
    const errorRate = await this.measureErrorRate(target);
    metrics.push({
      timestamp: Date.now(),
      metricName: 'error_rate',
      value: errorRate,
      threshold: 0.05,
      status: errorRate < 0.05 ? 'healthy' : errorRate < 0.15 ? 'degraded' : 'critical',
    });

    // CPU usage metric
    const cpuUsage = await this.measureCpuUsage(target);
    metrics.push({
      timestamp: Date.now(),
      metricName: 'cpu_usage',
      value: cpuUsage,
      threshold: 80,
      status: cpuUsage < 80 ? 'healthy' : cpuUsage < 95 ? 'degraded' : 'critical',
    });

    // Store metrics
    if (!this.metrics.has(target)) {
      this.metrics.set(target, []);
    }
    this.metrics.get(target)!.push(...metrics);
    this.cleanupOldMetrics(target);

    return metrics;
  }

  /**
   * Measure response time for a target
   */
  private async measureResponseTime(target: string): Promise<number> {
    // Simulated measurement - in production, this would make actual HTTP requests
    return Math.random() * 2000;
  }

  /**
   * Measure error rate for a target
   */
  private async measureErrorRate(target: string): Promise<number> {
    // Simulated measurement - in production, this would check actual error logs
    return Math.random() * 0.1;
  }

  /**
   * Measure CPU usage for a target
   */
  private async measureCpuUsage(target: string): Promise<number> {
    // Simulated measurement - in production, this would check system metrics
    return Math.random() * 100;
  }

  /**
   * Evaluate overall health based on metrics
   */
  private evaluateHealth(metrics: HealthMetric[]): 'healthy' | 'degraded' | 'failed' {
    const criticalCount = metrics.filter(m => m.status === 'critical').length;
    const degradedCount = metrics.filter(m => m.status === 'degraded').length;

    if (criticalCount > 0) return 'failed';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  }

  /**
   * Detect anomalies in collected metrics
   */
  detectAnomalies(): Anomaly[] {
    const anomalies: Anomaly[] = [];

    for (const [target, metrics] of this.metrics.entries()) {
      const recentMetrics = metrics.slice(-10);
      
      // Check for sudden spikes
      for (const metricName of ['response_time', 'error_rate', 'cpu_usage']) {
        const metricValues = recentMetrics
          .filter(m => m.metricName === metricName)
          .map(m => m.value);

        if (metricValues.length >= 3) {
          const avg = metricValues.reduce((a, b) => a + b, 0) / metricValues.length;
          const latest = metricValues[metricValues.length - 1];

          if (latest > avg * 2) {
            anomalies.push({
              id: `anomaly-${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
              severity: latest > avg * 5 ? 'critical' : 'high',
              type: 'spike',
              description: `Sudden spike in ${metricName} for ${target}`,
              affectedComponents: [target],
              metrics: recentMetrics.filter(m => m.metricName === metricName),
            });
          }
        }
      }
    }

    return anomalies;
  }

  /**
   * Get metrics for a specific target
   */
  getMetrics(target: string): HealthMetric[] {
    return this.metrics.get(target) || [];
  }

  /**
   * Cleanup old metrics beyond retention period
   */
  private cleanupOldMetrics(target: string): void {
    const cutoff = Date.now() - this.retentionPeriod;
    const targetMetrics = this.metrics.get(target);
    
    if (targetMetrics) {
      const filtered = targetMetrics.filter(m => m.timestamp > cutoff);
      this.metrics.set(target, filtered);
    }
  }
}
