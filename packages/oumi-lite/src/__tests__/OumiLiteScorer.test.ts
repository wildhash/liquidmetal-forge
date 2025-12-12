import { OumiLiteScorer, PatchCandidate, ScoringContext } from '../index';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

describe('OumiLiteScorer', () => {
  const testLearningPath = join(__dirname, '../../test-learning.jsonl');
  let scorer: OumiLiteScorer;

  beforeEach(() => {
    // Clean up test file if it exists
    if (existsSync(testLearningPath)) {
      unlinkSync(testLearningPath);
    }
    scorer = new OumiLiteScorer(testLearningPath);
  });

  afterEach(() => {
    // Clean up test file
    if (existsSync(testLearningPath)) {
      unlinkSync(testLearningPath);
    }
  });

  describe('scorePatches', () => {
    it('should score patches based on multiple factors', () => {
      const candidates: PatchCandidate[] = [
        {
          id: 'patch-1',
          description: 'Simple fix with low risk',
          targetFile: 'src/api.ts',
          patchContent: '...',
          estimatedComplexity: 0.2,
          estimatedRisk: 0.1,
          expectedRecovery: 0.9
        },
        {
          id: 'patch-2',
          description: 'Complex fix with high risk',
          targetFile: 'src/database.ts',
          patchContent: '...',
          estimatedComplexity: 0.8,
          estimatedRisk: 0.7,
          expectedRecovery: 0.6
        }
      ];

      const context: ScoringContext = {
        anomalyType: 'high_latency',
        severity: 0.8,
        affectedFiles: ['src/api.ts']
      };

      const results = scorer.scorePatches(candidates, context);

      expect(results).toHaveLength(2);
      expect(results[0].patchId).toBe('patch-1'); // Simple fix should score higher
      expect(results[0].score).toBeGreaterThan(results[1].score);
      expect(results[0].confidence).toBeGreaterThanOrEqual(0);
      expect(results[0].confidence).toBeLessThanOrEqual(1);
    });

    it('should return sorted results (highest score first)', () => {
      const candidates: PatchCandidate[] = [
        {
          id: 'low-score',
          description: 'Bad patch',
          targetFile: 'src/api.ts',
          patchContent: '...',
          estimatedComplexity: 0.9,
          estimatedRisk: 0.9,
          expectedRecovery: 0.1
        },
        {
          id: 'high-score',
          description: 'Good patch',
          targetFile: 'src/api.ts',
          patchContent: '...',
          estimatedComplexity: 0.1,
          estimatedRisk: 0.1,
          expectedRecovery: 0.9
        }
      ];

      const context: ScoringContext = {
        anomalyType: 'error_burst',
        severity: 0.7,
        affectedFiles: ['src/api.ts']
      };

      const results = scorer.scorePatches(candidates, context);

      expect(results[0].patchId).toBe('high-score');
      expect(results[1].patchId).toBe('low-score');
    });

    it('should include reasoning for scores', () => {
      const candidates: PatchCandidate[] = [
        {
          id: 'patch-1',
          description: 'Test patch',
          targetFile: 'src/test.ts',
          patchContent: '...',
          estimatedComplexity: 0.5,
          estimatedRisk: 0.5,
          expectedRecovery: 0.7
        }
      ];

      const context: ScoringContext = {
        anomalyType: 'test_anomaly',
        severity: 0.6,
        affectedFiles: ['src/test.ts']
      };

      const results = scorer.scorePatches(candidates, context);

      expect(results[0].reasoning).toBeDefined();
      expect(results[0].reasoning.length).toBeGreaterThan(0);
      expect(results[0].reasoning[0]).toContain('Complexity');
    });
  });

  describe('recordOutcome', () => {
    it('should record learning outcomes', () => {
      const record = {
        patchId: 'patch-1',
        anomalyType: 'high_latency',
        appliedAt: new Date().toISOString(),
        effectivenessScore: 0.85,
        complexity: 0.3,
        risk: 0.2,
        expectedRecovery: 0.8,
        actualRecovery: 0.85
      };

      scorer.recordOutcome(record);

      const stats = scorer.getStatistics();
      expect(stats.totalRecords).toBe(1);
      expect(stats.avgEffectiveness).toBe(0.85);
    });

    it('should persist learning records', () => {
      const record = {
        patchId: 'patch-1',
        anomalyType: 'error_burst',
        appliedAt: new Date().toISOString(),
        effectivenessScore: 0.9,
        complexity: 0.2,
        risk: 0.1,
        expectedRecovery: 0.8,
        actualRecovery: 0.9
      };

      scorer.recordOutcome(record);

      // Create new scorer instance to test persistence
      const newScorer = new OumiLiteScorer(testLearningPath);
      const stats = newScorer.getStatistics();
      
      expect(stats.totalRecords).toBe(1);
      expect(stats.avgEffectiveness).toBe(0.9);
    });
  });

  describe('learning and adaptation', () => {
    it('should improve scores based on historical data', () => {
      // Record a successful outcome for a specific anomaly type
      scorer.recordOutcome({
        patchId: 'patch-1',
        anomalyType: 'high_latency',
        appliedAt: new Date().toISOString(),
        effectivenessScore: 0.95,
        complexity: 0.2,
        risk: 0.1,
        expectedRecovery: 0.8,
        actualRecovery: 0.95
      });

      const candidates: PatchCandidate[] = [
        {
          id: 'patch-2',
          description: 'Similar patch',
          targetFile: 'src/api.ts',
          patchContent: '...',
          estimatedComplexity: 0.2,
          estimatedRisk: 0.1,
          expectedRecovery: 0.8
        }
      ];

      const context: ScoringContext = {
        anomalyType: 'high_latency',
        severity: 0.8,
        affectedFiles: ['src/api.ts']
      };

      const results = scorer.scorePatches(candidates, context);

      // With historical success, confidence should be higher
      expect(results[0].confidence).toBeGreaterThan(0.5);
    });

    it('should calculate statistics correctly', () => {
      scorer.recordOutcome({
        patchId: 'patch-1',
        anomalyType: 'error_burst',
        appliedAt: new Date().toISOString(),
        effectivenessScore: 0.8,
        complexity: 0.3,
        risk: 0.2,
        expectedRecovery: 0.7,
        actualRecovery: 0.8
      });

      scorer.recordOutcome({
        patchId: 'patch-2',
        anomalyType: 'error_burst',
        appliedAt: new Date().toISOString(),
        effectivenessScore: 0.6,
        complexity: 0.5,
        risk: 0.4,
        expectedRecovery: 0.6,
        actualRecovery: 0.6
      });

      const stats = scorer.getStatistics();

      expect(stats.totalRecords).toBe(2);
      expect(stats.avgEffectiveness).toBe(0.7); // (0.8 + 0.6) / 2
      expect(stats.successRate).toBe(0.5); // 1 out of 2 above 0.7
      expect(stats.anomalyTypes).toContain('error_burst');
    });
  });

  describe('exportMemory', () => {
    it('should export learning records', () => {
      scorer.recordOutcome({
        patchId: 'patch-1',
        anomalyType: 'test',
        appliedAt: new Date().toISOString(),
        effectivenessScore: 0.8,
        complexity: 0.3,
        risk: 0.2,
        expectedRecovery: 0.7,
        actualRecovery: 0.8
      });

      const memory = scorer.exportMemory();

      expect(memory).toHaveLength(1);
      expect(memory[0].patchId).toBe('patch-1');
      expect(memory[0].effectivenessScore).toBe(0.8);
    });
  });
});
