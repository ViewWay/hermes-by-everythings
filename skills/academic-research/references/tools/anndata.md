---
name: anndata
description: Annotated data matrices for single-cell and multi-omics analysis — the backbone of scanpy workflows
domain: Biology / Single-Cell
install: pip install anndata
---

# AnnData — Annotated Data Matrices / 标注数据矩阵

AnnData provides the core data structure (AnnData) for storing annotated data matrices: observations (cells) × variables (genes) with rich metadata, sparse matrix support, and hierarchical annotation layers.

## When to Use / 适用场景

- Storing single-cell RNA-seq data with cell/gene annotations
- Managing multi-modal data (RNA + ATAC + protein)
- Sharing datasets in a self-describing format (h5ad)
- Building custom analysis pipelines beyond scanpy's defaults

## Quick Start / 快速开始

```python
import anndata as ad
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix

# Create from arrays
adata = ad.AnnData(
    X=csr_matrix(np.random.poisson(2, size=(1000, 20000))),  # 1000 cells × 20000 genes
    obs=pd.DataFrame({"cell_type": ["T cell"] * 500 + ["B cell"] * 500}, index=[f"cell_{i}" for i in range(1000)]),
    var=pd.DataFrame({"gene_name": [f"Gene_{i}" for i in range(20000)]}, index=[f"gene_{i}" for i in range(20000)])
)

# Basic attributes
print(adata.shape)         # (1000, 20000)
print(adata.obs.head())    # Cell metadata
print(adata.var.head())    # Gene metadata
print(adata.X[:5, :5])     # Expression matrix
```

## Core Capabilities / 核心能力

### 1. Data Structure / 数据结构

```python
import anndata as ad

# Access components
adata.X              # Main expression matrix (can be sparse)
adata.obs            # Cell/observation metadata (DataFrame)
adata.var            # Gene/variable metadata (DataFrame)
adata.obsm           # Multi-dimensional cell annotations (dict: X_umap, X_pca, ...)
adata.varm           # Multi-dimensional gene annotations
adata.obsp           # Pairwise cell metrics (distance matrices, adjacency)
adata.varp           # Pairwise gene metrics
adata.uns            # Unstructured annotations (parameters, colors, ...)
adata.layers         # Alternative representations (raw, counts, normalized)

# Add layers
adata.layers["counts"] = adata.X.copy()
adata.layers["log1p"] = np.log1p(adata.X.toarray())

# Add embeddings
adata.obsm["X_umap"] = umap_coords  # shape: (n_obs, n_dims)
adata.obsm["X_pca"] = pca_coords

# Add pairwise metrics
adata.obsp["distances"] = distance_matrix
adata.obsp["connectivities"] = adjacency_matrix
```

### 2. I/O Operations / 读写操作

```python
import anndata as ad

# Save to h5ad
adata.write("dataset.h5ad")

# Load from h5ad
adata = ad.read_h5ad("dataset.h5ad")

# Read 10x format
adata = ad.read_10x_mtx("filtered_feature_bc_matrix/")

# Read from other formats
adata = ad.read_mtx("matrix.mtx")  # Need to add obs/var separately

# Lazy loading for large datasets (backed mode)
adata = ad.read_h5ad("large_dataset.h5ad", backed="r")
adata_subset = adata[:1000, :500].to_memory()  # Load subset to memory

# Write with compression
adata.write("dataset.h5ad", compression="gzip")
```

### 3. Subsetting and Filtering / 子集与过滤

```python
# Boolean indexing
subset = adata[adata.obs["cell_type"] == "T cell"]

# List indexing
subset = adata[["cell_0", "cell_1", "cell_2"]]

# Slice by position
subset = adata[:100]          # First 100 cells
subset = adata[:, :2000]      # First 2000 genes

# In-place filtering
adata = adata[adata.obs["n_genes"] > 200, :]
adata = adata[:, adata.var["n_cells"] > 3]

# Copy vs view
subset = adata[:100].copy()   # Explicit copy
```

### 4. Concatenation and Merging / 拼接与合并

```python
import anndata as ad

# Concatenate multiple AnnData objects
adata_combined = ad.concat(
    [adata1, adata2, adata3],
    axis=0,                          # Stack observations (cells)
    join="inner",                    # Keep common genes
    label="batch",                   # Add batch column to obs
    keys=["sample1", "sample2", "sample3"],
    merge="unique"                   # Merge var columns
)

# Merge modalities (axis=1 for variables)
adata_multi = ad.concat(
    [adata_rna,adata_atac],
    axis=1,
    join="outer",
    label="modality",
    keys=["RNA", "ATAC"]
)
```

### 5. Multi-Modal Data / 多模态数据

```python
# Modern multi-modal storage (anndata >= 0.10)
adata = ad.AnnData(X=rna_matrix)
adata.obsm["protein_counts"] = protein_matrix
adata.obsm["atac_counts"] = atac_matrix

# Access specific modality
protein = adata.obsm["protein_counts"]

# Using MuData (multi-modal wrapper)
# pip install mudata
import mudata as md
mdata = md.MuData({"rna": adata_rna, "atac": adata_atac, "protein": adata_protein})
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Dataset Curation for Publication / 发表级数据整理

```python
import anndata as ad
import pandas as pd

# Load raw data
adata = ad.read_h5ad("raw.h5ad")

# Add publication-quality metadata
adata.obs["sample_id"] = pd.Categorical(adata.obs["sample_id"])
adata.obs["disease_state"] = pd.Categorical(adata.obs["disease_state"])
adata.var["ensembl_id"] = gene_ids

# Store processing parameters
adata.uns["processing"] = {
    "genome": "GRCh38",
    "reference_version": "2024-A",
    "normalization": "scanpy.pp.normalize_total + log1p",
    "hvg_n_top_genes": 2000
}

# Validate
assert adata.X.shape[0] == adata.obs.shape[0]
assert adata.X.shape[1] == adata.var.shape[1]

adata.write("curated_dataset.h5ad", compression="gzip")
```

### Workflow 2: Multi-Sample Integration /多样本整合

```python
import anndata as ad
import scanpy as sc

samples = ["sample1.h5ad", "sample2.h5ad", "sample3.h5ad"]
adatas = [ad.read_h5ad(f) for f in samples]

# Add batch info before concatenation
for i, a in enumerate(adatas):
    a.obs["batch"] = f"batch_{i}"

merged = ad.concat(adatas, join="outer", label="sample", keys=[f"S{i}" for i in range(len(adatas))])

# Run integration (using scanpy)
sc.pp.filter_genes(merged, min_cells=3)
sc.pp.normalize_total(merged, target_sum=1e4)
sc.pp.log1p(merged)
sc.pp.highly_variable_genes(merged, batch_key="batch")
merged = merged[:, merged.var.highly_variable]
sc.pp.scale(merged, max_value=10)
sc.tl.pca(merged)
```

## Best Practices / 最佳实践

- Store raw counts in `adata.layers["counts"]` before normalization
- Use sparse matrices (`scipy.sparse.csr_matrix`) for scRNA-seq to save memory
- Add processing provenance to `adata.uns` for reproducibility
- Use `.copy()` when subsetting to avoid view-related bugs
- Use `backed="r"` mode for datasets >50GB

## Common Pitfalls / 常见陷阱

- **View vs copy**: Slicing returns a view by default; mutations may not propagate as expected
- **Sparse matrix operations**: `adata.X.max()` fails on sparse; use `adata.X.max(axis=0).toarray()`
- **Index alignment**: obs and var indices must be unique for concatenation
- **H5AD size**: Dense matrices create huge files; convert to sparse before saving
- **dtype issues**: Layers and X may have different dtypes; check with `adata.X.dtype`

## Integration with HBE / 与 HBE 集成

- Core data structure used by `references/tools/scanpy.md`
- Pair with `references/tools/pandas.md` for obs/var metadata manipulation
- Use with `references/tools/matplotlib.md` for custom publication figures
- Integrate with `workflows/experiment-design.md` for single-cell study design

## Resources / 资源

- Documentation: https://anndata.readthedocs.io/
- Tutorial: https://scanpy.readthedocs.io/en/stable/tutorials.html
- MuData (multi-modal): https://mudata.readthedocs.io/
