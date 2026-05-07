---
name: pyhealth
description: Healthcare AI toolkit — clinical prediction, drug recommendation, and EHR modeling from MIMIC and eICU datasets
domain: medicine / health-ai
install: pip install pyhealth
---

# pyhealth

An open-source toolkit for building healthcare AI models on electronic health record (EHR) data. Provides standardized dataset loaders (MIMIC-III, MIMIC-IV, eICU, OMOP), task definitions (mortality prediction, drug recommendation, length-of-stay), and deep learning model implementations (Transformer, CNN, RNN, RETAIN).

## When to Use

- Building clinical prediction models from EHR data (mortality, readmission, diagnosis)
- Drug recommendation systems based on patient history
- Benchmarking deep learning models on standardized healthcare tasks
- Converting raw MIMIC-III/IV or eICU tables into ML-ready formats
- Comparing healthcare model architectures (Transformer vs CNN vs RETAIN)

## Quick Start

```python
from pyhealth.datasets import MIMIC3Dataset
from pyhealth.tasks import mortality_prediction_mimic3
from pyhealth.models import Transformer
from pyhealth.trainer import Trainer

# 1. Load MIMIC-III dataset (requires PhysioNet credentials)
dataset = MIMIC3Dataset(
    root="/data/mimic3",
    tables=["DIAGNOSES_ICD", "PROCEDURES_ICD", "PRESCRIPTIONS"],
    dev=False
)

# 2. Define the mortality prediction task
samples = dataset.set_task(mortality_prediction_mimic3)
print(f"Task samples: {len(samples)}")

# 3. Build and train a Transformer model
train_dataset, val_dataset, test_dataset = samples.split()

model = Transformer(
    dataset=dataset,
    feature_keys=["conditions", "procedures", "drugs"],
    label_key="label",
    mode="binary"
)

trainer = Trainer(model=model, device="cuda")
trainer.train(train_dataset, val_dataset, epochs=20)
results = trainer.evaluate(test_dataset)
print(f"Test AUROC: {results['auc']:.4f}")
```

## Core Capabilities

### 1. Multi-Source Dataset Loading

```python
from pyhealth.datasets import MIMIC3Dataset, MIMIC4Dataset, eICUDataset, OMOPDataset

# MIMIC-III — ICU clinical database
mimic3 = MIMIC3Dataset(
    root="/data/mimic3",
    tables=["DIAGNOSES_ICD", "PROCEDURES_ICD", "PRESCRIPTIONS", "LABEVENTS"],
    code_mapping={"NDC": ("ATC", {"target": "source"})},
    dev=True  # Use dev subset for rapid prototyping
)

# eICU — multi-center ICU data
eicu = eICUDataset(root="/data/eicu", tables=["diagnosis", "medication", "lab"])

# OMOP — standardized common data model
omop = OMOPDataset(root="/data/omop", tables=["condition_occurrence", "drug_exposure"])

# Inspect patient visit structure
patient = mimic3.patients["10006"]
for visit in patient.visits.values():
    print(f"Visit: {visit.visit_id}, Conditions: {len(visit.conditions)}")
```

### 2. Built-in Clinical Tasks

```python
from pyhealth.tasks import (
    mortality_prediction_mimic3,
    drug_recommendation_mimic3,
    length_of_stay_prediction_mimic3,
    readmission_prediction_mimic3
)

# Mortality prediction — binary: does patient die within 30 days?
mortality_samples = dataset.set_task(mortality_prediction_mimic3)

# Drug recommendation — multi-label: which drugs to prescribe?
drug_samples = dataset.set_task(drug_recommendation_mimic3)

# Length of stay — multi-class: discharge within 3/7/14 days?
los_samples = dataset.set_task(length_of_stay_prediction_mimic3)

# Each sample is a dict with feature_keys and label
sample = mortality_samples[0]
print(sample["conditions"])  # List of ICD codes
print(sample["label"])       # 0 or 1
```

### 3. Model Architectures

```python
from pyhealth.models import Transformer, CNN, RNN, RETAIN, SafeDrug, GAMENet

# Transformer for clinical event sequences
model = Transformer(
    dataset=dataset,
    feature_keys=["conditions", "procedures", "drugs"],
    label_key="label",
    mode="binary",
    embedding_dim=128,
    num_layers=2,
    heads=4
)

# RETAIN — Reverse Time Attention Model (interpretable)
retain_model = RETAIN(dataset=dataset, feature_keys=["conditions"], label_key="label")

# GAMENet — graph-attention for drug-drug interactions
gamenet = GAMENet(dataset=dataset, feature_keys=["conditions", "procedures"], label_key="drugs")
```

## Common Academic Workflow: End-to-End Mortality Prediction on MIMIC-III

```python
from pyhealth.datasets import MIMIC3Dataset
from pyhealth.tasks import mortality_prediction_mimic3
from pyhealth.models import Transformer, CNN, RNN
from pyhealth.trainer import Trainer

# 1. Load data with code mapping to standardized vocabularies
dataset = MIMIC3Dataset(
    root="/data/mimic3",
    tables=["DIAGNOSES_ICD", "PROCEDURES_ICD", "PRESCRIPTIONS"],
    code_mapping={"NDC": ("ATC", {"target": "source"})},
    dev=True
)
samples = dataset.set_task(mortality_prediction_mimic3)
train_ds, val_ds, test_ds = samples.split([0.7, 0.1, 0.2])

# 2. Benchmark multiple model architectures
results = {}
for ModelClass in [Transformer, CNN, RNN]:
    model = ModelClass(
        dataset=dataset,
        feature_keys=["conditions", "procedures", "drugs"],
        label_key="label", mode="binary"
    )
    trainer = Trainer(model=model, device="cuda", metrics=["auc", "f1"])
    trainer.train(train_ds, val_ds, epochs=30)
    results[ModelClass.__name__] = trainer.evaluate(test_ds)

# 3. Report best model
best = max(results.items(), key=lambda x: x[1]["auc"])
print(f"Best model: {best[0]} — AUROC: {best[1]['auc']:.4f}")
```

## Best Practices

1. **Use code mapping** — Map raw NDC/ICD-9 codes to ATC/ICD-10 for cross-dataset generalization
2. **Start with dev mode** — Set `dev=True` during development to use a small subset for fast iteration
3. **Report fair metrics** — Use AUROC, AUPRC, and F1; AUPRC is more informative than AUROC for imbalanced clinical data
4. **Respect data access agreements** — MIMIC and eICU require credentialed access; never share raw data

## Common Pitfalls

- **Missing PhysioNet credentials**: MIMIC datasets require a training certificate from https://physionet.org. Plan for 1-2 week approval.
- **Data leakage**: Ensure temporal splitting (train on earlier discharges, test on later) rather than random splitting.
- **Class imbalance**: Mortality is rare (5-10%); use weighted loss or oversampling rather than relying on accuracy alone.
- **Ignoring code vocabulary gaps**: Not all codes map across vocabularies; unmapped codes become unknown tokens that degrade performance.

## Integration with HBE

- Use with `/hbe-plan` for designing clinical AI study protocols
- Pair with `references/tools/pandas.md` for custom EHR data preprocessing
- Combine with `references/tools/scikit-learn.md` for baseline model comparison
- See `references/tools/statsmodels.md` for statistical hypothesis testing on clinical outcomes

## Resources

- Documentation: https://pyhealth.readthedocs.io/
- GitHub: https://github.com/sunlabuiuc/PyHealth
- Paper: Zhang, Y. et al. (2022). PyHealth: A Deep Learning Toolkit for Healthcare. arXiv:2201.04180
- MIMIC-III: https://physionet.org/content/mimiciii/
- MIMIC-IV: https://physionet.org/content/mimiciv/
