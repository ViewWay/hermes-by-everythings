# Academic Writing Guide / 学术写作指南

Complete writing methodology: principles, process, structure, discipline-specific conventions, and revision strategies.
完整写作方法论：原则、流程、结构、学科惯例和修订策略。

---

## Part 1: Core Principles / 核心原则

### 1.1 Gopen & Swan — 7 Principles of Reader Expectations

| # | Principle | Meaning | Example Fix |
|---|-----------|---------|-------------|
| 1 | **Subject-verb proximity** | Minimize material between subject and verb | ❌ "The method, which was proposed in our previous work and validated on three datasets, achieves..." → ✅ "Our method achieves..." |
| 2 | **Stress position** | Place new/important info at sentence end | ❌ "92.1% accuracy was achieved by our method" → ✅ "Our method achieves 92.1% accuracy" |
| 3 | **Topic position** | Sentence beginnings orient reader (old→new) | ❌ "However, the performance degrades. The reason is data imbalance." → ✅ "Performance degrades on imbalanced data." |
| 4 | **Known→New flow** | Start with established, then introduce new | "Transformers (known) use self-attention (known) to model long-range dependencies (new)." |
| 5 | **Logical connections** | Make relationships between ideas explicit | ❌ "We use attention. The results improve." → ✅ "Because attention captures dependencies, results improve." |
| 6 | **Paragraph cohesion** | One idea per paragraph, clear topic sentence | Each paragraph = topic sentence + evidence + transition |
| 7 | **Information flow** | Reader should never need to revise understanding | No "As mentioned earlier..." or "We will discuss this later..." |

### 1.2 Perez Micro-Tips for Clarity

- **Write for the reviewer who is skimming**: headings, figures, and the first sentence of each paragraph should tell the whole story
- **Abstract is the most important 250 words**: spend 20% of writing time on it
- **Active voice**: "We propose" > "It is proposed"; "Figure 3 shows" > "It can be seen from Figure 3"
- **One idea per paragraph**: if you need "additionally" or "furthermore", you might need a new paragraph
- **Figures/tables should be self-contained**: caption + figure = complete message without reading the text
- **Introduction should make the reader want to continue**: open with a concrete example, not "In recent years..."

### 1.3 Lipton Word Choice Guidelines

#### Specific > Vague
- ❌ "better" → ✅ "reduces error by 15%"
- ❌ "large dataset" → ✅ "1.2M examples from ImageNet"
- ❌ "significant improvement" → ✅ "+3.2% accuracy (p < 0.01)"

#### Concrete > Abstract
- ❌ "has advantages" → ✅ "reduces training time by 3× with comparable accuracy"
- ❌ "robust" → ✅ "maintains >90% accuracy under distribution shift"

#### Hedge Precisely
- ❌ "might possibly suggest perhaps" → ✅ "suggests" or "provides evidence that"
- ❌ "it is well known that" → ✅ cite the source
- Use hedging proportional to evidence strength: proves > demonstrates > suggests > indicates > hints

#### Technical Terms
- Define on first use, use consistently thereafter
- Don't alternate synonyms (model/architecture/system)
- Use `\newcommand` for repeated notation in LaTeX
- Create a notation table for complex papers

---

## Part 2: Writing Process / 写作流程

### 2.1 Two-Stage Writing Method

**Stage 1: Outline with bullet points** (use research-lookup to gather evidence)
- Main argument per section
- Key citations to include
- Data points and statistics
- Logical flow between sections

**Stage 2: Convert to flowing prose** (the actual writing)
- Transform every bullet into complete sentences
- Add transitions between ideas
- Integrate citations naturally within prose
- Never leave bullet points in the final manuscript

### 2.2 Section Writing Order (Most Efficient)

```
1. Method (you know this best → write fastest)
2. Experiments (numbers are concrete → easy to write)
3. Related Work (requires literature → write after understanding landscape)
4. Discussion (interprets results → write after experiments are clear)
5. Introduction (frames everything → write last, when paper is settled)
6. Abstract (distills everything → write absolutely last)
7. Title (one last look → might change after writing)
```

### 2.3 Revision Strategy

| Revision Round | Focus | Time Budget |
|---------------|-------|-------------|
| 1 | Content: all claims supported, all experiments present | 30% |
| 2 | Structure: logical flow, section balance, paragraph cohesion | 25% |
| 3 | Clarity: sentence-level, remove ambiguity, tighten prose | 25% |
| 4 | Polish: grammar, spelling, formatting, notation consistency | 20% |

**Revision checklist**:
- [ ] Every claim has supporting evidence (experiment or citation)
- [ ] Every figure/table is referenced in the text
- [ ] Introduction promises match conclusion delivery
- [ ] No orphan claims (mentioned but never evaluated)
- [ ] Notation is consistent across all sections

---

## Part 3: IMRAD Structure Guide / IMRAD 结构指南

### 3.1 Abstract (150-300 words)

**Formula**: Context → Gap → Method → Key Result → Impact

| Sentence # | Purpose | Example Pattern |
|-----------|---------|-----------------|
| 1 | Context (what area) | "[Domain] has seen rapid progress in [topic]." |
| 2 | Gap (what's missing) | "However, existing methods struggle with [specific limitation]." |
| 3 | Method (what you do) | "We propose [Method], which [key innovation]." |
| 4 | Result (what you find) | "Experiments on [dataset] show [quantitative result]." |
| 5 | Impact (why it matters) | "This enables [broader application]." |

**Rules**:
- No citations in abstract (it must be self-contained)
- Include at least one specific number
- No acronyms without definition (even well-known ones)
- Match the journal's word limit exactly

### 3.2 Introduction (1-1.5 pages)

**Six-Paragraph Model** (from `references/idea-evaluation.md`):

| Para | Role | Content |
|------|------|---------|
| P1 | Context | Broad area, why it matters. Accessible to non-experts. |
| P2 | Problem | Specific problem within the area. Precisely defined. |
| P3 | Prior work | Key existing approaches. Fair, representative. |
| P4 | Gap | What's missing? Must be genuinely unaddressed. |
| P5 | "In this paper..." | Contributions listed explicitly (3-5 bullets). |
| P6 | Roadmap | "Section 2 covers... Section 3 presents..." |

**Self-test**: Read only P1→P5. Does it form a logical argument? Can a non-expert understand P1? Can an expert agree with P4?

### 3.3 Method (2-3 pages)

**Structure**:
```
3.1 Problem Formulation (mathematical definition)
3.2 [Method Name] Overview (key insight in plain text)
3.3 [Component A] (first contribution)
3.4 [Component B] (second contribution)
3.5 Complexity Analysis (time/space)
3.6 Implementation Details (practical considerations)
```

**Rules**:
- Every design choice must be motivated (why, not just what)
- Include a notation table if >5 symbols
- Algorithm pseudocode in `algorithm2e`
- Architecture diagrams in TikZ
- State assumptions explicitly

### 3.4 Experiments (2-3 pages)

**Structure**:
```
4.1 Setup (datasets, baselines, metrics, hyperparameters)
4.2 Main Results (primary comparison)
4.3 Ablation Study (isolate each contribution)
4.4 Analysis (qualitative, error, efficiency)
```

**Rules**:
- Every metric justified for the task
- Every baseline from top venue, last 2 years
- Report mean ± std over ≥ 3 seeds
- Include p-values or confidence intervals
- Best results in **bold** (not just highlighting)

### 3.5 Related Work (0.5-1 page)

**Organized by theme, NOT chronologically**:
```
5.1 Theme A (approach category)
  - Method X [cite] does... Our method differs by...
  - Method Y [cite] does... Our method differs by...
5.2 Theme B (another category)
  ...
```

**Rules**:
- Every paragraph ends with differentiation from your work
- Cite at least 20 papers for a top venue
- Cover all relevant recent work (2024-2026)
- Acknowledge competing approaches fairly

### 3.6 Conclusion (0.5 page)

**Structure**:
```
1. Contributions summary (3 sentences max)
2. Limitations (honest, specific — reviewers respect this)
3. Future work (1-2 concrete directions)
```

**Rules**:
- Never introduce new information
- Never repeat the abstract
- Limitations should be specific enough to be addressed in future work

---

## Part 4: Discipline-Specific Conventions / 学科写作惯例

### Computer Science & AI
- Use active voice ("We train the model" not "The model is trained")
- Contribution bullets in introduction
- Ablation studies expected
- Tables with ± std for all results
- Benchmarks: reference Papers With Code leaderboard

### Medicine & Clinical
- Structured abstracts (Background, Methods, Results, Conclusions)
- Past tense for results
- CONSORT/STROBE checklists
- Ethics statement: IRB approval number, informed consent
- Report effect sizes with 95% CI, not just p-values

### Physics
- Present tense for established physics, past tense for experiments
- SI units throughout
- Uncertainty in format: 9.1094 ± 0.0001 × 10⁻³¹ kg
- Figures with clear axis labels and units
- Cite experimental and theoretical papers separately

### Social Science & Economics
- Hypothesis stated before analysis
- APA 7th edition formatting
- Report β coefficients, standard errors, p-values, R²
- Causal identification strategy explicit
- Robustness checks in appendix

### Engineering
- Circuit diagrams/schematics with component values
- System architecture figures with interfaces
- Performance metrics with units and comparison to requirements
- Safety factors and failure modes discussed

### Chemistry & Biology
- IUPAC nomenclature for compounds
- Gene names italicized (*TP53* for human, *Tp53* for mouse)
- Protein names non-italic (p53)
- Species names italicized (*Homo sapiens*, *E. coli*)
- Materials and reagents with supplier and catalog numbers

### Mathematics
- Theorem-proof structure
- "We" not "I" even for single author
- Number all equations (even if not referenced)
- Proofs use "Proof." ... "□"
- QED symbol at end of proofs

---

## Part 5: Sentence-Level Patterns / 句子级模式

### Opening Sentences by Section

| Section | Good Opening | Bad Opening |
|---------|-------------|-------------|
| Abstract | "Despite progress in X, Y remains challenging because Z." | "In this paper, we..." |
| Introduction | Concrete example or striking fact | "Since the dawn of AI..." |
| Method | "Our key insight is that..." | "In this section, we describe..." |
| Experiments | "We evaluate on [datasets] against [baselines]." | "We conducted experiments." |
| Conclusion | "We presented [method], which achieves [result]." | "In this paper, we..." |

### Transition Phrases by Logic

| Logic | Phrase | Avoid |
|-------|--------|-------|
| Causation | "Because X, Y follows" | "X causes Y" (too strong) |
| Contrast | "In contrast, [method] achieves..." | "However, on the other hand..." |
| Limitation | "While effective, this approach cannot handle..." | "This is the best method" |
| Evidence | "As shown in Table 2, our method..." | "The table clearly shows that..." |
| Concession | "Although X is effective for A, it struggles with B" | "X is bad" |

---

## Part 6: Common Mistakes / 常见错误

### Top 10 Rejection Reasons

1. **Overclaiming**: "our method significantly outperforms" → must have p < 0.05
2. **Weak baselines**: comparing only to outdated or weak methods
3. **Missing motivation**: jumping to method without explaining why
4. **Inconsistent notation**: same symbol meaning different things
5. **Orphan claims**: contribution listed but no experiment validates it
6. **Poor writing**: reviewer can't understand the method after 3 reads
7. **Missing reproducibility**: no hyperparameters, code, or seeds
8. **Cherry-picking**: only showing best results, hiding failures
9. **Insufficient related work**: missing key papers reviewers expect
10. **Page limit violation**: overlength papers rejected without review

### Words to Avoid

| Avoid | Use Instead | Reason |
|-------|-----------|--------|
| "novel" | "new" or describe what's different | Overused, means nothing |
| "leverages" | "uses" or "exploits" | Jargon |
| "utilize" | "use" | Longer ≠ better |
| "in order to" | "to" | Unnecessary words |
| "very" | Use specific numbers | Vague |
| "significant" | Use p-values | Ambiguous (statistical vs. practical) |
| "easy/simple" | Describe the complexity | Subjective |
| "obviously" | Remove or prove it | If obvious, don't say it |

---

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full registry.

| Task | Tool | Install |
|------|------|---------|
| LaTeX writing | TeXLive + latexmk | system install |
| Bibliography | bibtexparser | `pip install bibtexparser` |
| Reference management | pyzotero | `pip install pyzotero` |
| Format conversion | pandoc | system install |
| Grammar check | LanguageTool | `pip install language-tool-python` |

## Integration / 集成

- Works with `references/idea-evaluation.md` (six-paragraph intro model)
- Feeds into `references/pre-submission-review.md` (Dimension 3: Writing & Presentation)
- Supports `references/de-aigc-guide.md` (avoiding AI writing patterns)
- Connects to `references/figure-design-guide.md` (figure/table best practices)
- Complements `references/vibe-research-workflow.md` (human-AI writing collaboration)
