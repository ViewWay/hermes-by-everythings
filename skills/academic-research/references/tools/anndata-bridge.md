---
name: anndata-bridge
description: AnnData format bridge — convert between AnnData (Python), Seurat (R), and SingleCellExperiment (R) for cross-language single-cell workflows
domain: Biology / Data Format
install: pip install anndata rpy2 scanpy
---

# anndata-bridge — Cross-Platform Single-Cell Data Conversion

Provides patterns for converting single-cell data between Python (AnnData/Scanpy) and R (Seurat/SingleCellExperiment) formats. Essential for leveraging the full ecosystem of single-cell analysis tools across both languages, enabling Python preprocessing with R-based differential expression, trajectory analysis, or visualization.

## When to Use

- Preprocessing single-cell data in Scanpy and transferring to Seurat for downstream analysis
- Using R-specific tools (DESeq2, edgeR, MAST) on Python-preprocessed single-cell data
- Converting published Seurat objects to AnnData for Python-based analysis
- Collaborating across Python and R teams on single-cell projects
- Running SCENIC or other R-only regulatory analysis pipelines on Python data

## Quick Start

```python
import anndata
import scanpy as sc

# Method 1: Native AnnData I/O (h5ad format, cross-language compatible)
adata = sc.read_h5ad("data.h5ad")

# Write in a format R can read
adata.write_h5ad("data_for_r.h5ad")

# In R:
# library(Seurat)
# seu <- ReadH5AD("data_for_r.h5ad")
```

## Core Capabilities

### 1. AnnData to Seurat Conversion via h5ad

```python
import anndata as ad
import scanpy as sc
import subprocess
import json

# --- Python side: prepare and export ---
adata = sc.read_h5ad("pbmc_10k.h5ad")

# Ensure compatible types for R
# R Seurat expects integer counts in adata.raw
if adata.raw is not None:
    adata.raw = adata.raw.to_adata()
    adata.raw.X = adata.raw.X.astype(int)  # Seurat expects raw counts

# Write H5AD (Seurat v5 can read this directly)
adata.write("pbmc_for_seurat.h5ad")

print("File written. In R, run:")
print('  library(Seurat)')
print('  seu <- LoadH5AD("pbmc_for_seurat.h5ad")')
```

```r
# --- R side: read and process ---
library(Seurat)

# Seurat v5: direct h5ad import
seu <- LoadH5AD("pbmc_for_seurat.h5ad")

# Standard Seurat workflow
seu <- NormalizeData(seu)
seu <- FindVariableFeatures(seu)
seu <- ScaleData(seu)
seu <- RunPCA(seu)

# Differential expression with MAST
de_results <- FindMarkers(seu, ident.1 = "CD4_T", ident.2 = "CD8_T",
                           test.use = "MAST")
write.csv(de_results, "de_results_mast.csv")
```

### 2. Seurat to AnnData Conversion

```r
# --- R side: export from Seurat ---
library(Seurat)

# Save as h5ad
SaveH5Seurat(seu, filename = "seurat_object.h5Seurat", overwrite = TRUE)
# Convert using SeuratDisk
library(SeuratDisk)
Convert("seurat_object.h5Seurat", dest = "h5ad", overwrite = TRUE)
```

```python
# --- Python side: import ---
import scanpy as sc

adata = sc.read_h5ad("seurat_object.h5ad")
print(f"Loaded: {adata.shape[0]} cells x {adata.shape[1]} genes")
print(f"Obs columns: {list(adata.obs.columns)}")
print(f"Var columns: {list(adata.var.columns)}")
print(f"Obsm keys: {list(adata.obsm.keys())}")
```

### 3. Using rpy2 for In-Process Conversion

```python
import anndata as ad
import rpy2.robjects as ro
from rpy2.robjects import pandas2ri
import rpy2.rinterface_lib.callbacks
import warnings

# Suppress R warnings in Python
warnings.filterwarnings("ignore")

# Activate automatic pandas conversion
pandas2ri.activate()

# Install and load required R packages
ro.r('if (!requireNamespace("Seurat", quietly = TRUE)) install.packages("Seurat", repos="https://cloud.r-project.org")')
ro.r('library(Seurat)')

def anndata_to_seurat_in_r(adata, r_varname="seu"):
    """Convert AnnData to Seurat object within the same Python process via rpy2."""
    import tempfile
    import os

    # Write temporary h5ad file
    tmp_path = os.path.join(tempfile.gettempdir(), "tmp_bridge.h5ad")
    adata.write_h5ad(tmp_path)

    # Load in R
    ro.r(f'''
    suppressWarnings({{
        library(Seurat)
        {r_varname} <- LoadH5AD("{tmp_path}")
        {r_varname} <- NormalizeData({r_varname})
        {r_varname} <- FindVariableFeatures({r_varname}, nfeatures = 2000)
    }})
    ''')
    return r_varname

def seurat_to_anndata_in_r(r_varname="seu"):
    """Convert Seurat R object back to AnnData."""
    import tempfile
    import os

    tmp_path = os.path.join(tempfile.gettempdir(), "tmp_from_r.h5ad")
    ro.r(f'''
    suppressWarnings({{
        SaveH5Seurat({r_varname}, filename = "{tmp_path.replace('.h5ad', '.h5Seurat')}", overwrite = TRUE)
        library(SeuratDisk)
        Convert("{tmp_path.replace('.h5ad', '.h5Seurat')}", dest = "h5ad", overwrite = TRUE)
    }})
    ''')

    adata = ad.read_h5ad(tmp_path)
    return adata

# Usage
adata = sc.read_h5ad("pbmc_10k.h5ad")
seu_name = anndata_to_seurat_in_r(adata)
# ... run R-based analysis ...
result_adata = seurat_to_anndata_in_r(seu_name)
```

## Common Academic Workflow: Python Preprocessing + R Differential Expression

```python
import scanpy as sc
import subprocess
import os

# 1. Python: preprocess single-cell data
adata = sc.read_10x_mtx("filtered_feature_bc_matrix/")
sc.pp.filter_cells(adata, min_genes=200)
sc.pp.filter_genes(adata, min_cells=3)
sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.highly_variable_genes(adata, n_top_genes=2000)
sc.tl.pca(adata)
sc.pp.neighbors(adata, n_pcs=30)
sc.tl.umap(adata)
sc.tl.leiden(adata, resolution=0.5)

# Save for R
adata.write("preprocessed.h5ad")

# 2. Write R script for DE analysis
r_script = '''
library(Seurat)
library(SeuratObject)

seu <- LoadH5AD("preprocessed.h5ad")
Idents(seu) <- seu$leiden

# MAST differential expression for each cluster
all_markers <- FindAllMarkers(seu, test.use = "MAST", only.pos = TRUE)
write.csv(all_markers, "cluster_markers_mast.csv")

# Save results back
SaveH5Seurat(seu, "seu_with_de.h5Seurat", overwrite = TRUE)
library(SeuratDisk)
Convert("seu_with_de.h5Seurat", dest = "h5ad", overwrite = TRUE)
'''
with open("run_de.R", "w") as f:
    f.write(r_script)

# 3. Execute R script
subprocess.run(["Rscript", "run_de.R"], check=True)

# 4. Read results back in Python
de_results = pd.read_csv("cluster_markers_mast.csv")
print(f"Found {len(de_results)} marker genes across clusters")
```

## Best Practices

1. Always store raw (unnormalized) counts separately (e.g., `adata.layers["counts"]`) before R export
2. Use h5ad format (not loom or mtx) as it is the most compatible across Python and R
3. Ensure gene names use the same convention (e.g., human vs mouse gene symbols) on both sides
4. Keep Python and R package versions documented for reproducibility
5. Use `SeuratDisk` for reliable format conversion rather than manual HDF5 manipulation

## Common Pitfalls

1. **Missing raw counts**: Seurat's `NormalizeData` expects integer raw counts; if only log-normalized data exists, DE tests fail
2. **Factor type mismatch**: Seurat expects categorical metadata as factors; string columns in adata.obs may not convert correctly
3. **rpy2 R_HOME issues**: Set `R_HOME` environment variable if rpy2 cannot find your R installation
4. **H5AD version incompatibility**: Older Seurat versions cannot read h5ad files from newer AnnData; pin versions

## Integration with HBE

- Use with `references/tools/scanpy.md` for Python-side single-cell analysis
- Pair with `references/tools/anndata.md` for AnnData data structure reference
- Combine with `references/tools/scvi-tools.md` for cross-language model integration
- Supports `references/tool-registry.md` single-cell tool chain

## Resources

- AnnData: https://anndata.readthedocs.io/
- Seurat: https://satijalab.org/seurat/
- SeuratDisk: https://github.com/mojaveazure/seurat-disk
- rpy2: https://rpy2.github.io/
