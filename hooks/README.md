# HBE Hooks 配置

自动化工作流和安全检查。

## Hook 类型

- **SessionStart**: 加载会话记忆
- **PreToolUse**: 安全检查、成本追踪
- **PostToolUse**: 记忆记录
- **Stop**: 会话保存、模式提取
- **PreBash**: Bash验证
- **PostBash**: 错误检测

## 配置

- `hooks.json`: Hook配置
- 环境变量: `HBE_HOOK_PROFILE` (minimal|standard|strict)
- 环境变量: `HBE_DISABLED_HOOKS`
