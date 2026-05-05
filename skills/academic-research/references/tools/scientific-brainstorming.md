---
name: scientific-brainstorming
description: Research ideation framework — structured brainstorming for hypothesis generation and problem framing
domain: Research / Methodology
install: N/A (methodology)
---

# Scientific Brainstorming — Structured Research Ideation

## Overview

Scientific brainstorming applies systematic creativity techniques to generate and refine research ideas. Unlike unstructured ideation, these frameworks provide reproducible processes for hypothesis generation, gap identification, and cross-domain inspiration that can be documented and shared across research teams.

## When to Use

- Starting a new research project and need to identify promising directions
- Generating hypotheses from a body of existing literature
- Breaking out of a creative rut in a long-running project
- Framing a vague research interest into testable questions
- Cross-pollinating ideas between disciplines
- Preparing for grant proposals or thesis committee meetings

## Quick Start

### SCAMPER Method for Research Ideas

Apply each SCAMPER lens to your current research question:

| Lens | Question | Example Output |
|------|----------|----------------|
| **S**ubstitute | What if we replace component X with Y? | Replace CNN backbone with Vision Transformer |
| **C**ombine | Can we merge method A with method B? | Combine contrastive learning with graph neural networks |
| **A**dapt | How can we adapt this from domain X to domain Y? | Adapt NLP attention mechanisms to protein folding |
| **M**odify/Magnify | What if we scale/modify parameter X? | Magnify context window from 2K to 100K tokens |
| **P**ut to other use | Can this tool solve a different problem? | Use diffusion models for molecular generation |
| **E**liminate | What can we remove without losing performance? | Eliminate dropout from transformer training |
| **R**everse/Rearrange | What if we reverse the order or structure? | Reverse: generate text from images instead of images from text |

## Core Capabilities

### 1. Morphological Analysis

Systematically explore the combinatorial space of research design choices.

```markdown
## Morphological Analysis Template

Define dimensions of your research space:
- **Data source**: [A] Synthetic | [B] Benchmarks | [C] Real-world | [D] Multi-modal
- **Model type**: [1] CNN | [2] Transformer | [3] GNN | [4] Hybrid
- **Objective**: [a] Classification | [b] Generation | [c] Regression | [d] Clustering
- **Evaluation**: [i] Accuracy | [ii] Efficiency | [iii] Robustness | [iv] Fairness

Generate combinations:
- A-2-b-ii: Synthetic data + Transformer + Generation + Efficiency
- C-3-a-iv: Real-world data + GNN + Classification + Fairness
- D-4-c-i: Multi-modal data + Hybrid + Regression + Accuracy

Score each combination on:
- Novelty (1-5): Has this been done before?
- Feasibility (1-5): Can we execute this in 6 months?
- Impact (1-5): Would this matter to the community?
- TOTAL = sum; prioritize combinations with highest total
```

### 2. Gap Identification from Literature

Structured approach to finding open research questions.

```markdown
## Literature Gap Analysis Template

### Step 1: Survey recent publications (last 2-3 years)
For each paper, record:
- What problem did they solve?
- What method did they use?
- What were their stated limitations?

### Step 2: Categorize limitations
| Limitation Type | Count | Specific Papers |
|-----------------|-------|-----------------|
| Scalability     | 12    | Smith2022, Lee2023 |
| Generalization  | 8     | Chen2022, Park2023 |
| Interpretability| 5     | Kim2022 |
| Data efficiency | 7     | Wang2023, Zhao2023 |

### Step 3: Prioritize gaps
- **Frequency**: How many papers mention this limitation?
- **Severity**: How much does it limit real-world applicability?
- **Addressability**: Can we realistically tackle this?
- **Relevance**: Does it align with our expertise?

### Step 4: Formulate research questions
For the top-priority gap, write 3-5 specific research questions
following the format:
"What is the effect of [intervention] on [outcome] under [conditions]?"
```

### 3. Cross-Domain Inspiration Protocol

Transfer concepts between fields to generate novel research directions.

```markdown
## Cross-Domain Inspiration Template

### Source Domain: [e.g., Physics]
Key concept: [e.g., Thermodynamic entropy as disorder measure]

### Target Domain: [e.g., Machine Learning]
Current problem: [e.g., Measuring dataset diversity]

### Transfer Process:
1. Identify the abstract principle: "Entropy measures the number of
   possible configurations of a system."
2. Map to target: "Dataset diversity = number of distinct feature
   configurations across samples."
3. Formalize: Define a mathematical mapping or analogy.
4. Test: "Can Shannon entropy of feature distributions predict
   model generalization?"
5. Validate: Run experiments to confirm the analogy holds.

### Other transfer examples:
- Evolutionary biology → Neural architecture search
- Economics (market equilibrium) → Multi-agent RL
- Immunology (self/non-self) → Anomaly detection
- Linguistics (syntax trees) → Program synthesis
```

## Common Academic Workflow

### Structured Ideation Session for Grant Proposal

```markdown
## Phase 1: Individual Prep (30 min)
Each team member fills out:
1. Three most interesting recent papers they read
2. Two limitations they find frustrating in current methods
3. One wild idea they have been thinking about

## Phase 2: SCAMPER Round (45 min)
Apply SCAMPER to the top-voted idea from Phase 1.
- 5 minutes per letter, rapid-fire brainstorming
- Document all ideas without judgment

## Phase 3: Morphological Analysis (30 min)
Define 4-5 dimensions of the research space.
Generate and score all combinations.

## Phase 4: Gap Analysis (30 min)
Review literature for the top 3 combinations.
Identify specific gaps and formulate research questions.

## Phase 5: Prioritization (15 min)
Score each research question on:
- Novelty x Feasibility x Impact
Select top 2-3 for the grant proposal.

## Output: Structured document with ranked research questions,
supporting literature, and preliminary experimental plan.
```

## Best Practices

1. **Separate generation from evaluation**: First generate many ideas, then filter — mixing the two suppresses creativity.
2. **Document everything**: Record even seemingly bad ideas; they may become useful later or spark better ones.
3. **Diverse perspectives**: Include team members from different subfields for maximum cross-pollination.
4. **Time-box each phase**: Use strict time limits to maintain energy and prevent overthinking.
5. **Return to ideas**: Revisit brainstorming outputs weeks later with fresh perspective.

## Common Pitfalls

1. **Premature evaluation**: Criticizing ideas during generation kills creativity; defer judgment.
2. **Anchoring bias**: The first idea discussed disproportionately influences the group; counteract by rotating who speaks first.
3. **Too broad or too narrow**: Research questions should be specific enough to be testable but broad enough to be impactful.
4. **Ignoring feasibility**: Exciting but infeasible ideas waste resources; always include feasibility scoring.

## Integration with HBE

- Use with `references/tools/scientific-critical-thinking.md` to evaluate generated ideas
- Pair with `references/tools/literature-review.md` for gap analysis literature search
- Supports `workflows/paper-writing.md` Phase 1 (Ideation and Framing)
- Combine with `references/tools/research-grants.md` for proposal development

## Resources

- SCAMPER technique: https://en.wikipedia.org/wiki/SCAMPER
- TRIZ (Systematic Innovation): https://en.wikipedia.org/wiki/TRIZ
- Design Thinking for Scientists: https://hbr.org/2020/07/design-thinking-for-scientists
- "The Art of Scientific Investigation" by W.I.B. Beveridge
