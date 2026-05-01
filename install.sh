#!/bin/bash
# Hermes-by-Everything 安装脚本
# 自动化安装和配置

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="hermes-by-everythings"
VERSION="2.1.0"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
log_success() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} ✓ $1"; }
log_error() { echo -e "${RED}[$(date +'%H:%M:%S')]${NC} ✗ $1"; }
log_warning() { echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} ⚠ $1"; }
log_info() { echo -e "${CYAN}[$(date +'%H:%M:%S')]${NC} ℹ $1"; }

# 显示欢迎信息
show_banner() {
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║       Hermes-by-Everything v$VERSION 安装程序                    ║"
    echo "║                                                               ║"
    echo "║       多平台多语言编码增强套件                                   ║"
    echo "║       9 Agent + 13 Skill + 15 Command + 8 Rules               ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
}

# 检测平台
detect_platform() {
    local os=$(uname -s)
    case "$os" in
        Darwin)
            echo "macos"
            ;;
        Linux)
            echo "linux"
            ;;
        MINGW*|MSYS*|CYGWIN*)
            echo "windows"
            ;;
        *)
            echo "unknown"
            ;;
    esac
}

# 检测 Claude Code 安装
detect_claude_code() {
    if command -v claude &> /dev/null; then
        echo "claude"
    elif [ -d "$HOME/.claude" ]; then
        echo "claude-code"
    else
        echo ""
    fi
}

# 创建目录
create_directories() {
    log "创建目录..."
    
    mkdir -p "$HOME/.claude/skills"
    mkdir -p "$HOME/.claude/hooks"
    mkdir -p "$HOME/claude/memory"
    
    log_success "目录已创建"
}

# 安装技能文件
install_skills() {
    log "安装技能文件..."
    
    # 检查是否已安装
    if [ -L "$HOME/.claude/skills/$PROJECT_NAME" ]; then
        log_info "技能目录已存在（软链接）"
    elif [ -d "$HOME/.claude/skills/$PROJECT_NAME" ]; then
        log_warning "技能目录已存在，将备份"
        mv "$HOME/.claude/skills/$PROJECT_NAME" "$HOME/.claude/skills/$PROJECT_NAME.backup.$(date +%s)"
    fi
    
    # 创建软链接
    ln -sf "$SCRIPT_DIR" "$HOME/.claude/skills/$PROJECT_NAME"
    
    log_success "技能文件已安装"
}

# 配置 hooks
configure_hooks() {
    log "配置 hooks..."
    
    local hooks_dir="$HOME/.claude/hooks"
    local settings_file="$HOME/.claude/settings.json"
    
    # 创建 settings.json（如果不存在）
    if [ ! -f "$settings_file" ]; then
        cat > "$settings_file" <<EOF
{
  "permissions": {
    "allow": ["Bash", "Read", "Write", "Edit"]
  }
}
EOF
        log_success "settings.json 已创建"
    else
        log_info "settings.json 已存在"
    fi
    
    log_success "hooks 已配置"
}

# 验证安装
verify_installation() {
    log "验证安装..."
    
    local errors=0
    
    # 检查技能目录
    if [ -L "$HOME/.claude/skills/$PROJECT_NAME" ]; then
        log_success "技能目录: ✓"
    else
        log_error "技能目录: ✗"
        errors=$((errors + 1))
    fi
    
    # 检查关键文件
    if [ -f "$HOME/.claude/skills/$PROJECT_NAME/SKILL.md" ]; then
        log_success "SKILL.md: ✓"
    else
        log_error "SKILL.md: ✗"
        errors=$((errors + 1))
    fi
    
    if [ -f "$HOME/.claude/skills/$PROJECT_NAME/CLAUDE.md" ]; then
        log_success "CLAUDE.md: ✓"
    else
        log_error "CLAUDE.md: ✗"
        errors=$((errors + 1))
    fi
    
    # 检查 scripts
    if [ -x "$HOME/.claude/skills/$PROJECT_NAME/scripts/ralph/ralph.sh" ]; then
        log_success "ralph.sh: ✓"
    else
        log_warning "ralph.sh: ⚠ (需要 chmod +x)"
    fi
    
    return $errors
}

# 显示下一步
show_next_steps() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║                                                               ║"
    echo "║                    安装成功！                                  ║"
    echo "║                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "下一步："
    echo ""
    echo "1. 在 Claude Code 中验证安装："
    echo "   /hbe:verify --system"
    echo ""
    echo "2. 开始使用："
    echo "   /hbe:plan \"实现用户登录功能\""
    echo ""
    echo "3. 查看文档："
    echo "   cat $HOME/.claude/skills/$PROJECT_NAME/docs/guides/quick-start.md"
    echo ""
    echo "4. 查看技能："
    echo "   ls $HOME/.claude/skills/$PROJECT_NAME/skills/active/"
    echo ""
}

# 主函数
main() {
    show_banner
    
    # 检测平台
    local platform=$(detect_platform)
    log "检测到平台: $platform"
    
    # 检测 Claude Code
    local claude=$(detect_claude_code)
    if [ -n "$claude" ]; then
        log_success "检测到 Claude Code"
    else
        log_warning "未检测到 Claude Code，部分功能可能不可用"
    fi
    
    echo ""
    
    # 执行安装步骤
    create_directories
    install_skills
    configure_hooks
    
    echo ""
    
    # 验证安装
    if verify_installation; then
        show_next_steps
        exit 0
    else
        log_error "安装验证失败"
        exit 1
    fi
}

# 运行安装
main "$@"
