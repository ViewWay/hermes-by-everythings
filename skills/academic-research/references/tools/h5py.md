---
name: h5py
description: HDF5 file interface for Python — store and access large numerical datasets efficiently
domain: Data I/O
install: pip install h5py
---

# h5py — HDF5 File Interface / HDF5 文件接口

h5py provides Python access to HDF5 files — the standard format for large scientific datasets (astronomy, genomics, deep learning, physics simulations). Supports chunked storage, compression, and out-of-core access.

## When to Use / 适用场景

- Storing large numerical datasets that don't fit in memory
- Deep learning model weights and training data storage
- Scientific data exchange between Python/MATLAB/C/Fortran
- Checkpointing large computations
- Multi-terabyte dataset random access

## Quick Start / 快速开始

```python
import h5py
import numpy as np

# Write HDF5
with h5py.File("data.h5", "w") as f:
    f.create_dataset("images", data=np.random.randn(100, 224, 224, 3).astype("float32"))
    f.create_dataset("labels", data=np.arange(100))
    f.attrs["description"] = "Image classification dataset"
    f.attrs["n_classes"] = 10

# Read HDF5
with h5py.File("data.h5", "r") as f:
    print(list(f.keys()))            # ['images', 'labels']
    print(f["images"].shape)         # (100, 224, 224, 3)
    batch = f["images"][0:10]        # Load slice only
    print(f.attrs["description"])    # 'Image classification dataset'
```

## Core Capabilities / 核心能力

### 1. Dataset Creation / 数据集创建

```python
import h5py
import numpy as np

with h5py.File("experiment.h5", "w") as f:
    # From numpy array
    f.create_dataset("matrix", data=np.random.randn(1000, 500))
    
    # Empty dataset (write later)
    ds = f.create_dataset("large", shape=(100000, 1000), dtype="float32")
    
    # Chunked + compressed (for large datasets)
    f.create_dataset("compressed",
                     shape=(100000, 500),
                     dtype="float32",
                     chunks=(1000, 500),
                     compression="gzip",
                     compression_opts=4)
    
    # Resizable dataset
    ds = f.create_dataset("streaming", shape=(0, 100), maxshape=(None, 100), dtype="float32")
    ds.resize((500, 100))  # Grow to 500 rows
```

### 2. Groups and Hierarchy / 组与层次结构

```python
with h5py.File("structured.h5", "w") as f:
    # Create groups (like folders)
    train = f.create_group("train")
    test = f.create_group("test")
    
    train.create_dataset("images", data=train_images)
    train.create_dataset("labels", data=train_labels)
    test.create_dataset("images", data=test_images)
    
    # Nested groups
    f.create_group("results/epoch_1")
    f.create_group("results/epoch_2")
    f["results/epoch_1"].create_dataset("loss", data=loss_values)
    
    # Iterate groups
    for name in f:
        print(name)
    for name, obj in f.items():
        print(f"{name}: {type(obj)}")
```

### 3. Out-of-Core Access / 超核外访问

```python
import h5py
import numpy as np

with h5py.File("large.h5", "r") as f:
    ds = f["data"]  # Dataset object (not loaded into memory)
    print(f"Shape: {ds.shape}, Size: {ds.nbytes / 1e9:.1f} GB")
    
    # Access slices without loading everything
    batch = ds[0:64]         # Load 64 rows
    column = ds[:, 0]        # Load first column
    element = ds[42, 7]      # Single element
    
    # Iterate in batches
    for i in range(0, len(ds), 64):
        batch = ds[i:i+64]
        # Process batch...
```

### 4. Attributes / 属性

```python
with h5py.File("experiment.h5", "w") as f:
    # Store metadata
    f.attrs["experiment_name"] = "GCN Benchmark"
    f.attrs["date"] = "2026-05-04"
    f.attrs["learning_rate"] = 3e-4
    f.attrs["dataset_version"] = 2
    
    ds = f.create_dataset("results", data=np.zeros((100, 10)))
    ds.attrs["metric"] = "accuracy"
    ds.attrs["model"] = "GCN"
    
    # Read attributes
    with h5py.File("experiment.h5", "r") as f:
        for key, val in f.attrs.items():
            print(f"{key}: {val}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Deep Learning Data Storage / 深度学习数据存储

```python
import h5py
import numpy as np
from pathlib import Path

def create_dataset_h5(image_dir, output_path, img_size=224):
    """Convert image directory to HDF5 dataset."""
    from PIL import Image
    paths = sorted(Path(image_dir).glob("**/*.png"))
    
    with h5py.File(output_path, "w") as f:
        imgs = f.create_dataset("images", shape=(len(paths), img_size, img_size, 3),
                                dtype="uint8", chunks=(32, img_size, img_size, 3),
                                compression="gzip")
        labels = f.create_dataset("labels", shape=(len(paths),), dtype="int32")
        f.attrs["n_samples"] = len(paths)
        
        for i, path in enumerate(paths):
            img = Image.open(path).resize((img_size, img_size))
            imgs[i] = np.array(img)
            labels[i] = int(path.parent.name)  # Class from folder name
            if (i + 1) % 100 == 0:
                print(f"Processed {i+1}/{len(paths)}")
```

## Best Practices / 最佳实践

- Use chunked storage for datasets >1GB; chunk size ~1-10MB
- Use gzip compression for numeric data (4-10x reduction)
- Store metadata as attributes, not separate datasets
- Use context managers (`with`) to ensure files are closed

## Common Pitfalls / 常见陷阱

- **HDF5 file locking**: Parallel access requires SWMR mode or file locking configuration
- **Chunk size**: Too small = slow, too large = wasted space; aim for ~1MB chunks
- **String storage**: Use `h5py.string_dtype()` for variable-length strings
- **File corruption**: Always close files properly; don't kill process during writes

## Integration with HBE / 与 HBE 集成

- Store training data for `references/tools/torch-geometric.md` and `references/tools/pytorch-lightning.md`
- Pair with `references/tools/pandas.md` for metadata management
- Combine with `references/tools/numpy.md` for numerical data

## Resources / 资源

- Documentation: https://docs.h5py.org/
- HDF5 format: https://www.hdfgroup.org/solutions/hdf5/
- Tutorial: https://docs.h5py.org/en/stable/quick.html
