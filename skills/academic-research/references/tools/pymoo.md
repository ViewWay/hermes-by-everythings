---
name: pymoo
description: Multi-objective optimization — NSGA-II, NSGA-III, MOEA/D, RNSGA-II for engineering design and Pareto-optimal decision-making
domain: Physics / Engineering
install: pip install pymoo
---

# pymoo — Multi-Objective Optimization / 多目标优化框架

State-of-the-art multi-objective evolutionary algorithms for finding Pareto-optimal solutions in engineering design, scheduling, and decision-making problems.

## When to Use / 适用场景

- Optimizing conflicting objectives in engineering design (e.g., minimize cost vs maximize strength) (优化工程设计中相互冲突的目标)
- Generating Pareto fronts for trade-off analysis in operations research (生成帕累托前沿以进行运筹学中的权衡分析)
- Constrained multi-objective optimization with mixed integer and continuous variables (含混合整数和连续变量的约束多目标优化)
- Benchmarking new algorithms against standard test suites (ZDT, DTLZ, WFG) (在标准测试集上对新算法进行基准测试)
- Selecting optimal solutions from a Pareto set using pseudo-weights or TOPSIS (使用伪权重或 TOPSIS 从帕累托集中选择最优解)

## Quick Start / 快速开始

```python
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.problems import get_problem
from pymoo.optimize import minimize
from pymoo.visualization.scatter import Scatter

# Use a built-in benchmark problem (ZDT1 has 2 objectives, 30 variables)
problem = get_problem("zdt1")

# Configure NSGA-II algorithm
algorithm = NSGA2(pop_size=100)

# Run optimization for 200 generations
result = minimize(
    problem,
    algorithm,
    seed=1,
    termination=("n_gen", 200),
    verbose=True
)

# Visualize the Pareto front
Scatter().add(result.F).show()
print(f"Number of Pareto-optimal solutions: {len(result.F)}")
```

## Core Capabilities / 核心能力

### 1. Custom Problem Definition / 自定义问题定义

Define problems with any number of objectives, constraints, and mixed variable types (real, integer, binary).

```python
import numpy as np
from pymoo.core.problem import Problem
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.optimize import minimize

class BeamDesignProblem(Problem):
    """Minimize weight and deflection of a cantilever beam subject to stress constraint."""
    def __init__(self):
        super().__init__(
            n_var=2,            # width, height
            n_obj=2,            # weight, deflection
            n_ieq_constr=1,     # stress <= allowable
            xl=np.array([0.01, 0.01]),  # lower bounds (m)
            xu=np.array([0.1, 0.3])     # upper bounds (m)
        )

    def _evaluate(self, X, out, *args, **kwargs):
        width, height = X[:, 0], X[:, 1]
        length, force, E, rho = 1.0, 1000.0, 200e9, 7850.0
        out["F"] = np.column_stack([
            width * height,
            force * length**3 / (3 * E * width * height**3 / 12)
        ])
        stress = 6 * force * length / (width * height**2)
        out["G"] = stress - 250e6

problem = BeamDesignProblem()
result = minimize(problem, NSGA2(pop_size=200), termination=("n_gen", 300), seed=1)
```

### 2. Algorithm Selection and Termination / 算法选择与终止条件

pymoo implements a wide range of algorithms. Choose based on problem structure: number of objectives, constraints, and computational budget.

```python
from pymoo.algorithms.moo.nsga2 import NSGA2
from pymoo.algorithms.moo.nsga3 import NSGA3
from pymoo.algorithms.moo.moead import MOEAD
from pymoo.algorithms.moo.rnsga2 import RNSGA2
from pymoo.algorithms.moo.age import AGEMOEA
from pymoo.termination import get_termination

# NSGA-II: classic, works well for 2-3 objectives
algo_nsga2 = NSGA2(pop_size=100, sampling="lhs")  # Latin Hypercube Sampling

# NSGA-III: better for many-objective problems (4+ objectives)
from pymoo.util.ref_dirs import get_reference_directions
ref_dirs = get_reference_directions("das-dennis", 4, n_partitions=12)
algo_nsga3 = NSGA3(pop_size=100, ref_dirs=ref_dirs)

# MOEA/D: decomposition-based, good for well-structured Pareto fronts
algo_moead = MOEAD(pop_size=100)

# RNSGA-II: reference-point based, finds solutions near user preferences
prefs = np.array([[0.05, 0.02], [0.03, 0.04]])
algo_rnsga2 = RNSGA2(pop_size=100, epsilon=0.01, reference_points=prefs)

# Termination criteria
term_gen = get_termination("n_gen", 500)
term_time = get_termination("time", 60)
term_ftol = get_termination("ftol", 1e-6, n_last=30)
term_combo = term_gen & term_time
```

### 3. Post-Optimization Decision-Making / 优化后决策

After obtaining a Pareto set, use decision-making tools to select a single solution based on preferences.

```python
from pymoo.decision import cdist, pseudoweights, high_tradeoff

# Pseudo-weights: assign importance to each objective (e.g., equal weight)
weights = np.array([0.5, 0.5])
i = pseudoweights(result.F, weights)
print(f"Selected solution (equal weight): F = {result.F[i]}")

# Find high trade-off solutions (balanced across objectives)
i_tradeoff = high_tradeoff(result.F)
print(f"Knee point: F = {result.F[i_tradeoff]}")

# Minimum distance to an ideal/utopia point
ideal = result.F.min(axis=0)
dists = cdist(result.F, ideal.reshape(1, -1)).flatten()
i_ideal = np.argmin(dists)
print(f"Closest to ideal: F = {result.F[i_ideal]}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Engineering Design Optimization with Pareto Visualization / 工程设计优化与帕累托可视化

```python
import numpy as np
from pymoo.core.problem import Problem
from pymoo.algorithms.moo.age import AGEMOEA
from pymoo.optimize import minimize
from pymoo.visualization.scatter import Scatter
from pymoo.performance_indicator.hv import Hypervolume
from pymoo.termination import get_termination

class TrussProblem(Problem):
    def __init__(self):
        super().__init__(n_var=10, n_obj=3, n_ieq_constr=5,
                         xl=0.01, xu=0.05)
    def _evaluate(self, X, out, *args, **kwargs):
        rng = np.random.RandomState(42)
        out["F"] = np.column_stack([
            X.sum(axis=1) * 7850,
            np.abs(X @ rng.rand(10, 1)).flatten(),
            np.max(X, axis=1) * 1e6
        ])
        out["G"] = X[:, :5] - 0.03

problem = TrussProblem()
ref_point = np.array([50.0, 1.0, 500.0])

# Run with Hypervolume-based termination
hv = Hypervolume(ref_point=ref_point)
termination = get_termination("hv", ref_point=ref_point, threshold=0.001)
result = minimize(problem, AGEMOEA(pop_size=200), termination=termination, seed=1)

# Visualize pairwise objective scatter plots
Scatter(title="Mass vs Displacement").add(result.F[:, :2]).show()
Scatter(title="Mass vs Stress").add(result.F[:, [0, 2]]).show()
print(f"Hypervolume: {hv.do(result.F):.4f}")
print(f"Pareto set size: {len(result.F)}")
```

## Best Practices / 最佳实践

- **Always report Hypervolume (HV) as a performance metric**: HV captures both convergence to the Pareto front and diversity across it. Report HV with a clearly stated reference point in your methods section.
- **Use Latin Hypercube Sampling for initial populations**: The default random sampling can cluster in high-dimensional spaces. `sampling="lhs"` gives better coverage of the design space.
- **Set a random seed for reproducibility**: Multi-objective algorithms are stochastic. Always fix `seed=1` (or any integer) so results are reproducible across runs.
- **Validate against known benchmark problems**: Before applying to a novel problem, verify your implementation reproduces known Pareto fronts on ZDT1-ZDT6 or DTLZ1-DTLZ7.

## Common Pitfalls / 常见陷阱

- **Scaling objectives to similar magnitudes matters**: If one objective ranges [0, 1] and another [0, 10000], the algorithm may ignore the smaller one. Normalize objectives before optimization or use pymoo's built-in `Rescale` operator.
- **Population size too small for many objectives**: NSGA-II struggles with 4+ objectives unless the population is very large. Switch to NSGA-III or MOEA/D for many-objective problems (rule of thumb: pop_size > number of reference directions).
- **Constraint handling is not automatic**: pymoo uses constraint violation by default (CV > 0 means infeasible). If the feasible region is very small relative to the search space, most of the population may be infeasible. Consider using penalty-based approaches.
- **Termination by generation count alone is wasteful**: Use convergence-based termination (e.g., `ftol` on the objective space or Hypervolume stagnation) to stop early when the algorithm has converged.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for multi-objective study design and parameter sweeps
- Pair with `references/tools/matplotlib.md` for publication-quality Pareto front visualizations
- Combine with `references/tools/numpy.md` and `references/tools/scipy.md` for problem formulation and numerical checks

## Resources / 资源

- Documentation: https://pymoo.org/
- GitHub: https://github.com/anyoptimization/pymoo
- Benchmark problems: https://pymoo.org/problems/test_problems.html
