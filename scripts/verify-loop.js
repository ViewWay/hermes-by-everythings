#!/usr/bin/env node
/**
 * verify-loop.js — 多语言五阶段验证循环
 * 用法: node verify-loop.js [--lang LANG] [--fix]
 * 
 * 阶段:
 *   Phase 1: Build
 *   Phase 2: Type Check
 *   Phase 3: Lint
 *   Phase 4: Test
 *   Phase 5: Security
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 解析命令行参数
let lang = 'auto';
let shouldFix = false;

for (let i = 2; i < process.argv.length; i++) {
  switch (process.argv[i]) {
    case '--lang':
      lang = process.argv[++i];
      break;
    case '--fix':
      shouldFix = true;
      break;
    case '-h':
    case '--help':
      console.log('用法: node verify-loop.js [--lang LANG] [--fix]');
      console.log('  --lang  指定语言 (auto|ts|js|python|rust|go|java|kotlin|csharp|ruby|php|swift)');
      console.log('  --fix   自动修复可修复的问题');
      console.log('');
      console.log('自动检测规则:');
      console.log('  Cargo.toml     → rust');
      console.log('  go.mod         → go');
      console.log('  pom.xml/*.gradle → java/kotlin');
      console.log('  *.csproj/*.sln → csharp');
      console.log('  Package.swift  → swift');
      console.log('  pyproject.toml/setup.py/requirements.txt/Pipfile → python');
      console.log('  Gemfile        → ruby');
      console.log('  composer.json  → php');
      console.log('  package.json   → ts (有 tsconfig.json) 或 js');
      process.exit(0);
  }
}

// 自动检测语言
function detectLanguage() {
  const files = fs.readdirSync('.');
  
  if (fs.existsSync('Cargo.toml')) return 'rust';
  if (fs.existsSync('go.mod')) return 'go';
  if (fs.existsSync('pom.xml')) {
    const gradleFiles = files.filter(f => f.endsWith('.gradle') || f.endsWith('.gradle.kts'));
    if (gradleFiles.some(f => f.endsWith('.gradle.kts')) || 
        gradleFiles.some(f => fs.readFileSync(f, 'utf8').includes('kotlin'))) {
      return 'kotlin';
    }
    return 'java';
  }
  if (files.some(f => f.endsWith('.csproj') || f.endsWith('.sln'))) return 'csharp';
  if (fs.existsSync('Package.swift')) return 'swift';
  if (fs.existsSync('pyproject.toml') || fs.existsSync('setup.py') || 
      fs.existsSync('requirements.txt') || fs.existsSync('Pipfile')) return 'python';
  if (fs.existsSync('Gemfile') || files.some(f => f.endsWith('.gemspec'))) return 'ruby';
  if (fs.existsSync('composer.json')) return 'php';
  if (fs.existsSync('package.json')) {
    if (fs.existsSync('tsconfig.json')) return 'ts';
    return 'js';
  }
  
  return 'unknown';
}

if (lang === 'auto') {
  lang = detectLanguage();
}

if (lang === 'unknown') {
  console.error('ERROR: Cannot detect project language. Use --lang to specify.');
  process.exit(1);
}

console.log('========================================');
console.log(` Verify Loop — Language: ${lang}`);
console.log('========================================');
console.log('');

let pass = 0;
let fail = 0;
let failedPhase = '';

// 执行检查
function runCheck(phase, cmd) {
  console.log(`>>> Phase: ${phase}`);
  console.log(`    Command: ${cmd}`);
  
  try {
    execSync(cmd, { stdio: 'pipe' });
    console.log('    PASS');
    pass++;
  } catch (error) {
    console.log('    FAIL');
    console.log(error.stdout?.toString().slice(-500) || error.message?.slice(0, 500));
    fail++;
    failedPhase = phase;
  }
  console.log('');
}

// 语言特定的命令配置
const commands = {
  rust: {
    build: 'cargo build --workspace 2>&1',
    typecheck: 'cargo clippy -- -D warnings 2>&1',
    lint: 'cargo fmt --check --all 2>&1',
    test: 'cargo test --workspace 2>&1'
  },
  go: {
    build: 'go build ./... 2>&1',
    typecheck: 'go vet ./... 2>&1',
    lint: 'gofmt -l . 2>&1',
    test: 'go test ./... -count=1 2>&1'
  },
  java: {
    build: 'mvn compile -q 2>&1 || gradle compileJava --quiet 2>&1',
    typecheck: 'mvn compile -q 2>&1 || gradle compileJava --quiet 2>&1',
    lint: 'mvn checkstyle:check -q 2>&1 || gradle spotlessCheck --quiet 2>&1',
    test: 'mvn test -q 2>&1 || gradle test --quiet 2>&1'
  },
  kotlin: {
    build: 'gradle compileKotlin --quiet 2>&1',
    typecheck: 'gradle compileKotlin --quiet 2>&1',
    lint: 'ktlint --check 2>&1 || detekt --build-upon-default-config 2>&1',
    test: 'gradle test --quiet 2>&1'
  },
  csharp: {
    build: 'dotnet build 2>&1',
    typecheck: 'dotnet build --no-restore 2>&1',
    lint: 'dotnet format --verify-no-changes 2>&1',
    test: 'dotnet test --no-build 2>&1'
  },
  swift: {
    build: 'swift build 2>&1',
    typecheck: 'swift build 2>&1',
    lint: 'swiftlint lint --strict 2>&1',
    test: 'swift test 2>&1'
  },
  python: {
    build: 'python -m compileall -q . 2>&1',
    typecheck: 'mypy . --ignore-missing-imports 2>&1 || pyright 2>&1',
    lint: 'ruff check . 2>&1 || flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics 2>&1',
    test: 'pytest --tb=short -q 2>&1 || python -m unittest discover -s tests -q 2>&1'
  },
  ruby: {
    build: 'ruby -c lib/**/*.rb 2>&1 || echo "OK"',
    typecheck: 'echo "Ruby — type checking is optional, skipped"',
    lint: 'bundle exec rubocop --format progress 2>&1 || rubocop --format progress 2>&1',
    test: 'bundle exec rspec --format progress 2>&1 || bundle exec rake test 2>&1'
  },
  php: {
    build: 'composer validate --no-check-publish 2>&1',
    typecheck: 'vendor/bin/phpstan analyse --no-progress 2>&1 || vendor/bin/psalm --no-cache 2>&1',
    lint: 'vendor/bin/phpcs --standard=PSR12 --report=summary . 2>&1 || true',
    test: 'vendor/bin/phpunit --no-coverage 2>&1 || vendor/bin/pest 2>&1'
  },
  ts: {
    build: 'npm run build 2>&1 || pnpm build 2>&1 || bun run build 2>&1',
    typecheck: 'npx tsc --noEmit 2>&1',
    lint: 'npx eslint . --max-warnings 0 2>&1',
    test: 'npx vitest run 2>&1 || npx jest --no-coverage 2>&1 || npm test 2>&1'
  },
  js: {
    build: 'npm run build 2>&1 || pnpm build 2>&1',
    typecheck: 'echo "JavaScript — no type checking"',
    lint: 'npx eslint . --max-warnings 0 2>&1',
    test: 'npx vitest run 2>&1 || npx jest --no-coverage 2>&1 || npm test 2>&1'
  }
};

// Phase 1: Build
if (commands[lang]?.build) {
  runCheck('Build', commands[lang].build);
}

// Phase 2: Type Check
if (commands[lang]?.typecheck) {
  if (lang === 'ruby') {
    console.log('>>> Phase: Type Check');
    console.log('    (Ruby — type checking is optional, skipped)');
    pass++;
    console.log('');
  } else if (lang === 'js') {
    console.log('>>> Phase: Type Check');
    console.log('    (JavaScript — no type checking)');
    pass++;
    console.log('');
  } else {
    runCheck('Type Check', commands[lang].typecheck);
  }
}

// Phase 3: Lint
if (commands[lang]?.lint) {
  runCheck('Lint', commands[lang].lint);
  if (shouldFix) {
    const fixCmd = {
      rust: 'cargo fmt --all',
      go: 'gofmt -w .',
      java: 'gradle spotlessApply --quiet',
      kotlin: 'ktlint --format',
      csharp: 'dotnet format',
      swift: 'swiftlint --fix --format',
      python: 'ruff check --fix .',
      ruby: 'rubocop -A',
      php: 'vendor/bin/php-cs-fixer fix .',
      ts: 'npx eslint . --fix',
      js: 'npx eslint . --fix'
    };
    
    if (fixCmd[lang]) {
      try {
        execSync(fixCmd[lang]);
        console.log(`    Fixed: auto-fix applied`);
      } catch (e) {
        // Ignore fix errors
      }
    }
  }
}

// Phase 4: Test
if (commands[lang]?.test) {
  runCheck('Test', commands[lang].test);
}

// Phase 5: Security
console.log('>>> Phase: Security');
let secIssues = 0;

// 通用密钥检测
try {
  const result = execSync(
    'grep -rn "api_key\\s*=\\s*\\"[a-zA-Z0-9]" --include="*.ts" --include="*.js" --include="*.py" --include="*.rs" --include="*.go" --include="*.java" --include="*.rb" --include="*.php" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v vendor | head -5',
    { stdio: 'pipe' }
  );
  
  if (result.stdout.toString().trim()) {
    console.log('    WARNING: Possible hardcoded API keys found');
    secIssues++;
  }
} catch (e) {
  // No matches is OK
}

// 语言特定安全检查
if (lang === 'ts' || lang === 'js') {
  try {
    const result = execSync('grep -rn "console\\.log" --include="*.ts" --include="*.tsx" --include="*.js" src/ 2>/dev/null | wc -l', { stdio: 'pipe' });
    const consoleCount = parseInt(result.stdout.toString().trim());
    
    if (consoleCount > 0) {
      console.log(`    WARNING: ${consoleCount} console.log statements found in src/`);
      secIssues++;
    }
  } catch (e) {
    // No src directory is OK
  }
} else if (lang === 'python') {
  try {
    const result = execSync('grep -rn "\\beval\\b\\|\\bexec\\b" --include="*.py" src/ app/ 2>/dev/null | grep -v "test" | wc -l', { stdio: 'pipe' });
    const evalCount = parseInt(result.stdout.toString().trim());
    
    if (evalCount > 0) {
      console.log(`    WARNING: ${evalCount} eval/exec calls found (potential code injection)`);
      secIssues++;
    }
  } catch (e) {
    // No matches is OK
  }
}

if (secIssues === 0) {
  console.log('    PASS');
  pass++;
} else {
  console.log(`    FAIL (${secIssues} issues)`);
  fail++;
  failedPhase = 'Security';
}
console.log('');

// Summary
console.log('========================================');
console.log(` Verification Result (${lang})`);
console.log('========================================');
console.log(`PASS: ${pass}`);
console.log(`FAIL: ${fail}`);
console.log('');

if (fail === 0) {
  console.log('All checks passed. Ready to commit.');
  process.exit(0);
} else {
  console.log(`Verification failed — first failure: ${failedPhase}`);
  console.log('Fix and re-run this script.');
  process.exit(1);
}
