# Experiment Design Workflow / 实验设计工作流

## Overview / 概览

系统性实验设计：从论点到结果。

Systematic experiment design: from claims to results.

## Step 1: Claims Extraction / 论点提取

| # | Claim | Strength | Evidence Needed |
|---|-------|----------|-----------------|
| 1 | Method X outperforms Y | Strong | Benchmark comparison |
| 2 | Component A helps | Medium | Ablation study |
| 3 | Scalable to large N | Moderate | Scaling experiment |

## Step 2: Baseline Selection / 基线选择

- **Must**: SOTA (last 2 years, top venues)
- **Should**: Classic baselines, ablation variants
- **Nice**: Oracle, upper bounds

| Method | Venue | Year | Code | Why |
|--------|-------|------|------|-----|
| Method A | NeurIPS | 2024 | ✅ | SOTA |
| Method B | ICML | 2024 | ✅ | SOTA |

## Step 3: Dataset & Metrics / 数据集与指标

- Use official train/val/test splits
- Standard evaluation metrics per task
- Statistical tests: paired t-test or Wilcoxon for N≥30
- Report p-values and confidence intervals

## Step 4: Main Experiment Table / 主实验表

```
| Method | Dataset A | Dataset B | Avg |
|--------|-----------|-----------|-----|
| Baseline | 85.2 ± 0.3 | 78.1 ± 0.5 | 78.5 |
| **Ours** | **92.1 ± 0.2** | **85.3 ± 0.4** | **85.7** |
```

## Step 5: Ablation Study / 消融实验

| Variant | Accuracy | Δ |
|---------|----------|---|
| Full model | **92.1** | — |
| − Component A | 89.5 | −2.6 |
| − Component B | 90.3 | −1.8 |

## Step 6: Experiment Script Template / 实验脚本模板

```python
import argparse, json, numpy as np

def run_experiment(config):
    # Load data, initialize model, train, evaluate
    return metrics

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=int, nargs="+", default=[42, 123, 456])
    parser.add_argument("--dataset", type=str, required=True)
    parser.add_argument("--output", type=str, default="results.json")
    args = parser.parse_args()

    all_results = []
    for seed in args.seed:
        np.random.seed(seed)
        all_results.append(run_experiment(vars(args)))

    mean = {k: np.mean([r[k] for r in all_results]) for k in all_results[0]}
    std = {k: np.std([r[k] for r in all_results]) for k in all_results[0]}
    with open(args.output, "w") as f:
        json.dump({"mean": mean, "std": std}, f, indent=2)

if __name__ == "__main__":
    main()
```

## Monitoring / 训练监控

```bash
nohup python3 train.py --config exp.yaml > logs/train.log 2>&1 &
tail -f logs/train.log
```

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full registry. Quick reference:

| Task | Primary Tool | Install |
|------|-------------|---------|
| Classical ML | scikit-learn | `pip install scikit-learn` |
| Deep Learning | pytorch-lightning | `pip install pytorch-lightning` |
| NLP / LLM | transformers | `pip install transformers` |
| Graph ML | torch-geometric | `pip install torch-geometric` |
| Reinforcement Learning | stable-baselines3 | `pip install stable-baselines3` |
| Bayesian | pymc | `pip install pymc` |
| Interpretability | shap | `pip install shap` |
| Time Series | timesfm or aeon | `pip install timesfm` |
| Causal Inference | statspai | `pip install statspai` |
| Molecular property | deepchem | `pip install deepchem` |
| Molecular docking | diffdock | `pip install diffdock` |
| Quantum ML | pennylane | `pip install pennylane` |

## Cross-References / 交叉引用

- **Hypothesis first**: Before designing experiments, formulate hypotheses using `references/hypothesis-generation-guide.md`
- **Statistical testing**: Select appropriate tests using `references/statistical-analysis-guide.md`
- **Data processing**: Prepare data using `references/data-processing-guide.md` seven-stage pipeline
- **Paper writing**: Map experiments to claims using `workflows/paper-writing.md`
- **Causal inference**: For causal questions, use `references/causal-inference-guide.md` instead of standard experiments
- **Tools**: See `references/tool-registry.md` for modeling tools by discipline
