---
name: shap
description: SHapley Additive exPlanations for model interpretability. Use to explain any ML model's predictions with theoretically grounded feature importance.
domain: cross-domain
install: pip install shap
---

# SHAP: Model Interpretability

## Overview

SHAP (SHapley Additive exPlanations) provides unified feature importance scores for any ML model. Based on game theory Shapley values, it offers both global and local explanations.

## When to Use

- Explaining model predictions in papers
- Feature importance analysis
- Debugging ML models
- Regulatory compliance (model transparency)
- Comparing feature contributions across models

## Quick Start

```python
import shap
import numpy as np

# Tree-based models (fast exact)
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Summary plot (global importance)
shap.summary_plot(shap_values, X_test, feature_names=features)

# Force plot (single prediction)
shap.force_plot(explainer.expected_value[1], shap_values[1][0], features=features)

# Dependence plot (feature interaction)
shap.dependence_plot('feature_name', shap_values[1], X_test)
```

## Core Capabilities

### 1. Model-Specific Explainers

```python
# Tree models (XGBoost, LightGBM, RandomForest, etc.)
explainer = shap.TreeExplainer(model)

# Deep learning (PyTorch, TensorFlow)
explainer = shap.DeepExplainer(model, background_data)

# Kernel (model-agnostic, slow but works on anything)
explainer = shap.KernelExplainer(model.predict, shap.sample(X_train, 100))

# Linear models (fast exact)
explainer = shap.LinearExplainer(model, X_train)
```

### 2. Visualization for Papers

```python
import matplotlib.pyplot as plt

# Beeswarm plot (replaces summary_plot)
shap.plots.beeswarm(shap_values)

# Bar plot (global feature importance)
shap.plots.bar(shap_values)

# Waterfall plot (single prediction)
shap.plots.waterfall(shap_values[0])

# Heatmap (all predictions)
shap.plots.heatmap(shap_values)

# Save for paper
plt.savefig('shap_importance.pdf', bbox_inches='tight', dpi=300)
```

### 3. SHAP Values for Reporting

```python
# Global feature importance (mean |SHAP| per feature)
global_importance = np.abs(shap_values).mean(axis=0)
for feat, imp in sorted(zip(features, global_importance), key=lambda x: -x[1]):
    print(f'{feat}: {imp:.4f}')

# Per-class importance
for cls in range(n_classes):
    print(f'Class {cls}: {np.abs(shap_values[cls]).mean(axis=0)}')
```

## Best Practices

1. **Use TreeExplainer for tree models**: 1000x faster than KernelExplainer
2. **Sample background data**: Use 100-1000 samples for KernelExplainer
3. **Report global + local**: Both summary plot and individual explanations
4. **Check consistency**: SHAP values should sum to (prediction - base_value)

## Common Pitfalls

1. **Memory with large datasets**: Sample X_test to 1000 rows before computing SHAP
2. **Slow KernelExplainer**: O(2^M * D) — reduce features or samples
3. **Multi-class output**: Returns list of arrays, one per class
4. **Feature scaling**: SHAP handles it, but tree models are scale-invariant

## Integration with HBE

- Model interpretation in `references/tool-registry.md`
- Supports `workflows/experiment-design.md` results analysis
- Works with `references/tools/scikit-learn.md` and `references/tools/pytorch-lightning.md`

## Resources

- Documentation: https://shap.readthedocs.io/
- Lundberg & Lee (2017) "A Unified Approach to Interpreting Model Predictions" — NeurIPS paper
