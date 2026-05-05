---
name: tiledbvcf
description: TileDB-VCF — efficient storage and query of large-scale VCF variant data using sparse arrays
domain: Bioinformatics / Genomics
install: pip install tiledbvcf
---

# tiledbvcf — TileDB-VCF

TileDB-VCF is a Python library for efficiently storing, organizing, and querying large-scale VCF variant data. It uses TileDB's sparse multidimensional array engine to enable cloud-native genomics, supporting millions of samples with fast region-based queries without full file scans.

## When to Use

- Storing and querying population-scale VCF datasets (100K+ samples)
- Running cohort or case-control variant queries on large biobanks
- Building cloud-native variant analysis pipelines (AWS S3, Google Cloud, Azure)
- Performing region-based variant extraction without downloading entire VCFs
- Combining variant data with other omics data in TileDB arrays

## Quick Start

```python
import tiledbvcf

# Create a TileDB-VCF dataset from VCF/BCF files
ds = tiledbvcf.Dataset("gs://my-bucket/vcf-dataset", mode="w")
ds.ingest_samples(["sample1.vcf.gz", "sample2.vcf.gz", "sample3.vcf.gz"])

# Query variants in a specific genomic region
reader = tiledbvcf.Reader("gs://my-bucket/vcf-dataset")
reader.set_region("chr17", 7571720, 7590868)  # TP53 locus

# Iterate over variant records
for record in reader:
    print(f"{record.chrom}:{record.pos} {record.ref}>{record.alleles}")
    print(f"  Samples with variant: {record.sample_names}")
    print(f"  Qual: {record.qual:.1f}")
```

## Core Capabilities

### 1. Dataset Creation and Ingestion

```python
import tiledbvcf

# Create dataset with custom configuration
config = tiledbvcf.Config()
config["vcf_record_attribute_sample_name"] = True
config["vcf_record_attribute_filters"] = True
config["vcf_record_attribute_qual"] = True

ds = tiledbvcf.Dataset(
    uri="s3://genomics-bank/tiledb-vcf",
    mode="w",
    config=config
)

# Ingest from a manifest file (one VCF path per line)
ds.ingest_samples(manifest="cohort_manifest.txt")

# Resume incomplete ingestion (idempotent)
ds.ingest_samples(["new_sample.vcf.gz"], resume=True)
```

### 2. Region-Based Variant Queries

```python
import tiledbvcf

reader = tiledbvcf.Reader("s3://genomics-bank/tiledb-vcf")

# Query a single region
reader.set_region("chr7", 140453136, 140453136)  # EGFR T790M
for rec in reader:
    for i, sample in enumerate(rec.sample_names):
        gt = rec.genotypes[i]
        print(f"{sample}: GT={gt}, GQ={rec.sample_gqs[i] if rec.sample_gqs else 'NA'}")

# Query multiple regions at once
reader.set_regions([
    ("chr7", 140453136, 140453136),
    ("chr12", 25398284, 25398284),   # KRAS G12D
    ("chr17", 7577121, 7577121),    # TP53 R175H
])

# Query with allele frequency threshold
reader.set_region("chr1", 1, 250000000)
reader.set_attribute_filter("info_AF", "<", 0.01)  # rare variants only
```

### 3. Sample and Cohort Filtering

```python
import tiledbvcf

reader = tiledbvcf.Reader("s3://genomics-bank/tiledb-vcf")

# Filter to specific samples (case-control design)
reader.set_samples(["CASE_001", "CASE_002", "CTRL_001", "CTRL_002"])

# Filter samples from a file (one per line)
reader.set_samples_file("case_samples.txt")

# Extract variant records as a pandas-compatible structure
import pandas as pd
records = []
reader.set_region("chr1", 1000000, 2000000)
for rec in reader:
    records.append({
        "chrom": rec.chrom,
        "pos": rec.pos,
        "ref": rec.ref,
        "alt": rec.alleles[0] if rec.alleles else None,
        "qual": rec.qual,
        "n_samples": len(rec.sample_names),
    })
df = pd.DataFrame(records)
print(f"Found {len(df)} variants in query region")
```

## Common Academic Workflow: Case-Control Variant Association

```python
import tiledbvcf
import numpy as np
from scipy.stats import fisher_exact

# 1. Load case and control sample lists
with open("cases.txt") as f:
    case_samples = [l.strip() for l in f]
with open("controls.txt") as f:
    ctrl_samples = [l.strip() for l in f]

# 2. Query all variants across a gene panel (e.g., cancer genes)
reader = tiledbvcf.Reader("s3://biobank/tiledb-vcf")
gene_regions = [
    ("chr7", 55019017, 55211628),    # EGFR
    ("chr12", 25204789, 25250936),   # KRAS
    ("chr17", 7565097, 7590856),     # TP53
    ("chr9", 21967751, 21995000),    # CDKN2A
]

results = []
for chrom, start, end in gene_regions:
    reader.set_region(chrom, start, end)
    for rec in reader:
        # Count carriers in cases vs controls
        case_carriers = sum(1 for s in rec.sample_names if s in case_samples)
        ctrl_carriers = sum(1 for s in rec.sample_names if s in ctrl_samples)
        case_non = len(case_samples) - case_carriers
        ctrl_non = len(ctrl_samples) - ctrl_carriers
        # Fisher's exact test
        odds_ratio, pvalue = fisher_exact(
            [[case_carriers, case_non], [ctrl_carriers, ctrl_non]]
        )
        results.append({
            "variant": f"{chrom}:{rec.pos}{rec.ref}>{rec.alleles[0] if rec.alleles else '.'}",
            "case_AF": case_carriers / len(case_samples),
            "ctrl_AF": ctrl_carriers / len(ctrl_samples),
            "pvalue": pvalue,
            "OR": odds_ratio,
        })

# 3. Sort by p-value and apply Bonferroni correction
import pandas as pd
df = pd.DataFrame(results).sort_values("pvalue")
df["bonferroni_p"] = df["pvalue"].mul(len(df)).clip(upper=1.0)
print(df[df["bonferroni_p"] < 0.05].head(10))
```

## Best Practices

1. Use cloud storage (S3/GCS/Azure) for large datasets to avoid local I/O bottlenecks
2. Ingest VCFs in sorted chromosome order for optimal TileDB fragment layout
3. Set `resume=True` during ingestion to handle interruptions gracefully
4. Use manifest files for ingestion of thousands of samples rather than individual paths
5. Pre-register sample names via `register_samples()` before variant queries for faster filtering

## Common Pitfalls

1. **Missing tabix index**: VCF files must be compressed (`.gz`) and indexed (`.tbi`) before ingestion
2. **Inconsistent reference genomes**: Mixing GRCh37 and GRCh38 VCFs in one dataset produces incorrect coordinates
3. **Query timeout on whole-genome scans**: Always specify regions; avoid scanning entire chromosomes without bounds
4. **Sample name mismatches**: Ensure sample names in VCF headers match your sample list exactly (case-sensitive)

## Integration with HBE

- Use with `workflows/experiment-design.md` for population-scale study design
- Pair with `references/tools/pysam.md` for complementary VCF operations
- Combine with `references/tools/pandas.md` for downstream statistical analysis
- Supports `references/tool-registry.md` genomics tool chain

## Resources

- Documentation: https://docs.tiledb.com/clients/solutions/vcf
- Source: https://github.com/TileDB-Inc/TileDB-VCF
- Paper: Ghandi et al., "TileDB-VCF: efficient and scalable genomic variant storage" (2023)
