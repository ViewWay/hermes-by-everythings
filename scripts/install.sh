#!/usr/bin/env bash
#
# HBE Installation Script
#
# Hermes-by-Everything's v3.3.0 安装脚本
# 支持 Claude Code 插件系统和独立安装
#

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Claude Code 目录
CLAUDE_DIR="$HOME/.claude"

# 版本
HBE_VERSION="3.3.0"

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════╗"
echo "║   Hermes-by-Everything's v${HBE_VERSION} 安装程序              ║"
echo "║   中文编码增强套件 - 基于 ECC v2.0                    ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 检查 Claude Code 是否安装
if [ ! -d "$CLAUDE_DIR" ]; then
    echo -e "${RED}错误: 未找到 Claude Code 安装${NC}"
    echo "请先安装 Claude Code CLI"
    exit 1
fi

echo -e "${GREEN}✓${NC} 检测到 Claude Code: $CLAUDE_DIR"

# 备份现有配置
BACKUP_DIR="$HOME/.hbe-backup-$(date +%Y%m%d-%H%M%S)"
if [ -d "$CLAUDE_DIR/skills" ] || [ -d "$CLAUDE_DIR/commands" ]; then
    echo -e "${YELLOW}⚠${NC} 检测到现有配置，备份到: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
    [ -d "$CLAUDE_DIR/skills" ] && cp -r "$CLAUDE_DIR/skills" "$BACKUP_DIR/" 2>/dev/null || true
    [ -d "$CLAUDE_DIR/commands" ] && cp -r "$CLAUDE_DIR/commands" "$BACKUP_DIR/" 2>/dev/null || true
fi

# 创建必要的目录
echo -e "${BLUE}📁${NC} 创建目录结构..."
mkdir -p "$CLAUDE_DIR/skills"
mkdir -p "$CLAUDE_DIR/commands"
mkdir -p "$CLAUDE_DIR/rules"
mkdir -p "$CLAUDE_DIR/config"

# 复制技能文件
echo -e "${BLUE}📦${NC} 安装技能文件..."
if [ -d "$PROJECT_ROOT/skills" ]; then
    cp -r "$PROJECT_ROOT/skills/"* "$CLAUDE_DIR/skills/"
    echo -e "${GREEN}✓${NC} 技能文件已安装"
else
    echo -e "${YELLOW}⚠${NC} 未找到 skills 目录"
fi

# 复制命令文件
if [ -d "$PROJECT_ROOT/.claude/commands" ]; then
    cp -r "$PROJECT_ROOT/.claude/commands/"* "$CLAUDE_DIR/commands/"
    echo -e "${GREEN}✓${NC} 命令文件已安装"
fi

# 复制规则文件
if [ -d "$PROJECT_ROOT/.claude/rules" ]; then
    cp -r "$PROJECT_ROOT/.claude/rules/"* "$CLAUDE_DIR/rules/"
    echo -e "${GREEN}✓${NC} 规则文件已安装"
fi

# 复制配置文件
if [ -f "$PROJECT_ROOT/.claude/settings.json" ]; then
    echo -e "${BLUE}⚙️${NC} 合并配置文件..."
    cp "$PROJECT_ROOT/.claude/settings.json" "$CLAUDE_DIR/settings.hbe.json"
    echo -e "${GREEN}✓${NC} 配置文件已保存为 settings.hbe.json"
fi

# 设置权限
echo -e "${BLUE}🔐${NC} 设置权限..."
find "$CLAUDE_DIR/skills" -type f -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
find "$CLAUDE_DIR/commands" -type f -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true

# 完成
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗"
echo "║                  安装完成！🎉                                ║"
echo "╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📚${NC} 快速开始:"
echo "  1. 重启 Claude Code"
echo "  2. 使用 /hbe:plan 开始规划"
echo "  3. 使用 /hbe:review 进行代码审查"
echo ""
echo -e "${BLUE}📖${NC} 文档:"
echo "  - 完整文档: https://github.com/ViewWay/hermes-by-everythings"
echo "  - Agent 列表: AGENTS.md"
echo "  - 技能索引: skills/INDEX.md"
echo ""
echo -e "${BLUE}🧪${NC} 运行测试:"
echo "  bash tests/scripts/test-all.sh --fast"
echo ""
if [ -n "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}💾 备份位置: $BACKUP_DIR${NC}"
    echo "  如需恢复: cp -r $BACKUP_DIR/* ~/.claude/"
    echo ""
fi
echo -e "${GREEN}✨ HBE v${HBE_VERSION} 已就绪！${NC}"
