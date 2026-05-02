---
name: hermes-by-everythings
description: >
  多平台多语言编码增强套件。整合 ECC + Ralph 最佳能力。
  16 Command + 11 Agent + 自动化 Hooks + 学习系统。
  支持 TypeScript/Python/Rust/Go/Java/Kotlin 等10种语言。
trigger: "/hbe:,hbe,hermes,hermes-by-everythings,autonomous coding,ralph"
keywords:
  - hermes-by-everythings
  - hbe
  - coding-enhancement
  - multi-language
  - ralph
  - code-review
  - tdd
version: 3.3.0
---

# Hermes-by-Everything's

多平台多语言编码增强套件，提供完整的开发工作流支持。

## 快速开始

### 核心命令

```bash
# 规划与设计
/hbe:plan <需求>          # 实现规划
/hbe:architect           # 架构设计
/hbe:prd                 # 生成PRD

# 开发流程
/hbe:tdd                 # TDD开发
/hbe:e2e                 # E2E测试
/hbe:verify              # 五阶段验证

# 代码质量
/hbe:review              # 代码审查 ⭐
/hbe:security            # 安全审查
/hbe:refactor            # 重构清理

# 自动化
/hbe:orchestrate <类型>   # 多Agent编排
/hbe:ralph               # Ralph自主循环
```

## 何时使用

**自动触发**（当检测到）:
- 用户输入 `/hbe:xxx` 命令
- 提到 "hbe", "hermes", "ralph"
- 需要 "code review", "tdd", "autonomous coding"

**手动调用**:
- 需要专业代理（planner, architect, reviewer）
- 需要自动化工作流
- 需要代码审查或安全检查

## 核心能力

### 1. 命令系统 (16个)

覆盖开发全流程的专用命令：
- 规划设计: plan, architect, prd
- 开发测试: tdd, e2e, verify
- 质量保证: review, security, refactor
- 自动化: orchestrate, ralph

### 2. 专业代理 (11个)

- **规划**: planner, architect
- **质量**: code-reviewer, security-reviewer
- **开发**: tdd-guide, build-error-resolver
- **测试**: e2e-runner
- **维护**: refactor-cleaner, doc-updater
- **学习**: continuous-learning

### 3. 自动化Hooks

- SessionStart: 加载会话上下文
- PreToolUse: 安全检查
- PostToolUse: 日志和记忆
- Stop: 会话总结和保存

### 4. 学习系统

- 自动模式提取
- 持续改进
- 记忆管理
- Ralph自主循环

## 工作流示例

### 完整功能开发

```bash
# 1. 规划
/hbe:plan 实现用户认证功能

# 2. 架构设计
/hbe:architect

# 3. TDD开发
/hbe:tdd

# 4. 代码审查
/hbe:review

# 5. 安全审查
/hbe:security

# 或使用编排一次性完成
/hbe:orchestrate feature
```

### Bug修复

```bash
# 1. 修复构建
/hbe:build-fix

# 2. TDD验证
/hbe:tdd

# 3. 审查
/hbe:review
```

### 自主开发

```bash
# 1. 生成PRD
/hbe:prd

# 2. Ralph循环
/hbe:ralph

# Ralph会自动：
# - 读取prd.json
# - 逐个实现story
# - 运行验证
# - 提交代码
# - 保存进度
```

## 语言支持

支持10种主流语言，提供：
- 语言特定的代码审查
- 语言特定的构建修复
- 语言特定的测试指导
- 语言特定的最佳实践

**语言列表**:
TypeScript, JavaScript, Python, Rust, Go, Java, Kotlin, C#, Ruby, PHP, Swift

## 架构说明

基于 **ECC v2.0 标准**：

```
.claude/
├── commands/       ← 命令定义 (16个)
├── rules/          ← Claude Code专用规则
└── skills/         ← 主技能入口（本文件）

skills/            ← 主要工作流表面
├── agents/        ← 专业代理 (11个)
├── rules/         ← 通用规则
├── active/        ← 已验证技能
└── templates/     ← 输出模板

scripts/           ← 工具和自动化
memory/            ← 学习记忆
```

## Token优化

采用三层加载架构：
- **L0**: 索引层 (~2KB) - 快速路由
- **L1**: 元数据层 (~500 tokens/skill)
- **L2**: 完整层 (~4K tokens/skill)

**节省效果**:
- 初始加载: 75% ↓
- 会话平均: 50% ↓
- Skill切换: 70% ↓

## 安全与质量

### 编码标准

- 不可变性优先
- 小函数（<50行）
- 测试覆盖率80%+
- 无硬编码密钥
- 完整错误处理

### 安全检查

- SQL注入预防
- XSS预防
- CSRF保护
- 输入验证
- 密钥管理

### TDD流程

1. RED - 写失败测试
2. GREEN - 最小实现
3. REFACTOR - 重构优化

## 学习与记忆

### 自动学习

- 会话结束 → 提取模式
- 每次迭代 → 更新知识
- 错误修复 → 记录方案
- 用户反馈 → 记录偏好

### 记忆类型

- **项目特定** → MEMORY.md
- **用户偏好** → memory/feedback/
- **错误模式** → memory/errors/
- **成功案例** → memory/successes/

## 相关文档

- **完整文档**: ~/github/hermes-by-everythings/README.md
- **Agent指南**: AGENTS.md
- **命令参考**: .claude/commands/README.md
- **架构文档**: docs/architecture/

## 版本信息

- **当前版本**: v3.2.0
- **基于架构**: ECC v2.0
- **兼容平台**: Claude Code, OpenCode, OpenClaw, Hermes
- **更新日期**: 2026-05-02

---

**欢迎使用 Hermes-by-Everything's！**

开始使用: `/hbe:review` 或 `/hbe:plan`
