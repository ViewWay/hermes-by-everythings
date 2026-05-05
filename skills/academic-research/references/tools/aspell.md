---
name: aspell
description: Spell checker via Python interface — check spelling in LaTeX, markdown, and plain text files
domain: Research Workflow
install: pip install aspell-python-py3 2>/dev/null; brew install aspell 2>/dev/null || sudo apt install aspell
---

# aspell — Spell Checker for Academic Documents

## Overview

GNU Aspell is an open-source spell checker with excellent LaTeX and markdown support. It preserves markup commands, understands scientific terminology via custom dictionaries, and integrates cleanly into automated paper build pipelines.

## When to Use

- Proofreading LaTeX papers before submission
- Checking spelling in markdown README or documentation files
- Validating manuscript text in CI/CD pipelines
- Building custom domain-specific dictionaries for specialized terminology
- Batch-checking all `.tex` files in a project directory

## Quick Start

```bash
# Install (macOS / Linux)
brew install aspell          # macOS
sudo apt install aspell      # Ubuntu/Debian

# Basic interactive check on a LaTeX file
aspell --mode=tex --lang=en check paper.tex

# List misspellings (non-interactive, good for scripts)
aspell --mode=tex list < paper.tex | sort | uniq

# Check a markdown file
aspell --mode=markdown --lang=en check README.md

# Create a project-specific custom dictionary
echo "personal_ws-1.1 en 3\npretrained\nfinetuning\nhyperparameter" > paper-dict.pws
aspell --personal=paper-dict.pws --mode=tex check paper.tex
```

## Core Capabilities

### 1. LaTeX Mode with Markup Awareness

Aspell's `--mode=tex` skips LaTeX commands and environments, only spell-checking natural language text.

```bash
# Check only text content, ignore \command{}, {braces}, and math
aspell --mode=tex --lang=en_US check manuscript.tex

# Skip specific commands that contain jargon
aspell --mode=tex --add-tex-command="pocketex p" check manuscript.tex

# Skip math environments entirely
aspell --mode=tex --add-tex-command="frac op" check manuscript.tex
```

Supported modes: `tex`, `latex`, `markdown`, `html`, `nroff`, `perl`, `sgml`.

### 2. Custom Dictionary Management

Build a persistent personal dictionary to avoid false positives on domain terms.

```bash
# Create initial dictionary with domain terms
cat > ~/.aspell.en.pws << 'EOF'
personal_ws-1.1 en 20
pretrained
finetuning
hyperparameter
embeddings
softmax
crossentropy
regularization
dropout
batchnorm
transformer
attention
multilayer
convolutional
recurrent
autoencoder
generative
discriminative
EOF

# Add a word interactively during check
# (type "a" when prompted to add to personal dictionary)

# Merge multiple dictionaries
cat dict1.pws dict2.pws | awk '!seen[$0]++' > merged.pws
```

### 3. Batch Checking Script

Automate spell-checking across all files in a project.

```bash
#!/bin/bash
# scripts/spellcheck.sh — Run aspell on all tex/md files
DICT="${1:-~/.aspell.en.pws}"
ERRORS=0

for f in $(find . -name "*.tex" -o -name "*.md" | grep -v _build); do
    MODE="tex"
    [[ "$f" == *.md ]] && MODE="markdown"
    MISSPELLED=$(aspell --mode=$MODE --personal="$DICT" list < "$f")
    if [ -n "$MISSPELLED" ]; then
        echo "=== $f ==="
        echo "$MISSPELLED" | sort | uniq -c | sort -rn
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo "All files passed spell check."
else
    echo "Found issues in $ERRORS file(s)."
    exit 1
fi
```

## Common Academic Workflow

### Paper Proofreading Pipeline

```bash
# Step 1: Check manuscript
aspell --mode=tex --personal=paper-dict.pws check manuscript.tex

# Step 2: Generate misspelling report for co-authors
aspell --mode=tex --personal=paper-dict.pws list < manuscript.tex \
    | sort | uniq -c | sort -rn > misspellings-report.txt

# Step 3: Check supplementary materials
for f in supplementary/*.tex; do
    aspell --mode=tex --personal=paper-dict.pws check "$f"
done

# Step 4: Verify response-to-reviewers document
aspell --mode=tex --personal=paper-dict.pws check response-to-reviewers.tex
```

## Best Practices

1. **Maintain a per-project dictionary**: Track `paper-dict.pws` in version control so co-authors share the same word list.
2. **Run in CI**: Add spell-check as a pre-commit hook or GitHub Action to catch typos before they reach reviewers.
3. **Separate dictionaries per domain**: Keep different `.pws` files for ML, bioinformatics, physics, etc.
4. **Pipe to `sort | uniq -c`**: Quantify misspellings and prioritize the most frequent ones.
5. **Use `--lang=en_US` explicitly**: Avoid locale-dependent behavior in shared environments.

## Common Pitfalls

1. **Missing `--mode=tex`**: Without it, Aspell flags LaTeX commands like `\section` as misspellings.
2. **No custom dictionary**: Default English dictionary flags domain terms like "softmax" and "embeddings".
3. **In-place editing risk**: The `check` command modifies files in-place; always commit first or use `list` mode.
4. **Non-UTF8 files**: Aspell requires UTF-8 input; convert with `iconv -f latin1 -t utf8` if needed.

## Integration with HBE

- Use with `references/tools/languagetool.md` for grammar + spelling combined checks
- Pair with `references/tools/latexdiff.md` when comparing revised manuscripts
- Integrate into `references/latex-environment.md` build pipeline via Makefile target
- Supports `workflows/paper-writing.md` Phase 4 (Proofreading)

## Resources

- GNU Aspell documentation: http://aspell.net/man-html/
- Aspell word lists: ftp://ftp.gnu.org/gnu/aspell/dict/
- LaTeX spell-checking guide: https://en.wikibooks.org/wiki/LaTeX/Checking_for_typos
