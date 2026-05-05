---
name: depmap
description: Cancer Dependency Map data access — cell line characterization, gene essentiality, and drug sensitivity
domain: Biology / Cancer Research
install: pip install depmap  # or download data directly from depmap.org
---

# depmap — Cancer Dependency Map Data Access

The Cancer Dependency Map (DepMap) is a comprehensive resource from the Broad Institute that provides genome-scale CRISPR loss-of-function screens, small-molecule drug sensitivity data, and multi-omics characterizations across thousands of cancer cell lines. It is essential for identifying cancer dependencies and drug targets.

## When to Use

- Identifying genes essential for cancer cell survival (synthetic lethality, oncogene addiction)
- Correlating gene dependencies with genomic features (mutations, copy number, expression)
- Finding drug sensitivity patterns across cell line panels
- Discovering biomarkers of drug response or resistance
- Building predictive models of cancer cell vulnerability

## Quick Start

```python
import pandas as pd

# Download data from https://depmap.org/portal/download/ (requires free registration)
# Key files:
#   - Achilles_gene_effect.csv   — CRISPR gene effect scores (lower = more essential)
#   - Achilles_dependency.csv    — Binary dependency calls (gene essential or not)
#   - CTRP_viability_AUC.csv     — Drug sensitivity AUC values
#   - CCLE_depMap_23Q2_sample_info.csv — Cell line metadata

# Load CRISPR gene effect scores
gene_effect = pd.read_csv("Achilles_gene_effect.csv", index_col=0)
print(f"Cell lines: {gene_effect.shape[0]}, Genes: {gene_effect.shape[1]}")

# Load cell line metadata
metadata = pd.read_csv("CCLE_depMap_23Q2_sample_info.csv")
print(f"Metadata columns: {metadata.columns.tolist()[:10]}")

# Check if a gene is essential in a specific cell line
cell_line = "ACH-000001"  # or use DepMap ID
gene = "BRCA1"
if gene in gene_effect.columns and cell_line in gene_effect.index:
    score = gene_effect.loc[cell_line, gene]
    print(f"{gene} effect in {cell_line}: {score:.3f} (< -0.5 = essential)")
```

## Core Capabilities

### CRISPR Gene Dependency Analysis

```python
import pandas as pd
import numpy as np

gene_effect = pd.read_csv("Achilles_gene_effect.csv", index_col=0)
metadata = pd.read_csv("CCLE_depMap_23Q2_sample_info.csv").set_index("DepMap_ID")

# Find genes that are broadly essential across all cell lines
broadly_essential = gene_effect.median().sort_values()
print("Top 10 most broadly essential genes:")
print(broadly_essential.head(10))

# Find selective dependencies in a specific cancer type
lung_lines = metadata[metadata["primary_disease"] == "Lung Cancer"].index
lung_gene_effect = gene_effect.loc[gene_effect.index.intersection(lung_lines)]
selective_essential = (gene_effect.median() - lung_gene_effect.median()).sort_values(ascending=False)
print("\nGenes selectively essential in lung cancer:")
print(selective_essential.head(10))

# Get dependency calls (binary: essential or not)
dependency = pd.read_csv("Achilles_dependency.csv", index_col=0)
essential_in_lung = dependency.loc[lung_lines].sum().sort_values(ascending=False)
print(f"\nGenes essential in >50% of lung lines: {(essential_in_lung > len(lung_lines) * 0.5).sum()}")
```

### Drug Sensitivity Analysis

```python
import pandas as pd
import numpy as np

# Load drug sensitivity data (CTRP or GDSC)
drug_sensitivity = pd.read_csv("CTRP_viability_AUC.csv", index_col=0)
# Lower AUC = more sensitive to drug

# Most effective drugs across all cell lines
most_effective = drug_sensitivity.median().sort_values()
print("Top 5 most potent drugs (lowest median AUC):")
print(most_effective.head(5))

# Find sensitive cell lines for a specific drug
drug = "Trametinib"
sensitive_lines = drug_sensitivity[drug].sort_values().head(20)
print(f"\nMost sensitive to {drug}:")
print(sensitive_lines)

# Correlate drug sensitivity with gene dependency
gene = "MEK1"
correlations = drug_sensitivity.corrwith(gene_effect[gene])
top_correlated = correlations.abs().sort_values(ascending=False).head(10)
print(f"\nDrugs most correlated with {gene} dependency:")
print(top_correlated)
```

### Correlating Dependencies with Genomic Features

```python
import pandas as pd
import scipy.stats as stats

gene_effect = pd.read_csv("Achilles_gene_effect.csv", index_col=0)
mutations = pd.read_csv("CCLE_mutations.csv", index_col=0)  # binary mutation matrix

# Gene: KRAS mutation vs. dependency on MAPK pathway genes
mapk_genes = ["MAP2K1", "MAP2K2", "MAPK1", "ERBB2"]
kras_mutated = mutations["KRAS"]

for gene in mapk_genes:
    if gene in gene_effect.columns:
        effect_kras = gene_effect.loc[kras_mutated == 1, gene].dropna()
        effect_wt = gene_effect.loc[kras_mutated == 0, gene].dropna()
        stat, pval = stats.mannwhitneyu(effect_kras, effect_wt, alternative="less")
        print(f"{gene}: KRAS-mut mean={effect_kras.mean():.2f}, WT mean={effect_wt.mean():.2f}, p={pval:.2e}")
```

## Common Academic Workflow: Identify Cancer-Type-Specific Dependencies

```python
import pandas as pd
import numpy as np
import scipy.stats as stats
import matplotlib.pyplot as plt

# 1. Load data
gene_effect = pd.read_csv("Achilles_gene_effect.csv", index_col=0)
metadata = pd.read_csv("CCLE_depMap_23Q2_sample_info.csv").set_index("DepMap_ID")

# 2. Define cancer type groups
cancer_types = metadata["primary_disease"].value_counts()
target_types = cancer_types[cancer_types >= 50].index.tolist()  # at least 50 lines

# 3. Find selective dependencies for each cancer type
results = []
for cancer_type in target_types:
    lines = metadata[metadata["primary_disease"] == cancer_type].index
    other_lines = metadata[metadata["primary_disease"] != cancer_type].index
    target_lines = gene_effect.index.intersection(lines)
    other_effective = gene_effect.index.intersection(other_lines)

    if len(target_lines) < 20:
        continue

    target_scores = gene_effect.loc[target_lines]
    other_scores = gene_effect.loc[other_effective]

    # Wilcoxon rank-sum test for each gene
    for gene in gene_effect.columns:
        t_vals = target_scores[gene].dropna()
        o_vals = other_scores[gene].dropna()
        if len(t_vals) < 10:
            continue
        stat, pval = stats.ranksums(t_vals, o_vals)
        results.append({
            "cancer_type": cancer_type,
            "gene": gene,
            "target_mean": t_vals.mean(),
            "other_mean": o_vals.mean(),
            "diff": o_vals.mean() - t_vals.mean(),
            "p_value": pval,
            "n_lines": len(target_lines),
        })

# 4. Multiple hypothesis correction and ranking
results_df = pd.DataFrame(results)
results_df["fdr"] = stats.false_discovery_rate(results_df["p_value"]) if hasattr(stats, 'false_discovery_rate') else \
    pd.Series(stats.false_discovery_rate(results_df["p_value"]) if hasattr(stats, 'false_discovery_rate') else
              [min(1, p * len(results_df) / (np.arange(len(results_df)) + 1)) for p in results_df["p_value"].sort_values().values]
              ).values

# Use multipletests from statsmodels for proper FDR
from statsmodels.stats.multitest import multipletests
_, results_df["fdr"], _, _ = multipletests(results_df["p_value"], method="fdr_bh")

top_hits = results_df[results_df["fdr"] < 0.01].sort_values("diff", ascending=False).head(50)
print(f"Top selective dependencies (FDR < 1%):")
print(top_hits[["cancer_type", "gene", "diff", "fdr", "n_lines"]].to_string())
```

## Best Practices

- **Use DepMap IDs** (e.g., ACH-000001) as canonical identifiers — they are stable across releases.
- **Report the data release version** (e.g., 23Q2) in your methods section for reproducibility.
- **Apply FDR correction** when testing many genes or cell lines — control for multiple comparisons.
- **Cross-reference with CCLE expression data** to ensure the gene is expressed in the cell lines where it appears essential.
- **Validate hits experimentally** — computational predictions should be confirmed with follow-up experiments.

## Common Pitfalls

- **Copy number artifacts**: CRISPR screens in regions of high copy number can produce false-positive dependencies. Use CERES-corrected scores.
- **Lineage effects**: Some genes are essential in all cell lines of a particular lineage (e.g., B-cell genes in lymphoma). Filter for lineage-specific effects.
- **Batch effects**: Different DepMap releases may have batch effects. Use consistent versions within a study.
- **Gene name mismatches**: DepMap uses HGNC gene symbols. Ensure consistent naming when merging with other datasets.

## Integration with HBE

- Use within `workflows/experiment-design.md` for cancer biology study design
- Pair with `references/tools/pandas.md` for large-scale data manipulation and filtering
- Combine with `references/tools/matplotlib.md` for dependency heatmaps and volcano plots
- Use alongside `references/tools/scipy.md` for statistical testing and FDR correction

## Resources

- Portal: https://depmap.org/portal/
- Download: https://depmap.org/portal/download/
- Publication: Tsherniak et al., "Defining a Cancer Dependency Map" (Cell, 2017)
- API docs: https://depmap.org/portal/api/
