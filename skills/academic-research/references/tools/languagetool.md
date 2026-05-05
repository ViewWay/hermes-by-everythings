---
name: languagetool
description: Grammar and style checker for 30+ languages — find errors in academic papers, theses, and manuscripts
domain: Research Workflow
install: pip install language-tool-python
---

# LanguageTool — Grammar & Style Checking / 语法与风格检查

LanguageTool finds grammar, spelling, and style errors in 30+ languages. The Python wrapper provides programmatic access for batch checking academic manuscripts.

## When to Use / 适用场景

- Grammar checking before paper submission
- Batch checking multiple chapters or sections
- Style consistency verification across a document
- Complementing LaTeX spell-check with grammar analysis

## Quick Start / 快速开始

```python
import language_tool_python

# Initialize (downloads LanguageTool on first use)
tool = language_tool_python.LanguageTool("en-US")

# Check text
text = "This are a example of grammatical error in academic writing."
matches = tool.check(text)
for match in matches:
    print(f"Rule: {match.ruleId}")
    print(f"Message: {match.message}")
    print(f"Context: {match.context}")
    print(f"Suggestion: {match.replacements}")
    print()

# Apply corrections
corrected = tool.correct(text)
print(corrected)

# Close
tool.close()
```

## Core Capabilities / 核心能力

### Batch File Checking / 批量文件检查

```python
import language_tool_python
from pathlib import Path

tool = language_tool_python.LanguageTool("en-US")

for tex_file in Path(".").glob("**/*.tex"):
    text = tex_file.read_text()
    matches = tool.check(text)
    if matches:
        print(f"\n{tex_file}: {len(matches)} issues")
        for m in matches[:5]:
            print(f"  Line: {m.context[:80]}...")
            print(f"  → {m.replacements}")
```

### Multi-Language Support / 多语言支持

```python
# Chinese
tool_zh = language_tool_python.LanguageTool("zh-CN")

# German
tool_de = language_tool_python.LanguageTool("de-DE")

# French
tool_fr = language_tool_python.LanguageTool("fr")
```

## Best Practices / 最佳实践

- Use with LaTeX-stripped text (remove commands before checking)
- Review suggestions manually; some are false positives for technical writing
- Run English check + language-specific check for bilingual papers

## Common Pitfalls / 常见陷阱

- **First run slow**: Downloads ~500MB LanguageTool jar on first use
- **LaTeX commands**: Tool checks raw text including commands; strip LaTeX first
- **Technical terms**: May flag valid domain-specific terms; add to ignore list

## Integration with HBE / 与 HBE 集成

- Use in Gate 2 (Writing Quality) of `workflows/paper-writing.md`
- Pair with `references/de-aigc-guide.md` for comprehensive writing quality
- Combine with `references/writing-guide.md` for style guidelines

## Resources / 资源

- Documentation: https://github.com/jxmorris12/language-tool-python
- LanguageTool: https://languagetool.org/
