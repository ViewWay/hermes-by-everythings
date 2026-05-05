# Benchmark Paper Template & Guide / 基准论文模板与指南

Six-stage workflow for writing benchmark/evaluation papers, applicable across disciplines.
跨学科六阶段基准论文写作工作流。

## When to Use / 适用场景

- Proposing a new benchmark dataset or evaluation framework
- Comprehensive empirical comparison of methods
- Challenge competition design and results paper
- Multi-dimensional evaluation studies
- 提出新基准数据集或评估框架
- 方法综合实验对比
- 竞赛设计与结果论文
- 多维评估研究

## Six-Stage Workflow / 六阶段工作流

### Stage 1: Scope & Motivation / 范围与动机

```
Define what is being benchmarked and why it matters.
定义被基准测试的内容及其重要性。

□ Identify the evaluation gap in existing literature
  识别现有文献中的评估空白
□ Define the task formally (input → output mapping)
  形式化定义任务
□ Specify target community and expected impact
  明确目标社区和预期影响
□ Survey existing benchmarks — what's missing?
  调查现有基准——缺失什么？
```

**Output**: Motivation section with clear gap statement + task definition.

### Stage 2: Data Collection & Annotation / 数据收集与标注

```
Build or curate the evaluation dataset.
构建或策划评估数据集。

□ Data source and collection methodology documented
  记录数据来源和收集方法
□ Size, diversity, and coverage justified
  论证规模、多样性和覆盖度
□ Annotation protocol designed (guidelines, examples)
  设计标注协议（指南、示例）
□ Inter-annotator agreement measured (Cohen's κ, Krippendorff's α)
  测量标注者间一致性
□ Train/dev/test splits defined (no data leakage)
  定义训练/开发/测试划分（无数据泄漏）
□ Licensing and ethics reviewed
  审查许可和伦理问题
```

**Output**: Dataset section with statistics table, annotation quality, split rationale.

### Stage 3: Metric Design / 指标设计

```
Design evaluation metrics aligned with the task.
设计与任务对齐的评估指标。

□ Primary metric selected and justified
  选择并论证主要指标
□ Secondary metrics for different aspects
  不同方面的辅助指标
□ Metric limitations acknowledged
  承认指标局限性
□ Human baseline established if possible
  尽可能建立人类基线
□ Statistical significance framework defined
  定义统计显著性框架
```

**Metric Selection Guide / 指标选择指南**:

| Task Type | Primary Metric | Secondary Metrics |
|-----------|---------------|-------------------|
| Classification | Accuracy / F1 | Precision, Recall, AUC |
| Ranking | nDCG@K | MRR, Hit@K, MAP |
| Generation | BLEU/ROUGE | BERTScore, human eval |
| Detection | mAP@0.5 | mAP@0.5:0.95, Recall |
| Regression | RMSE | MAE, R², MAPE |
| Structured Pred | Exact Match | F1 (partial), Span F1 |
| Time Series | MAE | RMSE, sMAPE, MASE |

### Stage 4: Baseline Selection / 基线选择

```
Select comprehensive baselines covering the spectrum.
选择覆盖完整谱系的基线方法。

□ Representative methods from each paradigm (rule-based, statistical, neural, LLM)
  每种范式的代表方法
□ State-of-the-art methods (last 2 years, top venues)
  最先进方法（近2年，顶级会议）
□ Classic methods (for historical context)
  经典方法（历史背景）
□ Oracle/upper bound (if meaningful)
  Oracle/上界（如有意义）
□ All baselines run with best reported hyperparameters or re-tuned fairly
  所有基线使用最佳超参数或公平重调
```

### Stage 5: Analysis Framework / 分析框架

```
Design the analysis beyond the main results table.
设计主结果表之外的分析。

□ Main results: overall comparison table
  主结果：总体对比表
□ Per-category breakdown (by difficulty, domain, type)
  分类别分析
□ Efficiency analysis (accuracy vs. cost Pareto frontier)
  效率分析（准确率-成本帕累托前沿）
□ Error analysis (confusion matrix, failure cases, qualitative examples)
  错误分析（混淆矩阵、失败案例、定性示例）
□ Ablation: what factors matter most?
  消融：哪些因素最重要？
□ Human evaluation (if applicable)
  人工评估（如适用）
□ Limitations discussion
  局限性讨论
```

### Stage 6: Writing & Submission / 写作与提交

```
Structure the benchmark paper for maximum impact.
以最大影响力组织基准论文结构。

□ Title: descriptive, includes "Benchmark" or "Evaluation"
  标题：描述性，包含"Benchmark"或"Evaluation"
□ Abstract: dataset size, methods compared, key findings
  摘要：数据集规模、比较方法、关键发现
□ Introduction: gap → contribution list → impact
  引言：空白→贡献列表→影响
□ Dataset: comprehensive description + statistics
  数据集：全面描述+统计
□ Experiments: fair comparison + analysis
  实验：公平比较+分析
□ Findings: what did we learn?
  发现：我们学到了什么？
□ Release plan: how to access the benchmark
  发布计划：如何获取基准
```

## Benchmark Paper Structure / 基准论文结构

```latex
\section{Introduction}
% Gap → motivation → contributions

\section{Related Work}
% Existing benchmarks, why insufficient

\section{Benchmark Design}
\subsection{Task Definition}
\subsection{Data Collection}
\subsection{Annotation Protocol}
\subsection{Dataset Statistics}
\subsection{Evaluation Metrics}

\section{Experimental Setup}
\subsection{Baselines}
\subsection{Implementation Details}

\section{Results \& Analysis}
\subsection{Main Results}
\subsection{Category-wise Analysis}
\subsection{Efficiency Analysis}
\subsection{Error Analysis}
\subsection{Ablation Study}

\section{Findings \& Recommendations}
% Key takeaways for the community

\section{Limitations}

\section{Conclusion}
```

## Cross-Discipline Adaptation / 跨学科适配

| Discipline | Benchmark Type | Key Difference |
|-----------|---------------|----------------|
| NLP | Text understanding, generation | Human evaluation critical |
| CV | Image/video tasks | Standardized splits essential |
| Medicine | Clinical diagnosis, trial outcomes | Patient safety, regulatory compliance |
| Social Science | Survey analysis, policy evaluation | Causal identification, external validity |
| Physics | Simulation accuracy, detector performance | Physical constraints, uncertainty |
| Economics | Policy impact, forecasting | Out-of-sample testing, structural breaks |

## Quality Checklist / 质量检查清单

```
□ Dataset is publicly available (or will be upon acceptance)
□ Baselines are fair: same data, same splits, same compute
□ Statistical significance reported for all comparisons
□ At least 3 diverse analysis dimensions beyond main table
□ Findings provide actionable recommendations for the field
□ Limitations section is honest and thorough
□ Release plan includes code, data, and evaluation script
```

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| Dataset analysis | pandas + polars | `pip install pandas polars` |
| Statistical tests | scipy + statsmodels | `pip install scipy statsmodels` |
| Visualization | matplotlib + seaborn | `pip install matplotlib seaborn` |
| NLP metrics | sacrebleu + rouge-score | `pip install sacrebleu rouge-score` |
| CV metrics | scikit-learn | `pip install scikit-learn` |
| Annotation agreement | nltk (Krippendorff) | `pip install nltk` |
| Experiment tracking | wandb / mlflow | `pip install wandb` |
| Data versioning | dvc | `pip install dvc` |
| Results tables | tabulate | `pip install tabulate` |

## Integration / 集成

- Follows `references/idea-evaluation.md` (benchmark idea validated first)
- Uses `references/data-processing-guide.md` for dataset construction pipeline
- Works with `references/statistical-analysis-guide.md` for significance testing
- Connects to `workflows/experiment-design.md` for evaluation protocol
- Feeds `references/pre-submission-review.md` for quality check before submission
- Supports `references/writing-guide.md` for benchmark paper writing conventions
