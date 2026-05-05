---
name: pillow
description: Python Imaging Library — image processing, format conversion, resizing, filtering, and compositing
domain: Data I/O
install: pip install pillow
---

# Pillow — Python Imaging Library / Python 图像处理库

Pillow provides image processing capabilities: reading/writing 30+ formats, resizing, filtering, compositing, drawing, and color space conversion. Essential for figure preparation and image data preprocessing.

## When to Use / 适用场景

- Converting image formats (TIFF→PNG, DICOM→JPG, etc.)
- Batch resizing images for papers or datasets
- Creating composite figures programmatically
- Basic image preprocessing before deep learning
- Adding annotations, labels, and scale bars to microscopy images

## Quick Start / 快速开始

```python
from PIL import Image, ImageFilter, ImageDraw, ImageFont

# Open and inspect
img = Image.open("photo.png")
print(f"Size: {img.size}, Mode: {img.mode}, Format: {img.format}")

# Resize and save
img_resized = img.resize((800, 600), Image.LANCZOS)
img_resized.save("output.jpg", quality=95)

# Convert format
Image.open("input.tif").save("output.png")

# Convert to grayscale
img_gray = img.convert("L")
```

## Core Capabilities / 核心能力

### 1. Image I/O and Format Conversion / 图像读写与格式转换

```python
from PIL import Image

# Read various formats
img = Image.open("photo.jpg")      # JPEG
img = Image.open("scan.tiff")      # TIFF (including multi-page)
img = Image.open("figure.png")     # PNG
img = Image.open("slide.webp")     # WebP

# Save with options
img.save("output.jpg", quality=95)              # JPEG quality
img.save("output.png", optimize=True)           # PNG optimized
img.save("output.tiff", compression="tiff_lzw") # LZW compressed TIFF
img.save("output.pdf", "PDF", resolution=300)   # PDF at 300 DPI

# Multi-page TIFF
img.save("multi.tiff", save_all=True, append_images=[img2, img3])

# Set DPI for publication
img = Image.open("figure.png")
img.save("figure_300dpi.png", dpi=(300, 300))
```

### 2. Resizing and Cropping / 缩放与裁剪

```python
from PIL import Image

img = Image.open("large.png")

# Resize (maintain aspect ratio)
img.thumbnail((800, 600))  # In-place, fits within box
img_resized = img.resize((800, 600), Image.LANCZOS)  # Exact size

# Crop
box = (100, 100, 500, 400)  # (left, upper, right, lower)
img_cropped = img.crop(box)

# Center crop
w, h = img.size
crop_size = min(w, h)
left = (w - crop_size) // 2
top = (h - crop_size) // 2
img_square = img.crop((left, top, left + crop_size, top + crop_size))
```

### 3. Filtering and Enhancement / 滤波与增强

```python
from PIL import Image, ImageFilter, ImageEnhance

img = Image.open("photo.jpg")

# Filters
img_blurred = img.filter(ImageFilter.GaussianBlur(radius=2))
img_sharp = img.filter(ImageFilter.SHARPEN)
img_edge = img.filter(ImageFilter.FIND_EDGES)
img_median = img.filter(ImageFilter.MedianFilter(size=3))

# Enhance
enhancer = ImageEnhance.Contrast(img)
img_high_contrast = enhancer.enhance(1.5)

enhancer = ImageEnhance.Brightness(img)
img_bright = enhancer.enhance(1.2)

enhancer = ImageEnhance.Sharpness(img)
img_sharp = enhancer.enhance(2.0)
```

### 4. Drawing and Annotations / 绘图与标注

```python
from PIL import Image, ImageDraw, ImageFont

# Create image
img = Image.new("RGB", (800, 400), "white")
draw = ImageDraw.Draw(img)

# Text
draw.text((10, 10), "Figure 1: Results", fill="black")

# With font
font = ImageFont.truetype("Arial.ttf", 24)
draw.text((10, 50), "Title", fill="blue", font=font)

# Shapes
draw.rectangle([50, 100, 750, 350], outline="black", width=2)
draw.line([(50, 225), (750, 225)], fill="gray", width=1)
draw.ellipse([350, 150, 450, 250], outline="red", width=2)

# Scale bar for microscopy
bar_length_px = 100
bar_y = 350
draw.line([(50, bar_y), (50 + bar_length_px, bar_y)], fill="white", width=3)
draw.text((55, bar_y - 15), "10 μm", fill="white", font=font)

img.save("annotated.png")
```

### 5. Composite Figures / 组合图

```python
from PIL import Image

# Create multi-panel figure
panel_w, panel_h = 400, 300
cols, rows = 3, 2
margin = 20

canvas_w = cols * panel_w + (cols + 1) * margin
canvas_h = rows * panel_h + (rows + 1) * margin
canvas = Image.new("RGB", (canvas_w, canvas_h), "white")

panels = ["fig_a.png", "fig_b.png", "fig_c.png", "fig_d.png", "fig_e.png", "fig_f.png"]
for i, path in enumerate(panels):
    img = Image.open(path).resize((panel_w, panel_h), Image.LANCZOS)
    row, col = divmod(i, cols)
    x = margin + col * (panel_w + margin)
    y = margin + row * (panel_h + margin)
    canvas.paste(img, (x, y))

canvas.save("composite_figure.png", dpi=(300, 300))
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Batch Image Processing for Publication / 批量图片处理

```python
from PIL import Image
from pathlib import Path

def prepare_for_publication(input_dir, output_dir, target_dpi=300, max_width=1800):
    """Resize images for journal submission."""
    Path(output_dir).mkdir(exist_ok=True)
    
    for img_path in Path(input_dir).glob("*.[pj][np][g]*"):
        img = Image.open(img_path)
        
        # Convert to RGB if necessary
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Resize if wider than max_width
        w, h = img.size
        if w > max_width:
            new_h = int(h * max_width / w)
            img = img.resize((max_width, new_h), Image.LANCZOS)
        
        # Save at target DPI
        output_path = Path(output_dir) / img_path.name
        img.save(output_path, dpi=(target_dpi, target_dpi), quality=95)
        print(f"Processed {img_path.name}: {img.size}")

prepare_for_publication("raw_figures/", "pub_figures/")
```

## Best Practices / 最佳实践

- Use `Image.LANCZOS` for high-quality downsampling
- Set DPI to 300 for print publications
- Convert RGBA to RGB before saving as JPEG (no alpha channel)
- Use `thumbnail()` for memory-efficient batch resizing (in-place)

## Common Pitfalls / 常见陷阱

- **JPEG artifacts**: Avoid multiple JPEG save/load cycles; use PNG/TIFF for intermediate
- **Color mode**: RGB for screen, CMYK for print; convert carefully
- **16-bit images**: Pillow converts to 8-bit; use `tifffile` for 16-bit+ images
- **Memory**: Large images consume significant RAM; process in tiles or use `Image.MAX_IMAGE_PIXELS`

## Integration with HBE / 与 HBE 集成

- Preprocess images for `references/tools/pydicom.md` medical imaging workflows
- Pair with `references/tools/matplotlib.md` for figure post-processing
- Combine with `references/tools/tifffile.md` for microscopy image stacks

## Resources / 资源

- Documentation: https://pillow.readthedocs.io/
- Tutorial: https://pillow.readthedocs.io/en/stable/handbook/tutorial.html
