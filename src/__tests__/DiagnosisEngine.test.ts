import { DiagnosisEngine } from '../diagnosis/DiagnosisEngine';
import { Anomaly } from '../types';

describe('DiagnosisEngine', () => {
  let engine: DiagnosisEngine;

  beforeEach(() => {
    engine = new DiagnosisEngine();
  });

  test('should diagnose anomaly', async () => {
    const anomaly: Anomaly = {
      id: 'test-anomaly',
      timestamp: Date.now(),
      severity: 'high',
      type: 'spike',
      description: 'Test anomaly',
      affectedComponents: ['test-service'],
      metrics: [
        {
          timestamp: Date.now(),
          metricName: 'response_time',
          value: 5000,
          threshold: 1000,
          status: 'critical',
        },
      ],
    };

    const diagnosis = await engine.diagnose(anomaly);
    
    expect(diagnosis).toBeDefined();
    expect(diagnosis.anomalyId).toBe('test-anomaly');
    expect(diagnosis.rootCause).toBeTruthy();
    expect(diagnosis.confidence).toBeGreaterThan(0);
    expect(diagnosis.confidence).toBeLessThanOrEqual(1);
    expect(Array.isArray(diagnosis.suggestedFixes)).toBe(true);
  });

  test('should maintain diagnosis history', async () => {
    const anomaly: Anomaly = {
      id: 'test-anomaly-2',
      timestamp: Date.now(),
      severity: 'medium',
      type: 'error',
      description: 'Error rate spike',
      affectedComponents: ['api'],
      metrics: [],
    };

    await engine.diagnose(anomaly);
    const history = engine.getHistory();
    
    expect(history.length).toBeGreaterThan(0);
  });
});
