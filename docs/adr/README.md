# 架构决策记录（Architecture Decision Records）

这个目录包含 Hermes-by-Everything 项目的重要架构决策记录。

## 什么是 ADR？

ADR 是记录重要架构决策的文档，描述：
- 决策的背景和上下文
- 决策的内容
- 做出决策的理由
- 决策的后果
- 考虑过的替代方案

## 为什么需要 ADR？

- **知识传承**：新成员快速了解历史决策
- **决策追溯**：理解为什么这样设计
- **避免重复讨论**：防止重新讨论已解决的问题
- **演进记录**：追踪架构的演进历程

## ADR 模板

创建新的 ADR 时，使用模板：[0000-template.md](0000-template.md)

## ADR 状态

- **提议中**（Proposed）：正在讨论
- **已接受**（Accepted）：已采纳
- **已弃用**（Deprecated）：不再推荐但仍在使用
- **已替代**（Superseded）：已被新决策替代

## 现有 ADR

| ADR | 标题 | 状态 | 日期 |
|-----|------|------|------|
| [ADR-0001](0001-skill-organization.md) | 技能组织结构 | 已接受 | 2026-05-02 |
| [ADR-0002](0002-ralph-integration.md) | Ralph 自主循环集成 | 已接受 | 2026-05-02 |
| [ADR-0003](0003-learning-loop.md) | 闭环学习系统 | 已接受 | 2026-05-02 |

## 如何创建新 ADR

1. 复制模板：`cp 0000-template.md 0004-your-decision.md`
2. 填写所有章节
3. 提交 PR 讨论并接受
4. 更新本 README

## 参考资料

- [Michael Nygard's ADR template](https://www.codingarchitect.net/2009/09/14/decision_record_template/)
- [mattpocock/skills ADR](https://github.com/mattpocock/skills/tree/main/docs/adr)
