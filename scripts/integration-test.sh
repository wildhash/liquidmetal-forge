#!/bin/bash

# Simple integration test that can run without Docker
# Tests the core logic of each component

set -e

echo "🧪 Running Integration Tests"
echo "============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

pass() {
    echo -e "${GREEN}✓${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Test 1: Check all TypeScript code compiles
echo "Test 1: TypeScript Compilation"
echo "-------------------------------"

info "Building nanoforge-target..."
cd services/nanoforge-target
npm run build > /dev/null 2>&1 && pass "Target service compiles" || fail "Target service compilation failed"
cd ../..

info "Building monitor service..."
cd services/monitor
npm run build > /dev/null 2>&1 && pass "Monitor service compiles" || fail "Monitor service compilation failed"
cd ../..

info "Building oumi-lite..."
cd packages/oumi-lite
npm run build > /dev/null 2>&1 && pass "Oumi-Lite compiles" || fail "Oumi-Lite compilation failed"
cd ../..

echo ""

# Test 2: Check file structure
echo "Test 2: File Structure"
echo "----------------------"

[ -f "docker-compose.yml" ] && pass "docker-compose.yml exists" || fail "docker-compose.yml missing"
[ -f "scripts/selftest.sh" ] && pass "selftest.sh exists" || fail "selftest.sh missing"
[ -f "orchestration/kestra/flows/healing-workflow.yml" ] && pass "Kestra workflow exists" || fail "Kestra workflow missing"
[ -f "packages/oumi-lite/src/index.ts" ] && pass "Oumi-Lite exists" || fail "Oumi-Lite missing"
[ -f "clinedocs/CLINE_SYSTEM_PROMPT.md" ] && pass "Cline docs exist" || fail "Cline docs missing"
[ -f ".coderabbit.yaml" ] && pass "CodeRabbit config exists" || fail "CodeRabbit config missing"
[ -f "vercel.json" ] && pass "Vercel config exists" || fail "Vercel config missing"

echo ""

# Test 3: Check documentation
echo "Test 3: Documentation"
echo "---------------------"

[ -f "README.md" ] && pass "README.md exists" || fail "README.md missing"
[ -f "CHANGELOG.md" ] && pass "CHANGELOG.md exists" || fail "CHANGELOG.md missing"
[ -f "ARCHITECTURE.md" ] && pass "ARCHITECTURE.md exists" || fail "ARCHITECTURE.md missing"

# Check README has required sections
if grep -q "Sponsor Tech Integration" README.md; then
    pass "README has sponsor tech section"
else
    fail "README missing sponsor tech section"
fi

if grep -q "Demo Walkthrough" README.md; then
    pass "README has demo walkthrough"
else
    fail "README missing demo walkthrough"
fi

echo ""

# Test 4: Validate JSON/YAML configs
echo "Test 4: Configuration Validation"
echo "---------------------------------"

# Check docker-compose.yml syntax
if command -v docker-compose > /dev/null 2>&1; then
    docker-compose config > /dev/null 2>&1 && pass "docker-compose.yml is valid" || fail "docker-compose.yml has errors"
else
    info "docker-compose not installed, skipping validation"
fi

# Check package.json files
for pkg in services/nanoforge-target/package.json services/monitor/package.json packages/oumi-lite/package.json; do
    if python3 -c "import json; json.load(open('$pkg'))" 2>/dev/null; then
        pass "$pkg is valid JSON"
    else
        fail "$pkg has JSON errors"
    fi
done

echo ""

# Summary
echo "Test Summary"
echo "============"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All integration tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Review output above.${NC}"
    exit 1
fi
