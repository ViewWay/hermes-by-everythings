---
name: inkscape-cli
description: Command-line Inkscape for SVG-to-PDF conversion — vector figure preparation for LaTeX papers
domain: Research Workflow
install: brew install --cask inkscape
---

# Inkscape CLI — Vector Figure Conversion / 矢量图转换

Inkscape's command-line interface converts SVG figures to PDF and PNG for LaTeX papers. Supports font embedding, color space control, batch processing, and LaTeX text overlay for matching document fonts.

## When to Use / 适用场景

- Converting matplotlib/plotly SVG output to publication-ready PDF / 将绘图输出转为出版级 PDF
- Batch converting a directory of figures for LaTeX compilation / 批量转换目录中的图片
- Using LaTeX text overlay (`--export-latex`) for font-matched labels in figures / 使用 LaTeX 文字叠加
- Optimizing SVG file size before PDF conversion (removing metadata, flattening) / 优化 SVG 文件大小
- Converting figures to high-DPI PNG for journal submission requirements / 转换为高分辨率 PNG

## Quick Start / 快速开始

```bash
# Basic SVG to PDF conversion
inkscape figure.svg --export-filename=figure.pdf

# SVG to PDF with drawing area crop
inkscape figure.svg --export-filename=figure.pdf --export-area-drawing

# SVG to high-DPI PNG
inkscape figure.svg --export-filename=figure.png --export-dpi=300

# SVG to PDF with LaTeX text overlay (fonts match document)
inkscape figure.svg --export-filename=figure.pdf --export-latex

# Batch convert all SVGs in a directory
for f in figures/*.svg; do
    inkscape "$f" --export-filename="${f%.svg}.pdf" --export-area-drawing
done

# Check Inkscape version (CLI syntax changed in 1.x)
inkscape --version
```

**Note**: Inkscape 1.0+ uses `--export-filename=` instead of the legacy `--export-pdf=` and no longer needs `-z` (GUI-less mode is default).

## Core Capabilities / 核心能力

### 1. SVG to PDF Conversion / SVG 转 PDF

```bash
# Standard conversion
inkscape input.svg --export-filename=output.pdf

# Export only the drawing area (removes whitespace)
inkscape input.svg --export-filename=output.pdf --export-area-drawing

# Export specific region (in px, from origin)
inkscape input.svg --export-filename=output.pdf \
    --export-area=0:0:800:600

# Set background color (transparent by default)
inkscape input.svg --export-filename=output.pdf \
    --export-background=white --export-background-opacity=1.0

# Text to paths (embeds fonts, no text overlay needed)
inkscape input.svg --export-filename=output.pdf \
    --export-text-to-path
```

### 2. LaTeX Text Overlay / LaTeX 文字叠加

The `--export-latex` option splits the figure into a PDF with no text and a `.pdf_tex` file that renders text via LaTeX, ensuring fonts match the document.

```bash
# Generate PDF + pdf_tex file
inkscape figure.svg --export-filename=figure.pdf --export-latex

# This creates:
#   figure.pdf      — the graphic without text
#   figure.pdf_tex  — LaTeX code to overlay text
```

```latex
% In your .tex file:
\usepackage{graphicx}
\usepackage{color}

\begin{figure}[htbp]
    \centering
    \def\svgwidth{\columnwidth}
    \import{./figures/}{figure.pdf_tex}
    \caption{Figure with LaTeX-rendered text labels.}
    \label{fig:myfig}
\end{figure}

% If using pdflatex (not xelatex), also add:
% \usepackage{grffile}  % for underscores in filenames
% \usepackage{import}   % for \import command
```

### 3. SVG to PNG for Journal Submission / 转换为 PNG

```bash
# High-DPI PNG (300 DPI for most journals)
inkscape figure.svg --export-filename=figure.png --export-dpi=300

# Specific pixel dimensions
inkscape figure.svg --export-filename=figure.png \
    --export-width=3200 --export-height=2400

# Transparent background PNG
inkscape figure.svg --export-filename=figure.png \
    --export-dpi=600 --export-background-opacity=0.0
```

### 4. Batch Processing / 批量处理

```bash
#!/bin/bash
# convert_figures.sh — batch SVG to PDF with options

INPUT_DIR="figures/svg"
OUTPUT_DIR="figures/pdf"
mkdir -p "$OUTPUT_DIR"

for f in "$INPUT_DIR"/*.svg; do
    basename=$(basename "$f" .svg)
    echo "Converting $basename..."
    inkscape "$f" \
        --export-filename="$OUTPUT_DIR/${basename}.pdf" \
        --export-area-drawing \
        --export-background=white \
        --export-background-opacity=1.0
done

echo "Done: $(ls "$OUTPUT_DIR"/*.pdf | wc -l) figures converted."
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Matplotlib SVG to Publication-Ready PDF / matplotlib SVG 转出版级 PDF

```python
# Step 1: Generate SVG from matplotlib
import matplotlib.pyplot as plt
import numpy as np

fig, ax = plt.subplots(figsize=(6, 4))
x = np.linspace(0, 2 * np.pi, 100)
ax.plot(x, np.sin(x), label="sin(x)")
ax.set_xlabel("x")
ax.set_ylabel("f(x)")
ax.legend()
fig.savefig("figures/raw/plot.svg", format="svg", bbox_inches="tight")
plt.close()
```

```bash
# Step 2: Convert SVG to PDF with Inkscape
inkscape figures/raw/plot.svg \
    --export-filename=figures/final/plot.pdf \
    --export-area-drawing \
    --export-background=white \
    --export-background-opacity=1.0

# Step 2b (alternative): Convert with LaTeX text overlay
inkscape figures/raw/plot.svg \
    --export-filename=figures/final/plot.pdf \
    --export-latex \
    --export-area-drawing
```

```latex
% Step 3: Include in LaTeX document
\begin{figure}[htbp]
    \centering
    \includegraphics[width=\columnwidth]{figures/final/plot.pdf}
    \caption{Sinusoidal function visualization.}
    \label{fig:sine}
\end{figure}
```

## Best Practices / 最佳实践

- **Always use `--export-area-drawing`**: Removes whitespace around the figure, which otherwise causes sizing issues in LaTeX / 始终裁剪绘制区域
- **Set white background explicitly**: SVG defaults to transparent; journals often require white backgrounds. Use `--export-background=white` / 显式设置白色背景
- **Use `--export-text-to-path` when no LaTeX overlay**: This converts all text to vector paths, eliminating font dependency issues / 无 LaTeX 叠加时将文字转为路径
- **Verify PDF output in a viewer**: Some SVG features (filters, clip-paths) may not render correctly in PDF. Always spot-check / 验证 PDF 输出效果
- **Keep original SVGs in version control**: PDF is a compiled format; SVGs are editable source. Store SVGs in `figures/src/` and PDFs in `figures/` / SVG 纳入版本控制

## Common Pitfalls / 常见陷阱

- **Inkscape 0.92 vs 1.x CLI syntax**: 0.92 uses `--export-pdf=file.pdf -z`; 1.x uses `--export-filename=file.pdf`. Check version with `inkscape --version` / 版本差异导致命令不同
- **Font mismatch without LaTeX overlay**: If your SVG uses a font not installed on the rendering machine, PDF output substitutes a default font. Use `--export-text-to-path` or `--export-latex` / 字体缺失导致替换
- **XeLaTeX + `--export-latex` compatibility**: The `pdf_tex` file uses `\input` which requires `pdflatex`. For XeLaTeX, replace `\input{figure.pdf_tex}` with `\import{./}{figure.pdf_tex}` and ensure `import` package is loaded / XeLaTeX 兼容性
- **Large SVGs from plotly**: Plotly SVGs can be >5MB with embedded data. Optimize with `scour` before conversion: `scour input.svg output.svg` / 大型 SVG 需优化
- **Color space issues**: Screen colors (sRGB) may differ in print (CMYK). For print journals, verify color fidelity with a test page / 色彩空间差异

## Integration with HBE / 与 HBE 集成

- Use with `references/latex-environment.md` for figure compilation in the LaTeX build pipeline
- Pair with `references/tools/matplotlib.md` for SVG generation best practices before conversion
- Integrate with `templates/Makefile` using a `figures-pdf` target that batch-converts SVGs
- Combine with `workflows/paper-writing.md` for figure checklist (DPI, color mode, font matching)

## Resources / 资源

- Inkscape Official Site: https://inkscape.org/
- CLI Reference: https://inkscape.org/doc/inkscape-man.html
- Scour SVG optimizer: https://github.com/scour-project/scour
- LaTeX `import` package: https://ctan.org/pkg/import
- Inkscape + LaTeX integration guide: https://wiki.inkscape.org/wiki/LaTeX_extension
