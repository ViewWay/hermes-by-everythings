---
name: exploratory-data-analysis
description: Automated EDA — profile, visualize, and summarize datasets for initial data exploration
domain: Data Science
install: pip install ydata-profiling sweetviz
---

# Exploratory Data Analysis (EDA)

## Overview

Automated EDA tools generate comprehensive statistical profiles of datasets with minimal code. They produce HTML reports covering distributions, correlations, missing values, outliers, and data types — accelerating the initial understanding phase of any data-driven research project.

## When to Use

- Starting a new research project with unfamiliar data
- Generating quick data quality reports for collaborators
- Screening datasets for missing values, outliers, or class imbalance before modeling
- Producing supplementary material appendices showing data characteristics
- Comparing train/test splits for distribution drift

## Quick Start

```python
# ydata-profiling (formerly pandas-profiling)
from ydata_profiling import ProfileReport
import pandas as pd

df = pd.read_csv("experimental_results.csv")
profile = ProfileReport(df, title="Experiment Data Profile", explorative=True)
profile.to_file("eda_report.html")

# sweetviz — comparison-focused EDA
import sweetviz as sv

report = sv.compare([df_train, "Training"], [df_test, "Test"])
report.show_html("sweetviz_report.html")
```

## Core Capabilities

### 1. ydata-profiling: Comprehensive Reports

Generates a full HTML report with statistics, visualizations, and warnings.

```python
from ydata_profiling import ProfileReport

# Minimal report (fast, for large datasets)
profile = ProfileReport(df, minimal=True)
profile.to_file("minimal_report.html")

# Full exploratory report
profile = ProfileReport(
    df,
    title="Dataset Overview",
    explorative=True,
    correlations={"pearson": {"calculate": True},
                  "spearman": {"calculate": True},
                  "kendall": {"calculate": False}},
    missing_diagrams={"bar": True, "matrix": True, "heatmap": True},
)
profile.to_file("full_report.html")

# Profile specific variables only
profile = ProfileReport(df, vars={"num": {"low_categorical_threshold": 0}},
                        correlations={"auto": {"calculate": True}})
```

### 2. Correlation and Distribution Analysis

```python
from ydata_profiling import ProfileReport

# Focus on correlations between features
profile = ProfileReport(
    df,
    correlations={
        "pearson": {"calculate": True},
        "spearman": {"calculate": True},
        "phi_k": {"calculate": True},
        "cramers": {"calculate": True},
    },
)
profile.to_file("correlation_report.html")

# Custom scatter matrix for key variables
import pandas as pd
from pandas.plotting import scatter_matrix

key_cols = ["temperature", "pressure", "yield", "purity"]
scatter_matrix(df[key_cols], figsize=(10, 8), diagonal="kde")
```

### 3. Missing Value Detection and Handling

```python
# Using ydata-profiling missing value analysis
profile = ProfileReport(
    df,
    missing_diagrams={
        "bar": True,        # Per-column missing count
        "matrix": True,     # Missingness heatmap
        "heatmap": True,    # Correlation of missingness
        "dendrogram": True, # Hierarchical clustering of missingness
    },
)

# Programmatic missing value summary with pandas
missing_summary = pd.DataFrame({
    "missing_count": df.isnull().sum(),
    "missing_pct": (df.isnull().sum() / len(df) * 100).round(1),
    "dtype": df.dtypes,
})
missing_summary = missing_summary[missing_summary["missing_count"] > 0]
missing_summary.sort_values("missing_pct", ascending=False)
```

## Common Academic Workflow

### Full EDA Pipeline for a Research Dataset

```python
import pandas as pd
from ydata_profiling import ProfileReport

# Step 1: Load and inspect
df = pd.read_csv("data/experiment.csv")
print(f"Shape: {df.shape}, Columns: {list(df.columns)}")

# Step 2: Generate comprehensive report
profile = ProfileReport(
    df,
    title="Experiment EDA",
    explorative=True,
    correlations={"pearson": {"calculate": True}, "spearman": {"calculate": True}},
    missing_diagrams={"bar": True, "matrix": True},
)
profile.to_file("reports/eda_full.html")

# Step 3: Summary statistics table for paper appendix
stats = df.describe().T.round(3)
stats["missing"] = df.isnull().sum()
stats.to_latex("tables/data_summary.tex", float_format="%.3f")

# Step 4: Identify outliers using IQR method
Q1 = df.select_dtypes(include="number").quantile(0.25)
Q3 = df.select_dtypes(include="number").quantile(0.75)
IQR = Q3 - Q1
outliers = ((df.select_dtypes(include="number") < (Q1 - 1.5 * IQR)) |
            (df.select_dtypes(include="number") > (Q3 + 1.5 * IQR)))
print(f"Outlier counts per column:\n{outliers.sum()}")
```

## Best Practices

1. **Start with `minimal=True`** for datasets over 100K rows to avoid long computation times.
2. **Save HTML reports in version control**: They serve as reproducible data documentation.
3. **Compare train/test distributions**: Use `sweetviz.compare()` to detect data leakage or drift.
4. **Document findings**: Translate EDA observations into a "Data Description" section for your paper.
5. **Iterate**: After cleaning, re-run EDA to verify improvements.

## Common Pitfalls

1. **Reports are not papers**: EDA reports are internal tools — do not submit raw HTML to journals.
2. **Ignoring high missingness**: Columns with >50% missing values need explicit justification for imputation or removal.
3. **Correlation is not causation**: EDA identifies patterns, not causal relationships.
4. **Large datasets time out**: Set `minimal=True` or sample rows for datasets exceeding 1M rows.

## Integration with HBE

- Use with `references/tools/pandas.md` for data loading and preprocessing
- Pair with `references/tools/matplotlib.md` for custom follow-up visualizations
- Supports `workflows/experiment-design.md` Phase 1 (Data Exploration)
- Combine with `references/tools/seaborn.md` for publication-quality statistical plots

## Resources

- ydata-profiling documentation: https://docs.profiling.ydata.ai/
- sweetviz documentation: https://github.com/fbdesignpro/sweetviz
- pandas-profiling archive: https://github.com/pandas-profiling/pandas-profiling
