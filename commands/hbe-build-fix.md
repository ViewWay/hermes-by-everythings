---
name: hbe-build-fix
description: 构建错误修复 - 最小改动修复构建失败
trigger: /hbe:build-fix
keywords:
  - build fix
  - 构建修复
  - compilation error
---

# /hbe:build-fix — 构建错误修复

最小改动原则修复构建错误。

## 执行流程

1. **收集错误**
   ```bash
   # 运行构建并捕获错误
   ```

2. **加载 Build Error Resolver Agent**
   ```
   读取: skills/agents/build-error-resolver.md
   ```

3. **分类修复**
   - 类型错误
   - 依赖缺失
   - 语法错误
   - 配置错误

4. **验证修复**
   - 重新构建
   - 确保无回归

---
