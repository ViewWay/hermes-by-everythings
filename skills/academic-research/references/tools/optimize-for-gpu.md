---
name: optimize-for-gpu
description: GPU optimization toolkit — profiling, memory management, and performance tuning for deep learning training
domain: ML / Performance
install: pip install torch torchvision torch.cuda profiler  # PyTorch built-in tools
---

# optimize-for-gpu — GPU Optimization for Deep Learning

Provides strategies and patterns for profiling and optimizing deep learning workloads on GPUs. Covers PyTorch CUDA profiling, mixed-precision training, gradient checkpointing, DataLoader optimization, and memory management techniques to maximize GPU utilization in research experiments.

## When to Use

- Training is GPU-memory bound and you need to fit larger batch sizes or models
- GPU utilization is low (<60%) and you want to identify bottlenecks
- Training throughput is insufficient for large-scale hyperparameter sweeps
- Out-of-memory (OOM) errors occur during training or inference
- You need to compare performance across different model architectures

## Quick Start

```python
import torch

# Check GPU availability and properties
if torch.cuda.is_available():
    device = torch.device("cuda")
    props = torch.cuda.get_device_properties(device)
    print(f"GPU: {props.name}")
    print(f"VRAM: {props.total_mem / 1e9:.1f} GB")
    print(f"Compute capability: {props.major}.{props.minor}")
    print(f"Multi-processor count: {props.multi_processor_count}")

# Profile a simple training step
with torch.profiler.profile(
    activities=[
        torch.profiler.ProfilerActivity.CPU,
        torch.profiler.ProfilerActivity.CUDA,
    ],
    record_shapes=True,
    profile_memory=True,
) as prof:
    # Your training step here
    x = torch.randn(256, 3, 224, 224, device="cuda")
    conv = torch.nn.Conv2d(3, 64, 7).cuda()
    y = conv(x)
    loss = y.sum()
    loss.backward()

print(prof.key_averages().table(sort_by="cuda_time_total", row_limit=10))
```

## Core Capabilities

### 1. Mixed-Precision Training (AMP)

```python
import torch
from torch.cuda.amp import autocast, GradScaler

model = torch.nn.Linear(1000, 100).cuda()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
scaler = GradScaler()

# Training loop with automatic mixed precision
for epoch in range(10):
    optimizer.zero_grad()
    x = torch.randn(64, 1000, device="cuda")
    y = torch.randint(0, 100, (64,), device="cuda")

    # Forward pass in float16 where safe, float32 where needed
    with autocast(dtype=torch.float16):
        logits = model(x)
        loss = torch.nn.functional.cross_entropy(logits, y)

    # Backward pass with gradient scaling
    scaler.scale(loss).backward()
    scaler.step(optimizer)
    scaler.update()

print("Mixed-precision training complete")
# Typical speedup: 1.5-3x on Volta+ GPUs with minimal accuracy loss
```

### 2. DataLoader and I/O Optimization

```python
import torch
from torch.utils.data import DataLoader, TensorDataset
import numpy as np

# Create large synthetic dataset
X = np.random.randn(100000, 3, 224, 224).astype(np.float32)
y = np.random.randint(0, 1000, 100000).astype(np.int64)
dataset = TensorDataset(torch.from_numpy(X), torch.from_numpy(y))

# Optimized DataLoader settings
loader = DataLoader(
    dataset,
    batch_size=64,
    shuffle=True,
    num_workers=8,           # Parallel data loading (typically 4-8)
    pin_memory=True,          # Faster CPU-to-GPU transfer
    prefetch_factor=2,        # Prefetch 2 batches per worker
    persistent_workers=True,  # Keep workers alive between epochs
    drop_last=True,           # Avoid partial batches that slow down training
)

# Training loop with non-blocking transfer
model = torch.nn.Linear(3 * 224 * 224, 1000).cuda()
for xb, yb in loader:
    xb = xb.cuda(non_blocking=True)  # Overlap data transfer with compute
    yb = yb.cuda(non_blocking=True)
    logits = model(xb.view(xb.size(0), -1))
    loss = torch.nn.functional.cross_entropy(logits, yb)
    loss.backward()
```

### 3. Memory Optimization Techniques

```python
import torch
import torch.nn as nn

# 1. Gradient checkpointing (trades compute for memory)
class LargeModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.blocks = nn.ModuleList([nn.Linear(4096, 4096) for _ in range(12)])

    def forward(self, x):
        for block in self.blocks:
            # Use gradient checkpointing for intermediate blocks
            x = torch.utils.checkpoint.checkpoint(block, x)
        return x

model = LargeModel().cuda()
# Reduces memory from O(n_layers) to O(sqrt(n_layers)) activation storage

# 2. Gradient accumulation (simulate large batch with small GPU memory)
accumulation_steps = 4
optimizer.zero_grad()
for i, (xb, yb) in enumerate(loader):
    xb, yb = xb.cuda(), yb.cuda()
    loss = model(xb) / accumulation_steps  # Scale loss
    loss.backward()
    if (i + 1) % accumulation_steps == 0:
        optimizer.step()
        optimizer.zero_grad()

# 3. Free unused memory
torch.cuda.empty_cache()

# 4. Disable gradient computation for inference
with torch.no_grad():
    outputs = model(test_data.cuda())
```

## Common Academic Workflow: Full Optimization Pipeline

```python
import torch
import torch.nn as nn
from torch.cuda.amp import autocast, GradScaler
from torch.utils.data import DataLoader
import time

def benchmark_training(model, loader, device, use_amp=True, epochs=5):
    """Benchmark training with different optimization settings."""
    model = model.to(device)
    optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.01)
    scaler = GradScaler() if use_amp else None

    torch.cuda.synchronize()
    start = time.time()

    for epoch in range(epochs):
        model.train()
        total_loss = 0
        for xb, yb in loader:
            xb, yb = xb.to(device, non_blocking=True), yb.to(device, non_blocking=True)
            optimizer.zero_grad(set_to_none=True)  # Faster than zero_grad()

            if use_amp:
                with autocast(dtype=torch.float16):
                    loss = model(xb, yb)
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                loss = model(xb, yb)
                loss.backward()
                optimizer.step()

            total_loss += loss.item()

    torch.cuda.synchronize()
    elapsed = time.time() - start

    # Report
    mem_used = torch.cuda.max_memory_allocated(device) / 1e9
    throughput = epochs * len(loader) * loader.batch_size / elapsed
    print(f"Time: {elapsed:.1f}s | Throughput: {throughput:.0f} samples/s | "
          f"Peak VRAM: {mem_used:.1f} GB | Loss: {total_loss / (epochs * len(loader)):.4f}")
    return {"time": elapsed, "throughput": throughput, "peak_vram_gb": mem_used}

# Compare configurations
print("=== FP32 Baseline ===")
benchmark_training(model, loader, torch.device("cuda"), use_amp=False)
print("\n=== AMP (FP16) ===")
benchmark_training(model, loader, torch.device("cuda"), use_amp=True)
```

## Best Practices

1. Always profile before optimizing; use `torch.profiler` to identify the actual bottleneck (compute vs memory vs I/O)
2. Use `set_to_none=True` in `optimizer.zero_grad()` instead of filling with zeros (10% faster)
3. Set `torch.backends.cudnn.benchmark = True` for fixed input sizes (enables optimal CUDA kernel selection)
4. Monitor GPU utilization with `nvidia-smi` or `torch.cuda.utilization()` during training
5. Use `torch.compile(model)` (PyTorch 2.0+) for additional graph-level optimization

## Common Pitfalls

1. **Mixed precision numerical instability**: Some loss functions (e.g., softmax cross-entropy with large vocabularies) need FP32; use `autocast(dtype=torch.bfloat16)` on Ampere+ GPUs instead
2. **DataLoader num_workers too high**: Setting `num_workers > CPU cores` causes contention and slows loading
3. **Forgetting `model.train()` / `model.eval()`**: BatchNorm and Dropout behave differently; incorrect mode wastes GPU time
4. **Not calling `torch.cuda.synchronize()`**: GPU ops are asynchronous; omitting synchronize in timing code gives incorrect measurements

## Integration with HBE

- Use with `references/tools/pytorch-lightning.md` for structured training loops with built-in AMP
- Pair with `references/tools/modal-experiment.md` for cloud GPU execution
- Combine with `references/tools/wandb.md` for tracking GPU utilization metrics
- Supports `references/tool-registry.md` ML performance tool chain

## Resources

- PyTorch CUDA Semantics: https://pytorch.org/docs/stable/notes/cuda.html
- AMP Documentation: https://pytorch.org/docs/stable/amp.html
- Torch Profiler: https://pytorch.org/tutorials/intermediate/tensorboard_profiler_tutorial.html
- PyTorch 2.0 Compile: https://pytorch.org/get-started/pytorch-2.0/
