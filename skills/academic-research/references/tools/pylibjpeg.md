---
name: pylibjpeg
description: DICOM JPEG decoding — decompress JPEG, JPEG-LS, and JPEG 2000 compressed medical images for analysis
domain: Medicine / Imaging
install: pip install pylibjpeg pylibjpeg-libjpeg pylibjpeg-openjpeg
---

# pylibjpeg — DICOM JPEG Decoding

pylibjpeg provides Python plugins for decoding JPEG-compressed pixel data in DICOM medical images. It adds support for JPEG, JPEG-LS, and JPEG 2000 transfer syntaxes that pydicom cannot decode natively, enabling seamless access to compressed medical imaging archives.

## When to Use

- Opening DICOM files compressed with JPEG, JPEG-LS, or JPEG 2000 transfer syntaxes
- Processing medical imaging archives where most files use lossy or lossless JPEG compression
- Building DICOM-to-array pipelines for radiology AI model training
- Converting compressed DICOM series into NumPy arrays or NIfTI volumes
- Handling proprietary DICOM encodings that pydicom alone cannot decompress

## Quick Start

```python
import pydicom
from pylibjpeg import decode

# pylibjpeg automatically registers its decoders with pydicom
# Just import and read compressed DICOM files normally
ds = pydicom.dcmread("compressed_ct_scan.dcm")

# The pixel data is now accessible
pixel_array = ds.pixel_array
print(f"Shape: {pixel_array.shape}, dtype: {pixel_array.dtype}")
print(f"Transfer syntax: {ds.file_meta.TransferSyntaxUID.name}")
```

## Core Capabilities

### 1. JPEG Baseline and Extended Decoding

```python
import pydicom

# Install: pip install pylibjpeg pylibjpeg-libjpeg
# Handles Transfer Syntaxes:
#   1.2.840.10008.1.2.4.50  (JPEG Baseline)
#   1.2.840.10008.1.2.4.51  (JPEG Extended)

ds = pydicom.dcmread("mammography_jpeg_baseline.dcm")
pixels = ds.pixel_array  # Automatically decoded

# Process multiple compressed files in a series
import os
from pathlib import Path

series_dir = Path("dicom_series_jpeg")
arrays = []
for fpath in sorted(series_dir.glob("*.dcm")):
    ds = pydicom.dcmread(fpath)
    arrays.append(ds.pixel_array)

import numpy as np
volume = np.stack(arrays, axis=-1)
print(f"Volume shape: {volume.shape}")  # (H, W, n_slices)
```

### 2. JPEG-LS (Near-Lossless) Decoding

```python
import pydicom

# Install: pip install pylibjpeg pylibjpeg-libjpeg
# Handles Transfer Syntaxes:
#   1.2.840.10008.1.2.4.80  (JPEG-LS Lossless)
#   1.2.840.10008.1.2.4.81  (JPEG-LS Near-Lossless)

# Common in mammography and digital radiography
ds = pydicom.dcmread("mammo_jpegls.dcm")
pixels = ds.pixel_array

# JPEG-LS preserves pixel intensity values exactly (lossless)
# Verify by checking expected range
print(f"Pixel range: [{pixels.min()}, {pixels.max()}]")
print(f"Bits stored: {ds.BitsStored}, bits allocated: {ds.BitsAllocated}")
```

### 3. JPEG 2000 Decoding

```python
import pydicom

# Install: pip install pylibjpeg pylibjpeg-openjpeg
# Handles Transfer Syntaxes:
#   1.2.840.10008.1.2.4.90  (JPEG 2000 Lossless)
#   1.2.840.10008.1.2.4.91  (JPEG 2000 Lossy)

# Common in pathology whole-slide imaging (WSI) tiles and some CT archives
ds = pydicom.dcmread("pathology_j2k.dcm")
pixels = ds.pixel_array

# Check compression ratio
original_size = ds.Rows * ds.Columns * ds.BitsAllocated // 8
compressed_size = os.path.getsize("pathology_j2k.dcm") - ds.pixel_data_offset
print(f"Compression ratio: {original_size / compressed_size:.1f}x")
```

## Common Academic Workflow: Batch DICOM Decompression for ML Training

```python
import pydicom
import numpy as np
from pathlib import Path
import json

def decompress_dicom_series(input_dir, output_dir, target_shape=(512, 512)):
    """Decompress a DICOM series and save as numpy arrays."""
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    metadata = []
    dcm_files = sorted(input_path.glob("*.dcm"))

    for idx, fpath in enumerate(dcm_files):
        ds = pydicom.dcmread(fpath)
        pixels = ds.pixel_array

        # Normalize to target shape if needed
        if pixels.shape != target_shape:
            from PIL import Image
            pixels = np.array(Image.fromarray(pixels).resize(
                target_shape, Image.BILINEAR
            ))

        # Normalize pixel values to [0, 1]
        pixels = (pixels - pixels.min()) / (pixels.max() - pixels.min() + 1e-8)

        # Save
        np.save(output_path / f"slice_{idx:04d}.npy", pixels.astype(np.float32))

        metadata.append({
            "slice_idx": idx,
            "instance_number": ds.InstanceNumber,
            "slice_location": float(ds.SliceLocation) if "SliceLocation" in ds else None,
            "transfer_syntax": str(ds.file_meta.TransferSyntaxUID),
            "original_shape": list(ds.pixel_array.shape),
        })

    # Save metadata
    with open(output_path / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Decompressed {len(dcm_files)} files to {output_dir}")

decompress_dicom_series("raw_dicom_jpeg/", "processed_npy/")
```

## Best Practices

1. Install all three plugin packages (`pylibjpeg`, `pylibjpeg-libjpeg`, `pylibjpeg-openjpeg`) to cover all common DICOM JPEG transfer syntaxes
2. Always verify the Transfer Syntax UID matches the expected compression type before decoding
3. Check `BitsStored` and `PixelRepresentation` for correct value interpretation (signed vs unsigned)
4. Use `ds.decompress("raw_frame_data")` if you need frame-level access for multi-frame DICOM

## Common Pitfalls

1. **Missing plugin for transfer syntax**: If pydicom raises `NotImplementedError`, install the matching plugin (libjpeg for JPEG/JPEG-LS, openjpeg for JPEG 2000)
2. **Incorrect photometric interpretation**: JPEG-compressed RGB DICOMs may need `pixel_array` reshaping; check `PhotometricInterpretation` tag
3. **Fragmented pixel data**: Some encoders split pixel data across multiple fragments; pylibjpeg handles this transparently but very large files may be slow
4. **Memory pressure on large series**: Process one slice at a time rather than loading an entire compressed series into memory

## Integration with HBE

- Use with `references/tools/pydicom.md` for DICOM metadata extraction
- Pair with `references/tools/numpy.md` and `references/tools/pillow.md` for image preprocessing
- Combine with `references/tools/h5py.md` for storing decompressed volumes
- Supports `references/tool-registry.md` medical imaging tool chain

## Resources

- Documentation: https://pylibjpeg.readthedocs.io/
- Source: https://github.com/pydicom/pylibjpeg
- DICOM Transfer Syntaxes: https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_8.2.html
