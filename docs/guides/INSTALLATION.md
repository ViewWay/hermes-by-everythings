# Hermes-by-Everything 安装指南

> **版本**: 3.2.0  
> **更新时间**: 2026-05-02  
> **支持平台**: macOS, Linux, Windows

---

## 快速安装

### 方法 1: 使用 skillhub（推荐）

```bash
npm install -g @anthropics/skillhub
skillhub install hermes-by-everythings
```

### 方法 2: 使用安装脚本

```bash
git clone https://github.com/ViewWay/hermes-by-everythings.git
cd hermes-by-everythings

# 选择适合平台的脚本
bash install.sh        # macOS/Linux
python3 install.py     # 跨平台（推荐）
powershell install.ps1  # Windows
```

### 方法 3: 手动安装

```bash
git clone https://github.com/ViewWay/hermes-by-everythings.git
ln -s $(pwd)/hermes-by-everythings ~/.claude/skills/hermes-by-everythings
```

---

## 验证安装

在 Claude Code 中输入：

```
/hbe-verify --system
```

预期输出：
```
✓ HBE 系统验证通过
✓ 10 个 Agent 可用
✓ Orchestrator 编排系统可用
```

---

## 故障排除

### Claude Code 找不到 HBE

```bash
# 检查链接
ls -la ~/.claude/skills/ | grep hermes

# 重新创建
ln -s /path/to/hermes-by-everythings ~/.claude/skills/hermes-by-everythings

# 重启 Claude Code
```

### Agent 加载失败

```bash
# 检查 Agent 文件
ls ~/.claude/skills/hermes-by-everythings/skills/agents/

# 重新安装
rm ~/.claude/skills/hermes-by-everythings
cd /path/to/hermes-by-everythings
bash install.sh
```

---

## 下一步

1. [快速开始](quick-start.md)
2. [Orchestrator 教程](ORCHESTRATOR-TUTORIAL.md)
3. [Agent 教程](agents/)

---

**版本**: 3.2.0 | **更新**: 2026-05-02
