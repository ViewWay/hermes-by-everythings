---
name: benchling-integration
description: Benchling API integration — programmatic access to electronic lab notebooks, registry, and inventory management
domain: Biology / ELN
install: pip install benchling
---

# Benchling Integration

Benchling is a cloud-based Electronic Lab Notebook (ELN) and Laboratory Information Management System (LIMS) used across biotech, pharma, and academic biology labs. Its REST API enables programmatic creation, retrieval, and management of notebook entries, sequences, registry items, and inventory.

## When to Use

- Automating repetitive ELN data entry or retrieval tasks
- Syncing experimental results from instruments directly into notebook entries
- Building custom dashboards that pull data from Benchling notebooks
- Managing molecular biology registries (plasmids, cell lines, strains) at scale
- Integrating Benchling with bioinformatics pipelines (e.g., sequence analysis results back into ELN)
- Batch-creating entries from high-throughput experiments

## Quick Start

```python
import requests
import json

# Authentication — use an API key from Benchling Admin > Settings > API Keys
API_KEY = "your-benchling-api-key"
BASE_URL = "https://your-tenant.benchling.com/api/v2"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# List notebooks
def list_notebooks(folder_id=None, limit=50):
    params = {"limit": limit}
    if folder_id:
        params["folderId"] = folder_id
    resp = requests.get(f"{BASE_URL}/notebooks", headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()["notebooks"]

# Create a notebook entry
def create_entry(notebook_id, title, body_html="<p>Experiment notes here.</p>"):
    payload = {
        "name": title,
        "notebook": notebook_id,
        "fields": {
            "body": {"content": body_html, "type": "rich_text"}
        }
    }
    resp = requests.post(f"{BASE_URL}/entries", headers=HEADERS, json=payload)
    resp.raise_for_status()
    return resp.json()
```

## Core Capabilities

### 1. API Authentication and Session Management

Benchling uses bearer token authentication. Keys are scoped per user and per permission set. Always store keys in environment variables, never in source code.

```python
import os

API_KEY = os.environ["BENCHLING_API_KEY"]

# Verify authentication by fetching current user
resp = requests.get(
    f"{BASE_URL}/users/me",
    headers={"Authorization": f"Bearer {API_KEY}"}
)
print(f"Authenticated as: {resp.json()['name']}")
```

### 2. Entry Creation and Update

Create entries with rich text bodies, attach files, and link results to specific experiments.

```python
def create_experiment_entry(notebook_id, title, protocol_id, results_summary):
    """Create an entry linked to a protocol and with results."""
    payload = {
        "name": title,
        "notebook": notebook_id,
        "fields": {
            "body": {
                "content": f"<h3>Protocol</h3><p>Linked to protocol {protocol_id}</p>"
                           f"<h3>Results</h3><p>{results_summary}</p>",
                "type": "rich_text"
            }
        }
    }
    resp = requests.post(f"{BASE_URL}/entries", headers=HEADERS, json=payload)
    return resp.json()
```

### 3. Registry and Inventory Management

Manage DNA sequences, plasmids, and other registered entities programmatically.

```python
def list_registry_schemas():
    """List all registry schemas (e.g., Plasmid, Cell Line)."""
    resp = requests.get(f"{BASE_URL}/registry-schemas", headers=HEADERS)
    return resp.json()["registrySchemas"]

def search_registry_entities(schema_id, query=""):
    """Search for entities within a specific registry schema."""
    params = {"schemaId": schema_id, "query": query}
    resp = requests.get(f"{BASE_URL}/entities", headers=HEADERS, params=params)
    return resp.json()["entities"]
```

## Common Academic Workflow

### Workflow: Bulk Upload Experiment Results to ELN

```python
import csv

def bulk_upload_results(notebook_id, results_csv):
    """Read a CSV of experiment results and create one entry per row."""
    with open(results_csv, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            body = (
                f"<h3>Experiment: {row['experiment_id']}</h3>"
                f"<table><tr><th>Parameter</th><th>Value</th></tr>"
                f"<tr><td>Sample</td><td>{row['sample']}</td></tr>"
                f"<tr><td>Condition</td><td>{row['condition']}</td></tr>"
                f"<tr><td>Result</td><td>{row['result']}</td></tr>"
                f"</table>"
            )
            entry = create_entry(notebook_id, f"{row['experiment_id']} - {row['sample']}", body)
            print(f"Created entry: {entry['id']}")
```

## Best Practices

1. **Use environment variables for API keys** — never hardcode credentials; use `.env` files with `python-dotenv`.
2. **Respect rate limits** — Benchling enforces rate limits (typically 100 requests/minute); implement exponential backoff with `tenacity` or `backoff`.
3. **Use folders for organization** — group entries by project or experiment series using folder IDs.
4. **Version your integration scripts** — track API scripts in git alongside your analysis code.
5. **Validate HTML content** — ensure rich text bodies are well-formed HTML before submitting.

## Common Pitfalls

1. **Incorrect tenant URL**: The base URL must match your Benchling tenant (e.g., `acme.benchling.com`). Using the wrong tenant silently returns 404s.
2. **Insufficient API key permissions**: Keys inherit the user's permissions. Ensure the key owner has write access to the target notebooks.
3. **Rate limiting**: Burst uploads without backoff will trigger 429 errors. Use `time.sleep()` between requests for bulk operations.
4. **HTML encoding in entry bodies**: Special characters (`<`, `>`, `&`) must be properly escaped in rich text fields.

## Integration with HBE

- Use within `workflows/experiment-design.md` for automated ELN population after experiment planning.
- Pair with `references/tools/biopython.md` to push sequence analysis results into Benchling registry.
- Combine with `references/tools/pandas.md` to transform DataFrames into structured HTML tables for entry bodies.

## Resources

- Benchling API Reference: https://docs.benchling.com/docs/api-v2-reference
- Benchling Developer Portal: https://docs.benchling.com/docs/introduction
- Authentication Guide: https://docs.benchling.com/docs/authentication
- Python SDK (community): https://pypi.org/project/benchling/
