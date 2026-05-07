---
name: histolab
description: Whole slide image processing — tissue detection, tile extraction, stain normalization, and data augmentation for histopathology
domain: medicine / histology
install: pip install histolab
---

# histolab

A Python library for processing whole slide images (WSI) in digital pathology. Provides tissue detection, tile extraction with quality filtering, stain normalization, and histology-specific data augmentation. Built on top of OpenSlide and designed to prepare WSI data for deep learning pipelines.

## When to Use

- Extracting tissue tiles from whole slide images for training deep learning models
- Applying stain normalization to correct for staining variability across slides
- Generating augmented histopathology image datasets (color jitter, rotation, elastic deformation)
- Detecting and filtering out low-quality tiles (blur, pen marks, artifacts)
- Creating standardized tile datasets from heterogeneous WSI collections

## Quick Start

```python
from histolab.slide import Slide
from histolab.tiler import RandomTilesTiler
from histolab.filters.image_filters import RgbToHsv, OtsuThreshold

# Load a whole slide image
slide = Slide("slide.svs", processed_path="processed/")

# Extract random tiles from tissue regions
tiler = RandomTilesTiler(
    tile_size=(512, 512),
    n_tiles=100,
    seed=42,
    prefix="slide01",
    check_tissue=True,      # Only extract from tissue regions
    tissue_percent=80.0,    # Minimum tissue percentage per tile
)
tiler.extract(slide)
# Tiles saved to processed/slide01_random_tiles_512x512/
```

## Core Capabilities

### 1. Tissue Detection and Tile Extraction

```python
from histolab.slide import Slide
from histolab.tiler import GridTiler, RandomTilesTiler, ScoreTiler

slide = Slide("tumor_slide.svs", processed_path="processed/")

# Grid tiler — systematic extraction across the slide
grid_tiler = GridTiler(
    tile_size=(256, 256),
    pixel_overlap=0,         # No overlap between tiles
    check_tissue=True,
    tissue_percent=70.0,     # At least 70% tissue per tile
    prefix="grid",
)
grid_tiler.extract(slide)

# Score-based tiler — extract tiles with highest tissue density
score_tiler = ScoreTiler(
    tile_size=(512, 512),
    n_tiles=50,              # Extract top 50 tiles by tissue score
    tissue_percent=80.0,
    prefix="scored",
)
score_tiler.extract(slide)

# Random tiler — for balanced sampling
random_tiler = RandomTilesTiler(
    tile_size=(512, 512),
    n_tiles=100,
    check_tissue=True,
    tissue_percent=60.0,
    seed=42,
)
random_tiler.extract(slide)
```

### 2. Stain Normalization

```python
from histolab.stain_normalizer import MacenkoStainNormalizer, ReinhardStainNormalizer

slide = Slide("stained_slide.svs", processed_path="normalized/")

# Macenko stain normalization
macenko = MacenkoStainNormalizer(
    target_image_path="reference_slide.png",  # Well-stained reference
)
normalized_slide = macenko(slide)

# Reinhard stain normalization (simpler, works on target image stats)
reinhard = ReinhardStainNormalizer(
    target_means=(150.0, 130.0, 160.0),       # Mean RGB of reference
    target_stds=(50.0, 45.0, 55.0),           # Std RGB of reference
)
normalized_slide = reinhard(slide)

# Save normalized thumbnail for verification
normalized_slide.save_thumbnail("normalized_thumbnail.png")
```

### 3. Image Filters and Quality Control

```python
from histolab.filters.image_filters import (
    RgbToHsv,
    OtsuThreshold,
    MorphologicalFilter,
    NucleiDetectionFilter,
)
from histolab.composer import Compose

# Build a preprocessing pipeline
preprocessing = Compose(
    [
        RgbToHsv(),                    # Convert to HSV for better tissue detection
        OtsuThreshold(mask_value=0),   # Binary tissue mask via Otsu
        MorphologicalFilter(           # Remove small noise
            operation="opening", kernel_size=5
        ),
    ]
)

# Apply to slide thumbnail for tissue detection
thumbnail = slide.thumbnail
mask = preprocessing(thumbnail)
```

## Common Academic Workflow: Building a Tile Dataset for Tumor Classification

```python
from histolab.slide import Slide
from histolab.tiler import GridTiler
from histolab.stain_normalizer import MacenkoStainNormalizer
import os

# 1. Define extraction parameters
output_root = "tile_dataset/"
os.makedirs(output_root, exist_ok=True)

# 2. Process all slides
slides_dir = "wsi_collection/"
for slide_file in sorted(os.listdir(slides_dir)):
    if not slide_file.endswith((".svs", ".ndpi")):
        continue

    label = "tumor" if "tumor" in slide_file else "normal"
    slide = Slide(
        os.path.join(slides_dir, slide_file),
        processed_path=os.path.join(output_root, label)
    )

    # Stain normalize before extraction
    normalizer = MacenkoStainNormalizer(target_image_path="reference.png")
    slide = normalizer(slide)

    # Extract tiles with quality filtering
    tiler = GridTiler(
        tile_size=(512, 512),
        pixel_overlap=0,
        check_tissue=True,
        tissue_percent=80.0,
        prefix=label,
    )
    tiler.extract(slide)
    print(f"{slide_file}: {label} tiles extracted")

print(f"Dataset: {len(os.listdir(output_root))} tiles total")
```

## Best Practices

1. **Always use a reference slide** for Macenko stain normalization — pick a well-stained, representative slide from your dataset
2. **Set tissue_percent >= 70%** — Lower thresholds include too much background; higher thresholds may miss edge regions
3. **Verify tile quality** — Spot-check extracted tiles visually; tissue detection can miss pen marks, folds, or artifacts
4. **Use consistent tile sizes** — Stick to 256x256 or 512x512 to match common pretrained model input sizes

## Common Pitfalls

- **OpenSlide not installed**: histolab depends on OpenSlide for reading WSI formats. Install via `conda install -c conda-forge openslide`.
- **Memory issues with large WSIs**: Use thumbnail-level operations when possible; only load full-resolution for tile extraction.
- **Inconsistent stain normalization**: If your reference slide has artifacts, all normalized slides will inherit them. Curate the reference carefully.
- **File naming collisions**: Use unique `prefix` values for each tiler to avoid overwriting tiles from different slides.

## Integration with HBE

- Use with `/hbe-plan` for designing histopathology study protocols
- Pair with `references/tools/pathml.md` for alternative WSI processing pipeline
- Combine with `references/tools/tifffile.md` for reading WSI metadata and multi-resolution pyramids
- See `references/tools/pillow.md` for custom image transformations and post-processing

## Resources

- Documentation: https://histolab.readthedocs.io/
- GitHub: https://github.com/histolab/histolab
- Paper: Semaan, E. et al. (2022). histolab: a Python library for Digital Pathology. JMLR, 23(221), 1-8.
- OpenSlide: https://openslide.org/
