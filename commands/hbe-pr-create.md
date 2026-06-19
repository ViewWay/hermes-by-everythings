---
name: hbe-pr-create
description: 创建 Pull Request - 分析提交历史生成 PR 标题和描述
trigger: /hbe-pr-create
keywords:
  - pr
  - pull request
  - github
  - 合并请求
argument-hint: "[可选：基础分支，默认 main]"
skills: hermes-by-everythings
---

# /hbe-pr-create — 创建 Pull Request

分析完整提交历史，生成全面的 PR 标题和描述，然后创建 PR。

## 执行流程

1. **确定基础分支**
   默认 `main`，可通过参数指定（如 `develop`）。

2. **环境感知** — 收集 PR 所需的全部信息：
   ```bash
   git log main..HEAD --oneline                    # 完整提交历史
   git log main..HEAD --format="%h %s%n%b"          # 含 body
   git diff main...HEAD --stat                       # 累积变更概览
   git status -sb                                    # 推送状态
   git branch --show-current                         # 当前分支名
   ```

3. **检查推送状态**
   若当前分支未推送到远程：
   ```bash
   git push -u origin <current-branch>
   ```

4. **加载 PR Creator Agent**
   ```
   读取: skills/agents/pr-creator.md
   ```

5. **生成 PR 草稿**
   - 标题：概括所有变更的主题（不是复制第一个 commit）
   - Body：Summary + Changes + Test Plan（带 TODO）+ Notes

6. **用户确认后创建 PR**
   ```bash
   gh pr create --title "<标题>" --body-file <临时文件> --base main
   ```
   创建后，`post-bash-pr-created` hook 会自动感知并提示审查命令。

---

**使用方式**：
- `/hbe-pr-create` - 基于 main 创建 PR
- `/hbe-pr-create develop` - 基于 develop 创建 PR
