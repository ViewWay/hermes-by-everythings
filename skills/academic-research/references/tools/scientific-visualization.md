---
name: scientific-visualization
description: Scientific figure design — principles and tools for publication-quality data visualization
domain: Research / Visualization
install: N/A (methodology)
---

# Scientific Visualization

Publication-quality figures are a critical component of scientific communication. Well-designed figures convey complex data patterns at a glance, while poor figures confuse readers and undermine credibility. This guide covers figure type selection, color palette design, font sizing, resolution requirements, and journal-specific formatting guidelines.

## When to Use

- Designing figures for a journal paper, conference submission, or thesis
- Choosing appropriate chart types for specific data (e.g., violin plots vs. box plots)
- Creating consistent visual styling across all figures in a manuscript
- Preparing supplementary figures that meet journal resolution requirements
- Designing figures for accessibility (colorblind-friendly palettes)
- Converting exploratory plots (matplotlib/ seaborn defaults) into publication-ready figures

## Quick Start

The three pillars of publication-quality figures are: (1) appropriate chart type, (2) consistent color palette, and (3) proper labeling with readable fonts.

```python
import matplotlib.pyplot as plt
import matplotlib as mpl

# Global style settings for publication figures
mpl.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Arial", "Helvetica", "DejaVu Sans"],
    "font.size": 8,
    "axes.linewidth": 0.5,
    "xtick.major.width": 0.5,
    "ytick.major.width": 0.5,
    "xtick.labelsize": 7,
    "ytick.labelsize": 7,
    "legend.fontsize": 7,
    "figure.dpi": 300,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
})

# Use a colorblind-friendly palette
CB_PALETTE = ["#E69F00", "#56B4E9", "#009E73", "#F0E442", "#0072B2", "#D55E00", "#CC79A7", "#000000"]

fig, ax = plt.subplots(figsize=(3.5, 2.5))  # Width in inches for single-column
ax.bar(["Group A", "Group B", "Group C"], [23, 45, 56], color=CB_PALETTE[:3], width=0.6)
ax.set_ylabel("Expression (TPM)")
ax.set_xlabel("Sample Group")
plt.savefig("figure1.pdf")  # Always save as PDF for vector format
plt.savefig("figure1.png", dpi=300)  # Also PNG as backup
```

## Core Capabilities

### 1. Figure Type Selection Guide

| Data Relationship | Recommended Chart | When to Use |
|-------------------|-------------------|-------------|
| Distribution of one variable | Histogram, KDE plot | Showing data spread, checking normality |
| Distribution by group | Box plot, violin plot | Comparing distributions across categories |
| Relationship between two variables | Scatter plot | Correlation, dose-response, calibration |
| Trend over time or continuous variable | Line plot | Time series, dose curves |
| Proportion/composition | Stacked bar, pie chart (rarely) | Avoid pie charts; use stacked bars instead |
| Heatmap / matrix | Clustered heatmap | Gene expression, correlation matrices |
| Multiple categories + values | Grouped bar plot | Comparing multiple groups and conditions |
| Uncertainty in estimates | Error bars, confidence bands | Statistical significance, model predictions |

**Rule of thumb**: If a chart type requires the reader to compare angles or areas, choose a simpler alternative (bar > pie).

### 2. Color Palette Selection

- **Colorblind-safe palettes**: Use `viridis`, `cividis`, or the Okabe-Ito palette (CB_PALETTE above). These are distinguishable for protanopia, deuteranopia, and tritanopia.
- **Sequential data**: Use perceptually uniform colormaps (`viridis`, `plasma`, `inferno`). Never use `jet` or `rainbow`.
- **Diverging data**: Use `RdBu_r`, `PiYG`, or `BrBG` for data with a meaningful center point (e.g., fold change around 0).
- **Categorical data**: Use distinct hues with equal lightness. Limit to 6-8 categories maximum.
- **Consistency**: Use the same color to represent the same variable across all figures in a paper.

```python
# Bad: rainbow colormap loses information
plt.imshow(data, cmap="jet")  # DO NOT USE

# Good: perceptually uniform colormap
plt.imshow(data, cmap="viridis")
```

### 3. Resolution, Font Sizing, and Journal Requirements

| Requirement | Typical Value | Notes |
|-------------|--------------|-------|
| Figure DPI | 300-600 (raster), vector (PDF/SVG) | Always prefer vector formats |
| Minimum font size | 6pt, recommended 7-8pt | Legible when figure is printed at column width |
| Single-column width | 3.5 inches (Nature), 3.33 inches (Science) | Check journal-specific guidelines |
| Double-column width | 7.16 inches (Nature), 6.83 inches (Science) | For wide figures spanning both columns |
| Line width | 0.5-1.0 pt | Axis lines, tick marks |
| Axis label size | 8-9 pt | Must be readable at print size |
| Legend placement | Inside plot area or to the right | Avoid covering data points |

## Common Academic Workflow

### Workflow: From Exploratory Plot to Publication Figure

1. **Explore**: Use default matplotlib/seaborn settings for rapid iteration.
2. **Select**: Choose the chart type that best represents the data relationship.
3. **Refine**: Apply global style settings (font, linewidth, color palette).
4. **Label**: Add clear axis labels, units, and a figure title (or caption below).
5. **Export**: Save as both PDF (vector, for print) and PNG 300dpi (for screen).
6. **Check**: View the figure at the target print size (use `figsize` in inches). Ensure all text is legible.
7. **Caption**: Write a figure caption that explains the figure without requiring the reader to reference the main text.

## Best Practices

1. **Maximize data-to-ink ratio** — remove gridlines, borders, and decorations that do not encode data (Tufte principle).
2. **Use vector formats** — PDF, SVG, or EPS for line plots and diagrams. Raster (PNG/TIFF) only for photographs or heatmaps.
3. **Consistent styling** — use a shared style file or `mpl.rcParams` settings across all figures in a manuscript.
4. **Avoid 3D charts** — 3D bar charts and pie charts distort perception. Use 2D alternatives.
5. **Annotate, do not rely on legends** — direct labels on data (e.g., annotate each line directly) are faster to read than separate legends.

## Common Pitfalls

1. **Using jet/rainbow colormaps**: These are not perceptually uniform and are inaccessible to colorblind readers. Use `viridis` instead.
2. **Font too small at print size**: A figure that looks good on screen may be illegible when printed at column width. Always set `figsize` to the target column width in inches.
3. **Overlapping labels**: For dense scatter plots or bar charts with many groups, rotate labels or use abbreviations.
4. **Inconsistent colors across figures**: The same category must have the same color in every figure. Define palettes globally.
5. **Low-resolution exports**: Journals will reject figures below 300 DPI. Always export at 300+ DPI or in vector format.

## Integration with HBE

- Use within `workflows/paper-writing.md` when preparing figures for manuscript submission.
- Pair with `references/tools/matplotlib.md` and `references/tools/seaborn.md` for implementation details.
- Combine with `references/tools/scientific-writing.md` to ensure figures and text are consistent in quality.
- Use `/hbe-review` to have Claude check figure labels, color choices, and journal compliance.

## Resources

- Tufte, "The Visual Display of Quantitative Information" (foundational)
- matplotlib style sheets: https://matplotlib.org/stable/gallery/style_sheets/style_sheets_reference.html
- ColorBrewer (palette designer): https://colorbrewer2.org/
- Nature figure guidelines: https://www.nature.com/nature/for-authors/final-submission
- seaborn color palettes: https://seaborn.pydata.org/generated/seaborn.color_palette.html
