---
name: scvelo_niche
description: Cell-cell communication analysis — ligand-receptor interaction inference from single-cell RNA velocity and expression data
domain: Biology / Cell Communication
install: pip install scvelo squidpy scanpy cellrank
---

# scvelo_niche — Cell-Cell Communication Analysis

Infers cell-cell communication from single-cell gene expression and RNA velocity data. Combines tools from squidpy, CellPhoneDB, and scVelo to identify significant ligand-receptor interactions between cell types, quantify communication strength, and integrate RNA velocity for dynamic signaling analysis.

## When to Use

- Identifying ligand-receptor interactions between cell types in single-cell data
- Quantifying communication strength and directionality in tissue microenvironments
- Integrating RNA velocity to infer dynamic signaling changes during differentiation
- Analyzing tumor-immune cell communication in cancer microenvironments
- Building cell-cell interaction networks for spatial transcriptomics data

## Quick Start

```python
import scanpy as sc
import squidpy as sq

# Load annotated single-cell data
adata = sc.read_h5ad("tumor_microenvironment.h5ad")
print(f"Data: {adata.shape[0]} cells, {adata.obs['cell_type'].nunique()} cell types")

# Run ligand-receptor analysis with squidpy
sq.gr.ligrec(
    adata,
    cluster_key="cell_type",
    n_perms=1000,             # permutations for significance
    interactions_params={"resources": "consensus"},  # curated LR database
    complex_policy="first",   # how to handle protein complexes
)

# Extract results
lr_results = adata.uns["ligrec"]["test"]
print(f"Significant interactions: {len(lr_results[lr_results['pvalue'] < 0.05])}")
```

## Core Capabilities

### 1. Ligand-Receptor Interaction Scoring

```python
import squidpy as sq
import scanpy as sc
import pandas as pd

adata = sc.read_h5ad("lung_tissue.h5ad")
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)

# Compute mean expression per cell type
sq.gr.ligrec(
    adata,
    n_perms=500,
    cluster_key="cell_type",
    interactions_params={"resources": "cellphonedb"},  # CellPhoneDB database
    complex_policy="min",  # minimum subunit expression for complexes
    seed=42,
)

# Extract significant interactions (FDR < 0.05)
test_res = adata.uns["ligrec"]["test"]
means = adata.uns["ligrec"]["means"]

# Filter significant interactions
significant = test_res[test_res["pvalue"] < 0.05].sort_values("pvalue")
print(f"Significant LR pairs: {len(significant)}")

# Top interactions by mean expression
top_interactions = means.abs().stack().sort_values(ascending=False).head(20)
print("\nTop 20 interactions by mean score:")
for (cluster_a, cluster_b), score in top_interactions.items():
    print(f"  {cluster_a} -> {cluster_b}: {score:.3f}")
```

### 2. Communication Network Visualization

```python
import squidpy as sq
import scanpy as sc
import matplotlib.pyplot as plt
import networkx as nx

# Run ligrec (if not already done)
# sq.gr.ligrec(adata, cluster_key="cell_type", n_perms=500)

# Visualize as a heatmap of interaction counts
sq.pl.ligrec(
    adata,
    cluster_key="cell_type",
    source_groups=["T_cell", "NK_cell"],
    target_groups=["Cancer_cell", "Macrophage"],
    alpha=0.05,
    remove_empty_interactions=True,
    cmap="viridis",
    figsize=(10, 8),
    save="lr_heatmap.png",
)

# Build communication network graph
means = adata.uns["ligrec"]["means"]
G = nx.DiGraph()
for (sender, receiver) in means.columns:
    weight = means[(sender, receiver)].abs().sum()
    if weight > 1.0:  # threshold
        G.add_edge(sender, receiver, weight=weight)

# Draw network
pos = nx.spring_layout(G, k=2, seed=42)
weights = [G[u][v]["weight"] for u, v in G.edges()]
nx.draw_networkx(G, pos, width=[w / max(weights) * 5 for w in weights],
                  node_size=2000, node_color="lightblue",
                  font_size=10, edge_color="gray")
plt.savefig("communication_network.png", dpi=300, bbox_inches="tight")
```

### 3. Integrating RNA Velocity for Dynamic Communication

```python
import scvelo as scv
import scanpy as sc
import squidpy as sq

# Load spliced/unspliced data for velocity
adata = scv.read("velocyto_output.loom")
scv.pp.filter_and_normalize(adata, min_shared_counts=20, n_top_genes=2000)
scv.pp.moments(adata, n_pcs=30, n_neighbors=30)
scv.tl.velocity(adata)
scv.tl.velocity_graph(adata)

# Annotate cell types
sc.tl.leiden(adata, resolution=0.5)
adata.obs["cell_type"] = adata.obs["leiden"].map(
    {"0": "Stem", "1": "Progenitor_A", "2": "Progenitor_B", "3": "Differentiated"}
)

# Identify velocity-weighted signaling: ligands with high splicing velocity
# (actively transcribed) in sender cells
scv.tl.rank_velocity_genes(adata, groupby="cell_type", n_genes=50)

# Find TFs with high velocity in sender cell types
for ct in adata.obs["cell_type"].unique():
    velocity_genes = scv.get_df(adata, "rank_velocity_genes/names")
    top_vel = velocity_genes[ct].dropna().head(10).tolist()
    print(f"{ct} - high velocity genes: {top_vel}")

# Run ligrec on velocity-informed subset
# Focus on pairs where ligand shows active transcription
sq.gr.ligrec(
    adata,
    cluster_key="cell_type",
    n_perms=500,
    interactions_params={"resources": "consensus"},
)
```

## Common Academic Workflow: Tumor Microenvironment Communication Analysis

```python
import scanpy as sc
import squidpy as sq
import pandas as pd

# 1. Load and preprocess tumor single-cell data
adata = sc.read_h5ad("tme_annotated.h5ad")
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=3000)

# 2. Subset to relevant cell types
cell_types_of_interest = ["CD8_T", "CD4_T", "Treg", "Macrophage",
                          "Dendritic", "Cancer", "Fibroblast"]
mask = adata.obs["cell_type"].isin(cell_types_of_interest)
adata_sub = adata[mask].copy()

# 3. Run ligand-receptor analysis
sq.gr.ligrec(
    adata_sub,
    cluster_key="cell_type",
    n_perms=1000,
    interactions_params={"resources": "cellphonedb"},
    seed=42,
)

# 4. Extract and save results
test_res = adata_sub.uns["ligrec"]["test"]
means = adata_sub.uns["ligrec"]["means"]

# Immune evasion interactions (Cancer -> Immune suppressive signaling)
immune_cells = ["CD8_T", "CD4_T", "Treg", "Macrophage"]
immune_evasion = []
for sender in ["Cancer", "Fibroblast"]:
    for receiver in immune_cells:
        sig = test_res[
            (test_res["cluster"].str.startswith(f"{sender}->") |
             test_res["cluster"].str.startswith(f"{receiver}->{sender}"))
            & (test_res["pvalue"] < 0.01)
        ]
        for _, row in sig.iterrows():
            immune_evasion.append({
                "sender": sender,
                "receiver": receiver,
                "interaction": row.name,
                "pvalue": row["pvalue"],
                "mean_score": means.loc[row.name].mean(),
            })

evasion_df = pd.DataFrame(immune_evasion).sort_values("pvalue")
evasion_df.to_csv("immune_evasion_interactions.csv", index=False)
print(f"Found {len(evasion_df)} significant immune-modulatory interactions")
```

## Best Practices

1. Use at least 50-100 cells per cell type for reliable interaction scoring
2. Apply multiple testing correction (FDR) to interaction p-values; use `alpha=0.05` as threshold
3. Use curated interaction databases (CellPhoneDB, consensus) rather than generic co-expression
4. Validate key interactions with spatial transcriptomics or protein-level data (flow cytometry, IHC)
5. Consider complex policy: use `min` for stringent analysis, `first` for exploratory analysis

## Common Pitfalls

1. **Low cell count per cluster**: Interaction scoring is unstable with <30 cells per cell type; merge rare clusters
2. **Doublet contamination**: Cell doublets create false ligand-receptor co-expression; run doublet detection first
3. **Database version**: Different CellPhoneDB/consensus versions have different interaction sets; document the version
4. **Directionality assumption**: L-R analysis assumes ligand from sender binds receptor on receiver; spatial data helps validate

## Integration with HBE

- Use with `references/tools/scanpy.md` for single-cell data preprocessing
- Pair with `references/tools/scvelo.md` for RNA velocity computation
- Combine with `references/tools/networkx.md` for communication network analysis
- Supports `references/tool-registry.md` single-cell biology tool chain

## Resources

- Squidpy Documentation: https://squidpy.readthedocs.io/
- CellPhoneDB: https://www.cellphonedb.org/
- scVelo: https://scvelo.readthedocs.io/
- CellChat (R alternative): https://github.com/sqjin/CellChat
