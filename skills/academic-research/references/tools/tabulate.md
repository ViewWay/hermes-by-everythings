---
name: tabulate
description: Pretty-print tabular data — generate publication-quality tables in markdown, LaTeX, HTML, and more
domain: Research / Formatting
install: pip install tabulate
---

# tabulate — Pretty-Print Tabular Data

Tabulate is a Python library for printing tabular data in well-formatted text tables. It supports markdown, LaTeX (including booktabs), HTML, grid, pipe, and many other formats, making it essential for generating tables in papers, reports, and notebooks.

## When to Use

- Formatting results tables for LaTeX papers (especially with `booktabs` style)
- Generating markdown tables for GitHub READMEs and Jupyter notebooks
- Creating reproducible tables from pandas DataFrames in analysis scripts
- Batch-generating tables in multiple formats from the same data source
- Quickly previewing data in a readable text format in the terminal

## Quick Start

```python
from tabulate import tabulate

# Basic markdown table
headers = ["Method", "Accuracy", "F1", "Time (s)"]
data = [
    ["Logistic Regression", 0.852, 0.831, 1.2],
    ["Random Forest", 0.914, 0.908, 5.7],
    ["Transformer (Ours)", 0.937, 0.931, 12.3],
]
print(tabulate(data, headers=headers, tablefmt="github", floatfmt=".3f"))
# Produces a clean GitHub-flavored markdown table

# LaTeX booktabs output (paste directly into your paper)
print(tabulate(data, headers=headers, tablefmt="latex_booktabs", floatfmt=".3f"))
# Produces: \begin{tabular}{lrrr} \toprule ... \bottomrule

# With row indices and alignment
print(tabulate(data, headers=headers, showindex=True, tablefmt="grid"))
```

## Core Capabilities

### All Major Table Formats

```python
from tabulate import tabulate

data = [["BERT-base", 0.891, 110], ["GPT-2", 0.856, 124], ["T5-base", 0.912, 220]]
headers = ["Model", "BLEU", "Params (M)"]

# Markdown (GitHub, Jupyter)
print(tabulate(data, headers, tablefmt="github"))
# Pipe tables (Pandoc, some markdown flavors)
print(tabulate(data, headers, tablefmt="pipe"))
# HTML (for web reports)
print(tabulate(data, headers, tablefmt="html"))
# RST (reStructuredText)
print(tabulate(data, headers, tablefmt="rst"))
# Pretty (default, aligned text)
print(tabulate(data, headers, tablefmt="pretty"))
# TSV (copy-paste into Excel/Google Sheets)
print(tabulate(data, headers, tablefmt="tsv"))
```

### LaTeX Booktabs for Papers

```python
from tabulate import tabulate

results = [
    ["ResNet-50",       0.763, 0.741, 25.6],
    ["ResNet-101",      0.782, 0.760, 44.5],
    ["EfficientNet-B4", 0.801, 0.785, 19.3],
    ["ViT-B/16",        0.812, 0.798, 86.6],
    ["DeiT-III-S",      0.823, 0.811, 22.1],
]
headers = ["Architecture", "Top-1 Acc.", "Top-5 Acc.", "FLOPs (G)"]

# LaTeX booktabs — directly paste into .tex file
latex_table = tabulate(
    results, headers,
    tablefmt="latex_booktabs",
    floatfmt=".3f",
    columnalign="lrrr",
)
print(latex_table)
# \begin{tabular}{lrrr}
# \toprule
# Architecture & Top-1 Acc. & Top-5 Acc. & FLOPs (G) \\
# \midrule
# ResNet-50 & 0.763 & 0.741 & 25.600 \\
# ...
# \bottomrule
# \end{tabular}

# With caption and label (manual wrapping)
print(f"\\begin{{table}}[htbp]\n\\centering\n{latex_table}")
print("\\caption{ImageNet classification results.}")
print("\\label{tab:imagenet-results}\n\\end{table}")
```

### Float Formatting and Numeric Control

```python
from tabulate import tabulate

data = [
    ["SGD", 0.9234, 0.00123, 3.14159e-4],
    ["Adam", 0.9187, 0.00087, 2.71828e-4],
    ["AdamW", 0.9312, 0.00056, 1.61803e-4],
]
headers = ["Optimizer", "Test Acc.", "Loss", "LR"]

# Per-column float formatting
print(tabulate(data, headers, floatfmt=("", ".4f", ".5f", ".2e"), tablefmt="github"))

# Scientific notation for small values
print(tabulate(data, headers, floatfmt=("", ".3f", ".2e", ".2e"), tablefmt="github"))

# Missing values
data_with_nan = [["A", 0.92, None], ["B", None, 0.001], ["C", 0.88, 0.002]]
print(tabulate(data_with_nan, ["Method", "Acc", "P-value"], tablefmt="github",
               missingval="—"))  # display NaN/None as em dash
```

## Common Academic Workflow: Batch Generate All Paper Tables

```python
from tabulate import tabulate
import pandas as pd
import os

# Load experimental results from CSV
df = pd.read_csv("results/ablation_study.csv")

# Define all tables needed for the paper
tables = {
    "main_results": {
        "cols": ["model", "dataset", "accuracy", "f1", "auc"],
        "headers": ["Model", "Dataset", "Accuracy", "F1", "AUC"],
        "floatfmt": (".0f", ".0f", ".4f", ".4f", ".4f"),
    },
    "ablation": {
        "cols": ["variant", "accuracy", "params_m", "latency_ms"],
        "headers": ["Variant", "Accuracy", "Params (M)", "Latency (ms)"],
        "floatfmt": (".0f", ".4f", ".1f", ".1f"),
    },
}

os.makedirs("tables", exist_ok=True)

for name, cfg in tables.items():
    subset = df[cfg["cols"]]
    # Markdown for supplementary materials
    md = tabulate(subset.values.tolist(), cfg["headers"], tablefmt="github", floatfmt=cfg["floatfmt"])
    with open(f"tables/{name}.md", "w") as f:
        f.write(md)
    # LaTeX for the main paper
    latex = tabulate(subset.values.tolist(), cfg["headers"],
                     tablefmt="latex_booktabs", floatfmt=cfg["floatfmt"])
    with open(f"tables/{name}.tex", "w") as f:
        f.write(latex)
    print(f"Generated tables/{name}.md and tables/{name}.tex")
```

## Best Practices

- **Use `tablefmt="latex_booktabs"`** for all LaTeX tables — never use default `latex` (it uses `\hline` instead of `\toprule`/`\midrule`/`\bottomrule`).
- **Set `floatfmt`** explicitly for each column to control decimal places and avoid inconsistent formatting.
- **Use `missingval`** to handle NaN/None gracefully (e.g., `missingval="n/a"` or `missingval="---"`).
- **Version your table-generation scripts** so tables can be regenerated when data changes.
- **Use `showindex="always"`** sparingly — in papers, row indices are usually not needed.

## Common Pitfalls

- **Forgetting `floatfmt`**: Default formatting can show excessive decimal places (e.g., `0.923456789` instead of `0.923`).
- **Mixing formats**: Stick to one table style per paper. Use booktabs throughout.
- **Wide tables**: For tables with many columns, consider abbreviating headers and adding a legend below the table.
- **Pandas `to_markdown()` vs tabulate**: pandas uses tabulate internally, but direct tabulate gives more control over formatting.

## Integration with HBE

- Use with `workflows/paper-writing.md` for automated table generation in the writing workflow
- Pair with `references/writing-guide.md` for table formatting conventions in academic writing
- Combine with `references/latex-environment.md` for full LaTeX document pipeline integration
- Use alongside `references/tools/pandas.md` to pipe DataFrame results directly into formatted tables

## Resources

- Documentation: https://tabulate.readthedocs.io/
- PyPI: https://pypi.org/project/tabulate/
- Source: https://github.com/astanin/python-tabulate
