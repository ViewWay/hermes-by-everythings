---
name: hbe-verify
description: 五阶段验证循环 - 构建、类型检查、Lint、测试、安全
trigger: /hbe-verify
keywords:
  - verify
  - 验证
  - validation loop
---

# /hbe-verify — 五阶段验证循环

自动检测项目语言并运行完整的验证流程。

## 执行流程

1. **环境感知**
   ```bash
   # 检测项目语言（TS/Python/Rust/Go/Java等）
   ```

2. **五阶段验证**

   **Phase 1: Build**
   - TypeScript: `npx tsc`
   - Python: `python -m build`
   - Rust: `cargo build`
   - Go: `go build`
   - Java: `mvn compile`

   **Phase 2: Type Check**
   - TypeScript: `npx tsc --noEmit`
   - Python: `mypy`
   - Rust: `cargo clippy`
   - Go: `go vet`

   **Phase 3: Lint**
   - TypeScript: `eslint`
   - Python: `ruff`
   - Rust: `clippy`
   - Go: `golangci-lint`

   **Phase 4: Test**
   - TypeScript: `vitest` / `jest`
   - Python: `pytest`
   - Rust: `cargo test`
   - Go: `go test`

   **Phase 5: Security**
   - 密钥检测
   - 依赖漏洞扫描
   - 语言特定安全检查

3. **失败处理**
   - 任一阶段失败则 STOP
   - 修复后从 Phase 1 重新开始

4. **输出报告**
   - 每阶段通过/失败状态
   - 失败原因和修复建议

---
