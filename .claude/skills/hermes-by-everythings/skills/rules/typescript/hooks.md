# TypeScript Hooks

## Pre-commit

```bash
# 类型检查
npx tsc --noEmit

# Lint
npx eslint . --ext .ts,.tsx

# 格式化检查
npx prettier --check "**/*.ts"

# 测试
npm test
```

## Pre-push

```bash
# 完整测试套件
npm run test:all

# 构建验证
npm run build

# 类型检查
npx tsc --noEmit
```

## IDE Hooks

### VSCode

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 文件变更监听

监听 `.ts` 和 `.tsx` 文件变更：
- 自动运行类型检查
- 检测 `any` 使用
- 检测缺失类型导入
