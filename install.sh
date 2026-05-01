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
    echo "║       10 Agent + 13 Skill + 15 Command + 8 Rules              ║"
    echo "║       Ralph + Orchestrator 编排系统                             ║"
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

# 选择安装方法
choose_install_method() {
    echo ""
    echo "选择安装方法:"
    echo "  1) skillhub (推荐 - 如果已安装skillhub)"
    echo "  2) git clone (标准方法)"
    echo "  3) manual (已下载，仅创建链接)"
    echo "  4) symlink (开发模式，当前目录链接)"
    echo ""
    read -p "输入选择 [1-4]: " choice

    case $choice in
        1)
            echo "skillhub"
            ;;
        2)
            echo "git"
            ;;
        3)
            echo "manual"
            ;;
        4)
            echo "symlink"
            ;;
        *)
            log_error "无效选择"
            exit 1
            ;;
    esac
}

# 通过 skillhub 安装
install_via_skillhub() {
    log "通过 skillhub 安装..."

    if ! command -v skillhub &> /dev/null; then
        log_error "skillhub 未安装"
        log_info "先安装 skillhub: npm install -g @anthropics/skillhub"
        exit 1
    fi

    skillhub install hermes-by-everythings
    log_success "通过 skillhub 安装完成"
}

# 通过 git 安装
install_via_git() {
    log "通过 git clone 安装..."

    # 清理临时目录
    rm -rf "$TEMP_DIR"
    mkdir -p "$TEMP_DIR"

    # 克隆仓库
    log "从 $REPO_URL 克隆..."
    git clone "$REPO_URL" "$TEMP_DIR"

    # 创建目标目录
    mkdir -p "$INSTALL_DIR"

    # 移动到目标
    log "安装到 $INSTALL_DIR/$PROJECT_NAME..."
    if [ -d "$INSTALL_DIR/$PROJECT_NAME" ]; then
        log_warning "发现现有安装，正在备份..."
        mv "$INSTALL_DIR/$PROJECT_NAME" "$INSTALL_DIR/$PROJECT_NAME.backup.$(date +%s)"
    fi

    mv "$TEMP_DIR" "$INSTALL_DIR/$PROJECT_NAME"

    # 清理
    rm -rf "$TEMP_DIR"

    log_success "通过 git 安装完成"
}

# 手动安装
install_via_manual() {
    log "手动安装（输入路径）..."

    read -p "输入 hermes-by-everythings 的路径: " source_path

    if [ ! -d "$source_path" ]; then
        log_error "目录未找到: $source_path"
        exit 1
    fi

    # 创建符号链接
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"

    if [ -L "$PROJECT_NAME" ]; then
        log_warning "删除现有符号链接..."
        rm "$PROJECT_NAME"
    fi

    ln -s "$source_path" "$INSTALL_DIR/$PROJECT_NAME"
    log_success "符号链接已创建: $INSTALL_DIR/$PROJECT_NAME -> $source_path"
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

    # 检查依赖
    if ! command -v git &> /dev/null; then
        log_error "git 未安装，请先安装 git"
        exit 1
    fi

    # 选择安装方法
    local method=$(choose_install_method)
    log "选择的方法: $method"

    echo ""

    # 根据方法执行安装
    case $method in
        skillhub)
            install_via_skillhub
            ;;
        git)
            install_via_git
            ;;
        manual)
            install_via_manual
            ;;
        symlink)
            # 创建符号链接（开发模式）
            log "开发模式安装（符号链接）..."
            create_directories
            install_skills
            ;;
    esac

    echo ""

    # 配置 hooks
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
