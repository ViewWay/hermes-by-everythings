---
name: scipy
description: Scientific computing library with optimization, integration, interpolation, signal processing, sparse matrices, and statistical functions. Use for any scientific computation beyond basic linear algebra.
domain: cross-domain
install: pip install scipy
---

# SciPy: Scientific Computing

## Overview

SciPy provides algorithms for optimization, integration, interpolation, Fourier transforms, signal processing, linear algebra, and statistics — built on NumPy. Essential for physics, engineering, biology, economics, and social science computations.

## When to Use

- Optimization (minimize, curve fitting, root finding)
- Numerical integration (ODE solving, quadrature)
- Interpolation and splines
- Signal processing (FFT, filtering, spectral analysis)
- Sparse matrix operations
- Statistical distributions and hypothesis testing
- Spatial data structures (KD-tree, Delaunay)

## Quick Start

```python
from scipy import optimize, integrate, interpolate, signal, stats, sparse, spatial
import numpy as np

# Optimization: find minimum
result = optimize.minimize(lambda x: (x[0]-1)**2 + (x[1]-2.5)**2, x0=[0, 0])
print(result.x)  # [1.0, 2.5]

# Curve fitting
def model(x, a, b): return a * np.exp(-b * x)
params, cov = optimize.curve_fit(model, xdata, ydata, p0=[1, 0.1])

# Integration
value, error = integrate.quad(lambda x: np.exp(-x**2), 0, np.inf)

# ODE solving
from scipy.integrate import solve_ivp
sol = solve_ivp(lambda t, y: -y, [0, 10], [1], dense_output=True)
```

## Core Capabilities

### 1. Optimization (scipy.optimize)

```python
from scipy.optimize import minimize, minimize_scalar, curve_fit, root_scalar

# Unconstrained minimization
result = minimize(lambda x: x[0]**2 + x[1]**2, x0=[1, 1], method='Nelder-Mead')

# With bounds and constraints
from scipy.optimize import Bounds, LinearConstraint
result = minimize(objective, x0, method='SLSQP',
                  bounds=Bounds([0, 0], [10, 10]),
                  constraints={'type': 'eq', 'fun': lambda x: x[0] + x[1] - 5})

# 1D optimization
res = minimize_scalar(lambda x: (x - 2)**2, bounds=(0, 5), method='bounded')

# Root finding
root = root_scalar(lambda x: x**3 - x - 1, bracket=[1, 2])

# Curve fitting with confidence intervals
def model(x, a, b, c): return a * np.exp(-b * x) + c
popt, pcov = curve_fit(model, xdata, ydata, p0=[1, 0.1, 0], sigma=yerr)
perr = np.sqrt(np.diag(pcov))  # Standard errors
```

### 2. Statistical Functions (scipy.stats)

```python
from scipy import stats

# Descriptive
stats.describe(data)                    # N, minmax, mean, variance, skew, kurtosis

# Distributions
rv = stats.norm(loc=0, scale=1)
rv.pdf(0)                               # Probability density
rv.cdf(1.96)                            # P(X ≤ 1.96) ≈ 0.975
rv.ppf(0.975)                           # Inverse CDF ≈ 1.96
rv.rvs(size=1000)                       # Random samples

# Hypothesis tests
stats.ttest_ind(group1, group2)          # Independent t-test
stats.ttest_rel(before, after)           # Paired t-test
stats.mannwhitneyu(group1, group2)       # Non-parametric
stats.wilcoxon(before, after)            # Paired non-parametric
stats.ks_2samp(sample1, sample2)         # Distribution comparison
stats.pearsonr(x, y)                     # Correlation + p-value
stats.spearmanr(x, y)                    # Rank correlation
stats.chi2_contingency(table)            # Chi-square test
stats.f_oneway(group1, group2, group3)   # ANOVA

# Multiple comparison correction
from scipy.stats import false_discovery_control
corrected_p = false_discovery_control(p_values, method='bh')
```

### 3. Integration and ODEs (scipy.integrate)

```python
from scipy.integrate import quad, dblquad, solve_ivp, odeint

# Single integral
val, err = quad(lambda x: np.sin(x), 0, np.pi)

# Double integral
val, err = dblquad(lambda y, x: x*y, 0, 1, lambda x: 0, lambda x: 2)

# ODE system: dy/dt = f(t, y)
def lotka_volterra(t, y, a, b, c, d):
    return [a*y[0] - b*y[0]*y[1], -c*y[1] + d*y[0]*y[1]]

sol = solve_ivp(lotka_volterra, [0, 15], [10, 5],
                args=(1.5, 1, 3, 1), dense_output=True, max_step=0.01)
```

### 4. Signal Processing (scipy.signal)

```python
from scipy import signal

# FFT
freqs = np.fft.fftfreq(len(data), d=1/fs)
spectrum = np.abs(np.fft.fft(data))

# Filter design
b, a = signal.butter(4, 0.1, btype='low')       # Butterworth lowpass
filtered = signal.filtfilt(b, a, data)            # Zero-phase filter

# Spectrogram
f, t, Sxx = signal.spectrogram(data, fs=1000)
```

### 5. Interpolation (scipy.interpolate)

```python
from scipy.interpolate import interp1d, CubicSpline, griddata

# 1D interpolation
f_linear = interp1d(x, y, kind='linear')
f_cubic = interp1d(x, y, kind='cubic')
y_new = f_cubic(x_new)

# Cubic spline with natural boundary
cs = CubicSpline(x, y, bc_type='natural')

# 2D scattered data
z_grid = griddata(points, values, (x_grid, y_grid), method='cubic')
```

## Common Academic Workflows

### Nonlinear Curve Fitting with Confidence Bands

```python
from scipy.optimize import curve_fit
from scipy import stats

def fit_with_confidence(x, y, func, p0, confidence=0.95):
    popt, pcov = curve_fit(func, x, y, p0=p0)
    perr = np.sqrt(np.diag(pcov))

    # Confidence bands
    alpha = 1 - confidence
    n = len(y)
    p = len(popt)
    dof = max(0, n - p)
    t_val = stats.t.ppf(1 - alpha/2, dof)

    x_fine = np.linspace(x.min(), x.max(), 200)
    y_fit = func(x_fine, *popt)
    sigma = np.sqrt(np.diag(pcov))

    # Monte Carlo error propagation
    n_mc = 1000
    mc_params = np.random.multivariate_normal(popt, pcov, n_mc)
    mc_curves = np.array([func(x_fine, *p) for p in mc_params])
    y_lo = np.percentile(mc_curves, alpha/2*100, axis=0)
    y_hi = np.percentile(mc_curves, (1-alpha/2)*100, axis=0)

    return popt, perr, x_fine, y_fit, y_lo, y_hi
```

## Key Parameters

| Function | Key Param | Default | When to Adjust |
|----------|-----------|---------|----------------|
| `minimize(method)` | method | 'BFGS' | Use 'L-BFGS-B' for large-scale, 'SLSQP' for constraints |
| `curve_fit(p0)` | p0 | [1,1,...] | Always provide reasonable initial guess |
| `solve_ivp(method)` | method | 'RK45' | Use 'Radau' for stiff ODEs |
| `butter(order)` | order | — | Higher = sharper cutoff but more ringing |
| `stats tests` | alternative | 'two-sided' | Use 'greater' or 'less' for one-tailed |

## Best Practices

1. **Always provide p0 for curve_fit**: Default [1,1,...] often fails to converge
2. **Check solver convergence**: `result.success` and `result.message` before trusting results
3. **Use method='Radau' for stiff ODEs**: Chemical kinetics, control systems
4. **Validate numerical integration**: Compare with known analytical solutions
5. **Use filtfilt, not lfilter**: Zero-phase filtering avoids phase distortion

## Common Pitfalls

1. **curve_fit local minimum**: Try multiple p0 starting points
2. **ODE solver divergence**: Reduce max_step or switch to stiff solver
3. **FFT frequency axis**: Use np.fft.fftfreq, not manual linspace
4. **Singular matrix in stats**: Check for collinear data
5. **Boundary effects in filtering**: Use mode='mirror' or pad data

## Integration with HBE

- Primary scientific computing engine in `references/statistical-analysis-guide.md`
- Supports `references/causal-inference-guide.md` for optimization-based methods
- Works with `references/data-processing-guide.md` for signal processing
- See `references/tools/statsmodels.md` for econometric-specific analysis

## Resources

- Documentation: https://docs.scipy.org/doc/scipy/
- Virtanen et al. (2020) "SciPy 1.0" — Nature Methods paper
