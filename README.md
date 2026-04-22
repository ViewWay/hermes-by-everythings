# Hermes by Everything's — 终极编码增强套件

整合 [everything-claude-code](https://github.com/affaan-m/everything-claude-code) 和 [ralph](https://github.com/snarktank/ralph) 的最佳能力，
打造 [Hermes Agent](https://github.com/nicepkg/hermes) 平台上的终极编码工作流。

[灵感来源](https://github.com/hellangleZ/burn-in-cceverywhere-ralph) | [English](#english)

---

<a name="中文"></a>

## 功能概览

### 🤖 Agents（9 个专业代理）

| 代理 | 命令 | 说明 |
|------|------|------|
| planner | `/hbe:plan` | 功能实现规划 |
| architect | `/hbe:architect` | 系统架构设计 |
| code-reviewer | `/hbe:review` | 代码质量审查 |
| security-reviewer | `/hbe:security` | 安全漏洞分析 |
| tdd-guide | `/hbe:tdd` | TDD 开发指导 |
| build-error-resolver | `/hbe:build-fix` | 构建错误修复 |
| e2e-runner | `/hbe:e2e` | E2E 测试执行 |
| refactor-cleaner | `/hbe:refactor` | 死代码清理 |
| doc-updater | `/hbe:docs` | 文档自动更新 |

### 🛠️ Skills（13 个技能）

| 技能 | 说明 |
|------|------|
| prd | PRD 需求文档生成 |
| ralph | PRD 转 prd.json + 自主执行循环 |
| tdd-workflow | TDD 红-绿-重构工作流 |
| coding-standards | 编码标准 |
| backend-patterns | 后端模式 |
| frontend-patterns | 前端模式 |
| security-review | 安全审查清单 |
| continuous-learning | 会话模式提取自动生成 skill |
| strategic-compact | 上下文战略压缩提示 |
| verification-loop | 五阶段验证循环 |
| eval-harness | 评估驱动开发 |
| project-guidelines | 项目特定规范 |
| orchestration | 多 Agent 编排 |

### ⚡ Commands（15 个快捷命令）

| 命令 | 说明 |
|------|------|
| `/hbe:plan` | 实现规划 |
| `/hbe:architect` | 架构设计 |
| `/hbe:tdd` | TDD 开发流程 |
| `/hbe:review` | 代码审查 |
| `/hbe:security` | 安全审查 |
| `/hbe:build-fix` | 构建修复 |
| `/hbe:e2e` | E2E 测试生成 |
| `/hbe:refactor` | 重构清理 |
| `/hbe:docs` | 文档/Codemap 更新 |
| `/hbe:prd` | PRD 生成 |
| `/hbe:verify` | 五阶段验证 |
| `/hbe:orchestrate` | 多 Agent 流水线 |
| `/hbe:ralph` | 自主执行循环 |
| `/hbe:checkpoint` | 保存进度快照 |
| `/hbe:learn` | 模式学习提取 |

### 📜 Rules（8 个规则文件）

| 规则 | 何时生效 |
|------|----------|
| security.md | 涉及密钥/用户输入/API |
| coding-style.md | 编写代码时 |
| testing.md | 写测试时 |
| git-workflow.md | git 操作时 |
| agent-orchestration.md | 多Agent协作时 |
| performance.md | 性能优化时 |
| patterns.md | 架构设计时 |
| hooks.md | Hook 触发时 |

### 🔄 Ralph 自主循环

突破上下文限制，自动完成大型任务：

- 每次迭代 = 全新上下文起点
- 记忆通过文件持久化（prd.json, progress.md, git history）
- 完全自主执行，无需人工干预
- 后台运行，实时查看进度

### 🔗 Hooks（自动化）

| Hook | 触发时机 | 行为 |
|------|----------|------|
| TypeScript 检查 | 编辑 .ts/.tsx 后 | 实时类型检查 |
| Prettier 格式化 | 编辑代码文件后 | 自动格式化 |
| console.log 警告 | 提交前 | 检测遗留调试语句 |
| PR 创建提示 | gh pr create 后 | 输出 PR URL + review 命令 |
| Git push 提醒 | git push 前 | 提示 review 变更 |

---

## 安装

### 方式一：作为 Hermes Skill 安装（推荐）

```bash
# 克隆到 Hermes skills 目录
cd ~/.hermes/skills
git clone https://github.com/ViewWay/hermes-by-everythings.git devops/hermes-by-everythings

# 验证安装
# 在 Hermes 中输入: /hbe:plan 测试
```

### 方式二：手动安装

```bash
git clone https://github.com/ViewWay/hermes-by-everythings.git
# 将整个目录复制到 ~/.hermes/skills/devops/hermes-by-everythings/
```

---

## 使用

### 单阶段按需使用

```
/hbe:plan 实现用户认证功能
/hbe:review 检查最近改动
/hbe:security 扫描安全漏洞
```

### 预设工作流

```
/hbe:orchestrate feature 实现新的API端点
/hbe:orchestrate bugfix 修复登录页白屏问题
/hbe:orchestrate refactor 重构数据库层
/hbe:orchestrate security 全面安全审查
/hbe:orchestrate full 完整功能开发流程
```

### Ralph 自主循环

```
/hbe:prd 实现完整的用户管理模块
/hbe:ralph
```

Ralph 会自动：
1. 读取 prd.json
2. 逐个完成用户故事
3. 每个故事都经过 TDD + 验证
4. 自动提交
5. 更新进度

### 验证循环

```
/hbe:verify
```

自动执行五阶段验证：Build → Type Check → Lint → Test → Security

---

## 目录结构

```
hermes-by-everythings/
├── SKILL.md                          # 主入口（命令路由 + 全流程定义）
├── README.md                         # 本文件
├── references/
│   ├── agents/                       # 9 个专业代理
│   │   ├── planner.md
│   │   ├── architect.md
│   │   ├── code-reviewer.md
│   │   ├── security-reviewer.md
│   │   ├── tdd-guide.md
│   │   ├── build-error-resolver.md
│   │   ├── e2e-runner.md
│   │   ├── refactor-cleaner.md
│   │   └── doc-updater.md
│   ├── rules/                        # 8 个规则文件
│   │   ├── security.md
│   │   ├── coding-style.md
│   │   ├── testing.md
│   │   ├── git-workflow.md
│   │   ├── agent-orchestration.md
│   │   ├── performance.md
│   │   ├── patterns.md
│   │   └── hooks.md
│   └── orchestration.md              # 多Agent编排流程
├── templates/                        # 输出模板
│   ├── prd-json.json                 # PRD JSON 格式
│   ├── handoff.md                    # Agent 交接文档
│   └── progress.md                   # 进度追踪模板
└── scripts/                          # 辅助脚本
    └── verify-loop.sh                # 五阶段验证循环
```

### Ralph 运行时生成的文件（在项目根目录）

```
项目根目录/
├── prd.json              # 用户故事列表（任务清单）
├── progress.md           # 迭代学习记录
├── .ralph-stats.json     # 运行统计（tokens, 耗时）
├── logs/                 # 迭代详细日志
│   ├── index.txt         # 日志索引
│   └── iteration-N.jsonl # 第 N 次迭代日志
└── tasks/                # PRD 临时文件
```

---

## 与原版 Claude Code 增强套件的差异

| 特性 | Claude Code 原版 | Hermes 版 |
|------|------------------|-----------|
| 运行平台 | Claude Code CLI | Hermes Agent |
| 多Agent并行 | 不支持（串行） | 支持（delegate_task） |
| 持久化记忆 | 文件传递 | memory + 文件 |
| 动态技能 | 静态 .md 文件 | skill_manage 运行时创建 |
| 定时任务 | 不支持 | cronjob 定时触发 Ralph |
| 任务追踪 | progress.txt | todo() + progress.md |
| 浏览器测试 | 需要 MCP | 内置 browser |
| 视觉分析 | 不支持 | vision_analyze |
| 多平台通知 | 不支持 | 微信/Telegram/飞书/Discord |
| 安装方式 | install.sh | git clone 到 skills 目录 |

---

## Token 消耗预估

| 模式 | 预估 tokens |
|------|-------------|
| 单命令（如 /hbe:plan） | 5-15k input + 2-5k output |
| 三阶段流水线 | 30-50k total |
| Ralph 1 次迭代 | 20-40k |
| Ralph 全流程（10 次） | 200-400k |
| 完整 feature 工作流 | 50-80k |
| 安全审查 + 修复 | 15-30k |

---

## 参考资源

- 灵感来源: [burn-in-cceverywhere-ralph](https://github.com/hellangleZ/burn-in-cceverywhere-ralph)
- 原始 Ralph: [ralph](https://github.com/snarktank/ralph)
- everything-claude-code: [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- Hermes Agent: [Hermes](https://github.com/nicepkg/hermes)

---

## License

MIT
