---
name: venue-templates
description: Venue-specific templates — conference and journal formatting templates (NeurIPS, ICML, Nature, IEEE, etc.)
domain: Research / Templates
install: N/A (methodology)
---

# Venue Templates

Each academic venue has specific formatting requirements for paper submissions. Using the correct template from the start saves time, avoids reformatting, and ensures compliance with submission systems. This guide covers the major machine learning, computer science, biology, and general science venues with their templates, page limits, and submission checklists.

## When to Use

- Starting a new paper and choosing the target venue
- Formatting a manuscript for a specific conference or journal
- Preparing a submission package (LaTeX source, supplementary materials)
- Checking compliance with venue-specific requirements before submission
- Migrating a paper between venues (e.g., conference to journal extension)
- Setting up a shared LaTeX template for a research group

## Quick Start

Most venues provide official LaTeX templates on their author information pages. Always use the official template, not a third-party copy.

```bash
# NeurIPS 2025 template
curl -sO https://media.neurips.cc/Conferences/NeurIPS2025/Styles/neurips_2025.sty

# ICML 2025 template (uses LaTeX article class)
curl -sO https://icml.cc/Conferences/2025/Style/icml2025.sty

# IEEE Conference template
# Use IEEEtran: \documentclass[conference]{IEEEtran}
```

## Core Capabilities

### 1. Machine Learning / AI Venues

| Venue | Template | Page Limit | Reference Style | Submission System |
|-------|----------|------------|-----------------|-------------------|
| NeurIPS | `neurips_2025.sty` | 9 pages + refs | natbib / neurips | CMT |
| ICML | `icml2025.sty` | 8 pages + refs | natbib | CMT |
| ICLR | OpenReview template | 10 pages unlimited | OpenReview format | OpenReview |
| AAAI | AAAI style file | 7 pages + refs | AAAI format | EasyChair |
| CVPR | IEEE CVPR template | 8 pages + refs | IEEEtran | CMT |
| ACL | ACL style (`acl.sty`) | 8 pages + refs | ACL format | Softconf |
| EMNLP | ACL style (`acl.sty`) | 8 pages + refs | ACL format | Softconf |
| KDD | ACM sig-alternate | 9 pages + refs | ACM format | Precision |

**NeurIPS LaTeX preamble:**
```latex
\documentclass{article}
\usepackage{neurips_2025}
\usepackage{amsmath, amssymb, amsfonts}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{hyperref}
\title{Your Paper Title}
\author{Author One \and Author Two}
\begin{document}
\maketitle
\begin{abstract}...\end{abstract}
\end{document}
```

### 2. Biology and General Science Journals

| Venue | Template | Word Limit | Figure Limits | Submission System |
|-------|----------|------------|---------------|-------------------|
| Nature | Nature Word template | ~3000 words | 4-6 display items | Editorial Manager |
| Science | Science Word template | ~2500 words | 4-5 figures | Editorial Manager |
| Cell | Cell Word template | ~4000 words | 6-8 figures | Editorial Manager |
| PNAS | PNAS Word/LaTeX | ~4500 words | 6 figures | Editorial Manager |
| PLOS ONE | PLOS LaTeX template | None (no strict limit) | 10 figures | Editorial Manager |
| eLife | eLife LaTeX | ~2500 words | 5-7 display items | Editorial Manager |
| BioRxiv | Generic (any format) | None | None | BioRxiv upload |

**Nature-specific requirements:**
- Methods section: no word limit, but must fit in one page of print
- Extended Data: supplementary figures/tables published online only
- Abstract: ~150 words, no citations, no abbreviations
- References: numbered sequentially, max ~50

### 3. IEEE and Engineering Venues

| Venue | Template | Page Limit | Format | Submission System |
|-------|----------|------------|--------|-------------------|
| IEEE Transactions | IEEEtran (journal) | 10-14 pages | Two-column | ScholarOne |
| IEEE Conferences | IEEEtran (conference) | 6-8 pages | Two-column | IEEE CSS |
| ACM Conferences | sig-alternate / acmart | 8-10 pages | Various | Precision / HotCRP |
| ACM TOCS/SIGMOD | acmart | 14 pages | Two-column | ScholarOne |

**IEEE LaTeX preamble:**
```latex
\documentclass[journal]{IEEEtran}
\usepackage{cite}
\usepackage{amsmath, amssymb}
\usepackage{graphicx}
\usepackage{balance}
\begin{document}
\title{Your IEEE Paper Title}
\author{Author~One,~\IEEEmembership{Member,~IEEE}
\and Author~Two,~\IEEEmembership{Fellow,~IEEE}
\maketitle
\end{document}
```

## Common Academic Workflow

### Workflow: Preparing a NeurIPS Submission

1. **Download template**: Get `neurips_2025.sty` from the official NeurIPS website.
2. **Set up project structure**:
   ```
   paper/
   ├── main.tex
   ├── neurips_2025.sty
   ├── figures/
   │   ├── fig1_motivation.pdf
   │   ├── fig2_results.pdf
   │   └── fig3_ablation.pdf
   ├── sections/
   │   ├── intro.tex
   │   ├── method.tex
   │   ├── experiments.tex
   │   └── related_work.tex
   ├── tables/
   │   └── table1_results.tex
   ├── references.bib
   └── suppmat.tex  (supplementary)
   ```
3. **Write in sections**: Use `\input{sections/intro}` to keep main file clean.
4. **Check page count**: Compile with `pdflatex` and verify the PDF is 9 pages (content only; references do not count toward the limit).
5. **Supplementary materials**: Compile separately as `suppmat.pdf` with no page limit.
6. **Final checklist** (see below) before submission.

### Pre-Submission Checklist (Universal)

- [ ] Page/word count within limits (excluding references for ML conferences)
- [ ] All figures are vector format (PDF) or 300+ DPI (PNG/TIFF)
- [ ] All figures are legible at print size (font >= 7pt)
- [ ] References are complete and correctly formatted
- [ ] Author list and affiliations match the submission system
- [ ] Supplementary materials are self-contained (no missing files)
- [ ] Abstract meets word limit and contains no citations
- [ ] Conflict of interest and ethics statements included (if required)
- [ ] PDF compiles cleanly with no warnings about missing fonts/packages
- [ ] Anonymous version prepared (double-blind venues): remove author names, self-citations masked

## Best Practices

1. **Use the official template** — never modify the `.sty` file. Customize via preamble commands.
2. **Start with the right template** — switching templates late in the writing process is time-consuming.
3. **Use BibTeX/BibLaTeX** — manage references in a `.bib` file, not inline. Use `biblatex` with `style=authoryear` or `style=numeric` as required.
4. **Compile frequently** — catch LaTeX errors early. Use `latexmk -pdf main.tex` for automatic compilation.
5. **Test anonymous version** — before submitting to double-blind venues, compile with `\usepackage{blindreview}` or manually remove identifying information.

## Common Pitfalls

1. **Wrong page count**: For NeurIPS/ICML, the page limit applies to content only (references are excluded). Always verify by checking the PDF page count minus the bibliography pages.
2. **Low-resolution figures**: Journals will desk-reject papers with figures below 300 DPI. Always use vector format (PDF/SVG) when possible.
3. **Overlength supplementary materials**: Some venues (e.g., NeurIPS) allow unlimited supplementary, but reviewers are not required to read it. Keep supplementary focused and well-organized.
4. **Missing anonymization**: For double-blind review, ensure author names are removed from the PDF metadata (use `\pdfinfo` to clear), not just from the document body.
5. **Incompatible packages** — some venues load specific packages that conflict with common tools. Test compilation early.

## Integration with HBE

- Use within `workflows/paper-writing.md` to select the correct template at the start of a writing project.
- Pair with `references/tools/scientific-writing.md` to ensure content quality matches formatting quality.
- Combine with `references/tools/scientific-visualization.md` to ensure figures meet venue resolution requirements.
- Use `/hbe-review` to check manuscript compliance with a specific venue's formatting rules.

## Resources

- NeurIPS 2025 Author Guidelines: https://neurips.cc/Conferences/2025/PaperInformation/AuthorGuidelines
- ICML 2025 Author Guidelines: https://icml.cc/Conferences/2025/AuthorGuidelines
- ICLR OpenReview: https://openreview.net/
- Nature Author Guide: https://www.nature.com/nature/for-authors/
- IEEE Author Tools: https://www.ieee.org/conferences/publishing/templates.html
- Overleaf template gallery: https://www.overleaf.com/latex/templates
