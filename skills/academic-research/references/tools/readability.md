---
name: readability
description: Text readability analysis — extract readability metrics from English text for academic writing assessment
domain: Research Workflow
install: pip install readability-lxml 2>/dev/null; pip install textstat
---

# Readability — Text Readability Metrics

## Overview

The `readability` library (readability-lxml) and companion `textstat` package compute quantitative readability scores for English text. These metrics measure sentence complexity, word difficulty, and overall reading level — useful for assessing whether academic writing targets the appropriate audience.

## When to Use

- Evaluating the accessibility of academic writing for a broad audience
- Comparing readability across paper drafts to track simplification progress
- Assessing whether abstracts are readable by non-specialists
- Checking if supplementary documentation is accessible to diverse audiences
- Benchmarking writing clarity against journal or grant requirements

## Quick Start

```python
import readability
import textstat

text = """
Machine learning models have achieved remarkable performance in natural
language processing tasks. However, their interpretability remains a
significant challenge for researchers and practitioners alike. This paper
presents a novel approach to explain model predictions through attention
mechanism visualization.
"""

# readability-lxml: comprehensive metrics
results = readability.getmeasures(text, lang="en")
print(f"Flesch Reading Ease: {results['readability grades']['FleschReadingEase']:.1f}")
print(f"Kincaid Grade Level: {results['readability grades']['Kincaid']:.1f}")
print(f"Words per sentence: {results['sentence info']['words_per_sentence']:.1f}")

# textstat: individual metric functions
print(f"\nFlesch-Kincaid Grade: {textstat.flesch_kincaid_grade(text):.1f}")
print(f"Gunning Fog Index: {textstat.gunning_fog(text):.1f}")
print(f"Coleman-Liau Index: {textstat.coleman_liau_index(text):.1f}")
print(f"Automated Readability Index: {textstat.automated_readability_index(text):.1f}")
print(f"SMOG Index: {textstat.smog_index(text):.1f}")
```

## Core Capabilities

### 1. All Supported Readability Metrics

```python
import textstat

text = "Your academic text here..."

# Grade-level metrics (lower = easier to read)
print(f"Flesch-Kincaid Grade:     {textstat.flesch_kincaid_grade(text):.1f}")
print(f"Gunning Fog Index:        {textstat.gunning_fog(text):.1f}")
print(f"Coleman-Liau Index:       {textstat.coleman_liau_index(text):.1f}")
print(f"Automated Readability:    {textstat.automated_readability_index(text):.1f}")
print(f"SMOG Index:               {textstat.smog_index(text):.1f}")
print(f"Dale-Chall Readability:   {textstat.dale_chall_readability_score(text):.1f}")
print(f"Linsear Write Formula:    {textstat.linsear_write_formula(text):.1f}")

# Ease metrics (higher = easier to read)
print(f"Flesch Reading Ease:      {textstat.flesch_reading_ease(text):.1f}")
print(f"Spache Readability:       {textstat.spache_readability(text):.1f}")

# Reading time estimation
print(f"Reading time (minutes):   {textstat.reading_time(text):.1f}")
print(f"Speaking time (minutes):  {textstat.speaking_time(text):.1f}")
```

### 2. Text Statistics and Sentence Analysis

```python
import readability

results = readability.getmeasures(text, lang="en")

# Sentence-level statistics
si = results["sentence info"]
print(f"Total sentences:       {si['sentences']}")
print(f"Total words:           {si['words']}")
print(f"Total syllables:       {si['syllables']}")
print(f"Words per sentence:    {si['words_per_sentence']:.1f}")
print(f"Syllables per word:    {si['syllables_per_word']:.2f}")

# Word-level statistics
print(f"Long words (>6 chars): {si['long_words']}")
print(f"Complex words (3+ syll): {si['complex_words']}")
print(f"Complex word ratio:    {si['complex_words_dc']:.3f}")

# Type-token ratio (vocabulary diversity)
print(f"Type-token ratio:      {si['type_token_ratio']:.3f}")
print(f"Character count:       {si['character_count']}")
```

### 3. Comparison Workflow: Draft vs. Revised Text

```python
import textstat

draft = """The utilization of heterogeneous computational infrastructures
for the purposes of facilitating distributed machine learning workloads
has been extensively investigated within the purview of contemporary
academic literature."""

revised = """Using different computing systems for distributed machine
learning is well-studied in current research."""

metrics = {
    "Flesch Reading Ease": textstat.flesch_reading_ease,
    "Kincaid Grade": textstat.flesch_kincaid_grade,
    "Gunning Fog": textstat.gunning_fog,
    "Avg Sentence Length": lambda t: len(t.split()) / max(textstat.sentence_count(t), 1),
}

print(f"{'Metric':<25} {'Draft':>8} {'Revised':>8} {'Change':>8}")
print("-" * 52)
for name, func in metrics.items():
    d, r = func(draft), func(revised)
    change = r - d
    print(f"{name:<25} {d:>8.1f} {r:>8.1f} {change:>+8.1f}")
```

## Common Academic Workflow

### Assessing Paper Readability Before Submission

```python
"""Evaluate readability of all sections of an academic paper."""
import textstat

# Define target readability ranges for academic writing
TARGETS = {
    "Abstract": {"flesch_ease": (30, 60), "grade": (10, 16)},
    "Introduction": {"flesch_ease": (25, 55), "grade": (11, 17)},
    "Methods": {"flesch_ease": (20, 50), "grade": (12, 18)},
    "Results": {"flesch_ease": (30, 60), "grade": (10, 16)},
    "Discussion": {"flesch_ease": (25, 55), "grade": (11, 17)},
}

sections = {
    "Abstract": open("sections/abstract.txt").read(),
    "Introduction": open("sections/introduction.txt").read(),
    "Methods": open("sections/methods.txt").read(),
    "Results": open("sections/results.txt").read(),
    "Discussion": open("sections/discussion.txt").read(),
}

for section_name, text in sections.items():
    ease = textstat.flesch_reading_ease(text)
    grade = textstat.flesch_kincaid_grade(text)
    lo_e, hi_e = TARGETS[section_name]["flesch_ease"]
    lo_g, hi_g = TARGETS[section_name]["grade"]
    e_ok = "OK" if lo_e <= ease <= hi_e else "WARN"
    g_ok = "OK" if lo_g <= grade <= hi_g else "WARN"
    print(f"{section_name:<15} Flesch={ease:5.1f} [{e_ok}]  Grade={grade:4.1f} [{g_ok}]")
```

## Best Practices

1. **Use multiple metrics**: No single score captures all aspects of readability; report 2-3 complementary measures.
2. **Compare against your domain**: Technical papers naturally score lower than popular science — compare within your field.
3. **Focus on the abstract**: Abstracts reach the broadest audience; target Flesch Reading Ease above 40.
4. **Track changes over drafts**: Use readability metrics to quantify improvement across revisions.
5. **Readability is not quality**: Complex ideas may require complex sentences; use metrics as guidance, not rules.

## Common Pitfalls

1. **Designed for English only**: These metrics assume English text; results for other languages are unreliable.
2. **Formula limitations**: Syllable counting is approximate, especially for technical terms.
3. **LaTeX markup contamination**: Strip `\command{}` and math environments before analysis.
4. **Low scores do not mean bad writing**: Specialized academic writing naturally has lower readability scores.

## Integration with HBE

- Use with `references/tools/aspell.md` and `references/tools/languagetool.md` for complete writing quality checks
- Pair with `references/tools/scientific-writing.md` for writing improvement guidance
- Supports `workflows/paper-writing.md` Phase 4 (Proofreading and Clarity)
- Combine with `references/tools/textstat.md` for additional text statistics

## Resources

- readability-lxml (PyPI): https://pypi.org/project/readability-lxml/
- textstat documentation: https://github.com/textstat/textstat
- Readability formulas reference: https://en.wikipedia.org/wiki/Readability
