---
name: omero-integration
description: OMERO integration — programmatic access to OMERO microscopy image servers for metadata, annotation, and pixel data retrieval
domain: Biology / Microscopy
install: pip install omero-py ezomero
---

# omero-integration — OMERO Microscopy Server Integration

OMERO (Open Microscopy Environment Remote Objects) is a server platform for managing, annotating, and sharing microscopy image data. This skill covers programmatic access to OMERO servers using `omero-py` (the official Python client) and `ezomero` (a higher-level wrapper) for retrieving images, metadata, and annotations in research pipelines.

## When to Use

- Batch downloading images and metadata from an institutional OMERO server
- Extracting pixel data from multi-channel microscopy images for analysis
- Adding annotations, tags, and key-value pairs to images programmatically
- Building automated image analysis pipelines that read from and write back to OMERO
- Querying image datasets by metadata (plate, well, channel, acquisition date)

## Quick Start

```python
import ezomero

# Connect to OMERO server
conn = ezomero.connect(
    host="omero.institute.edu",
    port=4064,
    user="researcher",
    password="***",
    group="lab_group",
    secure=True
)

# List projects
projects = ezomero.get_projects(conn)
for p in projects:
    print(f"Project: {p.getName()} (ID: {p.getId()})")

# Get image IDs from a dataset
image_ids = ezomero.get_image_ids(conn, dataset=42)
print(f"Dataset 42 has {len(image_ids)} images")

conn.close()
```

## Core Capabilities

### 1. Image and Metadata Retrieval

```python
import ezomero
import numpy as np
from pathlib import Path

conn = ezomero.connect(host="omero.institute.edu", user="user", password="***", group="lab")

# Get image metadata
image_id = 10523
info = ezomero.get_image(conn, image_id)
print(f"Name: {info.getName()}")
print(f"Size: {info.getSizeX()} x {info.getSizeY()} x {info.getSizeZ()}")
print(f"Channels: {info.getSizeC()}, Timepoints: {info.getSizeT()}")
print(f"Pixel type: {info.getPixelsType()}")
print(f"Acquisition date: {info.getAcquisitionDate()}")

# Download pixel data as numpy array
# For large images, specify region to avoid memory issues
pixels = ezomero.get_image(conn, image_id, xyzct=False, z_range=(0, 1), c_range=(0, 3))
# Returns dict with keys: 'channels', 'labels'
print(f"Pixel array shape: {pixels.shape}")  # (C, Z, Y, X) or (Z, Y, X) depending on params

conn.close()
```

### 2. Annotation and Tagging

```python
import ezomero

conn = ezomero.connect(host="omero.institute.edu", user="user", password="***")

# Add a table annotation to an image
import pandas as pd
df = pd.DataFrame({
    "cell_count": [1523, 1487, 1601],
    "mean_intensity": [245.3, 251.1, 238.7],
    "well": ["A01", "A02", "A03"],
})
ezomero.post_table(conn, df, object_type="Image", oids=[10523, 10524, 10525])

# Add key-value pairs (map annotations)
ezomero.post_map_annotation(
    conn, "Image", 10523,
    {"treatment": "drug_X", "concentration_uM": 10.0, "replicate": 3}
)

# Add tag
tag_id = ezomero.post_tag(conn, "high-quality")
ezomero.link_annotations(conn, "Image", [10523], [tag_id])

# Retrieve all annotations for an image
annotations = ezomero.get_map_annotations(conn, "Image", [10523])
for ann in annotations:
    print(f"Annotation: {ann}")

conn.close()
```

### 3. Batch Processing Pipeline

```python
import ezomero
import numpy as np
from skimage.filters import threshold_otsu
from skimage.measure import label, regionprops

def process_omero_plate(conn, plate_id, output_dir):
    """Process all images in a plate and upload results."""
    from pathlib import Path
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Get all wells in the plate
    well_ids = ezomero.get_well_ids(conn, plate=plate_id)
    results = []

    for well_id in well_ids:
        image_ids = ezomero.get_image_ids(conn, well=well_id)
        for img_id in image_ids:
            # Download image (first channel only for segmentation)
            img_data, img_meta = ezomero.get_image(conn, img_id)
            channel_0 = img_data[0]  # First channel

            # Segment cells using Otsu thresholding
            thresh = threshold_otsu(channel_0)
            binary = channel_0 > thresh
            labeled = label(binary)
            props = regionprops(labeled, intensity_image=channel_0)

            n_cells = len(props)
            mean_area = np.mean([p.area for p in props]) if props else 0

            results.append({
                "image_id": img_id,
                "well_id": well_id,
                "n_cells": n_cells,
                "mean_area": mean_area,
            })

            # Upload results as map annotation
            ezomero.post_map_annotation(
                conn, "Image", img_id,
                {"n_cells": n_cells, "mean_area_um2": float(mean_area)}
            )

    return results
```

## Common Academic Workflow: High-Content Screening Analysis

```python
import ezomero
import pandas as pd
import numpy as np

conn = ezomero.connect(host="omero.institute.edu", user="user", password="***", group="screening")

# 1. Find the screening plate
project_id = ezomero.get_project_ids(conn)[0]  # first project
dataset_ids = ezomero.get_dataset_ids(conn, project=project_id)

# 2. Extract per-well features from all plates
all_features = []
for ds_id in dataset_ids:
    image_ids = ezomero.get_image_ids(conn, dataset=ds_id)
    for img_id in image_ids:
        # Get existing annotations (from prior analysis)
        annotations = ezomero.get_map_annotations(conn, "Image", [img_id])
        for ann in annotations:
            ann["image_id"] = img_id
            ann["dataset_id"] = ds_id
            all_features.append(ann)

# 3. Build feature table and compute Z-scores
df = pd.DataFrame(all_features)
for col in ["n_cells", "mean_intensity"]:
    if col in df.columns:
        df[f"{col}_zscore"] = (df[col] - df[col].mean()) / df[col].std()

# 4. Flag hits (|Z-score| > 2)
hits = df[df.filter(like="_zscore").abs().max(axis=1) > 2]
print(f"Found {len(hits)} hits out of {len(df)} wells")

# 5. Tag hits in OMERO
for _, row in hits.iterrows():
    ezomero.post_map_annotation(
        conn, "Image", row["image_id"],
        {"hit": True, "max_zscore": float(row.filter(like="_zscore").abs().max())}
    )

conn.close()
```

## Best Practices

1. Always close connections with `conn.close()` or use context managers to prevent session leaks
2. Use `xyzct=False` and specify `z_range`/`c_range` to load only needed channels and slices
3. Batch annotation uploads to reduce round-trip overhead when processing many images
4. Use the `group` parameter to ensure you see the correct project/dataset hierarchy
5. Set `secure=True` for encrypted connections in production environments

## Common Pitfalls

1. **Session timeout**: OMERO sessions expire after 1 hour of inactivity; reconnect or use keep-alive for long jobs
2. **Memory overflow on large images**: Whole-slide images can be > 1 GB; always use region-based access
3. **Permission errors**: Verify your user has read/write permissions for the target group
4. **Binary pixel data**: Raw pixel data from OMERO may need byte-swapping depending on endianness

## Integration with HBE

- Use with `references/tools/scikit-image.md` (via `references/tools/numpy.md`) for image analysis
- Pair with `references/tools/pandas.md` for feature table construction
- Combine with `references/tools/matplotlib.md` for visualization of screening results
- Supports `references/tool-registry.md` microscopy tool chain

## Resources

- OMERO Documentation: https://docs.openmicroscopy.org/omero/
- ezomero: https://github.com/i2pc/ezomero
- omero-py: https://github.com/ome/omero-py
- OMERO Python API: https://docs.openmicroscopy.org/omero/5.6.3/developers/Python.html
