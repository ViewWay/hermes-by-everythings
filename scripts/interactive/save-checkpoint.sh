#!/bin/bash
# 保存交互会话检查点

set -euo pipefail

SESSION_FILE=".interactive-state.json"

if [[ ! -f "$SESSION_FILE" ]]; then
  echo "⚠ 未找到会话文件" >&2
  exit 1
fi

# 更新检查点时间
CURRENT_TIME=$(date -Iseconds)
tmp=$(mktemp)
jq --arg time "$CURRENT_TIME" '
  .checkpoint = $time |
  .updatedAt = $time
' "$SESSION_FILE" > "$tmp" && mv "$tmp" "$SESSION_FILE"

echo "[$(date -Iseconds)] CHECKPOINT: 保存成功" >&2
