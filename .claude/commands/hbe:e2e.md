---
name: hbe-e2e
description: End-to-end testing with Playwright for critical user flows
allowed_tools: ["Read", "Write", "Edit", "Bash", "Agent"]
---

# /hbe-e2e

Generate and run E2E tests using Playwright for critical user journeys.

## Goal

Ensure critical user flows work end-to-end with real browser automation.

## Steps

1. **Identify Critical Flows**
   - List main user journeys (login, checkout, profile update, etc.)
   - Prioritize by business impact

2. **Generate Playwright Tests**
   - Create test files in `tests/e2e/`
   - Use page object pattern for maintainability
   - Include assertions for key states

3. **Run Tests**
   - Run with headed mode for debugging
   - Run with headless mode for CI
   - Generate screenshots/videos on failure

4. **Quarantine Flaky Tests**
   - Identify and mark flaky tests
   - Fix or retry with proper waits

## Output

- E2E test suite
- Test reports with screenshots
- Flaky test quarantine list
