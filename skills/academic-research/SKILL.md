---
name: academic-research
version: 2.0.0
description: >
  Cross-disciplinary academic research skill pack / 跨学科学术研究技能包
  — literature review, paper writing, LaTeX compilation, journal/conference formatting,
  experiment design, rebuttal workflow, thesis writing, idea evaluation, figure design,
  causal inference, De-AIGC, scientific databases, research integrity, benchmark papers,
  paper reproduction, and AI collaboration (Vibe Research).
  文献综述、论文写作、LaTeX 编译、期刊/会议排版、实验设计、rebuttal 工作流、学位论文写作、
  构思评估、图表设计、因果推断、降AIGC、科学数据库、研究诚信、基准论文、论文复现、AI协作。
  Integrates with 28+ scientific databases via MCP, local TeXLive, 12+ venue templates.
  通过 MCP 集成 28+ 科学数据库，集成本地 TeXLive，支持 12+ 顶级会议/期刊模板。
triggers:
  - academic
  - research
  - paper
  - thesis
  - latex
  - literature review
  - conference
  - journal
  - arxiv
  - biblatex
  - bibtex
  - 论文
  - 学术
  - 文献综述
  - 期刊
  - 会议
  - 开题报告
  - 学位论文
  - 顶会
  - rebuttal
  - idea-eval
  - figure-design
  - de-aigc
  - causal
  - databases
  - integrity
  - pre-submit
  - benchmark
  - reproduce
  - vibe
  - hallucination
  - fact-check
  - 复现
  - 基准
  - 投前审查
  - 研究诚信
  - 数据库
  - AI协作
  - deep-read
  - data-processing
  - paper-reading
  - 精读
  - 数据处理
  - 数据清洗
  - 数据审计
  - tools
  - tool-registry
role: specialist
scope: full-workflow
output-format: structured
prerequisites:
  - "LaTeX distribution (TeXLive recommended) or Overleaf account / LaTeX 发行版（推荐 TeXLive）或 Overleaf 账户"
  - "Python 3.8+ (for arXiv search script / 用于 arXiv 搜索脚本)"
---

# Cross-Disciplinary Academic Research Skill Pack / 跨学科学术研究技能包

Cross-disciplinary end-to-end academic research pipeline: from idea evaluation to camera-ready submission, covering all disciplines.
跨学科端到端学术研究流水线：从构思评估到终稿提交，覆盖全学科。

## When to Activate / 触发条件

- User mentions writing a paper, thesis, or academic document / 用户提到写论文、学位论文或学术文档
- User asks about LaTeX formatting, compilation, or journal templates / 用户询问 LaTeX 排版、编译或期刊模板
- User requests literature review or citation management / 用户请求文献综述或引文管理
- User triggers `/hbe-academic` command / 用户触发 `/hbe-academic` 命令
- User mentions keywords: paper, thesis, latex, bibtex, conference, journal, arxiv, databases, integrity, benchmark, reproduce, vibe, causal, 论文, 学术, 文献综述, 期刊, 开题, rebuttal, 复现, 基准, 研究诚信, 数据库, AI协作

## Architecture Overview / 架构概览

```
┌───────────────────────────────────────────────────────┐
│               /hbe-academic Command (22 sub-cmds)     │
│               /hbe-academic 命令 (22 个子命令)         │
├───────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Idea     │ │ Lit      │ │ Paper    │ │ Experiment│ │
│  │ Eval     │ │ Review   │ │ Writing  │ │ Design   │ │
│  │ 构思评估 │ │ 文献综述 │ │ 论文写作 │ │ 实验设计 │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │             │            │             │       │
│  ┌────┴─────────────┴────────────┴─────────────┴────┐ │
│  │      Scientific Database Layer / 科学数据库层     │ │
│  │  28+ databases via MCP | arXiv PubMed OpenAlex    │ │
│  │  28+ 数据库 MCP 集成 | FRED ADS SSRN ...          │ │
│  └────────────────────┬─────────────────────────────┘ │
│                       │                                │
│  ┌────────────────────┴─────────────────────────────┐ │
│  │  Domain Methods / 领域方法层                       │ │
│  │  Causal Inference | De-AIGC | Vibe Research       │ │
│  │  因果推断 | 降AIGC | AI协作                        │ │
│  └────────────────────┬─────────────────────────────┘ │
│                       │                                │
│  ┌────────────────────┴─────────────────────────────┐ │
│  │     LaTeX Compilation Engine / 编译引擎           │ │
│  │  auto-detect TeXLive / Overleaf / Docker          │ │
│  │  自动检测 TeXLive / Overleaf / Docker             │ │
│  └────────────────────┬─────────────────────────────┘ │
│                       │                                │
│  ┌────────────────────┴─────────────────────────────┐ │
│  │   Journal Template Layer / 期刊模板层              │ │
│  │   NeurIPS|ICML|ICLR|ACL|AAAI|IEEE|ACM|...         │ │
│  │   12+ venues across all disciplines               │ │
│  └────────────────────┬─────────────────────────────┘ │
│                       │                                │
│  ┌────────────────────┴─────────────────────────────┐ │
│  │    Quality Gate System / 质量关卡系统              │ │
│  │  5-dim pre-submit | 7-dim review | integrity      │ │
│  │  五维投前审查 | 七维评审 | 研究诚信                 │ │
│  └───────────────────────────────────────────────────┘ │
│                                                       │
│  ┌───────────────────────────────────────────────────┐ │
│  │   Cross-Discipline Coverage / 跨学科覆盖           │ │
│  │  CS|Medicine|Physics|Social Science|Economics|...  │ │
│  │  计算机|医学|物理|社会科学|经济|工程|人文|...       │ │
│  └───────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

## Workflow Sub-Commands / 子命令工作流

### 1. `check-env` — Environment Detection / 环境检测

Auto-detect LaTeX installation and available packages.
自动检测 LaTeX 安装和可用包。

```bash
bash skills/academic-research/scripts/check-environment.sh
```

Outputs / 输出: compilers (pdflatex/xelatex/lualatex/latexmk), bibliography tools (bibtex/biber), key packages, conference style files / 编译器、参考文献工具、核心包、会议样式文件。

**Script / 脚本**: `scripts/check-environment.sh`
**Reference / 参考**: `references/latex-environment.md`

### 2. `lit-review` — Literature Review / 文献综述

**Trigger / 触发**: `/hbe-academic lit-review --topic "..."`

**Workflow / 工作流** (see `workflows/literature-review.md`):
1. Seed paper identification via arXiv API + Semantic Scholar / 通过 arXiv API + Semantic Scholar 确定种子论文
2. Iterative breadth-then-depth search (forward/backward citation traversal) / 迭代广度-深度搜索（前向/后向引文遍历）
3. Abstract screening and relevance scoring (0-10) / 摘要筛选和相关性评分
4. Full-text analysis of top-ranked papers / 高分论文全文分析
5. Synthesis into structured review with BibTeX entries / 综合为结构化综述并生成 BibTeX
6. Gap identification and research positioning / 研究空白识别与研究定位

**Tools / 工具**:
- `scripts/search_arxiv.py` — arXiv search with BibTeX output / arXiv 搜索并输出 BibTeX
- Semantic Scholar API (free, no key needed / 免费，无需密钥)
- DOI resolution via doi.org / 通过 doi.org 解析 DOI

**Reference / 参考**: `workflows/literature-review.md`, `references/scientific-databases-guide.md`

### 3. `paper` — Paper Writing / 论文写作

**Trigger / 触发**: `/hbe-academic paper --venue <venue>`

**Workflow / 工作流** (see `workflows/paper-writing.md`):
1. Select template from `templates/<venue>/` / 从模板目录选择目标会议模板
2. Generate paper structure / 生成论文结构（abstract → intro → method → experiments → conclusion）
3. Section-by-section writing with quality checkpoints / 逐节写作，带质量检查点
4. Insert figures, tables, algorithms via TikZ/algorithm2e / 插入图表、算法
5. Compile with auto-detected engine / 使用自动检测的引擎编译
6. Self-review with 7-dimension reviewer simulation / 7 维度审稿人模拟自审
7. Iterate until quality gate passes / 迭代直到通过质量关卡

**Writing Principles / 写作原则** (see `references/writing-guide.md`):
- Gopen & Swan 7 principles of reader expectations / Gopen & Swan 读者期望七原则
- Perez micro-tips for clarity / Perez 清晰写作微技巧
- Lipton word choice guidelines / Lipton 用词指南
- One idea per paragraph, topic sentence first / 每段一个观点，主题句在前

**Reference / 参考**: `workflows/paper-writing.md`, `references/writing-guide.md`

### 4. `experiment` — Experiment Design / 实验设计

**Trigger / 触发**: `/hbe-academic experiment`

**Workflow / 工作流** (see `workflows/experiment-design.md`):
1. Claims-to-experiments mapping / 论点到实验的映射
2. Baseline selection and justification / 基线选择与论证
3. Evaluation protocol design (metrics, datasets, splits) / 评估协议设计
4. Statistical significance testing plan / 统计显著性检验计划
5. Ablation study design / 消融实验设计
6. Experiment script scaffolding / 实验脚本脚手架

**Reference / 参考**: `workflows/experiment-design.md`, `references/hypothesis-generation-guide.md`

### 5. `rebuttal` — Rebuttal Writing / Rebuttal 写作

**Trigger / 触发**: `/hbe-academic rebuttal`

**Workflow / 工作流** (see `workflows/rebuttal.md`):
1. Parse reviewer comments into structured items / 将审稿意见解析为结构化条目
2. Classify: accept/argue/clarify/experiment / 分类：接受/辩论/澄清/实验
3. Draft point-by-point response / 起草逐条回复
4. Plan additional experiments if needed / 如需要则规划额外实验
5. Generate camera-ready diff / 生成终稿差异

**Reference / 参考**: `workflows/rebuttal.md`

### 6. `compile` — LaTeX Compilation / LaTeX 编译

**Trigger / 触发**: `/hbe-academic compile <file.tex>`

**Engine Selection Logic / 引擎选择逻辑**:
```
if document uses ctex/xeCJK → xelatex    # 含中文内容
else if document uses fontspec → lualatex # 自定义字体
else → pdflatex                            # 标准英文论文
```

**Compilation Pipeline / 编译流水线**:
```bash
bash skills/academic-research/scripts/compile.sh -e <engine> -b -c <file.tex>
```

Auto-runs / 自动执行: multiple passes + bibliography + cross-reference resolution + auxiliary cleanup / 多遍编译 + 参考文献 + 交叉引用 + 辅助文件清理。

**Script / 脚本**: `scripts/compile.sh`
**Reference / 参考**: `references/latex-environment.md`

### 7. `idea-eval` — Idea Evaluation / 构思评估

**Trigger / 触发**: `/hbe-academic idea-eval`

Evaluate research ideas using a four-layer audit (fatal flaws → lifecycle matching → five-dimension scoring → paradigm shift detection). 
使用四层审计评估研究构思（致命缺陷 → 生命周期匹配 → 五维打分 → 范式跃迁探测）。

**Output / 输出**: PROCEED / PROCEED WITH GUARDRAILS / REJECT AND PIVOT verdict with evidence. 
产出：带有证据的通过/带条件通过/拒绝并转向 结论。

**Reference / 参考**: `references/idea-evaluation.md`

### 8. `figure-design` — Figure Design Advisor / 图表设计顾问

**Trigger / 触发**: `/hbe-academic figure-design`

Design guidance for three load-bearing figures: Motivated Example, Solution Overview, Experimental Results. 
三张承重图设计指导：动机示例图、方案总览图、实验结果图。

**Output / 输出**: Per-figure design principles, anti-patterns, tool recommendations, TikZ templates. 
产出：每张图的设计原则、反模式、工具推荐、TikZ 模板。

**Reference / 参考**: `references/figure-design-guide.md`

### 9. `de-aigc` — De-AIGC Review / 降 AIGC 审查

**Trigger / 触发**: `/hbe-academic de-aigc`

Five-dimension assessment and rewrite guidance to reduce AI detection rates in academic writing (Chinese and English). 
五维度评估和改写指导，降低学术论文 AI 检测率（中英文）。

**Output / 输出**: Pattern detection report, five-dimension scores, section-specific rewrite suggestions. 
产出：模式检测报告、五维度评分、分章节改写建议。

**Reference / 参考**: `references/de-aigc-guide.md`

### 10. `causal` — Causal Inference / 因果推断

**Trigger / 触发**: `/hbe-academic causal`

Causal inference method selection and analysis pipeline (DID/IV/RDD/PSM/SCM/DML). Integrates with StatsPAI (900+ functions). 
因果推断方法选择和分析流水线（DID/IV/RDD/PSM/SCM/DML）。集 StatsPAI（900+ 函数）。

**Output / 输出**: Method recommendation, diagnostic tests checklist, robustness battery, publication-ready output. 
产出：方法推荐、诊断检验清单、稳健性检验组合、发表级输出。

**Reference / 参考**: `references/causal-inference-guide.md`

### 11. `template` — Template Management / 模板管理

**Trigger / 触发**: `/hbe-academic template <venue>`

Copies the appropriate template to the working directory / 将对应模板复制到工作目录。

**Available Templates / 可用模板**:

| Venue 会议/期刊 | Type 类型 | Style 样式 | Page Limit 页数限制 |
|-------|------|-------|------------|
| NeurIPS | Conference 顶会 | neurips.sty | 9 + appendix 附录 |
| ICML | Conference 顶会 | icml2026.sty | 8 + appendix 附录 |
| ICLR | Conference 顶会 | iclr2026_conference.sty | 9 + appendix 附录 |
| ACL/EMNLP | Conference 顶会 | acl.sty | 8 + appendix 附录 |
| AAAI | Conference 顶会 | aaai2026.sty | 8 |
| IEEE (Trans/Conf) | Journal/Conf 期刊/会议 | IEEEtran.cls | varies 不限 |
| Springer (LNCS) | Conference 会议 | llncs.cls | 12-15 |
| Elsevier | Journal 期刊 | elsarticle.cls | varies 不限 |
| ACM | Conference 顶会 | acmart.cls | 10-12 |
| APS (Phys Rev) | Journal 期刊 | revtex4-2.cls | varies 不限 |
| Chinese Thesis 中文学位论文 | Thesis 学位论文 | ctexbook | varies 不限 |
| Beamer Slides 学术幻灯片 | Presentation 演示 | beamer.cls | slides 页数 |

**Reference / 参考**: `references/journal-templates-guide.md`

### 12. `databases` — Scientific Database Search / 科学数据库检索

**Trigger / 触发**: `/hbe-academic databases`

Unified search across 28+ scientific databases via MCP servers (arXiv, PubMed, OpenAlex, Semantic Scholar, FRED, ADS, etc.). Discipline-specific search strategies for CS, Medicine, Social Science, Physics, Economics.
通过 MCP 服务器统一检索 28+ 科学数据库。按学科定制搜索策略。

**Output / 产出**: Search results, BibTeX entries, citation graphs, deduplicated reference lists.
**Reference / 参考**: `references/scientific-databases-guide.md`

### 13. `integrity` — Research Integrity Check / 研究诚信检查

**Trigger / 触发**: `/hbe-academic integrity`

Four-layer verification: citation integrity (5-step), fact-checking protocol, methodology audit, cross-discipline compliance. Includes hallucination detection and plagiarism prevention.
四层验证：引文诚信、事实核查、方法论审计、跨学科合规。含幻觉检测和抄袭预防。

**Output / 产出**: Verification report with pass/fail per layer, actionable fixes.
**Reference / 参考**: `references/research-integrity-guide.md`

### 14. `pre-submit` — Pre-Submission Review / 投前五维审查

**Trigger / 触发**: `/hbe-academic pre-submit`

Five-dimension pre-submission quality review: Contribution, Technical Soundness, Writing, Experimental Rigor, Ethics. Scoring rubric (1-5 per dimension, ≥3.5 average to pass).
五维度投前质量审查：贡献、技术可靠性、写作、实验严谨性、伦理。每维度1-5分，均分≥3.5通过。

**Output / 产出**: Structured review report with scores, top-3 issues, pass/conditional/reject verdict.
**Reference / 参考**: `references/pre-submission-review.md`

### 15. `benchmark` — Benchmark Paper Writing / 基准论文写作

**Trigger / 触发**: `/hbe-academic benchmark`

Six-stage benchmark paper workflow: Scope → Data Collection → Metric Design → Baseline Selection → Analysis Framework → Writing.
六阶段基准论文工作流：范围→数据收集→指标设计→基线选择→分析框架→写作。

**Output / 产出**: Benchmark paper draft, dataset statistics, results tables, analysis framework.
**Reference / 参考**: `references/benchmark-paper-template.md`

### 16. `reproduce` — Paper Reproduction / 论文复现

**Trigger / 触发**: `/hbe-academic reproduce`

Six-phase reproduction: Paper Parsing → Implementation → Component Testing → Debugging → Sensitivity Analysis → Documentation.
六阶段复现：论文解析→实现→组件测试→调试→敏感性分析→文档化。

**Output / 产出**: Reproduction report, comparison table (paper vs. yours), sensitivity analysis.
**Reference / 参考**: `references/paper-reproduction-guide.md`

### 17. `vibe` — AI Collaboration Rules / AI 协作研究

**Trigger / 触发**: `/hbe-academic vibe`

Human-AI collaboration best practices: Vibe Coding (specify→verify→test), Vibe Writing (outline→expand→rewrite→polish), Vibe Figures (design→render→review).
人机协作最佳实践：Vibe Coding、Vibe Writing、Vibe Figures。含协作光谱和反模式。

**Output / 产出**: Collaboration workflow, anti-pattern warnings, quality checklist.
**Reference / 参考**: `references/vibe-research-workflow.md`
### 18. `deep-read` — Deep Paper Reading / 论文精读

**Trigger / 触发**: `/hbe-academic deep-read`

Four-pass systematic single-paper analysis: Bird's Eye (5 min) → Structural Decomposition (30-60 min) → Critical Analysis (60-120 min) → Internalization (30-60 min). Includes assumption audit, claim-evidence gap analysis, and one-page summary template.
四遍系统化单篇论文分析：全景扫描→结构拆解→批判分析→内化吸收。含假设审计、论点-证据差距分析、一页纸总结模板。

**Output / 产出**: Structured paper notes, critical analysis report, connection map to your work, one-page summary.
**Reference / 参考**: `references/deep-reading-guide.md`

### 19. `data` — Research Data Processing / 研究数据处理

**Trigger / 触发**: `/hbe-academic data`

Seven-stage data pipeline: Acquisition → Audit → Cleaning → Feature Engineering → EDA → Splitting & Versioning → Readiness Check. Cross-discipline patterns for CS, Medicine, Social Science, Economics, Physics.
七阶段数据流水线：获取→审计→清洗→特征工程→探索分析→划分与版本管理→就绪检查。覆盖CS、医学、社科、经济、物理。

**Output / 产出**: Cleaned dataset with provenance, audit report, EDA visualizations, split metadata.
**Reference / 参考**: `references/data-processing-guide.md`

### 20. `tools` — Tool Registry & Recommendation / 工具注册与推荐

**Trigger / 触发**: `/hbe-academic tools`

Curated scientific tool recommendations mapped to research stages and disciplines. Decision tree for tool selection: data acquisition → processing → EDA → modeling → visualization → writing. Covers 60+ tools across CS, biology, chemistry, medicine, physics, economics, social science.
精选科研工具推荐，按研究阶段和学科映射。工具选择决策树：数据获取→处理→探索→建模→可视化→写作。覆盖 60+ 工具。

**Output / 产出**: Tool recommendation for your specific stage + discipline + task.
**Reference / 参考**: `references/tool-registry.md`

### 21. `hypothesis` — Hypothesis Generation & Critical Thinking / 假设生成与批判性思维

**Trigger / 触发**: `/hbe-academic hypothesis`

Structured hypothesis generation from research gaps: identify assumptions, formulate testable hypotheses (H1, H2, H3), design falsification criteria, and evaluate hypothesis strength. Applies scientific critical thinking framework to avoid common reasoning fallacies.
从研究空白出发的结构化假设生成：识别假设、形成可检验假说、设计证伪标准、评估假设强度。应用科学批判性思维框架避免常见推理谬误。

**Output / 产出**: Hypothesis table (H# | Statement | Test | Falsification Criterion | Strength), reasoning chain validation report.
**Reference / 参考**: `references/hypothesis-generation-guide.md`

### 22. `stat-analysis` — Statistical Analysis / 统计分析

**Trigger / 触发**: `/hbe-academic stat-analysis`

Statistical analysis method selection and execution: hypothesis testing, effect sizes, confidence intervals, multiple comparison correction, power analysis. Integrates Python (scipy/statsmodels), R, and Stata tool recommendations.
统计分析方法选择与执行：假设检验、效应量、置信区间、多重比较校正、功效分析。集成 Python/R/Stata 工具推荐。

**Output / 产出**: Analysis plan (test selection rationale), execution code, results table with effect sizes and CIs.
**Reference / 参考**: `references/statistical-analysis-guide.md`

### 23. `tool-deep` — Per-Package Deep Dive / 单包深度指南

**Trigger / 触发**: `/hbe-academic tool-deep <package-name>`

In-depth usage guide for a specific research package: installation, core APIs, academic workflows, best practices, common pitfalls, and integration with the HBE pipeline. Covers 140+ packages across CS/ML, Biology, Chemistry, Physics, Engineering, Social Science, and more.
单个研究包的深度使用指南：安装、核心 API、学术工作流、最佳实践、常见陷阱、与 HBE 流水线的集成。覆盖 140+ 跨学科包。

**Output / 产出**: Package-specific guide with code examples, academic workflow templates, and discipline-specific tips.
**Reference / 参考**: `references/tools/<package-name>.md`, `references/tool-registry.md`

## Citation Management / 引文管理

### BibTeX Workflow / BibTeX 工作流

```
Search 搜索 (arXiv/Semantic Scholar)
    ↓
Fetch metadata 获取元数据 (DOI/title → BibTeX)
    ↓
Validate 验证 (required fields, consistent keys / 必填字段、一致的键名)
    ↓
Organize 组织 (references.bib, one entry per paper / 每篇论文一条记录)
    ↓
Cite 引用 (\cite{} / \parencite{})
```

### Citation Verification / 引文验证 (5-step mandatory process / 5 步强制流程)

1. **Existence check / 存在性检查**: Does the cited paper exist? / 引用的论文是否存在？
2. **Claim accuracy / 准确性**: Does the paper actually support the claim? / 论文是否确实支持该论点？
3. **Metadata correctness / 元数据正确性**: Are authors, year, venue correct? / 作者、年份、会议是否正确？
4. **BibTeX validity / BibTeX 有效性**: Does the entry compile without errors? / 条目是否能无错编译？
5. **Consistency / 一致性**: Is the citation key used consistently? / 引用键名是否一致使用？

## Quality Gate System / 质量关卡系统

### Gate 1: Structure Check / 结构检查 (after outline / 完成大纲后)
- All required sections present / 所有必需章节齐全
- Logical flow between sections / 章节间逻辑连贯
- Claims map to experiments / 论点映射到实验

### Gate 2: Writing Quality / 写作质量 (after first draft / 完成初稿后)
- 7-dimension reviewer simulation / 7 维度审稿人模拟：
  1. Novelty & contribution / 新颖性与贡献
  2. Technical soundness / 技术可靠性
  3. Clarity & presentation / 清晰度与呈现
  4. Experimental rigor / 实验严谨性
  5. Related work coverage / 相关工作覆盖度
  6. Reproducibility / 可复现性
  7. Significance & impact / 重要性与影响力
- Each dimension scored 1-5, overall ≥ 3.5 to pass / 每维度 1-5 分，均分 ≥ 3.5 通过

### Gate 3: Format Compliance / 格式合规 (before submission / 提交前)
- Page count within limit / 页数在限制内
- All fonts/sizes match template requirements / 字体/字号符合模板要求
- Figures/tables properly formatted / 图表格式正确
- Bibliography style correct / 参考文献样式正确
- Anonymization complete (if blind review) / 匿名化完成（如为盲审）
- Supplementary material organized / 补充材料组织完整

## LaTeX Best Practices / LaTeX 最佳实践

### Package Selection by Need / 按需选包

| Need 需求 | Package 包 | Notes 说明 |
|------|---------|-------|
| Math 数学 | amsmath, amssymb, mathtools | Standard 标准 |
| Algorithms 算法 | algorithm2e | Preferred 首选 |
| Figures 图片 | graphicx, subcaption | Use vector formats 使用矢量格式 |
| Tables 表格 | booktabs | No vertical lines 无竖线 |
| Plots 绘图 | pgfplots, tikz | Consistent style 风格统一 |
| Code 代码 | listings or minted | minted needs --shell-escape |
| Cross-refs 交叉引用 | cleveref | Load after hyperref 在 hyperref 之后加载 |
| Typography 排版 | microtype | Always use 始终使用 |
| Chinese 中文 | ctex + xeCJK | Must use xelatex 必须用 xelatex |
| Bib style 参考文献样式 | natbib or biblatex | Per venue requirement 按会议要求 |

## Integration / 集成

This skill pack integrates with / 本技能包集成了:
- **arXiv skill** (`~/.hermes/skills/research/arxiv/`) — enhanced paper search / 增强论文搜索
- **llm-wiki skill** (`~/.hermes/skills/research/llm-wiki/`) — knowledge base management / 知识库管理
- **research-paper-writing skill** (`~/.hermes/skills/research/research-paper-writing/`) — detailed 8-phase pipeline / 详细 8 阶段流程
- **Overleaf** — cloud LaTeX editing via API / 通过 API 的云端 LaTeX 编辑
- **Zotero** — reference management / 参考文献管理
- **[Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills)** — Idea evaluation, Intro six-paragraph model, figure design, pre-submission review / 构思评估、Intro六段式、图表设计、投前审查
- **[Awesome-Agent-Skills](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research)** — StatsPAI causal inference, De-AIGC skills, empirical analysis pipeline / StatsPAI 因果推断、降AIGC技能、实证分析流水线

## Output / 输出

### Paper Project Structure / 论文项目结构
```
<project>/
├── main.tex            # Main document / 主文档
├── references.bib      # Bibliography / 参考文献
├── sections/           # Paper sections / 论文章节
│   ├── abstract.tex
│   ├── introduction.tex
│   ├── related_work.tex
│   ├── method.tex
│   ├── experiments.tex
│   ├── results.tex
│   └── conclusion.tex
├── figures/            # Figures (PDF preferred / 推荐 PDF 格式)
├── code/               # Experiment code / 实验代码
│   ├── train.py        # Training script / 训练脚本
│   ├── evaluate.py     # Evaluation script / 评估脚本
│   ├── models/         # Model definitions / 模型定义
│   ├── data/           # Data loading & processing / 数据加载与处理
│   └── utils.py        # Shared utilities / 公共工具
├── configs/            # Experiment configurations / 实验配置
│   └── default.yaml    # Default hyperparameters / 默认超参数
├── data/               # Data directory (git-ignored) / 数据目录（git 忽略）
│   ├── raw/            # Raw data with provenance / 原始数据（含来源）
│   ├── processed/      # Cleaned & split data / 清洗后数据
│   └── README.md       # Data source & license / 数据来源与许可
├── results/            # Experiment outputs / 实验输出
│   ├── metrics.json    # Aggregated metrics / 聚合指标
│   └── checkpoints/    # Model checkpoints / 模型检查点
├── logs/               # Training logs / 训练日志
├── Makefile            # Compilation automation / 编译自动化
└── .latexmkrc          # latexmk configuration / latexmk 配置
```

## References / 参考文献

See `references/` directory for detailed guides / 查看 `references/` 目录获取详细指南：

### Writing & Style / 写作与风格
- `writing-guide.md` — Academic writing principles (Gopen & Swan, Perez, Lipton) / 学术写作原则
- `de-aigc-guide.md` — De-AIGC detection + academic voice preservation / 降AIGC检测 + 学术声音保持
- `vibe-research-workflow.md` — Human-AI collaboration rules (Vibe Coding/Writing/Figures) / AI协作研究工作流

### Literature & Citations / 文献与引文
- `citation-workflow.md` — Complete citation lifecycle (search→fetch→validate→organize→cite→verify) with Zotero / 完整引文生命周期含Zotero集成
- `scientific-databases-guide.md` — 28+ scientific databases via MCP / 28+ 科学数据库MCP集成
- `systematic-review-methodology.md` — PRISMA 2020 systematic review + meta-analysis + GRADE / PRISMA系统综述+Meta分析+GRADE
- `deep-reading-guide.md` — Four-pass deep paper reading (bird's eye → decompose → critique → internalize) / 四遍论文精读方法论

### Research Planning / 研究规划
- `idea-evaluation.md` — Idea evaluation + Intro six-paragraph model / 构思评估 + Intro六段式模型
- `hypothesis-generation-guide.md` — Hypothesis generation, falsification criteria, critical thinking fallacies / 假设生成、证伪标准、批判性思维谬误
- `benchmark-paper-template.md` — Benchmark paper 6-stage workflow / 基准论文六阶段工作流
- `data-processing-guide.md` — 7-stage data pipeline (acquire→audit→clean→engineer→EDA→split→ready) / 七阶段数据流水线
- `statistical-analysis-guide.md` — Test selection, effect sizes, power analysis, Python/R/Stata / 统计方法选择、效应量、功效分析、Python/R/Stata
- `experiment-design.md` — (in `workflows/`) Experiment design methodology / 实验设计方法论

### Quality & Integrity / 质量与诚信
- `research-integrity-guide.md` — Fact-check, hallucination detection, methodology audit / 事实核查、幻觉检测、方法论审计
- `pre-submission-review.md` — 5-dimension pre-submission review / 投前五维审查
- `paper-reproduction-guide.md` — 6-phase reproduction methodology / 六阶段复现方法论

### Figures & Presentation / 图表与呈现
- `figure-design-guide.md` — Scientific figure design (3 load-bearing figures) / 科研作图设计方法论

### Domain Methods / 领域方法
- `causal-inference-guide.md` — Causal inference methods (DID/IV/RDD/PSM/SCM/DML) + StatsPAI / 因果推断方法 + StatsPAI

### Environment & Templates / 环境与模板
- `latex-environment.md` — TeXLive setup, compilation engines, package troubleshooting / TeXLive安装、编译引擎、包排错
- `journal-templates-guide.md` — 12+ venue formatting rules + writing style + blind review checklist / 12+会议排版+写作风格+盲审检查

### Tools / 工具
- `tool-registry.md` — 60+ curated tools mapped to stages & disciplines (acquisition→processing→modeling→visualization→writing) / 精选工具注册表
