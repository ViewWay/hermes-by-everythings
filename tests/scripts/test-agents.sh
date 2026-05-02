#!/usr/bin/env bash
#
# HBE Agent Tests
#
# Run agent-specific tests
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Running HBE Agent Tests..."
echo ""

pytest tests/integration/test_agents.py -v "$@"
