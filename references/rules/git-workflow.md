# Git 工作流规则

## 分支策略

### 分支命名
```
main                    # 主分支，始终可部署
develop                 # 开发分支
feat/user-auth          # 功能分支
fix/login-bug           # 修复分支
refactor/api-layer      # 重构分支
security/xss-fix        # 安全修复
release/v1.2.0          # 发布分支
```

### 分支流程
1. 从 develop/main 创建功能分支
2. 开发 + 测试
3. 自测通过后创建 PR
4. Code Review 通过后合并
5. 删除功能分支

## Commit 规范

### 格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
| Type | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| refactor | 重构（不改变功能） |
| docs | 文档变更 |
| test | 测试相关 |
| chore | 构建/工具变更 |
| perf | 性能优化 |
| style | 格式调整（不影响逻辑） |
| ci | CI/CD 配置 |

### 示例
```
feat(auth): add JWT token refresh mechanism

Implement automatic token refresh when access token expires.
Uses refresh token to get new access token without re-login.

Closes #123
```

### 规则
- subject 不超过 50 字符
- 使用现在时态（"add" 非 "added"）
- 不以句号结尾
- body 说明"为什么"改，不是"改了什么"

## PR 规则

### 标题
同 commit 格式: `feat(scope): 简述`

### 描述模板
```markdown
## 变更说明
[简要描述这个 PR 做了什么]

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档
- [ ] 测试

## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过

## 截图（如适用）
[UI 变更截图]

## 关联 Issue
Closes #
```

## 提交前检查清单

- [ ] 代码通过 lint
- [ ] 所有测试通过
- [ ] 无 console.log/print 调试语句
- [ ] 无硬编码密钥
- [ ] 新代码有测试覆盖
- [ ] 文档已更新（如需要）
- [ ] CHANGELOG 已更新（如需要）

## Git 操作规范

```bash
# 同步主分支
git fetch origin
git rebase origin/main

# 交互式变基（整理提交）
git rebase -i HEAD~3

# 查看变更
git diff --staged
git diff --stat origin/main...HEAD

# 撤销（安全）
git revert <commit-hash>
```
