# Rust 编码风格

## 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 类型/结构体 | PascalCase | `User`, `HttpClient` |
| 函数/方法 | snake_case | `get_user`, `parse_data` |
| 常量 | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| 局部变量 | snake_case | `user_count` |

## 错误处理

```rust
// ✅ 好 - 使用 Result
fn fetch_user(id: &str) -> Result<User, Error> {
    let user = db.query(id)?;
    Ok(user)
}

// ❌ 避免 - panic
fn fetch_user(id: &str) -> User {
    db.query(id).unwrap()
}
```

## 所有权

```rust
// ✅ 使用借用
fn print_user(user: &User) {
    println!("{}", user.name);
}

// ✅ 需要所有权时明确说明
fn process_user(user: User) -> User {
    // ...
}
```

## Option vs Result

```rust
// ✅ Option 用于可能不存在的值
fn get_user(id: &str) -> Option<User> {
    db.query(id).ok()
}

// ✅ Result 用于可能失败的操作
fn fetch_user(id: &str) -> Result<User, Error> {
    db.query(id)
}
```

## 错误处理模式

```rust
// ✅ 使用 ? 操作符
fn process() -> Result<(), Error> {
    let user = fetch_user("123")?;
    save_user(&user)?;
    Ok(())
}
```
