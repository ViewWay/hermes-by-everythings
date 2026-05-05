---
name: pdfcrop
description: Crop PDF margins — remove whitespace around figures for clean inclusion in LaTeX documents
domain: Research Workflow
install: tlmgr install pdfcrop
---

# pdfcrop — PDF Margin Cropping

## Overview

pdfcrop is a utility that removes whitespace margins from PDF files, producing tightly-cropped figures ideal for LaTeX inclusion. It uses Ghostscript to analyze page boundaries and regenerates the PDF with minimal bounding boxes, ensuring figures occupy exactly the space they need without unwanted padding.

## When to Use

- Preparing matplotlib/seaborn figures for LaTeX inclusion
- Removing excess whitespace from exported PDF plots
- Batch-processing all figures in a `figures/` directory
- Ensuring consistent figure sizing in a paper or presentation
- Cropping scanned documents or externally-provided figures

## Quick Start

```bash
# Install (TeX Live)
tlmgr install pdfcrop

# Basic crop — removes all margins
pdfcrop input.pdf output.pdf

# In-place crop
pdfcrop figure.pdf figure.pdf

# Crop with specific margins (left bottom right top, in points)
pdfcrop --margins "10 10 10 10" input.pdf output.pdf

# Crop with uniform margin (10pt on all sides)
pdfcrop --margins 10 input.pdf output.pdf

# Crop to a specific bounding box
pdfcrop --bbox "50 50 500 400" input.pdf output.pdf
```

## Core Capabilities

### 1. Margin Control Options

Fine-tune how much whitespace to keep around the cropped content.

```bash
# No margins at all (tightest possible crop)
pdfcrop --margins 0 input.pdf output.pdf

# Uniform margin on all sides
pdfcrop --margins 5 input.pdf output.pdf          # 5pt padding
pdfcrop --margins "15" input.pdf output.pdf        # same

# Per-side margins: left bottom right top
pdfcrop --margins "10 5 10 5" input.pdf output.pdf

# Percentage-based margins (relative to page size)
pdfcrop --margins "5 5 5 5" input.pdf output.pdf

# Add padding only on left/right (useful for axis labels)
pdfcrop --margins "20 0 20 0" input.pdf output.pdf
```

### 2. Batch Processing

Process all figures in a directory for consistent preparation.

```bash
# Crop all PDFs in figures/ directory (in-place)
for f in figures/*.pdf; do
    pdfcrop "$f" "${f%.pdf}_cropped.pdf"
done

# Crop and overwrite originals (after backing up)
mkdir -p figures_backup
cp figures/*.pdf figures_backup/
for f in figures/*.pdf; do
    pdfcrop "$f" "$f"
done

# Crop only newly generated figures (by timestamp)
find figures/ -name "*.pdf" -newer manuscript.tex -exec pdfcrop {} {} \;
```

### 3. Makefile Integration

Integrate pdfcrop into a reproducible LaTeX build pipeline.

```makefile
# In Makefile for a LaTeX project
FIGURES_SRC := $(wildcard figures/*.pdf)
FIGURES_CROP := $(FIGURES_SRC:%.pdf=%_cropped.pdf)

# Crop all figures
figures/%_cropped.pdf: figures/%.pdf
    pdfcrop --margins 5 $< $@

# Full build depends on cropped figures
paper.pdf: paper.tex $(FIGURES_CROP) references.bib
    pdflatex paper.tex && bibtex paper && pdflatex paper.tex && pdflatex paper.tex

.PHONY: crop-figures clean-figures
crop-figures: $(FIGURES_CROP)
clean-figures:
    rm -f figures/*_cropped.pdf
```

## Common Academic Workflow

### Figure Preparation Pipeline for Paper Submission

```bash
# Step 1: Generate figures from Python (matplotlib saves with extra whitespace)
python scripts/generate_figures.py
# Output: figures/fig1.pdf, figures/fig2.pdf, figures/fig3.pdf

# Step 2: Crop all figures with 5pt padding for LaTeX inclusion
for f in figures/*.pdf; do
    pdfcrop --margins 5 "$f" "$f"
done

# Step 3: Verify cropped figures
for f in figures/*.pdf; do
    echo "$f: $(pdfinfo "$f" | grep 'Page size')"
done

# Step 4: Build paper with cropped figures
pdflatex paper.tex && bibtex paper && pdflatex paper.tex && pdflatex paper.tex

# Step 5: Check final PDF size
pdfinfo paper.pdf
```

## Best Practices

1. **Use small padding (5-10pt)**: Zero margins can cause overlapping with LaTeX captions.
2. **Crop before inclusion**: Never rely on `\includegraphics[trim=...]` when pdfcrop is available — it is more reliable.
3. **Use in-place crop cautiously**: Always commit originals first or use a backup directory.
4. **Combine with `bbox_inches='tight'`**: In matplotlib, set `savefig(bbox_inches='tight')` to minimize whitespace before pdfcrop.
5. **Check multi-page PDFs**: pdfcrop processes all pages; for single-page figures this is fine, but verify multi-page outputs.

## Common Pitfalls

1. **Ghostscript not installed**: pdfcrop depends on `gs` (Ghostscript); install it separately if missing.
2. **Cropped figures too small**: If the original figure has internal margins (e.g., axis labels near edges), cropping may clip content.
3. **Multi-page PDFs**: pdfcrop crops each page independently; for figure extraction from multi-page documents, use `pdfseparate` first.
4. **Loss of metadata**: Cropping regenerates the PDF; hyperlinks and form fields in the original are lost.

## Integration with HBE

- Use with `references/tools/matplotlib.md` in the figure generation pipeline
- Pair with `references/tools/latex-posters.md` to crop poster figures
- Supports `references/latex-environment.md` automated build pipeline
- Combine with `references/tools/inkscape-cli.md` for advanced figure editing

## Resources

- CTAN page: https://ctan.org/pkg/pdfcrop
- pdfcrop man page: `man pdfcrop` or `pdfcrop --help`
- Ghostscript: https://www.ghostscript.com/
