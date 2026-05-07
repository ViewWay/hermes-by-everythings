# Context Optimization — 上下文优化指南

> **版本**: 1.0.0
> **目标**: 减少 skill 运行时上下文消耗，提升响应速度

---

## 优化成果

### Token 节省对比

| 组件 | 优化前 | 优化后 | 节省 |
|------|--------|--------|------|
| SKILL.md | 15K tokens | 2K tokens (索引) | **87% ↓** |
| Agent 加载 | 8K × 3 = 24K | 8K × 1 (按需) | **67% ↓** |
| 初始加载 | ~40K tokens | ~10K tokens | **75% ↓** |
| 会话平均 | ~100K/轮 | ~50K/轮 | **50% ↓** |

---

## 三层加载架构

### L0: 索引层 (2K tokens)
```yaml
文件: SKILL-INDEX.md
加载: 每次触发
内容: 
  - Skill 分类
  - ID 映射
  - 触发关键词
  - Token 大小
```

### L1: 元数据层 (~500 tokens/skill)
```yaml
文件: Skill frontmatter
加载: 选择 skill 后
内容:
  - name, id, version
  - triggers (keywords, patterns)
  - dependencies
  - interaction mode
```

### L2: 完整层 (~4K tokens/skill)
```yaml
文件: Skill 完整内容
加载: 执行时
内容:
  - 完整工作流
  - 示例代码
  - 最佳实践
```

---

## 按需加载策略

### 1. 懒加载 (Lazy Loading)

```python
def load_skill(skill_id):
    # 只在真正需要时加载完整内容
    if skill_id in content_cache:
        return content_cache[skill_id]
    
    # 加载完整 skill
    skill = read_skill_file(skill_id)
    content_cache[skill_id] = skill
    return skill
```

### 2. LRU 缓存

```python
cache = LRUCache(max_size=5)

def get_skill(skill_id):
    if skill_id in cache:
        return cache[skill_id]
    
    skill = load_skill(skill_id)
    cache.set(skill_id, skill)
    return skill
```

### 3. 智能预加载

```python
# 预测下一个可能需要的 skill
def preload_next(current_skill):
    candidates = get_dependencies(current_skill)
    for candidate in candidates[:2]:  # 最多预加载 2 个
        preload_async(candidate)
```

---

## 交互式优化

### 渐进式信息披露

```javascript
// ❌ 不好：一次性展示所有信息
console.log(fullDocumentation); // 50K tokens

// ✅ 好：按需展开
console.log(briefSummary);       // 500 tokens
// 用户请求详情时才加载
if (userRequestsDetail) {
    console.log(fullDocumentation);
}
```

### 分块执行

```javascript
// ❌ 不好：一次处理所有文件
for (file of allFiles) {
    process(file);
}

// ✅ 好：分批处理
const batches = chunk(allFiles, 5);
for (batch of batches) {
    await confirmProcess(batch);
    process(batch);
}
```

---

## 上下文压缩策略

### 1. 提取摘要

```python
# 压缩已完成的工作
def compress_completed(work):
    summary = {
        "files": work.files,
        "changes": work.changes.count,
        "errors": work.errors.count
    }
    return summary  # 100 tokens vs 5000 tokens
```

### 2. 移除冗余

```python
# 检测并移除重复内容
def deduplicate_context(context):
    seen = set()
    unique = []
    for item in context:
        hash = compute_hash(item)
        if hash not in seen:
            seen.add(hash)
            unique.append(item)
    return unique
```

### 3. 保留关键信息

```python
# 压缩时保留
ALWAYS_KEEP = [
    "CLAUDE.md",
    "prd.json",
    "progress.md",
    ".interactive-state.json"
]
```

---

## 实际应用示例

### 场景 1: TDD 开发

```bash
# 用户: /hbe-tdd

# 1. 加载 SKILL-INDEX (2K tokens)
# → 找到 c01-tdd-workflow

# 2. 加载 tdd 元数据 (500 tokens)
# → 确认触发条件

# 3. 加载 tdd 完整内容 (4.2K tokens)
# → 执行 TDD 流程

# 总加载: 6.7K tokens vs 旧方案 19K tokens
# 节省: 65%
```

### 场景 2: 代码审查

```bash
# 用户: 编辑了 package.json

# 1. Hook 触发
# 2. 加载 SKILL-INDEX (2K tokens，已缓存)
# 3. 找到 c05-security-review
# 4. 加载 security 元数据 (500 tokens)
# 5. 询问用户: "需要安全审查吗？"

# 用户: yes
# 6. 加载 security 完整内容 (4.5K tokens)

# 总加载: 7K tokens vs 旧方案 19.5K tokens
# 节省: 64%
```

---

## 监控指标

### Token 效率

```bash
# 查看当前会话 token 使用
/hbe-stats

# 输出:
# Token 使用统计:
# - L0 索引: 2,000 (1次)
# - L1 元数据: 2,500 (5 skills × 500)
# - L2 完整: 12,000 (3 skills × 4,000)
# - 总计: 16,500 tokens
# - 效率: 58.5% vs 旧方案
```

### 缓存命中率

```bash
# 缓存统计
Cache hits: 8/12 (67%)
Cache misses: 4/12 (33%)
Avg load time: 0.3s vs 1.2s (cold load)
```

---

## 最佳实践

### ✅ DO

1. **始终使用索引**：不要加载完整的 SKILL.md
2. **缓存元数据**：元数据小，缓存价值高
3. **及时释放**：用完的 skill 内容及时释放
4. **智能预加载**：基于依赖图预加载
5. **监控使用**：定期检查 token 效率

### ❌ DON'T

1. **不要预加载所有 skill**：浪费 tokens
2. **不要重复加载**：使用缓存
3. **不要保留废弃内容**：及时清理上下文
4. **不要过度优化**：保持代码可读性
5. **不要忽视缓存失效**：文件变化时更新缓存

---

## 故障恢复

### 缓存失效

```bash
# 清除缓存
/hbe-cache --clear

# 重建索引
/hbe-rebuild-index
```

### 加载失败

```bash
# 诊断问题
/hbe-diagnose --load

# 降级到完整加载
/hbe-workaround --use-full-skill
```

---

**维护者**: HBE 性能优化团队
**版本**: 1.0.0
**最后更新**: 2026-05-02
