---
name: hbe-review
description: 代码审查：安全性、质量、可维护性 / Code review for security, quality, and maintainability
allowed_tools: ["Read", "Bash", "Grep", "Glob"]
---

# /hbe-review

Comprehensive code review of uncommitted changes.

## Goal

Review all changed code for security vulnerabilities, code quality issues, and best practices.

## Steps

1. **Gather Changes**
   ```bash
   git status --short
   git diff --name-only
   ```

2. **Review Each File**
   Read full changed files and check:
   - Security: SQL injection, XSS, hardcoded secrets, auth issues
   - Quality: Function size, nesting depth, error handling
   - Best practices: Immutability, naming, missing tests

3. **Categorize Issues**
   - CRITICAL: Security vulnerabilities, data loss risk
   - HIGH: Bugs, logic errors
   - MEDIUM: Code quality issues
   - LOW: Style nits

4. **Generate Report**
   Output findings with severity levels and actionable fixes.

## Output Format

```markdown
# Code Review Report

## Summary
<Overall assessment>

## CRITICAL
<issues or "None">

## HIGH
<issues or "None">

## MEDIUM
<issues or "None">

## LOW
<issues or "None">

## Recommendation
✅ APPROVE / ⚠️ APPROVE WITH COMMENTS / ❌ REQUEST CHANGES / 🚫 BLOCK
```

## Notes

- CRITICAL issues must be fixed before commit
- HIGH issues should be fixed
- MEDIUM/LOW are suggestions
- Always explain WHY and suggest fixes
