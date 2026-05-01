# 语言/框架适配层

HBE agent prompt 本身是语言无关的。本文件为各主流语言/框架提供具体的工具链映射，
agent 在执行时根据项目语言自动选择对应命令。

---

## 语言总览

| 语言 | 包管理 | 构建 | 测试 | Lint | 类型检查 | 死代码检测 |
|------|--------|------|------|------|----------|-----------|
| TypeScript | npm/pnpm/yarn/bun | tsc/esbuild/turbo | vitest/jest | eslint | tsc --noEmit | knip/ts-prune |
| JavaScript | npm/pnpm/yarn/bun | webpack/vite/esbuild | vitest/jest | eslint | — | knip |
| Python | pip/poetry/uv/conda | setuptools/hatch | pytest/unittest | ruff/flake8 | mypy/pyright | vulture/dead |
| Rust | cargo | cargo build | cargo test | clippy | rustc | cargo udeps |
| Go | go modules | go build | go test | golangci-lint | go vet | deadcode |
| Java | maven/gradle | mvn/gradle | junit/testng | checkstyle/spotbugs | javac | — |
| Kotlin | gradle | gradle | kotest/junit5 | ktlint/detekt | kotlinc | — |
| C#/.NET | nuget | dotnet build | xunit/nunit | dotnet format | csc/dotnet build | — |
| Ruby | bundler/gem | rake | rspec/minitest | rubocop | steep/sorbet | dead |
| PHP | composer | composer | phpunit/pest | phpstan/larastan | psalm | — |
| Swift | spm | swift build | xctest/swift test | swiftlint | swiftc | periphery |

---

## TypeScript / JavaScript

### 框架识别

| 标识文件 | 框架 | 测试推荐 |
|----------|------|----------|
| next.config.* | Next.js | vitest + playwright |
| nuxt.config.* | Nuxt | vitest + playwright |
| vite.config.* | Vite | vitest |
| angular.json | Angular | karma/jest + protractor |
| vue.config.* | Vue CLI | jest/vitest |
| svelte.config.* | Svelte | vitest + svelte-testing |
| nest-cli.json | NestJS | jest |
| package.json (无框架标识) | Node.js | vitest/jest |

### 工具链

```bash
# 构建
npm run build                    # 通用
pnpm build                      # pnpm
npx turbo build                 # monorepo

# 测试
npx vitest run                  # vitest (推荐)
npx jest --coverage             # jest
npx vitest run --coverage       # vitest + 覆盖率

# 类型检查
npx tsc --noEmit                # TypeScript

# Lint
npx eslint . --max-warnings 0   # ESLint
npx prettier --check .          # 格式检查

# 死代码
npx knip --reporter compact
npx ts-prune
npx depcheck

# E2E
npx playwright test
npx cypress run
```

### 常见构建错误

| 错误 | 原因 | 修复 |
|------|------|------|
| Cannot find module | 路径别名/tsconfig paths | 安装依赖或配置 paths |
| Type 'X' is not assignable | 类型不匹配 | 修正类型或添加收窄 |
| Module not found | 未安装依赖 | npm install |
| Unexpected token | 语法不支持 | 检查 tsconfig target |

---

## Python

### 框架识别

| 标识文件 | 框架 | 测试推荐 |
|----------|------|----------|
| manage.py | Django | pytest-django |
| pyproject.toml (含 fastapi) | FastAPI | pytest + httpx |
| requirements.txt (含 flask) | Flask | pytest |
| setup.py/setup.cfg | 通用包 | pytest |
| Pipfile | pipenv | pytest |
| pyproject.toml (含 poetry) | Poetry | pytest |

### 工具链

```bash
# 构建
pip install -e .                # 可编辑安装
poetry build                    # Poetry
python -m build                 # PEP 517

# 测试
pytest --cov=src --cov-report=term-missing   # pytest + 覆盖率
python -m unittest discover                  # 标准库

# 类型检查
mypy src/ --strict              # mypy
pyright src/                    # pyright

# Lint
ruff check .                    # ruff (推荐, 替代 flake8+isort)
flake8 src/                     # flake8
black --check .                 # 格式检查
isort --check-only .            # import 排序

# 死代码
vulture src/                    # vulture
python -m dead                  # dead

# E2E (Web)
pytest --playwright             # pytest-playwright
```

### 常见构建错误

| 错误 | 原因 | 修复 |
|------|------|------|
| ModuleNotFoundError | 未安装或路径错误 | pip install 或添加 __init__.py |
| ImportError | 循环导入或路径问题 | 重构导入结构 |
| TypeError: missing positional argument | 函数签名变更 | 更新调用处 |
| SyntaxError | Python 版本不兼容 | 检查 pyproject.toml requires-python |

---

## Rust

### 框架识别

| 标识 | 框架 |
|------|------|
| Cargo.toml (含 actix-web) | Actix Web |
| Cargo.toml (含 axum) | Axum |
| Cargo.toml (含 rocket) | Rocket |
| Cargo.toml (含 warp) | Warp |
| Cargo.toml (含 tokio) | Tokio 异步运行时 |

### 工具链

```bash
# 构建
cargo build --workspace         # 构建
cargo build --release           # Release 构建

# 测试
cargo test --workspace          # 全部测试
cargo test -- --nocapture       # 显示 stdout
cargo tarpaulin                 # 覆盖率 (需安装)

# 类型检查 (Rust 编译即类型检查)
cargo clippy -- -D warnings     # Lint + 类型建议

# Lint
cargo fmt --check --all         # 格式检查

# 死代码
cargo +nightly udeps            # 未使用依赖
cargo audit                    # 安全审计

# E2E (API)
cargo test --test integration   # 集成测试
```

### 常见构建错误

| 错误 | 原因 | 修复 |
|------|------|------|
| cannot borrow as mutable | 不可变引用存在 | 使用 &mut 或 RefCell |
| lifetime may not live long enough | 生命周期不足 | 添加显式 'a 标注 |
| the trait bound is not satisfied | 缺少 trait 实现 | 实现或约束泛型 |
| mismatched types | 类型不匹配 | 检查 From/Into 转换 |

---

## Go

### 框架识别

| 标识 | 框架 |
|------|------|
| go.mod (含 gin-gonic) | Gin |
| go.mod (含 labstack/echo) | Echo |
| go.mod (含 gofiber) | Fiber |
| go.mod (含 net/http) | 标准库 |

### 工具链

```bash
# 构建
go build ./...                  # 构建所有包
go build -o bin/app ./cmd/app   # 指定输出

# 测试
go test ./... -v                # 全部测试
go test ./... -cover            # 覆盖率
go test ./... -race             # 竞态检测

# 类型检查
go vet ./...                    # 静态分析

# Lint
golangci-lint run               # 综合 lint (推荐)
golint ./...                    # golint (已废弃, 迁移到 revive)

# 死代码
go tool deadcode ./...          # Go 1.24+
deadcode ./...                  # 独立工具

# E2E (API)
go test -tags=integration ./...
```

### 常见构建错误

| 错误 | 原因 | 修复 |
|------|------|------|
| imported and not used | 导入未使用 | 移除导入 |
| cannot refer to unexported name | 小写标识不可跨包 | 改为大写导出 |
| declared but not used | 变量未使用 | 使用 _ 忽略或移除 |
| missing go.sum entry | 依赖未同步 | go mod tidy |

---

## Java

### 框架识别

| 标识文件 | 框架 |
|----------|------|
| pom.xml | Maven + Spring Boot (含 spring-boot-starter) |
| build.gradle / build.gradle.kts | Gradle + Spring Boot |
| pom.xml (含 quarkus) | Quarkus |
| build.gradle (含 micronaut) | Micronaut |

### 工具链

```bash
# 构建 (Maven)
mvn compile                     # 编译
mvn package -DskipTests         # 打包跳过测试

# 构建 (Gradle)
gradle build                    # 构建
gradle build -x test            # 跳过测试

# 测试
mvn test                        # Maven
gradle test                     # Gradle

# 类型检查
javac -Werror $(find src -name "*.java")  # 编译即检查

# Lint
mvn checkstyle:check            # Checkstyle
gradle spotlessCheck            # Spotless
mvn spotbugs:check              # SpotBugs

# E2E (Web)
mvn verify -P integration       # Maven集成测试
```

### 常见构建错误

| 错误 | 原因 | 修复 |
|------|------|------|
| Cannot find symbol | 缺少导入或依赖 | import 或添加依赖 |
| incompatible types | 类型不匹配 | 强制转换或修正类型 |
| method does not override | @Override 不匹配 | 检查方法签名 |
| package does not exist | 依赖未引入 | pom.xml/build.gradle 添加 |

---

## C# / .NET

### 框架识别

| 标识文件 | 框架 |
|----------|------|
| *.csproj (含 Microsoft.NET.Web) | ASP.NET Core |
| *.csproj (含 Blazor) | Blazor |
| *.sln | .NET 通用 |

### 工具链

```bash
# 构建
dotnet build                    # 构建
dotnet publish -c Release       # 发布

# 测试
dotnet test                     # 运行测试
dotnet test --collect:"XPlat Code Coverage"  # 覆盖率

# 类型检查 (C# 编译即类型检查)
dotnet build --no-incremental   # 完整重建检查

# Lint
dotnet format --verify-no-changes   # 格式检查
dotnet format analyzers --verify    # 分析器

# 死代码
# Visual Studio 代码分析或第三方: NDepend

# E2E (Web)
dotnet test --filter "Category=Integration"
```

### 常见构建错误

| 错误 | 原因 | 修复 |
|------|------|------|
| CS0103 name does not exist | 缺少 using | 添加 using 指令 |
| CS0029 cannot convert | 类型不匹配 | 显式转换或修正 |
| CS0246 type not found | 缺少引用 | 添加 NuGet 包引用 |
| NU1101 package not found | NuGet 包不存在 | 检查包名和版本 |

---

## Kotlin

### 工具链

```bash
# 构建
gradle build                    # Gradle
gradle compileKotlin            # 只编译

# 测试
gradle test                     # JUnit 5 / Kotest

# 类型检查 (Kotlin 编译即类型检查)
gradle compileKotlin

# Lint
ktlint --check                  # ktlint
detekt --build-upon-default-config  # detekt

# E2E
gradle integrationTest          # 自定义集成测试 task
```

---

## Ruby

### 框架识别

| 标识文件 | 框架 |
|----------|------|
| Gemfile (含 rails) | Rails |
| Gemfile (含 sinatra) | Sinatra |
| *.gemspec | Gem 包 |

### 工具链

```bash
# 构建
bundle install                  # 安装依赖
rake build                      # 构建 gem

# 测试
bundle exec rspec               # RSpec
bundle exec rake test           # Minitest

# 类型检查
rbs annotate                    # RBS 签名
steep check                     # Steep 类型检查

# Lint
rubocop                         # RuboCop
bundle exec rubocop -A          # 自动修复

# 死代码
bundle exec dead                # dead

# E2E (Rails)
bundle exec rspec --tag type:feature
bundle exec cucumber            # Cucumber
```

---

## PHP

### 框架识别

| 标识文件 | 框架 |
|----------|------|
| artisan | Laravel |
| composer.json (含 symfony) | Symfony |
| composer.json (含 codeigniter) | CodeIgniter |

### 工具链

```bash
# 构建
composer install                # 安装依赖

# 测试
vendor/bin/phpunit              # PHPUnit
vendor/bin/pest                 # Pest

# 类型检查
vendor/bin/phpstan analyse      # PHPStan
vendor/bin/psalm                # Psalm

# Lint
vendor/bin/phpcs --standard=PSR12  # PHP_CodeSniffer
vendor/bin/php-cs-fixer fix --dry-run  # PHP-CS-Fixer
./artisan larastan              # Laravel 专用

# E2E (Laravel)
php artisan dusk                # Laravel Dusk
vendor/bin/codecept run         # Codeception
```

---

## Swift

### 框架识别

| 标识 | 框架 |
|------|------|
| Package.swift (含 Vapor) | Vapor |
| Package.swift (含 Hummingbird) | Hummingbird |
| *.xcodeproj / *.xcworkspace | Xcode 项目 |

### 工具链

```bash
# 构建
swift build                     # SPM
xcodebuild build                # Xcode

# 测试
swift test                      # SPM
xcodebuild test -scheme MyApp   # Xcode

# 类型检查 (Swift 编译即类型检查)
swift build                     # 编译含类型检查

# Lint
swiftlint lint                  # SwiftLint
swiftformat --lint .            # SwiftFormat

# 死代码
periphery scan                  # Periphery
```

---

## 使用方式

### 自动检测

各 agent 和脚本通过以下规则自动检测项目语言:

```
Cargo.toml          → Rust
go.mod              → Go
pom.xml / *.gradle  → Java / Kotlin
*.csproj / *.sln    → C# / .NET
Package.swift       → Swift
pyproject.toml / setup.py / requirements.txt / Pipfile → Python
Gemfile / *.gemspec → Ruby
composer.json       → PHP
package.json        → TypeScript / JavaScript
  └── tsconfig.json → TypeScript
  └── (无)         → JavaScript
```

### 在 Agent 中引用

各 agent prompt 中的具体命令应根据检测结果，从本文件选择对应的工具链命令。
不需要加载全部内容 — 只需读取当前项目语言对应的章节。

示例流程:
```
1. 检测: go.mod 存在 → Go 项目
2. 加载: tdd-guide.md (通用) + language-adapter.md 的 Go 章节
3. 执行: 使用 go test, golangci-lint, go vet 等命令
```
