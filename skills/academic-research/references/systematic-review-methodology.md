# Systematic Review Methodology / 系统综述方法论

PRISMA 2020 compliant systematic literature review: complete protocol from question to publication.
PRISMA 2020 合规系统文献综述：从研究问题到发表的完整协议。

## Overview / 概览

Systematic reviews differ from narrative literature reviews (see `workflows/literature-review.md`). Narrative reviews are broad and opinion-driven. Systematic reviews follow a rigorous, reproducible protocol to answer a specific research question.

系统综述不同于叙述性文献综述。叙述性综述是广泛和观点驱动的。系统综述遵循严格可复现的协议来回答特定的研究问题。

| | Narrative Review | Systematic Review |
|---|---|---|
| Question | Broad topic | Specific (PICO format) |
| Search | Selective | Exhaustive + documented |
| Selection | Author judgment | Pre-defined criteria |
| Quality | Not assessed | Formal tool (CASP/JBI) |
| Synthesis | Descriptive | Meta-analysis possible |
| Reproducible | No | Yes |

---

## Phase 1: Protocol Development / 协议开发

### 1.1 Research Question (PICO Framework)

| Element | Definition | Example |
|---------|-----------|---------|
| **P**opulation | Who/what is studied | Adults with type 2 diabetes |
| **I**ntervention | What is being evaluated | Continuous glucose monitoring |
| **C**omparison | Compared to what | Standard finger-stick monitoring |
| **O**utcome | What is measured | HbA1c reduction, hypoglycemia episodes |

For non-clinical fields, adapt:
- **CS/AI**: System → Method → Baseline → Metric
- **Engineering**: Component → Design → Alternative → Performance
- **Social Science**: Population → Policy → Counterfactual → Welfare measure

### 1.2 Eligibility Criteria

Define BEFORE searching (a priori):

```
Inclusion:
  - Published 2015-2026
  - English or Chinese
  - Peer-reviewed (journals, conferences)
  - Addresses [PICO elements]
  - Full text available

Exclusion:
  - Preprints only (no peer review)
  - Non-academic (blogs, news)
  - Duplicate studies
  - Insufficient statistical reporting
  - Non-human subjects (for clinical reviews)
```

### 1.3 Registration

Register protocol before starting:
- **PROSPERO** (health: https://www.crd.york.ac.uk/prospero/)
- **OSF** (all disciplines: https://osf.io/)
- **Open Science Framework** preregistration

---

## Phase 2: Literature Search / 文献检索

### 2.1 Database Selection by Discipline

| Discipline | Primary Databases | Minimum # |
|-----------|-------------------|-----------|
| Medicine | PubMed, Cochrane, EMBASE, CINAHL | 3 |
| CS/AI | arXiv, ACM DL, IEEE Xplore, Scopus | 3 |
| Social Science | Web of Science, Scopus, SSRN, PsycINFO | 3 |
| Engineering | IEEE Xplore, Scopus, Compendex | 3 |
| Physics | arXiv, Scopus, INSPEC, ADS | 3 |
| Biology | PubMed, Web of Science, Scopus | 3 |
| Economics | EconLit, SSRN, NBER, Scopus | 3 |

### 2.2 Search Strategy Design

```
Step 1: Identify key concepts from PICO
  P: "type 2 diabetes" OR "T2DM" OR "adult-onset diabetes"
  I: "continuous glucose monitoring" OR "CGM" OR "real-time glucose"
  C: "self-monitoring blood glucose" OR "SMBG" OR "finger-stick"
  O: "HbA1c" OR "glycated hemoglobin" OR "hypoglycemia"

Step 2: Combine with Boolean
  (P terms) AND (I terms) AND (C terms OR O terms)

Step 3: Apply filters
  Date: 2015-2026
  Language: English
  Type: Journal article, Conference paper

Step 4: Record search for each database
  Database: PubMed
  Date: 2026-05-04
  Query: [exact query string]
  Results: 247 records
```

### 2.3 Search Execution Tools

| Tool | Use | Reference |
|------|-----|-----------|
| `scripts/search_arxiv.py` | arXiv search | `scripts/` |
| Semantic Scholar API | Cross-domain citation graph | `references/scientific-databases-guide.md` |
| OpenAlex API | 250M+ works | `references/scientific-databases-guide.md` |
| PubMed API | Biomedical literature | `references/scientific-databases-guide.md` |

---

## Phase 3: Screening / 筛选

### 3.1 PRISMA Flow Diagram

```
Records identified through database searching (n = ___)
  → Records after duplicates removed (n = ___)
    → Records screened (title + abstract) (n = ___)
      → Records excluded (n = ___)
        Reason 1: ____
        Reason 2: ____
      → Full-text articles assessed (n = ___)
        → Full-text excluded (n = ___)
          Reason 1: ____
          Reason 2: ____
        → Studies included (n = ___)
```

### 3.2 Screening Process

**Title screening** (fast, ~5 seconds each):
- [ ] Title relevant to research question?
- [ ] Population matches?
- [ ] Not clearly excluded by criteria?

**Abstract screening** (moderate, ~30 seconds each):
- [ ] Abstract addresses research question?
- [ ] Methodology appropriate?
- [ ] Results reported?

**Full-text screening** (slow, ~5 minutes each):
- [ ] Full inclusion criteria met?
- [ ] Methodology sound?
- [ ] Results extractable?
- [ ] Not duplicate of included study?

**Dual screening**: For rigorous reviews, two independent reviewers screen, with Cohen's κ ≥ 0.8 agreement.

### 3.3 PRISMA Flow Diagram (LaTeX)

```latex
\begin{figure}[t]
\centering
\begin{tikzpicture}[node distance=0.8cm,
    box/.style={rectangle, draw, minimum width=6cm, minimum height=0.7cm,
                text width=5.8cm, align=left, font=\small}]
\node[box] (id) {Identification: N records from D databases};
\node[box, below=of id] (dedup) {After deduplication: N records};
\node[box, below=of dedup] (scr) {Screened (title + abstract): N records};
\node[box, below=of scr] (ft) {Full-text assessed: N articles};
\node[box, below=of ft] (incl) {Included: N studies};
\draw[->] (id) -- (dedup);
\draw[->] (dedup) -- (scr) node[midway,right] {Removed: N (duplicates)};
\draw[->] (scr) -- (ft) node[midway,right] {Removed: N (title/abstract)};
\draw[->] (ft) -- (incl) node[midway,right] {Removed: N (full-text)};
\end{tikzpicture}
\caption{PRISMA 2020 flow diagram}
\label{fig:prisma}
\end{figure}
```

---

## Phase 4: Quality Assessment / 质量评估

### 4.1 Quality Assessment Tools

| Tool | Use For | Scoring |
|------|---------|---------|
| **CASP RCT** | Randomized controlled trials | 11 questions, Yes/No/Can't tell |
| **CASP Cohort** | Cohort studies | 12 questions |
| **CASP Case-Control** | Case-control studies | 11 questions |
| **CASP Qualitative** | Qualitative studies | 10 questions |
| **Newcastle-Ottawa Scale** | Non-randomized studies | 0-9 stars |
| **JBI Critical Appraisal** | Various designs | 8-13 questions |
| **AMSTAR 2** | Systematic reviews | 16 items |
| **ROBINS-I** | Non-randomized interventions | Risk of bias assessment |
| **RoB 2** | Randomized trials | Risk of bias in 5 domains |

### 4.2 Quality Rating

| Rating | Criteria | Action |
|--------|---------|--------|
| **High** | Low risk of bias on all key domains | Include |
| **Moderate** | Some concerns on non-critical domains | Include with caution |
| **Low** | High risk of bias on critical domains | Exclude or sensitivity analysis |

### 4.3 Cross-Discipline Quality Standards

| Discipline | Key Quality Criterion | Standard |
|-----------|----------------------|----------|
| Medicine | Randomization, blinding, sample size | CONSORT/STROBE |
| CS/AI | Reproducibility, baselines, seeds | Papers With Code |
| Social Science | Causal identification, external validity | APA standards |
| Physics | Measurement uncertainty, calibration | ISO Guide |
| Engineering | Benchmark fairness, hardware specified | Domain standard |

---

## Phase 5: Data Extraction / 数据提取

### 5.1 Extraction Form

| Field | Content | Example |
|-------|---------|---------|
| Study ID | Unique identifier | S001 |
| Authors | First author et al. | Smith et al. |
| Year | Publication year | 2024 |
| Venue | Journal/Conference | Nature Medicine |
| Design | Study type | RCT / Cohort / Observational |
| Population | Sample size, demographics | N=500, adults 18-65 |
| Intervention | What was tested | CGM vs SMBG |
| Outcome | Primary outcome measure | HbA1c reduction (%) |
| Results | Effect size, CI, p-value | -0.8% (-1.2, -0.4), p<0.001 |
| Quality | Assessment rating | High |
| Notes | Conflicts, limitations | Industry-funded |

### 5.2 Extraction Process

- Two independent extractors
- Pilot extraction form on 5 studies
- Resolve disagreements by discussion or third reviewer
- Use standardized spreadsheet or Covidence software

---

## Phase 6: Synthesis / 综合分析

### 6.1 Narrative Synthesis

Organize findings thematically:
```
Theme 1: [Finding across studies]
  - Study A found X
  - Study B confirmed X
  - Study C found nuanced X under condition Y
  Consensus: X is supported by A and B, with caveat from C

Theme 2: [Another finding]
  ...

Gap: No study has addressed [specific question]
```

### 6.2 Meta-Analysis (when applicable)

**Requirements for meta-analysis**:
- ≥ 2 studies with comparable interventions and outcomes
- Same outcome measure (or convertible)
- Sufficient data reported (mean, SD, N or effect sizes)

**Effect Size Selection**:

| Data Type | Effect Size | Formula |
|-----------|-----------|---------|
| Continuous (2 groups) | Cohen's d | (M₁ - M₂) / SD_pooled |
| Continuous (multiple) | Hedges' g | Cohen's d × correction factor |
| Binary outcomes | Odds Ratio | (ad)/(bc) |
| Binary outcomes | Risk Ratio | (a/(a+b)) / (c/(c+d)) |
| Correlation | Fisher's z | 0.5 × ln((1+r)/(1-r)) |

**Heterogeneity Assessment**:

| Statistic | Interpretation |
|-----------|---------------|
| Q statistic | p < 0.05 → significant heterogeneity |
| I² = 0-25% | Low heterogeneity → fixed-effects model |
| I² = 25-75% | Moderate → random-effects model |
| I² > 75% | High → explore sources, consider subgroup analysis |

**Forest Plot** (Python):
```python
import meta
# Assuming df has columns: study, mean_t, sd_t, n_t, mean_c, sd_c, n_c
result = meta.continuous(df, sm='SMD', method='RE')
resultForest(result)
```

**Publication Bias**:
- Funnel plot (visual inspection)
- Egger's test (statistical)
- Trim-and-fill method (adjustment)

### 6.3 GRADE Assessment (for clinical reviews)

| Factor | Downgrade | Upgrade |
|--------|-----------|---------|
| Risk of bias | Serious limitations | — |
| Inconsistency | High I², conflicting results | — |
| Indirectness | Different population/intervention | — |
| Imprecision | Wide CI, few events | — |
| Publication bias | Asymmetric funnel plot | — |
| Large effect | — | SMD > 0.8 |
| Dose-response | — | Gradient observed |
| Confounders | — | Would reduce effect |

**GRADE ratings**: High → Moderate → Low → Very Low

---

## Phase 7: Reporting / 报告

### 7.1 PRISMA 2020 Checklist (27 items)

Key items to include in report:
- [ ] Title identifies as systematic review
- [ ] Structured summary (background, objectives, methods, results, conclusions)
- [ ] Rationale for review
- [ ] Eligibility criteria
- [ ] Information sources with dates
- [ ] Search strategy (full electronic strategy for at least one database)
- [ ] Selection process (flow diagram)
- [ ] Data collection process
- [ ] Risk of bias assessment tool
- [ ] Effect measures and synthesis methods
- [ ] Reporting bias assessment
- [ ] Certainty of evidence (GRADE)

### 7.2 Report Structure

```markdown
# Title: [Topic]: A Systematic Review and Meta-Analysis

## Abstract (structured)

## 1. Introduction
  1.1 Background
  1.2 Rationale for review
  1.3 Objectives (PICO question)

## 2. Methods
  2.1 Protocol and registration
  2.2 Eligibility criteria
  2.3 Information sources
  2.4 Search strategy
  2.5 Selection process
  2.6 Data collection
  2.7 Risk of bias assessment
  2.8 Synthesis methods
  2.9 Certainty of evidence

## 3. Results
  3.1 Study selection (PRISMA flow)
  3.2 Study characteristics
  3.3 Risk of bias
  3.4 Synthesis results
  3.5 Sensitivity/subgroup analyses
  3.6 Publication bias

## 4. Discussion
  4.1 Summary of evidence
  4.2 Comparison with previous reviews
  4.3 Strengths and limitations
  4.4 Implications

## 5. Conclusions

## References
## Supplementary Materials
```

---

## Recommended Tools / 推荐工具

See `references/tool-registry.md`.

| Task | Tool | Install |
|------|------|---------|
| Meta-analysis (Python) | `meta` | `pip install meta` |
| Effect sizes | `statistics` (stdlib) | built-in |
| Forest plots | `meta` or matplotlib | `pip install meta matplotlib` |
| PRISMA flow | TikZ (LaTeX) | included in TeXLive |
| Citation dedup | `pandas` | `pip install pandas` |

## Integration / 集成

- Uses `references/scientific-databases-guide.md` for database search
- Builds on `workflows/literature-review.md` (narrative review as precursor)
- Feeds into `references/pre-submission-review.md` (quality check)
- Supports `references/deep-reading-guide.md` (full-text analysis phase)
