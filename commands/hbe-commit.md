---
name: hbe-commit
description: 生成 Conventional Commit 提交消息 - 分析 diff 自动生成规范提交
trigger: /hbe-commit
keywords:
  - commit
  - 提交
  - conventional commit
  - commit message
argument-hint: "[可选：scope 或额外上下文]"
skills: hermes-by-everythings
---

# /hbe-commit — 生成提交消息

分析已暂存的 diff，生成符合 Conventional Commit 规范的提交消息。

## 执行流程

1. **环境感知** — 查看已暂存的变更：
   ```bash
   git status --short
   git diff --cached --stat
   git diff --cached
   ```

2. **加载 Commit Writer Agent**
   ```
   读取: skills/agents/commit-writer.md
   ```

3. **分析变更并生成消息**
   - 判断变更类型（feat/fix/refactor/docs/...）
   - 从文件路径推断 scope（可选）
   - 生成 description（祈使句、小写、≤72 字符）

4. **输出建议**
   - 完整的 commit message
   - 一句话说明为什么选这个 type
   - 可直接执行的 `git commit -m "..."` 命令

5. **闭环校验**
   生成的消息会通过 `commit-quality` hook 自动校验（格式/长度/大小写）。
   若被拦截，按 hook 提示修正后重新提交。

## 多变更处理

若检测到多个不相关变更，建议拆分提交：
```
git reset HEAD
git add -p <相关文件>
# 分多次提交
```

---

**使用方式**：
- `/hbe-commit` - 分析已暂存变更，生成消息
- `/hbe-commit auth` - 指定 scope 为 auth
- `/hbe-commit "修复了登录超时"` - 提供额外上下文辅助判断
