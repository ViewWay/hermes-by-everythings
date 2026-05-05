---
name: deepchem
description: Deep learning for drug discovery, molecular property prediction, and computational chemistry
domain: Chemistry / Drug Discovery
install: pip install deepchem
---

# DeepChem — Deep Learning for Drug Discovery / 药物发现深度学习

DeepChem provides high-level APIs for molecular property prediction, generative models for molecule design, protein-ligand binding prediction, and materials science. It wraps TensorFlow and PyTorch models behind a scikit-learn-like interface.

## When to Use / 适用场景

- Predicting molecular properties (toxicity, solubility, logP, etc.)
- Virtual screening of compound libraries
- Protein-ligand binding affinity prediction
- Generative models for de novo molecule design
- Featurizing molecules for ML (ECFP, GraphConv, Coulomb Matrix, etc.)

## Quick Start / 快速开始

```python
import deepchem as dc

# Load a benchmark dataset
tasks, datasets, transformers = dc.molnet.load_tox21()
train, valid, test = datasets

# Train a model
model = dc.models.GraphConvModel(n_tasks=len(tasks), mode="classification")
model.fit(train, nb_epoch=10)

# Evaluate
metric = dc.metrics.Metric(dc.metrics.roc_auc_score, np.mean)
scores = model.evaluate(test, [metric], transformers)
print(f"Test ROC-AUC: {scores['mean-roc_auc_score']:.3f}")
```

## Core Capabilities / 核心能力

### 1. Molecular Featurization / 分子特征化

```python
import deepchem as dc

# Extended Connectivity Fingerprints (ECFP)
featurizer = dc.feat.CircularFingerprint(size=1024, radius=2)
features = featurizer.featurize(["CCO", "c1ccccc1", "CC(=O)Oc1ccccc1C(=O)O"])

# Graph features for GNNs
featurizer = dc.feat.MolGraphConvFeaturizer(use_edges=True)
features = featurizer.featurize(["CCO"])

# MACCS keys
featurizer = dc.feat.MACCSKeysFingerprint()
features = featurizer.featurize(["CCO"])

# Coulomb Matrix (for quantum chemistry)
featurizer = dc.feat.CoulombMatrix(max_atoms=20)
features = featurizer.featurize(["CCO"])

# Raw SMILES
featurizer = dc.feat.SmilesToImage(img_size=80)
features = featurizer.featurize(["CCO"])
```

### 2. MoleculeNet Datasets / MoleculeNet 数据集

```python
import deepchem as dc

# Available datasets: tox21, toxcast, sider, hiv, bace, bbbp, clintox, muv, pcba, qm7, qm8, qm9, esol, lipophilicity, etc.
tasks, datasets, transformers = dc.molnet.load_esol()  # Solubility
tasks, datasets, transformers = dc.molnet.load_hiv()    # HIV activity
tasks, datasets, transformers = dc.molnet.load_qm9()    # Quantum mechanics

# Custom dataset from SMILES
import pandas as pd
df = pd.read_csv("molecules.csv")
featurizer = dc.feat.CircularFingerprint(size=1024)
loader = dc.data.CSVLoader(
    tasks=["activity"],
    feature_field="smiles",
    featurizer=featurizer
)
dataset = loader.create_dataset("molecules.csv")
```

### 3. Model Training / 模型训练

```python
import deepchem as dc

# Graph Convolution Network
model = dc.models.GraphConvModel(n_tasks=12, mode="classification", dropout=0.2)
model.fit(train, nb_epoch=50)

# Random Forest
from sklearn.ensemble import RandomForestClassifier
sklearn_model = RandomForestClassifier(n_estimators=500)
model = dc.models.SklearnModel(sklearn_model)
model.fit(train)

# Multitask Network
model = dc.models.MultitaskClassifier(n_tasks=12, n_features=1024, layer_sizes=[1000, 500])
model.fit(train, nb_epoch=50)

# Predict
predictions = model.predict(test)
```

### 4. Molecular Generation / 分子生成

```python
import deepchem as dc

# VAE for molecule generation
from deepchem.models import MolGANGenerator
# or use SeqToSeq for SMILES-based generation

# Simple example with pre-trained model
from deepchem.models.text_cnn import TextCNNModel
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: QSAR Modeling Pipeline / QSAR 建模流程

```python
import deepchem as dc
import numpy as np

# Load dataset
tasks, datasets, transformers = dc.molnet.load_tox21()
train, valid, test = datasets

# Train multiple models for comparison
models = {
    "GraphConv": dc.models.GraphConvModel(n_tasks=len(tasks), mode="classification"),
    "RandomForest": dc.models.SklearnModel(
        __import__('sklearn.ensemble', fromlist=['RandomForestClassifier']).RandomForestClassifier(n_estimators=500)
    ),
}

metric = dc.metrics.Metric(dc.metrics.roc_auc_score, np.mean)

results = {}
for name, model in models.items():
    model.fit(train, nb_epoch=20 if "GraphConv" in name else 1)
    train_score = model.evaluate(train, [metric], transformers)
    test_score = model.evaluate(test, [metric], transformers)
    results[name] = {"train": train_score, "test": test_score}
    print(f"{name}: Train={train_score['mean-roc_auc_score']:.3f}, Test={test_score['mean-roc_auc_score']:.3f}")
```

### Workflow 2: Virtual Screening / 虚拟筛选

```python
import deepchem as dc
import pandas as pd

# Load trained model
model = dc.models.GraphConvModel(n_tasks=1, mode="classification")
# model.load_from_dir("trained_model/")

# Screen a library
library_smiles = pd.read_csv("compound_library.csv")["smiles"].tolist()
featurizer = dc.feat.MolGraphConvFeaturizer()
features = featurizer.featurize(library_smiles)
screening_dataset = dc.data.NumpyDataset(X=features)

predictions = model.predict(screening_dataset)
active_indices = np.where(predictions[:, :, 1].flatten() > 0.8)[0]
active_compounds = [library_smiles[i] for i in active_indices]
```

## Best Practices / 最佳实践

- Use `dc.molnet` benchmark datasets to establish baselines before custom datasets
- Split data using `dc.splits.RandomSplitter` or `dc.splits.ScaffoldSplitter` (preferred for chemistry)
- Apply transformers (`dc.trans.BalancingTransformer`) for imbalanced classification
- Compare multiple featurizers (ECFP, GraphConv, MACCS) — no single best featurizer
- Report scaffold-split performance, not just random-split, for realistic assessment

## Common Pitfalls / 常见陷阱

- **Random vs scaffold split**: Random split inflates performance due to analog bias; always use scaffold split for drug discovery
- **Class imbalance**: Many drug datasets are highly imbalanced; use `BalancingTransformer`
- **Invalid SMILES**: Featurization may silently fail on invalid SMILES; check `len(features) == len(smiles)`
- **Transformer inverse**: Apply `transformer.untransform()` to get predictions in original scale

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/rdkit.md` for molecular structure manipulation
- Use with `references/tools/scikit-learn.md` for traditional ML baselines
- Combine with `references/tools/matplotlib.md` for QSAR plots and ROC curves
- Integrate with `workflows/experiment-design.md` for computational chemistry studies

## Resources / 资源

- Documentation: https://deepchem.io/
- Tutorials: https://github.com/deepchem/deepchem/tree/master/examples/tutorials
- MoleculeNet: https://moleculenet.org/
- Paper: Ramsundar et al., Deep Learning for the Life Sciences, O'Reilly 2019
