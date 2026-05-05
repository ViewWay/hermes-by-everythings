---
name: cobrapy
description: Constraint-based metabolic modeling — flux balance analysis, gene knockouts, and genome-scale metabolic network reconstruction
domain: biology / systems-biology
install: pip install cobrapy
---

# cobrapy

The reference implementation for constraint-based reconstruction and analysis (COBRA) of metabolic networks. Supports Flux Balance Analysis (FBA), Flux Variability Analysis (FVA), gene/reaction deletions, and parsing of SBML genome-scale metabolic models (GEMs).

## When to Use

- Simulating metabolic phenotypes with Flux Balance Analysis (FBA)
- Predicting growth rates or metabolite production in bacteria, yeast, or human cells
- Performing in silico gene knockouts to identify essential genes
- Running Flux Variability Analysis to explore feasible flux ranges
- Loading and manipulating SBML-format genome-scale metabolic models

## Quick Start

```python
import cobra
from cobra.flux_analysis import flux_variability_analysis

# Load a genome-scale model from SBML
model = cobra.io.read_sbml_model("iML1515.xml")
print(f"Reactions: {len(model.reactions)}, Metabolites: {len(model.metabolites)}, Genes: {len(model.genes)}")

# Run Flux Balance Analysis
solution = model.optimize()
print(f"Growth rate (objective): {solution.objective_value:.4f} /h")
print(f"Biomass flux: {solution.fluxes['BIOMASS_Ec_iML1515_core_75p37M']:.4f}")

# Flux Variability Analysis
fva = flux_variability_analysis(model, reaction_list=["PGI", "PFK", "PYK"])
print(fva)
```

## Core Capabilities

### 1. Flux Balance Analysis and Objective Optimization

```python
import cobra

model = cobra.io.read_sbml_model("iML1515.xml")

# Default: maximize biomass
solution = model.optimize()
print(f"Growth: {solution.objective_value:.4f}")

# Change objective — e.g., maximize acetate production
model.objective = "EX_ac_e"
solution = model.optimize()
print(f"Acetate production: {solution.objective_value:.4f}")

# Constrain medium — e.g., limit glucose uptake
glc_rxn = model.reactions.get_by_id("EX_glc__D_e")
glc_rxn.lower_bound = -5  # mmol/gDW/h (wild-type: -10)
solution = model.optimize()
print(f"Growth with limited glucose: {solution.objective_value:.4f}")

# Inspect flux distribution
for rxn_id in ["GLCptspp", "PFK", "PYK", "PDH", "CS"]:
    print(f"  {rxn_id}: {solution.fluxes[rxn_id]:.4f}")
```

### 2. Gene Knockout Simulations

```python
import cobra
from cobra.flux_analysis import single_gene_deletion, double_gene_deletion

model = cobra.io.read_sbml_model("iML1515.xml")

# Single gene knockout (uses context manager to revert changes)
with model:
    gene = model.genes.get_by_id("b0001")  # Example gene
    gene.knock_out()
    solution = model.optimize()
    print(f"Knockout growth: {solution.objective_value:.4f}")

# Screen all genes for essentiality
essential = single_gene_deletion(model, model.genes)
essential_genes = essential[essential["growth"] < 1e-6]
print(f"Essential genes: {len(essential_genes)}")

# Double knockout analysis for synthetic lethality
synthetic = double_gene_deletion(
    model,
    model.genes[:20],  # Subset for tractability
    processes=4         # Parallel execution
)
```

### 3. Flux Variability Analysis and Parsimonious FBA

```python
from cobra.flux_analysis import (
    flux_variability_analysis,
    pfba,
    production_envelope
)

# FVA — range of each flux while maintaining optimal growth
fva = flux_variability_analysis(model, fraction_of_optimum=0.95)
print(fva.head())

# Parsimonious FBA — minimize total flux while achieving optimal growth
pfba_solution = pfba(model)
print(f"Total flux (FBA): {abs(solution.fluxes).sum():.2f}")
print(f"Total flux (pFBA): {abs(pfba_solution.fluxes).sum():.2f}")

# Production envelope — how does product flux vary with growth?
envelope = production_envelope(
    model,
    reactions=["BIOMASS_Ec_iML1515_core_75p37M"],
    objective="EX_ac_e"
)
print(envelope)
```

## Common Academic Workflow: Essential Gene Prediction and Metabolic Engineering

```python
import cobra
import pandas as pd
from cobra.flux_analysis import single_gene_deletion, flux_variability_analysis

# 1. Load model
model = cobra.io.read_sbml_model("iML1515.xml")
baseline = model.optimize().objective_value

# 2. Identify essential genes
deletion_results = single_gene_deletion(model, model.genes, processes=8)
essential = deletion_results[deletion_results["growth"] < 1e-6]
nonessential = deletion_results[deletion_results["growth"] >= 1e-6 * 0.9]

# 3. Test production strain — knockout competing pathway
with model:
    model.reactions.get_by_id("ACKr").knock_out()
    model.reactions.get_by_id("PTAr").knock_out()
    model.objective = "EX_ac_e"
    production = model.optimize()
    print(f"Acetate production (knockout): {production.objective_value:.4f}")

# 4. FVA on production strain
fva = flux_variability_analysis(model, fraction_of_optimum=0.9)
fva.to_csv("fva_production_strain.csv")

# 5. Save engineered model
cobra.io.write_sbml_model(model, "engineered_strain.xml")
```

## Best Practices

1. **Use context managers** — Wrap knockout experiments in `with model:` blocks to automatically revert changes
2. **Validate model first** — Run `model.optimize()` on the wild-type and compare growth to literature values before drawing conclusions
3. **Set solver tolerances** — For production models, tighten optimality gap: `model.solver.configuration.tolerances.optimality = 1e-7`
4. **Check for infeasibility** — Always verify `solution.status == "optimal"`; infeasible solutions indicate impossible constraints

## Common Pitfalls

- **Solver not installed**: cobrapy requires GLPK (default) or CPLEX/Gurobi for large models. Install with `conda install -c conda-forge glpk`.
- **Ignoring model boundaries**: Exchange reactions define the medium. Always check `model.medium` before simulations.
- **Gene-reaction rules**: Knocking out a gene only affects reactions where that gene is essential (AND logic in GPR rules). Check `gene.reactions` to verify.
- **SBML version issues**: Some models use SBML L3 with FBC package; ensure cobrapy version supports the model format.

## Integration with HBE

- Use with `/hbe:plan` for designing metabolic engineering study designs
- Pair with `references/tools/pandas.md` for analyzing FVA and deletion result tables
- Combine with `references/tools/matplotlib.md` for flux distribution visualizations
- See `references/tools/biopython.md` for sequence-level analysis of metabolic genes

## Resources

- Documentation: https://cobrapy.readthedocs.io/
- GitHub: https://github.com/opencobra/cobrapy
- Models database: https://bigg.ucsd.edu/ (BiGG Models for curated GEMs)
- Paper: Ebrahim, A. et al. (2013). COBRApy: COnstraints-Based Reconstruction and Analysis in Python. BMC Systems Biology, 7, 74.
