---
name: simpy-process
description: Process simulation — discrete event simulation for manufacturing workflows, supply chains, and logistics
domain: Engineering / Simulation
install: pip install simpy
---

# simpy-process — Process Simulation with SimPy

Provides discrete-event simulation (DES) capabilities for modeling manufacturing processes, supply chains, hospital workflows, and logistics systems. Built on top of SimPy, it adds domain-specific process templates, resource schedulers, and result collectors for engineering research.

## When to Use

- Simulating manufacturing production lines with machines, buffers, and operators
- Modeling hospital patient flow (ED, OR scheduling, bed allocation)
- Analyzing supply chain performance (inventory, lead times, bottlenecks)
- Comparing "what-if" scenarios for process optimization
- Capacity planning and resource utilization analysis

## Quick Start

```python
import simpy
import random

# Simple manufacturing line: machine -> inspection -> output
def machine_process(env, name, machine, results):
    while True:
        # Arrive at machine
        arrival = env.now
        with machine.request() as req:
            yield req
            # Processing time (exponential, mean=5 minutes)
            process_time = random.expovariate(1 / 5.0)
            yield env.timeout(process_time)
            # Inspection pass/fail
            passed = random.random() < 0.92
            results.append({
                "part": name,
                "arrival": arrival,
                "depart": env.now,
                "processing_time": process_time,
                "passed": passed,
            })

env = simpy.Environment()
machine = simpy.Resource(env, capacity=2)  # 2 parallel machines
results = []

# Start 50 parts arriving over time
for i in range(50):
    env.process(machine_process(env, f"P{i:03d}", machine, results))
    yield env.timeout(random.expovariate(1 / 3.0))  # inter-arrival ~3 min

env.run(until=500)  # simulate 500 minutes
print(f"Completed {len(results)} parts")
```

## Core Capabilities

### 1. Resource Modeling and Scheduling

```python
import simpy

def hospital_ward(env, ward_name, n_beds, patient_generator):
    """Model a hospital ward with bed allocation."""
    beds = simpy.Resource(env, capacity=n_beds)
    stats = {"admitted": 0, "rejected": 0, "total_los": 0}

    while True:
        patient = yield patient_generator
        if beds.count == 0:
            stats["rejected"] += 1
            continue

        with beds.request() as req:
            yield req
            stats["admitted"] += 1
            # Length of stay (lognormal, median=5 days)
            los = random.lognormvariate(1.6, 0.5)
            yield env.timeout(los)
            stats["total_los"] += los

        if stats["admitted"] % 100 == 0:
            avg_los = stats["total_los"] / stats["admitted"]
            print(f"[{env.now:.0f}d] {ward_name}: admitted={stats['admitted']}, "
                  f"rejected={stats['rejected']}, avg_LOS={avg_los:.1f}d")

env = simpy.Environment()
# Patient arrival process (Poisson, 8 per day)
def patient_gen(env):
    while True:
        yield env.timeout(random.expovariate(8 / 24))  # 8/day in hours
        yield env.timeout(0)  # signal

env.process(hospital_ward(env, "ICU", n_beds=20,
                          patient_generator=patient_gen(env)))
env.run(until=365 * 24)  # 1 year in hours
```

### 2. Multi-Stage Production Line

```python
import simpy
import random

class ProductionLine:
    def __init__(self, env, config):
        self.env = env
        self.stages = []
        for name, capacity, mean_time in config:
            self.stages.append({
                "name": name,
                "resource": simpy.Resource(env, capacity=capacity),
                "mean_time": mean_time,
                "completed": 0,
                "busy_time": 0,
            })

    def process_part(self, part_id):
        start = self.env.now
        for stage in self.stages:
            with stage["resource"].request() as req:
                yield req
                t = random.expovariate(1 / stage["mean_time"])
                stage["busy_time"] += t
                yield env.timeout(t)
            stage["completed"] += 1
        return self.env.now - start  # total throughput time

# Define line: 3 stages with different capacities
env = simpy.Environment()
line = ProductionLine(env, [
    ("CNC_Machining", capacity=2, mean_time=10),
    ("Heat_Treatment", capacity=1, mean_time=25),
    ("Quality_Inspection", capacity=3, mean_time=8),
])

results = []
for i in range(200):
    env.process(line.process_part(f"PART-{i}"))

env.run(until=5000)

for stage in line.stages:
    util = stage["busy_time"] / (env.now * stage["resource"].capacity)
    print(f"{stage['name']}: completed={stage['completed']}, utilization={util:.1%}")
```

### 3. Statistical Result Collection

```python
import simpy
import numpy as np
from collections import defaultdict

def run_replication(n_machines=2, arrival_rate=1/3, sim_time=500, seed=None):
    """Run a single replication and return KPIs."""
    random.seed(seed)
    env = simpy.Environment()
    machine = simpy.Resource(env, capacity=n_machines)
    throughput_times = []

    def process(env):
        t0 = env.now
        with machine.request() as req:
            wait_start = env.now
            yield req
            wait_time = env.now - wait_start
            yield env.timeout(random.expovariate(1 / 5.0))
        throughput_times.append({"wait": wait_time, "total": env.now - t0})

    def arrivals(env):
        while True:
            yield env.timeout(random.expovariate(arrival_rate))
            env.process(process(env))

    env.process(arrivals(env))
    env.run(until=sim_time)

    times = np.array([t["total"] for t in throughput_times])
    waits = np.array([t["wait"] for t in throughput_times])
    return {"mean_throughput": times.mean(), "std_throughput": times.std(),
            "mean_wait": waits.mean(), "p95_wait": np.percentile(waits, 95),
            "completed": len(throughput_times)}

# Run Monte Carlo with multiple replications
results = [run_replication(seed=i) for i in range(100)]
print(f"Mean throughput time: {np.mean([r['mean_throughput'] for r in results]):.1f} +/- "
      f"{np.std([r['mean_throughput'] for r in results]):.1f} min")
```

## Common Academic Workflow: Bottleneck Analysis

```python
# Compare different machine configurations
configs = {
    "baseline": [("Stage_A", 1, 10), ("Stage_B", 1, 25), ("Stage_C", 1, 8)],
    "balanced": [("Stage_A", 2, 10), ("Stage_B", 1, 25), ("Stage_C", 3, 8)],
    "buffered": [("Stage_A", 1, 10), ("Stage_B", 2, 25), ("Stage_C", 1, 8)],
}

summary = {}
for name, config in configs.items():
    results = [run_replication(
        n_machines=1, arrival_rate=1/3, sim_time=2000, seed=i
    ) for i in range(50)]
    summary[name] = {
        "throughput": np.mean([r["completed"] for r in results]),
        "p95_wait": np.mean([r["p95_wait"] for r in results]),
    }

import pandas as pd
pd.DataFrame(summary).T.to_csv("bottleneck_analysis.csv")
```

## Best Practices

1. Run at least 30 replications with different random seeds for statistically valid results
2. Warm up the simulation (discard initial transient) before collecting statistics
3. Use `simpy.Resource` with `capacity` > 1 to model parallel identical machines
4. Log event timestamps for post-hoc analysis and reproducibility
5. Validate the model against known analytical results (e.g., M/M/1 queue formulas)

## Common Pitfalls

1. **Infinite queues**: SimPy queues are unbounded by default; add queue capacity limits for realism
2. **Deterministic seeds**: Always vary seeds across replications; using the same seed gives identical results
3. **Zero-time events**: Avoid yielding `env.timeout(0)` in loops as it can cause infinite event storms
4. **Ignoring warm-up period**: Initial transient statistics bias results; discard the first 10-20% of simulation time

## Integration with HBE

- Use with `references/tools/numpy.md` and `references/tools/scipy.md` for statistical analysis
- Pair with `references/tools/matplotlib.md` for time-series and box plots of simulation results
- Combine with `references/tools/pandas.md` for organizing multi-replication output
- Supports `references/tool-registry.md` simulation tool chain

## Resources

- Documentation: https://simpy.readthedocs.io/
- Tutorial: https://simpy.readthedocs.io/en/latest/examples/index.html
- Source: https://github.com/ray-project/simpy (original) / https://simpy.readthedocs.io/
