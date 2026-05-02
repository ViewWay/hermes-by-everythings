#!/bin/bash

# HBE Commands Validation Script

echo "================================"
echo "HBE Commands Validation"
echo "================================"
echo ""

errors=0

# Check each command file
for cmd in hbe:*.md; do
  name=$(basename "$cmd" .md)
  
  # Check for required fields
  if ! grep -q "^name:" "$cmd"; then
    echo "❌ $cmd: Missing 'name' field"
    ((errors++))
  fi
  
  if ! grep -q "^description:" "$cmd"; then
    echo "❌ $cmd: Missing 'description' field"
    ((errors++))
  fi
  
  if ! grep -q "^allowed_tools:" "$cmd"; then
    echo "⚠️  $cmd: Missing 'allowed_tools' field (optional but recommended)"
  fi
  
  # Check for non-standard fields
  if grep -q "^trigger:" "$cmd"; then
    echo "⚠️  $cmd: Has 'trigger' field (not standard for .claude/commands/)"
  fi
done

echo ""
echo "================================"
if [ $errors -eq 0 ]; then
  echo "✅ All commands validated successfully"
else
  echo "❌ Found $errors validation errors"
fi
echo "================================"
echo ""

# Count commands by category
echo "Command Summary:"
echo "  Planning & Design: $(ls -1 hbe:plan.md hbe:architect.md hbe:prd.md 2>/dev/null | wc -l | tr -d ' ')"
echo "  Development:       $(ls -1 hbe:tdd.md hbe:e2e.md hbe:verify.md 2>/dev/null | wc -l | tr -d ' ')"
echo "  Quality:           $(ls -1 hbe:review.md hbe:security.md hbe:refactor.md 2>/dev/null | wc -l | tr -d ' ')"
echo "  Maintenance:       $(ls -1 hbe:build-fix.md hbe:docs.md 2>/dev/null | wc -l | tr -d ' ')"
echo "  Automation:        $(ls -1 hbe:orchestrate.md hbe:ralph.md 2>/dev/null | wc -l | tr -d ' ')"
echo "  Learning:          $(ls -1 hbe:checkpoint.md hbe:learn.md hbe:eval.md 2>/dev/null | wc -l | tr -d ' ')"
echo ""
echo "Total: $(ls -1 hbe:*.md 2>/dev/null | wc -l | tr -d ' ') commands"
