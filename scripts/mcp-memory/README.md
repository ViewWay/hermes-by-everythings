# HBE Memory MCP Server

MCP 服务器提供渐进式查询记忆的工具。

## 安装

```bash
cd scripts/mcp-memory
npm install
```

## 配置

在 Claude Code 配置中添加：

**Unix** (`~/.config/claude-code/config.json`):
```json
{
  "mcpServers": {
    "hbe-memory": {
      "command": "node",
      "args": ["scripts/mcp-memory/mcp-server.js"],
      "cwd": "/path/to/hermes-by-everythings"
    }
  }
}
```

## 工具

### 1. search
搜索记忆索引，返回紧凑结果。

### 2. get_observations
按 ID 获取完整详情。

## 使用流程

1. search → 获取索引
2. 识别相关 ID
3. get_observations → 获取详情

**效果**: ~70% token 节省

## 故障排除

确保 memory/ 目录存在且有数据：
```bash
ls -la memory/observations/
```
