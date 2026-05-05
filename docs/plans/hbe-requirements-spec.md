# HBE Academic Research — Requirements Specification / 需求规格说明书

> **Product**: Hermes by Everything's — Academic Research Skill Pack
> **Version**: 2.0.0 | **Date**: 2026-05-05
> **Status**: Released | **Document Version**: 1.0

---

## 1. Product Overview / 产品概述

### 1.1 Product Identity

HBE Academic Research is a cross-disciplinary academic research skill pack for Claude Code, providing 150 tool references, 20 methodology guides, 5 workflows, and 12 LaTeX templates covering 19 academic disciplines. It is a component of the Hermes by Everything's (HBE) ecosystem.

### 1.2 Target Users

| User Profile | Primary Need | Usage Pattern |
|---|---|---|
| Graduate student (CN/EN) | Paper writing, literature review, thesis | Heavy daily use, all workflows |
| Postdoc researcher | Experiment design, benchmarking, reproducibility | Per-project use |
| PI / Faculty | Grant proposals, idea evaluation, research integrity | Periodic use |
| Industry researcher | ML benchmarking, data processing, causal inference | Per-project use |
| Undergraduate (CN) | Thesis template, citation, basic tools | Light use, thesis-focused |

### 1.3 Design Principles

1. **Cross-domain by default** — works for biology, physics, economics, CS, chemistry, etc.
2. **Bilingual** — all documentation in EN/CN
3. **Executable code** — every code example is runnable standalone
4. **Tier 1 quality** — every tool file >= 90 lines with 8-section structure
5. **Infrastructure-backed** — leverages HBE's Ralph, Orchestrator, Memory systems

---

## 2. Functional Requirements / 功能需求

### 2.1 Core Components

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-01 | **Tool References**: 150 deep tool guides with consistent 8-section structure | P0 | Done |
| FR-02 | **Reference Guides**: 20 methodology guides | P0 | Done |
| FR-03 | **Workflows**: 5 structured workflows (lit-review, paper-writing, experiment-design, rebuttal, ml-benchmarking) | P0 | Done |
| FR-04 | **LaTeX Templates**: 12 templates for major venues | P0 | Done |
| FR-05 | **Scripts**: 3 utility scripts (compile.sh, check-environment.sh, search_arxiv.py) | P1 | Done |

### 2.2 SKILL.md Sub-Commands (23 Commands)

| # | Command | Function |
|---|---|---|
| 1 | `check-env` | Detect LaTeX, Python, tool installations |
| 2 | `lit-review` | Structured literature review with PRISMA |
| 3 | `paper` | Full paper writing workflow with 3 gates |
| 4 | `experiment` | Experiment design with claims extraction |
| 5 | `rebuttal` | Rebuttal letter writing with Zotero search |
| 6 | `compile` | LaTeX compilation with error fixing |
| 7 | `idea-eval` | Research idea evaluation (5 dimensions) |
| 8 | `figure-design` | Publication figure design advisor |
| 9 | `de-aigc` | De-AIGC review for AI-assisted writing |
| 10 | `causal` | 8-step causal inference pipeline |
| 11 | `template` | Template management and deployment |
| 12 | `databases` | Unified 50+ database search |
| 13 | `integrity` | Research integrity check |
| 14 | `pre-submit` | Pre-submission 5-dimension review |
| 15 | `benchmark` | Benchmark paper writing (6-stage) |
| 16 | `reproduce` | Paper reproduction workflow |
| 17 | `vibe` | AI collaboration rules for research |
| 18 | `deep-read` | Deep paper reading methodology |
| 19 | `data` | Research data processing (7-stage pipeline) |
| 20 | `tools` | Tool registry and recommendation |
| 21 | `hypothesis` | Hypothesis generation and critical thinking |
| 22 | `stat-analysis` | Statistical analysis guide |
| 23 | `tool-deep` | Per-package deep dive |

### 2.3 Key Functional Capabilities

#### FR-10: Unified Database Access

Single `query_db(category, terms)` function searching 50+ databases across 7 categories with automatic DOI deduplication.

- **Categories**: Literature (7 DB), Life Sciences (7), Physical Sciences (3), Social Science (4), Engineering (1), Data/Code (4), Clinical (2)
- **Output fields**: title, authors, year, doi, url, abstract, source
- **Cross-category search**: `search_all(terms)` queries all categories simultaneously
- **BibTeX export**: `search_to_bibtex(results)` resolves DOIs to BibTeX

#### FR-11: Causal Inference Pipeline

8-step pipeline with runnable Python code:
1. Data cleaning (imputation, winsorization)
2. Variable construction (log/IHS, panel lag/lead)
3. Descriptive statistics (balance tables, SMD)
4. Diagnostic tests (7 types)
5. Causal estimation (DID, IV, RDD, PSM, DML, CF)
6. Robustness (6-test ladder, clustering, placebo)
7. Further analysis (heterogeneity, mediation, dose-response)
8. Publication output (stargazer, coefplot, love plot)

Cross-discipline adaptation for 8 disciplines (economics, political science, epidemiology, education, sociology, public health, psychology, environmental science).

#### FR-12: ML Benchmarking Workflow

8-step workflow:
1. Define task and metrics (BenchmarkConfig)
2. Load and split data (HuggingFace datasets)
3. Set up baselines (SOTA from PWC)
4. Training harness (multi-seed PyTorch)
5. Evaluation (classification + generation metrics)
6. Statistical significance (t-test, Wilcoxon, bootstrap, Bayesian)
7. Ablation and scaling experiments
8. LaTeX tables and matplotlib plots

Templates: NLP (GLUE), CV (ImageNet), RL (Atari), LLM (MT-Bench)

#### FR-13: Zotero Integration

5 modules:
1. Setup — API key, connection verification
2. Collection management — project hierarchy, auto-tag, move items
3. BibTeX pipeline — export, sync, duplicate detection
4. Literature review — extract annotations, generate reading lists
5. Rebuttal — search library for reviewer concerns, draft citations

#### FR-14: LaTeX Template System

12 templates: NeurIPS, ICML, ICLR, AAAI, IEEE, ACL, ACM, APS, Springer, Elsevier, thesis-CN, beamer. Each includes complete document structure, venue formatting, and compilation instructions.

#### FR-15: Cross-Discipline Coverage

19 domains with explicit cross-links:
Biology(20), ML(18), Chemistry(11), Physics(10), Research(9), Data(8), SocialSci(7), Engineering(7), Medicine(7), Economics(6), Quantum(3), Geospatial(3), NLP(3), Math(3), Visualization(3), Optimization(3), Simulation(2), Distributed(2), Neuroscience(1)

---

## 3. Non-Functional Requirements / 非功能需求

### 3.1 Quality

| ID | Requirement | Target | Current |
|---|---|---|---|
| NFR-01 | Tier 1 completeness | 100% files >= 90 lines | 100% (150/150) |
| NFR-02 | Code executability | 100% runnable | 100% |
| NFR-03 | Structure consistency | 100% with all 8 sections | 100% |
| NFR-04 | Bilingual coverage | 100% EN/CN | 100% |
| NFR-05 | Documentation depth | >= 200 lines avg | 203 lines avg |

### 3.2 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-10 | Pack size | < 2 MB |
| NFR-11 | Skill load time | < 2 seconds |
| NFR-12 | DB query latency | < 30s per database |
| NFR-13 | LaTeX compilation | < 60s for 20 pages |

### 3.3 Compatibility

| ID | Requirement | Target |
|---|---|---|
| NFR-20 | Platform | Claude Code CLI, Desktop, Web, IDE |
| NFR-21 | OS | macOS, Linux, Windows |
| NFR-22 | LaTeX | TeX Live 2023+, MiKTeX |
| NFR-23 | Python | 3.9+ |

### 3.4 Maintainability

| ID | Requirement | Target |
|---|---|---|
| NFR-30 | File naming | lowercase-with-hyphens.md |
| NFR-31 | Frontmatter | YAML (name, description, domain, install) |
| NFR-32 | Version tracking | _meta.json |
| NFR-33 | Cross-references | All internal links valid |

---

## 4. Architecture / 架构

### 4.1 Directory Structure

```
skills/academic-research/
├── _meta.json                  # Pack metadata (version, tags)
├── SKILL.md                    # Main skill (23 sub-commands)
├── README.md                   # User documentation
├── references/
│   ├── tools/                  # 150 tool reference files
│   │   ├── _TEMPLATE.md        # Template for new tools
│   │   ├── _PROGRESS.md        # Coverage tracking
│   │   └── *.md                # Per-tool deep guides
│   ├── causal-inference-guide.md
│   ├── citation-workflow.md
│   ├── scientific-databases-guide.md
│   └── ... (17 more guides)
├── workflows/
│   ├── literature-review.md
│   ├── paper-writing.md
│   ├── experiment-design.md
│   ├── rebuttal.md
│   └── ml-benchmarking.md
├── templates/                  # 12 LaTeX templates
│   ├── neurips/main.tex
│   ├── icml/main.tex
│   └── ... (10 venues)
└── scripts/
    ├── compile.sh
    ├── check-environment.sh
    └── search_arxiv.py
```

### 4.2 Tool File Structure (8-Section Standard)

```
Frontmatter (YAML): name, description, domain, install
# Title — Full Name / Chinese Name
## When to Use
## Quick Start
## Core Capabilities (2-3 sections with runnable code)
## Common Academic Workflows
## Best Practices
## Common Pitfalls
## Integration with HBE
## Resources
```

### 4.3 Dependencies

| Component | Requires | Purpose |
|---|---|---|
| LaTeX templates | pdflatex, biber | Compilation |
| search_arxiv.py | Python 3.9+ | arXiv API |
| Unified DB query | Python 3.9+ | Database APIs |
| Zotero integration | pyzotero | Zotero API |
| Causal pipeline | statsmodels, linearmodels, econml | Econometrics |
| ML benchmarking | torch, sklearn, scipy, matplotlib | Training/eval |

---

## 5. Traceability Matrix / 追溯矩阵

| Feature | Req ID | Files |
|---|---|---|
| 150 tool references | FR-01 | references/tools/*.md |
| 20 methodology guides | FR-02 | references/*.md |
| 5 workflows | FR-03 | workflows/*.md |
| 12 LaTeX templates | FR-04 | templates/*/main.tex |
| 23 sub-commands | SC-01~23 | SKILL.md |
| Unified DB query | FR-10 | references/scientific-databases-guide.md |
| Causal pipeline | FR-11 | references/causal-inference-guide.md |
| ML benchmarking | FR-12 | workflows/ml-benchmarking.md |
| Zotero integration | FR-13 | references/citation-workflow.md |
| Template system | FR-14 | templates/ |
| Cross-discipline | FR-15 | 150 tools across 19 domains |

---

## 6. Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-05-02 | Initial: 150 tools, 20 refs, 4 workflows, 12 templates |
| 1.1.0 | 2026-05-03 | Expanded 25 Tier 2 files to Tier 1 |
| 1.2.0 | 2026-05-04 | Added 8-step causal inference pipeline |
| 2.0.0 | 2026-05-05 | Added unified DB (50+), ML benchmarking, Zotero. Total: 39,620 lines |

---

*Requirements Specification v1.0 | HBE Academic Research v2.0.0 | 2026-05-05*
