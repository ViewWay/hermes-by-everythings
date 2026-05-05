---
name: umap-learn
description: Uniform Manifold Approximation and Projection for dimensionality reduction — faster and more scalable than t-SNE
domain: ML / Visualization
install: pip install umap-learn
---

# UMAP — Uniform Manifold Approximation and Projection / 均匀流形近似与投影

UMAP is a general-purpose manifold learning and dimension reduction algorithm. It preserves more global structure than t-SNE, runs faster, and supports supervised, semi-supervised, and metric learning modes.

## When to Use / 适用场景

- Visualizing high-dimensional data in 2D/3D
- Alternative to t-SNE with better global structure preservation
- Pre-processing step for clustering (using UMAP embedding as input)
- Large-scale visualization (>100K points) where t-SNE is too slow
- Single-cell RNA-seq, image embeddings, NLP embeddings visualization

## Quick Start / 快速开始

```python
import umap
import numpy as np
import matplotlib.pyplot as plt

# Simple 2D embedding
data = np.random.randn(1000, 50)  # 1000 samples × 50 features
reducer = umap.UMAP(n_neighbors=15, min_dist=0.1, n_components=2)
embedding = reducer.fit_transform(data)

plt.scatter(embedding[:, 0], embedding[:, 1], s=5, alpha=0.5)
plt.title("UMAP Projection")
plt.savefig("umap.pdf")
```

## Core Capabilities / 核心能力

### 1. Basic Embedding / 基础嵌入

```python
import umap

# Standard unsupervised UMAP
reducer = umap.UMAP(
    n_neighbors=15,      # Local neighborhood size
    min_dist=0.1,        # Minimum distance between points in embedding
    n_components=2,      # Output dimension
    metric="euclidean",  # Distance metric
    random_state=42
)
embedding = reducer.fit_transform(X)

# Transform new data (requires fitting first)
reducer.fit(X_train)
embedding_test = reducer.transform(X_test)
```

### 2. Supervised UMAP / 有监督 UMAP

```python
import umap

# Use labels to guide embedding (better class separation)
reducer = umap.UMAP(n_neighbors=15, min_dist=0.1)
embedding = reducer.fit_transform(X, y=labels)

# Semi-supervised (some labels unknown)
y_partial = labels.copy()
y_partial[::5] = -1  # Mark 20% as unknown
embedding = reducer.fit_transform(X, y=y_partial)
```

### 3. Custom Metrics / 自定义度量

```python
import umap
import numpy as np

# Built-in metrics
reducer = umap.UMAP(metric="cosine")       # Cosine distance
reducer = umap.UMAP(metric="correlation")   # Correlation
reducer = umap.UMAP(metric="manhattan")     # Manhattan/L1

# Custom metric function
def custom_metric(x, y):
    return np.sum(np.abs(x - y) / (np.abs(x) + np.abs(y) + 1e-10))

reducer = umap.UMAP(metric=custom_metric)
embedding = reducer.fit_transform(X)

# Precomputed distance matrix
from sklearn.metrics import pairwise_distances
dist_matrix = pairwise_distances(X, metric="euclidean")
reducer = umap.UMAP(metric="precomputed")
embedding = reducer.fit_transform(dist_matrix)
```

### 4. Sparse Data Support / 稀疏数据支持

```python
import umap
from scipy.sparse import csr_matrix

# UMAP handles sparse matrices natively
sparse_data = csr_matrix(X)  # e.g., TF-IDF, count data
reducer = umap.UMAP(metric="cosine")
embedding = reducer.fit_transform(sparse_data)
```

### 5. 3D Embedding and Animation / 3D 嵌入与动画

```python
import umap
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# 3D embedding
reducer = umap.UMAP(n_components=3)
embedding = reducer.fit_transform(X)

fig = plt.figure(figsize=(10, 8))
ax = fig.add_subplot(111, projection="3d")
scatter = ax.scatter(embedding[:, 0], embedding[:, 1], embedding[:, 2],
                     c=labels, cmap="tab10", s=5, alpha=0.5)
plt.colorbar(scatter, label="Class")
plt.savefig("umap_3d.pdf")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Single-Cell RNA-seq Visualization / scRNA-seq 可视化

```python
import scanpy as sc
import umap
import matplotlib.pyplot as plt

# After scanpy preprocessing
adata = sc.read_h5ad("processed.h5ad")

# Custom UMAP (different parameters than scanpy default)
reducer = umap.UMAP(
    n_neighbors=30,
    min_dist=0.3,
    n_components=2,
    metric="cosine",
    random_state=42
)
embedding = reducer.fit_transform(adata.obsm["X_pca"])
adata.obsm["X_umap_custom"] = embedding

# Plot
fig, ax = plt.subplots(figsize=(8, 6))
scatter = ax.scatter(embedding[:, 0], embedding[:, 1],
                     c=adata.obs["cell_type"].astype("category").cat.codes,
                     cmap="tab20", s=3, alpha=0.7)
ax.set_xlabel("UMAP1")
ax.set_ylabel("UMAP2")
plt.colorbar(scatter, label="Cell Type")
plt.savefig("umap_custom.pdf", dpi=300, bbox_inches="tight")
```

### Workflow 2: Parameter Sensitivity Analysis / 参数敏感性分析

```python
import umap
import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(2, 3, figsize=(15, 10))
neighbors_list = [5, 15, 50]
dist_list = [0.0, 0.1, 0.5]

for i, n_n in enumerate(neighbors_list):
    for j, md in enumerate(dist_list):
        reducer = umap.UMAP(n_neighbors=n_n, min_dist=md, random_state=42)
        emb = reducer.fit_transform(X)
        axes[j, i].scatter(emb[:, 0], emb[:, 1], c=labels, cmap="tab10", s=2, alpha=0.5)
        axes[j, i].set_title(f"n_neighbors={n_n}, min_dist={md}")
        axes[j, i].set_xticks([])
        axes[j, i].set_yticks([])

plt.tight_layout()
plt.savefig("umap_parameter_sensitivity.pdf", dpi=300)
```

## Key Parameters / 关键参数

| Parameter | Effect | Typical Range |
|-----------|--------|---------------|
| `n_neighbors` | Local vs global structure | 5-100 (small=local, large=global) |
| `min_dist` | Point clustering in embedding | 0.0-0.99 (small=tight clusters) |
| `n_components` | Output dimensions | 2 or 3 for visualization |
| `metric` | Distance function | "euclidean", "cosine", "correlation" |
| `spread` | Scale of embedded points | 1.0 (default) |
| `learning_rate` | Optimization step size | 1.0 (default) |
| `n_epochs` | Training iterations | None (auto, 200-500) |

## Best Practices / 最佳实践

- Use `random_state` for reproducibility
- Try multiple `n_neighbors` values (5, 15, 30, 50) to assess robustness
- Use `min_dist=0.0` for clustering visualization, `min_dist=0.3` for general structure
- Always run PCA before UMAP for very high-dimensional data (>1000 features)
- Report UMAP parameters in methods section (n_neighbors, min_dist, metric)

## Common Pitfalls / 常见陷阱

- **Not a distance metric**: UMAP distances in embedding space are not meaningful; only topology matters
- **Randomness**: Results vary across runs without `random_state`; always set seed
- **Parameter sensitivity**: Very different embeddings can result from different `n_neighbors`; report multiple
- **Overinterpretation**: Cluster structure may not reflect biological truth; validate with independent data
- **Large datasets**: For >1M points, use `umap.UMAP(..., low_memory=True)` or subsample

## Integration with HBE / 与 HBE 集成

- Core tool for `references/tools/scanpy.md` dimensionality reduction
- Pair with `references/tools/matplotlib.md` for publication-quality embedding plots
- Use with `references/tools/scikit-learn.md` for clustering on UMAP embeddings
- Integrate with `workflows/experiment-design.md` for visualization planning

## Resources / 资源

- Documentation: https://umap-learn.readthedocs.io/
- Paper: McInnes et al., UMAP: Uniform Manifold Approximation and Projection, 2018
- Parameter guide: https://umap-learn.readthedocs.io/en/latest/parameters.html
