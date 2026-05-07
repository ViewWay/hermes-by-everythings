"""
HBE E2E Integration Tests

End-to-end tests verifying the HBE installation, symlinks, commands,
hooks, and cross-references work correctly as a system.
"""

import os
import subprocess
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).parent.parent.parent
COMMANDS_DIR = PROJECT_ROOT / "commands"
CLAUDE_COMMANDS = PROJECT_ROOT / ".claude" / "commands"
SKILLS_DIR = PROJECT_ROOT / "skills"
CLAUDE_SKILLS = PROJECT_ROOT / ".claude" / "skills" / "hermes-by-everythings"
RULES_DIR = PROJECT_ROOT / ".claude" / "rules"
HOOKS_DIR = PROJECT_ROOT / "scripts" / "hooks"
INSTALL_SH = PROJECT_ROOT / "scripts" / "install.sh"


class TestSymlinkIntegrity:
    """Verify all symlinks are valid and point to canonical sources."""

    def test_commands_are_symlinks(self):
        for cmd in CLAUDE_COMMANDS.glob("hbe-*.md"):
            assert cmd.is_symlink(), f"{cmd.name} should be a symlink"
            target = os.path.realpath(cmd)
            expected = str((COMMANDS_DIR / cmd.name).resolve())
            assert target == expected, f"{cmd.name} -> {target}, expected {expected}"

    def test_skills_symlink(self):
        link = CLAUDE_SKILLS / "skills"
        assert link.is_symlink(), "skills should be a symlink"
        target = os.path.realpath(link)
        expected = str(SKILLS_DIR.resolve())
        assert target == expected, f"skills -> {target}, expected {expected}"

    def test_academic_research_symlink(self):
        link = SKILLS_DIR / "academic-research"
        assert link.is_symlink(), "academic-research should be a symlink"
        assert link.exists(), "academic-research symlink target should exist"

    def test_no_broken_symlinks(self):
        broken = []
        for link in PROJECT_ROOT.rglob("*"):
            if link.is_symlink() and not link.exists():
                broken.append(str(link.relative_to(PROJECT_ROOT)))
        assert len(broken) == 0, f"Broken symlinks: {broken}"

    def test_commands_canonical_source_has_all_commands(self):
        cmds = list(COMMANDS_DIR.glob("hbe-*.md"))
        assert len(cmds) == 18, f"Expected 18 commands, found {len(cmds)}"


class TestCommandCompleteness:
    """Verify all commands have required metadata and consistent format."""

    EXPECTED_COMMANDS = [
        "hbe-academic", "hbe-architect", "hbe-build-fix", "hbe-checkpoint",
        "hbe-docs", "hbe-e2e", "hbe-eval", "hbe-learn", "hbe-orchestrate",
        "hbe-plan", "hbe-prd", "hbe-ralph", "hbe-refactor", "hbe-review",
        "hbe-scan", "hbe-security", "hbe-tdd", "hbe-verify",
    ]

    def test_all_expected_commands_exist(self):
        missing = [n for n in self.EXPECTED_COMMANDS
                    if not (COMMANDS_DIR / f"{n}.md").exists()]
        assert len(missing) == 0, f"Missing commands: {missing}"

    def test_commands_have_frontmatter_with_name(self):
        errors = []
        for cmd in COMMANDS_DIR.glob("hbe-*.md"):
            content = cmd.read_text()
            if not content.startswith("---"):
                errors.append(f"{cmd.name}: missing frontmatter")
                continue
            parts = content.split("---", 2)
            if len(parts) < 3 or "name:" not in parts[1]:
                errors.append(f"{cmd.name}: missing 'name' in frontmatter")
        assert len(errors) == 0, f"Frontmatter errors:\n" + "\n".join(errors)

    def test_commands_use_hyphen_format_not_colon(self):
        import re
        pattern = re.compile(r"/hbe:[a-z]")
        errors = []
        for cmd in COMMANDS_DIR.glob("hbe-*.md"):
            matches = pattern.findall(cmd.read_text())
            if matches:
                errors.append(f"{cmd.name}: {len(matches)} old-format /hbe:xxx refs")
        assert len(errors) == 0, f"Old format refs:\n" + "\n".join(errors)

    def test_command_names_match_filenames(self):
        import re
        errors = []
        for cmd in COMMANDS_DIR.glob("hbe-*.md"):
            parts = cmd.read_text().split("---", 2)
            if len(parts) < 3:
                continue
            m = re.search(r"name:\s*(.+)", parts[1])
            if m and m.group(1).strip() != cmd.stem:
                errors.append(f"{cmd.name}: name '{m.group(1).strip()}' != '{cmd.stem}'")
        assert len(errors) == 0, f"Name mismatches:\n" + "\n".join(errors)


class TestAgentCompleteness:
    """Verify all agents have required fields."""

    def test_agents_have_frontmatter(self):
        errors = [a.name for a in SKILLS_DIR.glob("agents/*.md")
                  if not a.name.startswith("_") and not a.read_text().startswith("---")]
        assert len(errors) == 0, f"Agents without frontmatter: {errors}"

    def test_agents_have_mission_section(self):
        errors = [a.name for a in SKILLS_DIR.glob("agents/*.md")
                  if not a.name.startswith("_") and "## Mission" not in a.read_text()]
        assert len(errors) == 0, f"Agents without ## Mission: {errors}"


class TestInstallScript:
    """Verify install.sh works correctly."""

    def test_install_script_exists(self):
        assert INSTALL_SH.exists(), "scripts/install.sh should exist"

    def test_install_verify_runs(self):
        result = subprocess.run(
            ["bash", str(INSTALL_SH), "--verify"],
            capture_output=True, text=True, timeout=30
        )
        assert result.stdout != "" or result.stderr != ""

    def test_install_help_runs(self):
        result = subprocess.run(
            ["bash", str(INSTALL_SH), "--help"],
            capture_output=True, text=True, timeout=10
        )
        assert result.returncode == 0
        assert "HBE" in result.stdout


class TestHooksStructure:
    """Verify hooks are properly organized."""

    ACTIVE_HOOKS = [
        "session-start.js", "session-end.js", "post-tool.js",
        "pre-bash-dispatcher.js", "post-bash-dispatcher.js",
        "auto-tmux-dev.js", "bash-hook-dispatcher.js", "block-no-verify.js",
    ]

    def test_active_hooks_exist(self):
        for hook in self.ACTIVE_HOOKS:
            assert (HOOKS_DIR / hook).exists(), f"Missing active hook: {hook}"

    def test_ecc_hooks_archived(self):
        ecc_dir = HOOKS_DIR / "_ecc"
        assert ecc_dir.is_dir(), "_ecc/ directory should exist"
        ecc_count = len(list(ecc_dir.glob("*.js")) + list(ecc_dir.glob("*.sh")))
        assert ecc_count >= 20, f"Expected 20+ ECC hooks, found {ecc_count}"

    def test_no_ecc_hooks_in_root(self):
        indicators = ["ECC_PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT"]
        for hook in HOOKS_DIR.glob("*.js"):
            content = hook.read_text()
            for ind in indicators:
                assert ind not in content, \
                    f"{hook.name} references ECC ({ind}), should be in _ecc/"


class TestCrossReferences:
    """Verify documentation cross-references are valid."""

    def test_no_old_command_format_in_docs(self):
        import re
        pattern = re.compile(r"/hbe:[a-z]")
        errors = []
        for md in PROJECT_ROOT.rglob("*.md"):
            rel = str(md.relative_to(PROJECT_ROOT))
            if "reports-archive" in rel or "node_modules" in rel:
                continue
            matches = pattern.findall(md.read_text())
            if matches:
                errors.append(f"{rel}: {len(matches)} refs")
        assert len(errors) == 0, f"Old /hbe:xxx refs:\n" + "\n".join(errors[:10])

    def test_skill_entry_point_exists(self):
        entry = CLAUDE_SKILLS / "SKILL.md"
        assert entry.exists(), "Skill entry point should exist"
        content = entry.read_text().lower()
        assert "hermes" in content or "hbe" in content

    def test_claude_commands_all_symlinks(self):
        non_symlinks = [f.name for f in CLAUDE_COMMANDS.glob("hbe-*.md")
                        if not f.is_symlink()]
        assert len(non_symlinks) == 0, f"Non-symlink commands: {non_symlinks}"
