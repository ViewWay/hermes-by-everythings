# 设计模式规则

## API 响应格式

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
```

## React 组件模式

### 组合优于继承
```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined';
}

function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>;
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}
```

### 自定义 Hook 模式
```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
```

## Rust 设计模式

### Builder 模式
```rust
struct Config {
    host: String,
    port: u16,
    timeout: Duration,
}

impl Config {
    fn builder() -> ConfigBuilder {
        ConfigBuilder::default()
    }
}

#[derive(Default)]
struct ConfigBuilder {
    host: Option<String>,
    port: Option<u16>,
    timeout: Option<Duration>,
}

impl ConfigBuilder {
    fn host(mut self, host: impl Into<String>) -> Self {
        self.host = Some(host.into());
        self
    }
    fn build(self) -> Result<Config, &'static str> {
        Ok(Config {
            host: self.host.ok_or("host is required")?,
            port: self.port.unwrap_or(8080),
            timeout: self.timeout.unwrap_or(Duration::from_secs(30)),
        })
    }
}
```

### Trait 抽象
```rust
trait Repository<T> {
    fn find_all(&self) -> Result<Vec<T>>;
    fn find_by_id(&self, id: &str) -> Result<Option<T>>;
    fn create(&self, data: &CreateDto) -> Result<T>;
    fn update(&self, id: &str, data: &UpdateDto) -> Result<T>;
    fn delete(&self, id: &str) -> Result<()>;
}
```

### 错误处理
```rust
#[derive(Debug, thiserror::Error)]
enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
}
```

## 状态管理（Zustand）

```typescript
interface Store {
  data: Item[];
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  add: (item: Item) => void;
}

const useStore = create<Store>((set) => ({
  data: [],
  loading: false,
  error: null,
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getItems();
      set({ data, loading: false });
    } catch (e) {
      set({ error: e.message, loading: false });
    }
  },
  add: (item) => set((s) => ({ data: [...s.data, item] })),
}));
```
