# Token 优化策略

## 问题

Ralph 全流程预估 200-400k tokens（10 次迭代 × 20-40k/次）。
主要 token 消耗来源:

| 来源 | 占比 | 原因 |
|------|------|------|
| Agent prompt 加载 | 25% | 每次迭代加载完整 agent 文件 |
| 代码上下文 | 30% | 重复读取未变化的文件 |
| 验证输出 | 20% | 5 阶段验证的全部输出 |
| Handoff 传递 | 15% | 跨迭代累积的上下文 |
| PRD/Progress | 10% | 每次迭代读写进度文件 |

## 优化策略

### 1. 按需加载 Agent Prompt（节省 ~40% agent token）

不要每次加载全部 agent prompt，只加载当前阶段需要的:

```
错误做法（每次加载全部）:
  planner.md + tdd-guide.md + code-reviewer.md + security-reviewer.md
  = ~4k tokens

正确做法（只加载需要的）:
  TDD 阶段 → 只加载 tdd-guide.md
  = ~1k tokens
```

实施: 在 Ralph 循环中，每次只 `skill_view` / `Read` 当前步骤需要的 agent。

### 2. 增量验证（节省 ~60% 验证 token）

不要每次运行完整 5 阶段验证，根据变更类型选择阶段:

| 变更类型 | 需要的验证阶段 | 跳过的阶段 |
|----------|---------------|-----------|
| 只改测试文件 | Test | Build, TypeCheck, Lint, Security |
| 改了业务代码 | Build → TypeCheck → Test | Lint（可延后） |
| 改了类型定义 | Build → TypeCheck → Test → Security | Lint |
| 改了配置 | Build → Test | TypeCheck, Lint, Security |
| 新增文件 | 全部 5 阶段 | 无 |

实施: 在 Ralph 循环中分析 `git diff --name-only` 决定验证范围。

### 3. 上下文压缩（节省 ~50% handoff token）

每次迭代完成后，压缩 handoff 为结构化摘要:

```
完整 handoff（~2k tokens）:
  详细的修改过程、每步的思考、完整的文件内容差异...

压缩 handoff（~200 tokens）:
  STORY-001: PASS
  Files: auth.ts, auth.test.ts
  Key: 添加了 JWT 验证中间件
  Issues: 无
```

### 4. 文件缓存策略（节省 ~30% 代码读取 token）

记录文件 hash，未变化的文件不重复读取:

```
Iteration 1: 读取 auth.ts → hash: abc123
Iteration 2: git diff auth.ts → 无变化 → 跳过读取，引用上次内容
Iteration 3: git diff auth.ts → 有变化 → 重新读取
```

### 5. 精简 PRD 读取（节省 ~20% PRD token）

不要每次读取完整 PRD，只读当前 story:

```
错误: 读取 prd.json 全部内容（10 个 story = ~5k tokens）
正确: 只读取 passes=false 的第一个 story（~500 tokens）
```

## 优化后的 Ralph 循环

```
初始化（仅首次）:
  - 读取 prd.json（仅 metadata + story 列表）
  - 创建 progress.md

每次迭代:
  1. 读取 prd.json → 只读第一个 passes=false 的 story (~500 tok)
  2. 分析需要加载的 agent → 只读 1 个 agent prompt (~1k tok)
  3. git diff --name-only → 确定变更范围
  4. TDD 实现（RED → GREEN → REFACTOR）
  5. 增量验证（根据变更选择 2-3 个阶段而非 5 个）
  6. 验证通过 → git commit
  7. 更新 prd.json（只改 passes 字段）
  8. 追加压缩摘要到 progress.md (~200 tok)
```

## 预估优化效果

| 场景 | 优化前 | 优化后 | 节省 |
|------|--------|--------|------|
| 单次迭代 | 20-40k | 10-18k | ~55% |
| 10 次迭代全流程 | 200-400k | 100-180k | ~55% |
| 测试文件迭代 | 20-40k | 5-10k | ~75% |
