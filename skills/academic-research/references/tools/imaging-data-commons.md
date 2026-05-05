---
name: imaging-data-commons
description: Imaging Data Commons access — programmatic access to NCI cancer imaging datasets (TCIA, NLST, LIDC)
domain: Medicine / Imaging
install: pip install idc-index pydicom
---

# imaging-data-commons — NCI Cancer Imaging Data Access

The Imaging Data Commons (IDC) provides programmatic access to NCI-supported cancer imaging collections hosted on Google Cloud. Using the `idc-index` Python client, researchers can search, download, and analyze DICOM data from major collections including TCGA, NLST, LIDC-IDRI, and many more without downloading entire datasets.

## When to Use

- Searching and filtering cancer imaging collections by cancer type, modality, or collection
- Downloading specific DICOM series from IDC cloud-hosted archives
- Building training datasets for radiology AI from NCI-curated collections
- Accessing segmentations and annotations paired with imaging studies
- Querying clinical metadata linked to imaging studies (diagnosis, survival, treatment)

## Quick Start

```python
from idc_index import idc_client

# Initialize client (connects to BigQuery public dataset)
client = idc_client.IDCClient()

# Search for lung cancer CT studies
df = client.collection_summary()
print(f"Available collections: {len(df)}")
print(df[["Collection", "PatientID", "StudyInstanceUID"]].head())

# Search specific collection (LIDC-IDRI: lung nodule CT with annotations)
studies = client.sql_query(
    f"SELECT StudyInstanceUID, PatientID, StudyDescription, StudyDate "
    f"FROM idc_current.dicom_all "
    f"WHERE collection_id = 'lidc_idri' "
    f"AND Modality = 'CT' "
    f"LIMIT 10"
)
print(studies)
```

## Core Capabilities

### 1. Collection Search and Filtering

```python
from idc_index import idc_client

client = idc_client.IDCClient()

# List all available collections
collections = client.collections
print(f"Total collections: {len(collections)}")
for col in collections[:10]:
    print(f"  {col['Collection']}: {col.get('Description', 'N/A')}")

# Filter studies by cancer type and modality
studies = client.sql_query(
    f"SELECT collection_id, PatientID, StudyInstanceUID, Modality, BodyPartExamined, StudyDate "
    f"FROM idc_current.dicom_all "
    f"WHERE collection_id IN ('tcga_luad', 'tcga_lusc') "
    f"AND Modality = 'CT' "
    f"ORDER BY StudyDate DESC "
    f"LIMIT 50"
)
print(f"Found {len(studies)} studies in TCGA lung cancer collections")
```

### 2. DICOM Series Download

```python
from idc_index import idc_client

client = idc_client.IDCClient()

# Find all series for a specific patient in LIDC-IDRI
series_df = client.sql_query(
    f"SELECT SeriesInstanceUID, SeriesDescription, Modality, "
    f"       ImageCount, AcquisitionDate "
    f"FROM idc_current.dicom_all "
    f"WHERE PatientID = 'LIDC-IDRI-0001' "
    f"AND Modality = 'CT'"
)

# Download specific series (streams from Google Cloud Storage)
download_dir = "/data/lidc_idri/patient_0001"
for _, row in series_df.iterrows():
    print(f"Downloading series: {row['SeriesDescription']} "
          f"({row['ImageCount']} images)")
    manifest = client.get_series_manifest(row["SeriesInstanceUID"])
    # manifest contains GCS URIs for each DICOM file
    client.download_from_manifest(manifest, download_dir=download_dir)

print(f"Downloaded to {download_dir}")
```

### 3. Accessing Segmentation Masks and Annotations

```python
from idc_index import idc_client

client = idc_client.IDCClient()

# LIDC-IDRI includes radiologist annotations as SEG objects
seg_series = client.sql_query(
    f"SELECT SeriesInstanceUID, SeriesDescription, SegmentDescription "
    f"FROM idc_current.dicom_all "
    f"WHERE collection_id = 'lidc_idri' "
    f"AND Modality = 'SEG' "
    f"LIMIT 5"
)

# Find RTSTRUCT (radiation therapy structure sets) for target contours
rtstruct = client.sql_query(
    f"SELECT StudyInstanceUID, SeriesInstanceUID, StructureSetName "
    f"FROM idc_current.dicom_all "
    f"WHERE Modality = 'RTSTRUCT' "
    f"AND collection_id IN ('nsclc_radiogenomics', 'head_neck_radiomics_hn1') "
    f"LIMIT 10"
)

# Access clinical metadata linked to imaging
clinical = client.sql_query(
    f"SELECT PatientID, collection_id,癌症类型, overall_survival_months "
    f"FROM idc_current.dicom_all "
    f"WHERE collection_id = 'tcga_luad' "
    f"LIMIT 5"
)
```

## Common Academic Workflow: Build Training Dataset from IDC

```python
from idc_index import idc_client
import pandas as pd
from pathlib import Path

client = idc_client.IDCClient()

# 1. Query: Find all CT studies with segmentations in a specific collection
query = """
SELECT
    d.PatientID,
    d.StudyInstanceUID,
    d.SeriesInstanceUID,
    d.Modality,
    d.ImageCount,
    c.collection_id
FROM idc_current.dicom_all d
JOIN idc_current.collection c ON d.collection_id = c.collection_id
WHERE d.collection_id = 'lidc_idri'
  AND d.Modality IN ('CT', 'SEG')
ORDER BY d.PatientID, d.Modality
"""
all_series = client.sql_query(query)

# 2. Separate CT and SEG series
ct_series = all_series[all_series["Modality"] == "CT"]
seg_series = all_series[all_series["Modality"] == "SEG"]

# 3. Download paired CT + SEG for each patient (limit to N patients)
output_dir = Path("idc_lidc_dataset")
output_dir.mkdir(exist_ok=True)

n_patients = min(50, ct_series["PatientID"].nunique())
selected_patients = ct_series["PatientID"].unique()[:n_patients]

for pid in selected_patients:
    patient_ct = ct_series[ct_series["PatientID"] == pid]
    patient_seg = seg_series[seg_series["PatientID"] == pid]

    patient_dir = output_dir / pid
    patient_dir.mkdir(exist_ok=True)

    for _, row in patient_ct.iterrows():
        manifest = client.get_series_manifest(row["SeriesInstanceUID"])
        client.download_from_manifest(manifest, download_dir=str(patient_dir / "ct"))

    for _, row in patient_seg.iterrows():
        manifest = client.get_series_manifest(row["SeriesInstanceUID"])
        client.download_from_manifest(manifest, download_dir=str(patient_dir / "seg"))

    print(f"Downloaded patient {pid}: "
          f"{len(patient_ct)} CT series, {len(patient_seg)} SEG series")

# 4. Save manifest
manifest_df = all_series[all_series["PatientID"].isin(selected_patients)]
manifest_df.to_csv(output_dir / "manifest.csv", index=False)
print(f"Dataset ready: {n_patients} patients in {output_dir}")
```

## Best Practices

1. Use BigQuery SQL to filter and subset before downloading; avoid downloading entire collections
2. Check `collection_id` values in the IDC documentation for the most up-to-date collection names
3. Use `SOPInstanceUID` for deduplication when merging DICOM files from multiple series
4. Cache downloaded data locally; re-downloading from GCS incurs egress costs
5. Verify DICOM consistency (same patient, same study) when pairing CT and SEG series

## Common Pitfalls

1. **GCS authentication**: Some operations may require Google Cloud authentication; use `gcloud auth login` first
2. **Large query costs**: BigQuery queries on the full IDC dataset can be expensive; always use LIMIT in development
3. **Inconsistent series pairing**: SEG series may not correspond 1:1 with CT series; verify with `StudyInstanceUID`
4. **De-identification requirements**: IDC data is de-identified, but verify your IRB allows cloud-based access

## Integration with HBE

- Use with `references/tools/pydicom.md` for reading downloaded DICOM files
- Pair with `references/tools/pylibjpeg.md` for decoding compressed DICOM pixel data
- Combine with `references/tools/numpy.md` for voxel-level processing
- Supports `references/tool-registry.md` medical imaging tool chain

## Resources

- IDC Portal: https://imaging.datacommons.cancer.gov/
- idc-index Documentation: https://github.com/ImagingDataCommons/idc-index
- IDC BigQuery Tables: https://console.cloud.google.com/bigquery?p=bigquery-public-data&id=idc_current
- TCGA Imaging Data: https://www.cancer.gov/ccg/research/genome-sequencing/tcga
