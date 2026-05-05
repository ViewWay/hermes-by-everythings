---
name: statsmodels
description: Statistical modeling and econometrics. Use for regression, time series analysis, hypothesis testing, and econometric models (OLS, IV, panel data, VAR).
domain: cross-domain
install: pip install statsmodels
---

# Statsmodels: Statistical Modeling & Econometrics

## Overview

Statsmodels provides R-style statistical modeling in Python — estimation, hypothesis testing, confidence intervals, and diagnostics. Essential for economics, social science, epidemiology, and any field requiring rigorous statistical inference.

## When to Use

- Regression (OLS, WLS, GLM, logistic)
- Time series (ARIMA, VAR, state space)
- Econometrics (IV, panel data, difference-in-differences)
- Hypothesis testing with detailed output
- Publication-ready regression tables

## Quick Start

```python
import statsmodels.api as sm
import statsmodels.formula.api as smf

# OLS regression with formula API
model = smf.ols('y ~ x1 + x2 + C(category)', data=df).fit()
print(model.summary())

# With robust standard errors
model = smf.ols('y ~ x1 + x2', data=df).fit(cov_type='HC3')
print(model.summary())

# Predictions with confidence intervals
predictions = model.get_prediction(new_data)
predictions.summary_frame(alpha=0.05)
```

## Core Capabilities

### 1. Regression Models

```python
# OLS
model = sm.OLS(y, sm.add_constant(X)).fit()

# Logistic regression
model = sm.Logit(y, sm.add_constant(X)).fit()
model = smf.logit('binary_outcome ~ x1 + x2', data=df).fit()

# Generalized Linear Model
model = smf.glm('count ~ x1 + x2', data=df, family=sm.families.Poisson()).fit()

# Robust standard errors
model.fit(cov_type='HC0')    # White heteroskedasticity-consistent
model.fit(cov_type='HC3')    # MacKinnon-White
model.fit(cov_type='cluster', cov_kwds={'groups': df['cluster_var']})  # Clustered

# Instrumental Variables (2SLS)
from statsmodels.sandbox.regression.gmm import IV2SLS
model = IV2SLS(df['y'], df[['const', 'x1']], df['instrument'], df['x_endo']).fit()
```

### 2. Time Series

```python
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.stattools import adfuller, grangercausalitytests

# Unit root test
adf_result = adfuller(df['series'])
print(f'ADF stat: {adf_result[0]:.4f}, p-value: {adf_result[1]:.4f}')

# ARIMA
model = ARIMA(df['y'], order=(1, 1, 1)).fit()
print(model.summary())
forecast = model.forecast(steps=10)

# VAR (Vector Autoregression)
from statsmodels.tsa.api import VAR
model = VAR(df[['y1', 'y2']]).fit(maxlags=5, ic='aic')
```

### 3. Regression Tables for Papers

```python
from statsmodels.iolib.summary2 import summary_col

# Compare multiple models
models = [model1, model2, model3]
table = summary_col(models, stars=True, float_format='%.3f',
                     model_names=['OLS', 'FE', 'IV'],
                     info_dict={'N': lambda x: f'{int(x.nobs)}',
                                'R²': lambda x: f'{x.rsquared:.3f}'})
print(table.as_latex())  # LaTeX output for paper
```

## Best Practices

1. **Always use `sm.add_constant(X)`**: OLS without constant is rarely correct
2. **Use formula API**: `smf.ols('y ~ x1 + x2', data=df)` is cleaner and handles dummies automatically
3. **Report robust SE**: Use `cov_type='HC3'` by default for cross-sectional data
4. **Check diagnostics**: `sm.stats.diagnostic.het_breuschpagan()`, `sm.stats.stattools.durbin_watson()`

## Common Pitfalls

1. **Missing constant**: `sm.add_constant(X)` is required for intercept
2. **Perfect multicollinearity**: Drop one category or use formula API
3. **Logistic regression convergence**: Try `method='bfgs'` or increase `maxiter`

## Integration with HBE

- Primary econometrics tool in `references/statistical-analysis-guide.md`
- Supports `references/causal-inference-guide.md` for IV and panel data methods
- Works with `references/tool-registry.md` economics tools

## Resources

- Documentation: https://www.statsmodels.org/stable/
- Seabold & Perktold (2010) "Statsmodels" — SciPy proceedings
