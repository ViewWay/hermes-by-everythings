---
name: molfeat
description: Molecular feature engineering toolkit — embeddings from fingerprints, descriptors, and pretrained models
domain: Chemistry / ML
install: pip install molfeat
---

# molfeat — Molecular Feature Engineering / 分子特征工程

Compute molecular representations from fingerprints, physicochemical descriptors, graph neural networks, and pretrained transformer models with a unified scikit-learn-compatible API.

## When to Use / 适用场景

- Building QSAR/QSPR models with diverse molecular representations / 使用多种分子表示构建 QSAR/QSPR 模型
- Comparing fingerprint, descriptor, and pretrained embedding strategies / 比较指纹、描述符和预训练嵌入策略
- Integrating molecular featurization into scikit-learn or PyTorch pipelines / 将分子特征工程集成到 scikit-learn 或 PyTorch 管道
- Batch featurizing large molecular databases (ChEMBL, PubChem) / 批量特征化大型分子数据库
- Generating embeddings from pretrained models (ChemBERTa, MolBERT) / 从预训练模型生成嵌入

## Quick Start / 快速开始

```python
from molfeat.calc import FPCalculator, RDKitDescriptors2D
from molfeat.trans import MoleculeTransformer
from molfeat.trans.pretrained import PretrainedTransformer

smiles_list = ["CCO", "c1ccccc1", "CC(=O)Oc1ccccc1C(=O)O", "CC(=O)O", "CN1C=NC2=C1C(=O)N(C(=O)N2C)C"]

# ECFP4 fingerprint (Morgan radius=2, 2048 bits)
fp_transformer = MoleculeTransformer("ecfp", n_bits=2048, radius=2)
fingerprints = fp_transformer(smiles_list)  # shape: (5, 2048)

# RDKit 2D descriptors (208 physicochemical descriptors)
desc_transformer = MoleculeTransformer(RDKitDescriptors2D())
descriptors = desc_transformer(smiles_list)  # shape: (5, 208)

# Pretrained transformer embedding (ChemBERTa-77M)
chemberta = PretrainedTransformer(kind="ChemBERTa-77M-MLM")
embeddings = chemberta(smiles_list)  # shape: (5, 768)

print(f"ECFP shape: {fingerprints.shape}")
print(f"Descriptors shape: {descriptors.shape}")
print(f"ChemBERTa shape: {embeddings.shape}")
```

## Core Capabilities / 核心能力

### 1. Molecular Fingerprints / 分子指纹

Generate various fingerprint types with configurable parameters for structure-activity relationship modeling.

```python
from molfeat.calc import FPCalculator

# ECFP4 (Extended Connectivity Fingerprint, radius=2)
ecfp = FPCalculator("ecfp", radius=2, n_bits=2048)
fp = ecpf("CC(=O)Oc1ccccc1C(=O)O")  # Aspirin

# MACCS keys (166 structural keys)
maccs = FPCalculator("maccs")
keys = maccs("CCO")

# Atom-pair fingerprints
ap = FPCalculator("atompair", n_bits=2048)
ap_fp = ap("c1ccccc1")

# Topological torsion fingerprints
tt = FPCalculator("topologicaltorsion", n_bits=2048)
tt_fp = tt("CC(=O)O")

# RDKit pattern fingerprints
rdkit_fp = FPCalculator("rdk", n_bits=2048)
rdk_fp = rdkit_fp("CN1C=NC2=C1C(=O)N(C(=O)N2C)C")  # Caffeine
```

### 2. Graph Neural Network Embeddings / 图神经网络嵌入

Compute learned molecular representations from pretrained GNN models.

```python
from molfeat.trans.pretrained import PretrainedTransformer

# ChemBERTa (77M parameters, MLM pretrained on SMILES)
chemberta = PretrainedTransformer(kind="ChemBERTa-77M-MLM")
emb = chemberta("CC(=O)Oc1ccccc1C(=O)O")  # shape: (768,)

# MolBERT (109M parameters, MLM pretrained)
molbert = PretrainedTransformer(kind="MolBERT")
emb_molbert = molbert("c1ccccc1")  # shape: (768,)

# Uni-Mol (universal molecular representation via HuggingFace)
from molfeat.trans.pretrained import HFModel
unimol = HFModel(kind="ibm/MoLFormer-XL-both-10pct", featurizer="smiles")
emb_unimol = unimol(["CCO", "c1ccccc1"])
```

### 3. Custom Featurizer Registration / 自定义特征器注册

Create and register custom featurizers for novel molecular representations.

```python
from molfeat.calc import BaseCalculator
from molfeat.trans import MoleculeTransformer
import numpy as np

class CustomFPCalculator(BaseCalculator):
    """Custom fingerprint combining ECFP4 + molecular weight."""
    def __init__(self, n_bits=1024, **kwargs):
        super().__init__(n_bits=n_bits + 1, **kwargs)
        self._ecfp = FPCalculator("ecfp", n_bits=n_bits)

    def __call__(self, mol, **kwargs):
        from rdkit import Chem
        from rdkit.Chem import Descriptors
        if isinstance(mol, str):
            mol = Chem.MolFromSmiles(mol)
        ecfp_fp = self._ecfp(mol)
        mw = Descriptors.MolWt(mol) / 500.0  # Normalized molecular weight
        return np.concatenate([ecfp_fp, [mw]])

    def __len__(self):
        return self.n_bits

# Use the custom calculator like any other
custom = MoleculeTransformer(CustomFPCalculator(n_bits=1024))
features = custom(["CCO", "c1ccccc1"])  # shape: (2, 1025)
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: QSAR Model with Multiple Featurization Strategies / QSAR 多策略比较

Build and compare QSAR models using fingerprints, descriptors, and pretrained embeddings.

```python
from molfeat.trans import MoleculeTransformer
from molfeat.calc import RDKitDescriptors2D
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
import numpy as np

smiles = ["CCO", "c1ccccc1", "CC(=O)O", "CN1C=NC2=C1C(=O)N(C(=O)N2C)C",
           "CC(=O)Oc1ccccc1C(=O)O", "CC(C)CC1=CC=C(C=C1)C(C)C"]
logp = [0.31, 2.13, 0.52, -0.07, 1.19, 3.98]

strategies = {
    "ECFP4-1024": MoleculeTransformer("ecfp", n_bits=1024),
    "ECFP4-2048": MoleculeTransformer("ecfp", n_bits=2048),
    "MACCS": MoleculeTransformer("maccs"),
    "RDKit2D": MoleculeTransformer(RDKitDescriptors2D()),
}

print(f"{'Strategy':<15} {'R2 (5-fold CV)':<18} {'RMSE (5-fold CV)'}")
print("-" * 50)
for name, featurizer in strategies.items():
    X = featurizer(smiles)
    X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
    pipeline = Pipeline([("model", RandomForestRegressor(n_estimators=100, random_state=42))])
    r2 = cross_val_score(pipeline, X, logp, cv=5, scoring="r2")
    rmse = cross_val_score(pipeline, X, logp, cv=5, scoring="neg_root_mean_squared_error")
    print(f"{name:<15} {r2.mean():.4f} +/- {r2.std():.4f}      {-rmse.mean():.4f} +/- {rmse.std():.4f}")
```

### Workflow 2: Integration with scikit-learn Pipelines / 集成 scikit-learn 管道

```python
from sklearn.pipeline import Pipeline
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from molfeat.trans import MoleculeTransformer

smiles_train, smiles_test, y_train, y_test = train_test_split(
    smiles, [0, 1, 0, 0, 0, 1], test_size=0.3, random_state=42
)
pipeline = Pipeline([
    ("featurizer", MoleculeTransformer("ecfp", n_bits=2048)),
    ("classifier", GradientBoostingClassifier(n_estimators=200, max_depth=5, random_state=42)),
])
pipeline.fit(smiles_train, y_train)
print(f"Test accuracy: {pipeline.score(smiles_test, y_test):.3f}")
```

## Best Practices / 最佳实践

- Use `MoleculeTransformer` as the primary interface for batch processing -- it handles SMILES parsing, sanitization, and parallelization internally.
- Always apply `np.nan_to_num()` to RDKit descriptor outputs before passing to ML models, as invalid molecules produce NaN values.
- For large datasets (>100K molecules), use `MoleculeTransformer(..., n_jobs=-1)` to parallelize featurization across CPU cores.
- When comparing representations, standardize features before model training to ensure fair comparison across different embedding dimensions.
- Cache featurized outputs with `joblib.dump()` since transformer inference (ChemBERTa) is the bottleneck for large datasets.

## Common Pitfalls / 常见陷阱

- **Invalid SMILES silently fail**: `MoleculeTransformer` returns zero vectors for invalid SMILES. Always validate with `Chem.MolFromSmiles(smi)` and filter out `None` results.
- **Pretrained model download on first use**: ChemBERTa and MolBERT download ~300 MB model weights on first invocation. Pre-download in HPC batch jobs.
- **Dimensionality mismatch across strategies**: ECFP produces sparse binary vectors while descriptors produce dense floats. Handle each type appropriately.
- **RDKit descriptor NaN values**: Descriptors like `MaxPartialCharge` produce NaN for molecules without partial charges. Impute these columns before training.
- **SMILES canonicalization**: Different featurizers may or may not canonicalize SMILES internally. Canonicalize explicitly with `Chem.MolToSmiles(Chem.MolFromSmiles(smi))`.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/computational-chemistry.md` to generate molecular features for QSAR and molecular property prediction tasks.
- Pair with `references/tools/scikit-learn.md` to build complete ML pipelines with cross-validation and hyperparameter tuning.
- Combine with `references/tools/wandb.md` to log featurization strategy comparison results for paper supplementary tables.

## Resources / 资源

- Documentation: https://molfeat.readthedocs.io/
- GitHub: https://github.com/datamol-io/molfeat
- Pretrained Models: https://molfeat.readthedocs.io/en/latest/notebooks/02_pretrained.html
- D-MPNN Paper: https://arxiv.org/abs/1904.01557
