# HBE 评估系统

评估驱动开发，确保代码质量和功能正确性。

## 评估指标

### Pass@K 指标

衡量在 K 次尝试内通过测试的比例：

| 指标 | 含义 | 目标 |
|------|------|------|
| **pass@1** | 第一次尝试就成功 | >60% |
| **pass@3** | 3次尝试内成功 | >85% |
| **pass@10** | 10次尝试内成功 | >95% |

## 评估流程

### 1. 定义预期行为

在实现之前，明确定义：

```markdown
## 功能：用户登录

### 预期行为
- 输入有效邮箱和密码 → 返回 JWT token
- 输入无效邮箱 → 返回 400 错误
- 输入错误密码 → 返回 401 错误
- 密码少于8位 → 返回 400 错误

### 验收标准
- [ ] 通过所有测试用例
- [ ] 代码覆盖率 >80%
- [ ] 通过安全审查
- [ ] 无已知漏洞
```

### 2. 创建评估套件

```python
# tests/evaluation/login_evaluation.py

class LoginEvaluation:
    """登录功能评估"""
    
    def test_valid_credentials(self):
        """测试有效凭据"""
        response = api.login(email="user@example.com", password="password123")
        assert response.status_code == 200
        assert "token" in response.json
    
    def test_invalid_email(self):
        """测试无效邮箱"""
        response = api.login(email="invalid", password="password123")
        assert response.status_code == 400
        assert "error" in response.json
    
    def test_wrong_password(self):
        """测试错误密码"""
        response = api.login(
            email="user@example.com", 
            password="wrongpassword"
        )
        assert response.status_code == 401
    
    def test_weak_password(self):
        """测试弱密码"""
        response = api.login(
            email="user@example.com", 
            password="123"
        )
        assert response.status_code == 400
```

### 3. 运行评估

```bash
# 运行评估套件
npm run test:evaluation

# 生成覆盖率报告
npm run test:coverage

# 运行安全评估
/hbe-security
```

### 4. 分析结果

```markdown
## 评估结果

### 测试结果
- ✅ valid_credentials: PASS
- ✅ invalid_email: PASS
- ✅ wrong_password: PASS
- ✅ weak_password: PASS

### 覆盖率
- 语句覆盖率: 92%
- 分支覆盖率: 87%
- 函数覆盖率: 100%

### 安全审查
- ✅ 无SQL注入风险
- ✅ 密码正确哈希
- ✅ JWT安全配置

### Pass@K 指标
- pass@1: 100% (4/4测试一次通过)
- pass@3: 100% (4/4测试3次内通过)

### 结论
✅ 功能达到生产标准
```

## 回归测试

### 基线建立

```bash
# 第一次评估后保存基线
/hbe-eval --baseline

# 生成基线报告
# -> baseline-2026-05-02.json
```

### 回归检测

```bash
# 代码变更后运行回归测试
/hbe-eval --regression

# 比较结果
# -> 2个测试失败 (pass@1 从 100% 降到 75%)
```

### 修复和验证

```bash
# 修复问题后重新评估
/hbe-eval

# 结果: pass@1 恢复到 100%
```

## 评估维度

### 1. 功能正确性

**评估**: 是否实现了所有需求？

**方法**:
- 单元测试
- 集成测试
- E2E测试

**目标**: 100% 需求覆盖

### 2. 代码质量

**评估**: 代码是否可维护？

**方法**:
```bash
/hbe-review
```

**指标**:
- 函数长度 <50行
- 文件长度 <800行
- 嵌套深度 <4层
- 代码重复率 <5%

### 3. 安全性

**评估**: 是否有安全漏洞？

**方法**:
```bash
/hbe-security
```

**检查项**:
- SQL注入
- XSS
- CSRF
- 硬编码密钥
- 输入验证

### 4. 性能

**评估**: 性能是否可接受？

**方法**:
- 基准测试
- 性能分析
- 负载测试

**指标**:
- 响应时间 <200ms (P95)
- 吞吐量 >100 req/s
- 内存使用稳定

### 5. 测试覆盖率

**评估**: 测试是否充分？

**方法**:
```bash
npm run test:coverage
```

**目标**:
- 语句覆盖率 >80%
- 分支覆盖率 >75%
- 关键路径 100%

## 持续评估

### CI/CD 集成

```yaml
# .github/workflows/evaluation.yml
name: Evaluation

on: [pull_request]

jobs:
  evaluate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run evaluation
        run: |
          /hbe-eval
          npm run test:coverage
          /hbe-security
      
      - name: Check thresholds
        run: |
          if [ $(coverage percent) -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi
```

### 本地评估

```bash
# 开发时持续评估
watch -n 10 'npm run test:evaluation'

# 提交前完整评估
/hbe-orchestrate feature
```

## 评估报告模板

```markdown
# 功能评估报告：[功能名称]

**日期**: 2026-05-02
**版本**: v1.0.0
**评估者**: HBE

## 执行摘要

[总体评估: ✅ 达标 / ⚠️ 部分达标 / ❌ 未达标]

## 详细结果

### 功能正确性
- 测试通过率: 95% (19/20)
- 需求覆盖率: 100%
- **结论**: ✅ 达标

### 代码质量
- 平均函数长度: 35行
- 平均文件长度: 450行
- 代码重复率: 3%
- **结论**: ✅ 达标

### 安全性
- 无已知漏洞
- 通过安全审查
- **结论**: ✅ 达标

### 性能
- P95响应时间: 150ms
- 吞吐量: 150 req/s
- **结论**: ✅ 达标

### 测试覆盖率
- 语句覆盖率: 87%
- 分支覆盖率: 82%
- **结论**: ✅ 达标

## Pass@K 指标

- pass@1: 95% (19/20)
- pass@3: 100% (20/20)
- pass@10: 100% (20/20)

## 风险评估

### 高风险
- [无]

### 中风险
- [ ] 第5个测试偶尔不稳定（需要进一步调查）

### 低风险
- [ ] 覆盖率接近阈值（建议增加测试）

## 建议

1. 调查第5个测试的不稳定性
2. 增加边界情况测试以提高覆盖率
3. 考虑添加性能回归测试

## 结论

✅ **批准合并到主分支**

功能质量符合生产标准，风险评估可接受。
```

## 工具集成

### 与命令集成

```bash
# 完整评估
/hbe-eval

# 评估 + 修复
/hbe-eval --fix

# 回归测试
/hbe-eval --regression

# 生成基线
/hbe-eval --baseline
```

### 与 Ralph 集成

Ralph 循环中自动运行评估：

```bash
/hbe-ralph

# Ralph 会:
# 1. 实现功能
# 2. 运行评估
# 3. 修复失败
# 4. 重新评估
# 5. 通过后才提交
```

## 最佳实践

1. **定义清晰的验收标准**
2. **自动化评估流程**
3. **建立性能基线**
4. **持续监控回归**
5. **定期审查评估指标**

---

**目的**: 确保 HBE 生成的代码符合生产标准

**版本**: v3.3.1
**更新**: 2026-05-02
