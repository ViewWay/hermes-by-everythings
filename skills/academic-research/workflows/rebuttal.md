# Rebuttal Writing Workflow / Rebuttal 写作工作流

## Overview / 概览

结构化 rebuttal/审稿人回复写作。

Structured rebuttal/reviewer response writing.

## Phase 1: Parse Reviews / 解析审稿意见

Extract structured items from each review:

| Field | Content |
|-------|---------|
| Reviewer | R1, R2, R3... |
| Comment # | Q1, Q2, Q3... |
| Type | Question / Concern / Suggestion |
| Severity | Critical / Major / Minor |
| Category | Accept / Argue / Clarify / Experiment |

## Phase 2: Classify ## Phase 2: Classify & Prioritize Prioritize / 分类与优先级排序

| Category | Strategy |
|----------|----------|
| **Accept** | Thank + fix immediately |
| **Argue** | Clarify with evidence |
| **Clarify** | Add text/examples |
| **Experiment** | Plan + execute if feasible |

Priority: Critical+Easy > Critical+Hard > Major+Easy > Major+Hard > Minor

## Phase 3: Response Template / 回复模板

```
**[R1-Q1]** [Summary of concern]

Thank you for this observation. [Acknowledge]

[Response:] We have [action]. Specifically:
- [Change 1]
- [Change 2]

Please see Section X.Y (Page Z, Lines A-B) for the revised text.
```

## Phase 4: Meta-Response / 总体回复

```
We thank all reviewers for constructive feedback. Key changes:
1. New experiments addressing R1-Q1, R2-Q3
2. Clarifications in Section 3 and Section 4
3. Writing improvements throughout
Below we respond to each reviewer point by point.
```

## Phase 5: Camera-Ready Diff / 终稿差异对比

```bash
latexdiff original.tex revised.tex > diff.tex
pdflatex diff.tex
```

## Tone Rules / 语气规范

| Do | Don't |
|----|-------|
| Thank every reviewer | Be dismissive |
| Address every point | Ignore minor concerns |
| Use evidence | Claim without proof |
| Be concise | Write a novel |
| Mark changes clearly | Expect reviewers to find them |

## Cross-References / 交叉引用

- **Pre-submission review**: After revision, re-run `references/pre-submission-review.md`
- **Research integrity**: Verify changes with `references/research-integrity-guide.md`
- **Camera-ready diff**: Use `latexdiff` as described in Phase 5 above
- **Writing quality**: Check revised sections against `references/writing-guide.md`
