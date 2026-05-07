# Paper Writing Workflow / 论文写作工作流

## Overview / 概览

端到端学术论文写作流水线，含质量检查点。

End-to-end academic paper writing pipeline with quality checkpoints.

## Phase 1: Planning / 规划阶段

### 1.1 Define Target Venue / 确定目标会议

Select venue and load corresponding template:
```bash
/hbe-academic template <venue>
```

Note: page limit, column format, bibliography style, anonymization requirements, supplementary guidelines.

### 1.2 Create Outline / 创建大纲

```
Abstract (150-250 words)
1. Introduction (1-1.5 pages)
2. Related Work (0.5-1 page)
3. Method / Approach (2-3 pages)
4. Experiments (2-3 pages)
5. Conclusion (0.5 page)
Appendix (unlimited)
```

### 1.3 Claims-to-Experiments Mapping / 论点到实验的映射

| Claim | Supporting Experiment | Metric | Baseline |
|-------|----------------------|--------|----------|
| Our method outperforms X | Main comparison | Accuracy/F1 | X, Y, Z |
| Component A is important | Ablation | Δ performance | Full model |

## Phase 2: Writing / 写作阶段（按章节顺序）

Write in this order for maximum efficiency:

### 2.1 Method / 方法（最先写）
- Mathematical notation table
- Algorithm pseudocode (algorithm2e)
- Architecture diagrams (TikZ)

### 2.2 Experiments / 实验（第二写）
- Setup (datasets, metrics, hyperparameters)
- Main results table (booktabs)
- Ablation study
- Qualitative analysis

### 2.3 Related Work / 相关工作（第三写）
- Organized by theme, not chronologically
- Clear differentiation: "Unlike [X], our approach..."

### 2.4 Introduction / 引言（第四写）
- Context → Problem → Approach → Results → Contributions

### 2.5 Abstract / 摘要（最后写）
Formula: Context → Gap → Method → Key Result → Impact

### 2.6 Conclusion / 结论
- Contributions summary
- Limitations (honest)
- Future work

## Phase 3: Visual Elements / 视觉元素

### Figures / 图片
- Vector format (PDF/SVG)
- Readable at column width (≥ 8pt font)
- Color-blind friendly palette

### Tables / 表格
- booktabs only (no vertical lines)
- Best results in bold
- Std dev in parentheses

### Algorithms / 算法
- Use algorithm2e
- Include Input/Output declarations

## Phase 4: Quality Gates / 质量关卡

### Gate 1 — Structure / 结构检查（大纲完成后）
- [ ] All sections present
- [ ] Logical flow
- [ ] Claims map to experiments

### Gate 2 — 7-Dimension Review / 七维评审（草稿完成后）
1. Novelty (1-5)
2. Soundness (1-5)
3. Clarity (1-5)
4. Rigor (1-5)
5. Related work coverage (1-5)
6. Reproducibility (1-5)
7. Significance (1-5)

**Pass**: Average ≥ 3.5, no dimension < 3

### Gate 3 — Format / 格式检查（提交前）
- [ ] Page count OK
- [ ] Template compliant
- [ ] All refs cited, all cites in bib
- [ ] Anonymized (if blind)
- [ ] Supplementary complete

## Phase 5: Compilation ## Phase 5: Compilation & Submission Submission / 编译与提交

```bash
bash scripts/compile.sh -e xelatex -b -c main.tex
```

### Pre-Submission Checklist / 提交前检查清单
- [ ] No compilation errors
- [ ] No ?? cross-references
- [ ] Figures render correctly
- [ ] Spell-checked
- [ ] Co-author proofread

## Cross-References / 交叉引用

- **Writing principles**: Full guide in `references/writing-guide.md` (IMRAD, discipline conventions, sentence patterns)
- **De-AIGC**: Before submission, run `references/de-aigc-guide.md` five-dimension check
- **Figure design**: Follow `references/figure-design-guide.md` for three load-bearing figures
- **Templates**: Select venue template using `references/journal-templates-guide.md`
- **Pre-submission**: Run `references/pre-submission-review.md` five-dimension quality gate
- **AI collaboration**: Use `references/vibe-research-workflow.md` for human-AI writing process
- **Compilation**: Use `scripts/compile.sh` with auto-detected LaTeX engine
