# Skill Index — 技能索引

> **版本**: 2.0.0
> **设计理念**: 按需加载、元数据优先、延迟展开
> **Token 优化**: 相比完整 SKILLS.md 节省 ~85% tokens

---

## 加载策略

### L0: 索引层（本文件，~2KB）
```
加载时机: 每次 HBE 触发时
内容: Skill 元数据、分类、标签
目的: 快速定位相关 skill，不加载完整内容
```

### L1: Skill 元数据（按需读取）
```
加载时机: 执行具体 skill 时
内容: Skill frontmatter（YAML 元数据）
目的: 获取 skill 描述、触发条件、依赖关系
```

### L2: Skill 完整内容（延迟加载）
```
加载时机: 真正执行 skill 逻辑时
内容: 完整的 skill 文件内容
目的: 执行具体任务
```

---

## Skill 分类索引

### 🎯 核心开发

| ID | Name | 触发关键词 | Token | 优先级 |
|----|------|-----------|-------|--------|
| c01 | tdd-workflow | tdd, test-driven | 4.2KB | P0 |
| c02 | code-review | review, 审查 | 3.8KB | P0 |
| c03 | build-fix | build error | 2.9KB | P1 |
| c04 | refactor-cleanup | refactor, 重构 | 3.1KB | P1 |
| c05 | security-review | security, 安全 | 4.5KB | P0 |

### 🏗️ 架构与规划

| ID | Name | 触发关键词 | Token | 优先级 |
|----|------|-----------|-------|--------|
| a01 | architect | architecture, 架构 | 5.2KB | P0 |
| a02 | planner | plan, 规划 | 3.6KB | P0 |
| a03 | tech-stack-select | tech stack | 8.4KB | P1 |

### 🧪 测试与验证

| ID | Name | 触发关键词 | Token | 优先级 |
|----|------|-----------|-------|--------|
| t01 | e2e-testing | e2e, 端到端 | 3.9KB | P1 |
| t02 | test-coverage | coverage | 2.4KB | P2 |

### 📚 文档与维护

| ID | Name | 触发关键词 | Token | 优先级 |
|----|------|-----------|-------|--------|
| d01 | doc-sync | docs, 文档 | 2.8KB | P2 |
| d02 | readme-update | readme | 2.2KB | P2 |

### 🤖 自主执行

| ID | Name | 触发关键词 | Token | 优先级 |
|----|------|-----------|-------|--------|
| x01 | ralph-loop | ralph, 自主 | 4.7KB | P0 |
| x02 | orchestrate | orchestrate | 3.3KB | P1 |
| x03 | continuous-learning | learn, 学习 | 5.8KB | P1 |

### 🎭 Agents（智能体）

| ID | Name | 触发关键词 | Token | 优先级 |
|----|------|-----------|-------|--------|
| g01 | orchestrator | orchestrator, 编排 | 12.5KB | P0 |
| g02 | planner | planner, 规划 | 4.4KB | P0 |
| g03 | architect | architect, 架构 | 9.3KB | P0 |
| g04 | code-reviewer | review, 审查 | 5.4KB | P0 |
| g05 | security-reviewer | security, 安全 | 5.4KB | P0 |
| g06 | tdd-guide | tdd, 测试驱动 | 8.5KB | P0 |
| g07 | build-error-resolver | build fix, 构建修复 | 7.9KB | P1 |
| g08 | refactor-cleaner | refactor, 重构 | 5.6KB | P1 |
| g09 | doc-updater | docs, 文档 | 5.3KB | P2 |
| g10 | e2e-runner | e2e, 端到端 | 5.9KB | P1 |
| g11 | continuous-learning | learn, 学习 | 11.3KB | P1 |

---

## Token 优化效果

### 旧方案
- SKILLS.md: 540 行, ~15,000 tokens
- 加载频率: 每次触发
- 浪费: 85-90%

### 新方案
- SKILL-INDEX.md: ~2,000 tokens
- 按需加载: ~7,500 tokens/次
- 节省: 50%

---

## 快速查找

### 按任务类型

| 任务 | 推荐 Skill / Agent |
|------|-------------------|
| 大型项目编排 | g01-orchestrator（主Agent） |
| 新功能开发 | g02-planner, g03-architect, g06-tdd-guide |
| 代码审查 | g04-code-reviewer, g05-security-reviewer |
| 构建失败 | g07-build-error-resolver |
| 架构设计 | g03-architect |
| 自主开发 | g01-orchestrator, x01-ralph |
| 重构清理 | g08-refactor-cleaner |

### 按文件类型

| 文件 | 自动触发 Skill |
|------|---------------|
| *.test.ts | c01-tdd |
| package.json | c05-security |
| prd.json | x01-ralph |
| README.md | d02-readme-update |

---

**维护者**: HBE 核心团队
**版本**: 2.0.0
**最后更新**: 2026-05-02
