# TypeScript 设计模式

## 依赖注入

```typescript
// ✅ 好 - 依赖注入
class UserService {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService
  ) {}
}

// ❌ 避免 - 硬编码依赖
class UserService {
  private userRepo = new UserRepository();
  private emailService = new EmailService();
}
```

## 工厂模式

```typescript
interface UserFactory {
  createUser(data: UserData): User;
}

class AdminUserFactory implements UserFactory {
  createUser(data: UserData): User {
    return new AdminUser(data);
  }
}
```

## Repository 模式

```typescript
interface UserRepository {
  findById(id: string): Promise<User>;
  findAll(): Promise<User[]>;
  create(data: UserData): Promise<User>;
  update(id: string, data: Partial<UserData>): Promise<User>;
  delete(id: string): Promise<void>;
}
```

## 策略模式

```typescript
interface ValidationStrategy {
  validate(value: string): boolean;
}

class EmailValidation implements ValidationStrategy {
  validate(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
}
```

## 观察者模式

```typescript
class EventEmitter<T extends Record<string, any>> {
  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void;
  emit<K extends keyof T>(event: K, data: T[K]): void;
}
```
