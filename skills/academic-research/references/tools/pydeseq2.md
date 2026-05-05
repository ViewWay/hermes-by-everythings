---
name: pydeseq2
description: Python implementation of DESeq2 for differential gene expression analysis using negative binomial GLMs
domain: Biology / Transcriptomics
install: pip install pydeseq2
---

# PyDESeq2 — Differential Expression Analysis / 差异表达分析

PyDESeq2 is a Python reimplementation of DESeq2 for bulk RNA-seq differential expression analysis. It fits negative binomial generalized linear models and uses Wald tests for significance.

## When to Use / 适用场景

- Differential gene expression from bulk RNA-seq count data
- Comparing gene expression between conditions (treatment vs control)
- Controlling for covariates (batch, age, sex) in DE analysis
- Any bulk RNA-seq or count-based differential analysis

## Quick Start / 快速开始

```python
import pandas as pd
from pydeseq2.DeseqDataSet import DeseqDataSet
from pydeseq2.DeseqStats import DeseqStats

# Count matrix: genes × samples
counts = pd.read_csv("counts_matrix.csv", index_col=0)
# Sample metadata
metadata = pd.read_csv("sample_metadata.csv", index_col=0)

# Create DESeq2 dataset
dds = DeseqDataSet(counts=counts, metadata=metadata, design_factors="condition")
dds.deseq2()  # Run DESeq2 pipeline

# Get results
stat_res = DeseqStats(dds, contrast=["condition", "treated", "control"])
stat_res.summary()
stat_res.results_df  # DataFrame with log2FC, pvalue, padj
```

## Core Capabilities / 核心能力

### 1. Standard Differential Expression / 标准差异表达

```python
from pydeseq2.DeseqDataSet import DeseqDataSet
from pydeseq2.DeseqStats import DeseqStats
import pandas as pd

# Prepare data
counts = pd.read_csv("counts.csv", index_col=0)  # Genes × Samples
metadata = pd.read_csv("metadata.csv", index_col=0)  # Samples × Covariates

# Filter low-count genes
genes_to_keep = counts.columns[counts.sum(axis=0) >= 10]
counts = counts[genes_to_keep]

# Run DESeq2
dds = DeseqDataSet(counts=counts, metadata=metadata, design_factors="condition")
dds.deseq2()

# Get results for specific contrast
stats = DeseqStats(dds, contrast=["condition", "treated", "control"])
stats.summary()

# Access results
results = stats.results_df
# Columns: baseMean, log2FoldChange, lfcSE, stat, pvalue, padj

# Filter significant genes
sig = results[(results["padj"] < 0.05) & (abs(results["log2FoldChange"]) > 1)]
```

### 2. Multi-Factor Designs / 多因素设计

```python
# Control for batch effects
dds = DeseqDataSet(
    counts=counts,
    metadata=metadata,
    design_factors=["batch", "condition"]  # batch as covariate
)
dds.deseq2()

# Interaction terms
dds = DeseqDataSet(
    counts=counts,
    metadata=metadata,
    design_factors=["genotype", "treatment", "genotype:treatment"]
)
```

### 3. LFC Shrinkage / LFC 收缩

```python
# Shrink log2 fold changes for plotting and ranking
stats = DeseqStats(dds, contrast=["condition", "treated", "control"])
stats.summary()
stats.lfc_shrink(coeff="condition_treated_vs_control")

# Shrinkage produces more accurate effect sizes for low-count genes
shrink_results = stats.results_df
```

### 4. Variance Stabilizing Transformation / 方差稳定变换

```python
# For downstream analyses (clustering, PCA)
import numpy as np

# Get normalized counts
dds = DeseqDataSet(counts=counts, metadata=metadata, design_factors="condition")
dds.deseq2()

# Size factors (for normalization)
size_factors = dds.obsm["size_factors"]
normalized = counts.div(size_factors, axis=1)
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Complete DE Pipeline with Volcano Plot / 完整 DE 流程含火山图

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from pydeseq2.DeseqDataSet import DeseqDataSet
from pydeseq2.DeseqStats import DeseqStats

# Load and filter
counts = pd.read_csv("counts.csv", index_col=0).T  # Samples × Genes → transpose if needed
metadata = pd.read_csv("metadata.csv", index_col=0)

# Keep genes with ≥10 total counts
counts = counts.loc[:, counts.sum(axis=0) >= 10]

# Run DESeq2
dds = DeseqDataSet(counts=counts, metadata=metadata, design_factors="condition")
dds.deseq2()
stats = DeseqStats(dds, contrast=["condition", "treated", "control"])
stats.summary()
stats.lfc_shrink(coeff="condition_treated_vs_control")

# Volcano plot
results = stats.results_df
results["significant"] = (results["padj"] < 0.05) & (abs(results["log2FoldChange"]) > 1)

fig, ax = plt.subplots(figsize=(8, 6))
colors = np.where(results["significant"], "red", "gray")
ax.scatter(results["log2FoldChange"], -np.log10(results["padj"]), c=colors, s=5, alpha=0.5)
ax.axhline(-np.log10(0.05), ls="--", c="black", lw=0.5)
ax.axvline(-1, ls="--", c="blue", lw=0.5)
ax.axvline(1, ls="--", c="blue", lw=0.5)
ax.set_xlabel("log2 Fold Change")
ax.set_ylabel("-log10(padj)")
ax.set_title("Volcano Plot: Treated vs Control")
plt.savefig("volcano.pdf", bbox_inches="tight")

# Export significant genes
sig_genes = results[results["significant"]].sort_values("padj")
sig_genes.to_csv("differentially_expressed_genes.csv")
```

### Workflow 2: Multi-Condition Comparison / 多条件比较

```python
import pandas as pd
from pydeseq2.DeseqDataSet import DeseqDataSet
from pydeseq2.DeseqStats import DeseqStats

dds = DeseqDataSet(counts=counts, metadata=metadata, design_factors="condition")
dds.deseq2()

# Pairwise comparisons
comparisons = [("treated_A", "control"), ("treated_B", "control"), ("treated_B", "treated_A")]
all_results = {}

for cond1, cond2 in comparisons:
    try:
        stats = DeseqStats(dds, contrast=["condition", cond1, cond2])
        stats.summary()
        all_results[f"{cond1}_vs_{cond2}"] = stats.results_df
    except Exception as e:
        print(f"Failed {cond1} vs {cond2}: {e}")
```

## Key Parameters / 关键参数

| Parameter | Context | Typical Values |
|-----------|---------|----------------|
| `design_factors` | Experimental design | "condition" or ["batch", "condition"] |
| `contrast` | Comparison | ["col", "treatment", "reference"] |
| `alpha` | Significance threshold | 0.05 (default) |
| `min_counts` | Gene filter | ≥10 total across all samples |
| `lfc_threshold` | Biological significance | |log2FC| > 1 |

## Best Practices / 最佳实践

- Filter low-count genes (total count < 10) before running DESeq2
- Use raw counts (not normalized) as input — DESeq2 handles normalization internally
- Include batch or covariates in `design_factors` to control confounders
- Apply LFC shrinkage before ranking genes by effect size
- Report both padj and log2FC thresholds for significance

## Common Pitfalls / 常见陷阱

- **Normalized input**: DESeq2 expects raw counts; providing TPM/FPKM causes incorrect dispersion estimates
- **Gene filtering**: Too stringent filtering removes real DE genes; too lenient inflates multiple testing burden
- **Sample size**: DESeq2 performs poorly with <3 samples per group; use ≥3 biological replicates
- **Count matrix orientation**: Verify genes are columns and samples are rows (or use appropriate orientation)

## Integration with HBE / 与 HBE 集成

- Use with `references/tools/scanpy.md` for single-cell vs bulk RNA-seq workflows
- Pair with `references/tools/matplotlib.md` for volcano plots and MA plots
- Combine with `references/tools/pandas.md` for result table manipulation
- Integrate with `references/tools/scipy.md` for post-hoc statistical tests

## Resources / 资源

- Documentation: https://pydeseq2.readthedocs.io/
- Original DESeq2 paper: Love et al., Genome Biology 2014
- Tutorial: https://pydeseq2.readthedocs.io/en/latest/auto_examples/
