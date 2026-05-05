---
name: primekg
description: Precision Medicine Knowledge Graph — drug-disease-gene interactions for biomedical AI research
domain: Medicine / Knowledge Graphs
install: pip install primekg
---

# primekg — Precision Medicine Knowledge Graph

PrimeKG (Precision Medicine Knowledge Graph) is a large-scale heterogeneous biomedical knowledge graph integrating relationships between drugs, diseases, genes, pathways, and side effects. It enables drug repurposing, target identification, and network medicine research through graph-based queries and analysis.

## When to Use

- Drug repurposing: finding existing drugs that may treat new diseases
- Target identification: discovering genes/proteins associated with a disease
- Network medicine: analyzing disease modules and pathway crosstalk
- Building graph neural network models for drug-disease prediction
- Exploring drug-drug interactions, side effects, and pharmacogenomics

## Quick Start

```python
import pandas as pd
import networkx as nx

# Load PrimeKG (download from https://github.com/masalvaro/primekg)
primekg = pd.read_csv("primekg.csv")
# Columns: relation, source, source_id, target, target_id, source_type, target_type

print(f"Total edges: {len(primekg):,}")
print(f"Edge types: {primekg['relation'].value_counts().head(10).to_dict()}")

# Extract specific subgraphs
drug_disease = primekg[primekg["relation"] == "drug_disease"]
gene_disease = primekg[primekg["relation"] == "gene_disease"]
drug_gene = primekg[primekg["relation"] == "drug_gene"]
print(f"Drug-disease edges: {len(drug_disease):,}")
print(f"Gene-disease edges: {len(gene_disease):,}")
```

## Core Capabilities

### Building and Querying the Knowledge Graph

```python
import pandas as pd
import networkx as nx

primekg = pd.read_csv("primekg.csv")

# Build a NetworkX heterogeneous graph
G = nx.from_pandas_edgelist(
    primekg, source="source", target="target",
    edge_attr=["relation", "source_type", "target_type"],
    create_using=nx.MultiDiGraph(),
)

# Query: find all drugs associated with a disease
disease = "Alzheimer's disease"
neighbors = list(G.predecessors(disease))
drug_neighbors = [n for n in neighbors if primekg[primekg["source"] == n]["source_type"].iloc[0] == "drug"]
print(f"Drugs linked to {disease}: {drug_neighbors[:10]}")

# Query: find all genes associated with a disease
gene_neighbors = [n for n in neighbors if primekg[primekg["source"] == n]["source_type"].iloc[0] == "gene"]
print(f"Genes linked to {disease}: {gene_neighbors[:10]}")

# Query: shortest path between a drug and a disease
drug = "Metformin"
try:
    path = nx.shortest_path(G, source=drug, target=disease)
    print(f"Path from {drug} to {disease}: {' -> '.join(path)}")
except nx.NetworkXNoPath:
    print("No path found")
```

### Drug-Disease-Gene Triplet Extraction

```python
import pandas as pd
from collections import defaultdict

primekg = pd.read_csv("primekg.csv")

# Build adjacency lists for fast lookup
drug_to_diseases = defaultdict(set)
gene_to_diseases = defaultdict(set)
disease_to_drugs = defaultdict(set)
disease_to_genes = defaultdict(set)

for _, row in primekg.iterrows():
    rel, src, tgt = row["relation"], row["source"], row["target"]
    src_type, tgt_type = row.get("source_type", ""), row.get("target_type", "")

    if rel == "drug_disease":
        drug_to_diseases[src].add(tgt)
        disease_to_drugs[tgt].add(src)
    elif rel == "gene_disease":
        gene_to_diseases[src].add(tgt)
        disease_to_genes[tgt].add(src)

# Find drugs and genes that share disease associations (potential drug targets)
target_disease = "Breast cancer"
shared = drug_to_diseases.keys() & {g for g in disease_to_genes[target_disease]}
# Filter to drug-gene edges
drug_gene_edges = primekg[primekg["relation"] == "drug_gene"]
for drug in shared:
    targets = drug_gene_edges[drug_gene_edges["source"] == drug]["target"].tolist()
    gene_targets_in_disease = [t for t in targets if t in disease_to_genes[target_disease]]
    if gene_targets_in_disease:
        print(f"{drug} targets {gene_targets_in_disease} in {target_disease}")
```

### Network Analysis with Community Detection

```python
import networkx as nx
import pandas as pd
from networkx.algorithms.community import greedy_modularity_communities

primekg = pd.read_csv("primekg.csv")

# Build a projected drug-disease bipartite graph
dd = primekg[primekg["relation"].isin(["drug_disease", "drug_gene", "gene_disease"])]
G = nx.from_pandas_edgelist(dd, source="source", target="target", create_using=nx.Graph())

# Degree centrality — find the most connected entities
degrees = dict(G.degree())
top_entities = sorted(degrees.items(), key=lambda x: x[1], reverse=True)[:20]
print("Top 20 most connected entities:")
for entity, deg in top_entities:
    print(f"  {entity}: {deg}")

# Community detection — identify disease modules
communities = list(greedy_modularity_communities(G))
print(f"\nDetected {len(communities)} communities")
for i, comm in enumerate(communities[:5]):
    nodes = list(comm)[:5]
    print(f"  Community {i}: {nodes}... ({len(comm)} nodes)")
```

## Common Academic Workflow: Drug Repurposing Pipeline

```python
import pandas as pd
import networkx as nx
from collections import defaultdict

# 1. Load PrimeKG
kg = pd.read_csv("primekg.csv")

# 2. Define the target disease
target = "Parkinson's disease"

# 3. Get all known drugs for the target disease (positive set)
known_drugs = set(kg[(kg["relation"] == "drug_disease") & (kg["target"] == target)]["source"])

# 4. Get candidate drugs (drugs NOT linked to target disease)
all_drugs = set(kg[kg["source_type"] == "drug"]["source"])
candidate_drugs = all_drugs - known_drugs

# 5. Score candidates by shared gene targets with known drugs
drug_gene = defaultdict(set)
for _, row in kg[kg["relation"] == "drug_gene"].iterrows():
    drug_gene[row["source"]].add(row["target"])

known_gene_targets = set()
for drug in known_drugs:
    known_gene_targets.update(drug_gene[drug])

scores = {}
for candidate in candidate_drugs:
    overlap = len(drug_gene[candidate] & known_gene_targets)
    scores[candidate] = overlap

# 6. Rank and report top candidates
ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:20]
print(f"Top 20 drug repurposing candidates for {target}:")
for drug, score in ranked:
    print(f"  {drug}: shared gene targets = {score}")
```

## Best Practices

- **Filter by relation type** before analysis — PrimeKG has many edge types; focus on relevant ones (drug_disease, gene_disease, drug_gene).
- **Use node types** (source_type, target_type) to avoid confusing drugs and genes with similar names.
- **Validate predictions** against external databases (DrugBank, ChEMBL, ClinicalTrials.gov) before drawing conclusions.
- **Report graph statistics** (nodes, edges, density, connectivity) in methods sections for reproducibility.

## Common Pitfalls

- **Name ambiguity**: The same entity name may appear with different IDs. Always use canonical IDs (e.g., DrugBank ID, UniProt ID) for disambiguation.
- **Directionality matters**: "drug treats disease" is different from "drug causes side effect". Check the `relation` column carefully.
- **Graph sparsity**: Many drug-disease pairs have no direct edge. Use path-based or embedding-based methods to bridge gaps.
- **Version changes**: PrimeKG is updated periodically. Pin the version you used and report it in your methods.

## Integration with HBE

- Use within `workflows/experiment-design.md` for biomedical study design and hypothesis generation
- Pair with `references/tools/networkx.md` for advanced graph algorithms and centrality analysis
- Combine with `references/tools/pandas.md` for filtering and aggregating graph edge tables
- Use alongside `references/tools/matplotlib.md` for network visualization and community plots

## Resources

- Paper: Zitnik et al., "PrimeKG: A Precision Medicine Knowledge Graph" (2024)
- GitHub: https://github.com/masalvaro/primekg
- Data download: https://zenodo.org/record/XXXXXXX (search PrimeKG on Zenodo)
