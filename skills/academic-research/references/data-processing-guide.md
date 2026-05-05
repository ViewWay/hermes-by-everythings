# Research Data Processing Guide / 研究数据处理指南

Cross-disciplinary data pipeline: acquisition, cleaning, transformation, exploration, and preparation.
跨学科数据流水线：获取、清洗、转换、探索和准备。

## Positioning in the Research Pipeline / 在研究流水线中的定位

```
Research Pipeline Logical Chain:
研究流水线逻辑链：

Idea 评估 ──→ 文献检索 ──→ 论文精读 ──→ 研究设计 ──→ ★数据处理★ ──→ 实验/因果推断 ──→ 论文写作 ──→ 审查提交

Why data processing is a separate stage:
为什么数据处理是独立阶段：

• 研究设计 defines WHAT data you need
  研究设计定义你需要什么数据

• 数据处理 defines HOW you make that data usable
  数据处理定义如何使数据可用

• 实验设计 assumes data is ready
  实验设计假设数据已准备好

Without this stage, researchers jump from design to experiment with dirty/misunderstood data,
producing results that are artifacts of data issues, not of the method being tested.
没有这个阶段，研究者会带着脏数据从设计直接跳到实验，
产生的结果是数据问题的假象，而非被测方法的真实表现。
```

## Seven-Stage Data Pipeline / 七阶段数据流水线

### Stage 1: Data Acquisition / 数据获取

```
How to obtain data for research.
如何获取研究数据。

Acquisition channels by discipline:
按学科的获取渠道：
```

| Discipline | Primary Sources | Access Method |
|-----------|----------------|---------------|
| CS/AI | HuggingFace, Papers With Code, TensorFlow Datasets | `datasets.load_dataset()`, direct download |
| Medicine | MIMIC, UK Biobank, ClinicalTrials.gov | Credential + DUA (Data Use Agreement) |
| Social Science | ICPSR, IPUMS, World Bank, FRED | API, bulk download |
| Economics | Compustat, CRSP, FRED, customs data | Licensed (WRDS), API |
| Physics | CERN Open Data, NASA ADS, SDSS | Bulk download, API |
| Biology | NCBI, UniProt, PDB, ENA | API, FTP |
| Humanities | Project Gutenberg, JSTOR, library archives | API, web scraping (with permission) |

```python
# Universal data acquisition template
import os
import hashlib
import json
from pathlib import Path

def acquire_dataset(source_config: dict, output_dir: str = "data/raw/"):
    """
    Acquire dataset with provenance tracking.
    带来源追踪的数据获取。
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # Record provenance
    provenance = {
        "source": source_config["name"],
        "url": source_config["url"],
        "version": source_config.get("version", "unknown"),
        "acquired_at": __import__("datetime").datetime.now().isoformat(),
        "license": source_config.get("license", "unknown"),
    }
    
    # Download
    raw_path = os.path.join(output_dir, f"{source_config['name']}.{source_config.get('format', 'csv')}")
    # ... download logic ...
    
    # Checksum for integrity
    with open(raw_path, "rb") as f:
        provenance["md5"] = hashlib.md5(f.read()).hexdigest()
    
    # Save provenance
    with open(os.path.join(output_dir, f"{source_config['name']}_provenance.json"), "w") as f:
        json.dump(provenance, f, indent=2)
    
    return raw_path, provenance
```

### Stage 2: Data Audit / 数据审计

```
Before any processing, understand what you have.
处理之前，先理解你拥有什么。
```

| Check | What to Verify | Tool |
|-------|---------------|------|
| **Shape** | Number of rows, columns, dimensions | `df.shape` |
| **Types** | Data type per column (numeric, categorical, text, datetime) | `df.dtypes` |
| **Missingness** | % missing per column, pattern (MCAR/MAR/MNAR) | `df.isnull().sum()` |
| **Duplicates** | Exact duplicates, near-duplicates | `df.duplicated()` |
| **Outliers** | Values beyond plausible range | Box plots, Z-score |
| **Distribution** | Skewness, multimodality, heavy tails | Histograms, Q-Q plots |
| **Correlations** | Unexpected high correlations (redundancy) | Correlation matrix |
| **Cardinality** | Unique values per categorical column | `df.nunique()` |
| **Constants** | Columns with zero variance | `df.std()` |
| **Leaks** | Target-correlated features that shouldn't be available at prediction time | Domain knowledge |

```python
def audit_dataset(df, target_col=None):
    """
    Generate a comprehensive data audit report.
    生成全面的数据审计报告。
    """
    report = {
        "shape": df.shape,
        "columns": {
            col: {
                "dtype": str(df[col].dtype),
                "missing_pct": round(df[col].isnull().mean() * 100, 2),
                "unique": df[col].nunique(),
            }
            for col in df.columns
        },
        "duplicates": df.duplicated().sum(),
        "memory_mb": round(df.memory_usage(deep=True).sum() / 1e6, 2),
    }
    
    if target_col and target_col in df.columns:
        report["target"] = {
            "distribution": df[target_col].value_counts().to_dict(),
            "class_balance": round(df[target_col].value_counts().min() / df[target_col].value_counts().max(), 3),
        }
    
    return report
```

### Stage 3: Data Cleaning / 数据清洗

```
Fix quality issues without introducing bias.
修复质量问题而不引入偏差。

Critical principle: Every cleaning decision must be documented and justified.
关键原则：每个清洗决策必须文档化并论证。
```

| Issue | Strategy | When to Use | Risk |
|-------|----------|------------|------|
| Missing values (MCAR) | Drop rows | Missing < 5%, no pattern | Loss of statistical power |
| Missing values (MAR) | Impute (mean/median/mode) | Missing 5-20%, feature dependent | Distorted distribution |
| Missing values (MNAR) | Flag + impute + sensitivity | Missing related to unobserved value | Potential bias |
| Outliers | Clip to percentile, or Winsorize | Measurement errors confirmed | Losing real signal |
| Outliers | Keep + robust methods | Outliers are genuine | Non-normal distributions |
| Duplicates | Remove exact duplicates | Same row, all columns | — |
| Near-duplicates | Investigate, merge or keep | Same ID, slight differences | May lose real variation |
| Inconsistent encoding | Standardize (UTF-8, lowercase) | Text data | — |
| Wrong types | Cast (str→num, str→date) | Parsed incorrectly | — |

```python
def clean_dataset(df, strategy: dict):
    """
    Apply cleaning strategy with audit trail.
    应用清洗策略并保留审计追踪。
    """
    changes = []
    
    for col, actions in strategy.items():
        if col not in df.columns:
            continue
        for action in actions:
            before = df[col].isnull().sum()
            if action["type"] == "drop_na":
                df = df.dropna(subset=[col])
                changes.append(f"{col}: dropped {before} rows with NA")
            elif action["type"] == "fill":
                df[col] = df[col].fillna(action["value"])
                changes.append(f"{col}: filled {before} NAs with {action['value']}")
            elif action["type"] == "clip":
                df[col] = df[col].clip(lower=action["lower"], upper=action["upper"])
                changes.append(f"{col}: clipped to [{action['lower']}, {action['upper']}]")
            elif action["type"] == "cast":
                df[col] = df[col].astype(action["dtype"])
                changes.append(f"{col}: cast to {action['dtype']}")
    
    return df, changes
```

### Stage 4: Feature Engineering / 特征工程

```
Transform raw data into analysis-ready features.
将原始数据转换为分析就绪的特征。
```

| Transformation | Use Case | Cross-Discipline Examples |
|---------------|----------|--------------------------|
| Scaling | Numeric features with different ranges | Normalize lab values (medicine), z-score survey responses (social science) |
| Encoding | Categorical → numeric | One-hot encode treatment groups, label encode species |
| Binning | Continuous → discrete groups | Age groups, income brackets, severity levels |
| Aggregation | Granular → summary | Daily→monthly (economics), per-patient→per-cohort (medicine) |
| Time features | Extract temporal patterns | Day-of-week, season, time-since-event |
| Text → numeric | NLP features | TF-IDF, embeddings, sentiment scores |
| Domain features | Discipline-specific | Molecular fingerprints (chemistry), spectral features (physics) |

```python
def engineer_features(df, transforms: list):
    """
    Apply feature engineering pipeline.
    应用特征工程流水线。
    """
    for t in transforms:
        if t["type"] == "scale":
            from sklearn.preprocessing import StandardScaler, MinMaxScaler
            scaler = StandardScaler() if t["method"] == "standard" else MinMaxScaler()
            df[t["columns"]] = scaler.fit_transform(df[t["columns"]])
        elif t["type"] == "encode":
            df = pd.get_dummies(df, columns=t["columns"], drop_first=t.get("drop_first", True))
        elif t["type"] == "bin":
            df[t["output"]] = pd.cut(df[t["input"]], bins=t["bins"], labels=t.get("labels"))
        elif t["type"] == "aggregate":
            df = df.groupby(t["group_by"]).agg(t["aggregations"]).reset_index()
    return df
```

### Stage 5: Exploratory Data Analysis / 探索性数据分析

```
Understand your data before modeling.
建模之前先理解数据。
```

**Mandatory visualizations / 必做可视化**:

| # | Visualization | Purpose | Code |
|---|--------------|---------|------|
| 1 | Target distribution | Check class imbalance | `df[target].hist()` |
| 2 | Feature distributions | Identify skew, bimodality | `df[features].hist(figsize=(15,10))` |
| 3 | Correlation matrix | Find redundant features | `sns.heatmap(df.corr())` |
| 4 | Feature vs. target | Identify predictive features | `sns.boxplot(x=target, y=feature, data=df)` |
| 5 | Missing pattern | Understand missingness mechanism | `msno.matrix(df)` |
| 6 | Pair plot (top features) | Multivariate relationships | `sns.pairplot(df[top_features + [target]])` |

**EDA Questions to Answer / EDA 必答问题**:

```
□ Is the target balanced? If not, what is the imbalance ratio?
  目标是否平衡？如否，不平衡比例是多少？

□ Which features have the strongest signal for the target?
  哪些特征对目标的信号最强？

□ Are there unexpected patterns (data leakage, temporal drift)?
  是否有意外的模式（数据泄漏、时间漂移）？

□ How much missing data, and is it systematic?
  缺失多少数据，是系统性的吗？

□ Are there subgroups that behave differently?
  是否存在行为不同的子群？
```

### Stage 6: Data Splitting & Versioning / 数据划分与版本管理

```
Split data and version it for reproducibility.
划分数据并进行版本管理以确保可复现性。
```

| Split Strategy | When to Use | Method |
|---------------|------------|--------|
| Random split | i.i.d. data | `train_test_split(test_size=0.2, random_state=42)` |
| Stratified split | Imbalanced classification | `StratifiedShuffleSplit` |
| Temporal split | Time-series data | Train on past, test on future |
| Group split | Clustered data (patients, schools) | `GroupShuffleSplit` |
| K-fold CV | Small datasets | `StratifiedKFold(n_splits=5)` |
| Nested CV | Hyperparameter tuning | Outer: evaluation, Inner: tuning |

```python
def split_and_version(df, strategy: dict, output_dir: str = "data/processed/"):
    """
    Split data and save with version tracking.
    划分数据并保存版本追踪。
    """
    from sklearn.model_selection import train_test_split
    import json
    
    version = strategy.get("version", "v1")
    os.makedirs(os.path.join(output_dir, version), exist_ok=True)
    
    if strategy["method"] == "random":
        train, test = train_test_split(
            df, 
            test_size=strategy["test_size"],
            random_state=strategy["seed"],
            stratify=df[strategy["stratify"]] if "stratify" in strategy else None
        )
    elif strategy["method"] == "temporal":
        split_date = strategy["split_date"]
        train = df[df[strategy["time_col"]] < split_date]
        test = df[df[strategy["time_col"]] >= split_date]
    
    # Save splits
    train.to_csv(os.path.join(output_dir, version, "train.csv"), index=False)
    test.to_csv(os.path.join(output_dir, version, "test.csv"), index=False)
    
    # Save split metadata
    meta = {
        "version": version,
        "strategy": strategy,
        "train_shape": train.shape,
        "test_shape": test.shape,
        "created_at": __import__("datetime").datetime.now().isoformat(),
    }
    with open(os.path.join(output_dir, version, "split_meta.json"), "w") as f:
        json.dump(meta, f, indent=2)
    
    return train, test
```

### Stage 7: Data Readiness Checklist / 数据就绪检查清单

```
Before proceeding to experiments, verify data is ready.
进入实验前，验证数据已就绪。
```

| # | Check | Pass Criteria |
|---|-------|--------------|
| 1 | Provenance recorded | Source, version, license documented |
| 2 | Audit completed | Missing, outliers, duplicates quantified |
| 3 | Cleaning documented | Every change justified and logged |
| 4 | Features engineered | All features have clear definitions |
| 5 | EDA completed | Key visualizations saved, questions answered |
| 6 | Splits created | Train/val/test with correct method |
| 7 | No data leakage | No target information in features, correct split method |
| 8 | Reproducible | Seeds set, versions pinned, random_state specified |
| 9 | Privacy checked | PII removed/anonymized, license compatible |
| 10 | Saved with metadata | Processed data + processing script + config all saved |

## Cross-Discipline Processing Patterns / 跨学科数据处理模式

### CS/AI Pattern
```
Raw → Clean → Tokenize/Featurize → Split → DataLoader → Train
Focus: class balance, feature scaling, augmentation pipeline
Tools: pandas, sklearn, torch.utils.data
```

### Medical/Clinical Pattern
```
Raw → De-identify → Code standardization (ICD, SNOMED) → Cohort definition → Split
Focus: privacy, temporal alignment, confounders, missing data patterns
Tools: pandas, FHIR, OMOP CDM
```

### Social Science Pattern
```
Raw → Weight calibration → Variable recoding → Missing data imputation → Merge sources
Focus: survey weights, measurement validity, multi-source linkage
Tools: pandas, Stata, R survey package
```

### Economics Pattern
```
Raw → Variable construction → Panel formatting → Instrument identification → Descriptive stats
Focus: endogeneity, fixed effects, instrument validity, structural breaks
Tools: pandas, linearmodels, statsmodels, Stata
```

### Physics Pattern
```
Raw → Calibration → Background subtraction → Uncertainty propagation → Binning
Focus: systematic uncertainties, detector effects, signal-background separation
Tools: numpy, scipy, ROOT (C++), uproot
```

## Integration / 集成

- Follows `workflows/experiment-design.md` (design defines data requirements)
- Feeds `references/causal-inference-guide.md` (causal methods need clean data)
- Supports `references/paper-reproduction-guide.md` (reproduction requires identical data pipeline)
- Connects to `references/scientific-databases-guide.md` (data acquisition sources)
- Complements `references/research-integrity-guide.md` (data integrity verification)

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full registry. Quick reference by stage:

| Pipeline Stage | Primary Tool | Alternative | Install |
|---------------|-------------|-------------|---------|
| Data loading (small) | pandas | — | `pip install pandas` |
| Data loading (large) | polars | dask | `pip install polars` |
| Missing data viz | missingno | — | `pip install missingno` |
| Genomics data | biopython + pysam | — | `pip install biopython pysam` |
| Molecular data | rdkit + datamol | — | `pip install rdkit datamol` |
| Single-cell data | scanpy | — | `pip install scanpy` |
| Geospatial data | geopandas | — | `pip install geopandas` |
| EDA automated | ydata-profiling | — | `pip install ydata-profiling` |
| EDA statistical | seaborn + scipy | — | `pip install seaborn scipy` |
| Split & version | scikit-learn | — | `pip install scikit-learn` |
