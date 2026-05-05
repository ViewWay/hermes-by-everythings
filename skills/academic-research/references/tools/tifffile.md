---
name: tifffile
description: Read and write TIFF files — multi-page, pyramid, and microscopy image stacks
domain: Data I/O
install: pip install tifffile
---

# tifffile — TIFF File I/O / TIFF 文件读写

tifffile reads and writes TIFF files including multi-page stacks, pyramid OME-TIFF, and BigTIFF. Essential for microscopy (Zeiss, Leica, Olympus) and large scientific images.

## When to Use / 适用场景

- Reading microscopy image stacks (confocal, lightsheet, etc.)
- Multi-page TIFF processing (Z-stacks, time series)
- OME-TIFF metadata extraction
- Writing large image stacks (>4GB with BigTIFF)
- Converting between microscopy formats

## Quick Start / 快速开始

```python
import tifffile
import numpy as np

# Read single-page TIFF
img = tifffile.imread("image.tif")
print(f"Shape: {img.shape}, dtype: {img.dtype}")

# Read multi-page stack
stack = tifffile.imread("z_stack.tif")  # Shape: (Z, Y, X)
print(f"Stack: {stack.shape}")

# Write multi-page TIFF
data = np.random.randint(0, 255, (50, 512, 512), dtype=np.uint16)
tifffile.imwrite("output.tif", data, compression="deflate")
```

## Core Capabilities / 核心能力

### 1. Reading TIFF Files / 读取 TIFF 文件

```python
import tifffile

# Simple read
img = tifffile.imread("image.tif")

# Read with metadata
with tifffile.TiffFile("stack.tif") as tif:
    print(f"Pages: {len(tif.pages)}")
    print(f"Series: {len(tif.series)}")
    
    # Access individual pages
    page = tif.pages[0]
    print(f"Shape: {page.shape}, dtype: {page.dtype}")
    print(f"Tags: {dict(page.tags)}")
    
    # Read specific page
    img = tif.pages[42].asarray()
    
    # Read series (multi-file or multi-page)
    series = tif.series[0]
    data = series.asarray()  # May be very large
```

### 2. Writing TIFF Files / 写入 TIFF 文件

```python
import tifffile
import numpy as np

# Single page
tifffile.imwrite("image.tif", np.random.randn(512, 512).astype("float32"))

# Multi-page stack
stack = np.random.randint(0, 65535, (100, 1024, 1024), dtype=np.uint16)
tifffile.imwrite("stack.tif", stack, compression="deflate")

# With metadata
tifffile.imwrite("annotated.tif", stack,
                 photometric="minisblack",
                 compression="zstd",
                 metadata={"pixel_size": "0.1 μm", "interval": "5 min"})

# BigTIFF (>4GB)
large = np.zeros((5000, 4000, 4000), dtype=np.uint16)  # ~80GB
tifffile.imwrite("large.tif", large, bigtiff=True, compression="deflate")

# Append pages
with tifffile.TiffWriter("time_series.tif", bigtiff=True) as tif:
    for frame in frames:
        tif.write(frame, contiguous=False)
```

### 3. OME-TIFF / OME-TIFF 格式

```python
import tifffile

# Read OME-TIFF
with tifffile.TiffFile("sample.ome.tif") as tif:
    # OME-XML metadata
    ome_xml = tif.ome_metadata
    print(ome_xml[:500])
    
    # Access series
    for i, series in enumerate(tif.series):
        print(f"Series {i}: shape={series.shape}, dtype={series.dtype}")

# Write OME-TIFF
with tifffile.TiffWriter("output.ome.tif", ome=True) as tif:
    tif.write(channel_1, metadata={"Name": "DAPI", "SizeC": 2})
    tif.write(channel_2, metadata={"Name": "GFP"})
```

### 4. Tile-Based Reading for Large Files / 分块读取大文件

```python
import tifffile
import numpy as np

with tifffile.TiffFile("huge.tif") as tif:
    page = tif.pages[0]
    
    # Read specific tile
    if page.is_tiled:
        tile = page.asarray(out="memmap")  # Memory-mapped access
        
    # Memory-mapped access (no RAM needed)
    data = tif.pages[0].asarray(out="memmap")
    # Access slice without loading full image
    roi = data[1000:2000, 1000:2000]
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Microscopy Stack Processing / 显微镜堆栈处理

```python
import tifffile
import numpy as np

# Read Z-stack
stack = tifffile.imread("confocal_z_stack.tif")
# Shape: (Z, C, Y, X) or (Z, Y, X) depending on instrument

# Maximum intensity projection
mip = stack.max(axis=0)  # Project along Z
tifffile.imwrite("mip.tif", mip.astype("uint16"))

# Per-channel projection
if stack.ndim == 4:  # (Z, C, Y, X)
    for c in range(stack.shape[1]):
        mip_c = stack[:, c].max(axis=0)
        tifffile.imwrite(f"mip_ch{c}.tif", mip_c)

# Convert to OME-TIFF for FIJI/ImageJ
with tifffile.TiffWriter("processed.ome.tif", ome=True) as tif:
    tif.write(mip, metadata={"axes": "CYX", "Channel": {"Name": ["DAPI", "GFP"]}})
```

### Workflow 2: Batch TIFF to PNG Conversion / 批量 TIFF 转 PNG

```python
import tifffile
from pathlib import Path
from PIL import Image

for tif_path in Path("microscopy/").glob("*.tif"):
    stack = tifffile.imread(str(tif_path))
    # Middle slice as representative
    mid = stack.shape[0] // 2
    slice_img = stack[mid]
    # Normalize to 8-bit
    p2, p98 = np.percentile(slice_img, (2, 98))
    normalized = np.clip((slice_img - p2) / (p98 - p2) * 255, 0, 255).astype("uint8")
    Image.fromarray(normalized).save(f"preview/{tif_path.stem}.png")
```

## Best Practices / 最佳实践

- Use `compression="deflate"` or `"zstd"` for smaller files
- Use BigTIFF for files >4GB
- Use memory-mapped access (`out="memmap"`) for very large files
- Write OME-TIFF for cross-platform microscopy compatibility

## Common Pitfalls / 常见陷阱

- **4GB limit**: Standard TIFF has 4GB limit; use `bigtiff=True` for larger files
- **Memory**: Reading large stacks into RAM; use memmap or page-by-page access
- **Dtype confusion**: 16-bit images may lose precision when converted to float; keep original dtype
- **OME metadata**: Not all readers handle OME-TIFF; verify with FIJI/ImageJ

## Integration with HBE / 与 HBE 集成

- Core tool for microscopy workflows with `references/tools/pydicom.md`
- Pair with `references/tools/pillow.md` for format conversion
- Combine with `references/tools/numpy.md` for image math
- Use with `references/tools/matplotlib.md` for image display

## Resources / 资源

- Documentation: https://tifffile.readthedocs.io/
- GitHub: https://github.com/cgohlke/tifffile
- OME-TIFF spec: https://www.ome.info/
