---
name: hbe-scan
description: 统一静态安全扫描 (SAST/SCA/密钥/复杂度) / Unified static security scanning (SAST/SCA/secrets/complexity)
allowed_tools: ["Read", "Bash", "Grep", "Glob"]
---

# /hbe-scan

Unified offline static security scanner. Performs comprehensive security audit on target directory.
统一离线静态安全扫描。对目标目录执行全面安全审计。

## Usage / 用法

```
/hbe-scan                    # Scan current directory
/hbe-scan src/               # Scan specific directory
/hbe-scan path/to/project    # Scan any project path
```

## Goal / 目标

Execute a complete offline security audit covering:
- **SAST**: Secrets detection, code injection, backdoors
- **SCA**: Network requests, data exfiltration, dependency safety
- **Quality**: Code obfuscation, debug statements, complexity

执行完整的离线安全审计，覆盖：
- **静态分析**: 密钥检测、代码注入、后门
- **成分分析**: 网络请求、数据外传、依赖安全
- **质量分析**: 代码混淆、调试语句、复杂度

## Steps / 步骤

### Phase 0: Scope Discovery / 范围发现

1. Determine target path:
   - If `$ARGUMENTS` is provided and non-empty, use it as the target.
   - Otherwise, scan the current working directory.

2. Enumerate scannable files using Glob:
   ```
   <target>/**/*.{js,jsx,ts,tsx,py,go,rs,sh,bash,yml,yaml,json,toml,md,cfg,conf}
   ```

3. Exclude these directories from results:
   - `.git/`, `node_modules/`, `__pycache__/`, `.venv/`, `venv/`
   - `dist/`, `build/`, `.pytest_cache/`, `.next/`, `.nuxt/`

4. Report file count: "Scanning N files in `<path>`"

### Phase 1: Secrets Detection / 密钥检测

Run each grep pattern below on every scannable file. Collect all matches.

| Rule ID | Name / 名称 | Severity | Grep Command |
|---------|-------------|----------|-------------|
| SEC-001 | OpenAI API Key | CRITICAL | `grep -Pn 'sk-[a-zA-Z0-9]{20,}' <file>` |
| SEC-002 | GitHub PAT | CRITICAL | `grep -Pn 'ghp_[a-zA-Z0-9]{36}' <file>` |
| SEC-003 | AWS Access Key | CRITICAL | `grep -Pn 'AKIA[A-Z0-9]{16}' <file>` |
| SEC-004 | Generic API Key | HIGH | `grep -Pni 'api[_-]?key\s*[=:]\s*['\''"][^'\''"]+['\''"]' <file>` |
| SEC-005 | Private Key Block | CRITICAL | `grep -Pn '-----BEGIN.*(PRIVATE KEY)' <file>` |
| SEC-006 | JWT Secret | HIGH | `grep -Pni '(jwt[_-]?secret|jwks[_-]?uri)\s*[=:]' <file>` |
| SEC-007 | Database URL with Password | HIGH | `grep -Pni '(mysql|postgres|mongodb|redis)://[^\s'\''"]+:[^\s'\''"]+@' <file>` |

**Confidence calculation / 置信度计算**:
- Base confidence: 0.7
- If the matched line starts with `#`, `//`, `*`, `<!--`: subtract 0.2 (likely a comment or example)
- If the matched value contains 20+ consecutive alphanumeric chars: add 0.2 (real credential format)
- Clamp to [0.0, 1.0]

**Skip / 跳过**: Ignore matches inside `test/`, `tests/`, `__tests__/`, `*.test.*`, `*.spec.*`, `*.mock.*` files — mark them as INFO severity instead.

### Phase 2: Injection & Code Safety / 注入与代码安全

Run these patterns on every scannable file:

| Rule ID | Name / 名称 | Severity | Grep Command |
|---------|-------------|----------|-------------|
| INJ-001 | Dynamic Code Execution | WARNING | `grep -Pn '\beval\s*\(' <file>` |
| INJ-002 | Code Injection | CRITICAL | `grep -Pin 'inject.*into.*file\|prepend.*__import__' <file>` |
| INJ-003 | Backdoor Pattern | CRITICAL | `grep -Pn 'bash\s+-i\s+>&\s*/dev/tcp/\|nc\s+-.*-e\s\|netcat.*-e' <file>` |
| CMD-001 | Dangerous Commands | CRITICAL | `grep -Pn '\bsudo\b\|\bsu\s\b\|rm\s+-rf\s+/\|dd\s+.*of=/' <file>` |
| CMD-002 | Shell Injection | HIGH | `grep -Pn 'os\.system\|subprocess.*shell\s*=\s*True\|\bexec\s*\(\|\bpopen\s*\(' <file>` |

**Additional checks / 附加检查**:

SQL Injection detection:
```bash
grep -Pin "SELECT.*\+\s*(?!.*parameterized)(?!.*prepared)(?!.*placeholder)" <file>
grep -Pin "INSERT.*\+\s*(?!.*parameterized)(?!.*prepared)(?!.*placeholder)" <file>
grep -Pin "DELETE.*\+\s*(?!.*parameterized)(?!.*prepared)(?!.*placeholder)" <file>
```

XSS detection:
```bash
grep -Pn 'innerHTML\s*=' <file>
grep -Pn 'dangerouslySetInnerHTML' <file>
grep -Pn 'document\.write\(' <file>
```

**Confidence**: Same as Phase 1. For CMD-002 matches in non-Python/JS files, reduce confidence by 0.1.

### Phase 3: Network & Data Exfiltration / 网络与数据外传

| Rule ID | Name / 名称 | Severity | Grep Command |
|---------|-------------|----------|-------------|
| NET-001 | External Network Request | CRITICAL | `grep -Pn 'curl\s|wget\s|requests\.(post|get|put|delete)\(|fetch\(' <file>` |
| NET-002 | Data Exfiltration | CRITICAL | `grep -Pin 'curl.*-d.*@|wget.*--post-data|nc\s+.*-l' <file>` |

**NET-001 domain whitelist / 域名白名单**:
If the matched line contains any of these domains, downgrade to INFO severity:
- `api.anthropic.com`, `github.com`, `pypi.org`, `npmjs.com`
- `registry.npmjs.org`, `raw.githubusercontent.com`

Check by reading the matched line and looking for these domain strings.

**NET-002 sensitive file check**:
If the `-d`/`--post-data` argument references any of these paths, increase confidence by 0.2:
- `.ssh`, `.env`, `.aws`, `credential`, `secret`, `password`, `id_rsa`

### Phase 4: File Operations & Dependency Safety / 文件操作与依赖安全

| Rule ID | Name / 名称 | Severity | Grep Command |
|---------|-------------|----------|-------------|
| FILE-001 | Sensitive File Access | CRITICAL | `grep -Pin '~?/\.ssh/|~?/\.env|~?/\.aws/|\.pem|id_rsa|credentials\.json|secrets\.' <file>` |
| FILE-002 | Dangerous File Operations | CRITICAL | `grep -Pn 'rm\s+-rf\s+/|chmod\s+777|chmod\s+a\+rwx|dd\s+.*of=/' <file>` |
| DEP-001 | Global Package Install | WARNING | `grep -Pin 'pip\s+install.*--global|npm\s+install.*-g|yarn\s+global' <file>` |
| DEP-002 | Force Override | WARNING | `grep -Pin '\-\-force-reinstall|\-\-ignore-installed' <file>` |

**Lockfile check / 锁文件检查**:
Use Glob to check for lockfile existence:
```
package-lock.json / yarn.lock / pnpm-lock.yaml
requirements.txt / poetry.lock / Pipfile.lock
Cargo.lock
go.sum
```
If a manifest file exists (package.json, pyproject.toml, Cargo.toml, go.mod) but NO lockfile exists, add a WARNING finding:
- Rule: DEP-003
- Description: "No lockfile found. Dependencies may not be reproducible. / 未找到锁文件，依赖可能不可复现。"

### Phase 5: Complexity & Quality Analysis / 复杂度与质量分析

| Rule ID | Name / 名称 | Severity | Check Method |
|---------|-------------|----------|-------------|
| OBF-001 | Base64 Obfuscation | WARNING | `grep -Pn 'base64\.decode\|base64\.b64decode\|exec\s*\(.*decode' <file>` |
| OBF-002 | Hidden Calls | WARNING | `grep -Pn '__import__.*\[.*\]\|getattr\s*\(.*['\''"].*['\''"]\)\s*\(' <file>` |
| OBF-003 | Debugger Statement | HIGH | `grep -Pn '\bdebugger\b' <file>` |

**Additional quality checks / 附加质量检查**:

Long lines (>200 chars):
```bash
awk 'length>200 {print NR": "$0}' <file>
```
If found, add INFO finding: "Line exceeds 200 characters. Consider breaking it up."

TODO/FIXME without issue reference:
```bash
grep -Pin '//\s*(TODO|FIXME):?\s*(?!.*#\d+)(?!.*issue)' <file>
grep -Pin '#\s*(TODO|FIXME):?\s*(?!.*#\d+)(?!.*issue)' <file>
```
If found, add INFO finding: "TODO/FIXME without issue reference found."

Console.log in non-test files:
```bash
grep -Pn 'console\.log\(' <file>
```
Skip files in `test/`, `tests/`, `__tests__/`, `*.test.*`, `*.spec.*`. If found elsewhere, add INFO finding.

### Phase 6: Report Generation / 报告生成

Aggregate all findings from Phases 1-5 and generate the report below.

## Risk Scoring / 风险评分

Determine the overall risk level using these rules:

| Condition / 条件 | Risk Level | Score Range |
|------------------|-----------|-------------|
| 1+ CRITICAL finding / 有1个以上严重发现 | CRITICAL | 8-10 |
| 3+ HIGH findings / 有3个以上高风险发现 | HIGH | 6-7 |
| 1 HIGH or 3+ WARNING / 1个高风险或3个以上警告 | MEDIUM | 4-5 |
| Only WARNING/INFO / 仅有警告和信息 | LOW | 2-3 |
| No findings / 无发现 | SAFE | 0 |

**Recommendation / 建议**:
- CRITICAL: "DO_NOT_USE: 检测到严重安全问题，强烈建议修复后使用"
- HIGH: "NOT_RECOMMENDED: 检测到多个高风险问题，建议谨慎使用"
- MEDIUM: "REVIEW_NEEDED: 检测到风险问题，请人工审查后使用"
- LOW: "CAUTION: 存在轻微风险，建议关注"
- SAFE: "SAFE: 未检测到明显安全问题"

## Output Format / 输出格式

Generate the report in this exact structure:

```markdown
# HBE Security Scan Report / HBE 安全扫描报告

## Scan Metadata / 扫描元数据
- **Target / 目标**: `<path>`
- **Files Scanned / 扫描文件数**: N
- **Scanner / 扫描器**: hbe-scan v1.0
- **Mode / 模式**: Offline / 离线

## Risk Summary / 风险摘要

| Metric / 指标 | Value / 值 |
|---------------|------------|
| Risk Score / 风险分数 | X.X / 10 |
| Risk Level / 风险等级 | SAFE / LOW / MEDIUM / HIGH / CRITICAL |
| Total Findings / 总发现数 | N |
| CRITICAL | N |
| HIGH | N |
| WARNING | N |
| INFO | N |

## Recommendation / 建议
<Insert recommendation text based on risk level>

---

## Phase 1: Secrets Detection / 密钥检测
<Findings table or "No findings / 无发现">

## Phase 2: Injection & Code Safety / 注入与代码安全
<Findings table or "No findings / 无发现">

## Phase 3: Network & Data Exfiltration / 网络与数据外传
<Findings table or "No findings / 无发现">

## Phase 4: File Operations & Dependency Safety / 文件操作与依赖安全
<Findings table or "No findings / 无发现">

## Phase 5: Complexity & Quality Analysis / 复杂度与质量分析
<Findings table or "No findings / 无发现">

---

## Detailed Findings / 详细发现

<For each CRITICAL and HIGH finding, provide:>

### [RULE-ID] Rule Name — SEVERITY
- **File / 文件**: `<path>:<line>`
- **Pattern / 模式**: `<matched content, truncated to 80 chars>`
- **Confidence / 置信度**: X.X (HIGH/MEDIUM/LOW)
- **Description / 描述**: <What was found and why it's a concern>
- **Fix / 修复建议**: <Concrete remediation step>

## Action Summary / 行动摘要
1. [ ] Fix N CRITICAL issues / 修复 N 个严重问题
2. [ ] Review N HIGH issues / 审查 N 个高风险问题
3. [ ] Consider N WARNING items / 考虑 N 个警告项
4. [ ] Optional: address N INFO items / 可选：处理 N 个信息项
```

## Finding Table Format / 发现表格格式

Each phase's findings section uses this table format:

```markdown
| Rule ID | File:Line | Pattern (truncated) | Confidence |
|---------|-----------|-------------------|------------|
| SEC-001 | `src/auth.js:42` | `sk-proj-abc123...` | 0.9 (HIGH) |
```

Limit to 20 rows per phase. If more findings exist, add: "and N more / 以及另外 N 条发现"

## Notes / 注意事项

- This scanner is fully offline. No network requests are made. / 完全离线运行，不发起任何网络请求。
- Detection patterns align with existing HBE hooks (pre-bash-commit-quality.js, config-protection.js, gateguard-fact-force.js).
- False positives are possible in test fixtures, documentation, and example code. / 测试文件、文档和示例代码中可能出现误报。
- For runtime protection, HBE hooks provide additional coverage. / 运行时保护由 HBE hooks 提供。
- This is a static analysis tool — it cannot detect runtime behavior. / 这是静态分析工具，无法检测运行时行为。
- Always review CRITICAL and HIGH findings manually before taking action. / 在采取行动前务必人工审查严重和高风险发现。
