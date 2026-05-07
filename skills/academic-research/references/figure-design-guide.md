# Scientific Figure Design Guide / 科研作图设计指南

Methodology for designing the three load-bearing figures in academic papers.
学术论文中三张承重图的设计方法论。

> **Source / 来源**: Distilled from [HKUSTDial/Supervisor-Skills](https://github.com/HKUSTDial/Supervisor-Skills) Handbook Ch.4 — 科研作图指南。
> Adapted for HBE academic-research skill pack.

## Three Load-Bearing Figures / 三张承重图

Most top-venue papers are held up by three key figures. Design them deliberately, not as afterthoughts.
大多数顶会论文由三张关键图支撑。需要刻意设计，而非事后补充。

### Figure 1: Motivated Example / 动机示例图

**Position**: First figure, usually in Section 1 (Introduction).
**位置**: 第一张图，通常在 Section 1 (Introduction)。

**Purpose / 目的**: Make the reader *feel* why existing methods fail and why your approach is needed.
让读者*感受*到为什么现有方法失败，为什么需要你的方法。

**Design Principles / 设计原则**:

| Principle 原则 | Description 描述 |
|---|---|
| Concrete instance 具体实例 | Use a real example from your data/domain, not abstract illustration 使用真实数据/领域的实例 |
| Side-by-side comparison 并排对比 | Show existing method failure vs. your method's success 左侧展示现有方法的失败，右侧展示你的成功 |
| Visual first 文字辅助 | The figure should tell the story without reading the caption 图本身应能讲述故事 |
| One message 一个信息 | Only convey one core limitation of existing methods 只传达现有方法的一个核心局限 |

**Common Anti-Patterns / 常见反模式**:
- Too much text — should be a figure, not a diagram with paragraphs / 文字过多
- No clear "before/after" contrast / 无清晰的"前后"对比
- Uses synthetic/fake data instead of real examples / 使用合成/假数据而非真实示例
- Tries to show all contributions at once / 试图一次展示所有贡献

### Figure 2: Solution Overview / 方法总览图

**Position**: First figure in the Method section.
**位置**: Method 章节的第一张图。

**Purpose / 目 of**: Show the architecture/pipeline of your proposed method, with module-challenge correspondence.
展示提出方法的架构/流水线，体现模块与挑战的对应关系。

**Design Principles / 设计原则**:

| Principle 原则 | Description 描述 |
|---|---|
| Module-challenge mapping 模块-挑战对应 | Each module in the figure maps to exactly one challenge stated in the Intro 图中每个模块精确对应 Introduction 中提出的一个挑战 |
| Data flow clarity 数据流清晰 | Show how input flows through modules to output 展示输入如何流经各模块变为输出 |
| Consistent notation 符号一致 | Use same symbols/notation as in the paper text 使用与论文正文相同的符号/记号 |
| Color coding 配色方案 | Use a consistent color scheme: 2-3 colors maximum, one for "ours", one for "existing" 使用一致的配色：最多 2-3 种颜色 |

**Layout Templates / 布局模板**:

```
┌──────────────────────────────────────────────┐
│  Input → [Module A] → [Module B] → Output    │
│            ↓            ↓                     │
│          (C1)         (C2)                    │
│  where C1, C2 = challenges from Introduction │
└──────────────────────────────────────────────┘
```

**Common Anti-Patterns / 常见反模式**:
- Too many arrows creating "spaghetti" diagram / 箭头过多形成"面条图"
- Modules not aligned with Introduction challenges / 模块与 Introduction 挑战不对齐
- Missing input/output boundaries / 缺少输入/输出边界

### Figure 3: Experimental Results / 实验结果图

**Position**: In the Experiments section, usually showing main comparison results.
**位置**: 实验章节，通常展示主要对比结果。

**Purpose / 目的**: Visually demonstrate that your method outperforms baselines on key metrics.
直观展示你的方法在关键指标上优于基线方法。

**Design Principles / 设计原则**:

| Principle 原则 | Description 描述 |
|---|---|
| Direct motivation response 直接回应动机 | The experiment must directly answer the "why" from your motivated example 实验必须直接回答动机示例中的"为什么" |
| Clean axis labels 坐标轴标注清晰 | Always label axes with metric name, dataset, and unit 始终标注指标名称、数据集和单位 |
| Error bars 误差线 | Always show variance (std dev or confidence interval) 始终展示方差 |
| Highlight yours 突出你的方法 | Bold or colored differently for your method, gray for baselines 你的方法用粗体或不同颜色，基线用灰色 |

**Visualization Types by Task / 按任务选择图表类型**:

| Task 任务 | Recommended Plot 推荐图表 | Avoid 避免 |
|---|---|---|
| Performance comparison 性能对比 | Bar chart with error bars, radar chart | Tables-only presentation |
| Ablation study 消融实验 | Horizontal bar chart showing Δ performance | Bar chart without Δ values |
| Scaling behavior 规模行为 | Line plot with log scale x-axis | Linear scale for exponential data |
| Qualitative results 定性结果 | Side-by-side grid (input/output/baseline/ours) | Only showing successful cases |
| Attention/heatmap 注意力图 | Heatmap with diverging colormap | Rainbow colormap |

## Tool Selection / 工具选择

| Tool 工具 | Best For 适用场景 | Pros 优点 | Cons 缺点 |
|---|---|---|---|
| **TikZ/PGFPlots** | Architecture diagrams, plots in papers 系统架构图、论文内绘图 | Native LaTeX, vector, consistent style 学习曲线陡 |
| **matplotlib** | Experimental plots 实验结果图 | Python ecosystem, customizable | Default style needs tuning |
| **seaborn** | Statistical plots 统计图表 | Beautiful defaults, statistical viz | Less flexible than matplotlib |
| **draw.io/Excalidraw** | Quick architecture sketches 快速架构草图 | Fast, easy, collaborative | Not publication-ready quality |
| **Inkscape** | Final polishing of vector graphics 矢量图最终润色 | Full SVG editing | Manual work |
| **PPT/Keynote** | Layout design, alignment checks 布局设计、对齐检查 | Fast iteration | Need export to vector |

**Recommendation / 推荐**: Use Python (matplotlib/seaborn) for data-driven plots, TikZ for architecture diagrams, Inkscape for final polish.
数据驱动图用 Python (matplotlib/seaborn)，架构图用 TikZ，最终润色用 Inkscape。

## Figure Checklist / 作图检查清单

### Before Drawing / 画图前
- [ ] What is the ONE message this figure should convey? 这张图要传达的**一个**信息是什么？
- [ ] Which Introduction challenge/claim does it support? 它支撑 Introduction 中的哪个挑战/论点？
- [ ] Have I collected all necessary data/results? 是否已收集所有必要数据/结果？

### During Drawing / 画图中
- [ ] Font size readable when printed? (≥8pt in final paper) 字号在打印时可读吗？
- [ ] Color scheme consistent with other figures? 配色与其他图一致吗？
- [ ] All axes labeled with units? 所有坐标轴都标注了单位吗？
- [ ] Legend readable without caption? 不看 caption 也能读懂图例吗？

### After Drawing / 画图后
- [ ] Does it render correctly at 300 DPI minimum? 300 DPI 以上渲染正确吗？
- [ ] Vector format (PDF/SVG) preferred over raster? 优先使用矢量格式 (PDF/SVG)？
- [ ] Does it look good in both color and grayscale? 彩色和灰度都好看吗？

## LaTeX Templates / LaTeX 模板

### Motivated Example (Side-by-Side)
```latex
\begin{figure}[t]
\centering
\begin{minipage}[t]{0.48\textwidth}
  \centering
  \includegraphics[width=\textwidth]{fig/motivation_before.pdf}
  \caption*{(a) Existing Method}
\end{minipage}
\hfill
\begin{minipage}[t]{0.48\textwidth}
  \centering
  \includegraphics[width=\textwidth]{fig/motivation_after.pdf}
  \caption*{(b) Ours}
\end{minipage}
\caption{Motivated example on [Dataset/Task]. (a) Existing methods fail because [reason]. (b) Our method successfully [achievement].}
\label{fig:motivated-example}
\end{figure}
```

### Solution Overview (TikZ Pipeline)
```latex
\begin{figure}[t]
\centering
\begin{tikzpicture}[
    node distance=1.5cm,
    block/.style={rectangle, draw, rounded corners, minimum width=2.5cm, minimum height=1cm, align=center, font=\small},
    arrow/.style={->, >=stealth, thick}
]
\node[block, fill=blue!10] (input) {Input\\数据输入};
\node[block, fill=green!10, right=of input] (modA) {Module A\\模块 A};
\node[block, fill=orange!10, right=of modA] (modB) {Module B\\模块 B};
\node[block, fill=red!10, right=of modB] (output) {Output\\输出};
\draw[arrow] (input) -- (modA) node[midway, above, font=\scriptsize] {C1};
\draw[arrow] (modA) -- (modB) node[midway, above, font=\scriptsize] {C2};
\draw[arrow] (modB) -- (output);
\end{tikzpicture}
\caption{Overview of our proposed method. Module A addresses Challenge 1 (C1); Module B addresses Challenge 2 (C2).}
\label{fig:solution-overview}
\end{figure}
```

## Integration with HBE / 与 HBE 集成

1. Run `/hbe-academic figure-design` to get figure-specific design advice
   运行 `/hbe-academic figure-design` 获取针对具体图的设计建议
2. Use with `workflows/paper-writing.md` Phase 3 (Visual Elements)
   与 `workflows/paper-writing.md` 第三阶段（视觉元素）配合使用
3. TikZ templates available in `templates/` directories
   TikZ 模板可在 `templates/` 目录中找到

## References / 参考文献

- Supervisor-Skills Handbook Ch.4: Scientific Plotting / 手册第四章
- `references/writing-guide.md` — Academic writing principles
- `references/journal-templates-guide.md` — Venue-specific formatting

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| Vector figures | Inkscape | `brew install --cask inkscape` |
| TikZ diagrams | tikz (LaTeX) | included in TeXLive |
| Plot generation | matplotlib + seaborn | `pip install matplotlib seaborn` |
| Architecture diagrams | draw.io / Excalidraw | web / VS Code |
| Image optimization | ImageMagick | `brew install imagemagick` |
| Color palettes | coolors.co | web tool |
| SVG to PDF | Inkscape CLI | `inkscape -D --export-pdf` |
