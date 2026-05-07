---
name: hbe-tdd
description: TDD 开发流程 - 红-绿-重构循环
trigger: /hbe-tdd
keywords:
  - tdd
  - test-driven development
  - 测试驱动开发
---

# /hbe-tdd — TDD 开发流程

遵循严格的 TDD 红-绿-重构循环。

## 执行流程

1. **环境感知**
   ```bash
   git status --short
   # 检测项目语言和测试框架
   ```

2. **加载 TDD Guide Agent**
   ```
   读取: skills/agents/tdd-guide.md
   ```

3. **TDD 循环**
   - **RED**: 编写失败的测试
   - **GREEN**: 最小代码使测试通过
   - **REFACTOR**: 优化代码质量

4. **验证覆盖**
   - 测试覆盖率 >= 80%
   - 所有测试通过
   - 代码符合规范

5. **生成 Handoff**
   保存到 `.handoff-tdd.md` 供代码审查使用

---
