# Getting Started with Liquid Metal Forge

## Quick Start Guide

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/wildhash/liquidmetal-forge.git
cd liquidmetal-forge

# Install dependencies
npm install

# Build the project
npm run build
```

### 2. Run the Demo

To see the system in action with a simulated healing scenario:

```bash
npm run demo
```

This will demonstrate:
- ✅ Anomaly detection
- ✅ Root cause diagnosis
- ✅ Decision scoring
- ✅ Autonomous healing
- ✅ Learning from results

### 3. Start the Full System

```bash
npm start
```

The system will:
- Monitor configured targets every 10 seconds
- Detect anomalies every 30 seconds
- Automatically diagnose and heal issues
- Learn from each action to improve over time

### 4. Launch the Dashboard

In a separate terminal:

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view:
- 📊 Real-time health metrics
- 🔄 Healing events timeline
- 📈 Performance charts
- ✅ Success rate statistics

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
# Monitoring targets (comma-separated)
MONITORING_TARGETS=http://localhost:3000,http://localhost:8080

# Healing behavior
AUTO_HEALING_ENABLED=true
SAFETY_CHECKS_ENABLED=true
MIN_CONFIDENCE_THRESHOLD=0.5

# Dashboard
DASHBOARD_PORT=3000
```

### Code Configuration

Edit `src/index.ts` to customize system behavior:

```typescript
const config = {
  targets: ['your-service-url'],
  monitoringInterval: 10000,
  autoHealingEnabled: true,
  safetyChecksEnabled: true,
};
```

## Development

### Run Tests

```bash
npm test
```

### Run Linter

```bash
npm run lint
```

### Development Mode

For hot-reloading during development:

```bash
npm run dev
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Liquid Metal Forge                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Monitor    │───▶│   Detect     │───▶│  Diagnose    │  │
│  │              │    │   Anomalies  │    │  Root Cause  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                         │          │
│         │                                         ▼          │
│         │                                  ┌──────────────┐ │
│         │                                  │    Score     │ │
│         │                                  │   Decision   │ │
│         │                                  └──────────────┘ │
│         │                                         │          │
│         │                                         ▼          │
│         │                                  ┌──────────────┐ │
│         │                                  │     Heal     │ │
│         │                                  │ Apply Fixes  │ │
│         │                                  └──────────────┘ │
│         │                                         │          │
│         │                                         ▼          │
│         │                                  ┌──────────────┐ │
│         └─────────────────────────────────▶│    Learn     │ │
│                                            │ From Results │ │
│                                            └──────────────┘ │
│                                                     │        │
│                                                     ▼        │
│                                            ┌──────────────┐ │
│                                            │  Dashboard   │ │
│                                            │ (Real-time)  │ │
│                                            └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components

### Health Monitor
- Tracks response times, error rates, CPU usage
- Detects anomalies using threshold analysis
- Maintains metric history

### Diagnosis Engine
- Analyzes anomaly patterns
- Identifies root causes
- Generates targeted fix suggestions

### Autonomous Healer
- Applies code and configuration fixes
- Creates backups before changes
- Implements rollback on failure
- Integrates with Cline for code editing

### Decision Engine
- Scores potential actions using ML
- Learns from past successes/failures
- Improves over time

### Orchestrator
- Coordinates all components
- Manages healing lifecycle
- Handles errors gracefully

## Integration Points

### Kestra Workflow Orchestration

The system uses Kestra for workflow management. See `kestra-flows/healing-workflow.yml` for the pipeline definition.

### CodeRabbit AI Review

All autonomous changes are reviewed by CodeRabbit. Configuration in `.coderabbit.yaml`.

### Cline Code Editing

The healer integrates with Cline for intelligent code modifications.

### Vercel Dashboard

Deploy the dashboard to Vercel:

```bash
cd dashboard
vercel deploy
```

## Safety Features

The system includes multiple safety mechanisms:

1. **Backup Creation**: Automatic backups before any change
2. **Rollback Capability**: Automatic revert on failure
3. **Safety Checks**: Validates changes before applying
4. **Size Limits**: Prevents massive code changes
5. **Confidence Thresholds**: Only acts with sufficient confidence

## Troubleshooting

### System Not Detecting Anomalies

- Check monitoring targets are accessible
- Verify thresholds in HealthMonitor.ts
- Review anomaly detection logic

### Healing Actions Not Applied

- Check safety checks are not blocking
- Verify confidence threshold (default: 0.5)
- Review decision scores in logs

### Dashboard Not Loading

- Ensure port 3000 is available
- Check Next.js build was successful
- Verify WebSocket connection

## Examples

### Custom Monitoring Target

```typescript
const monitor = new HealthMonitor([
  'http://my-api.com',
  'http://my-service:8080',
]);
```

### Custom Fix Generation

Extend DiagnosisEngine to add custom fix patterns:

```typescript
// In DiagnosisEngine.ts
private async generateFixes(anomaly, rootCause, files) {
  // Add your custom fix logic
}
```

### Learning Memory Persistence

Export and import learning memory:

```typescript
const memory = decisionEngine.exportMemory();
// Save to file/database
// Later...
decisionEngine.importMemory(memory);
```

## Performance

- Memory usage: ~50-100MB
- CPU usage: ~1-5% idle, ~10-20% during healing
- Monitoring overhead: <1ms per check
- Healing latency: ~5-15 seconds

## Security

- All changes go through safety validation
- Backups retained for rollback
- No external code execution without review
- CodeRabbit reviews all modifications

## Support

For issues or questions:
- GitHub Issues: https://github.com/wildhash/liquidmetal-forge/issues
- Documentation: See ARCHITECTURE.md
- Examples: See demo.ts

## License

MIT - See LICENSE file for details
