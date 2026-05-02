---
name: hbe-refactor
description: 重构清理 - 检测并移除死代码
trigger: /hbe:refactor
keywords:
  - refactor
  - 重构
  - dead code removal
---

# /hbe:refactor — 重构清理

检测并安全移除死代码。

## 执行流程

1. **检测死代码**
   ```bash
   # knip, depcheck, ts-prune
   ```

2. **加载 Refactor Cleaner Agent**
   ```
   读取: skills/agents/refactor-cleaner.md
   ```

3. **安全移除**
   - 确认无引用
   - 移除死代码
   - 运行测试

---
