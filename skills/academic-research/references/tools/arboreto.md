---
name: arboreto
description: Gene regulatory network inference — scalable tree-based methods for GRN reconstruction from single-cell expression data
domain: Biology / Systems Biology
install: pip install arboreto
---

# arboreto — Gene Regulatory Network Inference

Arboreto is a scalable Python library for gene regulatory network (GRN) inference from expression data. It uses tree-based ensemble methods (Random Forest and Gradient Boosting) as part of the GENIE3/GRNBoost2 framework to infer transcription factor (TF) to target gene regulatory relationships from bulk or single-cell RNA-seq data.

## When to Use

- Inferring gene regulatory networks from single-cell RNA-seq data
- Identifying transcription factor target genes from expression matrices
- Building GRNs for cell-type-specific regulatory analysis
- Scoring TF activity from expression data for pathway analysis
- Complementing SCENIC/SCENIC+ pipelines for regulatory network analysis

## Quick Start

```python
import pandas as pd
import numpy as np
from arboreto.algo import grnboost2

# Load expression matrix (genes x cells)
expression_df = pd.read_csv("expression_matrix.csv", index_col=0)
print(f"Expression matrix: {expression_df.shape[0]} genes x {expression_df.shape[1]} cells")

# Define transcription factors (from TF database or known list)
tf_names = pd.read_csv("human_tfs.csv")["tf_name"].tolist()
# Filter to TFs present in expression data
tf_names = [tf for tf in tf_names if tf in expression_df.index]
print(f"Using {len(tf_names)} transcription factors")

# Run GRNBoost2 for GRN inference
network = grnboost2(
    expression_data=expression_df,
    tf_names=tf_names,
    mode="gbm",           # gradient boosting (faster than rf)
    seed=42,
    verbose=True,
)

# network is a DataFrame: TF -> Target with importance scores
print(f"Inferred {len(network)} regulatory edges")
print(network.head(10))
```

## Core Capabilities

### 1. GRNBoost2 Network Inference

```python
from arboreto.algo import grnboost2
import scanpy as sc

# Load from AnnData (single-cell workflow)
adata = sc.read_h5ad("pbmc_10k.h5ad")
# Use normalized, log-transformed counts
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# Convert to DataFrame (genes x cells)
expression_df = pd.DataFrame(
    adata.X.T.toarray() if hasattr(adata.X, "toarray") else adata.X.T,
    index=adata.var_names,
    columns=adata.obs_names,
)

# Define TFs (subset for faster demo)
from arboreto.utils import load_tf_names
tf_names = load_tf_names("hsapiens")  # Human TFs from AnimalTFDB
tf_names = [tf for tf in tf_names if tf in expression_df.index]

# Run GRNBoost2
network = grnboost2(
    expression_data=expression_df,
    tf_names=tf_names[:100],  # Use top 100 TFs for speed
    mode="gbm",
    seed=42,
)

# Save network
network.to_csv("grn_edges.csv", index=False)
print(f"Top TFs by out-degree: {network.groupby('TF').size().sort_values(ascending=False).head(10)}")
```

### 2. GENIE3 (Random Forest) Inference

```python
from arboreto.algo import genie3

# GENIE3 uses Random Forests (more robust, slower than GBM)
network_rf = genie3(
    expression_data=expression_df,
    tf_names=tf_names[:50],
    n_estimators=100,  # number of trees per TF-target pair
    seed=42,
    verbose=True,
)

# Compare with GRNBoost2 results
print("GENIE3 edges:", len(network_rf))
print(network_rf.head())
```

### 3. Network Analysis and Filtering

```python
import pandas as pd
import networkx as nx
import numpy as np

network = pd.read_csv("grn_edges.csv")

# Filter by importance threshold (top 1% of edges)
threshold = network["importance"].quantile(0.99)
filtered = network[network["importance"] >= threshold]
print(f"Filtered network: {len(filtered)} edges (threshold={threshold:.4f})")

# Build NetworkX graph
G = nx.DiGraph()
for _, row in filtered.iterrows():
    G.add_edge(row["TF"], row["target"], weight=row["importance"])

# Network statistics
print(f"Nodes: {G.number_of_nodes()}")
print(f"Edges: {G.number_of_edges()}")
print(f"Top TFs by out-degree: {sorted(G.out_degree(), key=lambda x: x[1], reverse=True)[:10]}")

# Identify hub regulators (high out-degree TFs)
out_degrees = dict(G.out_degree())
hub_tfs = sorted(out_degrees.items(), key=lambda x: x[1], reverse=True)[:20]
print("\nHub transcription factors:")
for tf, degree in hub_tfs:
    print(f"  {tf}: {degree} targets")

# Save filtered network
filtered.to_csv("grn_filtered.csv", index=False)

# Export for Cytoscape visualization
import csv
with open("grn_cytoscape.sif", "w") as f:
    writer = csv.writer(f, delimiter="\t")
    for _, row in filtered.iterrows():
        writer.writerow([row["TF"], "regulates", row["target"]])
```

## Common Academic Workflow: Cell-Type-Specific GRN Inference

```python
import scanpy as sc
import pandas as pd
from arboreto.algo import grnboost2
from arboreto.utils import load_tf_names

# 1. Load annotated single-cell data
adata = sc.read_h5ad("annotated_tissue.h5ad")
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# 2. Infer GRN per cell type
tf_names = [tf for tf in load_tf_names("hsapiens") if tf in adata.var_names]

cell_type_networks = {}
for ct in adata.obs["cell_type"].unique():
    ct_mask = adata.obs["cell_type"] == ct
    if ct_mask.sum() < 100:
        print(f"Skipping {ct}: only {ct_mask.sum()} cells")
        continue

    # Subset to cell type
    ct_expr = pd.DataFrame(
        adata[ct_mask].X.toarray() if hasattr(adata[ct_mask].X, "toarray") else adata[ct_mask].X.T,
        index=adata.var_names,
    )

    # Run GRNBoost2
    network = grnboost2(
        expression_data=ct_expr,
        tf_names=tf_names[:100],
        mode="gbm",
        seed=42,
    )

    # Get top regulators for this cell type
    top_tfs = network.groupby("TF")["importance"].mean().sort_values(ascending=False).head(10)
    cell_type_networks[ct] = top_tfs.to_dict()
    print(f"{ct}: top TFs = {list(top_tfs.index[:5])}")

# 3. Compare regulatory programs across cell types
comparison = pd.DataFrame(cell_type_networks).fillna(0)
print("\nTop TFs by cell type:")
print(comparison.head(10))
comparison.to_csv("celltype_grn_comparison.csv")
```

## Best Practices

1. Use log-normalized expression data (not raw counts) as input for GRN inference
2. Run GRNBoost2 on at least 500 cells for stable edge importance estimation
3. Limit TF list to known TFs from AnimalTFDB or TFClass to reduce computation time
4. Filter edges by importance quantile (e.g., top 0.5-1%) rather than absolute threshold
5. Validate inferred edges against known TF binding databases (ChIP-Atlas, ENCODE)

## Common Pitfalls

1. **Sparse input matrices**: GRNBoost2 does not handle scipy sparse matrices; convert to dense with `.toarray()`
2. **Memory for large networks**: Inferring all TF-target pairs scales O(n_tfs * n_genes); subset TFs or genes for large datasets
3. **Overfitting on small datasets**: Fewer than 100 cells produce unreliable importance scores; aggregate or use bulk data
4. **Importance score interpretation**: Importance is relative within a run, not absolute; do not compare scores across different datasets

## Integration with HBE

- Use with `references/tools/scanpy.md` for single-cell data preprocessing
- Pair with `references/tools/networkx.md` for network analysis and visualization
- Combine with `references/tools/pandas.md` for expression matrix manipulation
- Supports `references/tool-registry.md` systems biology tool chain

## Resources

- Arboreto Documentation: https://arboreto.readthedocs.io/
- SCENIC (uses Arboreto): https://scenic.aertslab.org/
- AnimalTFDB: http://bioinfo.life.hust.edu.cn/AnimalTFDB/
- GRNBoost2 Paper: Moerman et al., "GRNBoost2 and Arboreto" (2018)
