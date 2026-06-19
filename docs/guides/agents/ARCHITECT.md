# Architect Agent 使用教程

> **版本**: 3.3.1  
> **Agent 类型**: 实现代理  
> **触发命令**: `/hbe-architect`  
> **Token 大小**: ~9.3KB

---

## Agent 简介

**Architect** 是HBE的核心实现Agent，负责：

- 💻 **代码生成**: 根据计划生成高质量代码
- 🏗️ **架构设计**: 遵循最佳实践和设计模式
- 🔧 **配置管理**: 处理配置文件和环境设置
- 📝 **文档生成**: 自动生成代码注释和文档
- ✅ **代码质量**: 编写可维护、可测试的代码

**何时使用**：
- 实现Planner生成的计划
- 创建新功能或模块
- 重构现有代码
- 生成样板代码

---

## 快速开始

### 基础用法

```
/hbe-architect 实现 dev-plan.md 中的用户认证功能
```

Architect会：
1. 读取 `dev-plan.md`
2. 分析需求和约束
3. 生成代码
4. 创建文件

### 指定计划文件

```
/hbe-architect 根据 docs/plans/api.md 实现 REST API
```

---

## 核心功能

### 1. 代码生成

自动生成：
- 模型/实体
- 服务层
- API端点
- 测试代码
- 配置文件

### 2. 架构模式

支持：
- MVC/MVVM
- Repository模式
- Service层
- 依赖注入
- 中间件模式

### 3. 语言适配

支持：
- TypeScript/JavaScript
- Python
- Rust
- Go
- Java
- Kotlin
- C#
- Ruby
- PHP
- Swift

---

## 使用示例

### 示例 1: TypeScript API

```
/hbe-architect 创建用户管理 API
语言：TypeScript
框架：Express
数据库：PostgreSQL
```

输出：
```
src/
  models/
    User.ts
  services/
    userService.ts
  controllers/
    userController.ts
  routes/
    userRoutes.ts
```

### 示例 2: Python 服务

```
/hbe-architect 实现订单处理服务
语言：Python
框架：FastAPI
```

### 示例 3: Rust 模块

```
/hbe-architect 创建缓存模块
语言：Rust
使用 Redis
```

---

## 最佳实践

### ✅ 推荐做法

1. **提供完整上下文**
   ```
   /hbe-architect 实现 dev-plan.md
   技术栈：TypeScript + Express + PostgreSQL
   认证：JWT
   验证：class-validator
   ```

2. **指定编码标准**
   ```
   /hbe-architect 实现用户服务
   遵循 ESLint 配置
   使用 TypeScript strict 模式
   ```

3. **请求测试**
   ```
   /hbe-architect 实现支付功能
   包含单元测试和集成测试
   测试覆盖率 > 80%
   ```

### ❌ 避免做法

1. **跳过规划**
   ```
   不要：直接 /hbe-architect "写个用户系统"
   应该：先用 /hbe-plan 规划
   ```

2. **不指定技术栈**
   ```
   不要：/hbe-architect "实现API"
   应该：/hbe-architect "用 Express 实现 API"
   ```

3. **忽略代码质量**
   ```
   不要：接受快速但不整洁的代码
   应该：要求代码审查和重构
   ```

---

## 与其他Agent配合

### Architect + Code-Reviewer

```
# 1. 实现
/hbe-architect 实现 dev-plan.md

# 2. 审查
/hbe-review 审查刚才实现的代码
```

### Architect + TDD-Guide

```
# 1. 先写测试
/hbe-tdd 实现用户认证（TDD模式）

# TDD-Guide 会引导 Architect 先写测试
```

### 在Orchestrator中

```
# Orchestrator 自动协调
/hbe-orchestrate 根据 prd.json 开发

# 流程：
# Planner → Architect → Code-Reviewer → Security-Reviewer → TDD-Guide
```

---

## 输出说明

### 文件结构

典型输出：
```
src/
  models/          # 数据模型
  services/        # 业务逻辑
  controllers/     # 请求处理
  routes/          # 路由定义
  middleware/      # 中间件
  utils/           # 工具函数
  config/          # 配置

tests/
  unit/            # 单元测试
  integration/     # 集成测试
```

### 代码特性

生成的代码包含：
- ✅ 类型注解（TypeScript）
- ✅ 错误处理
- ✅ 输入验证
- ✅ 日志记录
- ✅ 代码注释
- ✅ 最佳实践

---

## 故障排除

### 问题 1: 生成的代码不符合预期

**解决方案**：
1. 检查 `dev-plan.md` 是否明确
2. 提供更详细的需求
3. 指定具体的技术栈和库

### 问题 2: 类型错误

**解决方案**：
```
/hbe-architect 实现 API
确保所有函数都有类型注解
使用 TypeScript strict 模式
```

### 问题 3: 测试失败

**解决方案**：
1. 先用 `/hbe-tdd` 确保测试先行
2. 检查Mock配置
3. 验证依赖项

---

## 高级技巧

### 1. 渐进式实现

```
# 第1步：核心功能
/hbe-architect 实现基础用户模型

# 第2步：业务逻辑
/hbe-architect 添加用户服务层

# 第3步：API层
/hbe-architect 创建用户API端点
```

### 2. 模式指定

```
/hbe-architect 实现订单系统
使用 Repository 模式
使用 Service 层
使用依赖注入
```

### 3. 约束条件

```
/hbe-architect 实现缓存层
约束：
- 使用 Redis
- 支持 TTL
- 处理连接失败
- 包含回退机制
```

---

## 相关资源

- **Agent定义**: `skills/agents/architect.md`
- **Planner教程**: `agents/PLANNER.md`
- **Code-Reviewer教程**: `agents/CODE-REVIEWER.md`

---

**Architect 教程版本**: 3.3.1  
**最后更新**: 2026-05-02
