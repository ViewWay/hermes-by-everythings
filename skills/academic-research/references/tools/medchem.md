---
name: medchem
description: Medicinal chemistry toolkit — bioisostere detection, scaffold analysis, drug-likeness filtering, and lead optimization utilities
domain: Chemistry / Medicinal Chemistry
install: pip install medchem
---

# medchem — Medicinal Chemistry Toolkit / 药物化学工具包

MedChem provides practical utilities for medicinal chemistry workflows including bioisostere replacement, scaffold decomposition (Bemis-Murcko, ScaffoldTree), drug-likeness rule filtering (Lipinski, Veber, PAINS), and ADMET property prediction.

## When to Use / 适用场景

- Screening compound libraries for drug-like properties and PAINS filters (筛选化合物库的类药性和泛干扰化合物)
- Performing scaffold hopping to identify novel chemotypes with similar bioactivity (执行骨架跳跃以发现具有相似生物活性的新型化学骨架)
- Decomposing molecules into Bemis-Murcko scaffolds or ScaffoldTree representations (将分子分解为 Bemis-Murcko 骨架或 ScaffoldTree 表示)
- Optimizing lead compounds by detecting bioisosteric replacement opportunities (通过检测生物电子等排替换机会优化先导化合物)
- Building structure-activity relationship (SAR) analyses for medicinal chemistry papers (为药物化学论文构建构效关系分析)

## Quick Start / 快速开始

```python
from rdkit import Chem
from rdkit.Chem import Descriptors
import medchem as mc

mol = Chem.MolFromSmiles("CC(=O)Oc1ccccc1C(=O)O")  # aspirin

# Drug-likeness filters
from medchem.rules import RuleFilters
filters = RuleFilters()
violations = filters.validate(mol)
print(f"Lipinski violations: {violations}")

# PAINS filter
from medchem.functional import is_pains
flagged = is_pains(mol)
print(f"PAINS flag: {flagged}")

# Scaffold analysis
from medchem.scaffold import murcko_scaffold
scaffold = murcko_scaffold(mol)
print(f"Bemis-Murcko scaffold: {Chem.MolToSmiles(scaffold)}")
```

## Core Capabilities / 核心能力

### 1. Drug-Likeness Rules and Filtering / 类药性规则与过滤

MedChem implements multiple drug-likeness rule sets for compound library triage.

```python
from rdkit import Chem
from medchem.rules import RuleFilters, LipinskiRule, VeberRule, PAINSFilter

mol = Chem.MolFromSmiles("COc1ccc2c(c1)[nH]c3ccccc3n2C(=O)N(C)C")

# Initialize all filters
filters = RuleFilters()

# Individual rule checks
lipinski = LipinskiRule()
print(f"Lipinski: {lipinski.check(mol)}")  # True if passes

veber = VeberRule()
print(f"Veber: {veber.check(mol)}")  # checks rotatable bonds and TPSA

pains = PAINSFilter()
pains_matches = pains.match(mol)
print(f"PAINS substructures: {pains_matches}")

# Batch filter a library
from rdkit import Chem
supplier = Chem.SDMolSupplier("library.sdf")
passed, failed = [], []
for mol in supplier:
    if mol is not None and filters.validate(mol) == 0:
        passed.append(mol)
    else:
        failed.append(mol)
print(f"Passed: {len(passed)}, Failed: {len(failed)}")
```

### 2. Scaffold Analysis (Bemis-Murcko, ScaffoldTree) / 骨架分析

```python
from rdkit import Chem
from medchem.scaffold import murcko_scaffold, scaffold_tree

# Bemis-Murcko scaffold extraction
mol = Chem.MolFromSmiles("CC(C)Oc1ccccc1C(=O)O")
scaffold = murcko_scaffold(mol)
print(f"Full scaffold: {Chem.MolToSmiles(scaffold)}")

# Generic scaffold (all atoms converted to carbon)
from medchem.scaffold import generic_scaffold
generic = generic_scaffold(mol)
print(f"Generic scaffold: {Chem.MolToSmiles(generic)}")

# ScaffoldTree hierarchy (ring system -> scaffold -> framework)
from medchem.scaffold import scaffold_tree_levels
levels = scaffold_tree_levels(mol)
for level_name, level_mol in levels:
    print(f"{level_name}: {Chem.MolToSmiles(level_mol)}")

# Analyze scaffold diversity in a library
from collections import Counter
library = [Chem.MolFromSmiles(s) for s in [
    "CC(C)Oc1ccccc1C(=O)O",
    "COc1ccc(C(=O)O)cc1",
    "CC(=O)Oc1ccccc1C(=O)O",
    "COc1ccc(C(=O)O)cc1",
]]
scaffolds = [Chem.MolToSmiles(murcko_scaffold(m)) for m in library]
diversity = len(set(scaffolds)) / len(scaffolds)
print(f"Scaffold diversity: {diversity:.2%}")
scaffold_counts = Counter(scaffolds)
for scaf, count in scaffold_counts.most_common():
    print(f"  {scaf}: {count}")
```

### 3. Bioisostere Detection / 生物电子等排体检测

```python
from rdkit import Chem
from medchem.transform import BioisostereTransforms, isosteric_replacements

mol = Chem.MolFromSmiles("c1ccccc1C(=O)N")  # benzamide

# Find bioisosteric replacements
transforms = BioisostereTransforms()
replacements = transforms.apply(mol)
for i, analog in enumerate(replacements[:5]):
    print(f"Analog {i}: {Chem.MolToSmiles(analog)}")

# Specific isosteric replacements (e.g., carboxylic acid -> tetrazole)
from medchem.transform import carboxylic_acid_bioisosteres
acid_mol = Chem.MolFromSmiles("c1ccccc1C(=O)O")
analogs = carboxylic_acid_bioisosteres(acid_mol)
for a in analogs:
    print(f"Bioisostere: {Chem.MolToSmiles(a)}")
    print(f"  MW: {Chem.Descriptors.MolWt(a):.1f}, LogP: {Chem.Descriptors.MolLogP(a):.2f}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Scaffold Hopping Study for Kinase Inhibitor Optimization / 激酶抑制剂优化的骨架跳跃研究

```python
from rdkit import Chem
from rdkit.Chem import Descriptors, Draw, AllChem
from medchem.scaffold import murcko_scaffold, scaffold_tree_levels, generic_scaffold
from medchem.rules import RuleFilters
from medchem.transform import BioisostereTransforms
from collections import Counter
import pandas as pd

# Load kinase inhibitor library
inhibitors = [Chem.MolFromSmiles(s) for s in [
    "COc1ccc2nc(NC(=O)c3ccnc4ccccc34)nc(N)c2c1",
    "Cc1ccc2nc(NC(=O)c3ccc(Cl)nc3)nc(N)c2c1",
    "COc1ccc2nc(NC(=O)c3cc(Cl)nc(N)c3)nc(N)c2c1",
    "Cc1ccc2nc(NC(=O)c3ccnc(N)c3)nc(N)c2c1",
]]

# 1. Scaffold decomposition and classification
results = []
for mol in inhibitors:
    scaffold = Chem.MolToSmiles(murcko_scaffold(mol))
    generic = Chem.MolToSmiles(generic_scaffold(mol))
    levels = scaffold_tree_levels(mol)
    results.append({
        "smiles": Chem.MolToSmiles(mol),
        "MW": Descriptors.MolWt(mol),
        "LogP": Descriptors.MolLogP(mol),
        "TPSA": Descriptors.TPSA(mol),
        "HBD": Descriptors.NumHDonors(mol),
        "HBA": Descriptors.NumHAcceptors(mol),
        "scaffold": scaffold,
        "generic_scaffold": generic,
        "ring_system": Chem.MolToSmiles(levels[0][1]),
    })
df = pd.DataFrame(results)

# 2. Drug-likeness assessment
filters = RuleFilters()
df["lipinski_violations"] = df["smiles"].apply(
    lambda s: filters.validate(Chem.MolFromSmiles(s))
)

# 3. Bioisostere exploration for the most common scaffold
most_common = df["scaffold"].mode()[0]
ref_mol = Chem.MolFromSmiles(most_common)
transforms = BioisostereTransforms()
analogs = transforms.apply(ref_mol)

# 4. Filter analogs for drug-likeness
valid_analogs = []
for a in analogs:
    if filters.validate(a) == 0 and Descriptors.MolWt(a) < 500:
        valid_analogs.append(a)
print(f"Generated {len(analogs)} analogs, {len(valid_analogs)} drug-like")

# 5. Export scaffold diversity summary
print(df.groupby("generic_scaffold").agg(
    count=("smiles", "count"),
    avg_MW=("MW", "mean"),
    avg_LogP=("LogP", "mean"),
).to_string())
```

## Best Practices / 最佳实践

- **Apply PAINS filters early** in virtual screening pipelines — removing pan-assay interference compounds before docking saves computational cost and reduces false positives.
- **Use generic scaffolds** (`generic_scaffold()`) when computing scaffold diversity metrics — full Bemis-Murcko scaffolds overcount differences due to substituent heteroatoms.
- **Combine multiple rule sets** — Lipinski alone is insufficient; add Veber (rotatable bonds, TPSA), PAINS, and Brenk filters for comprehensive lead-likeness assessment.
- **Report filter parameters in methods** — always state which rule sets, versions, and thresholds were used; include counts of compounds filtered at each stage.

## Common Pitfalls / 常见陷阱

- **PAINS false positives** — some approved drugs contain PAINS substructures (e.g., catechols); always cross-reference PAINS hits against known active compounds before discarding.
- **Scaffold fragmentation on macrocycles** — Bemis-Murcko extraction fails on macrocyclic natural products; use ring system extraction as a fallback for macrocycle-containing libraries.
- **RDKit mol validity** — always check `mol is not None` after `Chem.MolFromSmiles()`; invalid SMILES strings silently return `None` and will crash downstream operations.
- **Bioisostere database coverage** — the built-in bioisostere library may not cover novel chemotypes; supplement with literature-curated replacements for niche targets.
- **LogP calculation differences** — RDKit's `MolLogP` uses the Wildman-Crippen method, which differs from XLogP3 or ALOGPS; report the specific method used in publications.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for compound library curation and lead optimization campaigns.
- Pair with `references/tools/rdkit.md` — MedChem builds on RDKit molecule objects; all RDKit descriptors and fingerprints are directly applicable.
- Combine with `references/tools/openmm.md` — after filtering drug-like compounds, prepare ligand topologies for MD-based binding free energy calculations.

## Resources / 资源

- Documentation: https://medchem.readthedocs.io/
- RDKit Documentation (dependency): https://www.rdkit.org/docs/
- Bemis-Murcko Original Paper: Bemis & Murcko, J. Med. Chem. 1996, 39, 2887-2893
- ScaffoldTree: Schuffenhauer et al., J. Chem. Inf. Model. 2007, 47, 47-58
