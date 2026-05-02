"""
HBE Test Helpers

Helper functions for testing HBE components.
"""

import re
from pathlib import Path
from typing import Any, Dict, List, Optional
import yaml


class AgentValidator:
    """Validator for agent files."""

    REQUIRED_FIELDS = ["name", "description", "tools"]
    VALID_TOOLS = [
        "Read", "Write", "Edit", "Bash", "Grep", "Glob",
        "WebSearch", "WebFetch", "Agent", "AskUserQuestion"
    ]
    VALID_MODELS = ["haiku", "sonnet", "opus"]

    @classmethod
    def validate(cls, agent_path: Path) -> Dict[str, Any]:
        """Validate an agent file.

        Returns:
            Dict with 'valid' (bool), 'errors' (list), 'warnings' (list)
        """
        errors = []
        warnings = []

        # Check file exists
        if not agent_path.exists():
            return {
                "valid": False,
                "errors": [f"File not found: {agent_path}"],
                "warnings": []
            }

        content = agent_path.read_text()

        # Check frontmatter
        frontmatter = cls._parse_frontmatter(content)
        if not frontmatter:
            errors.append("Missing or invalid YAML frontmatter")
            return {
                "valid": False,
                "errors": errors,
                "warnings": warnings
            }

        # Check required fields
        for field in cls.REQUIRED_FIELDS:
            if field not in frontmatter:
                errors.append(f"Missing required field: {field}")

        # Validate tools
        if "tools" in frontmatter:
            tools = frontmatter["tools"]
            if not isinstance(tools, list):
                errors.append("'tools' must be a list")
            else:
                for tool in tools:
                    if tool not in cls.VALID_TOOLS:
                        warnings.append(f"Unknown tool: {tool}")

        # Validate model
        if "model" in frontmatter:
            model = frontmatter["model"]
            if model not in cls.VALID_MODELS:
                warnings.append(f"Non-standard model: {model}")

        # Check content
        body = cls._extract_body(content)
        if not body.strip():
            warnings.append("Agent has no body content")

        # Check for required sections
        if "## Mission" not in body:
            warnings.append("Missing '## Mission' section")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }

    @staticmethod
    def _parse_frontmatter(content: str) -> Optional[Dict]:
        """Parse YAML frontmatter."""
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                try:
                    return yaml.safe_load(parts[1])
                except yaml.YAMLError:
                    return None
        return None

    @staticmethod
    def _extract_body(content: str) -> str:
        """Extract body content after frontmatter."""
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                return parts[2]
        return content


class SkillValidator:
    """Validator for skill files."""

    @classmethod
    def validate(cls, skill_path: Path) -> Dict[str, Any]:
        """Validate a skill file.

        Returns:
            Dict with 'valid' (bool), 'errors' (list), 'warnings' (list)
        """
        errors = []
        warnings = []

        if not skill_path.exists():
            return {
                "valid": False,
                "errors": [f"File not found: {skill_path}"],
                "warnings": []
            }

        content = skill_path.read_text()

        # Check for title
        if not content.startswith("#"):
            warnings.append("Missing title (should start with #)")

        # Check for key sections
        if "## When to Use" not in content:
            warnings.append("Missing '## When to Use' section")

        if "## How It Works" not in content:
            warnings.append("Missing '## How It Works' section")

        if "## Examples" not in content:
            warnings.append("Missing '## Examples' section")

        # Check for code blocks
        if "```" not in content:
            warnings.append("No code blocks found")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }


class RuleValidator:
    """Validator for rule files."""

    @classmethod
    def validate(cls, rule_path: Path) -> Dict[str, Any]:
        """Validate a rule file.

        Returns:
            Dict with 'valid' (bool), 'errors' (list), 'warnings' (list)
        """
        errors = []
        warnings = []

        if not rule_path.exists():
            return {
                "valid": False,
                "errors": [f"File not found: {rule_path}"],
                "warnings": []
            }

        content = rule_path.read_text()

        # Check for title
        if not content.startswith("#"):
            warnings.append("Missing title (should start with #)")

        # Check for clear guidelines
        if "##" not in content:
            warnings.append("No sections found (should have ## headers)")

        # Check for examples
        if "```" not in content:
            warnings.append("No examples found (should have code blocks)")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }


def find_references(file_path: Path, search_dir: Path) -> List[Path]:
    """Find files that reference the given file.

    Args:
        file_path: File to find references for
        search_dir: Directory to search in

    Returns:
        List of files that reference file_path
    """
    references = []
    target_name = file_path.stem

    for md_file in search_dir.rglob("*.md"):
        content = md_file.read_text()
        # Check for markdown links
        if f"]({target_name}" in content or f"]({target_name}.md" in content:
            references.append(md_file)
        # Check for inline references
        elif target_name in content:
            references.append(md_file)

    return references


def validate_version_consistency(project_root: Path) -> Dict[str, Any]:
    """Validate version consistency across documentation.

    Returns:
        Dict with 'consistent' (bool), 'version' (str), 'files' (dict)
    """
    version_pattern = re.compile(r"v?(\d+\.\d+\.\d+)")
    files_with_versions = {}

    for md_file in project_root.rglob("*.md"):
        content = md_file.read_text()
        matches = version_pattern.findall(content)
        if matches:
            # Get unique versions
            unique_versions = list(set(matches))
            if len(unique_versions) == 1:
                files_with_versions[str(md_file.relative_to(project_root))] = unique_versions[0]

    # Check consistency
    versions = set(files_with_versions.values())
    consistent = len(versions) <= 1  # Allow multiple versions (some files might not have version)

    return {
        "consistent": consistent,
        "versions": list(versions),
        "files": files_with_versions
    }


def count_tokens(text: str) -> int:
    """Estimate token count (rough approximation).

    Args:
        text: Text to count tokens for

    Returns:
        Estimated token count
    """
    # Rough estimation: ~4 characters per token
    return len(text) // 4


def check_file_size(file_path: Path, max_kb: int = 10) -> bool:
    """Check if file size is within limit.

    Args:
        file_path: File to check
        max_kb: Maximum size in KB

    Returns:
        True if file is within limit
    """
    size_kb = file_path.stat().st_size / 1024
    return size_kb <= max_kb
