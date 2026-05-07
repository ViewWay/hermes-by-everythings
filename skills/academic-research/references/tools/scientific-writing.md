---
name: scientific-writing
description: Scientific writing methodology — structured approach to drafting research papers with AI assistance
domain: Research / Writing
install: N/A (methodology)
---

# Scientific Writing Methodology

Scientific writing is a structured communication discipline that conveys research findings clearly, precisely, and reproducibly. This guide covers the core principles of the IMRAD structure, the six-paragraph introduction model, and practical checklists for producing publication-quality manuscripts with or without AI assistance.

## When to Use

- Drafting a new research paper, review article, or conference submission
- Restructuring a draft to meet journal or conference formatting requirements
- Preparing a manuscript for peer review submission
- Using AI tools (Claude, GPT) to assist with drafting, editing, or translation
- Teaching scientific writing to graduate students or lab members
- Revising a manuscript in response to reviewer feedback

## Quick Start

The IMRAD structure (Introduction, Methods, Results, and Discussion) is the backbone of most primary research papers. Each section has a distinct purpose and can be drafted independently.

```
1. Title     — States the finding, not the topic
2. Abstract  — 150-250 words: problem, method, key result, implication
3. Introduction — 3-6 paragraphs: context -> gap -> approach -> contributions
4. Methods  — Reproducible procedure with enough detail for replication
5. Results  — Present findings objectively; save interpretation for Discussion
6. Discussion — Interpret results, relate to prior work, state limitations
7. Conclusion — One paragraph summarizing the main takeaway
```

## Core Capabilities

### 1. Six-Paragraph Introduction Model

A well-structured introduction follows a predictable six-paragraph arc. This model works across most scientific disciplines.

| Paragraph | Purpose | Example Opening |
|-----------|---------|-----------------|
| 1 | Establish the broad field and its importance | "Protein structure prediction is fundamental to..." |
| 2 | Narrow to the specific problem area | "Recent advances in deep learning have shown..." |
| 3 | Describe the current state of the art | "AlphaFold2 achieved remarkable accuracy, but..." |
| 4 | Identify the gap or limitation | "However, these methods struggle with..." |
| 5 | State your approach and contribution | "In this work, we propose X that addresses Y by..." |
| 6 | Summarize results and paper structure | "Our experiments on Z benchmarks show... This paper is organized as..." |

### 2. IMRAD Section Writing Guidelines

**Introduction**: Never cite more than 30 references. Lead the reader from broad context to your specific contribution. End the introduction with a clear statement of what the paper does.

**Methods**: Write in past tense for completed work. Include enough detail for reproducibility. For computational work: describe datasets, hyperparameters, evaluation metrics, and statistical tests. For experimental work: specify reagents, equipment, sample sizes, and ethical approvals.

**Results**: Present data in the most effective order (not necessarily chronological). Use figures and tables to convey patterns; text should highlight key observations, not repeat data visible in figures.

**Discussion**: Open with the answer to the question posed in the Introduction. Discuss how results compare to prior work. Address alternative explanations. End with limitations and future directions.

### 3. Writing with AI Assistance

AI tools can accelerate drafting but require careful oversight. Follow these principles:

- **Outline first**: Have AI generate or refine your outline before drafting prose. This prevents drift.
- **Draft section by section**: Feed AI one section prompt at a time with specific context (e.g., "Write the Methods subsection on data preprocessing based on these bullet points...").
- **Fact-check aggressively**: AI may fabricate references, misrepresent findings, or introduce subtle inaccuracies. Verify every claim.
- **Maintain your voice**: Use AI for first drafts or language polishing, then rewrite in your own style.
- **Declare AI use**: Follow journal policies on AI-assisted writing. Nature, Science, and NeurIPS have specific disclosure requirements.

## Common Academic Workflow

### Workflow: Drafting a Paper from Results

1. **Organize results** — Create figures and tables first; arrange them in logical order.
2. **Write Results** — Describe each figure/table in one paragraph. State what the data shows, not what it means.
3. **Write Methods** — Describe procedures in the order corresponding to the Results.
4. **Write Discussion** — Interpret results, compare with literature, state limitations.
5. **Write Introduction** — Now that you know exactly what the paper shows, frame the context and gap precisely.
6. **Write Abstract** — Boil down the entire paper into 150-250 words.
7. **Write Title** — Final step. The title should state the key finding or contribution.
8. **Revise** — Read the entire manuscript aloud. Cut 10-20% of words. Ask a colleague for feedback.

## Best Practices

1. **One idea per paragraph** — each paragraph should make exactly one point.
2. **Active voice over passive** — "We measured protein levels" not "Protein levels were measured."
3. **Concrete over vague** — "accuracy improved by 12.3%" not "accuracy improved significantly."
4. **Cite to support, not to decorate** — every citation should add information, not pad the bibliography.
5. **Consistent terminology** — define abbreviations on first use and use them consistently throughout.

## Common Pitfalls

1. **Starting with the Introduction**: Always write Results and Methods first. The Introduction should frame what the paper actually delivers, which you only know after writing Results.
2. **Burying the lede**: State your main contribution in the first paragraph of the Introduction, not the last.
3. **Overloaded abstracts**: The abstract is not a mini-paper. Focus on the problem, method, key result, and one implication.
4. **Result-Discussion confusion**: Do not interpret results in the Results section. Present data first, interpret in Discussion.
5. **Ignoring journal guidelines**: Each journal has specific word limits, reference styles, and section requirements. Check before submitting.

## Integration with HBE

- Use within `workflows/paper-writing.md` for the full manuscript drafting pipeline.
- Pair with `references/tools/peer-review.md` to systematically review drafts before submission.
- Combine with `references/tools/scientific-visualization.md` to align figures with writing quality.
- Use `/hbe-review` to have Claude review manuscript drafts for clarity and structure.

## Resources

- "The Elements of Style" — Strunk & White (foundational writing reference)
- "Writing Science" — Joshua Schimel (excellent for natural sciences)
- "Scientific Writing and Communication" — Angelika Hofmann
- Nature's guide to authors: https://www.nature.com/nature/for-authors/
- NeurIPS paper writing advice: https://neurips.cc/Conferences/2025/PaperInformation/AuthorGuidelines
