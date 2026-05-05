---
name: pyvista
description: 3D scientific visualization library — mesh analysis, surface plotting, volume rendering, and VTK pipeline integration
domain: Physics / Engineering
install: pip install pyvista
---

# pyvista — 3D Scientific Visualization / 三维科学可视化

PyVista provides a high-level API for VTK, enabling interactive 3D visualization of meshes, scalar/vector fields, and volumetric data in both Jupyter notebooks and scripts.

## When to Use / 适用场景

- Visualizing FEM/CFD simulation results (stress fields, velocity fields, pressure distributions) (可视化有限元/计算流体力学仿真结果)
- Rendering isosurfaces and volume plots from medical imaging or geophysical data (从医学影像或地球物理数据渲染等值面和体绘制)
- Generating publication-quality 3D figures for papers with camera control and lighting (为论文生成出版级三维图形)
- Exploring mesh quality, element types, and boundary conditions interactively (交互式探索网格质量和边界条件)
- Creating animations of time-dependent simulation data (创建时变仿真数据的动画)

## Quick Start / 快速开始

```python
import pyvista as pv
import numpy as np

# Create a structured grid from simulation data
grid = pv.ImageData(dimensions=(50, 50, 50), spacing=(0.1, 0.1, 0.1))
values = np.sin(grid.points[:, 0]) * np.cos(grid.points[:, 1])
grid["temperature"] = values

# Interactive plot with scalar bar
plotter = pv.Plotter()
plotter.add_mesh(grid, scalars="temperature", cmap="coolwarm",
                 show_edges=False, opacity=0.8)
plotter.add_scalar_bar(title="Temperature (K)", shadow=True)
plotter.add_axes()
plotter.show()

# Export for publication
plotter.screenshot("temperature_field.png",
                   transparent_background=False, window_size=(2048, 1536))
```

## Core Capabilities / 核心能力

### 1. Mesh I/O and Creation / 网格读写与创建

PyVista supports VTK, STL, OBJ, PLY, and many other formats for mesh data interchange.

```python
import pyvista as pv

# Read mesh files from simulation software
mesh = pv.read("fem_results.vtk")         # VTK (primary format)
stl_mesh = pv.read("cad_model.stl")       # STL (surface mesh)
obj_mesh = pv.read("scan_data.obj")       # OBJ

# Inspect mesh properties
print(f"Cells: {mesh.n_cells}, Points: {mesh.n_points}")
print(f"Bounds: {mesh.bounds}")
print(f"Cell types: {mesh.celltypes}")

# Create meshes programmatically
sphere = pv.Sphere(radius=1.0, theta_resolution=64, phi_resolution=64)
cylinder = pv.Cylinder(radius=0.5, height=2.0, resolution=64)

# Boolean operations for composite geometries
union = sphere.boolean_union(cylinder)
```

### 2. Scalar and Vector Field Visualization / 标量场与矢量场可视化

```python
import pyvista as pv
import numpy as np

# Load simulation data with scalar and vector fields
mesh = pv.read("cfd_simulation.vtu")

# Scalar field (temperature, pressure, stress)
plotter = pv.Plotter()
plotter.add_mesh(mesh, scalars="von_mises_stress", cmap="jet",
                 scalars_name="Von Mises Stress (MPa)")
plotter.add_scalar_bar(position_x=0.85, position_y=0.1, width=0.05)
plotter.show()

# Vector field (velocity, displacement, force)
plotter = pv.Plotter()
arrows = mesh.glyph(orient="velocity", scale="velocity_magnitude",
                    factor=0.01)
plotter.add_mesh(arrows, color="red", lighting=False)
plotter.add_mesh(mesh, style="wireframe", color="grey", opacity=0.3)
plotter.show()

# Streamlines for flow visualization
streamlines = mesh.streamlines_evenly_spaced_2D(
    vectors="velocity", start_radius=0.5,
    separation_distance=0.2, n_points=50
)
plotter = pv.Plotter()
plotter.add_mesh(streamlines, scalars="velocity_magnitude", cmap="viridis")
plotter.show()
```

### 3. Volume Rendering and Isosurfaces / 体绘制与等值面

```python
import pyvista as pv
import numpy as np

# Volume rendering from structured data
grid = pv.ImageData(dimensions=(100, 100, 100), spacing=(0.02, 0.02, 0.02))
grid["density"] = np.exp(-np.sum((grid.points - [1, 1, 1])**2, axis=1) / 0.5)

plotter = pv.Plotter()
plotter.add_volume(grid, cmap="coolwarm", opacity="sigmoid",
                   clim=[0.0, 1.0])
plotter.show()

# Isosurface extraction
contours = grid.contour(isosurfaces=[0.3, 0.5, 0.7], scalars="density")
plotter = pv.Plotter()
plotter.add_mesh(contours, scalars="density", cmap="plasma",
                 opacity=0.9, show_scalar_bar=True)
plotter.add_mesh(grid.outline(), color="k")
plotter.show()

# Clip and slice for cross-section views
clipped = grid.clip(normal="x", origin=(1.0, 0, 0))
sliced = grid.slice(normal="z", origin=(0, 0, 1.0))
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Visualizing FEM Structural Analysis Results / 可视化有限元结构分析结果

```python
import pyvista as pv
import numpy as np

# Load FEM results (exported from Abaqus/ANSYS via VTK)
mesh = pv.read("structural_analysis.vtk")

# Subplot layout for multi-panel figure
plotter = pv.Plotter(shape=(2, 2))
plotter.subplot(0, 0)
plotter.add_mesh(mesh, scalars="displacement_magnitude",
                 cmap="turbo", show_scalar_bar=True)
plotter.add_title("Displacement (mm)")

plotter.subplot(0, 1)
plotter.add_mesh(mesh, scalars="von_mises_stress",
                 cmap="jet", show_scalar_bar=True)
plotter.add_title("Von Mises Stress (MPa)")

plotter.subplot(1, 0)
warped = mesh.warp_by_scalar("displacement_magnitude", factor=500)
plotter.add_mesh(warped, scalars="von_mises_stress", cmap="jet")
plotter.add_title("Deformed Shape (500x)")

plotter.subplot(1, 1)
plotter.add_mesh(mesh.extract_surface(), style="wireframe",
                 color="black", line_width=1)
plotter.add_title("Mesh Topology")

plotter.link_views()  # synchronize camera angles
plotter.show()

# Animation: sweep through time steps
reader = pv.get_reader("time_series_*.vtk")
plotter = pv.Plotter()
plotter.open_gif("deformation.gif")
for time_step in range(reader.number_time_points):
    reader.set_active_time_point(time_step)
    mesh = reader.read()
    warped = mesh.warp_by_scalar("displacement", factor=200)
    plotter.add_mesh(warped, scalars="stress", clim=[0, 350],
                     cmap="jet", show_scalar_bar=False)
    plotter.add_text(f"t = {time_step * 0.01:.2f} s", position="upper_left")
    plotter.write_frame()
    plotter.clear()
plotter.close()
```

## Best Practices / 最佳实践

- **Use `pv.set_plot_theme("document")`** for publication-quality figures — this sets white backgrounds and clean styling suitable for papers.
- **Set `window_size=(2048, 1536)` or higher** in `screenshot()` to generate high-DPI figures for journal submissions.
- **Use `clim=[vmin, vmax]` explicitly** to ensure color scales are consistent across multiple subplots and figures.
- **Call `plotter.link_views()`** when creating multi-panel plots so camera rotation stays synchronized across views.
- **Use `notebook=False`** when running PyVista in scripts (non-Jupyter environments) to spawn a separate rendering window instead of trying inline rendering.
- **Reduce mesh resolution** with `mesh.decimate(target_reduction=0.8)` before plotting extremely dense meshes (>1M cells) to maintain interactive frame rates.

## Common Pitfalls / 常见陷阱

- **Jupyter rendering not showing** — install `ipywidgets` and run `pv.set_jupyter_backend("trame")` or `pv.set_jupyter_backend("static")` depending on your notebook environment.
- **Inconsistent color scales between figures** — always set explicit `clim` and save the colorbar range; never rely on auto-scaling when comparing results.
- **Memory issues with large meshes** — call `mesh.clear_data()` on unused fields and use `extract_surface()` for shell meshes when only surface data is needed.
- **VTK version conflicts** — PyVista tightly couples to VTK; if `pip install pyvista` fails, try `pip install vtk pyvista` together or use `conda install -c conda-forge pyvista`.
- **Glyph filter performance** — for vector fields with >100k points, use `glyph(orient=..., scale=..., factor=..., max_points=5000)` to limit the number of arrows rendered.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` to produce reproducible 3D figures for computational physics/engineering papers.
- Pair with `references/tools/matplotlib.md` for 2D cross-section plots extracted via `mesh.slice()`.
- Combine with `references/tools/fenics.md` — export FEniCS solutions to VTK format and visualize with PyVista.

## Resources / 资源

- Documentation: https://docs.pyvista.org/
- Examples Gallery: https://docs.pyvista.org/examples/index.html
- PyVista Plotting Themes: https://docs.pyvista.org/api/plotting/_autosummary/pyvista.set_plot_theme.html
- GitHub: https://github.com/pyvista/pyvista
