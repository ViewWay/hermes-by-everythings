# 多 Agent 编排流程

## 工作流定义

### feature — 完整功能开发

```
planner → tdd-guide → code-reviewer → security-reviewer
   |           |            |               |
   v           v            v               v
 [计划]    [实现+测试]   [代码审查]     [安全审查]
```

每个阶段的输出作为下一阶段的输入（handoff 文档）。

### bugfix — Bug 调查修复

```
build-error-resolver → tdd-guide → code-reviewer
        |                  |            |
        v                  v            v
    [定位错误]        [修复+测试]   [审查]
```

### refactor — 安全重构

```
architect → code-reviewer → refactor-cleaner → tdd-guide
     |           |               |               |
     v           v               v               v
  [重构方案]  [审查现有代码]  [清理死代码]   [回归测试]
```

### security — 安全审查

```
security-reviewer → code-reviewer → architect
        |               |              |
        v               v              v
   [漏洞扫描]      [代码审查]     [架构建议]
```

### full — 完整开发流程

```
planner → architect → tdd-guide → code-reviewer → security-reviewer → doc-updater
   |          |          |             |                |               |
   v          v          v             v                v               v
 [规划]    [设计]    [实现+测试]   [代码审查]       [安全审查]      [文档更新]
```

## 编排执行细节

### 阶段间 Handoff

每个 Agent 完成后必须生成 handoff 文档：

```markdown
## HANDOFF: SOURCE-AGENT -> TARGET-AGENT

### 上下文
[上一步的摘要]

### 发现
[关键发现：新知识、模式、风险]

### 修改的文件
- path/to/file1 (created/modified/deleted)
- path/to/file2 (modified)

### 开放问题
[未解决的问题或决策]

### 建议下一步
[对下一个 Agent 的建议]
```

### 错误处理

```
IF 任一 Agent 失败:
  1. 停止后续阶段
  2. 保留已完成的阶段结果
  3. 生成部分报告
  4. 记录失败点和错误信息
  5. 提供修复建议
  6. 等待用户决定是否继续
```

### 聚合报告

全部阶段完成后，生成聚合报告：

```markdown
# 编排报告: [工作流类型]

## 执行概览
| 阶段 | Agent | 状态 | 耗时 |
|------|-------|------|------|
| 1 | planner | PASS | 30s |
| 2 | tdd-guide | PASS | 5min |
| 3 | code-reviewer | PASS | 1min |
| 4 | security-reviewer | PASS | 45s |

## 总结发现
[所有 Agent 的关键发现汇总]

## 修改文件汇总
[所有阶段修改的文件去重列表]

## 遗留问题
[所有 Agent 报告的开放问题汇总]

## 建议后续操作
[基于结果的下一步建议]
```

## Hermes 实现

在 Hermes 中，编排通过以下方式实现：

### 方式 1: 本地串行（推荐）
单个会话内依次加载各 Agent prompt 并执行。
适合大多数场景，共享上下文。

### 方式 2: 子代理并行
使用 `delegate_task(tasks=[...])` 并行执行独立 Agent。
适合独立任务（如同时做安全审查 + 性能审查）。

### 方式 3: Ralph 自主循环
使用 `/hbe:ralph` 进入完全自主模式。
适合大型任务，自动迭代直到完成。
