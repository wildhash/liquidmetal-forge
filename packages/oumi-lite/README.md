# Oumi Lite - Learning & Scoring Module

Oumi-compatible scoring and learning module for Liquid Metal Forge.

## Overview

Oumi Lite provides intelligent scoring of patch candidates using a combination of:
- Static analysis (complexity, risk, expected recovery)
- Historical learning (bandit-style reinforcement)
- Adaptive weighting based on outcomes

## Features

- **Multi-factor Scoring**: Considers complexity, risk, expected recovery, and historical success
- **Bandit-style Learning**: Adapts weights based on actual outcomes
- **Persistence**: Stores learning records in JSONL format
- **Confidence Scoring**: Provides confidence levels based on historical data
- **Easy Integration**: Simple API for scoring and learning

## Usage

```typescript
import { OumiLiteScorer, PatchCandidate, ScoringContext } from '@liquidmetal/oumi-lite';

// Initialize scorer
const scorer = new OumiLiteScorer('./data/learning.jsonl');

// Define patch candidates
const candidates: PatchCandidate[] = [
  {
    id: 'patch-1',
    description: 'Add caching to database queries',
    targetFile: 'src/database.ts',
    patchContent: '...',
    estimatedComplexity: 0.3,
    estimatedRisk: 0.2,
    expectedRecovery: 0.8
  }
];

// Score patches
const context: ScoringContext = {
  anomalyType: 'high_latency',
  severity: 0.8,
  affectedFiles: ['src/database.ts']
};

const results = scorer.scorePatches(candidates, context);

// Best patch
const bestPatch = results[0];
console.log(`Best patch: ${bestPatch.patchId} (score: ${bestPatch.score})`);

// Record outcome after applying patch
scorer.recordOutcome({
  patchId: 'patch-1',
  anomalyType: 'high_latency',
  appliedAt: new Date().toISOString(),
  effectivenessScore: 0.85,
  complexity: 0.3,
  risk: 0.2,
  expectedRecovery: 0.8,
  actualRecovery: 0.85
});
```

## Scoring Algorithm

The scoring algorithm uses weighted factors:

```
score = base_score (0.5)
        + (1 - complexity) * -0.3
        + (1 - risk) * -0.4
        + expectedRecovery * 0.5
        + historicalSuccess * 0.6
```

### Factors

1. **Complexity** (-0.3 weight): Simpler patches score higher
2. **Risk** (-0.4 weight): Lower risk patches score higher
3. **Expected Recovery** (0.5 weight): Higher expected improvement scores higher
4. **Historical Success** (0.6 weight): Past effectiveness of similar patches

### Learning

The system improves over time by:
- Recording actual outcomes vs. expected outcomes
- Adjusting weights based on successful patches
- Applying recency bias (recent data weighted more heavily)
- Building confidence with more data

## API Reference

### OumiLiteScorer

#### Constructor
```typescript
new OumiLiteScorer(learningPath?: string)
```

#### Methods

**scorePatches(candidates, context): ScoringResult[]**
- Scores multiple patch candidates
- Returns sorted results (best first)

**recordOutcome(record: LearningRecord): void**
- Records the outcome of an applied patch
- Updates learning memory and weights

**exportMemory(): LearningRecord[]**
- Exports all learning records

**getStatistics(): Statistics**
- Returns learning statistics

## Data Format

Learning records are stored in JSONL format:

```json
{"patchId":"patch-1","anomalyType":"high_latency","appliedAt":"2024-01-01T00:00:00Z","effectivenessScore":0.85,"complexity":0.3,"risk":0.2,"expectedRecovery":0.8,"actualRecovery":0.85}
```

## Integration with Full Oumi

This is a lightweight, Oumi-compatible implementation. To integrate with the full Oumi framework:

1. Replace `OumiLiteScorer` with Oumi's evaluation module
2. Use Oumi's more sophisticated learning algorithms
3. Connect to Oumi's distributed learning infrastructure
4. Leverage Oumi's advanced model training capabilities

The interface is designed to be compatible, so migration is straightforward:

```typescript
// Replace this:
import { OumiLiteScorer } from '@liquidmetal/oumi-lite';

// With this:
import { OumiScorer } from '@oumi/evaluation';

// API remains the same
const scorer = new OumiScorer();
```

## License

MIT
