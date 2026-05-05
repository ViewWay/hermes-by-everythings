---
name: pptx
description: Create and modify PowerPoint .pptx presentations — slides, charts, shapes, and layouts
domain: Data I/O
install: pip install python-pptx
---

# python-pptx (pptx) — PowerPoint Generation / PowerPoint 生成

python-pptx creates and modifies PowerPoint presentations programmatically: slides with text, images, tables, charts, and custom layouts.

## When to Use / 适用场景

- Generating conference talk slides from analysis results
- Creating progress reports with embedded figures
- Automating presentation updates from data pipelines
- Building slide decks for lab meetings or thesis defenses

## Quick Start / 快速开始

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()

# Title slide
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Research Findings"
slide.placeholders[1].text = "Author Name — University"

# Content slide with bullet points
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Key Results"
slide.placeholders[1].text = "30% improvement over baseline\nStatistical significance (p < 0.001)"

prs.save("presentation.pptx")
```

## Core Capabilities / 核心能力

### 1. Slide Creation / 幻灯片创建

```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.text import PP_ALIGN

prs = Presentation()

# Slide layouts (index varies by template)
# 0: Title Slide, 1: Title + Content, 5: Title Only, 6: Blank

# Title + Content
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Introduction"

# Blank slide with positioned elements
slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank
txBox = slide.shapes.add_textbox(Inches(0.5), Inches(0.5), Inches(9), Inches(1))
tf = txBox.text_frame
tf.text = "Custom Title"
tf.paragraphs[0].font.size = Pt(32)
tf.paragraphs[0].font.bold = True
```

### 2. Adding Images / 添加图片

```python
from pptx import Presentation
from pptx.util import Inches

prs = Presentation()

# Full-slide image
slide = prs.slides.add_slide(prs.slide_layouts[6])
slide.shapes.add_picture("figure1.png", Inches(0.5), Inches(0.5), width=Inches(9))

# Two images side by side
slide = prs.slides.add_slide(prs.slide_layouts[6])
slide.shapes.add_picture("fig_a.png", Inches(0.3), Inches(1.5), width=Inches(4.5))
slide.shapes.add_picture("fig_b.png", Inches(5.2), Inches(1.5), width=Inches(4.5))

# Add caption below image
txBox = slide.shapes.add_textbox(Inches(0.3), Inches(6), Inches(4.5), Inches(0.5))
txBox.text_frame.text = "Figure A: Baseline results"
txBox.text_frame.paragraphs[0].font.size = Pt(10)
```

### 3. Tables / 表格

```python
from pptx import Presentation
from pptx.util import Inches, Pt

prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[5])  # Title Only
slide.shapes.title.text = "Results Comparison"

# Create table
rows, cols = 4, 4
table_shape = slide.shapes.add_table(rows, cols, Inches(1), Inches(1.5), Inches(8), Inches(3))
table = table_shape.table

# Headers
headers = ["Method", "Accuracy", "F1", "Latency (ms)"]
for j, h in enumerate(headers):
    cell = table.cell(0, j)
    cell.text = h
    for paragraph in cell.text_frame.paragraphs:
        paragraph.font.bold = True
        paragraph.font.size = Pt(14)

# Data
data = [["Baseline", "85.2%", "83.1%", "12.3"],
        ["Ours", "92.1%", "91.4%", "8.7"],
        ["SOTA", "91.5%", "90.8%", "15.2"]]
for i, row in enumerate(data):
    for j, val in enumerate(row):
        table.cell(i+1, j).text = val
```

### 4. Charts / 图表

```python
from pptx import Presentation
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE

prs = Presentation()
slide = prs.slides.add_slide(prs.slide_layouts[5])

chart_data = CategoryChartData()
chart_data.categories = ["Dataset A", "Dataset B", "Dataset C"]
chart_data.add_series("Baseline", (85.2, 78.3, 91.0))
chart_data.add_series("Ours", (92.1, 88.7, 95.3))

chart = slide.shapes.add_chart(
    XL_CHART_TYPE.COLUMN_CLUSTERED, Inches(1), Inches(1.5),
    Inches(8), Inches(5), chart_data
).chart

chart.has_legend = True
chart.chart_title.has_text_frame = True
chart.chart_title.text_frame.paragraphs[0].text = "Model Comparison"
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Conference Talk Generator / 会议报告生成器

```python
from pptx import Presentation
from pptx.util import Inches, Pt
import glob

prs = Presentation()

# Title slide
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Title of Your Paper"
slide.placeholders[1].text = "Author Names — Venue 2026"

# One slide per figure
for i, fig_path in enumerate(sorted(glob.glob("figures/*.pdf"))):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    # Convert PDF to PNG first (use pdf2image)
    png_path = fig_path.replace(".pdf", ".png")
    slide.shapes.add_picture(png_path, Inches(0.5), Inches(0.5), width=Inches(9))
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(6.5), Inches(9), Inches(0.5))
    txBox.text_frame.text = f"Figure {i+1}: Description"
    txBox.text_frame.paragraphs[0].font.size = Pt(12)

# Thank you slide
slide = prs.slides.add_slide(prs.slide_layouts[6])
txBox = slide.shapes.add_textbox(Inches(2), Inches(3), Inches(6), Inches(2))
tf = txBox.text_frame
tf.text = "Thank You!\nQuestions?"
tf.paragraphs[0].font.size = Pt(40)
tf.paragraphs[0].alignment = 1  # Center

prs.save("conference_talk.pptx")
```

## Best Practices / 最佳实践

- Use 16:9 aspect ratio for modern projectors (`Presentation.slide_width = Inches(13.333)`)
- Keep text minimal — slides should support, not replace, your talk
- Use high-resolution images (≥150 DPI for screen, ≥300 DPI for print)
- Convert PDF figures to PNG before embedding

## Common Pitfalls / 常见陷阱

- **PDF embedding**: python-pptx cannot embed PDFs; convert to PNG first
- **Font size**: Use large fonts (≥18pt) for readability on projectors
- **Slide dimensions**: Default is 10" × 7.5" (4:3); most venues now use 16:9
- **Template compatibility**: Slide layout indices vary between templates

## Integration with HBE / 与 HBE 集成

- Generate talks from `workflows/paper-writing.md` output
- Pair with `references/tools/matplotlib.md` for figure export
- Combine with `references/tools/pandas.md` for data-driven slides

## Resources / 资源

- Documentation: https://python-pptx.readthedocs.io/
- Tutorial: https://python-pptx.readthedocs.io/en/latest/user/quickstart.html
