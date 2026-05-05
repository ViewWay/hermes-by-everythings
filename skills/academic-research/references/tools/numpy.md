---
name: numpy
description: Fundamental array computing library. Use for numerical operations, linear algebra, random sampling, and as the foundation for all scientific Python packages.
domain: cross-domain
install: pip install numpy
---

# NumPy: Numerical Computing Foundation

## Overview

NumPy provides the n-dimensional array (ndarray) data structure that underpins all scientific Python. Every scientific package (pandas, scipy, scikit-learn, PyTorch) builds on NumPy arrays.

## When to Use

- Mathematical operations on arrays/matrices
- Linear algebra (matrix multiply, SVD, eigendecomposition)
- Random number generation and sampling
- Data type conversion and memory management
- Broadcasting vectorized operations (avoiding Python loops)

## Quick Start

```python
import numpy as np

# Array creation
a = np.array([1, 2, 3])                    # 1D
b = np.array([[1, 2], [3, 4]])              # 2D
c = np.zeros((3, 4))                        # 3x4 zeros
d = np.ones((2, 3))                         # 2x3 ones
e = np.random.randn(100, 50)                # Random normal
f = np.arange(0, 10, 0.5)                   # Sequence
g = np.linspace(0, 1, 100)                  # Evenly spaced

# Basic operations
a.shape, a.dtype, a.ndim                     # (3,), int64, 1
a * 2                                        # Element-wise multiply
a @ b[:3] if a.shape[0]==3 else None        # Matrix multiply
np.sum(a), np.mean(a), np.std(a)            # Aggregations
```

## Core Capabilities

### 1. Array Indexing and Slicing

```python
# Basic slicing
a[0], a[-1], a[1:3]                         # Like Python lists
b[0, :], b[:, 1]                            # Row/column
b[0:2, 1:3]                                 # Sub-matrix

# Boolean indexing
mask = a > 2
a[mask]                                      # Elements where True
a[a > 2]                                     # Inline

# Fancy indexing
indices = np.array([0, 2, 4])
a[indices]

# np.where
result = np.where(a > 2, a, 0)              # Conditional replace
```

### 2. Broadcasting and Vectorization

```python
# Broadcasting rules: dimensions align from right, size 1 expands
# Shape (3, 1) + (1, 4) → (3, 4)
a = np.arange(3).reshape(3, 1)              # (3, 1)
b = np.arange(4).reshape(1, 4)              # (1, 4)
c = a + b                                    # (3, 4) — broadcast

# Avoid loops — use vectorized operations
# BAD: [math.sin(x) for x in array]
# GOOD: np.sin(array)
result = np.exp(-x**2 / (2 * sigma**2))     # Gaussian, fully vectorized

# Cumulative operations
np.cumsum(a)
np.cumprod(a)
np.diff(a)                                   # First differences
```

### 3. Linear Algebra

```python
from numpy.linalg import inv, svd, eig, norm, solve

# Matrix operations
A = np.random.randn(3, 3)
b = np.random.randn(3)
A_inv = inv(A)                               # Inverse
x = solve(A, b)                              # Solve Ax = b
det = np.linalg.det(A)                       # Determinant

# Decompositions
U, S, Vt = svd(A)                            # SVD
eigenvalues, eigenvectors = eig(A)           # Eigendecomposition

# Norms and distances
norm_A = norm(A)                             # Frobenius norm
norm_v = norm(b)                             # L2 norm
cos_sim = np.dot(a, b) / (norm(a) * norm(b))# Cosine similarity
```

### 4. Random Sampling

```python
rng = np.random.default_rng(seed=42)         # Modern API

# Distributions
rng.standard_normal(1000)                     # Standard normal
rng.normal(loc=0, scale=1, size=1000)        # N(μ, σ²)
rng.uniform(low=0, high=1, size=1000)        # U(a, b)
rng.binomial(n=10, p=0.5, size=1000)         # Binomial
rng.poisson(lam=5, size=1000)                # Poisson
rng.choice([1, 2, 3], size=10, replace=True) # Random choice
rng.permutation(100)                          # Shuffle

# Reproducibility: always pass seed
rng = np.random.default_rng(seed=42)
```

### 5. Shape Manipulation

```python
a.reshape(2, 3)                              # Reshape
a.flatten()                                   # Copy to 1D
a.ravel()                                     # View if possible
a.T                                           # Transpose
a[:, np.newaxis]                              # Add dimension: (n,) → (n, 1)
np.concatenate([a, b], axis=0)               # Stack vertically
np.stack([a, b], axis=0)                     # Stack as new dimension
np.split(a, 3)                                # Split into 3 parts
```

## Common Academic Workflows

### Computing Statistics on Large Arrays

```python
# Memory-efficient statistics (chunked)
def chunked_mean(filepath, chunk_size=10000):
    """Compute mean of large array without loading all at once."""
    data = np.load(filepath, mmap_mode='r')
    total, count = 0.0, 0
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i+chunk_size]
        total += chunk.sum()
        count += chunk.size
    return total / count
```

### Distance Matrix

```python
def pairwise_distances(X):
    """Euclidean distance matrix for N x D array."""
    # (X - Y)² = X² + Y² - 2XY
    sq = np.sum(X**2, axis=1, keepdims=True)
    dists = np.sqrt(sq + sq.T - 2 * X @ X.T)
    np.fill_diagonal(dists, 0)  # Numerical precision fix
    return dists
```

## Key Parameters

| Parameter | Default | When to Adjust |
|-----------|---------|----------------|
| `dtype` | float64 | Use float32 for GPU/memory, int32 for indices |
| `order` | 'C' (row-major) | Use 'F' for MATLAB interop |
| `axis` | None (all) | Specify axis for per-row/column operations |
| `keepdims` | False | Set True to preserve dimension after reduction |
| `seed` | None | Always set for reproducibility |

## Best Practices

1. **Always set random seed**: `np.random.default_rng(seed=42)` for reproducibility
2. **Use float64 by default**: Switch to float32 only when memory-constrained
3. **Prefer vectorized operations**: Avoid Python loops over arrays
4. **Use `np.einsum`** for complex tensor contractions: cleaner than nested operations
5. **Check shapes often**: `assert A.shape == (m, n)` catches bugs early

## Common Pitfalls

1. **Integer division**: `np.array([1, 2, 3]) / 2` gives float, but `np.array([1, 2, 3]) // 2` truncates
2. **View vs copy**: `a = b[:]` is a view (shares memory); `a = b.copy()` is independent
3. **Broadcasting surprises**: Always verify shapes after broadcast operations
4. **NaN propagation**: `np.sum([1, np.nan])` → `nan`; use `np.nansum()` to ignore
5. **Memory order**: C-contiguous vs Fortran-contiguous matters for performance

## Integration with HBE

- Foundation for all tools in `references/tool-registry.md`
- Used in `references/statistical-analysis-guide.md` for numerical computations
- Supports `references/data-processing-guide.md` for array operations
- See `references/tools/scipy.md` for scientific functions built on NumPy

## Resources

- Documentation: https://numpy.org/doc/stable/
- Linear algebra: https://numpy.org/doc/stable/reference/routines.linalg.html
- Harris et al. (2020) "Array programming with NumPy" — Nature paper
