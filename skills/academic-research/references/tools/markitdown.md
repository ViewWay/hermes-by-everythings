---
name: markitdown
description: Document to Markdown conversion — convert PDF, DOCX, PPTX, HTML, and other formats to Markdown for analysis
domain: Data / Conversion
install: pip install markitdown 2>/dev/null || echo "See documentation"
---

# markitdown — Document to Markdown Conversion

## Overview

Markitdown converts various document formats (PDF, DOCX, PPTX, HTML, XLSX, images with OCR) into clean Markdown. It enables researchers to extract text from publications, convert presentations to editable text, process scanned documents via OCR, and build text-based analysis pipelines. Built by Microsoft as part of the prompt-flow ecosystem.

## When to Use

- Extracting text from PDF papers for analysis or LLM processing
- Converting Word documents or PowerPoint slides to Markdown for version control
- Building text pipelines that require all inputs in a uniform format
- Processing scanned documents or images containing text (OCR support)
- Converting spreadsheets to readable Markdown tables

## Quick Start

```python
from markitdown import MarkItDown

# Initialize converter
md = MarkItDown()

# Convert a single file
result = md.convert("paper.pdf")
print(result.text_content[:500])

# Convert and save to file
result = md.convert("presentation.pptx")
with open("presentation.md", "w") as f:
    f.write(result.text_content)

# Convert with explicit format override
result = md.convert("document", file_extension=".docx")
```

## Core Capabilities

### 1. File Format Detection and Conversion

```python
from markitdown import MarkItDown
from pathlib import Path

md = MarkItDown()

# Supported formats with automatic detection
supported_formats = {
    ".pdf": "PDF documents (papers, reports, scanned docs)",
    ".docx": "Microsoft Word documents",
    ".pptx": "Microsoft PowerPoint presentations",
    ".xlsx": "Microsoft Excel spreadsheets",
    ".html": "Web pages and HTML documents",
    ".txt": "Plain text files",
    ".md": "Markdown files (passthrough)",
    ".json": "JSON files (formatted output)",
    ".xml": "XML documents",
    ".csv": "CSV data files",
}

# Auto-detect and convert any supported format
for path in Path("data/").glob("*"):
    if path.suffix.lower() in supported_formats:
        result = md.convert(str(path))
        output = path.with_suffix(".md")
        output.write_text(result.text_content)
        print(f"Converted: {path.name} -> {output.name}")
```

### 2. Batch Processing Pipeline

```python
from markitdown import MarkItDown
from pathlib import Path
import json

md = MarkItDown()

def batch_convert(input_dir, output_dir, extensions=None):
    """Convert all documents in a directory to Markdown."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    if extensions is None:
        extensions = {".pdf", ".docx", ".pptx", ".html", ".xlsx"}

    results = []
    for file_path in sorted(input_path.rglob("*")):
        if file_path.suffix.lower() in extensions and file_path.is_file():
            try:
                result = md.convert(str(file_path))
                # Preserve subdirectory structure
                rel_path = file_path.relative_to(input_path)
                out_file = output_path / rel_path.with_suffix(".md")
                out_file.parent.mkdir(parents=True, exist_ok=True)
                out_file.write_text(result.text_content)

                results.append({
                    "input": str(rel_path),
                    "output": str(out_file.relative_to(output_path)),
                    "chars": len(result.text_content),
                    "status": "success",
                })
                print(f"  [OK] {rel_path} ({len(result.text_content)} chars)")
            except Exception as e:
                results.append({
                    "input": str(file_path.relative_to(input_path)),
                    "status": "error",
                    "error": str(e),
                })
                print(f"  [FAIL] {file_path.name}: {e}")

    # Summary
    success = sum(1 for r in results if r["status"] == "success")
    total_chars = sum(r.get("chars", 0) for r in results)
    print(f"\nConverted {success}/{len(results)} files ({total_chars:,} chars total)")
    return results

results = batch_convert("papers/", "papers_markdown/", extensions={".pdf", ".docx"})
```

### 3. Conversion with OCR for Scanned Documents

```python
from markitdown import MarkItDown

# Enable OCR for scanned PDFs and images
md = MarkItDown(enable_plugins=True)

# Convert scanned PDF (requires OCR dependencies)
result = md.convert("scanned_document.pdf")
print(result.text_content[:300])

# Convert image with text (OCR)
result = md.convert("figure_with_text.png")
print(result.text_content)

# For better OCR on academic papers, consider preprocessing:
# 1. High DPI scanning (300+ DPI)
# 2. Pre-crop margins to reduce noise
# 3. Use language-specific OCR models for non-English text
```

## Common Academic Workflow

### Converting a Paper Collection for LLM Analysis

```python
from markitdown import MarkItDown
from pathlib import Path
import re

md = MarkItDown()

def convert_papers_to_corpus(paper_dir, output_file="corpus.md"):
    """Convert all PDF/DOCX papers into a single Markdown corpus."""
    paper_path = Path(paper_dir)
    all_sections = []

    for i, file_path in enumerate(sorted(paper_path.glob("**/*.pdf"))):
        print(f"Processing [{i+1}]: {file_path.name}...")
        try:
            result = md.convert(str(file_path))
            text = result.text_content

            # Clean up common PDF artifacts
            text = re.sub(r'\n{3,}', '\n\n', text)  # collapse multiple newlines
            text = re.sub(r'\s+', ' ', text.split('\n')[0]) if text else ""  # first line cleanup

            # Build section header from filename
            clean_name = file_path.stem.replace("_", " ").replace("-", " ").title()
            section = f"\n\n---\n\n## Paper {i+1}: {clean_name}\n\n{text}\n"
            all_sections.append(section)

        except Exception as e:
            print(f"  Skipped {file_path.name}: {e}")

    # Write combined corpus
    corpus = f"# Academic Paper Corpus\n\n"
    corpus += f"Total papers: {len(all_sections)}\n"
    corpus += f"Generated: {Path(output_file).stat().st_mtime}\n"
    corpus += "\n---\n".join(all_sections)

    Path(output_file).write_text(corpus)
    total_chars = len(corpus)
    print(f"\nCorpus written to {output_file} ({total_chars:,} characters)")
    return output_file

convert_papers_to_corpus("downloaded_papers/", "literature_corpus.md")
```

## Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `enable_plugins` | `False` | Enable OCR and other optional plugins |
| `file_extension` | auto-detect | Override file format detection |
| `llm_model` | `None` | LLM model for complex table/image extraction |
| `llm_client` | `None` | Custom LLM client for advanced extraction |

## Best Practices

1. **Verify output quality**: Always spot-check converted Markdown against the original, especially for tables and equations.
2. **Handle equations carefully**: Math formulas may not convert well. Consider keeping LaTeX source or using MathJax.
3. **Batch with error handling**: Always wrap conversions in try/except and log failures for manual review.
4. **Preserve metadata**: Extract and store paper titles, DOIs, and authors before converting, as conversion may lose structured metadata.
5. **Use for preprocessing only**: Converted Markdown is best used as input for search, summarization, or LLM processing, not as a final output format.

## Common Pitfalls

1. **Multi-column PDF layouts**: Two-column papers (common in CS/biology) may have interleaved text. Consider using `pdfplumber` with column detection for better results.
2. **Low-quality OCR**: Scanned documents at low DPI produce garbled text. Ensure 300+ DPI and clean scans.
3. **Table formatting**: Complex tables with merged cells rarely convert perfectly. Validate critical tables manually.
4. **Large files**: Very large PDFs (>100 pages) may hit memory limits. Split into sections before converting.

## Integration with HBE

- Use as input preprocessing for `references/literature-review.md` text extraction
- Combine with `references/paper-lookup.md` to build searchable text corpora
- Feed Markdown output into `references/scientific-writing.md` for summarization
- Supports `references/textstat.md` for readability analysis on converted text

## Resources

- GitHub: https://github.com/microsoft/markitdown
- PyPI: https://pypi.org/project/markitdown/
- Prompt Flow docs: https://microsoft.github.io/promptflow/
- OCR options: Tesseract, EasyOCR, PaddleOCR
