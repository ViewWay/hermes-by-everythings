---
name: dnanexus-integration
description: DNAnexus platform integration — cloud-based bioinformatics workflow execution, data management, and app launching
domain: Bioinformatics / Cloud
install: pip install dxpy
---

# DNAnexus Integration

DNAnexus is a cloud-based bioinformatics platform that provides on-demand compute, data storage, and a catalog of pre-built bioinformatics tools and workflows. The `dxpy` Python SDK enables programmatic access to upload data, launch analyses, monitor jobs, and retrieve results from the DNAnexus platform.

## When to Use

- Running large-scale genomic analyses (WGS, WES, RNA-seq) on cloud infrastructure
- Managing petabyte-scale sequencing data in a compliant cloud environment (HIPAA, GxP)
- Orchestrating multi-step bioinformatics workflows (alignment, variant calling, annotation)
- Automating data upload from sequencers and download of processed results
- Building reproducible analysis pipelines that can be shared across teams
- Accessing curated reference datasets (dbSNP, gnomAD, ClinVar) on the platform

## Quick Start

```python
import dxpy

# Authenticate — dxpy reads DX_SECURITY_CONTEXT or uses `dx login` credentials
# For automation, set the environment variable:
# export DX_SECURITY_CONTEXT='{"auth_token": "your-token", "auth_token_type": "Bearer"}'

# Describe the current user
user = dxpy.api.system_describe_user()
print(f"Authenticated as: {user['username']}")

# List projects
projects = list(dxpy.find_projects(describe=True))
for p in projects[:5]:
    print(f"  {p['id']}: {p['describe']['name']}")
```

## Core Capabilities

### 1. Data Upload and Download

Upload local files to DNAnexus projects and download results. Supports multipart uploads for large files.

```python
import dxpy

PROJECT_ID = "project-xxxx"

def upload_file(local_path, remote_folder="/"):
    """Upload a local file to a DNAnexus project."""
    file_id = dxpy.upload_local_file(
        local_path,
        project=PROJECT_ID,
        folder=remote_folder,
        wait_on_close=True  # Block until upload completes
    )
    print(f"Uploaded: {file_id}")
    return file_id

def download_file(file_id, local_path):
    """Download a file from DNAnexus to local disk."""
    dxpy.download_dxfile(file_id, local_path)
    print(f"Downloaded to: {local_path}")
```

### 2. Running Apps and Workflows

Launch pre-built bioinformatics apps or custom workflows with configurable inputs.

```python
def run_variant_calling(input_bam_id, reference_genome_id):
    """Launch a variant calling app (e.g., GATK HaplotypeCaller)."""
    job = dxpy.api.app_run(
        "app-gatk4_haplotypecaller",
        {
            "project": PROJECT_ID,
            "input": {
                "input_bam": {"$dnanexus_link": input_bam_id},
                "reference_genome": {"$dnanexus_link": reference_genome_id}
            }
        }
    )
    print(f"Job started: {job['id']}")
    return job['id']

def run_workflow(workflow_id, input_stage_map):
    """Launch a multi-stage workflow with per-stage inputs."""
    job = dxpy.api.workflow_run(
        workflow_id,
        {
            "project": PROJECT_ID,
            "input": input_stage_map
        }
    )
    return job['id']
```

### 3. Job Monitoring and Result Retrieval

Monitor running jobs, wait for completion, and retrieve output file IDs.

```python
def wait_for_job(job_id, poll_interval=30):
    """Poll a job until completion and return its outputs."""
    import time
    while True:
        desc = dxpy.api.job_describe(job_id)
        state = desc["state"]
        print(f"Job {job_id}: {state}")
        if state in ("done", "failed"):
            break
        time.sleep(poll_interval)

    if desc["state"] == "done":
        print("Outputs:", desc["output"])
        return desc["output"]
    else:
        raise RuntimeError(f"Job failed: {desc.get('failure', 'Unknown error')}")

def get_output_files(job_output):
    """Download all output files from a completed job."""
    for key, value in job_output.items():
        if isinstance(value, dict) and "$dnanexus_link" in value:
            file_id = value["$dnanexus_link"]
            dxpy.download_dxfile(file_id, f"./output_{key}")
            print(f"Downloaded {key}: {file_id}")
```

## Common Academic Workflow

### Workflow: End-to-End RNA-seq Pipeline

```python
import dxpy

PROJECT = "project-xxxx"

# Step 1: Upload FASTQ files
fastq_r1 = dxpy.upload_local_file("sample_R1.fastq.gz", project=PROJECT, wait_on_close=True)
fastq_r2 = dxpy.upload_local_file("sample_R2.fastq.gz", project=PROJECT, wait_on_close=True)

# Step 2: Run STAR alignment
align_job = dxpy.api.app_run("app-star_align", {
    "project": PROJECT,
    "input": {
        "reads1": {"$dnanexus_link": fastq_r1.id},
        "reads2": {"$dnanexus_link": fastq_r2.id},
        "genome_index": {"$dnanexus_link": "file-xxxx"}  # Reference index
    }
})
print(f"Alignment job: {align_job['id']}")

# Step 3: Wait and download results
outputs = wait_for_job(align_job['id'])
if "aligned_bam" in outputs:
    dxpy.download_dxfile(outputs["aligned_bam"]["$dnanexus_link"], "aligned.bam")
    print("Pipeline complete. BAM downloaded.")
```

## Best Practices

1. **Use project-level organization** — create separate projects per study or experiment to maintain data isolation.
2. **Leverage DNAnexus database objects** — store metadata (sample annotations, phenotype data) in database records linked to file objects.
3. **Set up automated monitoring** — use `dxpy` job wait functions or webhooks for pipeline status notifications.
4. **Optimize instance types** — use `--instance-type` to match compute needs; memory-intensive tools need high-memory instances.
5. **Archive completed data** — use DNAnexus archival storage tiers for cold data to reduce costs.

## Common Pitfalls

1. **Authentication token expiry**: Tokens expire after a configurable period. For long-running scripts, use API keys instead of session tokens.
2. **Insufficient instance memory**: Variant calling and alignment tools can OOM on small instances. Always check tool documentation for memory requirements.
3. **File path confusion**: DNAnexus uses file IDs (e.g., `file-xxx`) not paths. Use `dxpy.describe()` to resolve objects.
4. **Upload of large files without multipart**: For files > 5GB, enable multipart upload with `dxpy.upload_local_file(..., multipart=True)`.

## Integration with HBE

- Use within `workflows/experiment-design.md` to automate data upload and pipeline execution after experiment completion.
- Pair with `references/tools/pysam.md` to locally validate BAM/VCF files downloaded from DNAnexus.
- Combine with `references/tools/pandas.md` to parse and analyze result tables from workflow outputs.

## Resources

- DNAnexus Documentation: https://documentation.dnanexus.com/
- dxpy Python SDK: https://documentation.dnanexus.com/developer-guide/sdk/python
- DNAnexus Platform API: https://documentation.dnanexus.com/api
- Command Line Client: `pip install dx-toolkit`
