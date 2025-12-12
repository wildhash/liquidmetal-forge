import { HealthMonitor } from './monitoring/HealthMonitor.js';
import { DiagnosisEngine } from './diagnosis/DiagnosisEngine.js';
import { AutonomousHealer } from './healing/AutonomousHealer.js';
import { DecisionEngine } from './decision/DecisionEngine.js';
import { LiquidMetalOrchestrator } from './orchestration/LiquidMetalOrchestrator.js';

/**
 * Main entry point for the Liquid Metal self-healing system
 */
async function main() {
  console.log('🚀 Starting Liquid Metal Forge - Autonomous Self-Healing System');
  console.log('================================================\n');

  // Configuration
  const config = {
    targets: [
      'http://localhost:3000',
      'http://localhost:8080',
      'internal-service-1',
      'internal-service-2',
    ],
    monitoringInterval: 10000, // 10 seconds
    autoHealingEnabled: true,
    safetyChecksEnabled: true,
  };

  // Initialize components
  const healthMonitor = new HealthMonitor(config.targets);
  const diagnosisEngine = new DiagnosisEngine();
  const autonomousHealer = new AutonomousHealer();
  const decisionEngine = new DecisionEngine();

  // Configure safety
  autonomousHealer.setSafetyChecks(config.safetyChecksEnabled);

  // Create orchestrator
  const orchestrator = new LiquidMetalOrchestrator(
    healthMonitor,
    diagnosisEngine,
    autonomousHealer,
    decisionEngine
  );

  // Start the system
  await orchestrator.start();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down Liquid Metal Forge...');
    await orchestrator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down Liquid Metal Forge...');
    await orchestrator.stop();
    process.exit(0);
  });
}

// Run the system
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
