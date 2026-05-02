---
name: hbe-security
description: Security vulnerability scanning (OWASP Top 10)
allowed_tools: ["Read", "Bash", "Grep"]
---

# /hbe-security

Security review focusing on OWASP Top 10 vulnerabilities.

## Goal
Identify security vulnerabilities before they reach production.

## Checks
- SQL injection
- XSS vulnerabilities
- Hardcoded secrets
- Authentication/authorization gaps
- CSRF protection
- Input validation
- Dependency vulnerabilities

## Output
Vulnerability report with severity levels and fix recommendations.
