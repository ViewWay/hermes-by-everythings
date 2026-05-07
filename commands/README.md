# HBE Commands

此目录包含 Hermes-by-Everything 的所有命令文件。

## 命令列表

### 开发流程

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-plan` | 功能实现规划 | `hbe-plan.md` |
| `/hbe-architect` | 系统架构设计 | `hbe-architect.md` |
| `/hbe-tdd` | TDD 开发流程 | `hbe-tdd.md` |
| `/hbe-orchestrate` | 多 Agent 编排 | `hbe-orchestrate.md` |

### 代码质量

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-review` | 代码质量审查 | `hbe-review.md` |
| `/hbe-security` | 安全审查 | `hbe-security.md` |
| `/hbe-refactor` | 重构清理 | `hbe-refactor.md` |
| `/hbe-verify` | 五阶段验证循环 | `hbe-verify.md` |

### 修复和维护

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-build-fix` | 构建错误修复 | `hbe-build-fix.md` |
| `/hbe-docs` | 文档更新 | `hbe-docs.md` |

### 自主开发

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-prd` | PRD 生成 | `hbe-prd.md` |
| `/hbe-ralph` | Ralph 自主循环 | `hbe-ralph.md` |

## 命令文件格式

每个命令文件遵循以下结构：

```markdown
---
name: hbe-command-name
description: 简短描述
trigger: /hbe-command-name
keywords:
  - keyword1
  - keyword2
---

# /hbe-command-name — 命令标题

命令描述和使用说明...

## 执行流程

1. 步骤 1
2. 步骤 2
3. ...
```

## 添加新命令

1. 在此目录创建新的 `.md` 文件
2. 使用 `hbe-` 前缀命名
3. 包含 YAML frontmatter
4. 更新本 README.md 的命令列表
5. 在 `.claude-plugin/marketplace.json` 中注册命令
