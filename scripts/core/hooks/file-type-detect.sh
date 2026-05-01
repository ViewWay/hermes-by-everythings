#!/bin/bash
# File Type Detection Hook: 根据编辑的文件类型建议相关命令

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

main() {
    local file="$1"
    local ext="${file##*.}"
    local basename=$(basename "$file")
    local suggestion=""

    case "$basename" in
        test|spec|*test.*|*spec.*)
            suggestion="运行测试: /hbe:test\n测试覆盖率: /hbe:coverage"
            ;;
        package.json)
            suggestion="依赖审查: /hbe:review-deps\n安全审计: npm audit"
            ;;
        Cargo.toml)
            suggestion="依赖更新: cargo update\nCargo 检查: cargo clippy"
            ;;
        go.mod)
            suggestion="依赖整理: go mod tidy\n运行测试: go test ./..."
            ;;
    esac

    if [ -z "$suggestion" ]; then
        case ".$ext" in
            .ts|.tsx)
                suggestion="TypeScript 类型检查: /hbe:verify --types\n运行测试: /hbe:test"
                ;;
            .py)
                suggestion="Python 类型检查: mypy .\nLint 检查: ruff check"
                ;;
            .rs)
                suggestion="Cargo 检查: cargo clippy\n运行测试: cargo test"
                ;;
            .go)
                suggestion="Go vet: go vet ./...\n运行测试: go test ./..."
                ;;
        esac
    fi

    if [ -n "$suggestion" ]; then
        echo -e "${GREEN}💡 HBE 建议:${NC}"
        echo -e "$suggestion" | while read -r line; do
            echo -e "  ${BLUE}→${NC} $line"
        done
    fi
}

main "$1"
