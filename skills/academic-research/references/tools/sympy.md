---
name: sympy
description: Symbolic mathematics library. Use for algebra, calculus (differentiation, integration), equation solving, matrix operations, and LaTeX math output.
domain: math
install: pip install sympy
---

# SymPy: Symbolic Mathematics

## Overview

SymPy provides symbolic (exact) mathematics in Python — algebra, calculus, differential equations, linear algebra, with LaTeX output. Essential for mathematical derivations in papers.

## When to Use

- Symbolic differentiation and integration
- Solving equations analytically
- Simplifying mathematical expressions
- Generating LaTeX code for equations
- Matrix symbolic algebra

## Quick Start

```python
from sympy import symbols, diff, integrate, simplify, solve, latex, Matrix, sin, cos, exp, sqrt, oo

x, y, z = symbols('x y z')

# Differentiation
diff(x**3 + 2*x**2 - x + 1, x)                  # 3x² + 4x - 1
diff(sin(x) * exp(x), x)                           # e^x(sin(x) + cos(x))

# Integration
integrate(x**2, x)                                  # x³/3
integrate(exp(-x**2), (x, -oo, oo))                 # √π

# Solve equation
solve(x**2 - 5*x + 6, x)                           # [2, 3]

# LaTeX output
expr = integrate(x**2 * sin(x), x)
print(latex(expr))                                   # x²sin(x) → LaTeX string
```

## Core Capabilities

### 1. Calculus for Papers

```python
# Partial derivatives
f = x**2 * y + y**3 * x
diff(f, x)                     # ∂f/∂x
diff(f, y, 2)                  # ∂²f/∂y²

# Taylor series
from sympy import series
series(sin(x), x, 0, 6)        # x - x³/6 + x⁵/120 + O(x⁶)

# Limits
from sympy import limit
limit(sin(x)/x, x, 0)          # 1

# Differential equations
from sympy import Function, dsolve, Eq
y = Function('y')
dsolve(Eq(y(x).diff(x) - y(x), exp(x)), y(x))
```

### 2. LaTeX Generation

```python
# Symbolic derivation → LaTeX for paper
f = x**3 / (1 + exp(-x))
f_prime = diff(f, x)
f_prime_simplified = simplify(f_prime)
latex_code = latex(f_prime_simplified)
# Copy to .tex file
```

## Best Practices

1. **Use `simplify()`**: Symbolic results often need simplification
2. **Use `latex()`**: Direct copy to LaTeX documents
3. **Define assumptions**: `x = symbols('x', real=True, positive=True)`

## Integration with HBE

- Mathematics tool in `references/tool-registry.md`
- Supports `workflows/paper-writing.md` for equation derivation
- Works with `templates/*/main.tex` for LaTeX output

## Resources

- Documentation: https://docs.sympy.org/
- Meurer et al. (2017) "SymPy" — PeerJ CS paper
