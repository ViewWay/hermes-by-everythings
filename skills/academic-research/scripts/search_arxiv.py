#!/usr/bin/env python3
"""search_arxiv.py — arXiv paper search with BibTeX generation.

Usage:
    python3 search_arxiv.py "attention is all you need" --max 10 --bibtex
    python3 search_arxiv.py --id 1706.03762
    python3 search_arxiv.py --author "Vaswani" --category cs.CL
"""

import argparse
import json
import sys
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET


ARXIV_API = "http://export.arxiv.org/api/query"


def search_papers(query, max_results=10, start=0, sort_by="relevance"):
    params = {
        "search_query": query,
        "start": start,
        "max_results": max_results,
        "sortBy": sort_by,
        "sortOrder": "descending",
    }
    url = f"{ARXIV_API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "academic-research-skill/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read().decode("utf-8")

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    root = ET.fromstring(data)
    results = []
    for entry in root.findall("atom:entry", ns):
        title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
        summary = entry.find("atom:summary", ns).text.strip().replace("\n", " ")
        published = entry.find("atom:published", ns).text[:10]
        updated = entry.find("atom:updated", ns).text[:10]
        link = entry.find("atom:id", ns).text
        arxiv_id = link.split("/abs/")[-1]
        authors = [a.find("atom:name", ns).text for a in entry.findall("atom:author", ns)]
        categories = [c.get("term") for c in entry.findall("atom:category", ns)]
        results.append({
            "arxiv_id": arxiv_id, "title": title, "authors": authors,
            "summary": summary, "published": published, "updated": updated,
            "link": link, "categories": categories,
        })
    return results


def get_by_id(arxiv_id):
    url = f"{ARXIV_API}?id_list={arxiv_id}"
    req = urllib.request.Request(url, headers={"User-Agent": "academic-research-skill/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = resp.read().decode("utf-8")
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    root = ET.fromstring(data)
    entry = root.find("atom:entry", ns)
    if entry is None:
        return None
    title = entry.find("atom:title", ns).text.strip().replace("\n", " ")
    authors = [a.find("atom:name", ns).text for a in entry.findall("atom:author", ns)]
    published = entry.find("atom:published", ns).text[:10]
    link = entry.find("atom:id", ns).text
    return {"arxiv_id": arxiv_id, "title": title, "authors": authors, "published": published, "link": link}


def generate_bibtex(paper):
    authors_str = " and ".join(paper["authors"])
    year = paper.get("published", "2025")[:4]
    first_author = paper["authors"][0].split()[-1].lower() if paper["authors"] else "unknown"
    key = f"{first_author}{year}"
    return f"@article{{{key},\n  title={{{paper['title']}}},\n  author={{{authors_str}}},\n  journal={{arXiv preprint arXiv:{paper['arxiv_id']}}},\n  year={{{year}}},\n}}"


def main():
    parser = argparse.ArgumentParser(description="Search arXiv papers")
    parser.add_argument("query", nargs="?", help="Search query")
    parser.add_argument("--id", help="Get paper by arXiv ID")
    parser.add_argument("--author", help="Filter by author")
    parser.add_argument("--category", help="Filter by category (e.g., cs.CL)")
    parser.add_argument("--max", type=int, default=10, help="Max results")
    parser.add_argument("--bibtex", action="store_true", help="Output BibTeX")
    parser.add_argument("--json", action="store_true", help="Output JSON")
    args = parser.parse_args()

    if args.id:
        paper = get_by_id(args.id)
        if paper is None:
            print(f"Paper {args.id} not found", file=sys.stderr)
            sys.exit(1)
        print(generate_bibtex(paper) if args.bibtex else f"Title: {paper['title']}\nAuthors: {', '.join(paper['authors'])}\nLink: {paper['link']}")
        return

    if not args.query:
        print("Error: provide a query or --id", file=sys.stderr)
        sys.exit(1)

    query_parts = [f'all:"{args.query}"']
    if args.author:
        query_parts.append(f'au:"{args.author}"')
    if args.category:
        query_parts.append(f"cat:{args.category}")
    results = search_papers(" AND ".join(query_parts), max_results=args.max)

    if args.json:
        print(json.dumps(results, indent=2, ensure_ascii=False))
        return

    for i, r in enumerate(results, 1):
        print(f"\n[{i}] {r['title']}")
        print(f"    Authors: {', '.join(r['authors'][:3])}{'...' if len(r['authors']) > 3 else ''}")
        print(f"    Published: {r['published']} | Link: {r['link']}")
        if args.bibtex:
            print(generate_bibtex(r))

    print(f"\n--- {len(results)} results ---")


if __name__ == "__main__":
    main()
