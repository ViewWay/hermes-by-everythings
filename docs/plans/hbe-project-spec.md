# Hermes by Everything's (HBE) — Project Specification & User Manual

> **Version**: 3.3.0 (Marketplace Edition) | **Date**: 2026-05-05
>
> **Language**: [English](#english) | [中文](#中文)

---

<a id="english"></a>

# PART I: Requirements Specification

---

## 1. Product Identity

### 1.1 Definition

Hermes by Everything's (HBE) is a multi-platform, multi-language coding enhancement suite and autonomous closed-loop learning system for Claude Code. It provides production-ready agents, skills, hooks, commands, and rules to transform Claude Code into a self-improving development environment.

### 1.2 Key Metrics

| Metric | Value |
|---|---|
| Version | 3.3.0 (Marketplace Edition) |
| Agents | 37 |
| Skills | 32 |
| Commands | 17 |
| Hooks | 42+ |
| Rules | 8 |
| Total Lines | ~124,000 |
| Languages Covered | 12 (Python, TypeScript, Rust, Go, Kotlin, Java, C#, Dart, Perl, PHP/Laravel, C++, Spring Boot) |
| License | MIT |

### 1.3 Target Users

| Profile | Primary Need | Usage |
|---|---|---|
| Full-stack developer | Multi-language code quality, automated review | Daily heavy use |
| DevOps engineer | Deployment patterns, Docker, CI/CD | Per-project |
| ML researcher | Academic research, benchmarking, paper writing | Per-project via academic skill |
| Team lead | Code standards enforcement, orchestration | Periodic |
| Student (CN/EN) | Learning patterns, thesis writing, auto-review | Light-to-medium |

### 1.4 Design Principles

1. **100% Auto-trigger** — No manual activation needed; context-aware triggering
2. **Closed-loop learning** — Every session feeds back into the knowledge base
3. **Token-efficient** — Three-layer loading architecture (75% initial reduction)
4. **Cross-platform** — Claude Code CLI, Desktop, Web, IDE extensions
5. **Bilingual** — Full EN/CN documentation with smart translation protocol

---

## 2. System Architecture

### 2.1 Component Map

```
HBE v3.3.0
├── Agents (37)          → Specialized sub-agents for delegation
│   ├── Core (10)        → orchestrator, planner, code-reviewer, security-reviewer...
│   ├── Language (27)    → python-reviewer, rust-reviewer, go-reviewer, java-reviewer...
│   └── Domain (37th)    → academic-researcher
├── Skills (32)          → Workflow definitions and domain knowledge
│   ├── Core (13)        → code-review, api-design, backend-patterns, deployment-patterns...
│   ├── Domain (19)      → python-patterns, rust-patterns, golang-patterns...
│   └── Specialized      → academic-research, frontend-design-ultimate, diagram...
├── Commands (17)        → User-invoked slash commands
│   └── /hbe-plan, /hbe-review, /hbe-tdd, /hbe-ralph...
├── Hooks (42+)          → Trigger-based automation
│   ├── Session (2)      → SessionStart, SessionEnd
│   ├── Tool (3)         → PreToolUse, PostToolUse (Edit|Write, Bash)
│   └── Quality (37+)    → GateGuard, format-check, typecheck, security-monitor...
├── Rules (8)            → Always-on guidelines
│   └── coding-style, testing, security, git-workflow, performance, patterns...
├── Ralph Loop           → Autonomous execution system
├── Interactive Engine   → Confirm/Q&A/Progressive/Resumable modes
├── Memory System        → Cross-session persistent learning
└── Context Optimization → L0-L5 layered loading
```

### 2.2 Directory Structure

```
hermes-by-everythings/
├── version.json                    # Unified version (3.3.0)
├── CLAUDE.md                       # Auto-loaded project context
├── skills/
│   ├── INDEX.md                    # Full skill catalog
│   ├── agents/                     # 37 agent definitions
│   │   ├── orchestrator.md
│   │   ├── planner.md
│   │   ├── code-reviewer.md
│   │   ├── security-reviewer.md
│   │   ├── tdd-guide.md
│   │   ├── architect.md
│   │   ├── python-reviewer.md
│   │   ├── rust-reviewer.md
│   │   └── ... (29 more)
│   ├── academic-research/           # Academic research skill pack
│   │   ├── SKILL.md                # 23 sub-commands
│   │   ├── references/tools/       # 150 tool guides
│   │   ├── references/*.md         # 20 methodology guides
│   │   ├── workflows/              # 5 end-to-end workflows
│   │   ├── templates/              # 12 LaTeX templates
│   │   └── scripts/                # 3 utility scripts
│   ├── python-patterns/SKILL.md
│   ├── rust-patterns/SKILL.md
│   ├── golang-patterns/SKILL.md
│   ├── django-patterns/SKILL.md
│   ├── django-security/SKILL.md
│   ├── laravel-patterns/SKILL.md
│   ├── laravel-security/SKILL.md
│   ├── frontend-patterns/SKILL.md
│   ├── frontend-design-ultimate/
│   ├── backend-patterns/SKILL.md
│   ├── api-design/SKILL.md
│   ├── deployment-patterns/SKILL.md
│   ├── docker-patterns/SKILL.md
│   ├── springboot-patterns/SKILL.md
│   ├── kotlin-patterns/SKILL.md
│   ├── security-auditor/SKILL.md
│   ├── diagram/SKILL.md
│   └── ... (11 more)
├── .claude/
│   ├── commands/                   # 17 slash commands
│   │   ├── hbe:plan.md
│   │   ├── hbe:review.md
│   │   ├── hbe:tdd.md
│   │   ├── hbe:security.md
│   │   ├── hbe:ralph.md
│   │   ├── hbe:orchestrate.md
│   │   ├── hbe:architect.md
│   │   ├── hbe:verify.md
│   │   ├── hbe:build-fix.md
│   │   ├── hbe:e2e.md
│   │   ├── hbe:refactor.md
│   │   ├── hbe:docs.md
│   │   ├── hbe:prd.md
│   │   ├── hbe:checkpoint.md
│   │   ├── hbe:learn.md
│   │   ├── hbe:eval.md
│   │   └── hbe:academic.md
│   ├── rules/
│   │   ├── hermes-by-everythings-guardrails.md
│   │   └── everything-claude-code-guardrails.md
│   └── settings.json
├── scripts/
│   ├── hooks/                      # 42+ hook scripts
│   ├── core/ralph/ralph.js
│   ├── core/test/
│   ├── interactive/
│   ├── mcp-memory/
│   └── lib/
├── memory/
│   ├── sessions/
│   ├── errors/
│   ├── successes/
│   └── feedback/
├── docs/
│   ├── plans/
│   ├── architecture/
│   └── guides/
└── templates/
    ├── agent-template.md
    ├── skill-template.md
    ├── command-template.md
    ├── handoff.md
    └── progress.md
```

### 2.3 Data Specifications

#### prd.json (Ralph Input)

```json
{
  "project": "project-name",
  "stories": [
    {
      "id": "S001",
      "title": "Story title",
      "status": "pending|in-progress|done",
      "priority": "P0|P1|P2",
      "tasks": ["task1", "task2"]
    }
  ]
}
```

#### .ralph-state.json (Ralph Runtime)

```json
{
  "sessionId": "timestamp-id",
  "currentStory": "S003",
  "completedStories": ["S001", "S002"],
  "checkpoint": { "phase": "verify", "timestamp": "..." },
  "iterations": 5,
  "errors": []
}
```

#### version.json (Unified Version)

```json
{
  "name": "hermes-by-everythings",
  "version": "3.3.0",
  "codename": "Marketplace Edition",
  "releaseDate": "2026-05-02"
}
```

---

## 3. Functional Requirements

### 3.1 Core Components

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-01 | **Agents**: 37 specialized sub-agents for task delegation | P0 | Done |
| FR-02 | **Skills**: 32 workflow definitions and domain knowledge packs | P0 | Done |
| FR-03 | **Commands**: 17 user-invoked slash commands (`/hbe:*`) | P0 | Done |
| FR-04 | **Hooks**: 42+ trigger-based automation scripts | P0 | Done |
| FR-05 | **Rules**: 8 always-on guideline files | P0 | Done |
| FR-06 | **Ralph Loop**: Autonomous execution with prd.json | P0 | Done |
| FR-07 | **Interactive Engine**: 4 execution modes | P1 | Done |
| FR-08 | **Memory System**: Cross-session persistent learning | P1 | Done |
| FR-09 | **Context Optimization**: L0-L5 layered loading | P1 | Done |

### 3.2 Agent Requirements

#### Core Agents (10)

| Agent | Purpose | Model |
|---|---|---|
| `orchestrator` | Multi-agent delegation and quality closure | claude-sonnet-4-6 |
| `planner` | Implementation planning, task decomposition | claude-sonnet-4-6 |
| `architect` | Architecture design, component planning | claude-opus-4-7 |
| `code-reviewer` | Code quality review across languages | claude-sonnet-4-6 |
| `security-reviewer` | OWASP Top 10 security auditing | claude-opus-4-7 |
| `tdd-guide` | Test-driven development guidance | claude-sonnet-4-6 |
| `loop-operator` | Ralph loop management and recovery | claude-sonnet-4-6 |
| `continuous-learning` | Pattern extraction and skill updates | claude-sonnet-4-6 |
| `refactor-cleaner` | Dead code removal and restructuring | claude-sonnet-4-6 |
| `doc-updater` | Documentation synchronization | claude-sonnet-4-6 |

#### Language-Specific Reviewers (27)

| Language | Reviewer | Build Resolver |
|---|---|---|
| Python | `python-reviewer` | — |
| TypeScript/JS | `typescript-reviewer` | — |
| Rust | `rust-reviewer` | `rust-build-resolver` |
| Go | `go-reviewer` | — |
| Kotlin | `kotlin-reviewer` | `kotlin-build-resolver` |
| Java | `java-reviewer` | `java-build-resolver` |
| C# | `csharp-reviewer` | — |
| Dart/Flutter | `flutter-reviewer` | `dart-build-resolver` |
| C++ | `cpp-reviewer` | `cpp-build-resolver` |
| PyTorch | — | `pytorch-build-resolver` |
| Academic | `academic-researcher` | — |

#### Specialized Agents

| Agent | Purpose |
|---|---|
| `e2e-runner` | End-to-end test execution |
| `silent-failure-hunter` | Detect silent error handling bugs |
| `harness-optimizer` | Test harness optimization |
| `performance-optimizer` | Performance profiling and tuning |
| `seo-specialist` | SEO optimization |
| `database-reviewer` | Database schema and query review |
| `type-design-analyzer` | Type system design analysis |
| `comment-analyzer` | Code comment quality review |
| `code-explorer` | Deep code analysis and exploration |
| `docs-lookup` | API/library documentation retrieval |
| `build-error-resolver` | Generic build error diagnosis |

### 3.3 Command Requirements

| # | Command | Purpose | Key Features |
|---|---|---|---|
| 1 | `/hbe-plan` | Implementation planning | Risk assessment, phased breakdown |
| 2 | `/hbe-architect` | Architecture design | Component diagrams, ADR |
| 3 | `/hbe-tdd` | TDD development | Red-Green-Refactor cycle |
| 4 | `/hbe-review` | Code review | Multi-language, quality metrics |
| 5 | `/hbe-security` | Security audit | OWASP Top 10, dependency check |
| 6 | `/hbe-build-fix` | Build error resolution | Auto-diagnosis, fix suggestions |
| 7 | `/hbe-e2e` | E2E testing | Full-stack test execution |
| 8 | `/hbe-refactor` | Refactoring | Dead code removal, restructuring |
| 9 | `/hbe-docs` | Documentation | Auto-sync, template generation |
| 10 | `/hbe-prd` | PRD generation | Requirements extraction |
| 11 | `/hbe-verify` | 5-stage verification | Full verification cycle |
| 12 | `/hbe-orchestrate` | Multi-agent orchestration | Batch processing, quality closure |
| 13 | `/hbe-ralph` | Autonomous loop | prd.json-driven execution |
| 14 | `/hbe-checkpoint` | Progress snapshot | Save/restore progress |
| 15 | `/hbe-learn` | Pattern learning | Extract reusable patterns |
| 16 | `/hbe-eval` | Evaluation-driven | Capability assessment |
| 17 | `/hbe-academic` | Academic research | 23 sub-commands |

### 3.4 Hook Requirements

#### By Phase

| Phase | Count | Key Hooks |
|---|---|---|
| **SessionStart** | 1 | Bootstrap, environment detection |
| **SessionEnd** | 1 | Learning extraction, session logging |
| **PreToolUse (Bash)** | 1 | Security gate, dangerous command block |
| **PostToolUse (Edit\|Write)** | 1 | Auto-format, GateGuard fact check |
| **PostToolUse (Bash)** | 1 | Build completion, command logging |
| **Standalone Scripts** | 37+ | See detailed hook list below |

#### Hook Categories

| Category | Hooks | Purpose |
|---|---|---|
| **Quality Gates** | `gateguard-fact-force.js`, `quality-gate.js`, `stop-format-typecheck.js` | Ensure quality before writes |
| **Auto-format** | `post-edit-format.js`, `post-edit-typecheck.js`, `post-edit-console-warn.js` | Format and type-check after edits |
| **Security** | `insaits-security-monitor.py`, `config-protection.js` | Security monitoring |
| **Session** | `session-start.js`, `session-end.js`, `session-start-bootstrap.js` | Session lifecycle |
| **Git** | `pre-bash-git-push-reminder.js`, `pre-bash-commit-quality.js` | Git workflow enforcement |
| **Build** | `post-bash-build-complete.js`, `pre-bash-dev-server-block.js` | Build lifecycle |
| **Learning** | `auto-learn.sh`, `evaluate-session.js` | Auto-learning triggers |
| **Cost** | `cost-tracker.js` | Token cost tracking |
| **MCP** | `mcp-health-check.js`, `plugin-hook-bootstrap.js` | MCP server management |
| **Interactive** | `pause-session.sh`, `save-checkpoint.sh`, `start-session.sh` | Interactive engine |
| **Recovery** | `auto-recovery.js` | Error recovery |

### 3.5 Ralph Loop Specification

**Input**: `prd.json` with story list
**Output**: Completed stories with verification

**Flow**:
```
1. Load prd.json → Parse stories
2. Select next pending story (priority order)
3. Execute story:
   a. Analyze → Plan → Code → Test → Verify → Report
4. Save checkpoint after each story
5. Extract learning patterns
6. Repeat until all stories done or interrupted
```

**Features**:
- Interruptible and resumable (`.ralph-state.json`)
- Progress visualization (`[████████░░] 80% (12/15)`)
- Auto-learning after each iteration
- Error recovery with rollback

### 3.6 Interactive Engine Specification

**Modes**:

| Mode | Behavior | Use Case |
|---|---|---|
| **Confirm** | Requires user approval before critical actions | Destructive operations |
| **Q&A** | Collects requirements through dialogue | New feature planning |
| **Progressive** | Information disclosed incrementally | Complex reports |
| **Resumable** | Supports pause/resume with checkpoints | Long-running tasks |

**User Controls**: `yes/no`, `continue/skip`, `pause/stop`, `explain`, `review <item>`, `modify key=value`

### 3.7 Context Optimization Specification

**Three-Layer Loading**:

| Layer | Content | Size | Load Trigger |
|---|---|---|---|
| L0 | `CLAUDE.md` (project context) | ~2 KB | Every session |
| L1 | `SKILL.md` frontmatter (metadata) | ~500 tokens | Skill selected |
| L2 | Full skill content | ~4K tokens | Skill executed |
| L3 | Agent prompts | 3-8 KB | Agent delegated |
| L4 | Rules | 2-5 KB | Always active |
| L5 | Project-specific context | Dynamic | First access |

**Performance Targets**:
- Initial load: 40K → 10K tokens (75% reduction)
- Average session: 100K → 50K tokens (50% reduction)
- Skill switch: 15K → 4.5K tokens (70% reduction)

### 3.8 Academic Research Skill Pack

A self-contained skill with 23 sub-commands, 150 tool references, 20 methodology guides, 5 workflows, and 12 LaTeX templates. See `docs/plans/hbe-requirements-spec.md` for full specification.

**Sub-commands**: check-env, lit-review, paper, experiment, rebuttal, compile, idea-eval, figure-design, de-aigc, causal, template, databases, integrity, pre-submit, benchmark, reproduce, vibe, deep-read, data, tools, hypothesis, stat-analysis, tool-deep

---

## 4. Non-Functional Requirements

### 4.1 Quality

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Agent quality | All agents >= 100 lines with YAML frontmatter |
| NFR-02 | Skill quality | All SKILL.md >= 90 lines with structured sections |
| NFR-03 | Code executability | 100% of code examples runnable |
| NFR-04 | Bilingual coverage | 100% EN/CN documentation |
| NFR-05 | Hook reliability | Zero false-positive blocks on valid operations |

### 4.2 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-10 | Context load time | < 2 seconds |
| NFR-11 | Hook execution | < 500ms per hook |
| NFR-12 | Ralph story cycle | < 5 minutes per story (average) |
| NFR-13 | Memory lookup | < 100ms |

### 4.3 Compatibility

| ID | Requirement | Target |
|---|---|---|
| NFR-20 | Platforms | Claude Code CLI, Desktop, Web, IDE |
| NFR-21 | Operating Systems | macOS, Linux, Windows |
| NFR-22 | Node.js | 18+ (for hook scripts) |
| NFR-23 | Python | 3.9+ (for academic research scripts) |

---

## 5. Interface Specifications

### 5.1 Command Interface

All commands follow the pattern `/hbe:<name>` with optional arguments:

```
/hbe-plan <description>        # Create implementation plan
/hbe-review [path]             # Review code at path
/hbe-tdd <feature>             # Start TDD cycle
/hbe-ralph                     # Start autonomous loop
/hbe-orchestrate <task>        # Multi-agent orchestration
/hbe-learn                     # Extract patterns from session
/hbe-checkpoint                # Save current progress
/hbe-verify                    # Run 5-stage verification
```

### 5.2 Hook Interface

Hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [{ "command": "node scripts/hooks/session-start.js" }],
    "PreToolUse": [{ "matcher": "Bash", "command": "node scripts/hooks/pre-bash-dispatcher.js" }],
    "PostToolUse": [
      { "matcher": "Edit|Write", "command": "node scripts/hooks/post-edit-format.js" },
      { "matcher": "Bash", "command": "node scripts/hooks/post-bash-dispatcher.js" }
    ],
    "SessionEnd": [{ "command": "node scripts/hooks/session-end.js" }]
  }
}
```

### 5.3 Agent Delegation

Agents are delegated via the Agent tool with context:

```
Agent(
  prompt="Review this code for security issues",
  subagent_type="security-reviewer"
)
```

### 5.4 Interactive Engine Controls

```
User: yes/no          → Confirm or reject action
User: continue/skip   → Proceed or skip step
User: pause/stop      → Pause or stop execution
User: explain         → Get detailed explanation
User: review <item>   → Inspect details
User: modify k=v      → Adjust configuration
```

---

## 6. Traceability Matrix

| Feature | Req ID | Implementation |
|---|---|---|
| 37 Agents | FR-01 | `skills/agents/*.md` |
| 32 Skills | FR-02 | `skills/*/SKILL.md` |
| 18 Commands | FR-03 | `.claude/commands/hbe:*.md` |
| 42+ Hooks | FR-04 | `scripts/hooks/*.js` |
| 8 Rules | FR-05 | `.claude/rules/*.md` |
| Ralph Loop | FR-06 | `scripts/core/ralph/ralph.js` |
| Interactive Engine | FR-07 | `scripts/interactive/*.sh` |
| Memory System | FR-08 | `scripts/mcp-memory/`, `memory/` |
| Context Optimization | FR-09 | `CLAUDE.md` L0-L5 layers |
| Academic Research | FR-10 | `skills/academic-research/` |
| Auto-trigger | FR-11 | `CLAUDE.md` trigger conditions |

---

## 7. Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-04-20 | Initial: 10 agents, 13 skills, 15 commands |
| 2.0.0 | 2026-04-25 | Added Ralph loop, interactive engine, context optimization |
| 3.0.0 | 2026-04-30 | Added 27 language-specific agents, expanded to 32 skills |
| 3.1.0 | 2026-05-01 | Added academic research skill pack (v1.0) |
| 3.2.0 | 2026-05-02 | Added closed-loop learning, auto-trigger system |
| 3.3.0 | 2026-05-02 | Marketplace Edition: unified version, 42 hooks, 124K lines |

---

# PART II: User Manual

---

## 1. Installation

### Quick Install

```bash
# 1. Clone the repository
git clone https://github.com/ViewWay/hermes-by-everythings.git
cd hermes-by-everythings

# 2. Run installer
bash scripts/install.sh

# 3. Verify installation
# Open Claude Code — HBE auto-loads on project open
```

### Manual Install

```bash
# 1. Clone
git clone https://github.com/ViewWay/hermes-by-everythings.git
cd hermes-by-everythings

# 2. Settings are in .claude/settings.json
# Hooks auto-configure when Claude Code opens this project

# 3. For academic research skill
ln -s $(pwd)/skills/academic-research ~/.claude/skills/academic-research
```

### Verification

```
You (in Claude Code): /hbe-verify --system

Output:
✓ 37 agents loaded
✓ 32 skills indexed
✓ 17 commands available
✓ 42 hooks active
✓ 8 rules enforced
✓ Ralph loop ready
✓ Memory system operational
```

---

## 2. First Use

```
You: I need to implement user authentication for my Express app.

Claude: [Auto-triggers HBE via "implement" keyword]
I'll help you implement authentication. Let me plan this out.

[Loads /hbe-plan automatically]

## Implementation Plan
Phase 1: Setup JWT middleware
Phase 2: Auth routes (login/register)
Phase 3: Protected route middleware
Phase 4: Tests

Shall I proceed?
```

---

## 3. Command Reference

### Planning & Design

| Command | Purpose | Example |
|---|---|---|
| `/hbe-plan` | Create phased implementation plan | `/hbe-plan add OAuth2 login` |
| `/hbe-architect` | Design system architecture | `/hbe-architect microservices auth` |
| `/hbe-prd` | Generate PRD from requirements | `/hbe-prd user management system` |

### Development

| Command | Purpose | Example |
|---|---|---|
| `/hbe-tdd` | Test-driven development cycle | `/hbe-tdd password validator` |
| `/hbe-review` | Code quality review | `/hbe-review src/auth/` |
| `/hbe-security` | Security vulnerability audit | `/hbe-security` |
| `/hbe-refactor` | Code restructuring | `/hbe-refactor remove dead code` |

### Testing & Verification

| Command | Purpose | Example |
|---|---|---|
| `/hbe-e2e` | End-to-end testing | `/hbe-e2e login flow` |
| `/hbe-verify` | 5-stage verification cycle | `/hbe-verify` |
| `/hbe-build-fix` | Resolve build errors | `/hbe-build-fix` |

### Orchestration & Automation

| Command | Purpose | Example |
|---|---|---|
| `/hbe-orchestrate` | Multi-agent task delegation | `/hbe-orchestrate build full app` |
| `/hbe-ralph` | Autonomous execution loop | `/hbe-ralph` (requires prd.json) |
| `/hbe-checkpoint` | Save progress snapshot | `/hbe-checkpoint` |

### Learning & Documentation

| Command | Purpose | Example |
|---|---|---|
| `/hbe-learn` | Extract patterns from session | `/hbe-learn` |
| `/hbe-docs` | Update documentation | `/hbe-docs` |
| `/hbe-eval` | Capability evaluation | `/hbe-eval` |

### Domain-Specific

| Command | Purpose | Example |
|---|---|---|
| `/hbe-academic` | Academic research (23 sub-cmds) | `/hbe-academic lit-review causal inference` |

---

## 4. Workflow Guides

### 4.1 Standard Feature Development

```
1. /hbe-plan <feature>          → Create implementation plan
2. /hbe-tdd <feature>           → TDD cycle (Red-Green-Refactor)
3. /hbe-review                  → Code quality review
4. /hbe-security                → Security audit (if handling data)
5. /hbe-docs                    → Update documentation
6. /hbe-verify                  → Full verification before commit
```

### 4.2 Autonomous Development (Ralph)

```
1. Create prd.json with stories:
   {
     "stories": [
       {"id": "S001", "title": "Add auth module", "priority": "P0"},
       {"id": "S002", "title": "Add tests", "priority": "P0"}
     ]
   }

2. /hbe-ralph                   → Ralph starts autonomous execution
3. Monitor: [████████░░] 80%    → Progress bar in output
4. /hbe-checkpoint              → Save progress at any point
5. Interrupt & Resume           → Ralph auto-recovers from .ralph-state.json
```

### 4.3 Multi-Agent Orchestration

```
1. /hbe-orchestrate <task>      → Orchestrator decomposes task
2. Agents auto-delegated:
   - architect    → Design
   - planner      → Plan
   - tdd-guide    → Tests
   - code-reviewer → Review
   - security-reviewer → Audit
3. Quality closure loop:
   Each agent output feeds into the next
   Orchestrator verifies before proceeding
```

### 4.4 Academic Research

```
1. /hbe-academic idea-eval      → Evaluate research idea
2. /hbe-academic lit-review     → Structured literature review
3. /hbe-academic databases      → Search 50+ databases
4. /hbe-academic experiment     → Design experiments
5. /hbe-academic paper          → Write paper (3 quality gates)
6. /hbe-academic compile        → Compile LaTeX
7. /hbe-academic pre-submit     → Pre-submission review
8. /hbe-academic rebuttal       → Respond to reviewers
```

---

## 5. Auto-Trigger System

HBE automatically activates based on context. No manual trigger needed.

### Trigger Conditions

| Trigger | Condition | Behavior |
|---|---|---|
| **Command** | User types `/hbe:*` | Direct command execution |
| **Keyword** | `hbe`, `hermes`, `ralph`, `autonomous coding`, etc. | Load HBE context |
| **File type** | `.py`, `.ts`, `.rs`, `.go`, etc. | Suggest relevant commands |
| **Git** | `commit`, `push`, PR creation | Suggest review/verify |
| **Failure** | Build fail, test fail | Auto-suggest fix commands |

### Execution Flow

```
Trigger detected
    ↓
Environment awareness (pwd, git status)
    ↓
Need analysis (user intent + project state)
    ↓
Agent loading (on-demand)
    ↓
Execution (Analyze → Plan → Execute → Verify → Report)
    ↓
Learning (extract patterns → update skills → store memory)
    ↓
Output (handoff document or result report)
```

---

## 6. Memory & Learning System

### What Gets Remembered

| Type | Location | Trigger |
|---|---|---|
| Project patterns | `MEMORY.md` | First project use |
| User preferences | `memory/feedback/` | User confirms/corrects |
| Error patterns | `memory/errors/` | Error fix completed |
| Success patterns | `memory/successes/` | Successful reuse |
| Session context | `memory/sessions/` | Session end |

### Auto-Learning Triggers

1. **Session end** — Extract patterns via `/hbe-learn`
2. **Ralph iteration** — After each story completion
3. **Error fix** — Record solution pattern
4. **User feedback** — Record corrections and preferences
5. **Project change** — Detect new frameworks/patterns

---

## 7. Context Optimization

HBE uses three-layer loading to minimize token consumption:

```
Without HBE:          With HBE:
┌─────────────┐      ┌─────────────┐
│  All skills  │      │  CLAUDE.md  │  ← L0: 2KB
│  All agents  │      │  (always)   │
│  All rules   │      └──────┬──────┘
│  All hooks   │             │
│              │      ┌──────▼──────┐
│   40K+       │      │ Frontmatter │  ← L1: 500 tokens
│   tokens     │      │ (on select) │
│   loaded     │      └──────┬──────┘
│   upfront    │             │
│              │      ┌──────▼──────┐
│              │      │  Full skill │  ← L2: 4K tokens
│              │      │  (on exec)  │
│              │      └─────────────┘
│              │
│              │      Total: ~10K tokens (75% less)
└─────────────┘
```

### Strategic Compression

- **Recent 3 turns**: Full preservation
- **3-10 turns**: Key decisions summarized
- **10+ turns**: High-level summary only
- **Context > 100K tokens**: Auto-compress

---

## 8. Tips & FAQ

### Tips

1. Start new projects with `/hbe-plan` for structured execution.
2. Use `/hbe-ralph` for large tasks — it runs autonomously with checkpoints.
3. Run `/hbe-verify` before every commit — catches issues early.
4. Use `/hbe-orchestrate` when multiple agents need coordination.
5. Let `/hbe-learn` run at session end — builds your knowledge base.
6. For academic research, use `/hbe-academic` — 23 specialized commands.
7. HBE auto-triggers on keywords — you don't need to remember commands.

### FAQ

**Q: Does HBE work with all Claude Code platforms?**
A: Yes — CLI, Desktop, Web, and IDE extensions (VS Code, JetBrains).

**Q: What happens if Ralph gets interrupted?**
A: Ralph saves state to `.ralph-state.json` and auto-recovers on restart.

**Q: Can I add custom skills?**
A: Yes. Create a `SKILL.md` file in `skills/` following the template at `templates/skill-template.md`.

**Q: How do hooks affect performance?**
A: Hooks run in < 500ms each. Only relevant hooks fire per action (not all 42+).

**Q: Do I need to install all dependencies?**
A: No. Only Node.js 18+ is required for hooks. Python 3.9+ is needed for academic research scripts.

**Q: Is my data private?**
A: Yes. All learning and memory is stored locally in your project directory.

---

## 9. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Commands │  │  Agents  │  │      Skills (32)      │  │
│  │  (17)    │  │  (37)    │  │ ┌──────┐ ┌──────────┐ │  │
│  │ /hbe:*   │  │ Delegated│  │ │Core  │ │Academic  │ │  │
│  └────┬─────┘  └────┬─────┘  │ │(13)  │ │Research  │ │  │
│       │              │        │ └──────┘ │(150 tools)│ │  │
│       │              │        │ ┌──────┐ └──────────┘ │  │
│       │              │        │ │Domain│              │  │
│       │              │        │ │(19)  │              │  │
│       │              │        │ └──────┘              │  │
│       │              │        └──────────────────────┘  │
│  ┌────▼──────────────▼───────────────────────────────┐  │
│  │              Orchestrator                           │  │
│  │     (Multi-agent delegation + quality closure)     │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │              Ralph Loop                             │  │
│  │  (Autonomous execution + checkpoint + recovery)    │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                               │
│  ┌──────────┐  ┌────────▼────────┐  ┌──────────────┐  │
│  │  Hooks   │  │ Memory System   │  │   Context    │  │
│  │  (42+)   │  │ (Learning +     │  │ Optimization │  │
│  │  Triggers│  │  Persistence)   │  │  (L0-L5)     │  │
│  └──────────┘  └─────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

<a id="中文"></a>

# 第一部分：需求规格说明书

---

## 1. 产品定义

### 1.1 产品概述

Hermes by Everything's (HBE) 是面向 Claude Code 的多平台多语言编码增强套件和自主闭环学习系统。它提供生产就绪的代理、技能、钩子、命令和规则配置，将 Claude Code 转化为自我改进的开发环境。

### 1.2 核心指标

| 指标 | 数值 |
|---|---|
| 版本 | 3.3.0（市场版） |
| 代理 | 37 个 |
| 技能 | 32 个 |
| 命令 | 17 个 |
| 钩子 | 42+ 个 |
| 规则 | 8 条 |
| 总行数 | ~124,000 |
| 覆盖语言 | 12 种（Python、TypeScript、Rust、Go、Kotlin、Java、C#、Dart、Perl、PHP/Laravel、C++、Spring Boot） |
| 许可证 | MIT |

### 1.3 目标用户

| 用户画像 | 主要需求 | 使用模式 |
|---|---|---|
| 全栈开发者 | 多语言代码质量、自动审查 | 日常高频使用 |
| DevOps 工程师 | 部署模式、Docker、CI/CD | 按项目使用 |
| ML 研究员 | 学术研究、基准测试、论文写作 | 按项目使用 |
| 团队负责人 | 代码标准执行、多 Agent 编排 | 定期使用 |
| 学生（中/英） | 学习模式、论文写作、自动审查 | 轻中度使用 |

### 1.4 设计原则

1. **100% 自动触发** — 无需手动激活，上下文感知触发
2. **闭环学习** — 每次会话反馈到知识库
3. **Token 高效** — 三层加载架构（初始减少 75%）
4. **跨平台** — Claude Code CLI、桌面、Web、IDE 扩展
5. **双语** — 完整中英文文档，智能翻译协议

---

## 2. 系统架构

### 2.1 组件全景图

```
HBE v3.3.0
├── 代理 (37)            → 专业子代理，支持任务委派
│   ├── 核心 (10)        → orchestrator、planner、code-reviewer、security-reviewer...
│   ├── 语言 (27)        → python-reviewer、rust-reviewer、go-reviewer、java-reviewer...
│   └── 领域 (第37个)    → academic-researcher
├── 技能 (32)            → 工作流定义和领域知识
│   ├── 核心 (13)        → code-review、api-design、backend-patterns、deployment-patterns...
│   ├── 领域 (19)        → python-patterns、rust-patterns、golang-patterns...
│   └── 专业             → academic-research、frontend-design-ultimate、diagram...
├── 命令 (17)            → 用户调用的斜杠命令
│   └── /hbe-plan、/hbe-review、/hbe-tdd、/hbe-ralph...
├── 钩子 (42+)           → 触发式自动化
│   ├── 会话 (2)         → SessionStart、SessionEnd
│   ├── 工具 (3)         → PreToolUse、PostToolUse (Edit|Write, Bash)
│   └── 质量 (37+)       → GateGuard、format-check、typecheck、security-monitor...
├── 规则 (8)             → 始终生效的指导原则
├── Ralph 循环           → 自主执行系统
├── 交互引擎             → 确认/问答/渐进/可恢复模式
├── 记忆系统             → 跨会话持久学习
└── 上下文优化           → L0-L5 分层加载
```

### 2.2 数据规格

#### prd.json（Ralph 输入）

```json
{
  "project": "项目名称",
  "stories": [
    {
      "id": "S001",
      "title": "故事标题",
      "status": "pending|in-progress|done",
      "priority": "P0|P1|P2",
      "tasks": ["任务1", "任务2"]
    }
  ]
}
```

#### .ralph-state.json（Ralph 运行时）

```json
{
  "sessionId": "时间戳ID",
  "currentStory": "S003",
  "completedStories": ["S001", "S002"],
  "checkpoint": { "phase": "verify", "timestamp": "..." },
  "iterations": 5,
  "errors": []
}
```

#### version.json（统一版本）

```json
{
  "name": "hermes-by-everythings",
  "version": "3.3.0",
  "codename": "Marketplace Edition",
  "releaseDate": "2026-05-02"
}
```

---

## 3. 功能需求

### 3.1 核心组件

| 编号 | 需求 | 优先级 | 状态 |
|---|---|---|---|
| FR-01 | **代理**：37 个专业子代理 | P0 | 已完成 |
| FR-02 | **技能**：32 个工作流和领域知识包 | P0 | 已完成 |
| FR-03 | **命令**：17 个用户调用命令 (`/hbe:*`) | P0 | 已完成 |
| FR-04 | **钩子**：42+ 个触发式自动化脚本 | P0 | 已完成 |
| FR-05 | **规则**：8 条始终生效的指导文件 | P0 | 已完成 |
| FR-06 | **Ralph 循环**：基于 prd.json 的自主执行 | P0 | 已完成 |
| FR-07 | **交互引擎**：4 种执行模式 | P1 | 已完成 |
| FR-08 | **记忆系统**：跨会话持久学习 | P1 | 已完成 |
| FR-09 | **上下文优化**：L0-L5 分层加载 | P1 | 已完成 |

### 3.2 代理需求

#### 核心代理（10）

| 代理 | 功能 | 模型 |
|---|---|---|
| `orchestrator` | 多 Agent 委派与质量闭环 | claude-sonnet-4-6 |
| `planner` | 实现规划、任务拆解 | claude-sonnet-4-6 |
| `architect` | 架构设计、组件规划 | claude-opus-4-7 |
| `code-reviewer` | 跨语言代码质量审查 | claude-sonnet-4-6 |
| `security-reviewer` | OWASP Top 10 安全审计 | claude-opus-4-7 |
| `tdd-guide` | 测试驱动开发指导 | claude-sonnet-4-6 |
| `loop-operator` | Ralph 循环管理与恢复 | claude-sonnet-4-6 |
| `continuous-learning` | 模式提取与技能更新 | claude-sonnet-4-6 |
| `refactor-cleaner` | 死代码清除与重构 | claude-sonnet-4-6 |
| `doc-updater` | 文档同步更新 | claude-sonnet-4-6 |

#### 语言审查代理（27）

| 语言 | 审查代理 | 构建修复代理 |
|---|---|---|
| Python | `python-reviewer` | — |
| TypeScript/JS | `typescript-reviewer` | — |
| Rust | `rust-reviewer` | `rust-build-resolver` |
| Go | `go-reviewer` | — |
| Kotlin | `kotlin-reviewer` | `kotlin-build-resolver` |
| Java | `java-reviewer` | `java-build-resolver` |
| C# | `csharp-reviewer` | — |
| Dart/Flutter | `flutter-reviewer` | `dart-build-resolver` |
| C++ | `cpp-reviewer` | `cpp-build-resolver` |
| PyTorch | — | `pytorch-build-resolver` |
| 学术研究 | `academic-researcher` | — |

#### 专业代理

| 代理 | 功能 |
|---|---|
| `e2e-runner` | 端到端测试执行 |
| `silent-failure-hunter` | 静默失败检测 |
| `harness-optimizer` | 测试配置优化 |
| `performance-optimizer` | 性能分析与调优 |
| `seo-specialist` | SEO 优化 |
| `database-reviewer` | 数据库审查 |
| `type-design-analyzer` | 类型系统设计分析 |
| `comment-analyzer` | 代码注释审查 |
| `code-explorer` | 深度代码分析 |
| `docs-lookup` | API/库文档查询 |
| `build-error-resolver` | 通用构建错误诊断 |

### 3.3 命令需求

| # | 命令 | 功能 | 关键特性 |
|---|---|---|---|
| 1 | `/hbe-plan` | 实现规划 | 风险评估、分阶段拆解 |
| 2 | `/hbe-architect` | 架构设计 | 组件图、ADR |
| 3 | `/hbe-tdd` | TDD 开发 | 红-绿-重构循环 |
| 4 | `/hbe-review` | 代码审查 | 多语言、质量指标 |
| 5 | `/hbe-security` | 安全审计 | OWASP Top 10、依赖检查 |
| 6 | `/hbe-build-fix` | 构建修复 | 自动诊断、修复建议 |
| 7 | `/hbe-e2e` | E2E 测试 | 全栈测试执行 |
| 8 | `/hbe-refactor` | 重构清理 | 死代码清除、结构优化 |
| 9 | `/hbe-docs` | 文档更新 | 自动同步、模板生成 |
| 10 | `/hbe-prd` | PRD 生成 | 需求提取 |
| 11 | `/hbe-verify` | 五阶段验证 | 完整验证循环 |
| 12 | `/hbe-orchestrate` | 多 Agent 编排 | 批量处理、质量闭环 |
| 13 | `/hbe-ralph` | 自主循环 | 基于 prd.json 执行 |
| 14 | `/hbe-checkpoint` | 进度快照 | 保存/恢复进度 |
| 15 | `/hbe-learn` | 模式学习 | 提取可复用模式 |
| 16 | `/hbe-eval` | 评估驱动 | 能力评估 |
| 17 | `/hbe-academic` | 学术研究 | 23 个子命令 |

### 3.4 钩子需求

#### 按阶段

| 阶段 | 数量 | 关键钩子 |
|---|---|---|
| **SessionStart** | 1 | 引导、环境检测 |
| **SessionEnd** | 1 | 学习提取、会话日志 |
| **PreToolUse (Bash)** | 1 | 安全门、危险命令拦截 |
| **PostToolUse (Edit\|Write)** | 1 | 自动格式化、GateGuard 事实检查 |
| **PostToolUse (Bash)** | 1 | 构建完成、命令日志 |
| **独立脚本** | 37+ | 详见下方 |

#### 钩子分类

| 类别 | 钩子 | 功能 |
|---|---|---|
| **质量门** | `gateguard-fact-force.js`、`quality-gate.js`、`stop-format-typecheck.js` | 写入前质量保障 |
| **自动格式** | `post-edit-format.js`、`post-edit-typecheck.js` | 编辑后格式化和类型检查 |
| **安全** | `insaits-security-monitor.py`、`config-protection.js` | 安全监控 |
| **会话** | `session-start.js`、`session-end.js`、`session-start-bootstrap.js` | 会话生命周期 |
| **Git** | `pre-bash-git-push-reminder.js`、`pre-bash-commit-quality.js` | Git 工作流 |
| **构建** | `post-bash-build-complete.js`、`pre-bash-dev-server-block.js` | 构建生命周期 |
| **学习** | `auto-learn.sh`、`evaluate-session.js` | 自动学习触发 |
| **成本** | `cost-tracker.js` | Token 成本追踪 |
| **交互** | `pause-session.sh`、`save-checkpoint.sh` | 交互引擎支持 |
| **恢复** | `auto-recovery.js` | 错误自动恢复 |

### 3.5 Ralph 循环规格

**输入**：含故事列表的 `prd.json`
**输出**：验证通过的故事

**流程**：
```
1. 加载 prd.json → 解析故事
2. 选择下一个待处理故事（按优先级）
3. 执行故事：
   a. 分析 → 规划 → 编码 → 测试 → 验证 → 报告
4. 每个故事完成后保存检查点
5. 提取学习模式
6. 重复直到所有故事完成或中断
```

**特性**：
- 可中断可恢复（`.ralph-state.json`）
- 进度可视化（`[████████░░] 80%`）
- 每次迭代后自动学习
- 错误恢复与回滚

### 3.6 交互引擎规格

| 模式 | 行为 | 使用场景 |
|---|---|---|
| **确认式** | 关键操作前需用户确认 | 破坏性操作 |
| **问答式** | 通过对话收集需求 | 新功能规划 |
| **渐进式** | 逐步披露信息 | 复杂报告 |
| **可恢复式** | 支持暂停/恢复，带检查点 | 长时间任务 |

**用户控制**：`yes/no`、`continue/skip`、`pause/stop`、`explain`、`review <项>`、`modify 键=值`

### 3.7 上下文优化规格

**三层加载**：

| 层级 | 内容 | 大小 | 加载时机 |
|---|---|---|---|
| L0 | `CLAUDE.md`（项目上下文） | ~2 KB | 每次会话 |
| L1 | `SKILL.md` 元数据 | ~500 tokens | 选择技能时 |
| L2 | 完整技能内容 | ~4K tokens | 执行技能时 |
| L3 | 代理提示词 | 3-8 KB | 委派代理时 |
| L4 | 规则 | 2-5 KB | 始终生效 |
| L5 | 项目特定上下文 | 动态 | 首次访问 |

**性能目标**：
- 初始加载：40K → 10K tokens（减少 75%）
- 平均会话：100K → 50K tokens（减少 50%）
- 技能切换：15K → 4.5K tokens（减少 70%）

### 3.8 学术研究技能包

独立技能包，含 23 个子命令、150 个工具参考、20 个方法论指南、5 个工作流和 12 个 LaTeX 模板。详见 `docs/plans/hbe-requirements-spec-CN.md`。

---

## 4. 非功能需求

### 4.1 品质

| 编号 | 需求 | 目标 |
|---|---|---|
| NFR-01 | 代理品质 | 所有代理 >= 100 行，含 YAML 前置数据 |
| NFR-02 | 技能品质 | 所有 SKILL.md >= 90 行，含结构化章节 |
| NFR-03 | 代码可运行性 | 100% 代码示例可独立运行 |
| NFR-04 | 双语覆盖 | 100% 中英文文档 |
| NFR-05 | 钩子可靠性 | 零误报阻塞 |

### 4.2 性能

| 编号 | 需求 | 目标 |
|---|---|---|
| NFR-10 | 上下文加载 | < 2 秒 |
| NFR-11 | 钩子执行 | < 500ms/个 |
| NFR-12 | Ralph 故事周期 | < 5 分钟/故事（平均） |
| NFR-13 | 记忆查询 | < 100ms |

### 4.3 兼容性

| 编号 | 需求 | 目标 |
|---|---|---|
| NFR-20 | 平台 | Claude Code CLI、桌面、Web、IDE |
| NFR-21 | 操作系统 | macOS、Linux、Windows |
| NFR-22 | Node.js | 18+（钩子脚本） |
| NFR-23 | Python | 3.9+（学术研究脚本） |

---

## 5. 接口规格

### 5.1 命令接口

所有命令遵循 `/hbe:<名称>` 模式，支持可选参数：

```
/hbe-plan <描述>               # 创建实现规划
/hbe-review [路径]             # 审查指定路径代码
/hbe-tdd <功能>                # 启动 TDD 循环
/hbe-ralph                     # 启动自主循环
/hbe-orchestrate <任务>        # 多 Agent 编排
/hbe-learn                     # 提取会话模式
/hbe-checkpoint                # 保存当前进度
/hbe-verify                    # 运行五阶段验证
```

### 5.2 钩子接口

钩子在 `.claude/settings.json` 中配置：

```json
{
  "hooks": {
    "SessionStart": [{ "command": "node scripts/hooks/session-start.js" }],
    "PreToolUse": [{ "matcher": "Bash", "command": "node scripts/hooks/pre-bash-dispatcher.js" }],
    "PostToolUse": [
      { "matcher": "Edit|Write", "command": "node scripts/hooks/post-edit-format.js" },
      { "matcher": "Bash", "command": "node scripts/hooks/post-bash-dispatcher.js" }
    ],
    "SessionEnd": [{ "command": "node scripts/hooks/session-end.js" }]
  }
}
```

### 5.3 代理委派

通过 Agent 工具委派代理：

```
Agent(
  prompt="审查此代码的安全问题",
  subagent_type="security-reviewer"
)
```

### 5.4 交互引擎控制

```
用户: yes/no          → 确认或拒绝操作
用户: continue/skip   → 继续或跳过步骤
用户: pause/stop      → 暂停或停止执行
用户: explain         → 获取详细解释
用户: review <项>     → 查看详情
用户: modify 键=值    → 调整配置
```

---

## 6. 追溯矩阵

| 功能 | 需求编号 | 实现文件 |
|---|---|---|
| 37 个代理 | FR-01 | `skills/agents/*.md` |
| 32 个技能 | FR-02 | `skills/*/SKILL.md` |
| 17 个命令 | FR-03 | `.claude/commands/hbe:*.md` |
| 42+ 钩子 | FR-04 | `scripts/hooks/*.js` |
| 8 条规则 | FR-05 | `.claude/rules/*.md` |
| Ralph 循环 | FR-06 | `scripts/core/ralph/ralph.js` |
| 交互引擎 | FR-07 | `scripts/interactive/*.sh` |
| 记忆系统 | FR-08 | `scripts/mcp-memory/`、`memory/` |
| 上下文优化 | FR-09 | `CLAUDE.md` L0-L5 层 |
| 学术研究 | FR-10 | `skills/academic-research/` |
| 自动触发 | FR-11 | `CLAUDE.md` 触发条件 |

---

## 7. 版本历史

| 版本 | 日期 | 变更 |
|---|---|---|
| 1.0.0 | 2026-04-20 | 初始版本：10 代理、13 技能、18 命令 |
| 2.0.0 | 2026-04-25 | 新增 Ralph 循环、交互引擎、上下文优化 |
| 3.0.0 | 2026-04-30 | 新增 27 个语言审查代理，扩展至 32 技能 |
| 3.1.0 | 2026-05-01 | 新增学术研究技能包（v1.0） |
| 3.2.0 | 2026-05-02 | 新增闭环学习、自动触发系统 |
| 3.3.0 | 2026-05-02 | 市场版：统一版本管理、42 钩子、124K 行 |

---

# 第二部分：使用手册

---

## 1. 安装

### 快速安装

```bash
# 1. 克隆仓库
git clone https://github.com/ViewWay/hermes-by-everythings.git
cd hermes-by-everythings

# 2. 运行安装脚本
bash scripts/install.sh

# 3. 验证安装
# 打开 Claude Code — HBE 在项目打开时自动加载
```

### 手动安装

```bash
# 1. 克隆
git clone https://github.com/ViewWay/hermes-by-everythings.git
cd hermes-by-everythings

# 2. 设置文件在 .claude/settings.json
# 钩子在 Claude Code 打开项目时自动配置

# 3. 如需学术研究技能
ln -s $(pwd)/skills/academic-research ~/.claude/skills/academic-research
```

### 验证

```
你（在 Claude Code 中）: /hbe-verify --system

输出:
✓ 37 个代理已加载
✓ 32 个技能已索引
✓ 17 个命令可用
✓ 42 个钩子已激活
✓ 8 条规则已生效
✓ Ralph 循环就绪
✓ 记忆系统运行中
```

---

## 2. 首次使用

```
你: 我需要为 Express 应用实现用户认证。

Claude: [通过"实现"关键词自动触发 HBE]
我来帮你实现认证功能，先做个规划。

[自动加载 /hbe-plan]

## 实现规划
阶段 1：设置 JWT 中间件
阶段 2：认证路由（登录/注册）
阶段 3：受保护路由中间件
阶段 4：测试

要继续吗？
```

---

## 3. 命令参考

### 规划与设计

| 命令 | 功能 | 示例 |
|---|---|---|
| `/hbe-plan` | 创建分阶段实现规划 | `/hbe-plan 添加 OAuth2 登录` |
| `/hbe-architect` | 系统架构设计 | `/hbe-architect 微服务认证` |
| `/hbe-prd` | 从需求生成 PRD | `/hbe-prd 用户管理系统` |

### 开发

| 命令 | 功能 | 示例 |
|---|---|---|
| `/hbe-tdd` | 测试驱动开发循环 | `/hbe-tdd 密码验证器` |
| `/hbe-review` | 代码质量审查 | `/hbe-review src/auth/` |
| `/hbe-security` | 安全漏洞审计 | `/hbe-security` |
| `/hbe-refactor` | 代码重构 | `/hbe-refactor 清除死代码` |

### 测试与验证

| 命令 | 功能 | 示例 |
|---|---|---|
| `/hbe-e2e` | 端到端测试 | `/hbe-e2e 登录流程` |
| `/hbe-verify` | 五阶段验证循环 | `/hbe-verify` |
| `/hbe-build-fix` | 构建错误修复 | `/hbe-build-fix` |

### 编排与自动化

| 命令 | 功能 | 示例 |
|---|---|---|
| `/hbe-orchestrate` | 多 Agent 任务委派 | `/hbe-orchestrate 构建完整应用` |
| `/hbe-ralph` | 自主执行循环 | `/hbe-ralph`（需要 prd.json） |
| `/hbe-checkpoint` | 保存进度快照 | `/hbe-checkpoint` |

### 学习与文档

| 命令 | 功能 | 示例 |
|---|---|---|
| `/hbe-learn` | 提取会话模式 | `/hbe-learn` |
| `/hbe-docs` | 更新文档 | `/hbe-docs` |
| `/hbe-eval` | 能力评估 | `/hbe-eval` |

### 领域专用

| 命令 | 功能 | 示例 |
|---|---|---|
| `/hbe-academic` | 学术研究（23 子命令） | `/hbe-academic lit-review 因果推断` |

---

## 4. 工作流指南

### 4.1 标准功能开发

```
1. /hbe-plan <功能>             → 创建实现规划
2. /hbe-tdd <功能>              → TDD 循环（红-绿-重构）
3. /hbe-review                  → 代码质量审查
4. /hbe-security                → 安全审计（涉及数据时）
5. /hbe-docs                    → 更新文档
6. /hbe-verify                  → 提交前完整验证
```

### 4.2 自主开发（Ralph）

```
1. 创建 prd.json：
   {
     "stories": [
       {"id": "S001", "title": "添加认证模块", "priority": "P0"},
       {"id": "S002", "title": "添加测试", "priority": "P0"}
     ]
   }

2. /hbe-ralph                   → Ralph 开始自主执行
3. 监控进度：[████████░░] 80%    → 输出中的进度条
4. /hbe-checkpoint              → 随时保存进度
5. 中断与恢复                    → Ralph 从 .ralph-state.json 自动恢复
```

### 4.3 多 Agent 编排

```
1. /hbe-orchestrate <任务>      → 编排器分解任务
2. 代理自动委派：
   - architect    → 设计
   - planner      → 规划
   - tdd-guide    → 测试
   - code-reviewer → 审查
   - security-reviewer → 审计
3. 质量闭环：
   每个代理的输出作为下一个的输入
   编排器验证后才继续
```

### 4.4 学术研究

```
1. /hbe-academic idea-eval      → 评估研究构想
2. /hbe-academic lit-review     → 结构化文献综述
3. /hbe-academic databases      → 搜索 50+ 数据库
4. /hbe-academic experiment     → 设计实验
5. /hbe-academic paper          → 写论文（3 道质量关卡）
6. /hbe-academic compile        → 编译 LaTeX
7. /hbe-academic pre-submit     → 投前审查
8. /hbe-academic rebuttal       → 回复审稿人
```

---

## 5. 自动触发系统

HBE 根据上下文自动激活，无需手动触发。

### 触发条件

| 触发类型 | 条件 | 行为 |
|---|---|---|
| **命令** | 用户输入 `/hbe:*` | 直接执行命令 |
| **关键词** | `hbe`、`hermes`、`ralph`、`自主编码` 等 | 加载 HBE 上下文 |
| **文件类型** | `.py`、`.ts`、`.rs`、`.go` 等 | 推荐相关命令 |
| **Git** | `commit`、`push`、创建 PR | 推荐审查/验证 |
| **失败** | 构建失败、测试失败 | 自动推荐修复命令 |

### 执行流程

```
检测到触发
    ↓
环境感知（当前目录、git 状态）
    ↓
需求分析（用户意图 + 项目状态）
    ↓
代理加载（按需）
    ↓
执行（分析 → 规划 → 执行 → 验证 → 报告）
    ↓
学习（提取模式 → 更新技能 → 存储记忆）
    ↓
输出（交接文档或结果报告）
```

---

## 6. 记忆与学习系统

### 记忆内容

| 类型 | 位置 | 触发条件 |
|---|---|---|
| 项目模式 | `MEMORY.md` | 首次使用项目 |
| 用户偏好 | `memory/feedback/` | 用户确认/校正 |
| 错误模式 | `memory/errors/` | 错误修复完成 |
| 成功模式 | `memory/successes/` | 成功复用 |
| 会话上下文 | `memory/sessions/` | 会话结束 |

### 自动学习触发

1. **会话结束** — 通过 `/hbe-learn` 提取模式
2. **Ralph 迭代** — 每个故事完成后
3. **错误修复** — 记录解决方案模式
4. **用户反馈** — 记录校正和偏好
5. **项目变更** — 检测新框架/模式

---

## 7. 上下文优化

HBE 使用三层加载最小化 token 消耗：

```
无 HBE:               有 HBE:
┌─────────────┐      ┌─────────────┐
│  全部技能     │      │  CLAUDE.md  │  ← L0: 2KB
│  全部代理     │      │  (始终加载)  │
│  全部规则     │      └──────┬──────┘
│  全部钩子     │             │
│              │      ┌──────▼──────┐
│   40K+       │      │  元数据      │  ← L1: 500 tokens
│   tokens     │      │ (选择时加载) │
│   预加载     │      └──────┬──────┘
│              │             │
│              │      ┌──────▼──────┐
│              │      │ 完整技能     │  ← L2: 4K tokens
│              │      │ (执行时加载) │
│              │      └─────────────┘
│              │
│              │      总计: ~10K tokens (减少 75%)
└─────────────┘
```

### 战略压缩

- **最近 3 轮**：完整保留
- **3-10 轮**：关键决策摘要
- **10+ 轮**：仅保留高层摘要
- **上下文 > 100K tokens**：自动压缩

---

## 8. 使用技巧与常见问题

### 使用技巧

1. 新项目从 `/hbe-plan` 开始，确保结构化执行。
2. 大型任务用 `/hbe-ralph` — 自主运行，带检查点。
3. 每次提交前运行 `/hbe-verify` — 提前发现问题。
4. 需要多个代理协作时用 `/hbe-orchestrate`。
5. 会话结束让 `/hbe-learn` 运行 — 构建知识库。
6. 学术研究用 `/hbe-academic` — 23 个专业命令。
7. HBE 通过关键词自动触发 — 无需记住命令。

### 常见问题

**问：HBE 支持所有 Claude Code 平台吗？**
答：是的 — CLI、桌面、Web 和 IDE 扩展（VS Code、JetBrains）。

**问：Ralph 被中断了怎么办？**
答：Ralph 将状态保存到 `.ralph-state.json`，重启时自动恢复。

**问：可以添加自定义技能吗？**
答：可以。在 `skills/` 下创建 `SKILL.md` 文件，遵循 `templates/skill-template.md` 模板。

**问：钩子会影响性能吗？**
答：每个钩子运行 < 500ms。每次操作只触发相关钩子（不是全部 42+）。

**问：需要安装所有依赖吗？**
答：不需要。钩子只需 Node.js 18+。学术研究脚本需要 Python 3.9+。

**问：数据是私有的吗？**
答：是的。所有学习和记忆存储在项目本地目录中。

---

## 9. 架构总览

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ 命令(17) │  │ 代理(37) │  │     技能 (32)        │  │
│  │ /hbe:*   │  │ 任务委派 │  │ ┌──────┐ ┌────────┐ │  │
│  └────┬─────┘  └────┬─────┘  │ │核心  │ │学术研究│ │  │
│       │              │        │ │(13)  │ │(150工具)│ │  │
│       │              │        │ └──────┘ └────────┘ │  │
│       │              │        │ ┌──────┐            │  │
│       │              │        │ │领域  │            │  │
│       │              │        │ │(19)  │            │  │
│       │              │        │ └──────┘            │  │
│       │              │        └──────────────────────┘  │
│  ┌────▼──────────────▼───────────────────────────────┐  │
│  │              Orchestrator 编排器                     │  │
│  │     （多代理委派 + 质量闭环）                        │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                               │
│  ┌───────────────────────▼───────────────────────────┐  │
│  │              Ralph 循环                             │  │
│  │  （自主执行 + 检查点 + 恢复）                       │  │
│  └───────────────────────┬───────────────────────────┘  │
│                          │                               │
│  ┌──────────┐  ┌────────▼────────┐  ┌──────────────┐  │
│  │ 钩子(42+)│  │   记忆系统       │  │  上下文优化  │  │
│  │ 触发式   │  │ （学习+持久化）  │  │  (L0-L5)     │  │
│  └──────────┘  └─────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

*HBE Project Specification & User Manual v1.0 | HBE v3.3.0 (Marketplace Edition) | 2026-05-05*
