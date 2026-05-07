# Security-Reviewer Agent 使用教程

> **版本**: 3.2.0  
> **Agent 类型**: 安全审查代理  
> **触发命令**: `/hbe-security`  
> **Token 大小**: ~5.4KB

---

## Agent 简介

**Security-Reviewer** 专注安全漏洞检测：

- 🔐 **注入攻击**: SQL注入、XSS、命令注入
- 🔑 **认证授权**: JWT、OAuth、权限检查
- 🛡️ **数据保护**: 加密、敏感数据、日志脱敏
- 🌐 **API安全**: 速率限制、CORS、CSRF
- 📋 **合规性**: OWASP Top 10、安全标准

**何时使用**：
- 代码提交前
- PR审查时
- 处理用户数据时
- 集成第三方服务时

---

## 快速开始

### 基础用法

```
/hbe-security
```

Security-Reviewer会：
1. 扫描代码变更
2. 检查安全漏洞
3. 生成安全报告

### 指定文件

```
/hbe-security src/api/users.ts
```

---

## 安全检查项

### 1. 注入攻击

检测：
- 🔴 SQL注入
- 🔴 XSS攻击
- 🔴 命令注入
- 🔴 路径遍历

### 2. 认证授权

检查：
- 🔑 弱密码策略
- 🔑 会话管理
- 🔑 权限提升
- 🔑 Token安全

### 3. 数据保护

验证：
- 🛡️ 敏感数据加密
- 🛡️ 日志脱敏
- 🛡️ TLS/SSL
- 🛡️ 数据库加密

### 4. API安全

检查：
- 🌐 输入验证
- 🌐 输出编码
- 🌐 速率限制
- 🌐 CORS配置

---

## 使用示例

### 示例 1: 审查登录功能

```
/hbe-security 审查用户登录代码
```

输出：
```
🔴 高危: SQL注入风险
  - src/api/login.ts:45
  - 用户输入直接拼接到SQL查询

🟡 中危: 弱密码策略
  - src/auth/password.ts:12
  - 最小长度仅6位

✅ 良好: 使用HTTPS
  - 所有API通信加密
```

### 示例 2: 审查PR

```
/hbe-security --pr 45
```

### 示例 3: 全面扫描

```
/hbe-security --full
```

---

## 最佳实践

### ✅ 推荐做法

1. **提交前审查**
   ```
   git add .
   /hbe-security
   git commit -m "feat: 添加用户功能"
   ```

2. **处理用户数据**
   ```
   /hbe-security 审查用户注册流程
   确保密码正确哈希
   ```

3. **第三方集成**
   ```
   /hbe-security 审查Stripe集成
   检查API密钥保护
   ```

### ❌ 避免做法

1. **信任用户输入**
   ```
   不要：直接使用用户输入
   应该：验证和消毒所有输入
   ```

2. **硬编码密钥**
   ```
   不要：API_KEY = "xxx"
   应该：使用环境变量
   ```

3. **忽略警告**
   ```
   不要：安全警告也提交
   应该：先修复安全问题
   ```

---

## OWASP Top 10检查

### 1. 注入

```typescript
// ❌ 错误
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ 正确
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

### 2. 认证失效

```typescript
// ❌ 错误
if (password === userInput.password) { ... }

// ✅ 正确
if (bcrypt.compare(password, user.hash)) { ... }
```

### 3. XSS

```typescript
// ❌ 错误
div.innerHTML = userInput;

// ✅ 正确
div.textContent = userInput;
// 或使用DOMPurify.sanitize(userInput)
```

### 4. 敏感数据暴露

```typescript
// ❌ 错误
console.log('User:', user);

// ✅ 正确
console.log('User:', { id: user.id, name: user.name });
```

---

## 与其他Agent配合

### Security-Reviewer + Code-Reviewer

```
# 1. 代码质量
/hbe-review

# 2. 安全审查
/hbe-security
```

### 在Orchestrator中

```
# Orchestrator自动包含安全审查
/hbe-orchestrate 开发支付功能

# 流程：
# Architect → Code-Reviewer → Security-Reviewer → TDD-Guide
```

---

## 输出说明

### 安全报告

```
# 安全审查报告

## 严重性统计
🔴 高危: 2个
🟡 中危: 3个
🟢 低危: 5个

## 详细问题
### 高危: SQL注入
- 文件: src/api/users.ts
- 行号: 45
- 修复: 使用参数化查询

### 中危: 弱密码策略
- 文件: src/auth/password.ts
- 行号: 12
- 修复: 提高最小长度到8位

## 合规性
✅ OWASP Top 10: 8/10
✅ 数据保护: 通过
```

---

## 故障排除

### 问题 1: 误报

**解决方案**：
- 查看代码上下文
- 添加安全注释
- 使用 `--ignore-rule`

### 问题 2: 漏报

**解决方案**：
- 更新安全规则
- 报告新模式
- 结合人工审查

### 问题 3: 修复建议不适用

**解决方案**：
- 考虑项目约束
- 查找替代方案
- 咨询安全专家

---

## 相关资源

- **Agent定义**: `skills/agents/security-reviewer.md`
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **安全最佳实践**: `skills/rules/security.md`

---

**Security-Reviewer 教程版本**: 3.2.0  
**最后更新**: 2026-05-02
