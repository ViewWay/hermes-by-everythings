---
name: hbe-architect
description: 系统架构设计 - 设计组件、数据流、API 契约
trigger: /hbe-architect
keywords:
  - architecture
  - 架构设计
  - system design
---

# /hbe-architect — 系统架构设计

设计系统架构、组件职责和数据流。

## 执行流程

1. **环境感知**
   ```bash
   # 审查现有架构
   find . -name "*.ts" -o -name "*.py" | head -20
   ```

2. **加载 Architect Agent**
   ```
   读取: skills/agents/architect.md
   ```

3. **架构设计**
   - 现状分析
   - 需求收集
   - 设计提案
   - 权衡分析

4. **输出设计**
   - 架构图
   - 组件职责
   - 数据模型
   - API 契约
   - 集成模式

---
