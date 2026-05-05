# Citation Management Workflow / 引文管理工作流

Complete citation lifecycle: search, fetch, validate, organize, cite, and verify.
完整引文生命周期：检索、获取、验证、组织、引用和校验。

## Citation Lifecycle / 引文生命周期

```
1. Search  检索  → Find candidate papers
2. Fetch   获取  → Get BibTeX entries
3. Validate 验证 → Check metadata correctness
4. Organize 组织 → Manage references.bib
5. Cite    引用  → Insert into LaTeX document
6. Verify  校验  → Final check before submission
```

---

## 1. Search / 检索

### Multi-Source Search

| Source | Method | Output |
|--------|--------|--------|
| arXiv | `scripts/search_arxiv.py` | BibTeX directly |
| Semantic Scholar | REST API | JSON → BibTeX |
| OpenAlex | REST API | JSON → BibTeX |
| PubMed | Entrez API | XML → BibTeX |
| DOI | doi.org resolution | BibTeX directly |
| Google Scholar | `scholarly` library | BibTeX via parser |

### arXiv Search

```bash
# Keyword search
python3 scripts/search_arxiv.py "transformer attention mechanism" --max 20 --bibtex

# Paper by arXiv ID
python3 scripts/search_arxiv.py --id 1706.03762 --bibtex

# Search with category filter
python3 scripts/search_arxiv.py "language model" --category cs.CL --max 10 --bibtex
```

### Semantic Scholar API

```bash
# Search papers
curl "https://api.semanticscholar.org/graph/v1/paper/search?query=attention+mechanism&limit=20&fields=title,authors,year,abstract,citationCount,externalIds"

# Get paper by DOI
curl "https://api.semanticscholar.org/graph/v1/paper/DOI:10.xxxx/yyyy?fields=title,authors,year,venue"

# Forward citations (who cited this paper)
curl "https://api.semanticscholar.org/graph/v1/paper/arxiv:1706.03762/citations?fields=title,year&limit=100"

# Backward citations (this paper's references)
curl "https://api.semanticscholar.org/graph/v1/paper/arxiv:1706.03762/references?fields=title,year&limit=100"
```

### DOI → BibTeX

```bash
# Direct DOI resolution to BibTeX
curl -L -H "Accept: application/x-bibtex" "https://doi.org/10.1234/example"
```

```python
# Python DOI→BibTeX
import urllib.request

def doi_to_bibtex(doi: str) -> str:
    url = f"https://doi.org/{doi}"
    req = urllib.request.Request(url, headers={"Accept": "application/x-bibtex"})
    with urllib.request.urlopen(req) as resp:
        return resp.read().decode()
```

---

## 2. Fetch / 获取

### BibTeX Entry Standards

```bibtex
@inproceedings{vaswani2017attention,
  author    = {Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N. and Kaiser, {\L}ukasz and Polosukhin, Illia},
  title     = {Attention Is All You Need},
  booktitle = {Advances in Neural Information Processing Systems},
  year      = {2017},
  volume    = {30},
  pages     = {5998--6008},
  doi       = {10.5555/3295222.3295349},
}
```

### Key Format Convention

```
firstauthorYYYYkeyword   → vaswani2017attention
firstauthorYYYYkeyword2  → smith2024causal (if multiple same author+year)
```

### Required Fields by Entry Type

| Type | Required Fields | Optional |
|------|----------------|----------|
| `@article` | author, title, journal, year, volume, pages | doi, url, abstract |
| `@inproceedings` | author, title, booktitle, year, pages | doi, url |
| `@misc` (preprint) | author, title, year, url, eprint, archiveprefix | primaryclass |
| `@phdthesis` | author, title, school, year | url |

### arXiv BibTeX Format

```bibtex
@misc{brown2020language,
  author    = {Brown, Tom and Mann, Benjamin and Ryder, Nick and others},
  title     = {Language Models are Few-Shot Learners},
  year      = {2020},
  eprint    = {2005.14165},
  archiveprefix = {arXiv},
  primaryclass  = {cs.CL},
  url       = {https://arxiv.org/abs/2005.14165},
}
```

---

## 3. Validate / 验证

### Five-Step Validation

| Step | Check | Method |
|------|-------|--------|
| 1. Existence | Does the paper exist? | Resolve DOI or search title |
| 2. Accuracy | Does it support the claim? | Read abstract/full text |
| 3. Metadata | Authors, year, venue correct? | Cross-check Semantic Scholar |
| 4. BibTeX validity | Compiles without errors? | Run `bibtex` or `biber` |
| 5. Consistency | Every `\cite{}` has `.bib` entry? | Check aux file for undefined |

### Common BibTeX Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Missing comma | Trailing comma omitted | Add comma after each field |
| Unmatched braces | `{` without `}` | Check special chars: `{\"o}`, `{\ss}` |
| Wrong field name | `journal` vs `booktitle` | Article→journal, InProceedings→booktitle |
| Unicode in author | `ö` unescaped | Use `{\"o}` or `{\"{o}}` |
| Missing year | No year field | Always include year |

---

## 4. Organize / 组织

### references.bib Management Rules

1. **One entry per paper** — no duplicates (check key before adding)
2. **Consistent key format** — `firstauthorYYYYkeyword`
3. **Sort alphabetically** by citation key
4. **Remove unused entries** before submission
5. **Version control** — track changes in git

### Duplicate Detection

```python
# Find duplicate entries
import re

def find_duplicates(bib_file):
    with open(bib_file) as f:
        content = f.read()
    
    # Extract titles
    titles = re.findall(r'title\s*=\s*\{([^}]+)\}', content, re.IGNORECASE)
    
    # Normalize and compare
    seen = {}
    for i, title in enumerate(titles):
        normalized = title.lower().strip()
        if normalized in seen:
            print(f"Duplicate: '{title}' (entries {seen[normalized]+1} and {i+1})")
        else:
            seen[normalized] = i
```

### Zotero Integration — Setup / Zotero 集成配置

```python
from pyzotero import zotero
import os

LIBRARY_ID = os.environ.get("ZOTERO_LIBRARY_ID", "123456")
API_KEY = os.environ.get("ZOTERO_API_KEY", "your_key_here")
zot = zotero.Zotero(LIBRARY_ID, "user", API_KEY)

# Verify connection
collections = zot.collections()
print(f"Connected: {len(collections)} collections found")
```

### Zotero Collection Management / 集合管理

```python
def create_project_collections(project_name: str):
    """Create a project-specific collection hierarchy in Zotero."""
    col = zot.create_collection({"name": project_name})
    parent_key = col["successful"]["0"]["key"]

    subcollections = ["01-to-read", "02-reading", "03-read", "04-cited", "05-rejected"]
    for sub in subcollections:
        zot.create_collection({"name": sub, "parentCollection": parent_key})
    print(f"Created project '{project_name}' with {len(subcollections)} sub-collections")
    return parent_key


def auto_tag_papers(collection_key: str):
    """Auto-tag papers based on year and venue."""
    items = zot.collection_items(collection_key)
    for item in items:
        tags = item["data"].get("tags", [])
        date = item["data"].get("date", "")
        if date:
            tags.append({"tag": f"year:{date[:4]}"})
        pub = item["data"].get("publicationTitle", "")
        if pub:
            tags.append({"tag": f"venue:{pub}"})
        item["data"]["tags"] = tags
        zot.update_item(item)


def move_to_collection(item_key: str, target_collection_key: str):
    """Move an item to a different collection (e.g., to-read -> read)."""
    item = zot.item(item_key)
    collections = item["data"].get("collections", [])
    if target_collection_key not in collections:
        collections.append(target_collection_key)
        item["data"]["collections"] = collections
        zot.update_item(item)
```

### Zotero -> BibTeX Pipeline / Zotero 到 BibTeX 流水线

```python
def export_collection_bibtex(collection_name: str, output_path: str = "references.bib"):
    """Export a Zotero collection to BibTeX file."""
    collections = zot.collections()
    col_key = next((c["key"] for c in collections if c["data"]["name"] == collection_name), None)
    if not col_key:
        raise ValueError(f"Collection '{collection_name}' not found")

    bibtex_str = zot.collection(col_key, format="bibtex")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(bibtex_str)
    print(f"Exported {len(bibtex_str.split('@'))-1} entries to {output_path}")


def sync_zotero_to_bib(collection_name: str, bib_path: str = "references.bib"):
    """Sync Zotero collection to BibTeX, adding new entries and removing stale ones."""
    import bibtexparser

    try:
        with open(bib_path) as f:
            existing_db = bibtexparser.load(f)
        existing_keys = {entry.get("ID") for entry in existing_db.entries}
    except FileNotFoundError:
        existing_keys = set()

    export_collection_bibtex(collection_name, bib_path)

    with open(bib_path) as f:
        new_db = bibtexparser.load(f)
    new_keys = {entry.get("ID") for entry in new_db.entries}

    added = new_keys - existing_keys
    removed = existing_keys - new_keys
    print(f"Synced: {len(added)} added, {len(removed)} removed, {len(new_keys)} total")
    return {"added": added, "removed": removed, "total": len(new_keys)}


def detect_zotero_duplicates(collection_key: str):
    """Find duplicate entries in a Zotero collection."""
    items = zot.collection_items(collection_key)
    titles = {}
    duplicates = []
    for item in items:
        title = item["data"].get("title", "").lower().strip()
        if title in titles:
            duplicates.append((titles[title], item["key"], title))
        else:
            titles[title] = item["key"]
    if duplicates:
        print(f"Found {len(duplicates)} duplicates:")
        for key1, key2, title in duplicates:
            print(f"  {key1} == {key2}: {title[:60]}")
    else:
        print("No duplicates found")
    return duplicates
```

### Zotero -> Literature Review / Zotero 到文献综述

```python
def extract_annotations(collection_name: str):
    """Extract reading annotations and notes from Zotero items."""
    col = zot.collections(q=collection_name)[0]
    items = zot.collection_items(col["key"])
    notes = []
    for item in items:
        if item["data"]["itemType"] == "note":
            import re
            html = item["data"]["note"]
            text = re.sub(r"<[^>]+>", "", html)
            text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
            notes.append({
                "parent": item["data"].get("parentItem", ""),
                "text": text.strip(),
            })
    return notes


def generate_reading_list(collection_name: str):
    """Generate a structured reading list from a Zotero collection."""
    col = zot.collections(q=collection_name)[0]
    items = zot.collection_items(col["key"], itemType="-note || attachment")
    lines = [f"# Reading List: {collection_name}\n"]
    for i, item in enumerate(items, 1):
        data = item["data"]
        title = data.get("title", "Untitled")
        authors = data.get("creators", [])
        author_str = ", ".join(
            f"{a.get('firstName', '')} {a.get('lastName', '')}".strip()
            for a in authors[:3]
        )
        if len(authors) > 3:
            author_str += " et al."
        year = data.get("date", "")[:4]
        lines.append(f"{i}. **{title}** -- {author_str} ({year})")
        abstract = data.get("abstractNote", "")
        if abstract:
            lines.append(f"   > {abstract[:200]}...")
    return "\n".join(lines)
```

### Zotero -> Rebuttal / Zotero 到审稿回复

```python
def search_for_reviewer_point(query: str, max_results: int = 10):
    """Search Zotero library for papers relevant to a reviewer's concern."""
    results = zot.items(q=query, limit=max_results)
    relevant = []
    for item in results:
        data = item["data"]
        if data.get("itemType") in ("note", "attachment"):
            continue
        relevant.append({
            "title": data.get("title", ""),
            "doi": data.get("DOI", ""),
            "year": data.get("date", "")[:4],
            "authors": ", ".join(a.get("lastName", "") for a in data.get("creators", [])[:2]),
            "abstract": data.get("abstractNote", "")[:300],
        })
    return relevant


def draft_rebuttal_citations(reviewer_concern: str, zotero_results: list):
    """Draft a rebuttal paragraph with Zotero-sourced citations."""
    if not zotero_results:
        return f"We thank the reviewer for raising this point regarding {reviewer_concern.lower()}."

    top = zotero_results[0]
    refs = "; ".join(f"{r['authors']} ({r['year']})" for r in zotero_results[:3])
    paragraph = (
        f"We appreciate the reviewer's insight regarding {reviewer_concern.lower()}. "
        f"Prior work has explored this direction: {refs}. "
    )
    if top["abstract"]:
        paragraph += f"In particular, {top['authors']} {top['year']} show that "
        paragraph += top["abstract"][:150].lower().rstrip(".") + ". "
    paragraph += "We have added these references and expanded our discussion accordingly."
    return paragraph
```

---

## 5. Cite / 引用

### natbib Commands

```latex
\usepackage{natbib}
\bibliographystyle{plainnat}

\citet{key}      % Smith et al. (2024)  — textual
\citep{key}      % (Smith et al., 2024) — parenthetical
\citealt{key}    % Smith et al. 2024    — no parentheses
\citeauthor{key} % Smith et al.         — author only
\citeyear{key}   % 2024                 — year only
\citep[A1]{key}  % (see A1: Smith et al., 2024) — with note

% Multiple citations
\citep{key1,key2,key3}  % (Smith, 2024; Jones, 2023; Lee, 2022)

\bibliography{references}  % at end of document
```

### biblatex Commands

```latex
\usepackage[backend=biber, style=numeric]{biblatex}
\addbibresource{references.bib}

\textcite{key}   % Smith et al. [1]
\parencite{key}  % [1]
\footcite{key}   % footnote citation
\autocite{key}   % context-sensitive

% Multiple citations sorted
\cite{key1,key2,key3}  % [1–3]

\printbibliography  % at end of document
```

### Citation Placement Rules

| Situation | Placement | Example |
|-----------|-----------|---------|
| Claim with one source | End of claim | "Transformers use self-attention (Vaswani et al., 2017)." |
| Claim with multiple sources | End of claim | "... (Smith, 2024; Jones, 2023)." |
| Method attribution | As subject | "Smith et al. (2024) proposed..." |
| Comparison | Inline | "Unlike [X], our method..." |
| Broad statement | End | "Deep learning has achieved..." (several citations) |

---

## 6. Verify / 校验

### Pre-Submission Citation Check

```bash
# Check for undefined citations
pdflatex -interaction=nonstopmode main.tex 2>&1 | grep "undefined"

# Check for unused bibliography entries
# (entries in .bib but not cited in .tex)
bibtex main 2>&1 | grep "Warning--"

# Verify all DOIs resolve
python3 -c "
import urllib.request, sys
for doi in open('dois.txt'):
    doi = doi.strip()
    try:
        urllib.request.urlopen(f'https://doi.org/{doi}', timeout=5)
        print(f'OK: {doi}')
    except:
        print(f'FAIL: {doi}')
"
```

### Citation Consistency Checklist

- [ ] Every `\cite{key}` has a matching entry in `references.bib`
- [ ] Every entry in `references.bib` is cited at least once
- [ ] No duplicate entries (same paper, different keys)
- [ ] All required fields present for every entry type
- [ ] DOIs resolve correctly
- [ ] Author names consistently formatted across entries
- [ ] Citation style matches venue requirement (natbib/biblatex)
- [ ] No "et al." truncation issues (use `and others` in BibTeX)

---

## Recommended Tools / 推荐工具

See `references/tool-registry.md`.

| Task | Tool | Install |
|------|------|---------|
| BibTeX manipulation | bibtexparser | `pip install bibtexparser` |
| Citation processing | citeproc-py | `pip install citeproc-py` |
| Zotero integration | pyzotero | `pip install pyzotero` |
| DOI resolution | requests | `pip install requests` |
| arXiv search | scripts/search_arxiv.py | included |

## Integration / 集成

- Supports `workflows/literature-review.md` (search and organize phases)
- Feeds `references/research-integrity-guide.md` (citation verification)
- Connects to `references/scientific-databases-guide.md` (database search)
- Works with `references/systematic-review-methodology.md` (PRISMA search)
