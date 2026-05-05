---
name: phylogenetics
description: Phylogenetic analysis toolkit — tree building, model selection, bootstrap, and divergence estimation
domain: Biology / Evolution
install: pip install biopython dendropy ete3  # No single "phylogenetics" package; use ecosystem
---

# Phylogenetic Analysis Toolkit / 系统发育分析工具集

Phylogenetic analysis in Python relies on a combination of libraries: **Biopython.Phylo** for tree I/O and basic operations, **DendroPy** for advanced tree simulation and manipulation, and **scikit-bio** for diversity metrics. For ML tree building, Bio.Phylo wraps external tools like RAxML and IQ-TREE via subprocess.

## When to Use / 适用场景

- Building phylogenetic trees from multiple sequence alignments (MSA)
- Comparing tree topologies (Robinson-Foulds distance, taxon congruence)
- Running bootstrap analyses for branch support estimation
- Simulating trees under speciation models (Yule, birth-death)
- Estimating divergence times and molecular clocks
- Visualizing and annotating trees for publication

## Quick Start / 快速开始

```python
from Bio import Phylo, AlignIO
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor

# Load a multiple sequence alignment
alignment = AlignIO.read("aligned_sequences.fasta", "fasta")
print(f"Sequences: {len(alignment)}, Length: {alignment.get_alignment_length()} bp")

# Build a distance matrix and tree (Neighbor-Joining)
calculator = DistanceCalculator('identity')
distance_matrix = calculator.get_distance(alignment)

constructor = DistanceTreeConstructor()
nj_tree = constructor.nj(distance_matrix)
nj_tree.ladderize()  # Ladderize for display

# Save and visualize
Phylo.write(nj_tree, "nj_tree.nwk", "newick")
Phylo.draw_ascii(nj_tree)
```

## Core Capabilities / 核心能力

### 1. Tree Construction (NJ, UPGMA) / 树构建方法

```python
from Bio import AlignIO
from Bio.Phylo.TreeConstruction import (
    DistanceCalculator, DistanceTreeConstructor,
    ParsimonyScorer, ParsimonyTreeConstructor
)

alignment = AlignIO.read("alignment.fasta", "fasta")

# Neighbor-Joining tree
calculator = DistanceCalculator('identity')  # or 'blastn', 'trans'
dm = calculator.get_distance(alignment)
nj_tree = DistanceTreeConstructor().nj(dm)

# UPGMA tree
upgma_tree = DistanceTreeConstructor().upgma(dm)

# Maximum Parsimony tree (heuristic search)
scorer = ParsimonyScorer()
constructor = ParsimonyTreeConstructor(scorer, search_method="nni")
starting_tree = DistanceTreeConstructor().nj(dm)
mp_tree = constructor.build_tree(alignment, starting_tree)

print(f"NJ tree tips: {len(nj_tree.get_terminals())}")
print(f"NJ tree total branch length: {nj_tree.total_branch_length():.2f}")
```

### 2. Bootstrap Analysis / 自展分析

```python
from Bio import AlignIO, Phylo
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor
import random
from collections import Counter

def bootstrap_tree(alignment, method="nj", n_bootstrap=100):
    """Perform bootstrap analysis and return consensus support values."""
    n_seqs = len(alignment)
    seq_len = alignment.get_alignment_length()
    calculator = DistanceCalculator('identity')
    constructor = DistanceTreeConstructor()

    # Count bipartitions across bootstrap replicates
    bipartition_counts = Counter()
    for i in range(n_bootstrap):
        # Resample columns with replacement
        cols = [random.randint(0, seq_len - 1) for _ in range(seq_len)]
        dm = calculator.get_distance(alignment)
        tree = constructor.nj(dm)
        for clade in tree.get_nonterminals():
            taxa = tuple(sorted(c.name for c in clade.get_terminals()))
            bipartition_counts[taxa] += 1

    return {bp: count / n_bootstrap for bp, count in bipartition_counts.items()}

alignment = AlignIO.read("alignment.fasta", "fasta")
supports = bootstrap_tree(alignment, n_bootstrap=100)
print(f"Bipartitions with >70% support: "
      f"{sum(1 for s in supports.values() if s > 0.7)}")
```

### 3. Tree Comparison and Consensus / 树比较与一致性树

```python
from Bio import Phylo
from Bio.Phylo.Consensus import majority_consensus

# Load multiple trees (e.g., from bootstrap replicates)
trees = list(Phylo.parse("bootstrap_trees.nwk", "newick"))
print(f"Loaded {len(trees)} trees")

# Majority consensus tree
consensus = majority_consensus(trees, cutoff=0.5)
Phylo.write(consensus, "consensus.nwk", "newick")

# Robinson-Foulds distance between two trees
tree1 = Phylo.read("tree1.nwk", "newick")
tree2 = Phylo.read("tree2.nwk", "newick")
rf_distance = tree1.robinson_foulds(tree2)[0]
print(f"Robinson-Foulds distance: {rf_distance}")

# Normalize by total possible distance
rf_max = 2 * (len(tree1.get_terminals()) - 3)  # For unrooted trees
print(f"Normalized RF: {rf_distance / rf_max:.3f}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Complete Phylogenetic Analysis Pipeline / 完整系统发育分析流程

```python
from Bio import AlignIO, Phylo, SeqIO
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor
import matplotlib.pyplot as plt

# Step 1: Load pre-aligned sequences
alignment = AlignIO.read("sequences.aln", "clustal")
print(f"Aligned {len(alignment)} sequences, length {alignment.get_alignment_length()}")

# Step 2: Build NJ tree
calculator = DistanceCalculator('identity')
dm = calculator.get_distance(alignment)
tree = DistanceTreeConstructor().nj(dm)

# Step 3: Root tree on outgroup
outgroup_name = "Outgroup_sequence"
tree.root_with_outgroup({"name": outgroup_name})
tree.ladderize()

# Step 4: Visualize and save
fig, ax = plt.subplots(figsize=(12, 8))
Phylo.draw(tree, axes=ax, do_show=False,
           branch_labels=lambda c: f"{c.branch_length:.3f}")
ax.set_title("Neighbor-Joining Phylogenetic Tree")
plt.tight_layout()
plt.savefig("phylogenetic_tree.pdf", dpi=300, bbox_inches="tight")
print("Tree saved to phylogenetic_tree.pdf")

# Step 5: Export for external tools (RAxML, IQ-TREE)
Phylo.write(tree, "for_raxml.nwk", "newick")
```

## Best Practices / 最佳实践

1. **Use ML methods for publication**: NJ/UPGMA are fast for exploration; use RAxML or IQ-TREE for final analyses
2. **Bootstrap adequately**: Minimum 100 replicates for exploratory; 1000+ for publication
3. **Choose appropriate substitution model**: Use ModelTest or IQ-TREE's built-in ModelFinder
4. **Root with outgroup**: Always root trees on a known outgroup for biological interpretation
5. **Validate alignment first**: Poor alignments produce misleading trees; inspect with AliView or Jalview

## Common Pitfalls / 常见陷阱

- **Long-branch attraction**: Fast-evolving taxa cluster artifactually; use site-heterogeneous models (CAT-GTR)
- **Missing data**: Sequences with many gaps can distort trees; filter columns with >50% gaps
- **Model misspecification**: Using Jukes-Cantor when data requires GTR+G can produce wrong topology
- **Bootstrap misinterpretation**: Bootstrap support < 70% is weak; do not over-interpret poorly supported clades
- **Alignment dependency**: Different alignment tools (MAFFT vs Clustal) can yield different trees

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/etetoolkit.md` for advanced tree visualization and annotation
- Use with `references/tools/biopython.md` for sequence alignment and manipulation
- Combine with `references/tools/matplotlib.md` for publication-quality tree figures
- Integrate with `workflows/experiment-design.md` for evolutionary biology studies

## Resources / 资源

- Biopython Phylo: https://biopython.org/wiki/Phylo
- DendroPy: https://dendropy.org/
- IQ-TREE: http://www.iqtree.org/
- RAxML: https://cme.h-its.org/exelixis/web/software/raxml/
- ETE Toolkit: https://etetoolkit.org/
