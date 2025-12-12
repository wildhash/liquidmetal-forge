#!/usr/bin/env node

/**
 * Demo script to showcase the Liquid Metal system
 */

import { HealthMonitor } from './src/monitoring/HealthMonitor.js';
import { DiagnosisEngine } from './src/diagnosis/DiagnosisEngine.js';
import { AutonomousHealer } from './src/healing/AutonomousHealer.js';
import { DecisionEngine } from './src/decision/DecisionEngine.js';

console.log('🦾 Liquid Metal Forge - Demo');
console.log('='.repeat(60));
console.log();

// Initialize components
const monitor = new HealthMonitor(['demo-service']);
const diagnosis = new DiagnosisEngine();
const healer = new AutonomousHealer();
const decision = new DecisionEngine();

// Simulate anomaly
console.log('📊 Step 1: Simulating performance anomaly...');
const anomaly = {
  id: 'demo-anomaly-1',
  timestamp: Date.now(),
  severity: 'high' as const,
  type: 'response_time_spike',
  description: 'Response time increased from 200ms to 4500ms',
  affectedComponents: ['api-handler'],
  metrics: [
    {
      timestamp: Date.now(),
      metricName: 'response_time',
      value: 4500,
      threshold: 1000,
      status: 'critical' as const,
    },
  ],
};
console.log(`   Anomaly: ${anomaly.description}`);
console.log();

// Diagnose
console.log('🔬 Step 2: Diagnosing root cause...');
const diagnosisResult = await diagnosis.diagnose(anomaly);
console.log(`   Root Cause: ${diagnosisResult.rootCause}`);
console.log(`   Confidence: ${(diagnosisResult.confidence * 100).toFixed(1)}%`);
console.log(`   Suggested Fixes: ${diagnosisResult.suggestedFixes.length}`);
console.log();

// Score decision
console.log('🎯 Step 3: Scoring healing action...');
const fixDescription = diagnosisResult.suggestedFixes.map(f => f.description).join('; ');
const decisionScore = decision.scoreAction(fixDescription, {
  severity: anomaly.severity,
  confidence: diagnosisResult.confidence,
});
console.log(`   Score: ${(decisionScore.score * 100).toFixed(1)}%`);
console.log(`   Reasoning: ${decisionScore.reasoning}`);
console.log();

// Apply healing
console.log('🔧 Step 4: Applying autonomous healing...');
const healingAction = await healer.heal(diagnosisResult);
console.log(`   Status: ${healingAction.status}`);
if (healingAction.result) {
  console.log(`   Applied Fixes: ${healingAction.result.appliedFixes.length}`);
  console.log(`   Improvement: ${healingAction.result.improvement.toFixed(1)}%`);
}
console.log();

// Learn
console.log('📚 Step 5: Learning from the action...');
decision.learn(
  anomaly.type,
  fixDescription,
  healingAction.result?.improvement ? healingAction.result.improvement / 100 : 0,
  { severity: anomaly.severity }
);
const stats = decision.getStats();
console.log(`   Total Memories: ${stats.totalMemories}`);
console.log(`   Avg Effectiveness: ${(stats.avgEffectiveness * 100).toFixed(1)}%`);
console.log();

console.log('✅ Demo Complete!');
console.log('='.repeat(60));
console.log();
console.log('Next Steps:');
console.log('1. Run `npm start` to start the full system');
console.log('2. Run `cd dashboard && npm run dev` for the dashboard');
console.log('3. Check ARCHITECTURE.md for detailed documentation');
