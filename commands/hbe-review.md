---
name: hbe-review
description: 代码质量审查 - 检查正确性、可读性、性能、安全
trigger: /hbe-review
keywords:
  - code review
  - 代码审查
  - 质量检查
---

# /hbe-review — 代码质量审查

执行代码审查，检查以下维度：

## 审查流程

1. **环境感知**
   ```bash
   git status --short
   git diff --name-only
   ```

2. **加载 Code Reviewer Agent**
   ```
   读取: skills/agents/code-reviewer.md
   ```

3. **执行审查**
   - 正确性（40%）：逻辑、边界、错误处理
   - 可读性（20%）：命名、结构、注释
   - 性能（15%）：算法、内存、复杂度
   - 安全（15%）：OWASP Top 10
   - 测试（10%）：覆盖率、边界测试

4. **输出报告**
   - Critical: 必须修复的问题
   - Warning: 建议修复的问题
   - Suggestion: 优化建议

5. **生成 Handoff**
   保存到 `.handoff-code-review.md` 供后续使用

---

**使用方式**：
- `/hbe-review` - 审查所有变更
- `/hbe-review src/file.ts` - 审查特定文件
- `/hbe-review --security` - 专注安全审查
