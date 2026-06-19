---
name: hbe-academic
description: 学术研究工作流 / Academic research workflow — 文献综述、论文写作、LaTeX 编译、期刊排版 / Literature review, paper writing, LaTeX compilation, journal formatting
allowed_tools: ["Read", "Write", "Edit", "Bash", "WebSearch", "Agent"]
argument-hint: "[子命令 check-env|lit-review|paper|experiment|rebuttal|compile|template|search]"
skills: academic-research
---

# /hbe-academic

学术研究综合命令 / Comprehensive academic research command for HBE.

## Usage / 用法

```
/hbe-academic <子命令> [选项 / options]
```

## Sub-Commands / 子命令

| Command 命令 | Description 说明 | Example 示例 |
|---------|-------------|---------|
| `check-env` | 检测 LaTeX 环境 / Detect LaTeX env | `/hbe-academic check-env` |
| `lit-review` | 文献综述 / Literature review | `/hbe-academic lit-review --topic "transformer"` |
| `paper` | 写论文 / Write a paper | `/hbe-academic paper --venue neurips` |
| `experiment` | 实验设计 / Design experiments | `/hbe-academic experiment` |
| `rebuttal` | 写 Rebuttal / Write rebuttal | `/hbe-academic rebuttal` |
| `compile` | 编译 LaTeX / Compile LaTeX | `/hbe-academic compile main.tex` |
| `template` | 复制模板 / Copy venue template | `/hbe-academic template neurips` |
| `search` | 搜索 arXiv / Search arXiv | `/hbe-academic search "attention mechanism"` |

## Goal / 目标

Provide end-to-end academic research support from idea to camera-ready submission.
提供从想法到终稿提交的端到端学术研究支持。

## Steps / 步骤

### 1. Parse Sub-Command / 解析子命令
Identify which workflow to execute based on the sub-command.
根据子命令确定执行哪个工作流。

### 2. Load Appropriate Workflow / 加载对应工作流
- `lit-review` → `skills/academic-research/workflows/literature-review.md`
- `paper` → `skills/academic-research/workflows/paper-writing.md`
- `experiment` → `skills/academic-research/workflows/experiment-design.md`
- `rebuttal` → `skills/academic-research/workflows/rebuttal.md`

### 3. Execute Workflow / 执行工作流
Follow the loaded workflow step by step, using / 按步骤执行工作流，使用:
- `scripts/compile.sh` for LaTeX compilation / LaTeX 编译
- `scripts/check-environment.sh` for environment detection / 环境检测
- `scripts/search_arxiv.py` for paper search / 论文搜索
- Templates from `templates/<venue>/` / 模板文件

### 4. Quality Gate / 质量关卡
Apply the 3-gate quality system / 应用三道质量关卡:
- Gate 1: Structure check / 结构检查
- Gate 2: 7-dimension review (if writing) / 7 维度评审（写作时）
- Gate 3: Format compliance (if submitting) / 格式合规（提交前）

### 5. Output Results / 输出结果
Report what was done, files created/modified, and next steps.
报告完成内容、创建/修改的文件、以及下一步。

## Options / 选项

- `--venue <name>`: 目标会议/期刊 (neurips, icml, iclr, acl, aaai, ieee, springer, elsevier, acm, aps, thesis-cn, beamer)
- `--engine <name>`: LaTeX 引擎 (pdflatex, xelatex, lualatex, latexmk)
- `--topic <query>`: 文献综述的研究主题
- `--max <n>`: 搜索结果上限
- `--bibtex`: 包含 BibTeX 输出

## Examples / 示例

```bash
# 检查 LaTeX 安装 / Check LaTeX installation
/hbe-academic check-env

# 写 NeurIPS 论文 / Start a NeurIPS paper
/hbe-academic paper --venue neurips

# 文献综述 / Literature review
/hbe-academic lit-review --topic "large language models"

# 搜索 arXiv / Search arXiv
/hbe-academic search "scaling laws" --max 10 --bibtex

# 用 xelatex 编译 / Compile with xelatex
/hbe-academic compile main.tex --engine xelatex

# 复制 IEEE 模板 / Copy IEEE template
/hbe-academic template ieee
```
