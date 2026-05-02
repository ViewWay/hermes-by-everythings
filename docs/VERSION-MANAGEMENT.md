# HBE 统一版本管理

## 概述

HBE 使用 `version.json` 作为**单一真实数据源** (Single Source of Truth)。

## 工具

### 查看版本
```bash
node scripts/version.js show
```

### 同步版本
```bash
node scripts/version.js sync
```

### 检查一致性
```bash
node scripts/version.js check
```

### 设置新版本
```bash
node scripts/version.js set 3.4.0
```

### 快捷方式
```bash
bash scripts/sync-versions.sh show
bash scripts/sync-versions.sh sync
bash scripts/sync-versions.sh check
bash scripts/sync-versions.sh set 3.4.0
bash scripts/sync-versions.sh bump-major
bash scripts/sync-versions.sh bump-minor
bash scripts/sync-versions.sh bump-patch
```

## 工作流程

1. 修改 `version.json`
2. 运行 `node scripts/version.js sync`
3. 检查更新 `git diff`
4. 提交更改
