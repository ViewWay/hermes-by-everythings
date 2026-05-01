# 平台适配层

HBE 的 agent prompt 和规则文件是平台无关的纯文本。
本文件定义如何在 macOS/Windows/Linux 上，通过 Claude Code/OpenCode/OpenClaw/Hermes 运行 HBE。

## 操作映射表

| HBE 操作 | Hermes | Claude Code | OpenCode | OpenClaw | 通用描述 |
|----------|--------|-------------|----------|----------|----------|
| 加载 agent prompt | `skill_view(name, file_path)` | Read 工具 | 文件读取工具 | 文件读取工具 | 加载 prompt 文本 |
| 并行子代理 | `delegate_task(tasks=[])` | Agent 并行调用 | 并行工具调用 | 并行工具调用 | 同时运行多个任务 |
| 执行命令 | `terminal()` / `execute_code()` | Bash 工具 | Shell 工具 | Shell 工具 | 运行终端命令 |
| 后台任务 | `terminal(background=true)` | Bash run_in_background | 后台 shell | 后台 shell | 后台运行命令 |
| 文件读写 | `read_file` / `write_file` | Read/Write/Edit | 文件读写工具 | 文件读写工具 | 读写项目文件 |
| 任务追踪 | `todo()` | TaskCreate/Update | 任务管理 | 任务管理 | 创建更新任务 |
| 持久记忆 | `memory` | 文件系统 / CLAUDE.md | 项目配置文件 | 项目配置文件 | 跨会话知识 |
| 动态技能 | `skill_manage` | 编辑 skill 文件 | 编辑配置文件 | 编辑配置文件 | 运行时更新 skill |
| 定时任务 | `cronjob` | 外部 cron + CLI | 系统 cron | 系统 cron | 定时触发 |
| 浏览器 | `browser` | Playwright MCP | Playwright MCP | Playwright MCP | 浏览器自动化 |
| 视觉分析 | `vision_analyze` | 多模态输入 | 多模态输入 | 多模态输入 | 图片分析 |

## 平台特定指南

### Hermes

Hermes 提供原生能力，直接使用 API:

```
skill_view(name="hermes-by-everythings", file_path="references/agents/planner.md")
delegate_task(tasks=[{ prompt: "...", agent: "security-reviewer" }])
terminal(background=true, command="/hbe:ralph")
process(action="poll")
```

### Claude Code

macOS/Windows/Linux 原生支持:

```
# 加载 agent — Read 工具读取文件
Read("references/agents/planner.md")

# 并行 — 在一个消息中启动多个 Agent 调用
# 后台 — Bash(command="...", run_in_background=true)
# 任务 — TaskCreate/TaskUpdate
# 记忆 — ~/.claude/projects/ 目录
```

Claude Code 的 skill 安装: 将项目放在 `~/.claude/skills/` 或通过 plugin 管理。

### OpenCode

OpenCode 使用类似的工具集:

```
# 加载 agent — 文件读取工具加载 prompt
# 命令执行 — Shell 工具
# 并行 — 并行工具调用
# 记忆 — 项目级配置文件
```

安装: 将项目复制到 OpenCode 的 skill 目录，配置 SKILL.md 路径。

### OpenClaw

OpenClaw 使用类似的文件操作:

```
# 加载 agent — 文件读取加载 prompt
# 命令执行 — Shell 工具
# 并行 — 并行工具调用
```

安装: 将项目放到 OpenClaw 的 skill 目录下。

## 跨操作系统注意事项

### 路径分隔符

| OS | 分隔符 | 示例 |
|----|--------|------|
| macOS/Linux | `/` | `references/agents/planner.md` |
| Windows | `\` 或 `/` | `references\agents\planner.md` |

所有路径在 HBE 中统一使用 `/`。Windows 平台加载时应自动转换。

### Shell 命令差异

| 操作 | macOS/Linux | Windows |
|------|-------------|---------|
| 列出文件 | `ls` | `dir` 或 `ls`（PowerShell/Git Bash） |
| 查找文件 | `find` | `Get-ChildItem` 或 `find`（Git Bash） |
| 文本搜索 | `grep` | `Select-String` 或 `grep`（Git Bash） |
| 设置变量 | `VAR=value` | `$env:VAR="value"` |
| 运行脚本 | `bash script.sh` | `bash script.sh`（Git Bash） |

**建议**: Windows 用户使用 Git Bash 或 WSL 运行 bash 脚本。

### verify-loop.sh 跨平台

脚本使用 POSIX bash，兼容:
- macOS: Terminal.app / iTerm2
- Linux: 任意终端
- Windows: Git Bash / WSL / MSYS2

如果使用 PowerShell，可以用 `bash scripts/verify-loop.sh` 调用。

## 核心抽象原则

1. **Prompt 是核心** — agent prompt 文件是纯文本，不依赖任何平台或 OS
2. **规则是声明式的** — rules 文件描述"做什么"而非"怎么做"
3. **模板是结构化的** — templates 文件是 JSON/Markdown，通用格式
4. **脚本是 POSIX 兼容的** — scripts 使用标准 bash，macOS/Linux/WSL/Git Bash 均可运行
5. **适配器是可选的** — 没有平台适配器也可以使用核心功能

## 最低运行要求

任何 AI 编码平台 + 任何 OS，只要支持:
- 文件读写能力
- Shell 命令执行（bash 或 PowerShell）
- 上下文加载（将 prompt 文件内容注入对话）

即可运行 HBE 的全部功能。
