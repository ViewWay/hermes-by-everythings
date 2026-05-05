# De-AIGC Detection Guide / 降 AIGC 检测率指南

Methodology for reducing AI-generated content detection rates in academic writing, covering both Chinese and English contexts.
降低学术论文中 AI 生成内容检测率的方法论，覆盖中英文语境。

> **Source / 来源**: Distilled from [Awesome-Agent-Skills-for-Empirical-Research](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research) — 降 AIGC Skills collection (skills/44-48).
> Key skills: humanizer_academic, skill-deslop, stop-slop, avoid-ai-writing, chinese-de-aigc.

## Why This Matters / 为什么这很重要

In 2026, major academic platforms (知网 AMLC, Turnitin, GPTZero, 万方, 维普) have deployed AIGC detectors. Papers exceeding detection thresholds face automatic rejection.
2026 年，主要学术平台（知网 AMLC、Turnitin、GPTZero、万方、维普）已部署 AIGC 检测器。超过检测阈值的论文面临自动拒稿。

**This guide helps you write with AI assistance while maintaining human academic voice.**
本指南帮助你在 AI 辅助写作的同时保持人类学术声音。

## Five-Dimension Assessment / 五维度评估

Score each dimension 1-10 (target: ≥7 per dimension for low detection risk).
每维度 1-10 分（目标：每维度≥7 分可降低检测风险）。

| Dimension 维度 | Description 描述 | What to Check 检查内容 |
|---|---|---|
| **Specificity 具体性** | Uses precise, domain-specific language 使用精确的领域特定语言 | Replace generic phrases with specific terminology 用具体术语替换泛泛之词 |
| **Rhythm 节奏性** | Varied sentence length and structure 句长和结构多变 | Mix short punchy sentences with longer complex ones 短句与长句交替使用 |
| **Hedge Quality 谨慎性** | Appropriate academic hedging 恰当的学术谨慎表达 | "suggests", "may", "tends to", rather than "proves", "demonstrates" |
| **Implicit Coherence 隐衔接** | Logical flow without explicit connectors 无显性连接词的逻辑连贯 | Reduce "Moreover", "Furthermore", "Additionally" (top AI markers) 减少"此外"、"另外"等（最高频 AI 标志） |
| **Researcher Voice 研究者语气** | Shows author's analytical perspective 展示作者的分析视角 | First-person reasoning, "We chose X because..." 第一人称推理 |

## Common AI Writing Patterns / 常见 AI 写作模式

### English AI Patterns / 英文 AI 痕迹

| Pattern 模式 | Example 示例 | Fix 修复 |
|---|---|---|
| **Throat-clearing openings 清喉开场** | "In recent years, ... has gained significant attention" | Start directly with the claim 直接从论点开始 |
| **Emphasis crutches 强调拐杖** | "It is important to note that...", "Crucially, ..." | Delete; if important, the content shows 删除；如果重要，内容本身会说明 |
| **False symmetry 虚假对称** | "On one hand... On the other hand..." (when not contrasting) | Use natural transitions 使用自然过渡 |
| **List fatigue 列表疲劳** | "First... Second... Third... Finally..." | Vary transition methods 变换过渡方式 |
| **Hedging extremes 极端谨慎** | "It could be argued that it might perhaps suggest..." | One hedge per claim 每个论点一个谨慎表达 |
| **Dramatic fragmentation 戏剧性碎片化** | Single-sentence paragraphs for emphasis | Integrate into flowing prose 整合到流畅的段落中 |

### Chinese AI Patterns / 中文 AI 痕迹

| Pattern 模式 | Example 示例 | Fix 修复 |
|---|---|---|
| **四字套话堆叠** | "日益重要", "蓬勃发展", "方兴未艾" | Use specific descriptions 用具体描述替代 |
| **虚词填充** | "的", "了", "着" 过度使用 | Restructure sentence to reduce particles 重构句子减少虚词 |
| **总分总对称** | Every section has identical structure 每节结构完全相同 | Vary paragraph structure 变化段落结构 |
| **显性连接词滥用** | "此外"、"另外"、"与此同时" 连续出现 | Use implicit logical flow 使用隐含逻辑连贯 |
| **绝对化断言** | "必然导致"、"毫无疑问" | Use hedging: "倾向于"、"在一定程度上" |
| **句长方差低** | All sentences similar length 所有句子长度相近 | Mix 10-character and 40-character sentences 短句长句交替 |

## Section-Specific Strategies / 分章节差异化策略

Different paper sections require different de-AIGC approaches.
论文不同章节需要不同的降 AIGC 策略。

| Section 章节 | Risk Level 风险等级 | Strategy 策略 |
|---|---|---|
| Abstract 摘要 | **High** — Most AI-like section | Write from scratch, use domain jargon, avoid generic summaries 从头写，使用领域术语 |
| Introduction 引言 | High — Template-prone | Use six-paragraph model, inject personal research journey 使用六段式模型，融入个人研究经历 |
| Related Work 文献综述 | Medium — Summarization risk | Paraphrase with critical commentary, not just restating 带批判性评论地改写 |
| Method 方法 | Low — Technical content | Focus on rationale ("why this design"), not just description 聚焦设计理由 |
| Results 结果 | Low — Data-driven | Use varied sentence structures to present numbers 用多样的句式呈现数据 |
| Discussion 讨论 | Medium — Speculative | Ground claims in specific results, avoid sweeping generalizations 将论断建立在具体结果上 |
| Conclusion 结论 | High — Summary pattern | End with forward-looking statement, not generic "future work" 用前瞻性陈述结尾 |

## Five-Step Workflow / 五步闭环工作流

```
Step 1: LOCATE 定位 → Scan for AI patterns using the tables above 用上表扫描 AI 痕迹
    ↓
Step 2: DIAGNOSE 诊断 → Score on five dimensions (≥7 target) 五维度评分（目标≥7）
    ↓
Step 3: REWRITE 差异化改写 → Apply section-specific strategy 按章节策略改写
    ↓
Step 4: SELF-ASSESS 五维自评 → Re-score on five dimensions 五维度重新评分
    ↓
Step 5: RECHECK 二次复查 → Verify no new AI patterns introduced 确认未引入新的 AI 痕迹
```

## Tools & Skills Reference / 工具与技能参考

| Skill 技能 | Language 语言 | Key Feature 核心特性 |
|---|---|---|
| [humanizer_academic](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/44-humanizer_academic) | English 英文 | 23 AI writing pattern detection / 23 种 AI 模式检测 |
| [skill-deslop](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/45-skill-deslop) | English 英文 | Scientific writing de-AI with discipline awareness / 科学写作去 AI 化 |
| [stop-slop](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/46-stop-slop) | English 英文 | Three-layer detection + five-dimension scoring / 三层检测+五维评分 |
| [avoid-ai-writing](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/47-avoid-ai-writing) | English 英文 | Structured audit + rewrite + second audit / 结构化审计+重写+二次审计 |
| [chinese-de-aigc](https://github.com/brycewang-stanford/Awesome-Agent-Skills-for-Empirical-Research/tree/main/skills/48-chinese-de-aigc) | Chinese 中文 | 17 Chinese AI pattern types, 知网/万方 targeted / 17 类中文 AI 痕迹，针对知网/万方 |


## Cross-Discipline Adaptation / 跨学科适配

Different disciplines face distinct AIGC detection challenges and require tailored strategies.
不同学科面临不同的 AIGC 检测挑战，需要定制化策略。

| Discipline 学科 | High-Risk Sections 高风险章节 | Common AI Patterns 常见AI痕迹 | De-AIGC Focus 降AIGC重点 |
|-----------|----------------------|---------------------|------------------|
| CS/AI 计算机 | Abstract, Related Work | Generic openings, list-heavy writing | Inject implementation rationale, use technical jargon |
| Medicine 医学 | Abstract, Discussion | Hedging extremes, passive voice overuse | Use specific clinical outcomes, cite trial IDs |
| Physics 物理 | Introduction, Theory | Overly smooth transitions, uniform sentence length | Include uncertainty language, use field notation |
| Social Science 社科 | Literature Review, Discussion | Template-like structures, "furthermore" chains | Ground in fieldwork quotes, use diverse sources |
| Economics 经济 | Model, Results | Symmetric structures, identical hedging | Vary model description, report heterogeneous effects |
| Biology 生物 | Methods, Results | Protocol-description AI patterns, passive-heavy | Describe lab-specific decisions, use active voice |
| Engineering 工程 | Introduction, Results | Generic performance claims | Detail hardware specifics, include failure analysis |
| Humanities 人文 | All sections | Overly coherent argument, uniform tone | Use discipline-specific styles, cite primary sources |

## Integration with HBE / 与 HBE 集成

1. Apply de-AIGC checks in **Gate 2: Writing Quality** of the quality gate system
   在质量关卡系统的**第二关：写作质量**中应用降 AIGC 检查
2. Use as post-processing step after `/hbe:academic paper` completes drafting
   作为 `/hbe:academic paper` 完成草稿后的后处理步骤
3. Combine with `workflows/paper-writing.md` Phase 4 (Quality Gates)
   与 `workflows/paper-writing.md` 第四阶段（质量关卡）结合使用
4. Run `/hbe:academic de-aigc` for targeted de-AIGC review
   运行 `/hbe:academic de-aigc` 进行专项降 AIGC 审查

## Important Note / 重要说明

This guide is designed for **legitimate academic writing with AI assistance** — ensuring that AI-collaborative writing maintains scholarly rigor and personal voice. It is NOT designed to help pass off fully AI-generated content as human work.
本指南为**合法使用 AI 辅助学术写作**设计——确保 AI 协作写作保持学术严谨性和个人声音。不用于将完全由 AI 生成的内容伪装为人类作品。

## References / 参考文献

- Awesome-Agent-Skills-for-Empirical-Research skills/44-48 / 降 AIGC 技能集合
- Wikipedia "Signs of AI writing" — pattern reference / AI 写作标志参考
- `references/writing-guide.md` — Academic writing principles / 学术写作原则

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| AI text detection | GPTZero / Originality.ai | web tool |
| Plagiarism check | Turnitin / iThenticate | institutional |
| Style analysis | textstat | `pip install textstat` |
| Readability metrics | readability | `pip install readability` |
| Grammar check | LanguageTool | `pip install languagetool` |
| Diff comparison | latexdiff | `tlmgr install latexdiff` |
