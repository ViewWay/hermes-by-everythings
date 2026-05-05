---
name: pandas
description: Data manipulation and analysis library. Use for loading, cleaning, transforming, aggregating, and exporting tabular data in any discipline.
domain: cross-domain
install: pip install pandas
---

# Pandas: Data Manipulation & Analysis

## Overview

Pandas is the foundational data analysis library in Python, providing DataFrame and Series data structures for handling structured data. Used across all academic disciplines for data loading, cleaning, transformation, aggregation, and export.

## When to Use

- Loading data from CSV, Excel, SQL, JSON, Parquet, HDF5
- Cleaning and preprocessing research data
- Aggregation, grouping, pivot tables
- Merging/joining multiple datasets
- Time series analysis
- Exporting results to publication-ready formats

## Quick Start

```python
import pandas as pd
import numpy as np

# Load data
df = pd.read_csv('data.csv')
df = pd.read_excel('data.xlsx', sheet_name='Sheet1')
df = pd.read_json('data.json')
df = pd.read_parquet('data.parquet')

# Basic inspection
df.shape          # (rows, columns)
df.head()         # First 5 rows
df.info()         # Data types and non-null counts
df.describe()     # Statistical summary
df.columns.tolist()  # Column names
df.dtypes         # Data types per column
```

## Core Capabilities

### 1. Data Selection and Filtering

```python
# Column selection
df['column_name']
df[['col1', 'col2', 'col3']]

# Row filtering
df[df['age'] > 30]
df[(df['age'] > 30) & (df['gender'] == 'F')]
df[df['name'].str.contains('pattern')]
df[df['category'].isin(['A', 'B', 'C'])]

# Label-based selection
df.loc[0:5, 'col1':'col3']  # By label
df.iloc[0:5, 0:3]           # By position

# Query syntax (readable filtering)
df.query('age > 30 and gender == "F"')
```

### 2. Data Cleaning

```python
# Missing data
df.isnull().sum()                    # Count nulls per column
df.dropna()                          # Drop rows with any null
df.dropna(subset=['col1', 'col2'])   # Drop rows with nulls in specific columns
df.fillna(0)                         # Fill nulls with value
df.fillna(df.mean())                 # Fill with column mean
df['col'].interpolate()              # Linear interpolation

# Duplicates
df.duplicated().sum()                # Count duplicates
df.drop_duplicates()                 # Remove duplicates
df.drop_duplicates(subset=['id'])    # Remove based on subset

# Data type conversion
df['date'] = pd.to_datetime(df['date_str'])
df['numeric'] = pd.to_numeric(df['str_col'], errors='coerce')
df['category'] = df['str_col'].astype('category')

# String operations
df['name'] = df['name'].str.strip().str.lower()
df['first'] = df['name'].str.split(' ').str[0]
```

### 3. Aggregation and Grouping

```python
# Basic aggregation
df['col'].mean()
df['col'].median()
df['col'].std()
df['col'].quantile([0.25, 0.5, 0.75])

# Groupby
df.groupby('category')['value'].mean()
df.groupby('category').agg({
    'value': ['mean', 'std', 'count'],
    'score': ['median', 'min', 'max']
})

# Named aggregation (cleaner output)
df.groupby('category').agg(
    mean_value=('value', 'mean'),
    std_value=('value', 'std'),
    count=('value', 'count')
)

# Multiple groupby keys
df.groupby(['category', 'year'])['value'].mean()

# Pivot tables
pd.pivot_table(df, values='value', index='category', columns='year', aggfunc='mean')

# Crosstab (frequency counts)
pd.crosstab(df['category'], df['group'])
```

### 4. Merging and Joining

```python
# Merge (SQL-like joins)
pd.merge(df1, df2, on='id')                    # Inner join
pd.merge(df1, df2, on='id', how='left')        # Left join
pd.merge(df1, df2, on='id', how='outer')       # Outer join
pd.merge(df1, df2, left_on='id1', right_on='id2')  # Different column names

# Concatenate
pd.concat([df1, df2], axis=0)   # Stack rows
pd.concat([df1, df2], axis=1)   # Stack columns

# Join on index
df1.join(df2, how='left')
```

### 5. Time Series

```python
# Parse dates on load
df = pd.read_csv('data.csv', parse_dates=['date'], index_col='date')

# Resampling
df.resample('M').mean()    # Monthly average
df.resample('W').sum()     # Weekly sum
df.resample('Q').median()  # Quarterly median

# Rolling windows
df['rolling_mean'] = df['value'].rolling(window=7).mean()
df['rolling_std'] = df['value'].rolling(window=7).std()

# Date operations
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day_of_week'] = df['date'].dt.dayofweek
```

## Common Academic Workflows

### Publication-Ready Summary Statistics Table

```python
def summary_table(df, group_col, value_col):
    """Generate publication-ready summary statistics."""
    return df.groupby(group_col).agg(
        N=(value_col, 'count'),
        Mean=(value_col, 'mean'),
        SD=(value_col, 'std'),
        Median=(value_col, 'median'),
        Min=(value_col, 'min'),
        Max=(value_col, 'max')
    ).round(2)

# Export to LaTeX
summary = summary_table(df, 'treatment', 'outcome')
summary.to_latex('tables/summary.tex')
```

### Research Data Pipeline

```python
def load_and_clean(filepath):
    """Standard research data loading pipeline."""
    df = pd.read_csv(filepath, parse_dates=['date'])
    df = df.drop_duplicates()
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    return df

def feature_engineer(df):
    """Add common research features."""
    df['log_value'] = np.log1p(df['value'])
    df['z_score'] = (df['value'] - df['value'].mean()) / df['value'].std()
    return df
```

## Key Parameters

| Parameter | Default | When to Adjust |
|-----------|---------|----------------|
| `read_csv(encoding)` | 'utf-8' | Chinese data: 'gbk' or 'gb2312' |
| `read_csv(na_values)` | defaults | Add custom NA strings: ['N/A', '.', 'NA'] |
| `groupby(as_index)` | True | Set False to keep groupby keys as index |
| `merge(validate)` | None | Set 'one_to_one' or 'many_to_one' to catch errors |
| `read_csv(chunksize)` | None | For large files: process in chunks |

## Best Practices

1. **Use `validate` in merges**: `pd.merge(..., validate='one_to_one')` catches data issues
2. **Use `category` dtype**: For string columns with few unique values, saves memory
3. **Chain operations**: `df.query(...).groupby(...).agg(...)` for readable pipelines
4. **Use `pipe`**: `df.pipe(clean).pipe(transform).pipe(export)` for reusable pipelines
5. **Copy vs view**: Use `df.copy()` when modifying to avoid SettingWithCopyWarning

## Common Pitfalls

1. **SettingWithCopyWarning**: Use `.loc[row, col] = value` or `.copy()`
2. **Memory with large files**: Use `chunksize` parameter or switch to polars
3. **Index alignment**: Operations align on index silently — use `.reset_index()` or check alignment
4. **DateTime parsing**: Always specify `parse_dates` in `read_csv` for date columns
5. **Categorical vs string**: `.str` methods fail on `category` dtype — convert with `.astype(str)` first

## Integration with HBE

- Primary tool in `references/data-processing-guide.md` Stages 1-6
- Supports `workflows/experiment-design.md` data preparation
- Works with `references/statistical-analysis-guide.md` for data preparation before testing
- See `references/tools/polars.md` for large dataset alternative

## Resources

- Documentation: https://pandas.pydata.org/docs/
- Cheatsheet: https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf
- McKinney (2017) "Python for Data Analysis" — definitive reference
