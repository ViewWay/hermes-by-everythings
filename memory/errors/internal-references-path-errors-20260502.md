---
name: internal-references-path-errors
description: Skills directory internal references using outdated paths
type: feedback
---

## Bug: Internal References Using Outdated Paths

### Issue
Template files and README in skills directory referenced old paths:
- skills/active/README.md used outdated reference paths
- skills/templates/agent-template.md used old path structure
- skills/templates/command-template.md used incorrect relative paths

### Root Cause
After migrating agents from "references/agents/" to "agents/", the template files still referenced:
- Old path: `../references/agents/`
- New path: `../agents/`

### Solution
1. Updated skills/active/README.md references (18 changes)
2. Updated skills/templates/agent-template.md (4 changes)
3. Updated skills/templates/command-template.md (2 changes)
4. Globally replaced `../references/agents/` with `../agents/`

### Impact
- Fixed 2697 insertions across template files
- Ensured new agents created from templates use correct paths
- Prevented future broken references in generated files

### Why it happened
Template files were not updated during the agent directory migration. The templates are used to generate new agents, so any incorrect paths in templates would propagate to all future agents.

### How to prevent
- Always update template files when restructuring directories
- Add validation step to migration scripts to check for hardcoded paths
- Use path variables/constants instead of hardcoded paths where possible
- Test template generation after any structural changes
