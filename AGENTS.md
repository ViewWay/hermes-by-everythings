# Hermes-by-Everything's — Agent Instructions

多平台多语言编码增强套件，提供专业代理、技能、命令和自动化工作流。

**版本:** v3.3.0

## 核心原则

1. **Agent-First（代理优先）** — 将专业任务委派给专门的代理
2. **Test-Driven（测试驱动）** - 先写测试，80%+ 覆盖率
3. **Security-First（安全优先）** — 永不妥协；验证所有输入
4. **Immutability（不可变性）** — 创建新对象，不修改现有对象
5. **Plan Before Execute（先规划后执行）** - 复杂功能先规划

## 可用代理

### 规划与设计

| Agent | 文件 | 用途 | 使用场景 |
|-------|------|------|----------|
| **Planner** | [planner.md](skills/agents/planner.md) | 实现规划 | 复杂功能、重构时 |
| **Architect** | [architect.md](skills/agents/architect.md) | 系统架构设计 | 架构决策 |

### 质量保证

| Agent | 文件 | 用途 | 使用场景 |
|-------|------|------|----------|
| **Code Reviewer** | [code-reviewer.md](skills/agents/code-reviewer.md) | 代码质量和可维护性 | 编写/修改代码后 |
| **Security Reviewer** | [security-reviewer.md](skills/agents/security-reviewer.md) | 漏洞检测 | 提交前、敏感代码 |
| **TDD Guide** | [tdd-guide.md](skills/agents/tdd-guide.md) | 测试驱动开发 | 新功能、Bug修复 |
| **Silent Failure Hunter** | [silent-failure-hunter.md](skills/agents/silent-failure-hunter.md) | 静默失败检测 | 错误处理审查 |
| **Comment Analyzer** | [comment-analyzer.md](skills/agents/comment-analyzer.md) | 注释分析 | 代码注释审查 |

### 测试与构建

| Agent | 文件 | 用途 | 使用场景 |
|-------|------|------|----------|
| **E2E Runner** | [e2e-runner.md](skills/agents/e2e-runner.md) | 端到端 Playwright 测试 | 关键用户流程 |
| **Build Resolver** | [build-error-resolver.md](skills/agents/build-error-resolver.md) | 修复构建/类型错误 | 构建失败时 |
| **Rust Build Resolver** | [rust-build-resolver.md](skills/agents/rust-build-resolver.md) | Rust 构建错误 | Cargo 构建失败 |
| **PyTorch Build Resolver** | [pytorch-build-resolver.md](skills/agents/pytorch-build-resolver.md) | PyTorch/CUDA 错误 | 训练运行时错误 |

### 优化与维护

| Agent | 文件 | 用途 | 使用场景 |
|-------|------|------|----------|
| **Refactor Cleaner** | [refactor-cleaner.md](skills/agents/refactor-cleaner.md) | 死代码清理 | 代码维护 |
| **Doc Updater** | [doc-updater.md](skills/agents/doc-updater.md) | 文档和代码地图 | 更新文档 |
| **Harness Optimizer** | [harness-optimizer.md](skills/agents/harness-optimizer.md) | Harness 配置优化 | 提升代理质量 |
| **Performance Optimizer** | [performance-optimizer.md](skills/agents/performance-optimizer.md) | 性能分析与优化 | 性能调优 |
| **SEO Specialist** | [seo-specialist.md](skills/agents/seo-specialist.md) | SEO 优化 | 搜索引擎优化 |

### 分析与探索

| Agent | 文件 | 用途 | 使用场景 |
|-------|------|------|----------|
| **Code Explorer** | [code-explorer.md](skills/agents/code-explorer.md) | 深度代码分析 | 理解现有功能 |
| **Docs Lookup** | [docs-lookup.md](skills/agents/docs-lookup.md) | 文档查询 | API/库使用问题 |
| **Database Reviewer** | [database-reviewer.md](skills/agents/database-reviewer.md) | PostgreSQL 专审 | 数据库设计优化 |
| **Type Design Analyzer** | [type-design-analyzer.md](skills/agents/type-design-analyzer.md) | 类型设计分析 | 类型系统审查 |

### 执行与编排

| Agent | 文件 | 用途 | 使用场景 |
|-------|------|------|----------|
| **Loop Operator** | [loop-operator.md](skills/agents/loop-operator.md) | 自主循环操作 | Ralph 循环、长时间运行任务 |

### 语言审查

| Agent | 文件 | 用途 | 使用场景 |
|-------|------|------|----------|
| **Python Reviewer** | [python-reviewer.md](skills/agents/python-reviewer.md) | Python 代码审查 | Python 项目 |
| **TypeScript Reviewer** | [typescript-reviewer.md](skills/agents/typescript-reviewer.md) | TypeScript/JavaScript 代码审查 | TS/JS 项目 |
| **Go Reviewer** | [go-reviewer.md](skills/agents/go-reviewer.md) | Go 代码审查 | Go 项目 |
| **Flutter Reviewer** | [flutter-reviewer.md](skills/agents/flutter-reviewer.md) | Flutter/Dart 审查 | Flutter 项目 |
| **Rust Reviewer** | [rust-reviewer.md](skills/agents/rust-reviewer.md) | Rust 代码审查 | Rust 项目 |

### 学习系统

| Agent | 文件 | 用途 | 使用场景 |
|-------|------|------|----------|
| **Continuous Learning** | [continuous-learning.md](skills/agents/continuous-learning.md) | 闭环学习 | 自动模式提取 |

## 代理编排

**主动使用代理**（无需用户提示）:
- 复杂功能需求 → **Planner**
- 刚编写/修改的代码 → **Code Reviewer**
- Bug修复或新功能 → **TDD Guide**
- 架构决策 → **Architect**
- 安全敏感代码 → **Security Reviewer**

**并行执行**独立操作 — 同时启动多个代理。

## 使用方式

### 通过命令使用

```bash
# 使用特定代理
/hbe:review      # 调用 code-reviewer
/hbe:plan        # 调用 planner
/hbe:tdd         # 调用 tdd-guide
/hbe:security    # 调用 security-reviewer
```

### 通过编排使用

```bash
# 多代理工作流
/hbe:orchestrate feature   # planner → tdd → review → security
/hbe:orchestrate bugfix    # build-fix → tdd → review
```

## 安全指南

**任何提交前必须**:
- ✅ 无硬编码密钥（API keys, passwords, tokens）
- ✅ 所有用户输入已验证
- ✅ SQL注入预防（参数化查询）
- ✅ XSS预防（HTML清理）
- ✅ CSRF保护已启用
- ✅ 认证/授权已验证
- ✅ 所有端点有速率限制
- ✅ 错误消息不泄露敏感数据

**密钥管理**: 永不硬编码密钥。使用环境变量或密钥管理器。启动时验证所需密钥。立即轮换任何暴露的密钥。

**发现安全问题**: 停止 → 使用 security-reviewer → 修复CRITICAL问题 → 轮换暴露的密钥 → 审查类似问题

## 编码风格

**不可变性（关键）**: 始终创建新对象，不修改。返回应用了更改的新副本。

**文件组织**: 多个小文件优于少个大文件。典型200-400行，最多800行。按功能/域组织，而非类型。

**错误处理**: 在每个层级处理错误。在UI代码中提供用户友好的消息。在服务器端记录详细上下文。永不静默吞下错误。

**输入验证**: 在系统边界验证所有用户输入。使用基于schema的验证。快速失败并提供清晰消息。永不信任外部数据。

**代码质量清单**:
- 函数小（<50行），文件聚焦（<800行）
- 无深度嵌套（>4层）
- 适当的错误处理，无硬编码值
- 可读、命名良好的标识符

## 测试要求

**最低覆盖率: 80%**

测试类型（全部必需）:
1. **单元测试** — 个别函数、工具、组件
2. **集成测试** — API端点、数据库操作
3. **E2E测试** — 关键用户流程

**TDD工作流（强制）**:
1. 先写测试（RED）— 测试应该失败
2. 写最小实现（GREEN）— 测试应该通过
3. 重构（IMPROVE）— 验证覆盖率80%+

故障排查：检查测试隔离 → 验证mocks → 修复实现

## 开发工作流

1. **规划** — 使用 planner agent，识别依赖和风险，分解为阶段
2. **TDD** — 使用 tdd-guide agent，先写测试，实现，重构
3. **审查** — 立即使用 code-reviewer agent，解决CRITICAL/HIGH问题
4. **捕获知识**
   - 个人调试笔记、偏好和临时上下文 → auto memory
   - 团队/项目知识（架构决策、API更改、运行手册）→ 项目现有文档结构
5. **提交** — Conventional commits格式，全面的PR摘要

## 工作流表面策略

- `skills/` 是主要工作流表面
- 新工作流贡献应首先落在 `skills/`
- `commands/` 是遗留斜杠入口兼容层

## Git工作流

**提交格式**: `<type>: <description>` — 类型: feat, fix, refactor, docs, test, chore, perf, ci

**PR工作流**: 分析完整提交历史 → 起草全面摘要 → 包含测试计划 → 使用 `-u` 推送

## 架构模式

**API响应格式**: 一致的信封，包含成功指示器、数据负载、错误消息和分页元数据

**Repository模式**: 将数据访问封装在标准接口后（findAll, findById, create, update, delete）。业务逻辑依赖于抽象接口，而非存储机制

## 性能

**上下文管理**: 对于大型重构和多文件功能，避免使用最后20%的上下文窗口。低敏感度任务（单次编辑、文档、简单修复）可以容忍更高利用率

**构建故障排查**: 使用 build-error-resolver agent → 分析错误 → 增量修复 → 验证每次修复

## 项目结构

```
skills/
├── agents/          — 专业子代理
├── rules/           — 始终遵循的指南
├── active/          — 已验证的技能
└── templates/       — 输出模板

.claude/
├── commands/        — Claude Code命令
├── config/          — 配置文件
└── rules/           — Claude Code专用规则

scripts/             — 跨平台实用工具
memory/              — 学习记忆
docs/                — 详细文档
```

## 成功指标

- ✅ 所有测试通过，覆盖率80%+
- ✅ 无安全漏洞
- ✅ 代码可读且可维护
- ✅ 性能可接受
- ✅ 满足用户需求

## 与 ECC 的关系

HBE 基于 ECC v2.0 架构，但针对中文用户和特定需求进行了适配：

- ✅ 保留核心架构（agents, skills, commands, hooks）
- ✅ 符合 ECC v2.0 标准
- 🌏 中文本地化
- 🎯 简化的命令集
- 🔄 Ralph 自主循环集成

---

**版本**: v3.3.0  
**架构**: 基于 ECC v2.0  
**兼容**: Claude Code, OpenCode, OpenClaw, Hermes
