# Active Skills - 推荐技能

这些是经过实战验证、推荐使用的核心技能。

---

## ⭐ 推荐技能

### 核心开发

- **[planner](../agents/planner.md)** - 实现规划 ⭐ 必备
- **[tdd-guide](../agents/tdd-guide.md)** - TDD 开发工作流
- **[code-review](../agents/code-reviewer.md)** - 代码质量审查

### 语言审查 (新增)

- **[python-reviewer](../agents/python-reviewer.md)** - Python 代码审查 ⭐ Python 项目必备
- **[typescript-reviewer](../agents/typescript-reviewer.md)** - TypeScript/JavaScript 代码审查 ⭐ TS/JS 项目必备
- **[go-reviewer](../agents/go-reviewer.md)** - Go 代码审查
- **[flutter-reviewer](../agents/flutter-reviewer.md)** - Flutter/Dart 代码审查
- **[rust-reviewer](../agents/rust-reviewer.md)** - Rust 代码审查

### 架构与安全

- **[architect](../agents/architect.md)** - 系统架构设计
- **[security-review](../agents/security-reviewer.md)** - 安全漏洞审查

### 性能与优化

- **[performance-optimizer](../agents/performance-optimizer.md)** - 性能分析与优化 ⭐ 性能调优必备
- **[database-reviewer](../agents/database-reviewer.md)** - PostgreSQL 数据库审查 ⭐ 数据库项目必备
- **[refactor-cleaner](../agents/refactor-cleaner.md)** - 死代码清理

### 测试与修复

- **[e2e-runner](../agents/e2e-runner.md)** - E2E 测试执行
- **[build-fix](../agents/build-error-resolver.md)** - 构建错误修复
- **[rust-build-resolver](../agents/rust-build-resolver.md)** - Rust 构建错误修复
- **[pytorch-build-resolver](../agents/pytorch-build-resolver.md)** - PyTorch/CUDA 错误修复

### 自主循环

- **[loop-operator](../agents/loop-operator.md)** - 自主循环操作 ⭐ Ralph 核心组件
- **[harness-optimizer](../agents/harness-optimizer.md)** - Harness 配置优化

### 分析与探索

- **[code-explorer](../agents/code-explorer.md)** - 深度代码分析
- **[docs-lookup](../agents/docs-lookup.md)** - API 文档查询 (Context7)
- **[type-design-analyzer](../agents/type-design-analyzer.md)** - 类型设计分析

### 质量保证

- **[silent-failure-hunter](../agents/silent-failure-hunter.md)** - 静默失败检测
- **[comment-analyzer](../agents/comment-analyzer.md)** - 代码注释分析

### 文档维护

- **[doc-updater](../agents/doc-updater.md)** - 文档更新

---

## 💡 使用建议

**项目必备** (任何项目):
- planner - 实现规划
- tdd-guide - TDD 工作流
- code-review - 代码审查

**语言特定** (根据项目语言选择):
- Python 项目 → python-reviewer
- TypeScript/JavaScript → typescript-reviewer
- Go 项目 → go-reviewer
- Rust 项目 → rust-reviewer + rust-build-resolver
- Flutter 项目 → flutter-reviewer

**性能优化**:
- performance-optimizer - 性能分析与优化
- database-reviewer - 数据库优化

**自主开发** (Ralph 循环):
- loop-operator - 自主循环管理
- harness-optimizer - 配置优化

---
**更新**: 2026-05-02 (v3.3.1)
