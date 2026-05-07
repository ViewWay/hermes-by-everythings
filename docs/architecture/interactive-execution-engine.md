# Interactive Execution Engine — 交互式执行引擎

> **版本**: 1.0.0
> **目标**: 增强 skill 运行时交互能力，提供可控、透明、可中断的执行体验

---

## 核心理念

**传统问题**：
- Agent 执行是"黑盒"，用户无法中途干预
- 长时间运行无反馈，用户焦虑
- 错误决策无法及时纠正
- 无法暂停/恢复复杂任务

**交互式引擎解决方案**：
- ✅ 透明化执行过程
- ✅ 关键决策点确认
- ✅ 实时进度反馈
- ✅ 中断恢复能力
- ✅ 渐进式信息披露

---

## 交互模式

### 1. 确认式 (Confirm-First)

```yaml
mode: confirm
description: 关键操作前必须用户确认
triggers:
  - 文件删除
  - Git 推送
  - 依赖安装
  - 数据库迁移
```

**示例流程**：
```
Agent: 检测到 15 个未使用的依赖，建议删除：
       - lodash ( unused: true, size: 72KB )
       - moment ( unused: true, size: 78KB )
       ...

User: > review lodash, moment

Agent: lodash 分析：
       - 引用次数: 0
       - 依赖树: 无其他包依赖
       - 建议: ✓ 可安全删除

       moment 分析：
       - 引用次数: 0
       - 依赖树: 3 个包间接依赖
       - 建议: ⚠ 需要先迁移间接依赖

User: > remove lodash, keep moment

Agent: ✓ 已删除 lodash
       → package.json 更新
       → package-lock.json 更新
       → 节省 72KB
```

### 2. 问答式 (Q&A)

```yaml
mode: qa
description: 通过对话收集需求，而非一次性要求
triggers:
  - 新功能开发
  - 架构设计
  - 技术栈选型
```

**示例流程**：
```
Agent: 我需要了解这个新功能的几个关键信息：

       1. 【必需】目标用户是谁？
       2. 【必需】核心价值是什么？
       3. 【可选】有性能要求吗？
       4. 【可选】需要兼容哪些平台？

User: 目标用户是开发者，核心价值是提高编码效率

Agent: 明白了！为开发者提升编码效率。

       接下来：
       3. 【可选】有性能要求吗？
       4. 【可选】需要兼容哪些平台？

User: 跳过其他问题，直接开始

Agent: ✓ 收集到核心需求
       → 使用默认值：性能要求=标准，平台=Web
       → 开始设计...
```

### 3. 渐进式 (Progressive)

```yaml
mode: progressive
description: 信息逐步披露，避免初始过载
triggers:
  - 复杂任务分解
  - 长文档阅读
  - 大规模重构
```

**示例流程**：
```
Agent: 检测到大型重构任务，涉及 47 个文件

       阶段 1/5: 依赖分析（当前）
       阶段 2/5: 安全验证
       阶段 3/5: 重构规划
       阶段 4/5: 分批执行
       阶段 5/5: 验证测试

       【当前】阶段 1/5: 依赖分析
       → 找到 12 个依赖关系
       → 识别 3 个循环依赖
       → 发现 2 个孤立模块

User: 继续

Agent: 【完成】阶段 1/5

       【下一步】阶段 2/5: 安全验证
       → 检查测试覆盖
       → 验证类型安全

User: 跳到阶段 4

Agent: 【跳过】阶段 2-3

       【当前】阶段 4/5: 分批执行
       批次 1/3: 核心逻辑（5 文件）
       批次 2/3: 工具函数（8 文件）
       批次 3/3: 类型定义（4 文件）

User: 执行批次 1

Agent: ✓ 批次 1 完成 (5/5 文件)
       → 无错误
       → 3 个警告（已记录）

User: 继续

Agent: ✓ 批次 2 完成 (8/8 文件)
       → 无错误

       【下一步】批次 3/3
User: > stop

Agent: ⚠ 执行已暂停
       → 状态已保存到 .interactive-state.json
       → 可用 /resume 继续
```

### 4. 中断恢复 (Interrupt & Resume)

```yaml
mode: resumable
description: 保存执行状态，支持随时中断和恢复
triggers:
  - 所有长时间运行的任务
```

**状态持久化**：
```json
// .interactive-state.json
{
  "sessionId": "20260502-143052",
  "task": "大型重构",
  "completed": ["阶段1", "阶段2", "批次1", "批次2"],
  "current": "批次3",
  "pending": ["批次3", "阶段5"],
  "context": {
    "filesProcessed": 13,
    "filesRemaining": 4,
    "errors": [],
    "warnings": [
      "src/utils/helper.ts:45 - 未使用的导入"
    ]
  },
  "checkpoint": "2026-05-02T14:35:12Z"
}
```

**恢复命令**：
```bash
# 自动恢复
/hbe-resume

# 从指定阶段恢复
/hbe-resume --stage=批次3

# 查看所有可恢复的会话
/hbe-resume --list
```

---

## 交互指令集

### 用户侧指令

| 指令 | 功能 | 示例 |
|------|------|------|
| `yes` / `y` | 确认继续 | `> yes` |
| `no` / `n` | 拒绝/取消 | `> no` |
| `skip` | 跳过当前步骤 | `> skip` |
| `continue` / `c` | 继续下一步 | `> continue` |
| `pause` / `stop` | 暂停执行 | `> pause` |
| `explain` | 详细解释当前步骤 | `> explain` |
| `review <item>` | 查看详细信息 | `> review lodash` |
| `modify <key>=<value>` | 修改配置 | `> modify timeout=5000` |
| `undo` | 撤销上一步 | `> undo` |
| `help` | 显示可用指令 | `> help` |

### Agent 侧指令

| 指令 | 功能 | 示例 |
|------|------|------|
| `ASK <question>` | 向用户提问 | `ASK: 选择测试框架？` |
| `CONFIRM <action>` | 请求确认 | `CONFIRM: 删除 10 个文件` |
| `INFO <message>` | 显示进度信息 | `INFO: 处理中 5/10` |
| `WARN <message>` | 警告信息 | `WARN: 检测到风险` |
| `ERROR <message>` | 错误信息 | `ERROR: 构建失败` |
| `SELECT <options>` | 提供选项 | `SELECT: [A] Jest [B] Vitest` |
| `PROGRESS <current>/<total>` | 进度条 | `PROGRESS: 50%` |

---

## 交互协议

### 协议格式

```yaml
# Agent 发送
type: question
id: q1
question: "选择测试框架"
options:
  - key: "A"
    label: "Jest"
    description: "成熟稳定，社区大"
  - key: "B"
    label: "Vitest"
    description: "快速，现代"
default: "A"
required: true

# 用户回复
type: answer
question_id: q1
answer: "B"
reason: "项目使用 Vite，集成更好"
```

### 交互示例

**场景：技术栈选型**

```yaml
# Agent: ASK
type: question
id: tech-stack
question: "选择前端框架"
options:
  - key: "react"
    label: "React"
    pros: ["生态丰富", "就业机会多"]
    cons: ["学习曲线陡"]
    score: 85
  - key: "vue"
    label: "Vue"
    pros: ["易学", "性能好"]
    cons: ["生态较小"]
    score: 80
  - key: "svelte"
    label: "Svelte"
    pros: ["编译时优化", "代码少"]
    cons: ["新框架，生态小"]
    score: 70
default: "react"
required: true

# User: > vue
# 因为团队更熟悉 Vue，能快速开发

# Agent: ACK
type: acknowledge
question_id: tech-stack
answer: "vue"
reason: "团队更熟悉 Vue，能快速开发"
next_steps:
  - "选择 UI 库"
  - "配置状态管理"
  - "设置路由"
```

---

## Hook 集成

### 在 settings.json 中配置

```json
{
  "hooks": {
    "pre:agent:execution": [
      {
        "name": "interactive-start",
        "command": "bash scripts/interactive/start-session.sh",
        "description": "启动交互式会话"
      }
    ],
    "post:agent:step": [
      {
        "name": "interactive-checkpoint",
        "command": "bash scripts/interactive/save-checkpoint.sh",
        "description": "保存检查点"
      }
    ],
    "on:user:interrupt": [
      {
        "name": "interactive-pause",
        "command": "bash scripts/interactive/pause-session.sh",
        "description": "暂停并保存状态"
      }
    ]
  }
}
```

---

## 实现接口

### Skill 定义接口

```markdown
## Interactive Config

```yaml
interaction:
  mode: progressive  # confirm | qa | progressive | resumable
  checkpoints:
    - "after-analysis"
    - "after-planning"
    - "after-each-file"
  confirm_required:
    - "file-delete"
    - "git-push"
    - "dependency-install"
  questions:
    - id: "tech-stack"
      prompt: "选择技术栈"
      type: "select"
      options: ["react", "vue", "svelte"]
      default: "react"
```
```

### Agent 调用接口

```javascript
// 伪代码：交互式 Agent 执行
async function executeInteractiveAgent(agent, task) {
  const session = createSession();

  try {
    // 1. 初始分析
    const analysis = await agent.analyze(task);
    await confirmIfRequired(analysis, "analysis");

    // 2. 规划分解
    const plan = await agent.plan(analysis);
    const approvedPlan = await reviewPlan(plan);

    // 3. 分步执行
    for (const step of approvedPlan.steps) {
      session.checkpoint();

      const shouldContinue = await confirmStep(step);
      if (!shouldContinue) break;

      await agent.execute(step);
      session.markComplete(step);
    }

    return session.summary();
  } catch (error) {
    await session.pause(error);
    throw error;
  }
}
```

---

## 最佳实践

### ✅ DO

1. **默认渐进式披露**：不要一次性展示所有信息
2. **关键操作必确认**：删除、推送、迁移等需明确同意
3. **保存所有检查点**：随时可以恢复
4. **提供足够上下文**：让用户做出明智决策
5. **支持快捷指令**：`y`/`n`/`c` 等快速响应

### ❌ DON'T

1. **不要隐藏关键信息**：风险、副作用必须明确
2. **不要过度确认**：琐碎操作不要打扰用户
3. **不要无限循环**：问答必须有明确终点
4. **不要丢失状态**：中断后必须能恢复
5. **不要强制交互**：提供 `--yes` 跳过选项

---

## 示例：完整的交互流程

```bash
# 用户触发
/hbe-refactor --interactive

# Agent: 分析
INFO: 正在分析代码库...
      找到 23 个可重构点
      预计耗时: ~5 分钟

# Agent: 确认
CONFIRM: 开始重构？
  - 删除未使用代码: 8 文件
  - 合并重复函数: 5 文件
  - 优化类型定义: 10 文件

User: > review 合并重复函数

# Agent: 详情
INFO: 重复函数分析：
  src/utils/format.ts:
    - formatDate() 重复 3 次
    - formatTime() 重复 2 次
  src/helpers/validator.ts:
    - isValidEmail() 重复 4 次

  建议：创建共享模块

User: > yes, 先处理 formatDate 和 formatTime

# Agent: 执行
PROGRESS: [███░░░░░░] 30% (2/5 files)
INFO: ✓ 创建 src/utils/date.ts
INFO: ✓ 更新 3 个引用
WARN: src/components/Header.ts:15 - 手动检查导入

PROGRESS: [██████░░░░] 60% (3/5 files)
INFO: ✓ 创建 src/utils/time.ts
INFO: ✓ 更新 2 个引用

User: > pause

# Agent: 暂停
⚠ 执行已暂停
→ 已完成: 2/5 文件
→ 待处理: 3/5 文件
→ 状态保存: .interactive-state.json
→ 恢复命令: /hbe-resume
```

---

## 性能考虑

### 交互开销

| 模式 | 额外时间 | 适用场景 |
|------|----------|----------|
| **无交互** | 0x | CI/CD、批量操作 |
| **渐进式** | 1.2x | 长时间任务 |
| **确认式** | 1.5x | 关键操作 |
| **问答式** | 2x | 需求不明确时 |

### 优化策略

1. **缓存交互结果**：相同问题不再重复问
2. **智能默认值**：基于历史记录推荐
3. **批量确认**：一组相似操作一次确认
4. **预测性加载**：后台准备下一步选项

---

## 故障处理

### 交互超时

```yaml
timeout:
  default: 300  # 5 分钟
  confirm: 60   # 1 分钟
  review: 120   # 2 分钟

on_timeout:
  action: "pause"  # pause | continue_default | abort
  save_state: true
  notify: true
```

### 无效输入

```yaml
invalid_input:
  retry: 3
  help_hint: true
  fallback_to_default: false
```

---

## 扩展性

### 自定义交互模式

```javascript
// 扩展新的交互模式
class CodeReviewInteraction extends InteractionMode {
  async execute() {
    const diff = await this.getDiff();
    const review = await this.requestReview(diff);
    const changes = await this.suggestChanges(review);
    return this.applyChanges(changes);
  }
}
```

### 插件系统

```yaml
plugins:
  - name: "slack-notification"
    on: ["checkpoint", "completion"]
    config:
      webhook: "${SLACK_WEBHOOK}"
  - name: "progress-bar"
    on: ["step", "progress"]
    config:
      style: "percentage"
```

---

**维护者**: HBE 交互引擎团队
**版本**: 1.0.0
**最后更新**: 2026-05-02
