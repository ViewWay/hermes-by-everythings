---
name: scanpy
description: Single-cell RNA-seq analysis toolkit. Use for QC, normalization, dimensionality reduction, clustering, differential expression, and cell type annotation.
domain: biology
install: pip install scanpy
---

# Scanpy: Single-Cell RNA-seq Analysis

## Overview

Scanpy is the standard Python toolkit for single-cell RNA-seq analysis, built on AnnData. Covers QC → normalization → clustering → marker genes → cell type annotation → trajectory inference.

## When to Use

- Single-cell RNA-seq data analysis (.h5ad, 10X, CSV)
- Quality control and cell filtering
- UMAP/t-SNE visualization
- Cell clustering and marker gene identification
- Cell type annotation
- Trajectory inference / pseudotime analysis

## Quick Start

```python
import scanpy as sc
sc.settings.verbosity = 3
sc.settings.set_figure_params(dpi=80, facecolor='white')

# Load data
adata = sc.read_10x_mtx('data/')        # 10X format
adata = sc.read_h5ad('data.h5ad')        # AnnData format

# Standard workflow
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)
adata.var['mt'] = adata.var_names.str.startswith('MT-')
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], inplace=True)
adata = adata[adata.obs.pct_counts_mt < 5, :]
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
sc.tl.pca(adata)
sc.pp.neighbors(adata, n_neighbors=10, n_pcs=40)
sc.tl.umap(adata)
sc.tl.leiden(adata, resolution=0.5)
sc.pl.umap(adata, color='leiden')
```

## Core Capabilities

### 1. Quality Control

```python
adata.var['mt'] = adata.var_names.str.startswith('MT-')
sc.pp.calculate_qc_metrics(adata, qc_vars=['mt'], inplace=True)
sc.pl.violin(adata, ['n_genes_by_counts', 'total_counts', 'pct_counts_mt'], jitter=0.4, multi_panel=True)

# Filter
sc.pp.filter_cells(adata, min_genes=200)
adata = adata[adata.obs.pct_counts_mt < 5, :]
adata = adata[adata.obs.n_genes_by_counts < 5000, :]
```

### 2. Clustering and Markers

```python
sc.tl.leiden(adata, resolution=0.5)
sc.tl.rank_genes_groups(adata, 'leiden', method='wilcoxon')
sc.pl.rank_genes_groups(adata, n_genes=20, sharey=False)

# Get marker genes as DataFrame
markers = sc.get.rank_genes_groups_df(adata, group='0')
```

### 3. Cell Type Annotation

```python
marker_genes = {'T cells': ['CD3D', 'CD3E'], 'B cells': ['MS4A1', 'CD79A'],
                'Monocytes': ['CD14', 'FCGR3A'], 'NK cells': ['NKG7', 'GNLY']}
sc.pl.dotplot(adata, marker_genes, groupby='leiden')

# Map clusters to cell types
cluster_map = {'0': 'CD4 T cells', '1': 'B cells', '2': 'CD14+ Monocytes'}
adata.obs['cell_type'] = adata.obs['leiden'].map(cluster_map)
```

### 4. Publication Figures

```python
sc.settings.set_figure_params(dpi=300, frameon=False, figsize=(5, 5))
sc.settings.file_format_figs = 'pdf'
sc.pl.umap(adata, color='cell_type', legend_loc='on data', save='_publication.pdf')
sc.pl.rank_genes_groups_heatmap(adata, n_genes=10, save='_markers.pdf')
```

## Best Practices

1. **Save raw before filtering**: `adata.raw = adata` before HVG selection
2. **Try multiple resolutions**: 0.3, 0.5, 0.8, 1.0 for Leiden clustering
3. **Use `use_raw=True`** for gene expression plots: Shows original counts
4. **Check PCA variance**: `sc.pl.pca_variance_ratio(adata)` to determine n_pcs

## Integration with HBE

- Primary bioinformatics tool in `references/tool-registry.md`
- Supports `references/data-processing-guide.md` for biological data
- Works with `references/tools/matplotlib.md` for custom figure styling

## Resources

- Documentation: https://scanpy.readthedocs.io/
- Wolf et al. (2018) "SCANPY" — Genome Biology paper
- Best practices: Luecken & Theis (2019) — Molecular Systems Biology
