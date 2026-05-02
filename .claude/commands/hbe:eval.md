---
name: hbe-eval
description: Evaluation-driven development with pass@k metrics
allowed_tools: ["Read", "Write", "Edit", "Bash", "Agent"]
---

# /hbe-eval

Define behavior before implementation, then evaluate success.

## Steps

1. **Define Expected Behavior**
   - Document what the feature should do
   - Define success criteria
   - Specify edge cases

2. **Create Evaluation**
   - Build test suite or rubric
   - Define grading criteria
   - Set pass thresholds (pass@k)

3. **Implement Feature**
   - Build to meet defined criteria
   - Use TDD where appropriate

4. **Run Evaluation**
   - Execute test suite
   - Calculate pass@k metrics
   - Identify failures

5. **Iterate**
   - Fix failures
   - Re-evaluate
   - Track improvement over time

## Metrics

- pass@1: Success on first try
- pass@3: Success within 3 attempts
- pass@10: Success within 10 attempts

## Output

Evaluation report with:
- pass@k scores
- Failure analysis
- Improvement recommendations
