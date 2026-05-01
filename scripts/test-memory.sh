#!/bin/bash
# test-memory.sh - 测试记忆系统

set -e

echo "========================================="
echo " HBE Memory System Test"
echo "========================================="
echo ""

# 创建测试目录
MEMORY_DIR="memory"
SESSIONS_DIR="$MEMORY_DIR/sessions"
OBSERVATIONS_DIR="$MEMORY_DIR/observations"
SUMMARIES_DIR="$MEMORY_DIR/summaries"

echo "1. Creating memory directories..."
mkdir -p "$SESSIONS_DIR" "$OBSERVATIONS_DIR" "$SUMMARIES_DIR"
echo "   ✓ Directories created"
echo ""

# 测试 session-start
echo "2. Testing session-start hook..."
export HBE_SESSION_ID=""
node scripts/hooks/session-start.js
NEW_SESSION_ID=$HBE_SESSION_ID
echo "   ✓ Session started: $NEW_SESSION_ID"
echo ""

# 验证会话文件
echo "3. Verifying session file..."
if [ -f "$SESSIONS_DIR/$NEW_SESSION_ID.json" ]; then
    echo "   ✓ Session file created"
    echo "   Content:"
    cat "$SESSIONS_DIR/$NEW_SESSION_ID.json" | sed 's/^/      /'
else
    echo "   ✗ Session file not found"
    exit 1
fi
echo ""

# 创建模拟观察
echo "4. Creating test observation..."
TEST_OBS_ID="obs-test-001"
cat > "$OBSERVATIONS_DIR/$TEST_OBS_ID.json" << EOF
{
  "id": "$TEST_OBS_ID",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "type": "success",
  "tool": "Test",
  "summary": "Test observation for memory system",
  "details": {},
  "importance": "medium"
}
EOF
echo "   ✓ Test observation created"
echo ""

# 更新会话
echo "5. Updating session with observation..."
SESSION_FILE="$SESSIONS_DIR/$NEW_SESSION_ID.json"
node -e "
const fs = require('fs');
const session = JSON.parse(fs.readFileSync('$SESSION_FILE', 'utf8'));
session.observations.push('$TEST_OBS_ID');
fs.writeFileSync('$SESSION_FILE', JSON.stringify(session, null, 2));
"
echo "   ✓ Session updated"
echo ""

# 测试 session-end
echo "6. Testing session-end hook..."
export HBE_SESSION_ID="$NEW_SESSION_ID"
node scripts/hooks/session-end.js
echo "   ✓ Session ended"
echo ""

# 验证摘要
echo "7. Verifying summary file..."
SUMMARY_FILE="$SUMMARIES_DIR/$NEW_SESSION_ID.json"
if [ -f "$SUMMARY_FILE" ]; then
    echo "   ✓ Summary file created"
    echo "   Content:"
    cat "$SUMMARY_FILE" | sed 's/^/      /'
else
    echo "   ✗ Summary file not found"
    exit 1
fi
echo ""

# 验证 MEMORY.md
echo "8. Verifying MEMORY.md..."
if [ -f "MEMORY.md" ]; then
    echo "   ✓ MEMORY.md created/updated"
    echo "   Content:"
    head -30 MEMORY.md | sed 's/^/      /'
else
    echo "   ✗ MEMORY.md not found"
    exit 1
fi
echo ""

echo "========================================="
echo " All tests passed! ✓"
echo "========================================="
echo ""
echo "Memory system is ready to use."
echo ""
echo "Next steps:"
echo "  1. Restart Claude Code to activate hooks"
echo "  2. Check memory/ directory for stored data"
echo "  3. Review MEMORY.md for project memory"
echo ""
