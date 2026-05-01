# Hook 规则

Hermes 无原生 Hook 系统，通过流程步骤模拟 Claude Code 的 Hooks 行为。

## 模拟的 Hook 行为

### PreToolUse: 编辑 .ts/.tsx 后类型检查

当编辑 TypeScript 文件后，自动执行：
```bash
npx tsc --noEmit --pretty false 2>&1 | grep "$(basename FILE)" | head -10
```

### PreToolUse: 编辑 .rs 后 Clippy 检查

当编辑 Rust 文件后，自动执行：
```bash
cargo clippy -- -D warnings 2>&1 | tail -20
```

### PostToolUse: 代码编辑后格式化检查

```bash
# TypeScript
npx prettier --check FILE

# Rust
cargo fmt --check
```

### PreCommit: console.log / print 检测

提交前检查是否有遗留调试语句：
```bash
# TypeScript
grep -rn "console\.log" --include="*.ts" --include="*.tsx" src/
# Rust
grep -rn "println!" --include="*.rs" src/ | grep -v "// .*println!"
```

### PostToolUse: PR 创建后提示

当创建 PR 后，输出：
```
PR 已创建: https://github.com/REPO/pull/N
Review 命令: gh pr review N --repo REPO
```

### PreToolUse: git push 前提醒

push 前自动 review 变更：
```bash
git diff --stat origin/main...HEAD
```

## 在 HBE 流程中的集成

这些 Hook 检查内置在通用执行流程的 Step 4 中。
调用 /hbe:verify 时会完整运行所有 Hook 检查。
调用单个 Agent 命令时，只运行相关的 Hook。
