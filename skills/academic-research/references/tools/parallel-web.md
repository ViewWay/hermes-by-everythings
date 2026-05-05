---
name: parallel-web
description: Parallel web scraping — concurrent HTTP requests for research data collection using asyncio and httpx
domain: Data / Collection
install: pip install httpx beautifulsoup4 lxml aiofiles
---

# parallel-web — Parallel Web Scraping for Research Data Collection

Provides patterns and utilities for efficient, concurrent web scraping of academic data sources. Uses `asyncio` with `httpx` for high-throughput HTTP requests, with built-in rate limiting, retry logic, and error handling suitable for collecting research data from APIs, institutional repositories, and public datasets.

## When to Use

- Collecting metadata from multiple pages of a search API or repository
- Scraping structured data from institutional websites or catalogs
- Downloading large numbers of research papers or supplementary files
- Harvesting data from paginated REST APIs with rate limits
- Building research datasets from distributed web sources

## Quick Start

```python
import asyncio
import httpx
from bs4 import BeautifulSoup

async def fetch_page(client: httpx.AsyncClient, url: str) -> str:
    """Fetch a single page with error handling."""
    try:
        response = await client.get(url, follow_redirects=True, timeout=30.0)
        response.raise_for_status()
        return response.text
    except httpx.HTTPStatusError as e:
        print(f"HTTP error {e.response.status_code} for {url}")
        return ""
    except httpx.RequestError as e:
        print(f"Request error for {url}: {e}")
        return ""

async def main():
    urls = [
        "https://pubmed.ncbi.nlm.nih.gov/?term=CRISPR&page=1",
        "https://pubmed.ncbi.nlm.nih.gov/?term=CRISPR&page=2",
        "https://pubmed.ncbi.nlm.nih.gov/?term=CRISPR&page=3",
    ]

    async with httpx.AsyncClient(
        headers={"User-Agent": "AcademicResearchBot/1.0"},
        limits=httpx.Limits(max_connections=10, max_keepalive_connections=5),
    ) as client:
        tasks = [fetch_page(client, url) for url in urls]
        pages = await asyncio.gather(*tasks)

    for page in pages:
        soup = BeautifulSoup(page, "lxml")
        titles = soup.select("a.doc-summary-title")
        for t in titles:
            print(t.get_text(strip=True))

asyncio.run(main())
```

## Core Capabilities

### 1. Rate-Limited Concurrent Requests

```python
import asyncio
import httpx
from datetime import datetime

class RateLimitedScraper:
    def __init__(self, max_concurrent: int = 10, requests_per_second: float = 5.0):
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = 0.0
        self.client = httpx.AsyncClient(
            headers={"User-Agent": "ResearchScraper/1.0 (academic use)"},
            limits=httpx.Limits(max_connections=max_concurrent),
            follow_redirects=True,
        )

    async def fetch(self, url: str, retries: int = 3) -> str:
        async with self.semaphore:
            for attempt in range(retries):
                # Rate limiting
                now = asyncio.get_event_loop().time()
                wait = self.min_interval - (now - self.last_request_time)
                if wait > 0:
                    await asyncio.sleep(wait)

                try:
                    resp = await self.client.get(url, timeout=30.0)
                    self.last_request_time = asyncio.get_event_loop().time()
                    resp.raise_for_status()
                    return resp.text
                except (httpx.HTTPStatusError, httpx.RequestError) as e:
                    if attempt < retries - 1:
                        backoff = 2 ** attempt
                        print(f"Retry {attempt+1}/{retries} for {url} after {backoff}s")
                        await asyncio.sleep(backoff)
                    else:
                        print(f"Failed after {retries} retries: {url}: {e}")
                        return ""
        return ""

    async def fetch_many(self, urls: list[str]) -> list[str]:
        tasks = [self.fetch(url) for url in urls]
        return await asyncio.gather(*tasks)

    async def close(self):
        await self.client.aclose()

# Usage
async def collect_abstracts():
    scraper = RateLimitedScraper(max_concurrent=5, requests_per_second=2.0)
    urls = [f"https://example.org/api/paper/{i}" for i in range(1, 101)]
    pages = await scraper.fetch_many(urls)
    print(f"Fetched {sum(1 for p in pages if p)} / {len(urls)} pages")
    await scraper.close()
```

### 2. API Pagination Handler

```python
import asyncio
import httpx
import json

async def fetch_all_pages(base_url: str, params: dict, max_pages: int = 50):
    """Fetch all pages from a paginated API."""
    all_results = []
    async with httpx.AsyncClient() as client:
        page = 1
        while page <= max_pages:
            params["page"] = page
            response = await client.get(base_url, params=params, timeout=30.0)
            response.raise_for_status()
            data = response.json()

            results = data.get("results", data.get("items", data.get("data", [])))
            if not results:
                break

            all_results.extend(results)
            total = data.get("total_count", data.get("total", None))
            if total and len(all_results) >= total:
                break

            page += 1
            # Respect API rate limits
            await asyncio.sleep(0.5)

    return all_results

# Example: collect from a paginated research API
async def main():
    papers = await fetch_all_pages(
        "https://api.crossref.org/works",
        params={"query": "single-cell RNA sequencing", "rows": 100},
        max_pages=10,
    )
    print(f"Collected {len(papers)} papers")
    return papers
```

### 3. Structured Data Extraction with BeautifulSoup

```python
import asyncio
import httpx
from bs4 import BeautifulSoup
import re

async def extract_publication_metadata(url: str) -> dict:
    """Extract structured metadata from a publication page."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=30.0)
        resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")

    # Extract DOI
    doi_elem = soup.find("meta", attrs={"name": "citation_doi"})
    doi = doi_elem["content"] if doi_elem else None

    # Extract title
    title_elem = soup.find("meta", attrs={"name": "citation_title"})
    title = title_elem["content"] if title_elem else soup.find("h1").get_text(strip=True)

    # Extract authors
    authors = [a["content"] for a in soup.find_all("meta", attrs={"name": "citation_author"})]

    # Extract year from citation date
    date_elem = soup.find("meta", attrs={"name": "citation_date"})
    year = date_elem["content"][:4] if date_elem else None

    return {"doi": doi, "title": title, "authors": authors, "year": year, "url": url}

async def batch_extract(urls: list[str]) -> list[dict]:
    """Extract metadata from multiple publication pages concurrently."""
    semaphore = asyncio.Semaphore(5)

    async def limited_extract(url):
        async with semaphore:
            await asyncio.sleep(1)  # politeness delay
            return await extract_publication_metadata(url)

    tasks = [limited_extract(url) for url in urls]
    return await asyncio.gather(*tasks)
```

## Common Academic Workflow: Building a Dataset from Multiple Sources

```python
import asyncio
import httpx
import json
import pandas as pd

async def build_research_dataset():
    """Collect papers from multiple APIs and merge into a single dataset."""
    all_papers = []

    # Source 1: Crossref API
    async with httpx.AsyncClient() as client:
        for query in ["CRISPR therapy", "CAR-T cells", "mRNA vaccine"]:
            resp = await client.get(
                "https://api.crossref.org/works",
                params={"query": query, "rows": 50},
                timeout=30.0,
            )
            for item in resp.json().get("message", {}).get("items", []):
                all_papers.append({
                    "title": item.get("title", [""])[0],
                    "year": item.get("published-print", {}).get("date-parts", [[None]])[0][0],
                    "doi": item.get("DOI"),
                    "source": "crossref",
                    "cited_by": item.get("is-referenced-by-count", 0),
                })
            await asyncio.sleep(1)

    # Deduplicate by DOI
    df = pd.DataFrame(all_papers).drop_duplicates(subset=["doi"])
    df.to_csv("research_dataset.csv", index=False)
    print(f"Collected {len(df)} unique papers")
    return df

asyncio.run(build_research_dataset())
```

## Best Practices

1. Always set a descriptive `User-Agent` header identifying your scraper and its purpose
2. Respect `robots.txt` and implement rate limiting (1-2 requests/second for public sites)
3. Use exponential backoff with jitter for retries to avoid thundering herd problems
4. Cache responses locally to avoid re-fetching unchanged pages
5. Check HTTP status codes and handle 429 (Too Many Requests) gracefully

## Common Pitfalls

1. **Blocking I/O in async code**: Never use `requests.get()` inside async functions; always use `httpx.AsyncClient`
2. **Missing session reuse**: Create one `AsyncClient` and reuse it; creating a new client per request is very slow
3. **Unicode encoding errors**: Specify `response.encoding` or use `response.content.decode('utf-8')` for non-ASCII pages
4. **IP blocking**: Distribute requests across multiple IPs or use proxy rotation for high-volume scraping

## Integration with HBE

- Use with `references/tools/pandas.md` for structuring collected data
- Pair with `references/tools/paper-lookup.md` for academic metadata enrichment
- Combine with `references/tools/bibtex-tidy.md` for reference management
- Supports `references/tool-registry.md` data collection tool chain

## Resources

- httpx Documentation: https://www.python-httpx.org/
- BeautifulSoup: https://www.crummy.com/software/BeautifulSoup/bs4/doc/
- asyncio: https://docs.python.org/3/library/asyncio.html
