---
name: datamol
description: Molecular data science toolkit built on RDKit — simplified API for cheminformatics, dataset curation, and molecular descriptors
domain: Chemistry / Cheminformatics
install: pip install datamol
---

# datamol — Molecular Data Science / 分子数据科学

datamol provides a simplified, high-level API for common cheminformatics tasks built on top of RDKit. It handles molecule I/O, descriptor calculation, dataset curation, molecular clustering, and scaffold analysis.

## When to Use / 适用场景

- Quick molecular data manipulation with a cleaner API than raw RDKit
- Curating and standardizing molecular datasets
- Calculating molecular descriptors and fingerprints
- Scaffold-based analysis and diversity assessment
- Building molecular ML pipelines

## Quick Start / 快速开始

```python
import datamol as dm

# Convert SMILES to molecule
mol = dm.to_mol("CC(=O)Oc1ccccc1C(=O)O")  # Aspirin

# Basic properties
print(dm.descriptors(mol))  # mw, logp, tpsa, hba, hbd, rotatable_bonds, ...

# Batch processing
smiles_list = ["CCO", "c1ccccc1", "CC(=O)O"]
mols = [dm.to_mol(s) for s in smiles_list]

# Convert back to SMILES
canonical = dm.to_smiles(mol)
```

## Core Capabilities / 核心能力

### 1. Molecular Conversion and Standardization / 分子转换与标准化

```python
import datamol as dm

# SMILES → mol
mol = dm.to_mol("CC(=O)Oc1ccccc1C(=O)O")

# Standardize (sanitize, neutralize, remove salts)
mol = dm.standardize_mol(mol)

# Canonical SMILES
smiles = dm.to_smiles(mol)  # Canonical
smiles = dm.to_smiles(mol, isomeric=True)  # Include stereochemistry

# InChI
inchi = dm.to_inchi(mol)
inchikey = dm.to_inchikey(mol)

# Selfies (for generative models)
selfies_str = dm.to_selfies(mol)
```

### 2. Descriptors and Fingerprints / 描述符与指纹

```python
import datamol as dm

# Compute all common descriptors
desc = dm.descriptors(mol)
# Returns dict: mw, fsp3, logp, tpsa, hba, hbd, rotatable_bonds, ...

# Morgan fingerprint (ECFP)
fp = dm.to_fp(mol, fp_type="morgan")  # numpy array

# MACCS keys
fp = dm.to_fp(mol, fp_type="maccs")

# Batch fingerprints
fps = [dm.to_fp(m, fp_type="morgan") for m in mols]
```

### 3. Dataset Curation / 数据集整理

```python
import datamol as dm
import pandas as pd

# Load molecular dataset
df = pd.read_csv("molecules.csv")

# Standardize all SMILES
df["mol"] = df["smiles"].apply(dm.to_mol)
df["smiles_clean"] = df["mol"].apply(lambda m: dm.to_smiles(m) if m else None)

# Filter invalid molecules
df = df.dropna(subset=["smiles_clean"])

# Remove duplicates
df = df.drop_duplicates(subset=["smiles_clean"])

# Add descriptors
df["mw"] = df["mol"].apply(lambda m: dm.descriptors(m)["mw"] if m else None)
df["logp"] = df["mol"].apply(lambda m: dm.descriptors(m)["logp"] if m else None)
```

### 4. Scaffold Analysis / 骨架分析

```python
import datamol as dm

# Bemis-Murcko scaffold
scaffold = dm.to_scaffold(mol)
scaffold_smiles = dm.to_smiles(scaffold)

# Scaffold clustering
from datamol import cluster
clusters = cluster.mol_outlier_clusters(mols)
```

### 5. Substructure Search / 子结构搜索

```python
import datamol as dm

# SMARTS pattern matching
pattern = dm.from_smarts("c1ccccc1")  # Benzene ring
matches = dm.substructure_search(mols, pattern)

# Functional group matching
has_ester = dm.substructure_match(mol, dm.from_smarts("C(=O)O"))
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Molecular Dataset Curation / 分子数据集整理

```python
import datamol as dm
import pandas as pd

df = pd.read_csv("raw_molecules.csv")

def curate_row(row):
    mol = dm.to_mol(row["smiles"])
    if mol is None:
        return None
    mol = dm.standardize_mol(mol)
    desc = dm.descriptors(mol)
    return {
        "smiles_clean": dm.to_smiles(mol),
        "inchikey": dm.to_inchikey(mol),
        "mw": desc["mw"],
        "logp": desc["logp"],
        "tpsa": desc["tpsa"],
        "hba": desc["hba"],
        "hbd": desc["hbd"],
    }

curated = df.apply(curate_row, axis=1, result_type="expand")
df = pd.concat([df, curated], axis=1).dropna(subset=["smiles_clean"])
df.to_csv("curated_molecules.csv", index=False)
```

## Best Practices / 最佳实践

- Always standardize molecules before computing descriptors or fingerprints
- Use InChIKey for deduplication (more reliable than canonical SMILES for tautomers)
- Report which standardization steps were applied in methods

## Common Pitfalls / 常见陷阱

- **Invalid SMILES**: `to_mol()` returns `None` for invalid SMILES; always check
- **Tautomers**: Different tautomers give different SMILES; standardize first
- **Stereochemistry**: Set `isomeric=True/False` consistently across analysis

## Integration with HBE / 与 HBE 集成

- Simplified wrapper over `references/tools/rdkit.md`
- Pair with `references/tools/pandas.md` for dataset manipulation
- Use with `references/tools/scikit-learn.md` for QSAR modeling
- Combine with `references/tools/deepchem.md` for deep learning pipelines

## Resources / 资源

- Documentation: https://doc.datamol.io/
- GitHub: https://github.com/datamol-io/datamol
- Tutorial: https://doc.datamol.io/stable/tutorials.html
