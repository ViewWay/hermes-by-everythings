# TypeScript 测试

## 框架

- **单元测试**: Jest 或 Vitest
- **E2E测试**: Playwright
- **类型检查**: tsc --noEmit

## 测试结构

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      // Act
      const user = await userService.create(userData);

      // Assert
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.name).toBe(userData.name);
    });

    it('should throw error for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      await expect(
        userService.create(userData)
      ).rejects.toThrow('Invalid email');
    });
  });
});
```

## Mock

```typescript
import { mock, MockProxy } from 'jest-mock-extended';

describe('UserService', () => {
  let userRepo: MockProxy<UserRepository>;
  let userService: UserService;

  beforeEach(() => {
    userRepo = mock<UserRepository>();
    userService = new UserService(userRepo);
  });

  it('should call repository', async () => {
    userRepo.findById.mockResolvedValue(mockUser);
    
    await userService.find('123');

    expect(userRepo.findById).toHaveBeenCalledWith('123');
  });
});
```

## 覆盖率要求

- 最低覆盖率: **80%**
- 关键路径: **100%**
- 分支覆盖率: **>75%**

## TDD 流程

1. RED - 写失败测试
2. GREEN - 最小实现
3. REFACTOR - 重构

```bash
# 观察模式
npm test -- --watch

# 覆盖率报告
npm test -- --coverage
```
