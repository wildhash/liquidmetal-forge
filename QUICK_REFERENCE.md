# Quick Reference - Liquid Metal Forge

## 🚀 Quick Start Commands

### Option 1: Docker (Recommended)
```bash
# Start everything
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

### Option 2: Run Self-Test
```bash
# Verify the healing loop
./scripts/selftest.sh
```

### Option 3: Local Development
```bash
# Terminal 1: Redis
docker run -p 6379:6379 redis:7-alpine

# Terminal 2: Target Service
cd services/nanoforge-target && npm install && npm run dev

# Terminal 3: Monitor
cd services/monitor && npm install && npm run dev

# Terminal 4: Dashboard
cd apps/dashboard && npm install && npm run dev
```

## 📍 Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Target API** | http://localhost:3001 | Fault-injectable service |
| **Dashboard** | http://localhost:3000 | Real-time visualization |
| **Kestra UI** | http://localhost:8080 | Workflow orchestration |
| **Redis** | localhost:6379 | Event bus |

## 🎯 API Endpoints

### Target Service (Port 3001)

**Health Check**
```bash
curl http://localhost:3001/health
```

**Get Metrics**
```bash
curl http://localhost:3001/metrics
```

**Normal Computation**
```bash
curl http://localhost:3001/compute
```

**Inject Fault - Latency Spike**
```bash
curl -X POST http://localhost:3001/inject-fault \
  -H "Content-Type: application/json" \
  -d '{"type": "latency_spike"}'
```

**Inject Fault - Error Burst**
```bash
curl -X POST http://localhost:3001/inject-fault \
  -H "Content-Type: application/json" \
  -d '{"type": "error_burst"}'
```

**Inject Fault - Memory Leak**
```bash
curl -X POST http://localhost:3001/inject-fault \
  -H "Content-Type: application/json" \
  -d '{"type": "memory_leak_sim"}'
```

**Clear All Faults**
```bash
curl -X POST http://localhost:3001/inject-fault \
  -H "Content-Type: application/json" \
  -d '{"clear": true}'
```

## 🧪 Testing Commands

```bash
# Run all integration tests
./scripts/integration-test.sh

# Run self-test (requires Docker)
./scripts/selftest.sh

# Build all services
npm run build

# Lint code
npm run lint

# Run unit tests
npm test
```

## 📦 Repository Structure

```
liquidmetal-forge/
├── apps/
│   └── dashboard/          # Next.js dashboard (Vercel)
├── services/
│   ├── nanoforge-target/   # Fault-injectable target
│   └── monitor/            # Stability monitor
├── orchestration/
│   └── kestra/flows/       # Kestra workflows
├── packages/
│   ├── oumi-lite/          # Scoring & learning
│   └── shared/             # Shared types
├── scripts/
│   ├── selftest.sh         # E2E verification
│   └── integration-test.sh # Integration tests
├── clinedocs/              # Cline integration
│   ├── CLINE_SYSTEM_PROMPT.md
│   ├── CLINE_TASKS.md
│   └── SAFE_EDITING_POLICY.md
├── data/                   # Runtime data
│   ├── audit.db           # Event audit log
│   └── learning.jsonl     # Learning memory
└── docker-compose.yml      # Full stack
```

## 🔧 Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
# Key variables
TARGET_URL=http://localhost:3001
REDIS_URL=redis://localhost:6379
POLL_INTERVAL=5000
STABILITY_THRESHOLD=0.7
OUMI_LEARNING_PATH=./data/learning.jsonl
```

## 🎬 Demo Script (60 seconds)

```bash
# 1. Start services (if not running)
docker compose up -d
sleep 30

# 2. Check baseline
curl http://localhost:3001/metrics

# 3. Inject fault
curl -X POST http://localhost:3001/inject-fault \
  -d '{"type":"error_burst"}' -H "Content-Type: application/json"

# 4. Watch detection (check monitor logs)
docker compose logs monitor | tail -20

# 5. Clear fault (simulating healing)
curl -X POST http://localhost:3001/inject-fault \
  -d '{"clear":true}' -H "Content-Type: application/json"

# 6. Verify recovery
curl http://localhost:3001/metrics

# 7. View learning
cat data/learning.jsonl
```

## 🐞 Troubleshooting

### Services won't start
```bash
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Port conflicts
```bash
# Check what's using ports
lsof -i :3000
lsof -i :3001
lsof -i :6379
lsof -i :8080
```

### Reset data
```bash
rm -f data/audit.db data/learning.jsonl
docker compose restart monitor
```

### View all logs
```bash
docker compose logs -f
```

## 🎯 Success Criteria Met

- ✅ `docker compose up` launches everything
- ✅ Full loop: inject → detect → diagnose → score → heal → recover
- ✅ Self-test script passes
- ✅ All sponsor tech integrated (Cline, Vercel, Kestra, Oumi, CodeRabbit)
- ✅ Required repo structure
- ✅ Cline integration docs
- ✅ Oumi-lite package
- ✅ CHANGELOG.md
- ✅ Comprehensive README
- ✅ Architecture diagram
- ✅ Demo walkthrough
- ✅ Troubleshooting guide

## 📚 Documentation Index

- **README.md** - Main overview and quick start
- **ARCHITECTURE.md** - Technical deep dive
- **GETTING_STARTED.md** - Detailed setup
- **CHANGELOG.md** - Version history
- **QUICK_REFERENCE.md** - This file
- **packages/oumi-lite/README.md** - Oumi-Lite usage
- **clinedocs/** - Cline integration

## 🎓 Learning More

1. Read the demo in **README.md** (60-90 second walkthrough)
2. Review **ARCHITECTURE.md** for system design
3. Check **clinedocs/CLINE_TASKS.md** for ready-to-run tasks
4. Explore **orchestration/kestra/flows/** for workflow logic
5. Study **packages/oumi-lite/** for scoring algorithm

## 🚢 Deployment

**Dashboard to Vercel:**
```bash
cd apps/dashboard
vercel deploy --prod
```

**Full Stack:**
```bash
docker compose -f docker-compose.yml up -d
```

## 🏆 Sponsor Tech Usage

- **Cline**: System prompt + 5 tasks in `clinedocs/`
- **Vercel**: Dashboard deployment via `vercel.json`
- **Kestra**: 8-step workflow in `orchestration/kestra/flows/`
- **Oumi**: Compatible scorer in `packages/oumi-lite/`
- **CodeRabbit**: PR review config in `.coderabbit.yaml`

## 🎉 Next Steps

1. Run `docker compose up -d`
2. Run `./scripts/selftest.sh`
3. Open http://localhost:3000
4. Inject a fault and watch it heal
5. Read the code and customize!

---

**Built with ❤️ for hackathon 2024**
