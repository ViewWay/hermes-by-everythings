---
name: command-name
description: 简短描述（一句话）
version: 1.0.0
status: active
usage: /hbe:command-name [arguments]
examples:
  - /hbe:command-name example1
  - /hbe:command-name example2
---

# Command Name

简短描述。

## Usage

```
/hbe:command-name [required-argument] [optional-argument]
```

## Arguments

| 参数 | 类型 | 必需 | 描述 |
|------|------|------|------|
| `argument1` | string | ✅ | 参数描述 |
| `argument2` | number | ❌ | 参数描述（默认：100） |

## Options

| 选项 | 描述 |
|------|------|
| `--option1` | 选项描述 |
| `--option2` | 选项描述 |

## Examples

### Example 1: 基本使用

```
/hbe:command-name "user authentication"
```

**输出**:
```
[预期输出]
```

### Example 2: 带选项

```
/hbe:command-name "user authentication" --option1
```

**输出**:
```
[预期输出]
```

## What It Does

1. **Step 1**: [描述]
2. **Step 2**: [描述]
3. **Step 3**: [描述]

## Related Commands

- [`/hbe:related-command`](../commands/related-command.md)

## See Also

- [Related Skill](../skills/related-skill/SKILL.md)
- [Related Agent](../agents/related-agent.md)

---

**维护者**: [Your Name]
**创建**: YYYY-MM-DD
**更新**: YYYY-MM-DD
**版本**: 1.0.0
