# Hermes-by-Everything 技能放置策略

本文档定义 HBE 技能的组织和放置策略。

---

## 核心原则

1. **清晰分离**：核心技能与用户技能明确分开
2. **版本控制**：核心技能在 Git 仓库中
3. **用户定制**：用户技能在用户目录
4. **自动生成**：学习生成的技能有专门位置

---

## 技能放置位置

### 1. 核心技能（Core Skills）

**位置**: `skills/active/`

**条件**:
- ✅ 经过实战验证
- ✅ 跨项目通用
- ✅ 质量评分 > 80
- ✅ 有完整文档

**示例**:
- `skills/active/tdd-workflow.md`
- `skills/active/code-review.md`
- `skills/active/security-scan.md`

**管理**:
- 版本控制：Git
- 维护者：HBE 团队
- 更新频率：版本发布时

### 2. 实验性技能（Experimental Skills）

**位置**: `skills/experimental/`

**条件**:
- 🧪 正在测试中
- 🧪 可能不够稳定
- 🧪 需要用户反馈

**示例**:
- `skills/experimental/ai-coding-assistant.md`
- `skills/experimental/auto-refactor.md`

**管理**:
- 版本控制：Git
- 维护者：HBE 团队
- 更新频率：随时

### 3. 已废弃技能（Deprecated Skills）

**位置**: `skills/deprecated/`

**条件**:
- ❌ 不再推荐使用
- ❌ 有更好的替代
- ❌ 但保留以避免破坏现有流程

**示例**:
- `skills/deprecated/old-tdd-flow.md`

**管理**:
- 版本控制：Git
- 维护者：HBE 团队
- 更新频率：仅修复

### 4. 项目特定技能（Project-Specific Skills）

**位置**: `~/.claude/skills/project-specific/`

**条件**:
- 📁 仅适用于特定项目
- 📁 项目团队维护
- 📁 项目约定和规范

**示例**:
- `~/.claude/skills/project-specific/my-project-api.md`
- `~/.claude/skills/project-specific/team-coding-style.md`

**管理**:
- 版本控制：项目仓库
- 维护者：项目团队
- 更新频率：按需

### 5. 自动生成技能（Generated Skills）

**位置**: `~/.claude/skills/generated/`

**来源**:
- 🤖 由 `/hbe:learn` 自动生成
- 🤖 从会话中提取模式
- 🤖 待人工审核后可提升到核心

**示例**:
- `~/.claude/skills/generated/react-useeffect-deps-20260502.md`
- `~/.claude/skills/generated/python-async-error-handling-20260501.md`

**管理**:
- 版本控制：可选
- 维护者：自动 + 人工审核
- 更新频率：会话结束时

---

## 技能状态标记

所有技能应在 frontmatter 中标记状态：

```yaml
---
name: skill-name
description: 简短描述
version: 1.0.0
status: active | experimental | deprecated
deprecated_in: "2.0.0"  # 如果已废弃
replacement: "new-skill-name"  # 如果有替代
---
```

---

## 技能提升流程

### 从自动生成到核心技能

```
Generated（自动生成）
    ↓
项目验证（3个项目使用）
    ↓
人工审核（质量评分 > 80）
    ↓
Experimental（实验性）
    ↓
广泛验证（10+ 项目成功）
    ↓
Active（核心技能）
```

### 从核心技能到废弃

```
Active（核心技能）
    ↓
发现问题/有更好替代
    ↓
标记为 Deprecated
    ↓
保留2-3个版本
    ↓
最终移除
```

---

## 技能质量标准

### Active 技能

- ✅ 格式规范（符合模板）
- ✅ 文档完整（When/How/Examples）
- ✅ 测试通过（如有测试）
- ✅ 质量评分 > 80
- ✅ 跨项目验证（3+ 项目）
- ✅ 用户反馈积极

### Experimental 技能

- ✅ 基本格式正确
- ✅ 有基本文档
- ✅ 至少1个项目验证
- ✅ 质量评分 > 60

### Deprecated 技能

- ✅ 标记废弃原因
- ✅ 推荐替代技能
- ✅ 保留完整文档

---

## 技能发现机制

### Claude Code 自动发现

1. **核心技能**：通过 `.claude-plugin/marketplace.json` 自动发现
2. **用户技能**：通过 `~/.claude/skills/` 自动发现
3. **生成技能**：通过 frontmatter 中的 `keywords` 自动发现

### 触发机制

```yaml
---
keywords:
  - tdd
  - test-driven development
  - testing
trigger: >
  用户提到 "tdd"、"测试驱动开发"、
  或编辑测试文件时
---
```

---

## 技能依赖管理

### 声明依赖

```yaml
---
depends_on:
  - skill-a
  - skill-b
conflicts_with:
  - skill-c
---
```

### 依赖解析

当使用技能时：
1. 检查依赖是否满足
2. 自动加载依赖技能
3. 检查冲突技能
4. 按顺序应用技能

---

## 参考资料

- [Agent Skills Spec](https://agentskills.io/specification)
- [everything-claude-code SKILL-PLACEMENT-POLICY.md](https://github.com/affaan-m/everything-claude-code/blob/main/docs/SKILL-PLACEMENT-POLICY.md)

---

**版本**: 1.0.0
**创建**: 2026-05-02
**维护**: HBE 团队
