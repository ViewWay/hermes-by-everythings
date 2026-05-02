---
name: index-system-migration-errors
description: Three-layer index system migration and duplicate file cleanup
type: feedback
---

## Bug: Index System Migration Errors

### Issue
During the v3.1.0 migration, the index system had incomplete structure and duplicate files:
- Inconsistent references between SKILLS.md, skills/INDEX.md, and skills/active/README.md
- Duplicate "references/agents copy/" directory with 10 agent files
- Broken references in multiple documentation files

### Root Cause
- Incomplete migration from old reference structure
- Manual copy operations created duplicate directories
- Missing updates to cross-references after file moves

### Solution
1. **Completed three-layer index system**:
   - SKILLS.md: Complete routing table (all 10 agents, 8 rules, 5 templates)
   - skills/INDEX.md: Internal detailed index
   - skills/active/README.md: Recommended skills only

2. **Fixed cross-references** in 7 files:
   - docs/research-findings.md
   - docs/research/repo-analysis-report.md
   - docs/adr/0003-learning-loop.md
   - docs/architecture/platform-adapter.md
   - docs/architecture/architecture-enhancement-report.md
   - SKILL-INDEX.md
   - CLAUDE.md

3. **Removed duplicate directory**: "references/agents copy/" (2725 lines deleted)

### Impact
- Reduced repository size by 2725 lines of duplicate code
- Fixed broken links throughout documentation
- Established clear three-layer index hierarchy

### Why it happened
Migration from v2.x to v3.0.x involved restructuring the skills/agents system. Manual file operations left duplicate directories and incomplete cross-reference updates.

### How to prevent
- Always use automated migration scripts instead of manual copies
- Verify cross-references after any file structure changes
- Run duplicate detection tools after migrations
