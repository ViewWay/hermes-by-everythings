---
name: modal-experiment
description: Modal experiment runner — cloud-based experiment execution with GPU acceleration, parallel sweeps, and automatic scaling
domain: ML / Cloud
install: pip install modal
---

# modal-experiment — Cloud Experiment Runner with Modal

Modal is a serverless Python platform that lets researchers run ML experiments in the cloud with GPU access, parallel hyperparameter sweeps, and persistent volumes, all without managing infrastructure. This skill covers patterns for academic experiment workflows using Modal.

## When to Use

- Running GPU-intensive experiments (training, inference) without local GPU hardware
- Executing parallel hyperparameter sweeps across dozens of configurations
- Processing large datasets in the cloud with ephemeral compute
- Running reproducible experiments with pinned package environments
- Scheduling periodic experiments or inference endpoints

## Quick Start

```python
import modal

# Define a Modal app
app = modal.App("ml-experiment")

# Define an environment with GPU
@app.function(gpu="A10G", timeout=3600, image=modal.Image.debian_slim().pip_install(
    "torch", "transformers", "datasets", "scikit-learn"
))
def train_model(config: dict):
    import torch
    from torch.utils.data import DataLoader

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on {device}, config: {config}")

    # Your training logic here
    # ...
    return {"accuracy": 0.92, "loss": 0.15}

# Run locally to trigger cloud execution
with app.run():
    result = train_model.remote({"lr": 1e-3, "batch_size": 32, "epochs": 10})
    print(f"Result: {result}")
```

## Core Capabilities

### 1. Parallel Hyperparameter Sweeps

```python
import modal
import itertools

app = modal.App("hpo-sweep")

@app.function(gpu="T4", timeout=1800, image=modal.Image.debian_slim().pip_install(
    "torch", "scikit-learn", "pandas"
))
def single_run(lr, weight_decay, batch_size):
    import torch
    import torch.nn as nn
    from sklearn.datasets import load_digits
    from torch.utils.data import TensorDataset, DataLoader

    # Load data
    X, y = load_digits(return_X_y=True)
    X = torch.tensor(X, dtype=torch.float32) / 16.0
    y = torch.tensor(y, dtype=torch.long)
    dataset = TensorDataset(X, y)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    # Simple model
    model = nn.Sequential(nn.Linear(64, 128), nn.ReLU(), nn.Linear(128, 10)).cuda()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(5):
        total_loss = 0
        for xb, yb in loader:
            xb, yb = xb.cuda(), yb.cuda()
            optimizer.zero_grad()
            loss = criterion(model(xb), yb)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

    # Evaluate
    model.eval()
    correct = sum((model(X.cuda()).argmax(1) == y.cuda()).sum().item() for xb, yb in loader)
    return {"lr": lr, "wd": weight_decay, "bs": batch_size, "loss": total_loss / len(loader)}

@app.local_entrypoint()
def run_sweep():
    configs = list(itertools.product(
        [1e-4, 1e-3, 1e-2],      # lr
        [0, 1e-4, 1e-3],           # weight_decay
        [32, 64, 128],             # batch_size
    ))
    # Run all configurations in parallel
    results = []
    for lr, wd, bs in configs:
        result = single_run.remote(lr, wd, bs)
        results.append(result)

    # Collect and sort results
    results.sort(key=lambda r: r["loss"])
    print(f"Best config: {results[0]}")
    return results
```

### 2. Persistent Volumes for Dataset Storage

```python
import modal

app = modal.App("dataset-pipeline")

# Create a persistent volume for large datasets
volume = modal.Volume.from_name("research-datasets", create_if_missing=True)
VOLUME_DIR = "/data"

@app.function(
    timeout=3600,
    volumes={VOLUME_DIR: volume},
    image=modal.Image.debian_slim().pip_install("datasets", "pandas")
)
def download_and_preprocess():
    from datasets import load_dataset
    import pandas as pd

    # Download dataset (cached in volume after first run)
    ds = load_dataset("imdb")
    df = pd.DataFrame(ds["train"])
    df.to_parquet(f"{VOLUME_DIR}/imdb_train.parquet")
    volume.commit()
    print(f"Saved {len(df)} rows to volume")

@app.function(
    timeout=1800,
    volumes={VOLUME_DIR: volume},
    image=modal.Image.debian_slim().pip_install("pandas", "scikit-learn")
)
def train_from_volume():
    import pandas as pd
    df = pd.read_parquet(f"{VOLUME_DIR}/imdb_train.parquet")
    print(f"Loaded {len(df)} rows from persistent volume")
    # Training logic here...
    return {"rows": len(df)}
```

### 3. Scheduled and On-Demand Inference

```python
import modal

app = modal.App("inference-endpoint")

@app.function(
    gpu="A10G",
    timeout=300,
    image=modal.Image.debian_slim().pip_install("torch", "transformers"),
    container_idle_timeout=300  # keep warm for 5 min
)
@modal.web_server(port=8000, startup_timeout=120)
def serve_model():
    from fastapi import FastAPI
    import torch
    from transformers import AutoModelForSequenceClassification, AutoTokenizer

    app = FastAPI()
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased-finetuned-sst-2-english")
    model = AutoModelForSequenceClassification.from_pretrained(
        "distilbert-base-uncased-finetuned-sst-2-english"
    ).cuda()

    @app.post("/predict")
    def predict(text: str):
        inputs = tokenizer(text, return_tensors="pt").to("cuda")
        with torch.no_grad():
            logits = model(**inputs).logits
        probs = torch.softmax(logits, dim=1)
        return {"label": "POSITIVE" if probs[0][1] > 0.5 else "NEGATIVE",
                "confidence": float(probs.max())}

    return app
```

## Common Academic Workflow: Reproducible Training Pipeline

```python
import modal
import json

app = modal.App("reproducible-training")

@app.function(
    gpu="A100",
    timeout=7200,
    image=modal.Image.debian_slim().pip_install(
        "torch==2.1.0", "transformers==4.36.0",
        "datasets==2.16.0", "accelerate==0.25.0",
        "wandb"
    ),
    secrets=[modal.Secret.from_name("wandb-api")]
)
def train(config: dict):
    import torch
    import wandb
    from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
    from datasets import load_dataset

    wandb.init(project="academic-llm", config=config)

    tokenizer = AutoTokenizer.from_pretrained(config["base_model"])
    model = AutoModelForCausalLM.from_pretrained(config["base_model"])

    dataset = load_dataset(config["dataset_name"], split="train")
    # ... tokenize, set up Trainer, train ...
    wandb.finish()
    return {"final_loss": 0.0, "config": config}

@app.local_entrypoint()
def main():
    config = {
        "base_model": "gpt2",
        "dataset_name": "wikitext",
        "learning_rate": 5e-5,
        "batch_size": 16,
        "epochs": 3,
        "seed": 42,
    }
    result = train.remote(config)
    print(f"Training complete: {result}")
```

## Best Practices

1. Pin package versions in the Image to ensure reproducibility across runs
2. Use `modal.Volume` for datasets larger than 100 MB to avoid re-downloading
3. Set appropriate `timeout` values; GPU containers have maximum 24-hour limits
4. Use `@app.local_entrypoint()` for CLI-style invocation from your local machine
5. Log experiment parameters to W&B or MLflow for tracking across Modal runs

## Common Pitfalls

1. **Cold start latency**: First invocation of a function takes 30-60s to build the image; subsequent calls are fast
2. **GPU quota limits**: Modal has per-account GPU quotas; request increases for large sweeps
3. **Volume consistency**: Always call `volume.commit()` after writing; reads without commit may see stale data
4. **Memory limits**: Be mindful of model size vs GPU VRAM; use `gpu="A100-80GB"` for large models

## Integration with HBE

- Use with `references/tools/wandb.md` for experiment tracking
- Pair with `references/tools/pytorch-lightning.md` for structured training loops
- Combine with `references/tools/optuna.md` for guided hyperparameter optimization
- Supports `references/tool-registry.md` ML infrastructure tool chain

## Resources

- Documentation: https://modal.com/docs
- Examples: https://modal.com/docs/examples
- Pricing: https://modal.com/pricing
