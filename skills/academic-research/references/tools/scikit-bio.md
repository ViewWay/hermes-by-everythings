---
name: scikit-bio
description: Bioinformatics library for biological data analysis — sequence alignment, diversity metrics, phylogenetics, and ordination
domain: Biology / Bioinformatics
install: pip install scikit-bio
---

# scikit-bio — Bioinformatics Data Analysis / 生物信息学数据分析

scikit-bio provides tools for biological sequence analysis, diversity calculations, phylogenetics, ordination methods, and biological data I/O. Widely used in microbiome and ecology research.

## When to Use / 适用场景

- Microbiome diversity analysis (alpha/beta diversity)
- Sequence alignment and manipulation
- Biological distance/dissimilarity calculations (UniFrac, Bray-Curtis)
- Ordination methods (PCoA, NMDS, RDA, CCA)
- Reading biological file formats (FASTA, BIOM, distance matrices)

## Quick Start / 快速开始

```python
import skbio

# Sequence operations
seq = skbio.DNA("ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG")
rc = seq.reverse_complement()
gc = seq.gc_content()

# Calculate UniFrac distance
from skbio import TreeNode, DistanceMatrix
# Requires phylogenetic tree + OTU table

# Principal Coordinates Analysis
from skbio.stats.ordination import pcoa
pc = pcoa(distance_matrix)
print(pc.proportion_explained[:5])  # % variance by each axis
```

## Core Capabilities / 核心能力

### 1. Sequence Analysis / 序列分析

```python
import skbio

# DNA sequence operations
dna = skbio.DNA("ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG")
print(f"GC content: {dna.gc_content():.3f}")
print(f"Length: {len(dna)}")
print(f"Complement: {dna.complement()}")

# Find motifs
for match in dna.find_with_regex("(GC){3,}"):
    print(f"GC-rich region at {match}")

# K-mer counting
kmers = dna.iter_kmers(k=6)
from collections import Counter
kmer_counts = Counter(kmers)

# Alignment
from skbio.alignment import global_pairwise_align_nucleotide
alignment, score, start_end = global_pairwise_align_nucleotide(
    skbio.DNA("ATGGCCATT"), skbio.DNA("ATGGCCATTGTA")
)
```

### 2. Diversity Metrics / 多样性指标

```python
from skbio.diversity import alpha_diversity, beta_diversity
import numpy as np

# Alpha diversity (within-sample)
otu_table = np.array([[10, 5, 3, 0, 1],
                       [8, 0, 0, 5, 2],
                       [15, 3, 2, 0, 0]])
ids = ["sample1", "sample2", "sample3"]

# Shannon, Simpson, Observed OTUs, etc.
shannon = alpha_diversity("shannon", otu_table, ids)
simpson = alpha_diversity("simpson", otu_table, ids)
observed = alpha_diversity("observed_otus", otu_table, ids)

# Faith's PD (phylogenetic diversity — requires tree)
# faith_pd = alpha_diversity("faith_pd", otu_table, ids, tree=tree, otu_ids=otu_ids)

# Beta diversity (between-sample)
bc_dm = beta_diversity("braycurtis", otu_table, ids)
print(bc_dm)  # DistanceMatrix object
```

### 3. Ordination Methods / 排序方法

```python
from skbio.stats.ordination import pcoa, ca, rda, cca
from skbio import DistanceMatrix

# Principal Coordinates Analysis
dm = DistanceMatrix([[0, 0.3, 0.5],
                      [0.3, 0, 0.4],
                      [0.5, 0.4, 0]], ids=["s1", "s2", "s3"])
pc = pcoa(dm)
print(pc.samples)  # PC1, PC2, ... coordinates
print(pc.proportion_explained)

# Redundancy Analysis (RDA)
# pc = rda(y_matrix, x_matrix, ...)
# Canonical Correspondence Analysis (CCA)
# pc = cca(y_matrix, x_matrix, ...)
```

### 4. File I/O / 文件读写

```python
import skbio

# Read FASTA
for seq in skbio.io.read("sequences.fasta", format="fasta"):
    print(seq.metadata["id"], len(seq))

# Read BIOM table
from biom import load_table
bt = load_table("otu_table.biom")

# Read Newick tree
tree = skbio.TreeNode.read("tree.nwk", format="newick")
print(tree.count())
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Microbiome Diversity Analysis / 微生物组多样性分析

```python
import numpy as np
import pandas as pd
from skbio.diversity import alpha_diversity, beta_diversity
from skbio.stats.ordination import pcoa
from skbio import DistanceMatrix
import matplotlib.pyplot as plt

# OTU table (samples × OTUs)
otu_df = pd.read_csv("otu_table.csv", index_col=0)

# Alpha diversity
alpha_shannon = alpha_diversity("shannon", otu_df.values, ids=otu_df.index.tolist())
alpha_observed = alpha_diversity("observed_otus", otu_df.values, ids=otu_df.index.tolist())

# Beta diversity (Bray-Curtis)
bc_dm = beta_diversity("braycurtis", otu_df.values, ids=otu_df.index.tolist())

# PCoA
pc = pcoa(bc_dm)

# Plot
metadata = pd.read_csv("metadata.csv", index_col=0)
coords = pc.samples[["PC1", "PC2"]].copy()
coords["group"] = metadata.loc[coords.index, "group"]

fig, ax = plt.subplots(figsize=(8, 6))
for group in coords["group"].unique():
    mask = coords["group"] == group
    ax.scatter(coords.loc[mask, "PC1"], coords.loc[mask, "PC2"], label=group, s=30)
ax.set_xlabel(f"PC1 ({pc.proportion_explained['PC1']*100:.1f}%)")
ax.set_ylabel(f"PC2 ({pc.proportion_explained['PC2']*100:.1f}%)")
ax.legend()
plt.savefig("pcoa_plot.pdf", bbox_inches="tight")
```

## Best Practices / 最佳实践

- Rarefy OTU tables to even depth before diversity comparisons
- Report both alpha and beta diversity with multiple metrics
- Use PERMANOVA (`skbio.stats.distance.permanova`) for group comparisons of beta diversity
- Report ordination proportion explained for each axis

## Common Pitfalls / 常见陷阱

- **Unequal sampling depth**: Raw OTU counts inflate diversity in deeper samples; rarefy first
- **UniFrac requires tree**: Weighted/unweighted UniFroc need a phylogenetic tree + OTU-to-tip mapping
- **Distance matrix symmetry**: Ensure symmetric matrices for PCoA
- **Zero-inflation**: Many microbiome metrics handle zeros differently; verify metric behavior

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/pandas.md` for OTU table manipulation
- Use with `references/tools/matplotlib.md` for PCoA and diversity plots
- Combine with `references/tools/scipy.md` for PERMANOVA and statistical tests
- Integrate with `workflows/experiment-design.md` for microbiome study design

## Resources / 资源

- Documentation: https://scikit-bio.org/
- QIIME 2: https://qiime2.org/ (uses scikit-bio internally)
- Paper: Phylogenetic and ecological alpha diversity metrics
