---
name: cirq
description: Google quantum computing framework — quantum circuit construction, simulation, and algorithm development
domain: Physics / Quantum Computing
install: pip install cirq
---

# cirq — Google Quantum Computing Framework / Google 量子计算框架

Construct quantum circuits, simulate noisy quantum hardware, and develop quantum algorithms with native support for Google's Sycamore processor architecture.

## When to Use / 适用场景

- Implementing quantum algorithms (Grover, QAOA, VQE) with near-hardware fidelity / 以接近硬件的保真度实现量子算法
- Simulating quantum circuits with realistic noise models / 使用真实噪声模型模拟量子电路
- Running parameter sweeps to study circuit behavior across parameter spaces / 运行参数扫描研究电路行为
- Developing circuits targeting Google Sycamore hardware / 开发面向 Google Sycamore 硬件的电路
- Exporting circuits to QASM for cross-platform compatibility / 导出电路为 QASM 以实现跨平台兼容

## Quick Start / 快速开始

```python
import cirq

q0, q1, q2 = cirq.LineQubit.range(3)

# Build a Bell state circuit
circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key="result"),
)
print("Circuit:")
print(circuit)

# Simulate and collect statistics
simulator = cirq.Simulator()
result = simulator.run(circuit, repetitions=1000)
histogram = result.histogram(key="result")
print(f"\nMeasurement histogram: {histogram}")

# Parametric circuit example
theta = cirq.Symbol("theta")
param_circuit = cirq.Circuit(
    cirq.Ry(theta)(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key="m"),
)
sweep = cirq.Linspace(key="theta", start=0, stop=3.14159, length=10)
results = simulator.run_sweep(param_circuit, sweep, repetitions=100)
for i, r in enumerate(results):
    print(f"theta={sweep[i].params['theta']:.2f}: {r.histogram(key='m')}")
```

## Core Capabilities / 核心能力

### 1. Noise Models and Noisy Simulation / 噪声模型与含噪模拟

Simulate circuits with realistic hardware noise including depolarization, amplitude damping, and readout errors.

```python
import cirq

q0, q1 = cirq.LineQubit.range(2)

# Define noise model with depolarizing noise
noise_model = cirq.NoiseModel.from_noise_model_like(cirq.depolarize(p=0.01))

circuit = cirq.Circuit(
    cirq.H(q0), cirq.CNOT(q0, q1), cirq.measure(q0, q1, key="result"),
)

simulator = cirq.Simulator(noise=noise_model)
result = simulator.run(circuit, repetitions=1000)
print(f"Noisy result: {result.histogram(key='result')}")

# Custom noise: amplitude damping + readout error
damped_circuit = circuit.with_noise(cirq.amplitude_damp(gamma=0.05))
result_damped = cirq.Simulator().run(damped_circuit, repetitions=1000)

circuit_with_readout = cirq.Circuit(
    cirq.H(q0), cirq.CNOT(q0, q1),
    cirq.bit_flip(p=0.02).on(q0),
    cirq.bit_flip(p=0.02).on(q1),
    cirq.measure(q0, q1, key="result"),
)
```

### 2. Circuit Optimization Passes / 电路优化编译

Apply optimization passes to reduce gate count and circuit depth for efficient hardware execution.

```python
import cirq

q0, q1, q2 = cirq.LineQubit.range(3)

circuit = cirq.Circuit(
    cirq.X(q0), cirq.X(q0),         # X * X = I (should cancel)
    cirq.H(q1), cirq.Z(q1),         # HZH = X (should simplify)
    cirq.CNOT(q1, q2), cirq.CNOT(q1, q2),  # CNOT^2 = I
    cirq.measure(q0, q1, q2, key="m"),
)
print(f"Before optimization: {len(list(circuit.all_operations()))} operations")

optimized = cirq.optimize_for_target_gateset(
    circuit, gateset=cirq.google.optimized_for_sycamore,
)
print(f"After optimization: {len(list(optimized.all_operations()))} operations")
```

### 3. Device Specification and Qubit Mapping / 设备规格与量子比特映射

Target circuits to specific hardware topologies with connectivity constraints.

```python
import cirq
import cirq.google as cg

device = cg.Sycamore
qubits = cirq.GridQubit.rect(2, 3)

circuit = cirq.Circuit(
    cirq.H(qubits[0]),
    cg.SQRT_ISWAP(qubits[0], qubits[1]),
    cg.SQRT_ISWAP(qubits[1], qubits[2]),
    cirq.measure(*qubits, key="m"),
)

try:
    device.validate_circuit(circuit)
    print("Circuit is valid for Sycamore")
except ValueError as e:
    print(f"Invalid: {e}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Bernstein-Vazirani Algorithm with Noise Analysis / 含噪 Bernstein-Vazirani 算法

Implement the BV algorithm and analyze robustness under increasing noise levels.

```python
import cirq
import numpy as np

def bernstein_vazirani(secret_string: str, noise_level: float = 0.0) -> dict:
    n = len(secret_string)
    qubits = cirq.LineQubit.range(n + 1)

    oracle = cirq.Circuit()
    for i, bit in enumerate(secret_string):
        if bit == "1":
            oracle.append(cirq.CNOT(qubits[i], qubits[n]))

    circuit = cirq.Circuit(
        cirq.X(qubits[n]),
        cirq.H.on_each(*qubits),
        oracle,
        cirq.H.on_each(*qubits[:n]),
        cirq.bit_flip(noise_level).on_each(*qubits[:n]) if noise_level > 0 else [],
        cirq.measure(*qubits[:n], key="result"),
    )

    simulator = cirq.Simulator()
    result = simulator.run(circuit, repetitions=100)
    counts = result.histogram(key="result")
    decoded = bin(max(counts, key=counts.get))[2:].zfill(n)
    return {"secret": secret_string, "decoded": decoded, "correct": decoded == secret_string}

secret = "1011001"
noise_levels = [0.0, 0.01, 0.02, 0.05, 0.1, 0.15, 0.2]
print(f"Secret: {secret} (length {len(secret)})")
print(f"{'Noise':<10} {'Decoded':<10} {'Correct':<10} {'Success Rate'}")
print("-" * 45)

for noise in noise_levels:
    n_correct = sum(1 for _ in range(20) if bernstein_vazirani(secret, noise)["correct"])
    r = bernstein_vazirani(secret, noise)
    print(f"{noise:<10.2f} {r['decoded']:<10} {r['correct']:<10} {n_correct/20:.1%}")
```

### Workflow 2: Cirq-to-QASM Export / QASM 导出

Export circuits to OpenQASM 2.0/3.0 for cross-platform reproducibility.

```python
import cirq

q0, q1, q2 = cirq.LineQubit.range(3)
circuit = cirq.Circuit(
    cirq.H(q0), cirq.CNOT(q0, q1), cirq.Rz(0.5)(q1),
    cirq.CNOT(q1, q2), cirq.measure(q0, q1, q2, key="result"),
)

qasm2 = cirq.to_qasm(circuit)
qasm3 = cirq.qasm3.dumps(circuit)
with open("circuit.qasm", "w") as f:
    f.write(qasm3)
```

## Best Practices / 最佳实践

- Use `cirq.Simulator()` for exact simulation and `cirq.DensityMatrixSimulator()` when noise is present.
- Prefer `cirq.GridQubit` over `cirq.LineQubit` when targeting Google hardware to match the physical qubit layout.
- Use `cirq.decompose` to break custom gates into native hardware gates before validation.
- For parameter sweeps, use `cirq.Zip` and `cirq.Product` to combine multiple sweeps in a single `run_sweep` call.

## Common Pitfalls / 常见陷阱

- **Gate compatibility**: Not all gates are available on all devices. Use `cirq.google.SYC_GATESET` and `cirq.optimize_for_target_gateset` for decomposition.
- **Measurement key collisions**: If multiple subcircuits use the same key, Cirq silently merges results. Use unique keys per measurement group.
- **Symbol resolution**: `cirq.Symbol("theta")` creates a free parameter. Resolve it with `cirq.resolve_parameters` or provide a `Sweep` to `run_sweep`.
- **Qubit ordering**: `result.histogram()` uses integer keys by default. Use `result.multi_measurement_histogram()` for custom formatting.
- **Large circuit memory**: State vector simulation requires 2^n memory. Beyond ~25 qubits, switch to density matrix simulation with noise.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/quantum-simulation.md` for developing and benchmarking quantum algorithms with noise analysis.
- Pair with `references/tools/qutip.md` to compare Cirq's gate-level simulation with QuTiP's master equation approach.
- Combine with `references/tools/pennylane.md` to cross-validate VQE implementations between frameworks.
- Use with `references/tools/matplotlib.md` for plotting noise scaling curves and algorithm success rates.

## Resources / 资源

- Documentation: https://quantumai.google/cirq
- GitHub: https://github.com/quantumlib/Cirq
- Tutorials: https://quantumai.google/cirq/tutorials
- Quantum Engine API: https://quantumai.google/cirq/cloud
- OpenQASM Support: https://quantumai.google/cirq/qasm
