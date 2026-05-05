---
name: simpy
description: Discrete event simulation — process-based modeling of queues, resources, and systems for operations research
domain: Operations Research / Engineering
install: pip install simpy
---

# simpy — Discrete Event Simulation / 离散事件仿真

Process-based discrete event simulation framework for modeling queues, resource contention, and complex systems in operations research, healthcare logistics, and supply chain analysis.

## When to Use / 适用场景

- Modeling hospital emergency department patient flow and wait times (模拟医院急诊科患者流动与等候时间)
- Analyzing queueing systems (M/M/c, M/G/1) with non-standard arrival/service distributions (分析非标准到达/服务分布的排队系统)
- Evaluating resource allocation strategies before implementation (在实施前评估资源分配策略)
- Simulating manufacturing production lines with bottlenecks and buffers (模拟含瓶颈和缓冲区的制造生产线)
- Supply chain logistics with stochastic lead times and demand (含随机提前期和需求的供应链物流仿真)

## Quick Start / 快速开始

```python
import simpy
import random

random.seed(42)

def customer(env, name, counter, mean_service):
    """A customer arrives, waits for service, then leaves."""
    arrive = env.now
    print(f"[{env.now:.1f}s] {name} arrives")
    with counter.request() as request:
        yield request  # wait until a server is free
        wait = env.now - arrive
        print(f"[{env.now:.1f}s] {name} waits {wait:.1f}s, starts service")
        service_time = random.expovariate(1.0 / mean_service)
        yield env.timeout(service_time)
        print(f"[{env.now:.1f}s] {name} finishes service")

env = simpy.Environment()
counter = simpy.Resource(env, capacity=2)  # 2 servers
for i in range(5):
    env.process(customer(env, f"Cust-{i}", counter, mean_service=3.0))
    env.timeout(random.expovariate(1.0 / 2.0))
env.run(until=30)
```

## Core Capabilities / 核心能力

### 1. Resources, Stores, and Containers / 资源、存储与容器

simpy provides three resource types with different semantics for modeling capacity constraints and material flows.

```python
import simpy

env = simpy.Environment()

# Resource: discrete units (e.g., servers, machines, nurses)
staff = simpy.Resource(env, capacity=3)
def patient(env, name, staff):
    with staff.request() as req:
        yield req
        yield env.timeout(5)
env.process(patient(env, "P1", staff))
env.run(until=10)

# PreemptiveResource: higher-priority jobs can interrupt lower ones
server = simpy.PreemptiveResource(env, capacity=1)
def low_priority(env, server):
    with server.request(priority=10) as req:
        yield req
        try:
            yield env.timeout(20)
        except simpy.Interrupt:
            print("Interrupted by higher priority job!")
def high_priority(env, server):
    with server.request(priority=1) as req:
        yield req
        yield env.timeout(5)

# Container: continuous amounts (e.g., fuel tank, water reservoir)
tank = simpy.Container(env, init=100, capacity=200)
tank.get(30)   # remove 30 units
tank.put(50)   # add 50 units

# Store: unbounded storage of Python objects (e.g., parts buffer)
buffer = simpy.Store(env, capacity=10)
buffer.put("part-A")
item = yield buffer.get()
```

### 2. Data Collection and Monitoring / 数据收集与监控

Track simulation metrics such as queue lengths, wait times, and utilization rates for statistical analysis.

```python
import simpy
import random

class ClinicMonitor:
    """Collects statistics from an outpatient clinic simulation."""
    def __init__(self):
        self.wait_times = []
        self.service_times = []
        self.system_times = []
        self.queue_length_series = []  # (time, queue_length) pairs

def patient_process(env, name, doctor, monitor):
    arrive = env.now
    monitor.queue_length_series.append((env.now, len(doctor.queue)))
    with doctor.request() as req:
        yield req
        wait = env.now - arrive
        monitor.wait_times.append(wait)
        service = random.expovariate(1.0 / 8.0)  # mean 8 min
        yield env.timeout(service)
        monitor.service_times.append(service)
        monitor.system_times.append(env.now - arrive)

env = simpy.Environment()
monitor = ClinicMonitor()
doctor = simpy.Resource(env, capacity=2)

def patient_generator(env, doctor, monitor, arrival_rate=0.3):
    i = 0
    while True:
        env.process(patient_process(env, f"P{i}", doctor, monitor))
        i += 1
        yield env.timeout(random.expovariate(arrival_rate))

env.process(patient_generator(env, doctor, monitor))
env.run(until=480)  # 8-hour day in minutes
print(f"Mean wait: {sum(monitor.wait_times)/len(monitor.wait_times):.1f} min")
print(f"Patients served: {len(monitor.system_times)}")
```

### 3. Events, Timeouts, and Process Interaction / 事件、超时与进程交互

simpy's event system supports complex process coordination including waiting for multiple conditions.

```python
import simpy

def worker(env, name, task_queue):
    while True:
        task = yield task_queue.get()
        print(f"[{env.now}] {name} processing {task}")
        yield env.timeout(3)

def manager(env, task_queue, deadline):
    for i in range(5):
        task_queue.put(f"Task-{i}")
        yield env.timeout(1)
    try:
        yield env.timeout(deadline)
        print(f"[{env.now}] Deadline reached with {len(task_queue.items)} remaining")
    except simpy.Interrupt:
        print("Manager interrupted")

env = simpy.Environment()
task_queue = simpy.Store(env)
env.process(worker(env, "W1", task_queue))
env.process(worker(env, "W2", task_queue))
env.process(manager(env, task_queue, deadline=10))
env.run()
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Hospital Emergency Department Simulation / 医院急诊科仿真

```python
import simpy
import random
import numpy as np

random.seed(42)
np.random.seed(42)

class EDResults:
    def __init__(self):
        self.waits = {"triage": [], "doctor": [], "bed": []}
        self.left_without_seen = 0
        self.total_patients = 0

def ed_simulation(n_beds=20, n_doctors=3, n_triage=2, sim_hours=24, warmup=4):
    results = EDResults()
    env = simpy.Environment()

    triage = simpy.Resource(env, capacity=n_triage)
    doctors = simpy.Resource(env, capacity=n_doctors)
    beds = simpy.Resource(env, capacity=n_beds)

    def patient(env):
        results.total_patients += 1
        with triage.request() as req:
            wait_start = env.now
            result = yield req | env.timeout(30)
            if not req.processed:
                results.left_without_seen += 1
                return
            results.waits["triage"].append(env.now - wait_start)
            yield env.timeout(random.expovariate(1.0 / 5.0))

        with doctors.request() as req:
            yield req
            results.waits["doctor"].append(env.now - wait_start)
            yield env.timeout(random.expovariate(1.0 / 15.0))

        with beds.request() as req:
            yield req
            results.waits["bed"].append(env.now - wait_start)
            stay = random.expovariate(1.0 / (180 if random.random() > 0.1 else 720))
            yield env.timeout(stay)

    def arrivals(env):
        while True:
            yield env.timeout(random.expovariate(8.0))
            env.process(patient(env))

    env.process(arrivals(env))
    env.run(until=sim_hours * 60)
    return results

results = ed_simulation()
print(f"Patients: {results.total_patients}, LWBS: {results.left_without_seen}")
for stage, waits in results.waits.items():
    if waits:
        print(f"  {stage} mean wait: {np.mean(waits):.1f} min (n={len(waits)})")
```

## Best Practices / 最佳实践

- **Always include a warm-up period**: Initial transient conditions bias statistics. Run the simulation for a warm-up period, discard results, then collect data. For queueing systems, warm-up is typically 5-10x the mean system time.
- **Run multiple replications with different seeds**: A single replication is a single sample from a stochastic process. Report means with 95% confidence intervals from at least 30 replications.
- **Use preemptive resources for priority-based triage**: In healthcare, use `PreemptiveResource` to model clinical priority where urgent patients can interrupt routine ones.
- **Validate against analytical results**: For simple cases (e.g., M/M/1 queue), compare simulation output against the Erlang-C formula. This validates your model before extending to complex scenarios.

## Common Pitfalls / 常见陷阱

- **Forgetting to `yield` on events**: In simpy, `env.timeout(x)` creates an event but does not pause the process unless you `yield` it. This is the single most common bug — it causes processes to execute instantly without waiting.
- **Using the same random seed without varying it for replications**: If you run 30 replications with `random.seed(42)`, you get 30 identical runs. Increment the seed per replication: `random.seed(42 + i)`.
- **Not accounting for time units consistently**: Mixing minutes and hours in a single simulation leads to orders-of-magnitude errors. Pick one unit (usually minutes for healthcare, hours for logistics) and enforce it throughout.
- **Infinite loops without a stopping condition**: Patient generator processes that loop forever must have a bounded simulation time via `env.run(until=T)`. Without it, the simulation never terminates.

## Integration with HBE / 与 HBE 集成

- Use within `workflows/experiment-design.md` for simulation-based study design
- Pair with `references/tools/matplotlib.md` for wait time histograms and queue length time series
- Combine with `references/tools/numpy.md` for confidence interval calculations across replications

## Resources / 资源

- Documentation: https://simpy.readthedocs.io/
- GitHub: https://github.com/pySimPy/SimPy
- Tutorial: https://simpy.readthedocs.io/en/latest/examples/index.html
