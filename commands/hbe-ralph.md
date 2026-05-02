---
name: hbe-ralph
description: Ralph 自主循环 - 突破上下文限制的自主开发
trigger: /hbe:ralph
keywords:
  - ralph
  - autonomous coding
  - 自主编码
  - 自主循环
---

# /hbe:ralph — Ralph 自主循环

突破上下文限制，完全自主完成大型任务。

## 执行流程

1. **初始化**
   ```bash
   # 检查 prd.json 是否存在
   # 不存在则先运行 /hbe:prd
   ```

2. **Token 优化策略**
   - 每次迭代 = 全新上下文起点
   - 只读第一个 `passes=false` 的 story
   - 按需加载 agent prompt
   - 增量验证（根据变更类型选择阶段）

3. **自主循环**
   ```
   WHILE iterations < max_iterations:
     1. 读取 prd.json 第一个未完成 story
     2. 加载对应 agent（tdd-guide.md）
     3. TDD 实现: RED → GREEN → REFACTOR
     4. 增量验证（分析 git diff）
     5. 全部通过 → git commit
     6. 更新 prd.json passes=true
     7. 追加摘要到 progress.md
   ```

4. **进度追踪**
   - 实时更新 `progress.md`
   - 生成迭代日志 `logs/iteration-*.jsonl`
   - 统计 token 使用和耗时

5. **输出报告**
   - 完成数/总数
   - 剩余 story 列表
   - Token 估算（优化后节省 ~55%）

---
