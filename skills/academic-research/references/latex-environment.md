# LaTeX Environment Setup & Troubleshooting / LaTeX 环境配置与排错

Complete guide for setting up, configuring, and troubleshooting LaTeX environments across platforms and disciplines.
跨平台 LaTeX 环境配置、编译引擎选择与常见问题排查完整指南。

---

## 1. Installation / 安装

### 1.1 TeXLive (Recommended / 推荐)

TeXLive is the universal distribution supporting all disciplines and engines.

```bash
# macOS — Full install (recommended for research)
brew install --cask mactex

# macOS — Minimal install (saves ~4GB)
brew install --cask basictex
sudo tlmgr update --self
sudo tlmgr install collection-latexrecommended collection-fontsrecommended

# Ubuntu/Debian — Full
sudo apt install texlive-full

# Ubuntu/Debian — Minimal + discipline packages
sudo apt install texlive-latex-recommended texlive-fonts-recommended texlive-science texlive-publishers

# Windows
# Download installer from https://tug.org/texlive/acquire-netinstall.html
# Run install-tl-windows.exe → select "full" scheme

# Verify installation
tex --version
pdflatex --version
xelatex --version
lualatex --version
```

### 1.2 Overleaf (Cloud / 云端)

```bash
# Clone Overleaf project via Git
git clone https://git.overleaf.com/<project-id>

# Sync local changes back
cd <project-id>
# edit files...
git add . && git commit -m "update" && git push
```

**Limitations**: No custom .sty files in free tier. No shell-escape for minted. Compile timeout 1-6 min depending on plan.

### 1.3 Docker (CI/CD / 持续集成)

```bash
# Single compilation
docker run --rm -v $(pwd):/workspace texlive/texlive pdflatex main.tex

# Full pipeline (compile + bib + cross-refs)
docker run --rm -v $(pwd):/workspace texlive/texlive \
  bash -c "pdflatex main && bibtex main && pdflatex main && pdflatex main"

# Custom Dockerfile for project
FROM texlive/texlive:latest
RUN tlmgr install algorithm2e booktabs natbib
WORKDIR /workspace
```

---

## 2. Engine Selection / 编译引擎选择

### 2.1 Auto-Detection Rules / 自动检测规则

The compile script (`scripts/compile.sh`) and Makefile (`templates/Makefile`) use these rules:

```
if main.tex contains \usepackage{ctex} or \usepackage{xeCJK} or \begin{CJK}:
    ENGINE = xelatex
elif main.tex contains \usepackage{fontspec} or \usepackage{luatexja}:
    ENGINE = lualatex
elif main.tex contains \documentclass{beamer} with XeLaTeX-specific fonts:
    ENGINE = xelatex
else:
    ENGINE = pdflatex
```

### 2.2 Engine Comparison / 引擎对比

| Feature | pdflatex | xelatex | lualatex |
|---------|----------|---------|----------|
| **Speed** | Fastest | Moderate | Slowest |
| **Chinese/CJK** | No (needs CJKutf8) | Native (ctex/xeCJK) | Native (luatexja) |
| **Unicode** | Limited | Full | Full |
| **System Fonts** | No | Yes (fontspec) | Yes (fontspec) |
| **OpenType** | No | Yes | Yes |
| **Lua Scripting** | No | No | Yes |
| **Microtype** | Full | Full | Full |
| **minted** | Needs --shell-escape | Needs --shell-escape | Needs --shell-escape |
| **Best For** | English papers, speed | CJK, custom fonts | Advanced typography, Lua |

### 2.3 Discipline-Specific Engine Needs / 按学科选引擎

| Discipline | Typical Engine | Reason |
|-----------|---------------|--------|
| CS/AI (English) | pdflatex | Standard, fastest |
| Chinese Thesis | xelatex | ctex/xeCJK required |
| Physics (APS) | pdflatex | revtex4-2 standard |
| Mathematics | pdflatex | amsmath standard |
| Linguistics | xelatex | Unicode IPA symbols |
| Engineering | pdflatex | IEEE standard |
| Humanities | xelatex/lualatex | Custom fonts, Unicode |

---

## 3. Package Management / 包管理

### 3.1 Core Packages by Category / 按类别核心包

| Category | Packages | Purpose |
|----------|----------|---------|
| **Math** | amsmath, amssymb, mathtools, bm, unicode-math | Equations, symbols |
| **Algorithms** | algorithm2e, algorithmicx | Pseudocode |
| **Figures** | graphicx, subcaption, float, wrapfig | Image handling |
| **Tables** | booktabs, multirow, tabularx, longtable | Professional tables |
| **Plots** | pgfplots, tikz, tikz-cd | Diagrams, plots |
| **Code** | listings, minted | Source code display |
| **Cross-refs** | cleveref, hyperref, xr-hyper | Smart referencing |
| **Typography** | microtype, enumitem, parskip | Fine-tuning |
| **Chinese** | ctex, xeCJK, zhnumber | Chinese typesetting |
| **Bibliography** | natbib, biblatex, biber | Citation management |
| **Page Layout** | geometry, fancyhdr, titlesec | Layout control |
| **Appendix** | appendix, subfiles | Document structure |
| **Review** | changes, todonotes | Draft annotations |
| **Landscape** | pdflscape, rotating | Landscape pages |

### 3.2 Package Installation / 包安装

```bash
# Search for a package
tlmgr search --global --file "/algorithm2e.sty"

# Install a package
sudo tlmgr install algorithm2e

# Install multiple packages
sudo tlmgr install algorithm2e booktabs natbib pgfplots

# Update all packages
sudo tlmgr update --all

# List installed packages
tlmgr list --only-installed

# Check if a package is installed
kpsewhich algorithm2e.sty
```

### 3.3 Package Conflict Resolution / 包冲突解决

| Conflict | Symptoms | Fix |
|----------|----------|-----|
| `hyperref` load order | Cross-refs broken, warnings | Load `hyperref` LAST (before `cleveref`) |
| `natbib` vs `biblatex` | Citation commands fail | Use only one — check venue requirement |
| `subcaption` vs `subfigure` | Caption errors | Use `subcaption` (modern); remove `subfigure` |
| `inputenc` + xelatex | Encoding error | Remove `inputenc` when using xelatex |
| `fontenc` + xelatex | Font error | Remove `fontenc` when using xelatex |
| `amsmath` + `unicode-math` | Symbol conflict | Use only one; `unicode-math` for xelatex/lualatex |

---

## 4. Compilation Pipeline / 编译流水线

### 4.1 Multi-Pass Compilation / 多遍编译

LaTeX requires multiple passes to resolve cross-references, citations, and page layout:

```
Pass 1: pdflatex main.tex    → .aux (references), .toc (TOC)
Pass 2: bibtex main          → .bbl (bibliography) or biber main
Pass 3: pdflatex main.tex    → resolves citations in text
Pass 4: pdflatex main.tex    → resolves page cross-refs, final layout
```

### 4.2 Using latexmk / 使用 latexmk

```bash
# Auto multi-pass (recommended for development)
latexmk -pdf main.tex

# With specific engine
latexmk -xelatex main.tex
latexmk -lualatex main.tex

# Continuous compilation (auto-recompile on save)
latexmk -pdf -pvc main.tex

# Clean auxiliary files
latexmk -c main.tex    # clean aux files, keep PDF
latexmk -C main.tex    # clean everything including PDF
```

### 4.3 Using the Project Makefile / 使用项目 Makefile

The template Makefile (`templates/Makefile`) provides:

```bash
make            # Full build (detect engine, compile, bib, clean)
make quick      # Single pass (fast preview)
make view       # Build + open PDF
make clean      # Remove auxiliary files
make distclean  # Remove all generated files
make debug      # Verbose compilation output
make words      # Word count
make check      # Validate structure (section labels, figures, refs)
```

### 4.4 Using compile.sh / 使用编译脚本

```bash
# Basic compilation
bash scripts/compile.sh main.tex

# With specific engine
bash scripts/compile.sh -e xelatex main.tex

# With bibliography
bash scripts/compile.sh -b main.tex

# Clean build
bash scripts/compile.sh -c main.tex

# Full options
bash scripts/compile.sh -e xelatex -b -c main.tex
```

---

## 5. Chinese/CJK Support / 中文支持

### 5.1 Minimal Chinese Paper / 最简中文论文

```latex
\documentclass{article}
\usepackage{ctex}          % Auto-detects engine (xelatex recommended)
\usepackage{amsmath}
\usepackage{booktabs}

\title{中文论文标题}
\author{作者姓名}

\begin{document}
\maketitle
正文内容...
\end{document}
```

### 5.2 Chinese Thesis / 中文学位论文

```latex
\documentclass[12pt,a4paper,openany]{ctexbook}
% Or use university-specific class:
% \documentclass{thuthesis}  % 清华
% \documentclass{pkuthss}    % 北大
% \documentclass{zjuthesis}  % 浙大

\usepackage{xeCJK}
\setCJKmainfont{SimSun}     % 宋体 — 正文
\setCJKsansfont{SimHei}     % 黑体 — 标题
\setCJKmonofont{FangSong}   % 仿宋 — 摘要

% CJK font alternatives (macOS):
% \setCJKmainfont{Songti SC}
% \setCJKsansfont{Heiti SC}
% \setCJKmonofont{STFangsong}
```

### 5.3 Mixed Language Documents / 中英混排

```latex
\usepackage{ctex}
\usepackage{xeCJK}

% Auto font assignment
\setCJKmainfont{SimSun}[AutoFakeBold=true, AutoFakeSlant=true]
\setmainfont{Times New Roman}      % English serif
\setsansfont{Arial}                 % English sans-serif
\setmonofont{Courier New}           % English monospace
```

---

## 6. Common Errors & Fixes / 常见错误与修复

### 6.1 Compilation Errors / 编译错误

| Error | Cause | Fix |
|-------|-------|-----|
| `! Undefined control sequence` | Misspelled command or missing package | Check spelling; install missing package |
| `! File not found` | Missing .sty/.cls/.bib file | `kpsewhich <name>` to verify; install or copy file |
| `! Missing $ inserted` | Math symbol outside math mode | Wrap in `$...$` or `\(...\)` |
| `! Extra alignment tab` | Too many `&` in table row | Count columns in `\begin{tabular}` |
| `! LaTeX Error: File ended while scanning` | Unclosed brace or environment | Check for missing `}` or `\end{...}` |
| `! Package natbib Error: Bibliography not compatible` | Wrong .bst file | Check venue requirement |
| `! Font shape not available` | Missing font | Install font; or use `\usepackage{lmodern}` |
| `Too many unprocessed floats` | LaTeX can't place figures | Add `\clearpage` or use `[htbp]` placement |
| `Rerun to get cross-references right` | Incomplete compilation | Run pdflatex again (or use latexmk) |
| `Citation 'key' on page X undefined` | Missing bibliography run | Run bibtex/biber, then pdflatex twice |

### 6.2 Font Issues / 字体问题

```bash
# List available fonts (system)
fc-list :lang=zh              # Chinese fonts
fc-list | grep -i times       # Times-like fonts

# Check if a font is available to XeLaTeX
xelatex -output-driver="xdvipdfmx -q" <<< '\documentclass{article}\usepackage{fontspec}\setmainfont{Times New Roman}\begin{document}test\end{document}'

# Rebuild font cache
sudo fc-cache -fv
sudo mktexlsr
```

### 6.3 Bibliography Issues / 参考文献问题

```bash
# Common: biber not found
sudo tlmgr install biber

# Common: bibtex vs biber conflict
# Check your .bib file encoding (must be UTF-8 for biber)
file references.bib

# Common: broken BibTeX entry
# Validate at https://flamingtempura.github.io/bibtex-tidy/
```

---

## 7. IDE & Editor Integration / 编辑器集成

| Editor | LaTeX Plugin | Features |
|--------|-------------|----------|
| **VS Code** | LaTeX Workshop | Auto-compile, preview, IntelliSense, syncTeX |
| **TeXShop** | Built-in (macOS) | Simple, integrated with MacTeX |
| **TeXstudio** | Built-in | Cross-platform, feature-rich |
| **Vim/Neovim** | vimtex | Compilation, navigation, completion |
| **Emacs** | AUCTeX | Advanced editing, compilation, preview |
| **Sublime Text** | LaTeXTools | Build, preview, completion |

### 7.1 VS Code Configuration / VS Code 配置

```json
// .vscode/settings.json
{
  "latex-workshop.latex.recipe": [
    { "name": "latexmk (xelatex)", "tools": ["latexmk-xelatex"] },
    { "name": "latexmk (pdflatex)", "tools": ["latexmk-pdflatex"] }
  ],
  "latex-workshop.latex.tool": [
    { "name": "latexmk-xelatex", "command": "latexmk", "args": ["-xelatex", "-synctex=1", "-interaction=nonstopmode", "%DOC%"] },
    { "name": "latexmk-pdflatex", "command": "latexmk", "args": ["-pdf", "-synctex=1", "-interaction=nonstopmode", "%DOC%"] }
  ],
  "latex-workshop.latex.autoBuild.run": "onFileChange",
  "latex-workshop.view.pdf.viewer": "tab"
}
```

---

## 8. Performance Optimization / 性能优化

### 8.1 Large Document Strategies / 大文档策略

```latex
% Use subfiles for modular compilation
\usepackage{subfiles}
% Each chapter can be compiled independently for faster iteration

% Or use \include (forces page break) / \input (no page break)
\include{chapters/introduction}   % Page break before
\input{sections/method}           % No page break

% Exclude chapters during draft
%\include{chapters/appendix}      % Comment out to skip
```

### 8.2 Figure Optimization / 图片优化

```bash
# Convert to PDF (vector, smaller)
inkscape -D -z --file=fig.svg --export-pdf=fig.pdf

# Compress large images
convert -density 300 -quality 85 figure.png figure.pdf

# Batch convert
for f in figures/*.svg; do
  inkscape -D -z --file="$f" --export-pdf="${f%.svg}.pdf"
done
```

### 8.3 Compilation Speed / 编译速度

```bash
# Use draft mode for faster preview
pdflatex -draftmode main.tex    # No figures, faster
# Remove -draftmode for final build

# Disable syncTeX for speed (no source-PDF sync)
pdflatex -nosynctex main.tex

# Use latexmk with -pvc for continuous preview
latexmk -pdf -pvc -norc main.tex
```

---

## 9. Environment Check Script / 环境检查脚本

```bash
# Run the bundled environment check
bash skills/academic-research/scripts/check-environment.sh

# Output:
# ✓ pdflatex:  found (/usr/local/bin/pdflatex)
# ✓ xelatex:   found (/usr/local/bin/xelatex)
# ✓ lualatex:  found (/usr/local/bin/lualatex)
# ✓ bibtex:    found
# ✓ biber:     found
# ✗ minted:    not installed (install: tlmgr install minted)
```

---

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| LaTeX distribution | TeXLive | `brew install --cask mactex` |
| Auto compilation | latexmk | Included in TeXLive |
| Project Makefile | GNU Make | system |
| PDF metadata | exiftool | `brew install exiftool` |
| Word count | texcount | `tlmgr install texcount` |
| PDF pages check | pdfinfo | Included in poppler |
| Figure conversion | Inkscape | `brew install --cask inkscape` |
| Image processing | ImageMagick | `brew install imagemagick` |
| BibTeX validation | bibtex-tidy | `npm install -g bibtex-tidy` |
| Diff for camera-ready | latexdiff | `tlmgr install latexdiff` |
| Spell check | aspell + language dict | `brew install aspell` |

## Integration / 集成

- **`scripts/compile.sh`** — uses engine auto-detection rules from Section 2.1
- **`scripts/check-environment.sh`** — verifies all tools listed in Section 9
- **`templates/Makefile`** — wraps compile.sh with standard make targets
- **`references/latex-environment.md`** — this file; linked from sub-commands 1 (check-env) and 6 (compile) in SKILL.md
- **`references/journal-templates-guide.md`** — venue-specific style files and formatting requirements
- **`references/citation-workflow.md`** — bibliography tool configuration (natbib/biblatex/biber)
- **`workflows/paper-writing.md`** — references compile pipeline in Phase 4
