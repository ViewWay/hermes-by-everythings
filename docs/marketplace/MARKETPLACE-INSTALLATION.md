# HBE 市场安装指南

Hermes-by-Everything's v3.3.1 现已支持 npm 和 Claude Code 插件市场安装！

## 🚀 安装方式

### 方式 1: npm 全局安装（推荐）

```bash
npm install -g hermes-by-everythings
```

### 方式 2: 直接运行安装脚本

```bash
bash scripts/install.sh
```

## 🔧 CLI 工具

```bash
npx hbe status    # 查看状态
npx hbe agents    # 列出 agents
npx hbe skills    # 列出 skills
npx hbe test      # 运行测试
```

## 📋 发布到 npm

```bash
npm login
npm publish --access public
```

---

**HBE v3.3.1** | 基于 ECC v2.0
