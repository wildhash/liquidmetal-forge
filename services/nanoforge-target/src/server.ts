import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Fault injection state
interface FaultState {
  latencySpike: boolean;
  errorBurst: boolean;
  memoryLeakSim: boolean;
  latencyMs: number;
  errorRate: number;
}

const faultState: FaultState = {
  latencySpike: false,
  errorBurst: false,
  memoryLeakSim: false,
  latencyMs: 0,
  errorRate: 0
};

// Metrics tracking
interface Metrics {
  latency_ms: number;
  error_rate: number;
  rps: number;
  last_error: string | null;
  requests_total: number;
  errors_total: number;
  uptime_seconds: number;
}

const metrics: Metrics = {
  latency_ms: 100,
  error_rate: 0,
  rps: 0,
  last_error: null,
  requests_total: 0,
  errors_total: 0,
  uptime_seconds: 0
};

const startTime = Date.now();
let requestsInLastSecond = 0;

// Update RPS every second
setInterval(() => {
  metrics.rps = requestsInLastSecond;
  requestsInLastSecond = 0;
  metrics.uptime_seconds = Math.floor((Date.now() - startTime) / 1000);
}, 1000);

// Simulated memory leak
let memoryLeakArray: number[] = [];

// Health endpoint
app.get('/health', (req: Request, res: Response) => {
  requestsInLastSecond++;
  metrics.requests_total++;
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: metrics.uptime_seconds
  });
});

// Metrics endpoint
app.get('/metrics', (req: Request, res: Response) => {
  requestsInLastSecond++;
  metrics.requests_total++;
  
  // Calculate current error rate
  metrics.error_rate = metrics.requests_total > 0 
    ? metrics.errors_total / metrics.requests_total 
    : 0;
  
  res.json({
    latency_ms: metrics.latency_ms,
    error_rate: metrics.error_rate,
    rps: metrics.rps,
    last_error: metrics.last_error,
    requests_total: metrics.requests_total,
    errors_total: metrics.errors_total,
    uptime_seconds: metrics.uptime_seconds,
    active_faults: {
      latency_spike: faultState.latencySpike,
      error_burst: faultState.errorBurst,
      memory_leak_sim: faultState.memoryLeakSim
    }
  });
});

// Compute endpoint (normal endpoint that becomes degraded)
app.get('/compute', async (req: Request, res: Response) => {
  const startTime = Date.now();
  requestsInLastSecond++;
  metrics.requests_total++;
  
  try {
    // Apply latency fault
    if (faultState.latencySpike) {
      await new Promise(resolve => setTimeout(resolve, faultState.latencyMs));
    }
    
    // Apply error fault
    if (faultState.errorBurst && Math.random() < faultState.errorRate) {
      throw new Error('Simulated error burst');
    }
    
    // Apply memory leak
    if (faultState.memoryLeakSim) {
      memoryLeakArray.push(...new Array(1000).fill(Math.random()));
    }
    
    // Normal computation (Fibonacci calculation)
    const n = 30;
    const result = fibonacci(n);
    
    const endTime = Date.now();
    metrics.latency_ms = endTime - startTime;
    
    res.json({
      status: 'success',
      result,
      latency_ms: metrics.latency_ms,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    metrics.errors_total++;
    metrics.last_error = error instanceof Error ? error.message : 'Unknown error';
    
    res.status(500).json({
      status: 'error',
      error: metrics.last_error,
      timestamp: new Date().toISOString()
    });
  }
});

// Inject fault endpoint
app.post('/inject-fault', (req: Request, res: Response) => {
  requestsInLastSecond++;
  metrics.requests_total++;
  
  const { type, clear } = req.body;
  
  if (clear) {
    // Clear all faults
    faultState.latencySpike = false;
    faultState.errorBurst = false;
    faultState.memoryLeakSim = false;
    faultState.latencyMs = 0;
    faultState.errorRate = 0;
    memoryLeakArray = [];
    metrics.latency_ms = 100;
    metrics.last_error = null;
    
    return res.json({
      status: 'cleared',
      message: 'All faults cleared',
      active_faults: faultState
    });
  }
  
  switch (type) {
    case 'latency_spike':
      faultState.latencySpike = true;
      faultState.latencyMs = 2000; // 2 second delay
      break;
      
    case 'error_burst':
      faultState.errorBurst = true;
      faultState.errorRate = 0.5; // 50% error rate
      break;
      
    case 'memory_leak_sim':
      faultState.memoryLeakSim = true;
      break;
      
    default:
      return res.status(400).json({
        status: 'error',
        error: 'Invalid fault type. Use: latency_spike, error_burst, or memory_leak_sim'
      });
  }
  
  res.json({
    status: 'injected',
    fault_type: type,
    active_faults: faultState,
    message: `Fault '${type}' has been injected`
  });
});

// Helper function - using memoization for efficiency
const fibMemo = new Map<number, number>();
function fibonacci(n: number): number {
  if (n <= 1) return n;
  if (fibMemo.has(n)) return fibMemo.get(n)!;
  
  const result = fibonacci(n - 1) + fibonacci(n - 2);
  fibMemo.set(n, result);
  return result;
}

app.listen(PORT, () => {
  console.log(`🎯 Nanoforge Target Service running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Metrics: http://localhost:${PORT}/metrics`);
  console.log(`   Compute: http://localhost:${PORT}/compute`);
  console.log(`   Inject Fault: POST http://localhost:${PORT}/inject-fault`);
});
