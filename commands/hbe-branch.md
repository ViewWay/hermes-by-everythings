---
name: hbe-branch
description: 分支管理 - 查看分支状态、PR 状态、清理已合并分支
trigger: /hbe-branch
keywords:
  - branch
  - 分支
  - git branch
  - cleanup
argument-hint: "[--cleanup|--list]"
skills: hermes-by-everythings
---

# /hbe-branch — 分支管理

查看本地分支状态、关联的 PR 状态，并支持清理已合并分支。

## 执行流程

1. **本地分支概览**
   ```bash
   git branch -vv                    # 分支 + 追踪状态 + 最后 commit
   ```

2. **PR 状态**（当前用户的开放 PR）
   ```bash
   gh pr status                      # 与当前分支相关的 PR
   gh pr list --author @me --state open --limit 20
   ```

3. **已合并分支**（可清理）
   ```bash
   git branch --merged main | grep -v '^\*\|main\|master'
   ```

4. **输出概览表**

   | 分支 | 状态 | 最后活动 | PR | 可清理 |
   |------|------|---------|-----|--------|
   | feature/login | ahead 2 | 2h ago | #123 open | - |
   | bugfix/typo | merged | 3d ago | #120 merged | ✓ |

5. **清理模式**（`--cleanup` 参数）
   列出已合并到 main 的本地分支，**逐个确认后删除**：
   ```bash
   git branch -d <branch>    # 安全删除（仅删已合并的）
   ```
   - 永不使用 `git branch -D`（强制删除未合并的）
   - 每个分支删除前显示其最后 commit，供用户确认
   - 当前分支和 main/master 永不删除

---

**使用方式**：
- `/hbe-branch` - 查看分支和 PR 概览
- `/hbe-branch --list` - 仅列出分支（不显示 PR）
- `/hbe-branch --cleanup` - 清理已合并的本地分支
