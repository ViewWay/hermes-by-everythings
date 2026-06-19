# Agent 使用教程索引

> **Hermes-by-Everything (HBE)** - 核心 Agent 完整教程（共 37 个 Agent，以下为有教程的核心 Agent）

---

## 📋 Agent列表

| # | Agent | 命令 | 类型 | 教程 |
|---|-------|------|------|------|
| 1 | **Orchestrator** | `/hbe-orchestrate` | 主智能体 | [教程](ORCHESTRATOR.md) |
| 2 | **Planner** | `/hbe-plan` | 规划代理 | [教程](PLANNER.md) |
| 3 | **Architect** | `/hbe-architect` | 实现代理 | [教程](ARCHITECT.md) |
| 4 | **Code-Reviewer** | `/hbe-review` | 代码审查 | [教程](CODE-REVIEWER.md) |
| 5 | **Security-Reviewer** | `/hbe-security` | 安全审查 | [教程](SECURITY-REVIEWER.md) |
| 6 | **TDD-Guide** | `/hbe-tdd` | TDD指导 | [教程](TDD-GUIDE.md) |
| 7 | **Build-Error-Resolver** | `/hbe-build-fix` | 构建修复 | [教程](BUILD-ERROR-RESOLVER.md) |
| 8 | **E2E-Runner** | `/hbe-e2e` | E2E测试 | [教程](E2E-RUNNER.md) |
| 9 | **Refactor-Cleaner** | `/hbe-refactor` | 重构清理 | [教程](REFACTOR-CLEANER.md) |
| 10 | **Doc-Updater** | `/hbe-docs` | 文档更新 | [教程](DOC-UPDATER.md) |

---

## 🚀 快速导航

### 按工作流分类

#### 开发流程

1. **[Planner](PLANNER.md)** - 制定开发计划
2. **[Architect](ARCHITECT.md)** - 实现代码
3. **[Code-Reviewer](CODE-REVIEWER.md)** - 审查代码质量
4. **[TDD-Guide](TDD-GUIDE.md)** - 测试驱动开发

#### 质量保证

5. **[Security-Reviewer](SECURITY-REVIEWER.md)** - 安全审查
6. **[Build-Error-Resolver](BUILD-ERROR-RESOLVER.md)** - 构建修复
7. **[E2E-Runner](E2E-RUNNER.md)** - 端到端测试

#### 维护优化

8. **[Refactor-Cleaner](REFACTOR-CLEANER.md)** - 重构清理
9. **[Doc-Updater](DOC-UPDATER.md)** - 文档更新

#### 高级编排

10. **[Orchestrator](ORCHESTRATOR.md)** - 多Agent编排

---

## 📖 推荐阅读顺序

### 新手路径

1. [Planner](PLANNER.md) - 学习如何规划
2. [Architect](ARCHITECT.md) - 学习如何实现
3. [Code-Reviewer](CODE-REVIEWER.md) - 学习代码审查
4. [TDD-Guide](TDD-GUIDE.md) - 学习TDD工作流

### 进阶路径

5. [Security-Reviewer](SECURITY-REVIEWER.md) - 安全审查
6. [E2E-Runner](E2E-RUNNER.md) - E2E测试
7. [Build-Error-Resolver](BUILD-ERROR-RESOLVER.md) - 构建调试

### 专家路径

8. [Refactor-Cleaner](REFACTOR-CLEANER.md) - 重构
9. [Orchestrator](ORCHESTRATOR.md) - 自动化编排
10. [Ralf循环](../../ORCHESTRATOR-TUTORIAL.md) - 自主执行

---

## 🎯 常见使用场景

### 场景 1: 新功能开发

```
1. /hbe-plan "实现用户认证"
2. /hbe-architect "实现 dev-plan.md"
3. /hbe-review
4. /hbe-security
5. /hbe-tdd --verify
```

### 场景 2: Bug修复

```
1. /hbe-build-fix
2. /hbe-review
3. /hbe-tdd "添加回归测试"
```

### 场景 3: 代码重构

```
1. /hbe-refactor
2. /hbe-review
3. /hbe-tdd --verify
4. /hbe-docs
```

### 场景 4: 全流程自动化

```
/hbe-orchestrate "根据 prd.json 开发"
```

---

## 📚 相关资源

- **完整文档索引**: `../../INDEX.md`
- **快速开始**: `../../quick-start.md`
- **Orchestrator教程**: `../ORCHESTRATOR-TUTORIAL.md`
- **Agent定义**: `../../../skills/agents/`

---

## 💡 提示

- 所有Agent都支持 **中英文输入**
- Agent会自动检测 **编程语言和框架**
- 可以 **组合使用多个Agent**
- 通过 **Orchestrator** 实现全自动化

---

**Agent教程索引版本**: 3.3.0  
**最后更新**: 2026-05-02
