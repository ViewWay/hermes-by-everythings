# Pre-Submission Review Guide / 投前审查指南

Comprehensive 5-dimension pre-submission quality review, cross-disciplinary.
跨学科五维度投前质量审查体系。

## Overview / 概览

Before submitting to any venue, run this 5-dimension review to catch issues that reviewers will find. Based on HKUSTDial/Supervisor-Skills Handbook methodology adapted for all disciplines.

投前审查基于五个维度，在提交前捕获审稿人会指出的问题。

## Dimension 1: Contribution & Positioning / 贡献与定位

### Checklist / 检查清单

- [ ] **Problem statement** is clear: what gap exists and why it matters / 问题陈述清晰
- [ ] **Contribution list** is explicit (3-5 bullet points) / 贡献列表明确
- [ ] **Novelty claim** is specific (not "we propose X" but "we are the first to show X under condition Y") / 新颖性声明具体
- [ ] **Positioning** against prior work is fair and accurate / 与前人工作定位公平准确
- [ ] **Significance** is demonstrated, not just asserted (e.g., downstream impact, new capability) / 重要性已展示

### Common Failures / 常见问题

| Failure | Example | Fix |
|---------|---------|-----|
| Vague contribution | "We improve performance" | Quantify: "We improve accuracy by X% on dataset Y" |
| Overclaiming | "First to solve X" | Add qualifiers: "First to solve X under condition Y" |
| Straw-man comparison | Comparing to weak baselines | Compare to SOTA from top venues (last 2 years) |
| Missing motivation | Jump into method without "why" | Start with concrete example or empirical observation |

### Contribution Self-Test / 贡献自测

For each claimed contribution, answer:
1. Is it **verifiable**? (Can someone check it?)
2. Is it **non-trivial**? (Would a competent practitioner think of it?)
3. Is it **impactful**? (Does solving it matter?)
4. Is it **scoped**? (Is the claim narrow enough to be true?)

## Dimension 2: Technical Soundness / 技术可靠性

### Checklist / 检查清单

- [ ] All **assumptions** stated explicitly / 所有假设已明确陈述
- [ ] **Proofs** are complete (no "it can be shown that") / 证明完整
- [ ] **Algorithms** are implementable from description alone / 算法可直接实现
- [ ] **Complexity analysis** provided where relevant / 提供复杂度分析
- [ ] **Edge cases** addressed / 处理边界情况
- [ ] **Reproducibility**: hyperparameters, seeds, compute documented / 可复现性

### Cross-Discipline Specifics / 跨学科细节

| Discipline | Technical Check | Standard |
|-----------|----------------|----------|
| CS/AI | Code runs, results match paper | Papers With Code |
| Math | Proof verified by independent reader | Journal standard |
| Physics | Measurement uncertainty quantified | ISO Guide |
| Medicine | Statistical power ≥ 0.80, CONSORT flow | CONSORT/STROBE |
| Social Science | Effect sizes reported, not just p-values | APA 7th edition |
| Engineering | Benchmark reproducibility on same hardware | Domain standard |

### Technical Review Template / 技术审查模板

```
Claim: [What the paper claims]
Evidence: [What the paper provides]
Verification: [How to independently verify]
Risk: [What could go wrong]
Severity: [If wrong, how bad?]
```

## Dimension 3: Writing & Presentation / 写作与呈现

### Checklist / 检查清单

- [ ] **Title** is informative (not clickbait, not too narrow) / 标题信息丰富
- [ ] **Abstract** is self-contained (no citations needed) / 摘要自包含
- [ ] **Introduction** follows logical flow (context → gap → contribution → roadmap) / 引言逻辑连贯
- [ ] **Figures** are readable at print size, no excessive detail / 图表在打印尺寸下可读
- [ ] **Tables** use booktabs style, best results bold / 表格使用 booktabs 风格
- [ ] **Notation** is consistent throughout / 符号全文一致
- [ ] **Grammar**: no typos, correct tense (past for experiments, present for facts) / 语法正确
- [ ] **Page limit** respected / 符合页数限制

### Six-Paragraph Introduction Check / 六段式引言检查

From `references/idea-evaluation.md` Six-Paragraph Model:

| Para | Role | Self-Check |
|------|------|------------|
| P1 | Context: what is the broad area? | Is this accessible to non-experts? |
| P2 | Specific: what is the problem? | Is the problem precisely defined? |
| P3 | Existing approaches | Are key prior works cited fairly? |
| P4 | Gap: what's missing? | Is this gap genuinely unaddressed? |
| P5 | "In this paper, we..." | Are contributions listed explicitly? |
| P6 | Roadmap | Does it match the paper structure? |

### Readability Self-Test / 可读性自测

1. Read each paragraph's first sentence — does it tell the story?
2. Can a reader understand the contribution from the abstract alone?
3. Can a reader understand the method from Section 3 alone?
4. Does the conclusion match the introduction's promises?

## Dimension 4: Experimental Rigor / 实验严谨性

### Checklist / 检查清单

- [ ] **Datasets** described with version, size, splits, preprocessing / 数据集描述完整
- [ ] **Baselines** are current and fair (not outperformed by a large margin on purpose) / 基线当前且公平
- [ ] **Metrics** justified for the task / 指标合理
- [ ] **Statistical significance** tested and reported (p-values, CIs) / 报告统计显著性
- [ ] **Multiple seeds** (≥ 3) with mean ± std / 多种子实验
- [ ] **Ablation study** isolates each contribution / 消融实验
- [ ] **Computational cost** reported (FLOPs, wall time, GPU hours) / 报告计算成本
- [ ] **Failure analysis** — when and why does it fail? / 失败分析

### Results Table Checklist / 结果表检查清单

```
□ Best results are bold (bold in LaTeX: \textbf{})
□ All numbers include variance (± std or confidence intervals)
□ Relative improvement stated (e.g., +3.2% over baseline)
□ Statistical significance noted (* for p<0.05, ** for p<0.01)
□ Oracle/upper bound included if appropriate
```

## Dimension 5: Ethics & Compliance / 伦理与合规

### Checklist / 检查清单

- [ ] **IRB/Ethics approval** mentioned if human subjects involved / 提及IRB批准
- [ ] **Data license** checked for redistribution / 检查数据许可证
- [ ] **Anonymization** complete for blind review / 盲审匿名化完成
- [ ] **Dual use** considerations addressed (for security-sensitive work) / 考虑双重用途
- [ ] **Environmental cost** estimated (for compute-heavy experiments) / 估算环境成本
- [ ] **Limitations** section included / 包含局限性说明
- [ ] **Broader impact** statement (for NeurIPS/ICML) / 更广泛影响声明

### Cross-Discipline Ethics / 跨学科伦理

| Discipline | Required | Standard |
|-----------|----------|----------|
| Medicine | IRB, informed consent, trial registration | Declaration of Helsinki |
| Social Science | IRB, anonymization, consent | APA Ethics Code |
| CS/AI | Bias assessment, fairness metrics | NeurIPS Ethics Checklist |
| Engineering | Safety certification if applicable | Domain standard |
| Natural Science | Data sharing, environmental impact | FAIR principles |

## Scoring Rubric / 评分标准

Each dimension scored 1-5:
| Score | Meaning |
|-------|---------|
| 5 | Publish as-is; reviewer will be impressed |
| 4 | Minor issues; address before submission |
| 3 | Significant issues; needs revision |
| 2 | Major issues; substantial rework needed |
| 1 | Fatal flaw; fundamental rethink required |

**Pass threshold**: All dimensions ≥ 3, average ≥ 3.5

## Review Report Template / 审查报告模板

```markdown
# Pre-Submission Review Report / 投前审查报告

**Paper**: [Title]
**Venue**: [Target venue]
**Date**: [Review date]
**Reviewer**: [Self / Peer]

## Scores / 评分

| Dimension | Score | Key Issue |
|-----------|-------|-----------|
| Contribution | ?/5 | |
| Technical | ?/5 | |
| Writing | ?/5 | |
| Experiments | ?/5 | |
| Ethics | ?/5 | |
| **Average** | **?/5** | |

## Verdict / 结论

- [ ] PASS — Ready for submission
- [ ] CONDITIONAL — Fix listed issues then submit
- [ ] REJECT — Major revision needed

## Top 3 Issues / 前三大问题

1. [Most critical issue]
2. [Second issue]
3. [Third issue]

## Detailed Notes / 详细说明

### Dimension 1: Contribution
[Scores and evidence]

### Dimension 2: Technical
[Scores and evidence]

### Dimension 3: Writing
[Scores and evidence]

### Dimension 4: Experiments
[Scores and evidence]

### Dimension 5: Ethics
[Scores and evidence]
```

## Integration / 集成

- Builds on `references/idea-evaluation.md` (contribution validation)
- Uses `references/figure-design-guide.md` (presentation quality)
- Extends `workflows/experiment-design.md` (experimental rigor)
- Complements `references/de-aigc-guide.md` (writing authenticity)
- Works with `references/research-integrity-guide.md` (fact verification)

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| Word count | texcount | `tlmgr install texcount` |
| Page count | pdfinfo | included in poppler |
| PDF metadata check | exiftool | `brew install exiftool` |
| Anonymization verify | manual review | — |
| Citation validation | bibtex -terse | included in TeXLive |
| Spell check | aspell | `brew install aspell` |
| Grammar check | LanguageTool | `pip install languagetool` |
| LaTeX diff | latexdiff | `tlmgr install latexdiff` |
