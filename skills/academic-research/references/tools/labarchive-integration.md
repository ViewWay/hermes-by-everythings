---
name: labarchive-integration
description: LabArchives integration — programmatic access to digital lab notebooks, entry management, and search
domain: Research / ELN
install: pip install labarchives
---

# LabArchives Integration

LabArchives is a widely-used digital Electronic Lab Notebook (ELN) platform in academic and industry research. Its REST API provides programmatic access to notebooks, entries, attachments, and search functionality, enabling automation of data logging, cross-platform synchronization, and integration with computational analysis pipelines.

## When to Use

- Automating the creation of notebook entries from instrument outputs or analysis scripts
- Building bridges between computational pipelines and lab record-keeping
- Searching across multiple notebooks for specific experimental data or protocols
- Migrating data from legacy systems into LabArchives
- Creating reproducible records where every computational step is logged
- Extracting structured data from notebooks for meta-analysis or reporting

## Quick Start

```python
import requests
import os

# Authentication — obtain credentials from LabArchives account settings
BASE_URL = "https://mynotebook.labarchives.com/api"
API_KEY = os.environ["LABARCHIVES_API_KEY"]
SESSION_ID = os.environ["LABARCHIVES_SESSION_ID"]

HEADERS = {
    "Content-Type": "application/json",
    "Cookie": f"labarchives_session={SESSION_ID}"
}

# List all notebooks the user has access to
def list_notebooks():
    resp = requests.get(
        f"{BASE_URL}/notebooks",
        headers=HEADERS
    )
    resp.raise_for_status()
    return resp.json()

notebooks = list_notebooks()
for nb in notebooks:
    print(f"  [{nb['id']}] {nb['name']}")
```

## Core Capabilities

### 1. Notebook Entry CRUD Operations

Create, read, update, and delete entries within specific notebooks and folders.

```python
def create_entry(notebook_id, folder_id, title, content, entry_type="rich_text"):
    """Create a new entry in a LabArchives notebook folder."""
    payload = {
        "notebookId": notebook_id,
        "folderId": folder_id,
        "name": title,
        "content": content,
        "type": entry_type
    }
    resp = requests.post(
        f"{BASE_URL}/entries",
        headers=HEADERS,
        json=payload
    )
    resp.raise_for_status()
    return resp.json()

def update_entry(entry_id, new_content):
    """Update the content of an existing entry."""
    resp = requests.put(
        f"{BASE_URL}/entries/{entry_id}",
        headers=HEADERS,
        json={"content": new_content}
    )
    resp.raise_for_status()
    return resp.json()

def delete_entry(entry_id):
    """Delete an entry (moves to trash by default)."""
    resp = requests.delete(
        f"{BASE_URL}/entries/{entry_id}",
        headers=HEADERS
    )
    resp.raise_for_status()
    return resp.json()
```

### 2. Attachment Management

Upload files as attachments to entries — images, data files, PDFs, or any supplementary material.

```python
import base64

def attach_file(entry_id, file_path):
    """Attach a local file to a LabArchives entry."""
    with open(file_path, "rb") as f:
        file_data = base64.b64encode(f.read()).decode("utf-8")

    import os
    filename = os.path.basename(file_path)
    payload = {
        "entryId": entry_id,
        "fileName": filename,
        "fileData": file_data,
        "mimeType": "application/octet-stream"
    }
    resp = requests.post(
        f"{BASE_URL}/entries/{entry_id}/attachments",
        headers=HEADERS,
        json=payload
    )
    resp.raise_for_status()
    return resp.json()

def list_attachments(entry_id):
    """List all attachments for a given entry."""
    resp = requests.get(
        f"{BASE_URL}/entries/{entry_id}/attachments",
        headers=HEADERS
    )
    return resp.json()
```

### 3. Search and Query

Search across notebooks for entries containing specific keywords, dates, or tags.

```python
def search_notebooks(query, notebook_id=None, max_results=50):
    """Search for entries matching a query string."""
    params = {"query": query, "maxResults": max_results}
    if notebook_id:
        params["notebookId"] = notebook_id
    resp = requests.get(
        f"{BASE_URL}/search",
        headers=HEADERS,
        params=params
    )
    resp.raise_for_status()
    return resp.json()["results"]

# Example: find all entries mentioning "Western blot"
results = search_notebooks("Western blot")
for r in results:
    print(f"  Entry '{r['title']}' in notebook {r['notebookName']} (id: {r['id']})")
```

## Common Academic Workflow

### Workflow: Automated Experiment Logging

```python
import json
from datetime import datetime

def log_experiment(notebook_id, folder_id, experiment_data):
    """Log a completed experiment to LabArchives with structured data."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Build rich content with experiment metadata
    content = (
        f"<h2>Experiment: {experiment_data['name']}</h2>"
        f"<p><strong>Date:</strong> {timestamp}</p>"
        f"<p><strong>Operator:</strong> {experiment_data['operator']}</p>"
        f"<h3>Parameters</h3>"
        f"<table border='1' cellpadding='5'>"
    )
    for key, val in experiment_data["parameters"].items():
        content += f"<tr><td>{key}</td><td>{val}</td></tr>"
    content += "</table>"

    content += f"<h3>Results</h3><p>{experiment_data['summary']}</p>"

    # Create the entry
    entry = create_entry(notebook_id, folder_id,
                         f"{experiment_data['name']} - {timestamp}", content)
    print(f"Logged entry: {entry['id']}")

    # Attach raw data file if present
    if "data_file" in experiment_data:
        attach_file(entry["id"], experiment_data["data_file"])
        print(f"Attached: {experiment_data['data_file']}")

    return entry

# Usage
log_experiment("nb-12345", "folder-67", {
    "name": "Western Blot - p53 Expression",
    "operator": "Jane Doe",
    "parameters": {"Antibody": "anti-p53 (DO-1)", "Lysate": "HCT116", "Exposure": "30s"},
    "summary": "Strong band at 53 kDa, consistent with p53 overexpression.",
    "data_file": "results/wb_p53_raw.tif"
})
```

## Best Practices

1. **Use consistent folder hierarchies** — organize notebooks into folders by project, date, or experiment type for reliable programmatic access.
2. **Timestamp all entries** — include machine-readable timestamps in entry titles or content for chronological sorting.
3. **Attach raw data files** — always attach raw instrument outputs alongside summarized results for audit trails.
4. **Implement retry logic** — network calls to the API can fail; use exponential backoff for robust automation.
5. **Log API calls** — maintain a local log of all API operations for debugging and compliance auditing.

## Common Pitfalls

1. **Session expiration**: LabArchives sessions expire. For long-running scripts, re-authenticate periodically or use API tokens.
2. **Base64 encoding overhead**: Large file attachments encoded as base64 increase payload size by ~33%. For files > 50MB, consider using chunked uploads.
3. **HTML content validation**: Ensure HTML content is well-formed. Malformed HTML may be silently stripped or cause entry creation to fail.
4. **Permission errors**: The authenticated user must have write access to the target notebook and folder. Check permissions before batch operations.

## Integration with HBE

- Use within `workflows/experiment-design.md` to auto-populate ELN entries from experiment plans.
- Pair with `references/tools/benchling-integration.md` for cross-platform ELN synchronization.
- Combine with `references/tools/pandas.md` to convert DataFrame summaries into HTML tables for notebook entries.

## Resources

- LabArchives API Documentation: https://www.labarchives.com/developers/
- LabArchives Help Center: https://www.labarchives.com/support/
- REST API Overview: Contact your LabArchives account manager for API access credentials
- Alternative: `labarchives` PyPI package: https://pypi.org/project/labarchives/
