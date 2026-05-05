---
name: timesfm-forecasting
description: Time Series Foundation Model — pretrained zero-shot time series forecasting from Google
domain: ML / Time Series
install: pip install timesfm
---

# timesfm-forecasting — Time Series Foundation Model (TimesFM)

TimesFM (Times Foundation Model) is Google's pretrained time series foundation model capable of zero-shot forecasting. Trained on billions of time series points, it can forecast unseen time series without fine-tuning, making it a strong baseline for forecasting benchmarks and a rapid prototyping tool.

## When to Use

- Zero-shot time series forecasting without training data
- Establishing strong baselines for time series benchmarks
- Rapid forecasting prototyping before building custom models
- Multivariate or univariate time series prediction tasks
- Comparing foundation model performance against task-specific models

## Quick Start

```python
import timesfm
import pandas as pd
import numpy as np

# Load the pretrained model (downloads on first use)
# Use a context length and prediction horizon
tfm = timesfm.TimesFm(
    context_length=512,
    horizon_length=128,
    input_patch_size=32,
    output_patch_size=128,
    num_layers=20,
    model_dims=1280,
    backend="cpu",  # use "gpu" for CUDA
)

# Prepare time series data
# Input: numpy array of shape (num_series, context_length)
# The model forecasts the next horizon_length steps
ts = np.sin(np.linspace(0, 20 * np.pi, 512)) + np.random.randn(512) * 0.1
input_ts = ts.reshape(1, -1)  # (1 series, 512 steps)

# Zero-shot forecast
forecasts = tfm.forecast(input_ts)
print(f"Forecast shape: {forecasts.shape}")  # (1, 128)
print(f"Forecast values: {forecasts[0, :5]}")
```

## Core Capabilities

### Forecasting with Pandas Integration

```python
import timesfm
import pandas as pd
import numpy as np

tfm = timesfm.TimesFm(
    context_length=512,
    horizon_length=64,
    input_patch_size=32,
    output_patch_size=64,
    num_layers=20,
    model_dims=1280,
    backend="cpu",
)

# Create a DataFrame with multiple time series
dates = pd.date_range("2020-01-01", periods=1024, freq="D")
df = pd.DataFrame({
    "date": dates,
    "series_a": np.cumsum(np.random.randn(1024)) + 50,
    "series_b": np.sin(np.linspace(0, 50, 1024)) * 10 + 100,
})

# Prepare inputs: take the last context_length points
context_len = 512
inputs = df[["series_a", "series_b"]].values[-context_len:].T  # (2, 512)

# Forecast
forecasts = tfm.forecast(inputs)  # (2, 64)
forecast_dates = pd.date_range(df["date"].iloc[-1], periods=64 + 1, freq="D")[1:]

forecast_df = pd.DataFrame({
    "date": forecast_dates,
    "series_a_forecast": forecasts[0],
    "series_b_forecast": forecasts[1],
})
print(forecast_df.head())
```

### Zero-Shot vs. Fine-Tuned Comparison

```python
import timesfm
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error

tfm = timesfm.TimesFm(
    context_length=256,
    horizon_length=32,
    input_patch_size=32,
    output_patch_size=32,
    num_layers=20,
    model_dims=1280,
    backend="cpu",
)

# Evaluate on a held-out time series
full_ts = np.cumsum(np.random.randn(1000))
context = full_ts[:-32].reshape(1, -1)  # train/observed window
actual = full_ts[-32:]                   # true future values

# Zero-shot forecast
zeroshot_forecast = tfm.forecast(context)[0]

# Naive baseline (last value)
naive_forecast = np.full(32, full_ts[-33])

# Compare
print(f"TimesFM MAE:  {mean_absolute_error(actual, zeroshot_forecast):.4f}")
print(f"Naive MAE:    {mean_absolute_error(actual, naive_forecast):.4f}")
print(f"TimesFM RMSE: {mean_squared_error(actual, zeroshot_forecast):.4f}")
print(f"Naive RMSE:   {mean_squared_error(actual, naive_forecast):.4f}")
```

### Handling Multiple Frequencies and Seasonality

```python
import timesfm
import pandas as pd
import numpy as np

tfm = timesfm.TimesFm(
    context_length=512,
    horizon_length=128,
    input_patch_size=32,
    output_patch_size=128,
    num_layers=20,
    model_dims=1280,
    backend="cpu",
    freq="D",  # daily frequency hint (optional)
)

# Weekly seasonal data
t = np.arange(512)
weekly_ts = 10 * np.sin(2 * np.pi * t / 7) + np.random.randn(512) * 0.5
input_data = weekly_ts.reshape(1, -1)

forecast = tfm.forecast(input_data)
print(f"Weekly seasonal forecast (first 14 days): {forecast[0, :14].round(2)}")

# Monthly seasonal data (approx)
monthly_ts = 20 * np.sin(2 * np.pi * t / 30) + t * 0.1 + np.random.randn(512) * 0.5
input_monthly = monthly_ts.reshape(1, -1)
forecast_monthly = tfm.forecast(input_monthly)
print(f"Monthly trend forecast: {forecast_monthly[0, :5].round(2)}")
```

## Common Academic Workflow: Benchmark Evaluation

```python
import timesfm
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error
from pathlib import Path

tfm = timesfm.TimesFm(
    context_length=512,
    horizon_length=96,
    input_patch_size=32,
    output_patch_size=96,
    num_layers=20,
    model_dims=1280,
    backend="cpu",
)

# Evaluate on multiple time series from a benchmark
benchmark_dir = Path("data/etth1/")  # electricity transformer temperature
results = []

for ts_file in sorted(benchmark_dir.glob("*.npy")):
    full_ts = np.load(ts_file)  # shape: (T,)
    # Sliding window evaluation
    for start in range(0, len(full_ts) - 512 - 96, 96):
        context = full_ts[start:start + 512].reshape(1, -1)
        actual = full_ts[start + 512:start + 512 + 96]
        forecast = tfm.forecast(context)[0]

        mae = mean_absolute_error(actual, forecast)
        results.append({"file": ts_file.stem, "start": start, "MAE": mae})

import pandas as pd
results_df = pd.DataFrame(results)
print(f"TimesFM Mean MAE: {results_df['MAE'].mean():.4f}")
print(f"TimesFM Median MAE: {results_df['MAE'].median():.4f}")
print(results_df.groupby("file")["MAE"].mean().to_string())
```

## Best Practices

- **Match context length to your data**: Use longer contexts (512+) for seasonal data; shorter contexts (64-256) are fine for non-seasonal series.
- **Use GPU backend** (`backend="gpu"`) for faster inference, especially when evaluating many series.
- **Normalize inputs** if series have very different scales — the model works best with roughly standardized values.
- **Compare against simple baselines** (naive, seasonal naive, ARIMA) before claiming foundation model superiority.

## Common Pitfalls

- **Context length mismatch**: The input array must have exactly `context_length` columns. Pad or truncate as needed.
- **Out-of-distribution frequencies**: TimesFM was trained on common frequencies (daily, hourly, weekly). Exotic frequencies may degrade performance.
- **GPU memory**: The model requires ~2-4 GB GPU memory. Use CPU backend or reduce batch size on constrained hardware.
- **Non-stationary trends**: The model handles trends reasonably but may drift on extremely non-stationary series. Consider differencing first.

## Integration with HBE

- Use within `workflows/experiment-design.md` for time series benchmark design
- Pair with `references/tools/pandas.md` for time series data loading and manipulation
- Combine with `references/tools/matplotlib.md` for forecast visualization and comparison plots
- Use alongside `references/tools/optuna.md` for tuning task-specific models to compare against TimesFM

## Resources

- Documentation: https://github.com/google-research/timesfm
- Paper: Das et al., "A Decoder-Only Foundation Model for Time-Series Forecasting" (2024)
- Model sizes: TimesFM-1.0 (200M params) and TimesFM-2.0 (2B params)
