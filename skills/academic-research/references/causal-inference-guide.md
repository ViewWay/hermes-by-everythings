# Causal Inference Pipeline / 因果推断流水线

Comprehensive 8-step closed-loop causal inference pipeline for empirical research, covering DID, IV, RDD, PSM, SCM, DML, and Causal Forest with working Python code for each method.
面向实证研究的完整 8 步闭环因果推断流水线，覆盖 DID、IV、RDD、PSM、SCM、DML、因果森林，每种方法均配备可运行的 Python 代码。

> **Source / 来源**: Distilled from [Awesome-Agent-Skills-for-Empirical-Research](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research) (Stanford REAP × CoPaper.AI) — StatsPAI 900+ function ecosystem.
> Architecture inspired by StatsPAI 6-step DSL + Full Empirical Analysis 8-step explicit pipeline.
> Adapted and significantly expanded for HBE academic-research skill pack.

## Method Selection Decision Tree / 方法选择决策树

```
Do you have a clear treatment/control split? 是否有清晰的处理/对照组划分？
├── Yes 是
│   ├── Is treatment assignment based on a threshold variable? 处理是否基于阈值变量？
│   │   └── Yes → RDD (Sharp or Fuzzy) 是 → RDD（清晰或模糊）
│   ├── Is there a time dimension with pre/post periods? 是否有前后时间维度？
│   │   ├── Yes + multiple treated units → DID / Event Study 是 → DID / 事件研究
│   │   └── Yes + single treated unit → SCM or SDID 是 → SCM 或 SDID
│   ├── Do you have a valid instrument? 是否有有效工具变量？
│   │   └── Yes → IV (2SLS, LIML, GMM) 是 → IV
│   ├── Are all confounders observed? 所有混淆因子可观测？
│   │   └── Yes → PSM / IPW / EB / DML 是 → PSM / IPW / EB / DML
│   └── Need heterogeneous treatment effects? 需要异质性处理效应？
│       └── Yes → Causal Forest / Meta-Learners 是 → 因果森林 / 元学习器
└── No 否
    └── Use DAG to identify strategy → then select method 用 DAG 确定策略 → 再选方法
```

### Core Methods Comparison / 核心方法对比

| Method 方法 | Abbr. | Identification Strategy 识别策略 | Key Assumption 核心假设 | Typical Paper 典型论文 |
|---|---|---|---|---|
| Difference-in-Differences | DID | Parallel trends 平行趋势 | Treatment and control trends would be same absent treatment | Card & Krueger (1994) |
| Instrumental Variables | IV | Exclusion restriction 排他性约束 | Instrument affects outcome only through treatment | Angrist & Krueger (1991) |
| Regression Discontinuity | RDD | Local randomization 局部随机化 | Units near cutoff are comparable | Lee (2008) |
| Propensity Score Matching | PSM | Selection on observables 可观测选择 | All confounders measured | Dehejia & Wahba (1999) |
| Synthetic Control | SCM | Convex combination fit 凸组合拟合 | Donor pool approximates counterfactual | Abadie et al. (2010) |
| Synthetic DID | SDID | DID + SCM hybrid | Combines DID time weights + SCM unit weights | Arkhangelsky et al. (2021) |
| Double/Debiased ML | DML | Neyman orthogonality 正交性 | Cross-fitting avoids regularization bias | Chernozhukov et al. (2018) |
| Causal Forest | CF | Honest estimation 诚实估计 | Splitting independent of treatment effect | Athey & Imbens (2018) |

## 8-Step Empirical Pipeline / 八步实证流水线

### Step 1: Data Cleaning / 数据清洗

```python
import pandas as pd
import numpy as np

# Load panel data
df = pd.read_stata("panel_data.dta")  # or read_csv

# Check panel structure
print(f"Units: {df['id'].nunique()}, Periods: {df['year'].nunique()}")
print(f"Balanced: {df.groupby('id').size().nunique() == 1}")

# Missing value analysis
missing = df.isnull().sum()
print(missing[missing > 0].sort_values(ascending=False))

# Handle missing values based on mechanism
# MCAR → listwise deletion; MAR → multiple imputation; MNAR → sensitivity
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
df_imputed = df.copy()
numeric_cols = df.select_dtypes(include=[np.number]).columns
df_imputed[numeric_cols] = IterativeImputer(max_iter=10, random_state=42).fit_transform(
    df[numeric_cols]
)

# Outlier treatment: winsorize at 1st/99th percentile
from scipy.stats import mstats
for col in ["wage", "revenue", "investment"]:
    df_imputed[col] = mstats.winsorize(df_imputed[col], limits=[0.01, 0.01])

# Verify no duplicate (id, year) pairs
assert df_imputed.duplicated(subset=["id", "year"]).sum() == 0
```

### Step 2: Variable Construction / 变量构造

```python
# Log transformation (handle zeros with IHS)
df["log_wage"] = np.log(df["wage"].clip(lower=1))
df["ihs_income"] = np.arcsinh(df["income"])

# Standardization (z-score)
df["z_score"] = (df["variable"] - df["variable"].mean()) / df["variable"].std()

# Interaction terms
df["treat_post"] = df["treatment"] * df["post"]
df["x1_x2"] = df["x1"] * df["x2"]

# Panel lag/lead/difference (require sorted data)
df = df.sort_values(["id", "year"])
df["wage_lag1"] = df.groupby("id")["wage"].shift(1)
df["wage_lead1"] = df.groupby("id")["wage"].shift(-1)
df["wage_diff"] = df.groupby("id")["wage"].diff()

# Staggered DID time variables
df["first_treat"] = df.groupby("id")["year"].transform(
    lambda x: x[df.loc[x.index, "treatment"] == 1].min() if (df.loc[x.index, "treatment"] == 1).any() else np.inf
)
df["rel_time"] = df["year"] - df["first_treat"]
df["gvar"] = df["first_treat"].replace(np.inf, 0)  # group variable for Sun-Abraham

# CPI deflation (if needed)
cpi_index = {2010: 100, 2011: 103.2, 2012: 105.5, 2013: 107.1}  # example
df["real_wage"] = df["wage"] / df["year"].map(cpi_index) * 100
```

### Step 3: Descriptive Statistics / 描述统计

```python
from scipy import stats

# Table 1: Summary statistics
desc = df.groupby("treatment")[["wage", "age", "education", "experience"]].agg(
    ["mean", "std", "count"]
).round(3)
print(desc)

# Balance table with SMD and t-test
def balance_table(df, treatment_col, covariates):
    treated = df[df[treatment_col] == 1]
    control = df[df[treatment_col] == 0]
    rows = []
    for var in covariates:
        t_stat, p_val = stats.ttest_ind(treated[var], control[var])
        smd = (treated[var].mean() - control[var].mean()) / np.sqrt(
            (treated[var].var() + control[var].var()) / 2
        )
        rows.append({
            "Variable": var,
            "Treated Mean": round(treated[var].mean(), 3),
            "Control Mean": round(control[var].mean(), 3),
            "SMD": round(smd, 3),
            "t-stat": round(t_stat, 3),
            "p-value": round(p_val, 4),
        })
    return pd.DataFrame(rows)

bal = balance_table(df, "treatment", ["wage", "age", "education", "experience"])
print(bal.to_latex(index=False))

# Correlation heatmap
import seaborn as sns
import matplotlib.pyplot as plt
corr = df[["wage", "treatment", "x1", "x2", "x3"]].corr()
sns.heatmap(corr, annot=True, cmap="RdBu_r", center=0, fmt=".2f")
plt.savefig("correlation_heatmap.pdf", bbox_inches="tight")
```

### Step 4: Diagnostic Tests (12 Types) / 诊断检验

```python
import statsmodels.api as sm
from statsmodels.stats.diagnostic import het_breuschpagan
from statsmodels.stats.stattools import durbin_watson
from statsmodels.stats.outliers_influence import variance_inflation_factor

# Fit baseline OLS
y = df["wage"]
X = sm.add_constant(df[["treatment", "x1", "x2", "x3"]])
model = sm.OLS(y, X).fit()

# 1. Normality (Shapiro-Wilk on residuals)
stat, p = stats.shapiro(model.resid[:5000])  # max 5000 obs for Shapiro
print(f"Shapiro-Wilk: stat={stat:.4f}, p={p:.4f}")

# 2. Heteroskedasticity (Breusch-Pagan)
bp_stat, bp_p, _, _ = het_breuschpagan(model.resid, X)
print(f"Breusch-Pagan: stat={bp_stat:.4f}, p={bp_p:.4f}")

# 3. Autocorrelation (Durbin-Watson)
dw = durbin_watson(model.resid)
print(f"Durbin-Watson: {dw:.4f} (2=none, <2=pos, >2=neg)")

# 4. Multicollinearity (VIF)
for i, col in enumerate(X.columns[1:]):
    vif = variance_inflation_factor(X.values, i + 1)
    print(f"VIF({col}): {vif:.2f}")

# 5. Unit root (ADF test) — for time series
from arch.unitroot import ADF
adf = ADF(df["wage"].dropna())
print(f"ADF: stat={adf.stat:.4f}, p={adf.pvalue:.4f}, lags={adf.lags}")

# 6. RESET specification test
from statsmodels.stats.diagnostic import linear_reset
reset = linear_reset(model, power=3, use_f=True)
print(f"RESET F: stat={reset.fvalue:.4f}, p={reset.pvalue:.4f}")

# 7. Influential observations (Cook's distance)
influence = model.get_influence()
cooks_d = influence.cooks_distance[0]
print(f"Max Cook's D: {cooks_d.max():.4f}")
print(f"Obs with D > 4/n: {(cooks_d > 4/len(df)).sum()}")
```

### Step 5: Baseline Estimation / 基准建模

#### 5A. DID (Difference-in-Differences) / 双重差分

```python
from linearmodels.panel import PanelOLS
import statsmodels.formula.api as smf

# Classic 2×2 DID
did_model = smf.ols("y ~ treatment + post + treatment:post + x1 + x2", data=df).fit(
    cov_type="cluster", cov_kwds={"groups": df["id"]}
)
print(did_model.summary())

# Event study (dynamic DID)
event_df = df[df["rel_time"].between(-5, 5)].copy()
event_df = pd.get_dummies(event_df, columns=["rel_time"], prefix="t")
event_cols = [c for c in event_df.columns if c.startswith("t_-") or c.startswith("t_0") or c.startswith("t_1")]
event_cols = [c for c in event_cols if c != "t_-1"]  # drop reference period
formula = "y ~ " + " + ".join(event_cols) + " + x1 + x2 + C(id) + C(year)"
es_model = smf.ols(formula, data=event_df).fit(cov_type="cluster", cov_kwds={"groups": event_df["id"]})

# Plot event study coefficients
coefs = [es_model.params[c] for c in event_cols]
ci_low = [es_model.conf_int().loc[c, 0] for c in event_cols]
ci_high = [es_model.conf_int().loc[c, 1] for c in event_cols]
times = list(range(-5, 6))
times.remove(-1)

plt.figure(figsize=(10, 5))
plt.errorbar(times, coefs, yerr=[np.array(coefs) - np.array(ci_low), np.array(ci_high) - np.array(coefs)],
             fmt="o-", capsize=3, color="navy")
plt.axhline(0, color="gray", linestyle="--")
plt.axvline(-0.5, color="red", linestyle="--", label="Treatment")
plt.xlabel("Relative Time to Treatment")
plt.ylabel("Coefficient")
plt.title("Event Study")
plt.legend()
plt.savefig("event_study.pdf", bbox_inches="tight")

# Panel FE DID (two-way fixed effects)
df_panel = df.set_index(["id", "year"])
fe_model = PanelOLS(
    df_panel["y"],
    df_panel[["treatment", "x1", "x2"]],
    entity_effects=True,
    time_effects=True,
).fit(cov_type="clustered", cluster_entity=True)
print(fe_model.summary)
```

#### 5B. IV (Instrumental Variables) / 工具变量法

```python
from linearmodels.iv import IV2SLS

# 2SLS: instrument treatment with z
iv_model = IV2SLS(
    dependent=df["y"],
    exog=sm.add_constant(df[["x1", "x2"]]),
    endog=df["treatment"],
    instruments=df["z"],
).fit(cov_type="robust")
print(iv_model.summary)

# First-stage diagnostics
print(f"First-stage F-stat: {iv_model.first_stage.diagnostics['f.stat'].iloc[0]:.2f}")
# Rule of thumb: F > 10 → not weak instrument

# LIML estimator (robust to weak instruments)
from linearmodels.iv import IVLIML
liml_model = IVLIML(
    dependent=df["y"],
    exog=sm.add_constant(df[["x1", "x2"]]),
    endog=df["treatment"],
    instruments=df[["z1", "z2"]],
).fit(cov_type="robust")
print(f"LIML estimate: {liml_model.params['treatment']:.4f}")
```

#### 5C. RDD (Regression Discontinuity) / 断点回归

```python
# Sharp RDD: treatment = 1 if running >= cutoff
cutoff = 0.5
df_rdd = df.copy()
df_rdd["above"] = (df_rdd["running"] >= cutoff).astype(int)
df_rdd["running_c"] = df_rdd["running"] - cutoff

# Local linear regression at multiple bandwidths
def rdd_estimate(bw, data, cutoff=0.5):
    local = data[(data["running"] >= cutoff - bw) & (data["running"] <= cutoff + bw)].copy()
    local["above"] = (local["running"] >= cutoff).astype(int)
    local["running_c"] = local["running"] - cutoff
    model = smf.ols("y ~ above * running_c", data=local).fit()
    return model.params["above"]

bandwidths = [0.1, 0.15, 0.2, 0.25, 0.3]
estimates = [rdd_estimate(bw, df_rdd) for bw in bandwidths]
for bw, est in zip(bandwidths, estimates):
    print(f"BW={bw:.2f}: RDD estimate = {est:.4f}")

# McCrary density test: check no sorting at cutoff
from scipy.stats import gaussian_kde
below = df_rdd[df_rdd["running"] < cutoff]["running"]
above = df_rdd[df_rdd["running"] >= cutoff]["running"]
kde_below = gaussian_kde(below)
kde_above = gaussian_kde(above)
x_below = np.linspace(cutoff - 0.3, cutoff, 100)
x_above = np.linspace(cutoff, cutoff + 0.3, 100)
plt.plot(x_below, kde_below(x_below), label="Below cutoff")
plt.plot(x_above, kde_above(x_above), label="Above cutoff")
plt.axvline(cutoff, color="red", linestyle="--")
plt.legend()
plt.savefig("rdd_density_test.pdf", bbox_inches="tight")
```

#### 5D. PSM (Propensity Score Matching) / 倾向得分匹配

```python
from sklearn.linear_model import LogisticRegression

# Step 1: Estimate propensity score
ps_model = LogisticRegression(max_iter=1000)
X_ps = df[["age", "education", "experience", "region"]]
ps_model.fit(X_ps, df["treatment"])
df["pscore"] = ps_model.predict_proba(X_ps)[:, 1]

# Step 2: Check overlap (common support)
treated_ps = df[df["treatment"] == 1]["pscore"]
control_ps = df[df["treatment"] == 0]["pscore"]
plt.hist(treated_ps, bins=30, alpha=0.5, label="Treated")
plt.hist(control_ps, bins=30, alpha=0.5, label="Control")
plt.xlabel("Propensity Score")
plt.legend()
plt.savefig("psm_overlap.pdf", bbox_inches="tight")

# Step 3: Nearest-neighbor matching (1:1 without replacement)
def match_samples(df, caliper=0.05):
    treated = df[df["treatment"] == 1].copy()
    control = df[df["treatment"] == 0].copy()
    matched_pairs = []
    used_control = set()
    for _, t_row in treated.iterrows():
        dists = np.abs(control["pscore"] - t_row["pscore"])
        dists[control.index.isin(used_control)] = np.inf
        best_idx = dists.idxmin()
        if dists[best_idx] <= caliper:
            matched_pairs.append((t_row.name, best_idx))
            used_control.add(best_idx)
    return matched_pairs

pairs = match_samples(df)
matched_idx = [i for pair in pairs for i in pair]
df_matched = df.loc[matched_idx]

# Step 4: ATT estimate on matched sample
att_model = smf.ols("y ~ treatment + x1 + x2", data=df_matched).fit(
    cov_type="cluster", cov_kwds={"groups": df_matched["id"]}
)
print(f"ATT estimate: {att_model.params['treatment']:.4f}")
```

#### 5E. DML (Double/Debiased Machine Learning) / 双重机器学习

```python
from econml.dml import LinearDML
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier

# DML for ATE estimation with ML nuisance functions
dml = LinearDML(
    model_y=GradientBoostingRegressor(n_estimators=100, max_depth=3),
    model_t=GradientBoostingClassifier(n_estimators=100, max_depth=3),
    random_state=42,
)
dml.fit(
    Y=df["y"].values,
    T=df["treatment"].values,
    X=df[["x1", "x2"]].values,  # heterogeneity variables
    W=df[["age", "education", "experience"]].values,  # controls
)
print(f"ATE: {dml.ate():.4f}")
print(f"95% CI: {dml.ate_inference().conf_int()}")
```

#### 5F. Causal Forest / 因果森林

```python
from econml.dml import CausalForestDML

cf = CausalForestDML(
    model_y=GradientBoostingRegressor(n_estimators=100),
    model_t=GradientBoostingClassifier(n_estimators=100),
    n_estimators=1000,
    min_samples_leaf=10,
    random_state=42,
)
cf.fit(
    Y=df["y"].values,
    T=df["treatment"].values,
    X=df[["x1", "x2"]].values,
    W=df[["age", "education", "experience"]].values,
)

# Heterogeneous treatment effects
cate = cf.effect(X_test=df[["x1", "x2"]].values)
print(f"Mean CATE: {cate.mean():.4f}")
print(f"CATE std: {cate.std():.4f}")

# Feature importance for heterogeneity
importance = cf.feature_importances()
print(f"Feature importance: x1={importance[0]:.3f}, x2={importance[1]:.3f}")
```

### Step 6: Robustness Battery / 稳健性检验组合

```python
# 6A. Specification ladder (M1–M6)
specs = {
    "M1": "y ~ treatment",
    "M2": "y ~ treatment + x1",
    "M3": "y ~ treatment + x1 + x2",
    "M4": "y ~ treatment + x1 + x2 + x3",
    "M5": "y ~ treatment + x1 + x2 + x3 + x4",
    "M6": "y ~ treatment + x1 + x2 + x3 + x4 + x5",
}
results = {}
for name, formula in specs.items():
    m = smf.ols(formula, data=df).fit(cov_type="cluster", cov_kwds={"groups": df["id"]})
    results[name] = {
        "coef": m.params["treatment"],
        "se": m.bse["treatment"],
        "pval": m.pvalues["treatment"],
        "n": m.nobs,
        "r2": m.rsquared,
    }
robustness_df = pd.DataFrame(results).T
print(robustness_df.round(4))

# 6B. Multi-level clustering sensitivity
cluster_levels = ["id", "year", "industry"]
for level in cluster_levels:
    m = smf.ols("y ~ treatment + x1 + x2 + x3", data=df).fit(
        cov_type="cluster", cov_kwds={"groups": df[level]}
    )
    print(f"Cluster({level}): coef={m.params['treatment']:.4f}, se={m.bse['treatment']:.4f}")

# 6C. Placebo test (random treatment timing)
def placebo_test(df, n_iter=1000, seed=42):
    rng = np.random.RandomState(seed)
    true_coef = smf.ols("y ~ treatment + x1 + x2", data=df).fit(cov_type="HC1").params["treatment"]
    placebo_coefs = []
    for _ in range(n_iter):
        df_perm = df.copy()
        df_perm["treatment"] = rng.permutation(df_perm["treatment"].values)
        coef = smf.ols("y ~ treatment + x1 + x2", data=df_perm).fit(cov_type="HC1").params["treatment"]
        placebo_coefs.append(coef)
    p_value = np.mean(np.abs(placebo_coefs) >= np.abs(true_coef))
    return true_coef, np.array(placebo_coefs), p_value

true_coef, placebo_coefs, p_val = placebo_test(df)
print(f"True coef: {true_coef:.4f}, Placebo p-value: {p_val:.4f}")
```

### Step 7: Further Analysis / 进一步分析

```python
# 7A. Heterogeneous treatment effects by subgroup
for group in ["male", "female"]:
    sub = df[df["gender"] == group]
    m = smf.ols("y ~ treatment + x1 + x2", data=sub).fit(cov_type="HC1")
    print(f"{group}: coef={m.params['treatment']:.4f} (p={m.pvalues['treatment']:.4f})")

# 7B. Mediation analysis (Baron-Kenny steps)
# Path a: treatment → mediator
a_model = smf.ols("mediator ~ treatment + x1 + x2", data=df).fit()
a = a_model.params["treatment"]
# Path b + c': mediator + treatment → outcome
bc_model = smf.ols("y ~ treatment + mediator + x1 + x2", data=df).fit()
b = bc_model.params["mediator"]
c_prime = bc_model.params["treatment"]
# Indirect effect = a * b
indirect = a * b
# Total effect
c_model = smf.ols("y ~ treatment + x1 + x2", data=df).fit()
total = c_model.params["treatment"]
print(f"Indirect effect: {indirect:.4f}")
print(f"Direct effect: {c_prime:.4f}")
print(f"Mediation %: {indirect / total * 100:.1f}%")

# 7C. Dose-response (continuous treatment)
df["treat_quartile"] = pd.qcut(df["treatment_intensity"], 4, labels=["Q1", "Q2", "Q3", "Q4"])
dose_model = smf.ols("y ~ C(treat_quartile) + x1 + x2", data=df).fit(cov_type="HC1")
print(dose_model.summary())
```

### Step 8: Publication-Quality Output / 发表级输出

```python
# 8A. Regression table (multiple models side by side)
from stargazer.stargazer import Stargazer

m1 = smf.ols("y ~ treatment", data=df).fit(cov_type="HC1")
m2 = smf.ols("y ~ treatment + x1 + x2", data=df).fit(cov_type="HC1")
m3 = smf.ols("y ~ treatment + x1 + x2 + x3 + x4", data=df).fit(cov_type="HC1")

table = Stargazer([m1, m2, m3])
table.title("Baseline Results: DID Estimates")
table.custom_columns(["(1)", "(2)", "(3)"], [1, 1, 1])
table.significant_digits(3)
table.show_degrees_of_freedom(False)
with open("table_baseline.tex", "w") as f:
    f.write(table.render_latex())

# 8B. Coefficient plot
coefs = [m.params["treatment"] for m in [m1, m2, m3]]
ci_low = [m.conf_int().loc["treatment", 0] for m in [m1, m2, m3]]
ci_high = [m.conf_int().loc["treatment", 1] for m in [m1, m2, m3]]

fig, ax = plt.subplots(figsize=(6, 4))
ax.errorbar(range(3), coefs, yerr=[np.array(coefs) - np.array(ci_low), np.array(ci_high) - np.array(coefs)],
            fmt="o", capsize=5, markersize=8, color="navy")
ax.axhline(0, color="gray", linestyle="--")
ax.set_xticks(range(3))
ax.set_xticklabels(["(1)", "(2)", "(3)"])
ax.set_ylabel("Treatment Effect")
ax.set_title("Treatment Effect Across Specifications")
plt.tight_layout()
plt.savefig("coefplot.pdf", bbox_inches="tight")

# 8C. Love plot (PSM balance)
def love_plot(df, treatment_col, covariates):
    treated = df[df[treatment_col] == 1]
    control = df[df[treatment_col] == 0]
    smd_vals = []
    labels = []
    for var in covariates:
        smd = (treated[var].mean() - control[var].mean()) / np.sqrt(
            (treated[var].var() + control[var].var()) / 2)
        smd_vals.append(smd)
        labels.append(var)
    fig, ax = plt.subplots(figsize=(8, len(covariates) * 0.5 + 1))
    ax.scatter(smd_vals, labels, color="red", label="Before matching", zorder=3)
    ax.axvline(0, color="gray", linestyle="-")
    ax.axvline(-0.1, color="gray", linestyle="--", alpha=0.5)
    ax.axvline(0.1, color="gray", linestyle="--", alpha=0.5)
    ax.set_xlabel("Standardized Mean Difference")
    ax.legend()
    plt.tight_layout()
    plt.savefig("love_plot.pdf", bbox_inches="tight")
```

## Method-Specific Diagnostics / 各方法专项诊断

| Method 方法 | Required Diagnostics 必需诊断 | Python Implementation |
|---|---|---|
| DID | Parallel trends test, Event study, Placebo timing, Bacon decomposition (staggered) | `linearmodels` + manual |
| IV | First-stage F > 10, Overidentification (Sargan/Hansen), Hausman test, Weak IV | `linearmodels.iv.IV2SLS` |
| RDD | Bandwidth sensitivity, McCrary density, Covariate balance, Polynomial order | `statsmodels` + manual |
| PSM | Balance (SMD < 0.1), Overlap plot, Rosenbaum bounds, Caliper sensitivity | `sklearn` + manual |
| SCM | Placebo in space, Placebo in time, Leave-one-out, Gap analysis | Manual + optimization |
| DML | Cross-fitting stability, Nuisance model performance, Sensitivity to ML choice | `econml` |
| CF | Honest splitting, Leaf size sensitivity, Feature importance stability | `econml.CausalForestDML` |

## StatsPAI Integration / StatsPAI 集成

[StatsPAI](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/00-StatsPAI_skill) provides a one-command DSL for the full pipeline:

```python
import statspai as sp

# 6-step DSL pipeline
sp.sumstats(data, variables=["y", "x1", "x2", "treatment"])  # EDA
sp.diagnose(data, treatment="treatment", outcome="y")  # Diagnostics
q = sp.causal_question(data, treatment="treatment", outcome="y", estimand="ATE")
q.identify()  # Auto-suggests identification strategy
result = sp.causal(method="did", data=data, treatment="treatment", outcome="y")
sp.spec_curve(data, treatment="treatment", outcome="y")  # Specification curve
result.summary()  # Publication-ready output
result.to_latex()  # LaTeX table
```

## Cross-Discipline Adaptation / 跨学科适配

| Discipline 学科 | Priority Methods 优先方法 | Common Data 常见数据 | Key Journals 目标期刊 |
|---|---|---|---|
| Economics 经济 | DID, IV, RDD, SCM | Panel, administrative | AER, QJE, JPE, ReStud |
| Political Science 政治 | DID, RDD, IV | Electoral, survey | APSR, AJPS |
| Sociology 社会 | PSM, DID, DML | Survey, administrative | ASR, AJS |
| Public Health 公卫 | DID, PSM, IV | Clinical, registry | Lancet, NEJM, JAMA |
| Education 教育 | DID, RDD, PSM | Student panel, test scores | AER, Ed Researcher |
| Finance 金融 | DID, IV, Panel FE | Market data, firm panel | JF, JFE, RFS |
| Management 管理 | DID, PSM, IV | Firm panel, survey | AMJ, SMJ, ASQ |
| Psychology 心理 | RCT, PSM, Mediation | Experimental, survey | Psych Science, JPSP |

## Integration with HBE / 与 HBE 集成

1. Run `/hbe-academic experiment` to design experiments with causal identification in mind
2. Use `references/tools/linearmodels.md` for panel data estimation details
3. Use `references/tools/statsmodels.md` for diagnostic test implementations
4. Use `references/tools/econml.md` for DML and Causal Forest specifications
5. Use `references/tools/pymc.md` for Bayesian causal inference
6. Use `references/statistical-analysis-guide.md` for general statistical methodology
7. Use `workflows/experiment-design.md` for experimental design with causal logic

## References / 参考文献

- [StatsPAI](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/00-StatsPAI_skill) — Agent-Native Causal Inference Package (900+ functions)
- [Full Empirical Analysis Skill (Python)](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/00.1-Full-empirical-analysis-skill) — Explicit 8-step pipeline
- [Full Empirical Analysis Skill (Stata)](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/00.2-Full-empirical-analysis-skill_Stata)
- [Full Empirical Analysis Skill (R)](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/00.3-Full-empirical-analysis-skill_R)
- "Causal Inference for the Brave and True" — Python textbook
- "Mostly Harmless Econometrics" — Angrist & Pischke
- "The Effect" — Nick Huntington-Klein
- `workflows/experiment-design.md` — Experiment design workflow
