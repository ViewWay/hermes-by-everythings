# Orchestrator 使用教程

> **版本**: 3.3.1
> **更新时间**: 2026-05-02
> **难度**: 中级

---

## 目录

1. [快速开始](#快速开始)
2. [基础用法](#基础用法)
3. [批量处理](#批量处理)
4. [修正循环](#修正循环)
5. [高级技巧](#高级技巧)
6. [实际案例](#实际案例)
7. [故障排除](#故障排除)

---

## 快速开始

### 安装验证

确保 HBE 已正确安装 Orchestrator Agent：

```bash
# 检查 Orchestrator 是否存在
cat skills/agents/orchestrator.md | head -20

# 测试 Agent ID 管理工具
node scripts/agent-id-manager.js --help
```

### 第一个任务

让我们从一个简单的例子开始：

```bash
# 创建一个简单的 PRD 文件
cat > prd.json << 'EOF'
{
  "title": "待办事项应用",
  "stories": [
    {
      "id": 1,
      "title": "创建待办事项",
      "description": "用户可以创建新的待办事项"
    }
  ]
}
EOF

# 启动 Orchestrator
/hbe-orchestrate "根据 prd.json 开发待办事项应用"
```

---

## 基础用法

### 1. 单任务开发

最简单的用法是开发单个功能：

```bash
/hbe-orchestrate "实现用户登录功能"
```

**Orchestrator 会自动**：
1. Phase 1: 调用 `planner` 创建 `dev-plan.md`
2. Phase 2: 开发登录功能
   - 调用 `architect` 开发代码
   - 调用 `code-reviewer` 审查代码质量
   - 调用 `security-reviewer` 审查安全性
   - 调用 `tdd-guide` 审查测试覆盖
3. Phase 3: 更新 `lessons-learned.md`

### 2. 指定输出目录

```bash
/hbe-orchestrate "实现用户登录功能" --output ./my-project
```

### 3. 查看日志

```bash
# 查看主Agent日志
cat ./my-project/orchestration-log.md

# 查看开发计划
cat ./my-project/dev-plan.md

# 查看经验库
cat ./my-project/lessons-learned.md
```

---

## 批量处理

### 默认批量大小（BATCH_SIZE=1）

```bash
# 逐个开发，适合复杂任务
/hbe-orchestrate "开发博客系统" --batch-size 1
```

### 小批量处理（BATCH_SIZE=3）

```bash
# 推荐：平衡效率和控制的批量大小
/hbe-orchestrate "开发博客系统" --batch-size 3
```

**工作流程**：
```
Batch 1: 任务 1-3
  ├─ architect 开发 3 个任务（连续）
  ├─ code-reviewer + security-reviewer + tdd-guide 并行验证
  └─ 修正循环（如有FAIL）

Batch 2: 任务 4-6
Batch 3: 任务 7-9
```

### 大批量处理（BATCH_SIZE=5）

```bash
# 适合大量相似任务
/hbe-orchestrate "开发电商后台" --batch-size 5
```

**注意**：批量越大，单个 Agent 的上下文越大，可能影响质量。

---

## 修正循环

### 自动修正循环

Orchestrator 会自动执行最多 3 轮修正：

```
第1轮验证:
  - 代码质量: FAIL (有3个问题)
  - 安全审查: PASS
  - 测试覆盖: FAIL (覆盖率70% < 80%)

  → 启动第1轮修正
  → resume architect，传递反馈
  → 修正完成

第2轮验证:
  - 代码质量: PASS
  - 安全审查: PASS
  - 测试覆盖: PASS

  → 修正循环结束
```

### 手动触发修正

如果自动修正失败，可以手动 resume：

```bash
# 1. 获取 Agent ID
node scripts/agent-id-manager.js --latest
# 输出: Latest Agent ID: abc123def456

# 2. 手动 resume（在Claude Code中）
Agent(
  resume: "abc123def456",
  subagent_type: "architect",
  prompt: "根据测试反馈修正代码"
)
```

---

## 高级技巧

### 1. 自定义验证维度

默认验证维度：代码质量、安全性、测试覆盖。

你可以通过修改 `dev-plan.md` 来添加自定义验证：

```markdown
## 验证标准

- 代码质量: 必须通过
- 安全审查: 必须通过
- 测试覆盖: 必须 ≥ 80%
- 性能: 响应时间 < 100ms
- 可访问性: WCAG 2.1 AA
```

### 2. 跳过简单任务

对于非常简单的任务（如修改配置文件），可以跳过验证：

```markdown
## 任务: 更新配置文件

验证: 跳过（简单任务）
原因: 只修改配置，无业务逻辑
```

### 3. 优先级队列

在 `dev-plan.md` 中标记优先级：

```markdown
## 任务列表

| # | 任务 | 优先级 | 状态 |
|---|------|--------|------|
| 1 | 用户认证 | P0 | ⏳ |
| 2 | 文章管理 | P1 | ⏳ |
| 3 | 评论功能 | P2 | ⏳ |
```

Orchestrator 会按优先级处理。

### 4. 并行批次（实验性）

对于大型项目，可以尝试并行批次：

```bash
# 终端1: 开发批次1
/hbe-orchestrate "开发用户系统" --batch 1-3

# 终端2: 开发批次2（在批次1完成后）
/hbe-orchestrate "开发内容系统" --batch 4-6
```

**注意**：确保批次间没有依赖关系。

---

## 实际案例

### 案例1: REST API 开发

**需求**: 开发一个用户管理 REST API

```bash
# 1. 创建 PRD
cat > prd.json << 'EOF'
{
  "title": "用户管理 API",
  "stories": [
    {"id": 1, "title": "POST /users", "description": "创建用户"},
    {"id": 2, "title": "GET /users/:id", "description": "获取用户"},
    {"id": 3, "title": "PUT /users/:id", "description": "更新用户"},
    {"id": 4, "title": "DELETE /users/:id", "description": "删除用户"}
  ]
}
EOF

# 2. 启动 Orchestrator（批量大小=2，平衡效率和质量）
/hbe-orchestrate "根据 prd.json 开发用户管理 API" --batch-size 2
```

**结果**：
- Batch 1: POST /users, GET /users/:id (0轮修正，全PASS)
- Batch 2: PUT /users/:id, DELETE /users/:id (1轮修正，安全审查发现问题)

**总耗时**: ~45分钟（手动需要 ~2小时）

### 案例2: 前端组件开发

**需求**: 开发一组表单组件

```bash
# 创建组件列表
cat > components.md << 'EOF'
# 表单组件列表

1. Input (文本输入)
2. TextArea (多行文本)
3. Select (下拉选择)
4. Checkbox (复选框)
5. Radio (单选框)
EOF

# 启动 Orchestrator
/hbe-orchestrate "根据 components.md 开发表单组件库" --batch-size 3
```

**关键经验**：
- 第1轮：Checkbox 和 Radio 有可访问性问题
- 第2轮：修正后通过
- `lessons-learned.md` 记录："表单组件必须实现键盘导航和屏幕阅读器支持"

### 案例3: 全栈功能开发

**需求**: 开发完整的用户认证功能（前端+后端）

```bash
# 创建 PRD
cat > auth-prd.json << 'EOF'
{
  "title": "用户认证系统",
  "stories": [
    {"id": 1, "title": "后端: 注册API", "scope": "backend"},
    {"id": 2, "title": "后端: 登录API", "scope": "backend"},
    {"id": 3, "title": "后端: JWT中间件", "scope": "backend"},
    {"id": 4, "title": "前端: 登录页面", "scope": "frontend"},
    {"id": 5, "title": "前端: 注册页面", "scope": "frontend"},
    {"id": 6, "title": "前端: 认证上下文", "scope": "frontend"}
  ]
}
EOF

# 先完成后端（batch-size=1，因为复杂）
/hbe-orchestrate "根据 auth-prd.json 开发后端认证" --filter scope=backend --batch-size 1

# 再完成前端（batch-size=2）
/hbe-orchestrate "根据 auth-prd.json 开发前端认证" --filter scope=frontend --batch-size 2
```

---

## 故障排除

### 问题1: Agent resume 找不到 ID

**症状**:
```
Error: Agent ID abc123 not found
```

**原因**: Agent ID 已过期（超过7天被清理）

**解决方案**:
```bash
# 查找正确的 Agent ID
node scripts/agent-id-manager.js --list

# 或者创建新的 Agent
/hbe-orchestrate "继续之前的任务"
```

### 问题2: 修正循环超过3轮仍不通过

**症状**:
```
第3轮验证: FAIL (仍有问题)
```

**原因**: 验证标准不明确或代码与测试要求冲突

**解决方案**:
1. 检查验证报告，确认问题是否致命
2. 如果非致命，强制通过（标记为⚠️）
3. 更新 `lessons-learned.md`，记录问题
4. 调整验证标准或代码设计

### 问题3: 批量处理导致上下文膨胀

**症状**:
- Agent 响应变慢
- Token 消耗过大
- 质量下降

**解决方案**:
```bash
# 降低批量大小
/hbe-orchestrate "重新开发" --batch-size 1

# 或者启用上下文压缩
export HBE_COMPRESS_THRESHOLD=50000
```

### 问题4: 并发超过3个验证Agent

**症状**:
- 系统负载高
- 响应时间长

**原因**: 违反了16条铁律中的第16条

**解决方案**: Orchestrator 会自动限制并发为3，如果你看到超过3个，请检查是否有自定义脚本绕过了限制。

---

## 最佳实践

### 1. 批量大小选择

| 项目类型 | 推荐批量大小 | 理由 |
|---------|-------------|------|
| 核心业务逻辑 | 1 | 复杂度高，需要精细控制 |
| CRUD功能 | 3 | 平衡效率和质量 |
| 简单重复任务 | 5 | 最大化效率 |
| UI组件 | 2-3 | 需要视觉验证 |

### 2. 修正循环管理

```
✅ 推荐：
- 让 Orchestrator 自动处理修正循环
- 只在自动失败时手动干预
- 及时更新 lessons-learned.md

❌ 避免：
- 每次都手动 resume
- 跳过验证步骤
- 忽略测试反馈
```

### 3. 经验积累

```markdown
# lessons-learned.md 格式建议

## 通用经验

### 安全
- [日期] 用户输入必须验证和消毒
- [日期] 敏感数据不得记录到日志

### 性能
- [日期] 数据库查询必须使用索引
- [日期] 避免N+1查询问题

### 可维护性
- [日期] 复杂逻辑必须添加注释
- [日期] 函数长度不超过50行
```

### 4. 文档管理

```
项目根目录/
├── dev-plan.md              # 开发计划（主Agent管理）
├── lessons-learned.md       # 经验库（开发Agent更新）
├── orchestration-log.md     # 主Agent日志
├── test-reports/            # 测试报告
│   ├── task1-code.md
│   ├── task1-security.md
│   └── task1-test.md
└── artifacts/               # 产出物
    ├── architecture.md
    └── api-spec.md
```

---

## 进阶话题

### 与 Ralph 集成

Orchestrator 可以与 Ralph 自主循环结合：

```bash
# 1. 创建 PRD
cat > prd.json << 'EOF'
{
  "title": "大型项目",
  "stories": [ ... ]
}
EOF

# 2. 启动 Ralph
/hbe-ralph

# 3. Ralph 内部会自动调用 Orchestrator 进行批量开发
```

### 自定义 Agent

你可以创建自定义 Agent 并集成到 Orchestrator：

```markdown
---
name: my-custom-agent
description: 我的专业Agent
tools: Read, Write, Edit
model: inherit
---

你是 XXX 专家...
```

然后在 `dev-plan.md` 中指定：

```markdown
## 任务: 特殊功能

开发Agent: my-custom-agent
验证Agent: code-reviewer, security-reviewer
```

---

## 参考资源

- **Orchestrator Agent**: `skills/agents/orchestrator.md`
- **集成指南**: `docs/ORCHESTRATOR-GUIDE.md`
- **Agent ID 管理工具**: `scripts/agent-id-manager.js`
- **agentdesign 参考**: `docs/agentdesign/`

---

**教程版本**: 3.3.1
**最后更新**: 2026-05-02
**维护者**: HBE 团队
