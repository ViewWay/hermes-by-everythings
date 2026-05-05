---
name: pptx-posters
description: PowerPoint poster templates — academic conference posters using python-pptx automation
domain: Research / Posters
install: pip install python-pptx
---

# PowerPoint Academic Posters

## Overview

While LaTeX posters offer typographic precision, PowerPoint remains the dominant format at many conferences. The `python-pptx` library enables programmatic generation of PowerPoint posters with precise control over layout, fonts, and element placement, making poster creation reproducible and scriptable.

## When to Use

- Conference requires PPTX format for poster submission
- Collaborators prefer editing posters in PowerPoint
- Building reproducible poster generation pipelines
- Creating multiple poster variants from a data-driven template
- When the target audience uses Microsoft Office exclusively

## Quick Start

```python
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# Create poster (A0 portrait: 33.1 x 46.8 inches)
prs = Presentation()
prs.slide_width = Inches(33.1)
prs.slide_height = Inches(46.8)

slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout

# Add title
title_box = slide.shapes.add_textbox(Inches(1), Inches(0.5), Inches(31), Inches(2))
tf = title_box.text_frame
p = tf.paragraphs[0]
p.text = "Research Title: Automated Poster Generation"
p.font.size = Pt(60)
p.font.bold = True
p.font.color.rgb = RGBColor(0, 51, 102)
p.alignment = PP_ALIGN.CENTER

# Add authors
author_box = slide.shapes.add_textbox(Inches(1), Inches(2.5), Inches(31), Inches(1))
tf = author_box.text_frame
p = tf.paragraphs[0]
p.text = "Author One, Author Two, Author Three"
p.font.size = Pt(32)
p.alignment = PP_ALIGN.CENTER

prs.save("poster.pptx")
```

## Core Capabilities

### 1. Layout Template System

Define reusable layout functions for consistent poster structure.

```python
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor

POSTER_W = Inches(33.1)
POSTER_H = Inches(46.8)
MARGIN = Inches(1.0)
GUTTER = Inches(0.5)
COL_W = (POSTER_W - 2 * MARGIN - GUTTER) / 2

def add_block(slide, left, top, width, height, title, body_text,
              title_color=RGBColor(0, 51, 102),
              bg_color=RGBColor(240, 245, 250)):
    """Add a titled content block to the poster."""
    from pptx.util import Emu
    # Background rectangle
    shape = slide.shapes.add_shape(
        1, left, top, width, height  # MSO_SHAPE.RECTANGLE
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.fill.background()

    # Title bar
    title_box = slide.shapes.add_textbox(
        left + Inches(0.2), top + Inches(0.1),
        width - Inches(0.4), Inches(0.8)
    )
    tf = title_box.text_frame
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = title_color

    # Body text
    body_box = slide.shapes.add_textbox(
        left + Inches(0.2), top + Inches(1.0),
        width - Inches(0.4), height - Inches(1.2)
    )
    tf = body_box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = body_text
    p.font.size = Pt(24)
    p.line_spacing = Pt(32)
```

### 2. Section Placement and Grid Layout

```python
def build_two_column_poster(prs, sections):
    """Build a poster with two equal columns from a list of sections."""
    slide = prs.slides.add_slide(prs.slide_layouts[6])

    # Title banner
    add_title_banner(slide, "Poster Title", "Authors | Affiliations")

    y = Inches(5.0)  # Start below title
    left_col = MARGIN
    right_col = MARGIN + COL_W + GUTTER
    block_height = Inches(9.0)

    for i, section in enumerate(sections):
        col_x = left_col if i % 2 == 0 else right_col
        if i % 2 == 0 and i > 0:
            y += block_height + Inches(0.5)  # New row
        add_block(slide, col_x, y, COL_W, block_height,
                  section["title"], section["body"])

# Usage
sections = [
    {"title": "Introduction", "body": "Background and motivation..."},
    {"title": "Methods", "body": "Experimental design..."},
    {"title": "Results", "body": "Key findings..."},
    {"title": "Conclusions", "body": "Summary and future work..."},
]
build_two_column_poster(prs, sections)
```

### 3. Figure Insertion and Export to PDF

```python
from pptx.util import Inches

# Insert a figure into a block
def add_figure(slide, left, top, width, height, image_path, caption=""):
    """Add a figure with optional caption."""
    slide.shapes.add_picture(image_path, left, top, width, height)
    if caption:
        cap_box = slide.shapes.add_textbox(
            left, top + height, width, Inches(0.6)
        )
        tf = cap_box.text_frame
        p = tf.paragraphs[0]
        p.text = caption
        p.font.size = Pt(20)
        p.font.italic = True
        p.alignment = PP_ALIGN.CENTER

# Export PPTX to PDF (macOS using LibreOffice)
# libreoffice --headless --convert-to pdf poster.pptx
# On Windows: use PowerPoint COM automation or print to PDF
```

## Common Academic Workflow

### Automated Poster Generation from Paper Content

```python
"""Generate a conference poster from structured content."""
from pptx import Presentation

prs = Presentation()
prs.slide_width = Inches(33.1)
prs.slide_height = Inches(46.8)

slide = prs.slides.add_slide(prs.slide_layouts[6])

# 1. Title banner
add_block(slide, Inches(1), Inches(0.5), Inches(31), Inches(3),
          "Deep Learning for Protein Structure Prediction",
          "Jane Doe, John Smith | Dept. of Computer Science, University",
          title_color=RGBColor(255, 255, 255),
          bg_color=RGBColor(0, 51, 102))

# 2. Left column: Introduction + Methods
add_block(slide, Inches(1), Inches(4), Inches(15), Inches(9),
          "Introduction", "Protein structure prediction is fundamental...")
add_figure(slide, Inches(3), Inches(14), Inches(11), Inches(7),
           "figures/methods_diagram.pdf", "Figure 1: Model Architecture")

# 3. Right column: Results + Conclusions
add_block(slide, Inches(17), Inches(4), Inches(15), Inches(9),
          "Results", "Our method achieves 92.4% GDT-TS score...")
add_figure(slide, Inches(19), Inches(14), Inches(11), Inches(7),
           "figures/results_plot.pdf", "Figure 2: Performance Comparison")

prs.save("conference_poster.pptx")
```

## Best Practices

1. **Use slide_width/height for A0**: Set exact dimensions (33.1 x 46.8 inches) before placing elements.
2. **Font size hierarchy**: Title 54-72pt, section headers 36-44pt, body text 22-28pt, captions 18-20pt.
3. **High-resolution images**: Use 300 DPI PNG or vector PDF for all figures.
4. **Consistent color scheme**: Define a palette (2-3 colors) and reuse across all blocks.
5. **Export to PDF**: Convert to PDF for reliable printing; PPTX rendering varies across systems.

## Common Pitfalls

1. **Wrong slide dimensions**: Default PowerPoint slides are 10x7.5 inches — always override for poster size.
2. **Font substitution**: If collaborators lack your fonts, text reflows; stick to standard fonts (Arial, Calibri).
3. **Image resolution**: Low-res images pixelate at poster scale; verify at 100% zoom.
4. **PDF conversion artifacts**: LibreOffice conversion may shift elements; verify the PDF before printing.

## Integration with HBE

- Use with `references/tools/matplotlib.md` to generate poster figures at correct dimensions
- Pair with `references/tools/latex-posters.md` as an alternative format choice
- Supports `workflows/paper-writing.md` for extracting poster content from papers
- Combine with `references/tools/scientific-schematics.md` for diagram creation

## Resources

- python-pptx documentation: https://python-pptx.readthedocs.io/
- PowerPoint poster templates: https://www.posterpresentations.com/free-poster-templates.html
- LibreOffice conversion: https://www.libreoffice.org/
