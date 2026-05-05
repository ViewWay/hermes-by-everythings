---
name: lamindb
description: Scientific data management framework — dataset versioning, biological registries, feature tracking, and data provenance
domain: ML / Infrastructure
install: pip install "lamindb[bionty]"
---

# lamindb — Scientific Data Management / 科学数据管理框架

LaminDB provides version-controlled artifact storage, biological entity registries (genes, proteins, cell types via Bionty), and full data provenance tracking for reproducible research.

## When to Use / 适用场景

- Managing the lifecycle of multi-version datasets from raw acquisition to publication (管理数据集从原始采集到发表的全生命周期版本)
- Registering biological entities (genes, proteins, cell types, diseases) with standardized ontologies (用标准化本体注册生物实体)
- Tracking data transformations and pipeline provenance for computational biology papers (追踪计算生物学论文中的数据变换和管道溯源)
- Collaborative data sharing between lab members with access control (实验室成员间协作共享数据并控制访问权限)
- Building feature registries that link experimental measurements to biological metadata (构建将实验测量链接到生物元数据的特征注册表)

## Quick Start / 快速开始

```python
import lamindb as ln
import pandas as pd

# Initialize (first time only — creates local SQLite + storage)
ln.setup.init(storage="./my_study")

# Track the current transform/pipeline step
ln.track("Preprocess scRNA-seq")

# Register an artifact (file with version control)
artifact = ln.Artifact(
    pd.DataFrame({"gene": ["TP53", "BRCA1"], "count": [150, 89]}),
    description="Raw gene counts from 10x Genomics",
)
artifact.save()

# Query artifacts by metadata
results = ln.Artifact.filter(description__icontains="gene count").all()

# View full provenance chain
artifact.view_lineage()
```

## Core Capabilities / 核心能力

### 1. Dataset Versioning and Artifacts / 数据集版本管理与制品

```python
import lamindb as ln
import pandas as pd

# Version a dataset through processing stages
raw_counts = ln.Artifact.from_df(
    pd.read_parquet("raw_counts.parquet"),
    description="Raw UMI counts, unfiltered",
    key="scrnaseq/raw_counts.parquet",
)
raw_counts.save()

# Transform: filter low-quality cells
filtered = raw_counts.stage  # or load and process
filtered_counts = ln.Artifact.from_df(
    filtered,
    description="Filtered counts (cells with >500 genes)",
    key="scrnaseq/filtered_counts.parquet",
)
filtered_counts.save()

# Link versions in a lineage
raw_counts.children.add(filtered_counts)

# Compare versions side by side
v1 = ln.Artifact.filter(key="scrnaseq/raw_counts.parquet").one()
v2 = ln.Artifact.filter(key="scrnaseq/filtered_counts.parquet").one()
print(f"Shape: {v1.describe()} -> {v2.describe()}")
```

### 2. Biological Entity Registry (Bionty) / 生物实体注册

```python
import lamindb as ln
import bionty as bt

# Register genes with standardized nomenclature
gene_records = bt.Gene.from_values(
    ["TP53", "BRCA1", "EGFR", "MYC"],
    field="symbol",
    organism="human",
)
ln.save(gene_records)

# Register cell types using Cell Ontology (CL)
cell_type_records = bt.CellType.from_values(
    ["T cell", "B cell", "NK cell", "monocyte"],
    field="name",
)
ln.save(cell_type_records)

# Query with ontology-aware search
result = bt.Gene.filter(symbol="TP53").one()
print(f"Ensembl ID: {result.ensembl_gene_id}")

# Register diseases with MONDO ontology
disease_records = bt.Disease.from_values(
    ["breast carcinoma", "lung adenocarcinoma"],
    field="name",
)
ln.save(disease_records)
```

### 3. Feature Registries and Labels / 特征注册与标签

```python
import lamindb as ln
import bionty as bt
import pandas as pd

# Create a feature set linked to genes
features = bt.Gene.from_values(
    ["TP53", "BRCA1", "EGFR"],
    field="symbol",
    organism="human",
)
feature_set = ln.FeatureSet(features, name="oncogene_panel_v1")
feature_set.save()

# Register a dataset with its features and labels
df = pd.DataFrame({"TP53": [10.2, 8.1], "BRCA1": [5.3, 7.9], "label": ["tumor", "normal"]})
artifact = ln.Artifact.from_df(df, description="Oncogene expression panel")
artifact.save()
artifact.features.add(feature_set)

# Add labels (cell type, treatment, etc.)
label_records = ln.ULabel.from_values(["tumor", "normal"], field="name")
ln.save(label_records)
artifact.ulabels.add(label_records)

# Query all artifacts with a specific label
tumor_artifacts = ln.Artifact.filter(ulabels__name="tumor").all()
```

## Common Academic Workflows / 常见学术工作流

### Workflow: scRNA-seq Dataset Lifecycle / 单细胞RNA测序数据集全生命周期

```python
import lamindb as ln
import bionty as bt
import scanpy as sc
import pandas as pd

ln.setup.init(storage="./scrnaseq_study")

# --- Stage 1: Raw data ingestion ---
ln.track("Raw data ingestion")
adata = sc.read_10x_mtx("filtered_feature_bc_matrix/")
raw = ln.Artifact.from_anndata(adata, description="Raw 10x counts")
raw.save()

# --- Stage 2: Quality control ---
ln.track("QC filtering")
sc.pp.filter_cells(adata, min_genes=500)
sc.pp.filter_genes(adata, min_cells=10)
qc = ln.Artifact.from_anndata(adata, description="QC-filtered counts")
qc.save()
raw.parents.add(qc)

# --- Stage 3: Normalization and clustering ---
ln.track("Normalization & clustering")
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
sc.tl.pca(adata)
sc.pp.neighbors(adata, n_neighbors=15)
sc.tl.umap(adata)
sc.tl.leiden(adata, resolution=0.5)
normalized = ln.Artifact.from_anndata(adata, description="Normalized, clustered")
normalized.save()
qc.parents.add(normalized)

# --- Stage 4: Register features and cell type labels ---
gene_features = bt.Gene.from_values(
    adata.var_names[:100], field="symbol", organism="human"
)
ln.save(gene_features)
fs = ln.FeatureSet(gene_features, name="top100_variable_genes")
fs.save()
normalized.features.add(fs)

# --- Stage 5: Export for manuscript ---
adata.write("manuscript_figures/clustered_adata.h5ad")
ln.track("Manuscript export")
ln.finish()  # mark transform complete
```

## Best Practices / 最佳实践

- **Call `ln.track()` at the start of every processing step** — this records the transform name, parameters, and timestamp, enabling full reproducibility of the pipeline.
- **Use `key="path/to/file.parquet"` naming conventions** — LaminDB uses hierarchical keys for organization; follow `project/dataset_stage.format` pattern.
- **Register biological entities with Bionty before linking to artifacts** — this ensures ontology compliance and enables cross-study queries on standardized identifiers.
- **Use `artifact.view_lineage()` to verify provenance** before publishing — trace the full transformation chain from raw data to final results.
- **Call `ln.finish()` at the end of each transform** to mark completion and enable downstream dependency tracking.

## Common Pitfalls / 常见陷阱

- **Forgetting `ln.setup.init()`** — LaminDB requires explicit initialization of storage and database before any operations; this creates the SQLite database and `./storage/` directory.
- **Duplicate feature registrations** — always call `bt.Gene.from_values()` with `field="symbol"` and check for duplicates before saving; LaminDB raises errors on duplicate primary keys.
- **Storage path conflicts** — if you change the storage directory, existing artifact references break; keep the `storage` path stable or use `ln.Artifact.transfer()` to migrate.
- **Large file handling** — for files >100 MB, LaminDB stores them by reference in the storage directory rather than in the database; ensure the storage path is backed up.
- **Concurrent writes** — SQLite does not support concurrent writes from multiple processes; use PostgreSQL (`ln.setup.init(db="postgresql://...")`) for team collaboration.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` to track dataset versions across HBE-managed experiment iterations.
- Pair with `references/tools/scanpy.md` — LaminDB's `from_anndata()`/`to_anndata()` methods provide seamless AnnData integration for scRNA-seq workflows.
- Combine with `references/tools/dask.md` for processing LaminDB-registered datasets that exceed memory limits.

## Resources / 资源

- Documentation: https://docs.lamin.ai/
- LaminDB Tutorials: https://docs.lamin.ai/tutorials
- Bionty Reference: https://docs.lamin.ai/bionty
- GitHub: https://github.com/laminlabs/lamindb
