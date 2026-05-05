# 代理编排规则

## 可用代理

| 代理 | 用途 | 何时使用 |
|------|------|----------|
| planner | 实现规划 | 复杂功能、重构 |
| architect | 系统设计 | 架构决策 |
| tdd-guide | TDD 开发 | 新功能、Bug 修复 |
| code-reviewer | 代码审查 | 写完代码后 |
| security-reviewer | 安全分析 | 提交前 |
| build-error-resolver | 构建修复 | 构建失败时 |
| e2e-runner | E2E 测试 | 关键用户流程 |
| refactor-cleaner | 死代码清理 | 代码维护 |
| doc-updater | 文档更新 | 更新文档时 |

## 代理使用原则

1. **自动激活** — 无需用户指定，根据上下文自动选择
   - 复杂功能请求 → planner
   - 写完代码 → code-reviewer
   - Bug 修复或新功能 → tdd-guide
   - 架构决策 → architect

2. **并行执行** — 独立操作必须并行
   - 安全分析 + 性能审查 + 类型检查
   - 多文件 code review

3. **串行执行** — 有依赖的操作按序执行
   - plan → implement → review
   - fix → test → commit

## 代理间通信

### Handoff 文档格式
```markdown
## HANDOFF: SOURCE -> TARGET

### 上下文
[上一步做了什么]

### 发现
[关键发现或决策]

### 修改的文件
[文件列表]

### 开放问题
[未解决问题]

### 建议下一步
[对下一步的建议]
```

### 上下文传递规则
- 每个 agent 必须输出 handoff 文档
- 下一个 agent 必须读取上一个 handoff
- 保留完整的 agent 链上下文
- 最终报告聚合所有 handoff

## 错误处理

- 任一 agent 失败 → 停止链路
- 记录失败 agent 和错误信息
- 生成部分报告（已完成的阶段）
- 提供修复建议
