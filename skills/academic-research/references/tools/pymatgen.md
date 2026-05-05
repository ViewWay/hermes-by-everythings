---
name: pymatgen
description: Python Materials Genomics — materials analysis, phase diagrams, crystal structures, and computational materials science
domain: Physics / Materials Science
install: pip install pymatgen
---

# pymatgen — Python Materials Genomics / Python 材料基因组学

pymatgen is the core library for computational materials science: crystal structure analysis, phase diagram construction, electronic structure analysis (DFT interface), and materials property prediction.

## When to Use / 适用场景

- Analyzing crystal structures and computing materials properties
- Building phase diagrams from computational data
- Interface with VASP, Quantum ESPRESSO, Gaussian DFT codes
- Materials database queries (Materials Project API)
- High-throughput computational screening

## Quick Start / 快速开始

```python
from pymatgen.core import Structure, Lattice

# Create crystal structure
lattice = Lattice.cubic(4.2)
structure = Structure(lattice, ["Na", "Cl"], [[0, 0, 0], [0.5, 0.5, 0.5]])

# Compute properties
print(f"Volume: {structure.volume:.2f} Å³")
print(f"Density: {structure.density:.4f} g/cm³")
print(f"Formula: {structure.formula}")

# From CIF file
structure = Structure.from_file("NaCl.cif")

# Query Materials Project
from pymatgen.ext.matproj import MPRester
with MPRester("YOUR_API_KEY") as m:
    results = m.get_structures("NaCl")
```

## Core Capabilities / 核心能力

### 1. Structure Analysis / 结构分析

```python
from pymatgen.core import Structure

# Load structure
struct = Structure.from_file("structure.cif")

# Basic properties
print(struct.lattice)         # Lattice parameters
print(struct.composition)     # Chemical composition
print(struct.volume)          # Unit cell volume
print(struct.density)         # Density

# Site analysis
for site in struct:
    print(f"{site.species} at {site.coords}")

# Nearest neighbors
from pymatgen.analysis.local_env import VoronoiNN
vnn = VoronoiNN()
neighbors = vnn.get_nn_info(struct, 0)

# Supercell generation
supercell = struct.make_supercell([2, 2, 2])

# Defect generation
from pymatgen.analysis.defects.generators import VacancyGenerator
vacancies = VacancyGenerator().get_defects(struct)
```

### 2. Phase Diagrams / 相图

```python
from pymatgen.analysis.phase_diagram import PhaseDiagram, PDPlotter
from pymatgen.core.composition import Composition
from pymatgen.entries.computed_entries import ComputedEntry

# Create entries from computed energies
entries = [
    ComputedEntry("Na", -1.3),
    ComputedEntry("Cl", -1.5),
    ComputedEntry("NaCl", -5.8),
    ComputedEntry("NaCl2", -4.2),
]

pd = PhaseDiagram(entries)
plotter = PDPlotter(pd)
plotter.get_plot().savefig("phase_diagram.pdf")

# Get stable entries
stable = [e for e in pd.stable_entries]
print(f"Stable phases: {[e.composition.reduced_formula for e in stable]}")

# Decomposition energy
e_above_hull = pd.get_e_above_hull(entries[3])
print(f"NaCl2 energy above hull: {e_above_hull:.3f} eV/atom")
```

### 3. DFT Interface / DFT 接口

```python
from pymatgen.io.vasp import Vasprun

# Parse VASP output
vr = Vasprun("vasprun.xml")
print(f"Final energy: {vr.final_energy:.6f} eV")
print(f"Band gap: {vr.eigenvalue_band_properties[0]:.3f} eV")

# Generate VASP input files
from pymatgen.io.vasp import Kpoints, Incar, Poscar
from pymatgen.core import Structure

struct = Structure.from_file("POSCAR")
incar = Incar.from_dict({"ENCUT": 520, "EDIFF": 1e-6, "IBRION": 2, "NSW": 100})
kpoints = Kpoints.automatic_density(struct, 1000)
```

### 4. Materials Project API / Materials Project API

```python
from pymatgen.ext.matproj import MPRester

with MPRester("YOUR_API_KEY") as m:
    # Search by formula
    entries = m.get_entries("LiFePO4")
    
    # Get band structure
    bs = m.get_bandstructure_by_material_id("mp-19017")
    
    # Get phonon DOS
    dos = m.get_phonon_dos_by_material_id("mp-19017")
    
    # Get elastic tensor
    elastic = m.get_elasticity("mp-19017")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: High-Throughput Screening / 高通量筛选

```python
from pymatgen.ext.matproj import MPRester
import pandas as pd

with MPRester("YOUR_API_KEY") as m:
    # Query materials with specific criteria
    criteria = {"elements": {"$all": ["Li", "O"]}, "nelements": {"$lte": 4}}
    properties = ["material_id", "formula_pretty", "energy_above_hull", "band_gap"]
    results = m.query(criteria, properties)

df = pd.DataFrame(results)
stable = df[df["energy_above_hull"] <= 0.05]
semiconductors = stable[(stable["band_gap"] > 0.5) & (stable["band_gap"] < 3.0)]
print(f"Found {len(semiconductors)} stable Li-O semiconductors")
```

## Best Practices / 最佳实践

- Always use `ComputedEntry` with corrected energies for phase diagram construction
- Validate structure files before DFT calculations using `struct.is_valid()`
- Use Materials Project API for quick property lookups before expensive calculations
- Report lattice parameters, space group, and energy convergence criteria

## Common Pitfalls / 常见陷阱

- **Energy corrections**: Raw DFT energies need MP-compatible corrections for accurate phase diagrams
- **Symmetry**: Always check space group; different settings may yield different results
- **API rate limits**: Materials Project has query rate limits; batch queries efficiently
- **Convergence**: Check k-point density and energy cutoff convergence before reporting results

## Integration with HBE / 与 HBE 集成

- Core tool for materials science workflows in `workflows/experiment-design.md`
- Pair with `references/tools/matplotlib.md` for phase diagram and band structure plots
- Use with `references/tools/pandas.md` for high-throughput screening results
- Combine with `references/tools/numpy.md` for property calculations

## Resources / 资源

- Documentation: https://pymatgen.org/
- Materials Project: https://materialsproject.org/
- Tutorial: https://pymatgen.org/introduction.html
- Paper: Ong et al., Computational Materials Science 2013
