---
name: pyzotero
description: Python client for Zotero API — programmatic access to Zotero reference libraries for citation management and literature review automation
domain: Research Workflow
install: pip install pyzotero
---

# pyzotero — Python Zotero API Client / Zotero Python 客户端

Programmatic access to Zotero libraries for automated literature review, bibliography export, and citation management in academic research workflows.

## When to Use / 适用场景

- Automating literature searches by querying Zotero collections and tags (通过查询 Zotero 集合和标签自动检索文献)
- Building reproducible bibliography pipelines for LaTeX papers (为 LaTeX 论文构建可复现的参考文献管线)
- Batch-exporting references in BibTeX, RIS, or CSL-JSON format (批量导出 BibTeX、RIS 或 CSL-JSON 格式参考文献)
- Synchronizing Zotero libraries with Jupyter notebooks or analysis scripts (将 Zotero 文献库与 Jupyter 笔记本或分析脚本同步)
- Deduplicating entries across multiple Zotero collections (跨多个 Zotero 集合去重文献条目)

## Quick Start / 快速开始

```python
from pyzotero import zotero

# Connect to your Zotero library (get API key from zotero.org/settings/keys)
zot = zotero.Zotero(
    library_id="12345678",
    library_type="user",       # or "group" for group libraries
    api_key="your_api_key_here"
)

# Search items by keyword
items = zot.items(q="machine learning", limit=25)
for item in items:
    print(f"[{item['data']['itemType']}] {item['data'].get('title', 'N/A')}")

# Export a collection as BibTeX
bib_items = zot.items(collection_id="ABCD1234", format="bibtex")
with open("references.bib", "w") as f:
    f.write(bib_items)
```

## Core Capabilities / 核心能力

### 1. CRUD Operations and Collection Management / 增删改查与集合管理

pyzotero provides full create, read, update, and delete access to Zotero items, collections, and tags.

```python
from pyzotero import zotero

zot = zotero.Zotero(library_id="12345678", library_type="user", api_key="key")

# List all top-level collections
collections = zot.collections()
for c in collections:
    print(f"  {c['data']['key']}: {c['data']['name']} ({c['meta']['numItems']} items)")

# Create a new collection for a research project
new_col = zot.create_collection([{"name": "Systematic Review 2026"}])
col_key = new_col["successful"][0]["key"]

# Create a new journal article item using a template
template = zot.item_template("journalArticle")
template["title"] = "Attention Is All You Need"
template["publicationTitle"] = "NeurIPS"
template["volume"] = "30"
template["creators"] = [{"creatorType": "author", "firstName": "Ashish", "lastName": "Vaswani"}]
zot.create_items([template])

# Update an existing item
item = zot.item("ITEM_KEY")
item["data"]["title"] = "Corrected Title"
zot.update_item(item)

# Delete an item (moves to trash by default)
zot.delete_item(item)
```

### 2. Advanced Search and Tag Filtering / 高级搜索与标签过滤

Zotero supports complex queries with boolean operators, tag-based filtering, and saved searches.

```python
# Search with tag filtering — find all items tagged "to-read" in a collection
items = zot.items(collection_id="ABCD1234", tag="to-read", limit=50)

# Search with multiple tags (AND logic within a single tag parameter)
items = zot.items(collection_id="ABCD1234", tag=["systematic-review", "included"])

# Use Zotero's advanced search syntax
items = zot.items(
    q="deep learning",
    qmode="titleCreatorYear",   # search title, creator, and year fields
    sort="dateAdded",           # sort by date added
    direction="desc"            # newest first
)

# Iterate through all items in a library (handles pagination automatically)
all_items = zot.everything(zot.items(limit=100))
print(f"Total items in library: {len(all_items)}")

# Get all tags used in a collection
tags = zot.collection_tags("ABCD1234")
print("Tags:", [t["tag"] for t in tags])
```

### 3. Bibliography Export in Multiple Formats / 多格式参考文献导出

pyzotero supports export in all Zotero-compatible formats, enabling seamless integration with LaTeX, Word, and other writing tools.

```python
# Export as BibTeX (for LaTeX)
bibtex = zot.items(collection_id="ABCD1234", format="bibtex")
with open("paper_refs.bib", "w") as f:
    f.write(bibtex)

# Export as CSL-JSON (for pandoc, citation-js, or custom processing)
import json
csl_items = zot.items(collection_id="ABCD1234", format="csljson")
csl_data = json.loads(csl_items)
with open("references.csl.json", "w") as f:
    json.dump(csl_data, f, indent=2)

# Export as RIS (for EndNote, Mendeley import)
ris = zot.items(collection_id="ABCD1234", format="ris")
with open("references.ris", "w") as f:
    f.write(ris)

# Export single item
item = zot.item("ITEM_KEY", format="bibtex")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Automated Literature Review and Deduplication / 自动文献综述与去重

```python
from pyzotero import zotero
import json

zot = zotero.Zotero(library_id="12345678", library_type="user", api_key="key")

# Step 1: Fetch papers from multiple collections
collections = ["COL_A", "COL_B", "COL_C"]
all_items = []
seen_dois = set()

for col_id in collections:
    items = zot.everything(zot.items(collection_id=col_id, limit=100))
    for item in items:
        doi = item["data"].get("DOI", "").lower().strip()
        if doi and doi not in seen_dois:
            seen_dois.add(doi)
            all_items.append(item)

# Step 2: Deduplicate by DOI
print(f"Total items across collections: {len(all_items)}")
print(f"Unique DOIs: {len(seen_dois)}")

# Step 3: Create a new collection with deduplicated items
dedup_col = zot.create_collection([{"name": "Deduplicated Review Set"}])
dedup_key = dedup_col["successful"][0]["key"]

# Step 4: Tag all deduplicated items for tracking
for item in all_items:
    existing_tags = [t["tag"] for t in item["data"].get("tags", [])]
    if "review-2026" not in existing_tags:
        existing_tags.append({"tag": "review-2026"})
        item["data"]["tags"] = existing_tags
        zot.update_item(item)

# Step 5: Export final bibliography
bibtex = zot.items(collection_id=dedup_key, format="bibtex")
with open("systematic_review.bib", "w") as f:
    f.write(bibtex)
print("Exported deduplicated bibliography to systematic_review.bib")
```

## Best Practices / 最佳实践

- **Store API keys in environment variables, never in code**: Use `os.environ["ZOTERO_API_KEY"]` and keep keys out of version control. For shared projects, use `.env` files with `.gitignore` entries.
- **Handle rate limiting gracefully**: The Zotero API allows unauthenticated requests at a lower rate. With an API key, you get higher limits, but still add `time.sleep(0.1)` between batch operations to avoid 429 errors.
- **Use `everything()` for large collections**: The `zot.items()` method returns paginated results (default 25 per page). Always use `zot.everything(zot.items(...))` to retrieve all results across pages.
- **Version-control your BibTeX exports**: Commit generated `.bib` files to your paper's Git repository so collaborators can reproduce the exact reference set used in each submission.
- **Tag systematically for reproducibility**: Establish a tagging convention (e.g., `review-2026`, `included`, `excluded-reason`) so that literature review decisions are auditable.

## Common Pitfalls / 常见陷阱

- **Zotero API key permissions scope to library type**: A key generated for a "user" library cannot access "group" libraries and vice versa. Generate separate keys if you work across both.
- **BibTeX export includes ALL items in the result set**: If you use `zot.items(format="bibtex")` without a `collection_id`, the entire library is exported. Always filter by collection or search first.
- **`create_items` returns a dict, not the created item**: Access the created item's key via `response["successful"][0]["key"]`. The response structure differs from `item()` responses.
- **Child attachments and notes are separate API calls**: Creating a parent item does not automatically create child notes or PDF attachments. You must create children separately using the parent's key.
- **DOI format inconsistency**: Zotero stores DOIs in various formats (`10.1234/x`, `https://doi.org/10.1234/x`). Always normalize with `.strip().lower()` before deduplication.

## Integration with HBE / 与 HBE 集成

- Use with `workflows/paper-writing.md` to auto-populate BibTeX files before LaTeX compilation
- Pair with `references/writing-guide.md` for citation style consistency checks
- Combine with `references/tools/latex-environment.md` to build a fully automated write-compile-cite pipeline

## Resources / 资源

- Documentation: https://pyzotero.readthedocs.io/
- PyPI: https://pypi.org/project/pyzotero/
- Zotero API docs: https://www.zotero.org/support/dev/web_api/v3/start
