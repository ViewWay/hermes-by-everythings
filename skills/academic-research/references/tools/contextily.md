---
name: contextily
description: Contextual basemaps for geospatial plots — add web tile maps to matplotlib/geopandas figures
domain: Social Science / Geography
install: pip install contextily
---

# contextily — Contextual Basemaps for Geospatial Plots

Contextily adds contextual basemaps (web map tiles) to matplotlib axes and geopandas plots. It supports dozens of tile providers (OpenStreetMap, Stamen, CartoDB, ESRI) and handles CRS reprojection automatically, making it essential for publication-quality geospatial figures.

## When to Use

- Adding geographic context (streets, terrain, satellite imagery) to spatial data plots
- Creating publication-quality maps for social science, epidemiology, or urban studies papers
- Overlaying point data (events, facilities, survey sites) on real-world basemaps
- Comparing spatial distributions across regions with consistent basemap styling
- Generating figures with proper CRS handling for geospatial analyses

## Quick Start

```python
import contextily as ctx
import geopandas as gpd
import matplotlib.pyplot as plt

# Load a GeoDataFrame with your spatial data
gdf = gpd.read_file("data/health_facilities.geojson")

# Plot data and add basemap — contextily handles CRS conversion
fig, ax = plt.subplots(figsize=(10, 8))
gdf = gdf.to_crs(epsg=3857)  # project to Web Mercator (required for tile maps)
gdf.plot(ax=ax, column="facility_type", legend=True, alpha=0.7, markersize=50)
ctx.add_basemap(ax, source=ctx.providers.OpenStreetMap.Mapnik)
ax.set_axis_off()
plt.savefig("facilities_map.pdf", bbox_inches="tight", dpi=300)
```

## Core Capabilities

### Tile Providers

```python
import contextily as ctx

# Built-in tile providers (no API key required)
providers = {
    "osm": ctx.providers.OpenStreetMap.Mapnik,
    "carto_light": ctx.providers.CartoDB.Positron,
    "carto_dark": ctx.providers.CartoDB.DarkMatter,
    "stamen_terrain": ctx.providers.Stamen.Terrain,
    "stamen_toner": ctx.providers.Stamen.Toner,
    "esri_world": ctx.providers.Esri.WorldImagery,     # satellite
    "esri_topo": ctx.providers.Esri.WorldTopoMap,
    "carto_voyager": ctx.providers.CartoDB.Voyager,
}

# Use a provider
ax = gdf.to_crs(epsg=3857).plot(figsize=(10, 10), alpha=0.6)
ctx.add_basemap(ax, source=ctx.providers.CartoDB.Positron)

# Add a custom tile URL (e.g., your own tile server)
custom_url = "https://tiles.example.com/{z}/{x}/{y}.png"
ctx.add_basemap(ax, source=custom_url)

# Zoom level control — higher = more detail
ctx.add_basemap(ax, source=ctx.providers.OpenStreetMap.Mapnik, zoom=12)
```

### CRS Handling and Reprojection

```python
import geopandas as gpd
import contextily as ctx

# Data in WGS84 (lat/lon) — contextily converts automatically
gdf = gpd.read_file("data/survey_sites.geojson")  # assumed EPSG:4326

fig, axes = plt.subplots(1, 2, figsize=(16, 7))

# Left: reproject to Web Mercator for basemap overlay
ax1 = gdf.to_crs(epsg=3857).plot(ax=axes[0], color="red", markersize=80, alpha=0.7)
ctx.add_basemap(ax1, source=ctx.providers.CartoDB.Positron)
axes[0].set_title("Survey Sites with Basemap")

# Right: get basemap as raster and overlay on original CRS
west, south, east, north = gdf.total_bounds
img, ext = ctx.bounds2img(west, south, east, north, ll=True,
                           source=ctx.providers.Stamen.Terrain, zoom=10)
axes[1].imshow(img, extent=ext, aspect="auto")
gdf.plot(ax=axes[1], color="red", markersize=80, alpha=0.7)
axes[1].set_xlim(west, east)
axes[1].set_ylim(south, north)
axes[1].set_title("Survey Sites (WGS84)")
```

### Saving Maps at High Resolution

```python
import contextily as ctx
import geopandas as gpd
import matplotlib.pyplot as plt

gdf = gpd.read_file("data/study_area.geojson").to_crs(epsg=3857)

fig, ax = plt.subplots(1, 1, figsize=(12, 10))
gdf.plot(ax=ax, column="value", cmap="YlOrRd", legend=True, edgecolor="k", alpha=0.8)
ctx.add_basemap(ax, source=ctx.providers.CartoDB.PositronNoLabels, zoom=11,
                attribution="")  # remove attribution for clean figure
ax.set_axis_off()

# Save at publication quality
plt.savefig("figure_map.pdf", bbox_inches="tight", dpi=600, pad_inches=0.1)
plt.savefig("figure_map.png", bbox_inches="tight", dpi=300, pad_inches=0.1)
```

## Common Academic Workflow: Choropleth Map with Basemap

```python
import geopandas as gpd
import contextily as ctx
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors

# 1. Load shapefile and merge with attribute data
gdf = gpd.read_file("data/census_tracts.shp")
gdf = gdf.merge(health_data, left_on="GEOID", right_on="tract_id")

# 2. Reproject to Web Mercator
gdf = gdf.to_crs(epsg=3857)

# 3. Create choropleth with basemap
fig, ax = plt.subplots(figsize=(14, 10))
gdf.plot(
    ax=ax,
    column="hospitalization_rate",
    cmap="RdYlGn_r",
    legend=True,
    legend_kwds={"label": "Rate per 10,000", "shrink": 0.6},
    edgecolor="white",
    linewidth=0.3,
    alpha=0.85,
)
ctx.add_basemap(ax, source=ctx.providers.CartoDB.PositronNoLabels, zoom=10,
                attribution="CartoDB | Census Bureau")
ax.set_title("Hospitalization Rates by Census Tract", fontsize=14, fontweight="bold")
ax.set_axis_off()
plt.tight_layout()
plt.savefig("figures/choropleth_basemap.pdf", dpi=600, bbox_inches="tight")
```

## Best Practices

- **Always reproject to EPSG:3857** before adding basemaps — web tiles use Web Mercator.
- **Use `PositronNoLabels`** for clean figures where basemap text would clutter your data labels.
- **Set `zoom` explicitly** to control detail level; auto-zoom can sometimes produce blurry tiles.
- **Use `CartoDB.Positron` or `Stamen.Toner`** for academic figures — they are clean, professional, and free.
- **Save as PDF** for vector quality in LaTeX papers; PNG at 300+ DPI for raster needs.

## Common Pitfalls

- **Forgetting CRS conversion**: Tiles are in EPSG:3857 (Web Mercator). If your data is in EPSG:4326, you must call `to_crs(epsg=3857)` first.
- **Tile provider limits**: Some providers (e.g., Stamen) may rate-limit or require API keys at high request volumes.
- **Zoom level mismatch**: Too low a zoom gives blurry tiles; too high wastes bandwidth. Test with `zoom="auto"` first, then set manually.
- **Attribution**: Most tile providers require attribution. Remove it only for final figures where the source is cited elsewhere.

## Integration with HBE

- Use within `workflows/experiment-design.md` for spatial study design and map generation
- Pair with `references/tools/geopandas.md` for spatial data handling and manipulation
- Combine with `references/tools/matplotlib.md` for advanced map customization and layout
- Use alongside `references/tools/cartopy.md` for projections beyond Web Mercator

## Resources

- Documentation: https://contextily.readthedocs.io/
- Tile providers list: https://contextily.readthedocs.io/en/stable/providers_deepdive.html
- Source: https://github.com/geopandas/contextily
