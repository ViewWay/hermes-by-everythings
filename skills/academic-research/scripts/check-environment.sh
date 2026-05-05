#!/usr/bin/env bash
# check-environment.sh — Detect LaTeX compilation environment
set -euo pipefail

PASS=0
FAIL=0
WARN=0

check_cmd() {
    if command -v "$1" &>/dev/null; then
        version=$($1 --version 2>/dev/null | head -1)
        echo "  ✅ $1: $version"
        ((PASS++))
        return 0
    else
        echo "  ❌ $1: not found"
        case "$1" in
            pdflatex|xelatex|lualatex) echo "     Install: https://tug.org/texlive/" ;;
            latexmk) echo "     Install: package manager or cpan App::latexmk" ;;
            biber) echo "     Install: package manager (texlive-biber or biber)" ;;
            bibtex) echo "     Install: included in TeXLive" ;;
            python3) echo "     Install: https://python.org/" ;;
        esac
        ((FAIL++))
        return 1
    fi
}

check_pkg() {
    if kpsewhich "$1.sty" &>/dev/null 2>/dev/null || kpsewhich "$1.cls" &>/dev/null 2>/dev/null; then
        echo "  ✅ $1"
        ((PASS++))
    else
        echo "  ⚠️  $1: not installed"
        echo "     Fix: tlmgr install $1"
        ((WARN++))
    fi
}

echo "╔═══════════════════════════════════════════╗"
echo "║  Academic Research Environment Check      ║"
echo "║  学术研究环境检测                          ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

echo "--- TeX Distribution / TeX 发行版 ---"
if command -v latex &>/dev/null; then
    TEX_DIST=$(latex --version 2>/dev/null | head -1)
    echo "  ✅ TeX found: $TEX_DIST"
    ((PASS++))
else
    echo "  ❌ No TeX distribution found"
    echo "     Install: https://tug.org/texlive/ or https://miktex.org/"
    ((FAIL++))
fi

echo ""
echo "--- Compilers / 编译器 ---"
for cmd in pdflatex xelatex lualatex latexmk biber bibtex chktex latexdiff; do
    check_cmd "$cmd"
done

echo ""
echo "--- Key LaTeX Packages / 核心 LaTeX 宏包 ---"
for pkg in amsmath natbib biblatex algorithm2e acmart revtex4-2 siunitx booktabs subcaption cleveref tikz pgfplots listings minted tcolorbox hyperref xcolor ctex xeCJK beamer physics mhchem glossaries; do
    check_pkg "$pkg"
done

echo ""
echo "--- Conference/Journal Styles / 会议/期刊样式 ---"
for cls in acmart revtex4-2 neurips_2025 icml2026; do
    if kpsewhich "$cls.sty" &>/dev/null 2>/dev/null; then
        echo "  ✅ $cls.sty"
        ((PASS++))
    elif kpsewhich "$cls.cls" &>/dev/null 2>/dev/null; then
        echo "  ✅ $cls.cls"
        ((PASS++))
    else
        echo "  ⚠️  $cls: not found (may need manual download from venue website)"
        ((WARN++))
    fi
done

echo ""
echo "--- Python Tools / Python 工具 ---"
check_cmd python3
for pkg in numpy scipy pandas matplotlib; do
    if python3 -c "import $pkg" 2>/dev/null; then
        VER=$(python3 -c "import $pkg; print($pkg.__version__)" 2>/dev/null || echo "?")
        echo "  ✅ $pkg: $VER"
        ((PASS++))
    else
        echo "  ⚠️  $pkg: not installed"
        echo "     Fix: pip install $pkg"
        ((WARN++))
    fi
done

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "  Results: ✅ $PASS passed  ❌ $FAIL failed  ⚠️ $WARN warnings"
if [ "$FAIL" -gt 0 ]; then
    echo "  Status: NEEDS ATTENTION — fix ❌ items before proceeding"
    exit 1
elif [ "$WARN" -gt 0 ]; then
    echo "  Status: MOSTLY READY — some packages may need installation"
    exit 0
else
    echo "  Status: READY — all checks passed"
    exit 0
fi
