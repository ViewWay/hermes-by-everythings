---
name: hbe-security
description: 安全审查 - 检测 OWASP Top 10 漏洞
trigger: /hbe-security
keywords:
  - security
  - 安全审查
  - vulnerability scan
argument-hint: "[安全审查目标]"
skills: hermes-by-everythings
---

# /hbe-security — 安全审查

检测和修复安全漏洞。

## 执行流程

1. **环境感知**
   ```bash
   git diff --name-only
   # 识别敏感文件（密钥、认证、支付）
   ```

2. **加载 Security Reviewer Agent**
   ```
   读取: skills/agents/security-reviewer.md
   ```

3. **安全检查**
   - **注入攻击**: SQL、NoSQL、OS 命令注入
   - **XSS**: 跨站脚本攻击
   - **CSRF**: 跨站请求伪造
   - **SSRF**: 服务器端请求伪造
   - **密钥泄露**: 硬编码密钥、Token
   - **认证授权**: 弱密码、会话管理
   - **敏感数据**: 加密、传输安全

4. **输出报告**
   - 严重程度分级（Critical/High/Medium/Low）
   - 修复建议和代码示例
   - 验证方法

5. **生成 Handoff**
   保存到 `.handoff-security.md`

---
