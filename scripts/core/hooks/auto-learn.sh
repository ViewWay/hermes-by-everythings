#!/bin/bash
# Auto-Learn Hook: 会话结束时自动提取模式
# 用途：自动从会话历史中提取可复用模式，更新 memory/skills

set -euo pipefail

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MEMORY_DIR="$PROJECT_ROOT/memory"
STATS_FILE="$PROJECT_ROOT/learning-stats.json"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"; }
log_success() { echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✓ $1"; }
log_warning() { echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠ $1"; }

# 检查是否应该学习
should_learn() {
    local session_diff=$1
    if ! git diff --name-only HEAD~1 HEAD 2>/dev/null | grep -qE '\.(ts|tsx|py|rs|go|java|kt|cs|rb|php|swift|js)$'; then
        return 1
    fi
    local session_lines=$(echo "$session_diff" | wc -l)
    if [ "$session_lines" -lt 10 ]; then
        return 1
    fi
    return 0
}

# 生成 memory 文件
generate_memory() {
    local category=$1
    local description=$2
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local filename="$category-$timestamp.md"

    mkdir -p "$MEMORY_DIR/$category"

    cat > "$MEMORY_DIR/$category/$filename" <<EOF
---
name: $filename
description: $description
type: $category
created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
auto-generated: true
---

## 模式
$description

## 来源
- 会话: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
- 时间: $(date +"%Y-%m-%d %H:%M:%S")

## 状态
待人工审核
EOF

    log_success "生成 memory: $MEMORY_DIR/$category/$filename"
}

# 更新统计
update_stats() {
    local category=$1
    mkdir -p "$(dirname "$STATS_FILE")"
    
    if [ ! -f "$STATS_FILE" ]; then
        cat > "$STATS_FILE" <<'STATS_EOF'
{
  "total_sessions": 0,
  "learning_rate": 0.0,
  "error_patterns": 0,
  "success_patterns": 0,
  "user_preferences": 0,
  "project_specific": 0,
  "last_updated": null
}
STATS_EOF
    fi

    # 使用简单的文本处理更新统计
    local current_count=$(grep "\"$category\":" "$STATS_FILE" | head -1 | grep -oE '[0-9]+' || echo 0)
    local new_count=$((current_count + 1))
    local total_sessions=$(grep '"total_sessions":' "$STATS_FILE" | head -1 | grep -oE '[0-9]+' || echo 0)
    local new_total=$((total_sessions + 1))
    
    # 更新文件（简单替换）
    sed -i '' "s/\"$category\": [0-9]*/\"$category\": $new_count/" "$STATS_FILE" 2>/dev/null || \
    sed -i "s/\"$category\": [0-9]*/\"$category\": $new_count/" "$STATS_FILE"
    sed -i '' "s/\"total_sessions\": [0-9]*/\"total_sessions\": $new_total/" "$STATS_FILE" 2>/dev/null || \
    sed -i "s/\"total_sessions\": [0-9]*/\"total_sessions\": $new_total/" "$STATS_FILE"
    sed -i '' "s/\"last_updated\": null/\"last_updated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"/" "$STATS_FILE" 2>/dev/null || \
    sed -i "s/\"last_updated\": null/\"last_updated\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"/" "$STATS_FILE"

    log_success "更新统计: $STATS_FILE"
}

# 主函数
main() {
    log "=== HBE Auto-Learn ==="

    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_warning "不在 git 仓库中，跳过学习"
        exit 0
    fi

    if ! git diff --quiet HEAD 2>/dev/null; then
        log_warning "有未提交的变更，跳过学习"
        exit 0
    fi

    # 检测提交类型
    local commit_msg=$(git log --format=%s -1 2>/dev/null || echo "")
    local category=""
    
    if echo "$commit_msg" | grep -qi "fix"; then
        category="error_patterns"
    elif echo "$commit_msg" | grep -qi "feat"; then
        category="success_patterns"
    elif echo "$commit_msg" | grep -qi "refactor"; then
        category="project_specific"
    fi

    if [ -n "$category" ]; then
        generate_memory "$category" "$commit_msg"
        update_stats "$category"
    fi

    log_success "学习完成"
}

# 在后台运行
if [ "${1:-}" != "--foreground" ]; then
    main &
    exit 0
else
    main
fi
