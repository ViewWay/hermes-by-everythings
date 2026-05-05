---
name: latexdiff
description: LaTeX diff utility — compare two LaTeX files and produce a marked-up version showing changes
domain: Research Workflow
install: tlmgr install latexdiff-git
---

# latexdiff — Track Changes Between Paper Versions

## Overview

latexdiff compares two LaTeX source files and generates a new `.tex` file with markup showing additions (red underlined) and deletions (blue strikethrough). It is essential for preparing revision documents that highlight what changed between paper versions for co-authors and reviewers.

## When to Use

- Preparing a "changes highlighted" version for journal revision submissions
- Showing co-authors what changed between draft versions
- Generating supplementary materials showing revision history
- Comparing camera-ready vs. accepted version for archival records
- Tracking changes across git commits in LaTeX projects

## Quick Start

```bash
# Compare two versions of a paper
latexdiff old_version.tex new_version.tex > diff.tex
pdflatex diff.tex

# Using git to compare current version with previous commit
latexdiff <(git show HEAD~1:paper.tex) paper.tex > diff.tex

# Compare specific git revisions
latexdiff <(git show abc123:paper.tex) <(git show def456:paper.tex) > diff.tex
```

## Core Capabilities

### 1. Markup Styles

Control how changes are visually represented in the output.

```bash
# Default style: underline additions, strikethrough deletions
latexdiff old.tex new.tex > diff.tex

# Safe mode: prevents breakage with complex commands
latexdiff --append-safecmd=subfield old.tex new.tex > diff.tex

# Only show textual changes (ignore formatting/command changes)
latexdiff --allow-substitution old.tex new.tex > diff.tex

# Underline markup style (classic)
latexdiff --subtype=underoldundernew old.tex new.tex > diff.tex

# Bold for additions, strikethrough for deletions
latexdiff --subtype=bstrikethrough old.tex new.tex > diff.tex

# Color markup (requires xcolor package)
latexdiff --subtype=CFONT old.tex new.tex > diff.tex
```

### 2. Handling Bibliography and Preamble

```bash
# Preserve bibliography commands
latexdiff --append-textcmd=cite,parencite old.tex new.tex > diff.tex

# Ignore changes in the preamble (before \begin{document})
latexdiff --append-preamble old.tex new.tex > diff.tex

# Safelist custom environments
latexdiff --append-safecmd=subfield old.tex new.tex > diff.tex

# Handle math mode safely
latexdiff --math-markup=1 old.tex new.tex > diff.tex
```

### 3. External Config File

For complex projects, use a config file to manage safecmd settings.

```bash
# Create latexdiff.cfg with safe commands
cat > latexdiff.cfg << 'EOF'
\providecommand{\DIFadd}[1]{{\protect\color{red}\uwave{#1}}}
\providecommand{\DIFdel}[1]{{\protect\color{blue}\sout{#1}}}
EOF

# Use config file
latexdiff --config=latexdiff.cfg old.tex new.tex > diff.tex
```

## Common Academic Workflow

### Journal Revision with Highlighted Changes

```bash
# Step 1: Tag the accepted version
git tag v1-accepted HEAD~5   # The version as accepted

# Step 2: Make revisions in working copy
# ... edit paper.tex ...

# Step 3: Generate diff
latexdiff v1-accepted:paper.tex paper.tex > revision_diff.tex

# Step 4: Compile the diff document
pdflatex revision_diff.tex && bibtex revision_diff && pdflatex revision_diff.tex

# Step 5: Verify output
open revision_diff.pdf

# Step 6: Submit revision_diff.pdf as "marked-up manuscript"
```

### Batch Comparison Across Multiple Revisions

```bash
#!/bin/bash
# Generate diffs for each commit since v1
COMMITS=$(git log --oneline v1..HEAD --format="%h")
PREV="v1"

for commit in $COMMITS; do
    latexdiff <(git show $PREV:paper.tex) <(git show $commit:paper.tex) \
        > "diff_${PREV}_${commit}.tex"
    pdflatex "diff_${PREV}_${commit}.tex"
    PREV=$commit
done
```

## Best Practices

1. **Commit before diffing**: Always have clean git commits to compare; use `git stash` for uncommitted changes.
2. **Test the diff output**: Compile and visually verify — latexdiff can break with complex macros.
3. **Use `--append-safecmd` liberally**: Add custom commands that contain arguments to prevent parsing errors.
4. **Keep the original files**: Never overwrite source `.tex` files with diff output.
5. **Submit PDF, not source**: Most journals want the compiled diff PDF, not the `.tex` source.

## Common Pitfalls

1. **Broken compilation**: latexdiff may produce invalid LaTeX with complex packages (tikz, algorithm2e). Use `--append-safecmd` for problematic commands.
2. **Large diffs become unreadable**: For major revisions, split into section-by-section comparisons.
3. **Bibliography changes**: Changes in `.bib` files are not tracked by latexdiff — diff the `.bbl` file separately if needed.
4. **Git process substitution**: `<(git show ...)` requires bash; use temporary files for other shells.

## Integration with HBE

- Pair with `references/tools/aspell.md` to spell-check the revised manuscript
- Use with `references/tools/bibtex-tidy.md` to clean bibliography before revision
- Supports `workflows/paper-writing.md` revision and resubmission phases
- Combine with `references/latex-environment.md` for full build pipeline integration

## Resources

- latexdiff documentation: https://ctan.org/pkg/latexdiff
- latexdiff-git (git-aware version): https://ctan.org/pkg/latexdiff-git
- Revision workflow guide: https://en.wikibooks.org/wiki/LaTeX/Documents/Journal_articles
