"""
HBE Documentation Consistency Tests

防止文档 drift（文档中声明的 agent/skill/command/rule 数量与实际不符）。

这类问题曾在 v3.3.0 前大面积出现：文档写 10/11/36 个 agent，实际有 37 个；
版本号在 install.sh(2.1.0)、SKILL.md(3.2.0)、version.json(3.3.0) 三处不一致。
本测试扫描入口文档，强制其与代码库实际状态一致。

当 agent/command/rule 数量有合理增减时，更新 EXPECTED_* 常量即可。
"""

import re
from pathlib import Path

import pytest
import yaml

from tests.conftest import PROJECT_ROOT


# --- 实际数量来源（文件系统真相） ---------------------------------------------

def _actual_agent_count() -> int:
    """skills/agents/*.md 的数量（排除非 .md）。"""
    agents_dir = PROJECT_ROOT / "skills" / "agents"
    return len(list(agents_dir.glob("*.md")))


def _actual_command_count() -> int:
    """根 commands/ 下的 hbe-*.md 命令数。"""
    commands_dir = PROJECT_ROOT / "commands"
    return len(list(commands_dir.glob("hbe-*.md")))


def _actual_rule_count() -> int:
    """skills/rules/ 递归所有 .md（含各语言子目录）。"""
    rules_dir = PROJECT_ROOT / "skills" / "rules"
    return len(list(rules_dir.rglob("*.md")))


def _actual_skill_count() -> int:
    """skills/*/SKILL.md 的数量（独立 skill 目录）。"""
    skills_dir = PROJECT_ROOT / "skills"
    return len(list(skills_dir.glob("*/SKILL.md")))


def _actual_version() -> str:
    """从 version.json 读取权威版本号。"""
    version_file = PROJECT_ROOT / "version.json"
    data = yaml.safe_load(version_file.read_text())
    return data["version"]


# --- 入口文档清单（用户和模型实际会读到的活文档） -----------------------------

ENTRY_DOCS = [
    PROJECT_ROOT / "README.md",
    PROJECT_ROOT / "README.zh-CN.md",
    PROJECT_ROOT / "CLAUDE.md",
    PROJECT_ROOT / "STRUCTURE.md",
    PROJECT_ROOT / "SKILLS.md",
    PROJECT_ROOT / "SKILL-INDEX.md",
    PROJECT_ROOT / "skills" / "README.md",
    PROJECT_ROOT / "skills" / "INDEX.md",
    PROJECT_ROOT / "docs" / "INDEX.md",
    PROJECT_ROOT / "docs" / "guides" / "agents" / "README.md",
    PROJECT_ROOT / "install.sh",
    PROJECT_ROOT / ".claude" / "skills" / "hermes-by-everythings" / "SKILL.md",
]


@pytest.mark.integration
class TestDocConsistency:
    """入口文档中声明的数量必须与实际文件数一致。"""

    # --- 版本号一致性 --------------------------------------------------------

    def test_version_json_is_authoritative(self):
        """version.json 必须存在且可解析。"""
        version = _actual_version()
        assert re.match(r"^\d+\.\d+\.\d+$", version), \
            f"version.json version {version!r} should be semver"

    @pytest.mark.parametrize("doc_path", ENTRY_DOCS, ids=lambda p: str(p.relative_to(PROJECT_ROOT)))
    def test_no_stale_version_in_entry_docs(self, doc_path):
        """入口文档的"当前版本声明"必须与 version.json 一致。

        只检查当前版本声明位（frontmatter version、元信息 **版本**:、
        badge version-x.y.z），不检查 CHANGELOG 历史段或目录名示例——
        那些是合法的历史引用。
        """
        if not doc_path.exists():
            pytest.skip(f"{doc_path} does not exist")
        content = doc_path.read_text()
        current = _actual_version()

        # 当前版本声明的各种形式（每个都含一个捕获组抓版本号）
        current_version_patterns = [
            r"^\s*version:\s*[\"']?(\d+\.\d+\.\d+)[\"']?\s*$",           # YAML frontmatter
            r"\*\*版本\*\*:\s*(\d+\.\d+\.\d+)",                          # 中文元信息块
            r"\*\*当前版本\*\*:\s*v?(\d+\.\d+\.\d+)",                     # 中文"当前版本"
            r"version-(\d+\.\d+\.\d+)",                                   # badge URL
            r"(?:AGENT版本|索引版本|文档索引版本|Agent教程索引版本):\s*(\d+\.\d+\.\d+)",  # 索引文件版本
        ]

        stale = set()
        for line in content.splitlines():
            for pattern in current_version_patterns:
                for match in re.finditer(pattern, line, re.MULTILINE):
                    if match.group(1) != current:
                        stale.add(match.group(1))

        assert not stale, (
            f"{doc_path.name} declares current version(s) {stale} that differ from "
            f"version.json ({current}). Update the version declaration."
        )

    # --- 数量声明一致性 -------------------------------------------------------

    def test_install_sh_banner_matches_reality(self):
        """install.sh banner 里的数字必须与实际一致。"""
        install_sh = PROJECT_ROOT / "install.sh"
        content = install_sh.read_text()
        banner_line = re.search(
            r"\d+ Agent \+ \d+ Skill \+ \d+ Command \+ \d+ Rules", content
        )
        assert banner_line, "install.sh banner line not found"

        line = banner_line.group(0)
        assert f"{_actual_agent_count()} Agent" in line, \
            f"install.sh banner agent count wrong: {line!r}"
        assert f"{_actual_skill_count()} Skill" in line, \
            f"install.sh banner skill count wrong: {line!r}"
        assert f"{_actual_command_count()} Command" in line, \
            f"install.sh banner command count wrong: {line!r}"
        assert f"{_actual_rule_count()} Rules" in line, \
            f"install.sh banner rule count wrong: {line!r}"

    def test_claude_md_capability_line_matches_reality(self):
        """CLAUDE.md 顶部能力声明行必须与实际一致。"""
        content = (PROJECT_ROOT / "CLAUDE.md").read_text()
        cap_line = re.search(
            r"\d+ Agent \+ \d+ Skill \+ \d+ Command \+ \d+ Rules", content
        )
        assert cap_line, "CLAUDE.md capability line not found"

        line = cap_line.group(0)
        assert f"{_actual_agent_count()} Agent" in line
        assert f"{_actual_skill_count()} Skill" in line
        assert f"{_actual_command_count()} Command" in line
        assert f"{_actual_rule_count()} Rules" in line

    @pytest.mark.parametrize("doc_path", ENTRY_DOCS, ids=lambda p: str(p.relative_to(PROJECT_ROOT)))
    def test_no_known_stale_counts(self, doc_path):
        """入口文档不得包含已知的陈旧数字组合。

        针对 v3.3.0 修复前的典型错误模式（10/11 agent、13 skill、
        8 rule、15 command）。这些数字在当前规模下都是错的，出现即 drift。
        """
        if not doc_path.exists():
            pytest.skip(f"{doc_path} does not exist")
        content = doc_path.read_text()

        # 已知的错误计数声明（中英文均覆盖）
        stale_patterns = [
            r"10\s*(个)?\s*(专业)?\s*[Aa]gent",
            r"11\s*(个)?\s*[Aa]gent",
            r"9\s*个\s*专业代理",
            r"13\s*(个)?\s*(核心)?\s*(技能|[Ss]kill)",
            r"15\s*(个)?\s*(快捷)?\s*(命令|[Cc]ommand)",
            r"8\s*(个)?\s*(规则|文件|[Rr]ule)",
            r"8\s*Rules",
        ]

        offenders = []
        for pattern in stale_patterns:
            matches = re.findall(pattern, content)
            if matches:
                offenders.append(pattern)

        assert not offenders, (
            f"{doc_path.name} still contains stale count pattern(s): {offenders}. "
            f"Expected: {_actual_agent_count()} agents, "
            f"{_actual_skill_count()} skills, "
            f"{_actual_command_count()} commands, "
            f"{_actual_rule_count()} rules."
        )

    # --- install.sh 结构完整性 ------------------------------------------------

    def test_install_sh_has_no_undefined_vars(self):
        """install.sh 用 set -euo pipefail，未定义变量会立即崩溃。

        回归保护：install.sh 曾引用未定义的 TEMP_DIR/REPO_URL/INSTALL_DIR。
        """
        content = (PROJECT_ROOT / "install.sh").read_text()

        # 提取所有 ${VAR} / $VAR 引用的变量名
        used = set(re.findall(r"\$\{?([A-Z_][A-Z0-9_]*)\}?", content))
        # 排除 shell 内置/特殊变量
        special = {"HOME", "PWD", "PATH", "BASH_SOURCE", "BASH_SOURCE[0]"}
        # 排除通过 local/赋值定义的变量
        defined = set(re.findall(r"(?:^|\s)([A-Z_][A-Z0-9_]*)=", content))
        defined |= special
        # 排除函数内 local 声明
        defined |= set(re.findall(r"local\s+([a-z_][a-zA-Z0-9_]*)", content))

        undefined = used - defined
        # 过滤掉小写开头的（local 变量已在上面处理）和已知合法引用
        undefined = {v for v in undefined if v.isupper() or "_" in v}

        assert not undefined, (
            f"install.sh references undefined variable(s): {undefined}. "
            f"With 'set -euo pipefail' this will crash at runtime."
        )

    def test_install_sh_no_legacy_hbe_colon_commands(self):
        """install.sh 不得残留 /hbe:xxx 旧命名（已迁移为 /hbe-xxx）。"""
        content = (PROJECT_ROOT / "install.sh").read_text()
        legacy = re.findall(r"/hbe:[a-z]", content)
        assert not legacy, (
            f"install.sh contains legacy /hbe:xxx command(s): {legacy}. "
            f"Namespace migrated to /hbe-xxx."
        )

    # --- 软链接完整性 --------------------------------------------------------

    def test_no_broken_symlinks_in_claude_skills(self):
        """.claude/skills/ 下不得有断链。"""
        claude_skills = PROJECT_ROOT / ".claude" / "skills"
        if not claude_skills.exists():
            pytest.skip(".claude/skills does not exist")

        broken = []
        for link in claude_skills.rglob("*"):
            if link.is_symlink() and not link.exists():
                broken.append(str(link.relative_to(PROJECT_ROOT)))
        assert not broken, f"Broken symlinks under .claude/skills/: {broken}"
