---
name: docx
description: Create and modify Word .docx documents — paragraphs, tables, images, and styles
domain: Data I/O
install: pip install python-docx
---

# python-docx (docx) — Word Document Generation / Word 文档生成

python-docx creates and modifies Word .docx files programmatically: adding paragraphs, tables, images, headers/footers, and styled content.

## When to Use / 适用场景

- Generating research reports and supplementary documents
- Converting analysis results to formatted Word documents
- Automating manuscript preparation for non-LaTeX venues
- Creating lab reports with embedded figures and tables

## Quick Start / 快速开始

```python
from docx import Document
from docx.shared import Inches, Pt, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()
doc.add_heading("Research Report", level=1)
doc.add_paragraph("This study investigates the effect of treatment on outcomes.")

# Add formatted paragraph
p = doc.add_paragraph()
run = p.add_run("Key finding: ")
run.bold = True
run.font.size = Pt(12)
p.add_run("Treatment group showed 30% improvement over control (p < 0.001).")

# Add image
doc.add_picture("figure1.png", width=Inches(5))
doc.save("report.docx")
```

## Core Capabilities / 核心能力

### 1. Document Structure / 文档结构

```python
from docx import Document

doc = Document()

# Headings (levels 1-9)
doc.add_heading("Introduction", level=1)
doc.add_heading("Background", level=2)

# Paragraphs with formatting
p = doc.add_paragraph("Normal text ")
p.add_run("bold text").bold = True
p.add_run(" and ")
p.add_run("italic text").italic = True
p.add_run(" and ")
p.add_run("underline").underline = True

# Lists
doc.add_paragraph("First item", style="List Bullet")
doc.add_paragraph("Second item", style="List Bullet")
doc.add_paragraph("Step 1", style="List Number")
doc.add_paragraph("Step 2", style="List Number")

# Page break
doc.add_page_break()
```

### 2. Tables / 表格

```python
from docx import Document
from docx.shared import Inches

doc = Document()

# Create table
headers = ["Method", "Accuracy", "F1", "Time (s)"]
data = [["Baseline", 0.85, 0.83, 12.3],
        ["Ours", 0.92, 0.91, 8.7],
        ["SOTA", 0.91, 0.90, 15.2]]

table = doc.add_table(rows=len(data)+1, cols=len(headers), style="Light Grid Accent 1")

# Header row
for j, h in enumerate(headers):
    table.rows[0].cells[j].text = h
    for paragraph in table.rows[0].cells[j].paragraphs:
        for run in paragraph.runs:
            run.bold = True

# Data rows
for i, row in enumerate(data):
    for j, val in enumerate(row):
        table.rows[i+1].cells[j].text = str(val)

# Set column widths
for row in table.rows:
    row.cells[0].width = Inches(1.5)
    for j in range(1, 4):
        row.cells[j].width = Inches(1.0)
```

### 3. Images and Captions / 图片与标题

```python
from docx import Document
from docx.shared import Inches, Pt

doc = Document()

# Add centered image
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run()
run.add_picture("figure.png", width=Inches(5.5))

# Add caption
caption = doc.add_paragraph("Figure 1: Model performance comparison across datasets.")
caption.alignment = WD_ALIGN_PARAGRAPH.CENTER
caption.style.font.size = Pt(10)
caption.runs[0].italic = True
```

### 4. Headers, Footers, and Styles / 页眉页脚与样式

```python
from docx import Document
from docx.shared import Pt

doc = Document()

# Header
section = doc.sections[0]
header = section.header
header.paragraphs[0].text = "Confidential — Draft"
header.paragraphs[0].style.font.size = Pt(8)

# Footer with page number
from docx.oxml.ns import qn
footer = section.footer
p = footer.paragraphs[0]
run = p.add_run()
fldChar = run._r.makeelement(qn("w:fldChar"), {qn("w:fldCharType"): "begin"})
run._r.append(fldChar)
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Generate Methods Section from Template / 从模板生成方法章节

```python
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

doc = Document()
doc.add_heading("Methods", level=1)

# Study design
doc.add_heading("Study Design", level=2)
doc.add_paragraph(
    f"We conducted a {study_design} study with {n_subjects} participants. "
    f"Subjects were randomly assigned to treatment (n={n_treatment}) "
    f"and control (n={n_control}) groups."
)

# Statistical analysis
doc.add_heading("Statistical Analysis", level=2)
doc.add_paragraph(
    f"Continuous variables were compared using {test_name}. "
    f"Categorical variables were compared using chi-square test. "
    f"All tests were two-sided with significance level α = 0.05. "
    f"Statistical analysis was performed using Python {version}."
)

# Add results table
doc.add_heading("Results Summary", level=2)
table = doc.add_table(rows=len(results)+1, cols=4, style="Light Grid Accent 1")
for j, h in enumerate(["Variable", "Treatment", "Control", "p-value"]):
    table.rows[0].cells[j].text = h
for i, row in enumerate(results):
    for j, val in enumerate(row):
        table.rows[i+1].cells[j].text = str(val)

doc.save("methods_report.docx")
```

## Best Practices / 最佳实践

- Use styles ("List Bullet", "List Number") for consistent formatting
- Set image widths explicitly to avoid oversized images
- Use table styles ("Light Grid Accent 1", etc.) for clean formatting
- Keep programmatic generation simple; complex layouts are better in Word directly

## Common Pitfalls / 常见陷阱

- **Font sizing**: Use `Pt()` or `Inches()` units, not raw numbers
- **Table alignment**: Table cell text alignment must be set per paragraph
- **Image quality**: Use high-resolution images (≥300 DPI) for print documents
- **Encoding**: Ensure UTF-8 encoding for documents with special characters

## Integration with HBE / 与 HBE 集成

- Generate supplementary documents for `workflows/paper-writing.md`
- Pair with `references/tools/pandas.md` to export DataFrames as Word tables
- Combine with `references/tools/matplotlib.md` to embed figures

## Resources / 资源

- Documentation: https://python-docx.readthedocs.io/
- Tutorial: https://python-docx.readthedocs.io/en/latest/user/documents.html
