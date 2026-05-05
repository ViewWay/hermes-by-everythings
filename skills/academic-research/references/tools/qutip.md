---
name: qutip
description: Quantum Toolbox in Python — quantum optics, open quantum systems, and master equation solvers
domain: Physics / Quantum Optics
install: pip install qutip
---

# qutip — Quantum Toolbox in Python / 量子光学工具箱

Simulate open and closed quantum systems with master equation solvers, Monte Carlo trajectories, and visualization tools for quantum optics research.

## When to Use / 适用场景

- Simulating Jaynes-Cummings, Rabi, and cavity QED models / 模拟 Jaynes-Cummings、Rabi 和腔 QED 模型
- Solving Lindblad master equations for open quantum systems / 求解开放量子系统的 Lindblad 主方程
- Computing quantum correlation functions and emission spectra / 计算量子关联函数和发射光谱
- Visualizing quantum states on Bloch spheres and Wigner functions / 在 Bloch 球和 Wigner 函数上可视化量子态
- Simulating quantum computing primitives and gate operations / 模拟量子计算原语和门操作

## Quick Start / 快速开始

```python
import qutip as qt
import numpy as np

# Define quantum states and operators
psi0 = qt.basis(2, 0)           # Spin-up |0>
psi1 = qt.basis(2, 1)           # Spin-down |1>
sigma_x = qt.sigmax()
sigma_z = qt.sigmaz()
H = 0.5 * 2 * np.pi * sigma_x  # Hamiltonian with frequency 1 Hz

# Time evolution under the Schrodinger equation
tlist = np.linspace(0, 2, 200)
result = qt.sesolve(H, psi0, tlist, e_ops=[sigma_z])
expectation_z = result.expect[0]

# Open system: spontaneous emission via Lindblad master equation
gamma = 2 * np.pi * 0.1  # Decay rate
collapse_ops = [np.sqrt(gamma) * qt.destroy(2)]  # sigma-
result_open = qt.mesolve(H, psi0, tlist, collapse_ops, e_ops=[sigma_z])
```

## Core Capabilities / 核心能力

### 1. Master Equation Solver (mesolve) / 主方程求解器

Solve the Lindblad master equation for open quantum system dynamics with arbitrary collapse operators.

```python
import qutip as qt
import numpy as np

# Jaynes-Cummings model: two-level atom coupled to a cavity
N = 15  # Cavity Fock space truncation
omega_a = 2 * np.pi * 1.0   # Atom frequency
omega_c = 2 * np.pi * 1.0   # Cavity frequency
g = 2 * np.pi * 0.1          # Atom-cavity coupling

a = qt.destroy(N)                          # Cavity annihilation
sm = qt.sigmam()                           # Atom lowering
H_jc = omega_a * qt.sigmaz() / 2 + omega_c * a.dag() * a + g * (a.dag() * sm + a * sm.dag())

# Dissipation: cavity decay and atom spontaneous emission
kappa = 2 * np.pi * 0.05   # Cavity decay rate
gamma = 2 * np.pi * 0.01   # Atom decay rate
c_ops = [np.sqrt(kappa) * a, np.sqrt(gamma) * sm]

psi0 = qt.tensor(qt.basis(2, 0), qt.basis(N, 0))  # Excited atom, vacuum cavity
tlist = np.linspace(0, 50, 500)
result = qt.mesolve(H_jc, psi0, tlist, c_ops, e_ops=[a.dag() * a, qt.sigmaz()])
n_cavity = result.expect[0]   # Average photon number
sz = result.expect[1]         # <sigma_z>
```

### 2. Monte Carlo Trajectories (mcsolve) / 蒙特卡洛量子轨迹

Simulate individual quantum trajectories to study measurement back-action and quantum jumps.

```python
import qutip as qt
import numpy as np

omega = 2 * np.pi * 1.0
gamma = 2 * np.pi * 0.2
H = omega * qt.sigmaz() / 2
c_ops = [np.sqrt(gamma) * qt.sigmam()]
psi0 = qt.basis(2, 0)  # Excited state

tlist = np.linspace(0, 15, 300)
ntraj = 500
mc_result = qt.mcsolve(H, psi0, tlist, c_ops, e_ops=[qt.sigmaz()], ntraj=ntraj)

# mc_result.expect[0] has shape (ntraj, len(tlist))
avg_sz = np.mean(mc_result.expect[0], axis=0)  # Average over trajectories
std_sz = np.std(mc_result.expect[0], axis=0)   # Quantum jumps visible in std
```

### 3. Bloch Sphere and Wigner Visualization / Bloch 球与 Wigner 函数可视化

Visualize quantum states on the Bloch sphere and plot Wigner quasi-probability distributions.

```python
import qutip as qt

# Bloch sphere: track qubit state evolution
b = qt.Bloch()
tlist = np.linspace(0, 2 * np.pi, 30)
states = qt.sesolve(qt.sigmax(), qt.basis(2, 0), tlist).states
b.add_states(states)
b.show()

# Wigner function for a Schrodinger cat state
N = 40
alpha = 2.0
cat = (qt.coherent(N, alpha) + qt.coherent(N, -alpha)).unit()
qt.plot_wigner(cat, alpha_max=5)

# Wigner function for a Fock state |5>
fock5 = qt.fock(N, 5)
qt.plot_wigner(fock5, alpha_max=5)
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Jaynes-Cummings Model with Dissipation / 带耗散的 Jaynes-Cummings 模型

Complete simulation of atom-cavity interaction with dissipation, computing vacuum Rabi splitting and emission spectrum.

```python
import qutip as qt
import numpy as np

N = 20
g = 2 * np.pi * 0.1
kappa = 2 * np.pi * 0.005
gamma = 2 * np.pi * 0.05

a = qt.tensor(qt.qeye(2), qt.destroy(N))
sm = qt.tensor(qt.sigmam(), qt.qeye(N))
sz = qt.tensor(qt.sigmaz(), qt.qeye(N))
H = g * (a.dag() * sm + a * sm.dag())
c_ops = [np.sqrt(kappa) * a, np.sqrt(gamma) * sm]

psi0 = qt.tensor(qt.basis(2, 0), qt.basis(N, 0))
tlist = np.linspace(0, 100, 2000)
result = qt.mesolve(H, psi0, tlist, c_ops, e_ops=[a.dag() * a, sz])

# Compute emission spectrum via correlation function
tcorr = np.linspace(0, 30, 300)
corr = qt.correlation_2op_1t(H, psi0, tcorr, c_ops, a.dag(), a)

from scipy.fft import fft, fftfreq, fftshift
dt = tcorr[1] - tcorr[0]
spectrum = np.abs(fftshift(fft(corr)))**2
freqs = fftshift(fftfreq(len(tcorr), dt))

import matplotlib.pyplot as plt
plt.figure(figsize=(10, 4))
plt.subplot(121)
plt.plot(tlist, result.expect[0], label="Cavity photon <n>")
plt.plot(tlist, (result.expect[1] + 1) / 2, label="Atom excited P_e")
plt.xlabel("Time"); plt.legend()
plt.subplot(122)
plt.plot(freqs, spectrum)
plt.xlabel("Frequency"); plt.ylabel("Spectrum")
plt.xlim([-0.5, 0.5]); plt.tight_layout()
plt.savefig("jaynes_cummings_dynamics.pdf", bbox_inches="tight")
```

## Best Practices / 最佳实践

- Choose Fock space truncation `N` carefully: for cavity photon numbers up to `n_max`, set `N >= 3 * n_max` to avoid truncation artifacts.
- Use `mesolve` for ensemble averages and `mcsolve` only when individual trajectories or jump statistics are needed.
- Use `qt.parallel_map` or set `qutip.settings.num_cpus` to parallelize Monte Carlo trajectories across CPU cores.
- Use `qt.steadystate(H, c_ops)` to find the steady-state density matrix directly instead of evolving to long times.
- For correlation functions, prefer `qt.correlation_2op_1t` over manual time-evolution loops -- it uses the quantum regression theorem.

## Common Pitfalls / 常见陷阱

- **Fock space truncation errors**: Too small `N` causes unphysical reflection at the boundary. Monitor population in the highest Fock state and increase `N`.
- **Collapse operator normalization**: Lindblad operators must be correctly normalized. Check units of rates match your Hamiltonian.
- **Tensor product ordering**: `qt.tensor(state1, state2)` puts `state1` in the first subsystem. Be consistent across all operators.
- **Monte Carlo convergence**: Use at least 500 trajectories for reliable ensemble averages, or switch to `mesolve`.
- **Memory for large systems**: Hilbert space dimension grows exponentially. A system of 10 qubits requires 1024x1024 density matrices.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/quantum-simulation.md` for quantum optics and open quantum system simulations.
- Pair with `references/tools/matplotlib.md` for publication-quality plots of Bloch spheres and Wigner functions.
- Combine with `references/tools/pennylane.md` for hybrid workflows where QuTiP simulates the environment and PennyLane handles variational optimization.

## Resources / 资源

- Documentation: https://qutip.readthedocs.io/
- GitHub: https://github.com/qutip/qutip
- Lectures and Tutorials: https://qutip.readthedocs.io/en/stable/qutip-tutorials.html
- QuTiP 5 Release Notes: https://qutip.readthedocs.io/en/stable/release-notes.html
