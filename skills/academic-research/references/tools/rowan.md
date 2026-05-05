---
name: rowan
description: Computational chemistry cloud API — quantum chemistry calculations submitted and retrieved via REST API
domain: Chemistry / Cloud
install: pip install qcengine  # See Rowan documentation for latest client package
---

# Rowan — Computational Chemistry Cloud API / 量子化学云计算接口

Rowan provides a cloud-based REST API for running quantum chemistry calculations (geometry optimization, frequency analysis, single-point energy, excited states) without local HPC resources. It supports multiple quantum chemistry methods (DFT, HF, MP2, CCSD(T)) and basis sets, with results returned in standard quantum chemistry formats.

## When to Use / 适用场景

- Running quantum chemistry calculations without local compute infrastructure
- Quick energy evaluations during molecular screening campaigns
- Geometry optimization and frequency calculations for small to medium molecules
- Excited state calculations (TD-DFT, CIS) for UV-Vis spectra prediction
- Benchmarking quantum chemistry methods across molecules
- Teaching quantum chemistry with zero local software installation

## Quick Start / 快速开始

```python
import requests
import json, time

# Rowan API configuration
ROWAN_API_KEY = "your-api-key-here"
ROWAN_BASE_URL = "https://api.rowansci.com/v1"

headers = {
    "Authorization": f"Bearer {ROWAN_API_KEY}",
    "Content-Type": "application/json"
}

# Submit a single-point energy calculation (water molecule)
payload = {
    "molecule": {
        "geometry": [
            [0.0, 0.0, 0.0],    # O
            [0.0, 0.0, 1.0],    # H
            [0.0, 1.0, 0.0]     # H
        ],
        "atomic_numbers": [8, 1, 1],
        "charge": 0,
        "multiplicity": 1
    },
    "method": "b3lyp",
    "basis": "6-31g*",
    "calculation_type": "energy"
}

response = requests.post(f"{ROWAN_BASE_URL}/calculations",
                         headers=headers, json=payload)
job = response.json()
print(f"Job submitted: {job['id']}, Status: {job['status']}")

# Poll for results
while job["status"] not in ("completed", "failed"):
    time.sleep(5)
    response = requests.get(f"{ROWAN_BASE_URL}/calculations/{job['id']}",
                            headers=headers)
    job = response.json()
    print(f"  Status: {job['status']}")

if job["status"] == "completed":
    energy = job["result"]["energy"]
    print(f"Total energy: {energy:.8f} hartree")
```

## Core Capabilities / 核心能力

### 1. Molecule Submission Formats / 分子提交格式

```python
# Format 1: XYZ geometry with atomic numbers
molecule_xyz = {
    "geometry": [
        [0.000, 0.000, 0.000],   # C
        [0.629, 0.629, 0.629],   # H
        [-0.629, -0.629, 0.629],  # H
        [-0.629, 0.629, -0.629],  # H
        [0.629, -0.629, -0.629]   # H
    ],
    "atomic_numbers": [6, 1, 1, 1, 1],
    "charge": 0,
    "multiplicity": 1
}

# Format 2: SMILES string (server generates 3D geometry)
molecule_smiles = {
    "smiles": "c1ccccc1",  # Benzene
    "charge": 0,
    "multiplicity": 1
}

# Format 3: From RDKit molecule
from rdkit import Chem
from rdkit.Chem import AllChem

mol = Chem.MolFromSmiles("CC(=O)O")  # Acetic acid
mol = Chem.AddHs(mol)
AllChem.EmbedMolecule(mol, randomSeed=42)
conf = mol.GetConformer()
geometry = [[conf.GetAtomPosition(i).x,
             conf.GetAtomPosition(i).y,
             conf.GetAtomPosition(i).z] for i in range(mol.GetNumAtoms())]
atomic_numbers = [atom.GetAtomicNum() for atom in mol.GetAtoms()]

molecule_rdkit = {
    "geometry": geometry,
    "atomic_numbers": atomic_numbers,
    "charge": 0,
    "multiplicity": 1
}
```

### 2. Calculation Types / 计算类型

```python
# Geometry optimization
opt_payload = {
    "molecule": molecule_xyz,
    "method": "b3lyp",
    "basis": "def2-svp",
    "calculation_type": "optimize",
    "options": {"max_iterations": 100, "convergence": "tight"}
}

# Frequency calculation (after optimization)
freq_payload = {
    "molecule": optimized_geometry,  # From optimization result
    "method": "b3lyp",
    "basis": "def2-svp",
    "calculation_type": "frequency"
}

# Excited state (TD-DFT) for UV-Vis
td_payload = {
    "molecule": molecule_xyz,
    "method": "b3lyp",
    "basis": "6-31+g*",
    "calculation_type": "td",
    "options": {"n_states": 10, "singlets": True}
}

# High-level single-point (DLPNO-CCSD(T))
highlevel_payload = {
    "molecule": optimized_geometry,
    "method": "dlpno-ccsd(t)",
    "basis": "def2-tzvp",
    "calculation_type": "energy"
}
```

### 3. Batch Calculations and Result Retrieval / 批量计算与结果获取

```python
import requests, pandas as pd, time

def submit_batch(smiles_list, method="b3lyp", basis="6-31g*"):
    """Submit a batch of single-point energy calculations."""
    headers = {"Authorization": f"Bearer {ROWAN_API_KEY}",
               "Content-Type": "application/json"}
    job_ids = []
    for smi in smiles_list:
        payload = {
            "molecule": {"smiles": smi, "charge": 0, "multiplicity": 1},
            "method": method, "basis": basis, "calculation_type": "energy"
        }
        resp = requests.post(f"{ROWAN_BASE_URL}/calculations",
                             headers=headers, json=payload)
        job_ids.append(resp.json()["id"])
    return job_ids

def collect_results(job_ids, poll_interval=10):
    """Poll all jobs and return DataFrame with energies."""
    headers = {"Authorization": f"Bearer {ROWAN_API_KEY}"}
    results = []
    for jid in job_ids:
        while True:
            resp = requests.get(f"{ROWAN_BASE_URL}/calculations/{jid}",
                                headers=headers)
            job = resp.json()
            if job["status"] in ("completed", "failed"):
                break
            time.sleep(poll_interval)
        results.append({"job_id": jid, "status": job["status"],
                        "energy": job.get("result", {}).get("energy")})
    return pd.DataFrame(results)

smiles = ["C", "CC", "CCC", "CCCC", "CCO", "c1ccccc1"]
job_ids = submit_batch(smiles)
df = collect_results(job_ids)
print(df)
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Conformational Energy Screening / 构象能量筛选

```python
import requests, time
from rdkit import Chem
from rdkit.Chem import AllChem

def get_3d_geometries(smiles, n_conformers=5):
    """Generate multiple conformers for a molecule."""
    mol = Chem.MolFromSmiles(smiles)
    mol = Chem.AddHs(mol)
    AllChem.EmbedMultipleConfs(mol, numConfs=n_conformers,
                                randomSeed=42, pruneRmsThresh=0.5)
    geometries = []
    for conf_id in range(mol.GetNumConformers()):
        conf = mol.GetConformer(conf_id)
        geom = [[conf.GetAtomPosition(i).x,
                 conf.GetAtomPosition(i).y,
                 conf.GetAtomPosition(i).z]
                for i in range(mol.GetNumAtoms())]
        geometries.append(geom)
    return geometries, [a.GetAtomicNum() for a in mol.GetAtoms()]

# Submit conformers for energy evaluation
smiles = "CC(C)CC(C)C"
geometries, atomic_numbers = get_3d_geometries(smiles, n_conformers=10)

headers = {"Authorization": f"Bearer {ROWAN_API_KEY}",
           "Content-Type": "application/json"}
energies = []
for i, geom in enumerate(geometries):
    payload = {"molecule": {"geometry": geom, "atomic_numbers": atomic_numbers,
                            "charge": 0, "multiplicity": 1},
               "method": "wb97x-d", "basis": "def2-svp",
               "calculation_type": "energy"}
    resp = requests.post(f"{ROWAN_BASE_URL}/calculations",
                         headers=headers, json=payload)
    job = resp.json()
    while job["status"] not in ("completed", "failed"):
        time.sleep(5)
        job = requests.get(f"{ROWAN_BASE_URL}/calculations/{job['id']}",
                           headers=headers).json()
    energies.append(job.get("result", {}).get("energy", float("nan")))

lowest = min(energies)
relative = [e - lowest for e in energies]
for i, rel_e in enumerate(relative):
    print(f"Conformer {i}: {rel_e:.6f} hartree ({rel_e * 627.5:.2f} kcal/mol)")
```

## Best Practices / 最佳实践

1. **Start with cheap methods**: Use B3LYP/6-31G* for screening, then DLPNO-CCSD(T)/def2-TZVP for final
2. **Optimize first**: Always optimize geometry before single-point energy calculations
3. **Check convergence**: Inspect optimization convergence; unconverged structures are unreliable
4. **Verify charges**: Set correct molecular charge and spin multiplicity for open-shell systems
5. **Batch submissions**: Submit many jobs in parallel rather than waiting sequentially

## Common Pitfalls / 常见陷阱

- **Wrong multiplicity**: Open-shell radicals need multiplicity=2; triplet states need multiplicity=3
- **SCF convergence failure**: Try `guess=mix` or `scf=xqc` options for difficult cases
- **Basis set superposition error**: Use counterpoise correction for interaction energies
- **API rate limits**: Check documentation for rate limits; batch large jobs during off-peak hours
- **Cost management**: High-level methods (CCSD(T)) are expensive; estimate costs before campaigns

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/rdkit.md` for molecule preparation and 3D conformer generation
- Use with `references/tools/pandas.md` for tabular result management
- Combine with `references/tools/matplotlib.md` for energy plots and UV-Vis spectrum visualization
- Integrate with `workflows/experiment-design.md` for computational chemistry studies

## Resources / 资源

- Rowan Documentation: https://docs.rowansci.com/
- REST API: https://docs.rowansci.com/api
- Supported methods: https://docs.rowansci.com/methods
- QCEngine (open-source alternative): https://molssi-qcengine.readthedocs.io/
