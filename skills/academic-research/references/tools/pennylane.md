---
name: pennylane
description: Quantum machine learning framework — differentiable quantum circuits for QML and VQE
domain: Physics / Quantum ML
install: pip install pennylane
---

# pennylane — Quantum Machine Learning Framework / 量子机器学习框架

Build differentiable quantum circuits for variational quantum algorithms (VQE, QAOA), quantum machine learning, and quantum chemistry simulations with automatic gradient computation.

## When to Use / 适用场景

- Variational Quantum Eigensolver (VQE) for molecular ground state energies / 变分量子本征求解器计算分子基态能量
- Quantum Approximate Optimization Algorithm (QAOA) for combinatorial problems / 量子近似优化算法求解组合优化问题
- Quantum neural networks and hybrid quantum-classical models / 量子神经网络与混合量子经典模型
- Computing molecular Hamiltonians and properties with PennyLane-QChem / 使用 PennyLane-QChem 计算分子哈密顿量
- Benchmarking quantum gradients (parameter-shift, adjoint method) / 基准测试量子梯度方法

## Quick Start / 快速开始

```python
import pennylane as qml
from pennylane import numpy as np

dev = qml.device("default.qubit", wires=2)

@qml.qnode(dev, diff_method="parameter-shift")
def circuit(params):
    qml.RY(params[0], wires=0)
    qml.RZ(params[1], wires=0)
    qml.CNOT(wires=[0, 1])
    qml.RY(params[2], wires=1)
    return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))

params = np.array([0.5, 0.3, 0.1], requires_grad=True)
optimizer = qml.GradientDescentOptimizer(stepsize=0.1)

for i in range(100):
    params, cost = optimizer.step_and_cost(circuit, params)
    if i % 20 == 0:
        print(f"Step {i}: cost = {cost:.6f}")

print(f"Optimized parameters: {params}")
print(f"Final cost: {circuit(params):.6f}")
```

## Core Capabilities / 核心能力

### 1. VQE for Molecular Hamiltonians / 分子哈密顿量的 VQE

Compute ground state energies of molecules using hardware-efficient variational ansatz.

```python
import pennylane as qml
from pennylane import numpy as np
from pennylane.qchem import molecular_hamiltonian

symbols = ["H", "H"]
geometry = np.array([[0.0, 0.0, 0.0], [0.0, 0.0, 0.74]])

electrons, orbitals = 2, 4
H, qubits = molecular_hamiltonian(
    symbols, geometry, charge=0, mult=1,
    basis="sto-3g", active_electrons=electrons, active_orbitals=orbitals,
)

dev = qml.device("default.qubit", wires=qubits)

@qml.qnode(dev, diff_method="parameter-shift")
def vqe_circuit(params, n_layers=2):
    for layer in range(n_layers):
        for i in range(qubits):
            qml.RY(params[layer * qubits + i], wires=i)
        for i in range(qubits - 1):
            qml.CNOT(wires=[i, i + 1])
        qml.CNOT(wires=[qubits - 1, 0])
    return qml.expval(H)

n_layers, n_params = 2, 2 * qubits
params = np.random.uniform(0, 2 * np.pi, n_params, requires_grad=True)
opt = qml.AdamOptimizer(stepsize=0.01)

for step in range(200):
    params, energy = opt.step_and_cost(vqe_circuit, params)
    if step % 40 == 0:
        print(f"Step {step}: E = {energy:.6f} Ha")

print(f"VQE ground state energy: {energy:.6f} Ha (Exact FCI: -1.1373 Ha)")
```

### 2. QAOA for Combinatorial Optimization / 组合优化的 QAOA

Solve MaxCut and other combinatorial optimization problems with QAOA.

```python
import pennylane as qml
from pennylane import numpy as np
import networkx as nx

edges = [(0, 1), (1, 2), (2, 3), (3, 0), (0, 2)]
graph = nx.Graph(edges)
n_qubits = graph.number_of_nodes()

cost_h = sum(-1.0 * qml.PauliZ(i) @ qml.PauliZ(j) for i, j in edges)
mixer_h = sum(qml.PauliX(i) for i in range(n_qubits))

dev = qml.device("default.qubit", wires=n_qubits)

def qaoa_layer(gamma, beta):
    qml.Hadamard(wires=range(n_qubits))
    for i, j in edges:
        qml.CNOT(wires=[i, j])
        qml.RZ(2 * gamma, wires=j)
        qml.CNOT(wires=[i, j])
    for i in range(n_qubits):
        qml.RX(2 * beta, wires=i)

@qml.qnode(dev)
def qaoa_circuit(params):
    qml.layer(qaoa_layer, len(params) // 2, params)
    return qml.expval(cost_h)

p = 3
params = np.random.uniform(0, np.pi, 2 * p, requires_grad=True)
opt = qml.AdamOptimizer(stepsize=0.05)

for step in range(150):
    params, cost = opt.step_and_cost(qaoa_circuit, params)
    if step % 30 == 0:
        print(f"Step {step}: MaxCut cost = {-cost:.4f}")
```

### 3. Gradient Computation Methods / 梯度计算方法

Compare parameter-shift, finite-diff, and adjoint gradient methods.

```python
import pennylane as qml
from pennylane import numpy as np
import time

dev = qml.device("default.qubit", wires=10)

@qml.qnode(dev)
def circuit(params):
    for i in range(10):
        qml.RY(params[i], wires=i)
    for i in range(9):
        qml.CNOT(wires=[i, i + 1])
    return qml.expval(qml.PauliZ(0))

params = np.random.uniform(0, 2 * np.pi, 10, requires_grad=True)

for method in ["parameter-shift", "finite-diff", "adjoint"]:
    try:
        dev_m = qml.device("default.qubit", wires=10)
        qnode = qml.qnode(dev_m, diff_method=method)(circuit)
        start = time.perf_counter()
        grad = qml.grad(qnode)(params)
        elapsed = time.perf_counter() - start
        print(f"{method:20s}: grad_norm = {np.linalg.norm(grad):.6f}, time = {elapsed:.4f}s")
    except Exception as e:
        print(f"{method:20s}: not available ({e})")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: VQE Benchmark for H2 Dissociation Curve / H2 解离曲线 VQE 基准测试

Compute the potential energy surface of H2 across bond lengths for comparison with exact FCI.

```python
import pennylane as qml
from pennylane import numpy as np
from pennylane.qchem import molecular_hamiltonian

symbols = ["H", "H"]
bond_lengths = np.arange(0.3, 2.5, 0.15)
energies, exact_energies = [], []

for r in bond_lengths:
    geometry = np.array([[0.0, 0.0, 0.0], [0.0, 0.0, r]])
    H, qubits = molecular_hamiltonian(
        symbols, geometry, charge=0, mult=1,
        basis="sto-3g", active_electrons=2, active_orbitals=2,
    )
    dev = qml.device("default.qubit", wires=qubits)

    @qml.qnode(dev, diff_method="parameter-shift")
    def vqe(params):
        for i in range(qubits):
            qml.RY(params[i], wires=i)
        qml.CNOT(wires=[0, 1])
        return qml.expval(H)

    params = np.zeros(qubits, requires_grad=True)
    opt = qml.GradientDescentOptimizer(stepsize=0.4)
    for _ in range(100):
        params, energy = opt.step_and_cost(vqe, params)
    energies.append(energy)
    exact_energies.append(np.min(np.linalg.eigvalsh(qml.matrix(H))))
    print(f"R = {r:.2f} A: VQE = {energy:.6f} Ha, Exact = {exact_energies[-1]:.6f} Ha")

import matplotlib.pyplot as plt
plt.plot(bond_lengths, energies, "o-", label="VQE")
plt.plot(bond_lengths, exact_energies, "s--", label="FCI")
plt.xlabel("Bond Length (A)"); plt.ylabel("Energy (Ha)")
plt.legend(); plt.savefig("h2_dissociation.pdf", bbox_inches="tight")
```

## Best Practices / 最佳实践

- Use `diff_method="adjoint"` for circuits with many parameters (>20) -- it scales independently of parameter count.
- Use `active_space` reduction in PennyLane-QChem to limit qubits. For LiH, `active_electrons=4, active_orbitals=6` reduces 12 to 6 qubits.
- Set `shots=None` for analytic gradients during optimization; switch to `shots=1000` only when measuring shot noise effects.
- Use `qml.draw(circuit)(params)` to verify circuit structure before running expensive optimization loops.
- For reproducibility, fix the random seed with `np.random.seed(42)` and record `qml.version()`.

## Common Pitfalls / 常见陷阱

- **Parameter-shift requires specific gates**: Only works with `exp(-i theta H/2)` gates. Unsupported gates silently fall back to finite differences.
- **QChem dependency on OpenFermion**: Install with `pip install pennylane-qchem` and check compatibility with your Python environment.
- **Barren plateau**: Deep circuits with many qubits exhibit vanishing gradients. Start with shallow circuits (1-3 layers) and increase gradually.
- **Circuit compilation differences**: The same circuit may compile differently on `default.qubit` vs hardware backends.
- **Memory for large Hamiltonians**: The molecular Hamiltonian matrix grows exponentially. Use active space reduction or qubit tapering.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/quantum-simulation.md` for variational quantum algorithm development and benchmarking.
- Pair with `references/tools/qutip.md` for hybrid workflows where QuTiP provides exact solutions and PennyLane provides variational approximations.
- Combine with `references/tools/matplotlib.md` for plotting energy convergence and dissociation curves.
- Use with `references/tools/wandb.md` to track VQE optimization runs across different ansatz depths.

## Resources / 资源

- Documentation: https://docs.pennylane.ai/
- PennyLane-QChem: https://docs.pennylane.ai/en/stable/code/qchem.html
- GitHub: https://github.com/PennyLaneAI/pennylane
- Demos and Tutorials: https://pennylane.ai/demos/
