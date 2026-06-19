# HBE 命令快速参考

快速查找并使用 HBE 命令。

## 🎯 核心命令速查

### 规划与设计

| 命令 | 用途 | 示例 |
|------|------|------|
| `/hbe-plan` | 实现规划 | `/hbe-plan 实现用户认证` |
| `/hbe-architect` | 架构设计 | `/hbe-architect 微服务架构` |
| `/hbe-prd` | 生成PRD | `/hbe-prd` |

### 开发流程

| 命令 | 用途 | 示例 |
|------|------|------|
| `/hbe-tdd` | TDD开发 | `/hbe-tdd` |
| `/hbe-e2e` | E2E测试 | `/hbe-e2e` |
| `/hbe-verify` | 五阶段验证 | `/hbe-verify` |

### 代码质量

| 命令 | 用途 | 示例 |
|------|------|------|
| `/hbe-review` | 代码审查 | `/hbe-review` |
| `/hbe-security` | 安全审查 | `/hbe-security` |
| `/hbe-refactor` | 重构清理 | `/hbe-refactor` |

### 修复维护

| 命令 | 用途 | 示例 |
|------|------|------|
| `/hbe-build-fix` | 构建修复 | `/hbe-build-fix` |
| `/hbe-docs` | 文档更新 | `/hbe-docs` |

### 自动化

| 命令 | 用途 | 示例 |
|------|------|------|
| `/hbe-orchestrate` | 多Agent编排 | `/hbe-orchestrate feature` |
| `/hbe-ralph` | Ralph自主循环 | `/hbe-ralph` |

### 学习评估

| 命令 | 用途 | 示例 |
|------|------|------|
| `/hbe-checkpoint` | 进度快照 | `/hbe-checkpoint` |
| `/hbe-learn` | 模式学习 | `/hbe-learn` |
| `/hbe-eval` | 评估驱动 | `/hbe-eval` |

## 📋 常见工作流

### 功能开发

```bash
/hbe-plan <需求>      # 1. 规划
/hbe-tdd             # 2. TDD开发
/hbe-review          # 3. 审查
/hbe-security        # 4. 安全检查

# 或一次性完成
/hbe-orchestrate feature
```

### Bug修复

```bash
/hbe-build-fix       # 1. 修复构建
/hbe-tdd             # 2. TDD验证
/hbe-review          # 3. 审查
```

### 自主开发

```bash
/hbe-prd             # 1. 生成PRD
/hbe-ralph           # 2. Ralph循环
```

### 完整验证

```bash
/hbe-verify          # 五阶段验证
```

## 🔄 编排工作流

`/hbe-orchestrate` 支持的工作流类型：

| 类型 | Agent链 | 用途 |
|------|---------|------|
| `feature` | plan → tdd → review → security | 完整功能开发 |
| `bugfix` | build-fix → tdd → review | Bug修复 |
| `refactor` | architect → review → refactor | 重构 |
| `security` | security → review → architect | 安全审查 |
| `full` | plan → architect → tdd → review → security → docs | 全流程 |

## 🎯 按场景查找

### 开始新功能
→ `/hbe-plan`

### 构建失败
→ `/hbe-build-fix`

### 写完代码
→ `/hbe-review`

### 安全敏感代码
→ `/hbe-security`

### 需要测试
→ `/hbe-tdd`

### 清理代码
→ `/hbe-refactor`

### 自动化重复任务
→ `/hbe-ralph`

### 保存进度
→ `/hbe-checkpoint`

### 学习新模式
→ `/hbe-learn`

## 📖 完整文档

- **详细文档**: `.claude/commands/README.md`
- **Agent指南**: `AGENTS.md`
- **架构文档**: `docs/architecture/`

## 💡 提示

- 所有命令都支持 `/hbe-xxx` 格式
- 命令可以带参数：`/hbe-plan 实现用户认证`
- 使用 `/hbe-orchestrate` 自动化多步骤流程
- 使用 `/hbe-ralph` 自主执行大型任务

---

**版本**: v3.3.1  
**更新**: 2026-05-02
