---
name: hbe-learn
description: 从会话中提取可复用模式，生成技能 / Extract reusable patterns from session into skills
allowed_tools: ["Read", "Write", "Edit", "Bash"]
argument-hint: "[可选：要提取的主题范围]"
skills: hermes-by-everythings
---

# /hbe-learn

Extract patterns from current session and create reusable skills.

## Pattern Types

1. **Error Resolution** - How specific errors were fixed
2. **User Corrections** - Feedback and preferences
3. **Workarounds** - Temporary solutions that worked
4. **Debugging Techniques** - Effective debugging approaches
5. **Project Specific** - Domain-specific patterns

## Steps

1. **Review Session**
   - Scan conversation history
   - Identify repeated patterns
   - Note successful solutions

2. **Filter Quality**
   Exclude:
   - Simple typos
   - One-time fixes
   - External API issues
   - Trivial changes

3. **Extract Pattern**
   - Name the pattern clearly
   - Describe the problem
   - Document the solution
   - Add examples

4. **Save as Skill**
   - Update or create skill file
   - Add to skill index
   - Document context

## Output

New or updated skill in `skills/` directory
