# Archived Scripts

这些脚本在代码库中**零引用**（grep 全仓无命中，且不被任何 hook/settings/command 调用），疑似从 ECC 迁移后未接入。已于 2026-06 归档于此。

## 为什么不直接删除

归档而非删除：git 历史虽可追溯，但归档目录让这些代码在当前版本仍可见、可恢复、便于审查是否值得重新接入。

## 内容

| 脚本 | 原位置 | 说明 |
|------|--------|------|
| `mem-search.js` | scripts/ | 记忆搜索工具，未接入 |
| `hbe.js` | scripts/ | HBE CLI 入口，未接入 |
| `agent-id-manager.js` | scripts/ | Agent ID 管理，未接入 |
| `verify-loop.{js,sh,py,ps1}` | scripts/ | 验证循环 4 份重复实现 |
| `ai/smart-advisor.js` | scripts/ai/ | AI 智能建议 |
| `ai/predictive-loader.js` | scripts/ai/ | 预测加载器 |
| `cache/multi-level-cache.js` | scripts/cache/ | 多级缓存 |
| `dashboard/{dashboard,cost-tracker}.js` | scripts/dashboard/ | 仪表盘 |
| `performance/{parallel-executor,model-router}.js` | scripts/performance/ | 性能优化 |
| `recovery/auto-recovery.js` | scripts/recovery/ | 自动恢复 |
| `utils/{file-cache,history,progress}.js` | scripts/utils/ | 工具库 |
| `mcp-memory/mcp-server.js` | scripts/mcp-memory/ | MCP 记忆服务器 |

## 如需恢复

```bash
git mv scripts/_archive/<script> scripts/<original-path>
# 然后在 hook/command/settings 中接入引用
```

## 活跃脚本（不在此目录）

以下脚本仍在使用，**不要**归档：
- `scripts/hooks/` — 所有 hook 入口和 dispatcher
- `scripts/lib/` — 被 hooks 引用的工具库（hook-flags、shell-split 等）
- `scripts/core/ralph/` — Ralph 编排器骨架
- `scripts/core/hooks/` — auto-learn.sh、file-type-detect.sh
- `scripts/install.sh` — 维护良好的 symlink 安装器
