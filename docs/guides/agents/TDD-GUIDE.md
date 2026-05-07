# TDD-Guide Agent 使用教程

> **版本**: 3.2.0  
> **Agent 类型**: TDD指导代理  
> **触发命令**: `/hbe-tdd`  
> **Token 大小**: ~8.5KB

---

## Agent 简介

**TDD-Guide** 引导测试驱动开发：

- 🔴 **RED**: 先写失败的测试
- 🟢 **GREEN**: 实现功能通过测试
- 🔄 **REFACTOR**: 重构优化代码
- 📊 **覆盖率**: 确保80%+测试覆盖
- 🧪 **测试类型**: 单元测试、集成测试、E2E测试

**何时使用**：
- 开发新功能时
- 重构代码时
- 修复Bug时
- 提高代码质量时

---

## 快速开始

### 基础用法

```
/hbe-tdd 实现用户认证功能
```

TDD-Guide会引导：
1. **RED**: 写测试（失败）
2. **GREEN**: 写代码（通过）
3. **REFACTOR**: 重构（优化）

### 查看进度

```bash
# 查看测试文件
cat tests/userService.test.ts

# 运行测试
npm test
```

---

## TDD工作流

### 阶段 1: RED（写测试）

```
/hbe-tdd 实现用户登录
阶段：RED
```

TDD-Guide会：
- 创建测试文件
- 写测试用例
- 确保测试失败

### 阶段 2: GREEN（实现）

```
/hbe-tdd 实现用户登录
阶段：GREEN
```

TDD-Guide会：
- 实现功能
- 通过测试
- 不添加额外代码

### 阶段 3: REFACTOR（重构）

```
/hbe-tdd 实现用户登录
阶段：REFACTOR
```

TDD-Guide会：
- 优化代码
- 保持测试通过
- 提高可读性

---

## 使用示例

### 示例 1: TypeScript函数

```
/hbe-tdd 实现 add(a, b) 函数
```

**RED阶段**：
```typescript
describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

**GREEN阶段**：
```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

### 示例 2: React组件

```
/hbe-tdd 创建 UserProfile 组件
```

### 示例 3: API端点

```
/hbe-tdd 实现 POST /api/users
```

---

## 最佳实践

### ✅ 推荐做法

1. **严格遵守红-绿-重构**
   ```
   不要：跳过RED直接写代码
   应该：先写测试，看它失败
   ```

2. **小步快跑**
   ```
   /hbe-tdd 实现用户验证
   每个测试一个功能点
   ```

3. **测试覆盖率 > 80%**
   ```
   /hbe-tdd --verify
   检查覆盖率
   ```

### ❌ 避免做法

1. **先写代码后写测试**
   ```
   不要：实现后再补测试
   应该：TDD红-绿-重构
   ```

2. **测试实现细节**
   ```
   不要：测试私有方法
   应该：测试公开接口
   ```

3. **忽略失败的测试**
   ```
   不要：测试失败也继续
   应该：先修复测试
   ```

---

## 与其他Agent配合

### TDD-Guide + Architect

```
# 1. TDD模式开发
/hbe-tdd 实现用户认证

# Architect会在TDD-Guide引导下实现
```

### TDD-Guide + Code-Reviewer

```
# 1. 开发
/hbe-tdd 实现功能

# 2. 审查
/hbe-review

# 3. 验证测试
/hbe-tdd --verify
```

### 在Orchestrator中

```
# Orchestrator集成TDD
/hbe-orchestrate 开发用户API

# 自动包含TDD验证阶段
```

---

## 测试类型

### 1. 单元测试

测试单个函数/类：
```typescript
describe('UserService', () => {
  it('should create user', () => {
    // ...
  });
});
```

### 2. 集成测试

测试模块交互：
```typescript
describe('API Integration', () => {
  it('should create user via API', () => {
    // ...
  });
});
```

### 3. E2E测试

测试完整流程：
```typescript
describe('User Flow', () => {
  it('should register and login', () => {
    // ...
  });
});
```

---

## 故障排除

### 问题 1: 测试一直失败

**解决方案**：
1. 检查测试逻辑是否正确
2. 验证Mock配置
3. 确认依赖项

### 问题 2: 覆盖率不足

**解决方案**：
```
/hbe-tdd --coverage
查看未覆盖的代码
添加测试用例
```

### 问题 3: 测试太慢

**解决方案**：
- 使用Mock避免真实调用
- 并行运行测试
- 只运行相关测试

---

## 高级技巧

### 1. 测试驱动重构

```
# 1. 为现有代码添加测试
/hbe-tdd 为 legacy.ts 添加测试

# 2. 确保测试通过
npm test

# 3. 安全重构
/hbe-refactor legacy.ts
```

### 2. 行为驱动开发(BDD)

```
/hbe-tdd 用户登录功能
风格：BDD
Given: 用户已注册
When: 用户输入正确密码
Then: 登录成功
```

### 3. 测试优先级

```
P0: 核心业务逻辑
P1: API端点
P2: 边界情况
P3: 错误处理
```

---

## 相关资源

- **Agent定义**: `skills/agents/tdd-guide.md`
- **Architect教程**: `agents/ARCHITECT.md`
- **Code-Reviewer教程**: `agents/CODE-REVIEWER.md`

---

**TDD-Guide 教程版本**: 3.2.0  
**最后更新**: 2026-05-02
