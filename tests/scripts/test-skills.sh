#!/usr/bin/env bash
#
# HBE Skill Tests
#
# Run skill-specific tests
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Running HBE Skill Tests..."
echo ""

pytest tests/integration/test_skills.py -v "$@"
