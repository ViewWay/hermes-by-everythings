#!/bin/bash
# validate-prompts.sh — 验证 skill prompt 质量
# 用法: ./validate-prompts.sh [--verbose] [--fix]
#
# 检查项:
#   1. 文件完整性 — 所有引用的文件存在
#   2. 结构规范 — 每个 agent prompt 包含必需章节
#   3. 质量评分 — prompt 包含决策框架、示例、反模式、自我修正
#   4. 交叉引用 — SKILL.md 引用与实际文件一致
#   5. 一致性 — 命名、格式、术语统一

set -e

VERBOSE=false
FIX=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --verbose|-v) VERBOSE=true; shift ;;
    --fix) FIX=true; shift ;;
    -h|--help)
      echo "用法: validate-prompts.sh [--verbose] [--fix]"
      echo "  --verbose  详细输出"
      echo "  --fix      生成修复建议文件"
      exit 0 ;;
    *) shift ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

PASS=0
FAIL=0
WARN=0
ISSUES=""

log_pass() {
  PASS=$((PASS + 1))
  if $VERBOSE; then echo "  ✅ $1"; fi
}

log_fail() {
  FAIL=$((FAIL + 1))
  echo "  ❌ $1"
  ISSUES="${ISSUES}\n❌ $1"
}

log_warn() {
  WARN=$((WARN + 1))
  if $VERBOSE; then echo "  ⚠️  $1"; fi
  ISSUES="${ISSUES}\n⚠️  $1"
}

# ============================================================
# 1. 文件完整性检查
# ============================================================
echo "========================================="
echo " 1. 文件完整性"
echo "========================================="

# 检查 SKILL.md 存在
if [[ -f "$PROJECT_DIR/SKILL.md" ]]; then
  log_pass "SKILL.md 存在"
else
  log_fail "SKILL.md 缺失"
fi

# 检查所有 9 个 agent 文件存在
AGENT_FILES=(
  "planner"
  "architect"
  "code-reviewer"
  "security-reviewer"
  "tdd-guide"
  "build-error-resolver"
  "e2e-runner"
  "refactor-cleaner"
  "doc-updater"
)

for agent in "${AGENT_FILES[@]}"; do
  FILE="$PROJECT_DIR/references/agents/${agent}.md"
  if [[ -f "$FILE" ]]; then
    log_pass "agent/${agent}.md 存在"
  else
    log_fail "agent/${agent}.md 缺失"
  fi
done

# 检查 rules 文件
RULE_FILES=(
  "agent-orchestration"
  "coding-style"
  "git-workflow"
  "hooks"
  "patterns"
  "performance"
  "security"
  "testing"
)

for rule in "${RULE_FILES[@]}"; do
  FILE="$PROJECT_DIR/references/rules/${rule}.md"
  if [[ -f "$FILE" ]]; then
    log_pass "rules/${rule}.md 存在"
  else
    log_fail "rules/${rule}.md 缺失"
  fi
done

# 检查模板和脚本
for file in "templates/prd-json.json" "templates/progress.md" "scripts/verify-loop.sh"; do
  if [[ -f "$PROJECT_DIR/$file" ]]; then
    log_pass "$file 存在"
  else
    log_fail "$file 缺失"
  fi
done

echo ""

# ============================================================
# 2. Agent Prompt 结构检查
# ============================================================
echo "========================================="
echo " 2. Agent Prompt 结构"
echo "========================================="

# 每个 agent 应包含的必需章节
# 每个 section: "pattern1|pattern2" — 匹配任一即通过
REQUIRED_SECTIONS=(
  "专家"                              # 角色定义
  "职责|核心原则|审查维度|核心职责"      # Responsibilities
  "决策|方法选择|策略选择|判断|优先级"   # Decision framework
  "反模式|常见错误|危险模式"            # Anti-patterns
  "自我修正|自我纠正"                   # Self-correction
  "输出格式"                           # Output format
  "Handoff"                            # Handoff context
)

SECTION_NAMES=("角色定义" "职责" "决策框架" "反模式" "自我修正" "输出格式" "Handoff")

for agent in "${AGENT_FILES[@]}"; do
  FILE="$PROJECT_DIR/references/agents/${agent}.md"
  if [[ ! -f "$FILE" ]]; then continue; fi

  CONTENT=$(cat "$FILE")
  LINE_COUNT=$(wc -l < "$FILE" | tr -d ' ')

  # 检查行数（太短说明内容不充分）
  if [[ "$LINE_COUNT" -lt 50 ]]; then
    log_warn "agent/${agent}.md 只有 ${LINE_COUNT} 行（建议 >= 100 行）"
  else
    log_pass "agent/${agent}.md 有 ${LINE_COUNT} 行"
  fi

  # 检查必需章节
  for i in "${!REQUIRED_SECTIONS[@]}"; do
    pattern="${REQUIRED_SECTIONS[$i]}"
    name="${SECTION_NAMES[$i]}"
    # Use grep -E with pipe alternation; split on | and check each
    found=false
    IFS='|' read -ra PATS <<< "$pattern"
    for pat in "${PATS[@]}"; do
      if echo "$CONTENT" | grep -q -- "$pat"; then
        found=true
        break
      fi
    done
    if $found; then
      log_pass "${agent}: 包含 ${name}"
    else
      log_fail "${agent}: 缺少 ${name}"
    fi
  done

  # 检查代码示例
  EXAMPLE_COUNT=$(echo "$CONTENT" | grep -c '```' || true)
  if [[ "$EXAMPLE_COUNT" -ge 4 ]]; then
    log_pass "${agent}: 有 $((EXAMPLE_COUNT / 2)) 个代码示例"
  else
    log_warn "${agent}: 只有 $((EXAMPLE_COUNT / 2)) 个代码示例（建议 >= 3 个）"
  fi
done

echo ""

# ============================================================
# 3. Prompt 质量评分
# ============================================================
echo "========================================="
echo " 3. Prompt 质量评分"
echo "========================================="

QUALITY_KEYWORDS=(
  "边界"                # Edge cases
  "错误处理"            # Error handling
  "安全"                # Security awareness
  "验证"                # Verification
  "修复"                # Remediation
  "测试"                # Testing
  "依赖"                # Dependencies
)

for agent in "${AGENT_FILES[@]}"; do
  FILE="$PROJECT_DIR/references/agents/${agent}.md"
  if [[ ! -f "$FILE" ]]; then continue; fi

  CONTENT=$(cat "$FILE")
  SCORE=0
  MAX=${#QUALITY_KEYWORDS[@]}

  for keyword in "${QUALITY_KEYWORDS[@]}"; do
    if echo "$CONTENT" | grep -q "$keyword"; then
      SCORE=$((SCORE + 1))
    fi
  done

  PERCENTAGE=$((SCORE * 100 / MAX))

  if [[ "$PERCENTAGE" -ge 70 ]]; then
    log_pass "${agent}: 质量评分 ${SCORE}/${MAX} (${PERCENTAGE}%)"
  elif [[ "$PERCENTAGE" -ge 40 ]]; then
    log_warn "${agent}: 质量评分 ${SCORE}/${MAX} (${PERCENTAGE}%)"
  else
    log_fail "${agent}: 质量评分 ${SCORE}/${MAX} (${PERCENTAGE}%) — 需要改进"
  fi
done

echo ""

# ============================================================
# 4. 交叉引用一致性
# ============================================================
echo "========================================="
echo " 4. 交叉引用一致性"
echo="========================================="

SKILL_CONTENT=$(cat "$PROJECT_DIR/SKILL.md")

# 检查 SKILL.md 中引用的 agent 文件都存在
for agent in "${AGENT_FILES[@]}"; do
  if echo "$SKILL_CONTENT" | grep -q "agents/${agent}.md\|${agent}"; then
    log_pass "SKILL.md 正确引用 ${agent}"
  else
    log_warn "SKILL.md 未引用 ${agent}"
  fi
done

# 检查 orchestration.md 引用的 agent 都存在
ORCH_FILE="$PROJECT_DIR/references/orchestration.md"
if [[ -f "$ORCH_FILE" ]]; then
  ORCH_CONTENT=$(cat "$ORCH_FILE")
  for agent in "${AGENT_FILES[@]}"; do
    if echo "$ORCH_CONTENT" | grep -q "$agent"; then
      log_pass "orchestration.md 引用 ${agent}"
    fi
  done
fi

echo ""

# ============================================================
# 5. SKILL.md 规范检查
# ============================================================
echo "========================================="
echo " 5. SKILL.md 规范"
echo "========================================="

if echo "$SKILL_CONTENT" | grep -q "^name:"; then
  log_pass "SKILL.md 包含 name 字段"
else
  log_fail "SKILL.md 缺少 name 字段"
fi

if echo "$SKILL_CONTENT" | grep -q "^version:"; then
  log_pass "SKILL.md 包含 version 字段"
else
  log_fail "SKILL.md 缺少 version 字段"
fi

if echo "$SKILL_CONTENT" | grep -q "^trigger:"; then
  log_pass "SKILL.md 包含 trigger 字段"
else
  log_fail "SKILL.md 缺少 trigger 字段"
fi

# 检查所有命令都有对应的详细流程
# 只匹配 SKILL.md 中有明确定义的命令（从命令表中提取）
COMMANDS=$(echo "$SKILL_CONTENT" | grep -oE '/hbe:[a-z]+' | sort -u | grep -v '/hbe:e$' | grep -v '/hbe:xxx$')
for cmd in $COMMANDS; do
  cmd_name=$(echo "$cmd" | sed 's/\/hbe://')
  if echo "$SKILL_CONTENT" | grep -q "### ${cmd} "; then
    log_pass "${cmd} 有详细流程定义"
  else
    log_warn "${cmd} 缺少详细流程定义"
  fi
done

echo ""

# ============================================================
# 汇总
# ============================================================
echo "========================================="
echo " 验证结果汇总"
echo "========================================="
echo " ✅ 通过: $PASS"
echo " ⚠️  警告: $WARN"
echo " ❌ 失败: $FAIL"
echo ""

if [[ "$FAIL" -eq 0 && "$WARN" -eq 0 ]]; then
  echo "🎉 全部检查通过！"
  exit 0
elif [[ "$FAIL" -eq 0 ]]; then
  echo "⚠️  有 $WARN 个警告，建议修复。"
  exit 0
else
  echo "❌ 有 $FAIL 个失败项需要修复:"
  echo -e "$ISSUES"
  exit 1
fi
