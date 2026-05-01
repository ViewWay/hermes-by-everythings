# mem-search Skill

> 搜索 HBE 记忆系统的 skill
> 版本: 1.0.0

---

## When to Use

用户需要搜索历史会话、观察或模式时：

- 查找过去的错误和解决方案
- 搜索特定的工具使用模式
- 回顾关键决策
- 查找项目历史

---

## How It Works

1. **确定搜索范围** - 在 memory/ 目录中搜索
2. **执行搜索** - 使用 Node.js 工具查询 JSON 文件
3. **过滤结果** - 按类型、重要性、日期筛选
4. **渐进式展示** - 先显示索引，再按需展开详情

---

## Examples

### 搜索错误
```bash
node scripts/mem-search.js --type error
node scripts/mem-search.js --type error --query "authentication"
```

### 搜索工具使用
```bash
node scripts/mem-search.js --tool Agent
node scripts/mem-search.js --tool Write --limit 10
```

### 时间范围搜索
```bash
node scripts/mem-search.js --days 7
node scripts/mem-search.js --importance high
```

---

## Integration with MCP

如果配置了 MCP 服务器，可以直接在 Claude Code 中使用：

1. **search** - 搜索索引（紧凑）
2. **timeline** - 查看时间线
3. **get_observations** - 获取详情

---

**维护者**: HBE 团队
