---
name: pytdc
description: Therapeutics Data Commons — benchmark ML tasks for drug discovery and development
domain: Chemistry / Drug Discovery
install: pip install PyTDC
---

# pytdc — Therapeutics Data Commons

PyTDC (Therapeutics Data Commons) provides standardized ML benchmark tasks for drug discovery, including ADMET prediction, drug-target interaction, molecular generation, and clinical trial outcome prediction. Each task comes with curated datasets and evaluation metrics, enabling fair model comparison.

## When to Use

- Benchmarking ML models on drug discovery tasks (ADMET, DTI, molecular generation)
- Accessing curated, split datasets for drug property prediction
- Comparing your model against published baselines on standardized tasks
- Generating new molecules with specified properties (de novo design)
- Predicting clinical trial outcomes or drug response from molecular features

## Quick Start

```python
from tdc.multi_pred import DrugTarget
from tdc.single_pred import ADME
from tdc import Evaluator

# Load a Drug-Target Interaction dataset
data = DrugTarget(name="DAVIS", path="data/")
split = data.get_split(method="scaffold")
print(f"Train: {len(split['train'])}, Valid: {len(split['valid'])}, Test: {len(split['test'])}")
print(f"Columns: {split['train'].columns.tolist()}")
print(split["train"].head())

# Load an ADMET prediction dataset
adme = ADME(name="Caco2_Wang", path="data/")
adme_split = adme.get_split(method="scaffold")
print(f"ADME task — predicting {adme_split['train'].columns[-1]} from SMILES")

# Evaluate predictions
evaluator = Evaluator(name="ROC-AUC")
score = evaluator(adme_split["test"]["Y"], predictions)
print(f"ROC-AUC: {score:.4f}")
```

## Core Capabilities

### Single-Property Prediction (ADMET)

```python
from tdc.single_pred import ADME, Tox, HTS
from tdc import Evaluator

# ADMET properties — solubility, permeability, clearance, etc.
solubility = ADME(name="Solubility_AqSolDB", path="data/")
split = solubility.get_split(method="scaffold")

# Train a simple model
from sklearn.ensemble import RandomForestRegressor
from rdkit import Chem
from rdkit.Chem import Descriptors

def featurize(smiles_list):
    return [[Descriptors.MolLogP(Chem.MolFromSmiles(s)),
             Descriptors.MolWt(Chem.MolFromSmiles(s)),
             Descriptors.NumHDonors(Chem.MolFromSmiles(s)),
             Descriptors.NumHAcceptors(Chem.MolFromSmiles(s))]
            for s in smiles_list]

X_train, y_train = featurize(split["train"]["Drug"].tolist()), split["train"]["Y"].tolist()
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

X_test = featurize(split["test"]["Drug"].tolist())
preds = model.predict(X_test)
rmse = Evaluator(name="RMSE")(split["test"]["Y"], preds)
print(f"Solubility RMSE: {rmse:.4f}")

# Toxicity prediction
tox = Tox(name="hERG", path="data/")
# HTS — high-throughput screening
hts = HTS(name="Tox21", path="data/")
```

### Drug-Target Interaction Prediction

```python
from tdc.multi_pred import DrugTarget, DTI
from tdc import Evaluator

# Binary DTI (does drug bind to target?)
dti_binary = DrugTarget(name="BindingDB_Kd", path="data/")
# Change to binary classification: bind if Kd < threshold
dti_binary.convert_to_format(format="binary", threshold=30)  # 30 nM
split = dti_binary.get_split(method="scaffold")

# Regression DTI (predict binding affinity Kd)
dti_reg = DrugTarget(name="DAVIS", path="data/")
dti_reg.convert_to_format(format="regression")
split = dti_reg.get_split(method="scaffold")

print(f"Target names: {dti_reg.target_list[:5]}")
print(f"Drug column: {dti_reg.drug_cols}")
print(f"Target column: {dti_reg.target_cols}")

# Evaluate with standard metrics
evaluator_auc = Evaluator(name="ROC-AUC")
evaluator_ap = Evaluator(name="PR-AUC")
print(f"ROC-AUC: {evaluator_auc(split['test']['Y'], preds):.4f}")
print(f"PR-AUC:  {evaluator_ap(split['test']['Y'], preds):.4f}")
```

### Molecular Generation

```python
from tdc.generation import MolGen

# Distribution learning — learn to generate valid molecules
molgen = MolGen(name="ZINC", path="data/")
train = molgen.get_train()
valid = molgen.get_valid()
test = molgen.get_test()

# Property-optimized generation — generate molecules with target properties
from tdc.generation import Reaction, RetroSyn
reaction = Reaction(name="USPTO_50k", path="data/")
retro = RetroSyn(name="USPTO Retro", path="data/")
```

## Common Academic Workflow: Full Benchmark Pipeline

```python
from tdc.single_pred import ADME, Tox
from tdc.multi_pred import DrugTarget
from tdc import Evaluator, BenchmarkGroup
import pandas as pd

# 1. Define benchmark tasks
tasks = [
    ("ADME", "Caco2_Wang"),
    ("ADME", "HIA_Hou"),
    ("ADME", "PPB_AZ"),
    ("Tox", "hERG"),
    ("Tox", "AMES"),
    ("DrugTarget", "DAVIS"),
]

# 2. Run model on each task
results = []
for task_group, task_name in tasks:
    if task_group == "DrugTarget":
        data = DrugTarget(name=task_name, path=f"data/{task_name}/")
        data.convert_to_format(format="binary", threshold=30)
        metric = "ROC-AUC"
    elif task_group == "Tox":
        data = Tox(name=task_name, path=f"data/{task_name}/")
        metric = "ROC-AUC"
    else:
        data = ADME(name=task_name, path=f"data/{task_name}/")
        metric = "RMSE"

    split = data.get_split(method="scaffold")
    preds = my_model_predict(split["train"], split["valid"], split["test"], task_group)

    evaluator = Evaluator(name=metric)
    score = evaluator(split["test"]["Y"], preds)
    results.append({"Task": f"{task_group}/{task_name}", "Metric": metric, "Score": score})
    print(f"{task_group}/{task_name}: {metric} = {score:.4f}")

# 3. Summary table
results_df = pd.DataFrame(results)
print(results_df.to_string(index=False))
results_df.to_csv("benchmark_results.csv", index=False)
```

## Best Practices

- **Use scaffold splits** (`method="scaffold"`) for more realistic evaluation — they test generalization to unseen chemical scaffolds.
- **Report multiple metrics** — ROC-AUC, PR-AUC for classification; RMSE, R-squared for regression.
- **Compare against TDC leaderboards** — TDC maintains model performance tables at https://tdcommons.ai.
- **Use canonical SMILES** — TDC provides canonicalized SMILES; avoid re-canonicalizing.
- **Pin the TDC version** for reproducibility: `pip install PyTDC==0.4.1`.

## Common Pitfalls

- **Data leakage**: Never use `method="random"` for drug discovery tasks — scaffold splits are the standard.
- **Class imbalance**: Many toxicity datasets are highly imbalanced. Use PR-AUC in addition to ROC-AUC.
- **SMILES parsing errors**: Some SMILES may fail with RDKit. Always add error handling when featurizing.
- **Target name mismatches**: DTI tasks use different protein representations (sequence, structure). Check the task format.

## Integration with HBE

- Use within `workflows/experiment-design.md` for drug discovery experiment design
- Pair with `references/tools/rdkit.md` for molecular featurization and descriptor computation
- Combine with `references/tools/scikit-learn.md` for baseline model development
- Use alongside `references/tools/pandas.md` for benchmark results aggregation and analysis

## Resources

- Documentation: https://tdcommons.ai/
- Leaderboard: https://tdcommons.ai/leaderboard/
- Paper: Huang et al., "Therapeutics Data Commons: Machine Learning Datasets and Tasks for Drug Discovery and Development" (NeurIPS, 2021)
- GitHub: https://github.com/microsoft/tdc
