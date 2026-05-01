#!/bin/bash
# Prompt 质量验证
# 验证 Agent 和 Skill 的 prompt 质量

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
log_info() { echo "ℹ $1"; }

calculate_quality_score() {
    local file=$1
    local score=0
    local max_score=100
    
    # 检查 YAML frontmatter (10 分)
    if grep -q '^---' "$file"; then
        score=$((score + 10))
    fi
    
    # 检查 name 字段 (5 分)
    if grep -q '^name:' "$file"; then
        score=$((score + 5))
    fi
    
    # 检查 description 字段 (5 分)
    if grep -q '^description:' "$file"; then
        score=$((score + 5))
    fi
    
    # 检查 When to Use 章节 (15 分)
    if grep -q '## When to Use' "$file"; then
        score=$((score + 15))
    fi
    
    # 检查 How It Works 章节 (20 分)
    if grep -q '## How It Works' "$file"; then
        score=$((score + 20))
    fi
    
    # 检查 Examples 章节 (20 分)
    if grep -q '## Examples' "$file"; then
        score=$((score + 20))
    fi
    
    # 检查 Related Skills/Agents (10 分)
    if grep -q '## Related' "$file"; then
        score=$((score + 10))
    fi
    
    # 检查 References (10 分)
    if grep -q '## References' "$file"; then
        score=$((score + 10))
    fi
    
    # 检查代码块 (5 分)
    if grep -q '```' "$file"; then
        score=$((score + 5))
    fi
    
    echo "$score"
}

validate_prompt_quality() {
    local file=$1
    local filename=$(basename "$file")
    
    local score=$(calculate_quality_score "$file")
    
    if [ $score -ge 80 ]; then
        log_success "$filename: 质量评分 $score/100"
        return 0
    elif [ $score -ge 60 ]; then
        log_error "$filename: 质量评分 $score/100 (需要改进)"
        return 1
    else
        log_error "$filename: 质量评分 $score/100 (不合格)"
        return 1
    fi
}

# 主测试函数
echo "验证 Prompt 质量..."
echo ""

LOW_QUALITY=0
TOTAL_FILES=0

# 测试所有 Agent 和 Skill 文件
for prompt_file in "$PROJECT_ROOT/references/agents"/*.md "$PROJECT_ROOT/skills"/**/*.md; do
    if [ -f "$prompt_file" ]; then
        TOTAL_FILES=$((TOTAL_FILES + 1))
        if ! validate_prompt_quality "$prompt_file"; then
            LOW_QUALITY=$((LOW_QUALITY + 1))
        fi
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "总文件数: $TOTAL_FILES"
echo "低质量文件: $LOW_QUALITY"

if [ $LOW_QUALITY -eq 0 ]; then
    log_success "所有 Prompt 质量验证通过"
    exit 0
else
    log_error "有 $LOW_QUALITY 个文件质量不足"
    exit 1
fi
