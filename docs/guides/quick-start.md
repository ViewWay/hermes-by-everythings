# Hermes-by-Everything 快速开始

5 分钟上手 Hermes-by-Everything (HBE)。

---

## 前置要求

- Claude Code CLI 已安装
- Git 已安装
- 基本的命令行知识

---

## 安装

### 方式 1: 手动安装（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/ViewWay/hermes-by-everythings.git

# 2. 创建软链接（开发模式，改动实时生效）
ln -s $(pwd)/hermes-by-everythings ~/.claude/skills/hermes-by-everythings

# 3. 验证安装
ls -la ~/.claude/skills/hermes-by-everythings
```

### 方式 2: 自动安装（Phase 2）

```bash
cd hermes-by-everythings
bash install.sh
```

---

## 验证安装

在 Claude Code 中输入：

```
/hbe:verify --system
```

应该看到：
```
✓ HBE 系统验证通过
✓ 9 个 Agent 可用
✓ 13 个 Skill 可用
✓ 15 个 Command 可用
```

---

## 第一次使用

### 1. 创建一个简单的计划

```
/hbe:plan 实现用户登录功能
```

HBE 将：
1. 分析需求
2. 检查代码库
3. 制定实现计划
4. 输出具体步骤

### 2. 使用 TDD 开发

```
/hbe:tdd 实现用户认证
```

HBE 将：
1. 先写测试（RED）
2. 实现功能通过测试（GREEN）
3. 重构优化（REFACTOR）

### 3. 代码审查

```
/hbe:review
```

HBE 将：
1. 检查代码质量
2. 识别潜在问题
3. 提供改进建议

---

## 常用命令

```bash
# 规划功能
/hbe:plan [功能描述]

# TDD 开发
/hbe:tdd [功能描述]

# 代码审查
/hbe:review

# 安全审查
/hbe:security

# 五阶段验证
/hbe:verify

# Ralph 自主循环
/hbe:ralph
```

---

## 下一步

1. 阅读 [完整用户指南](user-guide.md)
2. 了解 [Agent 列表](../skills/agents/)
3. 探索 [Skill 列表](../skills/)
4. 查看 [示例](../examples/)

---

## 需要帮助？

- 查看 [常见问题](../faq.md)
- 提交 [Issue](https://github.com/ViewWay/hermes-by-everythings/issues)
- 加入 [讨论](https://github.com/ViewWay/hermes-by-everythings/discussions)

---

**版本**: 2.1.0
**更新**: 2026-05-02
