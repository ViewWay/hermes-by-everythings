# Literature Review Workflow / 文献综述工作流

## Overview / 概览

系统性文献综述流水线：从种子论文到结构化综合。

Systematic literature review pipeline: from seed papers to structured synthesis.

## Phase 1: Seed Paper Collection / 种子论文收集

### Search Strategy / 搜索策略

1. **Keyword Search**:
   ```bash
   python3 scripts/search_arxiv.py "your topic" --max 20 --bibtex
   ```

2. **Semantic Scholar** (free API, no key needed):
   ```
   GET https://api.semanticscholar.org/graph/v1/paper/search?query=<topic>&limit=20
   Fields: title, authors, year, abstract, citationCount, references
   ```

### Seed Selection Criteria / 种子选择标准

- Highly cited (>100 citations or top 10% in field)
- Published in top venues
- Recent (within 3 years for rapidly evolving fields)
- Foundational (seminal works regardless of age)

Collect 10-20 seed papers minimum.

## Phase 2: Breadth-First Expansion / 广度优先扩展

### Forward Citation Traversal / 前向引文遍历
```
Semantic Scholar: GET /paper/{paper_id}/citations?fields=title,year,abstract
```

### Backward Citation Traversal / 后向引文遍历
```
Semantic Scholar: GET /paper/{paper_id}/references?fields=title,year,abstract
```

### Expansion Depth / 扩展深度
- Level 1: Seeds → direct citations (50-100 papers)
- Level 2: Top cited from Level 1 → their citations (100-200 papers)
- Stop when diminishing returns

## Phase 3: Abstract Screening / 摘要筛选

### Scoring Rubric (0-10)

| Score | Meaning | Action |
|-------|---------|--------|
| 8-10 | Highly relevant | Full text analysis |
| 5-7 | Potentially relevant | Keep for reference |
| 3-4 | Tangentially related | Skip |
| 0-2 | Not relevant | Discard |

## Phase 4: Full-Text Analysis / 全文分析

For papers scoring 8-10, extract: key claims, methodology, dataset, results, limitations, connections.

### Analysis Template

```markdown
## [Author, Year] - [Title]
**Venue**: NeurIPS 2025
**Key Claims**: ...
**Methodology**: ...
**Dataset**: ...
**Main Results**: ...
**Limitations**: ...
**Relevance to our work**: ...
**Connections**: Cites [X], cited by [Y]
```

## Phase 5: Synthesis / 综合分析

### Organize by Theme
Group papers by research direction, not chronologically.

### Gap Identification
For each theme: what has been done → what remains → how your work fills the gap.

### Output Structure
```
lit-review/
├── SUMMARY.md          # Structured synthesis
├── papers.json         # All analyzed papers with scores
├── references.bib      # BibTeX for all cited papers
└── gaps.md             # Identified research gaps
```

## Phase 6: BibTeX Management / BibTeX 管理

### Entry Quality Checklist
- [ ] All required fields present (author, title, year, venue)
- [ ] Author names properly formatted
- [ ] No duplicate entries
- [ ] Consistent key format: `authorYEARkeyword`
- [ ] DOI or URL included when available

## Cross-References / 交叉引用

- **Deep reading**: After identifying top papers in Phase 4, apply `references/deep-reading-guide.md` four-pass method
- **Database search**: Use `references/scientific-databases-guide.md` for discipline-specific database selection
- **Systematic review**: For rigorous reviews, follow `references/systematic-review-methodology.md` (PRISMA 2020)
- **Citation management**: Use `references/citation-workflow.md` for BibTeX lifecycle
- **Tools**: See `references/tool-registry.md` for recommended search and analysis tools
