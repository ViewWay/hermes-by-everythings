---
name: hbe-verify
description: 五阶段验证循环 (构建→类型检查→Lint→测试→安全) / Five-phase verification loop
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
