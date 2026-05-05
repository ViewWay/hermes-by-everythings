---
name: protocolsio-integration
description: protocols.io integration — search, retrieve, and manage experimental protocols programmatically
domain: Research / Protocols
install: pip install protocolsio
---

# protocols.io Integration

protocols.io is an open-access repository for scientific methods and experimental protocols. Its API allows programmatic search, retrieval, version tracking, and step-by-step extraction of protocols across biology, chemistry, and other experimental sciences. This integration helps researchers discover, compare, and implement published protocols within automated workflows.

## When to Use

- Searching for published protocols by keyword, author, or DOI before starting an experiment
- Extracting detailed step-by-step instructions for automated protocol execution
- Tracking protocol versions and updates to ensure reproducibility
- Comparing multiple protocols for the same assay to select the best approach
- Building internal protocol databases by importing from protocols.io
- Citing protocols in publications using stable URIs

## Quick Start

```python
import requests

# protocols.io REST API v3
BASE_URL = "https://www.protocols.io/api/v3"

def search_protocols(query, limit=10):
    """Search for protocols by keyword."""
    params = {"query": query, "limit": limit}
    resp = requests.get(f"{BASE_URL}/protocols", params=params)
    resp.raise_for_status()
    return resp.json()["items"]

# Example: search for CRISPR protocols
results = search_protocols("CRISPR-Cas9 knockin")
for p in results:
    print(f"  [{p['uri']}] {p['title']} (v{p.get('version', '1')})")
```

## Core Capabilities

### 1. Protocol Search and Filtering

Search with structured filters for organism, category, journal source, and more.

```python
def advanced_search(query, organism=None, category=None, sort="relevance"):
    """Search protocols with advanced filters."""
    params = {
        "query": query,
        "sort": sort,
        "limit": 20
    }
    if organism:
        params["organism"] = organism
    if category:
        params["category"] = category
    resp = requests.get(f"{BASE_URL}/protocols", params=params)
    resp.raise_for_status()
    return resp.json()["items"]

# Search for mouse-related immunostaining protocols
results = advanced_search(
    "immunostaining",
    organism="Mus musculus",
    sort="newest"
)
for r in results:
    print(f"{r['title']} — {r.get('authors', ['Unknown'])[0]}")
```

### 2. Step Extraction and Protocol Details

Retrieve full protocol details including materials, reagents, and step-by-step instructions.

```python
def get_protocol_details(protocol_uri):
    """Get full protocol details including all steps."""
    # URI format: "doi:10.17504/protocols.io.xxx" or "protocols.io/xxx"
    resp = requests.get(f"{BASE_URL}/protocols/{protocol_uri}")
    resp.raise_for_status()
    protocol = resp.json()
    return protocol

def extract_steps(protocol_uri):
    """Extract ordered steps from a protocol."""
    protocol = get_protocol_details(protocol_uri)
    steps = []
    for section in protocol.get("sections", []):
        for step in section.get("steps", []):
            steps.append({
                "step_number": step.get("order", 0),
                "title": step.get("title", ""),
                "description": step.get("description", ""),
                "duration": step.get("duration", ""),
                "warnings": step.get("warnings", [])
            })
    return steps

# Print steps for a protocol
steps = extract_steps("protocols.io.example")
for s in steps:
    print(f"Step {s['step_number']}: {s['title']}")
    if s['duration']:
        print(f"  Duration: {s['duration']}")
```

### 3. Version Tracking and Comparison

Track protocol revisions and compare changes between versions for reproducibility audits.

```python
def get_protocol_versions(protocol_uri):
    """List all versions of a protocol."""
    resp = requests.get(f"{BASE_URL}/protocols/{protocol_uri}/versions")
    resp.raise_for_status()
    return resp.json()["items"]

def compare_versions(protocol_uri, version_a, version_b):
    """Compare two versions of a protocol and highlight differences."""
    versions = get_protocol_versions(protocol_uri)
    v_map = {v["version"]: v for v in versions}

    a = v_map.get(version_a, {})
    b = v_map.get(version_b, {})

    diff = {
        "version_a": version_a,
        "version_b": version_b,
        "steps_added": [],
        "steps_removed": [],
        "materials_changed": []
    }

    steps_a = {s["title"] for s in a.get("steps", [])}
    steps_b = {s["title"] for s in b.get("steps", [])}
    diff["steps_added"] = list(steps_b - steps_a)
    diff["steps_removed"] = list(steps_a - steps_b)

    return diff
```

## Common Academic Workflow

### Workflow: Protocol Discovery and Implementation

```python
def find_and_summarize_protocol(assay_name, organism=""):
    """Search for a protocol, extract steps, and generate a summary."""
    # Step 1: Search
    results = advanced_search(assay_name, organism=organism, sort="most_viewed")

    if not results:
        print(f"No protocols found for: {assay_name}")
        return None

    best = results[0]
    uri = best["uri"]
    print(f"Selected: {best['title']} ({uri})")

    # Step 2: Extract steps
    steps = extract_steps(uri)
    print(f"\nProtocol has {len(steps)} steps:\n")
    for s in steps:
        print(f"  {s['step_number']}. {s['title']}")
        if s['warnings']:
            print(f"     WARNING: {s['warnings']}")

    # Step 3: Generate citation
    citation = (
        f"{best.get('authors', ['Unknown'])[0]} et al. "
        f"\"{best['title']}\". protocols.io. {uri}"
    )
    print(f"\nCitation: {citation}")

    return {"protocol": best, "steps": steps, "citation": citation}

# Example usage
info = find_and_summarize_protocol("RNA extraction", "Homo sapiens")
```

## Best Practices

1. **Always verify protocols in your own lab** — published protocols may require optimization for your specific reagents, equipment, or sample types.
2. **Record protocol version in your ELN** — when implementing a protocol, note the exact version/URI for reproducibility.
3. **Compare multiple protocols** — for common assays (Western blot, RNA extraction), compare 3-5 protocols to identify the most suitable approach.
4. **Check for updates** — protocols are living documents. Before repeating an experiment, check if the protocol has been updated.
5. **Contribute back** — after optimizing a protocol, publish your modifications on protocols.io to help the community.

## Common Pitfalls

1. **URI format confusion**: protocols.io uses multiple URI formats (`doi:10.17504/protocols.io.xxx` and `protocols.io/xxx`). Normalize before API calls.
2. **Missing step details**: Some protocols have abbreviated steps without reagent volumes or incubation times. Always check the full protocol page.
3. **Private protocols**: API access to private protocols requires authentication. Anonymous access only covers public protocols.
4. **Rate limiting**: The public API has rate limits. Implement caching for repeated queries.

## Integration with HBE

- Use within `workflows/experiment-design.md` to discover protocols during the experiment planning phase.
- Pair with `references/tools/benchling-integration.md` to import protocol steps into Benchling ELN entries.
- Combine with `references/tools/scientific-writing.md` to properly cite protocols in the Methods section of papers.

## Resources

- protocols.io API Documentation: https://www.protocols.io/developers
- protocols.io Search: https://www.protocols.io/search
- protocols.io Blog (best practices): https://www.protocols.io/blog
- DOI registration info: https://www.protocols.io/about
