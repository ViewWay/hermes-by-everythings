---
name: hbe-verify
description: Five-phase verification loop (Build, TypeCheck, Lint, Test, Security)
allowed_tools: ["Read", "Bash"]
---

# /hbe-verify

Run comprehensive verification of code quality.

## Phases
1. Build - Compile project
2. TypeCheck - Type checking
3. Lint - Code quality linting
4. Test - Run test suite
5. Security - Security scanning

Any phase failure stops the loop. Fix and restart from phase 1.
