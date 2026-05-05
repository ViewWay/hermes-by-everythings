---
name: gtars
description: Genomic track analysis — read, process, and visualize genomic annotation and signal tracks
domain: Bioinformatics
install: pip install gtars  # or pip install pyBigWig pybedtools
---

# Gtars — Genomic Track Analysis / 基因组轨道分析

Gtars provides a unified Python interface for reading, querying, and processing genomic annotation tracks (BigWig, BED, GFF/GTF, bedGraph) and signal tracks. It supports efficient region-based queries, signal extraction, and track arithmetic for comparative genomics and epigenomics analyses.

## When to Use / 适用场景

- Extracting signal values from BigWig files over genomic regions of interest
- Reading and filtering BED/GFF/GTF annotation tracks
- Computing signal statistics (mean, max, coverage) over gene bodies or regulatory elements
- Comparing signal tracks between conditions (ChIP-seq, ATAC-seq, RNA-seq coverage)
- Generating metagene profiles and average signal plots
- Converting between genomic track formats (BED to GFF, BigWig to bedGraph)

## Quick Start / 快速开始

```python
import gtars

# Read a BigWig signal track
bw = gtars.BIGWigFile("signal.bw")

# Get signal values over a genomic region
chrom = "chr1"
start = 1000000
end = 1010000
values = bw.query(chrom, start, end)
print(f"Values: {len(values)} positions, mean={values.mean():.2f}")

# Read a BED annotation file
bed = gtars.BEDFile("peaks.bed")
regions = bed.query(chrom, start, end)
print(f"Overlapping regions: {len(regions)}")
for region in regions:
    print(f"  {region.chrom}:{region.start}-{region.end} {region.name}")
```

## Core Capabilities / 核心能力

### 1. Track Reading and Format Support / 轨道读取与格式支持

```python
import gtars
import numpy as np

# BigWig signal track (ChIP-seq, ATAC-seq, RNA-seq coverage)
bw = gtars.BIGWigFile("h3k27ac_signal.bw")

# Get chromosome list and statistics
chroms = bw.chromosomes()
print(f"Chromosomes: {len(chroms)}")
print(f"Total signal: {bw.total_signal():.2f}")

# Get summary statistics over a region (without fetching all values)
summary = bw.stats("chr1", 1000000, 2000000, type="mean")
print(f"Mean signal (chr1:1M-2M): {summary:.4f}")

# Get per-base values
values = bw.query("chr1", 1000000, 1001000)  # 1000 bp window
print(f"Non-zero positions: {np.count_nonzero(values)} / {len(values)}")

# BED file (peak calls, regulatory elements)
bed = gtars.BEDFile("atac_peaks.bed")
all_peaks = bed.read_all()
print(f"Total peaks: {len(all_peaks)}")

# Filter peaks by score
high_conf_peaks = [p for p in all_peaks if p.score > 500]
print(f"High-confidence peaks: {len(high_conf_peaks)}")

# GFF/GTF annotation file
gtf = gtars.GFFFile("genes.gtf")
genes = gtf.query(feature_type="gene")
print(f"Genes: {len(genes)}")
```

### 2. Region-Based Queries and Overlap / 区域查询与重叠

```python
import gtars
import numpy as np

# Query BigWig signal over BED regions
bw = gtars.BIGWigFile("chip_seq_signal.bw")
bed = gtars.BEDFile("promoter_regions.bed")

# Get signal for each region
region_signals = []
for region in bed.read_all():
    if region.chrom in bw.chromosomes():
        values = bw.query(region.chrom, region.start, region.end)
        region_signals.append({
            "name": region.name,
            "chrom": region.chrom,
            "start": region.start,
            "end": region.end,
            "mean_signal": values.mean(),
            "max_signal": values.max(),
            "coverage": np.count_nonzero(values) / len(values)
        })

# Sort by mean signal
region_signals.sort(key=lambda x: x["mean_signal"], reverse=True)
print("Top 5 regions by signal:")
for r in region_signals[:5]:
    print(f"  {r['name']}: mean={r['mean_signal']:.2f}, "
          f"max={r['max_signal']:.2f}, coverage={r['coverage']:.1%}")

# Find overlapping regions between two BED files
peaks = gtars.BEDFile("condition_a_peaks.bed")
genes = gtars.BEDFile("gene_tss.bed")

for tss in genes.read_all()[:10]:
    nearby = peaks.query(tss.chrom, tss.start - 2000, tss.end + 2000)
    if nearby:
        print(f"Gene {tss.name}: {len(nearby)} peak(s) within 2kb")
```

### 3. Signal Extraction and Metagene Profiling / 信号提取与元基因分析

```python
import gtars
import numpy as np

def metagene_profile(bw_path, regions, upstream=2000, downstream=2000, bins=100):
    """Compute average signal profile across multiple genomic regions."""
    bw = gtars.BIGWigFile(bw_path)
    profile = np.zeros(bins)
    counts = np.zeros(bins)

    for region in regions:
        region_start = region.start - upstream
        region_end = region.end + downstream
        total_len = region_end - region_start
        bin_size = total_len / bins

        if region.chrom not in bw.chromosomes():
            continue

        values = bw.query(region.chrom,
                          max(0, region_start),
                          min(bw.chrom_length(region.chrom), region_end))

        valid_len = len(values)
        if valid_len == 0:
            continue
        for b in range(bins):
            b_start = int(b * bin_size)
            b_end = int((b + 1) * bin_size)
            if b_end <= valid_len:
                profile[b] += values[b_start:b_end].mean()
                counts[b] += 1

    mask = counts > 0
    profile[mask] /= counts[mask]
    return profile

# Example: ATAC-seq signal around TSS
tss_regions = gtars.BEDFile("gene_tss.bed").read_all()
profile = metagene_profile("atac_signal.bw", tss_regions,
                           upstream=2000, downstream=2000, bins=200)
print(f"Metagene profile: {len(profile)} bins")
print(f"TSS signal peak: {profile.max():.2f} (bin {profile.argmax()})")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Differential Signal Analysis / 差异信号分析

```python
import gtars
import numpy as np
import pandas as pd

def differential_signal(condition_a_bw, condition_b_bw, regions_bed):
    """Compare signal intensity between two conditions over defined regions."""
    bw_a = gtars.BIGWigFile(condition_a_bw)
    bw_b = gtars.BIGWigFile(condition_b_bw)
    bed = gtars.BEDFile(regions_bed)

    results = []
    for region in bed.read_all():
        if region.chrom not in bw_a.chromosomes():
            continue

        values_a = bw_a.query(region.chrom, region.start, region.end)
        values_b = bw_b.query(region.chrom, region.start, region.end)

        mean_a, mean_b = values_a.mean(), values_b.mean()
        pseudocount = 0.01
        log2fc = np.log2((mean_a + pseudocount) / (mean_b + pseudocount))

        results.append({
            "region": region.name,
            "chrom": region.chrom,
            "start": region.start,
            "end": region.end,
            "mean_a": mean_a,
            "mean_b": mean_b,
            "log2fc": log2fc,
            "diff": mean_a - mean_b
        })

    df = pd.DataFrame(results)
    df = df.sort_values("log2fc", ascending=False)

    threshold = 1.0  # |log2FC| > 1
    upregulated = df[df["log2fc"] > threshold]
    downregulated = df[df["log2fc"] < -threshold]
    print(f"Upregulated: {len(upregulated)}, Downregulated: {len(downregulated)}")
    return df

df = differential_signal("cond_a_chipseq.bw", "cond_b_chipseq.bw", "peaks.bed")
print(df.head(10))
```

## Best Practices / 最佳实践

1. **Use BigWig over bedGraph**: BigWig is compressed and indexed; queries are O(log n)
2. **Precompute statistics**: Use `bw.stats()` for mean/max/min over large regions efficiently
3. **Handle chromosome naming**: Ensure consistent naming (chr1 vs 1) across all track files
4. **Cache queries**: For repeated queries over the same regions, cache results in numpy arrays
5. **Check bounds**: Always verify query coordinates are within chromosome boundaries

## Common Pitfalls / 常见陷阱

- **Chromosome name mismatch**: BigWig and BED files may use "chr1" vs "1"; standardize before querying
- **Zero-based vs one-based**: BED is 0-based half-open; GFF/GTF is 1-based inclusive
- **Out-of-bounds queries**: Querying beyond chromosome length raises errors; use `bw.chrom_length()`
- **Empty regions**: Regions with start >= end are invalid; filter before processing
- **Memory for large queries**: Querying whole chromosomes loads millions of values; use region-based queries

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/pysam.md` for BAM/VCF reading alongside genomic tracks
- Use with `references/tools/pandas.md` for tabular result analysis and filtering
- Combine with `references/tools/matplotlib.md` for signal tracks, heatmaps, and metagene plots
- Integrate with `workflows/experiment-design.md` for epigenomics and regulatory genomics studies

## Resources / 资源

- Documentation: https://gtars.readthedocs.io/
- pyBigWig (alternative): https://github.com/deeptools/pyBigWig
- pybedtools: https://daler.github.io/pybedtools/
- UCSC utilities: https://genome.ucsc.edu/util.html
- ENCODE portal: https://www.encodeproject.org/ (genomic track datasets)
