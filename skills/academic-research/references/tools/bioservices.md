---
name: bioservices
description: Bioinformatics web services — programmatic access to UniProt, KEGG, PDB, Ensembl, and NCBI APIs
domain: Bioinformatics / APIs
install: pip install bioservices
---

# BioServices — Bioinformatics Web Services / 生物信息学 Web 服务接口

BioServices provides unified Python wrappers for major bioinformatics web APIs including UniProt, KEGG, PDB, Ensembl, NCBI E-utilities, ChEMBL, and more. It handles authentication, rate limiting, and response parsing, making it easy to query biological databases programmatically.

## When to Use / 适用场景

- Retrieving protein sequences and metadata from UniProt
- Fetching KEGG pathways, genes, and compound information
- Downloading PDB structures and metadata
- Querying Ensembl for genomic annotations and variants
- Batch searching NCBI databases (PubMed, GenBank, GEO)
- Accessing ChEMBL for bioactivity and drug-target data

## Quick Start / 快速开始

```python
from bioservices import UniProt, KEGG, PDB

# UniProt: search for human p53
u = UniProt(verbose=False)
result = u.search("gene:p53 AND organism_id:9606", limit=3, columns="entry_name,gene_names,protein_name,length")
print(result)

# KEGG: get a pathway
k = KEGG(verbose=False)
pathway = k.get("hsa04110")  # Cell cycle pathway
print(pathway[:500])

# PDB: get structure info
p = PDB(verbose=False)
info = p.get_entry("1TUP")
print(f"Title: {p.get_title('1TUP')}")
```

## Core Capabilities / 核心能力

### 1. UniProt Search and Retrieval / UniProt 搜索与获取

```python
from bioservices import UniProt
import pandas as pd

u = UniProt(verbose=False)

# Advanced search with specific columns
results = u.search(
    "organism_id:9606 AND reviewed:true AND length:[100 TO 500]",
    limit=20,
    columns="accession,id,entry_name,protein_name,gene_names,length,mass,go",
    format="tab"
)

# Parse TSV results into DataFrame
from io import StringIO
df = pd.read_csv(StringIO(results), sep="\t")
print(df.columns.tolist())
print(df.head())

# Get full sequence in FASTA format
fasta = u.get_fasta("P04637")  # Human p53
print(fasta[:200])

# Batch retrieval of multiple accessions
entries = u.retrieve(["P04637", "P31749", "Q9Y6K1"], format="fasta")
print(f"Retrieved {len(entries)} sequences")

# Mapping: get UniProt ID from gene symbol
mapping = u.mapping("UniProtKB_AC-ID", "Gene_Name", query="P04637")
print(mapping)
```

### 2. KEGG Pathway and Gene Access / KEGG 通路与基因查询

```python
from bioservices import KEGG

k = KEGG(verbose=False)

# List pathways for an organism
human_pathways = k.list("pathway", organism="hsa")
print(f"Human pathways: {len(human_pathways.split(chr(10)))}")

# Get pathway details and parse
pathway_data = k.get("hsa04110")  # Cell cycle
parsed = k.parse(pathway_data)
print(f"Pathway: {parsed['NAME']}")
print(f"Genes: {len(parsed['GENE'])} genes involved")

# Get gene information
gene_info = k.get("hsa:7157")  # TP53 gene
parsed_gene = k.parse(gene_info)
print(f"Gene: {parsed_gene['NAME']}, Description: {parsed_gene['DESCRIPTION']}")

# Get compound/drug information
compound = k.get("cpd:C00068")  # L-Glutathione
parsed_compound = k.parse(compound)
print(f"Compound: {parsed_compound['NAME']}")

# KEGG pathway mapping: which pathways contain a gene?
pathways = k.get_pathways_by_gene("hsa", "7157")
print(f"TP53 in pathways: {pathways}")
```

### 3. PDB Structure Retrieval / PDB 结构获取

```python
from bioservices import PDB
import os

p = PDB(verbose=False)

# Get entry metadata
entry = p.get_entry("1TUP")
print(f"PDB 1TUP: {p.get_title('1TUP')}")

# Get entry in PDB format
pdb_text = p.get_pdb_file("1TUP")
with open("1TUP.pdb", "w") as f:
    f.write(pdb_text)

# Get entry in mmCIF format
mmcif = p.get_mmcif_file("1TUP")
with open("1TUP.cif", "w") as f:
    f.write(mmcif)

# Search PDB by keyword
results = p.search("kinase inhibitor", limit=5)
print(f"Found {len(results)} results")
for r in results[:5]:
    print(f"  {r}")

# Get ligand information
ligand = p.get_ligand("ATP")
print(f"ATP ligand info: {ligand[:300]}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Multi-Database Annotation Pipeline / 多数据库注释流程

```python
from bioservices import UniProt, KEGG, PDB
import pandas as pd

def annotate_protein(uniprot_id):
    """Retrieve comprehensive annotation for a protein from multiple databases."""
    u = UniProt(verbose=False)
    k = KEGG(verbose=False)
    p = PDB(verbose=False)

    annotation = {"uniprot_id": uniprot_id}

    # UniProt metadata
    result = u.search(f"accession:{uniprot_id}",
                      columns="entry_name,protein_name,gene_names,length,go,interactor",
                      format="tab")
    annotation["uniprot"] = result.strip()

    # FASTA sequence
    annotation["sequence"] = u.get_fasta(uniprot_id)

    # KEGG pathways
    mapping = u.mapping("UniProtKB_AC-ID", "KEGG", query=uniprot_id)
    if mapping and uniprot_id in mapping.get(uniprot_id, ""):
        kegg_id = mapping[uniprot_id].split(",")[0].strip()
        gene_info = k.get(kegg_id)
        annotation["kegg"] = k.parse(gene_info) if gene_info else None

    # PDB structures
    pdb_results = p.search(f"uniprot:{uniprot_id}", limit=10)
    annotation["pdb_structures"] = pdb_results.split("\n") if pdb_results else []

    return annotation

# Batch annotate a list of proteins
proteins = ["P04637", "P31749", "Q9Y6K1", "P00533"]
annotations = {pid: annotate_protein(pid) for pid in proteins}

for pid, ann in annotations.items():
    pdb_count = len([s for s in ann["pdb_structures"] if s.strip()])
    print(f"{pid}: {pdb_count} PDB structures")
```

## Best Practices / 最佳实践

1. **Rate limiting**: BioServices handles rate limits internally but batch requests are faster than loops
2. **Cache results**: Use `requests_cache` to avoid repeated API calls during development
3. **Use tab format**: UniProt `format="tab"` returns TSV that is easy to parse with pandas
4. **Error handling**: Wrap API calls in try/except; services may be temporarily unavailable
5. **Check API versions**: Some services update their REST API; verify with `service.version`

## Common Pitfalls / 常见陷阱

- **Reviewed vs unreviewed**: UniProtKB/Swiss-Prot (reviewed) is high-quality; UniProtKB/TrEMBL (unreviewed) is noisy -- filter with `reviewed:true`
- **Rate limits exceeded**: NCBI E-utilities limits 3 requests/second without API key; register for a key
- **Large results**: UniProt search with `limit=0` returns all matches but may timeout; paginate instead
- **KEGG IDs**: KEGG uses organism prefix (e.g., `hsa:` for human); do not confuse with NCBI Gene IDs
- **PDB deprecated entries**: Some PDB IDs are obsolete; check status before downloading

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/biopython.md` for sequence analysis and structure parsing
- Use with `references/tools/pandas.md` for tabular annotation data management
- Combine with `references/tools/matplotlib.md` for pathway visualization
- Integrate with `workflows/experiment-design.md` for multi-omics annotation pipelines

## Resources / 资源

- Documentation: https://bioservices.readthedocs.io/
- Repository: https://github.com/bioservices/bioservices
- UniProt API: https://www.uniprot.org/help/api_queries
- KEGG API: https://www.kegg.jp/kegg/rest/
- PDB API: https://data.rcsb.org/
