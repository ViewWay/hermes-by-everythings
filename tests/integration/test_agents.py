"""
HBE Agent Integration Tests

Tests for all HBE agents.
"""

import pytest
from pathlib import Path
from tests.lib.test_helpers import AgentValidator


@pytest.mark.integration
class TestAgents:
    """Test suite for HBE agents."""

    @pytest.fixture(autouse=True)
    def setup(self, agents_dir, all_agents):
        """Setup test fixtures."""
        self.agents_dir = agents_dir
        self.all_agents = all_agents

    def test_agents_directory_exists(self):
        """Test that agents directory exists."""
        assert self.agents_dir.exists(), "Agents directory should exist"
        assert self.agents_dir.is_dir(), "Agents should be a directory"

    def test_agents_count(self, all_agents):
        """Test expected number of agents."""
        # HBE v3.3.0 should have at least 30 agents
        assert len(all_agents) >= 30, f"Expected at least 30 agents, found {len(all_agents)}"

    @pytest.mark.parametrize("agent_file", [
        "planner.md",
        "architect.md",
        "code-reviewer.md",
        "security-reviewer.md",
        "tdd-guide.md",
        "python-reviewer.md",
        "typescript-reviewer.md",
        "go-reviewer.md",
        "loop-operator.md",
        "harness-optimizer.md"
    ])
    def test_critical_agents_exist(self, agent_file):
        """Test that critical agents exist."""
        agent_path = self.agents_dir / agent_file
        assert agent_path.exists(), f"Critical agent {agent_file} should exist"

    def test_all_agents_have_valid_frontmatter(self, all_agents):
        """Test that all agents have valid YAML frontmatter."""
        validator = AgentValidator()
        errors = []

        for agent_file in all_agents:
            result = validator.validate(agent_file)
            if not result['valid']:
                errors.append(f"{agent_file.name}: {', '.join(result['errors'])}")

        assert len(errors) == 0, f"Agents with invalid frontmatter:\n" + "\n".join(errors)

    def test_all_agents_have_required_fields(self, all_agents):
        """Test that all agents have required fields."""
        validator = AgentValidator()

        for agent_file in all_agents:
            result = validator.validate(agent_file)
            assert result['valid'], f"{agent_file.name} missing required fields"

    def test_agents_have_description(self, all_agents):
        """Test that all agents have description field."""
        import yaml

        for agent_file in all_agents:
            content = agent_file.read_text()
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 2:
                    frontmatter = yaml.safe_load(parts[1])
                    assert 'description' in frontmatter, f"{agent_file.name} missing description"
                    assert len(frontmatter['description']) > 0, f"{agent_file.name} has empty description"

    def test_agents_have_tools(self, all_agents):
        """Test that all agents specify tools."""
        import yaml

        for agent_file in all_agents:
            content = agent_file.read_text()
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 2:
                    frontmatter = yaml.safe_load(parts[1])
                    assert 'tools' in frontmatter, f"{agent_file.name} missing tools"
                    assert isinstance(frontmatter['tools'], list), f"{agent_file.name} tools should be a list"
                    assert len(frontmatter['tools']) > 0, f"{agent_file.name} has no tools"

    @pytest.mark.slow
    def test_agent_documentation_quality(self, all_agents):
        """Test that agents have adequate documentation."""
        warnings = []

        for agent_file in all_agents:
            content = agent_file.read_text()

            # Check for Mission section
            body = content.split("---", 2)[-1] if "---" in content else content
            if "## Mission" not in body:
                warnings.append(f"{agent_file.name}: Missing '## Mission' section")

            # Check for Workflow or Instructions section (EN/CN)
            workflow_sections = [
                "## Workflow", "## Instructions", "## How",
                "## 职责", "## 工作流程", "## 审查流程", "## 审查维度",
                "## 审查策略", "## 审查步骤", "## Resolution Workflow",
                "## Review Workflow", "## Review Process", "## 分析流程",
                "## 分析过程", "## Analysis Process", "## 使用流程",
                "## 修复流程", "## 检测方法", "## 检测模式", "## 核心原则",
                "## 优化步骤", "## 构建修复流程", "## 反模式", "## 反模式警告",
                "## Review Priorities", "## Approval Criteria",
                "## Diagnostic Commands",
            ]
            if not any(section in body for section in workflow_sections):
                warnings.append(f"{agent_file.name}: Missing workflow/instructions section")

        # Allow some warnings but not too many
        assert len(warnings) < len(all_agents) * 0.2, f"Too many agents lack proper documentation:\n" + "\n".join(warnings)


@pytest.mark.unit
class TestAgentValidator:
    """Unit tests for AgentValidator."""

    def test_validate_nonexistent_file(self):
        """Test validating non-existent file."""
        result = AgentValidator.validate(Path("/nonexistent/file.md"))
        assert not result['valid']
        assert len(result['errors']) > 0

    def test_validate_file_without_frontmatter(self, tmp_path):
        """Test validating file without frontmatter."""
        test_file = tmp_path / "test.md"
        test_file.write_text("No frontmatter here")
        result = AgentValidator.validate(test_file)
        assert not result['valid']

    def test_validate_valid_agent(self, temp_agent):
        """Test validating a valid agent."""
        result = AgentValidator.validate(temp_agent)
        assert result['valid'], f"Valid agent should pass: {result['errors']}"
