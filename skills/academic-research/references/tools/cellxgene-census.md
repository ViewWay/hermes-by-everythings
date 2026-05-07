---
name: cellxgene-census
description: CZ CELLxGENE Census — query millions of annotated single-cell profiles from the Chan Zuckerberg Initiative cell atlas
domain: biology / single-cell
install: pip install cellxgene-census
---

# cellxgene-census

Programmatic access to the CZ CELLxGENE Census, a cloud-hosted collection of millions of single-cell RNA-seq profiles from human and mouse tissues. Built on TileDB-SOMA for efficient out-of-core querying, it enables filtering by cell type, tissue, disease, gene, and donor without downloading entire datasets.

## When to Use

- Querying large-scale single-cell atlases across tissues, diseases, and species
- Accessing curated, standardized single-cell data without managing raw files
- Filtering cells by metadata (cell type, disease, tissue, donor age) before downloading
- Building benchmark datasets for single-cell ML methods
- Reproducing analyses from published cell atlas studies

## Quick Start

```python
import cellxgene_census

# Open the Census — connects to cloud-hosted TileDB-SOMA collection
with cellxgene_census.open_soma() as census:
    # Get human cells from lung tissue
    adata = census.get_anndata(
        census=census,
        organism="homo_sapiens",
        value_filter="tissue == 'lung' and disease == 'normal'",
        column_names=["cell_type", "tissue", "disease", "donor_id", "sex"],
    )
    print(f"Cells: {adata.n_obs}, Genes: {adata.n_vars}")
    print(f"Cell types: {adata.obs['cell_type'].unique()[:10]}")
```

## Core Capabilities

### 1. Filtering and Querying Cells

```python
import cellxgene_census

with cellxgene_census.open_soma() as census:
    # Query specific cells with value_filter (SQL-like syntax)
    adata = census.get_anndata(
        census=census,
        organism="homo_sapiens",
        value_filter=(
            "tissue == 'blood' and "
            "cell_type in ['CD4-positive alpha-beta T cell', 'B cell', 'monocyte'] and "
            "disease == 'COVID-19'"
        ),
        column_names=[
            "cell_type", "tissue", "disease", "donor_id",
            "sex", "suspension_type", "assay"
        ],
    )
    print(f"COVID-19 immune cells: {adata.n_obs:,}")

    # Count cells matching a filter without downloading data
    census_counts = cellxgene_census.get_cell_counts(
        census=census,
        organism="homo_sapiens",
        value_filter="cell_type == 'microglial cell'",
    )
    print(census_counts)
```

### 2. Gene-Specific Queries and Feature Selection

```python
import cellxgene_census

with cellxgene_census.open_soma() as census:
    # Query specific genes only (saves bandwidth and memory)
    adata = census.get_anndata(
        census=census,
        organism="homo_sapiens",
        value_filter="tissue == 'brain'",
        var_value_filter="feature_name in ['GFAP', 'AQP4', 'MBP', 'SNAP25']",
        column_names=["cell_type", "tissue"],
    )
    print(f"Genes in matrix: {adata.var_names.tolist()}")

    # Explore available cell types and tissues
    obs = census["census_data"]["homo_sapiens"].obs.read().concat().to_pandas()
    print("Available tissues:", obs["tissue"].unique()[:20])
    print("Available diseases:", obs["disease"].unique()[:20])
    print("Available cell types:", obs["cell_type"].unique()[:20])
```

### 3. Mouse Data and Cross-Species Queries

```python
import cellxgene_census

with cellxgene_census.open_soma() as census:
    # Mouse brain cells
    mouse_adata = census.get_anndata(
        census=census,
        organism="mus_musculus",
        value_filter="tissue == 'brain' and disease == 'normal'",
        column_names=["cell_type", "tissue", "disease", "development_stage"],
    )
    print(f"Mouse brain cells: {mouse_adata.n_obs:,}")

    # Explore available datasets (census metadata)
    datasets = census["census_info"]["datasets"].read().concat().to_pandas()
    print(f"Total datasets: {len(datasets)}")
    print(datasets[["collection_name", "cell_count", "organism"]].head(10))
```

## Common Academic Workflow: Cross-Tissue Cell Type Atlas Query

```python
import cellxgene_census
import scanpy as sc

# 1. Query cells across multiple tissues
with cellxgene_census.open_soma() as census:
    adata = census.get_anndata(
        census=census,
        organism="homo_sapiens",
        value_filter=(
            "tissue in ['lung', 'blood', 'brain'] and "
            "disease == 'normal'"
        ),
        column_names=["cell_type", "tissue", "donor_id", "sex", "assay"],
    )

# 2. Standard preprocessing
sc.pp.filter_genes(adata, min_cells=10)
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
sc.tl.pca(adata)
sc.pp.neighbors(adata, n_neighbors=15)
sc.tl.umap(adata)

# 3. Visualize by tissue and cell type
sc.pl.umap(adata, color=["tissue", "cell_type"], legend_loc="on data")

# 4. Save for downstream analysis
adata.write_h5ad("cross_tissue_atlas.h5ad")
```

## Best Practices

1. **Use var_value_filter for gene selection** — Downloading all 60,000+ genes is expensive; specify only the genes you need
2. **Limit query scope** — Use tissue and disease filters to avoid downloading millions of cells at once
3. **Check data versions** — The Census is updated regularly. Use `cellxgene_census.get_census_version()` for reproducibility
4. **Cache locally for repeated use** — Downloaded AnnData objects can be saved to disk with `adata.write_h5ad()` to avoid repeated queries

## Common Pitfalls

- **Large queries can exhaust memory** — Querying all human cells returns billions of data points. Always filter by tissue/disease/cell_type first.
- **Value filter syntax** — Filters use SOMA/SQL syntax. Use single quotes for strings: `tissue == 'lung'`, not `tissue == "lung"`.
- **Gene name vs Ensembl ID** — The Census uses Ensembl gene IDs internally. Use `feature_name` column in `var_value_filter` to filter by gene symbol.
- **Census version drift** — Results may differ between Census releases. Pin the version in methods sections for reproducibility.

## Integration with HBE

- Use with `/hbe-plan` for designing single-cell study designs with atlas-level data
- Pair with `references/tools/scanpy.md` for downstream analysis and visualization
- Combine with `references/tools/scirpy.md` for paired TCR/BCR analysis
- See `references/tools/anndata.md` for data structure management

## Resources

- Documentation: https://cellxgene-census.readthedocs.io/
- Explorer: https://cellxgene.cziscience.com/
- Census API reference: https://cellxgene-census.readthedocs.io/en/latest/api.html
- Paper: The CZ CELLxGENE Census. Nature Methods (2024).
