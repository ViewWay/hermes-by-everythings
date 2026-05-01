# 贡献指南

感谢你对 Hermes-by-Everything 的贡献兴趣！

---

## 如何贡献

### 1. 报告问题

在 [Issues](https://github.com/ViewWay/hermes-by-everythings/issues) 中报告 bug 或提出功能请求。

**报告 Bug 时请包含**:
- 复现步骤
- 期望行为
- 实际行为
- 环境信息（OS、Claude Code 版本）
- 相关日志

### 2. 提交代码

#### Fork 和 Clone

```bash
# 1. Fork 仓库
# 2. Clone 你的 fork
git clone https://github.com/YOUR_USERNAME/hermes-by-everythings.git

# 3. 添加 upstream
git remote add upstream https://github.com/ViewWay/hermes-by-everythings.git
```

#### 创建分支

```bash
git checkout -b feature/your-feature-name
# 或
git checkout -b fix/your-bug-fix
```

#### 提交变更

```bash
git add .
git commit -m "feat: add new feature"
# 或
git commit -m "fix: resolve bug description"
```

**Commit 消息规范**:
- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档更新
- `refactor:` 重构
- `test:` 测试
- `chore:` 构建/工具

#### 推送和创建 PR

```bash
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

---

## 开发规范

### 文件命名

- **Agent 文件**: `lowercase-with-hyphens.md`（如 `python-reviewer.md`）
- **Skill 文件**: `lowercase-with-hyphens.md`（如 `tdd-workflow.md`）
- **命令文件**: `lowercase-with-hyphens.md`
- **脚本文件**: `lowercase-with-hyphens.sh`

### Agent 格式

```markdown
---
name: agent-name
description: 简短描述（一句话）
version: 1.0.0
status: active
tools: [Read, Write, Edit, Bash]
model: claude-sonnet-4-6
---

# Agent Name

简短描述。

## When to Use
[何时使用此 Agent]

## How It Works
[工作原理]

## Examples
[示例]
```

### Skill 格式

```markdown
---
name: skill-name
description: 简短描述（一句话）
version: 1.0.0
status: active
keywords:
  - keyword1
  - keyword2
trigger: 何时触发
---

# Skill Name

简短描述。

## When to Use
[何时使用此 Skill]

## How It Works
[工作原理]

## Examples
[示例]

## Related Skills
- [Related Skill](../related-skill/SKILL.md)
```

### 测试

所有脚本和工具需要有测试：

```bash
# 运行所有测试
bash scripts/test/test-all.sh

# 运行特定测试
bash scripts/test/test-skills.sh
```

---

## 重要决策

重要架构决策需要通过 ADR 流程：

1. 复制 ADR 模板：`cp docs/adr/0000-template.md docs/adr/0004-your-decision.md`
2. 填写所有章节
3. 在 PR 中讨论
4. 被接受后合并

---

## 代码审查

所有 PR 需要通过：
1. ✅ 格式验证
2. ✅ 测试通过
3. ✅ 文档更新
4. ✅ 至少1个维护者批准

---

## 社区规范

- 🤝 尊重所有贡献者
- 💬 建设性讨论
- 🌍 欢迎所有背景的人
- 📚 分享知识

---

## 获取帮助

- 查看 [文档](../docs/)
- 提交 [Issue](https://github.com/ViewWay/hermes-by-everythings/issues)
- 加入 [Discussions](https://github.com/ViewWay/hermes-by-everythings/discussions)

---

**感谢你的贡献！** 🎉
