# Hypothesis Generation & Critical Thinking / 假设生成与批判性思维

Structured method for generating, evaluating, and testing research hypotheses.
结构化研究假设的生成、评估和检验方法。

## Positioning / 定位

```
Research Pipeline:
研究流水线：

idea-eval → ★hypothesis★ → experiment → stat-analysis → ...
构思评估  → 假设生成     → 实验设计  → 统计分析

Why hypothesis comes BEFORE experiment design:
为什么假设在实验设计之前：

• idea-eval tells you the direction is promising
  构思评估告诉你方向有价值
• hypothesis tells you EXACTLY what to test
  假设告诉你具体要检验什么
• experiment design is then derived FROM the hypothesis
  实验设计由假设推导而来
• Without hypothesis: experiments are exploratory, not confirmatory
  没有假设：实验是探索性的，不是验证性的
```

## Step 1: Gap → Hypothesis Mapping / 空白→假设映射

From literature review and deep reading (see `references/deep-reading-guide.md`), extract research gaps:

| Gap # | Description | Source | Why Important |
|-------|------------|--------|---------------|
| G1 | [Specific unsolved problem] | [Paper X, Section Y] | [Consequence of not solving] |
| G2 | [Another gap] | [Paper Z] | [Impact] |

For each gap, formulate hypotheses:

| H# | Hypothesis Statement | Direction | Gap Addressed |
|----|---------------------|-----------|---------------|
| H1 | "Method X will improve Y by ≥10% on dataset Z" | Directional (+) | G1 |
| H2 | "Component A is necessary for the performance gain" | Directional (+) | G2 |
| H3 | "The improvement holds across domains A, B, C" | Non-directional | G1 |

## Step 2: Hypothesis Strength Evaluation / 假设强度评估

| Criterion | Strong (3) | Medium (2) | Weak (1) |
|-----------|-----------|-----------|---------|
| **Testable** | Clear metric, clear criterion | Metric exists but threshold unclear | Cannot be measured |
| **Falsifiable** | Defined outcome that would disprove | Partially falsifiable | Cannot be disproven |
| **Specific** | Precise conditions, dataset, metric | Some parameters vague | "Improves performance" |
| **Novel** | Not tested in any prior work | Tested in different context | Already demonstrated |
| **Impactful** | Result changes field practice | Interesting but not field-changing | Trivial improvement |

**Minimum score for proceeding**: ≥ 12/15 (average ≥ 2.4)

## Step 3: Falsification Criteria / 证伪标准

For each hypothesis, define BEFORE running experiments:

| H# | If result < X, hypothesis is FALSIFIED | If result X-Y, INCONCLUSIVE | If result > Y, SUPPORTED |
|----|---------------------------------------|----------------------------|--------------------------|
| H1 | < 2% improvement | 2-10% | ≥ 10% improvement |
| H2 | Removal has < 0.5% impact | 0.5-2% impact | > 2% impact |
| H3 | Improves on < 2 of 3 domains | 2/3 domains | All 3 domains |

## Step 4: Critical Thinking Framework / 批判性思维框架

### Common Reasoning Fallacies in Research

| Fallacy | Description | Example | Fix |
|---------|------------|---------|-----|
| **Post hoc** | A happened before B, so A caused B | "Model improved after adding attention" | Run controlled ablation |
| **Cherry-picking** | Only reporting favorable results | "Achieves 95% on Dataset A" (silent on B) | Report ALL datasets |
| **Straw man** | Comparing to weak baselines | "Outperforms vanilla RNN" in 2026 | Compare to SOTA |
| **Texas sharpshooter** | Drawing target after shooting | Finding pattern in random data | Pre-register hypothesis |
| **Appeal to authority** | "Professor X used this method" | Citing名人 without evidence | Evaluate the method on merits |
| **False dilemma** | "Either X or Y" when Z exists | "Rule-based vs neural" | Consider hybrid approaches |
| **Hasty generalization** | Small sample → broad claim | "Works on 2 datasets" → "general" | Test on ≥ 5 diverse datasets |
| **Survivorship bias** | Only studying successes | Analyzing only accepted papers | Include failures/rejections |

### Hypothesis Validation Checklist

- [ ] Hypothesis is stated BEFORE seeing results
- [ ] Falsification criterion is defined a priori
- [ ] Multiple hypotheses considered (not just one)
- [ ] Alternative explanations acknowledged
- [ ] Statistical test is pre-specified (not chosen post-hoc)
- [ ] Sample size justified (power analysis done)

## Step 5: Hypothesis → Experiment Mapping / 假设→实验映射

```
H1: "Method X improves Y"
  → Main experiment: compare X vs baselines on Y
  → Metric: [specific metric]
  → Statistical test: paired t-test or Wilcoxon

H2: "Component A is necessary"
  → Ablation experiment: full model vs -A
  → Metric: performance delta
  → Statistical test: paired t-test on per-sample results

H3: "Improvement holds across domains"
  → Transfer experiment: test on domains A, B, C
  → Metric: performance on each domain
  → Statistical test: Friedman test + post-hoc
```


## Cross-Discipline Adaptation / 跨学科适配

| Discipline | Hypothesis Pattern | Typical Falsification |
|-----------|-------------------|----------------------|
| CS/AI | Ablation hypothesis (remove component → performance drops) | Counter-example, adversarial input |
| Medicine | Clinical hypothesis (intervention → outcome) | RCT negative result, side effect |
| Physics | Predictive hypothesis (theory → measurement) | Experiment contradicts prediction |
| Social Science | Causal hypothesis (policy → welfare) | Natural experiment fails to replicate |
| Economics | Market hypothesis (variable → price/output) | Out-of-sample prediction failure |
| Biology | Mechanistic hypothesis (gene/protein → phenotype) | Knockout experiment, confocal imaging |
| Engineering | Performance hypothesis (design → metric) | Benchmark under edge conditions |

## Integration / 集成

- Follows `references/idea-evaluation.md` (idea is validated → now formulate hypotheses)
- Feeds `workflows/experiment-design.md` (experiments derived from hypotheses)
- Supports `references/deep-reading-guide.md` (gaps identified during deep reading)
- Connects to `references/pre-submission-review.md` (claims verified against hypotheses)

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| Gap identification | Semantic Scholar API | free |
| Citation analysis | OpenAlex API | free |
| Concept mapping | VOSviewer | https://vosviewer.com |
| Hypothesis testing | scipy + statsmodels | `pip install scipy statsmodels` |
| Experiment planning | Jupyter | `pip install jupyter` |
| Literature mapping | Connected Papers | https://connectedpapers.com |
