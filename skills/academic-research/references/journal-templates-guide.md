# Journal & Conference Template Guide / 期刊与会议模板指南

Venue-specific formatting rules for 12+ top academic venues, with writing style guidance.
12+ 顶级学术会议/期刊的排版规则和写作风格指南。

## AI/ML Conferences / 人工智能顶会

### NeurIPS

| Property | Value |
|----------|-------|
| Style | `neurips_2025.sty` |
| Pages | 9 + unlimited appendix |
| Columns | Single column |
| Bib | natbib (`\bibliographystyle{neurips_2025}`) |
| Blind | Yes — anonymize everything |
| Checklist | 16-item ethics checklist required |
| Supplementary | Separate PDF, unlimited pages |

**Writing style**: Technical depth with clarity. Reviewers are ML experts. Emphasize novelty, ablation studies, theoretical grounding. Contributions as bullet list in introduction.

### ICML

| Property | Value |
|----------|-------|
| Style | `icml2026.sty` |
| Pages | 8 + unlimited appendix |
| Columns | Single column |
| Bib | natbib |
| Blind | Yes |
| Supplementary | Unlimited |

**Writing style**: Mathematical rigor expected. Proofs in appendix encouraged. Strong emphasis on theoretical analysis alongside empirical results.

### ICLR

| Property | Value |
|----------|-------|
| Style | `iclr2026_conference.sty` |
| Pages | 9 + appendix |
| Columns | Single column |
| Bib | natbib |
| Blind | Yes (double-blind) |
| Supplementary | Unlimited, OpenReview format |

**Writing style**: Focus on representation learning insights. Clear experimental comparison on standard benchmarks. Reproducibility statement encouraged.

### ACL/EMNLP

| Property | Value |
|----------|-------|
| Style | `acl.sty` |
| Pages | 8 (long) / 4 (short) + appendix |
| Columns | Single column |
| Bib | natbib (`acl_natbib.bst`) |
| Blind | Yes |
| Required | Ethics + reproducibility statement |
| Supplementary | ACL Anthology |

**Writing style**: Linguistic motivation expected. Error analysis is valued. Datasets must be properly documented. Multi-lingual work appreciated.

### AAAI

| Property | Value |
|----------|-------|
| Style | `aaai2026.sty` |
| Pages | 8 (strict, no appendix) |
| Columns | Two-column |
| Bib | natbib (`aaai.bst`) |
| Blind | Yes |
| Supplementary | Not accepted |

**Writing style**: Broader AI audience. Write for readers who may not be deep learning specialists. Emphasize practical impact.

---

## General Venues / 通用会议/期刊

### IEEE Transactions / Conferences

| Property | Value |
|----------|-------|
| Style | `IEEEtran.cls` |
| Columns | Two-column |
| Bib | bibtex (`IEEEtran.bst`) |
| Numbered | Yes — numbered citations [1], [2] |
| Abstract | 150-250 words |
| Keywords | Required |

**Writing style**: Formal, detailed methodology. Extensive related work comparison. Experimental validation with statistical significance.

### Springer LNCS

| Property | Value |
|----------|-------|
| Style | `llncs.cls` |
| Pages | 12-15 |
| Columns | Single column |
| Bib | natbib |
| Title | Sans-serif title (built-in) |

**Writing style**: Theoretical contributions valued. Formal definitions and proofs. European academic tone.

### Elsevier Journals

| Property | Value |
|----------|-------|
| Style | `elsarticle.cls` |
| Columns | 1p (single), 3p (three), 5p (five) |
| Bib | natbib |
| Highlights | 3-5 bullet points required |
| Structured abstract | Often required |

**Writing style**: Broader scientific audience. Clear practical implications. Structured abstract with background, methods, results, conclusions.

### ACM

| Property | Value |
|----------|-------|
| Style | `acmart.cls` |
| Columns | Two-column (sigconf) |
| Bib | bibtex (`acmart.cls` handles bib) |
| CCS | Computing Classification System concepts required |
| Rights | ACM Rights Management form |

**Writing style**: SIGCHI-style: clear user studies, interface designs. SIGKDD-style: data mining, experimental rigor. Adapt to specific SIG.

### APS (Physical Review)

| Property | Value |
|----------|-------|
| Style | `revtex4-2.cls` |
| Columns | Two-column (reprint) |
| Bib | natbib (`apsrev4-2.bst`) |
| Units | SI throughout |
| Abstract | ≤800 characters |

**Writing style**: Present tense for established physics, past for your experiments. Uncertainty propagation required. Concise, precise language.

---

## Chinese Thesis / 中文学位论文

| Property | Value |
|----------|-------|
| Class | `ctexbook` (requires xelatex) |
| Structure | 封面→摘要(中英)→目录→正文→参考文献→致谢→附录 |
| Bib | bibtex or biblatex |
| Fonts | 宋体(正文)、黑体(标题)、楷体(摘要) |
| Page | A4, margins per university standard |

**University templates**: thu-thesis (清华), pkuthss (北大), zjuthesis (浙大), sjtuthesis (交大), ustcthesis (中科大)

---

## Beamer Slides / 学术幻灯片

| Theme | Style | Best For |
|-------|-------|----------|
| **metropolis** | Clean, modern, minimal | Most presentations (recommended default) |
| **Madrid** | Classic blue header | Formal academic talks |
| **CambridgeUS** | Red/crimson, professional | Conference presentations |
| **Boadilla** | Clean, compact | Short talks |

**Slide Rules**: 1 minute per slide. Figures > text. Backup slides for Q&A. Use `\appendix` for backup.

---

## Venue-Specific Formatting Checklist / 会议/期刊排版检查清单

### All Venues (Universal)

- [ ] Page count within limit (count carefully — over = instant reject)
- [ ] Correct `\documentclass` and style file
- [ ] Bibliography style matches venue requirement
- [ ] All figures readable at print size (≥ 8pt font in figures)
- [ ] All tables use `booktabs` (no vertical lines)
- [ ] Math notation consistent throughout
- [ ] No orphan figures/tables (every one referenced in text)
- [ ] Abstract within word limit
- [ ] Keywords/index terms provided if required
- [ ] Author information matches submission requirements

### Blind Review Venues (Additional)

- [ ] No author names in paper body
- [ ] No "our previous work [blinded]" that identifies authors
- [ ] No identifying URLs (GitHub with username, personal website)
- [ ] No acknowledgments section (remove before review)
- [ ] Funding statements removed for review version
- [ ] File metadata cleaned (PDF author property)
- [ ] Self-citations in third person: "Smith et al. [1]" not "our previous work"

### Conference-Specific (NeurIPS/ICML/ICLR)

- [ ] Ethics checklist completed
- [ ] Reproducibility statement included
- [ ] Supplementary material in separate PDF
- [ ] Code submission link prepared (anonymous GitHub)
- [ ] Checklist appears after references (not before)

### Journal-Specific (IEEE/Elsevier)

- [ ] Highlights prepared (Elsevier)
- [ ] Graphical abstract prepared (if required)
- [ ] Author ORCID IDs included
- [ ] Data availability statement
- [ ] Conflict of interest statement
- [ ] CRediT author contribution statement

---

## Recommended Tools / 推荐工具

See `references/tool-registry.md`.

| Task | Tool |
|------|------|
| LaTeX compilation | TeXLive + latexmk |
| PDF metadata cleanup | `exiftool` (system) |
| Word count | `texcount -inc -sum main.tex` |
| Page count check | `pdfinfo paper.pdf \| grep Pages` |
| Anonymization verify | Review PDF for author names/URLs |

## Integration / 集成

- Works with `workflows/paper-writing.md` (template selection in Phase 1)
- Supports `references/writing-guide.md` (discipline-specific writing conventions)
- Feeds into `references/pre-submission-review.md` (Gate 3: Format Compliance)
- Connects to `scripts/compile.sh` (engine auto-detection)
