---
name: hbe-build-fix
description: 构建与编译错误修复，最小化变更 / Fix build and compilation errors with minimal changes
allowed_tools: ["Read", "Write", "Edit", "Bash"]
---

# /hbe-build-fix

Fix build errors using minimal change principle.

## Steps
1. Collect all build errors
2. Categorify by type
3. Fix each error incrementally
4. Verify after each fix
5. Don't do architectural refactors
