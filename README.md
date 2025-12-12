# 🦾 Liquid Metal Forge

Self-healing, self-optimizing software systems that autonomously detect failures, rewrite themselves, and redeploy—like Iron Man's liquid metal suit, but for real infrastructure.

## 🌟 Overview

Liquid Metal Forge is an autonomous system that continuously monitors your applications, detects degradation or failures, diagnoses root causes, and dynamically rewrites code or configuration to restore and improve performance—all without human intervention.

## 🏗️ Architecture

The system consists of five core components:

### 1. **Health Monitor** 🔍
- Continuously monitors application health metrics
- Collects response times, error rates, CPU usage, and custom metrics
- Detects anomalies using pattern recognition and threshold analysis

### 2. **Diagnosis Engine** 🔬
- Analyzes detected anomalies to identify root causes
- Maps issues to specific files and code patterns
- Generates targeted fix suggestions with confidence scores

### 3. **Autonomous Healer** 🔧
- Applies code and configuration fixes automatically
- Integrates with Cline for intelligent code editing
- Includes safety checks and automatic rollback capabilities
- Creates backups before applying any changes

### 4. **Decision Engine** 📚
- Uses Oumi-inspired learning to score healing actions
- Maintains memory of past actions and their effectiveness
- Improves decision-making over time through reinforcement learning

### 5. **Orchestrator** 🎯
- Coordinates all components in a continuous healing loop
- Integrates with Kestra for workflow orchestration
- Manages the full lifecycle: Monitor → Detect → Diagnose → Heal → Learn

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/wildhash/liquidmetal-forge.git
cd liquidmetal-forge

# Install dependencies
npm install

# Build the project
npm run build

# Start the system
npm start
```

### Run the Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the real-time dashboard.

## 📊 Dashboard

The Vercel-powered dashboard provides real-time visualization of:

- **System Health Metrics**: Response time, error rates, CPU usage
- **Healing Events Timeline**: Track all autonomous healing actions
- **Success Metrics**: View healing success rate and improvement percentages
- **Live Charts**: Monitor system evolution in real-time

## 🔄 How It Works

### The Self-Healing Loop

```
┌─────────────┐
│   Monitor   │  Continuously collect health metrics
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Detect    │  Identify anomalies and degradation
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Diagnose   │  Determine root cause and generate fixes
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Score     │  Evaluate fix quality using historical data
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Heal     │  Apply fixes with safety checks
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Learn     │  Store results for future improvements
└──────┬──────┘
       │
       └────────► Loop continues
```

### Example Healing Scenario

1. **Detection**: System detects response time spike from 200ms to 3000ms
2. **Diagnosis**: Identifies inefficient database query as root cause
3. **Decision**: Scores the fix at 85% confidence based on similar past fixes
4. **Healing**: Automatically adds database indexing and query optimization
5. **Learning**: Records 45% performance improvement for future reference

## 🛠️ Configuration

### Monitoring Targets

Edit `src/index.ts` to configure monitoring targets:

```typescript
const config = {
  targets: [
    'http://localhost:3000',
    'http://localhost:8080',
    'internal-service-1',
  ],
  monitoringInterval: 10000, // 10 seconds
  autoHealingEnabled: true,
  safetyChecksEnabled: true,
};
```

### Kestra Workflows

The system uses Kestra for orchestration. Configuration is in `kestra-flows/healing-workflow.yml`.

### Safety Configuration

Safety checks are enabled by default. To adjust:

```typescript
autonomousHealer.setSafetyChecks(true); // Enable safety checks
```

Safety features include:
- ✅ Automatic backups before changes
- ✅ File size limits on modifications
- ✅ Rollback on failure
- ✅ Human approval for critical changes (configurable)

## 🧪 Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## 🔌 Integrations

### Cline (Code Editing)
The system integrates with Cline for autonomous code editing. Auto-generated fixes are applied through the healing module.

### Kestra (Orchestration)
Workflow orchestration is handled by Kestra. The healing pipeline is defined in `kestra-flows/healing-workflow.yml`.

### CodeRabbit (AI Code Review)
All autonomous code changes are automatically reviewed by CodeRabbit. Configuration is in `.coderabbit.yaml`.

### Vercel (Dashboard)
The real-time dashboard is built with Next.js and deployable to Vercel with zero configuration.

## 📈 Monitoring & Metrics

The system tracks:

- **Response Time**: Latency of application responses
- **Error Rate**: Percentage of failed requests
- **CPU Usage**: System resource utilization
- **Healing Success Rate**: Percentage of successful autonomous fixes
- **Performance Improvement**: Average improvement after healing actions

## 🔐 Security

- All code changes go through safety validation
- Backups are created before any modifications
- Rollback mechanisms are in place for failed healing actions
- CodeRabbit reviews all autonomous changes
- Sensitive operations require additional safeguards

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 🙏 Acknowledgments

- **Cline**: For autonomous code editing capabilities
- **Kestra**: For workflow orchestration
- **Oumi**: For decision scoring inspiration
- **CodeRabbit**: For AI-powered code review
- **Vercel**: For dashboard hosting

---

Built with ❤️ for autonomous, self-healing infrastructure
