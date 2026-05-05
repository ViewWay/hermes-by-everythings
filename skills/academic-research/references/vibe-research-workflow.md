# Vibe Research: AI Collaboration Rules / AI 协作研究工作流

Best practices for human-AI collaborative research across writing, coding, and figure creation.
人机协作研究的最佳实践，覆盖写作、编码和图表创作。

## Core Philosophy / 核心理念

Based on HKUSTDial/Supervisor-Skills "Vibe" methodology:

**Vibe Research = Human provides taste + direction; AI provides speed + scale.**
人类提供品味和方向；AI 提供速度和规模。

**Key Principle**: The researcher is the PI (Principal Investigator). The AI is a research assistant — tireless, fast, but needs direction and quality control.
研究者是主导者（PI）。AI 是研究助手——不知疲倦、速度快，但需要方向和质量控制。

## Vibe Coding / AI 协作编码

### Rule 1: Specify Before You Code / 先规范再编码

```
BAD:  "Write me a training script"
GOOD: "Write a PyTorch training script that:
       - Loads data from HuggingFace datasets
       - Uses AdamW with cosine annealing LR (1e-4 → 1e-6)
       - Logs to Weights & Biases
       - Saves checkpoint every 1000 steps
       - Resumes from checkpoint if interrupted"
```

### Rule 2: Verify Every Line / 验证每一行

- [ ] Logic correctness: Does the code do what you asked?
- [ ] Numerical correctness: Are calculations correct? Check edge cases.
- [ ] Efficiency: Is there unnecessary O(n²) that should be O(n)?
- [ ] Reproducibility: Is the seed set? Are results deterministic?
- [ ] Compatibility: Does it work with your Python/PyTorch/CUDA version?

### Rule 3: Test Before Trust / 先测试再信任

```python
# Always write a small test before running the full experiment
def test_model():
    model = MyModel(input_dim=10, hidden_dim=32)
    x = torch.randn(4, 10)
    out = model(x)
    assert out.shape == (4, num_classes), f"Expected (4, {num_classes}), got {out.shape}"
    print("✓ Shape test passed")
    
    # Check gradients flow
    loss = out.sum()
    loss.backward()
    for name, p in model.named_parameters():
        assert p.grad is not None, f"No gradient for {name}"
    print("✓ Gradient test passed")
```

### Rule 4: Version Control Everything / 一切版本控制

- Every experiment configuration is committed
- Results are logged with git hash
- Data processing scripts are versioned alongside data

## Vibe Writing / AI 协作写作

### Rule 1: Outline First, Fill Second / 先列大纲再填充

```
Step 1: Human creates outline (section headers + key points per section)
Step 2: AI expands each section
Step 3: Human reviews and rewrites each paragraph
Step 4: AI polishes grammar and consistency
Step 5: Human does final review

DO NOT let AI write the whole paper at once.
DO NOT accept AI output without substantial human revision.
```

### Rule 2: Maintain Academic Voice / 保持学术声音

Reference `references/de-aigc-guide.md` for detailed patterns. Key rules:

- AI tends to over-hedge ("may potentially perhaps") → Use precise hedging ("likely", "suggests that")
- AI tends to list without synthesis → Each paragraph must have a thesis sentence
- AI tends to use generic connectors ("Furthermore", "Additionally") → Use logical connectors ("Because X, Y follows")
- AI tends toward uniform sentence length → Vary length for rhythm

### Rule 3: Cite Before Claim / 先引用再断言

```
BAD:  "Transformers have revolutionized NLP"
GOOD: "Since the introduction of the Transformer architecture (Vaswani et al., 2017), 
       self-attention mechanisms have become the dominant paradigm in NLP (Devlin et al., 2019; 
       Brown et al., 2020), achieving state-of-the-art results across diverse tasks."
```

### Rule 4: Fact-Check Every Citation / 核实每一条引用

From `references/research-integrity-guide.md`:
- Never trust AI-generated citations without verification
- Always check: existence, accuracy, metadata, context

## Vibe Figures / AI 协作图表

### Rule 1: Human Designs, AI Renders / 人类设计，AI 渲染

```
Step 1: Human sketches the figure layout (pen & paper is fine)
Step 2: Human specifies: axes, colors, data source, message
Step 3: AI generates TikZ/matplotlib code
Step 4: Human reviews against design principles (see references/figure-design-guide.md)
Step 5: Iterate until the figure tells the story
```

### Rule 2: Design Before Decorate / 先设计再装饰

- Start with the message: what should the reader learn from this figure?
- Choose the chart type that best communicates the message
- Add decoration (colors, labels, annotations) only to serve the message
- Remove any element that doesn't serve the message

### Rule 3: Consistency Across Figures / 图表间一致性

```
□ Same font (usually the paper's font, or sans-serif for slides)
□ Same color palette (pick 4-6 colors, use throughout)
□ Same axis style (font size, tick marks, grid)
□ Same figure width (usually \columnwidth or \textwidth)
□ Same legend position and style
```

## Workflow Integration / 工作流集成

### Morning Routine / 晨间流程

```
1. Review yesterday's results → identify issues
2. Update experiment tracking (W&B / notes)
3. Decide: continue current direction or pivot?
4. If pivot: sketch new direction before coding
```

### Writing Session / 写作时段

```
1. Read the target section outline
2. Write the topic sentences (human)
3. Expand each paragraph (human + AI)
4. Review for voice consistency (human)
5. Check citations (human + tools)
6. Polish (AI → human final pass)
```

### Review Cycle / 审阅循环

```
1. Self-review: run 5-dimension check (references/pre-submission-review.md)
2. Peer review: share with colleague, address feedback
3. Simulated review: use 7-dimension reviewer simulation from SKILL.md
4. Final polish: formatting, references, supplementary
```

## Anti-Patterns / 反模式

| Anti-Pattern | Why It Fails | Fix |
|-------------|-------------|-----|
| "Write my paper" | No direction, generic output | Provide outline, section-by-section |
| Accepting AI output verbatim | AI detection, loss of voice | Rewrite every paragraph |
| Letting AI choose citations | Hallucinated references | Provide exact citations yourself |
| Skipping human review | Errors compound | Review each section before moving on |
| Over-relying on AI for analysis | Shallow insights | AI drafts, human adds depth |
| Ignoring reproducibility | Results can't be verified | Document everything, version control |

## Collaboration Spectrum / 协作光谱

```
Human-Only ←————————————————————————→ AI-Only

IDEA FORMATION:
  Human-only ← ———————————————————— → (never AI-only)
  
OUTLINE:
  Human-led ←————————————→ AI-suggested → (human approves)
  
LITERATURE SEARCH:
  Human-directed ←————→ AI-assisted → (human verifies)
  
CODING:
  Human-specified ←————→ AI-implemented → (human tests)
  
WRITING:
  Human-authored ←——————→ AI-polished → (human reviews)
  
FIGURES:
  Human-designed ←——————→ AI-rendered → (human approves)
  
PROOFREADING:
  AI-first →————→ Human-final → (always human final)
```


## Cross-Discipline Adaptation / 跨学科适配

| Discipline | Vibe Coding Focus | Vibe Writing Focus |
|-----------|-------------------|--------------------|
| CS/AI | Code generation, debugging, optimization | Technical documentation, algorithm description |
| Medicine | Data pipeline, statistical scripts | Clinical writing, case reports |
| Physics | Simulation code, data fitting | Theory exposition, uncertainty reporting |
| Social Science | Survey analysis, causal inference code | Argument development, policy briefs |
| Economics | Econometric scripts, visualization | Model description, policy implications |
| Biology | Genomics pipelines, statistical tests | Protocol documentation, results interpretation |
| Engineering | CAD scripting, measurement automation | Technical specifications, performance reports |
## Integration / 集成

- Complements `references/writing-guide.md` (academic writing principles)
- Works with `references/de-aigc-guide.md` (AI detection avoidance)
- Supports `references/figure-design-guide.md` (figure creation workflow)
- Connects to `references/pre-submission-review.md` (quality verification)
- Feeds `references/research-integrity-guide.md` (fact-checking)

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| AI-assisted coding | Claude Code / Copilot | subscription |
| AI-assisted writing | Claude / GPT | subscription |
| Version control | git | system |
| Code review | GitHub PR review | free |
| Writing review | LanguageTool | `pip install languagetool` |
| Figure design | Excalidraw / draw.io | free tier |
| Experiment tracking | wandb | `pip install wandb` |
| Note synchronization | Obsidian / Notion | free tier |
