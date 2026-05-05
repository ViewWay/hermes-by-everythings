# HBE 学术研究 — 需求规格说明书

> **产品**: Hermes by Everything's — 学术研究技能包
> **版本**: 2.0.0 | **日期**: 2026-05-05
> **状态**: 已发布 | **文档版本**: 1.0

---

## 1. 产品概述

### 1.1 产品定义

HBE 学术研究是面向 Claude Code 的跨学科学术研究技能包，提供 150 个工具参考、20 个方法论指南、5 个工作流和 12 个 LaTeX 模板，覆盖 19 个学科。它是 Hermes by Everything's (HBE) 生态系统的组成部分。

### 1.2 目标用户

| 用户画像 | 主要需求 | 使用模式 |
|---|---|---|
| 研究生（中/英） | 论文写作、文献综述、学位论文 | 日常高频使用，全工作流 |
| 博士后 | 实验设计、基准测试、可复现性 | 按项目使用 |
| 导师/教授 | 课题申请、构想评估、研究诚信 | 定期使用 |
| 工业研究员 | ML 基准测试、数据处理、因果推断 | 按项目使用 |
| 本科生（中文） | 毕业论文模板、引文、基础工具 | 轻度使用，论文聚焦 |

### 1.3 设计原则

1. **跨学科默认** — 适用于生物、物理、经济、CS、化学等所有领域
2. **中英双语** — 全部文档中英双语
3. **可执行代码** — 每个代码示例可独立运行
4. **一级品质** — 每个工具文件 >= 90 行，8 节结构
5. **基础设施支撑** — 利用 HBE 的 Ralph、Orchestrator、Memory 系统

---

## 2. 功能需求

### 2.1 核心组件

| 编号 | 需求 | 优先级 | 状态 |
|---|---|---|---|
| FR-01 | **工具参考**：150 个深度工具指南，统一 8 节结构 | P0 | 已完成 |
| FR-02 | **参考指南**：20 个方法论指南 | P0 | 已完成 |
| FR-03 | **工作流**：5 个结构化工作流 | P0 | 已完成 |
| FR-04 | **LaTeX 模板**：12 个会议/期刊模板 | P0 | 已完成 |
| FR-05 | **脚本**：3 个工具脚本 | P1 | 已完成 |

### 2.2 子命令（23 个）

| # | 命令 | 功能 |
|---|---|---|
| 1 | `check-env` | 检测 LaTeX、Python、工具安装 |
| 2 | `lit-review` | 结构化文献综述（PRISMA） |
| 3 | `paper` | 全流程论文写作（3 道质量关卡） |
| 4 | `experiment` | 实验设计（论点提取） |
| 5 | `rebuttal` | 反驳信写作（Zotero 搜索） |
| 6 | `compile` | LaTeX 编译（自动修错） |
| 7 | `idea-eval` | 研究构想评估（5 维度） |
| 8 | `figure-design` | 出版图表设计顾问 |
| 9 | `de-aigc` | 降 AIGC 审查 |
| 10 | `causal` | 8 步因果推断流水线 |
| 11 | `template` | 模板管理与部署 |
| 12 | `databases` | 统一 50+ 数据库检索 |
| 13 | `integrity` | 研究诚信检查 |
| 14 | `pre-submit` | 投前五维审查 |
| 15 | `benchmark` | 基准论文写作（6 阶段） |
| 16 | `reproduce` | 论文复现工作流 |
| 17 | `vibe` | AI 协作研究规则 |
| 18 | `deep-read` | 论文精读方法 |
| 19 | `data` | 研究数据处理（7 阶段流水线） |
| 20 | `tools` | 工具注册与推荐 |
| 21 | `hypothesis` | 假设生成与批判性思维 |
| 22 | `stat-analysis` | 统计分析指南 |
| 23 | `tool-deep` | 单包深度指南 |

### 2.3 核心功能规格

#### FR-10：统一数据库访问

单一 `query_db(类别, 关键词)` 函数搜索 7 大类 50+ 数据库，自动按 DOI 去重。

- **类别**：文献(7 库)、生命科学(7)、物理科学(3)、社科(4)、工程(1)、数据代码(4)、临床(2)
- **输出字段**：标题、作者、年份、DOI、URL、摘要、来源
- **跨类搜索**：`search_all(关键词)` 同时查询所有类别
- **BibTeX 导出**：`search_to_bibtex(结果)` 通过 DOI 解析为 BibTeX

#### FR-11：因果推断流水线

8 步流水线，含可运行 Python 代码：
1. 数据清洗（插补、缩尾、异常值）
2. 变量构建（对数/IHS 变换、面板滞后/领先）
3. 描述统计（平衡表、SMD 计算）
4. 诊断检验（7 类）
5. 因果估计（6 种方法：DID、IV、RDD、PSM、DML、因果森林）
6. 稳健性（6 级设定阶梯、多层聚类、安慰剂检验）
7. 深入分析（异质性、中介、剂量反应）
8. 出版输出（stargazer 表、系数图、love plot）

跨学科适配：经济学、政治学、流行病学、教育学、社会学、公共卫生、心理学、环境科学

#### FR-12：ML 基准测试工作流

8 步工作流：
1. 定义任务与指标（BenchmarkConfig）
2. 加载与切分数据（HuggingFace datasets）
3. 建立基线（Papers With Code SOTA）
4. 训练框架（多种子 PyTorch）
5. 评估与指标（分类 + 生成）
6. 统计显著性（配对 t 检验、Wilcoxon、Bootstrap CI、贝叶斯比较）
7. 消融与缩放实验
8. LaTeX 结果表 + matplotlib 对比图

跨领域模板：NLP (GLUE)、CV (ImageNet)、RL (Atari)、LLM (MT-Bench)

#### FR-13：Zotero 集成

5 个模块：
1. 配置 — API 密钥、连接验证
2. 集合管理 — 项目层级、自动标签、条目移动
3. BibTeX 流水线 — 导出、同步、去重
4. 文献综述 — 提取批注、生成阅读清单
5. 反驳 — 搜索审稿人相关文献、生成引文段落

#### FR-14：LaTeX 模板系统

12 个模板：NeurIPS、ICML、ICLR、AAAI、IEEE、ACL、ACM、APS、Springer、Elsevier、中文硕博论文、beamer 演示文稿。每个模板含完整文档结构、会议/期刊格式化、编译说明。

#### FR-15：跨学科覆盖

19 个学科带显式交叉链接：
生物(20)、ML(18)、化学(11)、物理(10)、研究流程(9)、数据(8)、社科(7)、工程(7)、医学(7)、经济(6)、量子(3)、地理(3)、NLP(3)、数学(3)、可视化(3)、优化(3)、仿真(2)、分布式(2)、神经科学(1)

---

## 3. 非功能需求

### 3.1 品质

| 编号 | 需求 | 目标 | 当前值 |
|---|---|---|---|
| NFR-01 | 一级品完整率 | 100% 文件 >= 90 行 | 100%（150/150） |
| NFR-02 | 代码可运行性 | 100% 可独立运行 | 100% |
| NFR-03 | 结构一致性 | 100% 含全部 8 节 | 100% |
| NFR-04 | 双语覆盖率 | 100% 中英双语 | 100% |
| NFR-05 | 文档深度 | 平均 >= 200 行 | 203 行 |

### 3.2 性能

| 编号 | 需求 | 目标 |
|---|---|---|
| NFR-10 | 包大小 | < 2 MB |
| NFR-11 | 技能加载时间 | < 2 秒 |
| NFR-12 | 数据库查询延迟 | < 30 秒/库 |
| NFR-13 | LaTeX 编译 | < 60 秒（20 页） |

### 3.3 兼容性

| 编号 | 需求 | 目标 |
|---|---|---|
| NFR-20 | 平台 | Claude Code CLI、桌面、网页、IDE |
| NFR-21 | 操作系统 | macOS、Linux、Windows |
| NFR-22 | LaTeX | TeX Live 2023+、MiKTeX |
| NFR-23 | Python | 3.9+ |

---

## 4. 架构

### 4.1 目录结构

```
skills/academic-research/
├── _meta.json                  # 包元数据（版本、标签）
├── SKILL.md                    # 主技能文件（23 子命令）
├── README.md                   # 用户文档
├── references/
│   ├── tools/                  # 150 个工具参考文件
│   │   ├── _TEMPLATE.md        # 新工具模板
│   │   └── *.md                # 各工具深度指南
│   ├── causal-inference-guide.md
│   ├── citation-workflow.md
│   ├── scientific-databases-guide.md
│   └── ... (17 个指南)
├── workflows/
│   ├── literature-review.md
│   ├── paper-writing.md
│   ├── experiment-design.md
│   ├── rebuttal.md
│   └── ml-benchmarking.md
├── templates/                  # 12 个 LaTeX 模板
└── scripts/                    # 3 个工具脚本
```

### 4.2 工具文件结构（8 节标准）

```
前置元数据 (YAML): name, description, domain, install
# 标题 — 全称 / 中文名
## 适用场景
## 快速开始
## 核心能力（2-3 节，含可运行代码）
## 常见学术工作流
## 最佳实践
## 常见陷阱
## 与 HBE 集成
## 资源
```

### 4.3 依赖

| 组件 | 依赖 | 用途 |
|---|---|---|
| LaTeX 模板 | pdflatex, biber | 编译 |
| search_arxiv.py | Python 3.9+ | arXiv API |
| 统一数据库查询 | Python 3.9+, urllib | 数据库 API |
| Zotero 集成 | pyzotero | Zotero API |
| 因果推断 | statsmodels, linearmodels, econml | 计量经济学 |
| ML 基准测试 | torch, sklearn, scipy, matplotlib | 训练/评估 |

---

## 5. 追溯矩阵

| 功能 | 需求编号 | 实现文件 |
|---|---|---|
| 150 工具参考 | FR-01 | references/tools/*.md |
| 20 方法论指南 | FR-02 | references/*.md |
| 5 工作流 | FR-03 | workflows/*.md |
| 12 LaTeX 模板 | FR-04 | templates/*/main.tex |
| 23 子命令 | SC-01~23 | SKILL.md |
| 统一数据库查询 | FR-10 | references/scientific-databases-guide.md |
| 因果推断流水线 | FR-11 | references/causal-inference-guide.md |
| ML 基准测试 | FR-12 | workflows/ml-benchmarking.md |
| Zotero 集成 | FR-13 | references/citation-workflow.md |
| 模板系统 | FR-14 | templates/ |
| 跨学科支持 | FR-15 | 150 工具覆盖 19 学科 |

---

## 6. 版本历史

| 版本 | 日期 | 变更 |
|---|---|---|
| 1.0.0 | 2026-05-02 | 初始发布：150 工具、20 指南、4 工作流、12 模板 |
| 1.1.0 | 2026-05-03 | 25 个二级品文件升级为一级品（100% 一级品率） |
| 1.2.0 | 2026-05-04 | 新增 8 步因果推断流水线（172→616 行） |
| 2.0.0 | 2026-05-05 | 新增统一数据库查询（50+ 库）、ML 基准测试工作流、Zotero 集成。总计 39,620 行 |

---

*需求规格说明书 v1.0 | HBE 学术研究 v2.0.0 | 2026-05-05*
