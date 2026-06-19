"""
文档断链检测测试

防止文档相对链接指向不存在的文件（drift）。

背景：审查发现 101 个断链（docs/INDEX.md 一个文件就有 22 个），
主要是路径重构后未同步（skills/active/* → commands/hbe-*，
reports/ → reports-archive/ 等）。本测试扫描所有 markdown 相对链接，
抓出真实断链。

允许的例外（不计为断链）：
- 模板占位符：skills/templates/* 里的 ../related-*.md 示例链接
- ADR 模板：docs/adr/0000-template.md 里的 000N-decision.md 示例
- Upstream 引用：vendored README 里指向 CLAUDE.md/LICENSE 的链接
  （这些是第三方项目的原始引用）
"""

import re
from pathlib import Path

import pytest

from tests.conftest import PROJECT_ROOT


# 这些链接是合理的例外，不计为断链
# （模板占位符 / upstream vendored 引用 / 目录链接）
ALLOWED_MISSING = {
    # 模板占位符（skills/templates/* 里的示例链接本就不存在）
    "skills/templates/agent-template.md: ../agents/agent1.md",
    "skills/templates/agent-template.md: ../agents/agent2.md",
    "skills/templates/command-template.md: ../agents/related-agent.md",
    "skills/templates/command-template.md: ../commands/related-command.md",
    "skills/templates/command-template.md: ../skills/related-skill/SKILL.md",
    "skills/templates/skill-template.md: ../related-skill-1/SKILL.md",
    "skills/templates/skill-template.md: ../related-skill-2/SKILL.md",
    # ADR 模板示例
    "docs/adr/0000-template.md: 0001-decision.md",
    "docs/adr/0000-template.md: 0002-decision.md",
    # CONTRIBUTING 模板占位
    "CONTRIBUTING.md: ../related-skill/SKILL.md",
    # Upstream vendored README 里的引用（第三方项目原始链接）
    "skills/frontend-design-ultimate/README.md: LICENSE",
    "skills/frontend-design-ultimate/references/upstream-README.md: CLAUDE.md",
    "skills/frontend-design-ultimate/references/upstream-README.md: LICENSE",
    "skills/ui-ux-pro-max/references/upstream-README.md: CLAUDE.md",
    "skills/ui-ux-pro-max/references/upstream-README.md: LICENSE",
    # reports-archive 里历史文档的模板占位
    "docs/reports-archive/PHASE2-OPTIMIZATION.md: ../related-skill/SKILL.md",
}


def _find_broken_links() -> list[tuple[str, str]]:
    """扫描所有 markdown，返回 [(file, missing_link), ...] 真实断链。"""
    broken = []
    for md in PROJECT_ROOT.rglob("*.md"):
        s = str(md.relative_to(PROJECT_ROOT))
        if any(x in s for x in ["node_modules", ".git/", "memory/sessions", "_archive"]):
            continue
        content = md.read_text(errors="ignore")

        # Markdown 链接 [text](path) + HTML href="path"
        links = re.findall(r"\[[^\]]*\]\(([^)]+)\)", content)
        links += re.findall(r'href="([^"]+)"', content)

        for link in links:
            link = link.split("#")[0].split(" ")[0].strip()
            # 跳过：空、外链、锚点、绝对路径、mailto
            if not link or link.startswith(("http", "#", "mailto:", "/")):
                continue
            # 跳过明显的正则误抓（中文词、单字母）
            if re.fullmatch(r"[\u4e00-\u9fff]+", link) or len(link) <= 1:
                continue

            target = (md.parent / link).resolve()
            if target.exists():
                continue

            key = f"{s}: {link}"
            if key in ALLOWED_MISSING:
                continue
            broken.append((s, link))
    return broken


@pytest.mark.integration
class TestDocLinks:
    """文档相对链接不得指向不存在的文件。"""

    def test_no_broken_doc_links(self):
        """所有 markdown 相对链接必须指向真实存在的文件。

        允许例外见 ALLOWED_MISSING（模板占位符、upstream 引用）。
        回归保护：审查时发现 101 个断链，已修复到 0。
        """
        broken = _find_broken_links()
        if broken:
            # 按文件分组，便于阅读
            by_file = {}
            for f, link in broken:
                by_file.setdefault(f, []).append(link)
            msg = f"{len(broken)} broken links across {len(by_file)} files:\n"
            for f in sorted(by_file):
                msg += f"  {f}: {by_file[f]}\n"
            msg += (
                "\nIf these are legitimate (template placeholders, upstream "
                "refs), add them to ALLOWED_MISSING in test_doc_links.py."
            )
        else:
            msg = ""
        assert not broken, msg

    def test_common_rules_exist(self):
        """skills/rules/common/ 必须有 6 个共享规则文件。

        回归保护：所有语言规则的 ../common/*.md 引用曾全部断链
        （common/ 目录不存在），已创建。删除或移动这些文件会
        导致 ~48 个断链复发。
        """
        common_dir = PROJECT_ROOT / "skills" / "rules" / "common"
        expected = {"coding-style.md", "security.md", "testing.md",
                    "patterns.md", "hooks.md", "performance.md"}
        if not common_dir.exists():
            pytest.fail(f"{common_dir} missing — language rules' ../common/ refs will break")
        actual = {f.name for f in common_dir.glob("*.md")}
        missing = expected - actual
        assert not missing, (
            f"skills/rules/common/ missing: {missing}. "
            f"All language rules reference these via ../common/*.md."
        )
