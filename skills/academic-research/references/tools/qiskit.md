---
name: qiskit
description: Quantum computing SDK. Use for building, simulating, and running quantum circuits, quantum algorithms (VQE, QAOA), and quantum machine learning.
domain: physics
install: pip install qiskit
---

# Qiskit: Quantum Computing

## Overview

Qiskit is IBM's open-source quantum computing SDK for building quantum circuits, running simulations, and executing on real quantum hardware. Used for quantum algorithms, quantum chemistry, and quantum ML research.

## When to Use

- Building and simulating quantum circuits
- Quantum algorithms (VQE, QAOA, Grover, Shor)
- Quantum chemistry simulations
- Quantum machine learning
- Research on NISQ devices

## Quick Start

```python
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

# Build circuit
qc = QuantumCircuit(2, 2)
qc.h(0)              # Hadamard on qubit 0
qc.cx(0, 1)          # CNOT: control=0, target=1
qc.measure([0, 1], [0, 1])

# Simulate
simulator = AerSimulator()
compiled = transpile(qc, simulator)
result = simulator.run(compiled, shots=1024).result()
counts = result.get_counts()
print(counts)  # {'00': ~512, '11': ~512}
```

## Core Capabilities

### 1. Quantum Circuit Construction

```python
qc = QuantumCircuit(3, 3)
qc.h(0)                    # Hadamard
qc.x(1)                    # Pauli-X
qc.cx(0, 1)                # CNOT
qc.ccx(0, 1, 2)            # Toffoli
qc.rz(np.pi/4, 0)         # Rz rotation
qc.barrier()
qc.measure_all()

# Custom gates
from qiskit.circuit.library import QFT
qc.append(QFT(3), [0, 1, 2])
```

### 2. Variational Algorithms (VQE)

```python
from qiskit.circuit.library import EfficientSU2
from qiskit_algorithms import VQE
from qiskit.primitives import Estimator

ansatz = EfficientSU2(4, reps=2)
vqe = VQE(Estimator(), ansatz, optimizer)
result = vqe.compute_minimum_eigenvalue(hamiltonian)
print(f'Ground state energy: {result.eigenvalue:.6f}')
```

### 3. Visualization

```python
qc.draw('mpl', style='iqp')        # Circuit diagram
qc.draw('text')                      # ASCII art
from qiskit.visualization import plot_histogram, plot_bloch_multivector
plot_histogram(counts)                # Measurement histogram
plot_bloch_multivector(statevector)   # Bloch sphere
```

## Best Practices

1. **Use transpile**: Optimize circuits for target hardware
2. **Set seed for reproducibility**: ` AerSimulator(seed_simulator=42)`
3. **Use shots ≥ 1024**: For statistical significance
4. **Check circuit depth**: `qc.depth()` — lower is better for NISQ

## Integration with HBE

- Quantum computing tool in `references/tool-registry.md`
- Supports physics research workflows
- See `references/tools/pennylane.md` for quantum ML alternative

## Resources

- Documentation: https://docs.quantum.ibm.com/
- Textbook: https://github.com/Qiskit/textbook
