# HBE Memory System

> 基于 claude-mem 的轻量级持久记忆系统
> 版本: 1.0.0
> 更新: 2026-05-02

---

## 概述

HBE Memory System 是一个简化的记忆系统，参考 [claude-mem](https://github.com/thedotmack/claude-mem) 架构，但更轻量且专为 Hermes-by-Everything 项目优化。

### 核心特性

- ✅ **持久记忆** - 跨会话保存上下文
- ✅ **自动捕获** - 无需手动干预
- ✅ **渐进式披露** - 分层加载记忆，节省 token
- ✅ **模式提取** - 自动识别重复模式和决策
- ✅ **JSON 存储** - 简单易读，无需数据库

---

## 架构

### 三个生命周期 Hooks

```
SessionStart → PostToolUse (多次) → SessionEnd
     ↓               ↓                    ↓
  创建会话        捕获观察            生成摘要
  加载历史        提取模式            更新记忆
  生成上下文      存储记录            清理临时
```

### 文件结构

```
memory/
├── sessions/           # 会话记录
│   └── {session-id}.json
├── observations/       # 观察（工具使用）
│   └── {obs-id}.json
├── summaries/          # 会话摘要
│   └── {session-id}.json
└── context-latest.md  # 最新上下文（供加载）
MEMORY.md              # 项目记忆（用户可读）
```

---

## 数据模型

### 会话记录 (memory/sessions/*.json)

```json
{
  "id": "2026-05-02T03-00-00-abc123",
  "startTime": "2026-05-02T03:00:00.000Z",
  "endTime": "2026-05-02T03:30:00.000Z",
  "project": "/path/to/project",
  "observations": ["obs-123", "obs-456"],
  "summary": null
}
```

### 观察记录 (memory/observations/*.json)

```json
{
  "id": "obs-1714624800000-xyz789",
  "timestamp": "2026-05-02T03:00:00.000Z",
  "type": "error|success|pattern|decision|action|delegation",
  "tool": "Write|Edit|Agent|...",
  "summary": "Brief description",
  "details": {},
  "importance": "low|medium|high"
}
```

### 会话摘要 (memory/summaries/*.json)

```json
{
  "sessionId": "...",
  "startTime": "...",
  "endTime": "...",
  "stats": {
    "total": 10,
    "byType": { "error": 2, "success": 5 },
    "byImportance": { "high": 3 }
  },
  "keyObservations": "- Item 1\n- Item 2",
  "patterns": [
    {
      "type": "recurring-error|workflow-pattern",
      "description": "...",
      "frequency": 3
    }
  ]
}
```

---

## Hooks 说明

### 1. session-start.js

**触发时机**: 会话开始时

**功能**:
- 创建新会话记录
- 加载历史观察（最近 10-20 条）
- 生成渐进式上下文摘要
- 输出到 `memory/context-latest.md`

**环境变量**:
- `HBE_SESSION_ID` - 会话 ID（传递给后续 hooks）

### 2. post-tool.js

**触发时机**: 每次工具使用后

**功能**:
- 捕获工具使用信息
- 提取有意义的观察
- 跳过不重要工具（AskUserQuestion, Bash, Read）
- 保存观察记录
- 关联到当前会话

**观察类型**:
- `error` - 工具返回错误
- `success` - 成功的操作
- `action` - Write/Edit 等修改操作
- `delegation` - Agent 委托

**重要性级别**:
- `high` - 错误、关键决策
- `medium` - 委托、重要操作
- `low` - 一般文件操作

### 3. session-end.js

**触发时机**: 会话结束时

**功能**:
- 生成会话摘要
- 提取模式（重复错误、工作流）
- 更新 `MEMORY.md`
- 保留最近 10 个会话的记录

**模式识别**:
- 重复错误（出现 2+ 次）
- 常用工具组合（出现 3+ 次）

---

## 使用指南

### 自动运行

记忆系统通过 Claude Code hooks 自动运行，无需手动触发：

1. **会话开始**: 自动加载历史上下文
2. **工具使用**: 自动捕获观察
3. **会话结束**: 自动生成摘要

### 查看记忆

**最近上下文**:
```bash
cat memory/context-latest.md
```

**项目记忆**:
```bash
cat MEMORY.md
```

**原始数据**:
```bash
# 会话记录
ls memory/sessions/
cat memory/sessions/{session-id}.json

# 观察记录
ls memory/observations/
cat memory/observations/{obs-id}.json

# 会话摘要
ls memory/summaries/
cat memory/summaries/{session-id}.json
```

### 搜索记忆

**查找错误**:
```bash
grep -r '"type": "error"' memory/observations/
```

**查找模式**:
```bash
grep -r '"type": "pattern"' memory/observations/
```

**特定工具**:
```bash
grep -r '"tool": "Agent"' memory/observations/
```

---

## 配置

### 禁用记忆系统

编辑 `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [],
    "PostToolUse": [],
    "SessionEnd": []
  }
}
```

### 调整历史加载量

编辑 `scripts/hooks/session-start.js`:

```javascript
const observations = loadHistoricalObservations(20); // 改为 10 或 30
```

### 调整观察重要性

编辑 `scripts/hooks/post-tool.js` 的 `extractObservation` 函数。

---

## 与 claude-mem 的区别

| 特性 | claude-mem | HBE Memory |
|------|-----------|------------|
| 数据库 | SQLite + Chroma | JSON 文件 |
| 搜索 | 语义向量搜索 | 简单文本搜索 |
| API | HTTP (端口 37777) | 无 API |
| UI | Web Viewer | Markdown 文件 |
| MCP | 4 个搜索工具 | 无 |
| 复杂度 | 高 | 低 |
| 依赖 | Node.js + Bun | 仅 Node.js |
| 适用场景 | 通用 | HBE 项目 |

**HBE Memory 的优势**:
- ✅ 更简单（3 个 hooks vs 6 个）
- ✅ 无外部依赖（无需 Bun, Chroma）
- ✅ 更轻量（JSON vs SQLite）
- ✅ 易调试（人类可读）
- ✅ 项目集成（专为 HBE 优化）

---

## 维护

### 清理旧记忆

```bash
# 删除 30 天前的会话
find memory/sessions -name "*.json" -mtime +30 -delete

# 删除 30 天前的观察
find memory/observations -name "*.json" -mtime +30 -delete

# 删除 30 天前的摘要
find memory/summaries -name "*.json" -mtime +30 -delete
```

### 备份记忆

```bash
# 备份整个 memory 目录
tar -czf memory-backup-$(date +%Y%m%d).tar.gz memory/

# 或仅备份项目记忆
cp MEMORY.md MEMORY-backup-$(date +%Y%m%d).md
```

### 重置记忆系统

```bash
# 警告：删除所有记忆
rm -rf memory/
mkdir -p memory/{sessions,observations,summaries}
```

---

## 故障排除

### 记忆未保存

检查 hooks 是否正确配置：
```bash
cat .claude/settings.json | grep -A 10 '"hooks"'
```

检查 Node.js 是否可用：
```bash
node --version
node scripts/hooks/session-start.js
```

### MEMORY.md 未更新

检查会话是否正常结束：
```bash
ls memory/sessions/
cat memory/sessions/{latest-session}.json
```

手动运行 session-end hook：
```bash
export HBE_SESSION_ID={session-id}
node scripts/hooks/session-end.js
```

### 记忆过多导致 token 超限

清理旧记忆或调整加载量：
```bash
# 清理旧记忆
find memory/observations -name "*.json" -mtime +7 -delete

# 调整加载量（session-start.js）
loadHistoricalObservations(5) // 从 20 减到 5
```

---

## 未来改进

- [ ] 添加 `mem-search` skill 用于搜索记忆
- [ ] 实现 MCP 工具用于渐进式查询
- [ ] 添加可视化 Web UI
- [ ] 支持向量搜索（可选）
- [ ] 添加记忆分析工具

---

## 参考

- [claude-mem](https://github.com/thedotmack/claude-mem) - 原始灵感来源
- [CLAUDE.md](../CLAUDE.md) - 项目主文档
- [docs/](../docs/) - 完整文档

---

**维护者**: HBE 团队
**许可**: MIT
**更新**: 2026-05-02
