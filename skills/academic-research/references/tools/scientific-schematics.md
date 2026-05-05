---
name: scientific-schematics
description: Scientific diagram creation — workflow diagrams, system architectures, and conceptual figures
domain: Research / Figures
install: pip install matplotlib 2>/dev/null; brew install --cask drawio 2>/dev/null
---

# Scientific Schematics — Diagram Creation for Research

## Overview

Scientific schematics communicate research workflows, system architectures, and conceptual models. Tools range from TikZ (programmatic, LaTeX-native) to draw.io (visual editor) and mermaid (text-based, web-friendly). Choosing the right tool depends on the figure's complexity, reproducibility needs, and target venue.

## When to Use

- Illustrating experimental workflows and pipelines in papers
- Drawing system architecture diagrams for methods sections
- Creating conceptual models for proposals and presentations
- Building flowcharts for algorithms and decision processes
- Designing overview figures for review articles

## Quick Start

### TikZ Workflow Diagram (LaTeX-native)

```latex
\documentclass[border=10pt]{standalone}
\usepackage{tikz}
\usetikzlibrary{shapes.geometric, arrows.meta, positioning, fit}

\begin{document}
\begin{tikzpicture}[
    node distance=1.5cm,
    block/.style={rectangle, draw, rounded corners, fill=blue!10,
                  minimum height=1cm, minimum width=2.5cm, align=center},
    arrow/.style={-Stealth, thick}
]
    \node[block] (data) {Raw Data};
    \node[block, right=of data] (preprocess) {Preprocessing};
    \node[block, right=of preprocess] (model) {Model\\Training};
    \node[block, right=of model] (eval) {Evaluation};
    \node[block, below=of eval] (deploy) {Deployment};

    \draw[arrow] (data) -- (preprocess);
    \draw[arrow] (preprocess) -- (model);
    \draw[arrow] (model) -- (eval);
    \draw[arrow] (eval) -- (deploy);
    \draw[arrow, dashed] (eval.south) -- ++(0,-0.5) -| node[near start, above]{feedback} (model.south);
\end{tikzpicture}
\end{document}
```

### Mermaid Diagram (Markdown-native)

```markdown
\`\`\`mermaid
graph TD
    A[Raw Data] --> B[Preprocessing]
    B --> C[Feature Extraction]
    C --> D[Model Training]
    D --> E[Evaluation]
    E -->|Pass| F[Deployment]
    E -->|Fail| D
\`\`\`
```

## Core Capabilities

### 1. TikZ Advanced Patterns

Common patterns for scientific figures in LaTeX papers.

```latex
% Multi-panel experimental pipeline
\begin{tikzpicture}[
    node distance=1.2cm and 1.8cm,
    process/.style={rectangle, draw, fill=blue!10, minimum width=2cm,
                    minimum height=0.8cm, align=center, font=\small},
    data/.style={trapezium, draw, fill=green!10, trapezium left angle=70,
                 trapezium right angle=110, minimum width=1.8cm,
                 font=\small, align=center},
    decision/.style={diamond, draw, fill=orange!10, aspect=2,
                     font=\small, align=center, inner sep=1pt},
]

% Pipeline nodes
\node[data] (input) {Input\\Data};
\node[process, right=of input] (clean) {Data\\Cleaning};
\node[process, right=of clean] (feat) {Feature\\Engineering};
\node[process, right=of feat] (train) {Model\\Training};
\node[decision, right=of train] (good) {Good?};
\node[process, right=of good] (output) {Results};

% Edges
\draw[-Stealth, thick] (input) -- (clean);
\draw[-Stealth, thick] (clean) -- (feat);
\draw[-Stealth, thick] (feat) -- (train);
\draw[-Stealth, thick] (train) -- (good);
\draw[-Stealth, thick] (good) -- node[above]{\scriptsize Yes} (output);
\draw[-Stealth, thick, dashed] (good) -- ++(0,-1) -| node[near start, right]{\scriptsize No} (feat);
\end{tikzpicture}
```

```latex
% Neural network architecture diagram
\begin{tikzpicture}[
    neuron/.style={circle, draw, minimum size=0.4cm, inner sep=0pt},
    layer/.style={rectangle, draw, dashed, inner sep=0.3cm, rounded corners},
]
% Input layer
\foreach \i in {1,2,3} {
    \node[neuron, fill=blue!20] (i\i) at (0, -\i*0.8) {};
}
% Hidden layer 1
\foreach \i in {1,...,4} {
    \node[neuron, fill=red!20] (h1\i) at (2, -\i*0.8+0.4) {};
}
% Hidden layer 2
\foreach \i in {1,...,4} {
    \node[neuron, fill=red!20] (h2\i) at (4, -\i*0.8+0.4) {};
}
% Output layer
\foreach \i in {1,2} {
    \node[neuron, fill=green!20] (o\i) at (6, -\i*0.8-0.4) {};
}
% Connections
\foreach \i in {1,2,3} {
    \foreach \j in {1,...,4} {
        \draw[gray!50, thin] (i\i) -- (h1\j);
    }
}
\foreach \i in {1,...,4} {
    \foreach \j in {1,...,4} {
        \draw[gray!50, thin] (h1\i) -- (h2\j);
    }
}
\foreach \i in {1,...,4} {
    \foreach \j in {1,2} {
        \draw[gray!50, thin] (h2\i) -- (o\j);
    }
}
% Labels
\node[above=0.3cm of i1, font=\footnotesize] {Input};
\node[above=0.3cm of h11, font=\footnotesize] {Hidden 1};
\node[above=0.3cm of h21, font=\footnotesize] {Hidden 2};
\node[above=0.3cm of o1, font=\footnotesize] {Output};
\end{tikzpicture}
```

### 2. draw.io Integration

For complex diagrams that benefit from visual editing.

```bash
# Install draw.io desktop app
brew install --cask drawio

# Open a diagram file
drawio figures/architecture.drawio

# Export to PDF for LaTeX inclusion
# File > Export as > PDF

# Export to SVG for web or further editing
# File > Export as > SVG
```

Best practices for draw.io:
- Use consistent colors for similar element types
- Group related elements with containers
- Set page size to match your paper column width (3.5in / 7in)
- Export as PDF for vector-quality LaTeX inclusion

### 3. Arrow and Flow Conventions

Standard visual conventions for scientific diagrams.

```markdown
## Arrow Conventions
| Arrow Type | Meaning | TikZ Code |
|-----------|---------|-----------|
| Solid arrow | Direct data/control flow | \draw[-Stealth] |
| Dashed arrow | Optional or feedback | \draw[-Stealth, dashed] |
| Thick arrow | Primary workflow | \draw[-Stealth, very thick] |
| Bidirectional | Data exchange | \draw[Stealth-Stealth] |
| Red arrow | Error or failure path | \draw[-Stealth, red] |

## Color Conventions
| Color | Meaning |
|-------|---------|
| Blue | Input data or processing |
| Green | Output or success |
| Orange | Decision or evaluation |
| Red | Error or failure |
| Gray | Auxiliary or optional |
```

## Common Academic Workflow

### Methods Figure for a Paper

```bash
# Step 1: Create TikZ figure in standalone document
cat > figures/methods_overview.tex << 'EOF'
\documentclass[border=5pt]{standalone}
\usepackage{tikz}
\usetikzlibrary{shapes.geometric, arrows.meta, positioning}
% ... (your TikZ code here) ...
\begin{document}
\begin{tikzpicture}
% ... nodes and edges ...
\end{tikzpicture}
\end{document}
EOF

# Step 2: Compile to PDF
pdflatex figures/methods_overview.tex

# Step 3: Crop margins
pdfcrop figures/methods_overview.pdf figures/methods_overview.pdf

# Step 4: Include in paper
# \includegraphics[width=\linewidth]{figures/methods_overview.pdf}
```

## Best Practices

1. **Use standalone document class**: Compile diagrams as separate PDFs for easy management and reuse.
2. **Consistent style across figures**: Define TikZ styles once and reuse; use a shared `.tikzstyles` file.
3. **Label everything**: Every node and arrow should have descriptive text.
4. **Match column width**: Size diagrams to fit single (3.5in) or double (7in) column.
5. **Vector formats only**: Never use raster images for diagrams — always PDF or SVG.

## Common Pitfalls

1. **Overly complex diagrams**: Limit to 7-9 nodes; split into sub-figures if needed.
2. **Inconsistent notation**: Use the same symbols and colors throughout the paper.
3. **Too small text**: Font sizes below 6pt are unreadable in print; simplify the diagram instead.
4. **No legend**: Always include a legend explaining symbols, colors, and arrow types.

## Integration with HBE

- Use with `references/tools/matplotlib.md` for data-driven figures alongside schematics
- Pair with `references/tools/pdfcrop.md` to clean diagram margins
- Supports `workflows/paper-writing.md` Phase 3 (Visual Elements)
- Combine with `references/tools/inkscape-cli.md` for final figure polishing

## Resources

- TikZ documentation: https://tikz.dev/
- TikZ examples gallery: https://texample.net/tikz/examples/
- draw.io: https://www.drawio.com/
- Mermaid documentation: https://mermaid.js.org/
- "The TikZ and PGF Packages" manual: `texdoc tikz`
