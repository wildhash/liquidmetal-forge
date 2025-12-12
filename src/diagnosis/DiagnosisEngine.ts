import { Anomaly, DiagnosisResult, Fix } from '../types.js';

/**
 * Diagnosis Engine - Analyzes anomalies and determines root causes
 */
export class DiagnosisEngine {
  private diagnosisHistory: Map<string, DiagnosisResult> = new Map();

  /**
   * Diagnose an anomaly and suggest fixes
   */
  async diagnose(anomaly: Anomaly): Promise<DiagnosisResult> {
    console.log(`🔬 Diagnosing anomaly: ${anomaly.id}`);

    const rootCause = await this.identifyRootCause(anomaly);
    const affectedFiles = await this.identifyAffectedFiles(anomaly, rootCause);
    const suggestedFixes = await this.generateFixes(anomaly, rootCause, affectedFiles);
    const confidence = this.calculateConfidence(anomaly, rootCause);

    const result: DiagnosisResult = {
      anomalyId: anomaly.id,
      rootCause,
      affectedFiles,
      suggestedFixes,
      confidence,
      timestamp: Date.now(),
    };

    this.diagnosisHistory.set(anomaly.id, result);
    return result;
  }

  /**
   * Identify root cause based on anomaly patterns
   */
  private async identifyRootCause(anomaly: Anomaly): Promise<string> {
    // Analyze metrics to determine root cause
    if (anomaly.metrics.length === 0) {
      return `Performance degradation detected in ${anomaly.type}`;
    }

    const primaryMetric = anomaly.metrics[0];

    if (primaryMetric.metricName === 'response_time' && primaryMetric.value > 3000) {
      return 'High response time detected - likely caused by inefficient query or missing index';
    } else if (primaryMetric.metricName === 'error_rate' && primaryMetric.value > 0.1) {
      return 'High error rate - likely caused by unhandled exception or invalid configuration';
    } else if (primaryMetric.metricName === 'cpu_usage' && primaryMetric.value > 90) {
      return 'High CPU usage - likely caused by inefficient algorithm or infinite loop';
    } else {
      return `Performance degradation in ${primaryMetric.metricName}`;
    }
  }

  /**
   * Identify files that are likely causing the issue
   */
  private async identifyAffectedFiles(anomaly: Anomaly, rootCause: string): Promise<string[]> {
    // In production, this would analyze stack traces, logs, and code metrics
    const files: string[] = [];

    if (rootCause.includes('response time')) {
      files.push('src/api/handler.ts', 'src/database/queries.ts');
    } else if (rootCause.includes('error rate')) {
      files.push('src/middleware/errorHandler.ts', 'src/config/app.ts');
    } else if (rootCause.includes('CPU usage')) {
      files.push('src/workers/processor.ts', 'src/utils/calculations.ts');
    }

    return files;
  }

  /**
   * Generate suggested fixes based on diagnosis
   */
  private async generateFixes(
    anomaly: Anomaly,
    rootCause: string,
    affectedFiles: string[]
  ): Promise<Fix[]> {
    const fixes: Fix[] = [];

    if (rootCause.includes('response time')) {
      fixes.push({
        type: 'code',
        file: affectedFiles[0] || 'src/api/handler.ts',
        description: 'Add database query optimization and caching',
        changes: [
          '// Before:',
          "const results = await db.query('SELECT * FROM large_table WHERE condition = ?', [value]);",
          '',
          '// After:',
          'const cacheKey = `query:${condition}:${value}`;',
          'let results = await cache.get(cacheKey);',
          'if (!results) {',
          '  results = await db.query(',
          "    'SELECT id, name, status FROM large_table WHERE condition = ? LIMIT 100',",
          '    [value]',
          '  );',
          '  await cache.set(cacheKey, results, 300); // 5 min cache',
          '}'
        ].join('\n'),
        priority: 1,
      });
    }

    if (rootCause.includes('error rate')) {
      fixes.push({
        type: 'code',
        file: affectedFiles[0] || 'src/middleware/errorHandler.ts',
        description: 'Add proper error handling and validation',
        changes: `
// Before:
app.post('/api/data', (req, res) => {
  const data = processData(req.body);
  res.json(data);
});

// After:
app.post('/api/data', async (req, res, next) => {
  try {
    if (!req.body || !req.body.data) {
      return res.status(400).json({ error: 'Invalid request data' });
    }
    const data = await processData(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});
        `.trim(),
        priority: 1,
      });
    }

    if (rootCause.includes('CPU usage')) {
      fixes.push({
        type: 'code',
        file: affectedFiles[0] || 'src/workers/processor.ts',
        description: 'Optimize algorithm to reduce CPU usage',
        changes: `
// Before:
for (let i = 0; i < items.length; i++) {
  for (let j = 0; j < items.length; j++) {
    if (items[i].id === items[j].relatedId) {
      results.push({ item: items[i], related: items[j] });
    }
  }
}

// After:
const itemsMap = new Map(items.map(item => [item.id, item]));
for (const item of items) {
  if (item.relatedId && itemsMap.has(item.relatedId)) {
    results.push({ item, related: itemsMap.get(item.relatedId) });
  }
}
        `.trim(),
        priority: 1,
      });
    }

    return fixes;
  }

  /**
   * Calculate confidence score for diagnosis
   */
  private calculateConfidence(anomaly: Anomaly, rootCause: string): number {
    let confidence = 0.5;

    // Higher confidence for critical anomalies with clear patterns
    if (anomaly.severity === 'critical') {
      confidence += 0.2;
    }

    // Higher confidence if multiple metrics confirm the issue
    if (anomaly.metrics.length > 2) {
      confidence += 0.1;
    }

    // Higher confidence if we've seen similar patterns before
    const similarDiagnoses = Array.from(this.diagnosisHistory.values()).filter(
      d => d.rootCause.includes(rootCause.split('-')[0])
    );
    if (similarDiagnoses.length > 0) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Get diagnosis history
   */
  getHistory(): DiagnosisResult[] {
    return Array.from(this.diagnosisHistory.values());
  }
}
