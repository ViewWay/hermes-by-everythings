---
name: peer-review
description: Peer review methodology — systematic approach to reviewing papers and responding to reviews
domain: Research / Review
install: N/A (methodology)
---

# Peer Review Methodology

Peer review is the cornerstone of scientific quality control. This guide covers both sides of the process: (1) how to write a thorough, constructive review as a reviewer, and (2) how to respond effectively to reviewer comments as an author. Both skills are essential for academic career advancement and for maintaining the integrity of the scientific record.

## When to Use

- Writing a review for a journal, conference, or preprint
- Responding to reviewer comments after receiving a decision
- Preparing a rebuttal for a conference (e.g., NeurIPS, ICML, ICLR)
- Mentoring junior researchers on peer review best practices
- Conducting a self-review of your own manuscript before submission
- Evaluating a paper for a journal club or reading group discussion

## Quick Start

### Review Structure (Reviewer Side)

A well-structured review follows this format:

```
1. Summary (2-3 sentences)
   — What problem does the paper address? What is the proposed approach?

2. Strengths (3-5 bullet points)
   — Novel contributions, technical soundness, clarity, significance

3. Weaknesses (3-5 bullet points)
   — Specific, actionable, and prioritized concerns

4. Questions for Authors (3-5 items)
   — Clarifications that could resolve weaknesses

5. Minor Comments (optional)
   — Typos, formatting, missing references

6. Recommendation
   — Accept / Weak Accept / Borderline / Weak Reject / Reject
```

### Rebuttal Structure (Author Side)

```
1. Summary of Changes
   — Brief overview of what was revised

2. Point-by-Point Response
   — For each reviewer comment:
    a) Thank the reviewer
    b) State your response clearly
    c) Reference specific changes (section, paragraph, line)
    d) If disagreeing, provide evidence or reasoning

3. Changed Portions
   — Highlight modified text with tracked changes
```

## Core Capabilities

### 1. Review Checklist

Evaluate each paper against these criteria before writing your review:

| Criterion | Questions to Ask |
|-----------|-----------------|
| **Novelty** | Is the contribution genuinely new, or incremental? |
| **Soundness** | Are claims supported by evidence? Are methods correct? |
| **Significance** | Does this matter to the community? Will it be cited? |
| **Clarity** | Is the paper well-organized and clearly written? |
| **Reproducibility** | Could another researcher replicate this work? |
| **Ethics** | Are there ethical concerns (data privacy, dual use)? |
| **Related Work** | Does the paper adequately cite prior work? |
| **Evaluation** | Are the experiments sufficient and the baselines fair? |

### 2. Structured Review Template

```markdown
## Paper: [Title]
## Confidence: [2-Expert / 3-High / 4-Medium / 5-Low]

### Summary
[2-3 sentences summarizing the paper's contribution]

### Strengths
- S1: [Clear, specific strength]
- S2: [Another strength]

### Weaknesses
- W1: [Major weakness with specific page/line reference]
- W2: [Another weakness, prioritized by severity]

### Questions
- Q1: [Specific question that could resolve a weakness]

### Minor Comments
- M1: Line 42: typo in "performace" -> "performance"
- M2: Consider citing [Author, Year] for related approach.

### Rating: [1-Strong Reject to 10-Strong Accept]
### Justification: [One sentence explaining the rating]
```

### 3. Rebuttal Strategy for Authors

When responding to reviews, follow the "ABC" approach:

- **Acknowledge**: Start by thanking the reviewer. Even if the comment is wrong, acknowledge that they raised a valid concern.
- **Be specific**: Reference exact changes ("We added a new section 4.3, lines 234-248, addressing this concern..."). Never say "we fixed it" without specifics.
- **Compromise when possible**: If a reviewer asks for an additional experiment that is feasible, do it. If not feasible, explain why and offer an alternative (e.g., a theoretical argument or a smaller-scale experiment).

**Priority matrix for responding to comments:**

| Reviewer Comment Type | Response Strategy |
|-----------------------|-------------------|
| Factual error | Correct immediately, thank reviewer |
| Missing reference | Add citation, explain relevance |
| Additional experiment needed | Do it if feasible; otherwise explain and offer alternative |
| Clarity issue | Rewrite the relevant section, highlight changes |
| Disagreement on significance | Respectfully provide evidence for your position |
| Typo/formatting | Fix silently, list in "minor changes" section |

## Common Academic Workflow

### Workflow: Responding to a Revise-and-Resubmit Decision

1. **Read all reviews carefully** — take notes on each comment. Identify common themes across reviewers.
2. **Categorize comments** — separate into "must address" (major), "should address" (minor), and "optional" (nice-to-have).
3. **Plan revisions** — create a table mapping each comment to a planned action.
4. **Implement changes** — revise the manuscript, keeping a change log.
5. **Write response letter** — respond point-by-point, referencing specific changes.
6. **Internal review** — ask a colleague to read the response letter for tone and completeness.
7. **Submit** — include the response letter and a marked-up manuscript (with tracked changes).

## Best Practices

1. **Be constructive, not adversarial** — reviews should help the authors improve the paper, not punish them.
2. **Prioritize weaknesses** — distinguish between fatal flaws and minor issues. One fatal flaw can justify rejection; ten minor typos cannot.
3. **Respond to all comments** — never skip a reviewer comment, even if you disagree. Address it directly.
4. **Maintain a professional tone** — in both reviews and rebuttals. Avoid sarcasm, condescension, or personal attacks.
5. **Turn around reviews on time** — respect journal deadlines. If you cannot review, decline promptly.

## Common Pitfalls

1. **Reviewing the paper you wish was written** — evaluate the paper on its own terms, not against an idealized version.
2. **Vague criticisms** — "The evaluation is insufficient" is not helpful. Specify what is missing and why it matters.
3. **Defensive rebuttals** — arguing with reviewers rarely helps. Even when you disagree, be respectful and provide evidence.
4. **Ignoring "minor" comments** — addressing all comments, even typos, signals good faith to reviewers and editors.
5. **One-line reviews** — a review without specific strengths and weaknesses is unhelpful and may be flagged by editors.

## Integration with HBE

- Use within `workflows/paper-writing.md` for the revision cycle after receiving reviews.
- Pair with `references/tools/scientific-writing.md` to ensure revisions maintain writing quality.
- Combine with `references/tools/scientific-visualization.md` when adding new figures in response to reviewer requests.
- Use `/hbe:review` to have Claude simulate a peer review of your manuscript before submission.

## Resources

- "Peer Review: A Guide for Researchers" — Sense about Science: https://senseaboutscience.org/activities/peer-review-guide/
- NeurIPS reviewer guidelines: https://neurips.cc/Conferences/2025/PaperInformation/Reviewers
- ICML author rebuttal guidelines: https://icml.cc/Conferences/2025/AuthorGuidelines
- Nature peer review policy: https://www.nature.com/nature/for-readers/peer-review
- "The Art of Reviewing" — Rayyan (review management tool): https://www.rayyan.ai/
