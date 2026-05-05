---
name: paper-lookup
description: Paper metadata lookup — search and retrieve paper metadata from Semantic Scholar, OpenAlex, and CrossRef
domain: Research / Literature
install: pip install scholarly semanticscholar pyalex crossref-commons 2>/dev/null || echo "See documentation"
---

# paper-lookup — Paper Metadata Lookup

## Overview

Paper-lookup provides a unified interface for retrieving academic paper metadata from multiple scholarly databases. It aggregates results from Semantic Scholar, OpenAlex, and CrossRef, normalizes fields, and resolves DOIs to canonical records. Essential for literature reviews, citation management, and bibliometric analysis.

## When to Use

- Retrieving structured metadata for a list of DOIs or paper titles
- Building literature databases for systematic reviews
- Resolving ambiguous references to canonical paper records
- Batch-fetching citation counts, abstracts, and author information
- Cross-referencing paper metadata across multiple databases

## Quick Start

```python
from semanticscholar import SemanticScholar
import requests

# Initialize Semantic Scholar client (free, no API key for basic use)
sch = SemanticScholar()

# Search for a paper by title
results = sch.search_paper("Attention is all you need", limit=5)
for paper in results:
    print(f"{paper.title} ({paper.year})")
    print(f"  Citations: {paper.citationCount} | DOI: {paper.externalIds.get('DOI', 'N/A')}")

# Get full details by Semantic Scholar ID or DOI
paper = sch.get_paper("DOI:10.18653/v1/N18-3011")
print(f"\nAbstract: {paper.abstract[:200]}...")
print(f"Authors: {', '.join(a.name for a in paper.authors)}")
```

## Core Capabilities

### 1. Semantic Scholar API Query

```python
from semanticscholar import SemanticScholar

sch = SemanticScholar()

# Search with field selection (reduces payload)
papers = sch.search_paper(
    "transformer architecture for protein folding",
    fields=["title", "year", "citationCount", "abstract", "authors",
            "venue", "externalIds", "openAccessPdf"],
    limit=10,
)

# Get citation graph (who cites this paper, and what it cites)
paper = sch.get_paper("649def34f8be52c8b66281af98ae884c09aef38b")
citations = sch.get_paper_citations("649def34f8be52c8b66281af98ae884c09aef38b")
references = sch.get_paper_references("649def34f8be52c8b66281af98ae884c09aef38b")

print(f"Cited by {len(citations)} papers | References {len(references)} papers")

# Batch lookup by DOI list (up to 500 per request)
dois = ["10.1038/s41586-021-03819-2", "10.1126/science.abj8754", "10.1038/s41587-021-00973-5"]
batch = sch.get_papers([f"DOI:{doi}" for doi in dois])
for p in batch:
    print(f"{p.title} — cited {p.citationCount} times")
```

### 2. OpenAlex Search

```python
import requests

# OpenAlex provides open, comprehensive metadata with a simple REST API
def openalex_search(query, per_page=25):
    url = "https://api.openalex.org/works"
    params = {
        "search": query,
        "per_page": per_page,
        "select": "id,doi,title,publication_year,cited_by_count,"
                  "authorships,primary_location,open_access",
    }
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()["results"]

# Search for recent papers on a topic
results = openalex_search("large language models reasoning", per_page=5)
for r in results:
    title = r["title"]
    year = r["publication_year"]
    cites = r["cited_by_count"]
    doi = r.get("doi", "N/A")
    authors = [a["author"]["display_name"] for a in r["authorships"][:3]]
    print(f"[{year}] {title}")
    print(f"  Authors: {', '.join(authors)} et al. | Cites: {cites} | {doi}")

# Filter by year range and open access
resp = requests.get("https://api.openalex.org/works", params={
    "filter": "publication_year:2023-2024,open_access.is_oa:true",
    "search": "single cell RNA sequencing",
    "per_page": 10,
})
```

### 3. DOI Resolution and Batch Metadata Retrieval

```python
import requests
import json

# Resolve DOI to full metadata via CrossRef
def resolve_doi(doi):
    url = f"https://api.crossref.org/works/{doi}"
    resp = requests.get(url, headers={"User-Agent": "AcademicResearch/1.0"})
    resp.raise_for_status()
    return resp.json()["message"]

# Get structured metadata
meta = resolve_doi("10.1038/s41586-021-03819-2")
print(f"Title: {meta['title'][0]}")
print(f"Journal: {meta['container-title'][0]}")
print(f"Type: {meta['type']}")
print(f"ISSN: {meta.get('ISSN', 'N/A')}")
print(f"License: {meta.get('license', [{}])[0].get('URL', 'N/A')}")

# Batch resolve DOIs via CrossRef
def batch_resolve_dois(dois):
    """Resolve up to 50 DOIs in a single request."""
    url = "https://api.crossref.org/works"
    filter_str = ",".join(dois)
    resp = requests.get(url, params={"filter": f"doi:{filter_str}"})
    return resp.json()["message"]["items"]

dois = ["10.1038/s41586-021-03819-2", "10.1126/science.abj8754"]
results = batch_resolve_dois(dois)
for item in results:
    print(f"{item['title'][0]} — {item['container-title'][0]}")
```

## Common Academic Workflow

### Building a Literature Database from Search Terms

```python
from semanticscholar import SemanticScholar
import requests
import pandas as pd
import time

def build_literature_db(query, max_results=100, year_from=2018):
    """Search multiple sources and merge into a unified DataFrame."""
    sch = SemanticScholar()
    all_papers = []

    # Semantic Scholar
    ss_results = sch.search_paper(
        query, fields=["title", "year", "citationCount", "abstract",
                       "authors", "venue", "externalIds", "openAccessPdf"],
        limit=min(max_results, 100),
    )
    for p in ss_results:
        all_papers.append({
            "title": p.title,
            "year": p.year,
            "citations": p.citationCount,
            "abstract": p.abstract,
            "authors": "; ".join(a.name for a in (p.authors or [])),
            "venue": p.venue,
            "doi": (p.externalIds or {}).get("DOI"),
            "source": "semantic_scholar",
        })
    time.sleep(1)  # rate limiting

    # OpenAlex (supplement with additional results)
    resp = requests.get("https://api.openalex.org/works", params={
        "search": query,
        "filter": f"publication_year:{year_from}-2025",
        "per_page": min(max_results, 100),
    })
    for r in resp.json()["results"]:
        all_papers.append({
            "title": r["title"],
            "year": r["publication_year"],
            "citations": r["cited_by_count"],
            "abstract": None,  # OpenAlex abstracts often in inverted index
            "authors": "; ".join(a["author"]["display_name"] for a in r["authorships"][:5]),
            "venue": (r.get("primary_location") or {}).get("source", {}).get("display_name"),
            "doi": r.get("doi", "").replace("https://doi.org/", ""),
            "source": "openalex",
        })

    df = pd.DataFrame(all_papers)
    df = df.drop_duplicates(subset=["doi"]).dropna(subset=["doi"])
    df = df.sort_values("citations", ascending=False).reset_index(drop=True)
    return df

df = build_literature_db("foundation models for biology", max_results=50)
print(f"Found {len(df)} unique papers")
df[["title", "year", "citations", "source"]].head(10)
```

## Best Practices

1. **Respect rate limits**: Semantic Scholar allows 100 requests/5 min without key; OpenAlex is polite pool (10 req/s). Add `time.sleep()` between batches.
2. **Set User-Agent**: CrossRef requires a meaningful User-Agent header with contact email.
3. **Select only needed fields**: Use `fields` parameter to reduce response size and improve speed.
4. **Deduplicate across sources**: Different databases may return the same paper. Deduplicate by DOI.
5. **Cache results**: Store fetched metadata locally to avoid repeated API calls.

## Common Pitfalls

1. **Missing abstracts**: Not all papers have abstracts in every database. CrossRef rarely includes them; Semantic Scholar and OpenAlex have better coverage.
2. **Author name ambiguity**: Author names are not unique identifiers. Use OpenAlex author IDs or ORCID when available.
3. **DOI format inconsistency**: DOIs may appear with or without the `https://doi.org/` prefix. Normalize before comparison.
4. **Rate limit errors**: If you hit 429 errors, implement exponential backoff with jitter.

## Integration with HBE

- Use as input to `references/literature-review.md` for systematic review search phase
- Feed results into `references/citation-management.md` for BibTeX generation
- Combine with `references/scholar-evaluation.md` for impact analysis
- Supports `references/research-lookup.md` for trend identification

## Resources

- Semantic Scholar API: https://api.semanticscholar.org/api-docs/
- OpenAlex API: https://docs.openalex.org/
- CrossRef API: https://api.crossref.org/swagger-ui/index.html
- PyPI: https://pypi.org/project/semanticscholar/
