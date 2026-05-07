---
name: flowio
description: Flow cytometry FCS file I/O — read, inspect, and extract data from Flow Cytometry Standard files
domain: biology / flow-cytometry
install: pip install flowio
---

# flowio

Lightweight Python library for reading Flow Cytometry Standard (FCS) files — the binary format used by flow cytometers and cell sorters. Provides access to channel metadata, event data (scatter and fluorescence), compensation matrices, and acquisition parameters without requiring a full cytometry analysis framework.

## When to Use

- Reading FCS files exported from flow cytometers (BD, Beckman Coulter, Thermo)
- Inspecting channel names, detector voltages, and fluorescence descriptions
- Extracting event-level scatter and fluorescence data as numpy arrays
- Parsing FCS file headers for acquisition metadata (date, cytometer, operator)
- Building custom flow cytometry analysis pipelines without heavy dependencies

## Quick Start

```python
import flowio
import numpy as np

# Read an FCS file
sample = flowio.FlowSample("sample_001.fcs")

# Inspect basic metadata
print(f"Events: {sample.event_count}")
print(f"Channels: {sample.channels}")
print(f"Acquisition date: {sample.acquisition_date}")
print(f"Cytometer: {sample.cytometer}")

# Read event data as numpy array — shape (n_events, n_channels)
events = np.reshape(sample.events, (-1, len(sample.channels)))
print(f"Event data shape: {events.shape}")

# Access individual channel data
for channel in sample.channels[:5]:
    idx = sample.channels.index(channel)
    print(f"  {channel.PnN}: mean={events[:, idx].mean():.1f}")
```

## Core Capabilities

### 1. Reading FCS File Metadata

```python
import flowio

sample = flowio.FlowSample("experiment.fcs")

# File-level metadata from the FCS TEXT segment
print(f"Total events: {sample.event_count}")
print(f"Data type: {sample.datatype}")
print(f"Acquisition date: {sample.acquisition_date}")
print(f"Cytometer: {sample.cytometer}")

# Channel details — each channel has detector and fluorescence info
for ch in sample.channels:
    print(f"  Channel: {ch.PnN}")        # Short name (e.g., "FITC-A")
    print(f"  Detector: {ch.PnD}")        # Detector type (e.g., "FSC-A")
    print(f"  Range: {ch.PnR}")           # Maximum value
    print(f"  Gain: {ch.PnG}")            # Amplifier gain
    print(f"  Voltage: {ch.PnV}")         # Detector voltage
    print(f"  Fluorochrome: {ch.PnS}")    # Stain name
    print()
```

### 2. Extracting Event Data

```python
import flowio
import numpy as np

sample = flowio.FlowSample("sample_001.fcs")

# Raw event data — 1D array, needs reshaping
raw_events = sample.events
n_channels = len(sample.channels)
n_events = sample.event_count
events = np.reshape(raw_events, (n_events, n_channels))

# Create a structured view with channel names
channel_names = [ch.PnN for ch in sample.channels]
print(f"Channels: {channel_names}")

# Extract specific populations using gating logic
fsc_idx = channel_names.index("FSC-A")
ssc_idx = channel_names.index("SSC-A")
fsc = events[:, fsc_idx]
ssc = events[:, ssc_idx]

# Simple FSC/SSC gate — remove debris (low scatter)
mask = (fsc > np.percentile(fsc, 5)) & (ssc > np.percentile(ssc, 5))
gated_events = events[mask]
print(f"Events after FSC/SSC gate: {len(gated_events)} / {n_events}")
```

### 3. Handling Compensation and Transformations

```python
import flowio
import numpy as np

sample = flowio.FlowSample("compensated_sample.fcs")

# Check if spillover matrix is available
if hasattr(sample, "spillover"):
    spill = np.array(sample.spillover)
    print(f"Spillover matrix shape: {spill.shape}")
    # Apply compensation: compensated = events @ inv(spillover)

# Common transformations for display
# Logicle / biexponential transform (approximation)
def logicle_transform(x, T=262144, W=0.5, M=4.5, A=0):
    """Approximate logicle transformation for flow cytometry data."""
    x = np.asarray(x, dtype=np.float64)
    return np.where(
        x > 0,
        np.log10(x / A + np.exp(M * np.log(10))) * np.log(10),
        -np.log10(-x / A + np.exp(M * np.log(10))) * np.log(10)
    )

# Apply to fluorescence channel
fitc_idx = [ch.PnN for ch in sample.channels].index("FITC-A")
transformed = logicle_transform(events[:, fitc_idx])
```

## Common Academic Workflow: Multi-Sample Flow Cytometry Analysis

```python
import flowio
import numpy as np
import os

# 1. Load all FCS files from an experiment
samples = {}
for fcs_file in sorted(os.listdir("flow_data/")):
    if fcs_file.endswith(".fcs"):
        sample = flowio.FlowSample(os.path.join("flow_data/", fcs_file))
        n_ch = len(sample.channels)
        events = np.reshape(sample.events, (sample.event_count, n_ch))
        samples[fcs_file] = {"sample": sample, "events": events}

# 2. Apply consistent FSC/SSC gate across all samples
all_gated = []
for name, data in samples.items():
    ch_names = [ch.PnN for ch in data["sample"].channels]
    fsc = data["events"][:, ch_names.index("FSC-A")]
    ssc = data["events"][:, ch_names.index("SSC-A")]
    mask = (fsc > np.percentile(fsc, 5)) & (ssc > np.percentile(ssc, 5))
    all_gated.append(data["events"][mask])
    print(f"{name}: {mask.sum()} gated events")

# 3. Compute median fluorescence per sample
for name, gated in zip(samples.keys(), all_gated):
    ch_names = [ch.PnN for ch in samples[name]["sample"].channels]
    for ch in ["FITC-A", "PE-A", "APC-A"]:
        if ch in ch_names:
            idx = ch_names.index(ch)
            print(f"  {name} {ch} median: {gated[:, idx].median():.1f}")
```

## Best Practices

1. **Check channel names before indexing** — Different cytometers and export settings use different naming conventions (e.g., "FITC-A" vs "FL1-H")
2. **Apply compensation before gating** — If the FCS file is not pre-compensated, apply the spillover matrix before fluorescence-based gating
3. **Use percentile-based gates** — Hard thresholds are brittle across runs; use percentile-based or density-based gating for robustness
4. **Verify event count** — Compare `sample.event_count` with expected cell counts to detect corrupted files or empty acquisitions

## Common Pitfalls

- **FCS version compatibility**: FCS 2.0 and 3.0 have different data segment offsets. flowio handles both, but very old files (FCS 1.0) may not parse correctly.
- **Byte order issues**: Some cytometers write data in big-endian format. flowio handles this, but raw numpy operations may need dtype specification.
- **Log data vs linear data**: Some channels store log-transformed data, others store raw values. Check `PnD` (detector) and `PgD` (gain) fields.
- **Large file memory**: FCS files with millions of events consume significant memory. Process in chunks if needed.

## Integration with HBE

- Use with `/hbe-plan` for designing flow cytometry experiment analysis plans
- Pair with `references/tools/pandas.md` for tabulating per-sample statistics
- Combine with `references/tools/matplotlib.md` for FSC/SSC scatter plots and histogram overlays
- See `references/tools/scipy.md` for density-based gating (Gaussian mixture models)

## Resources

- Documentation: https://flowio.readthedocs.io/
- GitHub: https://github.com/whitews/FlowIO
- FCS Standard: https://isac-net.org/standards/
- Related: FlowKit (https://github.com/eyurtsev/flowkit) for full cytometry analysis
