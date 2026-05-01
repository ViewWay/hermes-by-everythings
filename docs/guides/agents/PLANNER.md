# Planner Agent 使用教程

> **版本**: 3.2.0  
> **Agent 类型**: 规划代理  
> **触发命令**: `/hbe:plan`  
> **Token 大小**: ~4.4KB

---

## 目录

1. [Agent 简介](#agent-简介)
2. [快速开始](#快速开始)
3. [核心功能](#核心功能)
4. [使用示例](#使用示例)
5. [最佳实践](#最佳实践)
6. [故障排除](#故障排除)

---

## Agent 简介

**Planner** 是HBE的核心规划Agent，负责：

- 📋 **需求分析**: 理解用户需求，识别关键功能点
- 🔍 **代码库探索**: 分析现有代码结构，发现相关文件
- 📝 **计划制定**: 创建详细的、可执行的开发计划
- 🎯 **任务分解**: 将复杂需求分解为小步骤
- ⚡ **上下文优化**: 只加载必要的文件，节省token

**何时使用**：
- 开始新功能开发前
- 需要理解大型代码库时
- 重构前需要规划时
- 团队协作需要共享计划时

---

## 快速开始

### 基础用法

```
/hbe:plan 实现用户登录功能
```

Planner会：
1. 分析需求
2. 探索代码库
3. 制定计划
4. 输出 `dev-plan.md`

### 查看输出

```bash
cat dev-plan.md
```

---

## 核心功能

### 1. 需求分析

Planner会自动：
- 识别功能点
- 标记依赖项
- 评估复杂度
- 提示潜在风险

### 2. 代码库探索

自动查找：
- 相关文件
- 类似功能
- 配置文件
- 测试文件

### 3. 计划生成

生成包含：
- 功能概述
- 文件清单
- 实施步骤
- 测试策略
- 风险评估

---

## 使用示例

### 示例 1: REST API 端点

```
/hbe:plan 添加用户管理 REST API
```

输出：
```markdown
# 开发计划：用户管理 REST API

## 功能概述
- POST /api/users - 创建用户
- GET /api/users/:id - 获取用户
- PUT /api/users/:id - 更新用户
- DELETE /api/users/:id - 删除用户

## 文件清单
- src/api/users.ts (新建)
- src/services/userService.ts (新建)
- src/models/user.ts (新建)
- tests/users.test.ts (新建)

## 实施步骤
1. 定义 User 模型
2. 创建 UserService
3. 实现 API 端点
4. 添加验证和错误处理
5. 编写测试
```

### 示例 2: 前端组件

```
/hbe:plan 创建用户表单组件
```

### 示例 3: 数据库迁移

```
/hbe:plan 添加用户表到数据库
```

---

## 最佳实践

### ✅ 推荐做法

1. **明确需求**
   ```
   /hbe:plan 实现 JWT 认证，包含刷新令牌机制
   ```

2. **提供上下文**
   ```
   /hbe:plan 在现有的 auth 系统基础上添加 OAuth2 支持
   ```

3. **指定约束**
   ```
   /hbe:plan 重构用户服务，保持 API 兼容性
   ```

### ❌ 避免做法

1. **过于模糊**
   ```
   /hbe:plan 添加一些功能
   ```

2. **一次性规划太多**
   ```
   /hbe:plan 重构整个应用
   ```

3. **跳过规划直接编码**
   ```
   不要：直接写代码
   应该：先用 /hbe:plan 规划
   ```

---

## 与其他Agent配合

### Planner → Architect

```
# 1. 先规划
/hbe:plan 实现用户认证

# 2. 再实现
/hbe:architect 按照 dev-plan.md 实现用户认证
```

### Planner → Orchestrator

```
# 1. 创建 PRD
/hbe:prd 完整的用户管理系统

# 2. Orchestrator 会自动调用 Planner
/hbe:orchestrate 根据 prd.json 开发
```

---

## 输出文件说明

### dev-plan.md

标准结构：
```markdown
# 开发计划：[功能名称]

## 功能概述
[简要描述]

## 文件清单
- [文件1]
- [文件2]

## 实施步骤
1. [步骤1]
2. [步骤2]

## 测试策略
- [测试计划]

## 风险评估
- [潜在风险]
```

---

## 故障排除

### 问题 1: Plan 太宽泛

**症状**: 计划不具体，难以执行

**解决方案**:
```
/hbe:plan 实现用户登录
       使用 email + password
       支持 JWT 认证
       包含密码重置功能
```

### 问题 2: 遗漏依赖

**症状**: 计划中缺少关键步骤

**解决方案**:
- 明确指定依赖项
- 使用 `/hbe:plan` 时提供完整上下文
- 查看输出后手动补充

### 问题 3: Token 消耗过大

**症状**: Planner 运行缓慢或超时

**解决方案**:
- 缩小规划范围
- 专注核心功能
- 分阶段规划

---

## 高级技巧

### 1. 渐进式规划

```
# 第1阶段：核心功能
/hbe:plan 用户认证（登录/注册）

# 第2阶段：扩展功能
/hbe:plan 添加密码重置

# 第3阶段：高级功能
/hbe:plan 添加双因素认证
```

### 2. 规划验证

```
# 1. 规划
/hbe:plan 实现缓存层

# 2. 验证计划可行性
cat dev-plan.md

# 3. 调整计划（如需要）
# 手动编辑 dev-plan.md
```

### 3. 团队协作

```
# 1. 生成计划
/hbe:plan 添加支付功能

# 2. 分享计划
git add dev-plan.md
git commit -m "plan: 支付功能规划"
git push

# 3. 团队Review
# 在PR中讨论计划
```

---

## 相关资源

- **Agent定义**: `skills/agents/planner.md`
- **Orchestrator教程**: `../ORCHESTRATOR-TUTORIAL.md`
- **Architect教程**: `agents/ARCHITECT.md`

---

**Planner 教程版本**: 3.2.0  
**最后更新**: 2026-05-02
