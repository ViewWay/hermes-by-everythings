---
name: pdfplumber
description: PDF text and table extraction with precise coordinate information
domain: Data I/O
install: pip install pdfplumber
---

# pdfplumber — PDF Content Extraction / PDF 内容提取

pdfplumber extracts text, tables, and coordinates from PDF files with higher accuracy than PyPDF2, especially for structured content like academic paper tables.

## When to Use / 适用场景

- Extracting tables from PDF papers for data analysis
- Converting PDF content to structured data (CSV, DataFrame)
- Precise text extraction with coordinate information
- Extracting specific regions from PDF pages

## Quick Start / 快速开始

```python
import pdfplumber

with pdfplumber.open("paper.pdf") as pdf:
    # Extract text from first page
    text = pdf.pages[0].extract_text()
    
    # Extract all tables
    tables = pdf.pages[0].extract_tables()
    for table in tables:
        for row in table:
            print(row)
    
    # Extract words with positions
    words = pdf.pages[0].extract_words()
    print(f"Found {len(words)} words")
```

## Core Capabilities / 核心能力

### 1. Text Extraction / 文本提取

```python
import pdfplumber

with pdfplumber.open("paper.pdf") as pdf:
    # Full page text
    for page in pdf.pages:
        text = page.extract_text()
    
    # Words with coordinates
    words = pdf.pages[0].extract_words(
        x_tolerance=3,
        y_tolerance=3,
        keep_blank_chars=True
    )
    for word in words:
        print(f"'{word['text']}' at ({word['x0']:.1f}, {word['top']:.1f})")
    
    # Characters with full detail
    chars = pdf.pages[0].chars
    for char in chars[:10]:
        print(f"'{char['text']}' font={char.get('fontname')} size={char.get('size')}")
    
    # Lines and rectangles
    lines = pdf.pages[0].lines
    rects = pdf.pages[0].rects
```

### 2. Table Extraction / 表格提取

```python
import pdfplumber
import pandas as pd

with pdfplumber.open("results_table.pdf") as pdf:
    # Extract tables with settings
    table_settings = {
        "vertical_strategy": "lines",
        "horizontal_strategy": "lines",
        "snap_tolerance": 5,
        "join_tolerance": 5,
    }
    
    for page in pdf.pages:
        tables = page.extract_tables(table_settings)
        for i, table in enumerate(tables):
            # First row as headers
            if len(table) > 1:
                df = pd.DataFrame(table[1:], columns=table[0])
                df.to_csv(f"table_page{page.page_number}_{i}.csv", index=False)
    
    # Explicit table bounding box
    page = pdf.pages[2]
    cropped = page.crop((50, 200, 550, 500))  # (left, top, right, bottom)
    table = cropped.extract_table()
```

### 3. Page Cropping and Region Extraction / 页面裁剪与区域提取

```python
import pdfplumber

with pdfplumber.open("paper.pdf") as pdf:
    page = pdf.pages[0]
    
    # Crop to specific region
    top_half = page.crop((0, 0, page.width, page.height / 2))
    text_top = top_half.extract_text()
    
    # Crop to specific column (two-column layout)
    left_col = page.crop((0, 0, page.width / 2, page.height))
    right_col = page.crop((page.width / 2, 0, page.width, page.height))
    
    # Search for specific text
    results = page.search("Conclusion")
    if results:
        bbox = results[0]
        print(f"Found 'Conclusion' at y={bbox['top']:.1f}")
```

### 4. Visualization / 可视化

```python
import pdfplumber

with pdfplumber.open("paper.pdf") as pdf:
    page = pdf.pages[0]
    # Generate image of page with detected elements
    im = page.to_image(resolution=200)
    im.debug_tablefinder({"vertical_strategy": "lines", "horizontal_strategy": "lines"})
    im.save("debug_tables.png")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Extract All Tables from a Paper / 提取论文所有表格

```python
import pdfplumber
import pandas as pd

def extract_all_tables(pdf_path, output_dir="tables/"):
    """Extract all tables from a PDF paper."""
    import os
    os.makedirs(output_dir, exist_ok=True)
    
    with pdfplumber.open(pdf_path) as pdf:
        table_count = 0
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables({
                "vertical_strategy": "lines",
                "horizontal_strategy": "lines",
            })
            for table in tables:
                if len(table) < 2:
                    continue
                df = pd.DataFrame(table[1:], columns=table[0])
                df = df.dropna(how="all")
                if len(df) > 0:
                    table_count += 1
                    output_path = f"{output_dir}table_p{page_num+1}_{table_count}.csv"
                    df.to_csv(output_path, index=False)
                    print(f"Table {table_count}: {len(df)} rows × {len(df.columns)} cols → {output_path}")
        return table_count

n = extract_all_tables("nature_paper.pdf")
print(f"Extracted {n} tables")
```

## Best Practices / 最佳实践

- Use `vertical_strategy="lines"` for line-bounded tables (most academic tables)
- Crop to table region before extraction for better accuracy
- Validate extracted data: check for merged cells and missing values
- Use `to_image().debug_tablefinder()` to visualize table detection

## Common Pitfalls / 常见陷阱

- **No visible lines**: Tables without borders need `vertical_strategy="text"` but accuracy drops
- **Merged cells**: Multi-row/col spans may produce `None` values
- **Two-column layouts**: Need to crop each column separately
- **Scanned PDFs**: No extractable text; need OCR first

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/pandas.md` for table data processing
- Use with `references/tools/pypdf.md` for PDF page manipulation
- Combine with `workflows/literature-review.md` for extracting data from papers

## Resources / 资源

- Documentation: https://github.com/jsvine/pdfplumber
- Tutorial: https://github.com/jsvine/pdfplumber#basic-usage
