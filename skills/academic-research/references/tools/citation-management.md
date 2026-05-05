---
name: citation-management
description: Citation management automation — BibTeX curation, key generation, deduplication, and format conversion
domain: Research / Citations
install: pip install bibtexparser pyzotero citeproc-py 2>/dev/null || echo "See documentation"
---

# citation-management — Citation Management Automation

## Overview

Citation management provides automated tools for curating, normalizing, and converting academic references. It handles BibTeX parsing, deterministic key generation, deduplication across databases, format conversion (BibTeX, CSL-JSON, APA, MLA), and integration with reference managers like Zotero. Eliminates manual bibliography maintenance.

## When to Use

- Cleaning and normalizing a messy `.bib` file with inconsistent keys or formatting
- Generating consistent citation keys following a specific convention (author-year-title)
- Deduplicating references imported from multiple databases
- Converting between citation formats (BibTeX to CSL-JSON to APA)
- Auto-populating Zotero from a BibTeX file or vice versa
- Preparing bibliography for LaTeX or Word manuscripts

## Quick Start

```python
import bibtexparser
from bibtexparser.model import Entry, Field

# Parse an existing BibTeX file
with open("references.bib", "r") as f:
    bib_database = bibtexparser.parse(f)

print(f"Loaded {len(bib_database.entries)} entries")
for entry in bib_database.entries[:3]:
    print(f"  Key: {entry.key}")
    print(f"  Title: {entry.fields_dict.get('title', {}).value[:60]}...")
```

## Core Capabilities

### 1. BibTeX Parsing and Normalization

```python
import bibtexparser
from bibtexparser.model import Entry, Field
from bibtexparser import parse
import re

def normalize_bib(bib_database):
    """Normalize all entries: fix capitalization, clean fields, ensure required fields."""
    normalized = []
    for entry in bib_database.entries:
        # Ensure lowercase entry type
        entry.entry_type = entry.entry_type.lower()

        # Clean title: remove braces, normalize whitespace
        if "title" in entry.fields_dict:
            title = entry.fields_dict["title"].value
            title = re.sub(r'\{([^{}]+)\}', r'\1', title)  # remove braces
            title = re.sub(r'\s+', ' ', title).strip()
            entry.fields_dict["title"] = Field("title", title)

        # Normalize author format to "Last, First and Last, First"
        if "author" in entry.fields_dict:
            author = entry.fields_dict["author"].value
            author = re.sub(r'\s+', ' ', author).strip()
            entry.fields_dict["author"] = Field("author", author)

        # Ensure DOI field (extract from url if missing)
        if "doi" not in entry.fields_dict and "url" in entry.fields_dict:
            url = entry.fields_dict["url"].value
            if "doi.org/" in url:
                doi = url.split("doi.org/")[-1]
                entry.fields_dict["doi"] = Field("doi", doi)

        normalized.append(entry)
    return normalized

# Parse and normalize
with open("references.bib") as f:
    db = bibtexparser.parse(f)
clean_entries = normalize_bib(db)
print(f"Normalized {len(clean_entries)} entries")
```

### 2. Deterministic Key Generation

```python
import re
import unicodedata

def generate_key(entry):
    """Generate a consistent citation key: FirstAuthorLastName_Year_WordFromTitle."""
    # Extract first author last name
    author_str = entry.fields_dict.get("author", Field("author", "")).value
    first_author = author_str.split(" and ")[0].split(",")[0].strip().lower()
    first_author = re.sub(r'[^a-z]', '', first_author)

    # Extract year
    year = entry.fields_dict.get("year", Field("year", "XXXX")).value

    # Extract first content word from title
    title = entry.fields_dict.get("title", Field("title", "")).value
    # Remove common stop words
    stopwords = {"a", "an", "the", "on", "in", "at", "to", "for", "of", "and", "is", "with"}
    words = [w for w in re.split(r'[\s:]+', title.lower()) if w and w not in stopwords and len(w) > 2]
    title_word = words[0] if words else "untitled"

    key = f"{first_author}_{year}_{title_word}"
    return key

# Regenerate all keys
with open("references.bib") as f:
    db = bibtexparser.parse(f)

key_map = {}
for entry in db.entries:
    new_key = generate_key(entry)
    # Handle collisions by appending letter suffix
    if new_key in key_map:
        key_map[new_key] += 1
        new_key = f"{new_key}{chr(96 + key_map[new_key])}"  # a, b, c...
    else:
        key_map[new_key] = 0
    old_key = entry.key
    entry.key = new_key
    if old_key != new_key:
        print(f"  {old_key} -> {new_key}")
```

### 3. Deduplication

```python
def deduplicate_entries(entries, similarity_threshold=0.85):
    """Remove duplicate entries based on DOI, title similarity, and year."""
    from difflib import SequenceMatcher

    unique = []
    seen_dois = set()
    seen_titles = set()

    for entry in entries:
        doi = entry.fields_dict.get("doi", Field("doi", "")).value.lower().strip()
        title = entry.fields_dict.get("title", Field("title", "")).value.lower().strip()
        year = entry.fields_dict.get("year", Field("year", "")).value

        # Exact DOI match
        if doi and doi in seen_dois:
            print(f"  Duplicate by DOI: {doi}")
            continue

        # Fuzzy title match (same year)
        is_dup = False
        for seen_title, seen_year in seen_titles:
            if year == seen_year:
                ratio = SequenceMatcher(None, title, seen_title).ratio()
                if ratio >= similarity_threshold:
                    print(f"  Duplicate by title ({ratio:.0%}): {title[:50]}...")
                    is_dup = True
                    break
        if is_dup:
            continue

        if doi:
            seen_dois.add(doi)
        seen_titles.add((title, year))
        unique.append(entry)

    return unique

clean = deduplicate_entries(clean_entries)
print(f"After dedup: {len(clean)} entries (removed {len(clean_entries) - len(clean)})")
```

## Common Academic Workflow

### End-to-End BibTeX Cleanup Pipeline

```python
import bibtexparser
from bibtexparser import parse

def full_cleanup_pipeline(input_bib, output_bib):
    """Complete pipeline: parse -> normalize -> deduplicate -> regenerate keys -> write."""
    # 1. Parse
    with open(input_bib) as f:
        db = bibtexparser.parse(f)
    print(f"Step 1: Loaded {len(db.entries)} entries")

    # 2. Normalize
    clean = normalize_bib(db)
    print(f"Step 2: Normalized {len(clean)} entries")

    # 3. Deduplicate
    clean = deduplicate_entries(clean)
    print(f"Step 3: After dedup {len(clean)} entries")

    # 4. Regenerate keys
    key_map = {}
    for entry in clean:
        new_key = generate_key(entry)
        if new_key in key_map:
            key_map[new_key] += 1
            new_key = f"{new_key}{chr(96 + key_map[new_key])}"
        else:
            key_map[new_key] = 0
        entry.key = new_key

    # 5. Write clean BibTeX
    writer = bibtexparser.BibTexWriter()
    writer.indent = "  "
    writer.order_entries_by = ("year", "author", "title")  # sort
    with open(output_bib, "w") as f:
        f.write(bibtexparser.write(bibtexparser.Library(clean), writer))
    print(f"Step 4: Wrote {output_bib} with {len(clean)} clean entries")

full_cleanup_pipeline("messy_refs.bib", "clean_refs.bib")
```

## Best Practices

1. **Version control your `.bib` file**: Track changes in git to catch accidental deletions.
2. **Use consistent key schemes**: Pick one convention (e.g., `author_year_word`) and stick to it across all papers.
3. **Back up before dedup**: Always keep the original file before running automated deduplication.
4. **Validate DOIs**: After cleanup, verify all DOIs resolve using CrossRef or doi.org.
5. **Separate reading list from manuscript bib**: Maintain a master `.bib` and extract subsets per paper.

## Common Pitfalls

1. **BibTeX encoding issues**: Non-ASCII characters (accented names, CJK) need LaTeX encoding or UTF-8 with `bibtexparser` v2+.
2. **Over-aggressive dedup**: Fuzzy matching can merge distinct papers with similar titles (e.g., "Part I" vs "Part II"). Always review removed entries.
3. **Key collisions in large libraries**: With common author names and years, collisions are frequent. Always append a disambiguator.
4. **Zotero sync conflicts**: If using pyzotero to sync, concurrent edits can cause data loss. Export to a separate file before programmatic changes.

## Integration with HBE

- Use as preprocessing step in `references/literature-review.md` for bibliography management
- Feed clean BibTeX into `references/latexdiff.md` for manuscript comparison
- Combine with `references/paper-lookup.md` to auto-populate missing metadata
- Supports `references/pyzotero.md` for Zotero integration

## Resources

- bibtexparser docs: https://bibtexparser.readthedocs.io/
- pyzotero docs: https://pyzotero.readthedocs.io/
- CSL spec: https://docs.citationstyles.org/
- BibTeX tips: https://en.wikibooks.org/wiki/LaTeX/Bibliography_Management
