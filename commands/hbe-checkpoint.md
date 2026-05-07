---
name: hbe-checkpoint
description: 保存进度快照，支持会话恢复 / Save progress snapshot for resumable work sessions
allowed_tools: ["Read", "Write", "Bash"]
---

# /hbe-checkpoint

Create a progress checkpoint that can be resumed later.

## Steps

1. **Gather Context**
   - Git status and recent commits
   - Current branch and state
   - Modified files list

2. **Capture Progress**
   - Completed stories/tasks
   - Current work in progress
   - Pending items
   - Learned patterns and gotchas

3. **Save to File**
   Create `progress.md` with structured snapshot

4. **Create Git State**
   Optional: Create git stash or tag for easy rollback

## Output

`progress.md` containing:
- Session summary
- Completed work
- Current status
- Next steps
- Token usage estimate
- Learned patterns
