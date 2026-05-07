# Hermes-by-Everything Phase 2 优化方案

> 基于 4 大优质仓库的最佳实践进一步优化

---

## 📊 仓库对比分析

| 特性 | mattpocock | anthropics | everything-claude-code | burn-in-ralph | HBE 当前 | HBE 优化后 |
|------|-----------|------------|------------------------|---------------|----------|------------|
| **CLAUDE.md** | ✅ | ✅ | ✅ 完整 | ✅ | ✅ 基础 | ✅ 完整 |
| **ADR 系统** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **技能状态管理** | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **技能放置策略** | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **测试覆盖** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Ralph 日志** | ❌ | ❌ | ❌ | ✅ 完整 | ❌ | ✅ |
| **安装脚本** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **技能模板** | ❌ | ✅ 官方 | ❌ | ❌ | ❌ | ✅ |
| **包管理器检测** | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| **多级文档** | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |

---

## 🎯 Phase 2 优化目标

### 目标 1: 完善文档体系

**参考**: everything-claude-code 的 CLAUDE.md + mattpocock/skills 的多级文档

**实施方案**:

1. **增强 CLAUDE.md**
```markdown
# CLAUDE.md

## Project Overview
[项目概述]

## Running Tests
```bash
# 运行所有测试
bash scripts/test/test-all.sh

# 运行特定测试
bash scripts/test/test-skills.sh
```

## Architecture
[架构说明]

## Key Commands
[关键命令]

## Development Notes
[开发注意事项]

## Contributing
[贡献指南]

## Skills
[技能映射表]
```

2. **添加 ADR 系统**
```
docs/adr/
├── 0001-skill-organization.md
├── 0002-ralph-integration.md
├── 0003-learning-loop.md
└── README.md
```

3. **多级文档体系**
```
├── CLAUDE.md              # L0: 项目级上下文
├── README.md              # L1: 项目总览
├── SKILL.md               # L2: 技能入口
├── docs/                  # L3: 详细文档
│   ├── adr/              # 架构决策
│   ├── guides/           # 使用指南
│   └── api/              # API 参考
└── references/           # L4: 参考文档
    ├── agents/
    ├── skills/
    └── rules/
```

### 目标 2: 技能状态管理

**参考**: mattpocock/skills 的技能分类

**实施方案**:

```
skills/
├── active/              # 活跃技能（推荐使用）
│   ├── coding/
│   ├── testing/
│   └── review/
├── deprecated/          # 已废弃（保留但不推荐）
└── experimental/        # 实验性（测试中）
```

**状态标记**:
```yaml
---
status: active | deprecated | experimental
deprecated_in: "2.0.0"
replacement: "new-skill-name"
---
```

### 目标 3: 技能放置策略

**参考**: everything-claude-code 的 SKILL-PLACEMENT-POLICY.md

**实施方案**:

创建 `docs/SKILL-PLACEMENT-POLICY.md`:

```markdown
# Skill Placement Policy

## 核心技能
**位置**: `skills/active/`
**条件**: 
- 经过实战验证
- 跨项目通用
- 质量评分 > 80

## 项目特定技能
**位置**: `~/.claude/skills/project-specific/`
**条件**:
- 仅适用于特定项目
- 项目团队维护

## 自动生成技能
**位置**: `~/.claude/skills/generated/`
**条件**:
- 由 `/hbe-learn` 自动生成
- 待人工审核后可提升到核心
```

### 目标 4: 增强测试

**参考**: everything-claude-code 的测试系统 + burn-in-ralph 的测试

**实施方案**:

```bash
scripts/test/
├── test-all.sh           # 运行所有测试
├── test-skills.sh        # 测试技能格式
├── test-agents.sh        # 测试 Agent 格式
├── test-hooks.sh         # 测试 Hooks
├── validate-prompts.sh   # 验证 prompt 质量
└── lib/
    ├── skill-validator.sh
    ├── agent-validator.sh
    └── quality-scorer.sh
```

**test-skills.sh**:
```bash
#!/bin/bash
# 验证所有技能文件格式

for skill in $(find skills/ -name "*.md"); do
    # 检查 YAML frontmatter
    # 检查必需字段
    # 检查格式规范
    # 检查链接有效性
done
```

### 目标 5: Ralph 日志系统

**参考**: burn-in-cceverything-ralph 的 ralph.sh + view-logs.sh

**实施方案**:

```bash
scripts/
├── ralph/
│   ├── ralph.sh          # Ralph 主脚本
│   ├── view-logs.sh      # 日志查看
│   └── lib/
│       ├── prd-parser.sh
│       ├── story-executor.sh
│       └── progress-tracker.sh
```

**ralph.sh**:
```bash
#!/bin/bash
# Ralph 自主执行脚本
# 功能：
# - 解析 prd.json
# - 逐个执行 stories
# - 每次迭代后提交
# - 更新进度
# - 生成详细日志
```

**view-logs.sh**:
```bash
#!/bin/bash
# Ralph 日志查看器
# 功能：
# - 彩色日志输出
# - 错误高亮
# - 进度追踪
# - 统计信息
```

### 目标 6: 安装脚本

**参考**: burn-in-cceverything-ralph 的 install.sh

**实施方案**:

```bash
install.sh
```

```bash
#!/bin/bash
# Hermes-by-Everything 安装脚本

set -e

echo "🚀 Installing Hermes-by-Everything..."

# 检测平台
PLATFORM=$(detect_platform)

# 检测 Claude Code 安装
CLAUDE_CODE=$(detect_claude_code)

# 创建目录
mkdir -p ~/.claude/skills/
mkdir -p ~/.claude/hooks/

# 复制文件
cp -r . ~/.claude/skills/hermes-by-everythings

# 配置 hooks
configure_hooks

# 验证安装
verify_installation

echo "✅ Installation complete!"
echo "Run /hbe-plan to get started"
```

### 目标 7: 技能模板

**参考**: anthropics/skills 的 template/SKILL.md

**实施方案**:

```
templates/
├── skill-template.md
├── agent-template.md
└── command-template.md
```

**skill-template.md**:
```markdown
---
name: skill-name
description: 简短描述（一句话）
version: 1.0.0
status: active
trigger: 何时触发此技能
keywords:
  - keyword1
  - keyword2
---

# Skill Name

简短描述。

## When to Use

[何时使用此技能]

## How It Works

[工作原理]

## Examples

[示例]

## Related Skills

- [Related Skill](../related-skill/SKILL.md)
```

### 目标 8: 包管理器检测

**参考**: everything-claude-code 的包管理器检测

**实施方案**:

```bash
scripts/lib/detect-pm.sh
```

```bash
#!/bin/bash
# 检测项目的包管理器

detect_package_manager() {
    if [ -f "package-lock.json" ]; then
        echo "npm"
    elif [ -f "pnpm-lock.yaml" ]; then
        echo "pnpm"
    elif [ -f "yarn.lock" ]; then
        echo "yarn"
    elif [ -f "bun.lockb" ]; then
        echo "bun"
    else
        echo "npm"  # 默认
    fi
}

# 使用
PM=$(detect_package_manager)
$PM install
$PM test
```

---

## 📋 实施计划

### Week 1: 文档完善

**Day 1-2**: 增强 CLAUDE.md
- [ ] 添加 Project Overview
- [ ] 添加 Running Tests
- [ ] 添加 Architecture
- [ ] 添加 Development Notes
- [ ] 添加 Contributing

**Day 3-4**: 添加 ADR 系统
- [ ] 创建 docs/adr/ 目录
- [ ] 编写 ADR 模板
- [ ] 记录关键决策
- [ ] 创建 ADR README

**Day 5**: 多级文档体系
- [ ] 规划文档层级
- [ ] 创建 docs/guides/
- [ ] 创建 docs/api/
- [ ] 更新 README.md

### Week 2: 技能管理

**Day 1-2**: 技能状态管理
- [ ] 创建 skills/active/
- [ ] 创建 skills/deprecated/
- [ ] 创建 skills/experimental/
- [ ] 迁移现有技能

**Day 3-4**: 技能放置策略
- [ ] 编写 SKILL-PLACEMENT-POLICY.md
- [ ] 创建技能分类标准
- [ ] 定义技能质量标准

**Day 5**: 技能模板
- [ ] 创建 templates/ 目录
- [ ] 编写 skill-template.md
- [ ] 编写 agent-template.md
- [ ] 编写 command-template.md

### Week 3: 测试和质量

**Day 1-2**: 测试系统
- [ ] 创建 scripts/test/
- [ ] 编写 test-skills.sh
- [ ] 编写 test-agents.sh
- [ ] 编写 test-hooks.sh

**Day 3-4**: 质量验证
- [ ] 编写 validate-prompts.sh
- [ ] 实现质量评分算法
- [ ] 集成到 CI/CD

**Day 5**: 包管理器检测
- [ ] 编写 detect-pm.sh
- [ ] 集成到所有脚本
- [ ] 测试所有包管理器

### Week 4: Ralph 和安装

**Day 1-3**: Ralph 日志系统
- [ ] 创建 ralph.sh
- [ ] 创建 view-logs.sh
- [ ] 实现日志解析
- [ ] 实现进度追踪

**Day 4-5**: 安装脚本
- [ ] 编写 install.sh
- [ ] 测试所有平台
- [ ] 添加卸载脚本

---

## 🎯 成功指标

### 文档质量
- [ ] CLAUDE.md 包含所有必需章节
- [ ] ADR 系统记录 5+ 关键决策
- [ ] 文档覆盖所有主要功能

### 技能管理
- [ ] 100% 技能有状态标记
- [ ] 90% 技能在 active/
- [ ] 0% 孤立技能

### 测试覆盖
- [ ] 测试套件运行 < 30s
- [ ] 100% 技能通过格式验证
- [ ] 100% Agent 通过格式验证

### 用户体验
- [ ] 安装时间 < 2 分钟
- [ ] Ralph 日志实时可见
- [ ] 包管理器自动检测

---

## 📚 参考资源

- [mattpocock/skills](https://github.com/mattpocock/skills)
- [anthropics/skills](https://github.com/anthropics/skills)
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- [burn-in-cceverywhere-ralph](https://github.com/hellangleZ/burn-in-cceverywhere-ralph)

---

**版本**: 2.1.0 → 2.2.0
**实施时间**: 4 周
**优化目标**: 8 大目标
**预期效果**: 接近 100% 的官方/开源最佳实践
