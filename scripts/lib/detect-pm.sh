#!/bin/bash
# 包管理器检测脚本
# 自动检测项目使用的包管理器

set -euo pipefail

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# 检测包管理器
detect_package_manager() {
    local project_dir=${1:-.}
    
    # 优先级顺序
    if [ -f "$project_dir/pnpm-lock.yaml" ]; then
        echo "pnpm"
    elif [ -f "$project_dir/yarn.lock" ]; then
        echo "yarn"
    elif [ -f "$project_dir/bun.lockb" ]; then
        echo "bun"
    elif [ -f "$project_dir/package-lock.json" ]; then
        echo "npm"
    else
        # 默认使用 npm
        echo "npm"
    fi
}

# 获取包管理器命令
get_pm_command() {
    local pm=$1
    case "$pm" in
        "pnpm")
            echo "pnpm"
            ;;
        "yarn")
            echo "yarn"
            ;;
        "bun")
            echo "bun"
            ;;
        "npm"|*)
            echo "npm"
            ;;
    esac
}

# 检查包管理器是否安装
check_pm_installed() {
    local pm=$1
    if command -v "$pm" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 主函数
main() {
    local project_dir=${1:-.}
    
    # 检测包管理器
    local detected_pm=$(detect_package_manager "$project_dir")
    log_info "检测到包管理器: $detected_pm"
    
    # 检查是否安装
    if check_pm_installed "$detected_pm"; then
        log_success "$detected_pm 已安装"
        
        # 输出命令供脚本使用
        get_pm_command "$detected_pm"
    else
        echo "错误: $detected_pm 未安装" >&2
        exit 1
    fi
}

# 如果直接运行此脚本
if [ "${BASH_SOURCE[0]}" = "$0" ]; then
    main "$@"
fi
