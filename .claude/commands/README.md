# HBE Commands for Claude Code

完整的 HBE 命令集，涵盖开发全流程。

## 📋 完整命令列表

### 规划与设计

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-plan` | 实现规划 | hbe-plan.md |
| `/hbe-architect` | 架构设计 | hbe-architect.md |
| `/hbe-prd` | PRD 生成 | hbe-prd.md |

### 开发流程

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-tdd` | TDD 开发 | hbe-tdd.md |
| `/hbe-e2e` | E2E 测试 | hbe-e2e.md |
| `/hbe-verify` | 五阶段验证 | hbe-verify.md |

### 代码质量

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-review` | 代码审查 | hbe-review.md |
| `/hbe-security` | 安全审查 | hbe-security.md |
| `/hbe-scan` | 统一安全扫描 | hbe-scan.md |
| `/hbe-refactor` | 重构清理 | hbe-refactor.md |

### 修复与维护

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-build-fix` | 构建修复 | hbe-build-fix.md |
| `/hbe-docs` | 文档更新 | hbe-docs.md |

### 自动化与编排

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-orchestrate` | 多 Agent 编排 | hbe-orchestrate.md |
| `/hbe-ralph` | 自主循环 | hbe-ralph.md |

### 学习与评估

| 命令 | 功能 | 文件 |
|------|------|------|
| `/hbe-checkpoint` | 进度快照 | hbe-checkpoint.md |
| `/hbe-learn` | 模式学习 | hbe-learn.md |
| `/hbe-eval` | 评估驱动 | hbe-eval.md |

## 🚀 使用方式

### 基本使用

```
/hbe-review
```

### 带参数使用

```
/hbe-plan 实现用户认证功能
/hbe-tdd 添加用户注册接口
```

### 工作流组合

```
# 完整功能开发流程
/hbe-orchestrate feature

# Bug 修复流程
/hbe-orchestrate bugfix

# 重构流程
/hbe-orchestrate refactor
```

## 📊 命令统计

- **总命令数**: 18
- **规划类**: 3
- **开发类**: 3
- **质量类**: 3
- **维护类**: 2
- **自动化类**: 2
- **学习类**: 3

## 🏗️ 架构说明

### 目录结构

```
~/.claude/skills/hermes-by-everythings/
├── .claude/
│   └── commands/          ← Claude Code 专用命令
│       ├── hbe-plan.md
│       ├── hbe-review.md
│       └── ...
├── skills/                ← 可复用工作流
│   ├── code-review/
│   ├── tdd-workflow/
│   └── ...
├── agents/                ← 专业代理
│   ├── planner.md
│   ├── code-reviewer.md
│   └── ...
└── SKILL.md               ← 主技能入口
```

### 符合 ECC v2.0 标准

- ✅ 使用 `.claude/commands/` 作为命令目录
- ✅ 命令文件格式：`name`, `description`, `allowed_tools`
- ✅ 使用连字符命名 (\`hbe-review.md\`)
- ✅ `skills/` 作为主要工作流表面
- ✅ `commands/` 标记为遗留兼容层

## 🔗 相关文档

- **HBE 主文档**: `~/github/hermes-by-everythings/README.md`
- **ECC 架构**: `docs/architecture/cross-harness.md`
- **技能索引**: `skills/INDEX.md`
- **Agent 列表**: `skills/INDEX.md`

## ⚡ 快速参考

### 常用命令

```
# 开始新功能
/hbe-plan → /hbe-tdd → /hbe-review

# 修复构建
/hbe-build-fix

# 代码审查
/hbe-review

# 安全检查
# 统一安全扫描
/hbe-scan
/hbe-security

# 完整验证
/hbe-verify
```

### 自动化流程

```
# 自主开发（需要 prd.json）
/hbe-ralph

# 多 Agent 编排
/hbe-orchestrate full

# 保存进度
/hbe-checkpoint
```

---

**维护**: HBE 团队  
\*\*版本\*\*: v3.3.0  
**更新**: 2026-05-02  
**架构**: 基于 ECC v2.0 标准
