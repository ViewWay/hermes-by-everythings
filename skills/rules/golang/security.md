# Go 安全

## SQL 注入

```go
// ❌ 危险
query := fmt.Sprintf("SELECT * FROM users WHERE id = %s", userID)

// ✅ 安全 - 参数化
query := "SELECT * FROM users WHERE id = ?"
rows, err := db.Query(query, userID)
```

## 输入验证

```go
// ✅ 验证输入
if !isValidEmail(email) {
    return errors.New("invalid email")
}
```

## 密钥管理

```go
// ❌ 硬编码
const apiKey = "sk-1234567890"

// ✅ 环境变量
apiKey := os.Getenv("API_KEY")
if apiKey == "" {
    log.Fatal("API_KEY required")
}
```

## Context 使用

```go
// ✅ 总是传递 context
func FetchUser(ctx context.Context, id string) (*User, error) {
    req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
    // ...
}
```
