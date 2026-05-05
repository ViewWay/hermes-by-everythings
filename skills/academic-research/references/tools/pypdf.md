---
name: pypdf
description: PDF manipulation — merge, split, rotate, extract text, and add watermarks
domain: Data I/O
install: pip install pypdf
---

# pypdf — PDF Manipulation / PDF 操作

pypdf reads, merges, splits, rotates, and extracts text from PDF files. Essential for managing academic PDFs, combining papers, and preparing camera-ready manuscripts.

## When to Use / 适用场景

- Merging supplementary materials with main manuscript
- Extracting text from PDF papers for analysis
- Splitting large PDFs into sections
- Rotating incorrectly oriented pages
- Adding page numbers or watermarks

## Quick Start / 快速开始

```python
from pypdf import PdfReader, PdfWriter

# Read PDF
reader = PdfReader("paper.pdf")
print(f"Pages: {len(reader.pages)}")

# Extract text from first page
text = reader.pages[0].extract_text()

# Merge two PDFs
writer = PdfWriter()
writer.append("main.pdf")
writer.append("supplementary.pdf")
writer.write("combined.pdf")
```

## Core Capabilities / 核心能力

### 1. Reading and Text Extraction / 读取与文本提取

```python
from pypdf import PdfReader

reader = PdfReader("paper.pdf")

# Page count
print(f"Total pages: {len(reader.pages)}")

# Extract text from specific page
page = reader.pages[0]
text = page.extract_text()

# Extract all text
full_text = ""
for page in reader.pages:
    full_text += page.extract_text() + "\n\n"

# Metadata
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
print(f"Created: {meta.get('/CreationDate', 'N/A')}")

# Page dimensions
page = reader.pages[0]
box = page.mediabox
print(f"Width: {float(box.width):.0f} pt, Height: {float(box.height):.0f} pt")
```

### 2. Merging PDFs / 合并 PDF

```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()

# Append entire files
writer.append("chapter1.pdf")
writer.append("chapter2.pdf")
writer.append("chapter3.pdf")

# Append specific pages
source = PdfReader("large.pdf")
for i in [0, 1, 5, 10]:
    writer.add_page(source.pages[i])

# Insert at specific position
writer.insert_page(source.pages[3], index=0)  # Insert as first page

writer.write("merged.pdf")
```

### 3. Splitting PDFs / 拆分 PDF

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("full_paper.pdf")

# Split into individual pages
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    writer.write(f"page_{i+1}.pdf")

# Split by range
writer = PdfWriter()
for page in reader.pages[5:10]:  # Pages 6-10
    writer.add_page(page)
writer.write("section.pdf")
```

### 4. Rotation and Manipulation / 旋转与操作

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("upside_down.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.rotate(90)  # Rotate 90 degrees clockwise
    writer.add_page(page)

writer.write("rotated.pdf")
```

### 5. Adding Watermarks / 添加水印

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("paper.pdf")
watermark = PdfReader("watermark.pdf").pages[0]
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

writer.write("watermarked.pdf")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Prepare Camera-Ready PDF / 准备 Camera-Ready PDF

```python
from pypdf import PdfReader, PdfWriter

# Merge main paper + supplementary
writer = PdfWriter()
writer.append("camera_ready_main.pdf")
writer.append("supplementary_material.pdf")
writer.write("full_submission.pdf")

# Verify page count
reader = PdfReader("full_submission.pdf")
assert len(reader.pages) <= 12, f"Too many pages: {len(reader.pages)}"
print(f"Submission ready: {len(reader.pages)} pages")
```

### Workflow 2: Batch Text Extraction for Literature Mining / 批量文本提取

```python
from pypdf import PdfReader
import glob
import json

papers = {}
for pdf_path in glob.glob("papers/*.pdf"):
    try:
        reader = PdfReader(pdf_path)
        text = " ".join(page.extract_text() for page in reader.pages)
        papers[pdf_path] = {
            "pages": len(reader.pages),
            "text": text[:5000],  # First 5000 chars
            "title": reader.metadata.title if reader.metadata else None
        }
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")

with open("extracted_texts.json", "w") as f:
    json.dump(papers, f, indent=2)
```

## Best Practices / 最佳实践

- Use `extract_text()` for search/indexing; quality varies by PDF formatting
- For scanned PDFs, use OCR (tesseract) before text extraction
- Close writer objects after use to free resources
- Verify page dimensions match venue requirements before submission

## Common Pitfalls / 常见陷阱

- **Text extraction quality**: Column layouts may produce garbled text; try different extraction modes
- **Encrypted PDFs**: Some papers are DRM-protected; pypdf can handle owner passwords
- **Scanned PDFs**: No embedded text; need OCR preprocessing
- **Font encoding**: Special characters may not extract correctly

## Integration with HBE / 与 HBE 集成

- Use with `workflows/paper-writing.md` for manuscript preparation
- Pair with `references/tools/pdfplumber.md` for better table extraction
- Combine with `references/latex-environment.md` for PDF compilation pipeline

## Resources / 资源

- Documentation: https://pypdf.readthedocs.io/
- PyPI: https://pypi.org/project/pypdf/
