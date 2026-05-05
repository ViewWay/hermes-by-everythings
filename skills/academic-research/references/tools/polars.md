---
name: polars
description: Fast DataFrame library for large datasets. Use when pandas is too slow or data exceeds memory. 10-100x faster than pandas for common operations.
domain: cross-domain
install: pip install polars
---

# Polars: High-Performance DataFrames

## Overview

Polars is a fast DataFrame library written in Rust with Python bindings. It outperforms pandas 10-100x on common operations and handles datasets larger than RAM via lazy evaluation and streaming.

## When to Use

- Large datasets (>1M rows) where pandas is slow
- Out-of-memory datasets (streaming mode)
- ETL pipelines requiring high performance
- Any pandas operation where speed matters

## Quick Start

```python
import polars as pl

# Load data
df = pl.read_csv('data.csv')
df = pl.scan_csv('large_data.csv')  # Lazy (doesn't load yet)

# Basic operations (similar to pandas but different API)
df.shape, df.columns, df.dtypes
df.head(5)
df.describe()

# Select and filter (expression-based API)
df.select(pl.col('age'), pl.col('income'))
df.filter(pl.col('age') > 30)
df.filter((pl.col('age') > 30) & (pl.col('gender') == 'F'))

# Groupby + agg
df.group_by('category').agg([
    pl.col('value').mean().alias('mean_value'),
    pl.col('value').std().alias('std_value'),
    pl.col('id').count().alias('count'),
])
```

## Core Capabilities

### 1. Lazy Evaluation

```python
# Define pipeline (not executed yet)
result = (
    pl.scan_csv('large_data.csv')           # Lazy scan
    .filter(pl.col('year') >= 2020)          # Filter
    .group_by('category')                     # Group
    .agg(pl.col('value').mean())              # Aggregate
    .sort('value', descending=True)           # Sort
    .head(10)                                 # Limit
)

result = result.collect()  # Execute now (optimized query plan)
result = result.collect(streaming=True)  # For out-of-memory data
```

### 2. Pandas Migration Cheat Sheet

```python
# pandas → polars
# df['col']                  → df.select(pl.col('col'))
# df[df['x'] > 0]           → df.filter(pl.col('x') > 0)
# df.groupby('g').mean()     → df.group_by('g').agg(pl.all().mean())
# df.merge(df2, on='id')    → df.join(df2, on='id')
# df pd.concat([a, b])      → pl.concat([a, b])
# df.isnull().sum()          → df.null_count()
# df.fillna(0)               → df.fill_null(0)
# df['x'].astype(float)      → df.cast({'x': pl.Float64})
# df['new'] = df['a'] + df['b'] → df.with_columns((pl.col('a') + pl.col('b')).alias('new'))

# Convert between pandas and polars
df_pandas = df_polars.to_pandas()
df_polars = pl.from_pandas(df_pandas)
```

### 3. Performance-Critical Patterns

```python
# Parallel CSV reading (automatic)
df = pl.read_csv('data.csv', n_threads=8)

# Streaming for large files
df = pl.scan_csv('huge.csv').filter(pl.col('value') > 100).collect(streaming=True)

# Efficient joins
df_joined = df1.join(df2, on='id', how='left')

# Window functions
df.with_columns([
    pl.col('value').rank().over('group').alias('rank'),
    pl.col('value').mean().over('group').alias('group_mean'),
])
```

## Best Practices

1. **Use lazy API**: `scan_csv` + `collect()` for automatic optimization
2. **Use streaming**: `collect(streaming=True)` for data larger than RAM
3. **Avoid `to_pandas()`**: Stay in polars for performance
4. **Use expressions**: `pl.col()` chains are faster than row-by-row operations

## Integration with HBE

- Alternative to pandas in `references/tools/pandas.md` for large datasets
- Supports `references/data-processing-guide.md` Stage 1-2
- See `references/tool-registry.md` for domain-specific polars plugins (polars-bio)

## Resources

- Documentation: https://pola-rs.github.io/polars/
- Pandas migration: https://pola-rs.github.io/polars/user-guide/migration/pandas/
