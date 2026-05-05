---
name: matplotlib
description: Publication-quality scientific visualization. Use for creating figures, plots, and charts for papers, presentations, and data exploration across all disciplines.
domain: cross-domain
install: pip install matplotlib
---

# Matplotlib: Scientific Visualization

## Overview

Matplotlib is the standard Python plotting library for creating publication-quality figures. Used across all academic disciplines for data visualization, figure creation, and scientific plotting.

## When to Use

- Creating publication-quality figures for papers
- Exploratory data analysis visualization
- Multi-panel composite figures
- Vector format output (PDF/SVG) for LaTeX
- Statistical plots (box, violin, heatmap, contour)
- Any scientific visualization not handled by domain-specific tools

## Quick Start

```python
import matplotlib.pyplot as plt
import numpy as np

# Set publication defaults
plt.rcParams.update({
    'font.size': 12,
    'font.family': 'serif',
    'font.serif': ['Times New Roman'],
    'figure.dpi': 300,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'axes.linewidth': 1.2,
})

fig, ax = plt.subplots(figsize=(6, 4))
ax.plot(x, y, 'b-', linewidth=2, label='Method A')
ax.plot(x, y2, 'r--', linewidth=2, label='Method B')
ax.set_xlabel('Epoch')
ax.set_ylabel('Accuracy')
ax.set_title('Training Progress')
ax.legend()
fig.savefig('figures/training.pdf')
plt.close()
```

## Core Capabilities

### 1. Publication-Ready Line Plots

```python
fig, ax = plt.subplots(figsize=(5, 3.5))

# Multiple lines with markers
ax.plot(x, y1, 'o-', color='#2196F3', linewidth=1.5, markersize=4, label='Ours')
ax.plot(x, y2, 's--', color='#F44336', linewidth=1.5, markersize=4, label='Baseline')
ax.plot(x, y3, '^:', color='#4CAF50', linewidth=1.5, markersize=4, label='SOTA')

# Shaded confidence region
ax.fill_between(x, y1-std1, y1+std1, alpha=0.2, color='#2196F3')

ax.set_xlabel('Training Steps')
ax.set_ylabel('Performance')
ax.legend(loc='lower right', framealpha=0.9)
ax.grid(True, alpha=0.3)
fig.savefig('results.pdf', bbox_inches='tight')
```

### 2. Multi-Panel Figures

```python
# 2x2 grid with shared axes
fig, axes = plt.subplots(2, 2, figsize=(10, 8), sharex=True, sharey=True)

for idx, (ax, data, title) in enumerate(zip(axes.flat, datasets, titles)):
    im = ax.imshow(data, cmap='viridis', aspect='auto')
    ax.set_title(title)
    fig.colorbar(im, ax=ax, fraction=0.046)

fig.suptitle('Comparison Across Methods', fontsize=14)
fig.tight_layout()
fig.savefig('comparison.pdf')
```

### 3. Statistical Plots

```python
# Box plot with individual points
fig, ax = plt.subplots(figsize=(6, 4))
bp = ax.boxplot([data1, data2, data3], labels=['A', 'B', 'C'],
                patch_artist=True, widths=0.6)
colors = ['#2196F3', '#F44336', '#4CAF50']
for patch, color in zip(bp['boxes'], colors):
    patch.set_facecolor(color)
    patch.set_alpha(0.7)

# Overlay scatter points
for i, data in enumerate([data1, data2, data3]):
    x = np.random.normal(i+1, 0.04, size=len(data))
    ax.scatter(x, data, alpha=0.4, s=20, color=colors[i])

ax.set_ylabel('Score')
fig.savefig('boxplot.pdf')
```

```python
# Heatmap (confusion matrix, correlation, etc.)
fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(confusion_matrix, cmap='Blues', interpolation='nearest')
ax.set_xticks(range(n_classes))
ax.set_yticks(range(n_classes))
ax.set_xticklabels(class_names, rotation=45, ha='right')
ax.set_yticklabels(class_names)

# Annotate cells
for i in range(n_classes):
    for j in range(n_classes):
        ax.text(j, i, f'{confusion_matrix[i, j]}', ha='center', va='center',
                color='white' if confusion_matrix[i, j] > threshold else 'black')

fig.colorbar(im, ax=ax, fraction=0.046)
fig.savefig('confusion.pdf')
```

### 4. LaTeX Integration

```python
# Use LaTeX rendering
plt.rcParams.update({
    'text.usetex': True,
    'text.latex.preamble': r'\usepackage{amsmath}',
})

# LaTeX math in labels
ax.set_xlabel(r'Temperature ($T$) [K]')
ax.set_ylabel(r'Entropy $S = k_B \ln \Omega$')
ax.set_title(r'Phase Transition at $T_c = 2.269$')
```

## Common Academic Workflows

### Figure for Paper (NeurIPS/ICML style)

```python
def paper_figure(x_data, methods_data, output_path):
    """Create a paper-ready figure matching conference style."""
    fig, ax = plt.subplots(figsize=3.5, 2.5)  # Single-column width

    colors = ['#2166ac', '#b2182b', '#1b7837', '#762a83']
    for i, (name, y, std) in enumerate(methods_data):
        ax.plot(x_data, y, color=colors[i], linewidth=1.5, label=name)
        ax.fill_between(x_data, y-std, y+std, alpha=0.15, color=colors[i])

    ax.set_xlabel('Epoch', fontsize=9)
    ax.set_ylabel('Accuracy (%)', fontsize=9)
    ax.tick_params(labelsize=8)
    ax.legend(fontsize=8, loc='lower right')
    ax.grid(True, alpha=0.2)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    fig.savefig(output_path, bbox_inches='tight', dpi=300)
    plt.close()
```

### Results Table Visualization

```python
def results_barplot(methods, scores, errors, output_path):
    """Bar plot comparing method scores with error bars."""
    fig, ax = plt.subplots(figsize=(8, 4))
    x = np.arange(len(methods))
    bars = ax.bar(x, scores, yerr=errors, capsize=5,
                  color=['#2166ac' if s == max(scores) else '#bdbdbd'
                         for s in scores],
                  edgecolor='black', linewidth=0.8)
    ax.set_xticks(x)
    ax.set_xticklabels(methods, rotation=30, ha='right')
    ax.set_ylabel('F1 Score')
    ax.set_ylim(min(scores) - 0.05, max(scores) + 0.05)
    fig.tight_layout()
    fig.savefig(output_path)
```

## Key Parameters

| Parameter | Default | When to Adjust |
|-----------|---------|----------------|
| `figsize` | (6.4, 4.8) | Single-col: (3.5, 2.5); Double-col: (7, 4) |
| `dpi` | 100 | Papers: 300; Quick preview: 72 |
| `savefig(format)` | 'png' | LaTeX: 'pdf'; Web: 'svg'; Quick: 'png' |
| `font.size` | 10 | Papers: 9-12 depending on venue |
| `bbox_inches` | None | Always use 'tight' to avoid clipping |

## Best Practices

1. **Always use vector formats**: PDF for LaTeX, SVG for web
2. **Set figure size to match column width**: Single ~3.5in, double ~7in
3. **Font size ≥ 8pt**: Readable at print size
4. **Use colorblind-safe palettes**: `plt.cm.Set2`, `plt.cm.tab10`, or specific accessible colors
5. **Call `fig.tight_layout()`** before saving to avoid label clipping
6. **Close figures**: `plt.close(fig)` to prevent memory leaks in loops

## Common Pitfalls

1. **Low resolution**: Default 100 DPI is too low for papers — set 300+
2. **Clipped labels**: Use `bbox_inches='tight'` in savefig
3. **Inconsistent font sizes**: Set `plt.rcParams` once at script start
4. **Memory leak in loops**: Always `plt.close()` after saving
5. **Wrong color order**: Define colors explicitly, don't rely on defaults

## Integration with HBE

- Primary visualization tool in `references/figure-design-guide.md`
- Supports `workflows/paper-writing.md` Phase 3 (Visual Elements)
- Works with `references/journal-templates-guide.md` for venue-specific sizing
- See `references/tools/seaborn.md` for statistical visualization wrapper

## Resources

- Documentation: https://matplotlib.org/stable/
- Gallery: https://matplotlib.org/stable/gallery/
- Cheatsheet: https://matplotlib.org/cheatsheets/
