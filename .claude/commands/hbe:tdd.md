---
name: hbe-tdd
description: Test-driven development workflow (RED → GREEN → REFACTOR)
allowed_tools: ["Read", "Write", "Edit", "Bash"]
---

# /hbe-tdd

Test-driven development with strict RED-GREEN-REFACTOR cycle.

## Goal
Write tests first, then minimal implementation, then refactor.

## Steps
1. **RED** - Write failing test
2. **GREEN** - Write minimal code to pass
3. **REFACTOR** - Improve while keeping tests green
4. Target 80%+ coverage

## Rules
- Never write production code without test
- Write the simplest code that passes
- Refactor only when all tests pass
