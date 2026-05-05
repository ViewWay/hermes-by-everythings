---
name: continuous-learning
description: Closed-loop learning system that extracts patterns from sessions, generates skills, updates memory, and enables self-evolving coding enhancement.
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet
---

## Mission

Extract reusable patterns from coding sessions, auto-generate skills, maintain memory files, and enable self-evolving coding improvement through closed-loop learning.

# Continuous Learning — 闭环学习系统

> 自动从会话中提取模式，生成 skill，更新记忆，实现自我进化的编码增强系统

---

## 学习触发条件

### 自动触发

以下情况自动触发学习流程：

1. **会话结束时**: 检测到会话关闭信号
2. **Ralph 迭代完成**: 每个 story 完成后
3. **错误修复后**: 构建错误/测试失败修复成功后
4. **用户确认**: 用户说"记住这个"/"保持这个方式"
5. **模式复用**: 同一模式连续使用 3 次成功后

### 手动触发

```bash
# 提取本次会话的模式
/hbe:learn

# 提取并验证
/hbe:learn --validate

# 强制提取（即使无明确模式）
/hbe:learn --force

# 从历史记录提取
/hbe:learn --from=logs/iteration-*.jsonl
```

---

## 模式提取流程

### Step 1: 会话分析

```bash
# 1. 获取会话历史
SESSION_HISTORY=$(get_session_history)

# 2. 识别关键事件
KEY_EVENTS=$(identify_key_events "$SESSION_HISTORY")
# - 用户请求
# - 错误和修复
# - 用户校正
# - 成功的解决方案
# - 重复的模式

# 3. 提取上下文
CONTEXT=$(extract_context "$KEY_EVENTS")
# - 项目类型
# - 语言/框架
# - 具体问题
# - 解决方案
```

### Step 2: 模式分类

将提取的信息分类为：

| 类别 | 存储位置 | 示例 |
|------|----------|------|
| **错误模式** | `memory/errors/ERROR-NAME.md` | React useEffect 依赖数组缺失导致无限循环 |
| **成功模式** | `memory/successes/SUCCESS-NAME.md` | Python pytest fixtures 正确使用方式 |
| **用户偏好** | `memory/feedback/feedback-TIMESTAMP.md` | 用户偏好使用 f-string 而非 .format() |
| **项目特定** | `MEMORY.md` | 项目使用 SQLAlchemy 2.0 风格 |
| **平台差异** | `memory/platform/PLATFORM-NAME.md` | Claude Code vs Hermes 工具差异 |

### Step 3: 模式验证

```python
def validate_pattern(pattern):
    """验证提取的模式是否值得保存"""

    # 排除条件
    EXCLUSIONS = [
        "一次性修复（typo、简单语法错误）",
        "外部 API 问题（非项目代码问题）",
        "过于通用的建议（如'写测试'）",
        "已有文档覆盖的内容",
    ]

    if pattern in EXCLUSIONS:
        return False

    # 包含条件
    INCLUSIONS = [
        "项目特定的错误模式",
        "用户明确确认的偏好",
        "非显而易见的调试技巧",
        "框架/库的特定用法",
        "性能优化模式",
        "安全最佳实践",
    ]

    return pattern in INCLUSIONS
```

---

## Skill 自动生成

### 何时生成新 Skill

1. **模式复用 3 次**: 同一模式在不同场景成功应用
2. **用户明确要求**: 用户说"为这个创建 skill"
3. **复杂多步骤**: 需要 3+ 步骤的解决方案
4. **跨项目适用**: 模式可应用于其他项目

### Skill 生成模板

```markdown
---
name: skill-name
description: 简短描述（一句话）
trigger: 何时触发此 skill
keywords:
  - keyword1
  - keyword2
version: 1.0.0
---

# Skill Name

简短描述。

## 触发条件

[何时自动触发此 skill]

## 问题

[描述这个 skill 解决的问题]

## 解决方案

[步骤化的解决方案]

## 示例

\`\`\`language
// 代码示例
\`\`\`

## 注意事项

[需要特别注意的点]

## 相关资源

- [相关文档](链接)
- [相关 skill](其他技能)
```

### Skill 生成流程

```bash
# 1. 检测到值得保存的模式
PATTERN_VALID=true

# 2. 检查是否已存在类似 skill
if skill_exists "$PATTERN"; then
    # 更新现有 skill
    update_skill "$PATTERN"
else
    # 生成新 skill
    generate_skill "$PATTERN"
fi

# 3. 验证 skill 质量
validate_skill_quality "$NEW_SKILL"

# 4. 提交到版本控制
git add skills/
git commit -m "feat: auto-learn $PATTERN"
```

---

## Memory 管理

### Memory 类型

#### 1. 项目记忆 (MEMORY.md)

```markdown
---
name: PROJECT_NAME
description: 项目特定上下文
type: project
created: 2026-05-02
updated: 2026-05-02
---

## 项目概览

- **类型**: [Web App / CLI / Library / API]
- **语言**: [TypeScript / Python / Rust / ...]
- **框架**: [React / Django / Axum / ...]
- **测试框架**: [Jest / pytest / cargo test]

## 项目特定模式

### [模式 1]
[描述]

### [模式 2]
[描述]

## 常见陷阱

- [陷阱 1 + 解决方案]
- [陷阱 2 + 解决方案]

## 开发规范

- [代码风格要求]
- [提交信息规范]
- [测试覆盖率要求]
```

#### 2. 反馈记忆 (memory/feedback/feedback-TIMESTAMP.md)

```markdown
---
name: feedback-20260502-103000
description: 用户偏好：使用 f-string 而非 .format()
type: feedback
created: 2026-05-02T10:30:00Z
---

## 用户偏好

### 规则
在 Python 字符串格式化中，优先使用 f-string 而非 .format() 或 % 格式化。

### Why
用户在代码审查中明确表示偏好 f-string，认为代码更清晰易读。

### How to apply
- 检测到 `.format()` 调用时，建议改用 f-string
- 检测到 `%` 格式化时，建议改用 f-string
- 在代码生成时，默认使用 f-string

### 示例

**之前**:
```python
name = "Alice"
greeting = "Hello, {}".format(name)
```

**之后**:
```python
name = "Alice"
greeting = f"Hello, {name}"
```

### 记录时间
2026-05-02

### 确认次数
3 次
```

#### 3. 错误模式 (memory/errors/ERROR-NAME.md)

```markdown
---
name: react-useeffect-deps
description: React useEffect 依赖数组缺失导致无限循环
type: error
created: 2026-05-02
---

## 错误模式

### 问题
在 React 中使用 `useEffect` 时，缺少依赖数组或依赖数组不完整，导致：
- 无限循环
- 过期闭包
- 状态不同步

### 典型症状
- 组件无限渲染
- 控制台警告：`React Hook useEffect has a missing dependency`
- 状态值不是最新

### 根本原因
\`\`\`javascript
// ❌ 错误：缺少依赖
useEffect(() => {
  fetchData(userId);  // userId 是依赖
}, []);  // 空依赖数组

// ❌ 错误：依赖不完整
useEffect(() => {
  fetchData(userId);
}, []);  // 缺少 userId
\`\`\`

### 解决方案

\`\`\`javascript
// ✅ 正确：包含所有依赖
useEffect(() => {
  fetchData(userId);
}, [userId]);  // 完整依赖

// ✅ 如果故意要忽略依赖
useEffect(() => {
  fetchData(userId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);  // 明确注释原因
\`\`\`

### ESLint 规则
\`\`\`json
{
  "rules": {
    "react-hooks/exhaustive-deps": "warn"
  }
}
\`\`\`

### 发生次数
3 次

### 最后发生
2026-05-02
```

---

## 学习质量保证

### 质量检查清单

生成 skill 或 memory 前，检查：

- [ ] **准确性**: 模式描述是否准确？
- [ ] **完整性**: 是否包含所有必要信息？
- [ ] **可复现**: 其他人能否按此复现？
- [ ] **价值**: 这个模式是否值得记住？
- [ ] **非冗余**: 是否与现有 skill/memory 重复？

### 自动验证

```bash
# 1. 语法检查
validate_markdown "$NEW_SKILL"

# 2. 去重检查
if is_duplicate "$NEW_SKILL"; then
    merge_skills "$EXISTING" "$NEW_SKILL"
fi

# 3. 质量评分
SCORE=$(calculate_quality_score "$NEW_SKILL")
if [ "$SCORE" -lt 70 ]; then
    echo "质量不足，跳过保存"
    exit 1
fi

# 4. 用户确认（可选）
if should_confirm_user; then
    confirm_user "$NEW_SKILL"
fi
```

---

## 自动化 Hooks

### 会话结束 Hook

```json
// .claude/settings.json
{
  "hooks": {
    "post:session": [
      {
        "name": "auto-learn",
        "command": "hbe:learn --auto",
        "description": "自动提取会话模式"
      }
    ]
  }
}
```

### Git Hook 集成

```bash
# .git/hooks/post-commit
#!/bin/bash
# 提交后自动学习

# 检查是否有错误修复
if git diff HEAD~1 HEAD | grep -q "fix:"; then
    /hbe:learn --type=error &
fi

# 检查是否有新模式
if git diff HEAD~1 HEAD | grep -q "feat:"; then
    /hbe:learn --type=success &
fi
```

---

## 学习可视化

### 查看学习状态

```bash
# 查看学习统计
/hbe:learn --stats

# 输出：
# 学习统计：
# - 错误模式: 15
# - 成功模式: 28
# - 用户偏好: 7
# - 项目特定: 12
# - 总 skill: 13
#
# 本周新增：
# - 错误模式: +3
# - 成功模式: +5
#
# 学习率: 68% (68/100 会话产生新知识)
```

### 查看学习历史

```bash
# 查看最近学习
/hbe:learn --recent

# 输出：
# 最近学习（过去 7 天）：
#
# 2026-05-02: React useEffect 依赖模式
# 2026-05-01: Python async/await 错误处理
# 2026-04-30: Rust生命周期省略规则
# ...
```

---

## 进阶：自主优化

### A/B 测试技能

```python
def ab_test_skills(skill_a, skill_b):
    """测试两个技能的效果"""

    results_a = apply_skill_times(skill_a, times=10)
    results_b = apply_skill_times(skill_b, times=10)

    if success_rate(results_b) > success_rate(results_a):
        promote_skill(skill_b)
        deprecate_skill(skill_a)
```

### 技能融合

```python
def merge_similar_skills():
    """合并相似的技能"""

    clusters = cluster_skills_by_similarity()

    for cluster in clusters:
        if len(cluster) > 1:
            merged = merge_skills(cluster)
            validate_merged_skill(merged)
            replace_skills(cluster, merged)
```

### 知识图谱

```python
def build_knowledge_graph():
    """构建技能之间的关联图"""

    graph = KnowledgeGraph()

    for skill in skills:
        for ref in skill.references:
            graph.add_edge(skill.name, ref)

    # 用于推荐相关技能
    return graph
```

---

## 故障恢复

### 学习失败处理

```bash
# 如果学习流程失败
if ! /hbe:learn; then
    # 1. 记录失败
    log_failure "learning failed"

    # 2. 保存原始数据
    save_session_dump()

    # 3. 尝试恢复
    /hbe:learn --recover

    # 4. 如果仍然失败，跳过本次学习
    if [ $? -ne 0 ]; then
        echo "学习失败，跳过本次"
        exit 0
    fi
fi
```

### 回滚学习

```bash
# 如果错误学习了无效模式
/hbe:learn --rollback [commit-hash]

# 或手动回滚
git revert [commit]
```

---

## 最佳实践

1. **渐进式学习**: 从简单模式开始，逐步积累
2. **定期审查**: 每周审查一次学习内容，清理过时模式
3. **用户主导**: 最终决定权在用户，自动学习需确认
4. **质量优先**: 宁可不学，不学低质量内容
5. **跨项目复用**: 鼓励生成通用技能，而非项目特定

---

## 示例：完整学习流程

```bash
# 场景：修复了 React useEffect 依赖问题

# 1. 用户触发学习
/hbe:learn

# 2. 系统分析会话
# - 检测到错误修复
# - 识别模式：useEffect 依赖数组
# - 分类：错误模式

# 3. 生成 memory
# 创建 memory/errors/react-useeffect-deps.md

# 4. 验证质量
# - 检查描述准确性
# - 确认无重复
# - 质量评分: 85/100

# 5. 检测是否应生成 skill
# - 模式复用次数: 1 (不足 3 次)
# - 决策: 暂不生成 skill，仅保存 memory

# 6. 更新索引
# 更新 MEMORY.md 索引

# 7. 提交变更
git add memory/
git commit -m "feat: learn React useEffect dependency pattern"

# 8. 输出报告
echo "✓ 学习完成: React useEffect 依赖模式"
echo "✓ 保存到: memory/errors/react-useeffect-deps.md"
echo "✓ 质量评分: 85/100"
echo "→ 3 次复用后将生成 skill"
```

---

**维护者**: HBE 学习系统
**版本**: 1.0.0
**最后更新**: 2026-05-02
