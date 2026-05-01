# Hermes by Everything's — Project Context

> **Version**: 2.4.0 | **Language**: English (Optimized for Token Efficiency)

---

## Project Identity

**Name**: Hermes by Everything's (HBE)
**Version**: 2.4.0
**Type**: Multi-platform coding enhancement suite with autonomous learning
**Core**: 9 Agents + 13 Skills + 15 Commands + 8 Rules + Ralph + Interactive Engine
**Goal**: 100% automated coding enhancement with optimal token efficiency

---

## Overview

Production-ready Claude Code plugin with proven workflows:
- 🤖 **9 Specialized Agents** - planner, code-reviewer, tdd-guide, etc.
- 🛠️ **13 Skills** - workflows and domain knowledge
- ⚡ **15 Commands** - slash commands (/tdd, /plan, /e2e)
- 🔄 **6 Hooks** - automation triggers
- 📜 **8 Rules** - guiding principles
- 🎯 **Ralph Loop** - autonomous execution
- 💬 **Interactive Engine** - controlled, transparent execution
- ⚡ **Context Optimization** - 50%+ token reduction

---

## Quick Start

```bash
# Run tests
bash scripts/test/test-all.sh

# Plan implementation
/hbe:plan [your feature]

# TDD development
/hbe:tdd

# Code review
/hbe:review
```

---

## Architecture

```
skills/
├── agents/           # Agent definitions
├── interactive/      # Interactive engine specs
└── rules/            # Guiding principles

scripts/
├── hooks/            # Automation hooks
├── interactive/      # Session management
└── ralph/            # Autonomous loop

docs/
├── adr/              # Architecture decisions
└── *.md              # Guides & references

schemas/              # JSON schemas
memory/               # Learning storage
```

**Principles**:
- Layered loading (L0-L6) for token efficiency
- On-demand loading
- Strategic compression
- Continuous learning

---

## Interactive Execution Engine

HBE v2.4+ provides controlled, transparent execution:

**Modes**:
- **Confirm-First**: Require confirmation for critical ops
- **Q&A**: Collect requirements through dialogue
- **Progressive**: Gradual information disclosure
- **Resumable**: Support pause/resume with checkpoints

**User Commands**:
```
yes/no         - Confirm/reject
continue/skip  - Continue/skip step
pause/stop     - Pause execution
explain        - Explain current step
review <item>  - View details
modify k=v     - Modify config
undo           - Undo last step
```

**State Persistence**:
```json
{
  "sessionId": "20260502-143052",
  "task": "Large refactor",
  "status": "paused",
  "completed": ["phase1", "batch1"],
  "pending": ["batch2", "phase3"]
}
```

See: `skills/interactive/interactive-execution-engine.md`

---

## Context Optimization

3-tier loading architecture reduces token consumption by 50%+:

**L0: Index Layer** (~2KB)
- File: `SKILL-INDEX.md`
- Load: Every trigger
- Content: Skill metadata, categories, keywords

**L1: Metadata Layer** (~500 tokens/skill)
- Load: After skill selection
- Content: Skill frontmatter (YAML)

**L2: Full Layer** (~4K tokens/skill)
- Load: During execution
- Content: Full workflow and examples

**Optimization Results**:
- Initial load: 40K → 10K tokens (**75% ↓**)
- Session avg: 100K → 50K/round (**50% ↓**)
- Skill switch: 15K → 4.5K tokens (**70% ↓**)

See: `docs/CONTEXT-OPTIMIZATION.md`

---

## Key Commands

| Command | Purpose | Use Case |
|---------|---------|----------|
| `/hbe:plan` | Implementation planning | New features |
| `/hbe:architect` | Architecture design | System design |
| `/hbe:tdd` | TDD development | Test-driven dev |
| `/hbe:review` | Code review | Quality checks |
| `/hbe:security` | Security review | Vulnerability scan |
| `/hbe:build-fix` | Build fix | Build failures |
| `/hbe:refactor` | Refactor cleanup | Dead code removal |
| `/hbe:docs` | Documentation update | Doc sync |
| `/hbe:verify` | 5-phase verification | Full validation |
| `/hbe:orchestrate` | Multi-agent orchestration | Full workflow |
| `/hbe:ralph` | Autonomous loop | Large automation |
| `/hbe:learn` | Pattern learning | Extract patterns |
| `/hbe:resume` | Resume session | After interrupt |

---

## 100% Trigger Mechanism

Auto-triggers on:

1. **Commands**: `/hbe:*` any command
2. **Keywords**: hbe, hermes, autonomous, ralph, tdd, code review, security
3. **Files**: Editing specific file types triggers relevant commands
4. **Git Events**: Pre-commit, pre-push, PR creation
5. **Failures**: Build/test failures trigger auto-fix

**Execution Flow**:
```
Trigger Detection → Environment Analysis → Agent Loading → 
5-Step Execution → Learning Loop → Handoff/Output
```

---

## Closed-Loop Learning

Auto-triggers on:
- Session end
- Ralph iteration completion
- Error fixes
- User feedback
- Pattern repetition (3x)

**Memory Types**:
- Project-specific → `MEMORY.md`
- User preferences → `memory/feedback/`
- Error patterns → `memory/errors/`
- Success patterns → `memory/successes/`
- Platform diffs → `memory/platform/`

---

## Ralph Autonomous Loop

Auto-start conditions:
- `prd.json` exists with pending stories
- User input: `/hbe:ralph`
- Large task detected (>5 file changes)
- Keywords: "autonomous", "auto implement"

**Interrupt Recovery**:
```bash
# Auto-detects .ralph-state.json
# Resumes from last checkpoint
# Skips completed stories
```

---

## Package Manager Support

Auto-detects: npm, pnpm, yarn, bun

**Configuration**:
1. Env var: `CLAUDE_PACKAGE_MANAGER=pnpm`
2. Project config: `CLAUDE.md.local`
3. Auto-detect: Based on lockfile

---

## Multi-Platform Support

**OS**: Windows, macOS, Linux
**Tools**: Node.js (cross-platform), Bash (Unix), PowerShell (Windows)

**Capability Mapping**:
| Feature | Hermes | Claude Code | OpenCode |
|---------|--------|-------------|----------|
| Load Agent | skill_view() | Read | read_file |
| Parallel | delegate_task() | Agent[] | parallel |
| File Ops | read/write_file | Read/Write/Edit | file tools |
| Hooks | hooks.json | settings.json | config |

---

## Project Overrides

Create `CLAUDE.md.local` for project-specific rules:

```markdown
# Project-Specific Overrides

## Disabled Rules
- Disable prettier
- Disable TypeScript strict mode

## Enabled Features
- Enable Python type hints check
- Enable Rust clippy strict

## Custom Commands
- `/hbe:custom` → Run project script

## Project Patterns
- Use SQLAlchemy not Django ORM
- Use Pydantic v2 not v1
```

---

## Emergency Recovery

```bash
# Diagnose issues
/hbe:diagnose

# Reset state
/hbe:reset --soft   # Keep progress.md
/hbe:reset --hard   # Full reset

# Restore checkpoint
/hbe:restore --checkpoint=[id]

# Verify system
/hbe:verify --system
```

---

## Version History

- **v2.4.0** - Interactive engine + context optimization
- **v2.3.0** - Architecture capability enhancement
- **v2.2.0** - Tech stack selection
- **v2.1.0** - Ralph autonomous loop
- **v2.0.0** - Initial release

---

**Maintainer**: HBE Autonomous Maintenance System
**Version**: 2.4.0
**Last Updated**: 2026-05-02
**Token Optimized**: ✓ English language (40% reduction vs Chinese)
