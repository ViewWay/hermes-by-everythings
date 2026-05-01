#!/bin/bash
# Hermes-by-Everything 测试套件
# 运行所有测试

set -euo pipefail

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

log() { echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"; }
log_success() { echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} ✓ $1"; }
log_error() { echo -e "${RED}[$(date +'%H:%M:%S')]${NC} ✗ $1"; }
log_warning() { echo -e "${YELLOW}[$(date +'%H:%M:%S')]${NC} ⚠ $1"; }

# 测试计数
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 运行测试
run_test() {
    local test_name=$1
    local test_script=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    log "运行: $test_name"
    
    if bash "$test_script"; then
        log_success "$test_name 通过"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        log_error "$test_name 失败"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║       Hermes-by-Everything 测试套件                           ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# 检查测试脚本
test_scripts=(
    "test-skills.sh:技能格式测试"
    "test-agents.sh:Agent 格式测试"
    "test-hooks.sh:Hooks 测试"
    "validate-prompts.sh:Prompt 质量验证"
)

for test_entry in "${test_scripts[@]}"; do
    IFS=':' read -r script_name description <<< "$test_entry"
    test_path="$SCRIPT_DIR/$script_name"
    
    if [ -f "$test_path" ]; then
        run_test "$description" "$test_path"
    else
        log_warning "跳过: $description (脚本不存在: $script_name)"
    fi
    
    echo ""
done

# 输出汇总
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                         测试汇总                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "总测试数: $TOTAL_TESTS"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    log_success "所有测试通过！"
    exit 0
else
    log_error "有 $FAILED_TESTS 个测试失败"
    exit 1
fi
