# ML Benchmarking Workflow / ML 基准测试工作流

Eight-step pipeline for rigorous ML benchmarking: from dataset preparation to publication-ready results tables.
八步严格 ML 基准测试流水线：从数据准备到可发表的结果表格。

## When to Use / 适用场景

- Comparing methods on standard benchmarks (ImageNet, GLUE, Atari, etc.) / 在标准基准上比较方法
- Writing evaluation/benchmark papers with statistical significance / 撰写带统计显著性检验的评估论文
- Reproducing existing results and verifying improvements / 复现已有结果并验证改进
- Scaling experiments across model sizes, data sizes, or compute budgets / 跨模型/数据/算力的缩放实验

---

## Eight-Step Pipeline / 八步流水线

```
1. Define Task & Metrics ─── 定义任务与指标
2. Load & Split Data ──────── 加载与切分数据
3. Set Up Baselines ───────── 建立基线
4. Training Harness ───────── 训练框架
5. Evaluation & Metrics ──── 评估与指标
6. Statistical Significance ─ 统计显著性
7. Ablation & Scaling ─────── 消融与缩放
8. Results Tables & Plots ─── 结果表与图
```

---

## Step 1: Define Task & Metrics / 定义任务与指标

```python
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class BenchmarkConfig:
    name: str
    task: str                          # "classification" | "detection" | "generation" | "rl"
    datasets: List[str]               # ["imagenet", "cifar10"]
    metrics: Dict[str, str]           # {"accuracy": "higher", "loss": "lower"}
    n_seeds: int = 5                  # number of random seeds for significance
    seeds: List[int] = field(default_factory=lambda: [42, 123, 456, 789, 1024])
    confidence_level: float = 0.95
    baselines: List[str] = field(default_factory=list)
    compute_budget: str = "1x A100"   # for reproducibility reporting

# Pre-built configs for common benchmarks
NLP_BENCHMARK = BenchmarkConfig(
    name="GLUE", task="classification",
    datasets=["cola", "sst2", "mrpc", "qqp", "mnli", "qnli", "rte"],
    metrics={"accuracy": "higher", "f1": "higher", "matthews_corrcoef": "higher"},
    n_seeds=5, baselines=["bert-base", "roberta-base"],
)

CV_BENCHMARK = BenchmarkConfig(
    name="ImageNet", task="classification",
    datasets=["imagenet-1k"],
    metrics={"top1_acc": "higher", "top5_acc": "higher", "flops": "lower", "params": "lower"},
    n_seeds=3, baselines=["resnet50", "vit-base"],
)

LLM_BENCHMARK = BenchmarkConfig(
    name="MT-Bench", task="generation",
    datasets=["mt_bench"],
    metrics={"score": "higher", "win_rate": "higher"},
    n_seeds=1, baselines=["gpt-3.5-turbo", "llama-2-70b"],
)
```

---

## Step 2: Load & Split Data / 加载与切分数据

```python
from datasets import load_dataset
from torch.utils.data import DataLoader

def load_benchmark_data(dataset_name: str):
    """Load standard benchmark datasets with consistent preprocessing."""
    loaders = {
        "imagenet-1k": lambda: load_dataset("imagenet-1k", split="validation"),
        "cifar10": lambda: load_dataset("cifar10"),
        "cifar100": lambda: load_dataset("cifar100"),
        "sst2": lambda: load_dataset("glue", "sst2"),
        "mnli": lambda: load_dataset("glue", "mnli"),
        "cola": lambda: load_dataset("glue", "cola"),
        "qqp": lambda: load_dataset("glue", "qqp"),
        "mrpc": lambda: load_dataset("glue", "mrpc"),
        "qnli": lambda: load_dataset("glue", "qnli"),
        "rte": lambda: load_dataset("glue", "rte"),
    }
    if dataset_name not in loaders:
        raise ValueError(f"Unknown dataset: {dataset_name}. Supported: {list(loaders.keys())}")
    return loaders[dataset_name]()


def create_dataloader(dataset, batch_size=32, shuffle=False, collate_fn=None):
    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, collate_fn=collate_fn)
```

---

## Step 3: Set Up Baselines / 建立基线

```python
def load_baseline_results(benchmark_name: str) -> dict:
    """Load published baseline results for comparison."""
    baselines = {
        "imagenet-1k": {
            "resnet50": {"top1_acc": 76.1, "top5_acc": 92.9, "params": "25.6M", "flops": "4.1G"},
            "vit-base-p16": {"top1_acc": 81.8, "top5_acc": 95.7, "params": "86.6M", "flops": "17.6G"},
            "deit-base": {"top1_acc": 81.8, "top5_acc": 95.6, "params": "86.6M", "flops": "4.6G"},
            "efficientnet-b4": {"top1_acc": 82.9, "top5_acc": 96.2, "params": "19.3M", "flops": "1.8G"},
        },
        "sst2": {
            "bert-base": {"accuracy": 92.7},
            "roberta-base": {"accuracy": 94.8},
            "deberta-base": {"accuracy": 95.1},
        },
        "cifar10": {
            "resnet18": {"accuracy": 93.0},
            "vgg16": {"accuracy": 93.6},
            "efficientnet-b0": {"accuracy": 97.1},
        },
    }
    return baselines.get(benchmark_name, {})
```

---

## Step 4: Training Harness / 训练框架

```python
import numpy as np
import torch
import torch.nn as nn
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

def train_and_evaluate(
    model_fn,              # callable returning a fresh model
    train_loader,
    val_loader,
    test_loader,
    config: BenchmarkConfig,
    epochs: int = 100,
    lr: float = 1e-3,
    weight_decay: float = 0.01,
    device: str = "cuda",
):
    """Run multi-seed training and evaluation."""
    all_results = []

    for seed in config.seeds[:config.n_seeds]:
        torch.manual_seed(seed)
        np.random.seed(seed)

        model = model_fn().to(device)
        optimizer = AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
        scheduler = CosineAnnealingLR(optimizer, T_max=epochs)

        for epoch in range(epochs):
            _train_epoch(model, train_loader, optimizer, device)
            scheduler.step()

        test_metrics = _evaluate(model, test_loader, config.metrics, device)
        test_metrics["seed"] = seed
        all_results.append(test_metrics)
        print(f"Seed {seed}: {test_metrics}")

    return aggregate_results(all_results)


def _train_epoch(model, loader, optimizer, device):
    model.train()
    total_loss = 0
    for batch in loader:
        if isinstance(batch, dict):
            x = batch["input_ids"].to(device)
            y = batch["label"].to(device)
        else:
            x, y = batch[0].to(device), batch[1].to(device)
        loss = nn.CrossEntropyLoss()(model(x), y)
        loss.backward()
        optimizer.step()
        optimizer.zero_grad()
        total_loss += loss.item()
    return total_loss / len(loader)


def _evaluate(model, loader, metrics, device):
    model.eval()
    all_preds, all_labels = [], []
    with torch.no_grad():
        for batch in loader:
            if isinstance(batch, dict):
                x = batch["input_ids"].to(device)
                y = batch["label"].to(device)
            else:
                x, y = batch[0].to(device), batch[1].to(device)
            preds = model(x).argmax(dim=-1)
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(y.cpu().numpy())

    from sklearn.metrics import accuracy_score, f1_score, matthews_corrcoef
    results = {}
    if "accuracy" in metrics:
        results["accuracy"] = accuracy_score(all_labels, all_preds) * 100
    if "f1" in metrics:
        results["f1"] = f1_score(all_labels, all_preds, average="macro") * 100
    if "matthews_corrcoef" in metrics:
        results["matthews_corrcoef"] = matthews_corrcoef(all_labels, all_preds) * 100
    return results


def aggregate_results(all_results):
    """Aggregate multi-seed results into mean +/- std."""
    metrics = {k: [] for k in all_results[0] if k != "seed"}
    for r in all_results:
        for k in metrics:
            metrics[k].append(r[k])
    return {
        k: {"mean": np.mean(v), "std": np.std(v), "values": v}
        for k, v in metrics.items()
    }
```

---

## Step 5: Evaluation & Metrics / 评估与指标

```python
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score,
    roc_auc_score, matthews_corrcoef, cohen_kappa_score,
)
import numpy as np

def compute_classification_metrics(y_true, y_pred, y_prob=None):
    """Comprehensive classification metrics."""
    metrics = {
        "accuracy": accuracy_score(y_true, y_pred),
        "f1_macro": f1_score(y_true, y_pred, average="macro"),
        "precision_macro": precision_score(y_true, y_pred, average="macro", zero_division=0),
        "recall_macro": recall_score(y_true, y_pred, average="macro", zero_division=0),
        "mcc": matthews_corrcoef(y_true, y_pred),
        "kappa": cohen_kappa_score(y_true, y_pred),
    }
    if y_prob is not None:
        metrics["auroc"] = roc_auc_score(y_true, y_prob, multi_class="ovr")
    return metrics


def compute_generation_metrics(predictions, references):
    """NLP generation metrics via HuggingFace evaluate."""
    import evaluate
    results = {}
    for metric_name in ["rouge", "bleu", "bertscore", "meteor"]:
        try:
            metric = evaluate.load(metric_name)
            if metric_name == "rouge":
                results.update(metric.compute(predictions=predictions, references=references))
            elif metric_name == "bleu":
                results["bleu"] = metric.compute(
                    predictions=[p.split() for p in predictions],
                    references=[[r.split()] for r in references],
                )["bleu"]
            elif metric_name == "bertscore":
                bs = metric.compute(predictions=predictions, references=references, lang="en")
                results["bertscore_f1"] = np.mean(bs["f1"])
        except Exception:
            pass
    return results
```

---

## Step 6: Statistical Significance / 统计显著性

```python
import numpy as np
from scipy import stats

def paired_t_test(results_a, results_b, alternative="two-sided"):
    """Paired t-test between two sets of results across seeds."""
    t_stat, p_value = stats.ttest_rel(results_a, results_b, alternative=alternative)
    return {"t_statistic": t_stat, "p_value": p_value, "significant": p_value < 0.05}


def wilcoxon_test(results_a, results_b):
    """Wilcoxon signed-rank test (non-parametric, for small N)."""
    stat, p_value = stats.wilcoxon(results_a, results_b)
    return {"statistic": stat, "p_value": p_value, "significant": p_value < 0.05}


def bootstrap_ci(results, n_bootstrap=10000, ci=0.95):
    """Bootstrap confidence interval for mean performance."""
    results = np.array(results)
    boot_means = [
        np.mean(np.random.choice(results, size=len(results), replace=True))
        for _ in range(n_bootstrap)
    ]
    alpha = (1 - ci) / 2
    return {
        "mean": np.mean(results),
        "lower": np.percentile(boot_means, alpha * 100),
        "upper": np.percentile(boot_means, (1 - alpha) * 100),
        "ci_level": ci,
    }


def bayesian_comparison(results_a, results_b, rope=0.5):
    """Bayesian comparison using Normal-Gamma posterior."""
    diff = np.array(results_a) - np.array(results_b)
    n = len(diff)
    posterior_mean = np.mean(diff)
    posterior_se = np.std(diff, ddof=1) / np.sqrt(n)
    t_dist = stats.t(df=n - 1, loc=posterior_mean, scale=posterior_se)
    return {
        "p_a_better": t_dist.sf(0),
        "p_b_better": t_dist.cdf(0),
        "p_rope": t_dist.cdf(rope) - t_dist.cdf(-rope),
        "posterior_mean_diff": posterior_mean,
        "credible_95": (t_dist.ppf(0.025), t_dist.ppf(0.975)),
    }


def significance_table(all_methods_results: dict):
    """Generate pairwise significance table for all methods."""
    methods = list(all_methods_results.keys())
    table = []
    for i, mi in enumerate(methods):
        row = {"method": mi}
        for j, mj in enumerate(methods):
            if i == j:
                row[mj] = "---"
            else:
                test = paired_t_test(all_methods_results[mi], all_methods_results[mj])
                sig = "***" if test["p_value"] < 0.001 else "**" if test["p_value"] < 0.01 else "*" if test["p_value"] < 0.05 else "ns"
                row[mj] = f"p={test['p_value']:.4f} ({sig})"
        table.append(row)
    return table
```

---

## Step 7: Ablation & Scaling / 消融与缩放实验

### Ablation Study

```python
def run_ablation(
    full_model_fn,
    ablation_variants: dict,  # {"label": variant_model_fn}
    train_loader,
    test_loader,
    config: BenchmarkConfig,
):
    """Run ablation study by removing/replacing one component at a time."""
    results = {}
    full_results = train_and_evaluate(full_model_fn, train_loader, test_loader, test_loader, config)
    results["full_model"] = full_results

    for label, variant_fn in ablation_variants.items():
        results[label] = train_and_evaluate(
            variant_fn, train_loader, test_loader, test_loader, config
        )

    primary_metric = list(config.metrics.keys())[0]
    full_val = results["full_model"][primary_metric]["mean"]
    print(f"\n{'Variant':<25} {primary_metric:<15} {'Delta':<10}")
    print("-" * 50)
    print(f"{'Full model':<25} {full_val:.2f}          ---")
    for label in ablation_variants:
        val = results[label][primary_metric]["mean"]
        print(f"{label:<25} {val:.2f}          {val - full_val:+.2f}")
    return results
```

### Scaling Experiments

```python
def scaling_sweep(
    model_configs: list,    # [{"name": "small", "params": 10e6, "fn": model_fn}]
    train_loader,
    test_loader,
    config: BenchmarkConfig,
):
    """Run scaling experiments across model sizes or compute budgets."""
    results = []
    for mc in model_configs:
        print(f"Training {mc['name']} ({mc['params']/1e6:.1f}M params)...")
        r = train_and_evaluate(mc["fn"], train_loader, test_loader, test_loader, config)
        r["name"] = mc["name"]
        r["params"] = mc["params"]
        results.append(r)
    return results


def plot_scaling(results, metric_name, save_path="scaling.pdf"):
    """Plot scaling curve: metric vs model size."""
    import matplotlib.pyplot as plt
    params = [r["params"] for r in results]
    means = [r[metric_name]["mean"] for r in results]
    stds = [r[metric_name]["std"] for r in results]
    names = [r["name"] for r in results]

    plt.figure(figsize=(8, 5))
    plt.errorbar(params, means, yerr=stds, fmt="o-", capsize=5, linewidth=2)
    plt.xscale("log")
    plt.xlabel("Parameters")
    plt.ylabel(metric_name)
    plt.title(f"Scaling: {metric_name} vs Model Size")
    plt.grid(True, alpha=0.3)
    for i, name in enumerate(names):
        plt.annotate(name, (params[i], means[i]), textcoords="offset points", xytext=(10, 5))
    plt.savefig(save_path, bbox_inches="tight")
    plt.close()
```

---

## Step 8: Results Tables & Plots / 结果表与图

### LaTeX Results Table

```python
def generate_latex_table(
    methods_results: dict,
    config: BenchmarkConfig,
    caption: str = "Main results.",
    label: str = "tab:main_results",
):
    """Generate a LaTeX table from benchmark results."""
    metrics_keys = list(config.metrics.keys())
    cols = "l" + "c" * len(metrics_keys)

    lines = [
        r"\begin{table}[t]",
        r"\centering",
        r"\caption{" + caption + "}",
        r"\label{" + label + "}",
        r"\begin{tabular}{" + cols + "}",
        r"\toprule",
    ]

    header = "Method"
    for m in metrics_keys:
        header += " & " + m.replace("_", "\\_")
    header += r" \\"
    lines.extend([header, r"\midrule"])

    # Find best per metric
    best = {}
    for m in metrics_keys:
        vals = [(method, results[m]["mean"]) for method, results in methods_results.items()]
        if config.metrics[m] == "higher":
            best[m] = max(v for _, v in vals)
        else:
            best[m] = min(v for _, v in vals)

    for method, results in methods_results.items():
        row = method.replace("_", "\\_")
        for m in metrics_keys:
            mean, std = results[m]["mean"], results[m]["std"]
            val_str = f"{mean:.1f}"
            if abs(mean - best[m]) < 0.05:
                val_str = r"\textbf{" + val_str + "}"
            row += f" & {val_str} ${{\\pm {std:.1f}}}$"
        row += r" \\"
        lines.append(row)

    lines.extend([r"\bottomrule", r"\end{tabular}", r"\end{table}"])
    return "\n".join(lines)
```

### Matplotlib Comparison Plot

```python
def plot_comparison_bar(
    methods_results: dict,
    metric_name: str,
    title: str = "Method Comparison",
    save_path: str = "comparison.pdf",
):
    """Bar chart comparing methods on a single metric."""
    import matplotlib.pyplot as plt

    methods = list(methods_results.keys())
    means = [methods_results[m][metric_name]["mean"] for m in methods]
    stds = [methods_results[m][metric_name]["std"] for m in methods]

    fig, ax = plt.subplots(figsize=(10, 5))
    x = range(len(methods))
    bars = ax.bar(x, means, yerr=stds, capsize=5, color="steelblue", edgecolor="black", linewidth=0.5)
    ax.set_xticks(x)
    ax.set_xticklabels(methods, rotation=30, ha="right")
    ax.set_ylabel(metric_name)
    ax.set_title(title)
    ax.grid(axis="y", alpha=0.3)

    for bar, mean in zip(bars, means):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height(),
                f"{mean:.1f}", ha="center", va="bottom", fontsize=9)

    plt.tight_layout()
    plt.savefig(save_path, bbox_inches="tight")
    plt.close()
```

---

## Cross-Domain Templates / 跨领域模板

### NLP (GLUE / HELM)

```python
nlp_config = BenchmarkConfig(
    name="GLUE", task="classification",
    datasets=["cola", "sst2", "mrpc", "qqp", "mnli", "qnli", "rte"],
    metrics={"accuracy": "higher"},
    n_seeds=5, baselines=["bert-base", "roberta-base", "deberta-base"],
)
# Use HuggingFace transformers for model loading
# Use datasets library for GLUE data
# Report dev set for all tasks, test set via submission
```

### CV (ImageNet / COCO)

```python
cv_config = BenchmarkConfig(
    name="ImageNet", task="classification",
    datasets=["imagenet-1k"],
    metrics={"top1_acc": "higher", "top5_acc": "higher", "flops": "lower", "params": "lower"},
    n_seeds=3, baselines=["resnet50", "vit-base", "deit-base"],
)
# Report: top-1, top-5, FLOPs, params, throughput (images/sec)
# For detection: AP, AP50, AP75, AP_S, AP_M, AP_L
```

### RL (Atari / MuJoCo)

```python
rl_config = BenchmarkConfig(
    name="Atari-57", task="rl",
    datasets=["atari-57"],
    metrics={"mean_score": "higher", "median_score": "higher", "iqm": "higher"},
    n_seeds=10, baselines=["dqn", "rainbow", "c51"],
)
# RL needs more seeds (10+) due to high variance
# Report: mean, median, IQM, human-normalized score
# Use stratified bootstrap for CIs
```

### LLM (MT-Bench / MMLU)

```python
llm_config = BenchmarkConfig(
    name="MT-Bench", task="generation",
    datasets=["mt_bench"],
    metrics={"score": "higher", "win_rate": "higher"},
    n_seeds=1, baselines=["gpt-3.5-turbo", "gpt-4", "llama-2-70b"],
)
# LLM benchmarks typically single-run (expensive)
# Report: turn-1, turn-2, average scores
# MMLU: 57 subjects, report 5-shot accuracy per subject + average
```

---

## Best Practices / 最佳实践

- Always run **multiple seeds** (N>=3 for CV, N>=5 for NLP, N>=10 for RL) and report mean +/- std.
- Use **paired statistical tests** (not just comparing means) to verify improvements are significant.
- Report **compute budget**: GPU type, training time, FLOPs, total energy if possible.
- Include **SOTA baselines** from the last 2 years at top venues (NeurIPS, ICML, ICLR, CVPR, ACL).
- For LLM benchmarks, report both **automatic metrics** and **human evaluation** when possible.
- Use **deterministic evaluation** (`torch.backends.cudnn.deterministic = True`) for reproducibility.

## Common Pitfalls / 常见陷阱

- **Cherry-picking seeds**: Reporting only the best seed is dishonest. Always report mean +/- std over all seeds.
- **Test set leakage**: Do not tune hyperparameters on the test set. Use a held-out validation set.
- **Inconsistent preprocessing**: Ensure all methods use the same data augmentation and preprocessing pipeline.
- **Ignoring variance**: A 0.1% improvement with std=0.5% is not meaningful. Always run significance tests.
- **Compute-asymmetry**: Comparing a method trained for 100 epochs vs baselines at 50 epochs is unfair. Match compute budgets.
- **Metric mismatch**: Some tasks have domain-specific metrics (e.g., BLEU for translation, mAP for detection). Use the standard metric.

## Integration / 集成

- Use `references/tools/pytorch.md` or `references/tools/jax.md` for training implementations.
- Track experiments with `references/tools/wandb.md` for logging and comparison.
- Use `references/benchmark-paper-template.md` for writing the final paper.
- Connect to `workflows/experiment-design.md` for general experiment design methodology.
- Use `references/figure-design-guide.md` for publication-quality plots.
