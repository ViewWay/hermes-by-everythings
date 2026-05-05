---
name: scientific-slides
description: Scientific presentation design — academic talk slides with effective visual communication
domain: Research / Presentation
install: N/A (methodology)
---

# Scientific Slides

Academic presentations — conference talks, seminar series, thesis defenses, and lab meetings — require a distinct design approach compared to business presentations. The goal is to communicate research findings clearly, build credibility, and stimulate discussion. This guide covers slide structure, visual hierarchy, data presentation, timing, and Q&A preparation.

## When to Use

- Preparing a conference talk (10-20 minutes, typically 10-15 slides)
- Designing a seminar or colloquium presentation (45-60 minutes, 25-40 slides)
- Building thesis defense slides (20-30 minutes, 15-25 slides)
- Creating lab meeting presentation slides
- Designing a poster-style talk or lightning talk (5 minutes, 3-5 slides)
- Preparing supplementary slides for Q&A backup

## Quick Start

The fundamental rule of scientific slides: **one idea per slide, one slide per idea**. Every slide should answer a single question.

```
Slide Anatomy:
┌─────────────────────────────────────┐
│  Title (question or key point)       │  <- What question does this answer?
├─────────────────────────────────────┤
│                                      │
│   [Visual: figure, diagram, or       │  <- Show, don't tell
│    minimal text (3-5 bullet points)] │
│                                      │
├─────────────────────────────────────┤
│  Source / Note (small, bottom)       │  <- Attribution or context
└─────────────────────────────────────┘
```

## Core Capabilities

### 1. Slide Structure and Visual Hierarchy

**Opening slides** (first 3-5 slides):
1. Title slide — title, authors, affiliations, date, conference name
2. Motivation — why does this problem matter? Use a compelling example or statistic.
3. Problem statement — clear, specific, and concise. The audience should know exactly what you are solving.
4. Overview/outline — roadmap of the talk (optional for short talks)

**Body slides** (main content, 70% of talk):
- Limit to 3-5 bullet points per slide
- Use full sentences only for key claims; use fragments for supporting points
- Left-align text (never center body text)
- Use bold for emphasis, not underline or ALL CAPS

**Closing slides** (last 3-4 slides):
- Summary — restate the key result and its implication (1 slide)
- Limitations and future work (1 slide)
- Thank you / acknowledgments (1 slide)
- Backup slides for Q&A (not included in main slide count)

### 2. Data-to-Ink Ratio in Slides

Slides must maximize the proportion of ink spent on data versus decoration.

- **Remove**: distracting backgrounds, animations (use sparingly), clip art, decorative borders.
- **Keep**: axis labels, units, legends, data annotations.
- **Font size**: minimum 24pt for body text, 18pt for axis labels on figures.
- **Contrast**: dark text on light background (or light on dark). Never use low-contrast combinations.
- **Color**: use the same palette as your paper figures for consistency. Limit to 3-4 colors.

```python
# Beamer (LaTeX) example for a clean scientific slide
"""
\begin{frame}{Our method outperforms baselines on 3 benchmarks}
\begin{columns}
\begin{column}{0.55\textwidth}
  \includegraphics[width=\textwidth]{figures/results_bar.pdf}
\end{column}
\begin{column}{0.42\textwidth}
  \begin{itemize}
    \item \textbf{12.3\%} improvement on Benchmark A
    \item Consistent gains across all metrics
    \item Statistical significance: $p < 0.001$
  \end{itemize}
\end{column}
\end{columns}
\end{frame}
"""
```

### 3. Timing and Pacing

| Talk Length | Slides | Slides/Minute | Preparation Time |
|-------------|--------|---------------|------------------|
| 5 min (lightning) | 3-5 | 0.6-1.0 | 2 hours |
| 12 min (conference) | 10-15 | 0.8-1.25 | 1 day |
| 20 min (keynote short) | 15-20 | 0.75-1.0 | 2 days |
| 45 min (seminar) | 30-40 | 0.7-0.9 | 3-4 days |
| 60 min (colloquium) | 40-50 | 0.7-0.8 | 5+ days |

**Pacing rule**: Spend 1-2 minutes on motivation, 1 minute on overview, the bulk on results, and 2-3 minutes on summary. Practice with a timer at least 3 times.

## Common Academic Workflow

### Workflow: Preparing a 15-Minute Conference Talk

1. **Outline the narrative** — write the 5 key points you want the audience to remember.
2. **Create slide titles first** — each title should be a full sentence or key claim (not a topic label).
3. **Add figures** — place your paper figures first, then write minimal bullet points around them.
4. **Add a results summary slide** — one slide with the main numerical results in a table.
5. **Prepare backup slides** — anticipate reviewer questions; prepare 5-10 additional slides with extra data, ablations, or proofs.
6. **Rehearse 3 times** — first run: read from notes; second run: speak freely; third run: timed, standing up.
7. **Final pass** — remove any slide that does not directly support your narrative. Less is more.

## Best Practices

1. **Slide titles as takeaways** — "Our method reduces training time by 40%" is better than "Results".
2. **Animate sparingly** — use builds only when sequencing is critical (e.g., algorithm steps). Never animate bullet points one-by-one.
3. **Repeat the question** — before answering in Q&A, repeat the question so the audience hears it.
4. **Point at the screen, not the laptop** — use a laser pointer or physical gesture.
5. **End strong** — the last thing you say should be the most memorable. Restate your key contribution.

## Common Pitfalls

1. **Too many slides**: Rushing through 25 slides in 12 minutes overwhelms the audience. Cut ruthlessly.
2. **Reading from slides**: If your slides contain full paragraphs, the audience will read ahead and stop listening. Use fragments.
3. **Small figures**: Figures designed for print (8pt font) are illegible on a projector. Redesign at 18pt+ minimum.
4. **No narrative arc**: A list of "here is what we did" slides without motivation or framing loses the audience in the first 2 minutes.
5. **Ignoring time**: Going over time disrespects the audience and the session chair. Practice with a timer.

## Integration with HBE

- Use within `workflows/paper-writing.md` when preparing a conference talk based on a submitted paper.
- Pair with `references/tools/scientific-visualization.md` to ensure figures are optimized for projection.
- Combine with `references/tools/venue-templates.md` to use conference-specific slide templates.
- Use `/hbe:review` to get feedback on slide clarity, pacing, and narrative structure.

## Resources

- "The Craft of Scientific Presentations" — Michael Alley (highly recommended)
- Beamer documentation: https://ctan.org/pkg/beamer
- Google Slides / PowerPoint: acceptable for informal talks; use LaTeX Beamer for formal conferences
- Speaking timer tools: https://www.timetospeak.co/
- "How to Give a Talk" — Patrick Winston (MIT): classic lecture on academic presentations
