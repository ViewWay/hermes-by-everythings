# Hermes by Everything's — 项目级持久上下文

> **重要**: 此文件在每次会话开始时自动加载，为 AI 提供项目的核心上下文和触发机制。

---

## 项目身份

**名称**: Hermes by Everything's (HBE)
**版本**: 3.3.0
**类型**: 多平台多语言编码增强套件 + 自主闭环学习系统
**核心能力**: 10 Agent + 13 Skill + 18 Command + 8 Rules + Ralph + Orchestrator + 交互引擎 + 上下文优化
**目标**: 实现 100% 自动触发的编码增强系统，无人值守持续推进，自我更新学习，极致 token 效率

---

## 项目概述

Hermes-by-Everything 是一个**Claude Code插件**，提供了生产就绪的代理、技能、钩子、命令和规则配置。该项目为使用Claude Code进行软件开发提供了经过实战验证的工作流。

**核心特性**：
- 🤖 **10个专业代理** - 用于委派的子代理（orchestrator、planner、code-reviewer、tdd-guide等）
- 🛠️ **13个技能** - 工作流定义和领域知识（编码标准、模式、测试）
- ⚡ **18个命令** - 用户调用的斜杠命令（/tdd、/plan、/e2e等）
- 🔄 **6个钩子** - 基于触发的自动化（会话持久化、前后工具钩子）
- 📜 **8个规则** - 始终遵循的指导原则（安全、编码风格、测试要求）
- 🎯 **Ralph循环** - 自主执行系统，突破上下文限制
- 🎭 **Orchestrator** - 多Agent编排系统，批量处理，质量闭环
- 💬 **交互引擎** - 可控、透明、可中断的执行体验
- ⚡ **上下文优化** - 三层加载架构，token 消耗降低 50%+

---

## 运行测试

```bash
# 运行所有测试
bash scripts/test/test-all.sh

# 运行单个测试
bash scripts/test/test-skills.sh
bash scripts/test/test-agents.sh
bash scripts/test/test-hooks.sh
```

---

## 语言优化协议 - Token 效率模式

**核心策略**: 中文输入 → 英文处理 → 智能输出

### 自动翻译规则

当检测到用户输入中文时：

1. **内部翻译**: 自动将中文翻译成英文进行内部处理
2. **英文思考**: 在英文状态下思考和推理（token 效率提升 40%+）
3. **技术术语保护**: 保留原文（tokens, agents, hooks, /hbe-plan 等）
4. **智能输出**: 根据内容类型选择中英文输出
   - 技术内容：英文输出
   - 交互反馈：中文输出
   - 代码/配置：保持原文

### 翻译示例

```
用户输入: "帮我审查代码"
内部处理: "Review the code"
思考过程: [英文推理，token 高效]
输出反馈: "✓ 代码审查完成"

用户输入: "创建一个用户认证功能"
内部处理: "Create user authentication feature"
思考过程: [英文推理]
输出反馈: [技术方案用英文，说明用中文]
```

### Token 节省效果

- 输入阶段: 中文 40 tokens → 英文 12 tokens (70% ↓)
- 思考阶段: 英文比中文高效 40%
- 输出阶段: 技术内容英文节省 30%

**总体节省**: 每次交互 40-50% tokens

### 术语对照表

| 中文 | 英文 | 保留 |
|------|------|------|
| 技能 | skill | - |
| 代理 | agent | - |
| 钩子 | hook | - |
| 命令 | command | - |
| 自主循环 | autonomous loop | - |
| 代码审查 | code review | - |
| 测试驱动 | TDD | ✓ |
| Ralph | Ralph | ✓ |
| tokens | tokens | ✓ |
| /hbe:* | /hbe:* | ✓ |

---

## 架构

项目由以下几个核心组件组成：

- **skills/agents/** - 专业子代理定义
- **skills/rules/** - 始终遵循的指导原则
- **scripts/hooks/** - 触发自动化脚本
- **scripts/ralph/** - Ralph自主执行系统
- **templates/** - 输出模板（PRD、handoff、progress）
- **docs/** - 详细文档（ADR、指南、API参考）
- **.claude/** - Claude Code配置（hooks、settings）
- **memory/** - 学习记忆（errors、successes、feedback）

**架构原则**：
- 分层加载（L0-L6）节省token
- 按需加载，避免重复
- 战略压缩，保持上下文纯净
- 闭环学习，持续改进

---

## 交互式执行引擎

HBE v2.4+ 引入交互式执行引擎，提供可控、透明的执行体验：

**交互模式**：
- **确认式** (Confirm-First): 关键操作前必须用户确认
- **问答式** (Q&A): 通过对话收集需求
- **渐进式** (Progressive): 信息逐步披露，避免过载
- **可恢复** (Resumable): 支持中断恢复，保存检查点

**用户指令**：
- `yes/no` - 确认/拒绝
- `continue/skip` - 继续/跳过
- `pause/stop` - 暂停执行
- `explain` - 详细解释
- `review <item>` - 查看详情
- `modify key=value` - 修改配置

**状态持久化**：
```json
// .interactive-state.json
{
  "sessionId": "20260502-143052",
  "task": "大型重构",
  "status": "paused",
  "completed": ["阶段1", "批次1"],
  "pending": ["批次2", "阶段3"]
}
```

详见：`docs/architecture/interactive-execution-engine.md`

---

## 上下文优化策略

HBE v2.4+ 采用三层加载架构，大幅减少 token 消耗：

**L0: 索引层** (~2KB)
- 文件: `SKILLS.md`
- 加载: 每次触发
- 内容: Skill 元数据、分类、触发关键词

**L1: 元数据层** (~500 tokens/skill)
- 加载: 选择 skill 后
- 内容: Skill frontmatter (YAML)

**L2: 完整层** (~4K tokens/skill)
- 加载: 执行 skill 时
- 内容: 完整工作流和示例

**优化效果**：
- 初始加载: 40K → 10K tokens (**75% ↓**)
- 会话平均: 100K → 50K tokens/轮 (**50% ↓**)
- Skill 切换: 15K → 4.5K tokens (**70% ↓**)

详见：`docs/CONTEXT-OPTIMIZATION.md`

---

## 关键命令

| 命令 | 功能 | 使用场景 |
|------|------|----------|
| `/hbe-plan` | 实现规划 | 新功能开发 |
| `/hbe-architect` | 架构设计 | 系统设计 |
| `/hbe-tdd` | TDD 开发 | 测试驱动开发 |
| `/hbe-review` | 代码审查 | 代码质量检查 |
| `/hbe-security` | 安全审查 | 安全漏洞扫描 |
| `/hbe-build-fix` | 构建修复 | 构建失败时 |
| `/hbe-e2e` | E2E 测试 | 端到端测试 |
| `/hbe-refactor` | 重构清理 | 死代码清理 |
| `/hbe-docs` | 文档更新 | 文档同步 |
| `/hbe-prd` | PRD 生成 | 需求文档 |
| `/hbe-verify` | 五阶段验证 | 完整验证循环 |
| `/hbe-orchestrate` | 多 Agent 编排 | 全流程开发 |
| `/hbe-ralph` | 自主循环 | 大型任务自动化 |
| `/hbe-checkpoint` | 进度快照 | 保存进度 |
| `/hbe-learn` | 模式学习 | 提取可复用模式 |

---

## 上下文智能优化规则

### 长对话处理

当对话轮次增加时，自动压缩上下文：

```
最近 3 轮: 完整保留
  - 用户输入和 AI 输出完整保留
  - 代码块完整保留
  - 决策过程完整保留

3-10 轮: 摘要关键决策
  - 保留关键决策和结果
  - 代码保留 diff 和最终版本
  - 移除中间探索过程

10+ 轮: 高层摘要
  - 只保留最终结论
  - 关键代码片段
  - 主要问题和解决方案
```

### 重复内容去除

自动检测和去重：
- 检测重复的代码块（只保留一次）
- 合并相似操作（总结为批量操作）
- 去重重复引用（相同文件只引用一次）
- 压缩重复模式（提取为模板）

### 代码处理优化

处理代码时：
- 优先显示 diff（变更部分）
- 移除冗余 import（未被使用的）
- 压缩重复模式（相似代码只保留一个示例）
- 只显示关键部分（省略样板代码）

### Token 预算分配

根据任务重要性分配 token：
```
P0 (关键任务): 50K tokens
  - 架构设计、安全审查、核心功能

P1 (重要任务): 30K tokens
  - 代码审查、重构、测试

P2 (普通任务): 15K tokens
  - 文档更新、小修复

P3 (辅助任务): 5K tokens
  - 查询、格式化
```

---

## 开发注意事项

### 包管理器检测

项目自动检测并支持以下包管理器：
- npm
- pnpm
- yarn
- bun

**配置方式**：
1. 环境变量：`CLAUDE_PACKAGE_MANAGER=pnpm`
2. 项目配置：在 `CLAUDE.md.local` 中指定
3. 自动检测：根据锁文件自动选择

### 跨平台支持

- **操作系统**：Windows、macOS、Linux
- **脚本语言**：Node.js（跨平台工具）
- **Shell脚本**：Bash（Unix-like）+ PowerShell（Windows）

### Agent 格式

Markdown with YAML frontmatter：
```yaml
---
name: agent-name
description: 简短描述
tools: [Read, Write, Edit, Bash]
model: claude-sonnet-4-6
---
```

### Skill 格式

Markdown with clear sections：
```markdown
# Skill Name

## When to Use
[何时使用]

## How It Works
[工作原理]

## Examples
[示例]
```

### 技能放置策略

- **核心技能**：`skills/active/` - 经过验证、跨项目通用
- **项目特定**：`~/.claude/skills/project-specific/` - 项目团队维护
- **自动生成**：`~/.claude/skills/generated/` - 由 `/hbe-learn` 生成

详见：`docs/SKILL-PLACEMENT-POLICY.md`

---

## 贡献指南

### 文件命名

- **Agent文件**：`lowercase-with-hyphens.md`（如 `python-reviewer.md`）
- **Skill文件**：`lowercase-with-hyphens.md`（如 `tdd-workflow.md`）
- **命令文件**：`lowercase-with-hyphens.md`

### 贡献流程

1. 遵循 `CONTRIBUTING.md` 中的格式规范
2. 为新功能添加 ADR（架构决策记录）
3. 确保所有测试通过
4. 更新相关文档

### ADR 流程

重要决策需要记录在 `docs/adr/` 中：
```bash
# 创建新的 ADR
cp docs/adr/0000-template.md docs/adr/0001-your-decision.md
# 编辑并提交
```

---

## 百分百触发机制

### 自动触发条件（满足任一即触发 HBE）

1. **命令触发**: 用户输入 `/hbe:*` 任意命令
2. **关键词触发**: 用户提到以下任一关键词
   - `hbe` / `hermes` / `hermes-by-everythings`
   - `自主编码` / `autonomous coding`
   - `ralph` / `ralph 循环`
   - `全流程开发` / `full workflow`
   - `tdd` / `test-driven development`
   - `代码审查` / `code review`
   - `安全审查` / `security review`
3. **文件触发**: 编辑以下类型文件时自动建议相关命令
   - `.ts/.tsx` → 建议类型检查 + 测试
   - `.py` → 建议类型检查 + lint
   - 测试文件 → 建议运行测试
   - `package.json`/`Cargo.toml`/`go.mod` → 建议依赖审查
4. **Git 触发**:
   - `git commit` 前 → 建议代码审查
   - `git push` 前 → 建议完整验证
   - PR 创建 → 建议安全审查
5. **失败触发**:
   - 构建失败 → 自动触发 `/hbe-build-fix`
   - 测试失败 → 自动触发 `/hbe-tdd`
   - 类型检查失败 → 自动修复建议

### 触发后的行为流程

```
触发检测
    ↓
环境感知 (pwd, git status, git log)
    ↓
需求分析 (用户意图 + 项目状态)
    ↓
Agent 加载 (按需加载相关 Agent prompt)
    ↓
执行流程 (五步法: Analyze → Plan → Execute → Verify → Report)
    ↓
学习闭环 (提取模式 → 更新 skill → 记录 memory)
    ↓
Handoff/输出 (生成交接文档或结果报告)
```

---

## 闭环学习机制

### 学习触发时机

1. **会话结束时**: 自动调用 `/hbe-learn` 提取模式
2. **每次迭代后**: Ralph 循环中每个 story 完成后
3. **错误修复后**: 提取错误模式和解决方案
4. **用户反馈后**: 记录用户校正和偏好
5. **项目变更后**: 检测到新框架/模式时更新

### 学习内容分类

| 类型 | 存储位置 | 触发条件 |
|------|----------|----------|
| 项目特定模式 | `MEMORY.md` | 项目首次使用时 |
| 用户偏好 | `memory/feedback/` | 用户确认/校正时 |
| 错误模式 | `memory/errors/` | 错误修复后 |
| 成功模式 | `memory/successes/` | 成功案例复用时 |
| 平台适配 | `memory/platform/` | 跨平台差异发现时 |

### 自动更新机制

```python
# 伪代码：学习闭环逻辑
def learning_loop():
    # 1. 检测变化
    changes = detect_session_changes()

    # 2. 提取模式
    patterns = extract_patterns(changes)

    # 3. 验证有效性
    valid_patterns = validate_patterns(patterns)

    # 4. 更新 knowledge base
    for pattern in valid_patterns:
        if pattern.type == 'project':
            update_MEMORY(pattern)
        elif pattern.type == 'skill':
            generate_or_update_skill(pattern)
        elif pattern.type == 'memory':
            store_memory(pattern)

    # 5. 优化触发器
    optimize_triggers(valid_patterns)

    # 6. 压缩上下文
    if context_size > threshold:
        strategic_compact()
```

---

## 上下文管理策略

### 分层加载（节省 token）

| 层级 | 内容 | 大小 | 加载时机 |
|------|------|------|----------|
| L0 | CLAUDE.md (本文件) | ~2KB | **每次会话自动加载** |
| L1 | SKILLS.md 路由表 | ~5KB | 触发 /hbe:* 时 |
| L2 | Agent prompts | 3-8KB/个 | 按需加载 |
| L3 | Rules | 2-5KB/个 | 按需加载 |
| L4 | Templates | 1-3KB/个 | 生成输出时 |
| L5 | 项目特定上下文 | 动态 | 首次访问项目时 |

### 战略压缩触发条件

- 上下文 > 100k tokens
- 会话轮次 > 20
- 检测到重复信息

压缩策略：
1. 保留 CLAUDE.md（核心上下文）
2. 压缩已完成的 Agent handoffs
3. 提取关键发现到 summary
4. 移除冗余代码示例

### 上下文纯净性维护

**避免上下文污染**:
- 不加载整个 SKILLS.md，只加载相关部分
- 不重复加载已读取的文件
- 使用 hash 检测文件变化，避免重复读取
- 及时清理过时的临时文件

**保持上下文相关**:
- 只加载当前阶段需要的 Agent
- 只引用修改过的文件，而非整个代码库
- 使用 diff 而非完整文件内容
- 按需展开，而非全部展开

---

## Ralph 自主循环增强

### 智能启动条件

Ralph 自动启动的条件：
1. 存在 `prd.json` 且有未完成的 story
2. 用户明确输入 `/hbe-ralph`
3. 检测到大型任务（>5 个相关文件变更）
4. 用户输入"自主完成"/"自动实现"等关键词

### 自主中断恢复

```bash
# Ralph 运行时生成的状态文件
.ralph-state.json     # 当前执行状态
.ralph-checkpoint.json # 最近检查点
.ralph-log.jsonl      # 详细日志

# 中断后恢复
# 自动检测 .ralph-state.json
# 从最后一个 checkpoint 恢复
# 跳过已完成的 story
```

### 进度可视化

```bash
# 实时进度追踪
/hbe-ralph-status

# 输出格式
[████████████████████░░░░] 80% (12/15 stories)

当前: #13 实现用户权限验证
下一个: #14 添加缓存层
剩余: 3 stories
预估: 15 分钟
```

---

## 多平台适配

### 平台检测

```bash
# 自动检测运行平台
if command_exists hermes; then
    PLATFORM=hermes
elif command_exists claude; then
    PLATFORM=claude-code
elif command_exists opencode; then
    PLATFORM=opencode
else
    PLATFORM=unknown
fi
```

### 能力映射

| 功能 | Hermes | Claude Code | OpenCode | OpenClaw |
|------|--------|-------------|----------|----------|
| 加载 Agent | `skill_view()` | `Read` | `read_file` | `read_file` |
| 并行执行 | `delegate_task()` | `Agent[并行]` | `parallel` | `parallel` |
| 文件操作 | `read/write_file` | `Read/Write/Edit` | file tools | file tools |
| Hooks | `hooks.json` | `settings.json` | config | config |

---

## 项目特定规则覆盖

项目可以在根目录创建 `CLAUDE.md.local` 来覆盖默认规则：

```markdown
# 项目特定覆盖

## 禁用的规则
- 禁用 prettier 格式化
- 禁用 TypeScript strict 模式

## 启用的增强
- 启用 Python type hints 检查
- 启用 Rust clippy strict

## 自定义命令
- `/hbe:custom` → 运行项目特定脚本

## 项目特定模式
- 使用 SQLAlchemy 而非 Django ORM
- 使用 Pydantic v2 而非 v1
```

---

## 自我更新机制

### Skill 自动更新

当满足以下条件时，HBE 自动更新自身的 skill 文件：

1. **检测到更优模式**: 连续 3 次使用新模式成功
2. **用户明确确认**: 用户说"保持这个方式"/"记住这个"
3. **错误模式修正**: 修正错误后，将解决方案固化为 skill

### 更新流程

```bash
# 1. 提取候选模式
/hbe-learn --extract

# 2. 验证模式有效性
/hbe-learn --validate

# 3. 生成/更新 skill
/hbe-learn --apply

# 4. 记录变更
git add skills/
git commit -m "feat: auto-learn [pattern-name]"
```

### 版本管理

```bash
# skill 版本追踪
skills/
├── version.json          # 当前版本
├── changelog.md          # 变更日志
└── history/              # 历史版本
    ├── v1.0.0/
    ├── v1.1.0/
    └── v2.0.0/
```

---

## 紧急恢复机制

### 当系统失效时

```bash
# 1. 诊断问题
/hbe:diagnose

# 2. 重置状态
/hbe:reset --soft   # 保留 progress.md
/hbe:reset --hard   # 完全重置

# 3. 恢复检查点
/hbe:restore --checkpoint=[checkpoint-id]

# 4. 验证系统
/hbe-verify --system
```

### 回滚机制

```bash
# 回滚到上一个稳定状态
git diff HEAD~1 SKILLS.md
git checkout HEAD~1 -- skills/
```

---

## 监控和日志

### 关键指标

- **触发成功率**: 触发 HBE / 符合触发条件次数
- **闭环完成率**: 完成学习闭环 / 触发学习次数
- **自主迭代成功率**: Ralph 成功迭代 / 总迭代次数
- **Token 效率**: 实际使用 / 预估 token

### 日志位置

```
~/.hbe/logs/
├── trigger.log          # 触发日志
├── learning.log         # 学习日志
├── ralph.log           # Ralph 运行日志
└── performance.log     # 性能日志
```

---

## 快速命令参考

| 命令 | 功能 | 使用场景 |
|------|------|----------|
| `/hbe-plan` | 实现规划 | 新功能开发 |
| `/hbe-architect` | 架构设计 | 系统设计 |
| `/hbe-tdd` | TDD 开发 | 测试驱动开发 |
| `/hbe-review` | 代码审查 | 代码质量检查 |
| `/hbe-security` | 安全审查 | 安全漏洞扫描 |
| `/hbe-build-fix` | 构建修复 | 构建失败时 |
| `/hbe-e2e` | E2E 测试 | 端到端测试 |
| `/hbe-refactor` | 重构清理 | 死代码清理 |
| `/hbe-docs` | 文档更新 | 文档同步 |
| `/hbe-prd` | PRD 生成 | 需求文档 |
| `/hbe-verify` | 五阶段验证 | 完整验证循环 |
| `/hbe-orchestrate` | 多 Agent 编排 | 全流程开发 |
| `/hbe-ralph` | 自主循环 | 大型任务自动化 |
| `/hbe-checkpoint` | 进度快照 | 保存进度 |
| `/hbe-learn` | 模式学习 | 提取可复用模式 |
| `/hbe-eval` | 评估驱动 | 能力评估 |

---

## 技能

使用相关文件时应用以下技能：

| 文件 | 技能 | 说明 |
|------|------|------|
| `README.md` | `/hbe-docs` | 文档更新技能 |
| `.github/workflows/*.yml` | `/hbe-verify` | CI/CD 验证 |
| `package.json` | `/hbe-security` | 依赖安全审查 |
| `**/test/*.spec.ts` | `/hbe-tdd` | TDD 测试开发 |
| `**/*.test.ts` | `/hbe-tdd` | TDD 测试开发 |
| `prd.json` | `/hbe-ralph` | Ralph 自主循环 |

** spawning 子代理时**，始终将相应技能的约定传递到代理的提示中。

---

## 下一步

1. **首次使用**: 运行 `/hbe-verify --system` 验证安装
2. **配置项目**: 创建项目特定的 `CLAUDE.md.local`
3. **开始使用**: 输入 `/hbe-plan [你的需求]` 开始
4. **监控学习**: 定期检查 `MEMORY.md` 和 `memory/` 目录

---

**最后更新**: 2026-05-02
**维护者**: HBE 自主维护系统
**版本**: 2.1.0
