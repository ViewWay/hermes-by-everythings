---
name: research-lookup
description: Research topic discovery — identify trending topics, emerging areas, and research gaps through bibliometric analysis
domain: Research / Discovery
install: pip install pyalex semanticscholar pandas networkx 2>/dev/null || echo "See documentation"
---

# research-lookup — Research Topic Discovery

## Overview

Research lookup provides bibliometric tools for discovering trending research topics, mapping citation networks, and identifying research gaps. It leverages OpenAlex and Semantic Scholar APIs to analyze publication volumes, citation trajectories, co-occurrence patterns, and emerging keywords, helping researchers choose impactful directions and justify novelty claims.

## When to Use

- Identifying emerging or trending research areas before starting a new project
- Finding research gaps in a specific domain for a grant proposal or thesis
- Mapping the intellectual landscape around a research topic
- Analyzing keyword trends and publication velocity over time
- Justifying the novelty of a proposed research direction

## Quick Start

```python
import requests
import pandas as pd

def topic_trend_analysis(keyword, start_year=2015, end_year=2025):
    """Analyze publication volume trend for a keyword over time."""
    yearly_counts = []
    for year in range(start_year, end_year + 1):
        resp = requests.get("https://api.openalex.org/works", params={
            "search": keyword,
            "filter": f"publication_year:{year}",
            "per_page": 1,
        })
        count = resp.json().get("meta", {}).get("count", 0)
        yearly_counts.append({"year": year, "publications": count})

    df = pd.DataFrame(yearly_counts)
    # Compute growth rate
    if len(df) > 1:
        first_half = df.iloc[:len(df)//2]["publications"].mean()
        second_half = df.iloc[len(df)//2:]["publications"].mean()
        growth = (second_half / first_half - 1) * 100 if first_half > 0 else float('inf')
        print(f"'{keyword}': {df['publications'].iloc[-1]} papers in {end_year} ({growth:+.0f}% growth)")
    return df

trend = topic_trend_analysis("large language models")
```

## Core Capabilities

### 1. Keyword Trend Analysis

```python
def compare_keyword_trends(keywords, start_year=2018, end_year=2025):
    """Compare publication trends across multiple keywords."""
    all_trends = {}
    for kw in keywords:
        yearly = []
        for year in range(start_year, end_year + 1):
            resp = requests.get("https://api.openalex.org/works", params={
                "search": kw,
                "filter": f"publication_year:{year}",
                "per_page": 1,
            })
            count = resp.json().get("meta", {}).get("count", 0)
            yearly.append(count)
        all_trends[kw] = yearly

    df = pd.DataFrame(all_trends, index=range(start_year, end_year + 1))
    df.index.name = "year"

    # Compute compound annual growth rate (CAGR)
    for kw in keywords:
        start_val = max(df[kw].iloc[0], 1)  # avoid division by zero
        end_val = df[kw].iloc[-1]
        n_years = len(df) - 1
        cagr = (end_val / start_val) ** (1 / n_years) - 1
        print(f"  {kw}: {end_val:,} papers in {end_year}, CAGR={cagr:.1%}")

    return df

trends = compare_keyword_trends([
    "foundation models",
    "protein language model",
    "molecular generation",
    "single cell multiome",
])
```

### 2. Citation Network Exploration

```python
import networkx as nx

def build_citation_network(paper_title, depth=1):
    """Build a citation network around a seed paper."""
    from semanticscholar import SemanticScholar
    sch = SemanticScholar()

    # Find seed paper
    results = sch.search_paper(paper_title, limit=1)
    if not results:
        return None
    seed = results[0]

    G = nx.DiGraph()
    G.add_node(seed.paperId, title=seed.title[:50], citations=seed.citationCount, layer=0)

    # Explore references and citations
    queue = [(seed.paperId, 0)]
    visited = {seed.paperId}

    while queue:
        current_id, current_depth = queue.pop(0)
        if current_depth >= depth:
            continue

        # Get references (papers this one cites)
        try:
            refs = sch.get_paper_references(current_id)
            for ref in (refs or [])[:10]:
                ref_id = ref.citedPaper.paperId
                if ref_id and ref_id not in visited:
                    visited.add(ref_id)
                    G.add_node(ref_id, title=(ref.citedPaper.title or "")[:50],
                               citations=ref.citedPaper.citationCount or 0, layer=current_depth + 1)
                    G.add_edge(current_id, ref_id)
                    queue.append((ref_id, current_depth + 1))
        except Exception:
            pass

    print(f"Network: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")
    return G

network = build_citation_network("Attention is all you need", depth=1)
```

### 3. Research Gap Identification

```python
def identify_research_gaps(topic, n_papers=100):
    """Identify potential research gaps by analyzing frequently mentioned
    limitations and future work in abstracts."""
    import re
    from semanticscholar import SemanticScholar

    sch = SemanticScholar()
    results = sch.search_paper(topic, fields=["title", "abstract"], limit=n_papers)

    gap_phrases = []
    limitation_patterns = [
        r"(?:limitation|challenge|gap|lack|insufficient|incomplete)\s+(?:of|in|is|are)\s+(.{20,80})",
        r"(?:future work|future direction|future study|remain[s]?)\s+(.{10,60})",
        r"(?:not yet|has not been|have not been|unexplored|underexplored)\s+(.{10,60})",
    ]

    for paper in results:
        abstract = paper.abstract or ""
        abstract_lower = abstract.lower()
        for pattern in limitation_patterns:
            matches = re.findall(pattern, abstract_lower, re.IGNORECASE)
            gap_phrases.extend([m.strip() for m in matches])

    # Deduplicate and rank by frequency
    from collections import Counter
    gap_counts = Counter([g[:100] for g in gap_phrases])
    print(f"=== Potential Research Gaps in '{topic}' ===")
    print(f"(Extracted from {n_papers} paper abstracts)\n")
    for phrase, count in gap_counts.most_common(10):
        print(f"  [{count}x] {phrase}")

    return gap_counts

gaps = identify_research_gaps("RNA structure prediction", n_papers=50)
```

## Common Academic Workflow

### Complete Topic Discovery Pipeline

```python
import pandas as pd
import requests
from collections import Counter

def full_topic_discovery(research_area, subtopics=None):
    """Complete pipeline: trend analysis + gap identification + opportunity scoring."""
    if subtopics is None:
        subtopics = [research_area]

    # Step 1: Publication trend analysis
    print("=== STEP 1: Publication Trends ===\n")
    trends = compare_keyword_trends(subtopics, start_year=2018, end_year=2025)

    # Step 2: Emerging keywords from recent papers
    print("\n=== STEP 2: Emerging Keywords ===\n")
    resp = requests.get("https://api.openalex.org/works", params={
        "search": research_area,
        "filter": "publication_year:2023-2025",
        "per_page": 50,
    })
    keywords = []
    for work in resp.json().get("results", []):
        for kw in work.get("keywords", []):
            keywords.append(kw["display_name"])

    emerging = Counter(keywords).most_common(15)
    print("Top co-occurring keywords in 2023-2025 publications:")
    for kw, count in emerging:
        print(f"  {kw}: {count}")

    # Step 3: Research gap identification
    print("\n=== STEP 3: Research Gaps ===\n")
    gaps = identify_research_gaps(research_area, n_papers=50)

    # Step 4: Opportunity scoring
    print("\n=== STEP 4: Opportunity Summary ===\n")
    print("High-potential directions (high growth + identified gaps):")
    for kw, count in emerging[:5]:
        growth = "high" if kw.lower() in [t.lower() for t in trends.columns] else "check manually"
        print(f"  - {kw} (growth: {growth}, mentioned in {count} recent papers)")

    return {"trends": trends, "emerging_keywords": emerging, "gaps": gaps}

discovery = full_topic_discovery(
    "spatial transcriptomics",
    subtopics=["spatial transcriptomics", "MERFISH", "Slide-seq", "Visium"],
)
```

## Best Practices

1. **Triangulate with multiple sources**: Cross-reference OpenAlex trends with Google Trends, preprint servers (bioRxiv/arXiv), and funding databases.
2. **Consider publication lag**: Journal publication lags are 1-2 years. Preprint analysis gives more current trend data.
3. **Validate gaps with experts**: Automated gap detection finds what authors say is missing; expert opinion confirms what is actually feasible and important.
4. **Track funding trends**: Research areas with increasing funding often indicate growing importance. Check NIH Reporter, NSF Award Search, or CORDIS.

## Common Pitfalls

1. **Survivorship bias**: Trend analysis only sees published work. Failed directions are invisible. Consider that "gaps" may exist because the approach was tried and failed.
2. **Keyword ambiguity**: The same concept may have multiple names (e.g., "spatial transcriptomics" vs. "spatial gene expression"). Use synonyms.
3. **Confusing quantity with quality**: A rapidly growing field may have many low-quality papers. Check citation quality, not just publication volume.
4. **Over-fitting to trends**: Chasing trends can lead to crowded fields by the time you publish. Balance trend analysis with your unique expertise.

## Integration with HBE

- Combine with `references/literature-review.md` for comprehensive search before gap analysis
- Feed into `references/research-grants.md` to justify novelty in proposals
- Use with `references/scholar-evaluation.md` to identify rising researchers in emerging areas
- Supports `references/networkx.md` for citation network visualization

## Resources

- OpenAlex API: https://docs.openalex.org/
- Semantic Scholar API: https://api.semanticscholar.org/
- NIH Reporter: https://reporter.nih.gov/
- NSF Award Search: https://www.nsf.gov/awardsearch/
- Dimensions.ai: https://app.dimensions.ai/
