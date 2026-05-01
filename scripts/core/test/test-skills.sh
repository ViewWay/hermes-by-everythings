#!/bin/bash
# Skills 格式测试
# 验证所有技能文件符合格式规范

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

ERRORS=0
WARNINGS=0

# 检查 YAML frontmatter
check_yaml_frontmatter() {
    local file=$1
    
    if ! grep -q '^---' "$file"; then
        log_error "$file: 缺少 YAML frontmatter"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
    
    # 检查必需字段
    required_fields=("name" "description" "version" "status")
    for field in "${required_fields[@]}"; do
        if ! grep -q "^$field:" "$file"; then
            log_error "$file: 缺少必需字段 '$field'"
            ERRORS=$((ERRORS + 1))
        fi
    done
}

# 检查必需章节
check_required_sections() {
    local file=$1
    
    required_sections=("## When to Use" "## How It Works" "## Examples")
    for section in "${required_sections[@]}"; do
        if ! grep -q "$section" "$file"; then
            log_warning "$file: 缺少章节 '$section'"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
}

# 检查状态有效性
check_status_valid() {
    local file=$1
    
    local status=$(grep "^status:" "$file" | cut -d':' -f2 | xargs)
    valid_statuses=("active" "experimental" "deprecated")
    
    if [[ ! " ${valid_statuses[@]} " =~ " ${status} " ]]; then
        log_error "$file: 无效的 status '$status' (必须是: ${valid_statuses[*]})"
        ERRORS=$((ERRORS + 1))
    fi
}

# 主测试函数
test_skill_file() {
    local skill_file=$1
    
    check_yaml_frontmatter "$skill_file"
    check_required_sections "$skill_file"
    check_status_valid "$skill_file"
}

# 查找所有技能文件
echo "测试 Skills 格式..."
echo ""

# 测试 references/agents/*.md
if [ -d "$PROJECT_ROOT/references/agents" ]; then
    for agent_file in "$PROJECT_ROOT/references/agents"/*.md; do
        if [ -f "$agent_file" ]; then
            test_skill_file "$agent_file"
        fi
    done
fi

# 测试 skills/active/**/*.md
if [ -d "$PROJECT_ROOT/skills/active" ]; then
    while IFS= read -r -d '' skill_file; do
        test_skill_file "$skill_file"
    done < <(find "$PROJECT_ROOT/skills/active" -name "*.md" -print0)
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "错误: $ERRORS"
echo "警告: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
    log_success "所有 Skills 格式测试通过"
    exit 0
else
    log_error "有 $ERRORS 个错误"
    exit 1
fi
