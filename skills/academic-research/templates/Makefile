# Academic Paper Makefile — Auto-detect engine and compile
# 学术论文 Makefile — 自动检测引擎并编译

# Auto-detect LaTeX engine
HAS_CHINESE := $(shell grep -l 'ctex\|xeCJK\|CJK' $(wildcard *.tex sections/*.tex) 2>/dev/null)
HAS_FONTSPEC := $(shell grep -l 'fontspec' $(wildcard *.tex sections/*.tex) 2>/dev/null)

ifdef HAS_CHINESE
    ENGINE := xelatex
else ifdef HAS_FONTSPEC
    ENGINE := lualatex
else
    ENGINE := pdflatex
endif

MAIN := main
BIB_ENGINE := biber
LATEXMK := latexmk

.PHONY: all clean view debug

all: $(MAIN).pdf

# Full compilation (multiple passes + bibliography)
$(MAIN).pdf: $(MAIN).tex
	$(LATEXMK) -$(ENGINE) -bibtex -interaction=nonstopmode $(MAIN).tex

# Quick compile (single pass, no bibliography)
quick:
	$(ENGINE) -interaction=nonstopmode $(MAIN).tex

# View PDF
view: $(MAIN).pdf
	@if command -v open &>/dev/null; then open $(MAIN).pdf; \
	elif command -v xdg-open &>/dev/null; then xdg-open $(MAIN).pdf; fi

# Clean auxiliary files
clean:
	rm -f *.aux *.bbl *.blg *.log *.out *.toc *.lof *.lot *.fls \
	      *.fdb_latexmk *.synctex.gz *.nav *.snm *.vrb *.bcf *.run.xml \
	      *.xdv *.spl sections/*.aux

# Deep clean (remove PDF too)
distclean: clean
	rm -f $(MAIN).pdf

# Debug: show engine selection
debug:
	@echo "Engine: $(ENGINE)"
	@echo "Has Chinese: $(HAS_CHINESE)"
	@echo "Has fontspec: $(HAS_FONTSPEC)"
	@echo "Main: $(MAIN).tex"

# Word count
words:
	@texcount -inc -sum $(MAIN).tex 2>/dev/null || echo "Install texcount: tlmgr install texcount"

# Check for undefined references
check:
	@$(ENGINE) -interaction=nonstopmode $(MAIN).tex 2>&1 | grep -i "undefined\|multiply" || echo "No issues found"
