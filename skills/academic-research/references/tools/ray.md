---
name: ray
description: Distributed computing framework — scale Python workloads from laptop to cluster with Ray Tasks, Actors, and RLlib
domain: ML / Infrastructure
install: pip install ray
---

# ray — Distributed Computing Framework / 分布式计算框架

Scale Python applications from a single laptop to a multi-node cluster with unified APIs for tasks, actors, distributed training, hyperparameter tuning, and reinforcement learning.

## When to Use / 适用场景

- Distributed hyperparameter tuning with early stopping across multiple GPUs / 跨多 GPU 的分布式超参数调优
- Scaling data preprocessing and inference across a cluster / 在集群上扩展数据预处理和推理
- Training reinforcement learning agents with RLlib on complex environments / 使用 RLlib 训练强化学习智能体
- Running large-scale batch simulations in parallel / 并行运行大规模批量模拟
- Serving models at production scale with Ray Serve / 使用 Ray Serve 生产级模型服务

## Quick Start / 快速开始

```python
import ray

ray.init()

@ray.remote
def train_model(config: dict) -> dict:
    import numpy as np
    np.random.seed(config["seed"])
    weights = np.random.randn(config["hidden"], config["hidden"])
    loss = float(np.linalg.norm(weights @ weights - np.eye(config["hidden"])))
    return {"config": config, "loss": loss}

configs = [{"seed": i, "hidden": 128, "lr": 10**(-i * 0.1)} for i in range(20)]
results = ray.get([train_model.remote(c) for c in configs])
best = min(results, key=lambda r: r["loss"])
print(f"Best config: {best}")
ray.shutdown()
```

## Core Capabilities / 核心能力

### 1. Ray Tasks and Object Store / Ray 任务与对象存储

Execute functions remotely with automatic object placement in a shared memory store.

```python
import ray
import numpy as np

ray.init()

@ray.remote
def generate_matrix(size: int) -> np.ndarray:
    return np.random.randn(size, size)

@ray.remote
def compute_eigenvalues(matrix_ref) -> np.ndarray:
    matrix = ray.get(matrix_ref)
    return np.linalg.eigvalsh(matrix)

matrices = [generate_matrix.remote(2000) for _ in range(8)]
eigenvalues = ray.get([compute_eigenvalues.remote(m) for m in matrices])
```

### 2. Ray Actors for Stateful Workers / 有状态工作节点

Create stateful remote workers that maintain state across multiple method calls.

```python
import ray

@ray.remote
class ModelWorker:
    def __init__(self, model_name: str):
        import torch
        import torchvision
        self.model = torchvision.models.resnet18(pretrained=False, num_classes=10)
        self.model.eval()

    def predict_batch(self, images: list) -> list:
        import torch
        with torch.no_grad():
            tensor = torch.stack(images)
            return self.model(tensor).tolist()

workers = [ModelWorker.remote("resnet18") for _ in range(4)]
batch_results = ray.get([w.predict_batch.remote(batch) for w, batch in zip(workers, batches)])
```

### 3. Ray Tune for Hyperparameter Search / 超参数搜索

Distributed hyperparameter optimization with ASHA, PBT, and Bayesian search algorithms.

```python
import ray
from ray import tune
from ray.tune.schedulers import ASHAScheduler

def train_fn(config):
    import numpy as np
    for epoch in range(config["epochs"]):
        loss = config["lr"] * np.exp(-epoch * config["decay"])
        tune.report({"loss": loss, "epoch": epoch})

scheduler = ASHAScheduler(max_t=100, grace_period=10, reduction_factor=3)

tuner = tune.Tuner(
    train_fn,
    param_space={
        "lr": tune.loguniform(1e-4, 1e-1),
        "decay": tune.uniform(0.01, 0.1),
        "epochs": 100,
    },
    tune_config=tune.TuneConfig(metric="loss", mode="min", scheduler=scheduler, num_samples=200),
)
results = tuner.fit()
best = results.get_best_result()
print(f"Best config: {best.config}, loss: {best.metrics['loss']:.6f}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Distributed Training with Ray Train / 分布式模型训练

Scale PyTorch training across multiple GPUs on a single node or cluster.

```python
import ray
from ray.train.torch import TorchTrainer, get_device, prepare_model, prepare_data_loader
from ray.train import ScalingConfig, RunConfig, CheckpointConfig
import torch
from torch import nn, optim
from torch.utils.data import DataLoader, TensorDataset

def train_loop_per_worker(config):
    device = get_device()
    model = nn.Sequential(nn.Linear(768, 256), nn.ReLU(), nn.Linear(256, 10)).to(device)
    model = prepare_model(model)
    X = torch.randn(10000, 768); y = torch.randint(0, 10, (10000,))
    loader = prepare_data_loader(DataLoader(TensorDataset(X, y), batch_size=256))
    optimizer = optim.Adam(model.parameters(), lr=config["lr"])
    for epoch in range(config["epochs"]):
        total_loss = 0.0
        for xb, yb in loader:
            xb, yb = xb.to(device), yb.to(device)
            loss = nn.CrossEntropyLoss()(model(xb), yb)
            loss.backward(); optimizer.step(); optimizer.zero_grad()
            total_loss += loss.item()
        ray.train.report({"loss": total_loss / len(loader), "epoch": epoch})

trainer = TorchTrainer(
    train_loop_per_worker=train_loop_per_worker,
    train_loop_config={"lr": 1e-3, "epochs": 20},
    scaling_config=ScalingConfig(num_workers=2, use_gpu=True),
)
result = trainer.fit()
print(f"Final loss: {result.metrics['loss']:.4f}")
```

### Workflow 2: Hyperparameter Tuning with ASHA / ASHA 超参数调优

```python
import ray
from ray import tune
from ray.tune.schedulers import ASHAScheduler
import torch
from torch import nn, optim
from torch.utils.data import DataLoader, TensorDataset

def objective(config):
    model = nn.Sequential(
        nn.Linear(784, config["hidden"]), nn.ReLU(),
        nn.Dropout(config["dropout"]), nn.Linear(config["hidden"], 10),
    )
    optimizer = optim.AdamW(model.parameters(), lr=config["lr"], weight_decay=config["wd"])
    X_train, y_train = torch.randn(5000, 784), torch.randint(0, 10, (5000,))
    loader = DataLoader(TensorDataset(X_train, y_train), batch_size=128)
    for epoch in range(50):
        for xb, yb in loader:
            loss = nn.CrossEntropyLoss()(model(xb), yb)
            loss.backward(); optimizer.step(); optimizer.zero_grad()
        tune.report({"loss": float(loss), "epoch": epoch})

analysis = tune.run(
    objective,
    config={"lr": tune.loguniform(1e-4, 1e-2), "wd": tune.loguniform(1e-5, 1e-2),
            "hidden": tune.choice([64, 128, 256, 512]), "dropout": tune.uniform(0.0, 0.5)},
    num_samples=150, scheduler=ASHAScheduler(max_t=50, grace_period=5, reduction_factor=3),
    metric="loss", mode="min", resources_per_trial={"cpu": 2, "gpu": 0.5},
)
print(f"Best: {analysis.best_config}, loss: {analysis.best_result['loss']:.4f}")
```

## Best Practices / 最佳实践

- Use `ray.get()` sparingly on large objects -- prefer streaming results or Ray Datasets for large data.
- Set `num_cpus` and `num_gpus` in `@ray.remote` decorators so the scheduler can pack workers efficiently.
- Use placement groups (`ray.util.placement_group`) to co-locate workers that share data on the same node.
- Enable the Ray dashboard (`ray.init(dashboard_host="0.0.0.0")`) for real-time monitoring of resources and task timelines.
- Use `tune.with_parameters` instead of closures for Ray Tune objectives to avoid repeated serialization.
- Set `object_store_memory` explicitly on memory-constrained nodes to prevent OOM kills.

## Common Pitfalls / 常见陷阱

- **Object reference leaks**: Objects persist until all references are garbage collected. Long-running workers holding references can exhaust the object store.
- **Nested remote calls**: Avoid calling `ray.get()` inside a remote function -- it can deadlock if all workers are waiting. Use `.remote()` chaining.
- **GPU memory fragmentation**: Multiple actors on the same GPU can fragment CUDA memory. Use `num_gpus=1` per actor for exclusive access.
- **Ray Tune resource oversubscription**: If `resources_per_trial` exceeds available cluster resources, trials queue indefinitely.
- **Serialization of large objects**: Ray uses Plasma store for objects >100 KB. Avoid passing huge arrays between tasks.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for distributed hyperparameter search and multi-GPU training pipelines.
- Pair with `references/tools/wandb.md` to have each Ray Tune trial log to wandb for centralized experiment comparison.
- Combine with `references/tools/modal.md` to run a Ray cluster on Modal's serverless infrastructure for elastic scaling.
- Use with `references/tools/pytorch.md` to scale PyTorch training across multiple nodes with Ray Train.

## Resources / 资源

- Documentation: https://docs.ray.io/
- Ray Tune Guide: https://docs.ray.io/en/latest/tune/index.html
- Ray Train Guide: https://docs.ray.io/en/latest/train/train.html
- RLlib Documentation: https://docs.ray.io/en/latest/rllib/index.html
- GitHub: https://github.com/ray-project/ray
