# Hermes-by-Everything

<p align="center">
  <img src="assets/logo.svg" alt="Hermes-by-Everything — 多平台多语言编码增强套件" width="320">
</p>

[![Stars](https://img.shields.io/github/stars/ViewWay/hermes-by-everythings?style=flat)](https://github.com/ViewWay/hermes-by-everythings/stargazers)
[![Forks](https://img.shields.io/github/forks/ViewWay/hermes-by-everythings?style=flat)](https://github.com/ViewWay/hermes-by-everythings/network/members)
[![Contributors](https://img.shields.io/github/contributors/ViewWay/hermes-by-everythings?style=flat)](https://github.com/ViewWay/hermes-by-everythings/graphs/contributors)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-3.3.1-green.svg)](https://github.com/ViewWay/hermes-by-everythings/releases)

> **39 个专业代理** | **33 个核心技能** | **18 个快捷命令** | **83 个规则文件** | **Ralph 自主循环** | **Orchestrator 编排**

---

<div align="center">

**Language / 语言**

[**English**](README.md) | [**简体中文**](README.zh-CN.md)

</div>

---

**多平台多语言编码增强套件 - 整合 everything-claude-code 和 ralph 的最佳能力**

Hermes-by-Everything (HBE) 是一个生产级的编码增强系统，整合了 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 的全面能力和 [ralph](https://github.com/snarktank/ralph) 的自主循环特性。

支持 **10 种主流编程语言**（TypeScript/JavaScript、Python、Rust、Go、Java、Kotlin、C#、Ruby、PHP、Swift），可通过 **插件市场** 安装到 **Claude Code、ZCode、Codex** 三大平台（也兼容 Hermes、OpenCode、OpenClaw），运行在 **3 种操作系统**（macOS、Windows、Linux）上。

---

## 核心特性

### 🤖 专业代理（37 个）

| 代理 | 命令 | 说明 |
|------|------|------|
| **orchestrator** | `/hbe-orchestrate` | 多Agent编排 |
| **planner** | `/hbe-plan` | 实现规划 |
| **architect** | `/hbe-architect` | 架构设计 |
| **code-reviewer** | `/hbe-review` | 代码审查 |
| **security-reviewer** | `/hbe-security` | 安全审查 |
| **tdd-guide** | `/hbe-tdd` | TDD 开发 |
| **build-error-resolver** | `/hbe-build-fix` | 构建修复 |
| **e2e-runner** | `/hbe-e2e` | E2E 测试 |
| **refactor-cleaner** | `/hbe-refactor` | 重构清理 |
| **doc-updater** | `/hbe-docs` | 文档更新 |

### 🛠️ 核心技能（13 个）

- **prd** - PRD 需求文档生成
- **ralph** - PRD 转 prd.json + 自主执行循环
- **tdd-workflow** - TDD 红-绿-重构工作流
- **coding-standards** - 编码标准
- **backend-patterns** - 后端模式
- **frontend-patterns** - 前端模式
- **security-review** - 安全审查清单
- **continuous-learning** - 会话模式提取自动生成 skill
- **strategic-compact** - 上下文战略压缩提示
- **verification-loop** - 五阶段验证循环
- **eval-harness** - 评估驱动开发
- **project-guidelines** - 项目特定规范
- **orchestration** - 多 Agent 编排

### ⚡ 快捷命令（15 个）

```bash
/hbe-plan           # 实现规划
/hbe-architect      # 架构设计
/hbe-tdd            # TDD 开发流程
/hbe-review         # 代码审查
/hbe-security       # 安全审查
hbe-scan         # 统一安全扫描 (SAST/SCA/密钥/复杂度)
/hbe-build-fix      # 构建修复
/hbe-e2e            # E2E 测试生成
/hbe-refactor       # 重构清理
/hbe-docs           # 文档/Codemap 更新
/hbe-prd            # PRD 生成
/hbe-verify         # 五阶段验证
/hbe-orchestrate    # 多 Agent 流水线
/hbe-ralph          # 自主执行循环
/hbe-checkpoint     # 保存进度快照
/hbe-learn          # 模式学习提取
```

---

## 📁 文件结构

```
hermes-by-everythings/
├── README.md          # 项目主文档
├── CHANGELOG.md       # 变更日志
├── LICENSE            # 许可证
├── CLAUDE.md          # 核心上下文
├── SKILLS.md          # ⭐ 轻量级路由表 (2KB)
│
├── skills/            # 🎯 统一技能目录
│   ├── active/        #   活跃技能
│   ├── agents/        #   37 个 agent 定义
│   ├── rules/         #   77 个规则定义
│   └── templates/     #   5 个模板
│
├── docs/              # 📚 文档目录
│   ├── reports/       #   11 个优化报告
│   ├── architecture/  #   9 个架构文档
│   ├── guides/        #   2 个使用指南
│   ├── adr/           #   5 个 ADR
│   └── research/      #   研究文档
│
├── scripts/           # 🔧 脚本目录
│   ├── core/          #   核心脚本
│   ├── ai/            #   AI 功能
│   ├── cache/         #   缓存系统
│   ├── dashboard/     #   监控面板
│   ├── performance/   #   性能优化
│   └── recovery/      #   错误恢复
│
├── tests/             # 测试
├── themes/            # 主题配置
└── schemas/           # Schema 定义
```

**Token 效率**: SKILLS.md 仅 2KB (vs 原 SKILL.md 15KB，86% 优化)

---

## 快速开始

### 安装

**方式 1: 使用 skillhub（推荐）**

```bash
npm install -g @anthropics/skillhub
skillhub install hermes-by-everythings
```

**方式 2: 使用安装脚本（跨平台）**

```bash
git clone https://github.com/ViewWay/hermes-by-everythings.git
cd hermes-by-everythings

# 选择适合平台的脚本
bash install.sh        # macOS/Linux
python3 install.py     # 跨平台（推荐）
powershell install.ps1  # Windows
```

**方式 3: 手动安装（开发模式）**

```bash
# 克隆仓库
git clone https://github.com/ViewWay/hermes-by-everythings.git

# 创建软链接
ln -s $(pwd)/hermes-by-everythings ~/.claude/skills/hermes-by-everythings
```

📖 **详细安装指南**: [docs/guides/INSTALLATION.md](docs/guides/INSTALLATION.md)

### 验证安装

在 Claude Code 中输入：

```
/hbe-verify --system
```

---

## 使用示例

### 1. 规划功能

```
/hbe-plan 实现用户登录功能
```

### 2. TDD 开发

```
/hbe-tdd 实现用户认证
```

### 3. 代码审查

```
/hbe-review
```

### 4. Ralph 自主循环

```
/hbe-prd 实现完整的用户管理模块
/hbe-ralph
```

---

## 目录结构

```
hermes-by-everythings/
├── SKILLS.md                          # 主入口
├── CLAUDE.md                         # 项目级持久上下文
├── README.md                         # 英文文档
├── README.zh-CN.md                   # 中文文档
├── skills/
│   ├── agents/                       # 39 个专业代理
│   ├── rules/                        # 83 个规则文件
│   └── ...
├── skills/                           # 技能分类目录
├── templates/                        # 输出模板
├── scripts/
│   ├── hooks/                        # Hook 脚本
│   ├── ralph/                        # Ralph 系统
│   ├── test/                         # 测试套件
│   └── ...
└── docs/                             # 文档目录
    ├── adr/                          # 架构决策记录
    ├── guides/                       # 使用指南
    └── ...
```

---

## 参考资源

- [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [ralph](https://github.com/snarktank/ralph)
- [mattpocock/skills](https://github.com/mattpocock/skills)
- [anthropics/skills](https://github.com/anthropics/skills)

---

## 许可证

MIT License

---

<div align="center">

**Made with ❤️ by the Hermes-by-Everything team**

[⭐ Star us on GitHub](https://github.com/ViewWay/hermes-by-everythings) • [🐛 报告问题](https://github.com/ViewWay/hermes-by-everythings/issues)

</div>
