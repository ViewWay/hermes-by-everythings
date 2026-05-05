---
name: scvi-tools
description: Deep generative models for single-cell omics — variational inference for batch correction, annotation, and multi-modal integration
domain: Biology / Single-Cell
install: pip install scvi-tools
---

# scvi-tools — Deep Generative Models for Single-Cell / 单细胞深度生成模型

scvi-tools provides probabilistic deep learning models (VAE-based) for single-cell data analysis: batch correction (scVI), cell annotation (scANVI), differential expression, and multi-modal integration (MULTIVI, totalVI).

## When to Use / 适用场景

- Batch correction and integration across multiple scRNA-seq datasets
- Automatic cell type annotation with reference mapping
- Multi-modal integration (RNA + protein, RNA + ATAC)
- Probabilistic differential expression analysis
- Scalable analysis of millions of cells

## Quick Start / 快速开始

```python
import scanpy as sc
import scvi

# Load data
adata = sc.read_h5ad("my_data.h5ad")

# Setup and train scVI model
scvi.model.SCVI.setup_anndata(adata, batch_key="sample_id")
model = scvi.model.SCVI(adata)
model.train()

# Get latent representation
latent = model.get_latent_representation()
adata.obsm["X_scVI"] = latent

# Run UMAP on scVI latent space
sc.pp.neighbors(adata, use_rep="X_scVI")
sc.tl.umap(adata)
sc.pl.umap(adata, color=["cell_type", "sample_id"])
```

## Core Capabilities / 核心能力

### 1. scVI — Batch Correction / 批次校正

```python
import scvi

# Setup with batch key
scvi.model.SCVI.setup_anndata(adata, batch_key="batch", labels_key="cell_type")
model = scvi.model.SCVI(adata, n_layers=2, n_latent=30)
model.train(max_epochs=400)

# Access latent space
adata.obsm["X_scVI"] = model.get_latent_representation()

# Get normalized expression
adata.layers["scvi_normalized"] = model.get_normalized_expression()

# Save and load model
model.save("scvi_model/")
loaded = scvi.model.SCVI.load("scvi_model/", adata=adata)
```

### 2. scANVI — Semi-Supervised Annotation / 半监督注释

```python
import scvi

# Annotate cells using a reference dataset
# Some cells have known labels, others are unlabeled
scvi.model.SCANVI.setup_anndata(
    adata,
    batch_key="batch",
    labels_key="cell_type",
    unlabeled_category="Unknown"
)
model = scvi.model.SCANVI(adata)
model.train()

# Get predictions
adata.obs["predicted_cell_type"] = model.predict()
adata.obs["prediction_probability"] = model.predict(soft=True).max(axis=1)

# Transfer labels to new dataset
reference = sc.read_h5ad("reference_annotated.h5ad")
query = sc.read_h5ad("query_unannotated.h5ad")
scvi.model.SCVI.prepare_query_anndata(query, reference_model="scanvi_reference/")
query_model = scvi.model.SCANVI.load_query_data(query, reference_model)
query_model.train(max_epochs=200)
```

### 3. Differential Expression / 差异表达

```python
# Probabilistic DE using scVI posterior
de_results = model.differential_expression(
    groupby="cell_type",
    group1="T cell",
    group2="B cell"
)

# One-vs-all
de_results = model.differential_expression(groupby="cell_type")
```

### 4. Multi-Modal Integration / 多模态整合

```python
# totalVI: RNA + CITE-seq protein
scvi.model.TOTALVI.setup_anndata(
    adata,
    protein_expression_obsm_key="protein_counts",
    batch_key="batch"
)
model = scvi.model.TOTALVI(adata)
model.train()

# MULTIVI: RNA + ATAC
scvi.model.MULTIVI.setup_anndata(
    adata,
    batch_key="batch",
    categorical_covariate_keys=["modality"]
)
model = scvi.model.MULTIVI(adata)
model.train()
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Multi-Batch Integration Pipeline / 多批次整合流程

```python
import scanpy as sc
import scvi

adata = sc.read_h5ad("multi_batch_data.h5ad")

# Preprocess
sc.pp.filter_genes(adata, min_cells=10)
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# scVI integration
scvi.model.SCVI.setup_anndata(adata, batch_key="batch")
model = scvi.model.SCVI(adata, n_layers=2, n_latent=30)
model.train(max_epochs=400)

# Use latent space
adata.obsm["X_scVI"] = model.get_latent_representation()
sc.pp.neighbors(adata, use_rep="X_scVI")
sc.tl.umap(adata)
sc.tl.leiden(adata, resolution=0.5)

# Evaluate batch mixing
# (use scib metrics for quantitative assessment)
```

### Workflow 2: Reference Mapping / 参考映射

```python
import scanpy as sc
import scvi

# Train on reference
ref = sc.read_h5ad("reference.h5ad")
scvi.model.SCVI.setup_anndata(ref, batch_key="batch", labels_key="cell_type")
scanvi = scvi.model.SCANVI(ref, unlabeled_category="Unknown")
scanvi.train()
scanvi.save("reference_model/")

# Map query data
query = sc.read_h5ad("query.h5ad")
scvi.model.SCVI.prepare_query_anndata(query, reference_model="reference_model/")
query_model = scvi.model.SCANVI.load_query_data(query, scanvi)
query_model.train(max_epochs=200)

# Get transferred labels
query.obs["transferred_label"] = query_model.predict()
```

## Key Parameters / 关键参数

| Parameter | Context | Typical Values |
|-----------|---------|----------------|
| `n_latent` | Latent dimension | 10-30 |
| `n_layers` | Encoder/decoder depth | 2 |
| `max_epochs` | Training duration | 200-400 |
| `batch_key` | Batch variable | Column in adata.obs |
| `labels_key` | Cell type labels | Column in adata.obs |
| `gene_likelihood` | Distribution | "zinb" (default), "nb", "poisson" |

## Best Practices / 最佳实践

- Use scVI for batch correction when you have >3 batches or complex batch structures
- Use scANVI for annotation transfer when a well-annotated reference exists
- Train with GPU (`model.train()` auto-detects) for datasets >100K cells
- Monitor training with `model.history()` to check convergence
- Use `model.differential_expression()` instead of Wilcoxon for scVI-corrected data

## Common Pitfalls / 常见陷阱

- **Overfitting**: Reduce `n_layers` or increase regularization for small datasets
- **GPU memory**: Large datasets (>500K cells) may need batch training; reduce `train_batch_size`
- **Batch key required**: Forgetting `batch_key` means no batch correction
- **Raw counts input**: scVI models expect raw counts, not log-normalized data

## Integration with HBE / 与 HBE 集成

- Core model layer for `references/tools/scanpy.md` workflows
- Pair with `references/tools/pytorch-lightning.md` (scvi-tools is built on it)
- Use with `references/tools/anndata.md` for data management
- Integrate with `references/tools/matplotlib.md` for publication figures

## Resources / 资源

- Documentation: https://docs.scvi-tools.org/
- Tutorials: https://docs.scvi-tools.org/en/stable/tutorials/
- Paper: Gayoso et al., Nature Methods 2022
