"""
HBE Test Configuration

Pytest configuration and fixtures for testing Hermes-by-Everything's.
Based on ECC v2.0 test framework.
"""

import os
import sys
from pathlib import Path
from typing import Generator
import pytest
import yaml


# Project paths
PROJECT_ROOT = Path(__file__).parent.parent
SKILLS_DIR = PROJECT_ROOT / "skills"
AGENTS_DIR = SKILLS_DIR / "agents"
RULES_DIR = SKILLS_DIR / "rules"
ACTIVE_DIR = SKILLS_DIR / "active"
COMMANDS_DIR = PROJECT_ROOT / ".claude" / "commands"
HOOKS_DIR = PROJECT_ROOT / "scripts" / "hooks"


def pytest_configure(config):
    """Configure pytest with HBE markers."""
    config.addinivalue_line(
        "markers", "agent: Mark tests as agent tests"
    )
    config.addinivalue_line(
        "markers", "skill: Mark tests as skill tests"
    )
    config.addinivalue_line(
        "markers", "integration: Mark tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: Mark tests as unit tests"
    )
    config.addinivalue_line(
        "markers", "slow: Mark tests as slow-running"
    )


@pytest.fixture(scope="session")
def project_root() -> Path:
    """Return project root directory."""
    return PROJECT_ROOT


@pytest.fixture(scope="session")
def skills_dir() -> Path:
    """Return skills directory."""
    return SKILLS_DIR


@pytest.fixture(scope="session")
def agents_dir() -> Path:
    """Return agents directory."""
    return AGENTS_DIR


@pytest.fixture(scope="session")
def rules_dir() -> Path:
    """Return rules directory."""
    return RULES_DIR


@pytest.fixture(scope="session")
def active_dir() -> Path:
    """Return active skills directory."""
    return ACTIVE_DIR


@pytest.fixture(scope="session")
def commands_dir() -> Path:
    """Return commands directory."""
    return COMMANDS_DIR


@pytest.fixture(scope="session")
def hooks_dir() -> Path:
    """Return hooks directory."""
    return HOOKS_DIR


@pytest.fixture
def sample_agent_content() -> str:
    """Return sample agent content."""
    return """---
name: test-agent
description: Test agent for testing
tools: ["Read", "Write", "Edit"]
model: sonnet
color: blue
---

You are a test agent.

## Mission

Test things.
"""


@pytest.fixture
def sample_skill_content() -> str:
    """Return sample skill content."""
    return """# Test Skill

## When to Use
Use this for testing.

## How It Works
It works by testing.

## Examples
```bash
/test
```
"""


@pytest.fixture
def temp_agent(tmp_path: Path, sample_agent_content: str) -> Generator[Path, None, None]:
    """Create a temporary agent file."""
    agent_file = tmp_path / "test-agent.md"
    agent_file.write_text(sample_agent_content)
    yield agent_file
    agent_file.unlink()


@pytest.fixture
def temp_skill(tmp_path: Path, sample_skill_content: str) -> Generator[Path, None, None]:
    """Create a temporary skill file."""
    skill_file = tmp_path / "test-skill.md"
    skill_file.write_text(sample_skill_content)
    yield skill_file
    skill_file.unlink()


def load_yaml_frontmatter(content: str) -> dict:
    """Load YAML frontmatter from markdown content."""
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            try:
                return yaml.safe_load(parts[1])
            except yaml.YAMLError:
                pass
    return {}


@pytest.fixture
def parse_frontmatter():
    """Return frontmatter parser function."""
    return load_yaml_frontmatter


# Helper functions for tests
def get_all_agents() -> list[Path]:
    """Get all agent files."""
    agents = []
    if AGENTS_DIR.exists():
        agents.extend(AGENTS_DIR.glob("*.md"))
    return agents


def get_all_skills() -> list[Path]:
    """Get all skill files."""
    skills = []
    if SKILLS_DIR.exists():
        skills.extend(SKILLS_DIR.glob("**/*.md"))
    return skills


def get_all_rules() -> list[Path]:
    """Get all rule files (recursive — rules live in rules/<lang>/*.md)."""
    rules = []
    if RULES_DIR.exists():
        rules.extend(RULES_DIR.rglob("*.md"))
    return rules


@pytest.fixture(scope="session")
def all_agents() -> list[Path]:
    """Return all agent files."""
    return get_all_agents()


@pytest.fixture(scope="session")
def all_skills() -> list[Path]:
    """Return all skill files."""
    return get_all_skills()


@pytest.fixture(scope="session")
def all_rules() -> list[Path]:
    """Return all rule files."""
    return get_all_rules()
