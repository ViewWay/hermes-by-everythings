---
name: openmm
description: High-performance molecular dynamics engine — GPU-accelerated biomolecular simulation with custom forces and enhanced sampling
domain: Physics / Engineering
install: pip install openmm
---

# openmm — Molecular Dynamics Simulation / 分子动力学模拟引擎

OpenMM provides GPU-accelerated molecular dynamics for biomolecular systems, supporting AMBER, CHARMM, and OPLS force fields with a Python API for custom forces and enhanced sampling protocols.

## When to Use / 适用场景

- Simulating protein folding, protein-ligand binding, and membrane dynamics (模拟蛋白质折叠、蛋白-配体结合和膜动力学)
- Computing binding free energies via alchemical transformations (通过炼金变换计算结合自由能)
- Running replica exchange molecular dynamics (REMD) for enhanced sampling (运行副本交换分子动力学以增强采样)
- Building custom force fields with non-standard residues or cofactors (构建含非标准残基或辅因子的自定义力场)
- Integrating MD simulations into computational drug discovery pipelines (将分子动力学整合到计算药物发现管道中)

## Quick Start / 快速开始

```python
from openmm.app import *
from openmm import *
from openmm.unit import *

# Load structure and force field
pdb = PDBFile("protein.pdb")
forcefield = ForceField("amber14-all.xml", "amber14/tip3pfb.xml")

# Build system with PME electrostatics and hydrogen constraints
system = forcefield.createSystem(
    pdb.topology,
    nonbondedMethod=PME,
    nonbondedCutoff=1.0 * nanometer,
    constraints=HBonds,
)

# Langevin integrator (NVT ensemble)
integrator = LangevinIntegrator(
    300 * kelvin,       # temperature
    1.0 / picosecond,   # friction coefficient
    2.0 * femtoseconds, # time step
)

# Set up and run simulation
simulation = Simulation(pdb.topology, system, integrator)
simulation.context.setPositions(pdb.positions)
simulation.minimizeEnergy(maxIterations=1000)
simulation.context.setVelocitiesToTemperature(300 * kelvin)

# Save trajectory
simulation.reporters.append(PDBReporter("output.pdb", 1000))
simulation.reporters.append(StateDataReporter("log.txt", 100, step=True,
    potentialEnergy=True, temperature=True, progress=True, totalSteps=100000))
simulation.step(100000)
```

## Core Capabilities / 核心能力

### 1. Force Fields and System Building / 力场与系统构建

OpenMM supports AMBER, CHARMM, OPLS, and custom XML force field definitions.

```python
from openmm.app import *
from openmm import *
from openmm.unit import *

# AMBER force field with explicit solvent
pdb = PDBFile("system.pdb")
ff = ForceField("amber14-all.xml", "amber14/tip3pfb.xml")

# Custom system parameters
system = ff.createSystem(
    pdb.topology,
    nonbondedMethod=PME,
    nonbondedCutoff=1.0 * nanometer,
    ewaldErrorTolerance=1e-5,
    constraints=HBonds,
    rigidWater=True,
    hydrogenMass=4 * amu,  # hydrogen mass repartitioning for 4 fs timestep
)

# Apply positional restraints on protein backbone
force = HarmonicBondForce()
force.setForceGroup(1)
protein_atoms = [a.index for a in pdb.topology.atoms()
                 if a.residue.name not in ("HOH", "WAT")]
for atom_idx in protein_atoms[:10]:  # example: restrain first 10 atoms
    force.addBond(atom_idx, atom_idx, 0.0 * nanometer, 100.0 * kilojoule_per_mole/nanometer**2)
system.addForce(force)
```

### 2. Custom Forces / 自定义力

Build arbitrary forces using tabulated functions, CustomBondForce, CustomNonbondedForce, etc.

```python
from openmm import *
from openmm.unit import *

# Custom harmonic bond force for non-standard residue
bond_force = CustomBondForce("k*(r-r0)^2")
bond_force.addPerBondParameter("k")
bond_force.addPerBondParameter("r0")
bond_force.addBond(atom1=100, atom2=101,
                   parameters=[1000.0*kilojoule_per_mole/nanometer**2,
                               0.15*nanometer])
system.addForce(bond_force)

# Custom torsion for a modified dihedral
torsion = CustomTorsionForce("k*(1+cos(n*theta-theta0))")
torsion.addPerTorsionParameter("k")
torsion.addPerTorsionParameter("n")
torsion.addPerTorsionParameter("theta0")
torsion.addTorsion(p1=10, p2=11, p3=12, p4=13,
                   parameters=[5.0*kilojoule_per_mole, 3, 0.0])
system.addForce(torsion)

# Nonbonded soft-core potential for alchemical transformation
soft_core = CustomNonbondedForce(
    "lambda*4*eps*((sigma/r)^12 - (sigma/r)^6) + (1-lambda)*4*eps_alch*("
    "(sigma_alch/sqrt(r^2+alpha*(1-lambda)))^12 - "
    "(sigma_alch/sqrt(r^2+alpha*(1-lambda)))^6)"
)
soft_core.addPerParticleParameter("eps")
soft_core.addPerParticleParameter("sigma")
soft_core.addPerParticleParameter("eps_alch")
soft_core.addPerParticleParameter("sigma_alch")
soft_core.addGlobalParameter("lambda", 0.0)
soft_core.addGlobalParameter("alpha", 0.5)
system.addForce(soft_core)
```

### 3. Reporters and Trajectory Output / 报告器与轨迹输出

```python
from openmm.app import *

# DCD trajectory (compact binary, widely supported)
simulation.reporters.append(DCDReporter("trajectory.dcd", 500))

# XTC trajectory (GROMACS-compatible, compressed)
simulation.reporters.append(XTCReporter("trajectory.xtc", 500))

# StateDataReporter for thermodynamic properties
simulation.reporters.append(StateDataReporter(
    "simulation_log.csv",
    reportInterval=100,
    step=True,
    time=True,
    potentialEnergy=True,
    kineticEnergy=True,
    totalEnergy=True,
    temperature=True,
    volume=True,
    density=True,
    speed=True,
    separator=",",
))

# Checkpoint reporter for restart
simulation.reporters.append(CheckpointReporter("checkpoint.chk", 5000))
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Protein-Ligand Binding Free Energy (Alchemical TI) / 蛋白-配体结合自由能计算

```python
from openmm.app import *
from openmm import *
from openmm.unit import *
import numpy as np

# Load complex and prepare alchemical system
pdb = PDBFile("complex.pdb")
ff = ForceField("amber14-all.xml", "amber14/tip3pfb.xml")
system = ff.createSystem(pdb.topology, nonbondedMethod=PME,
                         nonbondedCutoff=1.0*nanometer, constraints=HBonds)

# Alchemical parameter
alchemical = CustomBondForce("0")
alchemical.addGlobalParameter("lambda", 0.0)
alchemical.addEnergyParameterDerivative("lambda")
system.addForce(alchemical)

# Run lambda windows
lambda_windows = np.linspace(0.0, 1.0, 21)
integrator = LangevinIntegrator(300*kelvin, 1/picosecond, 2*femtoseconds)
results = []

for lam in lambda_windows:
    simulation = Simulation(pdb.topology, system, integrator)
    simulation.context.setPositions(pdb.positions)
    simulation.context.setParameter("lambda", lam)
    simulation.minimizeEnergy()
    simulation.step(500000)  # equilibration + production

    # Get dU/dlambda
    state = simulation.context.getState(getEnergy=True, parameterDerivatives=True)
    dudlam = state.getParameterDerivative(0)
    results.append((lam, dudlam / kilojoule_per_mole))

# Integrate (trapezoidal rule)
results = np.array(results)
delta_G = np.trapz(results[:, 1], results[:, 0])
print(f"Binding free energy: {delta_G:.2f} kJ/mol")
```

### Workflow: GPU Platform Selection / GPU平台选择

```python
from openmm import Platform

# List available platforms
for i in range(Platform.getNumPlatforms()):
    p = Platform.getPlatform(i)
    print(f"{i}: {p.getName()} — {p.getPropertyDefaultValue('DeviceIndex', 'N/A')}")

# Force CUDA or OpenCL GPU usage
platform = Platform.getPlatformByName("CUDA")
properties = {"DeviceIndex": "0", "Precision": "mixed"}
simulation = Simulation(pdb.topology, system, integrator, platform, properties)
```

## Best Practices / 最佳实践

- **Use hydrogen mass repartitioning** (`hydrogenMass=4*amu`) to enable 4 fs time steps, reducing wall-clock time by ~2x with negligible accuracy loss for most protein simulations.
- **Minimize energy before production** — always run `minimizeEnergy(maxIterations=5000)` and then equilibrate for at least 100 ps with restraints before the production run.
- **Use mixed precision on GPU** — set `Precision="mixed"` for CUDA/OpenCL platforms; this gives nearly full double-precision accuracy at single-precision speed.
- **Save checkpoints regularly** — `CheckpointReporter` enables restarting crashed simulations; save every 10-50 ps for long production runs.
- **Report PME tolerance** — set `ewaldErrorTolerance=1e-5` and report it in methods; tighter tolerance improves energy conservation but costs performance.

## Common Pitfalls / 常见陷阱

- **Forgetting to call `context.setParameter("lambda", value)`** in alchemical simulations — the lambda parameter does not auto-update; you must set it explicitly at each window.
- **Using `simtk.openmm` imports** — in OpenMM >= 8.0, the correct import is `from openmm import *` (not `from simtk.openmm import *`). The `simtk` namespace is deprecated.
- **Incorrect unit handling** — OpenMM requires explicit units (e.g., `300*kelvin`, `1.0*nanometer`). Bare numbers without units will raise `TypeError`.
- **Memory overflow on GPU** — for systems >500K atoms, check GPU VRAM; if the simulation OOMs, try `Precision="single"` or reduce the PME grid size.
- **Time step too large for constraints** — with `constraints=HBonds`, the maximum stable time step is ~2 fs (or 4 fs with mass repartitioning); larger steps cause energy drift.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for setting up and managing MD simulation campaigns with parameter sweeps.
- Pair with `references/tools/matplotlib.md` for plotting energy convergence, RMSD, and free energy profiles from StateDataReporter CSV output.
- Combine with `references/tools/medchem.md` for preparing small-molecule ligand topologies before binding free energy simulations.

## Resources / 资源

- Documentation: https://openmm.org/documentation/
- OpenMM Force Field Repository: https://github.com/openmm/openmmforcefields
- GPU Benchmarks: https://openmm.org/benchmarks.html
- GitHub: https://github.com/openmm/openmm
