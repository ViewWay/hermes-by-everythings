---
name: pymatgen-analysis
description: Pymatgen analysis extensions — advanced materials property analysis, defect chemistry, and phase diagram computation
domain: Physics / Materials
install: pip install pymatgen-analysis
---

# pymatgen-analysis — Pymatgen Analysis Extensions

Extends the core pymatgen library with advanced analysis capabilities for computational materials science, including defect formation energy calculations, phase diagram construction, elastic tensor analysis, and surface energy computations for DFT-derived crystal structures.

## When to Use

- Computing defect formation energies and transition levels in semiconductors
- Building and analyzing binary/ternary phase diagrams from DFT energies
- Calculating elastic constants and mechanical properties from stress-strain data
- Analyzing surface terminations and slab models for catalysis studies
- Computing XRD patterns, electronic density of states, and band structures

## Quick Start

```python
from pymatgen.analysis.phase_diagram import PhaseDiagram, PDEntry
from pymatgen.core import Composition, Element

# Build a phase diagram from DFT energies
entries = [
    PDEntry("Si", -5.42),
    PDEntry("Ge", -5.85),
    PDEntry("SiGe", -11.50),
    PDEntry("SiO2", -23.15),
    PDEntry("GeO2", -23.68),
    PDEntry("SiGeO4", -29.80),
]

pd = PhaseDiagram(entries)

# Find stable phases
print("Stable phases:", [e.name for e in pd.stable_entries])

# Get convex hull energy for a composition
comp = Composition("Si0.5Ge0.5O2")
decomp, hull_energy = pd.get_decomposition_and_hull_energy(comp)
print(f"Hull energy: {hull_energy:.3f} eV/atom")
print(f"Decomposition: {decomp}")
```

## Core Capabilities

### 1. Defect Analysis

```python
from pymatgen.analysis.defects.generators import VacancyGenerator, SubstitutionGenerator
from pymatgen.analysis.defects.core import DefectEntry
from pymatgen.core import Structure

# Load bulk structure
si = Structure.from_file("Si.cif")

# Generate point defects
vac_gen = VacancyGenerator()
vacancies = vac_gen.generate(si)

sub_gen = SubstitutionGenerator()
substitutions = sub_gen.generate(si, substitution={"Si": "P"})  # n-type doping

for defect in vacancies[:3]:
    print(f"Defect: {defect.defect_type} at {defect.site.specie} site")
    print(f"  Supercell multiplicity: {defect.get_supercell_structure().num_sites}")
```

### 2. Elastic Tensor Analysis

```python
from pymatgen.analysis.elasticity.elastic import ElasticTensor
from pymatgen.core import Structure
import numpy as np

# Load elastic tensor from DFT output (VASP format)
elastic = ElasticTensor.from_vasp("OUTCAR")
# Or from a raw 6x6 matrix
cij = np.array([
    [165.6, 63.9, 63.9, 0, 0, 0],
    [63.9, 165.6, 63.9, 0, 0, 0],
    [63.9, 63.9, 165.6, 0, 0, 0],
    [0, 0, 0, 79.5, 0, 0],
    [0, 0, 0, 0, 79.5, 0],
    [0, 0, 0, 0, 0, 79.5],
])
elastic = ElasticTensor(cij)

# Compute mechanical properties
print(f"Bulk modulus: {elastic.k_vrh:.1f} GPa")
print(f"Shear modulus: {elastic.g_vrh:.1f} GPa")
print(f"Young's modulus: {elastic.youngs_modulus['avg']:.1f} GPa")
print(f"Poisson ratio: {elastic.poisson_ratio['avg']:.3f}")
print(f"Universal anisotropy: {elastic.universal_anisotropy:.3f}")

# Check Born stability criteria
print(f"Mechanically stable: {elastic.is_orthotropic()}")
```

### 3. XRD Pattern Simulation

```python
from pymatgen.analysis.diffraction.xrd import XRDCalculator
from pymatgen.core import Structure

structure = Structure.from_file("perovskite.cif")

# Simulate XRD pattern (Cu Ka radiation)
calculator = XRDCalculator(wavelength="CuKa")
pattern = calculator.get_pattern(structure, two_theta_range=(10, 80))

# Extract peak data
print(f"Number of peaks: {len(pattern.x)}")
for i in range(min(5, len(pattern.x))):
    print(f"  2theta={pattern.x[i]:.2f} deg, d={pattern.d_hkls[i]:.3f} A, "
          f"I={pattern.y[i]:.1f}")

# Plot
import matplotlib.pyplot as plt
calculator.show_plot(structure)
plt.savefig("xrd_pattern.png", dpi=300, bbox_inches="tight")
```

## Common Academic Workflow: Phase Stability Screening

```python
from pymatgen.analysis.phase_diagram import PhaseDiagram, PDEntry
from pymatgen.core import Composition
from pymatgen.entries.computed_entries import ComputedEntry
import json

# Load DFT calculation results
with open("dft_results.json") as f:
    results = json.load(f)

# Build phase diagram entries
entries = []
for item in results:
    entry = ComputedEntry(
        composition=item["composition"],
        energy=item["energy_per_atom"],
        correction=item.get("correction", 0.0),
        data={"material_id": item["mp_id"]}
    )
    entries.append(entry)

# Construct phase diagram
pd = PhaseDiagram(entries)

# Screen for novel stable compounds
novel_stable = []
for entry in entries:
    eform = pd.get_form_energy_per_atom(entry)
    if abs(eform) < 0.001:  # On or very near hull
        decomp, hull_e = pd.get_decomposition_and_hull_energy(entry.composition)
        if len(decomp) == 1:  # Single-phase stable
            novel_stable.append({
                "formula": entry.composition.reduced_formula,
                "energy_above_hull": eform,
                "decomposition": str(decomp),
            })

print(f"Found {len(novel_stable)} stable phases on hull")
import pandas as pd
pd.DataFrame(novel_stable).to_csv("stable_phases.csv", index=False)
```

## Best Practices

1. Always apply energy corrections (Madelung, anion chemical potential) before phase diagram construction
2. Verify convergence of elastic constant calculations with respect to k-point mesh and strain amplitude
3. Use the Materials Project API (`mp-api`) to supplement your DFT data with existing entries for complete phase diagrams
4. Report hull distances in meV/atom with appropriate significant figures for publication

## Common Pitfalls

1. **Missing competing phases**: Incomplete chemical spaces lead to artificially low hull energies; include all known competing phases
2. **Incorrect elastic tensor symmetry**: Raw DFT tensors may have numerical noise; symmetrize with `elastic.symmetrized`
3. **XRD preferred orientation**: Simulated XRD assumes random orientation; compare carefully with experimental powder patterns
4. **Defect charge states**: Always include enough charge states (typically -2 to +2) to capture the correct thermodynamic transition level

## Integration with HBE

- Use with `references/tools/pymatgen.md` for core crystal structure manipulation
- Pair with `references/tools/matplotlib.md` for phase diagram and XRD visualization
- Combine with `references/tools/numpy.md` for tensor operations
- Supports `references/tool-registry.md` materials science tool chain

## Resources

- Documentation: https://pymatgen.org/analysis.html
- Materials Project API: https://materialsproject.org/open
- Source: https://github.com/materialsproject/pymatgen
