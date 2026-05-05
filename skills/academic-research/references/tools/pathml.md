---
name: pathml
description: Computational pathology — deep learning pipelines for whole slide image analysis, tile extraction, and stain normalization
domain: medicine / pathology
install: pip install pathml
---

# PathML

An end-to-end framework for computational pathology that provides standardized pipelines for whole slide image (WSI) processing, tile extraction, stain normalization, and deep learning model application. Designed to make digital pathology research reproducible with composable, shareable pipeline components.

## When to Use

- Preprocessing whole slide images (WSI) for computational pathology research
- Extracting tiles from WSIs with tissue detection and quality filtering
- Applying stain normalization (Macenko, Reinhard, Vahadane) across heterogeneous datasets
- Running deep learning models on WSI tiles for classification or segmentation
- Building reproducible WSI analysis pipelines with standardized data formats

## Quick Start

```python
from pathml import SlideData, TileExtractor, StainNormalizerHE
from pathml.preprocessing import Pipeline

# Load a whole slide image
wsi = SlideData("slide.svs", name="patient_001")

# Build a preprocessing pipeline
pipeline = Pipeline([
    StainNormalizerHE(method="macenko"),
    TileExtractor(tile_size=256, overlap=0),
])

# Run pipeline — extracts normalized tiles
wsi.run(pipeline, distributed=False)

# Inspect extracted tiles
print(f"Tiles extracted: {len(wsi.tiles)}")
for i, tile in enumerate(wsi.tiles[:3]):
    print(f"  Tile {i}: shape={tile.image.shape}, labels={tile.labels}")
```

## Core Capabilities

### 1. Whole Slide Image Loading and Tile Extraction

```python
from pathml import SlideData, TileExtractor

# Load WSI from various formats (.svs, .ndpi, .mrxs, .tif)
slide = SlideData("tumor_slide.svs", name="sample_001")

# Extract tiles with configurable size and overlap
extractor = TileExtractor(
    tile_size=512,       # Tile dimension in pixels
    overlap=0.1,         # 10% overlap between adjacent tiles
    threshold=0.8,       # Minimum tissue content fraction
)

# Apply tile extraction
slide.run(extractor)

# Access individual tiles
for tile in slide.tiles:
    print(f"Tile coords: {tile.coords}, shape: {tile.image.shape}")
    # tile.image is a numpy array (H, W, 3) for RGB
    # tile.masks contains segmentation masks if available
```

### 2. Stain Normalization

```python
from pathml.preprocessing import StainNormalizerHE, Pipeline

# Macenko stain normalization — most common for H&E slides
macenko = StainNormalizerHE(method="macenko")

# Reinhard normalization — simpler, faster
reinhard = StainNormalizerHE(method="reinhard")

# Vahadane normalization — sparse non-negative matrix factorization
vahadane = StainNormalizerHE(method="vahadane")

# Build full preprocessing pipeline
pipeline = Pipeline([
    macenko,                      # Normalize stain appearance
    TileExtractor(tile_size=256), # Extract tiles after normalization
])

slide = SlideData("heterogeneous_dataset.svs", name="batch_slide")
slide.run(pipeline)
```

### 3. Model Application on Tiles

```python
from pathml import SlideData, TileExtractor
from pathml.models import HEStainModel
import torch.nn as nn

# Define a custom classifier for tumor vs normal
class TumorClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(),
            nn.AdaptiveAvgPool2d(1),
        )
        self.fc = nn.Linear(64, 2)

    def forward(self, x):
        return self.fc(self.conv(x).squeeze())

# Apply model to all tiles in a slide
from pathml.ml import TileClassifier
classifier = TileClassifier(model=TumorClassifier(), device="cuda")

slide = SlideData("test_slide.svs", name="test")
slide.run(TileExtractor(tile_size=256))
slide.run(classifier)

# Get slide-level prediction (majority vote)
predictions = [t.labels.get("prediction") for t in slide.tiles]
slide_pred = max(set(predictions), key=predictions.count)
print(f"Slide-level prediction: {'tumor' if slide_pred == 1 else 'normal'}")
```

## Common Academic Workflow: Multi-Center WSI Classification with Stain Normalization

```python
from pathml import SlideData, TileExtractor
from pathml.preprocessing import StainNormalizerHE, Pipeline

# 1. Build pipeline with stain normalization (critical for multi-center data)
pipeline = Pipeline([
    StainNormalizerHE(method="macenko"),
    TileExtractor(tile_size=512, overlap=0, threshold=0.7),
])

# 2. Process all slides from multiple centers
import os
tiles_all, labels_all = [], []
for center_dir in ["center_A/", "center_B/", "center_C/"]:
    for slide_file in os.listdir(center_dir):
        if slide_file.endswith(".svs"):
            slide = SlideData(os.path.join(center_dir, slide_file))
            slide.run(pipeline)
            for tile in slide.tiles:
                tiles_all.append(tile.image)
                labels_all.append(center_dir)

# 3. Convert to arrays for ML
import numpy as np
X = np.array(tiles_all)
y = np.array(labels_all)
print(f"Total tiles: {len(X)}, shape: {X[0].shape}")
```

## Best Practices

1. **Always stain-normalize multi-center data** — Different scanners and staining protocols create batch effects that degrade model performance
2. **Set tissue threshold** — Use `threshold=0.7-0.8` to exclude background tiles and reduce computation
3. **Save intermediate results** — Use `slide.save("processed/")` to cache extracted tiles and avoid reprocessing large WSIs
4. **Validate on held-out centers** — For multi-center studies, always hold out entire centers for testing (not random tiles)

## Common Pitfalls

- **WSI file sizes**: Whole slide images can be 5-50 GB. Ensure sufficient disk space and memory before processing.
- **Unsupported formats**: Verify your WSI format is supported (.svs, .ndpi, .mrxs). Convert unsupported formats with OpenSlide.
- **Ignoring tissue detection**: Extracting tiles without tissue masking wastes compute on blank background regions.
- **Stain normalization target**: Macenko method requires a reference image; provide a well-stained slide or use the default target.

## Integration with HBE

- Use with `/hbe:plan` for designing computational pathology study protocols
- Pair with `references/tools/tifffile.md` for reading multi-resolution TIFF images
- Combine with `references/tools/torch-geometric.md` for graph-based tile classification
- See `references/tools/histolab.md` for alternative tile extraction and staining tools

## Resources

- Documentation: https://pathml.readthedocs.io/
- GitHub: https://github.com/DigitalPathologyAI/PathML
- Paper: Rosen, B. et al. (2021). PathML: a machine learning toolkit for computational pathology. BMC Bioinformatics, 22, 583.
