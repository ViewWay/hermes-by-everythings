---
name: molecular-dynamics
description: Molecular dynamics trajectory analysis — RMSD, RDF, free energy, and structural analysis from MD simulations
domain: Chemistry / MD
install: pip install mdanalysis mdtraj
---

# Molecular Dynamics Trajectory Analysis / 分子动力学轨迹分析

This reference covers two primary Python libraries for MD trajectory analysis: **MDTraj** (fast, NumPy-based, great for standard analyses) and **MDAnalysis** (flexible, atom selection language, wide algorithm support). Together they cover nearly all post-simulation analysis needs.

## When to Use / 适用场景

- Computing RMSD, RMSF, and radius of gyration from simulation trajectories
- Radial distribution functions (RDF) for structural analysis
- Hydrogen bond analysis and secondary structure assignment
- Free energy surface construction from collective variables
- Clustering conformations and extracting representative structures
- Distance and angle calculations between residues or atoms

## Quick Start / 快速开始

```python
# --- MDTraj: fast trajectory analysis ---
import mdtraj as md

# Load trajectory (supports xtc, trr, dcd, pdb, netcdf, etc.)
traj = md.load("trajectory.xtc", top="topology.pdb")
print(f"Frames: {traj.n_frames}, Atoms: {traj.n_atoms}, "
      f"Time: {traj.time[0]:.1f}-{traj.time[-1]:.1f} ps")

# RMSD calculation
rmsd = md.rmsd(traj, traj, frame=0)  # RMSD relative to first frame
print(f"RMSD range: {rmsd.min():.2f} - {rmsd.max():.2f} nm")
```

```python
# --- MDAnalysis: flexible atom selection ---
import MDAnalysis as mda
from MDAnalysis.analysis import rms, align, distances

u = mda.Universe("topology.pdb", "trajectory.xtc")
protein = u.select_atoms("protein and name CA")

# RMSD
R = rms.RMSD(protein, protein).run()
print(f"RMSD: {R.rmsd[:, 2].mean():.2f} +/- {R.rmsd[:, 2].std():.2f} Angstrom")
```

## Core Capabilities / 核心能力

### 1. RMSD and Structural Metrics / 均方根偏差与结构指标

```python
import mdtraj as md
import numpy as np

traj = md.load("trajectory.xtc", top="topology.pdb")

# RMSD to first frame (all atoms vs C-alpha only)
rmsd_all = md.rmsd(traj, traj, frame=0)
rmsd_ca = md.rmsd(traj, traj, frame=0, atom_indices=traj.topology.select("name CA"))

# RMSD between two reference structures
ref = md.load("reference.pdb")
rmsd_to_ref = md.rmsd(traj, ref[0], atom_indices=traj.topology.select("protein"))

# Radius of gyration
rg = md.compute_rg(traj)
print(f"Rg: {rg.mean():.2f} +/- {rg.std():.2f} nm")

# RMSF (per-residue fluctuation)
rmsf = md.compute_rmsf(traj, traj[0], atom_indices=traj.topology.select("name CA"))
residues = [r for r in traj.topology.residues if r.code != 'HOH']
print(f"Max RMSF residue: {residues[np.argmax(rmsf)].resSeq}")
```

### 2. Radial Distribution Functions / 径向分布函数

```python
import mdtraj as md
import numpy as np

traj = md.load("trajectory.xtc", top="topology.pdb")

# RDF between water oxygen and protein center of mass
water_oxygens = traj.topology.select("water and name O")
protein_atoms = traj.topology.select("protein")

r, g_r = md.compute_rdf(traj, water_oxygens, protein_atoms,
                        r_range=(0.0, 2.0), nbins=100)

# Find first solvation shell peak
first_peak_idx = np.argmax(g_r[5:]) + 5  # Skip first few bins
first_peak_r = r[first_peak_idx]
print(f"First solvation shell: r = {first_peak_r:.3f} nm, g(r) = {g_r[first_peak_idx]:.2f}")

# RDF between two specific atom groups
sodium = traj.topology.select("resname NA")
chloride = traj.topology.select("resname CL")
r_ion, g_ion = md.compute_rdf(traj, sodium, chloride, r_range=(0.0, 1.5))
```

### 3. Hydrogen Bonds and Distances / 氢键与距离分析

```python
import mdtraj as md

traj = md.load("trajectory.xtc", top="topology.pdb")

# Hydrogen bond analysis
hbonds = md.baker_hubbard(traj, periodic=True)
print(f"Total H-bonds detected: {len(hbonds)}")

# Count H-bonds per frame
hbonds_per_frame = [len(hbonds[hbonds[:, 0] == i]) for i in range(traj.n_frames)]
print(f"Avg H-bonds/frame: {np.mean(hbonds_per_frame):.1f}")

# Distance between two residues
res1 = traj.topology.select("resid 50 and name CA")
res2 = traj.topology.select("resid 150 and name CA")
dist = md.compute_distances(traj, list(zip(res1, res2)))
print(f"Residue 50-150 distance: {dist.mean():.2f} nm")

# Angle between three atoms
atom_triplets = traj.topology.select("resid 50 and (name N or name CA or name C)")
angles = md.compute_angles(traj, [atom_triplets])
print(f"Avg N-CA-C angle: {np.degrees(angles.mean()):.1f} deg")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Complete MD Post-Processing / 完整 MD 后处理流程

```python
import mdtraj as md
import numpy as np
import matplotlib.pyplot as plt

# Load trajectory (strip water for efficiency)
traj = md.load("trajectory.xtc", top="topology.pdb")
protein = traj.topology.select("protein")
traj_protein = traj.atom_slice(protein)

# 1. RMSD analysis
rmsd_ca = md.rmsd(traj_protein, traj_protein, frame=0,
                   atom_indices=traj_protein.topology.select("name CA"))

# 2. Radius of gyration
rg = md.compute_rg(traj_protein)

# 3. Secondary structure analysis (DSSP)
ss = md.compute_dssp(traj_protein)
ss_fractions = {name: np.mean(ss == code)
                for name, code in [("Helix", "H"), ("Sheet", "E"), ("Coil", "C")]}

# 4. Cluster conformations
from mdtraj clustering
labels = cluster.kmeans(traj_protein, k=5, random_state=42)[1]
representatives = [np.where(labels == i)[0][np.argmin(rmsd_ca[labels == i])]
                   for i in range(5)]

# Summary
print(f"RMSD (CA): {rmsd_ca.mean():.2f} +/- {rmsd_ca.std():.2f} nm")
print(f"Rg: {rg.mean():.2f} +/- {rg.std():.2f} nm")
print(f"Secondary structure: {ss_fractions}")
print(f"Cluster representatives at frames: {representatives}")

# Save representative structures
for i, frame_idx in enumerate(representatives):
    traj_protein[frame_idx].save(f"cluster_representative_{i}.pdb")
```

## Best Practices / 最佳实践

1. **Strip solvent first**: Use `traj.atom_slice()` to remove water/ions for faster analysis
2. **Use MDTraj for speed**: MDTraj is 10-100x faster for standard metrics (RMSD, RDF, Rg)
3. **Use MDAnalysis for flexibility**: MDAnalysis excels at complex atom selections and custom analyses
4. **Units matter**: MDTraj uses nanometers; MDAnalysis uses Angstroms -- be consistent
5. **Subsample trajectories**: Skip frames for very long trajectories to reduce memory usage

## Common Pitfalls / 常见陷阱

- **Periodic boundary conditions**: Always set `periodic=True` in distance/RDF calculations for solvated systems
- **PBC artifacts**: Image molecules before distance calculations using `md.make_molecules_whole()`
- **Top mismatch**: Ensure topology file matches the trajectory atom ordering exactly
- **Memory blowup**: Loading full trajectories into memory is dangerous for large systems; use `md.iterload()`
- **Unit confusion**: MDTraj reports distances in nm; MDAnalysis in Angstroms -- convert explicitly

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/openmm.md` for simulation setup and execution
- Use with `references/tools/matplotlib.md` for RMSD/RDF plots and free energy surfaces
- Combine with `references/tools/scipy.md` for smoothing, fitting, and statistical tests
- Integrate with `workflows/experiment-design.md` for computational biophysics studies

## Resources / 资源

- MDTraj docs: http://mdtraj.org/
- MDAnalysis docs: https://www.mdanalysis.org/
- MDTraj paper: McGibbon et al., "MDTraj: A Modern Open Library for the Analysis of Molecular Dynamics Trajectories," JOC 2015
- MDAnalysis paper: Gowers et al., "MDAnalysis: A Python Package for the Rapid Analysis of Molecular Dynamics Simulations," SICB 2016
