---
name: hbe-refactor
description: 清理死代码，优化代码结构 / Remove dead code and improve structure
allowed_tools: ["Read", "Write", "Edit", "Bash"]
---

# /hbe-refactor

Clean up dead code and improve code structure.

## Steps
1. Run knip/depcheck/ts-prune to find dead code
2. Confirm no references exist
3. Remove dead code safely
4. Run tests to verify
