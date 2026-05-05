---
name: optuna
description: Automatic hyperparameter optimization — Bayesian search, pruning, and multi-objective optimization for ML models
domain: ML / Infrastructure
install: pip install optuna optuna-dashboard
---

# optuna — Automatic Hyperparameter Optimization

Optuna is a framework for automated hyperparameter optimization that uses Bayesian (TPE) sampling, pruning of unpromising trials, and supports multi-objective optimization. It integrates with PyTorch, TensorFlow, scikit-learn, and many other ML frameworks.

## When to Use

- Tuning learning rates, architectures, regularization, or any hyperparameters for ML models
- Comparing optimization algorithms (TPE, CMA-ES, Grid, Random) on a research benchmark
- Multi-objective optimization (e.g., accuracy vs. model size, latency vs. quality)
- Needing early stopping (pruning) for expensive training runs
- Running distributed optimization across multiple GPUs or nodes

## Quick Start

```python
import optuna
import sklearn.datasets
import sklearn.ensemble
from sklearn.model_selection import cross_val_score

# Define the objective function
def objective(trial):
    # Suggest hyperparameters
    n_estimators = trial.suggest_int("n_estimators", 50, 500)
    max_depth = trial.suggest_int("max_depth", 3, 20)
    min_samples_split = trial.suggest_float("min_samples_split", 0.01, 0.5)
    learning_rate = trial.suggest_float("learning_rate", 1e-4, 1e-1, log=True)

    model = sklearn.ensemble.GradientBoostingClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=min_samples_split,
        learning_rate=learning_rate,
        random_state=42,
    )

    X, y = sklearn.datasets.load_breast_cancer(return_X_y=True)
    scores = cross_val_score(model, X, y, cv=5, scoring="roc_auc")
    return scores.mean()

# Create and run a study
study = optuna.create_study(direction="maximize", study_name="breast_cancer_gbdt")
study.optimize(objective, n_trials=100, timeout=600)

print(f"Best trial: #{study.best_trial.number}")
print(f"Best AUC:   {study.best_value:.4f}")
print(f"Best params: {study.best_params}")
```

## Core Capabilities

### Suggest APIs for Different Parameter Types

```python
def objective(trial):
    # Categorical choice
    optimizer = trial.suggest_categorical("optimizer", ["adam", "sgd", "adamw"])

    # Continuous uniform
    dropout = trial.suggest_float("dropout", 0.0, 0.5)

    # Log-uniform (common for learning rates, regularization)
    lr = trial.suggest_float("lr", 1e-6, 1e-1, log=True)
    weight_decay = trial.suggest_float("weight_decay", 1e-8, 1e-2, log=True)

    # Integer range
    batch_size = trial.suggest_int("batch_size", 16, 128, step=16)
    num_layers = trial.suggest_int("num_layers", 1, 6)

    # Discrete uniform
    hidden_dim = trial.suggest_int("hidden_dim", 64, 1024, step=64)

    return train_and_evaluate(optimizer, lr, dropout, batch_size, num_layers, hidden_dim)
```

### Pruning Unpromising Trials

```python
import optuna
import optuna.integration.lightgbm as lgb_optuna
import lightgbm as lgb

# Option 1: LightGBM callback (built-in integration)
def objective_lgb(trial):
    param = {
        "objective": "binary",
        "metric": "auc",
        "learning_rate": trial.suggest_float("lr", 1e-4, 1e-1, log=True),
        "num_leaves": trial.suggest_int("num_leaves", 16, 256),
        "feature_fraction": trial.suggest_float("feature_fraction", 0.4, 1.0),
        "verbosity": -1,
    }
    dtrain = lgb.Dataset(X_train, label=y_train)
    dvalid = lgb.Dataset(X_valid, label=y_valid, reference=dtrain)

    # Pruning callback stops trials early if intermediate metrics are poor
    pruning_callback = optuna.integration.LightGBMPruningCallback(trial, "auc", valid_name="valid_1")
    model = lgb.train(param, dtrain, valid_sets=[dvalid],
                      callbacks=[pruning_callback], num_boost_round=1000)
    return model.best_score["valid_1"]["auc"]

# Option 2: Manual pruning with PyTorch
def objective_pytorch(trial):
    for epoch in range(100):
        train_one_epoch(model, optimizer, train_loader)
        val_acc = evaluate(model, val_loader)
        trial.report(val_acc, epoch)  # report intermediate metric
        if trial.should_prune():      # check if trial should be pruned
            raise optuna.TrialPruned()
    return val_acc
```

### Multi-Objective Optimization

```python
# Optimize for both accuracy and inference speed (latency)
def objective_multi(trial):
    model = build_model(trial)
    accuracy = train_and_evaluate(model)
    latency = measure_latency(model)  # in milliseconds

    return accuracy, -latency  # negate latency so higher is better for both

study = optuna.create_study(
    directions=["maximize", "maximize"],  # maximize accuracy, maximize (-latency)
    study_name="accuracy_vs_speed",
)
study.optimize(objective_multi, n_trials=200)

# Get the Pareto front
pareto_trials = study.best_trials
for t in pareto_trials:
    print(f"Acc: {t.values[0]:.4f}, Latency: {-t.values[1]:.1f}ms, Params: {t.params}")

# Visualize the Pareto front
fig = optuna.visualization.plot_pareto_front(study)
fig.write_image("pareto_front.pdf")
```

## Common Academic Workflow: Full Hyperparameter Study

```python
import optuna
import json

# 1. Create a reproducible study
study = optuna.create_study(
    direction="maximize",
    sampler=optuna.samplers.TPESampler(seed=42),
    pruner=optuna.pruners.MedianPruner(n_startup_trials=10, n_warmup_steps=5),
    study_name="transformer_hparam_search",
    storage="sqlite:///studies/transformer.db",  # persistent storage
    load_if_exists=True,
)

# 2. Run optimization (resumable)
study.optimize(objective, n_trials=300, timeout=3600 * 4, n_jobs=1)

# 3. Analyze results
print(f"Best trial: {study.best_trial.number} (value={study.best_value:.4f})")
print(f"Best params: {json.dumps(study.best_params, indent=2)}")

# 4. Generate publication figures
import matplotlib
matplotlib.use("Agg")
optuna.visualization.plot_optimization_history(study).write_image("opt_history.pdf")
optuna.visualization.plot_param_importances(study).write_image("param_importance.pdf")
optuna.visualization.plot_parallel_coordinate(study).write_image("parallel_coord.pdf")

# 5. Export trial history as CSV
trials_df = study.trials_dataframe()
trials_df.to_csv("results/optuna_trials.csv", index=False)
```

## Best Practices

- **Use `TPESampler`** (default) for most problems. Switch to `CMAESampler` for high-dimensional continuous spaces.
- **Enable pruning** from the start — it can cut wall-clock time by 50%+ on expensive training runs.
- **Set a seed** on the sampler for reproducibility: `TPESampler(seed=42)`.
- **Use SQLite or MySQL storage** to persist studies across sessions and enable distributed optimization.
- **Report intermediate metrics** with `trial.report()` to enable effective pruning.
- **Start with 50-100 trials** for initial exploration; increase to 500+ for final paper results.

## Common Pitfalls

- **Over-tuning on validation set**: Use nested cross-validation (inner loop for HPO, outer loop for evaluation) to avoid information leakage.
- **Not specifying `log=True`**: For learning rates and regularization, always use log-scale sampling.
- **Ignoring trial correlations**: Use `optuna.visualization.plot_slice()` to check if parameters are correlated.
- **Timeout vs. n_trials**: Set both — `timeout` ensures bounded compute, `n_trials` ensures enough exploration.

## Integration with HBE

- Use within `workflows/experiment-design.md` for experiment tracking and hyperparameter studies
- Pair with `references/tools/pandas.md` to analyze trial history DataFrames
- Combine with `references/tools/matplotlib.md` for generating optimization history and importance plots
- Use `references/tools/mlflow.md` alongside Optuna for full experiment tracking

## Resources

- Documentation: https://optuna.readthedocs.io/
- Optuna Dashboard: https://github.com/optuna/optuna-dashboard
- TPE Paper: Bergstra et al., "Algorithms for Hyper-Parameter Optimization" (NIPS 2011)
