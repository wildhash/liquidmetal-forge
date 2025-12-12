# Architecture Documentation

## System Components

### 1. Health Monitor (`src/monitoring/HealthMonitor.ts`)

The Health Monitor continuously tracks application health through:

**Metrics Collected:**
- Response time (latency)
- Error rate
- CPU usage
- Custom application metrics

**Anomaly Detection:**
- Spike detection using statistical analysis
- Threshold-based alerts
- Pattern recognition for degradation

**Features:**
- Configurable check intervals
- Metric retention with automatic cleanup
- Multi-target monitoring support

### 2. Diagnosis Engine (`src/diagnosis/DiagnosisEngine.ts`)

Analyzes anomalies to determine root causes:

**Capabilities:**
- Root cause analysis based on metric patterns
- File identification for affected components
- Confidence scoring for diagnoses
- Historical pattern matching

**Fix Generation:**
- Code optimizations
- Configuration adjustments
- Dependency updates
- Database query improvements

### 3. Autonomous Healer (`src/healing/AutonomousHealer.ts`)

Applies fixes with safety guarantees:

**Safety Features:**
- Automatic backup creation
- File size validation
- Rollback on failure
- Change verification

**Integration:**
- Cline API for code editing
- Git for version control
- System metrics for validation

### 4. Decision Engine (`src/decision/DecisionEngine.ts`)

Learns from past actions to improve decisions:

**Learning Mechanisms:**
- Action effectiveness tracking
- Context similarity matching
- Historical pattern recognition
- Memory management with retention limits

**Scoring Algorithm:**
```
score = base_score 
        + historical_effectiveness_adjustment
        + recency_bonus
        + context_similarity_factor
```

### 5. Orchestrator (`src/orchestration/LiquidMetalOrchestrator.ts`)

Coordinates the entire healing pipeline:

**Workflow:**
1. Monitor health continuously
2. Detect anomalies every 30 seconds
3. Diagnose issues in parallel
4. Score potential healing actions
5. Apply fixes if score > threshold
6. Learn from results
7. Update dashboard

**Error Handling:**
- Graceful degradation
- Automatic rollback
- Error logging and reporting

## Data Flow

```
Health Metrics → Anomaly Detection → Diagnosis → Decision Scoring → Healing → Learning
                                                                          ↓
                                                                    Dashboard Update
```

## Integration Points

### Kestra Orchestration
- Workflow definition: `kestra-flows/healing-workflow.yml`
- Triggers on monitoring intervals
- Handles retries and fallbacks
- Manages state transitions

### CodeRabbit Review
- Configuration: `.coderabbit.yaml`
- Auto-reviews all healing changes
- Path-specific review rules
- Safety-critical code flagging

### Vercel Dashboard
- Real-time WebSocket updates
- React components with Recharts
- TailwindCSS styling
- Next.js 14 App Router

## Deployment

### Local Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Dashboard Deployment
```bash
cd dashboard
vercel deploy
```

## Monitoring & Observability

The system monitors itself and provides:
- Healing cycle statistics
- Success/failure rates
- Performance improvements
- Learning memory utilization

All metrics are available through the dashboard and via API endpoints.
