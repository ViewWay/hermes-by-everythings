# Deep Paper Reading Guide / 论文精读方法论

Systematic single-paper deep analysis: extract, decompose, critique, and internalize.
系统化单篇论文深度分析：提取、拆解、批判、内化。

## Why Deep Reading Is Separate from Literature Review / 为什么精读独立于文献综述

```
Literature Review (lit-review):  breadth-first, score-and-rank, "find what matters"
文献综述：广度优先，评分排序，"找到重要的"

Deep Reading (deep-read):        depth-first, decompose-and-critique, "understand everything"
论文精读：深度优先，拆解批判，"理解一切"

Relationship:
  lit-review identifies 10-30 candidate papers
  → deep-read applies to the 3-5 most critical papers
  → the insights feed back into paper writing, experiment design, and positioning
```

## Four-Pass Reading Protocol / 四遍阅读协议

Adapted from Keshav's "How to Read a Paper" (3-pass method) extended with a critique pass.

### Pass 1: Bird's Eye View (5-10 min) / 全景扫描

**Goal**: Decide if this paper deserves Pass 2.
**目标**: 判断是否值得继续读。

| Element | What to Extract |
|---------|----------------|
| Title | What is the paper about? |
| Abstract | What problem, what solution, what result? |
| Introduction (first + last paragraphs) | What gap, what contribution? |
| Section headings | What is the structure? |
| Figures/tables (just look) | What type of work is this? |
| References (scan) | Which community does this belong to? |

**Decision / 决策**: Relevant → Pass 2. Not relevant → file with reason.

### Pass 2: Structural Decomposition (30-60 min) / 结构拆解

**Goal**: Map the paper's argument structure and method.
**目标**: 映射论文的论证结构和方法。

```
Extract into structured notes:
将论文拆解为结构化笔记：

┌─────────────────────────────────────────────────────────┐
│                    Paper Skeleton                        │
│                    论文骨架                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Problem Statement:                                     │
│    • What is the exact problem being solved?            │
│    • Why does it matter? (motivation)                   │
│    • What are the existing limitations?                 │
│                                                         │
│  Proposed Solution:                                     │
│    • Core idea in ONE sentence                          │
│    • Key assumptions                                    │
│    • Method overview (3-5 steps)                        │
│                                                         │
│  Theoretical Grounding (if applicable):                 │
│    • Theorems, lemmas, proofs                           │
│    • Complexity analysis                                │
│    • Assumptions and their justification                │
│                                                         │
│  Experimental Setup:                                    │
│    • Datasets used (name, size, version)                │
│    • Baselines compared                                 │
│    • Metrics used                                       │
│    • Compute resources                                  │
│                                                         │
│  Results:                                               │
│    • Main results table (copy the numbers)              │
│    • Ablation findings                                  │
│    • Qualitative examples                               │
│                                                         │
│  Claims vs. Evidence:                                   │
│    • Claim 1 → Evidence: [section/table]               │
│    • Claim 2 → Evidence: [section/table]               │
│    • Claim 3 → Evidence: [section/table]               │
│                                                         │
│  Limitations (stated):                                  │
│    • What do the authors acknowledge as limits?         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Pass 3: Critical Analysis (60-120 min) / 批判分析

**Goal**: Find what the authors don't say. This is where deep reading differs from superficial reading.
**目标**: 发现作者没说的东西。这是精读与泛读的根本区别。

#### 3a. Assumption Audit / 假设审计

For each assumption (explicit or implicit):

| Assumption | Explicit? | Justified? | Realistic? | Impact if Wrong |
|-----------|-----------|------------|------------|-----------------|
| e.g., "data is i.i.d." | ❌ implicit | ❌ | ❌ in practice | Core claim fails |
| e.g., "linear relationship" | ✅ | ❌ | Context-dependent | Degraded performance |
| ... | | | | |

**Rule**: Every paper has at least one unstated assumption. Find it.

#### 3b. Claim-Evidence Gap Analysis / 论点-证据差距分析

```
For each claim in the paper, ask:
对每一条论点，追问：

1. Is the claim supported by the evidence presented?
   论点是否有证据支持？

2. Is the evidence sufficient? (sample size, statistical significance, generality)
   证据是否充分？（样本量、统计显著性、普适性）

3. Is there alternative evidence that would weaken the claim?
   是否存在削弱该论点的替代证据？

4. Could the same evidence support a different (weaker) claim?
   同一证据是否支持不同的（较弱的）论点？
```

#### 3c. Method Critique / 方法批判

```
□ Are there simpler methods that might achieve similar results?
  是否有更简单的方法能达到类似效果？

□ Are the baselines chosen fairly? (recent enough? same compute budget?)
  基线选择是否公平？（足够新？同等计算预算？）

□ Are the metrics appropriate for the claimed contribution?
  指标是否适合所声称的贡献？

□ Is the evaluation protocol rigorous enough?
  评估协议是否足够严谨？

□ Could the results be an artifact of the experimental setup?
  结果是否可能是实验设置的假象？
```

#### 3d. Hidden Contributions / 隐性贡献

```
Sometimes the real contribution is not what the authors claim:
有时真正的贡献并非作者所声称的：

□ Did they create a useful dataset/resource?
  是否创建了有用的数据集/资源？

□ Did they identify an important failure mode?
  是否识别了重要的失败模式？

□ Did they develop a useful engineering trick?
  是否开发了有用的工程技巧？

□ Did they provide theoretical insight beyond the main result?
  是否在主要结果之外提供了理论洞见？
```

### Pass 4: Internalization (30-60 min) / 内化吸收

**Goal**: Make this paper's knowledge your own. Can you explain it without looking?
**目标**: 把论文知识变成自己的。不看着论文能否讲清楚？

#### 4a. Reconstruct from Memory / 凭记忆复述

```
Without looking at the paper:
不看论文：

1. State the problem in your own words
   用自己的话陈述问题

2. Describe the core idea in ONE sentence
   用一句话描述核心思想

3. Sketch the method pipeline from memory
   凭记忆画出方法流程

4. State the key result with numbers
   用数字陈述关键结果

5. Name the biggest limitation
   说出最大的局限性

If you can't do all 5, go back to Pass 2.
如果做不到全部5项，回到第二遍。
```

#### 4b. Connection Mapping / 关联映射

```
How does this paper connect to YOUR work?
这篇论文如何与你的工作关联？

□ What ideas can you borrow for your project?
  哪些想法可以借鉴到你的项目？

□ What baselines should you compare against?
  哪些基线你应该与之比较？

□ What weaknesses can you address in your work?
  哪些弱点你可以在你的工作中解决？

□ What open questions does this paper raise?
  这篇论文提出了哪些开放性问题？

□ Where does this paper fit in the research landscape?
  这篇论文在研究版图中处于什么位置？
```

#### 4c. One-Page Summary Template / 一页纸总结模板

```markdown
## Paper: [Title]
**Authors**: [Names] | **Venue**: [Conference/Journal] [Year]
**One-line summary**: [Core idea in one sentence]

### Problem
[2-3 sentences describing the exact problem]

### Method
[Key insight + 3-5 step pipeline]

### Key Result
[Main numbers: "Method X achieves Y% on dataset Z, +Δ over baseline"]

### Critical Takeaway
[The one thing you'll remember from this paper in 6 months]

### For My Work
- Borrow: [specific technique/idea]
- Compare: [which baselines]
- Address: [which limitations]
- Open Q: [what to explore next]

### Confidence Rating
[How much do you trust this paper?] 1 (low) — 5 (high)
Reason: [why]
```

## Reading Strategy by Paper Type / 按论文类型选择策略

| Paper Type | Pass 1 | Pass 2 Focus | Pass 3 Focus | Time Budget |
|-----------|--------|-------------|-------------|-------------|
| Empirical/Experimental | 10 min | Results tables, experimental setup | Baseline fairness, metric choice | 2-3 hours |
| Theoretical | 10 min | Theorems, proofs, assumptions | Proof gaps, assumption validity | 4-6 hours |
| Survey/Review | 15 min | Taxonomy, coverage, organization | Missing areas, outdated coverage | 2-3 hours |
| Resource/Dataset | 10 min | Dataset stats, annotation protocol | License, bias, sustainability | 1-2 hours |
| Position/Vision | 5 min | Arguments, evidence chain | Counterarguments, feasibility | 1-2 hours |
| Method Paper | 10 min | Algorithm, complexity, assumptions | Simpler alternatives, edge cases | 3-4 hours |

## Cross-Discipline Adaptation / 跨学科适配

| Discipline | Reading Priority | Unique Critique Points |
|-----------|-----------------|----------------------|
| CS/AI | Method → Experiments → Theory | Code availability, compute reproducibility |
| Medicine | Study design → Statistics → Results | Sample size, confounders, clinical relevance |
| Physics | Theory → Math → Experiments | Approximation validity, experimental uncertainty |
| Social Science | Hypothesis → Data → Analysis | Causal identification, external validity, ethics |
| Economics | Model → Identification → Results | Endogeneity, structural assumptions, policy relevance |
| Humanities | Argument → Evidence → Interpretation | Source quality, theoretical framework, scope |
| Biology | Hypothesis → Protocol → Data → Analysis | Reproducibility, controls, biological plausibility |

## Integration / 集成

- Follows `workflows/literature-review.md` (identifies papers to deep-read)
- Feeds `references/idea-evaluation.md` (understanding landscape for idea assessment)
- Supports `references/paper-reproduction-guide.md` (Pass 2 is prerequisite for reproduction)
- Connects to `workflows/experiment-design.md` (baseline and metric understanding)
- Complements `references/research-integrity-guide.md` (claim-evidence verification)

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| PDF annotation | Zotero | https://zotero.org |
| Paper management | Mendeley / Zotero | free |
| Note-taking | Obsidian / Notion | free tier |
| Citation graph | Connected Papers | https://connectedpapers.com |
| Paper search | Semantic Scholar | API (free) |
| BibTeX extraction | `scripts/search_arxiv.py` | bundled |
