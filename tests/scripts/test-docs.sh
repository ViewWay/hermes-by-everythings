#!/usr/bin/env bash
#
# HBE Documentation Tests
#
# Run documentation tests
#

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "Running HBE Documentation Tests..."
echo ""

pytest tests/integration/test_documentation.py -v "$@"
