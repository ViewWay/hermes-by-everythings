---
name: pysam_dep
description: Constraint-based metabolic modeling — flux balance analysis (FBA) and metabolic network reconstruction with COBRApy
domain: Biology / Systems Biology
install: pip install cobra
---

# COBRApy — Constraint-Based Metabolic Modeling / 约束型代谢建模

COBRApy (COBRA Toolbox in Python) performs flux balance analysis (FBA), flux variability analysis (FVA), gene/reaction knockouts, and metabolic pathway analysis on genome-scale metabolic models (GEMs) in SBML format.

## When to Use / 适用场景

- Predicting maximal growth rate or product yield under genetic/environmental constraints / 预测生长速率或产物产量
- Simulating gene knockouts to identify essential genes or synthetic lethals / 模拟基因敲除鉴定必需基因
- Comparing metabolic flux distributions across conditions (WT vs mutant) / 比较不同条件下的代谢通量分布
- Integrating omics data (transcriptomics, proteomics) into metabolic models / 将组学数据整合到代谢模型
- Designing minimal media or strain engineering strategies for biotech applications / 设计最小培养基或工程菌株

## Quick Start / 快速开始

```python
import cobra
from cobra.flux_analysis import (
    flux_variability_analysis, single_gene_deletion,
    single_reaction_deletion, loopless_solution
)

# Load a genome-scale metabolic model
model = cobra.io.read_sbml_model("models/iML1515.xml")
print(f"Reactions: {len(model.reactions)}, Metabolites: {len(model.metabolites)}, Genes: {len(model.genes)}")

# Run FBA: maximize biomass
solution = model.optimize()
print(f"Growth rate (1/h): {solution.objective_value:.4f}")
print(f"Flux through EX_glc__D_e: {solution.fluxes['EX_glc__D_e']:.4f}")

# Flux variability analysis on key reactions
fva = flux_variability_analysis(model, reaction_list=["ACONTa", "ACONTb", "CS"])
print(fva)
```

## Core Capabilities / 核心能力

### 1. Flux Balance Analysis (FBA) / 通量平衡分析

FBA finds flux distributions that maximize (or minimize) an objective function subject to stoichiometric and capacity constraints.

```python
import cobra

model = cobra.io.read_sbml_model("models/iML1515.xml")

# Default: maximize biomass (model.objective)
solution = model.optimize()
print(f"Status: {solution.status}")
print(f"Growth: {solution.objective_value:.6f}")

# Change objective to maximize acetate production
model.objective = "EX_ac_e"
solution = model.optimize()
print(f"Acetate production: {solution.objective_value:.4f}")

# Set medium constraints (aerobic vs anaerobic)
model.medium["EX_o2_e"] = 0.0  # anaerobic
anaerobic_growth = model.optimize().objective_value
print(f"Anaerobic growth: {anaerobic_growth:.4f}")
```

### 2. Gene Knockout Simulation / 基因敲除模拟

Single or double gene knockouts identify essential genes and synthetic lethal pairs.

```python
from cobra.flux_analysis import single_gene_deletion, double_gene_deletion

model = cobra.io.read_sbml_model("models/iML1515.xml")

# Single gene deletion: identify essential genes
essential = single_gene_deletion(model, model.genes[:50])
essential_genes = essential[essential["growth"] < 1e-6]
print(f"Essential genes (first 50): {essential_genes['ids'].tolist()}")

# Double gene deletion (computationally expensive, limit scope)
double_ko = double_gene_deletion(
    model,
    model.genes[:20],
    processes=4  # parallel
)
synthetic_lethal = double_ko[double_ko["growth"] < 1e-6]
print(f"Synthetic lethal pairs: {len(synthetic_lethal)}")
```

### 3. Flux Variability Analysis (FVA) / 通量变异性分析

FVA determines the min/max flux each reaction can achieve while maintaining optimal (or near-optimal) objective value.

```python
from cobra.flux_analysis import flux_variability_analysis

model = cobra.io.read_sbml_model("models/iML1515.xml")
model.optimize()

# FVA at optimality (fraction_of_optimum=1.0)
fva_opt = flux_variability_analysis(model, fraction_of_optimum=1.0)

# FVA allowing 10% sub-optimality
fva_relaxed = flux_variability_analysis(model, fraction_of_optimum=0.9)

# Find blocked reactions (zero flux range)
blocked = fva_opt[(fva_opt["minimum"] == 0) & (fva_opt["maximum"] == 0)]
print(f"Blocked reactions: {len(blocked)}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Metabolic Network Analysis for a Published Study / 代谢网络分析

```python
import cobra
from cobra.flux_analysis import (
    flux_variability_analysis, single_gene_deletion,
    production_envelope
)
import pandas as pd

# 1. Load model and set condition
model = cobra.io.read_sbml_model("models/iML1515.xml")
model.reactions.get_by_id("EX_glc__D_e").lower_bound = -10  # glucose uptake
model.reactions.get_by_id("EX_o2_e").lower_bound = -20      # aerobic

# 2. FBA at wild type
wt_solution = model.optimize()
wt_growth = wt_solution.objective_value

# 3. Single gene deletion screen
ko_results = single_gene_deletion(model, model.genes)
essential = ko_results[ko_results["growth"] < 1e-6]
print(f"Essential genes: {len(essential)}/{len(model.genes)}")

# 4. Production envelope: growth vs product tradeoff
envelope = production_envelope(
    model,
    reactions=[model.reactions.get_by_id("BIOMASS_Ec_iML1515_core_75p37M"),
               model.reactions.get_by_id("EX_ac_e")],
    objective="EX_ac_e",
    points=20
)

# 5. Save results
envelope.to_csv("results/production_envelope.csv")
essential["ids"].to_frame("essential_genes").to_csv("results/essential_genes.csv")
```

## Best Practices / 最佳实践

- **Use `with model:` context for temporary modifications**: Gene knockouts, medium changes, and objective swaps inside `with model:` revert automatically, preventing model corruption / 用上下文管理器保护模型
- **Report solver and version**: FBA results depend on the solver (glpk, cplex, gurobi). Include `cobra.__version__` and solver name in methods / 报告求解器和版本
- **Validate model before analysis**: Check for mass imbalance (`model.reactions.check_mass_balance()`) and blocked reactions via FVA / 分析前验证质量平衡
- **Use loopless FVA for publication**: Standard FBA may include thermodynamically infeasible loops. Use `loopless_fva()` for physiologically meaningful flux ranges / 用无环 FVA 确保结果物理可行
- **Benchmark against experimental data**: Compare predicted essential genes with Keio collection or growth rates with Biolog data / 与实验数据对比验证

## Common Pitfalls / 常见陷阱

- **Solver selection affects results**: glpk (default) is open-source but slower; Gurobi/CPLEX are faster and handle degeneracy better. Install with `pip install cobra[glpk]` or `conda install -c conda-forge gurobi` / 求解器选择影响结果一致性
- **Model curation is critical**: Draft models from CarveMe or ModelSEED often contain gaps, missing transport reactions, and incorrect bounds. Manual curation with literature is essential / 模型需要人工校对
- **Growth rate interpretation**: FBA predicts maximal theoretical growth, not actual growth. Compare with experimental rates and consider regulatory constraints (e.g., with rFBA) / FBA 预测理论最大值
- **Memory issues with large models**: Human GEMs (Recon3D) have >13k reactions. Use `model.slim_optimize()` for faster single-value optimization / 大模型内存优化
- **Infeasible solutions after medium change**: Check that at least one carbon source and one energy source have nonzero exchange bounds / 修改培养基后检查可行性

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for systems biology study design
- Pair with `references/tools/pandas.md` for organizing knockout and FVA results into tables
- Combine with `references/tools/matplotlib.md` for flux distribution plots and production envelopes
- Use `references/tools/inkscape-cli.md` to convert pathway diagrams to publication-ready PDF

## Resources / 资源

- COBRApy Documentation: https://cobrapy.readthedocs.io/
- BiGG Models Database: https://bigg.ucsd.edu/
- E. coli iML1515 model: https://github.com/SysBioChalmers/Models/tree/main/iML1515
- Human Recon3D model: https://github.com/SysBioChalmers/Recon3D
- COBRA Toolbox (MATLAB): https://opencobra.github.io/cobratoolbox/
- CarveMe (automated model reconstruction): https://github.com/cdanielmachado/carveme
