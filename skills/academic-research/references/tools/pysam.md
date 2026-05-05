---
name: pysam
description: Python interface for reading/writing SAM, BAM, CRAM, VCF, BCF, TABIX, and FAI files — essential for NGS analysis
domain: Biology / Genomics
install: pip install pysam
---

# Pysam — NGS File I/O and Manipulation / 高通量测序文件读写与操作

Pysam wraps htslib to provide Python access to SAM/BAM/CRAM alignment files, VCF/BCF variant files, and indexed FASTA files. Essential for any next-generation sequencing pipeline.

## When to Use / 适用场景

- Reading and filtering SAM/BAM alignment files
- Accessing VCF/BCF variant call files
- Extracting regions from indexed FASTA/FASTQ
- Building custom variant calling or alignment analysis pipelines
- Computing coverage, allele frequencies, or custom genomic metrics

## Quick Start / 快速开始

```python
import pysam

# Read BAM file
bamfile = pysam.AlignmentFile("aligned.bam", "rb")

# Iterate reads in a region
for read in bamfile.fetch("chr1", 100000, 200000):
    print(f"{read.query_name}: MAPQ={read.mapping_quality}, flag={read.flag}")

# Get coverage
coverage = pysam.AlignmentFile("aligned.bam", "rb").count_coverage("chr1", 100000, 100100)

# Read VCF
vcf = pysam.VariantFile("variants.vcf.gz")
for rec in vcf.fetch("chr1", 100000, 200000):
    print(f"{rec.chrom}:{rec.pos} {rec.ref}>{rec.alts} QUAL={rec.qual:.1f}")
```

## Core Capabilities / 核心能力

### 1. BAM/SAM Alignment Processing / 比对文件处理

```python
import pysam

bam = pysam.AlignmentFile("aligned.sorted.bam", "rb")

# Basic statistics
total = bam.mapped + bam.unmapped
print(f"Mapped: {bam.mapped}, Unmapped: {bam.unmapped}, Total: {total}")

# Filter reads by quality and flags
high_quality = []
for read in bam.fetch("chr1"):
    if read.mapping_quality >= 30 and not read.is_duplicate and not read.is_secondary:
        high_quality.append(read)

# Access read attributes
for read in bam.fetch("chr1", 1, 1000):
    seq = read.query_sequence
    qual = read.query_qualities
    cigar = read.cigartuples  # [(op, length), ...]
    ref_pos = read.reference_start
    mate_chr = read.next_reference_name

# Write filtered BAM
out = pysam.AlignmentFile("filtered.bam", "wb", header=bam.header)
for read in bam.fetch():
    if read.mapping_quality >= 20:
        out.write(read)
out.close()

# Sort and index (shell)
# samtools sort filtered.bam -o filtered.sorted.bam
# samtools index filtered.sorted.bam
```

### 2. VCF/BCF Variant Processing / 变异文件处理

```python
import pysam

vcf = pysam.VariantFile("calls.vcf.gz")

# Iterate variants with filters
for rec in vcf.fetch("chr1", 1, 1000000):
    if rec.filter.keys() == {"PASS"}:
        af = rec.info.get("AF", [0])[0]
        if af > 0.01:
            print(f"{rec.chrom}:{rec.pos} {rec.ref}>{','.join(rec.alts)} AF={af:.3f}")

# Access genotype data
for rec in vcf.fetch("chr1", 1, 1000):
    for sample in rec.samples:
        gt = rec.samples[sample]["GT"]
        dp = rec.samples[sample].get("DP", 0)

# Write filtered VCF
out = pysam.VariantFile("filtered.vcf", "w", header=vcf.header)
for rec in vcf:
    if rec.qual and rec.qual >= 20:
        out.write(rec)
out.close()
```

### 3. FASTA Index and Sequence Extraction / FASTA 索引与序列提取

```python
import pysam

# Requires .fai index file (samtools faidx ref.fa)
fasta = pysam.FastaFile("reference.fa")

# Get sequence for a region
seq = fasta.fetch("chr1", 100000, 100100)

# Get chromosome lengths
for chrom, length in zip(fasta.references, fasta.lengths):
    print(f"{chrom}: {length} bp")

# Get full chromosome sequence
chr1_seq = fasta.fetch("chr1")
gc = (chr1_seq.count("G") + chr1_seq.count("C")) / len(chr1_seq)
```

### 4. Tabix-Indexed Files / Tabix 索引文件

```python
import pysam

# Read tabix-indexed BED/GFF/TDF
tabix = pysam.TabixFile("peaks.bed.gz")
for row in tabix.fetch("chr1", 100000, 200000):
    fields = row.split("\t")
    print(f"Peak: {fields[0]}:{fields[1]}-{fields[2]}")
```

### 5. Pileup and Depth Analysis / Pileup 与深度分析

```python
import pysam
import numpy as np

bam = pysam.AlignmentFile("aligned.bam", "rb")

# Column-based pileup
for pileup_col in bam.pileup("chr1", 100000, 101000):
    pos = pileup_col.reference_pos
    depth = pileup_col.n
    bases = [p.alignment.query_sequence[p.query_position] for p in pileup_col.pileups if p.query_position is not None]
    if depth > 0:
        base_counts = {b: bases.count(b) for b in set(bases)}
        major = max(base_counts, key=base_counts.get)
        freq = base_counts[major] / depth
        if freq < 0.9 and depth >= 10:
            print(f"Potential SNP at {pos}: {base_counts}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Custom Coverage Analysis / 自定义覆盖度分析

```python
import pysam
import numpy as np
import pandas as pd

bam = pysam.AlignmentFile("sample.bam", "rb")
windows = []
for chrom in bam.references:
    length = bam.get_reference_length(chrom)
    window_size = 10000
    for start in range(0, length, window_size):
        end = min(start + window_size, length)
        depth_arr = np.array(bam.count_coverage(chrom, start, end))
        total_depth = depth_arr.sum(axis=0)
        windows.append({
            "chrom": chrom, "start": start, "end": end,
            "mean_depth": total_depth.mean(),
            "median_depth": np.median(total_depth),
            "coverage_10x": (total_depth >= 10).mean(),
            "coverage_30x": (total_depth >= 30).mean()
        })
df = pd.DataFrame(windows)
```

### Workflow 2: Allele Frequency Calculation / 等位基因频率计算

```python
import pysam
import pandas as pd

vcf = pysam.VariantFile("cohort.vcf.gz")
variants = []
for rec in vcf.fetch():
    if not rec.alts:
        continue
    for i, alt in enumerate(rec.alts):
        ac = rec.info.get("AC", [0])
        an = rec.info.get("AN", 0)
        af = ac[i] / an if an > 0 else 0
        variants.append({
            "chrom": rec.chrom, "pos": rec.pos,
            "ref": rec.ref, "alt": alt,
            "af": af, "qual": rec.qual,
            "filter": ",".join(rec.filter.keys())
        })
df = pd.DataFrame(variants)
```

## Key Parameters / 关键参数

| Parameter | Context | Typical Values |
|-----------|---------|----------------|
| `mapping_quality` | Read filter threshold | ≥20 for standard, ≥30 for stringent |
| `min_base_quality` | Pileup filter | ≥20 |
| `max_depth` | Coverage calculation | Default unlimited; set for memory |
| `require_flag` / `exclude_flag` | SAM flags | filter by paired/unpaired/duplicate |
| `stepper` | Pileup mode | "all", "nofilter", "samtools" |

## Best Practices / 最佳实践

- Always use sorted + indexed BAM files (`.bai` index required for `fetch()`)
- Use `pysam.sort()` and `pysam.index()` to prepare files before querying
- Close file handles explicitly or use context managers
- For large VCFs, use BCF (binary) format for faster I/O
- Process reads in regions rather than loading entire chromosomes into memory
- Use `AlignmentFile.count()` for simple coverage; `pileup()` for base-level detail

## Common Pitfalls / 常见陷阱

- **Missing index**: `fetch()` requires `.bai` (BAM) or `.tbi`/`.csi` (VCF) index
- **1-based coordinates**: pysam uses 0-based half-open intervals (like Python), not 1-based like samtools
- **CIGAR ops**: Know the codes: 0=M, 1=I, 2=D, 3=N, 4=S, 5=H, 6=P, 7=EQ, 8=X
- **Memory with count_coverage**: Large regions consume significant memory; use windows
- **Flag meanings**: Use `pysam.flagstat()` or read.flag properties (is_paired, is_proper_pair, etc.)

## Integration with HBE / 与 HBE 集成

- Core tool for genomics workflows in `workflows/experiment-design.md`
- Pair with `references/tools/biopython.md` for sequence + alignment pipelines
- Use with `references/tools/pandas.md` for variant/coverage statistical analysis
- Combine with `references/tools/matplotlib.md` for coverage plots and Manhattan plots
- Integrate with `references/tools/scanpy.md` for single-cell genomics pipelines

## Resources / 资源

- Documentation: https://pysam.readthedocs.io/
- HTSlib: https://www.htslib.org/
- SAM format spec: https://samtools.github.io/hts-specs/SAMv1.pdf
- VCF format spec: https://samtools.github.io/hts-specs/VCFv4.4.pdf
