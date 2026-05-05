---
name: fluidsim
description: Fluid dynamics simulation — pseudo-spectral solvers for 2D/3D Navier-Stokes turbulence and geophysical flows
domain: Physics / Engineering
install: pip install fluidsim
---

# fluidsim — Fluid Dynamics Simulation / 流体动力学仿真

Pseudo-spectral solvers for 2D and 3D incompressible Navier-Stokes equations, designed for turbulence research and geophysical fluid dynamics studies.

## When to Use / 适用场景

- Studying 2D or 3D turbulence with energy cascade and spectral analysis (研究二维或三维湍流的能量级联和谱分析)
- Simulating rotating stratified flows for geophysical fluid dynamics (模拟旋转分层流以研究地球物理流体动力学)
- Computing energy spectra, enstrophy, and higher-order turbulence statistics (计算能谱、涡度拟能和高阶湍流统计量)
- Benchmarking new subgrid-scale models against direct numerical simulation (DNS) (用直接数值模拟对新亚网格尺度模型进行基准测试)
- Investigating Rayleigh-Benard convection or shear instabilities (研究瑞利-贝纳德对流或剪切不稳定性)

## Quick Start / 快速开始

```python
# fluidsim uses command-line launchers. The most common usage:
# fluidsim-create --type 2d --solver ns2d.strat --nx 256 --ny 256
#
# Then launch the simulation:
# fluidsim-run /path/to/simulation/directory

# For programmatic control, load an existing simulation:
from fluidsim import load_sim_for

# Load simulation results for post-processing
sim = load_sim_for(path="path/to/sim")

# Access physical fields
velocity_x = sim.output.fields.get_field("ux")
velocity_y = sim.output.fields.get_field("uy")

# Plot energy spectrum
sim.output.spectra.plot1d()
```

## Core Capabilities / 核心能力

### 1. Simulation Configuration / 仿真配置

fluidsim uses a hierarchical parameter system. All physical and numerical parameters are accessible via the `params` object before launching.

```python
from fluidsim.solvers.ns2d.strat.solver import Simul

params = Simul.create_default_params()

# Domain and resolution
params.oper.nx = 512
params.oper.ny = 512
params.oper.Lx = 2 * 3.14159  # periodic domain size
params.oper.Ly = 2 * 3.14159

# Physical parameters
params.nu_2 = 1e-5           # kinematic viscosity (m^2/s)
params.nu_4 = 1e-10          # hyper-viscosity (for spectral filtering)
params.forcing.type = "taylor_green"

# Time stepping
params.time_stepping.t_end = 50.0
params.time_stepping.deltat0 = 0.01
params.time_stepping.type_use = "RK2"

# Output frequency
params.output.periods_save.phys_fields = 1.0
params.output.periods_save.spectra = 0.5

sim = Simul(params)
sim.time_stepping.start()
```

### 2. Pseudo-Spectral Solver and Forcing / 伪谱求解器与强迫

The pseudo-spectral method computes spatial derivatives in Fourier space and nonlinear terms in physical space via FFT, giving spectral accuracy for periodic domains.

```python
# Initialize with a specific energy spectrum (peaked around wavenumber k0)
sim.initialize_with_spectrum(k0=5, delta=0.5)

# Forcing options available in ns2d.strat:
# - "random": random forcing at low wavenumbers (turbulence studies)
# - "taylor_green": Taylor-Green vortex initial condition
# - "waves": gravity wave forcing (stratified flows)

# For stratified flows (Boussinesq), set buoyancy parameters:
params.stratification.buoyancy_factor = 1.0
params.stratification.N = 2.0  # Brunt-Vaisala frequency

# Monitor simulation state during runtime
sim.output.print_stdout.periods_print_phys_fields = 5.0
sim.output.phys_fields.plot_fields()
```

### 3. Post-Processing and Spectral Analysis / 后处理与谱分析

fluidsim's output module provides built-in spectral analysis, energy budgets, and visualization tools.

```python
from fluidsim import load_sim_for
import numpy as np

sim = load_sim_for(path="path/to/sim")

# Compute and plot 1D energy spectrum E(k)
sim.output.spectra.plot1d(key="energy_kinetic", show=True)

# Access spectral data directly for custom analysis
sp = sim.output.spectra.load()
k = sp["k"]
E_k = sp["energy_kinetic"]

# Fit Kolmogorov -5/3 law in the inertial range
inertial = (k > 3) & (k < 30)
coeff = np.polyfit(np.log(k[inertial]), np.log(E_k[inertial]), 1)
print(f"Spectral slope: {coeff[0]:.2f} (theory: -5/3 = {-5/3:.2f})")

# Compute energy budget: production, dissipation, transfer
sim.output.spect_energy_budg.plot1d()
```

## Common Academic Workflows / 常见学术工作流

### Workflow: 2D Turbulence Simulation with Energy Spectrum / 二维湍流仿真与能谱分析

```python
from fluidsim.solvers.ns2d.strat.solver import Simul
from fluidsim import load_sim_for
import numpy as np

# Step 1: Configure simulation
params = Simul.create_default_params()
params.oper.nx = 256
params.oper.ny = 256
params.oper.Lx = 100.0
params.oper.Ly = 100.0
params.nu_2 = 5e-4
params.nu_4 = 0.0
params.forcing.type = "random"
params.forcing.forcing_wavenumber = {"kmin": 3, "kmax": 5}
params.time_stepping.t_end = 200.0
params.time_stepping.deltat0 = 0.05
params.output.periods_save.phys_fields = 5.0
params.output.periods_save.spectra = 2.0

# Step 2: Run simulation
sim = Simul(params)
sim.time_stepping.start()

# Step 3: Post-process — analyze energy spectrum
sim2 = load_sim_for(path=sim.output.path_run)

sp = sim2.output.spectra.load()
k = sp["k"]
E_k = sp["energy_kinetic"]

# Fit spectral slope in inertial range
mask = (k > 5) & (k < 50)
if mask.sum() > 3:
    slope, intercept = np.polyfit(np.log(k[mask]), np.log(E_k[mask]), 1)
    print(f"Fitted spectral slope: {slope:.3f}")
    print(f"2D turbulence: expect -3 (enstrophy) or -5/3 (inverse energy cascade)")

# Step 4: Visualize vorticity field
sim2.output.phys_fields.plot_field("vorticity")
```

## Best Practices / 最佳实践

- **Report resolution and domain size in non-dimensional form**: Always state the Reynolds number `Re = UL/nu` and the domain size in units of the integral length scale. This makes results comparable across studies.
- **Verify the dealiasing strategy**: Pseudo-spectral methods require 2/3 dealiasing (zero-padding) to prevent spectral aliasing of nonlinear terms. Verify `params.oper.dealiasing` is set correctly.
- **Run a grid convergence study**: Run the same simulation at 128^2, 256^2, and 512^2 to confirm that spectral slopes and integral quantities are grid-independent.
- **Use hyper-viscosity for high-Re simulations**: Molecular viscosity `nu_2` requires very high resolution. Hyper-viscosity `nu_4` provides selective dissipation at small scales while preserving large-scale dynamics.

## Common Pitfalls / 常见陷阱

- **CFL condition violation crashes the simulation**: If `deltat0` is too large relative to the maximum velocity and grid spacing, the explicit time integrator becomes unstable. Reduce `deltat0` or use adaptive time stepping if available.
- **Insufficient forcing wavenumber separation**: If `kmax_forcing` is too close to `nx/3`, the forced scales overlap with the dissipation range. Keep forced wavenumbers well below the grid cutoff.
- **Periodic boundary conditions limit applicability**: Pseudo-spectral methods require periodic domains. Wall-bounded flows (channels, pipes) need a different solver. Do not use `ns2d` for problems requiring no-slip walls.
- **Stratification parameter requires careful tuning**: For `ns2d.strat`, the Froude number `Fr = U/(NL)` controls the flow regime. At `Fr << 1`, internal gravity waves dominate; at `Fr >> 1`, turbulence dominates.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for computational fluid dynamics study design
- Pair with `references/tools/matplotlib.md` for publication-quality spectrum and flow field plots
- Combine with `references/tools/numpy.md` and `references/tools/scipy.md` for custom spectral analysis

## Resources / 资源

- Documentation: https://fluidsim.readthedocs.io/
- GitHub: https://github.com/PAFit/fluiddyn (parent framework)
- fluiddyn (post-processing): https://fluiddyn.readthedocs.io/
