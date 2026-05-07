---
name: scikit-survival
description: Survival analysis — Kaplan-Meier, Cox PH, random survival forests, and concordance index evaluation
domain: medicine / survival-analysis
install: pip install scikit-survival
---

# scikit-survival

Top-notch survival analysis for Python. Builds on scikit-learn to provide Kaplan-Meier estimation, Cox proportional hazards, random survival forests, and accelerated failure time models with a familiar sklearn-compatible API.

## When to Use

- Analyzing time-to-event data (patient survival, equipment failure, churn)
- Estimating survival curves with Kaplan-Meier for treatment group comparisons
- Fitting Cox proportional hazards models with clinical covariates
- Building non-linear survival predictors with Random Survival Forests
- Evaluating model discrimination using concordance index (C-index)

## Quick Start

```python
from sksurv.datasets import load_veterans_lung_cancer
from sksurv.ensemble import RandomSurvivalForest
from sksurv.metrics import concordance_index_censored

# Load dataset — y is a structured array with (event_indicator, time_in_days)
X, y = load_veterans_lung_cancer()
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42)

# Fit a Random Survival Forest
rsf = RandomSurvivalForest(n_estimators=100, min_samples_leaf=7, random_state=42)
rsf.fit(X_train, y_train)

# Predict risk scores (lower = longer survival)
risk_scores = rsf.predict(X_test)
c_index = concordance_index_censored(y_test["Status"], y_test["Survival_in_days"], risk_scores)
print(f"C-index: {c_index[0]:.3f}")
```

## Core Capabilities

### 1. Kaplan-Meier Survival Estimation

```python
import matplotlib.pyplot as plt
from sksurv.nonparametric import kaplan_meier_estimator

# Compare survival between two treatment groups
for treatment in ("standard", "test"):
    mask = X["Treatment"] == treatment
    time, survival_prob = kaplan_meier_estimator(
        y["Status"][mask],
        y["Survival_in_days"][mask]
    )
    plt.step(time, survival_prob, where="post", label=f"Treatment: {treatment}")

plt.ylabel("Survival probability")
plt.xlabel("Time (days)")
plt.legend()
plt.title("Kaplan-Meier Survival Curves")
plt.tight_layout()
plt.savefig("km_curves.png", dpi=300)
```

### 2. Cox Proportional Hazards Model

```python
from sksurv.linear_model import CoxPHSurvivalAnalysis
import pandas as pd

cox = CoxPHSurvivalAnalysis(alpha=0.05)  # L2 regularization
cox.fit(X_train, y_train)

# C-index on test set
print(f"Cox C-index: {cox.score(X_test, y_test):.3f}")

# Inspect hazard ratios
coef_df = pd.DataFrame({
    "feature": X.columns,
    "hazard_ratio": np.exp(cox.coef_)
}).sort_values("hazard_ratio", ascending=False)
print(coef_df)
# HR > 1 increases risk; HR < 1 is protective
```

### 3. Random Survival Forest with Risk Prediction

```python
from sksurv.ensemble import RandomSurvivalForest, GradientBoostingSurvivalAnalysis

# Random Survival Forest
rsf = RandomSurvivalForest(
    n_estimators=200,
    min_samples_split=10,
    min_samples_leaf=5,
    max_features="sqrt",
    random_state=42
)
rsf.fit(X_train, y_train)

# Predict survival function for a single patient
surv_func = rsf.predict_survival_function(X_test.iloc[:1])
plt.plot(surv_func[0].x, surv_func[0].y)
plt.xlabel("Time (days)")
plt.ylabel("Survival probability")
plt.title("Predicted Survival Function")
plt.savefig("survival_function.png", dpi=300)
```

## Common Academic Workflow: Clinical Trial Survival Analysis

```python
from sksurv.datasets import load_veterans_lung_cancer
from sksurv.linear_model import CoxPHSurvivalAnalysis
from sksurv.ensemble import RandomSurvivalForest
from sksurv.metrics import concordance_index_censored
import numpy as np

# 1. Load and prepare data
X, y = load_veterans_lung_cancer()
X_train, X_test, y_train, y_test = train_test_split(X, y, random_state=42, stratify=y["Status"])

# 2. Fit Cox model for interpretable hazard ratios
cox = CoxPHSurvivalAnalysis()
cox.fit(X_train, y_train)
print("Cox C-index:", cox.score(X_test, y_test))

# 3. Fit RSF for non-linear predictive power
rsf = RandomSurvivalForest(n_estimators=200, min_samples_leaf=5, random_state=42)
rsf.fit(X_train, y_train)
rsf_risk = rsf.predict(X_test)
c_idx = concordance_index_censored(y_test["Status"], y_test["Survival_in_days"], rsf_risk)
print(f"RSF C-index: {c_idx[0]:.3f}")

# 4. Generate Kaplan-Meier curves stratified by predicted risk
median_risk = np.median(rsf_risk)
high_risk = rsf_risk >= median_risk
for label, mask in [("High risk", high_risk), ("Low risk", ~high_risk)]:
    t, s = kaplan_meier_estimator(y_test["Status"][mask], y_test["Survival_in_days"][mask])
    plt.step(t, s, where="post", label=label)
plt.legend(); plt.title("Risk-Stratified KM Curves"); plt.savefig("risk_km.png", dpi=300)
```

## Best Practices

1. **Check proportional hazards assumption** — Use Schoenfeld residuals or log-minus-log plots before trusting Cox model coefficients
2. **Handle censoring correctly** — scikit-survival expects structured arrays with boolean event indicators; never drop censored observations
3. **Use stratified train/test splits** — Stratify on event status to maintain censoring distribution across splits
4. **Report C-index with confidence intervals** — Use bootstrapping (1000+ resamples) for robust interval estimation
5. **Calibrate survival predictions** — Plot predicted vs observed survival at fixed time horizons to assess calibration

## Common Pitfalls

- **Ignoring censoring**: Treating censored observations as events or dropping them introduces severe bias. Always use the structured array format.
- **Violating proportional hazards**: If hazard ratios change over time, consider time-varying coefficients or switch to Random Survival Forests.
- **Small event counts**: Cox models become unstable when events per variable is below 10. Use penalized Cox (`alpha > 0`) or dimensionality reduction.
- **Leaking future information**: Ensure no features derived from the outcome (e.g., post-treatment biomarkers) enter the model.

## Integration with HBE

- Use with `/hbe-plan` for designing survival analysis study protocols
- Pair with `references/tools/pandas.md` for EHR and clinical data wrangling
- Combine with `references/tools/matplotlib.md` and `references/tools/seaborn.md` for publication-quality KM curves
- See `references/tools/statsmodels.md` for complementary parametric survival models

## Resources

- Documentation: https://scikit-survival.readthedocs.io/
- GitHub: https://github.com/sebp/scikit-survival
- Tutorial: https://scikit-survival.readthedocs.io/en/stable/user_guide/00_introduction.html
- Paper: Pölsterl, S. (2020). scikit-survival: A Library for Time-to-Event Analysis Built on Top of scikit-learn. JMLR, 21(212), 1-6.
