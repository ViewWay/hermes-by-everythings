---
name: pydicom
description: Python library for reading, modifying, and writing DICOM medical imaging files
domain: Medicine / Medical Imaging
install: pip install pydicom
---

# pydicom — DICOM Medical Image I/O / DICOM 医学影像读写

pydicom reads and writes DICOM (Digital Imaging and Communications in Medicine) files — the standard format for medical imaging data (CT, MRI, X-ray, ultrasound, etc.).

## When to Use / 适用场景

- Reading DICOM files for medical image analysis
- Extracting patient/study metadata (demographics, scan parameters)
- Anonymizing DICOM data for research compliance
- Converting DICOM to standard image formats (NIfTI, PNG)
- Preparing medical imaging datasets for deep learning

## Quick Start / 快速开始

```python
import pydicom

# Read DICOM file
ds = pydicom.dicomread("CT_001.dcm")

# Access pixel data
pixel_array = ds.pixel_array  # NumPy array

# Access metadata
print(ds.PatientName)
print(ds.Modality)       # CT, MR, XR, US, etc.
print(ds.StudyDate)
print(ds.Rows, ds.Columns)

# Modify and save
ds.PatientName = "ANONYMOUS"
ds.save_as("anonymized.dcm")
```

## Core Capabilities / 核心能力

### 1. Reading DICOM Data / 读取 DICOM 数据

```python
import pydicom

# Read single file
ds = pydicom.dicomread("image.dcm")

# Pixel data
pixels = ds.pixel_array  # ndarray, dtype depends on BitsAllocated

# Common metadata fields
patient_id = ds.PatientID
study_date = ds.StudyDate
modality = ds.Modality
slice_thickness = ds.SliceThickness
pixel_spacing = ds.PixelSpacing  # [row_spacing, col_spacing]
image_position = ds.ImagePositionPatient  # [x, y, z]

# Rescale to Hounsfield Units (CT)
if "RescaleIntercept" in ds and "RescaleSlope" in ds:
    hu_array = pixels * ds.RescaleSlope + ds.RescaleIntercept

# Read directory of DICOM files
from pydicom import dcmread
import glob
files = sorted(glob.glob("dicom_series/*.dcm"))
slices = [dcmread(f) for f in files]
slices.sort(key=lambda s: float(s.ImagePositionPatient[2]))
volume = np.stack([s.pixel_array for s in slices])
```

### 2. DICOM Anonymization / DICOM 匿名化

```python
import pydicom

ds = pydicom.dicomread("patient_ct.dcm")

# Remove identifying information (GDPR/HIPAA compliance)
PHI_TAGS = [
    (0x0010, 0x0010),  # PatientName
    (0x0010, 0x0020),  # PatientID
    (0x0010, 0x0030),  # PatientBirthDate
    (0x0010, 0x1000),  # OtherPatientIDs
    (0x0008, 0x0080),  # InstitutionName
    (0x0008, 0x0081),  # InstitutionAddress
]
for group, elem in PHI_TAGS:
    if (group, elem) in ds:
        del ds[group, elem]

# Or use a de-identification profile
ds.remove_private_tags()  # Remove all private tags
ds.PatientName = "ANONYMOUS"
ds.PatientID = "RESEARCH_001"
ds.save_as("anonymized.dcm")
```

### 3. Writing DICOM / 写入 DICOM

```python
import pydicom
import numpy as np

# Create new DICOM from template
ds = pydicom.dicomread("template.dcm")
ds.PatientID = "NEW_PATIENT_001"
ds.PixelData = new_pixel_array.tobytes()
ds.Rows, ds.Columns = new_pixel_array.shape
ds.save_as("new_image.dcm")
```

### 4. DICOM to NIfTI Conversion / DICOM 转 NIfTI

```python
import pydicom
import numpy as np
import nibabel as nib  # pip install nibabel
import glob

# Read DICOM series
files = sorted(glob.glob("dicom_series/*.dcm"))
slices = [pydicom.dicomread(f) for f in files]
slices.sort(key=lambda s: float(s.ImagePositionPatient[2]))

# Build 3D volume
volume = np.stack([s.pixel_array for s in slices])
# Apply rescale if CT
slope = slices[0].RescaleSlope if "RescaleSlope" in slices[0] else 1
intercept = slices[0].RescaleIntercept if "RescaleIntercept" in slices[0] else 0
volume = volume * slope + intercept

# Compute affine matrix from DICOM headers
spacing = slices[0].PixelSpacing
thickness = slices[0].SliceThickness
position = slices[0].ImagePositionPatient
affine = np.eye(4)
affine[0, 0] = float(spacing[1])
affine[1, 1] = float(spacing[0])
affine[2, 2] = float(thickness)
affine[:3, 3] = [float(p) for p in position]

nii = nib.Nifti1Image(volume, affine)
nib.save(nii, "output.nii.gz")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Medical Imaging Dataset Preparation / 医学影像数据集准备

```python
import pydicom
import numpy as np
import pandas as pd
import os
from pathlib import Path

# Scan DICOM directory and extract metadata
records = []
dicom_dir = Path("medical_images/")
for dcm_path in dicom_dir.rglob("*.dcm"):
    try:
        ds = pydicom.dicomread(str(dcm_path), stop_before_pixels=True)
        records.append({
            "filepath": str(dcm_path),
            "patient_id": ds.get("PatientID", ""),
            "study_date": ds.get("StudyDate", ""),
            "modality": ds.get("Modality", ""),
            "body_part": ds.get("BodyPartExamined", ""),
            "rows": ds.get("Rows", 0),
            "columns": ds.get("Columns", 0),
            "slice_thickness": ds.get("SliceThickness", ""),
        })
    except Exception as e:
        print(f"Error reading {dcm_path}: {e}")

df = pd.DataFrame(records)
df.to_csv("dataset_manifest.csv", index=False)
print(f"Found {len(df)} DICOM files, {df['patient_id'].nunique()} patients")
```

## Best Practices / 最佳实践

- Always anonymize before sharing DICOM data (legal requirement in most jurisdictions)
- Use `stop_before_pixels=True` when only metadata is needed (much faster)
- Sort slices by `ImagePositionPatient[2]` for correct 3D reconstruction
- Validate pixel data type matches `BitsAllocated` and `PixelRepresentation`
- Use nibabel or SimpleITK for NIfTI conversion rather than manual affine computation

## Common Pitfalls / 常见陷阱

- **Byte order**: Check `ds.is_little_endian`; some DICOM files use big-endian
- **Compressed transfer syntax**: May need `pip install gdcm` or `pylibjpeg` for JPEG-compressed DICOM
- **Missing tags**: Use `ds.get("TagName", default)` instead of `ds.TagName` to avoid AttributeError
- **Slice ordering**: Never assume filenames correspond to slice order; use ImagePositionPatient
- **Photometric interpretation**: MONOCHROME1 vs MONOCHROME2 requires different windowing

## Integration with HBE / 与 HBE 集成

- Core tool for medical imaging workflows in `workflows/experiment-design.md`
- Pair with `references/tools/numpy.md` for pixel array manipulation
- Use with `references/tools/matplotlib.md` for image display and windowing
- Combine with `references/tools/pandas.md` for dataset manifest creation

## Resources / 资源

- Documentation: https://pydicom.github.io/pydicom/
- DICOM standard: https://www.dicomstandard.org/
- NIfTI format: https://nifti.nimh.nih.gov/
- nibabel: https://nipy.org/nibabel/
