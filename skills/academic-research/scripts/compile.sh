#!/usr/bin/env bash
# compile.sh — Universal LaTeX compilation wrapper
# Usage: compile.sh [options] <main.tex>
# Options:
#   -e, --engine ENGINE    Engine (pdflatex|xelatex|lualatex|latexmk) [default: auto]
#   -t, --times N          Compilation passes [default: 3]
#   -b, --bib              Run bibliography
#   -c, --clean            Clean auxiliary files
#   -o, --output DIR       Output directory
#   -h, --help             Show help

set -euo pipefail

ENGINE=""
PASSES=3
RUN_BIB=false
CLEAN=false
OUTPUT=""
TEX_FILE=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        -e|--engine) ENGINE="$2"; shift 2 ;;
        -t|--times) PASSES="$2"; shift 2 ;;
        -b|--bib) RUN_BIB=true; shift ;;
        -c|--clean) CLEAN=true; shift ;;
        -o|--output) OUTPUT="$2"; shift 2 ;;
        -h|--help) sed -n '2,9p' "$0" | sed 's/^# //' | sed 's/^#//'; exit 0 ;;
        *) TEX_FILE="$1"; shift ;;
    esac
done

[[ -z "$TEX_FILE" ]] && { echo "❌ Error: No .tex file specified"; exit 1; }
[[ ! -f "$TEX_FILE" ]] && { echo "❌ Error: File not found: $TEX_FILE"; exit 1; }

WORKDIR=$(dirname "$(realpath "$TEX_FILE")")
MAINTEX=$(basename "$TEX_FILE")
BASENAME="${MAINTEX%.tex}"

if [[ -z "$ENGINE" ]]; then
    if grep -q '\\usepackage.*ctex\|\\usepackage.*xeCJK\|\\documentclass.*ctex' "$TEX_FILE" 2>/dev/null; then
        ENGINE="xelatex"
    else
        ENGINE="pdflatex"
    fi
    echo "🔍 Auto-detected engine: $ENGINE"
fi

cd "$WORKDIR"

compile_once() {
    echo "📄 Pass $1 — $ENGINE $MAINTEX"
    $ENGINE -interaction=nonstopmode -halt-on-error "$MAINTEX" 2>&1 | tail -5
}

run_bib() {
    echo "📚 Running bibliography..."
    if grep -q '\\usepackage.*biblatex\|\\addbibresource' "$MAINTEX" 2>/dev/null; then
        if command -v biber &>/dev/null; then
            biber "$BASENAME" 2>&1 | tail -3
        else
            bibtex "$BASENAME" 2>&1 | tail -3
        fi
    else
        bibtex "$BASENAME" 2>&1 | tail -3
    fi
}

echo "🚀 Compiling $MAINTEX with $ENGINE ($PASSES passes)"
for i in $(seq 1 "$PASSES"); do compile_once "$i"; done

if $RUN_BIB; then
    run_bib
    compile_once "final-1"
    compile_once "final-2"
fi

if [[ -f "${BASENAME}.log" ]]; then
    errors=$(grep -c "^!" "${BASENAME}.log" 2>/dev/null || echo "0")
    echo "📊 Errors: $errors"
fi

if $CLEAN; then
    echo "🧹 Cleaning auxiliary files..."
    rm -f "${BASENAME}".{aux,bbl,bcf,blg,fdb_latexmk,fls,idx,ilg,ind,log,out,run.xml,synctex.gz,toc,lof,lot,nav,snm,vrb} 2>/dev/null || true
fi

if [[ -n "$OUTPUT" && -f "${BASENAME}.pdf" ]]; then
    mkdir -p "$OUTPUT"
    mv "${BASENAME}.pdf" "$OUTPUT/"
    echo "📦 Moved PDF to $OUTPUT/${BASENAME}.pdf"
fi

if [[ -f "${BASENAME}.pdf" ]]; then
    SIZE=$(du -h "${BASENAME}.pdf" | cut -f1)
    echo "✅ Success! ${BASENAME}.pdf ($SIZE)"
else
    echo "❌ PDF not generated."
    exit 1
fi
