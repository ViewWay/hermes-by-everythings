---
name: arch
description: ARCH/GARCH volatility models and unit root tests for financial and economic time series
domain: Social Science / Economics
install: pip install arch
---

# arch — ARCH/GARCH Volatility Models / 波动率建模

Python library for fitting volatility models (ARCH, GARCH, EGARCH, TGARCH, FIGARCH, HAR) and conducting unit root tests (ADF, Phillips-Perron, KPSS, Zivot-Andrews, DF-GLS) on financial and economic time series.

## When to Use / 适用场景

- Modeling conditional heteroskedasticity in asset returns, exchange rates, or commodity prices / 建模资产收益率条件异方差
- Forecasting Value-at-Risk (VaR) and Expected Shortfall (ES) for risk management / 预测风险价值
- Testing for unit roots and structural breaks in macroeconomic time series / 单位根检验与结构突变检测
- Estimating asymmetric volatility responses (leverage effects) in equity markets / 估计非对称波动率响应
- Constructing realized volatility measures and long-memory volatility models (HAR-RV) / 构建已实现波动率模型

## Quick Start / 快速开始

```python
from arch import arch_model
from arch.unitroot import ADF, PhillipsPerron, KPSS
import numpy as np

# Simulate returns with volatility clustering
np.random.seed(42)
returns = np.random.randn(1000) * 0.01
returns[500:] *= 2.5  # volatility regime shift

# Fit GARCH(1,1) with Student-t innovations
model = arch_model(returns, vol="Garch", p=1, q=1, dist="t", mean="AR", lags=1)
result = model.fit(disp="off")
print(result.summary())

# 5-step ahead volatility forecast
forecasts = result.forecast(horizon=5, reindex=False)
cond_var = forecasts.variance.iloc[-1]
print(f"\n5-step conditional variance forecast: {cond_var.values}")

# Unit root test
adf = ADF(returns, trend="c")
print(f"\nADF stat: {adf.stat:.4f}, p-value: {adf.pvalue:.4f}")
print(f"Critical values: {adf.critical_values}")
```

## Core Capabilities / 核心能力

### 1. GARCH Family Models / GARCH 族模型

The `arch` package supports GARCH, EGARCH (asymmetric), TGARCH/GJR-GARCH, and FIGARCH (fractional integration).

```python
from arch import arch_model

returns = ...  # pandas Series of asset returns

# Standard GARCH(1,1)
garch = arch_model(returns, vol="Garch", p=1, q=1, mean="Zero", dist="normal")
garch_fit = garch.fit(disp="off")

# EGARCH(1,1) — captures leverage effect (negative shocks increase volatility more)
egarch = arch_model(returns, vol="EGARCH", p=1, q=1, dist="t")
egarch_fit = egarch.fit(disp="off")

# TGARCH / GJR-GARCH(1,1) — threshold GARCH with asymmetry
tgarch = arch_model(returns, vol="GARCH", p=1, o=1, q=1, power=2.0, dist="skewt")
tgarch_fit = tgarch.fit(disp="off")

# Model selection via AIC/BIC
for name, fit in [("GARCH", garch_fit), ("EGARCH", egarch_fit), ("TGARCH", tgarch_fit)]:
    print(f"{name:8s}  AIC={fit.aic:.2f}  BIC={fit.bic:.2f}")
```

### 2. Unit Root Tests / 单位根检验

Comprehensive suite of unit root and stationarity tests with trend and lag selection.

```python
from arch.unitroot import ADF, PhillipsPerron, KPSS, ZivotAndrews, DFGLS
import pandas as pd

series = pd.read_csv("data/gdp_quarterly.csv", parse_dates=["date"], index_col="date")["gdp"]

# Augmented Dickey-Fuller test
adf = ADF(series, trend="ct", method="BIC")  # ct = constant + trend
print(f"ADF: stat={adf.stat:.4f}, p={adf.pvalue:.4f}, lags={adf.lags}")

# Phillips-Perron test (non-parametric, robust to serial correlation)
pp = PhillipsPerron(series, trend="c", lags=12)
print(f"PP:  stat={pp.stat:.4f}, p={pp.pvalue:.4f}")

# KPSS test (null = stationarity; opposite of ADF)
kpss = KPSS(series, trend="c", lags=12)
print(f"KPSS: stat={kpss.stat:.4f}, p={kpss.pvalue:.4f}")

# Zivot-Andrews test (allows one endogenous structural break)
za = ZivotAndrews(series, trim=0.15)
print(f"ZA:  stat={za.stat:.4f}, break date={za.baseline}")

# DF-GLS test (efficient detrending, more powerful than ADF)
dfgls = DFGLS(series, trend="ct", method="BIC")
print(f"DF-GLS: stat={dfgls.stat:.4f}, p={dfgls.pvalue:.4f}")
```

### 3. Volatility Forecasting and VaR / 波动率预测与风险价值

```python
from arch import arch_model
import numpy as np

returns = ...  # pandas Series of daily log returns

# Fit best model
model = arch_model(returns, vol="Garch", p=1, q=1, dist="t")
result = model.fit(disp="off", last_obs="2024-01-01")  # out-of-sample split

# Rolling 1-step forecasts
forecasts = result.forecast(start="2024-01-01", reindex=False)
cond_vol = np.sqrt(forecasts.variance.iloc[:, 0])

# 1-day VaR at 99% with Student-t distribution
params = result.params
nu = params["nu"]  # degrees of freedom
mu = params["mu"]
from scipy.stats import t
var_99 = mu + cond_vol * t.ppf(0.01, df=nu)
print(f"99% VaR (mean): {var_99.mean():.4f}")

# Expected Shortfall (conditional VaR)
es_99 = mu + cond_vol * (t.pdf(t.ppf(0.01, df=nu), df=nu) / 0.01)
print(f"99% ES (mean):  {es_99.mean():.4f}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Financial Volatility Analysis for a Paper / 金融波动率分析

```python
import pandas as pd
import numpy as np
from arch import arch_model
from arch.unitroot import ADF, KPSS
import matplotlib.pyplot as plt

# 1. Load data
df = pd.read_csv("data/sp500_daily.csv", parse_dates=["date"], index_col="date")
df["log_ret"] = 100 * np.log(df["close"] / df["close"].shift(1))
returns = df["log_ret"].dropna()

# 2. Unit root test on price levels
price_levels = ADF(df["close"], trend="c", method="BIC")
print(f"ADF on prices: stat={price_levels.stat:.4f}, p={price_levels.pvalue:.4f}")
ret_stationary = ADF(returns, trend="n", method="BIC")
print(f"ADF on returns: stat={ret_stationary.stat:.4f}, p={ret_stationary.pvalue:.4f}")

# 3. Fit competing models
models = {
    "GARCH(1,1)-Normal": arch_model(returns, vol="Garch", p=1, q=1, dist="normal"),
    "GARCH(1,1)-t":     arch_model(returns, vol="Garch", p=1, q=1, dist="t"),
    "EGARCH(1,1)-t":    arch_model(returns, vol="EGARCH", p=1, q=1, dist="t"),
    "GJR-GARCH(1,1)-t": arch_model(returns, vol="GARCH", p=1, o=1, q=1, dist="t"),
}
results = {}
for name, mod in models.items():
    fit = mod.fit(disp="off")
    results[name] = fit
    print(f"{name:22s} AIC={fit.aic:.2f}  BIC={fit.bic:.2f}  "
          f"alpha={fit.params.get('alpha[1]', 0):.4f}  "
          f"beta={fit.params.get('beta[1]', 0):.4f}")

# 4. Residual diagnostics (Ljung-Box on squared standardized residuals)
best = min(results.values(), key=lambda f: f.aic)
std_resid = best.resid / best.conditional_volatility
from statsmodels.stats.diagnostic import acorr_ljungbox
lb = acorr_ljungbox(std_resid**2, lags=[5, 10], return_df=True)
print(f"\nLjung-Box on squared std. residuals:\n{lb}")

# 5. Plot conditional volatility
fig, ax = plt.subplots(figsize=(12, 4))
ax.plot(best.conditional_volatility, linewidth=0.5)
ax.set_ylabel("Conditional Volatility")
ax.set_title(f"Best model: {best.model.volatility.spec}")
plt.tight_layout()
plt.savefig("figures/volatility_forecast.pdf", dpi=300)
```

## Best Practices / 最佳实践

- **Use `mean="Zero"` for centered returns**: If you already de-meaned returns, specifying `mean="Zero"` avoids estimating unnecessary parameters / 已去均值的数据用零均值模型
- **Select lags via information criteria**: Use `method="BIC"` in ADF and let `arch_model` auto-select lags / 用信息准则选择滞后阶数
- **Report standardized residual diagnostics**: Always test for remaining ARCH effects (Ljung-Box on squared residuals) to validate model adequacy / 报告标准化残差诊断
- **Use Student-t or skew-t for financial returns**: Normal GARCH underestimates tail risk; `dist="t"` or `dist="skewt"` capture fat tails / 金融数据用 t 分布
- **Compare AIC and BIC jointly**: AIC favors complexity (better forecast), BIC favors parsimony (better explanation). Report both / 同时报告 AIC 和 BIC

## Common Pitfalls / 常见陷阱

- **Fitting GARCH on non-stationary series**: GARCH models require stationary returns. Always test with ADF/KPSS first. Difference prices to get returns / GARCH 需要平稳序列
- **Ignoring asymmetry in equity returns**: Negative shocks increase volatility more than positive ones (leverage effect). Use EGARCH or GJR-GARCH instead of plain GARCH / 权益收益率具有非对称性
- **Overfitting with high p, q**: GARCH(1,1) captures most volatility dynamics. GARCH(2,2)+ rarely improves forecasts and risks overfitting / 避免过度拟合高阶模型
- **In-sample vs out-of-sample confusion**: AIC/BIC are in-sample criteria. For forecast evaluation, use rolling window backtests with actual loss functions (QLIKE, MSE on realized variance) / 区分样本内和样本外评估
- **Forgetting to annualize volatility**: GARCH conditional variance is daily. Annualize by multiplying by sqrt(252) for reporting / 年化波动率需乘以 sqrt(252)

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for time series study design and stationarity testing protocols
- Pair with `references/tools/pandas.md` for financial data wrangling (log returns, rolling windows)
- Combine with `references/tools/matplotlib.md` for volatility plot formatting and multi-panel figures
- Export to LaTeX tables with `references/tools/inkscape-cli.md` for model comparison summaries

## Resources / 资源

- Documentation: https://arch.readthedocs.io/
- GitHub: https://github.com/bashtage/arch
- Engle (1982), "Autoregressive Conditional Heteroscedasticity with Estimates of the Variance of United Kingdom Inflation"
- Bollerslev (1986), "Generalized Autoregressive Conditional Heteroskedasticity"
- Hansen & Lunde (2005), "A Forecast Comparison of Volatility Models: Does Anything Beat a GARCH(1,1)?"
