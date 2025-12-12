import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PatchCandidate {
  id: string;
  description: string;
  targetFile: string;
  patchContent: string;
  estimatedComplexity: number; // 0-1 (0 = simple, 1 = complex)
  estimatedRisk: number; // 0-1 (0 = safe, 1 = risky)
  expectedRecovery: number; // 0-1 (0 = no recovery, 1 = full recovery)
}

export interface ScoringContext {
  anomalyType: string;
  severity: number; // 0-1
  affectedFiles: string[];
  historicalData?: LearningRecord[];
}

export interface LearningRecord {
  patchId: string;
  anomalyType: string;
  appliedAt: string;
  effectivenessScore: number; // 0-1 (actual outcome)
  complexity: number;
  risk: number;
  expectedRecovery: number;
  actualRecovery: number;
}

export interface ScoringResult {
  patchId: string;
  score: number; // 0-1 (higher is better)
  confidence: number; // 0-1
  reasoning: string[];
}

export class OumiLiteScorer {
  private learningPath: string;
  private learningRecords: LearningRecord[] = [];
  private weights = {
    complexity: -0.3, // Lower complexity is better
    risk: -0.4, // Lower risk is better
    expectedRecovery: 0.5, // Higher expected recovery is better
    historicalSuccess: 0.6 // Historical effectiveness
  };
  
  constructor(learningPath?: string) {
    this.learningPath = learningPath || join(process.cwd(), 'data', 'learning.jsonl');
    this.loadLearningRecords();
  }
  
  /**
   * Score a patch candidate based on metrics and historical data
   */
  scorePatches(candidates: PatchCandidate[], context: ScoringContext): ScoringResult[] {
    return candidates.map(candidate => {
      const reasoning: string[] = [];
      let score = 0.5; // Base score
      
      // Factor 1: Complexity (simpler is better)
      const complexityScore = (1 - candidate.estimatedComplexity) * this.weights.complexity;
      score += complexityScore;
      reasoning.push(`Complexity: ${(candidate.estimatedComplexity * 100).toFixed(0)}% (${complexityScore > 0 ? '+' : ''}${complexityScore.toFixed(2)})`);
      
      // Factor 2: Risk (lower is better)
      const riskScore = (1 - candidate.estimatedRisk) * this.weights.risk;
      score += riskScore;
      reasoning.push(`Risk: ${(candidate.estimatedRisk * 100).toFixed(0)}% (${riskScore > 0 ? '+' : ''}${riskScore.toFixed(2)})`);
      
      // Factor 3: Expected Recovery
      const recoveryScore = candidate.expectedRecovery * this.weights.expectedRecovery;
      score += recoveryScore;
      reasoning.push(`Expected Recovery: ${(candidate.expectedRecovery * 100).toFixed(0)}% (+${recoveryScore.toFixed(2)})`);
      
      // Factor 4: Historical Success (bandit-style learning)
      const historicalScore = this.getHistoricalScore(candidate, context);
      score += historicalScore * this.weights.historicalSuccess;
      reasoning.push(`Historical Success: ${(historicalScore * 100).toFixed(0)}% (+${(historicalScore * this.weights.historicalSuccess).toFixed(2)})`);
      
      // Normalize score to 0-1 range
      score = Math.max(0, Math.min(1, score));
      
      // Calculate confidence based on amount of historical data
      const confidence = this.calculateConfidence(candidate, context);
      
      return {
        patchId: candidate.id,
        score,
        confidence,
        reasoning
      };
    }).sort((a, b) => b.score - a.score); // Sort by score descending
  }
  
  /**
   * Get historical effectiveness for similar patches
   */
  private getHistoricalScore(candidate: PatchCandidate, context: ScoringContext): number {
    // Find similar patches from history
    const similarPatches = this.learningRecords.filter(record => 
      record.anomalyType === context.anomalyType
    );
    
    if (similarPatches.length === 0) {
      return 0.5; // Neutral score when no history
    }
    
    // Calculate average effectiveness
    const avgEffectiveness = similarPatches.reduce((sum, record) => 
      sum + record.effectivenessScore, 0
    ) / similarPatches.length;
    
    // Weight recent patches more heavily (recency bias)
    const recentPatches = similarPatches.slice(-5);
    const recentAvg = recentPatches.reduce((sum, record) => 
      sum + record.effectivenessScore, 0
    ) / recentPatches.length;
    
    // 70% recent, 30% all-time average
    return recentAvg * 0.7 + avgEffectiveness * 0.3;
  }
  
  /**
   * Calculate confidence based on historical data availability
   */
  private calculateConfidence(candidate: PatchCandidate, context: ScoringContext): number {
    const similarPatches = this.learningRecords.filter(record => 
      record.anomalyType === context.anomalyType
    );
    
    // Confidence increases with more historical data, caps at 0.95
    const baseConfidence = 0.5;
    const dataBonus = Math.min(0.45, similarPatches.length * 0.05);
    
    return baseConfidence + dataBonus;
  }
  
  /**
   * Record the outcome of an applied patch for learning
   */
  recordOutcome(record: LearningRecord): void {
    this.learningRecords.push(record);
    this.persistLearningRecord(record);
    this.updateWeights(record);
  }
  
  /**
   * Update scoring weights based on bandit-style learning
   */
  private updateWeights(record: LearningRecord): void {
    const learningRate = 0.1;
    
    // If patch was effective, slightly increase weight on factors that predicted it
    if (record.effectivenessScore > 0.7) {
      // Successful patch - increase positive factors
      if (record.complexity < 0.5) {
        this.weights.complexity = Math.min(0, this.weights.complexity + learningRate * 0.1);
      }
      if (record.risk < 0.5) {
        this.weights.risk = Math.min(0, this.weights.risk + learningRate * 0.1);
      }
    }
  }
  
  /**
   * Load learning records from JSONL file
   */
  private loadLearningRecords(): void {
    try {
      if (!existsSync(this.learningPath)) {
        // Create directory if it doesn't exist
        const dir = dirname(this.learningPath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        return;
      }
      
      const data = readFileSync(this.learningPath, 'utf-8');
      const lines = data.trim().split('\n').filter(line => line.length > 0);
      
      this.learningRecords = lines.map(line => JSON.parse(line));
      console.log(`📚 Loaded ${this.learningRecords.length} learning records`);
    } catch (error) {
      console.error('Failed to load learning records:', error);
      this.learningRecords = [];
    }
  }
  
  /**
   * Persist a single learning record to JSONL file
   */
  private persistLearningRecord(record: LearningRecord): void {
    try {
      const dir = dirname(this.learningPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      
      const line = JSON.stringify(record) + '\n';
      writeFileSync(this.learningPath, line, { flag: 'a' });
    } catch (error) {
      console.error('Failed to persist learning record:', error);
    }
  }
  
  /**
   * Export all learning records
   */
  exportMemory(): LearningRecord[] {
    return [...this.learningRecords];
  }
  
  /**
   * Get statistics about learning
   */
  getStatistics() {
    if (this.learningRecords.length === 0) {
      return {
        totalRecords: 0,
        avgEffectiveness: 0,
        successRate: 0,
        anomalyTypes: []
      };
    }
    
    const avgEffectiveness = this.learningRecords.reduce((sum, r) => 
      sum + r.effectivenessScore, 0
    ) / this.learningRecords.length;
    
    const successRate = this.learningRecords.filter(r => 
      r.effectivenessScore > 0.7
    ).length / this.learningRecords.length;
    
    const anomalyTypes = [...new Set(this.learningRecords.map(r => r.anomalyType))];
    
    return {
      totalRecords: this.learningRecords.length,
      avgEffectiveness,
      successRate,
      anomalyTypes,
      weights: this.weights
    };
  }
}

export default OumiLiteScorer;
