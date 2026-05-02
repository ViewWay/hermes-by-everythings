# Rust 安全

## 内存安全

Rust 的类型系统已经提供了内存安全保证，但仍需注意：

```rust
// ✅ 使用类型系统防止未初始化数据
struct User {
    name: String,  // 必须初始化
    age: u32,
}

let user = User {
    name: String::from("John"),
    age: 30,
};
```

## 输入验证

```rust
// ✅ 验证输入
pub fn create_user(email: &str) -> Result<User, Error> {
    if !email.contains('@') {
        return Err(Error::InvalidEmail);
    }
    // ...
}
```

## 敏感信息

```rust
// ❌ 不要在日志中包含敏感数据
println!("Password: {}", password);

// ✅ 使用 Debug trait 隐藏敏感字段
impl fmt::Debug for User {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        f.debug_struct("User")
            .field("id", &self.id)
            .field("name", &self.name)
            .field("password", &"***")
            .finish()
    }
}
```
