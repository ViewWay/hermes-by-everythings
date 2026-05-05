---
name: adaptyv
description: Adaptive experimental design with Bayesian optimization for efficient experiment planning and multi-objective optimization
domain: Research / Experimental Design
install: pip install adaptyv 2>/dev/null || echo "See documentation"
---

# adaptyv — Adaptive Experimental Design

## Overview

Adaptyv provides Bayesian optimization-based adaptive experimental design, enabling researchers to efficiently explore high-dimensional parameter spaces with minimal experiments. It reduces experimental cost by 40-70% compared to grid or random search by intelligently selecting the next experiment based on all prior observations.

## When to Use

- Designing experiments with expensive evaluations (wet-lab assays, simulations, clinical trials)
- Optimizing multiple objectives simultaneously (yield vs. purity vs. cost)
- Exploring high-dimensional parameter spaces where exhaustive search is infeasible
- Sequential experimental campaigns where each result informs the next design
- Active learning pipelines where labeling budget is limited

## Quick Start

```python
from adaptyv import BayesianOptimizer, ExperimentSpace

# Define parameter ranges for your experiment
space = ExperimentSpace({
    "temperature": (25.0, 100.0),
    "concentration_mM": (0.1, 10.0),
    "ph": (5.0, 9.0),
    "catalyst_ratio": (0.01, 0.5),
})

# Initialize optimizer with expected improvement
optimizer = BayesianOptimizer(
    space=space,
    acquisition="expected_improvement",
    kernel="matern52",
    n_initial=5,  # initial random samples
)

# Iterative experimental loop
for i in range(20):
    next_params = optimizer.suggest()
    result = run_experiment(**next_params)  # your experiment
    optimizer.observe(next_params, result)
    print(f"Iter {i+1}: params={next_params}, result={result:.4f}")
```

## Core Capabilities

### 1. Acquisition Functions

The choice of acquisition function controls the exploration-exploitation trade-off:

```python
from adaptyv import AcquisitionFunction

# Expected Improvement — balances exploration and exploitation
optimizer = BayesianOptimizer(space=space, acquisition="ei")

# Upper Confidence Bound — aggressive exploration
optimizer = BayesianOptimizer(space=space, acquisition="ucb", kappa=2.0)

# Probability of Improvement — conservative, good for safety-critical domains
optimizer = BayesianOptimizer(space=space, acquisition="pi", xi=0.01)

# Knowledge Gradient — optimal for batch sequential design
optimizer = BayesianOptimizer(space=space, acquisition="kg", batch_size=4)
```

### 2. Multi-Objective Experimental Design

```python
from adaptyv import MultiObjectiveOptimizer

# Define objectives: maximize yield, minimize cost, maximize purity
optimizer = MultiObjectiveOptimizer(
    space=space,
    objectives={
        "yield": "maximize",
        "cost_usd": "minimize",
        "purity_pct": "maximize",
    },
    acquisition="ehvi",  # Expected Hypervolume Improvement
    ref_point={"yield": 50, "cost_usd": 500, "purity_pct": 80},
)

# Suggest Pareto-optimal experiments
for i in range(15):
    params = optimizer.suggest()
    results = run_multi_objective_experiment(**params)
    optimizer.observe(params, results)

# Retrieve Pareto front
pareto_front = optimizer.get_pareto_front()
```

### 3. Constraint Handling

```python
# Add experimental constraints (e.g., safety limits, equipment bounds)
optimizer = BayesianOptimizer(
    space=space,
    constraints=[
        {"param": "temperature", "op": "<=", "value": 80},  # safety limit
        {"param": "concentration_mM", "op": ">=", "value": 0.5},  # minimum viable
    ],
    constraint_method="penalty",  # or "rejection" or "log_barrier"
)
```

## Common Academic Workflow

### Bayesian Optimization Loop for Reaction Optimization

```python
from adaptyv import BayesianOptimizer, ExperimentSpace
import pandas as pd

# 1. Define search space
space = ExperimentSpace({
    "temperature_C": (30, 120),
    "solvent_ratio": (0.1, 1.0),
    "reaction_time_h": (0.5, 24),
    "catalyst_loading_mol": (0.001, 0.1),
})

# 2. Initialize with domain knowledge (optional prior)
optimizer = BayesianOptimizer(
    space=space,
    acquisition="expected_improvement",
    kernel="matern52",
    n_initial=8,
    prior_best={"temperature_C": 75, "solvent_ratio": 0.5,
                "reaction_time_h": 4, "catalyst_loading_mol": 0.01},
)

# 3. Run adaptive loop
history = []
for i in range(30):
    params = optimizer.suggest()
    yield_pct = run_reaction(**params)
    optimizer.observe(params, yield_pct)
    history.append({**params, "yield": yield_pct})
    print(f"Step {i+1}: yield={yield_pct:.1f}% | best={optimizer.best_value:.1f}%")

# 4. Analyze results
results = pd.DataFrame(history)
print(f"\nOptimal conditions: {optimizer.best_params}")
print(f"Best yield achieved: {optimizer.best_value:.1f}%")
print(f"Improvement over mean: {(optimizer.best_value / results['yield'].mean() - 1)*100:.0f}%")
```

## Key Parameters

| Parameter | Default | Range | When to Adjust |
|-----------|---------|-------|----------------|
| `acquisition` | `"ei"` | ei, ucb, pi, kg | Use `ucb` for exploration-heavy, `pi` for conservative |
| `kernel` | `"matern52"` | matern32, matern52, rbf, matern52-ard | Use `ard` for high-dimensional spaces |
| `n_initial` | `5` | 3-20 | Increase for noisy or high-dimensional spaces |
| `kappa` | `1.96` | 0.1-5.0 | Higher = more exploration (UCB only) |

## Best Practices

1. **Start with domain knowledge**: Seed the optimizer with known good/bad points to accelerate convergence.
2. **Use 5-10 initial random samples**: Ensures the GP surrogate has enough data before exploitation begins.
3. **Batch suggestions for parallel experiments**: Use `batch_size > 1` when running experiments in parallel.
4. **Validate with holdout**: After optimization, validate the best point with 3-5 replicates to confirm robustness.
5. **Log everything**: Store all parameter-result pairs for reproducibility and post-hoc analysis.

## Common Pitfalls

1. **Too few initial samples**: With fewer than 3 initial points per dimension, the surrogate model is unreliable. Use `n_initial >= 2 * n_dims`.
2. **Ignoring measurement noise**: If your experiments are noisy, set `noise=True` or provide known variance to avoid overfitting the surrogate.
3. **Over-constraining the space**: Excessive constraints can create infeasible regions where the optimizer gets stuck. Start loose and tighten iteratively.
4. **Not checking convergence**: Always plot the acquisition landscape and objective trajectory. If the optimizer plateaus early, consider restarting with different kernel parameters.

## Integration with HBE

- Combine with `references/optuna.md` for hyperparameter optimization in ML pipelines
- Use within `workflows/literature-review.md` to optimize search strategies
- Supports `references/pymc.md` for Bayesian posterior analysis of results
- See `references/tool-registry.md` for related optimization tools

## Resources

- Documentation: https://github.com/adaptyv/adaptyv
- Bayesian Optimization tutorial: https://distill.pub/2020/bayesian-optimization/
- Paper: Snoek, Larochelle, Adams. "Practical Bayesian Optimization of Machine Learning Algorithms." NeurIPS 2012
