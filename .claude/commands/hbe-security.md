---
name: hbe-security
description: 安全漏洞扫描 (OWASP Top 10) / Security vulnerability scanning
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

## See Also
For comprehensive scanning (SAST/SCA/secrets/complexity), use `/hbe-scan`.
