---
name: stable-baselines3
description: Reliable reinforcement learning implementations — PPO, SAC, DQN, A2C, TD3 with scikit-learn-like API
domain: ML / Reinforcement Learning
install: pip install stable-baselines3
---

# Stable Baselines3 — Reinforcement Learning / 强化学习

Stable Baselines3 (SB3) provides clean, tested implementations of deep reinforcement learning algorithms with a simple, scikit-learn-inspired API. Includes PPO, SAC, DQN, A2C, TD3, DDPG, and HER.

## When to Use / 适用场景

- Training RL agents with standard algorithms (PPO, SAC, DQN, etc.)
- Benchmarking RL algorithms on Gym/Gymnasium environments
- Robotics, game AI, resource management, control systems
- Academic research requiring reproducible RL baselines

## Quick Start / 快速开始

```python
import gymnasium as gym
from stable_baselines3 import PPO

# Create environment and model
env = gym.make("CartPole-v1")
model = PPO("MlpPolicy", env, verbose=1)

# Train
model.learn(total_timesteps=100_000)

# Evaluate
obs, _ = env.reset()
for _ in range(100):
    action, _ = model.predict(obs, deterministic=True)
    obs, reward, terminated, truncated, info = env.step(action)
    if terminated or truncated:
        obs, _ = env.reset()

# Save
model.save("ppo_cartpole")
```

## Core Capabilities / 核心能力

### 1. Algorithm Selection / 算法选择

```python
from stable_baselines3 import PPO, SAC, DQN, A2C, TD3, DDPG

# Discrete actions → DQN, PPO, A2C
# Continuous actions → SAC, PPO, TD3, DDPG, A2C

# PPO (most versatile)
model = PPO("MlpPolicy", env, learning_rate=3e-4, n_steps=2048, batch_size=64, n_epochs=10)

# SAC (sample-efficient continuous)
model = SAC("MlpPolicy", env, learning_rate=3e-4, buffer_size=100_000, batch_size=256)

# DQN (discrete, off-policy)
model = DQN("MlpPolicy", env, learning_rate=1e-4, buffer_size=100_000, learning_starts=1000)
```

### 2. Custom Policies / 自定义策略网络

```python
from stable_baselines3 import PPO

# Custom network architecture
policy_kwargs = dict(
    net_arch=dict(pi=[256, 256], vf=[256, 256])  # Separate policy and value networks
)
model = PPO("MlpPolicy", env, policy_kwargs=policy_kwargs)

# For image observations (CNN)
model = PPO("CnnPolicy", env)

# For multi-agent or custom features
policy_kwargs = dict(
    net_arch=[256, 256],
    activation_fn=torch.nn.ReLU
)
```

### 3. Callbacks and Monitoring / 回调与监控

```python
from stable_baselines3.common.callbacks import (
    EvalCallback, CheckpointCallback, CallbackList
)
from stable_baselines3.common.monitor import Monitor

# Evaluation callback
eval_env = Monitor(gym.make("CartPole-v1"))
eval_callback = EvalCallback(
    eval_env,
    best_model_save_path="./logs/best/",
    log_path="./logs/results/",
    eval_freq=5000,
    n_eval_episodes=10,
    deterministic=True
)

# Checkpoint callback
checkpoint_callback = CheckpointCallback(
    save_freq=10_000,
    save_path="./logs/checkpoints/",
    name_prefix="ppo_model"
)

# Train with callbacks
model.learn(total_timesteps=200_000, callback=CallbackList([eval_callback, checkpoint_callback]))
```

### 4. Evaluation / 评估

```python
from stable_baselines3.common.evaluation import evaluate_policy

# Evaluate
mean_reward, std_reward = evaluate_policy(model, env, n_eval_episodes=20)
print(f"Mean reward: {mean_reward:.2f} ± {std_reward:.2f}")

# Load and evaluate
model = PPO.load("ppo_cartpole")
mean_reward, std_reward = evaluate_policy(model, env, n_eval_episodes=100)
```

### 5. Vectorized Environments / 向量化环境

```python
from stable_baselines3.common.vec_env import SubprocVecEnv, VecNormalize

# Parallel environments
def make_env(rank):
    def _init():
        return gym.make("HalfCheetah-v4")
    return _init

vec_env = SubprocVecEnv([make_env(i) for i in range(8)])

# Normalize observations and rewards
vec_env = VecNormalize(vec_env, norm_obs=True, norm_reward=True, clip_obs=10.0)

model = PPO("MlpPolicy", vec_env)
model.learn(total_timesteps=1_000_000)
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Benchmark Comparison / 算法基准对比

```python
import gymnasium as gym
from stable_baselines3 import PPO, SAC, A2C, TD3
from stable_baselines3.common.evaluation import evaluate_policy
import pandas as pd

env_name = "HalfCheetah-v4"
algorithms = {"PPO": PPO, "SAC": SAC, "A2C": A2C, "TD3": TD3}
results = []

for name, AlgoClass in algorithms.items():
    env = gym.make(env_name)
    model = AlgoClass("MlpPolicy", env, verbose=0)
    model.learn(total_timesteps=200_000)
    mean_r, std_r = evaluate_policy(model, env, n_eval_episodes=20)
    results.append({"algorithm": name, "mean_reward": mean_r, "std_reward": std_r})
    print(f"{name}: {mean_r:.2f} ± {std_r:.2f}")

df = pd.DataFrame(results)
```

## Key Parameters / 关键参数

| Parameter | Context | Typical Values |
|-----------|---------|----------------|
| `learning_rate` | All algorithms | 3e-4 (default) |
| `n_steps` | PPO, A2C | 2048 (PPO), 5 (A2C) |
| `batch_size` | All | 64-256 |
| `buffer_size` | SAC, TD3, DQN | 100K-1M |
| `gamma` | Discount factor | 0.99 (default) |
| `n_epochs` | PPO | 10 |

## Best Practices / 最佳实践

- Use `EvalCallback` to track performance during training
- Run ≥3 seeds and report mean ± std
- Use `VecNormalize` for continuous control environments
- Match algorithm to action space: discrete→DQN/PPO, continuous→SAC/PPO
- Normalize rewards for MuJoCo environments

## Common Pitfalls / 常见陷阱

- **Gym vs Gymnasium**: SB3 v2.x uses `gymnasium`; older code uses `gym`
- **Reward scaling**: Unnormalized rewards can destabilize training
- **Overfitting**: Agents may overfit to training environment; test on variations
- **Seed sensitivity**: RL results vary significantly across seeds; always report multiple

## Integration with HBE / 与 HBE 集成

- Use with `references/tools/pytorch-lightning.md` for custom training loops
- Pair with `references/tools/matplotlib.md` for learning curve plots
- Combine with `references/tools/pandas.md` for benchmark result tables
- Integrate with `workflows/experiment-design.md` for RL experiment design

## Resources / 资源

- Documentation: https://stable-baselines3.readthedocs.io/
- RL Zoo: https://github.com/DLR-RM/rl-baselines3-zoo
- Tutorial: https://stable-baselines3.readthedocs.io/en/master/guide/rl_tips.html
