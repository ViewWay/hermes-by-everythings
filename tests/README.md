# HBE Test Suite

Complete test framework for Hermes-by-Everything's v3.3.0.

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run all tests
bash scripts/test-all.sh

# Run specific test suites
bash scripts/test-agents.sh    # Agent tests
bash scripts/test-skills.sh    # Skill tests
bash scripts/test-docs.sh      # Documentation tests
```

## Test Structure

```
tests/
├── conftest.py              # Pytest configuration and fixtures
├── lib/
│   └── test_helpers.py      # Test helper functions and validators
├── integration/
│   ├── test_agents.py       # Agent integration tests
│   ├── test_skills.py       # Skill integration tests
│   └── test_documentation.py # Documentation tests
├── scripts/
│   ├── test-all.sh          # Run all tests
│   ├── test-agents.sh       # Run agent tests
│   ├── test-skills.sh       # Run skill tests
│   └── test-docs.sh         # Run documentation tests
├── pytest.ini               # Pytest configuration
└── requirements.txt         # Python dependencies
```

## Test Categories

### Integration Tests (`@pytest.mark.integration`)

Tests that verify the complete HBE system:
- **Agent Tests**: Validate all 30+ agents have correct format
- **Skill Tests**: Verify skills structure and references
- **Documentation Tests**: Check documentation consistency

### Unit Tests (`@pytest.mark.unit`)

Tests for individual components:
- Validator classes
- Helper functions

### Slow Tests (`@pytest.mark.slow`)

Tests that take longer to run:
- Documentation quality checks
- Full agent validation

## Running Tests

### Run All Tests

```bash
pytest tests/ -v
# Or
bash scripts/test-all.sh
```

### Run Fast Tests Only

```bash
pytest tests/ -v -m "not slow"
# Or
bash scripts/test-all.sh --fast
```

### Run with Coverage

```bash
pytest tests/ --cov=skills --cov-report=term-missing
# Or
bash scripts/test-all.sh --cov
```

### Run Specific Test File

```bash
pytest tests/integration/test_agents.py -v
```

### Run Specific Test

```bash
pytest tests/integration/test_agents.py::TestAgents::test_agents_count -v
```

### Run by Marker

```bash
# Integration tests only
pytest tests/ -m integration -v

# Unit tests only
pytest tests/ -m unit -v

# Exclude slow tests
pytest tests/ -m "not slow" -v
```

## Test Validators

The test suite includes validators for:

### AgentValidator

Validates HBE agent files:
- Required fields (name, description, tools)
- Valid tool names
- Valid model names
- Mission section presence

### SkillValidator

Validates HBE skill files:
- Title presence
- Key sections (When to Use, How It Works, Examples)
- Code block presence

### RuleValidator

Validates HBE rule files:
- Title presence
- Section structure
- Example presence

## Fixtures

Available pytest fixtures:

- `project_root` - Project root directory
- `skills_dir` - Skills directory
- `agents_dir` - Agents directory
- `rules_dir` - Rules directory
- `active_dir` - Active skills directory
- `commands_dir` - Commands directory
- `hooks_dir` - Hooks directory
- `all_agents` - All agent files
- `all_skills` - All skill files
- `all_rules` - All rule files
- `temp_agent` - Temporary agent file
- `temp_skill` - Temporary skill file
- `parse_frontmatter` - Frontmatter parser function

## Adding Tests

### Add New Integration Test

1. Create test file in `tests/integration/`
2. Use appropriate markers:

```python
import pytest

@pytest.mark.integration
class TestMyFeature:
    """Test my feature."""

    def test_basic_functionality(self, skills_dir):
        """Test basic functionality."""
        assert True

    @pytest.mark.slow
    def test_advanced_functionality(self, skills_dir):
        """Test advanced functionality."""
        assert True
```

### Add New Validator

1. Add validator class to `tests/lib/test_helpers.py`
2. Write tests for validator in `tests/integration/`

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
- name: Run HBE Tests
  run: |
    pip install -r tests/requirements.txt
    bash tests/scripts/test-all.sh --fast
```

## Troubleshooting

### Tests Not Found

```bash
# Ensure you're in project root
cd /path/to/hermes-by-everythings
pytest tests/ -v
```

### Import Errors

```bash
# Add project to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
pytest tests/ -v
```

### Pytest Not Installed

```bash
# Install pytest
pip install pytest pytest-cov PyYAML
```

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all tests pass
3. Add documentation if needed
4. Update this README

---

**HBE v3.3.0** | Based on ECC v2.0 test framework
