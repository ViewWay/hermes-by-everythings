# HBE Academic Research — User Manual / 使用手册

> **Product**: Hermes by Everything's — Academic Research Skill Pack
> **Version**: 2.0.0 | **Date**: 2026-05-05

---

## Quick Start / 快速开始

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/hermes-by-everythings.git
cd hermes-by-everythings

# 2. Symlink the skill to Claude Code
ln -s $(pwd)/skills/academic-research ~/.claude/skills/academic-research

# 3. Verify installation
# In Claude Code, the skill auto-loads on research-related keywords
```

### First Use

```
You: I need to write a research paper on transformer attention mechanisms.

Claude: [Auto-loads academic-research skill]
I'll help you write a research paper using the paper writing workflow...
```

---

## 1. Overview / 概览

HBE Academic Research provides **23 sub-commands** covering the complete academic research lifecycle:

```
Idea → Literature → Experiment → Paper → Review → Rebuttal → Submit
 |         |            |          |        |          |
idea-eval lit-review  experiment  paper  pre-submit  rebuttal
hypothesis deep-read  benchmark   compile integrity
           databases  causal      template de-aigc
           tools      data
           stat-analysis
```

### Component Summary

| Component | Count | Description |
|---|---|---|
| Tool References | 150 | Deep guides for scientific Python packages |
| Reference Guides | 20 | Methodology guides (writing, stats, causal, DB, etc.) |
| Workflows | 5 | End-to-end research workflows |
| LaTeX Templates | 12 | Conference/journal/thesis templates |
| Scripts | 3 | Compilation, environment check, arXiv search |

---

## 2. Command Reference / 命令参考

### Research Planning

| Command | Purpose | Example Prompt |
|---|---|---|
| `idea-eval` | Evaluate research idea (5 dimensions) | "Evaluate my idea: using GNN for drug-target interaction" |
| `hypothesis` | Generate hypotheses, critical thinking | "Generate hypotheses for CRISPR off-target effects" |
| `deep-read` | Deep reading methodology | "Deeply read the Attention Is All You Need paper" |
| `vibe` | AI collaboration rules | "Set up AI collaboration guidelines" |

### Literature & Search

| Command | Purpose | Example Prompt |
|---|---|---|
| `lit-review` | Structured review with PRISMA | "Start a lit review on causal inference in ML" |
| `databases` | Search 50+ scientific databases | "Search PubMed for BRCA1 variant studies" |
| `tools` | Tool recommendation by task | "What tool for single-cell RNA-seq?" |
| `tool-deep` | Deep dive into a package | "Deep dive into scanpy" |

### Data & Experiments

| Command | Purpose | Example Prompt |
|---|---|---|
| `data` | 7-stage data processing pipeline | "Clean and process my clinical trial data" |
| `experiment` | Design experiments | "Design experiments to verify my method" |
| `benchmark` | ML benchmarking workflow | "Set up a GLUE benchmark comparison" |
| `stat-analysis` | Statistical analysis guidance | "Which test for comparing two classifiers?" |
| `causal` | 8-step causal inference | "Run DID analysis on my panel data" |

### Writing & Publishing

| Command | Purpose | Example Prompt |
|---|---|---|
| `paper` | Paper writing with 3 quality gates | "Write a NeurIPS paper on my attention method" |
| `template` | Deploy LaTeX templates | "Set up an ICML paper template" |
| `compile` | LaTeX compilation with error fix | "Compile my paper and fix errors" |
| `figure-design` | Publication figure advisor | "Design a figure comparing model performance" |
| `de-aigc` | AI detection risk review | "Check my intro for AIGC signals" |

### Review & Submission

| Command | Purpose | Example Prompt |
|---|---|---|
| `rebuttal` | Write rebuttal letters | "Respond to Reviewer 2's concerns" |
| `pre-submit` | 5-dimension pre-submission check | "Run a full pre-submission review" |
| `integrity` | Research integrity check | "Check for potential integrity issues" |
| `reproduce` | Paper reproduction | "Reproduce Smith et al. 2024 results" |
| `check-env` | Verify installations | "Is my environment ready?" |

---

## 3. Workflow Guides / 工作流指南

### 3.1 Writing a Research Paper (Complete Flow)

```
1. idea-eval       → Evaluate novelty, feasibility, impact
2. hypothesis      → Generate testable hypotheses
3. lit-review      → Structured search with PRISMA
4. databases       → Search 50+ databases for references
5. deep-read       → Deep reading of key papers
6. experiment      → Design: claims → baselines → metrics
7. template        → Deploy venue-specific LaTeX template
8. paper           → Write with 3 gates:
     Gate 1: Structure check (after outline)
     Gate 2: Writing quality (after first draft)
     Gate 3: Format compliance (before submission)
9. figure-design   → Design publication figures
10. de-aigc        → Check for AI detection risk
11. integrity      → Research integrity check
12. pre-submit     → 5-dimension review
13. compile        → LaTeX compilation
14. [Submit]
15. rebuttal       → Respond to reviewer comments
```

### 3.2 Running a Causal Inference Study

```
1. data            → Clean, impute, winsorize
2. causal          → 8-step pipeline:
   Step 1: Variable construction (log/IHS, panel lag/lead)
   Step 2: Balance tables with SMD
   Step 3: Diagnostic tests (7 types)
   Step 4: Choose method: DID / IV / RDD / PSM / DML / CF
   Step 5: Robustness (6-test ladder, clustering, placebo)
   Step 6: Heterogeneity analysis
   Step 7: Mediation analysis
   Step 8: Publication output (stargazer, coefplot, love plot)
3. paper           → Write the paper
4. compile         → Generate PDF
```

### 3.3 Running an ML Benchmark

```
1. benchmark       → Configure BenchmarkConfig (task, datasets, metrics)
2. benchmark       → Run multi-seed training
3. benchmark       → Statistical significance (t-test, bootstrap, Bayesian)
4. benchmark       → Ablation study
5. benchmark       → Scaling experiments
6. benchmark       → Generate LaTeX results table
7. paper           → Write benchmark paper
```

### 3.4 Managing References with Zotero

```
1. Setup:         Get API key → set ZOTERO_LIBRARY_ID + ZOTERO_API_KEY
2. Organize:      Create project collections (to-read → reading → read → cited)
3. Search:        query_db("literature", "topic") → import to Zotero
4. Write:         Export collection to references.bib → cite in LaTeX
5. Sync:          Sync Zotero → BibTeX (adds new, removes stale entries)
6. Rebuttal:      Search Zotero for reviewer concerns → draft citations
```

---

## 4. Database Search / 数据库检索

### Unified Query

```python
# Search by category
query_db("literature", "transformer attention")
query_db("life_sci", "BRCA1", databases=["pubmed", "uniprot"])

# Cross-category search
search_all("CRISPR gene editing")

# Export to BibTeX
search_to_bibtex(results)
```

### 50+ Available Databases

| Category | Databases |
|---|---|
| **Literature** | arXiv, Semantic Scholar, OpenAlex, CrossRef, DBLP, Papers With Code, CORE |
| **Life Sciences** | PubMed, bioRxiv, UniProt, PDB, GenBank, GEO, Ensembl |
| **Physical** | NASA ADS, INSPIRE-HEP, ChemRxiv |
| **Social Science** | NBER, FRED, World Bank, RePEc |
| **Engineering** | Google Patents |
| **Data & Code** | Zenodo, Figshare, OSF, HuggingFace Datasets |
| **Clinical** | ClinicalTrials.gov, PubMed Central |

### API Keys (Optional — most work without)

```bash
export FRED_API_KEY="..."        # Free from fred.stlouisfed.org
export ADS_API_TOKEN="..."       # Free from ui.adsabs.harvard.edu
export ZOTERO_LIBRARY_ID="..."   # From zotero.org
export ZOTERO_API_KEY="..."      # From zotero.org/settings/keys
```

---

## 5. LaTeX Templates / LaTeX 模板

| Template | Venue | Type |
|---|---|---|
| `neurips` | NeurIPS | ML/AI conference |
| `icml` | ICML | ML conference |
| `iclr` | ICLR | Learning representations |
| `aaai` | AAAI | AI conference |
| `ieee` | IEEE | Engineering |
| `acl` | ACL | NLP conference |
| `acm` | ACM | CS conference |
| `aps` | APS | Physics journal |
| `springer` | Springer | Multidisciplinary journal |
| `elsevier` | Elsevier | Multidisciplinary journal |
| `thesis-cn` | GB/T 7714 | Chinese graduate thesis |
| `beamer` | — | Presentation slides |

### Usage

```
You: Set up an ICML paper template.
Claude: [Deploys template with project structure]
./paper/
├── main.tex
├── references.bib
├── figures/
└── sections/
```

### Compilation

```bash
bash scripts/compile.sh templates/icml/main.tex
```

---

## 6. Tool Coverage by Domain / 按领域的工具覆盖

| Domain | # | Key Packages |
|---|---|---|
| Biology | 20 | biopython, scanpy, pysam, anndata, cellrank, scikit-bio, qiime2 |
| ML/AI | 18 | pytorch, jax, transformers, sklearn, wandb, ray, modal |
| Chemistry | 11 | rdkit, openbabel, medchem, mordred, molfeat, openmm |
| Physics | 10 | numpy, scipy, sympy, fenics, cirq, pennylane, qutip |
| Research | 9 | pyzotero, bibtexparser, matplotlib, plotly |
| Data I/O | 8 | pandas, polars, pyarrow, h5py, zarr |
| Social Science | 7 | statsmodels, linearmodels, econml, geopandas |
| Medicine | 7 | monai, torchio, lifelines, nibabel, pydicom |
| Economics | 6 | linearmodels, statsmodels, arch, stargazer |
| Quantum | 3 | cirq, pennylane, qutip |

Tool lookup:
```
You: What tool for single-cell RNA-seq?
Claude: scanpy (primary), anndata (data format), cellrank (trajectories)
→ Deep guide: references/tools/scanpy.md
```

---

## 7. Scripts / 脚本工具

```bash
# Check environment
bash scripts/check-environment.sh

# Compile LaTeX
bash scripts/compile.sh path/to/main.tex

# Search arXiv
python3 scripts/search_arxiv.py "query" --max 20 --bibtex
```

---

## 8. Tips & FAQ

### Tips

1. Start with `check-env` to verify your environment.
2. Use `lit-review` for systematic reviews — follows PRISMA.
3. Use `databases` for literature search — 50+ databases, one function.
4. Use `paper` with all 3 gates — structure, quality, format.
5. Use `causal` for any causal question — 6 methods with robustness.
6. Use `benchmark` for ML papers — includes significance testing.
7. Set up Zotero for bibliography — syncs BibTeX automatically.
8. Run `de-aigc` before submission — catches AI-detection risk.

### FAQ

**Q: Do I need to install all 150 tools?**
A: No. Tool references are documentation. Install only what you need.

**Q: Which databases need API keys?**
A: Most are free. FRED, NASA ADS, Zotero need free keys. IEEE/ACM need institutional access.

**Q: Can I use this for a Chinese thesis?**
A: Yes. The `thesis-cn` template follows GB/T 7714 format.

**Q: How do I add a new tool reference?**
A: Copy `references/tools/_TEMPLATE.md`, fill in all 8 sections.

**Q: Does this work with HBE infrastructure?**
A: Yes. Ralph Loop, Orchestrator, Memory, and Context Optimization are all integrated.

---

## 9. Advanced: HBE Infrastructure / 高级架构

```
HBE Core
├── Ralph Loop      → Autonomous execution for large tasks
├── Orchestrator    → Multi-agent delegation
├── Memory System   → Persistent learning across sessions
├── Context Opt     → 3-layer loading (50% token savings)
└── Interactive Eng → Confirm/Q&A/Progressive modes

Academic Research Skill
├── SKILL.md         → 23 sub-commands (entry point)
├── references/      → Tools (150) + Guides (20)
├── workflows/       → End-to-end processes (5)
├── templates/       → LaTeX documents (12)
└── scripts/         → Utility automation (3)
```

---

*User Manual v1.0 | HBE Academic Research v2.0.0 | 2026-05-05*
