# Python 编码风格

## 遵循 PEP 8

- 使用 snake_case 命名函数和变量
- 使用 PascalCase 命名类
- 使用 SCREAMING_SNAKE_CASE 命名常量

## 类型提示

```python
# ✅ 好
def fetch_user(user_id: str) -> User | None:
    """Fetch user by ID."""
    return db.query(User).get(user_id)

# ❌ 避免
def fetch_user(user_id):
    return db.query(User).get(user_id)
```

## 导入顺序

1. 标准库
2. 第三方库
3. 本地应用

```python
# ✅ 好
import os
from typing import List

import requests
from fastapi import FastAPI

from app.models import User
from app.services import UserService
```

## 文档字符串

```python
def calculate_discount(price: float, discount: float) -> float:
    """
    Calculate discounted price.
    
    Args:
        price: Original price
        discount: Discount rate (0-1)
        
    Returns:
        Discounted price
        
    Raises:
        ValueError: If discount rate is invalid
    """
    if not 0 <= discount <= 1:
        raise ValueError("Discount must be between 0 and 1")
    return price * (1 - discount)
```
