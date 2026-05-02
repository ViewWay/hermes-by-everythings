"""
HBE Skill Integration Tests

Tests for all HBE skills.
"""

import pytest
from pathlib import Path
from tests.lib.test_helpers import SkillValidator, find_references


@pytest.mark.integration
class TestSkills:
    """Test suite for HBE skills."""

    @pytest.fixture(autouse=True)
    def setup(self, skills_dir, all_skills):
        """Setup test fixtures."""
        self.skills_dir = skills_dir
        self.all_skills = all_skills

    def test_skills_directory_exists(self):
        """Test that skills directory exists."""
        assert self.skills_dir.exists(), "Skills directory should exist"
        assert self.skills_dir.is_dir(), "Skills should be a directory"

    def test_has_active_skills(self, active_dir):
        """Test that active skills directory exists and has content."""
        assert active_dir.exists(), "Active skills directory should exist"
        active_skills = list(active_dir.glob("**/*.md"))
        assert len(active_skills) > 0, "Should have at least one active skill"

    def test_all_skills_have_title(self, all_skills):
        """Test that all skills start with a title (# heading)."""
        errors = []

        for skill_file in all_skills:
            content = skill_file.read_text()
            lines = content.strip().split('\n')
            if not lines[0].startswith("#"):
                errors.append(f"{skill_file.name}: Missing title")

        assert len(errors) == 0, f"Skills without titles:\n" + "\n".join(errors)

    def test_critical_skills_exist(self, skills_dir):
        """Test that critical skills exist."""
        critical_skills = [
            "INDEX.md",
            "agents/planner.md",
            "agents/code-reviewer.md",
            "agents/security-reviewer.md"
        ]

        for skill_path in critical_skills:
            skill_file = skills_dir / skill_path
            assert skill_file.exists(), f"Critical skill {skill_path} should exist"

    @pytest.mark.slow
    def test_skill_documentation_quality(self, all_skills):
        """Test that skills have adequate documentation."""
        validator = SkillValidator()
        warnings = []

        for skill_file in all_skills:
            result = validator.validate(skill_file)
            if result['warnings']:
                warnings.extend([f"{skill_file.name}: {w}" for w in result['warnings']])

        # Allow some warnings but document them
        if warnings:
            print(f"\nDocumentation warnings ({len(warnings)}):")
            for warning in warnings[:10]:  # Show first 10
                print(f"  - {warning}")


@pytest.mark.integration
class TestSkillReferences:
    """Test skill cross-references and links."""

    def test_index_references_exist(self, skills_dir):
        """Test that INDEX.md references valid files."""
        index_file = skills_dir / "INDEX.md"
        assert index_file.exists(), "INDEX.md should exist"

        content = index_file.read_text()
        # Check for markdown links
        import re
        links = re.findall(r'\]\(([^)]+)\)', content)

        broken_links = []
        for link in links:
            # Remove anchor links
            link_path = link.split('#')[0]
            if not link_path.startswith('http'):
                target_file = skills_dir / link_path
                if not target_file.exists():
                    broken_links.append(link)

        assert len(broken_links) == 0, f"Broken links in INDEX.md:\n" + "\n".join(broken_links)

    def test_agents_are_indexed(self, skills_dir):
        """Test that all agents are referenced in INDEX.md."""
        index_file = skills_dir / "INDEX.md"
        agents_dir = skills_dir / "agents"

        index_content = index_file.read_text()
        agent_files = list(agents_dir.glob("*.md"))

        missing_agents = []
        for agent_file in agent_files:
            if agent_file.stem not in index_content:
                missing_agents.append(agent_file.stem)

        # Allow a few missing (deprecated, etc.)
        assert len(missing_agents) < len(agent_files) * 0.1, \
            f"Too many agents missing from INDEX.md: {', '.join(missing_agents[:10])}"


@pytest.mark.unit
class TestSkillValidator:
    """Unit tests for SkillValidator."""

    def test_validate_nonexistent_file(self):
        """Test validating non-existent file."""
        result = SkillValidator.validate(Path("/nonexistent/skill.md"))
        assert not result['valid']

    def test_validate_skill_without_title(self, tmp_path):
        """Test validating skill without title."""
        skill_file = tmp_path / "test.md"
        skill_file.write_text("No title here")
        result = SkillValidator.validate(skill_file)
        assert result['valid']  # Still valid, just has warnings
        assert len(result['warnings']) > 0

    def test_validate_well_formed_skill(self, temp_skill):
        """Test validating well-formed skill."""
        result = SkillValidator.validate(temp_skill)
        assert result['valid']
