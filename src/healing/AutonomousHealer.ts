import { DiagnosisResult, HealingAction, Fix, HealthMetric } from '../types.js';
import { promises as fs } from 'fs';

/**
 * Autonomous Healer - Applies fixes to restore system health
 * Integrates with Cline for code editing
 */
export class AutonomousHealer {
  private healingHistory: Map<string, HealingAction> = new Map();
  private safetyChecksEnabled = true;

  /**
   * Apply healing actions based on diagnosis
   */
  async heal(diagnosis: DiagnosisResult): Promise<HealingAction> {
    const actionId = `healing-${Date.now()}-${Math.random()}`;
    
    const action: HealingAction = {
      id: actionId,
      timestamp: Date.now(),
      diagnosisId: diagnosis.anomalyId,
      fixes: diagnosis.suggestedFixes,
      status: 'pending',
    };

    this.healingHistory.set(actionId, action);

    try {
      console.log(`🔧 Starting healing action: ${actionId}`);
      action.status = 'in_progress';

      // Collect before metrics
      const beforeMetrics = await this.collectCurrentMetrics();

      // Apply fixes with safety checks
      const appliedFixes: Fix[] = [];
      for (const fix of diagnosis.suggestedFixes) {
        if (await this.canApplyFix(fix)) {
          const success = await this.applyFix(fix);
          if (success) {
            appliedFixes.push(fix);
            console.log(`✅ Applied fix: ${fix.description}`);
          } else {
            console.log(`❌ Failed to apply fix: ${fix.description}`);
          }
        } else {
          console.log(`⚠️ Safety check failed for fix: ${fix.description}`);
        }
      }

      // Collect after metrics
      await this.waitForStabilization();
      const afterMetrics = await this.collectCurrentMetrics();

      // Calculate improvement
      const improvement = this.calculateImprovement(beforeMetrics, afterMetrics);

      action.result = {
        success: appliedFixes.length > 0,
        appliedFixes,
        beforeMetrics,
        afterMetrics,
        improvement,
        timestamp: Date.now(),
      };

      action.status = appliedFixes.length > 0 ? 'completed' : 'failed';
      console.log(`🎯 Healing action completed with ${improvement}% improvement`);

    } catch (error) {
      console.error(`💥 Healing action failed:`, error);
      action.status = 'failed';
    }

    return action;
  }

  /**
   * Check if a fix can be safely applied
   */
  private async canApplyFix(fix: Fix): Promise<boolean> {
    if (!this.safetyChecksEnabled) {
      return true;
    }

    // Check if file exists
    try {
      await fs.access(fix.file);
    } catch {
      console.log(`File does not exist: ${fix.file}, creating it would be safe`);
      return true;
    }

    // Check if changes are reasonable
    const changeLines = fix.changes.split('\n').length;
    if (changeLines > 100) {
      console.log(`Fix too large (${changeLines} lines), requires manual review`);
      return false;
    }

    // Check if we have a backup
    const hasBackup = await this.ensureBackup(fix.file);
    if (!hasBackup) {
      console.log(`Cannot create backup for ${fix.file}`);
      return false;
    }

    return true;
  }

  /**
   * Apply a fix to the codebase
   */
  private async applyFix(fix: Fix): Promise<boolean> {
    try {
      if (fix.type === 'code') {
        // In production, this would integrate with Cline API
        // For now, we simulate the fix application
        console.log(`Simulating code fix for ${fix.file}`);
        console.log(`Changes:\n${fix.changes}`);
        
        // Create the file with a comment indicating it's been auto-fixed
        const content = `// AUTO-FIXED by Liquid Metal System at ${new Date().toISOString()}\n// ${fix.description}\n\n${fix.changes}\n`;
        
        try {
          await fs.mkdir(fix.file.substring(0, fix.file.lastIndexOf('/')), { recursive: true });
        } catch {
          // Directory might already exist
        }
        
        await fs.writeFile(fix.file, content);
        return true;
      } else if (fix.type === 'config') {
        console.log(`Simulating config fix for ${fix.file}`);
        return true;
      } else if (fix.type === 'dependency') {
        console.log(`Simulating dependency fix: ${fix.description}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error applying fix to ${fix.file}:`, error);
      return false;
    }
  }

  /**
   * Ensure backup exists for a file
   */
  private async ensureBackup(filePath: string): Promise<boolean> {
    try {
      const backupPath = `${filePath}.backup-${Date.now()}`;
      await fs.copyFile(filePath, backupPath);
      console.log(`Created backup: ${backupPath}`);
      return true;
    } catch (error) {
      console.error(`Failed to create backup for ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Wait for system to stabilize after applying fixes
   */
  private async waitForStabilization(): Promise<void> {
    console.log('⏳ Waiting for system stabilization...');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  /**
   * Collect current system metrics
   */
  private async collectCurrentMetrics(): Promise<HealthMetric[]> {
    // In production, this would collect real metrics
    return [
      {
        timestamp: Date.now(),
        metricName: 'response_time',
        value: Math.random() * 1000,
        status: 'healthy',
      },
      {
        timestamp: Date.now(),
        metricName: 'error_rate',
        value: Math.random() * 0.05,
        status: 'healthy',
      },
    ];
  }

  /**
   * Calculate improvement percentage
   */
  private calculateImprovement(before: HealthMetric[], after: HealthMetric[]): number {
    if (before.length === 0 || after.length === 0) {
      return 0;
    }

    let totalImprovement = 0;
    let count = 0;

    for (const beforeMetric of before) {
      const afterMetric = after.find(m => m.metricName === beforeMetric.metricName);
      if (afterMetric) {
        const improvement = ((beforeMetric.value - afterMetric.value) / beforeMetric.value) * 100;
        totalImprovement += improvement;
        count++;
      }
    }

    return count > 0 ? totalImprovement / count : 0;
  }

  /**
   * Get healing history
   */
  getHistory(): HealingAction[] {
    return Array.from(this.healingHistory.values());
  }

  /**
   * Enable or disable safety checks
   */
  setSafetyChecks(enabled: boolean): void {
    this.safetyChecksEnabled = enabled;
    console.log(`Safety checks ${enabled ? 'enabled' : 'disabled'}`);
  }
}
