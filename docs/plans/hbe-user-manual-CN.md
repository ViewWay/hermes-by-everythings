# HBE 学术研究 — 使用手册

> **产品**: Hermes by Everything's — 学术研究技能包
> **版本**: 2.0.0 | **日期**: 2026-05-05

---

## 快速开始

### 安装

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/hermes-by-everythings.git
cd hermes-by-everythings

# 2. 软链接到 Claude Code 技能目录
ln -s $(pwd)/skills/academic-research ~/.claude/skills/academic-research

# 3. 验证安装
# 在 Claude Code 中，提及研究相关关键词时技能会自动加载
```

### 首次使用

```
你: 我需要写一篇关于 transformer 注意力机制的研究论文。

Claude: [自动加载 academic-research 技能]
我来帮你写研究论文，使用论文写作工作流...
```

---

## 1. 概览

HBE 学术研究提供 **23 个子命令**，覆盖完整学术研究生命周期：

```
构想 → 文献综述 → 实验 → 论文 → 审查 → 反驳 → 投稿
 |        |         |       |       |       |
idea-eval lit-review experiment paper pre-submit rebuttal
hypothesis deep-read benchmark  compile integrity
           databases causal     template de-aigc
           tools     data
           stat-analysis
```

### 组件概览

| 组件 | 数量 | 说明 |
|---|---|---|
| 工具参考 | 150 | 科学 Python 包深度指南 |
| 参考指南 | 20 | 方法论指南（写作、统计、因果、数据库等） |
| 工作流 | 5 | 端到端研究工作流 |
| LaTeX 模板 | 12 | 会议/期刊/学位论文模板 |
| 脚本 | 3 | 编译、环境检查、arXiv 搜索 |

---

## 2. 命令参考

### 研究规划

| 命令 | 功能 | 示例提示词 |
|---|---|---|
| `idea-eval` | 研究构想评估（5 维度） | "评估我的构想：用 GNN 做药物-靶点相互作用" |
| `hypothesis` | 假设生成、批判性思维 | "为 CRISPR 脱靶效应生成假设" |
| `deep-read` | 论文精读方法 | "精读 Attention Is All You Need" |
| `vibe` | AI 协作研究规则 | "设置 AI 协作指南" |

### 文献与检索

| 命令 | 功能 | 示例提示词 |
|---|---|---|
| `lit-review` | 结构化文献综述（PRISMA） | "开始关于因果推断的文献综述" |
| `databases` | 搜索 50+ 科学数据库 | "在 PubMed 搜索 BRCA1 变异研究" |
| `tools` | 按任务推荐工具 | "单细胞 RNA-seq 用什么工具？" |
| `tool-deep` | 单包深度指南 | "深度介绍 scanpy" |

### 数据与实验

| 命令 | 功能 | 示例提示词 |
|---|---|---|
| `data` | 7 阶段数据处理流水线 | "清洗处理我的临床试验数据" |
| `experiment` | 实验设计 | "设计实验验证我的方法优于 X" |
| `benchmark` | ML 基准测试工作流 | "设置 GLUE 基准对比" |
| `stat-analysis` | 统计分析指南 | "比较两个分类器用什么检验？" |
| `causal` | 8 步因果推断 | "对我的面板数据做 DID 分析" |

### 写作与出版

| 命令 | 功能 | 示例提示词 |
|---|---|---|
| `paper` | 论文写作（3 道质量关卡） | "写一篇 NeurIPS 论文关于注意力方法" |
| `template` | 部署 LaTeX 模板 | "设置 ICML 论文模板" |
| `compile` | LaTeX 编译（自动修错） | "编译我的论文并修错" |
| `figure-design` | 出版图表设计顾问 | "设计模型性能对比图" |
| `de-aigc` | 降 AIGC 审查 | "检查我的引言是否有 AIGC 痕迹" |

### 审查与投稿

| 命令 | 功能 | 示例提示词 |
|---|---|---|
| `rebuttal` | 反驳信写作 | "回复审稿人 2 的意见" |
| `pre-submit` | 投前五维审查 | "做一次完整的投前审查" |
| `integrity` | 研究诚信检查 | "检查论文是否存在诚信问题" |
| `reproduce` | 论文复现 | "复现 Smith et al. 2024 的结果" |
| `check-env` | 环境验证 | "我的环境准备好了吗？" |

---

## 3. 工作流指南

### 3.1 写研究论文（完整流程）

```
1. idea-eval       → 评估新颖性、可行性、影响力
2. hypothesis      → 生成可检验假设
3. lit-review      → 结构化搜索（PRISMA）
4. databases       → 搜索 50+ 数据库获取参考文献
5. deep-read       → 精读关键论文
6. experiment      → 设计：论点 → 基线 → 指标
7. template        → 部署会议/期刊 LaTeX 模板
8. paper           → 写作（3 道关卡）：
     关卡 1：结构检查（大纲完成后）
     关卡 2：写作质量（初稿完成后）
     关卡 3：格式合规（投稿前）
9. figure-design   → 设计出版级图表
10. de-aigc        → 检查 AI 检测风险
11. integrity      → 研究诚信检查
12. pre-submit     → 五维审查
13. compile        → LaTeX 编译
14. [投稿]
15. rebuttal       → 回复审稿人意见
```

### 3.2 因果推断研究

```
1. data            → 清洗、插补、缩尾
2. causal          → 8 步流水线：
   第 1 步：变量构建（对数/IHS、面板滞后/领先）
   第 2 步：平衡表（SMD）
   第 3 步：诊断检验（7 类）
   第 4 步：选择方法：DID / IV / RDD / PSM / DML / CF
   第 5 步：稳健性（6 级设定阶梯、聚类、安慰剂）
   第 6 步：异质性分析
   第 7 步：中介分析
   第 8 步：出版输出（stargazer 表、系数图、love plot）
3. paper           → 撰写论文
4. compile         → 生成 PDF
```

### 3.3 ML 基准测试

```
1. benchmark       → 配置 BenchmarkConfig（任务、数据集、指标）
2. benchmark       → 多种子训练
3. benchmark       → 统计显著性（t 检验、Bootstrap、贝叶斯）
4. benchmark       → 消融实验
5. benchmark       → 缩放实验
6. benchmark       → 生成 LaTeX 结果表
7. paper           → 撰写基准论文
```

### 3.4 Zotero 文献管理

```
1. 配置：获取 API 密钥 → 设置环境变量
2. 组织：创建项目集合（待读 → 在读 → 已读 → 已引用）
3. 搜索：query_db("literature", "主题") → 导入 Zotero
4. 写作：导出集合到 references.bib → LaTeX 中引用
5. 同步：同步 Zotero → BibTeX（添加新条目、删除过期条目）
6. 反驳：搜索 Zotero 回应审稿人 → 生成引文段落
```

---

## 4. 数据库检索

### 统一查询

```python
# 按类别搜索
query_db("literature", "transformer attention")
query_db("life_sci", "BRCA1", databases=["pubmed", "uniprot"])

# 跨类别搜索
search_all("CRISPR 基因编辑")

# 导出 BibTeX
search_to_bibtex(results)
```

### 50+ 可用数据库

| 类别 | 数据库 |
|---|---|
| **文献** | arXiv、Semantic Scholar、OpenAlex、CrossRef、DBLP、Papers With Code、CORE |
| **生命科学** | PubMed、bioRxiv、UniProt、PDB、GenBank、GEO、Ensembl |
| **物理** | NASA ADS、INSPIRE-HEP、ChemRxiv |
| **社会科学** | NBER、FRED、World Bank、RePEc |
| **工程** | Google Patents |
| **数据代码** | Zenodo、Figshare、OSF、HuggingFace Datasets |
| **临床** | ClinicalTrials.gov、PubMed Central |

### API 密钥（可选 — 大部分无需密钥）

```bash
export FRED_API_KEY="..."        # fred.stlouisfed.org 免费获取
export ADS_API_TOKEN="..."       # ui.adsabs.harvard.edu 免费获取
export ZOTERO_LIBRARY_ID="..."   # zotero.org
export ZOTERO_API_KEY="..."      # zotero.org/settings/keys
```

---

## 5. LaTeX 模板

| 模板 | 会议/期刊 | 类型 |
|---|---|---|
| `neurips` | NeurIPS | ML/AI 会议 |
| `icml` | ICML | ML 会议 |
| `iclr` | ICLR | 表示学习 |
| `aaai` | AAAI | AI 会议 |
| `ieee` | IEEE | 工程 |
| `acl` | ACL | NLP 会议 |
| `acm` | ACM | CS 会议 |
| `aps` | APS | 物理期刊 |
| `springer` | Springer | 多学科期刊 |
| `elsevier` | Elsevier | 多学科期刊 |
| `thesis-cn` | GB/T 7714 | 中文硕博论文 |
| `beamer` | — | 演示文稿 |

### 使用

```
你: 设置一个 ICML 论文模板。
Claude: [部署模板，创建项目结构]
./paper/
├── main.tex
├── references.bib
├── figures/
└── sections/
```

### 编译

```bash
bash scripts/compile.sh templates/icml/main.tex
```

---

## 6. 按领域工具覆盖

| 领域 | 数量 | 核心包 |
|---|---|---|
| 生物学 | 20 | biopython、scanpy、pysam、anndata、cellrank、scikit-bio、qiime2 |
| ML/AI | 18 | pytorch、jax、transformers、sklearn、wandb、ray、modal |
| 化学 | 11 | rdkit、openbabel、medchem、mordred、molfeat、openmm |
| 物理 | 10 | numpy、scipy、sympy、fenics、cirq、pennylane、qutip |
| 研究流程 | 9 | pyzotero、bibtexparser、matplotlib、plotly |
| 数据 I/O | 8 | pandas、polars、pyarrow、h5py、zarr |
| 社科 | 7 | statsmodels、linearmodels、econml、geopandas |
| 医学 | 7 | monai、torchio、lifelines、nibabel、pydicom |
| 经济学 | 6 | linearmodels、statsmodels、arch、stargazer |
| 量子 | 3 | cirq、pennylane、qutip |

工具查找：
```
你: 单细胞 RNA-seq 用什么工具？
Claude: scanpy（主分析）、anndata（数据格式）、cellrank（轨迹推断）
→ 深度指南：references/tools/scanpy.md
```

---

## 7. 脚本工具

```bash
# 检查环境
bash scripts/check-environment.sh

# 编译 LaTeX
bash scripts/compile.sh path/to/main.tex

# 搜索 arXiv
python3 scripts/search_arxiv.py "关键词" --max 20 --bibtex
```

---

## 8. 使用技巧与常见问题

### 使用技巧

1. 开始前先用 `check-env` 验证环境。
2. 系统性文献综述用 `lit-review` — 遵循 PRISMA 方法论。
3. 文献搜索用 `databases` — 50+ 数据库，一个函数搞定。
4. 论文写作用 `paper` 并走完 3 道关卡 — 结构、质量、格式。
5. 因果问题用 `causal` — 6 种方法配稳健性检验。
6. ML 论文用 `benchmark` — 含统计显著性检验。
7. 设置 Zotero 管理文献 — 自动同步 BibTeX。
8. 投稿前用 `de-aigc` — 检查 AI 检测风险。

### 常见问题

**问：需要安装全部 150 个工具吗？**
答：不需要。工具参考是文档，只安装你需要的即可。

**问：哪些数据库需要 API 密钥？**
答：大部分免费无需密钥。FRED、NASA ADS、Zotero 需要免费密钥。IEEE/ACM 需要机构订阅。

**问：能用于中文毕业论文吗？**
答：可以。`thesis-cn` 模板遵循 GB/T 7714 引文格式和中国学术规范。

**问：怎么添加新工具参考？**
答：复制 `references/tools/_TEMPLATE.md`，填写全部 8 节。

**问：与 HBE 基础设施兼容吗？**
答：完全兼容。Ralph 循环、Orchestrator、Memory、上下文优化均可用。

---

## 9. 高级：HBE 基础设施

```
HBE 核心系统
├── Ralph 循环     → 大型任务自主执行
├── Orchestrator   → 多 Agent 委派
├── Memory 系统    → 跨会话持久学习
├── 上下文优化     → 三层加载（节省 50% token）
└── 交互引擎       → 确认/问答/渐进执行模式

学术研究技能包
├── SKILL.md         → 23 子命令（入口）
├── references/      → 工具(150) + 指南(20)
├── workflows/       → 端到端流程(5)
├── templates/       → LaTeX 文档(12)
└── scripts/         → 工具自动化(3)
```

---

*使用手册 v1.0 | HBE 学术研究 v2.0.0 | 2026-05-05*
