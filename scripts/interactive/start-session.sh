#!/bin/bash
# 交互式会话启动脚本

set -euo pipefail

SESSION_FILE=".interactive-state.json"
SESSION_ID=$(date +%Y%m%d-%H%M%S)

echo "[$(date -Iseconds)] INFO: Starting interactive session" >&2
echo "Session ID: $SESSION_ID" >&2

# 检查是否有未完成的会话
if [[ -f "$SESSION_FILE" ]]; then
  echo "⚠ 发现未完成的会话" >&2
  echo "→ 使用 /hbe:resume 恢复，或删除 $SESSION_FILE 重新开始" >&2
  exit 1
fi

# 创建新会话
cat > "$SESSION_FILE" << EOS
{
  "sessionId": "$SESSION_ID",
  "task": "",
  "status": "running",
  "completed": [],
  "current": "initialization",
  "pending": [],
  "context": {
    "filesProcessed": 0,
    "filesRemaining": 0,
    "errors": [],
    "warnings": []
  },
  "createdAt": "$(date -Iseconds)",
  "updatedAt": "$(date -Iseconds)"
}
EOS

echo "✓ 会话已启动: $SESSION_ID" >&2
echo "→ 使用 /hbe:resume 恢复" >&2
