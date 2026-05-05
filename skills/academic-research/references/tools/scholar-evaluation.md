---
name: scholar-evaluation
description: Scholar impact metrics — h-index, i10-index, citation analysis, and publication impact assessment
domain: Research / Metrics
install: pip install scholarly pyalex semanticscholar pandas 2>/dev/null || echo "See documentation"
---

# scholar-evaluation — Scholar Impact Metrics

## Overview

Scholar evaluation provides tools for computing and analyzing academic impact metrics including h-index, i10-index, citation distributions, publication velocity, and field-normalized indicators. It leverages Semantic Scholar, OpenAlex, and Google Scholar APIs to retrieve citation data and produce comprehensive researcher profiles for hiring, promotion, and grant review.

## When to Use

- Evaluating a researcher's publication impact for hiring or promotion decisions
- Comparing citation metrics across scholars in the same field
- Building departmental or institutional research performance reports
- Tracking citation trends for specific papers or research groups
- Identifying highly cited works and emerging impact

## Quick Start

```python
from semanticscholar import SemanticScholar
import requests

sch = SemanticScholar()

# Get author profile by name
results = sch.search_author("Yoshua Bengio", fields=["name", "hIndex", "citationCount",
                                                      "paperCount", "affiliations"])
author = results[0]
print(f"Name: {author.name}")
print(f"H-Index: {author.hIndex}")
print(f"Total Citations: {author.citationCount:,}")
print(f"Total Papers: {author.paperCount:,}")
print(f"Affiliation: {(author.affiliations or [{}])[0].get('name', 'N/A')}")
```

## Core Capabilities

### 1. H-Index and Derived Metrics

```python
def compute_h_index(citations):
    """Compute h-index from a list of citation counts per paper."""
    citations_sorted = sorted(citations, reverse=True)
    h = 0
    for i, c in enumerate(citations_sorted):
        if c >= i + 1:
            h = i + 1
        else:
            break
    return h

def compute_derived_metrics(citations):
    """Compute h-index, i10-index, g-index, and other metrics."""
    citations_sorted = sorted(citations, reverse=True)
    n_papers = len(citations_sorted)
    total_citations = sum(citations_sorted)

    # h-index: h papers with >= h citations each
    h = compute_h_index(citations_sorted)

    # i10-index: number of papers with >= 10 citations
    i10 = sum(1 for c in citations_sorted if c >= 10)

    # g-index: largest g such that top g papers have >= g^2 total citations
    cumulative = 0
    g = 0
    for i, c in enumerate(citations_sorted):
        cumulative += c
        if cumulative >= (i + 1) ** 2:
            g = i + 1

    # m-index: h-index / years since first publication (career stage adjusted)
    # e.g., h=20 with 10 years active -> m=2.0 (strong early-career)
    avg_citations = total_citations / n_papers if n_papers > 0 else 0

    return {
        "h_index": h,
        "i10_index": i10,
        "g_index": g,
        "total_papers": n_papers,
        "total_citations": total_citations,
        "avg_citations": round(avg_citations, 1),
        "max_citations": citations_sorted[0] if citations_sorted else 0,
    }

# Example with simulated citation data
import numpy as np
np.random.seed(42)
citations = sorted(np.random.zipf(1.5, 200).tolist(), reverse=True)
metrics = compute_derived_metrics(citations)
for k, v in metrics.items():
    print(f"  {k}: {v:,}")
```

### 2. Citation Timeline Analysis

```python
import requests
import pandas as pd
import matplotlib.pyplot as plt

def get_citation_timeline(author_id, source="openalex"):
    """Get year-by-year citation counts for an author."""
    if source == "openalex":
        resp = requests.get(f"https://api.openalex.org/authors/{author_id}", params={
            "select": "counts_by_year,works_count",
        })
        data = resp.json()
        timeline = pd.DataFrame(data["counts_by_year"])
        timeline.columns = ["year", "citations"]
        return timeline.sort_values("year")

# Get citation timeline (OpenAlex author ID)
timeline = get_citation_timeline("A5023888391")
print(timeline.tail(10))

# Compute citation velocity (citations per year, recent vs. career)
recent_years = timeline[timeline["year"] >= 2020]
career_years = timeline
velocity_recent = recent_years["citations"].sum() / max(len(recent_years), 1)
velocity_career = career_years["citations"].sum() / max(len(career_years), 1)
acceleration = velocity_recent / velocity_career if velocity_career > 0 else 0
print(f"\nCitation velocity (career avg): {velocity_career:.1f} cites/year")
print(f"Citation velocity (2020+): {velocity_recent:.1f} cites/year")
print(f"Acceleration ratio: {acceleration:.2f}x")
```

### 3. Publication Impact Analysis

```python
from semanticscholar import SemanticScholar

sch = SemanticScholar()

def analyze_publication_impact(author_name, limit=50):
    """Get detailed publication analysis for a scholar."""
    results = sch.search_author(author_name, limit=1)
    if not results:
        return None
    author_id = results[0].authorId

    # Get author's papers
    papers = sch.get_author_papers(author_id, fields=[
        "title", "year", "citationCount", "venue", "openAccessPdf",
        "publicationTypes",
    ], limit=limit)

    papers_data = []
    for p in papers:
        papers_data.append({
            "title": p.paper.title,
            "year": p.paper.year,
            "citations": p.paper.citationCount or 0,
            "venue": p.paper.venue,
            "is_open_access": p.paper.openAccessPdf is not None,
        })

    df = pd.DataFrame(papers_data).sort_values("citations", ascending=False)

    # Summary statistics
    print(f"=== Publication Impact Analysis ===")
    print(f"Total papers analyzed: {len(df)}")
    print(f"Total citations: {df['citations'].sum():,}")
    print(f"Median citations/paper: {df['citations'].median():.0f}")
    print(f"Open access rate: {df['is_open_access'].mean():.1%}")
    print(f"\nTop 5 most cited:")
    for _, row in df.head(5).iterrows():
        print(f"  [{row['year']}] {row['title'][:60]}... ({row['citations']:,} cites)")

    return df

df = analyze_publication_impact("Yann LeCun", limit=30)
```

## Common Academic Workflow

### Comprehensive Scholar Profile Report

```python
from semanticscholar import SemanticScholar
import pandas as pd

sch = SemanticScholar()

def generate_scholar_report(name, field_for_normalization=None):
    """Generate a comprehensive impact report for a researcher."""
    # 1. Get author metadata
    authors = sch.search_author(name, fields=[
        "name", "hIndex", "i10Index", "citationCount", "paperCount",
        "affiliations",
    ], limit=1)
    if not authors:
        print(f"Author '{name}' not found")
        return
    author = authors[0]

    # 2. Get publications
    papers = sch.get_author_papers(author.authorId, fields=[
        "title", "year", "citationCount", "venue",
    ], limit=200)

    # 3. Compute all metrics
    citations = [p.paper.citationCount or 0 for p in papers]
    metrics = compute_derived_metrics(citations)

    # 4. Print report
    print("=" * 60)
    print(f"SCHOLAR IMPACT REPORT: {author.name}")
    print("=" * 60)
    print(f"Affiliation: {(author.affiliations or [{}])[0].get('name', 'N/A')}")
    print(f"\n--- Bibliometric Metrics ---")
    print(f"  H-Index:          {author.hIndex}")
    print(f"  i10-Index:        {author.i10Index}")
    print(f"  G-Index:          {metrics['g_index']}")
    print(f"  Total Papers:     {author.paperCount:,}")
    print(f"  Total Citations:  {author.citationCount:,}")
    print(f"  Avg Cites/Paper:  {metrics['avg_citations']}")
    print(f"  Max Cites (single): {metrics['max_citations']:,}")

    # 5. Publication years distribution
    years = [p.paper.year for p in papers if p.paper.year]
    if years:
        print(f"\n--- Publication Timeline ---")
        print(f"  First publication: {min(years)}")
        print(f"  Most recent:       {max(years)}")
        print(f"  Active years:      {max(years) - min(years) + 1}")
        print(f"  M-Index (h/years): {author.hIndex / (max(years) - min(years) + 1):.2f}")

    return metrics

report = generate_scholar_report("Fei-Fei Li")
```

## Best Practices

1. **Use multiple metrics**: No single metric captures full impact. Report h-index, i10-index, g-index, and total citations together.
2. **Normalize by field**: Citation cultures vary dramatically. Use field-normalized metrics (FWCI) when comparing across disciplines.
3. **Consider career stage**: Use m-index (h-index / years active) to fairly compare early-career and senior researchers.
4. **Check for self-citations**: High self-citation rates can inflate metrics. Some databases allow excluding self-citations.
5. **Context with qualitative factors**: Metrics should supplement, not replace, qualitative assessment of research quality and significance.

## Common Pitfalls

1. **Name ambiguity**: Common names may merge multiple researchers' records. Always verify by checking affiliation and publication list.
2. **Google Scholar vs. Semantic Scholar**: Google Scholar has broader coverage but no official API and is less reliable for automated queries. Prefer Semantic Scholar or OpenAlex for reproducibility.
3. **Ignoring field differences**: An h-index of 20 in mathematics is exceptional, while in biomedicine it is moderate. Always compare within field.
4. **Publication venue gaming**: Metrics can be manipulated through self-citation rings, salami slicing, or publishing in low-quality venues. Cross-check with qualitative review.

## Integration with HBE

- Combine with `references/paper-lookup.md` for retrieving detailed paper metadata
- Feed into `references/research-lookup.md` for identifying influential works in a field
- Use with `references/citation-management.md` to track citation of your own publications
- Supports `references/networkx.md` for citation network visualization

## Resources

- Semantic Scholar API: https://api.semanticscholar.org/api-docs/
- OpenAlex API: https://docs.openalex.org/
- Scholarly (Google Scholar scraper): https://scholarly.readthedocs.io/
- Hirsch, J.E. (2005). "An index to quantify an individual's scientific research output." PNAS.
- San Francisco Declaration on Research Assessment (DORA): https://sfdora.org/
