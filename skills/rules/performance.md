# 性能规则

## 响应时间目标

| 操作类型 | 目标 | 上限 |
|----------|------|------|
| API 响应（简单查询） | < 100ms | 500ms |
| API 响应（复杂查询） | < 500ms | 2s |
| 页面首次加载 | < 2s | 5s |
| 页面交互响应 | < 100ms | 300ms |
| 数据库查询 | < 50ms | 200ms |

## 前端性能

### 加载优化
- 代码分割（路由级别 lazy load）
- 图片懒加载 + WebP/AVIF 格式
- 关键 CSS 内联，非关键 CSS 异步
- 预加载关键资源（preload/prefetch）
- Tree shaking 移除死代码

### 运行时优化
- 虚拟列表（大数据量）
- 防抖/节流（搜索、滚动、resize）
- Memo（React.memo/useMemo/useCallback）
- Web Worker（CPU 密集任务）
- requestAnimationFrame（动画）

### 检测工具
```bash
npx lighthouse http://localhost:3000 --output=html
npx bundlewatch
```

## 后端性能

### 数据库
- 索引优化（覆盖查询字段）
- 避免 N+1 查询（JOIN / 批量查询）
- 连接池配置
- 慢查询日志分析
- 分页查询（游标分页 > offset 分页）

### API
- 响应压缩（gzip/brotli）
- 缓存策略（ETag / Cache-Control）
- 批量接口（减少请求次数）
- 异步处理（长任务用队列）

### Rust 特定
- 零拷贝（&str 代替 String）
- 避免不必要的 clone()
- 使用Cow<str>处理可能的所有权转移
- 并行处理用 rayon
- 大文件流式处理

## 内存优化

- 及时释放大对象
- 避免内存泄漏（事件监听器清理）
- 流式处理大文件（不全部加载到内存）
- 连接池限制大小
- 缓存设置 TTL + LRU 淘汰
