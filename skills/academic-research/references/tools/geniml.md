---
name: geniml
description: Genomic interval machine learning — bed file processing and genomic region classification with ML pipelines
domain: Bioinformatics / Genomics
install: pip install geniml
---

# geniml — Genomic Interval Machine Learning

geniml provides a machine-learning-native framework for working with genomic interval data (BED files, genomic regions). It bridges genomics file formats with PyTorch, enabling deep learning on genomic intervals while maintaining biological interpretability.

## When to Use

- Processing and transforming BED files for ML model input
- Building classifiers or regressors on genomic regions (enhancers, promoters, TF binding sites)
- Converting genomic intervals into tensor representations for neural networks
- Extracting features from genomic intervals (sequence, epigenomic signals)
- Combining multiple genomic annotation sources into unified interval datasets

## Quick Start

```python
from geniml.io import BedFile
from geniml.region import Region

# Load a BED file
bed = BedFile("enhancers.bed")

# Iterate over regions
for region in bed:
    print(f"{region.chrom}:{region.start}-{region.end}")

# Filter regions by chromosome and size
filtered = bed.filter(lambda r: r.chrom == "chr1" and (r.end - r.start) > 500)

# Compute overlaps between two BED files
overlaps = bed.overlap(other_bed)
print(f"Found {len(overlaps)} overlapping regions")
```

## Core Capabilities

### 1. BED File I/O and Manipulation

```python
from geniml.io import BedFile

# Read BED with optional metadata columns
bed = BedFile("peaks.bed", name_col=3, score_col=4)

# Merge overlapping or nearby regions (bedtools merge equivalent)
merged = bed.merge(distance=1000)

# Subtract one BED from another
unique = bed.subtract(blacklist_bed)

# Sort and index for fast interval queries
bed = bed.sort().index()

# Window-based tiling of the genome
tiled = bed.tile(tile_size=1000, step_size=500)
```

### 2. Genomic Interval Feature Extraction

```python
from geniml.extract import extract_sequence, extract_signal
from geniml.search import SearchRegion

# Extract DNA sequence for regions (requires reference genome)
sequences = extract_sequence(regions, genome_fasta="hg38.fa")

# Extract epigenomic signal values (BigWig) over regions
signal_matrix = extract_signal(
    regions,
    bigwig_files=["H3K27ac.bw", "ATACseq.bw"],
    bin_size=200
)
# Returns numpy array: (n_regions, n_bins, n_signals)

# Search for motifs within regions
motif_hits = regions.search_motif("MA0035.4.pwm", pvalue_threshold=1e-4)
```

### 3. PyTorch Dataset Integration

```python
import torch
from torch.utils.data import DataLoader
from geniml.ml import RegionDataset

# Create a PyTorch-compatible dataset from BED + features
dataset = RegionDataset(
    bed_file="training_regions.bed",
    genome_fasta="hg38.fa",
    signal_files=["H3K27ac.bw", "DNase.bw"],
    labels="labels.tsv",  # tab-separated: region_id \t label
    bin_size=200,
    max_seq_len=1000
)

loader = DataLoader(dataset, batch_size=64, shuffle=True, num_workers=4)

for batch in loader:
    sequences, signals, labels = batch
    print(f"Seq: {sequences.shape}, Sig: {signals.shape}, Labels: {labels.shape}")
```

## Common Academic Workflow: Enhancer Classification Pipeline

```python
from geniml.io import BedFile
from geniml.ml import RegionDataset
import torch.nn as nn
from torch.utils.data import random_split

# 1. Prepare positive and negative regions
positive = BedFile("validated_enhancers.bed").sort().index()
negative = BedFile("random_genomic_regions.bed").sort().index()

# 2. Combine and assign labels
positive_regions = [(r, 1) for r in positive]
negative_regions = [(r, 0) for r in negative]
all_regions = positive_regions + negative_regions

# 3. Build dataset with sequence + epigenomic features
dataset = RegionDataset(
    regions=all_regions,
    genome_fasta="hg38.fa",
    signal_files=["H3K27ac.bw", "H3K4me1.bw", "ATACseq.bw"],
    bin_size=200
)

# 4. Train/val/test split (80/10/10)
train_set, val_set, test_set = random_split(dataset, [0.8, 0.1, 0.1])

# 5. Train CNN classifier
class EnhancerCNN(nn.Module):
    def __init__(self, n_signals=3):
        super().__init__()
        self.conv = nn.Conv1d(n_signals + 4, 128, kernel_size=7, padding=3)  # +4 for one-hot DNA
        self.fc = nn.Linear(128, 1)

    def forward(self, seq, sig):
        x = torch.cat([seq, sig], dim=1)
        x = torch.relu(self.conv(x))
        x = x.mean(dim=2)
        return torch.sigmoid(self.fc(x))

model = EnhancerCNN()
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
# ... standard training loop ...
```

## Best Practices

1. Always sort and index BED files before overlap operations for O(log n) query performance
2. Use bin_size appropriate to your assay resolution (e.g., 200 bp for ChIP-seq, 50 bp for ATAC-seq)
3. Exclude blacklist regions (ENCODE blacklist) before training to avoid confounding signals
4. Balance positive and negative regions when training classifiers to prevent bias
5. Store intermediate representations as memmap-backed tensors to manage memory for large genomes

## Common Pitfalls

1. **Chromosome naming mismatches**: Ensure consistent naming (chr1 vs 1) across all input files; use `bed.standardize_chrom()` before merging
2. **Memory overflow on whole-genome BED**: Use streaming mode with `BedFile.stream()` instead of loading all regions into memory
3. **Strand information loss**: Some operations discard strand; preserve it with `keep_strand=True` if directionality matters
4. **Incorrect overlap semantics**: Distinguish between `any` overlap and `reciprocal` overlap based on your biological question

## Integration with HBE

- Use with `workflows/experiment-design.md` for designing genomic ML experiments
- Pair with `references/tools/pysam.md` for SAM/BAM-based feature extraction
- Combine with `references/tools/numpy.md` and `references/tools/pytorch-lightning.md` for model training
- Supports `references/tool-registry.md` genomics tool chain

## Resources

- Documentation: https://geniml.readthedocs.io/
- Source: https://github.com/stasya1678/geniml
- Related: bedtools, pybedtools, deepbind, Basenji
