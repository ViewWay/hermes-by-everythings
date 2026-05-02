# TypeScript 编码风格

## 命名约定

| 元素 | 约定 | 示例 |
|------|------|------|
| 接口 | PascalCase + 可选 I 前缀 | IUser, UserService |
| 类型 | PascalCase | User, ErrorResponse |
| 类 | PascalCase | UserService, HttpClient |
| 接口/方法 | camelCase | getUser, handleSubmit |
| 常量 | SCREAMING_SNAKE_CASE | MAX_RETRIES, API_BASE_URL |
| 枚举 | PascalCase | UserRole, HttpStatus |
| 私有成员 | camelCase + _ 前缀 | _privateField |

## 类型定义

**优先使用 interface**:
```typescript
// ✅ 好
interface User {
  id: string;
  name: string;
  email: string;
}

// ❌ 避免使用 type（除非需要联合类型）
type User = {
  id: string;
  name: string;
}
```

**避免 any**:
```typescript
// ❌ 避免
function process(data: any) { }

// ✅ 使用 unknown 或泛型
function process<T>(data: T): T { }
```

**使用字面量类型**:
```typescript
// ✅ 好
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// ❌ 避免
type HttpMethod = string;
```

## 异步处理

**优先 async/await**:
```typescript
// ✅ 好
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ❌ 避免回调
function fetchUser(id: string, callback: (user: User) => void) { }
```

**错误处理**:
```typescript
// ✅ 好
try {
  const user = await fetchUser(id);
  return user;
} catch (error) {
  logger.error('Failed to fetch user', { id, error });
  throw new UserFetchError('Cannot fetch user', { cause: error });
}
```

## 导入顺序

1. Node.js 内置
2. 外部依赖（按字母）
3. 内部模块（按路径层级）
4. 类型导入

```typescript
// ✅ 好
import { promisify } from 'node:util';
import express from 'express';
import { UserService } from './services/user.service';
import type { User } from './types/user.types';
```

## 文件组织

- 每个文件一个导出（主要）
- 文件名与导出名称匹配
- 使用 index.ts 简化导入
- barrel exports: `export * from './file'`

## 注释

```typescript
/**
 * 计算折扣价格
 * 
 * @param price - 原价
 * @param discount - 折扣率 (0-1)
 * @returns 折扣后价格
 * @throws {Error} 如果折扣率无效
 */
function calculateDiscount(price: number, discount: number): number {
  if (discount < 0 || discount > 1) {
    throw new Error('Invalid discount rate');
  }
  return price * (1 - discount);
}
```
