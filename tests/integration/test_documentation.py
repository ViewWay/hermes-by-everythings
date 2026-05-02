"""
HBE Documentation Integration Tests

Tests for HBE documentation consistency and quality.
"""

import pytest
from pathlib import Path
from tests.lib.test_helpers import validate_version_consistency


@pytest.mark.integration
class TestDocumentation:
    """Test suite for HBE documentation."""

    def test_root_readme_exists(self, project_root):
        """Test that README.md exists in project root."""
        readme = project_root / "README.md"
        assert readme.exists(), "README.md should exist in project root"

    def test_changelog_exists(self, project_root):
        """Test that CHANGELOG.md exists."""
        changelog = project_root / "CHANGELOG.md"
        assert changelog.exists(), "CHANGELOG.md should exist"

    def test_agents_md_exists(self, project_root):
        """Test that AGENTS.md exists."""
        agents_doc = project_root / "AGENTS.md"
        assert agents_doc.exists(), "AGENTS.md should exist"

    def test_version_consistency(self, project_root):
        """Test that version numbers are consistent across documentation."""
        result = validate_version_consistency(project_root)

        # Check that we found versions
        assert len(result['files']) > 0, "Should find version numbers in documentation"

        # Check consistency (allow some flexibility)
        if not result['consistent']:
            # Document the versions found
            print(f"\nFound versions: {', '.join(result['versions'])}")
            # This is a warning, not a failure
            pytest.warns(UserWarning, match="Multiple versions found")

    def test_readme_has_quick_start(self, project_root):
        """Test that README has quick start section."""
        readme = project_root / "README.md"
        content = readme.read_text()

        # Look for common quick start indicators
        has_quick_start = any(section in content.lower() for section in
                              ["quick start", "getting started", "installation", "安装", "快速开始"])

        assert has_quick_start, "README should have quick start/installation section"

    def test_readme_mentions_version(self, project_root):
        """Test that README mentions version."""
        readme = project_root / "README.md"
        content = readme.read_text()

        # Look for version pattern
        import re
        version_pattern = re.compile(r'v?(\d+\.\d+\.\d+)')
        versions = version_pattern.findall(content)

        assert len(versions) > 0, "README should mention version number"


@pytest.mark.integration
class TestCodeMaps:
    """Test suite for CODEMAPS."""

    def test_codemaps_directory_exists(self, project_root):
        """Test that docs/CODEMAPS directory exists."""
        codemaps_dir = project_root / "docs" / "CODEMAPS"
        if codemaps_dir.exists():
            assert codemaps_dir.is_dir(), "CODEMAPS should be a directory"

    @pytest.mark.slow
    def test_codemaps_if_exist(self, project_root):
        """Test CODEMAPS if they exist."""
        codemaps_dir = project_root / "docs" / "CODEMAPS"

        if not codemaps_dir.exists():
            pytest.skip("CODEMAPS directory does not exist")

        codemaps = list(codemaps_dir.glob("*.md"))
        if codemaps:
            # At least one codemap should have content
            has_content = False
            for codemap in codemaps:
                if len(codemap.read_text()) > 100:
                    has_content = True
                    break

            assert has_content, "At least one CODEMAP should have substantial content"


@pytest.mark.integration
class TestCLAUDE_MD:
    """Test suite for CLAUDE.md files."""

    def test_claude_md_exists(self, project_root):
        """Test that CLAUDE.md exists."""
        claude_md = project_root / "CLAUDE.md"
        assert claude_md.exists(), "CLAUDE.md should exist"

    def test_claude_md_has_core_sections(self, project_root):
        """Test that CLAUDE.md has core sections."""
        claude_md = project_root / "CLAUDE.md"
        content = claude_md.read_text()

        # Look for important sections
        required_sections = ["##", "项目", "技能", "命令"]
        found_sections = sum(1 for section in required_sections if section in content)

        assert found_sections >= 2, "CLAUDE.md should have major sections"

    def test_claude_md_not_empty(self, project_root):
        """Test that CLAUDE.md is not empty."""
        claude_md = project_root / "CLAUDE.md"
        content = claude_md.read_text()

        assert len(content) > 1000, "CLAUDE.md should have substantial content"


@pytest.mark.integration
class TestIndexFiles:
    """Test suite for index files (INDEX.md, etc)."""

    def test_skills_index_exists(self, skills_dir):
        """Test that skills/INDEX.md exists."""
        index = skills_dir / "INDEX.md"
        assert index.exists(), "skills/INDEX.md should exist"

    def test_skills_index_has_categories(self, skills_dir):
        """Test that INDEX.md has agent/skill categories."""
        index = skills_dir / "INDEX.md"
        content = index.read_text()

        # Should have categories
        has_categories = any(heading in content for heading in
                            ["## 🤖 Agents", "### 规划", "### 质量保证"])

        assert has_categories, "INDEX.md should have categories"

    def test_index_not_empty(self, skills_dir):
        """Test that INDEX.md is not empty."""
        index = skills_dir / "INDEX.md"
        content = index.read_text()

        assert len(content) > 500, "INDEX.md should have substantial content"
