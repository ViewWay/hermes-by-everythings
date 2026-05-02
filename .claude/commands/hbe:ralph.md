---
name: hbe-ralph
description: Autonomous execution loop for large tasks
allowed_tools: ["Read", "Write", "Edit", "Bash", "Agent"]
---

# /hbe-ralph

Autonomous development loop that breaks context barriers.

## Prerequisites
- prd.json must exist
- Each story has clear acceptance criteria

## Loop
1. Pick next uncompleted story from prd.json
2. TDD implementation (RED → GREEN → REFACTOR)
3. Run verification loop
4. Commit if all pass
5. Update prd.json
6. Repeat until all stories complete
