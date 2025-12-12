import { HealthMonitor } from '../monitoring/HealthMonitor.js';
import { DiagnosisEngine } from '../diagnosis/DiagnosisEngine.js';
import { AutonomousHealer } from '../healing/AutonomousHealer.js';
import { DecisionEngine } from '../decision/DecisionEngine.js';
import { Anomaly } from '../types.js';

/**
 * Main orchestrator for the Liquid Metal system
 * Coordinates monitoring, diagnosis, healing, and learning
 */
export class LiquidMetalOrchestrator {
  private isRunning = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private healingCycle = 0;

  constructor(
    private healthMonitor: HealthMonitor,
    private diagnosisEngine: DiagnosisEngine,
    private autonomousHealer: AutonomousHealer,
    private decisionEngine: DecisionEngine
  ) {}

  /**
   * Start the self-healing system
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ System already running');
      return;
    }

    this.isRunning = true;
    console.log('✨ Liquid Metal Orchestrator started');

    // Start health monitoring
    await this.healthMonitor.start();

    // Start the main healing loop
    this.monitoringInterval = setInterval(
      () => this.healingLoop(),
      30000 // Run healing loop every 30 seconds
    );

    console.log('🔄 Self-healing loop activated\n');
  }

  /**
   * Stop the self-healing system
   */
  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('✅ Liquid Metal Orchestrator stopped');
  }

  /**
   * Main healing loop
   */
  private async healingLoop(): Promise<void> {
    if (!this.isRunning) return;

    this.healingCycle++;
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔄 Healing Cycle #${this.healingCycle} - ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    try {
      // Step 1: Detect anomalies
      console.log('\n📊 Step 1: Detecting anomalies...');
      const anomalies = this.healthMonitor.detectAnomalies();

      if (anomalies.length === 0) {
        console.log('✅ No anomalies detected - system healthy');
        return;
      }

      console.log(`⚠️ Detected ${anomalies.length} anomaly(ies)`);
      anomalies.forEach(anomaly => {
        console.log(`  - ${anomaly.type}: ${anomaly.description} (${anomaly.severity})`);
      });

      // Step 2: Diagnose each anomaly
      console.log('\n🔬 Step 2: Diagnosing root causes...');
      for (const anomaly of anomalies) {
        await this.processAnomaly(anomaly);
      }

    } catch (error) {
      console.error('💥 Error in healing loop:', error);
    }
  }

  /**
   * Process a single anomaly through the healing pipeline
   */
  private async processAnomaly(anomaly: Anomaly): Promise<void> {
    console.log(`\nProcessing anomaly: ${anomaly.id}`);

    // Diagnose the issue
    const diagnosis = await this.diagnosisEngine.diagnose(anomaly);
    console.log(`Root cause: ${diagnosis.rootCause}`);
    console.log(`Confidence: ${(diagnosis.confidence * 100).toFixed(1)}%`);

    if (diagnosis.suggestedFixes.length === 0) {
      console.log('❌ No fixes available for this issue');
      return;
    }

    // Score the healing action
    console.log('\n🎯 Step 3: Scoring healing actions...');
    const actionDescription = diagnosis.suggestedFixes.map(f => f.description).join('; ');
    const context = {
      severity: anomaly.severity,
      type: anomaly.type,
      confidence: diagnosis.confidence,
    };

    const decision = this.decisionEngine.scoreAction(actionDescription, context);
    console.log(`Action score: ${(decision.score * 100).toFixed(1)}%`);
    console.log(`Reasoning: ${decision.reasoning}`);

    // Decide whether to heal
    const shouldHeal = decision.score > 0.6 && diagnosis.confidence > 0.5;

    if (!shouldHeal) {
      console.log('⏸️ Skipping healing - score or confidence too low');
      // Still learn from the decision
      this.decisionEngine.learn(
        anomaly.type,
        actionDescription,
        0,
        context
      );
      return;
    }

    // Apply healing
    console.log('\n🔧 Step 4: Applying healing actions...');
    const healingAction = await this.autonomousHealer.heal(diagnosis);

    if (!healingAction.result) {
      console.log('❌ Healing failed - no result available');
      return;
    }

    // Learn from the result
    console.log('\n📚 Step 5: Learning from results...');
    const effectiveness = healingAction.result.improvement / 100;
    this.decisionEngine.learn(
      anomaly.type,
      actionDescription,
      Math.max(0, Math.min(1, effectiveness)),
      context
    );

    // Report results
    if (healingAction.result.success) {
      console.log(`\n✅ Healing successful!`);
      console.log(`   Applied ${healingAction.result.appliedFixes.length} fix(es)`);
      console.log(`   Improvement: ${healingAction.result.improvement.toFixed(1)}%`);
    } else {
      console.log('\n❌ Healing failed');
    }

    // Show learning stats
    const stats = this.decisionEngine.getStats();
    console.log(`\n📊 Learning Stats:`);
    console.log(`   Total memories: ${stats.totalMemories}`);
    console.log(`   Avg effectiveness: ${(stats.avgEffectiveness * 100).toFixed(1)}%`);
    console.log(`   Recent successes: ${stats.recentSuccesses}`);
  }

  /**
   * Get system status
   */
  getStatus(): {
    isRunning: boolean;
    healingCycle: number;
    learningStats: unknown;
    diagnosisHistory: number;
    healingHistory: number;
  } {
    return {
      isRunning: this.isRunning,
      healingCycle: this.healingCycle,
      learningStats: this.decisionEngine.getStats(),
      diagnosisHistory: this.diagnosisEngine.getHistory().length,
      healingHistory: this.autonomousHealer.getHistory().length,
    };
  }
}
