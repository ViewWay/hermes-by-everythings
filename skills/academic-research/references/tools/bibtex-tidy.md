---
name: bibtex-tidy
description: BibTeX file formatter and cleaner — sort entries, normalize fields, fix encoding, and deduplicate
domain: Research Workflow
install: npm install -g bibtex-tidy 2>/dev/null || npx bibtex-tidy
---

# bibtex-tidy — BibTeX Formatter and Cleaner

## Overview

bibtex-tidy is a CLI tool that formats, sorts, deduplicates, and normalizes BibTeX files. It ensures consistent citation keys, fixes encoding issues, aligns fields, and integrates into LaTeX build pipelines to maintain clean reference libraries across collaborative projects.

## When to Use

- Cleaning up a messy `.bib` file accumulated over months of research
- Deduplicating entries after merging multiple bibliography sources
- Normalizing field formats (title case, date vs. year, etc.) before submission
- Sorting references alphabetically or by citation order for journal requirements
- Enforcing consistent formatting across co-authors in a shared repository

## Quick Start

```bash
# Install via npm
npm install -g bibtex-tidy

# Basic format and sort
bibtex-tidy references.bib

# Format in-place with specific options
bibtex-tidy references.bib --sort=key --duplicates --align --trailing-commas

# Output to a new file (non-destructive)
bibtex-tidy input.bib --output=output.bib
```

## Core Capabilities

### 1. Sorting Options

Control the order of entries in the bibliography file.

```bash
# Sort by citation key (alphabetical)
bibtex-tidy refs.bib --sort=key

# Sort by year (newest first)
bibtex-tidy refs.bib --sort=year

# Sort by type (article, inproceedings, book, then misc)
bibtex-tidy refs.bib --sort=type

# Sort by first author last name
bibtex-tidy refs.bib --sort=author

# Multi-key sort: type first, then year within each type
bibtex-tidy refs.bib --sort=type,year
```

### 2. Duplicate Detection

Find and resolve duplicate entries that differ only in formatting.

```bash
# Detect duplicates (interactive merge)
bibtex-tidy refs.bib --duplicates

# Select merge strategy
bibtex-tidy refs.bib --duplicates=smart    # Keep most complete entry
bibtex-tidy refs.bib --duplicates=first    # Keep first occurrence
bibtex-tidy refs.bib --duplicates=last     # Keep last occurrence

# Output duplicate report without modifying file
bibtex-tidy refs.bib --duplicates --dry-run
```

### 3. Field Normalization

Standardize field formats across all entries.

```bash
# Strip enclosing braces and quotes from titles
bibtex-tidy refs.bib --strip-enclosing-braces

# Normalize field values (e.g., unify month formats)
bibtex-tidy refs.bib --sort-fields=key    # Sort fields alphabetically

# Remove empty fields
bibtex-tidy refs.bib --remove-empty-fields

# Add trailing commas for git-friendly diffs
bibtex-tidy refs.bib --trailing-commas

# Align fields for readability
bibtex-tidy refs.bib --align=14
```

### 4. Key Generation

Generate consistent, predictable citation keys.

```bash
# Author-year-key pattern: Smith2020deep
bibtex-tidy refs.bib --generate-keys

# Custom key format: [author][year][first-word-of-title]
bibtex-tidy refs.bib --generate-keys=lowercase
```

## Common Academic Workflow

### Pre-Submission Bibliography Cleanup

```bash
# Step 1: Backup original
cp references.bib references.bib.bak

# Step 2: Format, deduplicate, and sort
bibtex-tidy references.bib \
    --sort=type,year \
    --duplicates=smart \
    --strip-enclosing-braces \
    --remove-empty-fields \
    --trailing-commas \
    --align=14 \
    --curly \
    --numeric \
    --sort-fields

# Step 3: Check for missing required fields
bibtex-tidy refs.bib --validate
```

### Makefile Integration

```makefile
# In your LaTeX project Makefile
.PHONY: tidy-bib
tidy-bib:
    bibtex-tidy references.bib \
        --sort=key --duplicates --align --trailing-commas \
        --strip-enclosing-braces --remove-empty-fields

# Run before every PDF build
paper.pdf: paper.tex references.bib tidy-bib
    pdflatex paper.tex && bibtex paper && pdflatex paper.tex && pdflatex paper.tex
```

## Best Practices

1. **Run `--duplicates=smart` before submission**: Merges entries that differ only in field formatting.
2. **Use `--trailing-commas`**: Each field on its own line produces cleaner git diffs.
3. **Track the `.bib` file in git**: Combined with consistent formatting, this makes co-author changes reviewable.
4. **Backup before bulk operations**: `bibtex-tidy` can modify in-place; always keep a `.bak`.
5. **Use `--dry-run` first**: Preview changes before committing to aggressive reformatting.

## Common Pitfalls

1. **Over-aggressive deduplication**: `--duplicates` may merge entries that are genuinely different papers with similar metadata; always review.
2. **Key regeneration breaks citations**: `--generate-keys` changes citation keys, requiring updates in all `.tex` files.
3. **Field stripping loses intentional casing**: `--strip-enclosing-braces` can flatten title-case preservation in BibTeX.
4. **No Python API**: This is a CLI-only tool; call via `subprocess` if automation in Python is needed.

## Integration with HBE

- Pair with `references/tools/zotero.md` or `references/tools/pyzotero.md` for export-then-format workflow
- Use in `references/latex-environment.md` build pipeline via Makefile
- Supports `workflows/paper-writing.md` Phase 5 (Final Checks)
- Combine with `references/tools/latexdiff.md` to verify bibliography changes between revisions

## Resources

- GitHub repository: https://github.com/FlamingTempura/bibtex-tidy
- npm package: https://www.npmjs.com/package/bibtex-tidy
- BibTeX best practices: https://tex.stackexchange.com/questions/25701/bibtex-biblatex-bibliography-management
