---
name: wandb
description: Experiment tracking for ML — log metrics, hyperparameters, artifacts, and model checkpoints with rich dashboards
domain: ML / Infrastructure
install: pip install wandb
---

# wandb — ML Experiment Tracking / ML 实验追踪

Track machine learning experiments with metrics logging, hyperparameter management, artifact versioning, and collaborative dashboards for reproducible research.

## When to Use / 适用场景

- Tracking training metrics across hundreds of hyperparameter configurations / 追踪超参数搜索中的训练指标
- Comparing model versions and dataset artifacts in a team project / 团队协作中比较模型版本和数据集
- Generating publication-ready supplementary material from experiment logs / 从实验日志生成论文补充材料
- Running Bayesian hyperparameter sweeps with distributed agents / 运行贝叶斯超参数搜索
- Logging media outputs (images, 3D point clouds, video) for generative models / 记录生成模型的媒体输出
- Offline experiment logging on HPC clusters without internet access / HPC 集群离线实验记录

## Quick Start / 快速开始

```python
import wandb

# Initialize a run with configuration
run = wandb.init(
    project="protein-structure-prediction",
    entity="my-lab",
    config={
        "model": "ESM-2-650M",
        "lr": 3e-4,
        "batch_size": 32,
        "epochs": 50,
        "warmup_steps": 1000,
    },
    tags=["baseline", "esm2"],
    notes="Initial baseline with frozen backbone",
)

# Log metrics during training
for epoch in range(50):
    train_loss = train_one_epoch()
    val_loss, val_f1 = evaluate()
    wandb.log({
        "train/loss": train_loss,
        "val/loss": val_loss,
        "val/f1": val_f1,
        "epoch": epoch,
        "lr": scheduler.get_last_lr()[0],
    })

# Finish the run
wandb.finish()
```

## Core Capabilities / 核心能力

### 1. Artifacts and Model Versioning / 制品与模型版本管理

Track datasets, model checkpoints, and intermediate outputs as versioned artifacts with automatic lineage tracking.

```python
# Log a dataset artifact
artifact = wandb.Artifact(
    "mnist-train-v2", type="dataset",
    description="MNIST training set with augmented samples",
    metadata={"split": "train", "num_samples": 60000, "augmented": True},
)
artifact.add_dir("data/mnist/train")
run.log_artifact(artifact)

# Log a model checkpoint
model_artifact = wandb.Artifact(
    "resnet50-epoch-50", type="model",
    description="ResNet50 checkpoint after 50 epochs",
)
model_artifact.add_file("checkpoints/resnet50_epoch50.pt")
run.log_artifact(model_artifact)

# Use a logged artifact in a downstream run
artifact = run.use_artifact("my-lab/mnist-train-v2:latest")
data_dir = artifact.download()
```

### 2. Tables for Dataset Comparison / 数据集比较表格

Create interactive tables to visualize and compare model predictions, dataset samples, or evaluation results.

```python
# Create a table with predictions for analysis
table = wandb.Table(columns=["image", "true_label", "predicted", "confidence"])

for img_path, true_lbl, pred_lbl, conf in zip(
    image_paths, true_labels, predictions, confidences
):
    table.add_data(wandb.Image(img_path), true_lbl, pred_lbl, conf)

run.log({"predictions_table": table})

# Compare tables across runs in the workspace UI
```

### 3. Custom Charts and Media Logging / 自定义图表与媒体记录

Log images, 3D point clouds, segmentation masks, and custom charts for computer vision models.

```python
# Log images with segmentation masks overlaid
wandb.log({
    "val/images": [
        wandb.Image(img, masks={
            "predictions": {"mask_data": pred_mask, "class_labels": class_map},
            "ground_truth": {"mask_data": gt_mask, "class_labels": class_map},
        })
        for img, pred_mask, gt_mask in zip(images, pred_masks, gt_masks)
    ],
})

# Log 3D point clouds
point_cloud = wandb.Object3D(
    open("point_cloud.ply"), caption="Reconstructed molecule"
)
wandb.log({"molecule_3d": point_cloud})

# Custom chart: loss vs learning rate
wandb.log({"custom/lr_loss": wandb.plot.line_series(
    xs=lr_schedule, ys=[losses],
    keys=["loss"], title="Loss vs Learning Rate", xname="lr",
)})
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Hyperparameter Sweep with Weights & Biases / 超参数搜索

Run a Bayesian sweep with early termination and log all results for paper comparison tables.

```python
import wandb

sweep_config = {
    "method": "bayes",
    "metric": {"name": "val/f1", "goal": "maximize"},
    "parameters": {
        "lr": {"min": 1e-5, "max": 1e-3, "distribution": "log_uniform_values"},
        "weight_decay": {"values": [0.0, 1e-4, 1e-3, 1e-2]},
        "hidden_dim": {"values": [128, 256, 512]},
        "dropout": {"min": 0.0, "max": 0.5},
    },
    "early_terminate": {"type": "hyperband", "min_iter": 5, "max_iter": 50},
}

def train_sweep():
    run = wandb.init()
    config = run.config
    model = build_model(config.hidden_dim, config.dropout)
    optimizer = torch.optim.AdamW(
        model.parameters(), lr=config.lr, weight_decay=config.weight_decay
    )
    for epoch in range(50):
        train_loss = train_one_epoch(model, optimizer)
        val_f1 = evaluate(model)
        wandb.log({"val/f1": val_f1, "epoch": epoch})

sweep_id = wandb.sweep(sweep_config, project="sweep-comparison")
wandb.agent(sweep_id, train_sweep, count=100)
```

### Workflow 2: Offline Logging on HPC Clusters / HPC 集群离线记录

Log experiments on compute clusters without internet, then sync when connected.

```python
import os
os.environ["WANDB_MODE"] = "offline"  # Set before wandb.init

run = wandb.init(project="hpc-training", config=config)
for epoch in range(100):
    loss = train_one_epoch()
    wandb.log({"train/loss": loss, "epoch": epoch})
wandb.finish()

# After the job completes, sync from the compute node:
# $ wandb sync wandb/offline-run-20260504_123456-abc123
```

## Best Practices / 最佳实践

- Use nested metric names with `/` separator (e.g., `train/loss`, `val/accuracy`) to organize dashboard panels into logical groups.
- Tag runs with experiment identifiers (e.g., `["ablation", "no-augmentation"]`) so you can filter and compare specific groups in the UI.
- Log `wandb.config` once at init and never mutate it; if configuration changes mid-run, start a new run to maintain clean lineage.
- Use `wandb.Artifact` for every dataset and model checkpoint so readers can reproduce results by downloading exact versions from the supplementary materials.
- Set `WANDB_SILENT=true` in shared HPC environments to avoid noisy stdout output when many users run on the same node.
- Use `wandb.init(settings=wandb.Settings(start_method="thread"))` inside Jupyter notebooks to avoid multiprocessing errors.

## Common Pitfalls / 常见陷阱

- **Forgotten `wandb.finish()`**: In long-running scripts, omitting `wandb.finish()` before a new `wandb.init()` can cause metrics to bleed between runs. Always call `finish()` explicitly.
- **Logging large arrays**: `wandb.log({"big_tensor": huge_numpy_array})` creates heavy artifacts. Log scalar summaries instead, or use `wandb.Histogram` for distributions.
- **Sweep agent blocking**: `wandb.agent()` blocks by default. Use `wandb.agent(sweep_id, function, count=N)` with a finite `count` to avoid infinite loops in scripted environments.
- **Offline sync conflicts**: If multiple jobs write to the same project directory offline, use unique run IDs via `wandb.init(id=f"run-{os.getpid()}")` to prevent sync collisions.
- **Git diff not captured**: wandb automatically logs git status, but if you run from a non-git directory, pass `wandb.init(settings=wandb.Settings(save_code=False))` to suppress warnings.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for structured experiment tracking with reproducible configurations.
- Pair with `references/tools/ray.md` to run distributed sweeps where each Ray worker logs to a separate wandb run under the same sweep.
- Combine with `references/tools/pytorch.md` to integrate `wandb.log` calls inside training loops for automatic metric synchronization.
- Use wandb Reports to generate shareable supplementary material linked from your paper.

## Resources / 资源

- Documentation: https://docs.wandb.ai/
- GitHub: https://github.com/wandb/wandb
- Sweeps Guide: https://docs.wandb.ai/guides/sweeps
- Artifacts Guide: https://docs.wandb.ai/guides/artifacts
