# Academic Research Skill Pack

Comprehensive academic research toolkit for HBE — from literature review to camera-ready submission.

## Features

- **7 Sub-Workflows**: Literature review, paper writing, experiment design, rebuttal, thesis writing, slide creation, systematic review
- **LaTeX Compilation**: Auto-detect local TeXLive / Overleaf / Docker, support pdflatex/xelatex/lualatex/latexmk
- **12+ Journal Templates**: NeurIPS, ICML, ICLR, ACL, AAAI, IEEE, Springer, Elsevier, ACM, APS, Chinese thesis, Beamer
- **Citation Management**: arXiv API, Semantic Scholar, BibTeX generation, DOI resolution
- **Quality Gates**: 7-dimension reviewer simulation, 3 validation checkpoints, self-review checklist
- **Bilingual Support**: English and Chinese academic writing, ctex/xecjk integration

## Quick Start

```bash
# Check LaTeX environment
/hbe:academic check-env

# Start a new paper project
/hbe:academic paper --venue neurips --title "Your Paper Title"

# Literature review
/hbe:academic lit-review --topic "your research topic"

# Compile LaTeX
/hbe:academic compile --engine xelatex --template neurips
```

## Directory Structure

```
academic-research/
├── SKILL.md              # Main skill definition
├── _meta.json            # Publishing metadata
├── README.md             # This file
├── references/           # Reference documents
│   ├── writing-guide.md
│   ├── citation-workflow.md
│   ├── latex-environment.md
│   ├── journal-templates-guide.md
│   └── systematic-review-methodology.md
├── templates/            # LaTeX templates (12+ venues)
├── scripts/              # Helper scripts
│   ├── compile.sh
│   ├── check-environment.sh
│   └── search_arxiv.py
└── workflows/            # Sub-workflow definitions
    ├── literature-review.md
    ├── paper-writing.md
    ├── experiment-design.md
    └── rebuttal.md
```

## Supported Venues

| Venue | Type | Template | Compiler |
|-------|------|----------|----------|
| NeurIPS | Conference | ✅ | pdflatex/xelatex |
| ICML | Conference | ✅ | pdflatex/xelatex |
| ICLR | Conference | ✅ | pdflatex/xelatex |
| ACL/EMNLP | Conference | ✅ | pdflatex/xelatex |
| AAAI | Conference | ✅ | pdflatex/xelatex |
| IEEE (Trans/Conf) | Journal/Conf | ✅ | pdflatex |
| Springer (LNCS) | Conference | ✅ | pdflatex |
| Elsevier | Journal | ✅ | pdflatex |
| ACM | Conference | ✅ | pdflatex |
| APS (Phys Rev) | Journal | ✅ | pdflatex |
| Chinese Thesis | Thesis | ✅ | xelatex |
| Beamer Slides | Presentation | ✅ | pdflatex/xelatex |

## License

MIT
