---
name: biopython
description: Biological computation toolkit for sequence analysis, structure parsing, BLAST, phylogenetics, and BioSQL access
domain: Biology / Bioinformatics
install: pip install biopython
---

# Biopython — Biological Computation Toolkit / 生物计算工具包

Biopython provides tools for biological computation: sequence analysis, 3D structure parsing, database access (NCBI, UniProt, PDB), population genetics, and phylogenetics.

## When to Use / 适用场景

- Parsing and analyzing DNA/RNA/protein sequences
- Running BLAST and parsing results programmatically
- Working with PDB 3D structure files
- Accessing NCBI, UniProt, ExPASy databases via API
- Phylogenetic tree construction and analysis
- Reading/writing bioinformatics file formats (FASTA, GenBank, PDB, Stockholm, etc.)

## Quick Start / 快速开始

```python
from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqRecord import SeqRecord

# Read FASTA file
for record in SeqIO.parse("sequences.fasta", "fasta"):
    print(f"{record.id}: {len(record.seq)} bp, GC={100 * (record.seq.count('G') + record.seq.count('C')) / len(record.seq):.1f}%")

# Create sequence record
seq = Seq("ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG")
record = SeqRecord(seq, id="gene1", description="Example gene")

# Basic sequence operations
complement = seq.complement()        # ATG → TAC
reverse_comp = seq.reverse_complement()  # Reverse complement
transcribed = seq.transcribe()       # DNA → RNA
translated = seq.translate()         # DNA/RNA → Protein
```

## Core Capabilities / 核心能力

### 1. Sequence I/O and Manipulation / 序列读写与操作

```python
from Bio import SeqIO

# Read multiple formats
records = list(SeqIO.parse("input.gb", "genbank"))
SeqIO.write(records, "output.fasta", "fasta")

# Filter sequences
long_seqs = [r for r in SeqIO.parse("data.fasta", "fasta") if len(r.seq) > 500]

# Batch conversion
SeqIO.convert("input.fasta", "fasta", "output.gb", "genbank")

# Sequence slicing (preserves annotations with SeqRecord)
sub_record = record[100:200]

# GC content calculation
from Bio.SeqUtils import gc_fraction
gc = gc_fraction(record.seq)  # Returns float 0.0-1.0
```

### 2. NCBI Database Access / NCBI 数据库访问

```python
from Bio import Entrez

Entrez.email = "your@email.com"  # Required by NCBI

# Search PubMed
handle = Entrez.esearch(db="pubmed", term="CRISPR[Title]", retmax=20)
results = Entrez.read(handle)
pmids = results["IdList"]

# Fetch PubMed records
handle = Entrez.efetch(db="pubmed", id=pmids[:5], rettype="abstract", retmode="text")
abstracts = handle.read()

# Search and fetch nucleotide sequences
handle = Entrez.esearch(db="nucleotide", term="BRCA1[Gene] AND Homo sapiens[Organism]")
results = Entrez.read(handle)

# Fetch GenBank record
handle = Entrez.efetch(db="nucleotide", id="NM_007294", rettype="gb", retmode="text")
record = SeqIO.read(handle, "genbank")

# Get taxonomy info
handle = Entrez.efetch(db="Taxonomy", id="9606", retmode="xml")
records = Entrez.read(handle)
```

### 3. BLAST Integration / BLAST 集成

```python
from Bio.Blast import NCBIWWW, NCBIXML

# Run BLAST against NCBI
result_handle = NCBIWWW.qblast("blastn", "nt", "ATGGCCATTGTAATGGGCCGCTGAA")

# Parse BLAST results
blast_records = NCBIXML.parse(result_handle)
for record in blast_records:
    for alignment in record.alignments:
        for hsp in alignment.hsps:
            print(f"  {alignment.title}: E={hsp.expect:.2e}, Identity={hsp.identities}/{hsp.align_length}")

# Local BLAST (requires BLAST+ installed)
from Bio.Blast.Applications import NcbiblastnCommandline
blastn_cline = NcbiblastnCommandline(query="query.fasta", db="nt", evalue=0.001, outfmt=5)
stdout, stderr = blastn_cline()
```

### 4. PDB Structure Parsing / PDB 结构解析

```python
from Bio.PDB import PDBParser, MMCIFParser

parser = PDBParser(QUIET=True)
structure = parser.get_structure("1TUP", "1tup.pdb")

# Iterate atoms
for model in structure:
    for chain in model:
        for residue in chain:
            for atom in residue:
                print(f"{chain.id}:{residue.resname}:{atom.name} @ {atom.coord}")

# Calculate distances
import numpy as np
atom1 = structure[0]["A"][100]["CA"]
atom2 = structure[0]["B"][200]["CA"]
distance = np.linalg.norm(atom1.coord - atom2.coord)

# Superimpose structures
from Bio.PDB import Superimposer
si = Superimposer()
si.set_atoms(ref_atoms, mobile_atoms)
si.apply(mobile_structure)
print(f"RMSD: {si.rms:.3f} Å")
```

### 5. Phylogenetic Trees / 系统发育树

```python
from Bio import Phylo
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor

# Read Newick tree
tree = Phylo.read("tree.nwk", "newick")
Phylo.draw_ascii(tree)

# Construct from alignment
from Bio import AlignIO
alignment = AlignIO.read("aligned.fasta", "fasta")
calculator = DistanceCalculator("identity")
dm = calculator.get_distance(alignment)
constructor = DistanceTreeConstructor()
tree = constructor.nj(dm)  # Neighbor-joining

# Draw with matplotlib
import matplotlib.pyplot as plt
fig, ax = plt.subplots(figsize=(10, 8))
Phylo.draw(tree, axes=ax)
plt.savefig("phylo_tree.pdf", bbox_inches="tight")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Multi-Gene Sequence Analysis / 多基因序列分析

```python
from Bio import SeqIO, AlignIO
from Bio.SeqUtils import gc_fraction, molecular_weight
from Bio.Blast import NCBIWWW, NCBIXML
import pandas as pd

# 1. Load and characterize sequences
results = []
for record in SeqIO.parse("genes.fasta", "fasta"):
    gc = gc_fraction(record.seq)
    mw = molecular_weight(record.seq, seq_type="DNA")
    aa_len = len(record.seq.translate(stop_symbol=""))
    results.append({"id": record.id, "length": len(record.seq), "gc": gc, "mw": mw, "aa_length": aa_len})
df = pd.DataFrame(results)

# 2. Translate and identify ORFs
for record in SeqIO.parse("genes.fasta", "fasta"):
    for frame in range(3):
        translated = record.seq[frame:].translate()
        orfs = translated.split("*")
        long_orfs = [o for o in orfs if len(o) > 100]
        for i, orf in enumerate(long_orfs):
            print(f"{record.id} frame+{frame} ORF{i}: {len(orf)} aa")
```

### Workflow 2: Literature Mining via PubMed / PubMed 文献挖掘

```python
from Bio import Entrez
import time

Entrez.email = "researcher@university.edu"

def search_and_fetch(query, max_results=50):
    handle = Entrez.esearch(db="pubmed", term=query, retmax=max_results, sort="relevance")
    results = Entrez.read(handle)
    pmids = results["IdList"]
    
    papers = []
    for i in range(0, len(pmids), 10):
        batch = pmids[i:i+10]
        handle = Entrez.efetch(db="pubmed", id=batch, rettype="medline", retmode="text")
        records = Entrez.read(handle)
        for rec in records:
            papers.append({
                "pmid": rec.get("PMID", ""),
                "title": rec.get("TI", ""),
                "authors": rec.get("AU", []),
                "journal": rec.get("JT", ""),
                "year": rec.get("DP", "").split()[0] if rec.get("DP") else "",
                "abstract": " ".join(rec.get("AB", ""))
            })
        time.sleep(0.5)  # Respect NCBI rate limits
    return pd.DataFrame(papers)
```

## Key Parameters / 关键参数

| Parameter | Context | Typical Values |
|-----------|---------|----------------|
| `Entrez.email` | NCBI access | Required, your email |
| `retmax` | Result count | 20-1000 |
| `evalue` | BLAST threshold | 0.001-0.0001 for stringent |
| `outfmt` | BLAST output | 5=XML, 6=tabular |
| `QUIET` | PDBParser | True suppresses warnings |
| `seq_type` | molecular_weight | "DNA", "RNA", "protein" |

## Best Practices / 最佳实践

- Always set `Entrez.email` before NCBI queries; NCBI may block without it
- Use `time.sleep(0.5)` between batch NCBI requests to respect rate limits
- Use `SeqIO.parse()` (generator) for large files instead of `list(SeqIO.parse())`
- For BLAST, prefer local BLAST+ for large-scale analyses (NCBI limits queries)
- Use `QUIET=True` in PDBParser to suppress common PDB format warnings
- Handle ambiguous nucleotides (N, R, Y) explicitly in calculations

## Common Pitfalls / 常见陷阱

- **NCBI rate limiting**: Exceeding 3 requests/second causes IP blocks; use `time.sleep()`
- **Sequence indexing**: Biopython uses 0-based indexing, not 1-based like GenBank
- **PDB residue numbering**: May have insertion codes; use `(hetflag, resseq, icode)` tuple
- **Translation tables**: Default is Standard (1); use mitochondrial (2) or others as needed
- **Memory**: Loading entire large FASTA files into memory; use iterator patterns instead

## Integration with HBE / 与 HBE 集成

- Use in `workflows/experiment-design.md` for bioinformatics experiment planning
- Pair with `references/tools/scanpy.md` for single-cell + sequence analysis pipelines
- Use with `references/tools/rdkit.md` for protein-ligand interaction studies
- Integrate with `workflows/literature-review.md` for PubMed systematic searches
- Feed results to `references/tools/pandas.md` for statistical analysis

## Resources / 资源

- Documentation: https://biopython.org/wiki/Documentation
- Tutorial: https://biopython.org/wiki/SeqIO
- NCBI Entrez Guide: https://www.ncbi.nlm.nih.gov/books/NBK25499/
- PDB Format Guide: https://www.wwpdb.org/documentation/file-format
