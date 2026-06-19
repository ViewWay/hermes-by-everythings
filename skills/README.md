# Skills Directory

Hermes-by-Everything 的技能和规则目录。

## 📁 目录结构

```
skills/
├── agents/              # 专业代理 (36个)
├── active/              # 推荐技能 (从实战验证)
├── rules/               # 规则文件 (77+个)
├── patterns/            # 设计模式
├── [language]-patterns/ # 语言特定模式
└── INDEX.md             # 完整索引
```

## 🤖 Agents (37个)

专业代理按功能分类：

### 核心代理
- **planner** - 实现规划
- **architect** - 系统架构设计
- **orchestrator** - 多代理编排

### 质量保证
- **code-reviewer** - 代码审查
- **security-reviewer** - 安全审查
- **tdd-guide** - TDD 指导

### 语言审查
- **python-reviewer** - Python 审查
- **typescript-reviewer** - TypeScript/JS 审查
- **go-reviewer** - Go 审查
- **rust-reviewer** - Rust 审查
- **flutter-reviewer** - Flutter/Dart 审查
- **csharp-reviewer**, **java-reviewer**, **kotlin-reviewer**, **php-reviewer**, **perl-reviewer**, **swift-reviewer**

### 测试与构建
- **e2e-runner** - E2E 测试
- **build-error-resolver** - 构建错误修复
- **rust-build-resolver**, **pytorch-build-resolver**, **dart-build-resolver**, **java-build-resolver**, **kotlin-build-resolver**, **php-build-resolver**, **cpp-build-resolver**, **csharp-build-resolver**

### 性能与优化
- **performance-optimizer** - 性能优化
- **database-reviewer** - 数据库审查
- **refactor-cleaner** - 重构清理
- **harness-optimizer** - Harness 优化

### 分析与探索
- **code-explorer** - 代码探索
- **docs-lookup** - 文档查询
- **type-design-analyzer** - 类型设计分析

### 执行与编排
- **loop-operator** - 自主循环操作

### 质量保证 (增强)
- **silent-failure-hunter** - 静默失败检测
- **comment-analyzer** - 注释分析
- **seo-specialist** - SEO 优化

### 文档与学习
- **doc-updater** - 文档更新
- **continuous-learning** - 闭环学习

## 📜 Rules (77+个)

规则文件涵盖：

### 编码规范
- 各语言编码风格规范
- 代码组织原则
- 最佳实践指南

### 工作流
- Git 工作流规范
- Hooks 配置
- Agent 编排规则

### 质量与性能
- 安全检查规则
- 性能优化规则
- 设计模式

## 🎯 如何使用

### 推荐技能 (active/)

查看 [active/README.md](active/README.md) 获取推荐技能列表。

### 完整索引

查看 [INDEX.md](INDEX.md) 获取完整技能索引。

### 按语言查找

- **Python**: python-patterns/
- **TypeScript/JavaScript**: typescript-patterns/
- **Go**: golang-patterns/
- **Rust**: rust-patterns/
- **Flutter**: flutter-patterns/
- **C++**: cpp-patterns/
- **Java**: java-patterns/
- **Kotlin**: kotlin-patterns/
- **PHP**: php-patterns/
- **C#**: csharp-patterns/

## 🔗 相关文档

- **主文档**: [../CLAUDE.md](../CLAUDE.md)
- **Agent指南**: [../AGENTS.md](../AGENTS.md)
- **命令参考**: [../COMMANDS-QUICK-REF.md](../COMMANDS-QUICK-REF.md)

---

**版本**: v3.3.0  
**更新**: 2026-05-02
