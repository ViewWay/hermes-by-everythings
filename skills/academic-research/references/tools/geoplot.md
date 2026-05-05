---
name: geoplot
description: High-level geospatial visualization — cartograms, KDE plots, choropleth, and Voronoi on maps
domain: Social Science / Economics
install: pip install geoplot
---

# geoplot — High-Level Geospatial Visualization / 地理空间可视化

High-level API for creating publication-quality geospatial plots built on matplotlib and geopandas. Supports choropleth, cartogram, KDE, Voronoi, sankey, and pointplot map types with multiple projections.

## When to Use / 适用场景

- Mapping regional economic indicators (GDP per capita, poverty rates) across administrative boundaries / 绘制区域经济指标
- Visualizing spatial point density for event data (crime, disease outbreaks, retail locations) / 可视化空间点密度
- Comparing geographic distributions via cartogram distortion / 通过卡图变形比较地理分布
- Producing flow/sankey maps for migration, trade, or commuting patterns / 绘制迁移、贸易流图
- Creating polygon or Voronoi tessellation maps for spatial analysis / 创建多边形或 Voronoi 镶嵌图
- Supplementing regression discontinuity or spatial econometrics papers with maps / 为空间计量经济学论文提供地图

## Quick Start / 快速开始

```python
import geoplot as gplt
import geoplot.crs as gcrs
import geopandas as gpd

# Load built-in datasets
boroughs = gpd.read_file(gplt.datasets.get_path("nyc_boroughs"))
collisions = gpd.read_file(gplt.datasets.get_path("nyc_collision_factors"))

# Choropleth: color polygons by variable
gplt.choropleth(
    boroughs, hue="Shape_Area", cmap="viridis",
    legend=True, legend_kwargs={"loc": "lower left"},
    edgecolor="white", linewidth=0.5
)

# KDE plot: kernel density estimation on map
gplt.kdeplot(
    collisions, shade=True, cmap="Reds",
    projection=gcrs.AlbersEqualArea(), clip=boroughs
)

# Pointplot: scatter points with hue encoding
gplt.pointplot(
    collisions.sample(500), hue="BOROUGH",
    legend=True, projection=gcrs.WebMercator()
)
```

## Core Capabilities / 核心能力

### 1. Choropleth Maps / 等值线图

Choropleths shade geographic polygons by a numeric variable. Essential for mapping regional statistics.

```python
import geopandas as gpd
import geoplot as gplt
import matplotlib.pyplot as plt

# Load shapefile with socioeconomic data
gdf = gpd.read_file("data/census_tracts.geojson")
gdf["income_per_capita"] = gdf["median_income"] / gdf["population"]

fig, ax = plt.subplots(figsize=(12, 8))
gplt.choropleth(
    gdf,
    hue="income_per_capita",
    cmap="YlOrRd",
    scheme="quantiles",        # "quantiles", "equal_interval", "fisher_jenks"
    k=7,
    legend=True,
    legend_kwargs={
        "loc": "lower left",
        "fmt": "{:.0f}",
        "title": "Income per Capita ($)"
    },
    edgecolor="black",
    linewidth=0.2,
    ax=ax
)
ax.set_title("Regional Income Inequality", fontsize=14)
plt.savefig("figures/choropleth_income.pdf", bbox_inches="tight", dpi=300)
```

### 2. Cartograms / 卡图变形

Cartograms distort polygon area proportional to a variable, revealing patterns obscured by geographic size.

```python
import geoplot as gplt
import geopandas as gpd

gdf = gpd.read_file("data/us_states.geojson")

# Population cartogram: state area proportional to population
gplt.cartogram(
    gdf,
    scale="population",
    projection=gcrs.AlbersEqualArea(),
    hue="population",
    cmap="Blues",
    legend=True,
    limits=(0.2, 2.0),  # scale limits to prevent extreme distortion
    trace_edges=True     # draw original boundaries faintly
)
```

### 3. KDE Plots / 核密度估计图

KDE plots overlay a smooth density surface on a basemap for continuous spatial distributions.

```python
import geopandas as gpd
import geoplot as gplt
import geoplot.crs as gcrs

points = gpd.read_file("data/hospital_locations.geojson")
boundary = gpd.read_file("data/country_boundary.geojson")

gplt.kdeplot(
    points,
    shade=True,
    cmap="magma",
    clip=boundary,                    # clip density to study area
    projection=gcrs.PlateCarree(),
    shade_lowest=False,
    levels=20,
    alpha=0.7
)
```

### 4. Sankey Flow Maps / 桑基流向图

Sankey maps show directed flows between geographic origins and destinations (migration, trade).

```python
import geoplot as gplt
import geopandas as gpd

origins = gpd.read_file("data/origin_cities.geojson")
destinations = gpd.read_file("data/destination_cities.geojson")
flows = gpd.read_file("data/migration_flows.geojson")

gplt.sankey(
    origins, destinations, flows,
    scale="flow_volume",
    hue="flow_volume",
    cmap="viridis",
    legend=True,
    linewidth=1.5
)
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Regional Economic Inequality Map / 区域经济不平等可视化

```python
import geopandas as gpd
import geoplot as gplt
import geoplot.crs as gcrs
import matplotlib.pyplot as plt

# 1. Load and merge data
shapefile = gpd.read_file("data/admin_boundaries.gpkg")
census = pd.read_csv("data/census_indicators.csv")
gdf = shapefile.merge(census, on="region_id", how="left")

# 2. Compute inequality metric (e.g., Gini coefficient proxy)
gdf["income_ratio"] = gdf["top10_income"] / gdf["bottom50_income"]

# 3. Multi-panel figure
fig, axes = plt.subplots(1, 2, figsize=(16, 7))

# Panel A: Choropleth
gplt.choropleth(
    gdf, hue="income_ratio", cmap="RdYlGn_r", scheme="fisher_jenks",
    k=6, legend=True, edgecolor="white", linewidth=0.3, ax=axes[0]
)
axes[0].set_title("(a) Top-10 / Bottom-50 Income Ratio", fontsize=12)

# Panel B: Cartogram
gplt.cartogram(
    gdf, scale="population", hue="income_ratio", cmap="RdYlGn_r",
    limits=(0.3, 1.8), trace_edges=True, ax=axes[1]
)
axes[1].set_title("(b) Population-Scaled Cartogram", fontsize=12)

plt.tight_layout()
plt.savefig("figures/fig2_inequality_map.pdf", bbox_inches="tight", dpi=300)
```

## Best Practices / 最佳实践

- **Choose classification scheme deliberately**: `quantiles` prevents outlier dominance; `fisher_jenks` minimizes within-class variance; `equal_interval` is transparent but sensitive to skew / 根据数据分布选择分类方案
- **Project to equal-area CRS for choropleths**: Raw lat/lon (EPSG:4326) distorts area; use EPSG:6933 (world equal-area) or EPSG:5070 (US) / 等面积投影避免面积失真
- **Use perceptually uniform colormaps**: `viridis`, `cividis`, `magma` are colorblind-safe; avoid `jet` / 使用色盲安全的感知均匀色图
- **Always include a legend with units**: Specify `legend_kwargs={"fmt": ..., "title": ...}` to label the gradient / 图例标注单位
- **Clip KDE to study boundary**: Use `clip=` parameter to prevent density bleeding across water or outside study area / 用 clip 限制密度范围

## Common Pitfalls / 常见陷阱

- **Projection mismatch**: Plotting EPSG:4326 data with `projection=gcrs.WebMercator()` silently distorts areas. Reproject with `gdf = gdf.to_crs("EPSG:6933")` before plotting / 投影不匹配导致面积失真
- **Large shapefiles crash matplotlib**: Simplify geometry first with `gdf.simplify(tolerance=0.01)` or use `geopandas.sjoin` to filter to study area / 大型矢量文件需简化几何
- **Missing CRS**: `gdf.crs` is None for many CSV-merged GeoDataFrames. Always assign with `gdf.set_crs("EPSG:4326")` / 合并后需重新设定坐标系
- **Choropleth with raw counts**: Population-weighted variables (e.g., total crimes) produce misleading maps. Normalize to rates (per 100k) before mapping / 原始计数需标准化为比率
- **geoplot deprecated in favor of contextily**: For basemap tiles, use `contextily.add_basemap(ax, source=contextily.providers.CartoDB.Positron)` / 底图建议用 contextily

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for spatial study design and map figure planning
- Pair with `references/tools/geopandas.md` for spatial data preparation and CRS management
- Combine with `references/tools/matplotlib.md` for multi-panel figure assembly and publication formatting
- Export to PDF via `references/tools/inkscape-cli.md` for LaTeX-compatible vector output

## Resources / 资源

- Documentation: https://residentmario.github.io/geoplot/
- GeoPandas (dependency): https://geopandas.org/
- Contextily basemaps: https://contextily.readthedocs.io/
- Natural Earth shapefiles: https://www.naturalearthdata.com/
- ColorBrewer palettes: https://colorbrewer2.org/
