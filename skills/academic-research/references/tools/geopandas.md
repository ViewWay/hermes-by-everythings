---
name: geopandas
description: Geospatial data analysis. Use for working with geographic data (shapefiles, GeoJSON), spatial joins, choropleth maps, and spatial statistics.
domain: geoscience
install: pip install geopandas
---

# GeoPandas: Geospatial Analysis

## Overview

GeoPandas extends pandas for geospatial data — points, lines, polygons with coordinate reference systems (CRS). Essential for geography, urban planning, environmental science, and any research with location data.

## When to Use

- Loading shapefiles, GeoJSON, GeoPackage
- Spatial joins (points in polygons)
- Choropleth and geographic visualization
- Distance and area calculations
- Coordinate transformations

## Quick Start

```python
import geopandas as gpd
import matplotlib.pyplot as plt

# Load data
gdf = gpd.read_file('data.shp')
gdf = gpd.read_file('data.geojson')
gdf = gpd.read_file('data.gpkg')

# From lat/lon
gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df.lon, df.lat), crs='EPSG:4326')

# Basic operations
gdf.crs                   # Coordinate reference system
gdf.bounds                # Bounding box
gdf.area                  # Area (need projected CRS)
gdf.centroid              # Center point

# Reproject
gdf_3857 = gdf.to_crs('EPSG:3857')  # Web Mercator for area calculations

# Plot
gdf.plot(column='value', legend=True, cmap='YlOrRd', figsize=(10, 8))
plt.savefig('map.pdf', dpi=300, bbox_inches='tight')
```

## Core Capabilities

### 1. Spatial Operations

```python
# Spatial join: which points fall in which polygons
joined = gpd.sjoin(points_gdf, polygons_gdf, how='left', predicate='within')

# Buffer (e.g., 1km around points)
gdf_buffer = gdf.to_crs('EPSG:3857').buffer(1000).to_crs('EPSG:4326')

# Intersection
intersection = gpd.overlay(gdf1, gdf2, how='intersection')

# Nearest neighbor
from shapely.ops import nearest_points
```

### 2. Choropleth Maps

```python
fig, ax = plt.subplots(figsize=(10, 8))
gdf.plot(column='gdp_per_capita', ax=ax, legend=True,
         legend_kwds={'label': 'GDP per Capita', 'shrink': 0.6},
         cmap='viridis', edgecolor='black', linewidth=0.3,
         missing_kwds={'color': 'lightgray', 'label': 'No data'})
ax.set_title('GDP per Capita by Region')
ax.axis('off')
fig.savefig('choropleth.pdf', dpi=300, bbox_inches='tight')
```

## Best Practices

1. **Always set CRS**: Data without CRS can't be reprojected
2. **Use projected CRS for area/distance**: EPSG:3857 or local UTM
3. **Simplify geometries**: `gdf.simplify(tolerance=0.01)` for large files

## Integration with HBE

- Geoscience tool in `references/tool-registry.md`
- Supports `references/data-processing-guide.md` for spatial data
- Works with `references/tools/matplotlib.md` for map visualization

## Resources

- Documentation: https://geopandas.org/
- Joris et al. — GeoPandas paper in JOSS
