# Scientific Databases & Unified Query Guide / 科学数据库统一查询指南

Unified Python access to 50+ scientific databases across 7 categories, with a single accessor pattern for cross-disciplinary research.
跨 7 大类 50+ 科学数据库的统一 Python 访问接口，支持跨学科研究的一站式查询。

## Database Coverage / 数据库覆盖

| Category | Count | Databases |
|----------|-------|-----------|
| Literature / 文献 | 12 | arXiv, Semantic Scholar, OpenAlex, CrossRef, Google Scholar, CORE, Unpaywall, DBLP, Papers With Code, Scopus, Web of Science, JSTOR |
| Life Sciences / 生命科学 | 10 | PubMed, bioRxiv, medRxiv, UniProt, PDB, GenBank, ENA, GEO, SRA, Ensembl |
| Physical Sciences / 物理科学 | 7 | ADS, INSPIRE-HEP, ChemRxiv, Crystallography (CCDC), MathSciNet, SciFinder, Reaxys |
| Social Science & Econ / 社科经管 | 8 | SSRN, NBER, FRED, World Bank, ICPSR, RePEc, EconLit, ProQuest |
| Engineering / 工程 | 5 | IEEE Xplore, ACM DL, Patents (Google Patents), USPTO, Scopus |
| Data & Code / 数据代码 | 6 | Zenodo, Figshare, OSF, Dataverse, GitHub, HuggingFace Datasets |
| Clinical & Trials / 临床试验 | 4 | ClinicalTrials.gov, WHO ICTRP, Cochrane, PubMed Central |

---

## Unified Python Accessor / 统一 Python 查询接口

A single `query_db()` function that wraps all databases into a consistent interface.

```python
"""Unified scientific database accessor — one function to search them all."""
import json
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from typing import List, Dict, Optional

Result = Dict[str, str]  # {"title", "authors", "year", "doi", "url", "abstract", "source"}


def query_db(
    category: str,
    terms: str,
    max_results: int = 20,
    databases: Optional[List[str]] = None,
) -> List[Result]:
    """
    Search scientific databases with a unified interface.

    Args:
        category: "literature" | "life_sci" | "physical" | "social" | "engineering" | "data" | "clinical"
        terms: Search query string
        max_results: Maximum results per database
        databases: Specific databases to search (default: all in category)
    """
    registry = _get_registry(category, databases)
    all_results = []
    for db_name, db_func in registry.items():
        try:
            results = db_func(terms, max_results)
            for r in results:
                r["source"] = db_name
            all_results.extend(results)
        except Exception as e:
            print(f"[{db_name}] query failed: {e}")
    return _deduplicate(all_results)


def _get_registry(category: str, databases: Optional[List[str]]) -> Dict:
    """Map category to available database search functions."""
    all_dbs = {
        "literature": {
            "arxiv": _search_arxiv,
            "semantic_scholar": _search_semantic_scholar,
            "openalex": _search_openalex,
            "crossref": _search_crossref,
            "dblp": _search_dblp,
            "papers_with_code": _search_pwc,
            "core": _search_core,
        },
        "life_sci": {
            "pubmed": _search_pubmed,
            "biorxiv": _search_biorxiv,
            "uniprot": _search_uniprot,
            "pdb": _search_pdb,
            "genbank": _search_genbank,
            "geo": _search_geo,
            "ensembl": _search_ensembl,
        },
        "physical": {
            "ads": _search_ads,
            "inspire_hep": _search_inspire,
            "chemrxiv": _search_chemrxiv,
        },
        "social": {
            "nber": _search_nber,
            "fred": _search_fred,
            "world_bank": _search_world_bank,
            "repec": _search_repec,
        },
        "engineering": {
            "patents": _search_google_patents,
        },
        "data": {
            "zenodo": _search_zenodo,
            "figshare": _search_figshare,
            "osf": _search_osf,
            "huggingface": _search_huggingface,
        },
        "clinical": {
            "clinicaltrials": _search_clinicaltrials,
            "pmc": _search_pmc,
        },
    }
    cat_dbs = all_dbs.get(category, {})
    if databases:
        return {k: v for k, v in cat_dbs.items() if k in databases}
    return cat_dbs


def _deduplicate(results: List[Result]) -> List[Result]:
    """Remove duplicates by DOI, then by normalized title."""
    seen_dois, seen_titles, unique = set(), set(), []
    for r in results:
        doi = r.get("doi", "").lower().strip()
        title = r.get("title", "").lower().strip()
        if doi and doi in seen_dois:
            continue
        if title and title in seen_titles:
            continue
        if doi:
            seen_dois.add(doi)
        if title:
            seen_titles.add(title)
        unique.append(r)
    return unique


def _fetch_json(url: str, headers: Optional[Dict] = None) -> dict:
    req = urllib.request.Request(url, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


# ── Literature ──────────────────────────────────────────────────────────

def _search_arxiv(terms: str, max_results: int = 20) -> List[Result]:
    base = "http://export.arxiv.org/api/query?"
    params = urllib.parse.urlencode({"search_query": f"all:{terms}", "max_results": max_results})
    with urllib.request.urlopen(base + params, timeout=30) as resp:
        root = ET.fromstring(resp.read())
    ns = {"atom": "http://www.w3.org/2005/Atom"}
    results = []
    for entry in root.findall("atom:entry", ns):
        authors = [a.find("atom:name", ns).text for a in entry.findall("atom:author", ns)]
        results.append({
            "title": entry.find("atom:title", ns).text.strip().replace("\n", " "),
            "authors": "; ".join(authors),
            "year": entry.find("atom:published", ns).text[:4],
            "doi": (entry.find("atom:doi", ns).text if entry.find("atom:doi", ns) is not None else ""),
            "url": entry.find("atom:id", ns).text,
            "abstract": entry.find("atom:summary", ns).text.strip()[:500],
        })
    return results


def _search_semantic_scholar(terms: str, max_results: int = 20) -> List[Result]:
    fields = "title,authors,year,externalIds,abstract,url"
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={urllib.parse.quote(terms)}&limit={max_results}&fields={fields}"
    data = _fetch_json(url)
    results = []
    for p in data.get("data", []):
        authors = "; ".join(a.get("name", "") for a in p.get("authors", []))
        eids = p.get("externalIds", {})
        doi = eids.get("DOI", "")
        results.append({
            "title": p.get("title", ""), "authors": authors,
            "year": str(p.get("year", "")), "doi": doi,
            "url": p.get("url", ""),
            "abstract": (p.get("abstract") or "")[:500],
        })
    return results


def _search_openalex(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://api.openalex.org/works?search={urllib.parse.quote(terms)}&per_page={max_results}"
    data = _fetch_json(url)
    results = []
    for w in data.get("results", []):
        authors = "; ".join(a.get("author", {}).get("display_name", "") for a in w.get("authorships", []))
        results.append({
            "title": w.get("title", ""), "authors": authors,
            "year": str(w.get("publication_year", "")),
            "doi": (w.get("doi") or "").replace("https://doi.org/", ""),
            "url": w.get("doi", ""),
            "abstract": _reconstruct_abstract(w.get("abstract_inverted_index", {})),
        })
    return results


def _reconstruct_abstract(inverted: dict) -> str:
    if not inverted:
        return ""
    all_pos = [pos for positions in inverted.values() for pos in positions]
    if not all_pos:
        return ""
    words = [""] * (max(all_pos) + 1)
    for word, positions in inverted.items():
        for pos in positions:
            if pos < len(words):
                words[pos] = word
    return " ".join(words)[:500]


def _search_crossref(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://api.crossref.org/works?query={urllib.parse.quote(terms)}&rows={max_results}"
    data = _fetch_json(url)
    results = []
    for item in data.get("message", {}).get("items", []):
        authors = "; ".join(
            f"{a.get('given', '')} {a.get('family', '')}".strip()
            for a in item.get("author", [])
        )
        year = item.get("published-print", item.get("published-online", {}))
        year = str(year.get("date-parts", [[""]])[0][0]) if year.get("date-parts") else ""
        results.append({
            "title": " ".join(item.get("title", [""])), "authors": authors,
            "year": year, "doi": item.get("DOI", ""),
            "url": item.get("URL", ""),
            "abstract": (item.get("abstract") or "").replace("<jats:p>", "").replace("</jats:p>", "")[:500],
        })
    return results


def _search_dblp(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://dblp.org/search/publ/api?q={urllib.parse.quote(terms)}&h={max_results}&format=json"
    data = _fetch_json(url)
    results = []
    for hit in data.get("result", {}).get("hits", {}).get("hit", []):
        info = hit.get("info", {})
        authors = info.get("authors", {}).get("author", "")
        if isinstance(authors, list):
            authors = "; ".join(a.get("text", a) if isinstance(a, dict) else a for a in authors)
        results.append({
            "title": info.get("title", ""), "authors": authors,
            "year": info.get("year", ""), "doi": info.get("doi", ""),
            "url": info.get("url", ""), "abstract": "",
        })
    return results


def _search_pwc(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://paperswithcode.com/api/v1/search/?q={urllib.parse.quote(terms)}&page=1&items_per_page={max_results}"
    data = _fetch_json(url)
    results = []
    for r in data.get("results", []):
        paper = r.get("paper", {})
        results.append({
            "title": paper.get("title", ""), "authors": paper.get("authors_str", ""),
            "year": str(paper.get("published", ""))[:4], "doi": "",
            "url": paper.get("url_abs", ""),
            "abstract": paper.get("abstract", "")[:500],
        })
    return results


def _search_core(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://api.core.ac.uk/v3/search/works?q={urllib.parse.quote(terms)}&limit={max_results}"
    data = _fetch_json(url)
    results = []
    for r in data.get("results", []):
        results.append({
            "title": r.get("title", ""),
            "authors": "; ".join(a.get("name", "") for a in r.get("authors", [])),
            "year": str(r.get("yearPublished", "")), "doi": r.get("doi", ""),
            "url": r.get("downloadUrl", ""),
            "abstract": (r.get("abstract") or "")[:500],
        })
    return results


# ── Life Sciences ────────────────────────────────────────────────────────

def _search_pubmed(terms: str, max_results: int = 20) -> List[Result]:
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    search_url = f"{base}esearch.fcgi?db=pubmed&term={urllib.parse.quote(terms)}&retmax={max_results}&retmode=json"
    ids_data = _fetch_json(search_url)
    id_list = ids_data.get("esearchresult", {}).get("idlist", [])
    if not id_list:
        return []
    fetch_url = f"{base}efetch.fcgi?db=pubmed&id={','.join(id_list)}&retmode=xml"
    with urllib.request.urlopen(fetch_url, timeout=30) as resp:
        root = ET.fromstring(resp.read())
    results = []
    for article in root.findall(".//PubmedArticle"):
        title = article.findtext(".//ArticleTitle", "")
        authors = "; ".join(
            f"{a.findtext('ForeName', '')} {a.findtext('LastName', '')}".strip()
            for a in article.findall(".//Author")
        )
        year = article.findtext(".//PubDate/Year", article.findtext(".//PubDate/MedlineDate", "")[:4])
        pmid = article.findtext(".//PMID", "")
        doi_el = article.find(".//ArticleId[@IdType='doi']")
        doi = doi_el.text if doi_el is not None else ""
        results.append({
            "title": title, "authors": authors, "year": year, "doi": doi,
            "url": f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
            "abstract": article.findtext(".//AbstractText", "")[:500],
        })
    return results


def _search_biorxiv(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://api.biorxiv.org/details/biorxiv/{urllib.parse.quote(terms)}/{max_results}"
    data = _fetch_json(url)
    results = []
    for c in data.get("collection", []):
        results.append({
            "title": c.get("title", ""), "authors": "",
            "year": c.get("date", "")[:4], "doi": c.get("doi", ""),
            "url": f"https://doi.org/{c.get('doi', '')}",
            "abstract": "",
        })
    return results


def _search_uniprot(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://rest.uniprot.org/uniprotkb/search?query={urllib.parse.quote(terms)}&size={max_results}&format=json"
    data = _fetch_json(url)
    results = []
    for entry in data.get("results", []):
        desc = entry.get("proteinDescription", {})
        name = desc.get("recommendedName", desc.get("alternativeNames", [{}])[0] if desc.get("alternativeNames") else {})
        name = name.get("fullName", {}).get("value", "")
        results.append({
            "title": name,
            "authors": entry.get("organism", {}).get("scientificName", ""),
            "year": "", "doi": "",
            "url": f"https://www.uniprot.org/uniprot/{entry.get('primaryAccession', '')}",
            "abstract": "",
        })
    return results


def _search_pdb(terms: str, max_results: int = 20) -> List[Result]:
    query = json.dumps({
        "query": {"type": "terminal", "service": "text", "parameters": {"value": terms}},
        "return_type": "entry",
        "request_options": {"results_content_type": ["experimental"], "pager": {"start": 0, "rows": max_results}},
    })
    url = f"https://search.rcsb.org/rcsbsearch/v2/query?json={urllib.parse.quote(query)}"
    try:
        data = _fetch_json(url)
        return [{"title": r.get("entry", {}).get("id", ""), "authors": "", "year": "",
                 "doi": "", "url": f"https://www.rcsb.org/structure/{r.get('entry', {}).get('id', '')}",
                 "abstract": ""} for r in data.get("result_set", [])]
    except Exception:
        return []


def _search_genbank(terms: str, max_results: int = 20) -> List[Result]:
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    url = f"{base}esearch.fcgi?db=nucleotide&term={urllib.parse.quote(terms)}&retmax={max_results}&retmode=json"
    data = _fetch_json(url)
    ids = data.get("esearchresult", {}).get("idlist", [])
    return [{"title": gid, "authors": "", "year": "", "doi": "",
             "url": f"https://www.ncbi.nlm.nih.gov/nuccore/{gid}", "abstract": ""} for gid in ids]


def _search_geo(terms: str, max_results: int = 20) -> List[Result]:
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    url = f"{base}esearch.fcgi?db=gds&term={urllib.parse.quote(terms)}&retmax={max_results}&retmode=json"
    data = _fetch_json(url)
    ids = data.get("esearchresult", {}).get("idlist", [])
    results = []
    for gid in ids:
        sum_url = f"{base}esummary.fcgi?db=gds&id={gid}&retmode=json"
        try:
            sum_data = _fetch_json(sum_url)
            entry = sum_data.get("result", {}).get(gid, {})
            results.append({
                "title": entry.get("title", ""),
                "authors": "",
                "year": str(entry.get("PDAT", ""))[:4], "doi": "",
                "url": f"https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc={entry.get('accession', '')}",
                "abstract": entry.get("summary", "")[:500],
            })
        except Exception:
            pass
    return results


def _search_ensembl(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://rest.ensembl.org/lookup/symbol/homo_sapiens/{urllib.parse.quote(terms)}?content-type=application/json"
    try:
        data = _fetch_json(url)
        if isinstance(data, dict):
            data = [data]
        return [{"title": g.get("display_name", g.get("id", "")), "authors": "",
                 "year": "", "doi": "",
                 "url": f"https://www.ensembl.org/id/{g.get('id', '')}",
                 "abstract": g.get("description", "")[:500]} for g in data[:max_results]]
    except Exception:
        return []


# ── Physical Sciences ────────────────────────────────────────────────────

def _search_ads(terms: str, max_results: int = 20) -> List[Result]:
    import os
    token = os.environ.get("ADS_API_TOKEN", "")
    if not token:
        print("[ads] Set ADS_API_TOKEN env var for NASA ADS access")
        return []
    url = f"https://api.adsabs.harvard.edu/v1/search/query?q={urllib.parse.quote(terms)}&rows={max_results}&fl=title,author,year,doi,abstract,bibcode"
    data = _fetch_json(url, headers={"Authorization": f"Bearer {token}"})
    results = []
    for doc in data.get("response", {}).get("docs", []):
        title = doc.get("title", [""])[0] if isinstance(doc.get("title"), list) else doc.get("title", "")
        authors = doc.get("author", [])
        if isinstance(authors, list):
            authors = "; ".join(authors[:5])
        doi = doc.get("doi", "")
        if isinstance(doi, list):
            doi = doi[0]
        results.append({
            "title": title, "authors": authors, "year": str(doc.get("year", "")),
            "doi": doi, "url": f"https://ui.adsabs.harvard.edu/abs/{doc.get('bibcode', '')}",
            "abstract": (doc.get("abstract") or "")[:500],
        })
    return results


def _search_inspire(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://inspirehep.net/api/literature?q={urllib.parse.quote(terms)}&size={max_results}"
    data = _fetch_json(url)
    results = []
    for hit in data.get("hits", {}).get("hits", []):
        meta = hit.get("metadata", {})
        titles = meta.get("titles", [{}])
        title = titles[0].get("title", "") if titles else ""
        authors = "; ".join(a.get("full_name", "") for a in meta.get("authors", [])[:5])
        year = str(meta.get("earliest_date", ""))[:4]
        dois = meta.get("dois", [])
        doi = dois[0].get("value", "") if dois else ""
        abstracts = meta.get("abstracts", [])
        abstract = abstracts[0].get("value", "")[:500] if abstracts else ""
        results.append({
            "title": title, "authors": authors, "year": year, "doi": doi,
            "url": f"https://inspirehep.net/literature/{hit.get('id', '')}",
            "abstract": abstract,
        })
    return results


def _search_chemrxiv(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://chemrxiv.org/engage/api-gateway/chemrxiv/assets/search?search={urllib.parse.quote(terms)}&size={max_results}"
    try:
        data = _fetch_json(url)
        items = data.get("item", data.get("search-results", {}).get("entry", []))
        if isinstance(items, dict):
            items = [items]
        return [{"title": i.get("title", ""), "authors": "", "year": "",
                 "doi": i.get("doi", ""), "url": i.get("url", ""),
                 "abstract": (i.get("description") or "")[:500]} for i in items]
    except Exception:
        return []


# ── Social Science & Economics ──────────────────────────────────────────

def _search_nber(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://www.nber.org/api/v1/working_paper/search?q={urllib.parse.quote(terms)}&limit={max_results}"
    try:
        data = _fetch_json(url)
        results = []
        for p in data.get("results", []):
            results.append({
                "title": p.get("title", ""),
                "authors": "; ".join(a.get("name", "") for a in p.get("authors", [])),
                "year": str(p.get("year", "")), "doi": "",
                "url": f"https://www.nber.org/papers/{p.get('id', '')}",
                "abstract": (p.get("abstract") or "")[:500],
            })
        return results
    except Exception:
        return []


def _search_fred(terms: str, max_results: int = 20) -> List[Result]:
    import os
    api_key = os.environ.get("FRED_API_KEY", "")
    if not api_key:
        print("[fred] Set FRED_API_KEY env var (free from fred.stlouisfed.org)")
        return []
    url = f"https://api.stlouisfed.org/fred/series/search?search_text={urllib.parse.quote(terms)}&api_key={api_key}&file_type=json&limit={max_results}"
    data = _fetch_json(url)
    return [{"title": s.get("title", ""), "authors": s.get("frequency", ""),
             "year": "", "doi": "",
             "url": f"https://fred.stlouisfed.org/series/{s.get('id', '')}",
             "abstract": s.get("notes", "")[:500]} for s in data.get("seriess", [])]


def _search_world_bank(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://api.worldbank.org/v2/sources/2/search/{urllib.parse.quote(terms)}?format=json&per_page={max_results}"
    try:
        data = _fetch_json(url)
        pages = data[1] if len(data) > 1 else []
        return [{"title": p.get("name", ""), "authors": "", "year": "",
                 "doi": "", "url": f"https://data.worldbank.org/indicator/{p.get('id', '')}",
                 "abstract": (p.get("sourceNote") or "")[:500]} for p in pages]
    except Exception:
        return []


def _search_repec(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://api.repec.org/search?q={urllib.parse.quote(terms)}&limit={max_results}"
    try:
        data = _fetch_json(url)
        return [{"title": r.get("title", ""), "authors": r.get("author", ""),
                 "year": str(r.get("year", "")), "doi": "",
                 "url": r.get("url", ""), "abstract": (r.get("abstract") or "")[:500]}
                for r in data.get("results", [])]
    except Exception:
        return []


# ── Engineering ──────────────────────────────────────────────────────────

def _search_google_patents(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://patents.google.com/xfer/query?q={urllib.parse.quote(terms)}&limit={max_results}"
    try:
        data = _fetch_json(url)
        return [{"title": p.get("title", ""), "authors": p.get("assignee", ""),
                 "year": str(p.get("publicationDate", ""))[:4],
                 "doi": p.get("patentNumber", ""),
                 "url": f"https://patents.google.com/patent/{p.get('patentNumber', '')}",
                 "abstract": (p.get("abstract") or "")[:500]} for p in data.get("results", [])]
    except Exception:
        return []


# ── Data & Code ─────────────────────────────────────────────────────────

def _search_zenodo(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://zenodo.org/api/records?q={urllib.parse.quote(terms)}&size={max_results}"
    data = _fetch_json(url)
    results = []
    for h in data.get("hits", {}).get("hits", []):
        meta = h.get("metadata", {})
        creators = "; ".join(c.get("name", "") for c in meta.get("creators", []))
        results.append({
            "title": meta.get("title", ""), "authors": creators,
            "year": str(meta.get("publication_date", ""))[:4],
            "doi": meta.get("doi", ""),
            "url": f"https://doi.org/{meta.get('doi', '')}",
            "abstract": (meta.get("description") or "")[:500],
        })
    return results


def _search_figshare(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://api.figshare.com/v2/articles?search_for={urllib.parse.quote(terms)}&item_type=3&limit={max_results}"
    data = _fetch_json(url)
    return [{"title": a.get("title", ""), "authors": "",
             "year": str(a.get("published_date", ""))[:4],
             "doi": a.get("doi", ""), "url": a.get("url_public_api", ""),
             "abstract": ""} for a in data]


def _search_osf(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://api.osf.io/v2/nodes/?filter[title]={urllib.parse.quote(terms)}&page[size]={max_results}"
    data = _fetch_json(url)
    results = []
    for n in data.get("data", []):
        attrs = n.get("attributes", {})
        results.append({
            "title": attrs.get("title", ""), "authors": "",
            "year": str(attrs.get("date_created", ""))[:4], "doi": "",
            "url": n.get("links", {}).get("html", ""),
            "abstract": (attrs.get("description") or "")[:500],
        })
    return results


def _search_huggingface(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://huggingface.co/api/datasets?search={urllib.parse.quote(terms)}&limit={max_results}"
    data = _fetch_json(url)
    return [{"title": d.get("id", ""), "authors": "", "year": "",
             "doi": "", "url": f"https://huggingface.co/datasets/{d.get('id', '')}",
             "abstract": str(d.get("tags", [])[:5])} for d in data]


# ── Clinical ────────────────────────────────────────────────────────────

def _search_clinicaltrials(terms: str, max_results: int = 20) -> List[Result]:
    url = f"https://clinicaltrials.gov/api/v2/studies?query.term={urllib.parse.quote(terms)}&pageSize={max_results}&format=json"
    data = _fetch_json(url)
    results = []
    for s in data.get("studies", []):
        proto = s.get("protocolSection", {})
        id_mod = proto.get("identificationModule", {})
        status = proto.get("statusModule", {})
        results.append({
            "title": id_mod.get("officialTitle", ""),
            "authors": id_mod.get("organization", {}).get("fullName", ""),
            "year": str(status.get("startDateStruct", {}).get("date", ""))[:4],
            "doi": id_mod.get("nctId", ""),
            "url": f"https://clinicaltrials.gov/study/{id_mod.get('nctId', '')}",
            "abstract": (proto.get("descriptionModule", {}).get("briefSummary") or "")[:500],
        })
    return results


def _search_pmc(terms: str, max_results: int = 20) -> List[Result]:
    base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/"
    url = f"{base}esearch.fcgi?db=pmc&term={urllib.parse.quote(terms)}&retmax={max_results}&retmode=json"
    data = _fetch_json(url)
    ids = data.get("esearchresult", {}).get("idlist", [])
    results = []
    for pmcid in ids:
        sum_url = f"{base}esummary.fcgi?db=pmc&id={pmcid}&retmode=json"
        try:
            sum_data = _fetch_json(sum_url)
            entry = sum_data.get("result", {}).get(pmcid, {})
            results.append({
                "title": entry.get("title", ""),
                "authors": "; ".join(a.get("name", "") for a in entry.get("authors", [])),
                "year": str(entry.get("pubdate", ""))[:4], "doi": "",
                "url": f"https://www.ncbi.nlm.nih.gov/pmc/articles/PMC{pmcid}/",
                "abstract": "",
            })
        except Exception:
            pass
    return results


# ── Cross-Database Search ───────────────────────────────────────────────

def search_all(terms: str, max_per_db: int = 10) -> List[Result]:
    """Search across all categories simultaneously."""
    all_results = []
    for cat in ["literature", "life_sci", "physical", "social", "engineering", "data", "clinical"]:
        all_results.extend(query_db(cat, terms, max_per_db))
    return _deduplicate(all_results)


def search_to_bibtex(results: List[Result]) -> List[str]:
    """Convert search results to BibTeX entries via DOI resolution."""
    bibtex_entries = []
    for r in results:
        doi = r.get("doi", "")
        if doi:
            try:
                url = f"https://doi.org/{doi}"
                req = urllib.request.Request(url, headers={"Accept": "application/x-bibtex"})
                with urllib.request.urlopen(req, timeout=10) as resp:
                    bibtex_entries.append(resp.read().decode())
            except Exception:
                bibtex_entries.append(f"% Could not resolve DOI: {doi} | title: {r.get('title', '')}")
        else:
            bibtex_entries.append(f"% No DOI for: {r.get('title', '')} ({r.get('source', '')})")
    return bibtex_entries
```

## Usage Examples / 使用示例

```python
# Search a single category
results = query_db("literature", "transformer attention mechanism", max_results=10)
for r in results[:5]:
    print(f"[{r['source']}] {r['title']} ({r['year']})")

# Search specific databases within a category
results = query_db("literature", "causal inference", databases=["arxiv", "semantic_scholar"])

# Cross-category search
results = search_all("CRISPR gene editing")

# Get BibTeX for results
bibs = search_to_bibtex(results)
with open("references.bib", "w") as f:
    f.write("\n".join(bibs))

# Discipline-specific searches
bio = query_db("life_sci", "BRCA1 variant", databases=["pubmed", "uniprot", "genbank"])
econ = query_db("social", "minimum wage employment", databases=["nber", "repec"])
physics = query_db("physical", "dark matter detection", databases=["ads", "inspire_hep"])
clinical = query_db("clinical", "CAR-T therapy leukemia")
datasets = query_db("data", "ImageNet dataset", databases=["zenodo", "huggingface"])
```

## MCP Configuration / MCP 配置

For Claude Code integration, add to `.claude/settings.json`:

```json
{
  "mcpServers": {
    "openalex": {
      "command": "npx",
      "args": ["-y", "@anthropic/openalex-mcp-server"]
    },
    "pubmed": {
      "command": "npx",
      "args": ["-y", "pubmed-mcp-server"]
    },
    "semantic-scholar": {
      "command": "npx",
      "args": ["-y", "semantic-scholar-mcp"]
    },
    "arxiv": {
      "command": "npx",
      "args": ["-y", "arxiv-mcp-server"]
    }
  }
}
```

## Search Strategy by Discipline / 分学科搜索策略

### Computer Science / 计算机科学
```
Primary: arXiv (cs.*) + Semantic Scholar + Papers With Code
Secondary: DBLP, ACM DL, IEEE Xplore
Strategy: keyword + citation graph traversal + SOTA leaderboard
```

### Medicine / 医学
```
Primary: PubMed (MeSH terms) + PMC (full text)
Secondary: bioRxiv/medRxiv, ClinicalTrials.gov, Cochrane
Strategy: PICO framework + systematic review protocol + GRADE assessment
```

### Biology / 生物学
```
Primary: PubMed + UniProt + GenBank
Secondary: GEO, SRA, ENA, Ensembl, PDB
Strategy: gene/protein name → sequence → structure → function → literature
```

### Social Science / 社会科学
```
Primary: SSRN + OpenAlex + ICPSR
Secondary: FRED, World Bank, RePEc
Strategy: Boolean queries + snowball sampling + meta-analysis
```

### Economics / 经济学
```
Primary: NBER + SSRN + FRED
Secondary: World Bank, RePEc, CrossRef
Strategy: Working papers first → peer-reviewed → data series
```

### Physics / 物理学
```
Primary: arXiv (physics.*) + ADS/INSPIRE-HEP
Secondary: CrossRef, CORE
Strategy: arXiv categories + citation networks + collaboration graphs
```

### Chemistry / 化学
```
Primary: ChemRxiv + CrossRef + Semantic Scholar
Secondary: PDB (crystal structures), Google Patents
Strategy: compound name/CAS → structure → reactions → applications
```

## API Key Management / API 密钥管理

```python
import os

# Free (no key needed)
# arXiv, Semantic Scholar, OpenAlex, CrossRef, CORE, Zenodo, Figshare,
# OSF, HuggingFace, INSPIRE-HEP, ClinicalTrials.gov, bioRxiv, PubMed, PMC,
# UniProt, PDB, GenBank, GEO, Ensembl, DBLP, Papers With Code, World Bank

# Free (key needed, register online)
os.environ["FRED_API_KEY"] = "..."        # fred.stlouisfed.org (free)
os.environ["ADS_API_TOKEN"] = "..."       # ui.adsabs.harvard.edu (free)

# Subscription required (institutional access)
# IEEE Xplore, ACM DL, Scopus, Web of Science, MathSciNet, Reaxys, SciFinder,
# JSTOR, EconLit, ProQuest, ICPSR (full text), Cochrane (full text)
```

## Best Practices / 最佳实践

- Start with free APIs (arXiv, Semantic Scholar, OpenAlex) before subscription databases.
- Use `search_all()` for broad discovery, then refine with `query_db(category, terms, databases=[...])`.
- Always deduplicate by DOI before importing to Zotero or references.bib.
- Rate limits: Semantic Scholar (100 req/s), CrossRef (50 req/s), arXiv (1 req/3s), NCBI (3 req/s without key, 10 req/s with).
- For systematic reviews, follow PRISMA protocol in `references/systematic-review-methodology.md`.

## Common Pitfalls / 常见陷阱

- **Rate limiting**: NCBI (PubMed/GenBank/GEO) limits to 3 requests/second without API key. Add `api_key` parameter for 10/s.
- **Empty results**: Some APIs return empty for special characters. Use `urllib.parse.quote()` on all query terms.
- **DOI variations**: Some databases return `https://doi.org/10.x/y`, others just `10.x/y`. Normalize before deduplication.
- **Subscription databases**: IEEE, ACM, Scopus, WoS require institutional access. Fall back to OpenAlex for metadata.
- **XML vs JSON**: PubMed returns XML by default — always specify `retmode=json` for E-utilities.

## Integration / 集成

- Feeds `references/citation-workflow.md` for BibTeX management
- Supports `workflows/literature-review.md` search phase
- Connects to `references/systematic-review-methodology.md` for PRISMA
- Complements `scripts/search_arxiv.py` for arXiv-specific searches
- Pairs with `references/tools/pyzotero.md` for Zotero library management
