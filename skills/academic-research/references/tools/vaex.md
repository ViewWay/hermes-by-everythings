---
name: vaex
description: High-performance DataFrame library — process billions of rows with zero-copy memory-mapped files and lazy evaluation
domain: ML / Infrastructure
install: pip install vaex
---

# vaex — High-Performance DataFrame Library / 高性能数据框库

Out-of-core DataFrame library that processes billions of rows using memory-mapped files, virtual columns, and lazy evaluation without loading data into RAM.

## When to Use / 适用场景

- Exploratory data analysis on datasets larger than available RAM (在超过可用内存的数据集上进行探索性数据分析)
- Processing 100M+ row tabular datasets without Spark or Dask overhead (无需 Spark 或 Dask 开销即可处理 1 亿+ 行表格数据)
- Computing aggregations, group-by statistics, and filters on out-of-core data (对核外数据计算聚合、分组统计和过滤)
- Creating interactive Jupyter notebooks for big data exploration (为大数据探索创建交互式 Jupyter 笔记本)
- Preparing large datasets for machine learning without memory bottlenecks (为机器学习准备大数据集而不受内存瓶颈限制)

## Quick Start / 快速开始

```python
import vaex

# Open a large file — instant, memory-mapped (no data loaded into RAM)
df = vaex.open("large_dataset.hdf5")
print(f"Rows: {len(df):,}, Columns: {df.column_names}")

# Virtual columns — computed on-the-fly, zero memory cost
df["bmi"] = df["weight_kg"] / (df["height_m"] ** 2)
df["age_group"] = (df["age"] // 10) * 10  # decade bins

# Filter — creates a selection, no data copied
df_filtered = df[df["age"] > 30]
df_filtered = df_filtered[df_filtered["income"] > 50000]

# Aggregation — computed in a single pass over the data
stats = df_filtered.agg(
    {"income": ["mean", "std", "min", "max"], "age": ["mean", "count"]}
)
print(stats)

# Export to efficient format
df_filtered.export("filtered_output.parquet")
```

## Core Capabilities / 核心能力

### 1. Memory-Mapped and Zero-Copy Operations / 内存映射与零拷贝操作

vaex uses memory-mapped files so the OS manages data loading in pages. Operations on columns are computed without copying data into Python objects.

```python
import vaex
import numpy as np

# Open HDF5 or Arrow/Parquet files — header only, no data in RAM
df = vaex.open("measurements.hdf5")  # e.g., 500M rows x 20 columns

# Column access returns a numpy array view, not a copy
col = df["temperature"].to_numpy()  # memory-mapped numpy array
print(f"Shape: {col.shape}, dtype: {col.dtype}")

# Virtual columns: expressions evaluated lazily, no storage cost
df["temp_celsius"] = (df["temperature_f"] - 32) * 5.0 / 9.0
df["log_income"] = vaex.math.log(df["income"] + 1)

# String operations (on large text columns)
df["name_upper"] = df["name"].str.upper()
df["email_domain"] = df["email"].str.split("@").str.get(1)

# Binary operations on full columns
df["flag"] = (df["age"] > 65) & (df["blood_pressure"] > 140)
print(f"High-risk patients: {df['flag'].sum()}")
```

### 2. Aggregation, Group-By, and Joins / 聚合、分组与连接

vaex computes aggregations in a single pass through the data, making group-by operations on billion-row datasets feasible on a laptop.

```python
import vaex

df = vaex.open("transactions.hdf5")

# Group-by with multiple aggregations
result = df.groupby(
    by=["merchant_category", "year"],
    agg={
        "amount": ["sum", "mean", "count", "std"],
        "customer_id": "nunique"
    }
)
print(result)

# Multi-level aggregations with binning
df["hour"] = df["timestamp"].dt.hour
hourly = df.groupby("hour", agg={"amount": ["sum", "count"]})

# Joins — left join on a key column
customers = vaex.open("customers.hdf5")
joined = df.join(customers, on="customer_id", how="left")

# Aggregations with selections (pre-defined filters)
df.select("high_value", df["amount"] > 10000)
df.select("low_value", df["amount"] < 100)
print(f"High-value count: {df.count(selection='high_value')}")
print(f"Low-value mean: {df.mean('amount', selection='low_value')}")
```

### 3. Out-of-Core Filtering and Export / 核外过滤与导出

vaex supports efficient filtering of massive datasets and export to multiple formats for downstream processing.

```python
import vaex

df = vaex.open("sensor_data.hdf5")

# Filter — lazy, creates a boolean mask selection
df = df[df["sensor_id"].isin([1, 5, 12])]
df = df[df["reading"] > 0]

# Drop columns to reduce memory footprint on export
df = df.drop(["raw_signal", "metadata"])

# Export to different formats
df.export_parquet("filtered.parquet")     # columnar, efficient
df.export_hdf5("filtered.hdf5")           # vaex native format
df.export_csv("sample.csv")               # for small subsets only

# Export a random sample for testing
df_sample = df.sample(n=100000, random_state=42)
df_sample.export("sample_100k.parquet")

# Export to Arrow format for PyArrow/Polars/DuckDB interop
df.export_arrow("filtered.arrow")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Analyzing 100M+ Row Dataset Without Loading into Memory / 无需加载入内存分析亿行数据集

```python
import vaex
import time

# Step 1: Open dataset (instant, memory-mapped)
start = time.time()
df = vaex.open("census_500m.hdf5")
print(f"Opened {len(df):,} rows in {time.time()-start:.2f}s")

# Step 2: Profile the data — compute summary statistics
print(df.describe())  # all columns, computed in one pass

# Step 3: Create derived columns (virtual, no memory cost)
df["income_per_capita"] = df["household_income"] / (df["household_size"] + 1)
df["is_employed"] = df["employment_status"] == "employed"
df["age_sq"] = df["age"] ** 2

# Step 4: Filter to study population
study_df = df[
    (df["age"] >= 25) &
    (df["age"] <= 65) &
    (df["is_employed"]) &
    (df["income_per_capita"] > 0)
]
print(f"Study population: {len(study_df):,}")

# Step 5: Compute statistics by demographic group
grouped = study_df.groupby(
    ["state", "education_level"],
    agg={
        "income_per_capita": ["mean", "median", "std", "count"],
        "age": "mean"
    }
)
top_states = grouped.sort("income_per_capita_mean", ascending=False)[:10]
print(top_states)

# Step 6: Export filtered dataset for statistical modeling in R/StatsModels
study_df.export("study_population.parquet")
```

## Best Practices / 最佳实践

- **Convert CSV to HDF5 or Arrow before analysis**: vaex's performance comes from columnar, memory-mapped formats. Loading a 50GB CSV into HDF5 once with `vaex.from_csv("big.csv", convert=True)` unlocks all vaex optimizations.
- **Use virtual columns for feature engineering**: Virtual columns are computed on-the-fly and consume no memory. Use them liberally during exploration, then materialize only when exporting.
- **Report file format and memory usage in methods**: State that analysis was performed using vaex with HDF5/Arrow backend on a machine with X GB RAM, processing Y billion rows without loading into memory.
- **Prefer Parquet for interoperability**: If downstream tools (PyArrow, DuckDB, Polars) need to read the data, export to Parquet. HDF5 is vaex-native but less widely supported.

## Common Pitfalls / 常见陷阱

- **Random access on HDF5 is slow**: vaex excels at column-wise scans and aggregations but is slow for row-by-row random access (e.g., `df.iloc[i]`). If you need row-level access, export a subset to pandas.
- **String operations have limited function coverage**: vaex supports basic string methods (upper, split, contains) but lacks pandas' full string API. For complex text processing, export to pandas or use virtual columns with numpy vectorized functions.
- **Sorting creates a copy**: `df.sort()` materializes the sorted data, consuming memory proportional to the dataset size. For large datasets, sort during export or use `df.export_sorted()`.
- **Groupby on high-cardinality columns is expensive**: Grouping by a column with millions of unique values creates a proportional number of groups. Pre-filter or bin high-cardinality columns before grouping.
- **Jupyter display triggers computation**: Calling `df` or `df.head()` in Jupyter computes the result. On billion-row datasets, use `df.head(5)` (which limits rows) rather than letting the notebook auto-display the full DataFrame.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for big data study design without cluster infrastructure
- Pair with `references/tools/pandas.md` for small-subset analysis after vaex filtering
- Combine with `references/tools/matplotlib.md` for visualization of aggregated results

## Resources / 资源

- Documentation: https://vaex.readthedocs.io/
- GitHub: https://github.com/vaexio/vaex
- Getting started: https://vaex.readthedocs.io/en/latest/tutorial.html
