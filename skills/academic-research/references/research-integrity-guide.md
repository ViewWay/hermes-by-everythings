# Research Integrity & Verification Guide / 研究诚信与验证指南

Multi-layer verification for academic research across all disciplines.
跨学科多层次学术研究验证体系。

## Verification Framework / 验证框架

### Layer 1: Citation Integrity / 引文诚信 (5-Step Mandatory Process)

1. **Existence check**: Does the cited paper actually exist? Verify via DOI, arXiv ID, or publisher URL.
2. **Claim accuracy**: Does the paper actually support the claim being made? Read the original, not just the abstract.
3. **Metadata correctness**: Are authors, year, venue, title correct in BibTeX? Cross-check with Semantic Scholar or Google Scholar.
4. **BibTeX validity**: Does the entry compile without errors? Test with `bibtex` or `biber`.
5. **Consistency**: Is the citation key used consistently across all `\cite{}` calls?

### Layer 2: Fact-Checking Protocol / 事实核查协议

For each factual claim in the paper:

| Check | Method | Tool |
|-------|--------|------|
| Numerical accuracy | Re-calculate from source data | Python/R calculator |
| Statistical claims | Verify p-values, CIs, effect sizes | statsmodels / R |
| Dataset references | Verify version, size, splits | Papers With Code |
| Method attribution | Trace to original paper | Semantic Scholar API |
| Historical claims | Cross-reference multiple sources | Google Scholar + Wikipedia |

### Layer 3: Methodology Audit / 方法论审计

**Experimental papers / 实验论文**:
- [ ] Datasets described with version, size, splits, preprocessing
- [ ] Baselines are current (last 2 years, top venues)
- [ ] Hyperparameter search protocol documented
- [ ] Statistical significance tests specified (t-test, Wilcoxon, bootstrap)
- [ ] Reproducibility: seed, code, environment documented
- [ ] Ablation study isolates each claimed contribution

**Theoretical papers / 理论论文**:
- [ ] Assumptions stated explicitly and justified
- [ ] Proofs verified step-by-step (no skipped steps)
- [ ] Theorems checked against known counterexamples
- [ ] Complexity analysis verified independently

**Survey papers / 综述论文**:
- [ ] Search protocol follows PRISMA guidelines
- [ ] Inclusion/exclusion criteria stated a priori
- [ ] Coverage: all major venues in the field
- [ ] Bias assessment: language, publication year, venue

### Layer 4: Cross-Disciplinary Integrity / 跨学科诚信

| Discipline | Specific Checks | Verification Tool |
|-----------|----------------|-------------------|
| Medicine | CONSORT/STROBE compliance, IRB approval mentioned | EQUATOR Network |
| Social Science | IRB, informed consent, anonymization protocol | APA Ethics |
| Natural Science | Raw data availability, measurement uncertainty | DataCite |
| Engineering | Benchmark reproducibility, hardware specification | Papers With Code |
| Humanities | Primary source verification, translation accuracy | Library catalog |

## Hallucination Detection / 幻觉检测

### Common AI Hallucination Patterns in Academic Writing

1. **Fabricated citations**: Paper title sounds plausible but doesn't exist → verify every citation
2. **Inflated results**: Numbers that look too good → cross-check against benchmarks
3. **Method conflation**: Mixing methods from different papers → trace each method to its source
4. **Historical revisionism**: Claiming "first" or "novel" without thorough prior art search → Semantic Scholar backward citations
5. **Dataset confusion**: Wrong statistics for well-known datasets → check dataset documentation

### Detection Checklist

```
□ Every "X et al. (YEAR)" maps to a real, verifiable publication
□ Every numerical result can be traced to an experiment or a cited source  
□ Every "state-of-the-art" claim has a 2024-2026 baseline comparison
□ Every "first" claim has been checked against prior work
□ Every dataset mention matches the actual dataset statistics
```

## Plagiarism & Self-Plagiarism / 抄袭与自我抄袭

### Text Similarity Thresholds

| Type | Acceptable | Warning | Problematic |
|------|-----------|---------|-------------|
| Single source | < 3% | 3-7% | > 7% |
| Self-plagiarism | < 10% | 10-25% | > 25% |
| Overall (iThenticate) | < 15% | 15-25% | > 25% |

### Prevention Strategies

1. Write summaries from notes, not from the original text
2. For methodology descriptions, paraphrase and cite
3. Use quotation marks for exact phrases (>6 words)
4. Check self-plagiarism before resubmitting related work

## Verification Commands / 验证命令

```bash
# Check all citations exist via DOI
python3 your_verify_script.py references.bib  # replace with your validation script

# Run statistical verification
python3 your_stats_verify.py results/  # replace with your validation script

# Check BibTeX validity
bibtex -terse aux_file.aux 2>&1 | grep "Warning"

# Verify LaTeX cross-references
pdflatex -interaction=nonstopmode main.tex 2>&1 | grep "undefined"
```

## Integration / 集成

- Works with `references/citation-workflow.md` for BibTeX management
- Complements `references/writing-guide.md` for clarity
- Feeds into `references/pre-submission-review.md` quality gates

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| DOI verification | doi.org API | `curl` |
| Citation validation | bibtex -terse | included in TeXLive |
| Plagiarism detection | Turnitin / iThenticate | institutional |
| AI detection | GPTZero | web tool |
| Fact-checking | Semantic Scholar API | free |
| Statistical audit | scipy + statsmodels | `pip install scipy statsmodels` |
| BibTeX validation | bibtex-tidy | `npm install -g bibtex-tidy` |
