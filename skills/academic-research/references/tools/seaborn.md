---
name: seaborn
description: Statistical data visualization built on matplotlib. Use for publication-ready statistical plots: box, violin, swarm, heatmap, pair plots, regression plots.
domain: cross-domain
install: pip install seaborn
---

# Seaborn: Statistical Visualization

## Overview

Seaborn provides high-level statistical plotting functions built on matplotlib, with beautiful defaults and concise API. Ideal for exploratory data analysis and publication figures.

## When to Use

- Statistical plots (box, violin, swarm, KDE)
- Heatmaps and correlation matrices
- Regression plots with confidence intervals
- Multi-plot grids (pairplot, FacetGrid)
- Distribution visualization

## Quick Start

```python
import seaborn as sns
import matplotlib.pyplot as plt

sns.set_theme(style='ticks', font_scale=1.2, rc={'figure.dpi': 300})

# Distribution
sns.histplot(data=df, x='value', hue='group', kde=True)

# Box/violin
sns.boxplot(data=df, x='category', y='value', hue='group')
sns.violinplot(data=df, x='category', y='value', inner='box')

# Regression with CI
sns.regplot(data=df, x='x_var', y='y_var', scatter_kws={'alpha': 0.4})

# Heatmap (correlation matrix)
corr = df.corr()
sns.heatmap(corr, annot=True, fmt='.2f', cmap='RdBu_r', center=0, vmin=-1, vmax=1)

# Pair plot
sns.pairplot(df, hue='species', corner=True)

plt.savefig('figure.pdf', bbox_inches='tight')
```

## Core Capabilities

### 1. Distribution Plots

```python
# Histogram with KDE
sns.histplot(data=df, x='value', bins=30, kde=True, stat='density')

# KDE overlay for multiple groups
sns.kdeplot(data=df, x='value', hue='group', fill=True, alpha=0.3, common_norm=False)

# Empirical CDF
sns.ecdfplot(data=df, x='value', hue='group')
```

### 2. Categorical Plots

```python
# Combined: box + strip
fig, ax = plt.subplots(figsize=(8, 5))
sns.boxplot(data=df, x='method', y='score', ax=ax, width=0.4, fliersize=0)
sns.stripplot(data=df, x='method', y='score', ax=ax, color='black', alpha=0.3, size=3)

# Violin with inner points
sns.violinplot(data=df, x='group', y='value', inner='points', scale='width')

# Bar plot with error bars
sns.barplot(data=df, x='category', y='value', hue='group', capsize=0.1, errwidth=1.5)

# Count plot
sns.countplot(data=df, x='category', hue='group')
```

### 3. Multi-Panel Grids

```python
# FacetGrid: one subplot per category
g = sns.FacetGrid(df, col='dataset', row='model', height=3, aspect=1.2)
g.map_dataframe(sns.lineplot, x='epoch', y='loss', hue='method')
g.add_legend()

# Joint plot (scatter + marginal distributions)
sns.jointplot(data=df, x='x', y='y', hue='group', kind='kde')
```

### 4. Publication Color Palettes

```python
# Colorblind-safe
palette = sns.color_palette('colorblind')

# Diverging (correlation, heatmap)
sns.diverging_palette(220, 20, as_cmap=True)

# Sequential (intensity)
sns.light_palette('seagreen', as_cmap=True)

# Custom with hex
custom = ['#2166ac', '#f4a582', '#b2182b', '#92c5de']
sns.set_palette(custom)
```

## Best Practices

1. **Use `sns.set_theme()`** once at script start for consistent style
2. **Save as PDF**: Vector format for LaTeX, not PNG
3. **Set `dpi=300`**: Publication-quality rasterization
4. **Use `common_norm=False`**: In KDE plots when comparing groups of different sizes
5. **Combine plots**: Box + strip gives both summary and individual points

## Integration with HBE

- Statistical visualization layer in `references/figure-design-guide.md`
- Supports `references/data-processing-guide.md` EDA stage
- Works with `references/tools/matplotlib.md` for lower-level customization

## Resources

- Documentation: https://seaborn.pydata.org/
- Gallery: https://seaborn.pydata.org/examples/
- Waskom (2021) "seaborn: statistical data visualization" — JOSS paper
