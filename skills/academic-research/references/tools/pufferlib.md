---
name: pufferlib
description: Reinforcement learning environments — high-performance game environments for RL research and training
domain: ML / Reinforcement Learning
install: pip install pufferlib
---

# pufferlib — High-Performance RL Environments

PufferLib provides a suite of high-performance, vectorized reinforcement learning environments designed for large-scale RL training. It wraps multiple game environments (Atari, Procgen, NetHack, MegaMan, etc.) into a unified API that supports synchronous and asynchronous parallel execution, making it ideal for training RL agents at scale.

## When to Use

- Training RL agents on game environments (Atari, Procgen, NetHack, etc.)
- Benchmarking reinforcement learning algorithms on standardized game tasks
- Running large-scale distributed RL training with parallel environments
- Prototyping new RL algorithms with fast, vectorized environment stepping
- Researching emergent behavior in multi-agent or procedural game environments

## Quick Start

```python
import pufferlib
import pufferlib.emulation
import pufferlib.environments

# Create a vectorized Atari environment
env = pufferlib.environments.atari.make("Breakout-v4", num_envs=8, frame_skip=4)
obs = env.reset()  # shape: (8, 84, 84, 4) for 8 parallel environments
print(f"Observation shape: {obs.shape}")
print(f"Action space: {env.action_space}")
print(f"Number of parallel envs: {env.num_envs}")

# Step the environment
actions = env.action_space.sample()  # random actions
obs, rewards, dones, infos = env.step(actions)
print(f"Rewards: {rewards}")
print(f"Dones: {dones}")

# Clean up
env.close()
```

## Core Capabilities

### Unified Environment API

```python
import pufferlib.environments as penv

# Atari games
atari = penv.atari.make("Pong-v4", num_envs=16, frame_skip=4, sticky_actions=True)

# Procgen — procedurally generated games
procgen = penv.procgen.make("bigfish", num_envs=32, distribution_mode="hard")

# Gymnasium / Gym compatibility
gym_env = penv.gymnasium.make("CartPole-v1", num_envs=8)

# NetHack — the classic roguelike
nethack = penv.nethack.make("NetHackScore-v0", num_envs=4, character="mon-hum-neu-mal")

# All environments share the same API
for env in [atari, procgen, gym_env]:
    obs = env.reset()
    obs, rewards, dones, infos = env.step(env.action_space.sample())
    env.close()
```

### PPO Integration with CleanRL-Style Training

```python
import torch
import torch.nn as nn
import pufferlib.environments as penv
import pufferlib.models

# Create environment
env = penv.atari.make("Breakout-v4", num_envs=64, frame_skip=4)
obs_shape = env.observation_space.shape
action_shape = env.action_space.n

# Define a policy network
class Policy(nn.Module):
    def __init__(self, obs_shape, action_dim):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(obs_shape[0], 32, 8, stride=4), nn.ReLU(),
            nn.Conv2d(32, 64, 4, stride=2), nn.ReLU(),
            nn.Conv2d(64, 64, 3, stride=1), nn.ReLU(),
            nn.Flatten(),
            nn.Linear(64 * 7 * 7, 512), nn.ReLU(),
        )
        self.policy = nn.Linear(512, action_dim)
        self.value = nn.Linear(512, 1)

    def forward(self, x):
        x = x.float() / 255.0  # normalize pixel values
        features = self.conv(x)
        return self.policy(features), self.value(features)

# Training loop (simplified PPO)
policy = Policy(obs_shape, action_shape).cuda()
optimizer = torch.optim.Adam(policy.parameters(), lr=2.5e-4, eps=1e-5)

obs = env.reset()
for update in range(1000):
    for step in range(128):
        logits, values = policy(torch.tensor(obs).cuda())
        dist = torch.distributions.Categorical(logits=logits)
        actions = dist.sample()
        log_probs = dist.log_prob(actions)

        obs, rewards, dones, infos = env.step(actions.cpu().numpy())
        # Store transitions for PPO update...
        # (full PPO implementation would include GAE, clipping, etc.)

    # PPO update step
    # optimizer.step()
    if update % 100 == 0:
        print(f"Update {update}: mean reward = {rewards.mean():.2f}")

env.close()
```

### Custom Environment Wrapping

```python
import pufferlib
import pufferlib.environments
import numpy as np

# Wrap a custom environment into PufferLib's API
class CustomEnv:
    def __init__(self):
        self.observation_space = pufferlib.emulation.GymSpace("Box", (4,), np.float32)
        self.action_space = pufferlib.emulation.GymSpace("Discrete", 2)
        self.state = np.zeros(4, dtype=np.float32)

    def reset(self):
        self.state = np.random.randn(4).astype(np.float32)
        return self.state

    def step(self, action):
        self.state += np.random.randn(4) * 0.1
        reward = float(np.sum(self.state))
        done = abs(np.sum(self.state)) > 10.0
        return self.state, reward, done, {}

# Register with PufferLib
def make_custom(num_envs=1):
    return pufferlib.emulation.VectorEnv(CustomEnv, num_envs=num_envs)

env = make_custom(num_envs=8)
obs = env.reset()
print(f"Custom env obs shape: {obs.shape}")  # (8, 4)
env.close()
```

## Common Academic Workflow: Benchmark RL Algorithm

```python
import torch
import pufferlib.environments as penv
import numpy as np
import json
import time

# 1. Define benchmark games
games = ["Breakout-v4", "Pong-v4", "SpaceInvaders-v4", "Seaquest-v4", "Enduro-v4"]
results = {}

for game in games:
    env = penv.atari.make(game, num_envs=16, frame_skip=4)
    policy = Policy(env.observation_space.shape, env.action_space.n).cuda()

    # 2. Train
    start_time = time.time()
    reward_history = []
    for update in range(500):
        obs = env.reset()
        episode_rewards = np.zeros(env.num_envs)
        for step in range(128):
            with torch.no_grad():
                logits, _ = policy(torch.tensor(obs).cuda())
            actions = torch.distributions.Categorical(logits=logits).sample()
            obs, rewards, dones, infos = env.step(actions.cpu().numpy())
            episode_rewards += rewards

            # PPO training step would go here...

        reward_history.append(episode_rewards.mean())

    elapsed = time.time() - start_time
    results[game] = {
        "final_reward": float(reward_history[-1]),
        "best_reward": float(max(reward_history)),
        "wall_time_min": elapsed / 60,
    }
    print(f"{game}: final={reward_history[-1]:.1f}, best={max(reward_history):.1f}, time={elapsed/60:.1f}m")
    env.close()

# 3. Save benchmark results
with open("rl_benchmark_results.json", "w") as f:
    json.dump(results, f, indent=2)
```

## Best Practices

- **Use `num_envs >= 64`** for stable training — more parallel environments reduce variance in gradient estimates.
- **Frame skip 4** is standard for Atari environments and significantly speeds up training.
- **Normalize observations** (pixel values to [0, 1]) before feeding into the policy network.
- **Use NoFrameskip-v4** variants for reproducibility — avoid versions with random frame skips.
- **Monitor `episode_reward`** across updates, not just step-level rewards.

## Common Pitfalls

- **Sticky actions**: Atari environments have sticky actions (repeated actions with probability). Set `sticky_actions=True` for standard evaluation.
- **Observation format**: Ensure your policy expects the correct observation shape (e.g., (84, 84, 4) for frame-stacked Atari).
- **Memory scaling**: Each environment holds its own state. Monitor GPU/CPU memory with large `num_envs`.
- **Seed management**: Set seeds for reproducibility: `env.seed(42)` before `env.reset()`.

## Integration with HBE

- Use within `workflows/experiment-design.md` for RL experiment design and benchmark setup
- Pair with `references/tools/pytorch.md` for policy network implementation and training loops
- Combine with `references/tools/matplotlib.md` for reward curves and learning progress visualization
- Use alongside `references/tools/wandb.md` for experiment tracking and hyperparameter logging

## Resources

- Documentation: https://pufferlib.readthedocs.io/
- GitHub: https://github.com/puffer-ai/pufferlib
- CleanRL: https://github.com/vwxyzjn/cleanrl (reference PPO implementation)
- Procgen: https://github.com/openai/progen
