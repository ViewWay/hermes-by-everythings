---
name: hbe-pr-review
description: 审查 Pull Request - 拉取 PR diff 进行代码审查
trigger: /hbe-pr-review
keywords:
  - pr review
  - pr 审查
  - code review
  - 代码审查
argument-hint: "<PR 编号或 URL> [--approve|--request-changes]"
skills: hermes-by-everythings
---

# /hbe-pr-review — 审查 Pull Request

拉取远程 PR 的 diff，用 Code Reviewer agent 审查（复用现有审查维度）。

## 执行流程

1. **解析 PR 编号**
   从参数提取 PR 编号（数字或 URL）。
   若未提供，列出当前仓库的开放 PR：
   ```bash
   gh pr list --state open --limit 10
   ```

2. **拉取 PR 信息**
   ```bash
   gh pr view <N>                              # PR 元信息（标题/作者/分支）
   gh pr diff <N>                              # 完整 diff
   gh pr checks <N> 2>/dev/null || true        # CI 状态（若有）
   ```

3. **加载 Code Reviewer Agent**（复用现有）
   ```
   读取: skills/agents/code-reviewer.md
   ```

4. **执行审查**（与 /hbe-review 相同的维度）
   - 正确性（40%）：逻辑、边界、错误处理
   - 可读性（20%）：命名、结构、注释
   - 性能（15%）：算法、内存、复杂度
   - 安全（15%）：OWASP Top 10
   - 测试（10%）：覆盖率、边界测试

5. **输出审查报告**
   - Critical: 必须修复（阻塞合并）
   - Warning: 建议修复
   - Suggestion: 优化建议

6. **可选：提交审查结论**
   根据参数执行：
   ```bash
   gh pr review <N> --approve --body "<审查摘要>"        # --approve 时
   gh pr review <N> --request-changes --body "<问题列表>"  # --request-changes 时
   ```

---

**使用方式**：
- `/hbe-pr-review 123` - 审查 PR #123
- `/hbe-pr-review 123 --approve` - 审查并批准
- `/hbe-pr-review 123 --request-changes` - 审查并请求修改
- `/hbe-pr-review https://github.com/owner/repo/pull/123` - 用 URL 审查
