import { DecisionEngine } from '../decision/DecisionEngine';

describe('DecisionEngine', () => {
  let engine: DecisionEngine;

  beforeEach(() => {
    engine = new DecisionEngine();
  });

  test('should score action with no history', () => {
    const score = engine.scoreAction('test-action', { severity: 'high' });
    
    expect(score).toBeDefined();
    expect(score.score).toBeGreaterThanOrEqual(0);
    expect(score.score).toBeLessThanOrEqual(1);
    expect(score.reasoning).toBeTruthy();
  });

  test('should learn from actions', () => {
    engine.learn('spike', 'optimize-query', 0.8, { severity: 'high' });
    
    const stats = engine.getStats();
    expect(stats.totalMemories).toBe(1);
    expect(stats.avgEffectiveness).toBeCloseTo(0.8);
  });

  test('should improve scoring with historical data', () => {
    // First, learn from a successful action
    engine.learn('response_time_spike', 'add-caching', 0.9, { severity: 'high' });
    
    // Now score a similar action (using exact same keywords to ensure match)
    const score = engine.scoreAction('add-caching', { severity: 'high' });
    
    expect(score.score).toBeGreaterThan(0.5); // Should have higher confidence
    expect(score.historicalData.length).toBeGreaterThan(0);
  });

  test('should export and import memory', () => {
    engine.learn('test-pattern', 'test-action', 0.7, { test: true });
    
    const exported = engine.exportMemory();
    expect(exported.length).toBeGreaterThan(0);
    
    const newEngine = new DecisionEngine();
    newEngine.importMemory(exported);
    
    const stats = newEngine.getStats();
    expect(stats.totalMemories).toBe(exported.length);
  });
});
