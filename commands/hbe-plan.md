---
name: hbe-plan
description: 功能实现规划 - 分析需求并制定实施计划
trigger: /hbe-plan
keywords:
  - planning
  - 规划
  - implementation plan
argument-hint: "[功能描述]"
skills: hermes-by-everythings
---

# /hbe-plan — 功能实现规划

分析需求并制定详细的实施计划。

## 执行流程

1. **环境感知**
   ```bash
   pwd
   git status --short
   git log --oneline -5
   ```

2. **加载 Planner Agent**
   ```
   读取: skills/agents/planner.md
   ```

3. **分析需求**
   - 理解用户功能描述
   - 审查现有代码库结构
   - 识别依赖关系和风险点

4. **输出计划**
   - 文件路径和变更范围
   - 实施步骤顺序
   - 复杂度评估
   - 潜在风险点

5. **生成 Handoff**
   保存到 `.handoff-plan.md` 供后续开发使用

---
