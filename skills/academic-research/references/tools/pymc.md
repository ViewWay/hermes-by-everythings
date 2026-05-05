---
name: pymc
description: Bayesian statistical modeling and probabilistic programming. Use for Bayesian regression, hierarchical models, model comparison, and uncertainty quantification.
domain: cross-domain
install: pip install pymc
---

# PyMC: Bayesian Statistical Modeling

## Overview

PyMC is a probabilistic programming library for Bayesian statistical modeling — defining models with priors, sampling posteriors via MCMC, and model comparison. Used across science for uncertainty quantification.

## When to Use

- Bayesian regression and GLMs
- Hierarchical / multilevel models
- Model comparison (WAIC, LOO-CV)
- Uncertainty quantification
- Any analysis where prior knowledge should be incorporated

## Quick Start

```python
import pymc as pm
import numpy as np

# Bayesian linear regression
with pm.Model() as model:
    # Priors
    alpha = pm.Normal('alpha', mu=0, sigma=10)
    beta = pm.Normal('beta', mu=0, sigma=10)
    sigma = pm.HalfNormal('sigma', sigma=1)

    # Likelihood
    mu = alpha + beta * x_data
    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y_data)

    # Sample
    trace = pm.sample(2000, tune=1000, cores=4, random_seed=42)

# Summarize results
import arviz as az
az.summary(trace)
az.plot_trace(trace)
az.plot_posterior(trace)
```

## Core Capabilities

### 1. Hierarchical Models

```python
with pm.Model() as hierarchical:
    # Hyperpriors
    mu_alpha = pm.Normal('mu_alpha', mu=0, sigma=10)
    sigma_alpha = pm.HalfNormal('sigma_alpha', sigma=5)

    # Group-level priors
    alpha = pm.Normal('alpha', mu=mu_alpha, sigma=sigma_alpha, shape=n_groups)
    beta = pm.Normal('beta', mu=0, sigma=5)

    # Likelihood
    mu = alpha[group_idx] + beta * x
    y_obs = pm.Normal('y_obs', mu=mu, sigma=sigma, observed=y)
    trace = pm.sample(2000, tune=1000, target_accept=0.95)
```

### 2. Model Comparison

```python
# Compare models with WAIC
with model1: trace1 = pm.sample()
with model2: trace2 = pm.sample()

compare = az.compare({'model1': trace1, 'model2': trace2}, ic='waic')
print(compare)

# LOO-CV
loo = az.loo(trace, model)
```

### 3. Publication Figures

```python
import arviz as az

# Posterior predictive check
with model: ppc = pm.sample_posterior_predictive(trace)
az.plot_ppc(az.from_pymc3(trace, posterior_predictive=ppc))

# Forest plot for coefficients
az.plot_forest(trace, var_names=['beta'], combined=True, figsize=(6, 4))
plt.savefig('posterior.pdf', dpi=300, bbox_inches='tight')
```

## Best Practices

1. **Set `random_seed`**: For reproducible MCMC
2. **Increase `target_accept`**: Use 0.9-0.99 for difficult posteriors
3. **Check convergence**: `az.rhat(trace) < 1.01` and `az.ess(trace)` adequate
4. **Use `az.plot_trace`**: Verify chains have mixed well

## Common Pitfalls

1. **Divergent transitions**: Increase `target_accept` to 0.95+
2. **Poor prior choice**: Use prior predictive checks (`pm.sample_prior_predictive`)
3. **Label switching in mixture models**: Use `pm.Categorical` with ordered transform

## Integration with HBE

- Bayesian analysis tool in `references/tool-registry.md`
- Supports `references/statistical-analysis-guide.md` for Bayesian inference
- Works with `references/causal-inference-guide.md` for Bayesian causal methods

## Resources

- Documentation: https://www.pymc.io/
- Salvatier et al. (2016) "Probabilistic programming in Python using PyMC3" — PeerJ CS
