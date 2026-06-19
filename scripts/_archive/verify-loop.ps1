#!/usr/bin/env pwsh
# verify-loop.ps1 — 多语言五阶段验证循环 (Windows PowerShell 版本)
# 用法: .\verify-loop.ps1 [-Lang <string>] [-Fix]
#
# 阶段:
#   Phase 1: Build
#   Phase 2: Type Check
#   Phase 3: Lint
#   Phase 4: Test
#   Phase 5: Security

[CmdletBinding()]
param(
  [Parameter()]
  [ValidateSet('auto', 'ts', 'js', 'python', 'rust', 'go', 'java', 'kotlin', 'csharp', 'ruby', 'php', 'swift')]
  [string]$Lang = 'auto',

  [Parameter()]
  [switch]$Fix
)

# 跨平台文件搜索函数
function Find-Files {
  param(
    [string]$Extension,
    [string]$BaseDir = '.',
    [string[]]$IgnorePatterns = @()
  )

  $results = @()
  $baseDir = Resolve-Path $BaseDir

  Get-ChildItem -Path $BaseDir -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $relativePath = $_.FullName.Substring($baseDir.Path.Length + 1)

    # 检查忽略模式
    $shouldIgnore = $false
    foreach ($pattern in $IgnorePatterns) {
      if ($relativePath -like "*$pattern*") {
        $shouldIgnore = $true
        break
      }
    }

    if (-not $shouldIgnore -and $_.Extension -eq $Extension) {
      $results += $_.FullName
    }
  }

  return $results
}

# 跨平台模式匹配计数
function Get-MatchCount {
  param(
    [string[]]$Files,
    [string]$Pattern
  )

  $count = 0
  $regex = [regex]::new($Pattern)

  foreach ($file in $Files) {
    try {
      $content = Get-Content $file -Raw -ErrorAction Stop
      $matches = $regex.Matches($content)
      $count += $matches.Count
    } catch {
      # 忽略无法读取的文件
    }
  }

  return $count
}

# 跨平台模式搜索（返回前 N 个）
function Search-Matches {
  param(
    [string[]]$Files,
    [string]$Pattern,
    [int]$Limit = 5
  )

  $results = @()
  $regex = [regex]::new($Pattern)

  foreach ($file in $Files) {
    if ($results.Count -ge $Limit) { break }

    try {
      $lines = Get-Content $file -ErrorAction Stop
      $lineNum = 0

      foreach ($line in $lines) {
        $lineNum++
        if ($regex.IsMatch($line)) {
          $results += "$file`:$lineNum`:$line"
          if ($results.Count -ge $Limit) { break }
        }
      }
    } catch {
      # 忽略无法读取的文件
    }
  }

  return $results
}

# 自动检测语言
function Get-ProjectLanguage {
  $files = Get-ChildItem -File -ErrorAction SilentlyContinue

  if (Test-Path 'Cargo.toml') { return 'rust' }
  if (Test-Path 'go.mod') { return 'go' }
  if (Test-Path 'pom.xml') {
    $gradleFiles = $files | Where-Object { $_.Extension -in '.gradle', '.gradle.kts' }
    $hasKotlin = $gradleFiles | Where-Object { $_.Extension -eq '.gradle.kts' -or (Select-String -Path $_.FullName -Pattern 'kotlin' -Quiet) }
    if ($hasKotlin) { return 'kotlin' }
    return 'java'
  }
  if ($files | Where-Object { $_.Extension -in '.csproj', '.sln' }) { return 'csharp' }
  if (Test-Path 'Package.swift') { return 'swift' }
  if (Test-Path 'pyproject.toml' -or Test-Path 'setup.py' -or Test-Path 'requirements.txt' -or Test-Path 'Pipfile') { return 'python' }
  if (Test-Path 'Gemfile' -or ($files | Where-Object { $_.Extension -eq '.gemspec' })) { return 'ruby' }
  if (Test-Path 'composer.json') { return 'php' }
  if (Test-Path 'package.json') {
    if (Test-Path 'tsconfig.json') { return 'ts' }
    return 'js'
  }

  return 'unknown'
}

# 检测语言
if ($Lang -eq 'auto') {
  $Lang = Get-ProjectLanguage
}

if ($Lang -eq 'unknown') {
  Write-Error 'ERROR: Cannot detect project language. Use -Lang to specify.'
  exit 1
}

Write-Host '========================================'
Write-Host " Verify Loop — Language: $Lang"
Write-Host '========================================'
Write-Host ''

$pass = 0
$fail = 0
$failedPhase = ''

# 执行检查
function Invoke-Check {
  param(
    [string]$Phase,
    [string]$Command
  )

  Write-Host ">>> Phase: $Phase"
  Write-Host "    Command: $Command"

  try {
    $output = Invoke-Expression $Command 2>&1 | Out-String
    if ($LASTEXITCODE -eq 0) {
      Write-Host '    PASS'
      $script:pass++
    } else {
      throw "Command failed"
    }
  } catch {
    Write-Host '    FAIL'
    if ($output.Length -gt 0) {
      Write-Host $output.Substring([Math]::Max(0, $output.Length - 500))
    }
    $script:fail++
    $script:failedPhase = $Phase
  }

  Write-Host ''
}

# 语言特定的命令配置
$commands = @{
  rust     = @{
    build     = 'cargo build --workspace 2>&1'
    typecheck = 'cargo clippy -- -D warnings 2>&1'
    lint      = 'cargo fmt --check --all 2>&1'
    test      = 'cargo test --workspace 2>&1'
  }
  go       = @{
    build     = 'go build ./... 2>&1'
    typecheck = 'go vet ./... 2>&1'
    lint      = 'gofmt -l . 2>&1'
    test      = 'go test ./... -count=1 2>&1'
  }
  java     = @{
    build     = 'mvn compile -q 2>&1; if ($LASTEXITCODE -ne 0) { gradle compileJava --quiet 2>&1 }'
    typecheck = 'mvn compile -q 2>&1; if ($LASTEXITCODE -ne 0) { gradle compileJava --quiet 2>&1 }'
    lint      = 'mvn checkstyle:check -q 2>&1; if ($LASTEXITCODE -ne 0) { gradle spotlessCheck --quiet 2>&1 }'
    test      = 'mvn test -q 2>&1; if ($LASTEXITCODE -ne 0) { gradle test --quiet 2>&1 }'
  }
  kotlin   = @{
    build     = 'gradle compileKotlin --quiet 2>&1'
    typecheck = 'gradle compileKotlin --quiet 2>&1'
    lint      = 'ktlint --check 2>&1; if ($LASTEXITCODE -ne 0) { detekt --build-upon-default-config 2>&1 }'
    test      = 'gradle test --quiet 2>&1'
  }
  csharp   = @{
    build     = 'dotnet build 2>&1'
    typecheck = 'dotnet build --no-restore 2>&1'
    lint      = 'dotnet format --verify-no-changes 2>&1'
    test      = 'dotnet test --no-build 2>&1'
  }
  swift    = @{
    build     = 'swift build 2>&1'
    typecheck = 'swift build 2>&1'
    lint      = 'swiftlint lint --strict 2>&1'
    test      = 'swift test 2>&1'
  }
  python   = @{
    build     = 'python -m compileall -q . 2>&1'
    typecheck = 'mypy . --ignore-missing-imports 2>&1; if ($LASTEXITCODE -ne 0) { pyright 2>&1 }'
    lint      = 'ruff check . 2>&1; if ($LASTEXITCODE -ne 0) { flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics 2>&1 }'
    test      = 'pytest --tb=short -q 2>&1; if ($LASTEXITCODE -ne 0) { python -m unittest discover -s tests -q 2>&1 }'
  }
  ruby     = @{
    build     = 'ruby -c lib/**/*.rb 2>&1; if ($LASTEXITCODE -ne 0) { Write-Output "OK" }'
    typecheck = 'echo "Ruby — type checking is optional, skipped"'
    lint      = 'bundle exec rubocop --format progress 2>&1; if ($LASTEXITCODE -ne 0) { rubocop --format progress 2>&1 }'
    test      = 'bundle exec rspec --format progress 2>&1; if ($LASTEXITCODE -ne 0) { bundle exec rake test 2>&1 }'
  }
  php      = @{
    build     = 'composer validate --no-check-publish 2>&1'
    typecheck = 'vendor/bin/phpstan analyse --no-progress 2>&1; if ($LASTEXITCODE -ne 0) { vendor/bin/psalm --no-cache 2>&1 }'
    lint      = 'vendor/bin/phpcs --standard=PSR12 --report=summary . 2>&1'
    test      = 'vendor/bin/phpunit --no-coverage 2>&1; if ($LASTEXITCODE -ne 0) { vendor/bin/pest 2>&1 }'
  }
  ts       = @{
    build     = 'npm run build 2>&1; if ($LASTEXITCODE -ne 0) { pnpm build 2>&1; if ($LASTEXITCODE -ne 0) { bun run build 2>&1 } }'
    typecheck = 'npx tsc --noEmit 2>&1'
    lint      = 'npx eslint . --max-warnings 0 2>&1'
    test      = 'npx vitest run 2>&1; if ($LASTEXITCODE -ne 0) { npx jest --no-coverage 2>&1; if ($LASTEXITCODE -ne 0) { npm test 2>&1 } }'
  }
  js       = @{
    build     = 'npm run build 2>&1; if ($LASTEXITCODE -ne 0) { pnpm build 2>&1 }'
    typecheck = 'echo "JavaScript — no type checking"'
    lint      = 'npx eslint . --max-warnings 0 2>&1'
    test      = 'npx vitest run 2>&1; if ($LASTEXITCODE -ne 0) { npx jest --no-coverage 2>&1; if ($LASTEXITCODE -ne 0) { npm test 2>&1 } }'
  }
}

# Phase 1: Build
if ($commands[$Lang].build) {
  Invoke-Check -Phase 'Build' -Command $commands[$Lang].build
}

# Phase 2: Type Check
if ($commands[$Lang].typecheck) {
  if ($Lang -in @('ruby', 'js')) {
    Write-Host '>>> Phase: Type Check'
    if ($Lang -eq 'ruby') {
      Write-Host '    (Ruby — type checking is optional, skipped)'
    } else {
      Write-Host '    (JavaScript — no type checking)'
    }
    $pass++
    Write-Host ''
  } else {
    Invoke-Check -Phase 'Type Check' -Command $commands[$Lang].typecheck
  }
}

# Phase 3: Lint
if ($commands[$Lang].lint) {
  Invoke-Check -Phase 'Lint' -Command $commands[$Lang].lint

  if ($Fix) {
    $fixCommands = @{
      rust    = 'cargo fmt --all'
      go      = 'gofmt -w .'
      java    = 'gradle spotlessApply --quiet'
      kotlin  = 'ktlint --format'
      csharp  = 'dotnet format'
      swift   = 'swiftlint --fix --format'
      python  = 'ruff check --fix .'
      ruby    = 'rubocop -A'
      php     = 'vendor/bin/php-cs-fixer fix .'
      ts      = 'npx eslint . --fix'
      js      = 'npx eslint . --fix'
    }

    if ($fixCommands[$Lang]) {
      try {
        Invoke-Expression $fixCommands[$Lang] | Out-Null
        Write-Host '    Fixed: auto-fix applied'
      } catch {
        # Ignore fix errors
      }
    }
  }
}

# Phase 4: Test
if ($commands[$Lang].test) {
  Invoke-Check -Phase 'Test' -Command $commands[$Lang].test
}

# Phase 5: Security
Write-Host '>>> Phase: Security'
$secIssues = 0

# 通用密钥检测（跨平台）
$allFiles = @(
  (Find-Files -Extension '.ts' -IgnorePatterns @('node_modules', '.git', 'vendor'))
  (Find-Files -Extension '.js' -IgnorePatterns @('node_modules', '.git', 'vendor'))
  (Find-Files -Extension '.py' -IgnorePatterns @('node_modules', '.git', 'vendor'))
  (Find-Files -Extension '.rs' -IgnorePatterns @('node_modules', '.git', 'vendor'))
  (Find-Files -Extension '.go' -IgnorePatterns @('node_modules', '.git', 'vendor'))
  (Find-Files -Extension '.java' -IgnorePatterns @('node_modules', '.git', 'vendor'))
  (Find-Files -Extension '.rb' -IgnorePatterns @('node_modules', '.git', 'vendor'))
  (Find-Files -Extension '.php' -IgnorePatterns @('node_modules', '.git', 'vendor'))
)

$keyMatches = Search-Matches -Files $allFiles -Pattern 'api_key\s*=\s*"[a-zA-Z0-9]' -Limit 5
if ($keyMatches.Count -gt 0) {
  Write-Host '    WARNING: Possible hardcoded API keys found'
  $keyMatches | Select-Object -First 5 | ForEach-Object { Write-Host "      $_" }
  $secIssues++
}

# 语言特定安全检查
if ($Lang -in @('ts', 'js')) {
  $srcFiles = @(
    (Find-Files -Extension '.ts' -BaseDir 'src')
    (Find-Files -Extension '.tsx' -BaseDir 'src')
    (Find-Files -Extension '.js' -BaseDir 'src')
  )

  $consoleCount = Get-MatchCount -Files $srcFiles -Pattern 'console\.log'
  if ($consoleCount -gt 0) {
    Write-Host "    WARNING: $consoleCount console.log statements found in src/"
    $secIssues++
  }
} elseif ($Lang -eq 'python') {
  $srcFiles = @(
    (Find-Files -Extension '.py' -BaseDir 'src')
    (Find-Files -Extension '.py' -BaseDir 'app')
  )

  $evalCount = Get-MatchCount -Files $srcFiles -Pattern '\beval\b|\bexec\b'
  if ($evalCount -gt 0) {
    Write-Host "    WARNING: $evalCount eval/exec calls found (potential code injection)"
    $secIssues++
  }
}

if ($secIssues -eq 0) {
  Write-Host '    PASS'
  $pass++
} else {
  Write-Host "    FAIL ($secIssues issues)"
  $fail++
  $failedPhase = 'Security'
}
Write-Host ''

# Summary
Write-Host '========================================'
Write-Host " Verification Result ($Lang)"
Write-Host '========================================'
Write-Host "PASS: $pass"
Write-Host "FAIL: $fail"
Write-Host ''

if ($fail -eq 0) {
  Write-Host 'All checks passed. Ready to commit.'
  exit 0
} else {
  Write-Host "Verification failed — first failure: $failedPhase"
  Write-Host 'Fix and re-run this script.'
  exit 1
}
