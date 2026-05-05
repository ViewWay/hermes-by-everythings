---
name: scientific-critical-thinking
description: Critical thinking for research — logical fallacy detection, argument evaluation, and evidence assessment
domain: Research / Methodology
install: N/A (methodology)
---

# Scientific Critical Thinking

## Overview

Scientific critical thinking is the systematic evaluation of claims, arguments, and evidence using formal logic and established epistemic standards. It provides frameworks for identifying logical fallacies, assessing evidence quality, detecting cognitive biases, and constructing rigorous arguments in academic research.

## When to Use

- Evaluating the strength of claims in published papers
- Constructing arguments for your own research papers
- Reviewing manuscripts for journals or conferences
- Assessing the validity of experimental designs
- Identifying weaknesses in competing theories or methods
- Teaching research methodology to students

## Quick Start

### Argument Evaluation Framework (Toulmin Model)

Apply the Toulmin model to any scientific claim:

| Element | Question | Example |
|---------|----------|---------|
| **Claim** | What is being asserted? | "Method X outperforms all baselines." |
| **Grounds** | What evidence supports it? | "95% accuracy on benchmark Y." |
| **Warrant** | Why does evidence support claim? | "Accuracy is the standard metric for task Y." |
| **Backing** | What supports the warrant? | "Prior work [1,2] uses accuracy as the metric." |
| **Qualifier** | How certain is the claim? | "Outperforms on benchmark Y under conditions Z." |
| **Rebuttal** | What conditions could invalidate it? | "May not generalize to out-of-distribution data." |

## Core Capabilities

### 1. Logical Fallacy Catalog for Research

Common fallacies encountered in academic writing and how to detect them.

| Fallacy | Description | Research Example | Detection Question |
|---------|-------------|-----------------|-------------------|
| **Correlation = Causation** | Assuming correlation implies causation | "X and Y co-occur, therefore X causes Y" | Is there a confounding variable? |
| **Cherry Picking** | Selecting only supporting evidence | Citing only studies that support the hypothesis | Were negative results excluded? |
| **Appeal to Authority** | Citing status instead of evidence | "Dr. X believes Y, so Y is true" | Is the claim supported by data? |
| **Straw Man** | Misrepresenting opposing arguments | "Previous work only considered simple cases" | Does the criticism reflect the actual work? |
| **Hasty Generalization** | Broad claim from limited data | "Our 50-subject study proves X universally" | Is the sample representative? |
| **Circular Reasoning** | Conclusion assumed in premises | "X is effective because it produces effects" | Are premises independent of conclusion? |
| **False Dichotomy** | Only two options presented | "Either X is true or Y is false" | Are there other possibilities? |
| **Survivorship Bias** | Only analyzing successes | "All successful startups did X" | What about failures that also did X? |
| **Confirmation Bias** | Seeking only confirming evidence | Ignoring papers that contradict the hypothesis | Was the literature search comprehensive? |
| **Base Rate Fallacy** | Ignoring prior probabilities | "Test is 99% accurate, so result is certain" | What is the base rate / prevalence? |

### 2. Evidence Hierarchy

Rank evidence by methodological rigor when evaluating claims.

```
Level 1 (Strongest): Systematic reviews and meta-analyses
Level 2: Randomized controlled trials (RCTs)
Level 3: Controlled studies without randomization
Level 4: Case-control and cohort studies
Level 5: Case series and case reports
Level 6: Expert opinion / consensus
Level 7 (Weakest): Anecdotal evidence / single observation
```

**Application checklist:**
- What level of evidence does the paper provide?
- Are the claims proportional to the evidence level?
- Are there higher-level studies that contradict the findings?

### 3. Bias Detection in Research

Systematic checklist for identifying biases in published work.

```markdown
## Research Bias Detection Checklist

### Selection Bias
- [ ] How were samples/participants selected?
- [ ] Is there potential for selection bias?
- [ ] Were exclusion/inclusion criteria appropriate?

### Measurement Bias
- [ ] Were outcome measures validated?
- [ ] Was blinding applied (single/double)?
- [ ] Were instruments calibrated?

### Reporting Bias
- [ ] Are all planned outcomes reported?
- [ ] Is there evidence of selective reporting?
- [ ] Are negative results discussed?

### Confounding
- [ ] Were potential confounders controlled for?
- [ ] Was the study design appropriate for causal claims?
- [ ] Are sensitivity analyses presented?

### Reproducibility
- [ ] Is the methodology described in sufficient detail?
- [ ] Are data and code available?
- [ ] Can the results be independently verified?
```

## Common Academic Workflow

### Structured Review of a Research Paper

```markdown
## Critical Review Template

### 1. Claim Identification
- Primary claim: ___________________________
- Secondary claims: ________________________
- Stated limitations: ______________________

### 2. Evidence Assessment
- Evidence type: [ ] Experimental [ ] Observational [ ] Theoretical [ ] Survey
- Evidence level: ___/7 (see hierarchy)
- Sample size: ___ Statistical power: ___
- Reproducibility: [ ] Code available [ ] Data available [ ] Neither

### 3. Argument Analysis (Toulmin)
- Claim: ___________________________
- Grounds: _________________________
- Warrant: _________________________
- Qualifier present? [ ] Yes [ ] No
- Rebuttals addressed? [ ] Yes [ ] No

### 4. Fallacy Check
- Fallacies detected: ____________________
- Severity: [ ] Minor [ ] Moderate [ ] Major

### 5. Bias Assessment
- Selection bias: [ ] None [ ] Possible [ ] Likely
- Measurement bias: [ ] None [ ] Possible [ ] Likely
- Reporting bias: [ ] None [ ] Possible [ ] Likely

### 6. Overall Assessment
- Strength of claims: [ ] Strong [ ] Moderate [ ] Weak
- Recommendation: [ ] Accept [ ] Revise [ ] Reject
- Key concerns: _________________________
```

## Best Practices

1. **Apply the null hypothesis**: Start by assuming a claim is false and require evidence to change your belief.
2. **Seek disconfirming evidence**: Actively look for reasons your hypothesis might be wrong.
3. **Distinguish magnitude from significance**: Statistical significance does not imply practical importance.
4. **Consider prior probability**: Extraordinary claims require extraordinary evidence (Bayesian thinking).
5. **Separate description from evaluation**: First understand what was done, then evaluate whether it was done well.

## Common Pitfalls

1. **Confirmation bias in reviewing**: Favoring papers that support your own work; counteract by deliberately seeking contradictory evidence.
2. **Over-reliance on p-values**: A p-value below 0.05 does not prove a claim; consider effect sizes, confidence intervals, and pre-registration.
3. **Ad hominem reasoning**: Dismissing arguments based on the author's identity rather than the evidence.
4. **Argument from authority**: Accepting claims because of the author's reputation without examining the evidence.

## Integration with HBE

- Use with `references/tools/scientific-brainstorming.md` to evaluate generated research ideas
- Pair with `references/tools/peer-review.md` for structured manuscript review
- Supports `workflows/paper-writing.md` argument construction phase
- Combine with `references/tools/scholar-evaluation.md` for evidence quality assessment

## Resources

- "Thinking, Fast and Slow" by Daniel Kahneman
- "The Demon-Haunted World" by Carl Sagan (Baloney Detection Kit)
- "An Introduction to Logic and Scientific Method" by Cohen and Nagel
- Logical fallacies: https://yourlogicalfallacyis.com/
- Sense About Science: https://www.senseaboutscience.org/
