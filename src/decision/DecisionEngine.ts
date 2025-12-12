import { LearningMemory, DecisionScore } from '../types.js';

/**
 * Decision Engine - Uses Oumi-inspired learning to score and improve decisions
 */
export class DecisionEngine {
  private memory: Map<string, LearningMemory> = new Map();
  private readonly memoryLimit = 1000;

  /**
   * Score a potential healing action based on historical data
   */
  scoreAction(action: string, context: Record<string, unknown>): DecisionScore {
    const historicalData = this.findSimilarMemories(action, context);
    
    // Calculate base score
    let score = 0.5;
    
    // Adjust based on historical effectiveness
    if (historicalData.length > 0) {
      const avgEffectiveness = historicalData.reduce(
        (sum, mem) => sum + mem.effectiveness,
        0
      ) / historicalData.length;
      
      score = avgEffectiveness;
    }

    // Adjust based on recency
    const recentSuccesses = historicalData.filter(
      mem => mem.effectiveness > 0.7 && Date.now() - mem.timestamp < 86400000 // 24 hours
    );
    
    if (recentSuccesses.length > 0) {
      score += 0.1;
    }

    // Adjust based on context similarity
    const contextSimilarity = this.calculateContextSimilarity(historicalData, context);
    score = score * (0.7 + contextSimilarity * 0.3);

    score = Math.max(0, Math.min(1, score));

    const reasoning = this.generateReasoning(score, historicalData, contextSimilarity);

    return {
      action,
      score,
      reasoning,
      historicalData,
    };
  }

  /**
   * Learn from a healing action result
   */
  learn(
    anomalyPattern: string,
    healingAction: string,
    effectiveness: number,
    context: Record<string, unknown>
  ): void {
    const memoryId = `mem-${Date.now()}-${Math.random()}`;
    
    const memory: LearningMemory = {
      id: memoryId,
      timestamp: Date.now(),
      anomalyPattern,
      healingAction,
      effectiveness,
      context,
    };

    this.memory.set(memoryId, memory);

    // Cleanup old memories if limit exceeded
    if (this.memory.size > this.memoryLimit) {
      this.cleanupOldMemories();
    }

    console.log(
      `📚 Learned: ${anomalyPattern} → ${healingAction} (effectiveness: ${(effectiveness * 100).toFixed(1)}%)`
    );
  }

  /**
   * Find similar memories based on action and context
   */
  private findSimilarMemories(
    action: string,
    _context: Record<string, unknown>
  ): LearningMemory[] {
    const similar: LearningMemory[] = [];

    for (const memory of this.memory.values()) {
      // Check if healing action is similar
      if (this.actionsAreSimilar(memory.healingAction, action)) {
        similar.push(memory);
      }
    }

    // Sort by timestamp (most recent first)
    return similar.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Check if two actions are similar
   */
  private actionsAreSimilar(action1: string, action2: string): boolean {
    // Simple similarity check - in production, use more sophisticated NLP
    const keywords1 = action1.toLowerCase().split(/\s+/);
    const keywords2 = action2.toLowerCase().split(/\s+/);

    const commonKeywords = keywords1.filter(k => keywords2.includes(k));
    const similarity = commonKeywords.length / Math.max(keywords1.length, keywords2.length);

    return similarity > 0.5;
  }

  /**
   * Calculate context similarity
   */
  private calculateContextSimilarity(
    memories: LearningMemory[],
    currentContext: Record<string, unknown>
  ): number {
    if (memories.length === 0) {
      return 0;
    }

    const similarities = memories.map(mem => {
      let matchCount = 0;
      let totalKeys = 0;

      for (const key of Object.keys(currentContext)) {
        totalKeys++;
        if (mem.context[key] === currentContext[key]) {
          matchCount++;
        }
      }

      return totalKeys > 0 ? matchCount / totalKeys : 0;
    });

    return similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;
  }

  /**
   * Generate reasoning for the decision score
   */
  private generateReasoning(
    score: number,
    historicalData: LearningMemory[],
    contextSimilarity: number
  ): string {
    const parts: string[] = [];

    if (historicalData.length === 0) {
      parts.push('No historical data available, using baseline score');
    } else {
      const avgEffectiveness = historicalData.reduce(
        (sum, mem) => sum + mem.effectiveness,
        0
      ) / historicalData.length;

      parts.push(
        `Based on ${historicalData.length} similar past action(s) with ${(avgEffectiveness * 100).toFixed(1)}% avg effectiveness`
      );
    }

    if (contextSimilarity > 0.7) {
      parts.push('High context similarity with successful past actions');
    } else if (contextSimilarity > 0.3) {
      parts.push('Moderate context similarity with past actions');
    } else if (historicalData.length > 0) {
      parts.push('Low context similarity - may need adaptation');
    }

    if (score > 0.8) {
      parts.push('High confidence - recommended action');
    } else if (score > 0.5) {
      parts.push('Moderate confidence - proceed with monitoring');
    } else {
      parts.push('Low confidence - consider alternative approaches');
    }

    return parts.join('. ');
  }

  /**
   * Cleanup old memories to maintain limit
   */
  private cleanupOldMemories(): void {
    // Sort memories by timestamp and keep only the most recent ones
    const sorted = Array.from(this.memory.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );

    this.memory.clear();
    sorted.slice(0, this.memoryLimit).forEach(mem => {
      this.memory.set(mem.id, mem);
    });

    console.log(`🧹 Cleaned up old memories, retained ${this.memory.size} entries`);
  }

  /**
   * Get memory statistics
   */
  getStats(): {
    totalMemories: number;
    avgEffectiveness: number;
    recentSuccesses: number;
  } {
    const memories = Array.from(this.memory.values());
    
    return {
      totalMemories: memories.length,
      avgEffectiveness: memories.length > 0
        ? memories.reduce((sum, mem) => sum + mem.effectiveness, 0) / memories.length
        : 0,
      recentSuccesses: memories.filter(
        mem => mem.effectiveness > 0.7 && Date.now() - mem.timestamp < 86400000
      ).length,
    };
  }

  /**
   * Export memory for persistence
   */
  exportMemory(): LearningMemory[] {
    return Array.from(this.memory.values());
  }

  /**
   * Import memory from persistence
   */
  importMemory(memories: LearningMemory[]): void {
    this.memory.clear();
    memories.forEach(mem => {
      this.memory.set(mem.id, mem);
    });
    console.log(`📥 Imported ${memories.length} memories`);
  }
}
