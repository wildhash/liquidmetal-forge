import { HealthMonitor } from '../monitoring/HealthMonitor.js';

describe('HealthMonitor', () => {
  let monitor: HealthMonitor;

  beforeEach(() => {
    monitor = new HealthMonitor(['test-service']);
  });

  test('should initialize with targets', () => {
    expect(monitor).toBeDefined();
  });

  test('should detect anomalies', () => {
    const anomalies = monitor.detectAnomalies();
    expect(Array.isArray(anomalies)).toBe(true);
  });

  test('should return empty metrics for unknown target', () => {
    const metrics = monitor.getMetrics('unknown-service');
    expect(metrics).toEqual([]);
  });
});
