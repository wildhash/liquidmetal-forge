# Cline Tasks for Liquid Metal Forge

Ready-to-run tasks for autonomous code editing with Cline. Each task is designed to be self-contained and safe to execute.

## Task 1: Implement New Fault Type - Circuit Breaker

**Objective:** Add a new fault injection type to the target service that simulates circuit breaker trips.

**Context:**
- File: `services/nanoforge-target/src/server.ts`
- Add a new fault type: `circuit_breaker`
- When active, service should return 503 for a configurable percentage of requests

**Steps:**
1. Add `circuitBreakerTripped` boolean to `FaultState` interface
2. Add case in `/inject-fault` endpoint to handle `circuit_breaker` type
3. Add circuit breaker check in `/compute` endpoint
4. Return 503 Service Unavailable when circuit breaker is tripped

**Acceptance Criteria:**
- Can inject via `POST /inject-fault` with `{"type": "circuit_breaker"}`
- Affected endpoints return 503 when active
- Can clear with `{"clear": true}`
- No breaking changes to existing fault types

**Safety:**
- No database or configuration changes
- No external dependencies
- Fully reversible

---

## Task 2: Improve Oumi Scoring Algorithm

**Objective:** Enhance the scoring algorithm to consider recency with exponential decay.

**Context:**
- File: `packages/oumi-lite/src/index.ts`
- Current scoring uses simple averaging
- Add time-based decay so recent data weighs more

**Steps:**
1. Add `calculateRecencyWeight(timestamp)` method
2. Apply exponential decay: `weight = exp(-lambda * age_in_days)`
3. Use lambda = 0.1 (10% decay per day)
4. Apply weights when calculating historical scores

**Acceptance Criteria:**
- Recent patches (< 7 days) have 2x weight vs old patches (> 30 days)
- Historical average updates correctly
- Existing tests pass
- No breaking API changes

**Safety:**
- Purely algorithmic change
- No file I/O changes
- Backward compatible

---

## Task 3: Add Dashboard Widget - Fault Injection Controls

**Objective:** Add interactive fault injection controls to the dashboard.

**Context:**
- File: `apps/dashboard/app/page.tsx`
- Add UI controls to inject/clear faults
- Display current fault state

**Steps:**
1. Create `FaultControls` component
2. Add buttons for each fault type
3. Add "Clear All Faults" button  
4. Show active faults status
5. Call target service API on button click

**Acceptance Criteria:**
- Three buttons: Latency Spike, Error Burst, Memory Leak
- Clear All button resets all faults
- Visual indicator shows which faults are active
- Error handling for API failures

**Safety:**
- UI-only changes
- No server-side changes
- No data persistence

---

## Task 4: Tighten Test Coverage - Monitor Service

**Objective:** Add comprehensive tests for the stability score calculation.

**Context:**
- Create new test file: `services/monitor/src/__tests__/stability.test.ts`
- Test `calculateStabilityScore` method thoroughly

**Steps:**
1. Create test file with Jest
2. Test edge cases: zero latency, max latency, zero errors, 100% errors
3. Test scoring formula accuracy
4. Test weighting (40% latency, 40% errors, 20% RPS)
5. Ensure score is always 0-1 range

**Test Cases:**
- Perfect health (100ms latency, 0% errors, 10 RPS) → score ≈ 1.0
- Max degradation (5000ms latency, 100% errors, 0 RPS) → score = 0.0
- Partial degradation scenarios
- Edge cases (negative values, undefined, null)

**Acceptance Criteria:**
- 100% coverage of `calculateStabilityScore`
- All tests pass
- No changes to production code
- Tests are deterministic

**Safety:**
- Test-only changes
- No production code modified

---

## Task 5: Add New Patch Type - Database Connection Pooling

**Objective:** Create a new healing pattern for database connection issues.

**Context:**
- File: `src/diagnosis/DiagnosisEngine.ts`
- Add detection for connection pool exhaustion
- Generate fix suggestion

**Steps:**
1. Add new diagnosis pattern: detect when errors contain "connection pool"
2. Add to `generateFixes()` method
3. Suggest patch: increase pool size or add connection timeout
4. Set confidence based on error message match
5. Add affected file detection

**Pattern to Detect:**
```
Error: Connection pool exhausted
Error: Too many connections
Error: Pool timeout
```

**Suggested Fix:**
```
Increase database connection pool size to 20
Add connection timeout of 5000ms
Implement connection pooling with retry
```

**Acceptance Criteria:**
- Detects connection pool errors
- Generates appropriate fix suggestion
- Confidence score 0.8+ for exact matches
- No false positives on other error types

**Safety:**
- Pure diagnostic logic
- No actual DB changes
- No external calls

---

## General Guidelines for All Tasks

### Before Starting Any Task

1. **Read the current code** - Understand existing patterns
2. **Check for tests** - Ensure you know what tests exist
3. **Create a backup branch** - Always have an escape route
4. **Run existing tests** - Verify baseline

### During Implementation

1. **Make minimal changes** - Only touch what's necessary
2. **Follow existing patterns** - Match the style and structure
3. **Add comments** - Only if changing complex logic
4. **Update types** - Keep TypeScript definitions current

### After Implementation

1. **Run all tests** - `npm test`
2. **Run linter** - `npm run lint`
3. **Test manually** - Verify behavior works as expected
4. **Update docs** - If public API changed

### If Something Goes Wrong

1. **Don't panic** - All changes are reversible
2. **Check test output** - Understand what broke
3. **Rollback if needed** - `git reset --hard`
4. **Ask for help** - Escalate if uncertain

---

## Task Execution Template

When executing a task, follow this format:

```markdown
### Task: [Task Name]

**Status:** In Progress / Complete / Failed

**Changes Made:**
- File 1: [description]
- File 2: [description]

**Tests:**
- [x] Existing tests pass
- [x] New tests added (if applicable)
- [x] Manual testing complete

**Rollback Plan:**
- Git commit: [hash]
- Command: `git reset --hard [hash]`

**Notes:**
[Any observations, issues, or improvements]

**Confidence:** 0.0 - 1.0
```

---

## Priority Order

Execute tasks in this order for maximum value:

1. **Task 4** - Tighten tests (improves safety)
2. **Task 2** - Improve scoring (improves decisions)
3. **Task 1** - New fault type (improves testing)
4. **Task 3** - Dashboard widget (improves UX)
5. **Task 5** - New patch type (improves coverage)

---

## Success Metrics

- All tasks completed without breaking existing functionality
- Test coverage increased
- No security vulnerabilities introduced
- All changes are documented
- System demonstrates improved healing capabilities
