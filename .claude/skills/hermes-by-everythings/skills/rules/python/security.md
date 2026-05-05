# Python 安全

## 输入验证

```python
# ✅ 使用 Pydantic
from pydantic import BaseModel, validator

class UserCreate(BaseModel):
    email: str
    age: int
    
    @validator('email')
    def email_must_be_valid(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email')
        return v
```

## SQL 注入

```python
# ❌ 危险
query = f"SELECT * FROM users WHERE id = {user_id}"

# ✅ 安全 - 参数化查询
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_id,))
```

## 密钥管理

```python
# ❌ 硬编码
API_KEY = "sk-1234567890"

# ✅ 环境变量
import os
API_KEY = os.environ["API_KEY"]
```

## 敏感信息

```python
# ❌ 不要记录
logger.info(f"Password: {password}")

# ✅ 排除敏感字段
logger.info("Login attempt", extra={"user_id": user.id})
```
