---
name: aeon
description: Time series analysis toolkit — classification, regression, clustering, and anomaly detection for time series
domain: ML / Time Series
install: pip install aeon
---

# aeon — Time Series Analysis / 时间序列分析

aeon (formerly sktime extension for time series) provides state-of-the-art algorithms for time series classification, regression, clustering, forecasting, and anomaly detection with a scikit-learn-like API.

## When to Use / 适用场景

- Time series classification (activity recognition, ECG diagnosis)
- Time series clustering and anomaly detection
- Forecasting with ensembles of methods
- Comparing time series algorithms on benchmarks

## Quick Start / 快速开始

```python
from aeon.datasets import load_classification
from aeon.classification.distance_based import KNeighborsTimeSeriesClassifier

# Load dataset
X_train, y_train = load_classification("GunPoint", split="train")
X_test, y_test = load_classification("GunPoint", split="test")

# Train classifier
clf = KNeighborsTimeSeriesClassifier(distance="dtw")
clf.fit(X_train, y_train)
score = clf.score(X_test, y_test)
print(f"Accuracy: {score:.3f}")
```

## Core Capabilities / 核心能力

### 1. Time Series Classification / 时间序列分类

```python
from aeon.classification import (
    dictionary_based, distance_based, feature_based, convolution_based, deep_learning
)

# ROCKET (Random Convolutional Kernel Transform)
from aeon.classification.convolution_based import RocketClassifier
clf = RocketClassifier(num_kernels=10000)

# InceptionTime (deep learning)
from aeon.classification.deep_learning import InceptionTimeClassifier
clf = InceptionTimeClassifier(n_epochs=100)

# Catch22 (feature-based)
from aeon.classification.feature_based import Catch22Classifier
clf = Catch22Classifier()
```

### 2. Time Series Clustering / 时间序列聚类

```python
from aeon.clustering import TimeSeriesKMeans

# DTW-based clustering
clst = TimeSeriesKMeans(n_clusters=3, distance="dtw", max_iter=50)
labels = clst.fit_predict(X)
```

### 3. Anomaly Detection / 异常检测

```python
from aeon.anomaly_detection import DWT_MLEAD

detector = DWT_MLEAD()
scores = detector.fit_predict(X_single)
```

## Best Practices / 最佳实践

- Use ROCKET or InceptionTime as strong baselines for classification
- Normalize time series before distance-based methods
- Report both accuracy and computational time (some methods are expensive)

## Common Pitfalls / 常见陷阱

- **Data format**: aeon uses 3D numpy arrays (n_samples, n_channels, n_timepoints)
- **DTW complexity**: Exact DTW is O(n²); use lower bounding for large datasets

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/matplotlib.md` for time series visualization
- Use with `references/tools/scikit-learn.md` for hybrid pipelines
- Combine with `references/tools/pandas.md` for time series data handling

## Resources / 资源

- Documentation: https://www.aeon-toolkit.org/
- Paper: aeon: A Python Toolkit for Learning from Time Series, JMLR 2024
