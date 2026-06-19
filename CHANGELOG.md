# Changelog

All notable changes to Hermes-by-Everything (HBE) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.1] - 2026-06-19

### Added

- **三平台插件市场支持**: HBE 现可被 Claude Code / ZCode / Codex 通过插件市场安装
  - 新增 `.claude-plugin/plugin.json` + `marketplace.json` (Claude Code)
  - 新增 `.zcode-plugin/plugin.json` (ZCode, marketplace 安装时自动生成)
  - 新增 `.codex-plugin/plugin.json` + `.agents/plugins/marketplace.json` (Codex)
  - 三平台共享同一套 `skills/`、`commands/`、`hooks/`，仅清单目录名不同
- **插件入口技能**: `skills/hermes-by-everythings/SKILL.md` (软链到主入口)
- **hooks 重写**: `hooks/hooks.json` 改为三平台标准格式 (`${CLAUDE_PLUGIN_ROOT}`)，基于 `.claude/settings.json` 真实 hooks，修正 2 处脚本路径错误
- **命令 frontmatter 适配**: 18 个命令补全 `argument-hint` + `skills` 标准字段 (保留旧字段向后兼容)

### Fixed

- **plugin.json 格式**: skills/commands 必须为数组格式 `["./skills/"]` (Claude Code schema 要求，曾用字符串被拒)
- **文档 drift 修复**: 统一 agent(37)/skill(33)/command(18)/rule(77) 实际数量到所有入口文档
- **断链修复**: `.claude/skills/.../skills` 和 `skills/academic-research` 断链 (硬编码 `~/github/` 旧路径)
- **install.sh**: 补全未定义变量 `TEMP_DIR/REPO_URL/INSTALL_DIR` (曾导致选项 1/2/3 崩溃)
- **install.sh**: 清理旧命名残留 (hbe 冒号格式 → hbe 连字符格式)
- **conftest.py**: `get_all_rules()` 非递归 glob bug (漏计 69 个规则)

### Changed

- 版本号 3.3.0 → 3.3.1
- skill 数量 32 → 33 (新增插件入口技能)

## [3.3.0] - 2026-05-02

### Added

#### ECC Agents Complete Integration (17 new agents)
- **P0 Critical Agents** (5)
  - loop-operator - Autonomous loop operations for Ralph
  - python-reviewer - Python code review specialist
  - typescript-reviewer - TypeScript/JavaScript code review
  - go-reviewer - Go code review specialist
  - harness-optimizer - Agent harness performance optimization

- **P1 Important Agents** (4)
  - code-explorer - Deep codebase analysis
  - docs-lookup - Context7 API documentation queries
  - performance-optimizer - Performance analysis and optimization
  - database-reviewer - PostgreSQL query and schema review

- **P2 Enhancement Agents** (5)
  - flutter-reviewer - Flutter/Dart code review
  - rust-reviewer - Rust code review specialist
  - rust-build-resolver - Rust build error resolution
  - pytorch-build-resolver - PyTorch/CUDA error resolution
  - type-design-analyzer - Type system design analysis

- **P3 Special Purpose Agents** (3)
  - silent-failure-hunter - Silent failure detection
  - seo-specialist - SEO optimization specialist
  - comment-analyzer - Code comment analysis

#### Test Framework (44 tests, 16 files)
- **Test Infrastructure**
  - tests/conftest.py - Pytest configuration and fixtures
  - tests/lib/test_helpers.py - Validator classes and helpers
  - tests/pytest.ini - Pytest configuration
  - tests/requirements.txt - Python dependencies
  - tests/README.md - Complete testing guide

- **Integration Tests** (44 tests)
  - tests/integration/test_agents.py - Agent validation (20 tests)
  - tests/integration/test_skills.py - Skill validation (9 tests)
  - tests/integration/test_documentation.py - Documentation checks (15 tests)

- **Test Runners** (4 scripts)
  - tests/scripts/test-all.sh - Run all tests
  - tests/scripts/test-agents.sh - Agent tests
  - tests/scripts/test-skills.sh - Skill tests
  - tests/scripts/test-docs.sh - Documentation tests

- **Validators**
  - AgentValidator - Agent format validation
  - SkillValidator - Skill structure validation
  - RuleValidator - Rule compliance validation

- **Test Coverage**
  - 36 tests passing ✅
  - 5 tests failing (found real issues) ⚠️
  - 3 slow tests 🔜
  - 100+ assertions
  - 12 pytest fixtures

#### Automation Tools (65 new files)
- **Session Management** (7 hooks)
  - session-start-bootstrap.js - Auto session initialization
  - session-end-marker.js - Session end tracking
  - session-activity-tracker.js - Activity monitoring

- **Quality Gates** (5 hooks)
  - quality-gate.js - Automated quality checks
  - design-quality-check.js - Design quality verification
  - check-console-log.js - Console log detection
  - doc-file-warning.js - Documentation warnings
  - config-protection.js - Configuration protection

- **Automation** (8 hooks)
  - bash-hook-dispatcher.js - Bash hook dispatcher
  - plugin-hook-bootstrap.js - Plugin hook bootstrap
  - governance-capture.js - Governance tracking
  - observe-runner.js - Observation runner

- **Post-Edit Processing** (4 hooks)
  - post-edit-accumulator.js - Edit accumulation
  - post-edit-console-warn.js - Console warnings
  - post-edit-format.js - Auto formatting
  - post-edit-typecheck.js - Auto type checking

- **Git Integration** (3 hooks)
  - pre-bash-commit-quality.js - Pre-commit quality check
  - pre-bash-git-push-reminder.js - Push reminder
  - post-bash-pr-created.js - PR created notification

- **Tool Libraries** (28 lib files)
  - agent-compress.js - Agent compression
  - install-lifecycle.js - Installation lifecycle
  - install-executor.js - Installation executor
  - mcp-config.js - MCP configuration
  - orchestration-session.js - Orchestration session
  - package-manager.js - Package manager detection
  - hook-flags.js - Hook flag management
  - And 20+ more utility libraries

### Changed

#### Improved Coverage
- **Agents**: 65% → 75% (31 → 36 agents)
- **Automation**: 0% → 73% (0 → 73 files)
- **Core Functionality**: 85% → 95%+

#### Documentation
- Updated AGENTS.md with 6 agent categories
- Updated skills/INDEX.md with new agents
- Added comprehensive agent usage guides
- Unified version to v3.3.0 across all documents

### Fixed

- Fixed missing ECC P0 critical agents
- Fixed missing automation hooks and libraries
- Fixed version inconsistency across documents

## [3.2.0] - Previous Release

### Features
- Ralph autonomous execution system
- Interactive execution engine
- Token optimization (layered loading)
- Multi-language support (C++, C#, Java, Kotlin, Dart)

### Documentation
- Complete Chinese localization
- Simplified command set (16 core commands)
- Enhanced tutorials and guides

## [3.1.0] - Earlier Release

### Initial Release
- Core agent system (11 agents)
- Basic skill system (241 skills)
- Rule-based quality checks
- Installation manifest system

---

## Version Naming Convention

- **Major version (X.0.0)**: Major architecture changes
- **Minor version (0.X.0)**: New features (backward compatible)
- **Patch version (0.0.X)**: Bug fixes and minor improvements
