---
name: pytorch-lightning
description: Deep learning framework built on PyTorch. Use for training, validating, and testing neural networks with clean code, automatic GPU management, and experiment tracking.
domain: cs
install: pip install pytorch-lightning
---

# PyTorch Lightning: Deep Learning Training

## Overview

PyTorch Lightning organizes PyTorch code into a structured format, handling boilerplate (training loop, GPU management, checkpointing, logging) so you focus on research logic.

## When to Use

- Training any neural network model
- Multi-GPU or distributed training
- Comparing multiple experiment configurations
- Reproducible deep learning experiments
- Any PyTorch project that needs clean structure

## Quick Start

```python
import pytorch_lightning as pl
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

class LitModel(pl.LightningModule):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.save_hyperparameters()
        self.net = nn.Sequential(nn.Linear(input_dim, hidden_dim), nn.ReLU(),
                                  nn.Linear(hidden_dim, output_dim))
        self.loss_fn = nn.CrossEntropyLoss()

    def forward(self, x): return self.net(x)

    def training_step(self, batch, idx):
        x, y = batch; logits = self(x)
        loss = self.loss_fn(logits, y)
        self.log('train_loss', loss, prog_bar=True)
        return loss

    def validation_step(self, batch, idx):
        x, y = batch; logits = self(x)
        acc = (logits.argmax(1) == y).float().mean()
        self.log('val_acc', acc, prog_bar=True)

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=1e-3)

# Train
trainer = pl.Trainer(max_epochs=50, accelerator='auto', devices='auto',
                      default_root_dir='lightning_logs/')
trainer.fit(model, train_loader, val_loader)
```

## Core Capabilities

### 1. Training Configuration

```python
trainer = pl.Trainer(
    max_epochs=100,
    accelerator='gpu',              # 'cpu', 'gpu', 'tpu', 'auto'
    devices=[0, 1],                 # GPU indices
    precision='16-mixed',           # Mixed precision training
    gradient_clip_val=1.0,          # Gradient clipping
    accumulate_grad_batches=4,      # Effective batch size = batch * 4
    val_check_interval=0.25,        # Validate 4x per epoch
    check_val_every_n_epoch=1,
    log_every_n_steps=10,
    deterministic=True,             # Reproducibility
    benchmark=False,
)

# Callbacks
from pytorch_lightning.callbacks import ModelCheckpoint, EarlyStopping, LearningRateMonitor

callbacks = [
    ModelCheckpoint(monitor='val_acc', mode='max', save_top_k=3, filename='{epoch}-{val_acc:.3f}'),
    EarlyStopping(monitor='val_loss', patience=10, mode='min'),
    LearningRateMonitor(logging_interval='epoch'),
]
```

### 2. Experiment Tracking

```python
# TensorBoard (built-in)
trainer = pl.Trainer(logger=pl.loggers.TensorBoardLogger('logs/', name='experiment1'))

# Weights & Biases
trainer = pl.Trainer(logger=pl.loggers.WandbLogger(project='my-research', name='run1'))

# CSV logger
trainer = pl.Trainer(logger=pl.loggers.CSVLogger('logs/'))
```

### 3. Learning Rate Scheduling

```python
def configure_optimizers(self):
    optimizer = torch.optim.AdamW(self.parameters(), lr=1e-3, weight_decay=0.01)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=100)
    return [optimizer], [scheduler]

# With warmup
from torch.optim.lr_scheduler import OneCycleLR
scheduler = OneCycleLR(optimizer, max_lr=1e-3, total_steps=self.trainer.estimated_stepping_batches)
```

## Best Practices

1. **Use `self.save_hyperparameters()`**: Auto-logs all constructor args
2. **Set `deterministic=True`**: For reproducibility (slightly slower)
3. **Use mixed precision**: `precision='16-mixed'` for 2x speed on modern GPUs
4. **Use callbacks**: Checkpoint + EarlyStopping are essential for real experiments
5. **Log everything**: `self.log()` for all metrics — enables later analysis

## Common Pitfalls

1. **DataLoader `num_workers`**: Set to `os.cpu_count()` but watch for memory
2. **Batch norm + precision**: May need `torch.backends.cudnn.benchmark = False`
3. **Validation `torch.no_grad()`**: Lightning handles this automatically
4. **OOM on GPU**: Reduce batch size or use `accumulate_grad_batches`

## Integration with HBE

- Primary deep learning tool in `references/tool-registry.md`
- Supports `workflows/experiment-design.md` training pipeline
- Works with `references/tools/transformers.md` for NLP models
- See `references/tools/shap.md` for model interpretation

## Resources

- Documentation: https://lightning.ai/docs/pytorch/stable/
- Tutorials: https://lightning.ai/docs/pytorch/stable/#tutorials
