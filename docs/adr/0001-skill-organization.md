# ADR-0001: 技能组织结构

**状态**: 已接受
**创建日期**: 2026-05-02
**更新日期**: 2026-05-02

---

## 上下文

Hermes-by-Everything 需要管理大量技能（13+ 个核心技能，加上学习生成的技能）。需要一个清晰的组织结构来：
- 区分活跃和废弃技能
- 支持实验性技能测试
- 便于发现和维护

## 决策

采用三层技能组织结构：

```
skills/
├── active/           # 活跃技能（推荐使用）
├── experimental/     # 实验性技能（测试中）
└── deprecated/       # 已废弃技能（保留但不推荐）
```

**状态标记**：
```yaml
---
status: active | experimental | deprecated
deprecated_in: "2.0.0"
replacement: "new-skill-name"
---
```

## 理由

1. **清晰性**：用户一目了然哪些技能推荐使用
2. **实验性**：允许测试新技能而不影响核心
3. **向后兼容**：保留废弃技能，避免破坏现有流程
4. **演进性**：支持技能从实验→活跃→废弃的生命周期

## 后果

**正面**：
- 用户更容易找到合适的技能
- 技能质量有明确标准
- 支持快速实验和迭代

**负面**：
- 需要维护技能状态
- 迁移现有技能需要工作量

## 替代方案

1. **扁平结构** - 所有技能在同一目录
   - 缺点：难以区分状态

2. **分类结构** - 按功能分类（coding/testing/review）
   - 缺点：技能可能属于多个分类

3. **标签系统** - 用标签标记状态
   - 缺点：不够直观，需要额外工具

## 相关决策

无（这是第一个 ADR）

## 参考资料

- [mattpocock/skills](https://github.com/mattpocock/skills) - 技能分类灵感
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) - 技能放置策略
