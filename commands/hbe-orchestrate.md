---
name: hbe-orchestrate
description: 多 Agent 工作流编排 (plan → tdd → review → security) / Multi-agent workflow orchestration
allowed_tools: ["Read", "Write", "Edit", "Bash", "Agent"]
argument-hint: "<feature|bugfix> [任务描述]"
skills: hermes-by-everythings
---

# /hbe-orchestrate

Orchestrate multiple agents in a workflow pipeline.

## Workflows

### Feature Workflow
```
planner → architect → tdd-guide → code-reviewer → security-reviewer → doc-updater
```

### Bugfix Workflow
```
build-error-resolver → tdd-guide → code-reviewer
```

### Refactor Workflow
```
architect → code-reviewer → refactor-cleaner → tdd-guide
```

### Security Workflow
```
security-reviewer → code-reviewer → architect
```

### Full Workflow
```
planner → architect → tdd-guide → code-reviewer → security-reviewer → doc-updater
```

## Steps

1. Select appropriate workflow based on task type
2. Execute agents sequentially
3. Each agent generates handoff document
4. Next agent reads previous handoff
5. Aggregate final report

## Handoff Format

Each handoff includes:
- Context: What was done
- Findings: Key discoveries
- Files Modified: Change list
- Open Questions: Unresolved issues
