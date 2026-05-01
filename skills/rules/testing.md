# 测试规则

## 测试原则

1. **测试先行（TDD）** — 先写测试，再写实现
2. **覆盖率 >= 80%** — 单元 + 集成 + E2E 总覆盖
3. **快速反馈** — 单元测试 < 1s，集成测试 < 30s
4. **独立性** — 测试间不依赖执行顺序
5. **可重复** — 相同输入，相同结果

## 测试分层

```
         /\
        /  \        E2E（少量，覆盖关键流程）
       /    \       - 5-10 个
      /------\
     /        \     集成测试（适量，覆盖 API/服务）
    /          \    - 50-100 个
   /------------\
  /              \  单元测试（大量，覆盖逻辑）
 /                \ - 500+ 个
/__________________\
```

## 单元测试

### 必须测试
- 所有公开函数/方法
- 边界条件（空值、极值、非法输入）
- 错误路径（异常、超时、失败）
- 状态转换

### 命名
```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data');
    it('should throw error when email is empty');
    it('should hash password before saving');
  });
});
```

### Mock 规则
- 只 mock 外部依赖（API、数据库、文件系统）
- 不 mock 被测模块内部方法
- Mock 应验证调用次数和参数

## 集成测试

- 测试 API 端点完整流程
- 使用测试数据库（内存或 Docker）
- 验证请求/响应格式
- 验证错误码和错误消息

## E2E 测试

- 只覆盖关键用户流程
- 使用 data-testid 选择器
- 每个测试独立数据
- 设置合理超时（30s）

## 测试命令

```bash
# TypeScript
npx vitest run                    # 全部测试
npx vitest run --coverage        # 带覆盖率
npx vitest run -t "UserService"  # 指定模块

# Rust
cargo test --workspace           # 全部测试
cargo test -p crate-name         # 指定 crate
cargo test test_name             # 指定测试

# E2E
npx playwright test
npx playwright test --ui
```
