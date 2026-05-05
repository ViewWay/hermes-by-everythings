---
name: scikit-learn
description: Machine learning library for classification, regression, clustering, dimensionality reduction, preprocessing, and model evaluation. Use for classical ML tasks across all disciplines.
domain: cross-domain
install: pip install scikit-learn
---

# Scikit-learn: Machine Learning

## Overview

Scikit-learn is the standard Python library for classical machine learning — classification, regression, clustering, dimensionality reduction, preprocessing, and model evaluation. Used across all disciplines for predictive modeling and data analysis.

## When to Use

- Classification (spam detection, diagnosis, image recognition)
- Regression (prediction, forecasting, dose-response)
- Clustering (segmentation, anomaly detection)
- Dimensionality reduction (PCA, t-SNE, UMAP)
- Feature engineering and preprocessing
- Model evaluation with cross-validation
- Hyperparameter tuning

## Quick Start

```python
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from sklearn.pipeline import Pipeline

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# Build pipeline
pipe = Pipeline([('scaler', StandardScaler()), ('clf', RandomForestClassifier(n_estimators=100, random_state=42))])

# Train and evaluate
pipe.fit(X_train, y_train)
y_pred = pipe.predict(X_test)
print(classification_report(y_test, y_pred))

# Cross-validation
scores = cross_val_score(pipe, X, y, cv=5, scoring='f1_macro')
print(f'F1: {scores.mean():.3f} ± {scores.std():.3f}')
```

## Core Capabilities

### 1. Supervised Learning

```python
from sklearn.linear_model import LogisticRegression, Ridge, Lasso
from sklearn.ensemble import (RandomForestClassifier, RandomForestRegressor,
                               GradientBoostingClassifier, GradientBoostingRegressor,
                               AdaBoostClassifier, VotingClassifier, StackingClassifier)
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier
from sklearn.neural_network import MLPClassifier

# Algorithm selection guide:
# Small data (<10K) → SVM, Random Forest
# Large data → Gradient Boosting, SGD
# Interpretable → Logistic Regression, Decision Tree
# Best performance → Ensemble (XGBoost/LightGBM external, or GradientBoosting)
```

### 2. Unsupervised Learning

```python
from sklearn.cluster import KMeans, DBSCAN, AgglomerativeClustering
from sklearn.decomposition import PCA, TruncatedSVD, NMF
from sklearn.manifold import TSNE

# Clustering
kmeans = KMeans(n_clusters=3, random_state=42)
labels = kmeans.fit_predict(X_scaled)
dbscan = DBSCAN(eps=0.5, min_samples=5)

# Dimensionality reduction
pca = PCA(n_components=0.95)  # Keep 95% variance
X_pca = pca.fit_transform(X_scaled)
print(f'Components: {pca.n_components_}, Explained variance: {pca.explained_variance_ratio_.sum():.3f}')

# t-SNE for visualization
tsne = TSNE(n_components=2, random_state=42, perplexity=30)
X_tsne = tsne.fit_transform(X_scaled)
```

### 3. Preprocessing Pipeline

```python
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.feature_selection import SelectKBest, RFE

numeric_features = ['age', 'income', 'score']
categorical_features = ['gender', 'category']

preprocessor = ColumnTransformer([
    ('num', Pipeline([('imputer', SimpleImputer(strategy='median')),
                      ('scaler', StandardScaler())]), numeric_features),
    ('cat', Pipeline([('imputer', SimpleImputer(strategy='most_frequent')),
                      ('encoder', OneHotEncoder(handle_unknown='ignore', sparse_output=False))]), categorical_features)
])

# Full pipeline
model = Pipeline([('prep', preprocessor), ('clf', GradientBoostingClassifier(random_state=42))])
model.fit(X_train, y_train)
```

### 4. Model Evaluation

```python
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, StratifiedKFold
from sklearn.metrics import (accuracy_score, f1_score, precision_score, recall_score,
                              roc_auc_score, confusion_matrix, classification_report,
                              mean_squared_error, r2_score, silhouette_score)

# Cross-validated grid search
param_grid = {'clf__n_estimators': [100, 200], 'clf__max_depth': [3, 5, 10], 'clf__learning_rate': [0.01, 0.1]}
grid = GridSearchCV(model, param_grid, cv=StratifiedKFold(5), scoring='f1_macro', n_jobs=-1)
grid.fit(X_train, y_train)
print(f'Best: {grid.best_score_:.3f} with {grid.best_params_}')

# Metrics
print(classification_report(y_test, y_pred))
cm = confusion_matrix(y_test, y_pred)

# Regression metrics
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

# Clustering quality
sil_score = silhouette_score(X_scaled, labels)
```

## Common Academic Workflows

### Model Comparison Table

```python
def compare_models(X, y, models, cv=5):
    """Compare multiple models with cross-validation."""
    results = []
    for name, model in models.items():
        scores = cross_val_score(model, X, y, cv=cv, scoring='f1_macro', n_jobs=-1)
        results.append({'Model': name, 'Mean F1': scores.mean(), 'Std': scores.std()})
    return pd.DataFrame(results).sort_values('Mean F1', ascending=False)
```

### Publication-Ready Results

```python
from sklearn.metrics import precision_recall_fscore_support

def results_table(y_true, y_pred, class_names=None):
    """Publication-ready per-class results."""
    precision, recall, f1, support = precision_recall_fscore_support(y_true, y_pred)
    df = pd.DataFrame({'Precision': precision, 'Recall': recall, 'F1': f1, 'N': support},
                      index=class_names or range(len(precision)))
    df.loc['Macro Avg'] = [precision.mean(), recall.mean(), f1.mean(), support.sum()]
    return df.round(3)
```

## Best Practices

1. **Always use Pipeline**: Prevents data leakage during cross-validation
2. **Stratified splits for classification**: `train_test_split(stratify=y)`
3. **Set random_state**: For reproducibility
4. **Scale features for SVM/KNN/Neural Nets**: Tree-based models don't need scaling
5. **Use cross-validation**: Never evaluate on training data
6. **n_jobs=-1**: Use all CPU cores for parallel operations

## Common Pitfalls

1. **Data leakage**: Fitting scaler on full dataset before splitting → always fit on train only
2. **Information leakage**: Using test data for feature selection → include in Pipeline
3. **Class imbalance**: Use `class_weight='balanced'` or SMOTE for imbalanced datasets
4. **Overfitting with GridSearch**: Nested CV for unbiased evaluation
5. **Scaling before tree models**: Unnecessary — wastes computation

## Integration with HBE

- Primary ML tool in `references/tool-registry.md`
- Supports `workflows/experiment-design.md` model training
- Works with `references/statistical-analysis-guide.md` for model evaluation
- See `references/tools/shap.md` for model interpretability

## Resources

- Documentation: https://scikit-learn.org/stable/
- User Guide: https://scikit-learn.org/stable/user_guide.html
- Pedregosa et al. (2011) "Scikit-learn: Machine Learning in Python" — JMLR paper
