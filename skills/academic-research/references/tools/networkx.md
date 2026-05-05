---
name: networkx
description: Graph/network analysis library. Use for social network analysis, citation graphs, biological networks, and graph algorithms (centrality, community detection, path finding).
domain: cross-domain
install: pip install networkx
---

# NetworkX: Graph & Network Analysis

## Overview

NetworkX provides graph data structures and algorithms for analyzing complex networks — social networks, citation graphs, biological networks, infrastructure, and more.

## When to Use

- Social network analysis
- Citation/co-authorship network analysis
- Community detection
- Centrality analysis
- Graph visualization
- Any research involving networks or graphs

## Quick Start

```python
import networkx as nx
import matplotlib.pyplot as plt

# Create graph
G = nx.Graph()
G.add_edges_from([(1,2), (2,3), (3,4), (4,1), (1,3)])

# Basic metrics
print(f'Nodes: {G.number_of_nodes()}, Edges: {G.number_of_edges()}')
print(f'Density: {nx.density(G):.3f}')

# Centrality
degree = nx.degree_centrality(G)
betweenness = nx.betweenness_centrality(G)
pagerank = nx.pagerank(G)

# Community detection
from networkx.algorithms.community import louvain_communities
communities = louvain_communities(G)

# Visualize
nx.draw(G, with_labels=True, node_color='lightblue', node_size=500)
plt.savefig('network.pdf')
```

## Core Capabilities

### 1. Centrality and Key Nodes

```python
# Degree centrality (most connections)
nx.degree_centrality(G)

# Betweenness (bridge nodes)
nx.betweenness_centrality(G)

# Closeness (average distance to all others)
nx.closeness_centrality(G)

# Eigenvector (influence)
nx.eigenvector_centrality(G)

# PageRank
nx.pagerank(G)
```

### 2. Community Detection

```python
# Louvain method
from networkx.algorithms.community import louvain_communities
communities = louvain_communities(G, resolution=1.0)

# Label propagation
from networkx.algorithms.community import label_propagation_communities
communities = label_propagation_communities(G)
```

### 3. Citation Network Analysis

```python
# Build from citation data
G = nx.DiGraph()
for _, row in citations.iterrows():
    G.add_edge(row['citing'], row['cited'])

# Find influential papers (in-degree = citations)
in_degree = dict(G.in_degree())
top_papers = sorted(in_degree, key=in_degree.get, reverse=True)[:10]

# Shortest citation path
path = nx.shortest_path(G, source='paper_A', target='paper_B')
```

## Best Practices

1. **Use DiGraph for citations**: Directed (citing → cited)
2. **Use largest connected component**: `max(nx.connected_components(G), key=len)`
3. **Sample large networks**: >10K nodes → use subgraph for visualization

## Integration with HBE

- Graph analysis tool in `references/tool-registry.md`
- Supports `references/scientific-databases-guide.md` citation graph analysis
- Works with `references/tools/matplotlib.md` for network visualization

## Resources

- Documentation: https://networkx.org/documentation/stable/
- Hagberg et al. (2008) "Exploring Network Structure" — SciPy proceedings
