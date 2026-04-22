#!/bin/bash
# verify-loop.sh — 五阶段验证循环
# 用法: ./verify-loop.sh [--lang rust|ts|auto] [--fix]
#
# 阶段:
#   Phase 1: Build
#   Phase 2: Type Check
#   Phase 3: Lint
#   Phase 4: Test
#   Phase 5: Security

set -e

LANG="auto"
FIX=false
FAILED_PHASE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --lang) LANG="$2"; shift 2 ;;
    --fix)  FIX=true; shift ;;
    -h|--help)
      echo "用法: verify-loop.sh [--lang rust|ts|auto] [--fix]"
      echo "  --lang  指定语言（默认自动检测）"
      echo "  --fix   自动修复可修复的问题"
      exit 0 ;;
    *) shift ;;
  esac
done

# 自动检测语言
if [[ "$LANG" == "auto" ]]; then
  if [[ -f "Cargo.toml" ]]; then
    LANG="rust"
  elif [[ -f "package.json" ]]; then
    LANG="ts"
  else
    echo "❌ 无法检测项目语言，请用 --lang 指定"
    exit 1
  fi
fi

echo "========================================"
echo " 验证循环 — 语言: $LANG"
echo "========================================"
echo ""

PASS=0
FAIL=0

run_check() {
  local phase="$1"
  local cmd="$2"
  echo ">>> Phase: $phase"
  echo "    命令: $cmd"
  if eval "$cmd" > /tmp/verify-output.txt 2>&1; then
    echo "    ✅ PASS"
    PASS=$((PASS + 1))
  else
    echo "    ❌ FAIL"
    cat /tmp/verify-output.txt | tail -20
    FAIL=$((FAIL + 1))
    FAILED_PHASE="$phase"
  fi
  echo ""
}

# Phase 1: Build
if [[ "$LANG" == "rust" ]]; then
  run_check "Build" "cargo build --workspace 2>&1"
else
  run_check "Build" "npm run build 2>&1 || pnpm build 2>&1"
fi

# Phase 2: Type Check
if [[ "$LANG" == "rust" ]]; then
  run_check "Type Check" "cargo clippy -- -D warnings 2>&1"
else
  run_check "Type Check" "npx tsc --noEmit 2>&1"
fi

# Phase 3: Lint
if [[ "$LANG" == "rust" ]]; then
  run_check "Lint" "cargo fmt --check --all 2>&1"
  if $FIX; then
    cargo fmt --all 2>&1
    echo "    🔧 已自动格式化"
  fi
else
  run_check "Lint" "npx eslint . --max-warnings 0 2>&1"
  if $FIX; then
    npx eslint . --fix 2>&1
    echo "    🔧 已自动修复 lint 问题"
  fi
fi

# Phase 4: Test
if [[ "$LANG" == "rust" ]]; then
  run_check "Test" "cargo test --workspace 2>&1"
else
  run_check "Test" "npx vitest run 2>&1 || npm test 2>&1"
fi

# Phase 5: Security
echo ">>> Phase: Security"
SEC_ISSUES=0
# 检查硬编码密钥
if grep -rn "api_key\s*=\s*\"[a-zA-Z0-9]" --include="*.ts" --include="*.rs" . 2>/dev/null | grep -v node_modules | grep -v ".git" | head -5; then
  echo "    ⚠️  发现可能的硬编码密钥"
  SEC_ISSUES=$((SEC_ISSUES + 1))
fi
# 检查 console.log
if [[ "$LANG" == "ts" ]]; then
  CONSOLE_COUNT=$(grep -rn "console\.log" --include="*.ts" --include="*.tsx" src/ 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$CONSOLE_COUNT" -gt 0 ]]; then
    echo "    ⚠️  发现 $CONSOLE_COUNT 处 console.log"
    SEC_ISSUES=$((SEC_ISSUES + 1))
  fi
fi
if [[ "$SEC_ISSUES" -eq 0 ]]; then
  echo "    ✅ PASS"
  PASS=$((PASS + 1))
else
  echo "    ❌ FAIL ($SEC_ISSUES 个问题)"
  FAIL=$((FAIL + 1))
  FAILED_PHASE="Security"
fi
echo ""

# 汇总
echo "========================================"
echo " 验证结果"
echo "========================================"
echo " ✅ 通过: $PASS"
echo " ❌ 失败: $FAIL"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "🎉 全部通过！可以提交。"
  exit 0
else
  echo "❌ 验证失败 — 首个失败阶段: $FAILED_PHASE"
  echo "   修复后重新运行本脚本。"
  exit 1
fi
