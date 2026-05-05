---
name: zarr-python
description: Zarr array storage — chunked, compressed N-dimensional arrays for large-scale scientific data
domain: Data / Storage
install: pip install zarr numcodecs
---

# zarr-python — Chunked Compressed N-Dimensional Array Storage

Zarr provides a chunked, compressed, N-dimensional array storage format that excels at storing and accessing large datasets (terabyte-scale) from both local disks and cloud object storage. It is the backbone of formats like NetCDF4/Zarr and is widely used in climate science, genomics, and neuroscience.

## When to Use

- Storing large N-dimensional arrays that exceed memory (climate models, imaging, genomics)
- Needing parallel/concurrent read-write access from multiple processes or nodes
- Building pipelines that stream chunks of data rather than loading entire arrays
- Replacing HDF5 when cloud-native or concurrent access is required
- Creating analysis-ready datasets (e.g., Zarr-format neuroimaging data)

## Quick Start

```python
import zarr
import numpy as np
import numcodecs

# Create a chunked Zarr array on disk
store = zarr.DirectoryStore("data/experiment.zarr")
root = zarr.group(store=store)

# Write a large array in chunks (only loads one chunk into memory at a time)
data = root.create_dataset(
    "neural_activity",
    shape=(1000, 256, 256),       # (trials, height, width)
    chunks=(10, 256, 256),         # chunk along trials axis
    dtype="float32",
    compressor=numcodecs.Blosc(cname="lz4", clevel=5),
)

# Fill with trial data — each trial is one chunk
for trial_idx in range(1000):
    trial_data = simulate_trial()  # returns (256, 256) array
    data[trial_idx, :, :] = trial_data

# Read a single trial (only one chunk is fetched from disk)
single_trial = data[42, :, :]

# Open an existing Zarr array read-only
data = zarr.open_array("data/experiment.zarr/neural_activity", mode="r")
print(f"Shape: {data.shape}, Chunks: {data.chunks}, Size: {data.nbytes / 1e9:.1f} GB")
```

## Core Capabilities

### Hierarchical Groups

```python
import zarr

# Organize multiple arrays in a group hierarchy
root = zarr.open_group("data/multi_modal.zarr", mode="w")

# Different modalities as sub-groups
eeg = root.create_group("eeg")
eeg.create_dataset("raw", shape=(100, 64, 5000), chunks=(10, 64, 5000), dtype="float32")
eeg.attrs["sampling_rate_hz"] = 500
eeg.attrs["n_channels"] = 64

fmri = root.create_group("fmri")
fmri.create_dataset("bold", shape=(100, 91, 109, 91), chunks=(5, 91, 109, 91), dtype="float16")
fmri.attrs["tr_seconds"] = 2.0

# List all arrays in the group
for path, arr in root.items():
    print(f"{path}: {arr.shape} ({arr.dtype})")
```

### Compression Codecs

```python
import numcodecs

# Blosc with different compressors — choose based on speed vs ratio
compressors = {
    "fast": numcodecs.Blosc(cname="lz4", clevel=3, shuffle=numcodecs.Blosc.SHUFFLE),
    "balanced": numcodecs.Blosc(cname="zstd", clevel=5, shuffle=numcodecs.Blosc.SHUFFLE),
    "max": numcodecs.Blosc(cname="zstd", clevel=9, shuffle=numcodecs.Blosc.BITSHUFFLE),
}

# Float16 for storage savings with acceptable precision loss
data = zarr.open_array(
    "data/compressed.zarr", mode="w",
    shape=(5000, 1000), chunks=(100, 1000), dtype="float16",
    compressor=compressors["balanced"],
)
```

### Concurrent Access

```python
import zarr
from multiprocessing import Pool

# Zarr supports safe concurrent writes from multiple processes
store = zarr.DirectoryStore("data/parallel.zarr")
data = zarr.open_array(store, mode="w", shape=(10000, 512), chunks=(100, 512), dtype="float32")

def process_chunk(chunk_idx):
    arr = zarr.open_array("data/parallel.zarr", mode="r+")
    start = chunk_idx * 100
    end = start + 100
    arr[start:end, :] = compute_results(start, end)  # each process writes its own chunks

with Pool(8) as pool:
    pool.map(process_chunk, range(100))  # 100 chunks, 8 parallel workers
```

## Common Academic Workflow: Neuroimaging Data Pipeline

```python
import zarr
import numpy as np
import dask.array as da

# Step 1: Convert raw DICOM/NIfTI scans to Zarr format
raw_store = zarr.DirectoryStore("data/bids/derivatives/zarr/")
raw = zarr.open_group(raw_store, mode="w")
raw.create_dataset("bold", shape=(n_subjects, n_timepoints, *voxel_dims),
                   chunks=(1, 50, *voxel_dims), dtype="float32")

# Step 2: Preprocess using Dask + Zarr (lazy, out-of-core)
zarr_arr = da.from_zarr("data/bids/derivatives/zarr/bold")
preprocessed = zarr_arr.map_blocks(preprocess_volume, dtype="float32")
preprocessed.to_zarr("data/bids/derivatives/preproc.zarr")

# Step 3: Statistical analysis — load only needed slices
pre = zarr.open_array("data/bids/derivatives/preproc.zarr", mode="r")
group_means = pre.mean(axis=0)[:]  # dask computes mean across time efficiently
```

## Best Practices

- **Chunk size matters**: Align chunks with your access pattern. If you iterate over trials, chunk along the trial axis. Typical chunk size: 10-100 MB.
- **Use `float16` or `float32`** for storage unless you need `float64` precision. This halves storage and I/O time.
- **Set attributes** (`zarr.attrs`) to store metadata (sampling rates, units, experiment conditions) alongside data.
- **Use `zarr.convenience.open`** for quick access; use `zarr.DirectoryStore` or `zarr.ZipStore` for explicit control.
- **Benchmark codecs**: LZ4 is fastest, ZSTD gives best compression ratio. Always test on your actual data.

## Common Pitfalls

- **Too many small chunks**: Creates excessive metadata and degrades performance. Aim for 10-100 MB per chunk.
- **Chunk misalignment**: If you access rows across chunk boundaries, each access hits multiple chunks. Align chunks with your query pattern.
- **Not setting a compressor**: Default is Zstd with shuffle, but explicitly specifying it ensures reproducibility.
- **Modifying while reading**: Zarr does not support concurrent read-write from different processes on the same chunks without locks. Use separate read and write phases.

## Integration with HBE

- Use within `workflows/experiment-design.md` for large-scale data storage strategies
- Pair with `references/tools/dask.md` for out-of-core computation on Zarr arrays
- Combine with `references/tools/xarray.md` for labeled N-dimensional data backed by Zarr
- Integrate with `references/tools/netcdf4.md` for NetCDF-to-Zarr conversion workflows

## Resources

- Documentation: https://zarr.readthedocs.io/
- Spec: https://zarr-specs.readthedocs.io/
- Numcodecs: https://numcodecs.readthedocs.io/
