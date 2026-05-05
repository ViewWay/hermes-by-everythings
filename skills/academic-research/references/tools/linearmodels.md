---
name: linearmodels
description: Panel data econometrics — fixed effects, random effects, instrumental variables, and between/within estimators
domain: Economics / Social Science
install: pip install linearmodels
---

# linearmodels — Panel Data Econometrics / 面板数据计量经济学

linearmodels extends statsmodels with panel data estimators: fixed effects, random effects, between estimator, first differences, and instrumental variables (2SLS, 3SLS, GMM).

## When to Use / 适用场景

- Fixed effects / random effects regression with panel data
- Instrumental variable estimation (2SLS, IV-GMM)
- Hausman test for FE vs RE model selection
- Difference-in-differences with panel data
- Cluster-robust standard errors

## Quick Start / 快速开始

```python
import pandas as pd
from linearmodels.panel import PanelOLS, RandomEffects, BetweenOLS
from linearmodels.iv import IV2SLS

# Prepare panel data (entity-time multi-index)
df = pd.read_csv("panel_data.csv")
df = df.set_index(["firm_id", "year"])

# Fixed Effects (Within estimator)
fe_model = PanelOLS(df.y, df[["x1", "x2"]], entity_effects=True)
fe_result = fe_model.fit(cov_type="clustered", cluster_entity=True)
print(fe_result)

# Random Effects
re_model = RandomEffects(df.y, df[["x1", "x2"]])
re_result = re_model.fit()
```

## Core Capabilities / 核心能力

### 1. Panel Estimators / 面板估计器

```python
from linearmodels.panel import PanelOLS, RandomEffects, BetweenOLS, FirstDifferenceOLS

# Entity Fixed Effects
fe = PanelOLS(df.y, df[["x1", "x2"]], entity_effects=True)
# Entity + Time Fixed Effects
twoway_fe = PanelOLS(df.y, df[["x1", "x2"]], entity_effects=True, time_effects=True)

# Random Effects
re = RandomEffects(df.y, df[["x1", "x2"]])

# Between Estimator (cross-sectional)
be = BetweenOLS(df.y, df[["x1", "x2"]])

# First Difference
fd = FirstDifferenceOLS(df.y, df[["x1", "x2"]])
```

### 2. Instrumental Variables / 工具变量

```python
from linearmodels.iv import IV2SLS, IVGMM, IV3SLS

# 2SLS estimation
iv_model = IV2SLS(
    dependent=df.y,
    exog=df[["x1"]],
    endog=df[["x2"]],
    instruments=df[["z1", "z2"]]
)
iv_result = iv_model.fit(cov_type="robust")
print(iv_result)

# GMM estimation (heteroskedasticity-robust)
gmm = IVGMM(df.y, df[["x1"]], df[["x2"]], df[["z1", "z2"]])
gmm_result = gmm.fit()
```

### 3. Hypothesis Testing / 假设检验

```python
# Hausman test (FE vs RE)
from linearmodels.panel import compare
comparison = compare({"FE": fe_result, "RE": re_result})

# F-test for fixed effects
print(fe_result.f_statistic)

# Wald test for coefficients
print(fe_result.wald_test)
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Panel Data Regression Table / 面板回归结果表

```python
from linearmodels.panel import PanelOLS, RandomEffects, PooledOLS
from linearmodels.panel import compare
import pandas as pd

df = pd.read_csv("panel.csv").set_index(["id", "year"])

# Estimate multiple specifications
pooled = PooledOLS(df.y, sm.add_constant(df[["x1", "x2"]])).fit()
fe = PanelOLS(df.y, df[["x1", "x2"]], entity_effects=True).fit(cov_type="clustered", cluster_entity=True)
re = RandomEffects(df.y, df[["x1", "x2"]]).fit()

# Comparison table
table = compare({"Pooled OLS": pooled, "FE": fe, "RE": re})
print(table)
```

## Best Practices / 最佳实践

- Use Hausman test to choose between FE and RE
- Report cluster-robust standard errors for panel data
- Always include time fixed effects when time-varying confounders may exist

## Common Pitfalls / 常见陷阱

- **Multi-index requirement**: Data must have entity-time multi-index
- **Demeaning**: FE demeans variables within entity; time-invariant variables are absorbed
- **Cluster SE**: Standard errors without clustering are usually incorrect in panel data

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/statsmodels.md` for cross-sectional analysis
- Use with `references/tools/pandas.md` for panel data preparation
- Combine with `references/tools/matplotlib.md` for coefficient plots

## Resources / 资源

- Documentation: https://bashtage.github.io/linearmodels/
- Paper: See documentation references for econometric methods
