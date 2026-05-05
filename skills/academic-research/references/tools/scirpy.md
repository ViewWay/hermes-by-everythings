---
name: scirpy
description: Single-cell immune receptor analysis — TCR/BCR sequencing with scanpy integration for clonotype and repertoire analysis
domain: biology / immunology
install: pip install scirpy
---

# scirpy

Analysis of single-cell immune receptor repertoires (AIRR). Integrates with scanpy to analyze T-cell receptor (TCR) and B-cell receptor (BCR) sequences from 10x Genomics, AIRR-seq, and other single-cell platforms. Provides clonotype definition, repertoire overlap, diversity metrics, and network visualization.

## When to Use

- Analyzing TCR/BCR sequences paired with single-cell transcriptomics
- Defining clonotypes and clonal expansion from single-cell immune data
- Comparing immune repertoires across conditions, tissues, or timepoints
- Visualizing clonotype networks overlaid on cell type annotations
- Computing repertoire diversity metrics (Shannon, Simpson, clonality)

## Quick Start

```python
import scanpy as sc
import scirpy as ir

# Load 10x Genomics immune profiling data
adata = sc.read_10x_h5("filtered_feature_bc_matrix.h5")

# Define IR sequences from 10x annotations
ir.pp.ir_dist(adata, metric="alignment", sequence="aa", cutoff=15)
ir.tl.define_clonotypes(adata, receptor_arms="all", dual_ir="primary_only")

# Quality control on chain pairing
ir.tl.chain_qc(adata)
print(adata.obs["chain_qc"].value_counts())

# Visualize clonotype network
ir.pl.clonotype_network(adata, color="clone_id", base_size=20, size=3)
sc.pl.umap(adata, color="clone_id")
```

## Core Capabilities

### 1. Chain Quality Control and Receptor Definition

```python
import scirpy as ir

# Define immune receptor sequences from 10x VDJ annotations
# Automatically detects VJ chains (TCR alpha/beta, BCR heavy/light)
ir.pp.ir_dist(adata, metric="alignment", sequence="aa", cutoff=15)

# Chain QC — classify cells by chain pairing status
ir.tl.chain_qc(adata)
# Categories: 'single pair', 'orphan VJ', 'orphan VDJ', 'no IR', 'multi chain'

# Filter to keep only cells with paired receptors
adata = adata[adata.obs["chain_qc"] == "single pair"].copy()

# Inspect chain usage
print(adata.obs["receptor_subtype"].value_counts())
# e.g. TRA_TRB (alpha-beta T cells), IGH_IGK (B cells with kappa light chain)
```

### 2. Clonotype Definition and Analysis

```python
import scirpy as ir

# Define clonotypes based on CDR3 amino acid similarity
# cutoff=15 means up to 15 mismatches (Levenshtein distance)
ir.pp.ir_dist(adata, metric="alignment", sequence="aa", cutoff=15)
ir.tl.define_clonotypes(
    adata,
    receptor_arms="all",       # Consider both VJ and VDJ
    dual_ir="primary_only",    # Only primary receptor
    same_v_gene=True           # Require same V gene for clonotype grouping
)

# Clonotype size distribution
print(adata.obs["clone_id"].value_counts().head(10))

# Identify expanded clonotypes (size > 1)
expanded = adata.obs["clone_id"].value_counts()
expanded_clones = expanded[expanded > 1].index
adata.obs["is_expanded"] = adata.obs["clone_id"].isin(expanded_clones)

# Clonal expansion per sample
ir.tl.clonal_expansion(adata)
sc.pl.umap(adata, color="clonal_expansion")
```

### 3. Repertoire Overlap and Diversity Metrics

```python
import scirpy as ir

# Compare clonotype sharing between groups (e.g., tumor vs blood)
ir.tl.repertoire_overlap(adata, groupby="tissue", metric="jaccard")
ir.pl.repertoire_overlap(adata, groupby="tissue", metric="jaccard")

# Compute diversity metrics per sample
ir.tl.diversity(adata, groupby="patient_id", metric="shannon")
ir.pl.diversity(adata, groupby="patient_id", metric="shannon")

# Clonotype network visualization — nodes are cells, edges connect cells in same clonotype
ir.tl.clonotype_network(adata, min_size=3)
ir.pl.clonotype_network(
    adata,
    color="cell_type",
    base_size=15,
    size="clone_size",
    panel="first"
)
```

## Common Academic Workflow: Tumor-Infiltrating Lymphocyte Repertoire Analysis

```python
import scanpy as sc
import scirpy as ir

# 1. Load and preprocess single-cell data with immune receptors
adata = sc.read_h5ad("tumor_til.h5ad")
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.highly_variable_genes(adata)
sc.tl.umap(adata)

# 2. Define clonotypes
ir.pp.ir_dist(adata, metric="alignment", sequence="aa", cutoff=15)
ir.tl.define_clonotypes(adata, receptor_arms="all", dual_ir="primary_only")

# 3. Quality control on chain pairing
ir.tl.chain_qc(adata)
adata = adata[adata.obs["chain_qc"].isin(["single pair", "multi chain"])].copy()

# 4. Annotate clonal expansion
ir.tl.clonal_expansion(adata)

# 5. Compare repertoire between tumor and adjacent normal
ir.tl.repertoire_overlap(adata, groupby="sample_type", metric="jaccard")
ir.pl.repertoire_overlap(adata, groupby="sample_type", metric="jaccard")

# 6. Visualize expanded clonotypes on UMAP colored by cell type
ir.pl.clonotype_network(adata, color="cell_type", size="clone_size")
sc.pl.umap(adata, color=["clone_id", "clonal_expansion", "cell_type"])

# 7. Export clonotype table
adata.obs[["clone_id", "clonal_expansion", "cell_type"]].to_csv("clonotype_table.csv")
```

## Best Practices

1. **Run chain QC early** — Filter out orphan chains and cells without valid receptor pairs before downstream analysis
2. **Choose appropriate distance metric** — Use `alignment` (Levenshtein on CDR3) for exploratory analysis; `identity` for exact matching
3. **Consider dual receptor expression** — T cells can express two alpha chains; use `dual_ir="any"` if dual receptors are biologically relevant
4. **Integrate with transcriptomics** — Always overlay clonotype information on UMAP colored by cell type markers for biological interpretation

## Common Pitfalls

- **Missing IR annotations**: scirpy requires immune receptor annotations in specific formats (10x VDJ, Change-O, AIRR). Use `ir.io.read_10x_vdj()` or `ir.io.read_airr()` to load properly.
- **Wrong sequence type**: Using nucleotide (`nt`) instead of amino acid (`aa`) for distance calculation leads to overly conservative clonotype definitions.
- **Too strict cutoff**: A cutoff of 0 (exact match) misses biologically related clones; 10-15 is typical for CDR3 amino acid alignment.
- **Confusing clonotype IDs**: Clone IDs are arbitrary labels and change between runs; use clonotype size or network properties for reproducible comparisons.

## Integration with HBE

- Use with `/hbe:plan` for designing immune repertoire analysis studies
- Pair with `references/tools/scanpy.md` for single-cell transcriptomics preprocessing
- Combine with `references/tools/anndata.md` for data structure management
- See `references/tools/scvelo.md` for combining repertoire analysis with RNA velocity

## Resources

- Documentation: https://scirpy.readthedocs.io/
- GitHub: https://github.com/scverse/scirpy
- Tutorial: https://scirpy.readthedocs.io/en/stable/tutorials.html
- Paper: Sturm, G. et al. (2020). scirpy: a Scanpy extension for analyzing single-cell T-cell receptor/BCR sequencing data. Bioinformatics, 37(7), 1012-1014.
