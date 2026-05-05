---
name: latex-posters
description: LaTeX academic poster templates — beamerposter and tikzposter for conference poster sessions
domain: Research / Posters
install: tlmgr install beamerposter tikzposter
---

# LaTeX Academic Posters

## Overview

LaTeX provides two main frameworks for conference posters: `beamerposter` (built on Beamer's block model) and `tikzposter` (TikZ-based with flexible layouts). Both produce high-quality, scalable PDF posters suitable for large-format printing at academic conferences.

## When to Use

- Creating a conference poster (A0, A1, or custom sizes)
- Presenting preliminary results at poster sessions
- Building reproducible poster templates for a research group
- When precise typographic control and vector graphics are required
- When conference organizers request PDF submissions

## Quick Start

### beamerposter Template

```latex
\documentclass[final]{beamer}
\usepackage[orientation=portrait, size=a0, scale=1.4]{beamerposter}
\usetheme{default}

\title{Research Title Goes Here}
\author{Author Name \and Collaborator Name}
\institute{Department of Science, University Name}

\begin{document}
\begin{frame}[t]
  \begin{columns}[t]
    \begin{column}{0.48\linewidth}
      \begin{block}{Introduction}
        Your introduction text here. Use bullet points for clarity.
        \begin{itemize}
          \item Background context
          \item Research question
          \item Key hypothesis
        \end{itemize}
      \end{block}
      \begin{block}{Methods}
        Description of your experimental methodology.
      \end{block}
    \end{column}
    \begin{column}{0.48\linewidth}
      \begin{block}{Results}
        \begin{figure}
          \centering
          \includegraphics[width=0.9\linewidth]{figures/result.pdf}
          \caption{Main experimental result.}
        \end{figure}
      \end{block}
      \begin{block}{Conclusions}
        Key findings and future directions.
      \end{block}
    \end{column}
  \end{columns}
\end{frame}
\end{document}
```

### tikzposter Template

```latex
\documentclass[final]{tikzposter}
\usetheme{Default}
\usecolorstyle{Australia}

\title{Research Title}
\author{Author and Collaborators}
\institute{University Name}

\begin{document}
\begin{frame}[t]
  \begin{columns}[t]
    \begin{column}{0.47\textwidth}
      \begin{block}{Introduction}
        Content goes here with bullet points:
        \begin{itemize}
          \item Point one
          \item Point two
          \item Point three
        \end{itemize}
      \end{block}
      \begin{block}{Methods}
        Methodology description.
      \end{block}
    \end{column}
    \begin{column}{0.47\textwidth}
      \begin{block}{Results}
        \begin{figure}
          \centering
          \includegraphics[width=\linewidth]{figures/main_result.pdf}
        \end{figure}
      \end{block}
      \begin{block}{Conclusions}
        Summary of key findings.
      \end{block}
    \end{column}
  \end{columns}
\end{frame}
\end{document}
```

## Core Capabilities

### 1. Column and Block Layout

Both frameworks use a column-block hierarchy for organizing poster content.

```latex
% beamerposter: three-column layout
\begin{columns}[t]
  \begin{column}{0.31\linewidth}
    \begin{block}{Column 1 Title} ... \end{block}
    \begin{alertblock}{Highlight} ... \end{alertblock}
  \end{column}
  \begin{column}{0.31\linewidth}
    \begin{block}{Column 2 Title} ... \end{block}
  \end{column}
  \begin{column}{0.31\linewidth}
    \begin{block}{Column 3 Title} ... \end{block}
    \begin{exampleblock}{Example} ... \end{exampleblock}
  \end{column}
\end{columns}

% tikzposter: custom column spacing
\begin{columns}[t]
  \separatorcolumn
  \begin{column}{0.02\textwidth}\end{column}  % Left margin
  \begin{column}{0.46\textwidth}
    \begin{block}{Left Column} ... \end{block}
  \end{column}
  \begin{column}{0.02\textwidth}\end{column}  % Gutter
  \begin{column}{0.46\textwidth}
    \begin{block}{Right Column} ... \end{block}
  \end{column}
  \begin{column}{0.02\textwidth}\end{column}  % Right margin
  \separatorcolumn
\end{columns}
```

### 2. Figure Placement and Sizing

```latex
% Single figure spanning block width
\begin{figure}
  \centering
  \includegraphics[width=0.85\linewidth]{figures/result.pdf}
  \caption{Caption text at readable size.}
\end{figure}

% Side-by-side figures
\begin{figure}
  \centering
  \includegraphics[width=0.45\linewidth]{fig1.pdf}
  \hfill
  \includegraphics[width=0.45\linewidth]{fig2.pdf}
  \caption{(a) Result A. (b) Result B.}
\end{figure}

% tikzposter: use \node for precise placement
\node[inner sep=0pt] (myfig) at (current page.center)
  {\includegraphics[width=0.6\textwidth]{figures/result.pdf}};
```

### 3. Color Scheme Selection

```latex
% tikzposter built-in color styles
\usecolorstyle{Default}      % Blue header, white body
\usecolorstyle{Australia}    % Warm gradient
\usecolorstyle{Chalmers}     % Blue/white
\usecolorstyle{Rosenpass}    % Green tones

% beamerposter: custom colors
\definecolor{posterblue}{RGB}{0, 74, 153}
\setbeamercolor{block title}{fg=white, bg=posterblue}
\setbeamercolor{block body}{fg=black, bg=posterblue!10}

% tikzposter: fully custom
\setbeamercolor{block title}{fg=white, bg=posterblue}
\setbeamercolor{block body}{bg=posterblue!5}
```

## Common Academic Workflow

### Conference Poster from Paper Content

```bash
# Step 1: Start from template
cp templates/poster/beamerposter-template.tex poster.tex

# Step 2: Extract key figures from paper (crop for poster use)
for f in figures/main_*.pdf; do pdfcrop "$f" "${f%.pdf}_cropped.pdf"; done

# Step 3: Compile poster
pdflatex poster.tex && pdflatex poster.tex

# Step 4: Check file size (print shops often require <50MB)
ls -lh poster.pdf

# Step 5: Export to high-resolution PNG for preview
convert -density 150 poster.pdf poster_preview.png
```

## Best Practices

1. **Limit text**: Posters should be 300-800 words. Use bullet points, not paragraphs.
2. **Font size matters**: Body text should be 24-36pt at A0 scale; titles 72pt+.
3. **High-contrast colors**: Ensure readability from 1-2 meters away.
4. **Use vector graphics**: PDF/SVG figures scale without pixelation at large print sizes.
5. **Include QR codes**: Link to paper preprint, code repository, or supplementary data.

## Common Pitfalls

1. **Too much text**: Posters are visual media — aim for 40% figures, 30% white space, 30% text.
2. **Low-resolution images**: Raster images under 150 DPI will look blurry when printed at A0.
3. **Wrong orientation**: Check conference requirements — most prefer portrait but some require landscape.
4. **Missing fonts at print shop**: Embed fonts or use standard LaTeX fonts (Computer Modern, Latin Modern).

## Integration with HBE

- Use with `references/tools/matplotlib.md` to generate poster figures at correct dimensions
- Pair with `references/tools/pdfcrop.md` to clean figure margins before inclusion
- Supports `workflows/paper-writing.md` for extracting poster content from paper drafts
- See `references/tools/scientific-schematics.md` for diagram creation

## Resources

- beamerposter documentation: https://ctan.org/pkg/beamerposter
- tikzposter documentation: https://ctan.org/pkg/tikzposter
- Poster examples gallery: https://www.latextemplates.com/cat/6-posters
