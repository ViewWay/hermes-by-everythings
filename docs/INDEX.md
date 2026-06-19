# HBE 文档索引

> **版本**: 3.3.1
> **更新时间**: 2026-05-02

完整的 Hermes-by-Everything 文档导航。

---

## 📚 快速导航

### 新手入门
1. [安装指南](guides/INSTALLATION.md) - 完整安装教程（skillhub/git/manual）
2. [快速开始](guides/quick-start.md) - 5分钟上手 HBE
3. [中文快速开始](../README.zh-CN.md) - 中文版快速入门
4. [项目主文档](../README.md) - 完整的项目介绍

### 核心功能
1. [Orchestrator 教程](guides/ORCHESTRATOR-TUTORIAL.md) - 多Agent编排系统教程
2. [Orchestrator 集成指南](ORCHESTRATOR-GUIDE.md) - 深度集成指南
3. [Agent定义](../skills/agents/) - 37个专业Agent详细说明

### 参考文档
1. [Skill索引](../SKILL-INDEX.md) - 所有技能的快速索引
2. [Agent索引](../SKILL-INDEX.md#🎭-agents智能体) - Agent快速查找
3. [变更日志](../CHANGELOG.md) - 版本更新历史

---

## 🎯 按角色查找文档

### 👨‍💻 开发者

**入门必读**:
- [快速开始](guides/quick-start.md)
- [CLAUDE.md](../CLAUDE.md) - 项目级持久上下文

**核心功能**:
- [Orchestrator教程](guides/ORCHESTRATOR-TUTORIAL.md) - 学习多Agent编排
- [Agent教程索引](guides/agents/README.md) - 核心Agent使用教程
- [TDD工作流](../commands/hbe-tdd.md) - 测试驱动开发
- [代码审查](../commands/hbe-review.md) - 代码质量检查

**参考手册**:
- [Agent列表](../skills/agents/) - 所有Agent定义
- [Agent教程](guides/agents/) - Agent使用教程
- [技能列表](../skills/) - 所有技能说明
- [命令参考](../SKILL-INDEX.md#-快捷命令) - 18个快捷命令

### 🏢 团队负责人

**项目管理**:
- [Ralph自主循环](../commands/hbe-ralph.md) - 大型任务自动化
- [Orchestrator编排](ORCHESTRATOR-GUIDE.md) - 多Agent协作管理
- [PRD生成](../skills/templates/prd-json.json) - 需求文档生成

**质量保证**:
- [五阶段验证](../tests/README.md) - 完整验证循环
- [安全审查](../commands/hbe-security.md) - 安全漏洞检查
- [性能优化](../skills/rules/web/performance.md) - 性能最佳实践

### 🔧 系统集成者

**集成指南**:
- [Orchestrator集成](ORCHESTRATOR-GUIDE.md) - 完整的集成方案
- [agentdesign集成报告](reports-archive/PHASE2-OPTIMIZATION.md) - agentdesign集成详情
- [Memory系统](MEMORY-SYSTEM.md) - 记忆系统文档

**工具脚本**:
- [Agent ID管理器](../scripts/_archive/agent-id-manager.js) - Agent ID管理工具
- [跨平台脚本](../scripts/) - Bash/Node.js/Python/PowerShell脚本

### 📝 文档维护者

**文档管理**:
- [文档更新报告](reports-archive/DOCUMENTATION-UPDATE-2026-05-02.md) - 最新文档更新
- [贡献指南](../CONTRIBUTING.md) - 如何贡献文档
- [Skill放置策略](SKILL-PLACEMENT-POLICY.md) - Skill组织规范

**架构文档**:
- [架构ADR](adr/) - 架构决策记录
- [交互执行引擎](architecture/interactive-execution-engine.md) - 执行引擎架构

---

## 📂 按主题分类

### 核心概念

| 主题 | 文档 | 描述 |
|------|------|------|
| **Agent系统** | [skills/agents/](../skills/agents/) | 37个专业Agent定义 |
| **Skill系统** | [SKILL-INDEX.md](../SKILL-INDEX.md) | 技能索引和路由 |
| **Orchestrator** | [ORCHESTRATOR-GUIDE.md](ORCHESTRATOR-GUIDE.md) | 多Agent编排系统 |
| **Ralph循环** | [skills/active/ralph-loop.md](../commands/hbe-ralph.md) | 自主执行系统 |
| **Memory系统** | [MEMORY-SYSTEM.md](MEMORY-SYSTEM.md) | 持久化记忆系统 |

### 开发工作流

| 工作流 | 文档 | 用途 |
|--------|------|------|
| **TDD** | [skills/active/tdd-workflow.md](../commands/hbe-tdd.md) | 测试驱动开发 |
| **代码审查** | [skills/agents/code-reviewer.md](../skills/agents/code-reviewer.md) | 代码质量审查 |
| **安全审查** | [skills/agents/security-reviewer.md](../skills/agents/security-reviewer.md) | 安全漏洞检查 |
| **重构** | [skills/agents/refactor-cleaner.md](../skills/agents/refactor-cleaner.md) | 死代码清理 |
| **E2E测试** | [skills/agents/e2e-runner.md](../skills/agents/e2e-runner.md) | 端到端测试 |

### 平台与语言

| 平台/语言 | 文档 | 说明 |
|-----------|------|------|
| **TypeScript** | [skills/rules/typescript.md](../skills/rules/typescript/coding-style.md) | TypeScript规范 |
| **Python** | [skills/rules/python.md](../skills/rules/python/coding-style.md) | Python规范 |
| **Rust** | [skills/rules/rust.md](../skills/rules/rust/coding-style.md) | Rust规范 |
| **Go** | [skills/rules/go.md](../skills/rules/golang/coding-style.md) | Go规范 |
| **跨平台** | [reports-archive/PHASE4-INTERACTIVE-OPTIMIZATION.md](reports-archive/PHASE4-INTERACTIVE-OPTIMIZATION.md) | 跨平台脚本 |

### 高级主题

| 主题 | 文档 | 难度 |
|------|------|------|
| **上下文优化** | [CONTEXT-OPTIMIZATION.md](architecture/CONTEXT-OPTIMIZATION.md) | 高级 |
| **自主循环** | [skills/active/ralph-loop.md](../commands/hbe-ralph.md) | 高级 |
| **Agent编排** | [ORCHESTRATOR-GUIDE.md](ORCHESTRATOR-GUIDE.md) | 中级 |
| **Hook系统** | [skills/rules/hooks.md](../skills/rules/hooks.md) | 中级 |
| **闭包学习** | [research-findings.md](research-findings.md) | 高级 |

---

## 🗂️ 文件结构

```
hermes-by-everythings/
├── README.md                      # 项目主文档
├── README.zh-CN.md                # 中文版README
├── CHANGELOG.md                   # 变更日志
├── CLAUDE.md                      # 项目级上下文
├── CONTRIBUTING.md                # 贡献指南
│
├── docs/                          # 文档目录
│   ├── INDEX.md                   # 📖 本文件（文档索引）
│   ├── MEMORY-SYSTEM.md           # 记忆系统文档
│   ├── CONTEXT-OPTIMIZATION.md    # 上下文优化
│   ├── ORCHESTRATOR-GUIDE.md      # Orchestrator集成指南
│   │
│   ├── guides/                    # 指南和教程
│   │   ├── quick-start.md         # 快速开始
│   │   └── ORCHESTRATOR-TUTORIAL.md # Orchestrator教程
│   │
│   ├── reports-archive/           # 报告归档
│   │   ├── AGENTDESIGN-INTEGRATION.md     # agentdesign集成报告
│   │   ├── DOCUMENTATION-UPDATE-2026-05-02.md # 文档更新报告
│   │   ├── SCRIPT-MIGRATION.md            # 脚本迁移报告
│   │   └── MEMORY-IMPLEMENTATION.md       # Memory系统实现
│   │
│   ├── architecture/              # 架构文档
│   │   └── interactive-execution-engine.md
│   │
│   ├── adr/                       # 架构决策记录
│   │   └── ...
│   │
│   └── agentdesign/               # agentdesign参考资料
│       └── ...
│
├── skills/                        # 技能和Agent
│   ├── agents/                    # Agent定义（37个）
│   │   ├── orchestrator.md        # ⭐ 主智能体
│   │   ├── planner.md
│   │   ├── architect.md
│   │   └── ...
│   │
│   ├── rules/                     # 规则文件（77个）
│   ├── active/                    # 活跃技能
│   └── templates/                 # 模板（5个）
│
├── scripts/                       # 脚本工具
│   ├── agent-id-manager.js        # ⭐ Agent ID管理工具
│   ├── hooks/                     # Hook脚本
│   ├── ralph/                     # Ralph脚本
│   └── ...
│
└── tests/                         # 测试文件
    └── ...
```

---

## 🔍 快速查找

### 按文件类型查找

- **README文件**: [README.md](../README.md), [README.zh-CN.md](../README.zh-CN.md)
- **Agent定义**: [skills/agents/](../skills/agents/)
- **技能文档**: [skills/](../skills/)
- **规则文件**: [skills/rules/](../skills/rules/)
- **指南教程**: [docs/guides/](guides/)
- **报告文档**: [docs/reports/](reports-archive/)
- **架构文档**: [docs/architecture/](architecture/)
- **ADR**: [docs/adr/](adr/)

### 按更新时间查找

- **2026-05-02** (v3.3.1):
  - [Orchestrator教程](guides/ORCHESTRATOR-TUTORIAL.md) - 新增
  - [Orchestrator集成指南](ORCHESTRATOR-GUIDE.md) - 新增
  - [agentdesign集成报告](reports-archive/PHASE2-OPTIMIZATION.md) - 新增
  - [文档更新报告](reports-archive/DOCUMENTATION-UPDATE-2026-05-02.md) - 新增

- **历史版本**: 查看 [CHANGELOG.md](../CHANGELOG.md)

---

## 📖 推荐阅读顺序

### 🌱 新手路径

1. [安装指南](guides/INSTALLATION.md) - 安装 HBE
2. [快速开始](guides/quick-start.md) - 了解基础
3. [项目主文档](../README.md) - 了解全貌
4. [CLAUDE.md](../CLAUDE.md) - 理解核心机制
5. [Orchestrator教程](guides/ORCHESTRATOR-TUTORIAL.md) - 学习编排

### 🚀 进阶路径

1. 完成新手路径
2. 阅读 [Agent定义](../skills/agents/) - 理解每个Agent
3. 学习 [Skill系统](../SKILL-INDEX.md) - 掌握技能使用
4. 深入 [Orchestrator集成指南](ORCHESTRATOR-GUIDE.md) - 高级编排

### 🎓 专家路径

1. 完成进阶路径
2. 研究 [架构ADR](adr/) - 理解设计决策
3. 学习 [上下文优化](architecture/CONTEXT-OPTIMIZATION.md) - 优化性能
4. 探索 [源码](../skills/agents/) - 深入实现

---

## ❓ 获取帮助

### 文档问题

- 查看本文档索引
- 搜索相关关键词
- 查看对应主题的详细文档

### 使用问题

- 查看 [快速开始](guides/quick-start.md)
- 查看 [Orchestrator教程](guides/ORCHESTRATOR-TUTORIAL.md)
- 查看 [故障排除](guides/ORCHESTRATOR-TUTORIAL.md#故障排除)

### 贡献文档

- 阅读 [贡献指南](../CONTRIBUTING.md)
- 查看 [Skill放置策略](SKILL-PLACEMENT-POLICY.md)
- 提交 Pull Request

---

## 🔗 外部资源

- **GitHub仓库**: https://github.com/ViewWay/hermes-by-everythings
- **问题反馈**: https://github.com/ViewWay/hermes-by-everythings/issues
- **讨论区**: https://github.com/ViewWay/hermes-by-everythings/discussions
- **agentdesign参考**: [docs/agentdesign/](agentdesign/)

---

**文档索引版本**: 3.3.1
**最后更新**: 2026-05-02
**维护者**: HBE 团队
