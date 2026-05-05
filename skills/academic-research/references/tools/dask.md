---
name: dask
description: Parallel computing library for larger-than-memory datasets — scales pandas, NumPy, and scikit-learn workflows across cores and clusters
domain: ML / Infrastructure
install: pip install "dask[complete]"
---

# dask — Parallel Computing for Large-Scale Data / 并行计算框架

Dask provides parallelized DataFrames, Arrays, and delayed computation that mirror the pandas/NumPy API, enabling out-of-core processing of datasets that exceed available RAM.

## When to Use / 适用场景

- Processing genomics, climate, or satellite datasets larger than available memory (处理超出内存的基因组学、气候、卫星数据)
- Scaling pandas groupby/merge operations to 50+ GB CSV or Parquet files (将 pandas 聚合/合并操作扩展到 50GB+ 文件)
- Parallelizing embarrassingly parallel workloads like Monte Carlo simulations (并行化蒙特卡洛模拟等可并行任务)
- Building ML pipelines on single machines with dask-ml before moving to distributed clusters (在单机上构建 ML 管道再迁移到集群)
- Chaining lazy transformations on multi-TB datasets with Dask Delayed (使用 Dask Delayed 对 TB 级数据链式延迟变换)

## Quick Start / 快速开始

```python
import dask.dataframe as dd
import dask.array as da

# Lazy read — nothing is loaded until .compute()
df = dd.read_parquet("genomics/*.parquet", engine="pyarrow")

# Pandas-like operations build a task graph
result = (
    df.groupby("gene_id")
    .expression.agg(["mean", "std", "count"])
    .compute()  # triggers actual execution
)

# Dask Array — chunked NumPy
x = da.random.random((500_000, 1_000), chunks=(10_000, 1_000))
covariance = da.cov(x)  # lazy
covariance.compute()

# Check task graph before executing
print(result.__dask_graph__())
```

## Core Capabilities / 核心能力

### 1. Dask DataFrame / 数据框并行处理

Dask DataFrame partitions data across cores and mirrors the pandas API with lazy evaluation.

```python
import dask.dataframe as dd

# Read with partition control
df = dd.read_csv("experiments/*.csv", blocksize="256MB")
print(f"Partitions: {df.npartitions}, Memory per partition: ~256MB")

# Repartition for balanced work
df = df.repartition(npartitions=df.npartitions * 2)

# Complex groupby with multiple aggregations
summary = (
    df.groupby(["treatment", "replicate"])
    .agg({"measurement": ["mean", "std"], "quality_score": "median"})
    .compute()
)

# Merge two large DataFrames (hash or broadcast)
merged = dd.merge(df_left, df_right, on="sample_id", how="left")
```

### 2. Dask Array & Bag / 数组与无结构数据

Dask Array provides chunked NumPy operations; Dask Bag handles unstructured JSON/text.

```python
import dask.array as da
import dask.bag as db

# Chunked array operations
mat = da.from_array(large_numpy_array, chunks=(4096, 4096))
eigenvalues = da.linalg.svd(mat, compute_uv=False)[0]
top_eigenvalues = eigenvalues[:10].compute()

# Dask Bag for unstructured text processing
papers = db.read_text("abstracts/*.txt")
word_counts = (
    papers.str.lower()
    .str.split()
    .flatten()
    .frequencies()
    .topk(50)
    .compute()
)
```

### 3. Dask Delayed / 延迟计算与自定义任务图

Wrap arbitrary Python functions into the Dask task graph for fine-grained parallelism.

```python
from dask import delayed
import numpy as np

@delayed
def simulate_replicate(seed, n_steps=1000):
    rng = np.random.default_rng(seed)
    trajectory = np.cumsum(rng.normal(0, 1, n_steps))
    return trajectory

@delayed
def compute_autocorrelation(traj, max_lag=50):
    mean = traj.mean()
    var = traj.var()
    return [np.mean((traj[:-lag] - mean) * (traj[lag:] - mean)) / var
            for lag in range(1, max_lag)]

# Build task graph for 100 Monte Carlo replicates
trajectories = [simulate_replicate(seed=i) for i in range(100)]
autocorrelations = [compute_autocorrelation(t) for t in trajectories]

# Execute in parallel
results = dask.compute(*autocorrelations, scheduler="threads", num_workers=8)
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Processing a 50 GB Genomics Dataset / 50GB 基因组学数据处理

```python
import dask.dataframe as dd
import dask
from dask.distributed import Client, LocalCluster

# Start local cluster with memory awareness
cluster = LocalCluster(
    n_workers=4,
    threads_per_worker=2,
    memory_limit="8GB",  # per worker
)
client = Client(cluster)

# Load and preprocess
df = dd.read_parquet("rna_seq/raw/*.parquet")
df = df[df.quality_score > 20]  # filter low-quality reads
df["log_expression"] = dd.map_partitions(
    lambda p: np.log1p(p["raw_count"]), meta=("log_expression", "f8")
)

# Differential expression (simplified)
high_expr = (
    df.groupby("gene_id")
    .log_expression.mean()
    .reset_index()
    .compute()
)
high_expr = high_expr[high_expr["log_expression"] > 5]

# Save results partitioned by chromosome
high_expr.to_parquet("rna_seq/processed/", partition_on=["chromosome"])

# Inspect task graph and memory usage
print(client.dashboard_link)  # open Dask dashboard in browser
```

### Workflow: Task Graph Visualization / 任务图可视化

```python
import dask.array as da
import dask

x = da.ones((10, 10), chunks=(5, 5))
y = (x + x.T).sum(axis=0)

# Visualize task graph
dask.visualize(y, filename="task_graph", optimize_graph=True)
# Generates task_graph.png showing the computation DAG
```

## Best Practices / 最佳实践

- **Set partition size to 100-500 MB** for DataFrames; too-small partitions cause scheduler overhead, too-large cause memory spilling. Use `blocksize="256MB"` in `read_csv`.
- **Use the distributed scheduler** (`LocalCluster`) even on a single machine — it provides the diagnostic dashboard and better memory management than the threaded scheduler.
- **Avoid `.compute()` inside loops**; batch all lazy operations into a single task graph and compute once at the end.
- **Prefer Parquet over CSV** for disk I/O — Parquet preserves dtypes, supports predicate pushdown, and is 5-10x faster to read.
- **Profile with `dask.diagnostics.ProgressBar`** or the dashboard before scaling; look for task imbalances and memory spikes.
- **Pin versions** (`dask==2024.8.0`, `distributed==2024.8.0`) for reproducibility — Dask APIs evolve across minor versions.

## Common Pitfalls / 常见陷阱

- **Shuffling on categorical columns with many categories** — use `df.categorical = ...` or convert to `object` dtype first to avoid excessive memory use during `groupby`.
- **Silent data loss from `drop_duplicates()`** — Dask does not guarantee global deduplication unless `shuffle="tasks"` is specified; verify with `.shape` before and after.
- **Forgetting `.compute()`** — Dask operations return lazy objects; printing a DataFrame shows only the schema, not the data. Always call `.compute()` or `.head()` to materialize.
- **Memory spilling to disk** — monitor the dashboard's "Memory" tab; if workers spill frequently, reduce `chunks` size or increase `memory_limit`.
- **GIL bottleneck with `scheduler="threads"`** — for CPU-bound NumPy operations this is fine (NumPy releases the GIL), but for pure-Python code use `scheduler="processes"`.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` to parallelize parameter sweeps and Monte Carlo simulations across HBE-managed compute resources.
- Pair with `references/tools/pandas.md` — Dask DataFrame is a drop-in replacement; migrate by changing `import pandas as pd` to `import dask.dataframe as dd`.
- Combine with `references/tools/matplotlib.md` for plotting Dask Array results after `.compute()` materialization.

## Resources / 资源

- Documentation: https://docs.dask.org/en/stable/
- Dask Examples Gallery: https://examples.dask.org/
- GitHub: https://github.com/dask/dask
