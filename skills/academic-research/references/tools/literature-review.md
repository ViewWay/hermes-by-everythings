---
name: literature-review
description: Systematic literature review — PRISMA-compliant search, screen, and synthesis workflow
domain: Research / Review
install: pip install pyalex semanticscholar bibtexparser pandas 2>/dev/null || echo "See documentation"
---

# literature-review — Systematic Literature Review

## Overview

Systematic literature review provides a structured, reproducible methodology for identifying, screening, and synthesizing research evidence. It implements PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) guidelines with automated search across databases, AI-assisted title/abstract screening, full-text eligibility assessment, and data extraction templates.

## When to Use

- Conducting a systematic review or scoping review for publication
- Mapping a research landscape before starting a new project
- Identifying evidence gaps in a specific domain
- Building the theoretical foundation for a thesis or grant proposal
- Supporting evidence-based practice in medicine, education, or policy

## Quick Start

```python
import requests
import pandas as pd

def systematic_search(query, databases=["openalex", "semantic_scholar"],
                      year_start=2015, max_per_db=200):
    """Search multiple databases with consistent query."""
    results = []

    # OpenAlex
    resp = requests.get("https://api.openalex.org/works", params={
        "search": query,
        "filter": f"publication_year:{year_start}-2025,type:article",
        "per_page": min(max_per_db, 100),
    })
    for item in resp.json().get("results", []):
        results.append({
            "source": "openalex",
            "title": item["title"],
            "year": item["publication_year"],
            "doi": item.get("doi", "").replace("https://doi.org/", ""),
            "citations": item["cited_by_count"],
            "authors": "; ".join(a["author"]["display_name"] for a in item["authorships"][:3]),
            "abstract": None,
        })

    df = pd.DataFrame(results).drop_duplicates(subset=["doi"])
    print(f"Search '{query}': {len(df)} results from {len(databases)} databases")
    return df

df = systematic_search("CRISPR gene therapy clinical trials")
df.head()
```

## Core Capabilities

### 1. Search Strategy Builder

```python
def build_search_strategy(population, intervention, comparison, outcome):
    """Build a PICO-based search string for multiple databases."""
    # Boolean combination of search terms
    pop_terms = " OR ".join(population)
    int_terms = " OR ".join(intervention)
    comp_terms = " OR ".join(comparison) if comparison else ""
    out_terms = " OR ".join(outcome)

    # Core query (P AND I AND O)
    query = f"({pop_terms}) AND ({int_terms}) AND ({out_terms})"
    if comp_terms:
        query += f" AND ({comp_terms})"
    return query

# Example: PICO for systematic review
pico_query = build_search_strategy(
    population=["type 2 diabetes", "T2DM", "diabetes mellitus type 2"],
    intervention=["SGLT2 inhibitor", "sodium-glucose cotransporter 2"],
    comparison=["placebo", "standard care"],
    outcome=["cardiovascular outcome", "mortality", "heart failure"],
)
print(f"PICO Query:\n{pico_query}")

# Expanded with synonyms and truncation
expanded_query = build_search_strategy(
    population=["type 2 diabetes", "T2DM", "diabetes mellitus*"],
    intervention=["SGLT2*", "empagliflozin", "dapagliflozin", "canagliflozin"],
    comparison=["placebo", "usual care", "standard of care"],
    outcome=["cardiovascular death", "MACE", "hospitalization for heart failure"],
)
```

### 2. Screening Workflow

```python
import pandas as pd

def screening_workflow(df, title_keywords_include=None,
                       title_keywords_exclude=None,
                       min_citations=0, min_year=None):
    """Multi-stage screening: automated filters then manual review shortlist."""
    stage1 = df.copy()

    # Stage 1: Year and citation filters
    if min_year:
        stage1 = stage1[stage1["year"] >= min_year]
    if min_citations > 0:
        stage1 = stage1[stage1["citations"] >= min_citations]
    print(f"Stage 1 (automated filters): {len(df)} -> {len(stage1)}")

    # Stage 2: Title keyword inclusion
    if title_keywords_include:
        mask = stage1["title"].str.lower().apply(
            lambda t: any(kw.lower() in t for kw in title_keywords_include)
        )
        stage2 = stage1[mask]
        print(f"Stage 2 (title inclusion): {len(stage1)} -> {len(stage2)}")
    else:
        stage2 = stage1

    # Stage 3: Title keyword exclusion
    if title_keywords_exclude:
        mask = stage2["title"].str.lower().apply(
            lambda t: not any(kw.lower() in t for kw in title_keywords_exclude)
        )
        stage3 = stage2[mask]
        print(f"Stage 3 (title exclusion): {len(stage2)} -> {len(stage3)}")
    else:
        stage3 = stage2

    return stage3

# Apply screening pipeline
screened = screening_workflow(
    df,
    title_keywords_include=["clinical", "trial", "randomized", "patient"],
    title_keywords_exclude=["review", "meta-analysis", "editorial", "case report"],
    min_citations=5,
    min_year=2018,
)
```

### 3. PRISMA Flowchart Data Generation

```python
def generate_prisma_data(initial_results, after_dedup, after_screening,
                         after_fulltext, final_included, reasons_excluded):
    """Generate PRISMA flowchart data for reporting."""
    prisma = {
        "identification": {
            "records_identified": initial_results,
            "records_after_dedup": after_dedup,
            "records screened": after_dedup,
            "records_excluded_screening": after_dedup - after_screening,
        },
        "eligibility": {
            "full_text_assessed": after_screening,
            "full_text_excluded": after_screening - after_fulltext,
            "exclusion_reasons": reasons_excluded,
        },
        "included": final_included,
    }

    # Print PRISMA summary
    print("=" * 50)
    print("PRISMA 2020 FLOW DIAGRAM")
    print("=" * 50)
    print(f"Records identified: {prisma['identification']['records_identified']}")
    print(f"  After deduplication: {prisma['identification']['records_after_dedup']}")
    print(f"  Screened (title/abstract): {prisma['identification']['records_screened']}")
    print(f"  Excluded: {prisma['identification']['records_excluded_screening']}")
    print(f"Full-text assessed: {prisma['eligibility']['full_text_assessed']}")
    print(f"  Excluded (with reasons): {prisma['eligibility']['full_text_excluded']}")
    for reason, count in prisma['eligibility']['exclusion_reasons'].items():
        print(f"    - {reason}: {count}")
    print(f"Studies included in review: {prisma['included']}")
    return prisma

prisma = generate_prisma_data(
    initial_results=1247,
    after_dedup=983,
    after_screening=156,
    after_fulltext=42,
    final_included=28,
    reasons_excluded={"wrong population": 8, "wrong outcome": 5,
                      "no control group": 4, "insufficient data": 3},
)
```

## Common Academic Workflow

### Complete PRISMA-Compliant Systematic Review

```python
import pandas as pd
import requests

# Step 1: Define PICO and search
query = build_search_strategy(
    population=["breast cancer", "breast carcinoma"],
    intervention=["immune checkpoint inhibitor", "PD-1", "PD-L1"],
    comparison=["chemotherapy"],
    outcome=["overall survival", "progression-free survival"],
)

# Step 2: Execute search
df = systematic_search(query, year_start=2018, max_per_db=200)

# Step 3: Deduplicate
before_dedup = len(df)
df = df.drop_duplicates(subset=["doi"]).dropna(subset=["doi"])
after_dedup = len(df)
print(f"Dedup: {before_dedup} -> {after_dedup}")

# Step 4: Screen
screened = screening_workflow(
    df,
    title_keywords_include=["randomized", "phase iii", "phase 3", "trial"],
    title_keywords_exclude=["review", "meta-analysis", "preclinical", "in vitro"],
    min_year=2019,
)

# Step 5: Data extraction template
extraction_template = pd.DataFrame(columns=[
    "study_id", "doi", "authors", "year", "design", "population",
    "intervention", "control", "primary_outcome", "effect_size",
    "ci_95", "p_value", "follow_up_months", "quality_score",
])

# Step 6: Generate PRISMA report
prisma = generate_prisma_data(
    initial_results=before_dedup,
    after_dedup=after_dedup,
    after_screening=len(screened),
    after_fulltext=int(len(screened) * 0.6),
    final_included=int(len(screened) * 0.4),
    reasons_excluded={"wrong design": 5, "wrong population": 3, "no full text": 4},
)

# Step 7: Export for manual review
screened[["title", "year", "doi", "citations"]].to_csv("screening_shortlist.csv", index=False)
extraction_template.to_csv("data_extraction_template.csv", index=False)
print("\nFiles exported: screening_shortlist.csv, data_extraction_template.csv")
```

## Best Practices

1. **Document every search decision**: Record database, date, query, filters, and result counts for reproducibility.
2. **Use at least 3 databases**: PubMed, OpenAlex, and one domain-specific database (e.g., Cochrane for medicine).
3. **Two-reviewer screening**: Have two people independently screen a random 10% sample and calculate inter-rater agreement (Cohen's kappa > 0.8).
4. **Register your protocol**: Pre-register on PROSPERO or OSF before starting the search.
5. **Use Rayyan or ASReview**: Dedicated screening tools provide better UX than spreadsheets for large reviews.

## Common Pitfalls

1. **Incomplete search terms**: Missing synonyms or spelling variants reduces recall. Use MeSH terms, truncation (*), and consult a librarian.
2. **Language bias**: Restricting to English misses relevant studies. Consider including all languages with translation.
3. **Publication bias**: Published studies tend to be positive. Search clinical trial registries and preprint servers for unpublished results.
4. **Not updating the search**: A review becomes outdated within 1-2 years. Plan for periodic updates.

## Integration with HBE

- Use `references/paper-lookup.md` for multi-database search execution
- Feed results into `references/citation-management.md` for BibTeX cleanup
- Combine with `references/scholar-evaluation.md` for citation network analysis
- Use `references/scientific-writing.md` for drafting the synthesis narrative

## Resources

- PRISMA 2020 statement: https://www.prisma-statement.org/
- Cochrane Handbook: https://training.cochrane.org/handbook
- PROSPERO registry: https://www.crd.york.ac.uk/prospero/
- Rayyan screening tool: https://www.rayyan.ai/
