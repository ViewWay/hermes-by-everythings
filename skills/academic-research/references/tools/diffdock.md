---
name: diffdock
description: Molecular docking with diffusion — protein-ligand binding pose prediction using diffusion models
domain: Chemistry / Structural Biology
install: pip install torch-diffdock  # or clone https://github.com/corso-lab/diffdock
---

# DiffDock — Molecular Docking with Diffusion Models / 扩散模型分子对接

DiffDock uses an equivariant diffusion model to predict protein-ligand binding poses. Unlike traditional search-based docking, DiffDock directly generates 3D poses via a diffusion process, achieving state-of-the-art accuracy with faster inference and no need for exhaustive search.

## When to Use / 适用场景

- Predicting protein-ligand binding poses when crystal structures are unavailable
- Virtual screening of compound libraries against a protein target
- Generating multiple binding pose hypotheses for downstream MD refinement
- Complementing traditional docking tools (AutoDock, Glide) with diffusion-based predictions
- Rapid pose generation for large-scale drug discovery campaigns

## Quick Start / 快速开始

```python
# Install DiffDock (recommended: clone the repository)
# git clone https://github.com/corso-lab/diffdock.git
# pip install -r diffdock/requirements.txt

# Run inference from the command line
# python diffdock/inference.py \
#     --protein_path protein.pdb \
#     --ligand ligand.sdf \
#     --out_dir results/ \
#     --iterations 20 \
#     --samples 10 \
#     --batch_size 4

# The output includes ranked poses with confidence scores in .sdf format
```

```python
# Post-processing: extract confidence scores from output
import glob, os

def parse_diffdock_results(results_dir):
    """Parse DiffDock output poses and confidence scores."""
    poses = sorted(glob.glob(f"{results_dir}/*_ranked_*.sdf"))
    results = []
    for pose_file in poses[:10]:  # Top 10 ranked poses
        rank = int(pose_file.split("_ranked_")[1].split(".")[0])
        confidence = float(pose_file.split("_confidence_")[1].split("_")[0])
        results.append({"rank": rank, "confidence": confidence, "file": pose_file})
    return results

results = parse_diffdock_results("results/protein_ligand/")
for r in results:
    print(f"Rank {r['rank']}: confidence={r['confidence']:.4f}  {r['file']}")
```

## Core Capabilities / 核心能力

### 1. Protein-Ligand Pose Prediction / 蛋白质-配体构象预测

```python
# DiffDock accepts PDB (protein) and SDF/MOL2 (ligand) inputs
# Key inference parameters:
#   --iterations 20       : Diffusion steps (higher = more refined, slower)
#   --samples 10          : Number of stochastic samples per input
#   --batch_size 4        : GPU batch size
#   --no_torsion         : Disable torsion diffusion (faster, less accurate)
#   --model_dir          : Path to pre-trained weights

# Example: batch docking multiple ligands
import os, subprocess

protein = "targets/kinase.pdb"
ligand_dir = "compounds/"
out_dir = "docking_results/"

os.makedirs(out_dir, exist_ok=True)

for ligand in os.listdir(ligand_dir):
    if ligand.endswith(".sdf"):
        subprocess.run([
            "python", "diffdock/inference.py",
            "--protein_path", protein,
            "--ligand", os.path.join(ligand_dir, ligand),
            "--out_dir", out_dir,
            "--iterations", "20",
            "--samples", "10",
            "--batch_size", "4"
        ])
```

### 2. Confidence Scoring and Pose Ranking / 置信度评分与构象排序

```python
import pandas as pd
import glob, os

def summarize_docking_results(results_dir, confidence_threshold=0.5):
    """Summarize DiffDock docking results with confidence filtering."""
    all_results = []
    for result_dir in glob.glob(f"{results_dir}/*/"):
        pose_files = glob.glob(f"{result_dir}*_ranked_*.sdf")
        for pf in pose_files:
            parts = os.path.basename(pf).replace(".sdf", "").split("_")
            rank = int(parts[parts.index("ranked") + 1])
            conf = float(parts[parts.index("confidence") + 1])
            all_results.append({
                "complex": os.path.basename(result_dir.rstrip("/")),
                "rank": rank,
                "confidence": conf,
                "file": pf
            })
    df = pd.DataFrame(all_results)
    high_conf = df[df["confidence"] >= confidence_threshold]
    print(f"Total poses: {len(df)}, High confidence (>= {confidence_threshold}): {len(high_conf)}")
    return df

df = summarize_docking_results("docking_results/")
print(df.groupby("complex")["confidence"].agg(["mean", "max", "count"]))
```

### 3. PDB Processing for DiffDock / 蛋白质结构预处理

```python
from Bio.PDB import PDBParser, PDBIO, Select

class NoHeteroAtoms(Select):
    """Remove water and hetero atoms, keep standard residues only."""
    def accept_atom(self, atom):
        residue = atom.get_parent()
        return residue.get_resname() not in ("HOH", "WAT") and residue.id[0] == " "

def prepare_protein_for_diffdock(input_pdb, output_pdb):
    """Clean PDB file: remove waters, heteroatoms, and add missing hydrogens."""
    parser = PDBParser(QUIET=True)
    io = PDBIO()
    structure = parser.get_structure("protein", input_pdb)
    io.set_structure(structure)
    io.save(output_pdb, NoHeteroAtoms())
    print(f"Cleaned PDB saved to {output_pdb}")

prepare_protein_for_diffdock("raw_target.pdb", "target_clean.pdb")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Virtual Screening Pipeline / 虚拟筛选流程

```python
import os, subprocess, pandas as pd
from rdkit import Chem
from rdkit.Chem import AllChem

def virtual_screen_diffdock(protein_pdb, library_csv, smiles_col, out_dir,
                             confidence_threshold=0.6, top_n=50):
    """Run DiffDock virtual screening and return top hits."""
    os.makedirs(f"{out_dir}/ligands", exist_ok=True)
    os.makedirs(f"{out_dir}/results", exist_ok=True)

    # Step 1: Convert SMILES to 3D SDF
    df = pd.read_csv(library_csv)
    for idx, row in df.iterrows():
        mol = Chem.MolFromSmiles(row[smiles_col])
        mol = Chem.AddHs(mol)
        AllChem.EmbedMolecule(mol, randomSeed=42)
        AllChem.MMFFOptimizeMolecule(mol)
        writer = Chem.SDWriter(f"{out_dir}/ligands/lig_{idx}.sdf")
        writer.write(mol)
        writer.close()

    # Step 2: Run DiffDock on each ligand
    for lig_file in sorted(os.listdir(f"{out_dir}/ligands/")):
        if not lig_file.endswith(".sdf"):
            continue
        subprocess.run([
            "python", "diffdock/inference.py",
            "--protein_path", protein_pdb,
            "--ligand", f"{out_dir}/ligands/{lig_file}",
            "--out_dir", f"{out_dir}/results/",
            "--iterations", "20",
            "--samples", "10"
        ])

    # Step 3: Rank by confidence and select top hits
    results = summarize_docking_results(f"{out_dir}/results/", confidence_threshold)
    top_hits = results[results["rank"] == 1].nlargest(top_n, "confidence")
    return top_hits

top_hits = virtual_screen_diffdock("target_clean.pdb", "library.csv", "smiles", "screening/")
print(top_hits[["complex", "confidence"]])
```

## Best Practices / 最佳实践

1. **Preprocess proteins**: Remove waters and heteroatoms before docking; use PDBFixer or ChimeraX for missing residues
2. **Use confidence threshold**: DiffDock confidence > 0.5 is reasonable; > 0.7 indicates high-confidence pose
3. **Multiple samples**: Use `--samples 10` or more to account for stochasticity; take the best-ranked pose
4. **Iterative refinement**: Feed top DiffDock poses into short MD simulations or MM-GBSA for rescoring
5. **GPU required**: DiffDock needs a GPU with at least 8 GB VRAM for reasonable inference speed

## Common Pitfalls / 常见陷阱

- **Missing protein residues**: DiffDock does not model missing loops; preprocess with Modeller or AlphaFold
- **Non-standard ligands**: DiffDock works best with drug-like molecules; metals and cofactors may cause issues
- **Low confidence is unreliable**: Poses with confidence < 0.3 are essentially random; do not interpret them
- **Large proteins**: Truncate to binding site (~20 A around known site) for faster and more accurate results
- **Batch size too large**: Reduce `--batch_size` if GPU OOM errors occur

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/rdkit.md` for ligand preparation and SDF generation
- Use with `references/tools/biopython.md` for PDB parsing and protein preprocessing
- Combine with `references/tools/deepchem.md` for downstream ML on docking scores
- Integrate with `workflows/experiment-design.md` for structure-based drug design studies

## Resources / 资源

- Repository: https://github.com/corso-lab/diffdock
- Paper: Corso et al., "DiffDock: Diffusion Steps, Twists, and Turns for Molecular Docking," ICLR 2023
- Web server: https://huggingface.co/spaces/simonduerr/diffdock (interactive demo)
- Weights: https://github.com/corso-lab/diffdock#pre-trained-models
