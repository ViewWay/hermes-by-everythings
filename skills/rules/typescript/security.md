# TypeScript 安全

## 类型安全

**避免 any**:
```typescript
// ❌ 危险
function parse(input: any): any {
  return JSON.parse(input);
}

// ✅ 安全
function parse<T>(input: string): T {
  return JSON.parse(input);
}
```

**验证外部数据**:
```typescript
// ✅ 使用 Zod 或类似库
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
});

function validateUser(data: unknown): User {
  return UserSchema.parse(data);
}
```

## 防止 XSS

```typescript
// ❌ 危险 - 直接渲染 HTML
div.innerHTML = userInput;

// ✅ 安全 - 使用 DOMPurify
import DOMPurify from 'dompurify';
div.innerHTML = DOMPurify.sanitize(userInput);

// ✅ 更安全 - 使用 textContent
div.textContent = userInput;
```

## 敏感信息

```typescript
// ❌ 不要记录敏感信息
console.log('User password:', user.password);

// ✅ 记录错误时排除敏感字段
logger.error('Login failed', {
  userId: user.id,
  error: error.message,
  // 不记录 password
});
```

## API 密钥

```typescript
// ❌ 硬编码密钥
const API_KEY = 'sk-1234567890';

// ✅ 环境变量
const API_KEY = process.env.API_KEY!;
if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
```

## 类型断言

```typescript
// ❌ 避免类型断言
const user = data as User;

// ✅ 使用类型守卫
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  );
}
```
