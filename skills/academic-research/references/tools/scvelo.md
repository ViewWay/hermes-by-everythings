---
name: scvelo
description: RNA velocity analysis for single-cell data — inferring future cell states from spliced/unspliced mRNA dynamics
domain: Biology / Single-Cell
install: pip install scvelo
---

# scVelo — RNA Velocity Analysis / RNA 速率分析

scVelo infers RNA velocity (spliced vs unspliced mRNA dynamics) to predict future cell states in single-cell RNA-seq data. It extends the original velocyto framework with stochastic and dynamical models.

## When to Use / 适用场景

- Inferring cell fate trajectories and transitions
- Identifying putative progenitor → differentiation pathways
- Analyzing developmental or time-course scRNA-seq data
- Discovering transient cell states and regulatory dynamics

## Quick Start / 快速开始

```python
import scanpy as sc
import scvelo as scv

# Load data with spliced/unspliced layers (e.g., from loom file)
adata = scv.read("sample.loom", cache=True)

# Or from pre-processed AnnData with layers
# adata = sc.read_h5ad("adata_with_spliced_unspliced.h5ad")
# adata.layers should contain "spliced" and "unspliced"

# Preprocess
scv.pp.filter_and_normalize(adata)
scv.pp.moments(adata, n_pcs=30, n_neighbors=30)

# Run stochastic model (default)
scv.tl.velocity(adata)
scv.tl.velocity_graph(adata)

# Visualize
scv.pl.velocity_embedding_stream(adata, basis="umap", color="cell_type")
```

## Core Capabilities / 核心能力

### 1. Preprocessing / 预处理

```python
import scvelo as scv

# Filter genes and normalize
scv.pp.filter_and_normalize(adata, min_shared_counts=20, n_top_genes=2000)

# Compute neighbors and moments
scv.pp.moments(adata, n_pcs=30, n_neighbors=30)

# Check spliced/unspliced proportions
scv.pl.proportions(adata)
```

### 2. Velocity Estimation / 速率估计

```python
# Stochastic model (fast, robust)
scv.tl.velocity(adata, mode="stochastic")

# Dynamical model (more accurate, slower)
scv.tl.recover_dynamics(adata)
scv.tl.velocity(adata, mode="dynamical")

# Deterministic model (simple)
scv.tl.velocity(adata, mode="deterministic")

# Compute velocity graph
scv.tl.velocity_graph(adata)
```

### 3. Visualization / 可视化

```python
# Stream plot
scv.pl.velocity_embedding_stream(adata, basis="umap", color="cell_type", save="velocity_stream.pdf")

# Grid plot
scv.pl.velocity_embedding_grid(adata, basis="umap", color="cell_type")

# Single-gene velocity
scv.pl.velocity(adata, var_names=["GeneA", "GeneB"], basis="umap")

# Phase portraits for specific genes
scv.pl.scatter(adata, x="spliced", y="unspliced", color="cell_type", alpha=0.5)
```

### 4. Pseudotime and Latent Time / 拟时序与潜在时间

```python
# Velocity pseudotime
scv.tl.velocity_pseudotime(adata)

# Latent time (from dynamical model)
scv.tl.latent_time(adata)

# Visualize
scv.pl.scatter(adata, color="velocity_pseudotime", basis="umap", cmap="gnuplot")
scv.pl.scatter(adata, color="latent_time", basis="umap", cmap="viridis")
```

### 5. Differential Kinetics / 差异动力学

```python
# Find genes with different kinetics across clusters
scv.tl.differential_kinetic_test(adata, groupby="cell_type")

# Top differential kinetics genes
scv.pl.differential_kinetic_test(adata, var_names=["GeneA", "GeneB"])
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Complete Velocity Pipeline / 完整速率分析流程

```python
import scanpy as sc
import scvelo as scv

# Load and preprocess
adata = scv.read("data.loom")
scv.pp.filter_and_normalize(adata, min_shared_counts=20, n_top_genes=2000)
scv.pp.moments(adata, n_pcs=30, n_neighbors=30)

# Compute UMAP if not already present
sc.tl.umap(adata)

# Run dynamical model
scv.tl.recover_dynamics(adata)
scv.tl.velocity(adata, mode="dynamical")
scv.tl.velocity_graph(adata)
scv.tl.latent_time(adata)

# Key visualizations for paper
scv.pl.velocity_embedding_stream(adata, basis="umap", color="cell_type",
                                  title="RNA Velocity", save="fig_velocity.pdf")
scv.pl.scatter(adata, color="latent_time", basis="umap",
               title="Latent Time", save="fig_latent_time.pdf")
scv.pl.velocity(adata, var_names=["MARKER1", "MARKER2"], basis="umap",
                save="fig_gene_velocity.pdf")
```

### Workflow 2: Identify Driver Genes / 鉴定驱动基因

```python
# Rank velocity genes per cluster
scv.tl.rank_velocity_genes(adata, groupby="cell_type")

# Top velocity genes
velocity_genes = adata.uns["rank_velocity_genes"]["names"]
for cluster in velocity_genes.dtype.names:
    top_genes = velocity_genes[cluster][:20]
    print(f"{cluster}: {', '.join(top_genes)}")

# Heatmap of velocity gene expression over pseudotime
scv.pl.heatmap(adata, var_names=velocity_genes["T cell"][:20],
               sortby="latent_time", col_color="cell_type", n_convolve=10)
```

## Best Practices / 最佳实践

- Ensure spliced/unspliced counts are properly quantified (use velocyto or STARsolo)
- Filter genes with low counts before velocity estimation
- Use ≥2,000 cells for reliable velocity estimation
- Prefer dynamical model for publication (more accurate, but slower)
- Always validate velocity directions with known biology

## Common Pitfalls / 常见陷阱

- **Missing layers**: Velocity requires "spliced" and "unspliced" layers in adata.layers
- **Ambient RNA**: Contaminates spliced/unspliced ratios; consider cellbender or soupX cleanup
- **Low cell numbers**: Velocity estimation is unreliable below ~500 cells
- **Overinterpretation**: Velocity shows statistical tendency, not deterministic fate
- **Batch effects**: Run batch correction before velocity analysis

## Integration with HBE / 与 HBE 集成

- Extends `references/tools/scanpy.md` with trajectory analysis
- Pair with `references/tools/anndata.md` for data management
- Use with `references/tools/matplotlib.md` for custom velocity figures
- Integrate with `workflows/experiment-design.md` for scRNA-seq study planning

## Resources / 资源

- Documentation: https://scvelo.readthedocs.io/
- Paper: Bergen et al., Nature Biotechnology 2020
- Tutorial: https://scvelo.readthedocs.io/en/stable/tutorial.html
