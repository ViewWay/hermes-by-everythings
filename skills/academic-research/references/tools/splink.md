---
name: splink
description: Probabilistic record linkage — Fellegi-Sunter framework with EM estimation, blocking, and SQL backends
domain: Social Science / Economics
install: pip install splink
---

# splink — Probabilistic Record Linkage / 概率化记录链接

Python library implementing the Fellegi-Sunter probabilistic matching framework with expectation-maximization (EM) parameter estimation, configurable blocking rules, and multiple SQL backends (DuckDB, Spark, SQLite) for scalable entity resolution and deduplication.

## When to Use / 适用场景

- Linking administrative health records across hospitals or registries without unique identifiers / 跨机构健康记录链接
- Deduplicating survey responses, firm registries, or citation databases / 重复记录去重
- Constructing longitudinal panels by matching individual records across waves / 构建纵向面板数据
- Fuzzy matching names, addresses, or dates across noisy datasets / 模糊匹配噪声数据
- Large-scale linkage (millions of records) via Spark or DuckDB backends / 大规模记录链接

## Quick Start / 快速开始

```python
import pandas as pd
import splink.comparison_library as cl
from splink import Linker, DuckDBAPI

# Load two datasets to link
df_left = pd.read_csv("data/hospital_a.csv")
df_right = pd.read_csv("data/hospital_b.csv")

# Define linkage settings
settings = {
    "link_type": "link_and_dedupe",
    "unique_id_column_name": "patient_id",
    "blocking_rules_to_generate_predictions": [
        "l.postcode = r.postcode",
        "l.dob = r.dob",
    ],
    "comparisons": [
        cl.exact_match("sex", term_frequency_adjustments=True),
        cl.jaro_winkler_at_thresholds("first_name", [0.9, 0.7]),
        cl.jaro_winkler_at_thresholds("surname", [0.9, 0.7]),
        cl.dates_at_thresholds("dob", [0, 1, 2]),
    ],
    "retain_matching_columns": True,
    "retain_intermediate_calculation_columns": True,
}

# Create linker and train
linker = Linker([df_left, df_right], settings, db_api=DuckDBAPI())
linker.train_u_using_random_sampling(target_rows=1e6)
linker.train_m_using_expectation_maximisation("l.dob = r.dob")
linker.train_m_using_expectation_maximisation("l.postcode = r.postcode")

# Predict and examine matches
predictions = linker.predict()
matches = predictions.as_pandas_dataframe()
print(f"Total comparisons: {len(matches):,}")
print(f"Match probability > 0.95: {(matches['match_probability'] > 0.95).sum():,}")
```

## Core Capabilities / 核心能力

### 1. Fellegi-Sunter Model with EM Estimation / Fellegi-Sunter 模型与 EM 估计

splink estimates m-probabilities (match) and u-probabilities (non-match) via EM, computing match weights for each comparison vector.

```python
import pandas as pd
import splink.comparison_library as cl
from splink import Linker, DuckDBAPI

df = pd.read_csv("data/patient_records.csv")  # may contain duplicates

settings = {
    "link_type": "dedupe_only",
    "unique_id_column_name": "record_id",
    "blocking_rules_to_generate_predictions": [
        "l.substr(surname, 1, 2) = r.substr(surname, 1, 2)",
    ],
    "comparisons": [
        cl.jaro_winkler_at_thresholds("surname", [0.95, 0.8]),
        cl.jaro_winkler_at_thresholds("first_name", [0.95, 0.8]),
        cl.exact_match("dob"),
        cl.exact_match("sex"),
    ],
}

linker = Linker(df, settings, db_api=DuckDBAPI())

# Train m-probabilities using EM on a blocking rule subset
linker.train_u_using_random_sampling(target_rows=5e5)
linker.train_m_using_expectation_maximisation(
    "l.substr(surname, 1, 2) = r.substr(surname, 1, 2)"
)

# Inspect parameter estimates
print(linker.m_u_table_as_dict)
print(linker.match_weights_chart())
```

### 2. Blocking Strategies / 阻断策略

Blocking reduces the O(n^2) comparison problem by only comparing records that agree on one or more fields.

```python
import splink.comparison_library as cl
from splink import Linker, DuckDBAPI

settings = {
    "link_type": "dedupe_only",
    "unique_id_column_name": "id",
    # Strategy 1: Simple exact block
    "blocking_rules_to_generate_predictions": [
        "l.postcode = r.postcode",
    ],
    # Strategy 2: Multiple blocking rules (union of blocks, higher recall)
    # "blocking_rules_to_generate_predictions": [
    #     "l.postcode = r.postcode",
    #     "l.dob = r.dob AND l.sex = r.sex",
    #     "l.substr(first_name, 1, 1) = r.substr(first_name, 1, 1) AND l.dob = r.dob",
    # ],
    "comparisons": [
        cl.jaro_winkler_at_thresholds("name", [0.9, 0.7]),
        cl.exact_match("dob"),
    ],
}

# For large datasets, estimate block sizes first:
# linker = Linker(df, settings, db_api=DuckDBAPI())
# linker.cumulative_num_comparisons_from_blocking_rules_chart()
```

### 3. Comparison Functions / 比较函数

splink provides a rich library of comparison functions for different data types.

```python
import splink.comparison_library as cl

comparisons = [
    # Exact match with term frequency weighting (common values penalized)
    cl.exact_match("city", term_frequency_adjustments=True),

    # Jaro-Winkler string similarity at thresholds
    cl.jaro_winkler_at_thresholds("name", [0.95, 0.8, 0.6]),

    # Levenshtein distance at character thresholds
    cl.levenshtein_at_thresholds("address", [1, 3, 5]),

    # Date comparison (allowing 0, 1, or 2 day differences)
    cl.dates_at_thresholds("dob", date_format="YYYY-MM-DD", thresholds=[0, 1, 2]),

    # Numeric comparison (absolute difference thresholds)
    cl.abs_value_thresholds("age", [0, 1, 3, 5]),

    # Email comparison (exact at @ and domain level)
    cl.email_comparison("email", include_domain_match_level=True),

    # Custom SQL expression
    cl.custom_comparison(
        output_column_name="custom_postcode",
        comparison_description="First part of postcode",
        comparison_levels=[
            cl.exact_match_level("postcode"),
            cl.custom_level(
                "l.substr(postcode, 1, 3) = r.substr(postcode, 1, 3)",
                "first_3_chars_match",
            ),
            cl.custom_level(
                "l.substr(postcode, 1, 1) = r.substr(postcode, 1, 1)",
                "first_char_match",
            ),
            cl.else_level(),
        ],
    ),
]
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Linking Administrative Health Records / 链接行政健康记录

```python
import pandas as pd
import splink.comparison_library as cl
from splink import Linker, DuckDBAPI

# 1. Load datasets from two hospital systems
hospital_a = pd.read_csv("data/hospital_a_discharges.csv")
hospital_b = pd.read_csv("data/hospital_b_discharges.csv")

# Add source labels for traceability
hospital_a["source"] = "A"
hospital_b["source"] = "B"

# 2. Configure linkage
settings = {
    "link_type": "link_and_dedupe",
    "unique_id_column_name": "record_id",
    "blocking_rules_to_generate_predictions": [
        "l.date_of_birth = r.date_of_birth",
        "l.postcode = r.postcode AND l.sex = r.sex",
    ],
    "comparisons": [
        cl.exact_match("sex", term_frequency_adjustments=True),
        cl.jaro_winkler_at_thresholds("first_name", [0.95, 0.8]),
        cl.jaro_winkler_at_thresholds("last_name", [0.95, 0.8]),
        cl.dates_at_thresholds("date_of_birth", date_format="YYYY-MM-DD",
                                thresholds=[0, 1, 365]),
        cl.jaro_winkler_at_thresholds("postcode", [0.95, 0.85]),
    ],
}

# 3. Train and predict
linker = Linker([hospital_a, hospital_b], settings, db_api=DuckDBAPI())
linker.train_u_using_random_sampling(target_rows=2e6)
linker.train_m_using_expectation_maximisation("l.date_of_birth = r.date_of_birth")
linker.train_m_using_expectation_maximisation("l.postcode = r.postcode AND l.sex = r.sex")

df_predictions = linker.predict(threshold_match_probability=0.9)
matches = df_predictions.as_pandas_dataframe()

# 4. Cluster matches into unique individuals
df_clusters = linker.cluster_pairwise_predictions_at_threshold(
    df_predictions, threshold_match_probability=0.9
)
clusters = df_clusters.as_pandas_dataframe()

# 5. Evaluate with clerical review sample
print(f"Matched pairs: {len(matches):,}")
print(f"Unique clusters: {clusters['cluster_id'].nunique():,}")

# 6. Save linked dataset
clusters.to_csv("results/linked_patients.csv", index=False)
linker.save_model_to_json("models/health_linkage_settings.json", overwrite=True)
```

## Best Practices / 最佳实践

- **Use multiple blocking rules for high recall**: Single blocking rules miss records with typos in the blocking field. Use 2-3 complementary rules (e.g., DOB + postcode, name initial + DOB) / 多个阻断规则提高召回率
- **Apply term frequency adjustments for skewed distributions**: Common names ("Smith") produce more false positives. `term_frequency_adjustments=True` downweights frequent values / 频率调整减少常见值误配
- **Validate with clerical review**: Sample 200-500 pairs across the match probability spectrum, manually label, and compute precision/recall curves / 人工抽样验证链接质量
- **Report linkage quality metrics**: Always report sensitivity (recall), positive predictive value (precision), and the match threshold used / 报告链接质量指标
- **Use DuckDB for datasets <10M records**: DuckDB is the default backend and requires no external dependencies. Switch to Spark for 10M+ records / 小于 1000 万条用 DuckDB

## Common Pitfalls / 常见陷阱

- **Blocking rules that are too strict**: If blocking on exact DOB + exact name, a single typo in either field creates a missed match. Include a phonetic or substring blocking rule as fallback / 阻断规则过严导致漏配
- **Ignoring term frequency for names**: "John Smith" matching "John Smith" gets the same weight as "Zoltan Kovacs" matching "Zoltan Kovacs", despite the latter being far more informative / 忽略名字频率导致权重失真
- **Not handling missing data**: Records with NULL blocking fields are silently excluded. Add `coalesce(l.field, 'MISSING') = coalesce(r.field, 'MISSING')` or a separate "null" blocking rule / 缺失值被静默排除
- **Match threshold selection without validation**: A threshold of 0.95 may be too strict for noisy data or too lenient for clean data. Always validate with a labeled sample / 阈值选择需验证
- **Deduplication vs linkage confusion**: `link_type="dedupe_only"` compares records within one dataset; `link_type="link_only"` compares between two datasets; `link_and_dedupe` does both. Choose correctly / 区分去重与链接模式

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for record linkage study design and power calculations
- Pair with `references/tools/pandas.md` for pre-linkage data cleaning and post-linkage merging
- Combine with `references/tools/matplotlib.md` for match weight distribution plots and precision-recall curves
- Use `references/tools/arch.md` for unit root testing on linked longitudinal panel time series

## Resources / 资源

- Documentation: https://splink.readthedocs.io/
- GitHub: https://github.com/moj-analytical-services/splink
- Interactive tutorial: https://moj-analytical-services.github.io/splink/articles/demos.html
- Fellegi & Sunter (1969), "A Theory for Record Linkage"
- Sayers et al. (2023), "Splink: A free and open source tool for probabilistic record linkage at scale" (JOSS)
