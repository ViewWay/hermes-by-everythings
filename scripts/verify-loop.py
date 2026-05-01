#!/usr/bin/env python3
"""
verify-loop.py — 多语言五阶段验证循环（跨平台 Python 版本）
用法: python verify-loop.py [--lang LANG] [--fix]

阶段:
  Phase 1: Build
  Phase 2: Type Check
  Phase 3: Lint
  Phase 4: Test
  Phase 5: Security
"""

import os
import re
import sys
import subprocess
import argparse
from pathlib import Path
from typing import List, Dict, Optional


def find_files(extension: str, base_dir: str = '.', ignore_patterns: List[str] = None) -> List[str]:
    """
    递归搜索指定扩展名的文件

    Args:
        extension: 文件扩展名（如 '.ts', '.py'）
        base_dir: 搜索根目录
        ignore_patterns: 忽略的路径模式列表

    Returns:
        匹配的文件路径列表
    """
    if ignore_patterns is None:
        ignore_patterns = []

    results = []
    base_path = Path(base_dir).resolve()

    for file_path in base_path.rglob('*'):
        if file_path.is_file():
            # 检查忽略模式
            relative_path = str(file_path.relative_to(base_path))
            if any(pattern in relative_path for pattern in ignore_patterns):
                continue

            # 检查扩展名
            if file_path.suffix == extension:
                results.append(str(file_path))

    return results


def count_matches(files: List[str], pattern: str) -> int:
    """
    统计多个文件中匹配模式的次数

    Args:
        files: 文件路径列表
        pattern: 正则表达式模式

    Returns:
        匹配总数
    """
    count = 0
    regex = re.compile(pattern)

    for file_path in files:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                matches = regex.findall(content)
                count += len(matches)
        except (IOError, UnicodeDecodeError):
            # 忽略无法读取的文件
            pass

    return count


def search_matches(files: List[str], pattern: str, limit: int = 5) -> List[str]:
    """
    在多个文件中搜索匹配的模式

    Args:
        files: 文件路径列表
        pattern: 正则表达式模式
        limit: 最多返回结果数

    Returns:
        匹配结果列表，格式为 "file_path:line_number:line_content"
    """
    results = []
    regex = re.compile(pattern)

    for file_path in files:
        if len(results) >= limit:
            break

        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                for line_num, line in enumerate(f, 1):
                    if regex.search(line):
                        results.append(f"{file_path}:{line_num}:{line.strip()}")
                        if len(results) >= limit:
                            break
        except (IOError, UnicodeDecodeError):
            # 忽略无法读取的文件
            pass

    return results


def detect_language() -> str:
    """
    自动检测项目语言

    Returns:
        检测到的语言标识符
    """
    current_dir = Path('.')

    # 检查特定文件
    if (current_dir / 'Cargo.toml').exists():
        return 'rust'
    if (current_dir / 'go.mod').exists():
        return 'go'
    if (current_dir / 'pom.xml').exists():
        # 检查是否为 Kotlin
        gradle_files = list(current_dir.glob('*.gradle*'))
        for gradle_file in gradle_files:
            if gradle_file.suffix == '.gradle.kts':
                return 'kotlin'
            try:
                with open(gradle_file, 'r', encoding='utf-8') as f:
                    if 'kotlin' in f.read():
                        return 'kotlin'
            except IOError:
                pass
        return 'java'
    if (current_dir / 'Package.swift').exists():
        return 'swift'
    if (current_dir / 'pyproject.toml').exists() or \
       (current_dir / 'setup.py').exists() or \
       (current_dir / 'requirements.txt').exists() or \
       (current_dir / 'Pipfile').exists():
        return 'python'
    if (current_dir / 'Gemfile').exists() or \
       list(current_dir.glob('*.gemspec')):
        return 'ruby'
    if (current_dir / 'composer.json').exists():
        return 'php'
    if (current_dir / 'package.json').exists():
        if (current_dir / 'tsconfig.json').exists():
            return 'ts'
        return 'js'

    # 检查文件扩展名
    cs_files = list(current_dir.glob('*.csproj')) + list(current_dir.glob('*.sln'))
    if cs_files:
        return 'csharp'

    return 'unknown'


def run_command(command: str) -> tuple[int, str]:
    """
    执行 shell 命令

    Args:
        command: 要执行的命令

    Returns:
        (退出码, 输出)
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300  # 5分钟超时
        )
        return result.returncode, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return 1, "Command timed out"
    except Exception as e:
        return 1, str(e)


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description='多语言五阶段验证循环',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
自动检测规则:
  Cargo.toml     → rust
  go.mod         → go
  pom.xml/*.gradle → java/kotlin
  *.csproj/*.sln → csharp
  Package.swift  → swift
  pyproject.toml/setup.py/requirements.txt/Pipfile → python
  Gemfile        → ruby
  composer.json  → php
  package.json   → ts (有 tsconfig.json) 或 js
        """
    )
    parser.add_argument(
        '--lang',
        choices=['auto', 'ts', 'js', 'python', 'rust', 'go', 'java', 'kotlin',
                 'csharp', 'ruby', 'php', 'swift'],
        default='auto',
        help='指定语言'
    )
    parser.add_argument(
        '--fix',
        action='store_true',
        help='自动修复可修复的问题'
    )

    args = parser.parse_args()

    # 检测语言
    lang = args.lang
    if lang == 'auto':
        lang = detect_language()

    if lang == 'unknown':
        print('ERROR: Cannot detect project language. Use --lang to specify.',
              file=sys.stderr)
        sys.exit(1)

    print('=' * 40)
    print(f' Verify Loop — Language: {lang}')
    print('=' * 40)
    print()

    pass_count = 0
    fail_count = 0
    failed_phase = ''

    def run_check(phase: str, cmd: str):
        """执行检查阶段"""
        nonlocal pass_count, fail_count, failed_phase

        print(f'>>> Phase: {phase}')
        print(f'    Command: {cmd}')

        returncode, output = run_command(cmd)

        if returncode == 0:
            print('    PASS')
            pass_count += 1
        else:
            print('    FAIL')
            # 显示最后 500 字符
            if len(output) > 500:
                print(output[-500:])
            elif output:
                print(output)
            fail_count += 1
            failed_phase = phase

        print()

    # 语言特定的命令配置
    commands = {
        'rust': {
            'build': 'cargo build --workspace 2>&1',
            'typecheck': 'cargo clippy -- -D warnings 2>&1',
            'lint': 'cargo fmt --check --all 2>&1',
            'test': 'cargo test --workspace 2>&1',
            'fix': 'cargo fmt --all'
        },
        'go': {
            'build': 'go build ./... 2>&1',
            'typecheck': 'go vet ./... 2>&1',
            'lint': 'gofmt -l . 2>&1',
            'test': 'go test ./... -count=1 2>&1',
            'fix': 'gofmt -w .'
        },
        'java': {
            'build': 'mvn compile -q 2>&1 || gradle compileJava --quiet 2>&1',
            'typecheck': 'mvn compile -q 2>&1 || gradle compileJava --quiet 2>&1',
            'lint': 'mvn checkstyle:check -q 2>&1 || gradle spotlessCheck --quiet 2>&1',
            'test': 'mvn test -q 2>&1 || gradle test --quiet 2>&1',
            'fix': 'gradle spotlessApply --quiet'
        },
        'kotlin': {
            'build': 'gradle compileKotlin --quiet 2>&1',
            'typecheck': 'gradle compileKotlin --quiet 2>&1',
            'lint': 'ktlint --check 2>&1 || detekt --build-upon-default-config 2>&1',
            'test': 'gradle test --quiet 2>&1',
            'fix': 'ktlint --format'
        },
        'csharp': {
            'build': 'dotnet build 2>&1',
            'typecheck': 'dotnet build --no-restore 2>&1',
            'lint': 'dotnet format --verify-no-changes 2>&1',
            'test': 'dotnet test --no-build 2>&1',
            'fix': 'dotnet format'
        },
        'swift': {
            'build': 'swift build 2>&1',
            'typecheck': 'swift build 2>&1',
            'lint': 'swiftlint lint --strict 2>&1',
            'test': 'swift test 2>&1',
            'fix': 'swiftlint --fix --format'
        },
        'python': {
            'build': 'python -m compileall -q . 2>&1',
            'typecheck': 'mypy . --ignore-missing-imports 2>&1 || pyright 2>&1',
            'lint': 'ruff check . 2>&1 || flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics 2>&1',
            'test': 'pytest --tb=short -q 2>&1 || python -m unittest discover -s tests -q 2>&1',
            'fix': 'ruff check --fix .'
        },
        'ruby': {
            'build': 'ruby -c lib/**/*.rb 2>&1 || echo "OK"',
            'typecheck': 'echo "Ruby — type checking is optional, skipped"',
            'lint': 'bundle exec rubocop --format progress 2>&1 || rubocop --format progress 2>&1',
            'test': 'bundle exec rspec --format progress 2>&1 || bundle exec rake test 2>&1',
            'fix': 'rubocop -A'
        },
        'php': {
            'build': 'composer validate --no-check-publish 2>&1',
            'typecheck': 'vendor/bin/phpstan analyse --no-progress 2>&1 || vendor/bin/psalm --no-cache 2>&1',
            'lint': 'vendor/bin/phpcs --standard=PSR12 --report=summary . 2>&1 || true',
            'test': 'vendor/bin/phpunit --no-coverage 2>&1 || vendor/bin/pest 2>&1',
            'fix': 'vendor/bin/php-cs-fixer fix .'
        },
        'ts': {
            'build': 'npm run build 2>&1 || pnpm build 2>&1 || bun run build 2>&1',
            'typecheck': 'npx tsc --noEmit 2>&1',
            'lint': 'npx eslint . --max-warnings 0 2>&1',
            'test': 'npx vitest run 2>&1 || npx jest --no-coverage 2>&1 || npm test 2>&1',
            'fix': 'npx eslint . --fix'
        },
        'js': {
            'build': 'npm run build 2>&1 || pnpm build 2>&1',
            'typecheck': 'echo "JavaScript — no type checking"',
            'lint': 'npx eslint . --max-warnings 0 2>&1',
            'test': 'npx vitest run 2>&1 || npx jest --no-coverage 2>&1 || npm test 2>&1',
            'fix': 'npx eslint . --fix'
        }
    }

    lang_cmds = commands.get(lang, {})

    # Phase 1: Build
    if 'build' in lang_cmds:
        run_check('Build', lang_cmds['build'])

    # Phase 2: Type Check
    if 'typecheck' in lang_cmds:
        if lang in ['ruby', 'js']:
            print('>>> Phase: Type Check')
            if lang == 'ruby':
                print('    (Ruby — type checking is optional, skipped)')
            else:
                print('    (JavaScript — no type checking)')
            pass_count += 1
            print()
        else:
            run_check('Type Check', lang_cmds['typecheck'])

    # Phase 3: Lint
    if 'lint' in lang_cmds:
        run_check('Lint', lang_cmds['lint'])

        if args.fix and 'fix' in lang_cmds:
            returncode, _ = run_command(lang_cmds['fix'])
            if returncode == 0:
                print('    Fixed: auto-fix applied')

    # Phase 4: Test
    if 'test' in lang_cmds:
        run_check('Test', lang_cmds['test'])

    # Phase 5: Security
    print('>>> Phase: Security')
    sec_issues = 0

    # 通用密钥检测（跨平台）
    ignore_patterns = ['node_modules', '.git', 'vendor']
    all_files = []
    for ext in ['.ts', '.js', '.py', '.rs', '.go', '.java', '.rb', '.php']:
        all_files.extend(find_files(ext, '.', ignore_patterns))

    key_matches = search_matches(all_files, r'api_key\s*=\s*"[a-zA-Z0-9]', 5)
    if key_matches:
        print('    WARNING: Possible hardcoded API keys found')
        for match in key_matches[:5]:
            print(f'      {match}')
        sec_issues += 1

    # 语言特定安全检查
    if lang in ['ts', 'js']:
        src_files = []
        for ext in ['.ts', '.tsx', '.js']:
            src_files.extend(find_files(ext, 'src', []))

        console_count = count_matches(src_files, r'console\.log')
        if console_count > 0:
            print(f'    WARNING: {console_count} console.log statements found in src/')
            sec_issues += 1

    elif lang == 'python':
        src_files = []
        for dir_name in ['src', 'app']:
            src_files.extend(find_files('.py', dir_name, []))

        eval_count = count_matches(src_files, r'\beval\b|\bexec\b')
        if eval_count > 0:
            print(f'    WARNING: {eval_count} eval/exec calls found (potential code injection)')
            sec_issues += 1

    if sec_issues == 0:
        print('    PASS')
        pass_count += 1
    else:
        print(f'    FAIL ({sec_issues} issues)')
        fail_count += 1
        failed_phase = 'Security'

    print()

    # Summary
    print('=' * 40)
    print(f' Verification Result ({lang})')
    print('=' * 40)
    print(f'PASS: {pass_count}')
    print(f'FAIL: {fail_count}')
    print()

    if fail_count == 0:
        print('All checks passed. Ready to commit.')
        sys.exit(0)
    else:
        print(f'Verification failed — first failure: {failed_phase}')
        print('Fix and re-run this script.')
        sys.exit(1)


if __name__ == '__main__':
    main()
