# Statistical Analysis Guide / 统计分析指南

Method selection, execution, and reporting for all research disciplines.
全学科统计方法选择、执行和报告。

## Decision Tree: Which Test? / 决策树：用什么检验？

```
What type of data?
│
├── Continuous (e.g., accuracy, time, temperature)
│   ├── 2 groups
│   │   ├── Paired (same subjects) → Paired t-test (normal) / Wilcoxon signed-rank (non-normal)
│   │   └── Unpaired → Welch's t-test / Mann-Whitney U
│   ├── 3+ groups
│   │   ├── One factor → One-way ANOVA / Kruskal-Wallis
│   │   ├── Two factors → Two-way ANOVA / Friedman test
│   │   └── Repeated measures → Repeated measures ANOVA / Friedman
│   └── Relationship between variables
│       ├── One predictor → Linear regression
│       ├── Multiple predictors → Multiple regression
│       └── Non-linear → Polynomial / GAM
│
├── Categorical (e.g., correct/incorrect, yes/no)
│   ├── 2 × 2 table → Chi-square test / Fisher's exact (small N)
│   ├── Larger table → Chi-square test of independence
│   └── Proportion → One-proportion z-test / Two-proportion z-test
│
├── Survival / Time-to-event
│   └── Kaplan-Meier + Log-rank test / Cox regression
│
└── Ranked / Ordinal
    ├── 2 groups → Wilcoxon / Mann-Whitney U
    └── 3+ groups → Kruskal-Wallis / Friedman
```

## Effect Size Reporting / 效应量报告

Always report effect size alongside p-values. P-value tells you IF there's a difference; effect size tells you HOW BIG.

| Test | Effect Size | Small | Medium | Large |
|------|-----------|-------|--------|-------|
| t-test | Cohen's d | 0.2 | 0.5 | 0.8 |
| ANOVA | η² (eta-squared) | 0.01 | 0.06 | 0.14 |
| Correlation | r | 0.1 | 0.3 | 0.5 |
| Chi-square | Cramér's V | 0.1 | 0.3 | 0.5 |
| Regression | R² | 0.02 | 0.13 | 0.26 |
| Odds Ratio | OR | 1.5 | 2.0 | 3.0 |

### Reporting Format

```
[Method A] achieved [mean ± SD] compared to [Method B] [mean ± SD]
(t(df) = X.XX, p = X.XX, d = X.XX, 95% CI [X.XX, X.XX]).
```

## Multiple Comparison Correction / 多重比较校正

| Method | When to Use | How |
|--------|------------|-----|
| **Bonferroni** | Few comparisons (< 5) | α / n_comparisons |
| **Holm-Bonferroni** | Moderate (5-20) | Sequential rejection |
| **Benjamini-Hochberg** | Many comparisons (> 20) | Control FDR, not FWER |
| **Tukey HSD** | All pairwise (ANOVA post-hoc) | Honest significant difference |
| **Dunnett** | Each vs control | Compare treatments to one control |

**Rule**: If you report > 1 p-value in a table, you MUST correct for multiple comparisons.

## Power Analysis / 功效分析

### Pre-study Sample Size Calculation

```python
from scipy import stats
import numpy as np

def sample_size_ttest(effect_size, alpha=0.05, power=0.80):
    """Minimum sample size per group for two-sample t-test."""
    z_alpha = stats.norm.ppf(1 - alpha/2)
    z_beta = stats.norm.ppf(power)
    n = 2 * ((z_alpha + z_beta) / effect_size) ** 2
    return int(np.ceil(n))

# Example: detect medium effect (d=0.5) with 80% power
print(sample_size_ttest(0.5))  # → 64 per group
```

### Post-hoc Power (for reporting)

Report achieved power: "With N=30 per group, our study achieved 80% power to detect effects of d ≥ 0.74."

## Confidence Intervals / 置信区间

Always report alongside point estimates:

| Statistic | 95% CI Formula |
|-----------|---------------|
| Mean | x̄ ± t₀.₉₇₅ × (s/√n) |
| Proportion | p̂ ± z₀.₉₇₅ × √(p̂(1-p̂)/n) |
| Difference in means | (x̄₁-x̄₂) ± t × SE_diff |
| Regression coefficient | β̂ ± t₀.₉₇₅ × SE(β̂) |

## Cross-Discipline Standards / 跨学科标准

| Discipline | Significance Level | Required Reporting | Standard |
|-----------|-------------------|-------------------|----------|
| Medicine | p < 0.05 | Effect size + CI + power | CONSORT/STROBE |
| CS/AI | p < 0.05 or < 0.01 | Mean ± std over ≥ 3 seeds | NeurIPS/ICML |
| Social Science | p < 0.05 | β + SE + p + R² | APA 7th |
| Physics | Varies (5σ for discovery) | Uncertainty propagation | ISO Guide |
| Economics | p < 0.05 | Coefficient + robust SE | Econometrics standard |
| Engineering | p < 0.05 | Mean + tolerance | Engineering standard |
| Biology | p < 0.05 | Mean ± SEM or SD | Journal-specific |

## Tool Recommendations / 工具推荐

### Python

| Task | Tool | Install |
|------|------|---------|
| General stats | scipy.stats | `pip install scipy` |
| Regression, ANOVA | statsmodels | `pip install statsmodels` |
| ML + metrics | scikit-learn | `pip install scikit-learn` |
| Bayesian | pymc | `pip install pymc` |
| Survival | scikit-survival | `pip install scikit-survival` |
| Effect sizes | custom or pingouin | `pip install pingouin` |
| Multiple comparisons | statsmodels.multitest | included |

### R

| Task | Package | Install |
|------|---------|---------|
| General stats | stats (built-in) | built-in |
| Effect sizes | effectsize | `install.packages("effectsize")` |
| Power analysis | pwr | `install.packages("pwr")` |
| Meta-analysis | meta | `install.packages("meta")` |
| Survival | survival | `install.packages("survival")` |
| Panel data | plm | `install.packages("plm")` |
| Reporting | apaTables | `install.packages("apaTables")` |

### Stata

| Task | Command |
|------|---------|
| t-test | `ttest var, by(group)` |
| ANOVA | `anova var group` |
| Regression | `regress y x1 x2` |
| Power | `power twomeans` |
| Survival | `sts test group` |
| Panel | `xtreg y x, fe` |
| IV | `ivregress 2sls` |
| DID | `diff outcome, treated(group) period(time)` |

## Integration / 集成

- Follows `references/hypothesis-generation-guide.md` (hypotheses → statistical tests)
- Supports `workflows/experiment-design.md` (analysis plan in Step 3)
- Feeds `workflows/paper-writing.md` (results reporting)
- Connects to `references/pre-submission-review.md` (Dimension 4: Experimental Rigor)

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Python Tool | R Package | Stata Command |
|------|-----------|-----------|---------------|
| Hypothesis testing | scipy.stats | stats | ttest / anova |
| Regression | statsmodels | lm / glm | regress |
| Mixed models | statsmodels | lme4 | mixed |
| Power analysis | statsmodels | pwr | power |
| Multiple comparisons | statsmodels | multcomp | pwcompare |
| Survival analysis | lifelines | survival | stcox |
| Bayesian analysis | pymc | rstan | bayes |
| Meta-analysis | meta (Python) | meta | meta |
