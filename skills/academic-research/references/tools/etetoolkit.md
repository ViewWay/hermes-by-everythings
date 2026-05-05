---
name: etetoolkit
description: ETE Toolkit — phylogenetic tree analysis, visualization, and programmatic manipulation
domain: Biology / Phylogenetics
install: pip install ete3
---

# ETE Toolkit — Phylogenetic Tree Analysis and Visualization / 系统发育树分析与可视化

ETE (Environment for Tree Exploration) is a Python library for analyzing, manipulating, and visualizing phylogenetic trees. It provides a programmatic tree object model, supports Newick and PhyloXML formats, and offers powerful face-based tree rendering for publication-quality figures.

## When to Use / 适用场景

- Visualizing phylogenetic trees with custom annotations (metadata, images, bar charts)
- Programmatically searching and pruning tree topologies
- Computing tree statistics (distances, monophyly tests, common ancestors)
- Rendering large trees with collapsed clades and dynamic zoom
- Adding sequence alignments, protein domains, or sample metadata to tree nodes
- Interactive tree exploration and export to SVG/PDF

## Quick Start / 快速开始

```python
from ete3 import Tree, TreeStyle

# Create or load a tree
t = Tree("((A:0.1,B:0.2):0.3,(C:0.3,D:0.4):0.5);")
print(t)

# Basic operations
print(f"Leaves: {len(t.get_leaf_names())}")        # ['A', 'B', 'C', 'D']
print(f"Total branch length: {t.get_tree_length():.1f}")

# Find and annotate
A = t.search_nodes(name="A")[0]
print(f"Distance A to root: {A.get_distance(t):.2f}")
print(f"Common ancestor of A and D: {t.get_common_ancestor('A', 'D').name}")

# Simple visualization
ts = TreeStyle()
ts.show_leaf_name = True
t.render("basic_tree.pdf", tree_style=ts)
print("Tree rendered to basic_tree.pdf")
```

## Core Capabilities / 核心能力

### 1. Tree Construction and Manipulation / 树的构建与操作

```python
from ete3 import Tree
import random

# Load from Newick string or file
t = Tree("(((human:0.01,chimp:0.02):0.05,gorilla:0.08):0.1,orangutan:0.15);")
t = Tree("newick_tree.nwk", format=1)  # format=1 adds internal node names

# Traverse the tree
for node in t.traverse("postorder"):
    if node.is_leaf():
        print(f"Leaf: {node.name}, distance: {node.dist:.3f}")
    else:
        print(f"Internal: children={len(node.children)}")

# Prune and modify
t.prune(["human", "chimp", "gorilla"])  # Keep only these leaves
t.set_outgroup(t.search_nodes(name="gorilla")[0])  # Reroot

# Monophyly test
is_mono = t.check_monophyly(["human", "chimp"], "ingroup")
print(f"Human+chimp monophyletic: {is_mono[0]}")

# Random tree generation
random_tree = Tree()
random_tree.populate(size=20, names_library=[f"taxon_{i}" for i in range(20)])
print(f"Random tree: {len(random_tree)} leaves")
```

### 2. Tree Visualization with TreeStyle / 树可视化与样式定制

```python
from ete3 import Tree, TreeStyle, NodeStyle, faces, AttrFace

t = Tree("((human:0.01,chimp:0.02):0.05,(mouse:0.1,rat:0.08):0.2);")

# Define node styles
node_style = NodeStyle()
node_style["shape"] = "circle"
node_style["size"] = 8
node_style["fgcolor"] = "#666666"

for node in t.traverse():
    node.set_style(node_style)
    if node.is_leaf():
        name_face = AttrFace("name", fsize=12, ftype="Arial")
        faces.add_face_to_node(name_face, node, column=0, position="branch-right")

# Configure tree style
ts = TreeStyle()
ts.show_leaf_name = True
ts.mode = "r"  # Rectangular layout ("c" for circular)
ts.scale = 200  # Pixels per branch length unit
ts.branch_length_vertical = 15
ts.title.add_face(faces.TextFace("Species Phylogeny", fsize=16), column=0)

# Add legend
ts.legend.add_face(faces.TextFace("Primates", fsize=10, fgcolor="red"), column=0)
ts.legend_position = 2

t.render("styled_tree.pdf", tree_style=ts, dpi=300)
t.render("styled_tree.svg", tree_style=ts)  # SVG for editing
print("Styled tree saved as PDF and SVG")
```

### 3. Tree Annotation with Metadata / 树注释与元数据

```python
from ete3 import Tree, TreeStyle, faces, AttrFace, BarChartFace
import pandas as pd

# Load tree and metadata
t = Tree("species_tree.nwk")
metadata = pd.read_csv("species_metadata.csv")  # columns: species, habitat, weight

# Map metadata to tree nodes
meta_dict = dict(zip(metadata["species"], metadata.to_dict("records")))

for node in t.traverse():
    if node.name in meta_dict:
        info = meta_dict[node.name]
        node.add_features(habitat=info["habitat"], weight=info["weight"])

# Add bar charts to nodes
def layout(node):
    if hasattr(node, "weight"):
        bar = BarChartFace(
            values=[node.weight],
            labels=["Weight"],
            colors=["#4285F4"],
            width=50, height=40
        )
        faces.add_face_to_node(bar, node, column=1, position="branch-top")
    if hasattr(node, "habitat"):
        habitat_face = AttrFace("habitat", fsize=8, fgcolor="#34A853")
        faces.add_face_to_node(habitat_face, node, column=2, position="branch-bottom")

ts = TreeStyle()
ts.layout_fn = layout
ts.show_leaf_name = True
t.render("annotated_tree.pdf", tree_style=ts, dpi=300)
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Publication-Quality Annotated Tree / 出版级注释树图

```python
from ete3 import Tree, TreeStyle, NodeStyle, faces, TextFace
import numpy as np

# Load tree from phylogenetic analysis
t = Tree("phylo_result.nwk")

# Color clades by group
clade_colors = {"Clade_A": "#E74C3C", "Clade_B": "#3498DB", "Clade_C": "#2ECC71"}
groups = {"human": "Clade_A", "chimp": "Clade_A", "gorilla": "Clade_A",
          "mouse": "Clade_B", "rat": "Clade_B",
          "chicken": "Clade_C", "zebrafish": "Clade_C"}

def publication_layout(node):
    if node.is_leaf():
        group = groups.get(node.name, "Unknown")
        color = clade_colors.get(group, "#999999")
        name_face = TextFace(node.name, fsize=11, ftype="Helvetica", fgcolor=color)
        faces.add_face_to_node(name_face, node, column=0, position="branch-right")
    elif hasattr(node, "support") and node.support:
        support_text = f"{node.support * 100:.0f}%"
        support_face = TextFace(support_text, fsize=9, fgcolor="#555555")
        faces.add_face_to_node(support_face, node, column=0, position="branch-top")

ts = TreeStyle()
ts.layout_fn = publication_layout
ts.show_leaf_name = False
ts.mode = "r"
ts.scale = 150
ts.branch_length_vertical = 12
ts.optimal_scale_level = "full"

t.render("publication_tree.pdf", tree_style=ts, dpi=600, units="mm")
print("Publication tree saved to publication_tree.pdf")
```

## Best Practices / 最佳实践

1. **Use SVG for editing**: Render to SVG for final figure assembly in Inkscape or Illustrator
2. **Scale appropriately**: Set `ts.scale` based on tree depth; `ts.optimal_scale_level = "full"` auto-adjusts
3. **Layout functions**: Use custom `layout_fn` for complex annotations
4. **Large trees**: Use `ts.mode = "c"` (circular) for trees with >50 tips; collapse clades
5. **Node features**: Use `node.add_features()` to attach metadata; access via `node.feature_name`

## Common Pitfalls / 常见陷阱

- **Newick format issues**: Different tools use different conventions; use `format=1` for internal names
- **Memory for large trees**: Trees with >10,000 nodes can be slow to render; use circular layout
- **Face positioning**: Faces may overlap; adjust column numbers and positions carefully
- **Missing support values**: Check with `hasattr(node, 'support')` before accessing
- **Circular layout text**: Text orientation in circular mode can be confusing; test with SVG first

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/phylogenetics.md` for tree construction and statistical analysis
- Use with `references/tools/biopython.md` for sequence alignment before tree building
- Combine with `references/tools/matplotlib.md` for supplementary plots alongside trees
- Integrate with `workflows/experiment-design.md` for evolutionary biology workflows

## Resources / 资源

- Documentation: http://etetoolkit.org/docs/latest/
- Tutorial: http://etetoolkit.org/docs/latest/tutorial/tutorial_trees.html
- Gallery: http://etetoolkit.org/docs/latest/tutorial/examples.html
- Repository: https://github.com/etetoolkit/ete
- Paper: Huerta-Cepas et al., "ETE: A Python Environment for Tree Exploration," BMC Bioinformatics 2010
