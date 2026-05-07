---
name: gget
description: Genomic database querying — sequence retrieval, BLAST search, gene info, and pathway enrichment from command line or Python
domain: biology / genomics
install: pip install gget
---

# gget

A free, open-source tool for querying genomic databases from the command line or Python. Provides unified access to Ensembl, NCBI, UniProt, GTEx, STRING, and other genomic resources. Retrieve sequences, gene information, functional annotations, BLAST alignments, and pathway data in a single line of code.

## When to Use

- Retrieving gene sequences, transcripts, or protein sequences by gene symbol or Ensembl ID
- Running BLAST-like sequence similarity searches against NCBI or Ensembl databases
- Fetching gene functional annotations, descriptions, and orthology information
- Querying gene expression data from GTEx across tissues
- Getting protein-protein interaction data from STRING database

## Quick Start

```python
import gget

# Search for a gene and get basic info
result = gget.search("ESR1", organism="human")
print(f"Full name: {result[0]['name']}")
print(f"Description: {result[0]['description']}")
print(f"Ensembl ID: {result[0]['ensembl_gene_id']}")

# Retrieve the protein sequence
seq = gget.seq("ENSG00000091831", seqtype="protein")
print(f"Protein length: {len(seq['seq'])} aa")

# BLAST a sequence against NCBI nr
blast_result = gget.blast("MKVILLFVVAIATVLSVIIFTSEGVGKDRQLNGTVINGTLAPVIKVNG")
print(blast_result)
```

## Core Capabilities

### 1. Gene Search and Annotation

```python
import gget

# Search genes by symbol, name, or Ensembl ID
results = gget.search("BRCA1", organism="human")
for gene in results:
    print(f"Symbol: {gene['name']}")
    print(f"Description: {gene['description']}")
    print(f"Ensembl ID: {gene['ensembl_gene_id']}")
    print(f"Chromosome: {gene['chromosome']}")
    print(f"Biotype: {gene['biotype']}")

# Search across organisms
mouse_results = gget.search("Brca1", organism="mouse")
print(f"Mouse BRCA1: {mouse_results[0]['ensembl_gene_id']}")

# Search by keyword
kinases = gget.search("tyrosine kinase", organism="human")
print(f"Found {len(kinases)} tyrosine kinase genes")
```

### 2. Sequence Retrieval

```python
import gget

# Retrieve DNA sequence (genomic, with introns)
dna = gget.seq("ENSG00000012048", seqtype="genomic", padding=100)
print(f"Genomic region: {dna['seq'][:100]}...")

# Retrieve coding sequence (CDS only)
cds = gget.seq("ENSG00000012048", seqtype="cds")
print(f"CDS length: {len(cds['seq'])} bp")

# Retrieve protein sequence
protein = gget.seq("ENSG00000012048", seqtype="protein")
print(f"Protein: {protein['seq'][:80]}...")

# Retrieve specific transcript
tx_seq = gget.seq("ENST00000357654", seqtype="transcript")
print(f"Transcript length: {len(tx_seq['seq'])} bp")

# Retrieve sequence for multiple genes
for gene_id in ["ENSG00000012048", "ENSG00000091831", "ENSG00000141510"]:
    seq = gget.seq(gene_id, seqtype="protein")
    print(f"{gene_id}: {len(seq['seq'])} aa")
```

### 3. BLAST Search and Enrichment

```python
import gget

# BLAST a DNA sequence against NCBI
blast_hits = gget.blast(
    "ATGGTGAGCAAGGGCGAGGAGCTGTTCACCGGGGTGGTGCCCATCCTGGTCGAGCTGGACGGCGACGTAAACGGCCACAAGTTCAGCGTGTCCGGCGAGGGCGAGGGCGATGCCACCTACGGCAAGCTGACCCTGAAGTTCATCTGCACCACCGGCAAGCTGCCCGTGCCCTGGCCCACCCTCGTGACCACCCTGACCTACGGCGTGCAGTGCTTCAGCCGCTACCCCGACCACATGAAGCAGCACGACTTCTTCAAGTCCGCCATGCCCGAAGGCTACGTCCAGGAGCGCACCATCTTCTTCAAGGACGACGGCAACTACAAGACCCGCGCCGAGGTGAAGTTCGAGGGCGACACCCTGGTGAACCGCATCGAGCTGAAGGGCATCGACTTCAAGGAGGACGGCAACATCCTGGGGCACAAGCTGGAGTACAACTACAACAGCCACAACGTCTATATCATGGCCGACAAGCAGAAGAACGGCATCAAGGTGAACTTCAAGATCCGCCACAACATCGAGGACGGCAGCGTGCAGCTCGCCGACCACTACCAGCAGAACACCCCCATCGGCGACGGCCCCGTGCTGCTGCCCGACAACCACTACCTGAGCACCCAGTCCGCCCTGAGCAAAGACCCCAACGAGAAGCGCGATCACATGGTCCTGCTGGAGTTCGTGACCGCCGCCGGGATCACTCTCGGCATGGACGAGCTGTACAAGTAA",
    program="blastn",
    db="nt",
)
for hit in blast_hits[:5]:
    print(f"  {hit['description']}: e-value={hit['evalue']:.2e}, identity={hit['identity']}%")

# Gene set enrichment with Enrichr
enrichment = gget.enrichr(["BRCA1", "TP53", "EGFR", "MYC", "KRAS"], database="GO_Biological_Process_2023")
print(enrichment)
```

## Common Academic Workflow: Gene Set Characterization Pipeline

```python
import gget
import pandas as pd

# 1. List of genes from differential expression analysis
de_genes = ["CXCL10", "IFIT3", "ISG15", "OAS1", "MX1", "STAT1", "IRF7", "HERC5"]

# 2. Get gene descriptions and Ensembl IDs
gene_info = []
for gene in de_genes:
    results = gget.search(gene, organism="human")
    if results:
        gene_info.append({
            "symbol": results[0]["name"],
            "description": results[0]["description"],
            "ensembl_id": results[0]["ensembl_gene_id"],
            "chromosome": results[0]["chromosome"],
        })
info_df = pd.DataFrame(gene_info)
print(info_df)

# 3. Retrieve protein sequences for motif analysis
sequences = {}
for gene in de_genes:
    results = gget.search(gene, organism="human")
    if results:
        seq = gget.seq(results[0]["ensembl_gene_id"], seqtype="protein")
        sequences[gene] = seq["seq"]

# 4. Functional enrichment
enrichment = gget.enrichr(de_genes, database="KEGG_2021_Human")
print("Top enriched pathways:")
for pathway in enrichment[:5]:
    print(f"  {pathway['term']}: adj-p={pathway['adjusted_p_value']:.4f}")
```

## Best Practices

1. **Use Ensembl IDs for reproducibility** — Gene symbols can change or be ambiguous; Ensembl IDs are stable identifiers
2. **Specify organism explicitly** — Always pass `organism="human"` or `organism="mouse"` to avoid ambiguous gene matches
3. **Rate limit API calls** — When batch-querying, add small delays between calls to respect API rate limits
4. **Cache results locally** — Save retrieved sequences and annotations to disk to avoid repeated network calls

## Common Pitfalls

- **Ambiguous gene symbols**: "CAT" matches catalase, not the animal. Always verify with `gget.search()` before retrieving sequences.
- **Ensembl version changes**: Ensembl IDs change between releases. Pin the Ensembl version for reproducibility.
- **BLAST timeouts**: Large BLAST queries against NCBI can time out. Use shorter sequences or the megablast program for near-exact matches.
- **Enrichr database names**: Database names change periodically. List available databases with `gget.enrichr([], database="all")`.

## Integration with HBE

- Use with `/hbe-plan` for designing genomics study protocols
- Pair with `references/tools/biopython.md` for advanced sequence manipulation (reverse complement, ORF finding)
- Combine with `references/tools/pandas.md` for organizing gene annotation tables
- See `references/tools/scanpy.md` for combining gene annotations with single-cell expression data

## Resources

- Documentation: https://pachterlab.github.io/gget/
- GitHub: https://github.com/pachterlab/gget
- Ensembl: https://www.ensembl.org/
- NCBI BLAST: https://blast.ncbi.nlm.nih.gov/
- Enrichr: https://maayanlab.cloud/Enrichr/
