---
name: rdkit
description: Cheminformatics toolkit for molecular analysis. Use for SMILES parsing, molecular descriptors, fingerprints, substructure search, similarity, and drug-likeness analysis.
domain: chemistry
install: pip install rdkit
---

# RDKit: Cheminformatics

## Overview

RDKit is the standard cheminformatics library for molecular analysis — parsing SMILES, computing descriptors, generating fingerprints, substructure search, similarity screening, and molecular visualization.

## When to Use

- Drug discovery and molecular property prediction
- SMILES/MOL file parsing and generation
- Molecular descriptor calculation (MW, LogP, TPSA, HBD/HBA)
- Fingerprint generation and similarity search
- Substructure search with SMARTS patterns
- Chemical reaction processing
- Molecular visualization

## Quick Start

```python
from rdkit import Chem
from rdkit.Chem import Descriptors, rdFingerprintGenerator, Draw
from rdkit import DataStructs

# Parse SMILES
mol = Chem.MolFromSmiles('CC(=O)OC1=CC=CC=C1C(=O)O')  # Aspirin
smiles = Chem.MolToSmiles(mol)

# Basic descriptors
mw = Descriptors.MolWt(mol)            # 180.16
logp = Descriptors.MolLogP(mol)        # 1.31
tpsa = Descriptors.TPSA(mol)           # 63.60
hbd = Descriptors.NumHDonors(mol)      # 1
hba = Descriptors.NumHAcceptors(mol)   # 4

# All descriptors at once
all_desc = Descriptors.CalcMolDescriptors(mol)

# Fingerprint + similarity
morgan_gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
fp1 = morgan_gen.GetFingerprint(mol1)
fp2 = morgan_gen.GetFingerprint(mol2)
similarity = DataStructs.TanimotoSimilarity(fp1, fp2)
```

## Core Capabilities

### 1. Molecular Descriptors for Papers

```python
from rdkit.Chem import Descriptors

def molecule_report(smiles):
    mol = Chem.MolFromSmiles(smiles)
    if mol is None: return None
    return {
        'SMILES': Chem.MolToSmiles(mol),
        'MW': round(Descriptors.MolWt(mol), 2),
        'LogP': round(Descriptors.MolLogP(mol), 2),
        'TPSA': round(Descriptors.TPSA(mol), 2),
        'HBD': Descriptors.NumHDonors(mol),
        'HBA': Descriptors.NumHAcceptors(mol),
        'RotBonds': Descriptors.NumRotatableBonds(mol),
        'AromaticRings': Descriptors.NumAromaticRings(mol),
        'Lipinski': (Descriptors.MolWt(mol) <= 500 and Descriptors.MolLogP(mol) <= 5
                     and Descriptors.NumHDonors(mol) <= 5 and Descriptors.NumHAcceptors(mol) <= 10),
    }
```

### 2. Fingerprint Similarity Screening

```python
def similarity_screen(query_smiles, database_smiles, threshold=0.7):
    query_mol = Chem.MolFromSmiles(query_smiles)
    query_fp = morgan_gen.GetFingerprint(query_mol)
    hits = []
    for smi in database_smiles:
        mol = Chem.MolFromSmiles(smi)
        if mol:
            fp = morgan_gen.GetFingerprint(mol)
            sim = DataStructs.TanimotoSimilarity(query_fp, fp)
            if sim >= threshold: hits.append((smi, sim))
    return sorted(hits, key=lambda x: -x[1])
```

### 3. Substructure Search

```python
query = Chem.MolFromSmarts('c1ccccc1')  # Benzene ring
matches = [smi for smi in smiles_list
           if (mol := Chem.MolFromSmiles(smi)) and mol.HasSubstructMatch(query)]
```

### 4. Molecular Visualization

```python
from rdkit.Chem import Draw
mols = [Chem.MolFromSmiles(s) for s in smiles_list]
img = Draw.MolsToGridImage(mols, molsPerRow=4, subImgSize=(200, 200), legends=names)
img.save('molecules.png')
```

## Best Practices

1. **Always check for None**: `MolFromSmiles` returns None on parse failure
2. **Use canonical SMILES**: `Chem.MolToSmiles(mol)` for consistent representation
3. **Morgan radius=2**: ECFP4-like, most common for similarity
4. **Sanitize before use**: `Chem.SanitizeMol(mol)` if loading unsanitized data

## Common Pitfalls

1. **Parse failures**: Invalid SMILES → None; always check
2. **Aromaticity**: Use `Chem.MolFromSmiles`, not `Chem.MolFromSmarts` for input
3. **Stereochemistry**: Set `sanitize=True` (default) for correct chirality
4. **Memory with large libraries**: Use `ForwardSDMolSupplier` for streaming

## Integration with HBE

- Primary chemistry tool in `references/tool-registry.md`
- Supports `references/data-processing-guide.md` for molecular data
- Works with `references/tools/matplotlib.md` for figure generation

## Resources

- Documentation: https://www.rdkit.org/docs/
- Getting Started: https://www.rdkit.org/docs/GettingStartedInPython.html
