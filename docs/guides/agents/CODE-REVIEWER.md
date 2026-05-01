# Code-Reviewer Agent 使用教程

> **版本**: 3.2.0  
> **Agent 类型**: 代码审查代理  
> **触发命令**: `/hbe:review`  
> **Token 大小**: ~5.4KB

---

## Agent 简介

**Code-Reviewer** 专注于代码质量审查：

- 🔍 **代码质量**: 检查代码整洁度、可读性
- 🐛 **Bug检测**: 识别潜在bug和边界情况
- 🚀 **性能优化**: 发现性能瓶颈和优化机会
- 📐 **架构检查**: 验证架构决策和设计模式
- 💡 **最佳实践**: 确保遵循编码标准

**何时使用**：
- 代码提交前
- PR创建时
- 重构后验证
- 代码审查过程中

---

## 快速开始

### 基础用法

```
/hbe:review
```

Code-Reviewer会：
1. 扫描最近修改的文件
2. 分析代码质量
3. 生成审查报告

### 指定文件

```
/hbe:review src/services/userService.ts
```

---

## 审查维度

### 1. 代码质量

检查项：
- ✅ 命名规范
- ✅ 代码结构
- ✅ 函数复杂度
- ✅ 注释质量
- ✅ 代码重复

### 2. 潜在Bug

检测：
- 🔴 未处理的错误
- 🔴 空值引用
- 🔴 竞态条件
- 🔴 资源泄漏
- 🔴 边界条件

### 3. 性能问题

发现：
- ⚡ N+1查询
- ⚡ 不必要的循环
- ⚡ 内存泄漏
- ⚡ 低效算法

### 4. 安全性

基础安全检查：
- 🔐 输入验证
- 🔐 输出转义
- 🔐 敏感数据暴露

---

## 使用示例

### 示例 1: 审查单个文件

```
/hbe:review src/api/users.ts
```

输出：
```
✅ 代码质量: 8/10
  - 良好的类型注解
  - ⚠️ 部分函数过长 (>50行)

🐛 潜在Bug: 2个
  - Line 45: 未处理 null 返回值
  - Line 78: 缺少错误边界

⚡ 性能: 良好
  - 无明显性能问题
```

### 示例 2: 审查所有变更

```
/hbe:review
```

自动审查所有未提交的变更。

### 示例 3: 审查PR

```
/hbe:review --pr 123
```

审查GitHub PR #123的变更。

---

## 最佳实践

### ✅ 推荐做法

1. **提交前审查**
   ```
   git add .
   /hbe:review
   git commit -m "feat: 添加用户功能"
   ```

2. **PR前审查**
   ```
   # 创建PR前
   /hbe:review
   
   # 修复问题后
   git push
   ```

3. **定期审查**
   ```
   # 每天结束前
   /hbe:review
   ```

### ❌ 避免做法

1. **跳过审查**
   ```
   不要：直接提交代码
   应该：先 /hbe:review
   ```

2. **忽略警告**
   ```
   不要：看到警告也不修复
   应该：逐一处理审查意见
   ```

3. **过度依赖**
   ```
   不要：完全依赖自动化审查
   应该：结合人工代码审查
   ```

---

## 与其他Agent配合

### 在Orchestrator中

```
# Orchestrator 自动调用
/hbe:orchestrate 开发用户API

# 流程：
# Architect → Code-Reviewer → [如有问题] → 修正循环
```

### 与Security-Reviewer

```
# 1. 代码质量审查
/hbe:review

# 2. 安全审查
/hbe:security
```

### 与TDD-Guide

```
# 1. 审查代码
/hbe:review

# 2. 审查测试
/hbe:tdd --verify
```

---

## 输出说明

### 审查报告

标准格式：
```
# 代码审查报告

## 总体评分: 8.5/10

## 代码质量
✅ 命名规范: 9/10
✅ 代码结构: 8/10
⚠️ 函数复杂度: 6/10

## 潜在Bug
🔴 Line 45: 未处理 null
🔴 Line 78: 缺少错误边界

## 性能
⚡ 无明显问题

## 建议
1. 提取过长函数
2. 添加错误处理
3. 补充单元测试
```

---

## 故障排除

### 问题 1: 审查过慢

**解决方案**：
- 指定具体文件而非全部
- 使用 `--quick` 快速模式
- 分批审查大文件

### 问题 2: 误报

**解决方案**：
- 查看上下文再决定
- 使用 `--ignore-rule` 跳过特定规则
- 报告误报模式

### 问题 3: 建议不适用

**解决方案**：
- 考虑项目特定约束
- 调整审查规则
- 标记为"已阅但不适用的建议"

---

## 高级技巧

### 1. 自定义规则

```json
// .hbe-review-rules.json
{
  "rules": {
    "maxFunctionLength": 30,
    "requireComments": true,
    "forbidConsole": true
  }
}
```

### 2. 批量审查

```bash
# 审查特定目录
/hbe:review src/services/

# 审查特定类型
/hbe:review "**/*.test.ts"
```

### 3. CI集成

```yaml
# .github/workflows/review.yml
- name: Code Review
  run: |
    npm install
    npx claude /hbe:review
```

---

## 相关资源

- **Agent定义**: `skills/agents/code-reviewer.md`
- **Security-Reviewer**: `agents/SECURITY-REVIEWER.md`
- **TDD-Guide**: `agents/TDD-GUIDE.md`

---

**Code-Reviewer 教程版本**: 3.2.0  
**最后更新**: 2026-05-02
