---
name: hermes-by-everythings
description: >
  多平台多语言编码增强套件。整合 everything-claude-code + ralph 最佳能力。
  36 Agent + 241+ Skill + 18 Command + 77+ Rule + Ralph 自主循环 + Hooks 自动化。
  支持 TypeScript/Python/Rust/Go/Java/C#/Ruby/PHP/Swift/Kotlin。
  兼容 Claude Code/OpenCode/OpenClaw/Hermes，macOS/Windows/Linux。
  命令前缀: /hbe:xxx，可按阶段使用也可全流程跑通。
version: 3.3.0
trigger: "/hbe:,hbe,hermes,hermes-by-everythings,autonomous coding,ralph,full workflow,tdd,code review,security review"
keywords:
  - hermes-by-everythings
  - hbe
  - coding-enhancement
  - multi-language
  - multi-platform
  - ralph
  - tdd
  - code-review
  - security-review
---

# Hermes by Everything's — 多平台多语言编码增强套件

整合 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 和 [ralph](https://github.com/snarktank/ralph) 的最佳能力，
支持 10 种主流语言、4 个 AI 编码平台、3 种操作系统。

---

## 安装

### 快速开始

```bash
git clone https://github.com/ViewWay/hermes-by-everythings.git
cd hermes-by-everythings
```

### Claude Code（推荐安装方式）

HBE 包含 5 个组件，**全部安装才能获得完整功能**：

| 组件 | 安装位置 | 作用 | 缺失影响 |
|------|----------|------|----------|
| Skill | `~/.claude/skills/` | 技能入口 + 关键词触发 | 自动触发失效 |
| Commands | `~/.claude/commands/` | 18 个斜杠命令 | `/hbe-review` 等全部失效 |
| Rules | `~/.claude/rules/` | 安全护栏规则 | 护栏检查失效 |
| Hooks | `~/.hbe/scripts/hooks/` | 自动化钩子 | 自动化失效 |
| Settings | `~/.claude/settings.json` | 钩子注册 | 钩子不触发 |

**一键安装（推荐）**：
```bash
cd hermes-by-everythings
bash scripts/install.sh
```

安装脚本会自动处理全部 5 个组件，包括备份现有配置。

**开发模式（软链接，改动实时生效）**：
```bash
bash scripts/install.sh --link
```

**验证安装**：
```bash
bash scripts/install.sh --verify
```

**卸载**：
```bash
bash scripts/install.sh --uninstall
```

#### 手动安装（不推荐）

如果不想用安装脚本，需要手动复制 5 个组件：

```bash
# 1. Skill
cp -r .claude/skills/hermes-by-everythings ~/.claude/skills/

# 2. Commands (18 个斜杠命令)
mkdir -p ~/.claude/commands
cp .claude/commands/hbe-*.md ~/.claude/commands/

# 3. Rules (护栏规则)
mkdir -p ~/.claude/rules
cp .claude/rules/*.md ~/.claude/rules/

# 4. Hook 脚本
mkdir -p ~/.hbe/scripts/hooks
cp -r scripts/hooks/* ~/.hbe/scripts/hooks/
chmod +x ~/.hbe/scripts/hooks/*.sh 2>/dev/null || true
[ -d scripts/lib ] && cp -r scripts/lib/* ~/.hbe/scripts/lib/

# 5. 合并 Settings（将 settings.hbe.json 的 hooks 合并到你的 settings.json）
# 见 scripts/install.sh 中的生成逻辑
```

> **警告**：仅复制 Skill 目录会缺失约 60% 功能（Commands + Rules + Hooks）。

### Hermes Agent

Hermes 使用 [agentskills.io](https://agentskills.io) 开放标准，本 skill 的 SKILL.md 直接兼容。

```bash
cp -r hermes-by-everythings ~/.hermes/skills/hermes-by-everythings
# 或软链接
ln -s $(pwd)/hermes-by-everythings ~/.hermes/skills/hermes-by-everythings
```

### OpenClaw / OpenCode

```bash
# OpenClaw
cp -r hermes-by-everythings ~/.openclaw/skills/hermes-by-everythings
# OpenCode
cp -r hermes-by-everythings ~/.opencode/skills/hermes-by-everythings
```

---

## 支持的语言

| 语言 | 框架 | 构建 | 测试 | 详细适配 |
|------|------|------|------|----------|
| TypeScript/JavaScript | React, Next.js, Vue, Svelte, NestJS, Express | tsc/esbuild/turbo | vitest/jest | references/language-adapter.md |
| Python | Django, FastAPI, Flask, PyTorch | setuptools/hatch | pytest | references/language-adapter.md |
| Rust | Axum, Actix, Rocket, Tokio | cargo | cargo test | references/language-adapter.md |
| Go | Gin, Echo, Fiber | go build | go test | references/language-adapter.md |
| Java | Spring Boot, Quarkus, Micronaut | maven/gradle | junit | references/language-adapter.md |
| Kotlin | Ktor, Android | gradle | kotest | references/language-adapter.md |
| C#/.NET | ASP.NET Core, Blazor | dotnet build | xunit/nunit | references/language-adapter.md |
| Ruby | Rails, Sinatra | rake | rspec | references/language-adapter.md |
| PHP | Laravel, Symfony | composer | phpunit/pest | references/language-adapter.md |
| Swift | Vapor, Hummingbird | swift build | xctest | references/language-adapter.md |

完整工具链映射见 references/language-adapter.md。验证脚本自动检测项目语言。

---

## 功能概览

### Agents（9 个专业代理）

| 代理 | 命令 | 说明 |
|------|------|------|
| planner | /hbe:plan | 功能实现规划 |
| architect | /hbe:architect | 系统架构设计 |
| code-reviewer | /hbe:review | 代码质量审查 |
| security-reviewer | /hbe:security | 安全漏洞分析 |
| tdd-guide | /hbe:tdd | TDD 开发指导 |
| build-error-resolver | /hbe:build-fix | 构建错误修复 |
| e2e-runner | /hbe:e2e | E2E 测试执行 |
| refactor-cleaner | /hbe:refactor | 死代码清理 |
| doc-updater | /hbe:docs | 文档自动更新 |

### Skills（13 个技能）

| 技能 | 命令 | 说明 |
|------|------|------|
| prd | /hbe:prd | PRD 需求文档生成 |
| ralph | /hbe:ralph | PRD 转 prd.json + 自主执行循环 |
| tdd-workflow | /hbe:tdd | TDD 红-绿-重构工作流 |
| coding-standards | 内嵌 | 编码标准（references/rules/coding-style.md） |
| backend-patterns | 内嵌 | 后端模式（references/rules/patterns.md） |
| frontend-patterns | 内嵌 | 前端模式（references/rules/patterns.md） |
| security-review | /hbe:security | 安全审查清单 |
| continuous-learning | /hbe:learn | 会话模式提取 → 自动生成 skill |
| strategic-compact | 自动 | 上下文战略压缩提示 |
| verification-loop | /hbe:verify | 五阶段验证循环 |
| eval-harness | /hbe:eval | 评估驱动开发 |
| project-guidelines | 内嵌 | 项目特定规范 |
| orchestration | /hbe:orchestrate | 多 Agent 编排 |

### Commands（18 个快捷命令）

| 命令 | 说明 |
|------|------|
| /hbe:plan | 实现规划 |
| /hbe:architect | 架构设计 |
| /hbe:tdd | TDD 开发流程 |
| /hbe:review | 代码审查 |
| /hbe:security | 安全审查 |
| /hbe:build-fix | 构建修复 |
| /hbe:e2e | E2E 测试生成 |
| /hbe:refactor | 重构清理 |
| /hbe:docs | 文档/Codemap 更新 |
| /hbe:prd | PRD 生成 |
| /hbe:verify | 五阶段验证 |
| /hbe:orchestrate | 多 Agent 流水线 |
| /hbe:ralph | 自主执行循环 |
| /hbe:checkpoint | 保存进度快照 |
| /hbe:learn | 模式学习提取 |

### Rules（8 个规则文件）

| 规则 | 文件 | 何时生效 |
|------|------|----------|
| 安全规则 | references/rules/security.md | 涉及密钥/用户输入/API |
| 代码风格 | references/rules/coding-style.md | 编写代码时 |
| 测试规则 | references/rules/testing.md | 写测试时 |
| Git 工作流 | references/rules/git-workflow.md | git 操作时 |
| 代理编排 | references/rules/agent-orchestration.md | 多Agent协作时 |
| 性能规则 | references/rules/performance.md | 性能优化时 |
| 设计模式 | references/rules/patterns.md | 架构设计时 |
| Hook 规则 | references/rules/hooks.md | Hook 触发时 |

### Ralph 自主循环

突破上下文限制，自动完成大型任务：
- 每次迭代 = 全新上下文起点
- 记忆通过文件持久化（prd.json, progress.md, git history）
- 完全自主执行，无需人工干预
- 后台运行，实时查看进度

### Hooks（自动化）

| Hook | 触发时机 | 行为 |
|------|----------|------|
| TypeScript 检查 | 编辑 .ts/.tsx 后 | 实时类型检查 |
| Prettier 格式化 | 编辑代码文件后 | 自动格式化 |
| console.log 警告 | 提交前 | 检测遗留调试语句 |
| PR 创建提示 | gh pr create 后 | 输出 PR URL + review 命令 |
| Git push 提醒 | git push 前 | 提示 review 变更 |

---

## 分层加载架构

| 层级 | 内容 | 文件 | 何时加载 |
|------|------|------|----------|
| L0 路由 | 命令路由 + 全流程定义 | SKILL.md（本文件） | 每次匹配自动加载 |
| L1 Agent | 9 个专业角色 prompt | references/agents/NAME.md | 单命令使用时 |
| L2 Rules | 8 个规则文件 | references/rules/NAME.md | 编码时按需 |
| L3 编排 | 多 Agent 流水线 | references/orchestration.md | 全流程时 |
| L4 模板 | PRD/Handoff/Progress | templates/* | 生成输出时 |
| L5 脚本 | 验证循环/日志查看 | scripts/* | 验证阶段 |
| L6 适配 | 平台适配 + 语言适配 | references/platform-adapter.md, references/language-adapter.md | 跨平台/多语言时 |

**加载方式（按平台）**:
- Hermes: `skill_view(name="hermes-by-everythings", file_path="references/agents/planner.md")`
- Claude Code: 使用 Read 工具读取 `references/agents/planner.md`
- 其他: 直接将 prompt 文件内容注入上下文
- 详见 references/platform-adapter.md

---

## 使用模式

### 模式 A: 单阶段按需使用

用户只调用某个子命令，如 /hbe:plan：

1. 从路由表找到对应 Agent
2. 加载 references/agents/NAME.md
3. 按 Agent 流程执行
4. 输出结果

### 模式 B: 半自动流水线

用户依次调用多个阶段，如 /hbe:plan -> /hbe:tdd -> /hbe:review：

1. 每个阶段输出 handoff 文档（见 templates/handoff.md）
2. 下一阶段读取上一阶段的 handoff
3. 最终聚合为完整报告

### 模式 C: 预设工作流（一键编排）

| 工作流 | 触发 | 流水线 |
|--------|------|--------|
| feature | /hbe:orchestrate feature | planner -> tdd -> review -> security |
| bugfix | /hbe:orchestrate bugfix | build-fix -> tdd -> review |
| refactor | /hbe:orchestrate refactor | architect -> review -> refactor-cleaner -> tdd |
| security | /hbe:orchestrate security | security-reviewer -> review -> architect |
| full | /hbe:orchestrate full | plan -> architect -> tdd -> review -> security -> docs |

### 模式 D: Ralph 自主循环

用户调用 /hbe:ralph，进入完全自主模式：

1. 读取 prd.json（如无则先生成: /hbe:prd）
2. 循环：
   a. 选最高优先级 passes=false 的 story
   b. TDD 实现（RED -> GREEN -> REFACTOR）
   c. 运行验证循环 (/hbe:verify)
   d. 全部通过 -> git commit
   e. 更新 prd.json passes=true
   f. 追加到 progress.md
3. 直到所有 story 通过 或 达到迭代上限
4. 输出 progress.md 汇总

后台运行: 使用 `terminal(background=true)` 启动，通过 `process(action="poll")` 查看进度。

---

## 通用执行流程

当收到 /hbe:COMMAND 时，遵循以下步骤：

### Step 1: 环境感知

```bash
pwd                           # 确认工作目录
git status --short            # 查看变更
git log --oneline -5          # 最近提交
git branch --show-current     # 当前分支
```

### Step 2: 加载 Agent

```
skill_view(name="hermes-by-everythings", file_path="references/agents/NAME.md")
```

### Step 3: 按 Agent 流程执行（通用五步法）

1. 分析（Analyze）— 阅读/搜索相关代码
2. 规划（Plan）— 列出具体操作步骤
3. 执行（Execute）— 修改代码/文件
4. 验证（Verify）— 运行检查命令
5. 输出（Report）— 汇报结果

### Step 4: Hook 检查

根据 references/rules/hooks.md，在关键节点自动执行：
- 编辑 .ts/.tsx 后 → 类型检查
- 编辑代码后 → 格式化检查
- 提交前 → console.log 检测
- git push 前 → 变更 review 提示

### Step 5: Handoff 输出（串行时）

```
## HANDOFF: FROM-AGENT -> TO-AGENT
### Context: 本次做了什么
### Findings: 关键发现
### Files Modified: 修改列表
### Open Questions: 未解决问题
```

---

## 各命令详细流程

### /hbe:plan — 实现规划

1. 接收用户功能描述
2. 加载 references/agents/planner.md
3. 分析需求 → 审查代码库 → 拆解步骤 → 输出实现计划
4. 计划包含：文件路径、依赖关系、复杂度评估、风险点

### /hbe:architect — 架构设计

1. 加载 references/agents/architect.md
2. 现状分析 → 需求收集 → 设计提案 → 权衡分析
3. 输出：架构图、组件职责、数据模型、API 契约、集成模式

### /hbe:tdd — TDD 开发

1. 加载 references/agents/tdd-guide.md
2. 严格遵循 红-绿-重构：RED（写失败测试）→ GREEN（最小代码通过）→ REFACTOR（重构优化）
3. 覆盖率要求 >= 80%

### /hbe:review — 代码审查

1. 加载 references/agents/code-reviewer.md
2. 检查：正确性、可读性、命名、错误处理、边界、性能、安全
3. 按严重程度分级：Critical / Warning / Suggestion

### /hbe:security — 安全审查
| `/hbe-scan` | 统一安全扫描 (SAST/SCA/密钥/复杂度) |

1. 加载 references/agents/security-reviewer.md
2. 检查 OWASP Top 10：注入、XSS、CSRF、SSRF、密钥泄露
3. 输出：漏洞列表 + 修复建议 + 严重程度

### /hbe:build-fix — 构建修复

1. 加载 references/agents/build-error-resolver.md
2. 最小改动原则：只修构建错误，不做架构改动
3. 流程：收集错误 → 分类 → 逐个修复 → 验证

### /hbe:e2e — E2E 测试

1. 加载 references/agents/e2e-runner.md
2. 识别关键用户流程 → 编写 Playwright 测试
3. Flaky 测试隔离、截图/视频 artifact

### /hbe:refactor — 重构清理

1. 加载 references/agents/refactor-cleaner.md
2. 用 knip/depcheck/ts-prune 检测死代码
3. 安全移除：确认无引用 → 移除 → 测试通过

### /hbe:docs — 文档更新

1. 加载 references/agents/doc-updater.md
2. AST 分析 → Codemap 生成 → README 更新 → 依赖图
3. 确保文档与代码同步

### /hbe:prd — PRD 生成

1. 接收用户功能描述
2. 问 3-5 个关键澄清问题（带选项 A/B/C/D）
3. 生成结构化 PRD 保存到项目根目录 prd.json
4. 同步创建空 progress.md
5. 格式参考: templates/prd-json.json

### /hbe:verify — 五阶段验证循环（多语言）

自动检测项目语言，运行对应工具链:

Phase 1 Build — cargo build / go build / mvn compile / dotnet build / ...
Phase 2 Type Check — cargo clippy / go vet / mypy / npx tsc --noEmit / ...
Phase 3 Lint — golangci-lint / ruff / clippy / eslint / rubocop / ...
Phase 4 Test — cargo test / go test / pytest / vitest / rspec / phpunit / ...
Phase 5 Security — 密钥检测 + 语言特定安全扫描

任一阶段失败则 STOP，修复后从 Phase 1 重新开始。

### /hbe:orchestrate — 多 Agent 编排

1. 加载 references/orchestration.md
2. 根据工作流类型确定 Agent 链
3. 每个执行后生成 handoff 文档
4. 下一个读取 handoff 继续执行
5. 最终聚合为完整报告

### /hbe:ralph — 自主执行循环（Token 优化版）

初始化（仅首次）:
- 检查 prd.json 是否存在，不存在 → 先运行 /hbe:prd
- 检查 progress.md 是否存在，不存在 → 创建空文件
- 记录文件 hash 缓存，避免重复读取

循环（WHILE iterations < max_iterations）:
1. 读取 prd.json → **只读第一个 passes=false 的 story**（不读全部）
2. **按需加载 agent prompt** → 只读 TDD 阶段需要的 tdd-guide.md
3. git checkout -b ralph/FEATURE-NAME 或使用已有分支
4. TDD 实现: RED → GREEN → REFACTOR
5. **增量验证** → 分析 `git diff --name-only`，根据变更类型选择验证阶段:
   - 只改测试 → Test
   - 改业务代码 → Build → TypeCheck → Test
   - 新增文件 → 全部 5 阶段
6. 全部通过 → git add -A && git commit
7. 更新 prd.json story.passes = true
8. **压缩摘要** → 追加结构化摘要到 progress.md（非完整 handoff）

结束:
- 输出统计: 完成数/总数、耗时、token 估算
- 如有未完成 story，列出剩余项

Token 优化详见 references/token-optimizer.md。
预估: 优化后 10 次迭代 100-180k tokens（优化前 200-400k，节省 ~55%）。

### /hbe:checkpoint — 进度快照

保存到项目根目录 progress.md：
- 已完成/未完成 Story 列表
- 当前正在处理的 Story
- 本会话修改的文件列表
- 学到的经验（Pattern/Gotcha）
- Token 使用估算

### /hbe:learn — 模式学习

1. 回顾本次会话
2. 识别可复用模式（error_resolution / user_corrections / workarounds / debugging_techniques / project_specific）
3. 过滤掉简单 typo、一次性修复、外部 API 问题
4. 用 skill_manage 保存为新 skill 或 patch 现有 skill
5. 用 memory 记录关键发现

### /hbe:eval — 评估驱动开发

1. 定义预期行为（BEFORE 实现）
2. 创建能力评估或回归评估
3. 实现后运行评估
4. 追踪 pass@k 指标

---

## 运行时文件结构

Ralph 模式在项目根目录生成的文件：

```
项目根目录/
├── prd.json              # 用户故事列表（任务清单）
├── progress.md           # 迭代学习记录
├── .ralph-stats.json     # 运行统计（tokens, 耗时）
├── logs/                 # 迭代详细日志
│   ├── index.txt         # 日志索引
│   ├── iteration-1.jsonl # 第 1 次迭代日志
│   └── iteration-N.jsonl # 第 N 次迭代日志
└── tasks/                # PRD 临时文件
    └── prd-*.md
```

---

## 平台兼容性

HBE 支持 macOS/Windows/Linux，兼容 Claude Code、OpenCode、OpenClaw、Hermes 四个平台。
Agent prompt 和规则文件是平台无关的纯文本。

| HBE 能力 | Hermes | Claude Code | OpenCode | OpenClaw |
|----------|--------|-------------|----------|----------|
| Agent 加载 | skill_view() | Read 工具 | 文件读取 | 文件读取 |
| 并行执行 | delegate_task() | Agent 并行 | 并行调用 | 并行调用 |
| Shell 执行 | terminal() | Bash 工具 | Shell 工具 | Shell 工具 |
| 文件管理 | read/write_file | Read/Write/Edit | 文件工具 | 文件工具 |
| 任务追踪 | todo() | TaskCreate/Update | 任务管理 | 任务管理 |

完整适配指南见 references/platform-adapter.md。

### Hermes 增强能力

以下能力仅在 Hermes 平台可用:

| 能力 | 说明 |
|------|------|
| delegate_task 并行子代理 | 多 Agent 真正并行执行 |
| memory 持久化记忆 | 跨会话记住项目知识 |
| skill_manage 动态技能 | 运行时创建/更新 skill |
| cronjob 定时任务 | 定时触发 /hbe:ralph 自主开发 |
| execute_code 批量操作 | 一次执行多个工具调用 + 中间逻辑 |
| 多平台通知 | 微信/Telegram/飞书/Discord 推送 |
| browser 内置浏览器 | 无需外部 MCP 做 UI 验证 |
| vision_analyze 视觉分析 | 截图对比、UI 回归测试 |

---

## Token 消耗预估

| 模式 | 预估 tokens |
|------|-------------|
| 单命令（如 /hbe:plan） | 5-15k input + 2-5k output |
| 三阶段流水线 | 30-50k total |
| Ralph 1 次迭代（优化后） | 10-18k |
| Ralph 全流程 10 次（优化后） | 100-180k |
| 完整 feature 工作流 | 50-80k |
| 安全审查 + 修复 | 15-30k |

---

## 参考资源

- 灵感来源: https://github.com/hellangleZ/burn-in-cceverywhere-ralph
- 原始 Ralph: https://github.com/snarktank/ralph
- everything-claude-code: https://github.com/affaan-m/everything-claude-code
