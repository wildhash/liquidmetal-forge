/**
 * Types for the Liquid Metal monitoring and self-healing system
 */

export interface HealthMetric {
  timestamp: number;
  metricName: string;
  value: number;
  threshold?: number;
  status: 'healthy' | 'degraded' | 'critical';
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'failed';
  timestamp: number;
  metrics: HealthMetric[];
  message?: string;
}

export interface Anomaly {
  id: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  affectedComponents: string[];
  metrics: HealthMetric[];
}

export interface DiagnosisResult {
  anomalyId: string;
  rootCause: string;
  affectedFiles: string[];
  suggestedFixes: Fix[];
  confidence: number;
  timestamp: number;
}

export interface Fix {
  type: 'code' | 'config' | 'dependency';
  file: string;
  description: string;
  changes: string;
  priority: number;
}

export interface HealingAction {
  id: string;
  timestamp: number;
  diagnosisId: string;
  fixes: Fix[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: HealingResult;
}

export interface HealingResult {
  success: boolean;
  appliedFixes: Fix[];
  beforeMetrics: HealthMetric[];
  afterMetrics: HealthMetric[];
  improvement: number;
  timestamp: number;
}

export interface LearningMemory {
  id: string;
  timestamp: number;
  anomalyPattern: string;
  healingAction: string;
  effectiveness: number;
  context: Record<string, any>;
}

export interface DecisionScore {
  action: string;
  score: number;
  reasoning: string;
  historicalData: LearningMemory[];
}
