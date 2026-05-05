# Go 编码风格

## 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 包 | 小写单词 | `user`, `httputil` |
| 常量 | 大驼峰或camelCase | `MaxRetries`, `maxRetries` |
| 变量/函数 | 大驼峰（导出） | `GetUser`, `Parse` |
| 变量/函数 | 小驼峰（私有） | `getUser`, `parse` |
| 接口 | 方法名 + er 后缀 | `Reader`, `Writer`, `Stringer` |
| 接口实现 | 接口名 | `type ReaderImpl io.Reader` |

## 错误处理

```go
// ✅ 好 - 总是检查错误
file, err := os.Open("file.txt")
if err != nil {
    return fmt.Errorf("failed to open file: %w", err)
}
defer file.Close()

// ❌ 避免 - 忽略错误
file, _ := os.Open("file.txt")
```

## 并发

```go
// ✅ 使用 channel
func process(items <-chan Item) <-chan Result {
    results := make(chan Result)
    go func() {
        defer close(results)
        for item := range items {
            results <- processItem(item)
        }
    }()
    return results
}
```

## 接口设计

```go
// ✅ 小接口 - 只定义需要的方法
type Reader interface {
    Read(p []byte) (n int, err error)
}

// ❌ 避免 - 大接口
type AllInOne interface {
    Read(p []byte) (n int, err error)
    Write(p []byte) (n int, err error)
    Close() error
    // ... 20 more methods
}
```
