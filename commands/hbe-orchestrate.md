---
name: hbe-orchestrate
description: 多 Agent 编排 - 全流程自动化开发
trigger: /hbe:orchestrate
keywords:
  - orchestrate
  - 多Agent编排
  - workflow
---

# /hbe:orchestrate — 多 Agent 编排

运行完整的开发流水线。

## 工作流类型

| 工作流 | 流水线 |
|--------|--------|
| feature | planner → tdd → review → security |
| bugfix | build-fix → tdd → review |
| refactor | architect → review → refactor → tdd |
| security | security-reviewer → review → architect |
| full | plan → architect → tdd → review → security → docs |

## 执行流程

1. **加载编排配置**
   ```
   读取: references/orchestration.md
   ```

2. **执行 Agent 链**
   - 每个 Agent 输出 handoff
   - 下一个读取 handoff 继续
   - 最终聚合报告

---
