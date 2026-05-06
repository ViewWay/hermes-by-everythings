---
name: hbe-prd
description: 生成结构化产品需求文档 PRD / Generate structured Product Requirements Document
allowed_tools: ["Read", "Write", "Edit"]
---

# /hbe-prd

Generate a structured PRD from feature description.

## Steps

1. **Ask Clarifying Questions**
   Present 3-5 key questions with options:
   - Scope: MVP vs full feature?
   - Platform: web, mobile, both?
   - Timeline: when needed?
   - Constraints: budget, resources?

2. **Generate PRD Structure**
   - Feature overview
   - User stories with acceptance criteria
   - Technical requirements
   - Success metrics
   - Dependencies and risks

3. **Save to File**
   Create `prd.json` in project root with structured data.

4. **Create Progress Tracker**
   Create empty `progress.md` for tracking implementation.

## Output

- `prd.json` - Structured product requirements
- `progress.md` - Implementation progress tracker
