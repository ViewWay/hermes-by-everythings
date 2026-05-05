---
name: img2dataset
description: Image dataset creation — download and process image datasets from URLs at scale with parallel downloading and deduplication
domain: ML / Dataset
install: pip install img2dataset 2>/dev/null || echo "See documentation"
---

# img2dataset — Image Dataset Creation from URLs

## Overview

Img2dataset downloads and processes large-scale image datasets from URL lists (e.g., Common Crawl, LAION). It handles parallel downloading, image resizing, format conversion (WebP, JPEG, PNG), deduplication via perceptual hashing, and outputs in various formats (TFRecord, WebDataset, Parquet). Essential for training vision models, building multimodal datasets, and reproducing large-scale ML experiments.

## When to Use

- Creating training datasets for image classification, generation, or multimodal models
- Downloading images from Common Crawl, LAION, or custom URL lists at scale
- Preprocessing images (resize, crop, encode) for consistent model input
- Deduplicating image datasets to remove near-duplicates
- Converting between dataset formats (TFRecord, WebDataset, Parquet)

## Quick Start

```bash
# Basic usage: download images from a TSV/CSV file with URL column
img2dataset --url_list=urls.tsv \
            --url_col=url \
            --caption_col=caption \
            --output_folder=output_dataset \
            --processes_count=16 \
            --thread_count=32 \
            --image_size=256 \
            --output_format=webdataset

# Input TSV format (urls.tsv):
# url	caption
# https://example.com/img1.jpg	A cat sitting on a chair
# https://example.com/img2.jpg	Abstract painting
```

## Core Capabilities

### 1. URL List Processing

```bash
# The input file can be TSV, CSV, or JSONL with URL and optional caption columns

# TSV format (default)
img2dataset --url_list=laion_subset.tsv \
            --url_col=URL \
            --caption_col=TEXT \
            --output_folder=laion_data \
            --output_format=webdataset

# CSV format
img2dataset --url_list=custom_urls.csv \
            --url_col=image_url \
            --caption_col=description \
            --output_format=tfrecord

# JSONL format
img2dataset --url_list=metadata.jsonl \
            --url_col=image_url \
            --caption_col=text \
            --output_format=parquet

# JSONL input format:
# {"image_url": "https://...", "text": "description", "width": 800, "height": 600}
```

```python
# Programmatic API usage
from img2dataset import download

download(
    url_list="urls.tsv",
    url_col="url",
    caption_col="caption",
    output_folder="output",
    image_size=512,
    resize_mode="keep_aspect_ratio",
    output_format="webdataset",
    processes_count=16,
    thread_count=32,
    number_sample_per_shard=1000,
)
```

### 2. Parallel Downloading and Processing

```bash
# Scale download with multiple processes and threads
img2dataset --url_list=large_urls.tsv \
            --output_folder=large_dataset \
            --processes_count=32 \
            --thread_count=64 \
            --number_sample_per_shard=10000 \
            --output_format=webdataset \
            --save_additional_columns=["width","height","exif"]

# Download with retry and timeout settings
img2dataset --url_list=urls.tsv \
            --output_folder=robust_dataset \
            --timeout=30 \
            --enable_wandb=false \
            --compute_md5=true \
            --min_image_size=100 \
            --max_image_size=10000

# Key performance parameters:
# --processes_count: Number of download processes (set to CPU cores)
# --thread_count:    Async HTTP threads per process (set to 2-4x processes)
# --timeout:         HTTP request timeout in seconds
# --number_sample_per_shard: Images per output shard file
```

### 3. Resizing, Format Conversion, and Deduplication

```bash
# Resize options
img2dataset --url_list=urls.tsv \
            --output_folder=resized_dataset \
            --image_size=224 \
            --resize_mode=center_crop     # Options: center_crop, keep_aspect_ratio, border
            --resize_only_if_bigger=true  # Skip upscaling small images

# Output format options
# webdataset:  .tar files with .jpg and .txt (caption) inside
# tfrecord:    TensorFlow TFRecord files
# parquet:     Parquet files with image bytes
# files:       Individual image files on disk

img2dataset --url_list=urls.tsv \
            --output_folder=webdataset_output \
            --output_format=webdataset \
            --encode_format=webp   # Options: png, jpg, webp
            --encode_quality=85

# Perceptual deduplication (after initial download)
# Use pyimagehash or datasketch for post-download dedup
img2dataset --url_list=urls.tsv \
            --output_folder=dedup_dataset \
            --output_format=webdataset \
            --compute_md5=true
```

```python
# Post-download deduplication using perceptual hashing
import imagehash
from PIL import Image
from pathlib import Path
import pandas as pd

def deduplicate_images(image_dir, hash_size=8, threshold=5):
    """Remove near-duplicate images using perceptual hashing."""
    hashes = {}
    duplicates = []

    for img_path in Path(image_dir).rglob("*.jpg"):
        try:
            img = Image.open(img_path)
            h = imagehash.phash(img, hash_size=hash_size)
            is_dup = False
            for existing_hash, existing_path in hashes.items():
                if h - existing_hash < threshold:
                    duplicates.append(str(img_path))
                    is_dup = True
                    break
            if not is_dup:
                hashes[h] = str(img_path)
        except Exception:
            pass

    print(f"Total: {len(hashes) + len(duplicates)}, Unique: {len(hashes)}, Duplicates: {len(duplicates)}")
    return duplicates

dups = deduplicate_images("output_dataset")
```

## Common Academic Workflow

### Building a Training Dataset from Scratch

```bash
#!/bin/bash
# Step 1: Prepare URL list (TSV with url and caption columns)
# Assume we have a file `image_metadata.tsv` with columns: url, caption, source

# Step 2: Download and process with img2dataset
img2dataset \
    --url_list=image_metadata.tsv \
    --url_col=url \
    --caption_col=caption \
    --output_folder=training_dataset \
    --processes_count=16 \
    --thread_count=32 \
    --image_size=256 \
    --resize_mode=center_crop \
    --output_format=webdataset \
    --encode_format=webp \
    --encode_quality=80 \
    --min_image_size=128 \
    --max_image_size=4096 \
    --save_additional_columns=source \
    --number_sample_per_shard=5000

# Step 3: Verify the output
echo "Output structure:"
find training_dataset -type f -name "*.tar" | head -5
echo "Total shards:"
find training_dataset -type f -name "*.tar" | wc -l

# Step 4: Post-process deduplication (if needed)
# Run the Python deduplication script on extracted images

# Step 5: Create train/val split
# For WebDataset, simply move N shards to a val/ directory
```

## Key Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `processes_count` | `1` | Number of parallel download processes |
| `thread_count` | `256` | Async threads per process |
| `image_size` | `256` | Output image resolution (square) |
| `resize_mode` | `center_crop` | `center_crop`, `keep_aspect_ratio`, `border` |
| `output_format` | `webdataset` | `webdataset`, `tfrecord`, `parquet`, `files` |
| `encode_format` | `jpg` | `jpg`, `png`, `webp` |
| `min_image_size` | `0` | Skip images smaller than this |
| `number_sample_per_shard` | `1000` | Images per output shard |

## Best Practices

1. **Start with a small subset**: Test on 1000 URLs first to verify URL validity, encoding, and output format before scaling to millions.
2. **Monitor disk space**: Large datasets can consume terabytes. Pre-calculate: `N_images * avg_bytes_per_image * 1.5` (overhead).
3. **Use WebDataset format**: For training with PyTorch, WebDataset enables streaming without loading entire dataset into memory.
4. **Set min_image_size**: Filter out icons, thumbnails, and broken images with `--min_image_size=128` or higher.
5. **Verify downloads**: Use `--compute_md5=true` to detect corrupted downloads. Check `--number_sample_per_shard` for consistent shard sizes.

## Common Pitfalls

1. **URL expiry**: Many image URLs (especially from social media) expire quickly. Download soon after URL list creation.
2. **Rate limiting and blocking**: Aggressive parallel downloads can trigger IP bans. Use proxies, reduce thread count, or add delays.
3. **Insufficient bandwidth**: Downloading 100M images at 100KB each = 10TB. Ensure network and disk I/O can sustain the throughput.
4. **Memory pressure**: Very large `thread_count` values can exhaust RAM. Start with 64 threads per process and scale up.
5. **Shard size mismatch**: Too-small shards cause overhead; too-large shards waste memory on restart. 1000-10000 images per shard is typical.

## Integration with HBE

- Combine with `references/pillow.md` for custom image preprocessing before or after download
- Feed into `references/torch-geometric.md` for graph-based image analysis
- Use with `references/pytorch-lightning.md` for training pipelines on the downloaded dataset
- Supports `references/dask.md` for distributed processing of very large datasets

## Resources

- GitHub: https://github.com/rom1504/img2dataset
- PyPI: https://pypi.org/project/img2dataset/
- WebDataset spec: https://github.com/webdataset/webdataset
- LAION dataset: https://laion.ai/blog/laion-5b/
- Common Crawl: https://commoncrawl.org/
