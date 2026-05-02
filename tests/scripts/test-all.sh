#!/usr/bin/env bash
#
# HBE Test Runner - Run All Tests
#
# Runs the complete test suite for Hermes-by-Everything's
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "=================================="
echo "HBE v3.3.0 - Test Suite"
echo "=================================="
echo ""

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo -e "${RED}Error: pytest not found${NC}"
    echo "Install pytest: pip install pytest pytest-cov"
    exit 1
fi

# Parse arguments
RUN_FAST=false
RUN_COV=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --fast|-f)
            RUN_FAST=true
            shift
            ;;
        --cov|-c)
            RUN_COV=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--fast] [--cov] [--verbose]"
            exit 1
            ;;
    esac
done

# Build pytest args (using array for proper quoting)
PYTEST_ARGS=(tests/ -v)

if [ "$RUN_FAST" = true ]; then
    PYTEST_ARGS+=(-m "not slow")
    echo -e "${YELLOW}Running fast tests only (skipping slow tests)${NC}"
fi

if [ "$RUN_COV" = true ]; then
    PYTEST_ARGS+=(--cov=skills --cov-report=term-missing)
    echo -e "${YELLOW}Running with coverage${NC}"
fi

if [ "$VERBOSE" = true ]; then
    PYTEST_ARGS+=(-vv)
fi

echo ""
echo "Running: pytest ${PYTEST_ARGS[*]}"
echo ""

# Run tests
if pytest "${PYTEST_ARGS[@]}"; then
    echo ""
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
