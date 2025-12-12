# Safe Editing Policy for Cline in Liquid Metal Forge

## Overview

This document defines the safety boundaries and editing policies for Cline when operating within the Liquid Metal Forge autonomous healing system. These rules ensure that autonomous code changes are safe, reversible, and beneficial.

## Core Safety Principles

### 1. Never Change Secrets
- **NEVER** modify `.env` files
- **NEVER** commit API keys, passwords, or tokens
- **NEVER** change authentication logic without explicit approval
- **NEVER** expose internal secrets in logs or code

### 2. Always Run Tests
- **ALWAYS** run the full test suite after changes
- **ALWAYS** rollback if tests fail
- **ALWAYS** verify the specific issue is fixed
- **ALWAYS** add tests for new behavior

### 3. Always Update Docs
- **ALWAYS** update README if user-facing features change
- **ALWAYS** update inline comments if logic changes significantly
- **ALWAYS** update TypeScript types if interfaces change
- **ALWAYS** document breaking changes in CHANGELOG.md

## File-Level Access Control

### ✅ Safe to Edit (Green List)

These files can be modified autonomously:

**Source Code:**
- `src/**/*.ts` - Application logic
- `services/*/src/**/*.ts` - Service implementations
- `packages/*/src/**/*.ts` - Package code

**Tests:**
- `src/__tests__/**/*.ts` - Test files
- `services/*/__tests__/**/*.ts` - Service tests

**Documentation:**
- `README.md` - If changes are significant
- `ARCHITECTURE.md` - If architecture changes
- Inline code comments

### ⚠️ Modify with Caution (Yellow List)

These files can be modified but require extra validation:

**Configuration:**
- `package.json` - Only for version bumps or non-breaking dep updates
- `tsconfig.json` - Only for non-breaking compiler options
- `.eslintrc.json` - Only to fix linting issues

**Workflows:**
- `orchestration/kestra/flows/*.yml` - Only with thorough testing

**Build:**
- `Dockerfile` - Only for security patches
- `docker-compose.yml` - Only with testing

### 🛑 Never Edit (Red List)

These files must never be modified autonomously:

**Secrets & Credentials:**
- `.env`
- `.env.local`
- `secrets.json`
- Any file containing API keys or passwords

**Infrastructure:**
- `.github/workflows/*` - CI/CD pipelines
- `.git/*` - Version control internals

**Critical Config:**
- `.coderabbit.yaml` - Review rules
- Database migration files (once deployed)

## Change Size Limits

To prevent excessive modifications:

### Per-File Limits
- **Max lines changed:** 100 lines per file
- **Max files changed:** 5 files per healing action
- **Max file size increase:** 50% of original size

### Per-Session Limits
- **Max total changes:** 250 lines across all files
- **Max healing attempts:** 3 per incident
- **Max time per heal:** 5 minutes

If limits are exceeded, **STOP and escalate** to human review.

## Testing Requirements

### Before Committing Any Change

1. **Unit Tests:** All existing unit tests must pass
2. **Lint:** Code must pass linter (`npm run lint`)
3. **Build:** Project must build successfully (`npm run build`)
4. **Type Check:** TypeScript must compile without errors

### Validation Commands

Run these in order:

```bash
# 1. Lint
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Build
npm run build

# 4. Test
npm test

# 5. If all pass, commit is safe
```

### If Any Test Fails

1. **STOP immediately**
2. **Rollback the changes:** `git reset --hard HEAD`
3. **Log the failure** for learning
4. **Do NOT retry** without analyzing the failure
5. **Escalate** if the issue is unclear

## Rollback Procedures

### Automatic Rollback Triggers

Rollback automatically if:
- Any test fails
- Build fails
- Linter errors exceed 5
- Type errors are introduced
- Service becomes unreachable after change

### Rollback Commands

```bash
# Soft rollback (keep changes for inspection)
git reset --soft HEAD~1

# Hard rollback (discard all changes)
git reset --hard HEAD~1

# Rollback specific file
git checkout HEAD -- path/to/file.ts

# Restore from backup
cp backups/file.ts.backup path/to/file.ts
```

### Post-Rollback Actions

1. Log the rollback reason
2. Store failure details for learning
3. Update confidence scores
4. Notify dashboard of rollback
5. Mark incident as "failed healing attempt"

## Backup Requirements

### Before Every Change

Create backups:

```bash
# Git commit as checkpoint
git add -A
git commit -m "Pre-healing checkpoint: [issue-id]"

# OR create file backup
cp src/file.ts backups/file.ts.$(date +%s).backup
```

### Backup Retention

- **Keep for:** 7 days minimum
- **Storage:** `backups/` directory or git history
- **Naming:** Include timestamp and issue ID

## Prohibited Actions

### Absolutely Never

1. ❌ Delete production database tables
2. ❌ Remove error handling or try-catch blocks
3. ❌ Disable authentication or authorization
4. ❌ Expose sensitive data in logs
5. ❌ Make breaking API changes without versioning
6. ❌ Remove security headers or CORS policies
7. ❌ Disable rate limiting or throttling
8. ❌ Add `eval()` or `exec()` calls
9. ❌ Ignore TypeScript errors with `@ts-ignore`
10. ❌ Commit commented-out code

## Escalation Criteria

### When to Stop and Ask for Human Review

Escalate immediately if:

- **Uncertainty:** Confidence in fix is < 0.6
- **Scope:** Changes exceed size limits
- **Breaking:** Changes break public API
- **Security:** Changes affect authentication/authorization
- **Data:** Changes affect data persistence or schemas
- **External:** Changes require external service modifications
- **Tests:** Cannot make tests pass after 2 attempts

## Approval Requirements

### Changes Requiring Human Approval

- Adding new external dependencies
- Changing database schemas
- Modifying authentication logic
- Changing API contracts
- Updating security policies
- Refactoring > 200 lines
- Changes to CI/CD pipelines

### Express Approval (No Human Needed)

- Fixing typos in comments
- Adding missing type annotations
- Fixing linter warnings
- Adding logging statements
- Improving error messages
- Optimizing performance without behavior change

## Logging Requirements

### Log Every Action

```typescript
{
  timestamp: "2024-12-12T10:30:00Z",
  action: "patch_applied",
  files_modified: ["src/api.ts"],
  lines_changed: 15,
  tests_passed: true,
  confidence: 0.85,
  issue_id: "inc-12345"
}
```

### Log Format

- **Timestamp:** ISO 8601
- **Action:** patch_applied, rollback, escalate
- **Files:** Array of modified file paths
- **Metrics:** Lines changed, test results
- **Confidence:** 0.0 - 1.0
- **Issue ID:** Reference to incident

## Monitoring

### Self-Monitoring

Monitor your own actions:

- Success rate of patches
- Average confidence scores
- Rollback frequency
- Test pass rate
- Time to heal

### Alert Thresholds

Alert if:
- Rollback rate > 30%
- Test failure rate > 20%
- Average confidence < 0.65
- Healing time > 10 minutes

## Learning from Mistakes

### When a Patch Fails

1. **Record the failure** in learning memory
2. **Note why it failed** (tests, build, validation)
3. **Identify the root cause** (wrong diagnosis, bad patch)
4. **Update scoring** to avoid similar mistakes
5. **Share insights** with orchestrator

### Continuous Improvement

- Review failed attempts weekly
- Adjust scoring weights based on outcomes
- Update this policy based on learnings
- Share successful patterns

## Version Control

- **Policy Version:** 1.0
- **Last Updated:** 2024-12-12
- **Review Cycle:** Monthly
- **Owner:** Liquid Metal Forge Team

## Summary Checklist

Before any autonomous edit, verify:

- [ ] File is on Green List or Yellow List
- [ ] Change is within size limits
- [ ] Backup created
- [ ] Tests will be run after change
- [ ] Docs will be updated if needed
- [ ] Rollback plan is ready
- [ ] Confidence is ≥ 0.6
- [ ] No secrets will be exposed
- [ ] Change is reversible
- [ ] No prohibited actions

If all boxes are checked, **proceed safely**. If any box is unchecked, **STOP and escalate**.
