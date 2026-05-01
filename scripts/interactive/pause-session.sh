#!/bin/bash
# 暂停交互会话

set -euo pipefail

SESSION_FILE=".interactive-state.json"

if [[ ! -f "$SESSION_FILE" ]]; then
  echo "⚠ 未找到会话文件" >&2
  exit 1
fi

# 更新状态为 paused
CURRENT_TIME=$(date -Iseconds)
tmp=$(mktemp)
jq --arg time "$CURRENT_TIME" '
  .status = "paused" |
  .updatedAt = $time |
  .checkpoint = $time
' "$SESSION_FILE" > "$tmp" && mv "$tmp" "$SESSION_FILE"

TASK=$(jq -r '.task' "$SESSION_FILE")
COMPLETED=$(jq '.completed | length' "$SESSION_FILE")
PENDING=$(jq '.pending | length' "$SESSION_FILE")

echo "⚠ 执行已暂停" >&2
echo "→ 任务: $TASK" >&2
echo "→ 已完成: $COMPLETED 步" >&2
echo "→ 待处理: $PENDING 步" >&2
echo "→ 状态保存: $SESSION_FILE" >&2
echo "→ 恢复命令: /hbe:resume" >&2
