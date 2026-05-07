# Hermes-by-Everything 项目结构

本文档描述 HBE 项目的目录组织，参考 everything-claude-code 的架构设计。

## 目录结构

```
hermes-by-everythings/
├── commands/              # 命令文件（用户可调用的 /hbe:* 命令）
│   ├── README.md          # 命令索引和使用说明
│   ├── hbe-plan.md        # 功能实现规划
│   ├── hbe-review.md      # 代码质量审查
│   └── ...
├── skills/                # 技能定义（Agent prompts、规则、模板）
│   ├── agents/            # Agent 定义文件
│   ├── rules/             # 编码规则
│   ├── templates/         # 输出模板（PRD、Handoff、Progress）
│   └── active/            # 推荐的技能
├── references/            # 参考文档
│   ├── agents/            # Agent 参考实现
│   └── interactive/       # 交互式执行引擎
├── scripts/               # 实用脚本
│   ├── hooks/             # Hook 脚本
│   ├── ralph/             # Ralph 自主循环脚本
│   ├── test/              # 测试脚本
│   └── lib/               # 工具库
├── docs/                  # 文档
│   ├── adr/               # 架构决策记录
│   ├── architecture/      # 架构文档
│   ├── guides/            # 使用指南
│   └── research/          # 研究报告
├── memory/                # 学习记忆系统
│   ├── errors/            # Bug 修复记录
│   ├── successes/         # 成功模式
│   ├── feedback/          # 用户反馈
│   └── sessions/          # 会话记录
├── schemas/               # JSON schemas
├── themes/                # 主题配置
├── tests/                 # 测试文件
├── .claude/               # Claude Code 配置
├── .claude-plugin/        # 插件元数据
│   └── marketplace.json   # Marketplace 配置
├── .claude/skills/        # Claude Code 技能入口
├── SKILLS.md              # 技能索引
├── CLAUDE.md              # 项目级持久上下文
├── README.md              # 项目说明
└── MEMORY.md              # 记忆索引
```

## 核心目录说明

### `commands/` - 命令文件

存储所有用户可调用的命令，每个命令对应一个 `.md` 文件。

**命名规范**：`hbe-<command-name>.md`

**文件结构**：
- YAML frontmatter（name, description, trigger, keywords）
- 命令描述
- 执行流程
- 使用示例

### `skills/` - 技能定义

存储 Agent prompts、规则和模板。

**子目录**：
- `agents/` - 9 个专业 Agent（planner, architect, code-reviewer 等）
- `rules/` - 8 个规则文件（安全、测试、Git 工作流等）
- `templates/` - 输出模板（PRD、Handoff、Progress）
- `active/` - 推荐的通用技能

### `references/` - 参考文档

存储参考实现和文档。

**子目录**：
- `agents/` - Agent 参考实现（按语言分类）
- `interactive/` - 交互式执行引擎文档

### `scripts/` - 实用脚本

存储各种实用脚本。

**子目录**：
- `hooks/` - Hook 脚本（会话持久化、前后工具钩子）
- `ralph/` - Ralph 自主循环脚本
- `test/` - 测试脚本
- `lib/` - 工具库函数

### `memory/` - 学习记忆系统

存储跨会话的学习记忆。

**子目录**：
- `errors/` - Bug 修复记录（问题和解决方案）
- `successes/` - 成功模式（可复用）
- `feedback/` - 用户反馈和偏好
- `sessions/` - 会话记录

## 与 everything-claude-code 的对应关系

| everything-claude-code | hermes-by-everythings |
|------------------------|----------------------|
| `commands/` | `commands/` |
| `agents/` | `skills/agents/` + `references/agents/` |
| `rules/` | `skills/rules/` |
| `contexts/` | `references/` |
| `hooks/` | `scripts/hooks/` |
| `skills/` | `skills/active/` |

## 扩展指南

### 添加新命令

1. 在 `commands/` 创建新文件
2. 更新 `commands/README.md`
3. 在 `.claude-plugin/marketplace.json` 注册
4. 在 `.claude/skills/hermes-by-everythings/SKILL.md` 添加路由

### 添加新 Agent

1. 在 `skills/agents/` 创建 Agent 定义
2. 在 `references/agents/` 创建参考实现（可选）
3. 更新 `SKILLS.md` 索引

### 添加新规则

1. 在 `skills/rules/` 创建规则文件
2. 在 `.claude/skills/hermes-by-everythings/SKILL.md` 引用规则
3. 更新 `SKILLS.md` 索引

---

**最后更新**: 2026-05-02  
**版本**: 3.2.0
