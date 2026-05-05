---
name: fenics
description: Finite element PDE solver — variational formulation, mesh generation, and adaptive refinement for scientific computing
domain: Physics / Engineering
install: pip install fenics
---

# fenics — Finite Element Method Solver / 有限元偏微分方程求解器

FEniCS provides a high-level Python/C++ interface for solving PDEs using the finite element method, translating variational forms directly from mathematical notation into efficient compiled code via the Unified Form Language (UFL).

## When to Use / 适用场景

- Solving elliptic, parabolic, and hyperbolic PDEs with weak/variational formulations (用弱/变分形式求解椭圆型、抛物型和双曲型偏微分方程)
- Simulating structural mechanics (elasticity), fluid dynamics (Navier-Stokes), and heat transfer (模拟结构力学、流体动力学和传热)
- Performing convergence analysis with mesh refinement studies for numerical methods papers (通过网格细化研究进行收敛性分析)
- Solving coupled multi-physics problems (e.g., thermoelasticity, fluid-structure interaction) (求解耦合多物理场问题)
- Generating publication-quality finite element results with error estimation (生成带误差估计的出版级有限元结果)

## Quick Start / 快速开始

```python
from dolfin import *
import matplotlib.pyplot as plt

# Define mesh and function space
mesh = UnitSquareMesh(32, 32)
V = FunctionSpace(mesh, "P", 1)

# Boundary condition: u = 1 + x^2 + 2y^2 on boundary
u_D = Expression("1 + x[0]*x[0] + 2*x[1]*x[1]", degree=2)

def boundary(x, on_boundary):
    return on_boundary

bc = DirichletBC(V, u_D, boundary)

# Variational problem: -Laplace(u) = f
u = TrialFunction(V)
v = TestFunction(V)
f = Constant(-6.0)
a = dot(grad(u), grad(v)) * dx
L = f * v * dx

# Compute solution
u = Function(V)
solve(a == L, u, bc)

# Compute error against exact solution
error_L2 = errornorm(u_D, u, norm_type="L2", degree_rise=3)
vertex_values_u_D = u_D.compute_vertex_values(mesh)
vertex_values_u = u.compute_vertex_values(mesh)
error_max = np.max(np.abs(vertex_values_u_D - vertex_values_u))
print(f"L2 error: {error_L2:.2e}, Max error: {error_max:.2e}")

# Plot
plot(u, title="Solution")
plt.show()
```

## Core Capabilities / 核心能力

### 1. Variational Formulation and Boundary Conditions / 变分形式与边界条件

FEniCS uses UFL to express PDEs in their weak form directly in Python.

```python
from dolfin import *

# Mixed function space for vector-valued problems (e.g., elasticity)
mesh = UnitCubeMesh(16, 16, 16)
V = VectorFunctionSpace(mesh, "P", 1)  # displacement field

# Dirichlet BC on a specific boundary
u_D = Constant((0.0, 0.0, 0.0))
def left_boundary(x, on_boundary):
    return near(x[0], 0.0) and on_boundary
bc_left = DirichletBC(V, u_D, left_boundary)

# Neumann BC (natural boundary condition) — applied via surface integral
# e.g., traction T on right face
T = Constant((0.0, -1.0, 0.0))  # downward traction

# Weak form for linear elasticity
u = TrialFunction(V)
v = TestFunction(V)
f = Constant((0.0, 0.0, -9.81))  # gravity

# Stress-strain relation (isotropic, E=1e3, nu=0.3)
E, nu = 1e3, 0.3
mu = E / (2 * (1 + nu))
lmbda = E * nu / ((1 + nu) * (1 - 2 * nu))

def epsilon(u):
    return 0.5 * (grad(u) + grad(u).T)

def sigma(u):
    return lmbda * tr(epsilon(u)) * Identity(d=3) + 2 * mu * epsilon(u)

a = inner(sigma(u), epsilon(v)) * dx
L = dot(f, v) * dx + dot(T, v) * ds  # ds = boundary integral (Neumann)

u = Function(V)
solve(a == L, u, bc_left)
```

### 2. Time-Dependent PDEs / 时变偏微分方程

```python
from dolfin import *

# Heat equation: du/dt - Laplace(u) = f
mesh = UnitSquareMesh(64, 64)
V = FunctionSpace(mesh, "P", 1)

T = 2.0          # total time
num_steps = 200  # number of time steps
dt = T / num_steps

# Initial condition
u_n = interpolate(Constant(0.0), V)

# Variational form (backward Euler)
u = Function(V)
v = TestFunction(V)
f = Constant(1.0)

F = u * v * dx + dt * dot(grad(u), grad(v)) * dx - (u_n + dt * f) * v * dx

# Time-stepping loop
import numpy as np
for n in range(num_steps):
    solve(F == 0, u,
          DirichletBC(V, Constant(0.0), "on_boundary"))
    u_n.assign(u)
    if n % 20 == 0:
        t = (n + 1) * dt
        print(f"t = {t:.3f}, max u = {u.vector().max():.4f}")
```

### 3. Adaptive Mesh Refinement / 自适应网格细化

```python
from dolfin import *

# Solve Poisson equation with singularity near origin
mesh = UnitSquareMesh(8, 8)
V = FunctionSpace(mesh, "P", 1)

u_D = Expression("sqrt(x[0]*x[0] + x[1]*x[1])", degree=3)

def boundary(x, on_boundary):
    return on_boundary

f = Constant(0.0)

for i in range(5):  # 5 refinement cycles
    u = TrialFunction(V)
    v = TestFunction(V)
    a = dot(grad(u), grad(v)) * dx
    L = f * v * dx

    u = Function(V)
    bc = DirichletBC(V, u_D, boundary)
    solve(a == L, u, bc)

    # Error indicator (Kelly)
    mobile = Function(V)
    mobile.vector()[:] = 1.0  # mark all cells as mobile
    markers = AdaptiveMesh(mesh, mobile)
    # Use built-in error estimate
    error = (u_D - u)**2 * dx
    error_est = assemble(error)
    print(f"Refinement {i+1}: {mesh.num_cells()} cells, error = {error_est:.4e}")

    # Refine mesh where error is largest
    cell_markers = MeshFunction("bool", mesh, mesh.topology().dim())
    for cell in cells(mesh):
        cell_markers[cell] = False
    # Refine 30% of cells with largest local error
    cell_error = np.array([assemble(
        (u_D - u)**2 * dx(domain=mesh, subdomain_data=cell_markers_subset)
    ) for cell in cells(mesh)])
    threshold = np.percentile(cell_error, 70)
    for idx, cell in enumerate(cells(mesh)):
        cell_markers[cell] = cell_error[idx] > threshold
    mesh = refine(mesh, cell_markers)
    V = FunctionSpace(mesh, "P", 1)
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Heat Equation with Convergence Study / 热方程求解与收敛性分析

```python
from dolfin import *
import numpy as np
import matplotlib.pyplot as plt

# Solve: -Laplace(u) = f, u = u_D on boundary
# Exact solution: u = 1 + x^2 + 2y^2, f = -6
u_D = Expression("1 + x[0]*x[0] + 2*x[1]*x[1]", degree=2)
f = Constant(-6.0)

# Convergence study over mesh resolutions
resolutions = [4, 8, 16, 32, 64, 128]
h_values, L2_errors, H1_errors = [], [], []

for N in resolutions:
    mesh = UnitSquareMesh(N, N)
    V = FunctionSpace(mesh, "P", 1)

    u = TrialFunction(V)
    v = TestFunction(V)
    a = dot(grad(u), grad(v)) * dx
    L = f * v * dx

    u = Function(V)
    bc = DirichletBC(V, u_D, "on_boundary")
    solve(a == L, u, bc)

    h = mesh.hmin()
    L2_err = errornorm(u_D, u, norm_type="L2", degree_rise=3)
    H1_err = errornorm(u_D, u, norm_type="H1", degree_rise=3)

    h_values.append(h)
    L2_errors.append(L2_err)
    H1_errors.append(H1_err)
    print(f"N={N:4d}, h={h:.4e}, L2={L2_err:.4e}, H1={H1_err:.4e}")

# Estimate convergence rates
L2_rates = np.polyfit(np.log(h_values), np.log(L2_errors), 1)[0]
H1_rates = np.polyfit(np.log(h_values), np.log(H1_errors), 1)[0]
print(f"Convergence rates: L2 = {L2_rates:.2f} (expected 2.0), H1 = {H1_rates:.2f} (expected 1.0)")

# Plot convergence
plt.figure(figsize=(8, 5))
plt.loglog(h_values, L2_errors, "o-", label=f"L2 (rate={L2_rates:.2f})")
plt.loglog(h_values, H1_errors, "s-", label=f"H1 (rate={H1_rates:.2f})")
plt.loglog(h_values, [h**2 for h in h_values], "k--", alpha=0.5, label="O(h^2)")
plt.loglog(h_values, [h for h in h_values], "k:", alpha=0.5, label="O(h)")
plt.xlabel("Mesh size h")
plt.ylabel("Error norm")
plt.legend()
plt.grid(True, alpha=0.3)
plt.savefig("convergence_study.pdf", bbox_inches="tight")
```

## Best Practices / 最佳实践

- **Use `Expression` with explicit `degree=`** matching the function space degree — mismatched quadrature degrees cause silent accuracy loss.
- **Report element type, polynomial degree, and mesh resolution** in methods sections (e.g., "P1 Lagrange on 128x128 mesh" or "P2 Taylor-Hood").
- **Verify convergence rates** against analytical solutions before trusting results for problems without known solutions.
- **Use `parameters["form_compiler"]["quadrature_degree"]`** to explicitly set the quadrature order when using nonlinear or high-degree elements.
- **Export to VTK/ParaView** with `File("solution.pvd") << u` for 3D visualization; use `File("solution.pvd") << u` inside time loops for time series.

## Common Pitfalls / 常见陷阱

- **FEniCS vs FEniCSx (dolfinx)** — FEniCS (dolfin) is the legacy version; FEniCSx (dolfinx) is the modern rewrite with a different API. Install FEniCSx via `pip install fenics-dolfinx` if you need the new version. The `solve()` syntax and `Expression` class differ significantly.
- **CFL condition violation** — for time-dependent problems, the time step must satisfy `dt < C * h^2 / D` (parabolic) or `dt < C * h / c` (hyperbolic). Exceeding this causes oscillations and instability.
- **Mixed element spaces for incompressible flow** — using equal-order P1/P1 for velocity/pressure in Stokes/Navier-Stokes leads to spurious pressure modes; use Taylor-Hood P2/P1 or stabilized elements instead.
- **Forgetting to call `u_n.assign(u)` in time loops** — if you reuse the same Function object, you must explicitly copy values; otherwise the initial condition propagates through all time steps.
- **Nonlinear solve divergence** — for nonlinear problems, use `solve(F == 0, u, bc, solver_parameters={"newton_solver": {"relative_tolerance": 1e-6, "maximum_iterations": 50}})` with appropriate tolerances.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for setting up and running finite element simulation campaigns with systematic parameter sweeps.
- Pair with `references/tools/pyvista.md` — export FEniCS solutions to VTK format and visualize with PyVista for interactive 3D exploration.
- Combine with `references/tools/matplotlib.md` for 2D cross-section plots and convergence study figures.

## Resources / 资源

- Documentation (FEniCS): https://fenics.readthedocs.io/
- FEniCSx (dolfinx) Documentation: https://jsdokken.com/dolfinx_docs/
- FEniCS Book (Solving PDEs in Python): https://fenicsproject.org/pub/book/pdf/fenics-book-2011.pdf
- FEniCS Project: https://fenicsproject.org/
