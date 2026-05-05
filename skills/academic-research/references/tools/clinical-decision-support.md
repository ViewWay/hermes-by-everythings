---
name: clinical-decision-support
description: Clinical decision support — ML-based diagnostic assistance and treatment recommendation with explainability
domain: Medicine / AI
install: pip install scikit-learn xgboost shap imbalanced-learn
---

# clinical-decision-support — Clinical AI Decision Support

Provides patterns for building clinical decision support systems (CDSS) using machine learning. Covers model development for diagnostic prediction, treatment recommendation, and risk stratification with emphasis on interpretability, fairness, and clinical validation workflows required for healthcare AI research.

## When to Use

- Building predictive models for disease diagnosis from clinical features (labs, vitals, demographics)
- Developing risk stratification models (sepsis prediction, readmission risk, mortality)
- Creating treatment recommendation engines from electronic health record (EHR) data
- Implementing explainability (SHAP, LIME) for clinical model interpretability
- Validating clinical AI models with proper temporal splitting and calibration

## Quick Start

```python
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, classification_report

# Load clinical dataset (demographics + labs + outcomes)
df = pd.read_csv("mimic_icu_cohort.csv")

# Define features and outcome
features = ["age", "heart_rate", "systolic_bp", "wbc", "creatinine",
            "lactate", "temperature", "gcs_score"]
X = df[features].fillna(df[features].median())
y = df["sepsis_6h"]

# Temporal train/test split (train on earlier admissions, test on later)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, shuffle=False  # temporal split
)

model = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)
model.fit(X_train, y_train)

y_prob = model.predict_proba(X_test)[:, 1]
print(f"AUROC: {roc_auc_score(y_test, y_prob):.3f}")
print(classification_report(y_test, model.predict(X_test)))
```

## Core Capabilities

### 1. Handling Class Imbalance in Clinical Data

```python
from sklearn.ensemble import GradientBoostingClassifier
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.model_selection import cross_val_score

# Clinical events are often rare (e.g., sepsis ~8% incidence)
print(f"Sepsis prevalence: {y_train.mean():.1%}")

# Approach 1: SMOTE + classifier in pipeline
pipe = ImbPipeline([
    ("smote", SMOTE(sampling_strategy=0.3, random_state=42)),
    ("clf", GradientBoostingClassifier(
        n_estimators=100, max_depth=4,
        learning_rate=0.05, subsample=0.8,
        min_samples_leaf=50,  # prevent overfitting on rare events
    ))
])

# Cross-validation with stratified folds
from sklearn.model_selection import StratifiedKFold
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipe, X_train, y_train, cv=cv, scoring="roc_auc")
print(f"CV AUROC: {scores.mean():.3f} +/- {scores.std():.3f}")

# Approach 2: Class weight adjustment (no resampling)
model = GradientBoostingClassifier(n_estimators=100, random_state=42)
sample_weights = len(y_train) / (2 * np.bincount(y_train))
model.fit(X_train, y_train, sample_weight=sample_weights[y_train])
```

### 2. Model Explainability with SHAP

```python
import shap

# Train final model
model = GradientBoostingClassifier(n_estimators=100, max_depth=4, random_state=42)
model.fit(X_train, y_train)

# Compute SHAP values
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# Global feature importance
shap.summary_plot(shap_values, X_test, feature_names=features,
                  plot_type="bar", show=False)
import matplotlib.pyplot as plt
plt.savefig("shap_feature_importance.png", dpi=300, bbox_inches="tight")

# Individual patient explanation
patient_idx = 0
print(f"\nPatient {patient_idx} explanation:")
print(f"  Predicted sepsis risk: {model.predict_proba(X_test.iloc[[patient_idx]])[0, 1]:.1%}")
for feat, val, sv in sorted(zip(features, X_test.iloc[patient_idx], shap_values[patient_idx]),
                              key=lambda x: abs(x[2]), reverse=True)[:5]:
    direction = "increases" if sv > 0 else "decreases"
    print(f"  {feat}={val:.1f}: {direction} risk (SHAP={sv:.3f})")
```

### 3. Calibration and Clinical Threshold Selection

```python
from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.metrics import brier_score_loss

# Calibrate model probabilities (critical for clinical use)
calibrated = CalibratedClassifierCV(model, method="isotonic", cv="prefit")
calibrated.fit(X_train, y_train)

# Compare calibration
prob_uncal = model.predict_proba(X_test)[:, 1]
prob_cal = calibrated.predict_proba(X_test)[:, 1]

brier_uncal = brier_score_loss(y_test, prob_uncal)
brier_cal = brier_score_loss(y_test, prob_cal)
print(f"Brier score (uncalibrated): {brier_uncal:.4f}")
print(f"Brier score (calibrated):   {brier_cal:.4f}")

# Select operating threshold based on clinical requirements
# e.g., 90% sensitivity for sepsis screening
from sklearn.metrics import precision_recall_curve
precisions, recalls, thresholds = precision_recall_curve(y_test, prob_cal)
target_sensitivity = 0.90
idx = np.argmin(np.abs(recalls[:-1] - target_sensitivity))
clinical_threshold = thresholds[idx]
print(f"\nClinical threshold for 90% sensitivity: {clinical_threshold:.3f}")
print(f"  Precision at this threshold: {precisions[idx]:.3f}")
print(f"  Specificity: {1 - (1 - recalls[idx]):.3f}")
```

## Common Academic Workflow: End-to-End Clinical Model Development

```python
import pandas as pd
import numpy as np
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import roc_auc_score, brier_score_loss
import shap
import json

# 1. Load data with temporal ordering
df = pd.read_csv("cohort.csv")
df = df.sort_values("admission_date")

# 2. Temporal split (2020-2022 train, 2023 test)
train = df[df["admission_date"] < "2023-01-01"]
test = df[df["admission_date"] >= "2023-01-01"]

features = [c for c in train.columns if c not in ["patient_id", "outcome", "admission_date"]]
X_train, y_train = train[features], train["outcome"]
X_test, y_test = test[features], test["outcome"]

# 3. Train with proper preprocessing
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

pipe = Pipeline([
    ("impute", SimpleImputer(strategy="median")),
    ("scale", StandardScaler()),
    ("model", GradientBoostingClassifier(n_estimators=200, max_depth=5, random_state=42)),
])
pipe.fit(X_train, y_train)

# 4. Evaluate on held-out temporal test set
y_prob = pipe.named_steps["model"].predict_proba(
    pipe.named_steps["scale"].transform(
        pipe.named_steps["impute"].transform(X_test)
    )
)[:, 1]

results = {
    "auroc": roc_auc_score(y_test, y_prob),
    "brier": brier_score_loss(y_test, y_prob),
    "n_train": len(X_train),
    "n_test": len(X_test),
    "prevalence_train": y_train.mean(),
    "prevalence_test": y_test.mean(),
}
print(json.dumps(results, indent=2))
```

## Best Practices

1. Always use temporal (not random) train/test splits to prevent data leakage from future visits
2. Report calibration metrics (Brier score, calibration curves) alongside discrimination (AUROC)
3. Use SHAP or LIME for individual-level explanations required for clinical acceptance
4. Handle missing data explicitly (imputation, missing indicators) rather than row-wise deletion
5. Report performance stratified by demographic subgroups to assess fairness

## Common Pitfalls

1. **Data leakage**: Using future lab values or outcomes in training features inflates performance; ensure strict temporal ordering
2. **Class imbalance without correction**: Rare event models trained on imbalanced data have poor sensitivity; always address imbalance
3. **Uninformative AUROC on imbalanced data**: AUROC can be misleadingly high with 95% negative class; use AUPRC as complementary metric
4. **Ignoring transportability**: Models trained at one hospital may not generalize; evaluate on external validation cohorts

## Integration with HBE

- Use with `references/tools/scikit-learn.md` for ML model development
- Pair with `references/tools/shap.md` for model interpretability
- Combine with `references/tools/pandas.md` for EHR data preprocessing
- Supports `references/tool-registry.md` clinical AI tool chain

## Resources

- SHAP Documentation: https://shap.readthedocs.io/
- TRIPOD Guidelines: https://www.tripodstatement.org/
- MIMIC-IV Dataset: https://physionet.org/content/mimiciv/
- Fairlearn: https://fairlearn.org/ (algorithmic fairness)
