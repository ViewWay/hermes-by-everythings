---
name: what-if-oracle
description: Causal what-if analysis — counterfactual reasoning and sensitivity analysis for policy evaluation
domain: Social Science / Causal
install: pip install causalml dowhy econml scikit-learn 2>/dev/null || echo "See documentation"
---

# what-if-oracle — Causal What-If Analysis

## Overview

Causal what-if analysis provides tools for counterfactual reasoning, treatment effect estimation, and sensitivity analysis. It enables researchers to go beyond correlation and answer "what would have happened if?" questions using potential outcomes frameworks, directed acyclic graphs (DAGs), and methods like propensity score matching, instrumental variables, and doubly robust estimation.

## When to Use

- Estimating the causal effect of a policy, treatment, or intervention
- Conducting sensitivity analysis to test robustness of causal claims
- Answering counterfactual questions ("What if the minimum wage had been $15?")
- Building causal DAGs to encode domain knowledge about variable relationships
- Evaluating heterogeneous treatment effects across subgroups

## Quick Start

```python
from sklearn.linear_model import LogisticRegression
import numpy as np
import pandas as pd

# Simulate observational data: treatment (T), outcome (Y), confounders (X)
np.random.seed(42)
n = 1000
X = np.random.randn(n, 3)  # confounders
propensity = 1 / (1 + np.exp(-(0.5 * X[:, 0] + 0.3 * X[:, 1])))
T = np.random.binomial(1, propensity)  # treatment assignment
Y = 2.0 * T + 1.5 * X[:, 0] + 0.8 * X[:, 2] + np.random.randn(n) * 0.5  # outcome

df = pd.DataFrame({"Y": Y, "T": T, "X1": X[:, 0], "X2": X[:, 1], "X3": X[:, 2]})
print(f"N={n}, Treatment rate={T.mean():.1%}, Mean outcome diff={df[Y:=None] if False else df.groupby('T')['Y'].mean().diff().iloc[-1]:.2f}")
```

## Core Capabilities

### 1. Treatment Effect Estimation

```python
from causalml.inference.meta import LRSRegressor
from causalml.propensity import PropensityScore
import numpy as np

# IPW (Inverse Probability Weighting) estimator
ps = PropensityScore()
ps_model = LogisticRegression()
ate_ipw = ps.estimate_ate(X, treatment=T, y=Y, p_model=ps_model)
print(f"ATE (IPW): {ate_ipw[0]:.3f} [{ate_ipw[1]:.3f}, {ate_ipw[2]:.3f}]")

# T-Learner: separate models for treatment and control
from causalml.inference.meta import BaseTLearner
from sklearn.ensemble import GradientBoostingRegressor

t_learner = BaseTLearner(learner=GradientBoostingRegressor(n_estimators=100))
te, lb, ub = t_learner.estimate_ate(X=X, treatment=T, y=Y)
print(f"ATE (T-Learner): {te:.3f} [{lb:.3f}, {ub:.3f}]")

# Doubly Robust (AIPW) estimator — most robust to model misspecification
from causalml.inference.meta import BaseDRRegressor
dr = BaseDRRegressor(learner=GradientBoostingRegressor(n_estimators=100))
te, lb, ub = dr.estimate_ate(X=X, treatment=T, y=Y)
print(f"ATE (Doubly Robust): {te:.3f} [{lb:.3f}, {ub:.3f}]")
```

### 2. Sensitivity Analysis

```python
def rosenbaum_bounds(observed_effect, gamma_range=np.linspace(1, 3, 21)):
    """
    Rosenbaum sensitivity analysis: how large must unobserved confounding
    be to explain away the observed treatment effect?
    
    Gamma = 1: no unobserved confounding (ideal RCT)
    Gamma = 2: odds of treatment differ by factor 2 due to unobserved confounder
    """
    from scipy.stats import norm

    results = []
    for gamma in gamma_range:
        # Critical value under Rosenbaum bounds
        # Simplified: effect becomes insignificant when gamma is large enough
        p_value = 2 * (1 - norm.cdf(abs(observed_effect) / np.sqrt(gamma)))
        significant = p_value < 0.05
        results.append({"gamma": gamma, "p_value": p_value, "significant": significant})

    return pd.DataFrame(results)

# Example: observed ATE = 2.0
sensitivity = rosenbaum_bounds(observed_effect=2.0)
breakdown = sensitivity[~sensitivity["significant"]].iloc[0] if (~sensitivity["significant"]).any() else None
print(sensitivity.head(10))
if breakdown is not None:
    print(f"\nEffect becomes insignificant at gamma={breakdown['gamma']:.2f}")
else:
    print("\nEffect robust to substantial unobserved confounding (gamma up to 3.0)")
```

### 3. Causal Graph Specification (DAG)

```python
import networkx as nx
import matplotlib.pyplot as plt

def build_causal_dag():
    """Define a causal DAG for a policy evaluation study."""
    G = nx.DiGraph()

    # Nodes: treatment, outcome, confounders, mediators, colliders
    G.add_nodes_from([
        "education",       # confounder
        "age",             # confounder
        "treatment",       # policy intervention
        "income",          # mediator
        "health_outcome",  # outcome
        "employment",      # collider (caused by both education and income)
    ])

    # Edges: causal relationships
    G.add_edges_from([
        ("education", "treatment"),
        ("education", "income"),
        ("age", "treatment"),
        ("age", "health_outcome"),
        ("treatment", "income"),
        ("income", "health_outcome"),
        ("education", "employment"),
        ("income", "employment"),
    ])

    # Identify adjustment set (backdoor criterion)
    # To estimate effect of treatment on health_outcome:
    # Must condition on: education, age
    print("Nodes:", G.nodes())
    print("Edges:", G.edges())

    # Identify valid adjustment sets
    from causallearn.utils.cit import fisherz  # conditional independence test
    print("\nRecommended adjustment set: {education, age}")
    print("  - Blocks all backdoor paths from treatment to health_outcome")
    print("  - Does NOT condition on mediators (income) or colliders (employment)")

    return G

dag = build_causal_dag()
```

## Common Academic Workflow

### Complete Causal Analysis: Policy Evaluation

```python
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier

# Step 1: Load observational data
# Columns: age, income_before, education_years, employment_status,
#          treatment (job_training_program), earnings_after_1yr
df = pd.read_csv("policy_evaluation_data.csv")
print(f"Dataset: {len(df)} individuals, treatment rate={df['treatment'].mean():.1%}")

# Step 2: Check balance (covariate imbalance)
treated = df[df["treatment"] == 1]
control = df[df["treatment"] == 0]
for col in ["age", "income_before", "education_years"]:
    smd = abs(treated[col].mean() - control[col].mean()) / np.sqrt(
        (treated[col].var() + control[col].var()) / 2
    )
    print(f"  {col}: SMD={smd:.3f} {'(balanced)' if smd < 0.1 else '(IMBALANCED)'}")

# Step 3: Estimate ATE using doubly robust estimator
from causalml.inference.meta import BaseXRegressor
X = df[["age", "income_before", "education_years", "employment_status"]].values
T = df["treatment"].values
Y = df["earnings_after_1yr"].values

x_learner = BaseXRegressor(learner=GradientBoostingRegressor(n_estimators=200))
te, lb, ub = x_learner.estimate_ate(X=X, treatment=T, y=Y)
print(f"\nATE: ${te:,.0f} [${lb:,.0f}, ${ub:,.0f}]")

# Step 4: Heterogeneous treatment effects by subgroup
te_individual = x_learner.fit_predict(X=X, treatment=T, y=Y)
df["cate"] = te_individual
print("\nCATE by education level:")
for level in sorted(df["education_years"].quantile([0.25, 0.5, 0.75]).values):
    mask = df["education_years"] >= level
    print(f"  >= {level:.0f} years: ${df.loc[mask, 'cate'].mean():,.0f}")

# Step 5: Sensitivity analysis
sensitivity = rosenbaum_bounds(observed_effect=te / df["earnings_after_1yr"].std())
print(f"\nRosenbaum bounds: effect robust up to gamma={sensitivity[sensitivity['significant']].iloc[-1]['gamma']:.1f}")
```

## Best Practices

1. **Always draw the DAG first**: Encode domain knowledge before running any estimator. The DAG determines what to adjust for.
2. **Check covariate balance**: Report standardized mean differences before and after adjustment. Target SMD < 0.1.
3. **Use multiple estimators**: Report results from at least 2 methods (e.g., IPW + doubly robust). Consistency increases credibility.
4. **Report heterogeneous effects**: ATE may mask important variation. Report CATEs for policy-relevant subgroups.
5. **Conduct sensitivity analysis**: Always report how robust results are to unobserved confounding.

## Common Pitfalls

1. **Conditioning on colliders**: Adjusting for a variable caused by both treatment and outcome (e.g., post-treatment variables) can introduce bias. Only adjust for pre-treatment confounders.
2. **Positivity violations**: If some subgroups have zero probability of treatment, IPW fails. Check overlap in propensity score distributions.
3. **Overfitting the propensity score**: Complex ML models for propensity can create extreme weights. Use trimming (e.g., discard top/bottom 1% of weights).
4. **Ignoring mediation**: If you want the total effect, do not adjust for mediators. If you want the direct effect, use mediation analysis (e.g., `mediation` package).

## Integration with HBE

- Combine with `references/statsmodels.md` for traditional econometric causal models (IV, DiD, RDD)
- Use with `references/pymc.md` for Bayesian causal inference
- Feed into `references/scientific-writing.md` for causal claims in papers
- Supports `references/pandas.md` and `references/scikit-learn.md` for data handling

## Resources

- DoWhy documentation: https://microsoft.github.io/dowhy/
- CausalML documentation: https://causalml.readthedocs.io/
- EconML documentation: https://econml.azurewebsites.net/
- Cunningham, "Causal Inference: The Mixtape" (free textbook): https://www.scunning.com/mixtape.html
- Pearl, "Causality" (foundational text)
