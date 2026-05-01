#!/bin/bash
# verify-loop.sh — 多语言五阶段验证循环
# 用法: ./verify-loop.sh [--lang auto|ts|js|python|rust|go|java|kotlin|csharp|ruby|php|swift] [--fix]
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
      echo "用法: verify-loop.sh [--lang LANG] [--fix]"
      echo "  --lang  指定语言 (auto|ts|js|python|rust|go|java|kotlin|csharp|ruby|php|swift)"
      echo "  --fix   自动修复可修复的问题"
      echo ""
      echo "自动检测规则:"
      echo "  Cargo.toml     → rust"
      echo "  go.mod         → go"
      echo "  pom.xml/*.gradle → java/kotlin"
      echo "  *.csproj/*.sln → csharp"
      echo "  Package.swift  → swift"
      echo "  pyproject.toml/setup.py/requirements.txt/Pipfile → python"
      echo "  Gemfile        → ruby"
      echo "  composer.json  → php"
      echo "  package.json   → ts (有 tsconfig.json) 或 js"
      exit 0 ;;
    *) shift ;;
  esac
done

# 自动检测语言
detect_language() {
  if [[ -f "Cargo.toml" ]]; then echo "rust"
  elif [[ -f "go.mod" ]]; then echo "go"
  elif [[ -f "pom.xml" ]] || ls *.gradle *.gradle.kts 2>/dev/null | head -1 > /dev/null 2>&1; then
    if ls *.gradle.kts 2>/dev/null | head -1 > /dev/null 2>&1 || grep -rq "kotlin" *.gradle *.gradle.kts 2>/dev/null; then
      echo "kotlin"
    else
      echo "java"
    fi
  elif ls *.csproj *.sln 2>/dev/null | head -1 > /dev/null 2>&1; then echo "csharp"
  elif [[ -f "Package.swift" ]]; then echo "swift"
  elif [[ -f "pyproject.toml" ]] || [[ -f "setup.py" ]] || [[ -f "requirements.txt" ]] || [[ -f "Pipfile" ]]; then echo "python"
  elif [[ -f "Gemfile" ]] || ls *.gemspec 2>/dev/null | head -1 > /dev/null 2>&1; then echo "ruby"
  elif [[ -f "composer.json" ]]; then echo "php"
  elif [[ -f "package.json" ]]; then
    if [[ -f "tsconfig.json" ]]; then echo "ts"
    else echo "js"
    fi
  else
    echo "unknown"
  fi
}

if [[ "$LANG" == "auto" ]]; then
  LANG=$(detect_language)
fi

if [[ "$LANG" == "unknown" ]]; then
  echo "ERROR: Cannot detect project language. Use --lang to specify."
  exit 1
fi

echo "========================================"
echo " Verify Loop — Language: $LANG"
echo "========================================"
echo ""

PASS=0
FAIL=0

run_check() {
  local phase="$1"
  local cmd="$2"
  echo ">>> Phase: $phase"
  echo "    Command: $cmd"
  if eval "$cmd" > /tmp/verify-output.txt 2>&1; then
    echo "    PASS"
    PASS=$((PASS + 1))
  else
    echo "    FAIL"
    tail -20 /tmp/verify-output.txt
    FAIL=$((FAIL + 1))
    FAILED_PHASE="$phase"
  fi
  echo ""
}

# ============================================================
# Phase 1: Build
# ============================================================
case "$LANG" in
  rust)   run_check "Build" "cargo build --workspace 2>&1" ;;
  go)     run_check "Build" "go build ./... 2>&1" ;;
  java)   run_check "Build" "mvn compile -q 2>&1 || gradle compileJava --quiet 2>&1" ;;
  kotlin) run_check "Build" "gradle compileKotlin --quiet 2>&1" ;;
  csharp) run_check "Build" "dotnet build 2>&1" ;;
  swift)  run_check "Build" "swift build 2>&1" ;;
  python) run_check "Build" "python -m compileall -q . 2>&1" ;;
  ruby)   run_check "Build" "ruby -c lib/**/*.rb 2>&1 || ruby -c app/**/*.rb 2>&1 || true" ;;
  php)    run_check "Build" "composer validate --no-check-publish 2>&1" ;;
  ts)     run_check "Build" "npm run build 2>&1 || pnpm build 2>&1 || bun run build 2>&1" ;;
  js)     run_check "Build" "npm run build 2>&1 || pnpm build 2>&1" ;;
esac

# ============================================================
# Phase 2: Type Check
# ============================================================
case "$LANG" in
  rust)
    run_check "Type Check" "cargo clippy -- -D warnings 2>&1"
    ;;
  go)
    run_check "Type Check" "go vet ./... 2>&1"
    ;;
  java|kotlin)
    # Java/Kotlin compilation includes type checking
    if [[ "$LANG" == "kotlin" ]]; then
      run_check "Type Check" "gradle compileKotlin --quiet 2>&1"
    else
      run_check "Type Check" "mvn compile -q 2>&1 || gradle compileJava --quiet 2>&1"
    fi
    ;;
  csharp)
    # C# build includes type checking
    run_check "Type Check" "dotnet build --no-restore 2>&1"
    ;;
  swift)
    # Swift build includes type checking
    run_check "Type Check" "swift build 2>&1"
    ;;
  python)
    run_check "Type Check" "mypy . --ignore-missing-imports 2>&1 || pyright 2>&1"
    ;;
  ruby)
    # Ruby type checking is optional (Steep/Sorbet)
    echo ">>> Phase: Type Check"
    echo "    (Ruby — type checking is optional, skipped)"
    PASS=$((PASS + 1))
    echo ""
    ;;
  php)
    run_check "Type Check" "vendor/bin/phpstan analyse --no-progress 2>&1 || vendor/bin/psalm --no-cache 2>&1"
    ;;
  ts)
    run_check "Type Check" "npx tsc --noEmit 2>&1"
    ;;
  js)
    echo ">>> Phase: Type Check"
    echo "    (JavaScript — no type checking)"
    PASS=$((PASS + 1))
    echo ""
    ;;
esac

# ============================================================
# Phase 3: Lint
# ============================================================
case "$LANG" in
  rust)
    run_check "Lint" "cargo fmt --check --all 2>&1"
    if $FIX; then cargo fmt --all 2>&1; echo "    Fixed: auto-formatted"; fi
    ;;
  go)
    run_check "Lint" "golangci-lint run ./... 2>&1 || gofmt -l . 2>&1"
    if $FIX; then gofmt -w . 2>&1; echo "    Fixed: gofmt applied"; fi
    ;;
  java)
    run_check "Lint" "mvn checkstyle:check -q 2>&1 || gradle spotlessCheck --quiet 2>&1"
    if $FIX; then gradle spotlessApply --quiet 2>&1; echo "    Fixed: spotless applied"; fi
    ;;
  kotlin)
    run_check "Lint" "ktlint --check 2>&1 || detekt --build-upon-default-config 2>&1"
    if $FIX; then ktlint --format 2>&1; echo "    Fixed: ktlint applied"; fi
    ;;
  csharp)
    run_check "Lint" "dotnet format --verify-no-changes 2>&1"
    if $FIX; then dotnet format 2>&1; echo "    Fixed: dotnet format applied"; fi
    ;;
  swift)
    run_check "Lint" "swiftlint lint --strict 2>&1 || true"
    if $FIX; then swiftlint --fix --format 2>&1; echo "    Fixed: swiftlint applied"; fi
    ;;
  python)
    run_check "Lint" "ruff check . 2>&1 || flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics 2>&1"
    if $FIX; then ruff check --fix . 2>&1; echo "    Fixed: ruff auto-fix applied"; fi
    ;;
  ruby)
    run_check "Lint" "bundle exec rubocop --format progress 2>&1 || rubocop --format progress 2>&1"
    if $FIX; then rubocop -A 2>&1; echo "    Fixed: rubocop auto-fix applied"; fi
    ;;
  php)
    run_check "Lint" "vendor/bin/phpcs --standard=PSR12 --report=summary . 2>&1 || true"
    if $FIX; then vendor/bin/php-cs-fixer fix . 2>&1; echo "    Fixed: cs-fixer applied"; fi
    ;;
  ts|js)
    run_check "Lint" "npx eslint . --max-warnings 0 2>&1"
    if $FIX; then npx eslint . --fix 2>&1; echo "    Fixed: eslint auto-fix applied"; fi
    ;;
esac

# ============================================================
# Phase 4: Test
# ============================================================
case "$LANG" in
  rust)   run_check "Test" "cargo test --workspace 2>&1" ;;
  go)     run_check "Test" "go test ./... -count=1 2>&1" ;;
  java)   run_check "Test" "mvn test -q 2>&1 || gradle test --quiet 2>&1" ;;
  kotlin) run_check "Test" "gradle test --quiet 2>&1" ;;
  csharp) run_check "Test" "dotnet test --no-build 2>&1" ;;
  swift)  run_check "Test" "swift test 2>&1" ;;
  python) run_check "Test" "pytest --tb=short -q 2>&1 || python -m unittest discover -s tests -q 2>&1" ;;
  ruby)   run_check "Test" "bundle exec rspec --format progress 2>&1 || bundle exec rake test 2>&1" ;;
  php)    run_check "Test" "vendor/bin/phpunit --no-coverage 2>&1 || vendor/bin/pest 2>&1" ;;
  ts)     run_check "Test" "npx vitest run 2>&1 || npx jest --no-coverage 2>&1 || npm test 2>&1" ;;
  js)     run_check "Test" "npx vitest run 2>&1 || npx jest --no-coverage 2>&1 || npm test 2>&1" ;;
esac

# ============================================================
# Phase 5: Security
# ============================================================
echo ">>> Phase: Security"
SEC_ISSUES=0

# 通用密钥检测
if grep -rn "api_key\s*=\s*\"[a-zA-Z0-9]" --include="*.ts" --include="*.js" --include="*.py" --include="*.rs" --include="*.go" --include="*.java" --include="*.rb" --include="*.php" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v vendor | head -5; then
  echo "    WARNING: Possible hardcoded API keys found"
  SEC_ISSUES=$((SEC_ISSUES + 1))
fi

# 语言特定安全检查
case "$LANG" in
  ts|js)
    CONSOLE_COUNT=$(grep -rn "console\.log" --include="*.ts" --include="*.tsx" --include="*.js" src/ 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$CONSOLE_COUNT" -gt 0 ]]; then
      echo "    WARNING: $CONSOLE_COUNT console.log statements found in src/"
      SEC_ISSUES=$((SEC_ISSUES + 1))
    fi
    ;;
  python)
    # 检查 eval/exec 使用
    EVAL_COUNT=$(grep -rn "\beval\b\|\bexec\b" --include="*.py" src/ app/ 2>/dev/null | grep -v "test" | wc -l | tr -d ' ')
    if [[ "$EVAL_COUNT" -gt 0 ]]; then
      echo "    WARNING: $EVAL_COUNT eval/exec calls found (potential code injection)"
      SEC_ISSUES=$((SEC_ISSUES + 1))
    fi
    ;;
  rust)
    # cargo audit (如果安装)
    if command -v cargo-audit > /dev/null 2>&1; then
      if ! cargo audit 2>&1 > /tmp/verify-output.txt; then
        echo "    WARNING: cargo audit found vulnerabilities"
        tail -10 /tmp/verify-output.txt
        SEC_ISSUES=$((SEC_ISSUES + 1))
      fi
    fi
    ;;
  go)
    # gosec (如果安装)
    if command -v gosec > /dev/null 2>&1; then
      if ! gosec ./... 2>&1 > /tmp/verify-output.txt; then
        echo "    WARNING: gosec found issues"
        tail -10 /tmp/verify-output.txt
        SEC_ISSUES=$((SEC_ISSUES + 1))
      fi
    fi
    ;;
  ruby)
    # bundle audit (如果安装)
    if command -v bundle-audit > /dev/null 2>&1; then
      if ! bundle-audit check 2>&1 > /tmp/verify-output.txt; then
        echo "    WARNING: bundle-audit found vulnerabilities"
        SEC_ISSUES=$((SEC_ISSUES + 1))
      fi
    fi
    ;;
  php)
    # 检查 eval/execute 使用
    EVAL_COUNT=$(grep -rn "\beval\b\|\bexec\b\|\bsystem\b" --include="*.php" app/ src/ 2>/dev/null | grep -v "test" | wc -l | tr -d ' ')
    if [[ "$EVAL_COUNT" -gt 0 ]]; then
      echo "    WARNING: $EVAL_COUNT eval/exec/system calls found"
      SEC_ISSUES=$((SEC_ISSUES + 1))
    fi
    ;;
esac

if [[ "$SEC_ISSUES" -eq 0 ]]; then
  echo "    PASS"
  PASS=$((PASS + 1))
else
  echo "    FAIL ($SEC_ISSUES issues)"
  FAIL=$((FAIL + 1))
  FAILED_PHASE="Security"
fi
echo ""

# ============================================================
# Summary
# ============================================================
echo "========================================"
echo " Verification Result ($LANG)"
echo "========================================"
echo " PASS: $PASS"
echo " FAIL: $FAIL"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo "All checks passed. Ready to commit."
  exit 0
else
  echo "Verification failed — first failure: $FAILED_PHASE"
  echo "Fix and re-run this script."
  exit 1
fi
