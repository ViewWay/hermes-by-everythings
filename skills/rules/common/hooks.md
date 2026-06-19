# Common Hooks Rules

> 语言专属规则（`../<lang>/hooks.md`）扩展此文件的通用 hook/生命周期约定。

## 核心原则

- **Fail-open** — hook 出错时不应阻断用户操作（生产 hook 优先 fail-open，fail-closed 会卡死会话）
- **快速** — hook 执行 <1s，避免拖慢工具响应
- **无副作用** — 除了明确的日志/记录，不要修改用户代码或状态
- **幂等** — 同一 hook 多次触发结果一致

## HBE Hook 生命周期

| 事件 | 用途 | 示例 |
|------|------|------|
| SessionStart | 初始化环境、加载记忆 | session-start.js |
| SessionEnd | 保存状态、自动学习 | session-end.js, auto-learn.sh |
| PreToolUse | 拦截/校验工具调用 | block-no-verify (拦截 git --no-verify) |
| PostToolUse | 记录/分析工具结果 | post-tool.js, file-type-detect.sh |

## 开发约定
- 所有 hook 命令用 `${CLAUDE_PLUGIN_ROOT}` 引用脚本（跨平台、跨安装位置）
- hook 脚本必须有错误处理（try-catch + exit 0，除非有意阻断）
- 配置在 `hooks/hooks.json` 和 `.claude/settings.json`，保持两者一致

## 安全 Hook 特别约定
- 安全相关 hook（block-no-verify, gateguard）**必须 fail-closed**（出错时阻断，宁可误杀）
- 不要用 `2>/dev/null || true` 静默吞掉安全 hook 的错误
- require 链必须完整（用 test_hook_scripts.py 验证）

## 参考
- 语言专属规则见 `../<lang>/hooks.md`
- Hook 实现在 `scripts/hooks/`
