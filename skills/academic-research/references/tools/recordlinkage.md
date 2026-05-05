---
name: recordlinkage
description: Record linkage toolkit — deterministic and probabilistic matching for data deduplication and entity resolution
domain: Social Science / Economics
install: pip install recordlinkage
---

# recordlinkage — Record Linkage Toolkit / 记录链接工具包

Probabilistic and deterministic record linkage for deduplicating datasets and linking records across administrative data sources in social science research.

## When to Use / 适用场景

- Linking hospital discharge records with census or mortality data for epidemiological studies (将医院出院记录与人口普查或死亡数据关联)
- Deduplicating administrative datasets where no unique identifier exists (无唯一标识符的行政数据去重)
- Probabilistic matching under the Fellegi-Sunter framework for survey data fusion (基于 Fellegi-Sunter 框架的问卷数据概率匹配)
- Blocking and indexing large datasets to avoid O(n^2) pairwise comparisons (对大规模数据集建立索引以避免平方级比较)
- Entity resolution across noisy data sources with missing fields and typos (跨含缺失值和拼写错误的噪声数据源进行实体解析)

## Quick Start / 快速开始

```python
import recordlinkage as rl
from recordlinkage.datasets import load_febrl4

# Load sample datasets (df_a = original, df_b = duplicates with errors)
df_a, df_b = load_febrl4()

# Step 1: Indexing — block on given_name to reduce candidate pairs
indexer = rl.Index()
indexer.block("given_name")
candidate_pairs = indexer.index(df_a, df_b)
print(f"Candidate pairs: {len(candidate_pairs)}")  # ~5k vs 5M full pairs

# Step 2: Comparison — compute similarity features for each pair
compare = rl.Compare()
compare.string("given_name", "given_name", method="jarowinkler", threshold=0.85)
compare.string("surname", "surname", method="jarowinkler", threshold=0.85)
compare.exact("date_of_birth", "date_of_birth", label="dob_exact")
compare.string("address_1", "address_1", method="levenshtein", threshold=0.7)
compare.string("suburb", "suburb", method="jaro")
feature_vectors = compare.compute(candidate_pairs, df_a, df_b)

# Step 3: Classification — simple threshold rule
matches = feature_vectors[feature_vectors.sum(axis=1) >= 3]
print(f"Matches found: {len(matches)}")
```

## Core Capabilities / 核心能力

### 1. Indexing Strategies / 索引策略

Indexing reduces the search space from O(n*m) to a tractable set of candidate pairs. Choosing the right strategy depends on data quality and expected match rate.

```python
import recordlinkage as rl

# Blocking: exact match on a key field (fastest, may miss matches)
indexer = rl.Index()
indexer.block("postcode")

# SortedNeighbourhood: sort by key and compare within a window
indexer = rl.SortedNeighbourhood("surname", window=3)

# Full index: all pairs (only for small datasets, O(n^2))
indexer = rl.FullIndex()

# Multi-key blocking: union of blocks on multiple fields
indexer = rl.Index()
indexer.block("postcode")
indexer.block("date_of_birth")
candidate_pairs = indexer.index(df_a, df_b)
```

### 2. Comparison Functions / 比较函数

The `Compare` class computes similarity scores for each candidate pair across specified fields. Multiple string metrics and numeric comparators are available.

```python
compare = rl.Compare()

# String comparators: jarowinkler, jaro, levenshtein, qgram
compare.string("given_name", "given_name", method="jarowinkler",
               threshold=0.85, label="first_name_jw")
compare.string("surname", "surname", method="levenshtein",
               threshold=0.7, label="surname_lev")

# Exact match (returns 0 or 1)
compare.exact("sex", "sex", label="sex_match")

# Numeric comparison within a tolerance
compare.numeric("income", "income", method="step", offset=5000,
                scale=500, label="income_sim")

# Date comparison
compare.date("birth_date", "birth_date", format="%Y-%m-%d",
             label="dob_diff")
```

### 3. Probabilistic Classification / 概率分类

The Fellegi-Sunter model estimates m-probabilities (match given true pair) and u-probabilities (match given non-match), then computes match weights via log-likelihood ratios.

```python
# Expectation-Maximization (ECM) for unsupervised parameter estimation
ecm = rl.ECMClassifier()
matches_ecm = ecm.fit_predict(feature_vectors)

# Inspect learned m and u probabilities
print(f"m-probabilities: {ecm.m_probabilities}")
print(f"u-probabilities: {ecm.u_probabilities}")
print(f"Weights: {ecm.log_weights}")

# Supervised classifiers (requires labelled training data)
from recordlinkage import NaiveBayesClassifier, SVMClassifier

nb = rl.NaiveBayesClassifier()
nb.fit(train_features, train_labels)
predictions = nb.predict(test_features)

svm = rl.SVMClassifier()
svm.fit(train_features, train_labels)
predictions_svm = svm.predict(test_features)
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Linking Hospital Discharge Records with Census Data / 医院记录与人口普查数据链接

```python
import pandas as pd
import recordlinkage as rl

# Load datasets (typically from restricted-access secure data environments)
hospital = pd.read_csv("hospital_discharges.csv")  # fields: name, dob, sex, postcode, diagnosis
census = pd.read_csv("census_microdata.csv")       # fields: name, dob, sex, postcode, income

# Step 1: Block on postcode + sex to reduce candidates
indexer = rl.Index()
indexer.block(left_on=["postcode", "sex"], right_on=["postcode", "sex"])
pairs = indexer.index(hospital, census)
print(f"Blocked pairs: {len(pairs):,}")

# Step 2: Compare on identifiers
compare = rl.Compare()
compare.string("name", "name", method="jarowinkler", threshold=0.8, label="name")
compare.exact("dob", "dob", label="dob")
compare.string("postcode", "postcode", method="jaro", threshold=0.9, label="postcode")
features = compare.compute(pairs, hospital, census)

# Step 3: Probabilistic classification
ecm = rl.ECMClassifier()
matches = ecm.fit_predict(features)
match_df = hospital.loc[matches.get_level_values(0)].copy()
match_df["census_income"] = census.loc[matches.get_level_values(1), "income"].values

# Step 4: Report linkage quality metrics
n_linked = len(match_df)
n_total = len(hospital)
print(f"Linkage rate: {n_linked}/{n_total} ({n_linked/n_total:.1%})")
```

## Best Practices / 最佳实践

- **Report match weight distributions**: Include histograms of log-likelihood weights and the classification threshold in your methods section; this lets readers assess sensitivity of results to threshold choice.
- **Use multiple blocking keys and take the union**: Single-field blocking misses matches where that field has errors. Block on several fields (postcode, DOB, phonetic surname) and union the candidate sets to improve recall at the cost of more comparisons.
- **Validate with manually labelled samples**: For any published linkage, manually verify a random sample of classified matches and non-matches. Report precision and recall against this gold standard.
- **Pre-standardize fields before comparison**: Convert names to lowercase, strip whitespace, standardize date formats, and expand common abbreviations (St -> Street) before running comparisons.
- **Document the linkage protocol**: Include the exact blocking keys, comparison fields, similarity thresholds, and classifier used in a reproducible script. Administrative data linkage is a key methodological choice.

## Common Pitfalls / 常见陷阱

- **Phonetic encoding has limited cross-language coverage**: Soundex and Metaphone are designed for English names and fail badly on non-European names. Use Jaro-Winkler or q-gram comparators instead for multicultural populations.
- **Blocking key selection biases results**: If your blocking key is correlated with the outcome variable (e.g., blocking on postcode when studying geographic health disparities), you systematically exclude certain true matches. Use blocking keys independent of your research question.
- **Missing data fields silently break comparisons**: If `date_of_birth` is NaN for many records, `compare.exact("dob", "dob")` returns 0 for those pairs regardless of whether non-missing values match. Use `compare.date()` which handles partial matches, or impute missing values beforehand.
- **Fellegi-Sunter assumes conditional independence**: If you compare both city and postcode (highly correlated), the ECM will overestimate total weight. Use one or the other, or use a classifier that does not assume independence (SVM).
- **Not accounting for one-to-many linkage**: Hospital data may have multiple records per person (readmissions). Post-process with greedy assignment to enforce one-to-one constraints when required by your study design.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` when designing studies requiring cross-source data integration
- Combine with `references/tools/pandas.md` for pre-processing and post-linkage analysis pipelines
- Pair with `references/tools/matplotlib.md` to produce match weight distribution plots for paper figures

## Resources / 资源

- Documentation: https://recordlinkage.readthedocs.io/
- GitHub: https://github.com/J535D165/recordlinkage
- Fellegi-Sunter reference: Fellegi, I.P. & Sunter, A.B. (1969). "A Theory for Record Linkage", JASA 84(406), pp. 1184-1210
