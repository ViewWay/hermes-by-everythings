---
name: textstat
description: Text statistics and readability metrics — Flesch-Kincaid, Gunning Fog, Coleman-Liau, ARI, Dale-Chall, and more
domain: Research Workflow
install: pip install textstat
---

# textstat — Text Statistics and Readability Metrics / 文本统计与可读性指标

Python library for computing readability scores, text complexity metrics, and linguistic statistics. Widely used for analyzing academic writing quality, evaluating LLM output readability, and benchmarking de-AIGC detection.

## When to Use / 适用场景

- Evaluating readability of academic abstracts, introductions, or public-facing summaries / 评估学术写作可读性
- Comparing human-written vs AI-generated text complexity for de-AIGC analysis / 比较人类与AI文本复杂度
- Tracking writing complexity changes across manuscript revisions / 追踪稿件修订中的复杂度变化
- Assessing patient-facing health literacy materials (target Flesch > 60) / 评估面向患者的健康材料可读性
- Benchmarking text simplification or plain-language rewriting / 评估文本简化效果

## Quick Start / 快速开始

```python
import textstat

text = """
The rapid proliferation of large language models has necessitated robust evaluation
frameworks. Traditional metrics such as BLEU and ROUGE exhibit well-documented
limitations in capturing semantic equivalence. This paper proposes a novel approach
that leverages domain-specific embeddings to quantify paraphrase quality more accurately.
"""

# Readability scores
print(f"Flesch Reading Ease:     {textstat.flesch_reading_ease(text):.1f}")
print(f"Flesch-Kincaid Grade:    {textstat.flesch_kincaid_grade(text):.1f}")
print(f"Gunning Fog Index:       {textstat.gunning_fog(text):.1f}")
print(f"Coleman-Liau Index:      {textstat.coleman_liau_index(text):.1f}")
print(f"Automated Readability:   {textstat.automated_readability_index(text):.1f}")
print(f"Dale-Chall Readability:  {textstat.dale_chall_readability_score(text):.1f}")
print(f"Linsear Write Formula:   {textstat.linsear_write_formula(text):.1f}")
print(f"SPACHE Readability:      {textstat.spache_readability(text):.1f}")
print(f"Text Standard (avg):     {textstat.text_standard(text)}")

# Basic statistics
print(f"Lexicon count:     {textstat.lexicon_count(text)}")
print(f"Sentence count:    {textstat.sentence_count(text)}")
print(f"Char count (w/o sp): {textstat.char_count(text, ignore_spaces=True)}")
print(f"Syllable count:    {textstat.syllable_count(text)}")
print(f"Avg syllable/word: {textstat.avg_syllables_per_word(text):.2f}")
print(f"Avg words/sentence: {textstat.avg_sentence_length(text):.1f}")
```

## Core Capabilities / 核心能力

### 1. Readability Formulas / 可读性公式

textstat implements all major English readability formulas, each designed for different audiences and text types.

```python
import textstat

text = "Your paragraph of text here."

# Flesch Reading Ease (0-100, higher = easier)
#   90-100: 5th grade, 60-70: 8th-9th grade, 0-30: college graduate
flesch = textstat.flesch_reading_ease(text)

# Flesch-Kincaid Grade Level (US school grade)
fk_grade = textstat.flesch_kincaid_grade(text)

# Gunning Fog Index (years of education needed)
#   Penalizes heavily for words with 3+ syllables
fog = textstat.gunning_fog(text)

# Coleman-Liau Index (relies on character/word/sentence counts, not syllables)
cl = textstat.coleman_liau_index(text)

# Automated Readability Index (ARI) — characters per word, words per sentence
ari = textstat.automated_readability_index(text)

# Dale-Chall — uses a list of 3000 "familiar" words
dc = textstat.dale_chall_readability_score(text)

# Linsear Write — designed for military manuals, counts easy/hard words
lw = textstat.linsear_write_formula(text)

# SMOG Index — estimated years of education for 100% comprehension
smog = textstat.smog_index(text)

# SPACHE — designed for children's literature (grades 1-4)
spache = textstat.spache_readability(text)
```

### 2. Syllable Counting and Word Analysis / 音节统计与词分析

```python
import textstat

text = "Computational linguistics and natural language processing."

# Syllable counting per word
print(textstat.syllable_count(text))           # total syllables
print(textstat.avg_syllables_per_word(text))    # avg syllables/word

# Sentence-level metrics
print(textstat.sentence_count(text))
print(textstat.avg_sentence_length(text))       # avg words/sentence

# Word counting variants
print(textstat.lexicon_count(text))             # unique word count
print(textstat.lexicon_count(text, removepunct=True))

# Polysyllable words (3+ syllables) — key for Gunning Fog
words = text.split()
polysyllables = sum(1 for w in words if textstat.syllable_count(w) >= 3)
print(f"Polysyllable words: {polysyllables}/{len(words)}")
```

### 3. Composite Readability Grade / 综合可读性等级

`text_standard()` averages multiple formulas to produce a consensus grade level.

```python
import textstat

text = "The methodology employs a quasi-experimental design with difference-in-differences estimation."

# Returns a string like "10th and 11th grade"
grade = textstat.text_standard(text, float_output=False)
print(f"Consensus grade level: {grade}")

# Numeric output for statistical comparison
grade_num = textstat.text_standard(text, float_output=True)
print(f"Consensus grade (numeric): {grade_num:.1f}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Analyzing Academic Writing Complexity Across Sections / 分析论文各部分写作复杂度

```python
import textstat
import re

# Read paper sections (assuming plain text extraction)
sections = {
    "Abstract": open("paper/abstract.txt").read(),
    "Introduction": open("paper/introduction.txt").read(),
    "Methods": open("paper/methods.txt").read(),
    "Results": open("paper/results.txt").read(),
    "Discussion": open("paper/discussion.txt").read(),
}

results = []
for section_name, text in sections.items():
    results.append({
        "Section": section_name,
        "Flesch_Ease": round(textstat.flesch_reading_ease(text), 1),
        "FK_Grade": round(textstat.flesch_kincaid_grade(text), 1),
        "Gunning_Fog": round(textstat.gunning_fog(text), 1),
        "Coleman_Liau": round(textstat.coleman_liau_index(text), 1),
        "Avg_Sentence_Len": round(textstat.avg_sentence_length(text), 1),
        "Lexicon_Count": textstat.lexicon_count(text),
        "Sentence_Count": textstat.sentence_count(text),
    })

import pandas as pd
df = pd.DataFrame(results)
print(df.to_string(index=False))
df.to_csv("results/readability_by_section.csv", index=False)

# Identify most complex section
most_complex = df.loc[df["Flesch_Ease"].idxmin()]
print(f"\nMost complex section: {most_complex['Section']} "
      f"(Flesch={most_complex['Flesch_Ease']})")
```

### Workflow 2: Human vs AI Text Readability Comparison / 人类与AI文本可读性对比

```python
import textstat
import pandas as pd

human_texts = pd.read_csv("data/human_abstracts.csv")["abstract"]
ai_texts = pd.read_csv("data/ai_abstracts.csv")["abstract"]

def compute_metrics(texts, label):
    scores = {m: [] for m in [
        "flesch", "fk_grade", "fog", "coleman_liau",
        "avg_sent_len", "lexicon_count"
    ]}
    for t in texts:
        scores["flesch"].append(textstat.flesch_reading_ease(t))
        scores["fk_grade"].append(textstat.flesch_kincaid_grade(t))
        scores["fog"].append(textstat.gunning_fog(t))
        scores["coleman_liau"].append(textstat.coleman_liau_index(t))
        scores["avg_sent_len"].append(textstat.avg_sentence_length(t))
        scores["lexicon_count"].append(textstat.lexicon_count(t))
    return pd.DataFrame(scores)

human_df = compute_metrics(human_texts, "human")
ai_df = compute_metrics(ai_texts, "ai")

print("Human texts — mean readability:")
print(human_df.describe().loc["mean"])
print("\nAI texts — mean readability:")
print(ai_df.describe().loc["mean"])
```

## Best Practices / 最佳实践

- **Use multiple formulas, not just one**: Each formula has biases (Flesch penalizes long words, Coleman-Liau ignores syllables). Report at least 2-3 metrics / 综合使用多个公式
- **Set `removepunct=True` for cleaner word counts**: Punctuation artifacts from PDF extraction inflate lexicon counts / 去除标点避免计数偏差
- **Handle multi-language text with care**: textstat formulas are calibrated for English; for other languages, consider `textstat-easy` forks or language-specific libraries / 跨语言需使用专用库
- **Report confidence intervals**: For corpus-level analysis, use bootstrap resampling to estimate CI around readability scores / 报告置信区间

## Common Pitfalls / 常见陷阱

- **Syllable counting is approximate**: textstat uses a heuristic algorithm, not a dictionary. Uncommon words or abbreviations (e.g., "LLM", "RCT") may be miscounted. Verify with manual checks on a sample / 音节计数基于启发式规则
- **Sentence splitting fails on abbreviations**: "Dr. Smith et al. found..." is split into 3 sentences. Pre-process to remove or protect abbreviations / 缩写导致断句错误
- **Short texts produce unreliable scores**: Formulas assume 100+ word texts. Abstracts (<150 words) yield noisy estimates. Always report alongside sentence/word counts / 短文本指标不稳定
- **Flesch Reading Ease range is non-linear**: A drop from 70 to 50 is less meaningful than 30 to 10. Use grade-level metrics for easier interpretation / 分数范围非线性
- **text_standard averaging is opaque**: The consensus grade uses unweighted averaging of subset formulas, which may not align with your target audience / 综合等级计算方式不透明

## Integration with HBE / 与 HBE 集成

- Use with `workflows/paper-writing.md` to set readability targets per section (e.g., Abstract Flesch > 40, Discussion > 50)
- Pair with `references/writing-guide.md` for de-AIGC readability thresholds and plain-language guidelines
- Combine with `references/tools/matplotlib.md` to plot readability distributions across manuscript versions
- Integrate into CI checks: flag sections where FK Grade exceeds target journal norms

## Resources / 资源

- Documentation: https://textstat.readthedocs.io/
- GitHub: https://github.com/textstat/textstat
- Readability formulas overview: https://en.wikipedia.org/wiki/Readability_test
- Flesch-Kincaid original paper: Kincaid et al. (1975), "Derivation of New Readability Formulas"
- Health literacy guidelines: https://www.cms.gov/Medicare/Health-Plans/HealthPlanGenInfo/Downloads/AHP_Design_Manual.pdf
