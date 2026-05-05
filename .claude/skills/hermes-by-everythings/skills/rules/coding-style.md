# 代码风格规则

## 命名约定

### 通用
- 使用有意义的英文命名，避免缩写（除公认缩写如 ID、URL、HTTP）
- 布尔变量使用 is/has/should/can 前缀
- 常量使用 UPPER_SNAKE_CASE
- 避免魔法数字，提取为命名常量

### TypeScript/React
- 文件名: kebab-case（user-profile.tsx）
- 组件名: PascalCase（UserProfile）
- 函数/变量: camelCase（getUserProfile）
- 类型/接口: PascalCase（UserProfileData）
- 枚举: PascalCase + PascalCase 值

### Rust
- 文件名: snake_case（user_profile.rs）
- 结构体/枚举: PascalCase（UserProfile）
- 函数/方法: snake_case（get_user_profile）
- 常量: SCREAMING_SNAKE_CASE（MAX_RETRIES）
- trait: PascalCase（UserRepository）

## 代码组织

### 文件结构
```
// 导入顺序
1. 标准库 / 外部依赖
2. 内部模块
3. 类型定义
4. 常量
5. 主逻辑
6. 辅助函数
7. 导出
```

### 函数规则
- 单一职责：一个函数只做一件事
- 参数不超过 4 个，超过则用对象/结构体
- 函数体不超过 50 行
- 提前返回，减少嵌套

### 注释规则
- 代码说明"为什么"，不是"做什么"
- 公开 API 必须有文档注释
- TODO 格式: `// TODO(author): 描述`
- 避免 commented-out 代码

## 格式化

- 缩进: 2 空格（TS/JS/HTML/CSS）, 4 空格（Rust）
- 行宽: 100 字符（TS）, 100 字符（Rust）
- 尾逗号: 多行时必须有（TS）
- 分号: 必须有（TS）
- 字符串: 优先单引号（TS）

```bash
# 自动格式化
npx prettier --write .
cargo fmt
```
