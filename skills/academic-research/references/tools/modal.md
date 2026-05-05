---
name: modal
description: Serverless cloud compute — run code in the cloud without managing infrastructure, ideal for large-scale experiments
domain: ML / Infrastructure
install: pip install modal
---

# modal — Serverless Cloud Compute / 无服务器云计算

Run Python functions on cloud GPUs and CPUs from your laptop without managing servers, containers, or infrastructure. Modal handles scaling, dependency management, and ephemeral storage.

## When to Use / 适用场景

- Running large-scale hyperparameter sweeps on cloud GPUs from a laptop / 在笔记本电脑上通过云端 GPU 运行大规模超参数搜索
- Batch inference on pretrained models without managing GPU instances / 无需管理 GPU 实例即可进行批量推理
- Hosting model inference as a web endpoint for paper demos / 为论文演示托管模型推理端点
- Processing large datasets that exceed local memory / 处理超出本地内存的大型数据集
- Running scheduled recurring jobs (e.g., daily model evaluation) / 运行定期调度任务
- Parallelizing embarrassingly parallel workloads across many CPUs / 在多 CPU 上并行化可分拆任务

## Quick Start / 快速开始

```python
import modal

app = modal.App("my-research")

image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install("torch", "transformers", "datasets", "scikit-learn")
)

@app.function(image=image, gpu="A100", timeout=3600)
def train_model(config: dict) -> dict:
    import torch
    from torch import nn, optim
    from torch.utils.data import DataLoader, TensorDataset

    X = torch.randn(10000, config["input_dim"])
    y = torch.randint(0, 2, (10000,))
    loader = DataLoader(TensorDataset(X, y), batch_size=config["batch_size"])

    model = nn.Sequential(nn.Linear(config["input_dim"], 256), nn.ReLU(), nn.Linear(256, 2))
    optimizer = optim.Adam(model.parameters(), lr=config["lr"])

    for epoch in range(config["epochs"]):
        for xb, yb in loader:
            loss = nn.CrossEntropyLoss()(model(xb), yb)
            loss.backward()
            optimizer.step()
            optimizer.zero_grad()
    return {"final_loss": float(loss)}

# Run locally — triggers cloud execution
with app.run():
    result = train_model.remote({"input_dim": 128, "lr": 1e-3, "epochs": 10, "batch_size": 256})
    print(result)
```

## Core Capabilities / 核心能力

### 1. Distributed Map for Parallel Processing / 分布式映射并行处理

Use `modal.Cls` with `.map()` to fan out work across hundreds of cloud workers for embarrassingly parallel tasks.

```python
import modal

app = modal.App("distributed-sweep")
image = modal.Image.debian_slim().pip_install("torch", "numpy")

@app.cls(image=image, gpu="T4", timeout=1800)
class Trainer:
    @modal.enter()
    def setup(self):
        import torch
        self.device = torch.device("cuda")

    def train_single_config(self, config: dict) -> dict:
        import torch
        from torch import nn
        model = nn.Linear(config["hidden"], 10).to(self.device)
        optimizer = torch.optim.Adam(model.parameters(), lr=config["lr"])
        losses = []
        for _ in range(config["epochs"]):
            x = torch.randn(256, config["hidden"]).to(self.device)
            y = torch.randint(0, 10, (256,)).to(self.device)
            loss = nn.CrossEntropyLoss()(model(x), y)
            loss.backward(); optimizer.step(); optimizer.zero_grad()
            losses.append(float(loss))
        return {"config": config, "final_loss": losses[-1]}

with app.run():
    trainer = Trainer()
    configs = [{"hidden": h, "lr": lr, "epochs": 20}
               for h in [64, 128, 256] for lr in [1e-4, 1e-3, 1e-2]]
    results = list(trainer.map.train_single_config(configs))
    best = min(results, key=lambda r: r["final_loss"])
    print(f"Best config: {best['config']}, loss: {best['final_loss']:.4f}")
```

### 2. Volumes for Persistent Storage / 持久化存储卷

Share large datasets and model checkpoints between function invocations using Modal Volumes.

```python
import modal

app = modal.App("volume-demo")
volume = modal.Volume.from_name("dataset-vol", create_if_missing=True)

@app.function(image=modal.Image.debian_slim().pip_install("huggingface_hub"), timeout=3600)
def download_dataset():
    from huggingface_hub import snapshot_download
    snapshot_download("allenai/c4", cache_dir="/data")
    volume.commit()

@app.function(image=modal.Image.debian_slim().pip_install("datasets"), volumes={"/data": volume})
def process_dataset():
    import os
    files = os.listdir("/data")
    return len(files)

with app.run():
    download_dataset.remote()
    count = process_dataset.remote()
    print(f"Dataset contains {count} files")
```

### 3. Web Endpoints for Model Serving / 模型服务 Web 端点

Deploy a model as an HTTP endpoint for interactive demos and paper supplementary materials.

```python
import modal

app = modal.App("model-server")
image = modal.Image.debian_slim().pip_install("transformers", "torch", "fastapi", "uvicorn")

@app.function(image=image, gpu="T4", timeout=300)
@modal.web_server(port=8000, startup_timeout=120)
def serve_model():
    import subprocess
    subprocess.Popen(["python", "-c", """
from fastapi import FastAPI
from transformers import pipeline
app = FastAPI()
classifier = pipeline("sentiment-analysis", model="distilbert-base-uncased-finetuned-sst-2-english")
@app.post("/predict")
def predict(text: str):
    return classifier(text)
import uvicorn; uvicorn.run(app, host="0.0.0.0", port=8000)
"""])

# Deploy: modal deploy script.py
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Distributed Hyperparameter Search / 分布式超参数搜索

Run a full grid sweep on cloud GPUs, collect results, and find the best configuration.

```python
import modal
import itertools

app = modal.App("sweep")
image = modal.Image.debian_slim().pip_install("torch", "numpy")

@app.function(image=image, gpu="T4", timeout=1800, container_limit=50)
def evaluate_config(lr: float, weight_decay: float, hidden: int, dropout: float) -> dict:
    import torch
    from torch import nn, optim
    torch.manual_seed(42)
    model = nn.Sequential(
        nn.Linear(784, hidden), nn.ReLU(), nn.Dropout(dropout), nn.Linear(hidden, 10),
    )
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    for epoch in range(30):
        x = torch.randn(512, 784)
        y = torch.randint(0, 10, (512,))
        loss = nn.CrossEntropyLoss()(model(x), y)
        loss.backward(); optimizer.step(); optimizer.zero_grad()
    return {"lr": lr, "wd": weight_decay, "hidden": hidden,
            "dropout": dropout, "loss": float(loss)}

with app.run():
    grid = list(itertools.product(
        [1e-4, 1e-3, 1e-2], [0.0, 1e-4, 1e-3], [128, 256, 512], [0.0, 0.1, 0.3],
    ))
    results = [evaluate_config.remote(lr, wd, h, d) for lr, wd, h, d in grid]
    best = min(results, key=lambda r: r["loss"])
    print(f"Best: {best}")
```

## Best Practices / 最佳实践

- Pin Python versions in your image (`python_version="3.11"`) to avoid silent breakage when Modal updates base images.
- Use `modal.Cls` instead of standalone functions when you need shared state (e.g., a loaded model) across multiple invocations.
- Set `timeout` explicitly for every function. GPU functions default to 300s, which is too short for large training jobs.
- Use `@modal.enter()` for expensive setup (loading models, downloading data) and `@modal.exit()` for cleanup.
- Use `container_limit=N` to cap parallel containers and control cloud spend during large sweeps.
- Store secrets with `modal.Secret.from_name("my-secret")` rather than hardcoding API keys in source files.

## Common Pitfalls / 常见陷阱

- **Serialization errors**: Functions and their arguments must be picklable. Avoid passing lambda functions or locally defined classes to `.remote()` calls.
- **Volume writes are ephemeral**: Changes to a Volume inside a function are only persisted after `volume.commit()`. Forgetting this causes data loss.
- **GPU availability**: Not all GPU types are always available. Use `gpu="any"` during development and request specific types only for final runs.
- **Cold start latency**: The first invocation pays an image build and container startup cost. Use `modal.Cls` with `@modal.enter()` to amortize this.
- **Memory limits**: Modal containers have default memory limits. For large data loading, explicitly set `memory=32768` (32 GB).

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` to run large-scale experiments on cloud GPUs without local hardware requirements.
- Pair with `references/tools/wandb.md` to have each Modal worker log metrics to a shared wandb project for centralized tracking.
- Combine with `references/tools/ray.md` by running a Ray cluster inside a Modal function for complex distributed workflows.

## Resources / 资源

- Documentation: https://modal.com/docs
- Examples Gallery: https://modal.com/docs/examples
- GPU Pricing: https://modal.com/pricing
- GitHub: https://github.com/modal-labs/modal
