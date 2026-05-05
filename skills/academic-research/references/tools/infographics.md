---
name: infographics
description: Scientific infographic design — create publication-quality visual summaries of research findings using matplotlib and plotly
domain: Research / Communication
install: pip install matplotlib plotly seaborn pillow
---

# infographics — Scientific Infographic Design

Provides patterns for creating scientific infographics that visually summarize research findings, experimental designs, and data pipelines. Uses matplotlib and plotly to produce publication-ready figures combining charts, annotations, icons, and structured layouts for posters, presentations, and social media dissemination.

## When to Use

- Creating visual summaries of key research findings for presentations or posters
- Designing graphical abstracts for journal submissions
- Building multi-panel overview figures that combine multiple results
- Producing shareable research highlights for social media or institutional websites
- Creating research pipeline or workflow diagrams with data embedded

## Quick Start

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

fig, ax = plt.subplots(figsize=(10, 6))
ax.set_xlim(0, 10)
ax.set_ylim(0, 6)
ax.axis("off")

# Title
ax.text(5, 5.5, "Research Findings: CRISPR Off-Target Analysis",
        fontsize=16, fontweight="bold", ha="center", va="top")

# Key metrics as styled boxes
metrics = [
    ("Samples\nAnalyzed", "2,847", "#2196F3"),
    ("Off-Target\nSites Found", "156", "#FF5722"),
    ("True\nPositives", "142", "#4CAF50"),
    ("Precision", "91.0%", "#9C27B0"),
]

for i, (label, value, color) in enumerate(metrics):
    x = 1.5 + i * 2.2
    rect = patches.FancyBboxPatch((x - 0.8, 1.5), 1.8, 2.5,
                                   boxstyle="round,pad=0.1",
                                   facecolor=color, alpha=0.15,
                                   edgecolor=color, linewidth=2)
    ax.add_patch(rect)
    ax.text(x + 0.1, 3.5, value, fontsize=20, fontweight="bold",
            ha="center", va="center", color=color)
    ax.text(x + 0.1, 2.0, label, fontsize=10, ha="center", va="center")

plt.tight_layout()
plt.savefig("infographic_summary.png", dpi=300, bbox_inches="tight",
            facecolor="white", edgecolor="none")
plt.show()
```

## Core Capabilities

### 1. Multi-Panel Research Summary Figure

```python
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import numpy as np

fig = plt.figure(figsize=(14, 8))
gs = gridspec.GridSpec(2, 3, hspace=0.35, wspace=0.3)

# Panel 1: Key bar chart
ax1 = fig.add_subplot(gs[0, 0])
categories = ["Method A", "Method B", "Ours"]
values = [78.2, 85.1, 93.4]
colors = ["#90CAF9", "#90CAF9", "#FF5722"]
bars = ax1.bar(categories, values, color=colors, edgecolor="white", linewidth=1.5)
ax1.set_ylabel("Accuracy (%)", fontsize=10)
ax1.set_title("Classification Accuracy", fontweight="bold", fontsize=11)
for bar, val in zip(bars, values):
    ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
             f"{val}%", ha="center", fontsize=9, fontweight="bold")

# Panel 2: Performance over epochs
ax2 = fig.add_subplot(gs[0, 1])
epochs = np.arange(1, 51)
loss_a = 2.5 * np.exp(-0.08 * epochs) + 0.1 + np.random.normal(0, 0.02, 50)
loss_b = 2.5 * np.exp(-0.12 * epochs) + 0.05 + np.random.normal(0, 0.01, 50)
ax2.plot(epochs, loss_a, color="#90CAF9", linewidth=2, label="Baseline")
ax2.plot(epochs, loss_b, color="#FF5722", linewidth=2, label="Ours")
ax2.set_xlabel("Epoch")
ax2.set_ylabel("Loss")
ax2.set_title("Training Convergence", fontweight="bold", fontsize=11)
ax2.legend(fontsize=9)
ax2.set_ylim(0, 3)

# Panel 3: Confusion heatmap
ax3 = fig.add_subplot(gs[0, 2])
cm = np.array([[92, 5, 3], [4, 88, 8], [2, 6, 91]])
im = ax3.imshow(cm, cmap="Blues", vmin=0, vmax=100)
for i in range(3):
    for j in range(3):
        ax3.text(j, i, str(cm[i, j]), ha="center", va="center",
                 fontsize=14, fontweight="bold",
                 color="white" if cm[i, j] > 50 else "black")
ax3.set_xticks([0, 1, 2]); ax3.set_xticklabels(["A", "B", "C"])
ax3.set_yticks([0, 1, 2]); ax3.set_yticklabels(["A", "B", "C"])
ax3.set_title("Confusion Matrix", fontweight="bold", fontsize=11)

# Panel 4: ROC curve
ax4 = fig.add_subplot(gs[1, 0])
fpr = np.linspace(0, 1, 100)
tpr_a = 1 - (1 - fpr) ** 2
tpr_b = 1 - (1 - fpr) ** 3
from sklearn.metrics import auc
ax4.plot(fpr, tpr_a, color="#90CAF9", linewidth=2, label=f"Baseline AUC={auc(fpr, tpr_a):.2f}")
ax4.plot(fpr, tpr_b, color="#FF5722", linewidth=2, label=f"Ours AUC={auc(fpr, tpr_b):.2f}")
ax4.plot([0, 1], [0, 1], "k--", alpha=0.3)
ax4.set_xlabel("False Positive Rate")
ax4.set_ylabel("True Positive Rate")
ax4.set_title("ROC Curve", fontweight="bold", fontsize=11)
ax4.legend(fontsize=9)

# Panel 5: Box plot comparison
ax5 = fig.add_subplot(gs[1, 1])
data_a = np.random.normal(85, 8, 100)
data_b = np.random.normal(93, 5, 100)
bp = ax5.boxplot([data_a, data_b], labels=["Baseline", "Ours"],
                 patch_artist=True, widths=0.5)
bp["boxes"][0].set_facecolor("#90CAF9")
bp["boxes"][1].set_facecolor("#FF5722")
ax5.set_ylabel("F1 Score")
ax5.set_title("Performance Distribution", fontweight="bold", fontsize=11)

# Panel 6: Summary text
ax6 = fig.add_subplot(gs[1, 2])
ax6.axis("off")
summary_text = (
    "Key Findings\n\n"
    "Our method achieves 93.4%\n"
    "accuracy, +8.3% over baseline.\n\n"
    "Training converges 2.1x faster\n"
    "with lower final loss.\n\n"
    "AUC: 0.97 (vs 0.89 baseline)\n"
    "F1: 93.2 +/- 5.1"
)
ax6.text(0.1, 0.95, summary_text, transform=ax6.transAxes,
         fontsize=11, verticalalignment="top", fontfamily="monospace",
         bbox=dict(boxstyle="round", facecolor="#f5f5f5", edgecolor="gray"))

fig.suptitle("DeepCRISPR: Improved Off-Target Prediction", fontsize=14, fontweight="bold", y=0.98)
plt.savefig("research_summary.png", dpi=300, bbox_inches="tight", facecolor="white")
```

### 2. Graphical Abstract Template

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(12, 4))
ax.set_xlim(0, 12)
ax.set_ylim(0, 4)
ax.axis("off")

# Workflow: Data -> Model -> Results
stages = [
    (1, "Single-Cell\nRNA-seq Data", "#2196F3", "50K cells\n3 tissues"),
    (4.5, "Deep Learning\nModel", "#FF5722", "CNN + Attention\n92% accuracy"),
    (8, "Cell Type\nClassification", "#4CAF50", "12 cell types\nNovel markers"),
    (10.5, "Biological\nValidation", "#9C27B0", "Flow cytometry\nIHC staining"),
]

for x, title, color, detail in stages:
    # Box
    rect = patches.FancyBboxPatch((x - 0.8, 1), 2, 2,
                                   boxstyle="round,pad=0.15",
                                   facecolor=color, alpha=0.12,
                                   edgecolor=color, linewidth=2)
    ax.add_patch(rect)
    ax.text(x + 0.2, 2.8, title, fontsize=10, fontweight="bold",
            ha="center", va="center")
    ax.text(x + 0.2, 1.8, detail, fontsize=8, ha="center", va="center",
            color="gray")

# Arrows between stages
for i in range(len(stages) - 1):
    x1 = stages[i][0] + 1.2
    x2 = stages[i + 1][0] - 0.8
    ax.annotate("", xy=(x2, 2), xytext=(x1, 2),
                arrowprops=dict(arrowstyle="->", color="gray", lw=2))

plt.tight_layout()
plt.savefig("graphical_abstract.png", dpi=300, bbox_inches="tight", facecolor="white")
```

### 3. Color Palette and Style Configuration

```python
# Consistent color palette for publications
ACADEMIC_PALETTE = {
    "primary": "#1f77b4",
    "secondary": "#ff7f0e",
    "success": "#2ca02c",
    "danger": "#d62728",
    "info": "#9467bd",
    "neutral": "#7f7f7f",
}

def style_axis(ax, title="", xlabel="", ylabel=""):
    """Apply consistent academic styling to an axis."""
    ax.set_title(title, fontweight="bold", fontsize=12, pad=10)
    ax.set_xlabel(xlabel, fontsize=10)
    ax.set_ylabel(ylabel, fontsize=10)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.tick_params(labelsize=9)
    ax.grid(axis="y", alpha=0.3, linestyle="--")
```

## Common Academic Workflow: Conference Poster Infographic

```python
# Combine panels into a poster-style layout
fig = plt.figure(figsize=(36, 48), facecolor="white")
# ... add title banner, 4-6 result panels, methods diagram, and conclusions
# Save as high-resolution PDF for printing
plt.savefig("conference_poster.pdf", dpi=150, bbox_inches="tight")
```

## Best Practices

1. Use a consistent color palette across all figures in a paper (3-5 colors maximum)
2. Export at 300 DPI minimum for print; use PDF/SVG for vector elements
3. Make all text readable at intended display size (min 8pt for posters, 6pt for journal figures)
4. Include axis labels, legends, and scale bars; avoid redundant information
5. Use colorblind-friendly palettes (viridis, ColorBrewer qualitative) when possible

## Common Pitfalls

1. **Too many panels**: Limit multi-panel figures to 4-6 panels; use supplementary figures for additional data
2. **Inconsistent styling**: Different font sizes or colors across panels look unprofessional; use a style function
3. **Low resolution**: Screen-resolution PNGs look blurry in print; always specify `dpi=300` or higher
4. **Missing axis labels**: Every axis must have units and labels; use `style_axis()` helper to enforce consistency

## Integration with HBE

- Use with `references/tools/matplotlib.md` for base plotting capabilities
- Pair with `references/tools/seaborn.md` for statistical visualizations
- Combine with `references/tools/pillow.md` for image compositing and annotation
- Supports `references/tool-registry.md` visualization tool chain

## Resources

- Matplotlib Gallery: https://matplotlib.org/stable/gallery/index.html
- ColorBrewer Palettes: https://colorbrewer2.org/
- Ten Simple Rules for Better Figures: https://doi.org/10.1371/journal.pcbi.1003833
