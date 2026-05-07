# Idea Evaluation Methodology / 论文构思评估方法论

Systematic idea evaluation framework before committing months of research effort.
系统性构思评估框架，在投入数月研究精力之前进行全面体检。

> **Source / 来源**: Distilled from [HKUSTDial/Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) — 骆昱宇教授团队十年博导科研经验蒸馏。
> Adapted and integrated for HBE academic-research skill pack.

## Four-Layer Audit / 四层审计流程

Evaluate ideas through four sequential layers. **Order matters** — a high-scoring "Higher" dimension is irrelevant if a fatal flaw exists.
按顺序执行四层检查。**顺序不可调换**——一个七分的"更高"维度在一个致命缺陷面前毫无意义。

### Layer 1: Fatal Flaw Audit / 致命缺陷审计 (Early Gate / 早期闸门)

| Check Item 检查项 | Question 问题 | Severity 严重性 |
|---|---|---|
| Prior Art 已有工作 | Has this exact idea been published in a top venue in the last 2 years? 过去2年顶级会议是否已有完全相同的工作？ | CRITICAL |
| Feasibility 可行性 | Can this be implemented with available resources (data, compute, time)? 能否用现有资源（数据、算力、时间）实现？ | CRITICAL |
| Significance 重要性 | Does this solve a real problem or address a genuine need? 是否解决真实问题或满足实际需求？ | CRITICAL |
| Novelty 新颖性 | Is the contribution incremental (<5% improvement) or substantial? 贡献是增量性的（<5%提升）还是实质性的？ | MAJOR |

**Decision Rule / 决策规则**: Any CRITICAL flaw → **Reject and Pivot**. Do not proceed to Layer 2.
任何 CRITICAL 级别缺陷 → **拒绝并转向**。不进入第二层。

### Layer 2: Lifecycle & Capability Matching / 生命周期与能力匹配

Match the idea to the researcher's current stage and available resources.
将构思与研究者当前阶段和可用资源匹配。

| Stage 阶段 | Characteristics 特征 | Suitable Ideas 适合的构思 |
|---|---|---|
| **Exploration 探索期** (Year 1) | Building foundational knowledge 构建基础知识 | Extension studies, replication + improvement 扩展研究、复现+改进 |
| **Consolidation 巩固期** (Year 2-3) | Established expertise 建立专业能力 | Novel methods on known problems, cross-domain transfer 已知问题的新方法、跨领域迁移 |
| **Independence 独立期** (Year 4+) | Can identify and frame new problems 能识别和定义新问题 | New problem formulation, paradigm shifts 新问题定义、范式转换 |

### Layer 3: Five-Dimension Scoring / 五维度打分

Score each dimension 1-10, then compute weighted average.
每维度 1-10 分，计算加权平均。

| Dimension 维度 | Question 问题 | Weight 权重 |
|---|---|---|
| **Higher 更高** | Does it achieve higher accuracy/performance than SOTA? 是否比 SOTA 达到更高的精度/性能？ | 25% |
| **Faster 更快** | Does it reduce training/inference time significantly? 是否显著减少训练/推理时间？ | 20% |
| **Stronger 更强** | Does it improve robustness, generalization, or safety? 是否提升鲁棒性、泛化性或安全性？ | 20% |
| **Cheaper 更省** | Does it reduce data/compute/human annotation cost? 是否降低数据/算力/人工标注成本？ | 15% |
| **Broader 更广** | Does it generalize to new domains/tasks/modalities? 是否能泛化到新领域/任务/模态？ | 20% |

**Scoring Guide / 评分指南**:
- 8-10: Strong contribution, likely top-venue accept / 强贡献，顶级会议大概率接收
- 5-7: Solid contribution, needs careful positioning / 扎实贡献，需要精心定位
- 3-4: Marginal, consider combining with another dimension / 边缘性，考虑结合其他维度
- 1-2: Weak, reconsider the research direction / 弱，重新考虑研究方向

### Layer 4: Paradigm Shift Detection / 范式跃迁探测

Check if the idea has the potential for transformative impact.
检查构思是否具有变革性影响的潜力。

| Signal 信号 | Description 描述 |
|---|---|
| **Problem Redefinition 问题重定义** | Reframes an existing problem in a fundamentally new way 以全新的方式重新定义已有问题 |
| **Methodological Innovation 方法论创新** | Introduces a new paradigm, not just an incremental improvement 引入新范式，而非增量改进 |
| **Cross-Domain Bridge 跨领域桥梁** | Connects two previously separate research communities 连接两个此前分离的研究社区 |
| **Enabling Technology 使能技术** | Unlocks new capabilities that were previously impossible 解锁此前不可能的新能力 |

**Decision / 决策**: If ≥2 signals detected → Flag as "paradigm shift candidate". If 0 signals → proceed as standard contribution.
如果检测到≥2个信号 → 标记为"范式跃迁候选"。如果 0 个信号 → 作为标准贡献推进。

## Introduction Six-Paragraph Model / Introduction 六段式模型

A structured approach to drafting paper introductions. Each paragraph has a specific role, with logical chains connecting them.
结构化 Introduction 起草方法。每段有特定角色，段落间通过逻辑链连接。

| Paragraph 段落 | Role 角色 | Key Elements 关键要素 |
|---|---|---|
| **P1: Background & Running Example 背景与示例** | Set the stage with a concrete running example 用具体的运行示例搭建舞台 | Domain context, why this area matters, a motivating example 领域背景、为什么重要、动机示例 |
| **P2: Limitations 现有局限** | Identify gaps in existing work (≤3 limitations) 识别现有工作的不足（≤3条） | "However, existing methods suffer from..." "然而，现有方法存在..." |
| **P3: Problem Essence & Goal 问题本质与目标** | Bridge from limitations to your goal 从局限桥接到你的目标 | "This motivates us to ask: can we...?" "这促使我们思考：能否...？" |
| **P4: Key Challenges 关键挑战** | State the hard parts (≤3 challenges) 陈述难点（≤3个挑战） | "The key challenge is that..." "核心挑战在于..." |
| **P5: Solution Overview 方案总览** | Map modules to challenges (1-to-1 correspondence) 模块与挑战一一对应 | "To address C1, we propose Module A..." "针对挑战C1，我们提出模块A..." |
| **P6: Contributions 贡献点** | Numbered contributions with section references 带章节引用的编号贡献 | "Our contributions are: (1)... (2)... (3)..." |

### Logic Chain Verification / 逻辑链验证

Five chains must hold for a coherent Introduction:
五条逻辑链必须成立才能保证 Introduction 的连贯性：

```
P1 → P2: Running Example → naturally reveals limitations 运行示例 → 自然引出局限
P2 → P3: Limitations → directly motivate the goal 局限 → 直接引出目标
P3 → P4: Goal → reveals why it's hard to achieve 目标 → 揭示为何难以实现
P4 → P5: Challenges → each maps to exactly one module 挑战 → 每个对应一个模块
P5 → P6: Modules → each yields a contribution 模块 → 每个产出一个贡献
```

**Common Failure Modes / 常见失败模式**:
- P1 too abstract, no running example → reader cannot follow / P1 过于抽象，无运行示例
- P2 lists too many limitations (>3) → dilutes focus / P2 列举过多局限（>3条）→ 焦点分散
- P4-P5 mismatch: challenges ≠ modules → reader confused / P4-P5 不匹配 → 读者困惑
- P6 contributions not linked to sections → unverifiable / P6 贡献未链接到章节

## Output Template / 输出模板

```
## Idea Evaluation Report / 构思评估报告

**Idea**: [One-line description / 一行描述]
**Date**: YYYY-MM-DD
**Evaluator**: [Name or Agent / 评估者]

### Layer 1: Fatal Flaw Audit / 致命缺陷审计
- Prior Art: [PASS/CRITICAL] — [Evidence / 证据]
- Feasibility: [PASS/CRITICAL] — [Evidence]
- Significance: [PASS/CRITICAL] — [Evidence]
- Novelty: [PASS/MAJOR] — [Evidence]
**Gate Result / 关卡结果**: [PROCEED / REJECT]

### Layer 2: Lifecycle Match / 生命周期匹配
- Researcher Stage: [Exploration/Consolidation/Independence]
- Resource Match: [Adequate/Tight/Insufficient]

### Layer 3: Five-Dimension Scores / 五维度得分
| Dimension | Score | Justification |
|-----------|-------|---------------|
| Higher    | X/10  | ...           |
| Faster    | X/10  | ...           |
| Stronger  | X/10  | ...           |
| Cheaper   | X/10  | ...           |
| Broader   | X/10  | ...           |
| **Weighted Average** | **X.X** | |

### Layer 4: Paradigm Shift Signals / 范式跃迁信号
- [ ] Problem Redefinition
- [ ] Methodological Innovation
- [ ] Cross-Domain Bridge
- [ ] Enabling Technology
**Signal Count**: X/4

### Final Verdict / 最终结论
[PROCEED / PROCEED WITH GUARDRAILS / REJECT AND PIVOT]
**Recommended Next Step**: [tech-paper-template / lit-review / pivot to X]
```


## Cross-Discipline Adaptation / 跨学科适配

Different disciplines prioritize different evaluation dimensions. Adjust weights accordingly.
不同学科侧重不同评估维度，需调整权重。

| Discipline 学科 | "Higher" Focus 更高 | "Faster" Focus 更快 | "Stronger" Focus 更强 | "Cheaper" Focus 更省 | "Broader" Focus 更广 |
|-----------|-----------|----------|-----------|-----------|----------|
| CS/AI 计算机 | Accuracy/F1↑ | Training speed↑ | Robustness↑ | Data efficiency↑ | Cross-task transfer↑ |
| Medicine 医学 | Clinical outcome↑ | Diagnosis speed↑ | Safety↑ | Cost per patient↓ | Multi-center valid↑ |
| Physics 物理 | Precision↑ | Simulation speed↑ | Noise robustness↑ | Beam time↓ | Multi-experiment↑ |
| Social Science 社科 | Effect size↑ | Analysis speed↑ | External validity↑ | Sample cost↓ | Cross-cultural↑ |
| Economics 经济 | R-squared↑ | Forecast speed↑ | Structural stability↑ | Data acquisition↓ | Out-of-sample↑ |
| Biology 生物 | Sensitivity↑ | Throughput↑ | Reproducibility↑ | Reagent cost↓ | Multi-species↑ |
| Engineering 工程 | Performance metric↑ | Latency↓ | Reliability↑ | Material cost↓ | Multi-condition↑ |

**Weight adjustment example / 权重调整示例**:
- Medicine: Stronger (30%) > Higher (25%) > Cheaper (20%) > Broader (15%) > Faster (10%)
- Physics: Higher (30%) > Cheaper (25%) > Stronger (20%) > Faster (15%) > Broader (10%)
- Economics: Broader (30%) > Stronger (25%) > Higher (20%) > Cheaper (15%) > Faster (10%) |

## Integration with HBE / 与 HBE 集成

1. Run `/hbe-academic idea-eval` before any new research project
   在启动新研究项目前运行 `/hbe-academic idea-eval`
2. If PROCEED → continue to `workflows/literature-review.md`
   如果通过 → 进入 `workflows/literature-review.md`
3. If REJECT → use paradigm shift signals to pivot
   如果拒绝 → 使用范式跃迁信号转向

## References / 参考文献

- Supervisor-Skills Handbook Ch.2: Idea Generation / 手册第二章
- Supervisor-Skills Handbook Ch.3.2: Introduction 思考模型 / 手册第3.2章
- `references/writing-guide.md` — Academic writing principles

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| Literature search | Semantic Scholar API | free |
| Trend analysis | Google Scholar | web |
| Citation tracking | OpenAlex API | free |
| Prior art search | arXiv API | free |
| Idea scoring | (structured template) | built-in |
| Collaboration | Overleaf / Google Docs | free tier |
