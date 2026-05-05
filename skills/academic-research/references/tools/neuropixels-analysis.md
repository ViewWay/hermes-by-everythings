---
name: neuropixels-analysis
description: Neural spike sorting and analysis for high-density electrophysiology recordings
domain: Neuroscience
install: pip install spikeinterface spikeextractors numpy scipy matplotlib
---

# neuropixels-analysis — Neural Spike Sorting and Analysis

Neuropixels analysis encompasses spike sorting, firing rate computation, and neural response analysis for high-density silicon probe recordings (Neuropixels 1.0, 2.0). Modern workflows use SpikeInterface as the unified framework, replacing legacy tools (Kilosort, JRClust, Spyking Circus) with a standardized pipeline.

## When to Use

- Processing raw Neuropixels electrophysiology data into sorted spike trains
- Computing firing rates, peristimulus time histograms (PSTHs), and tuning curves
- Analyzing single-unit and population activity from high-density probes
- Quality control of sorted units (SNR, ISI violations, drift metrics)
- Comparing spike sorting algorithms on shared benchmarks

## Quick Start

```python
import spikeinterface as si
import spikeinterface.extractors as se
import spikeinterface.sorters as ss
import spikeinterface.postprocessing as spost

# Load raw recording (binary format from Neuropixels hardware)
recording = se.read_binary(
    file_paths="data/recording.dat",
    sampling_frequency=30000.0,
    num_chan=384,
    dtype="int16",
    gain_to_uV=0.195,
    offset_to_uV=0,
)

print(f"Recording: {recording.get_num_frames() / 30000:.1f}s, {recording.get_num_channels()} channels")
print(f"Channel IDs: {recording.get_channel_ids()[:5]}...")

# Preprocessing
recording = si.bandpass_filter(recording, freq_min=300, freq_max=6000)
recording = si.common_reference(recording, reference="global", operator="median")

# Run spike sorting (Kilosort2_5)
sorting = ss.run_sorter(
    "kilosort2_5", recording,
    output_folder="results/kilosort_output",
    verbose=True,
)

print(f"Sorted units: {len(sorting.get_unit_ids())}")
```

## Core Capabilities

### Spike Sorting Pipeline with SpikeInterface

```python
import spikeinterface as si
import spikeinterface.sorters as ss
import spikeinterface.postprocessing as spost
import spikeinterface.qualitymetrics as sqm

# 1. Load recording
recording = se.read_spikeglx("data/spikeglx/", stream_id="imec0.AP")

# 2. Preprocessing chain
recording_f = si.bandpass_filter(recording, freq_min=300, freq_max=6000)
recording_cm = si.common_reference(recording_f, reference="global", operator="median")
recording_bad = si.remove_bad_channels(recording_cm, firing_rate_threshold=0.1)

# 3. Spike sorting — choose from: kilosort2_5, kilosort3, ironclust, tridesclous
sorting = ss.run_sorter(
    "kilosort2_5",
    recording_bad,
    output_folder="results/ks25_output",
    exclusion_tags=["noise", "artifact"],
    verbose=True,
)

# 4. Post-processing: extract waveforms
waveforms = si.extract_waveforms(recording_bad, sorting, folder="results/waveforms",
                                  max_spikes_per_unit=500, overwrite=True)

# 5. Compute quality metrics
metrics = sqm.compute_quality_metrics(waveforms, metric_names=[
    "snr", "isi_violation", "firing_rate", "num_spikes",
    "amplitude_cutoff", "presence_ratio", "drift_ptp",
])
print("Quality metrics:")
print(metrics[["snr", "isi_violation", "firing_rate"]].describe())

# 6. Filter good units
good_units = metrics[
    (metrics["snr"] > 2.0) &
    (metrics["isi_violation"] < 0.5) &
    (metrics["firing_rate"] > 0.1) &
    (metrics["amplitude_cutoff"] < 0.1)
].index.tolist()
print(f"Good units: {len(good_units)} / {len(sorting.get_unit_ids())}")
```

### Firing Rate Analysis

```python
import numpy as np
import matplotlib.pyplot as plt
import spikeinterface as si

# Compute firing rates for each unit
sorting = si.load_extractor("results/ks25_output/sorting")
recording = se.read_spikeglx("data/spikeglx/", stream_id="imec0.AP")
fs = recording.get_sampling_frequency()

firing_rates = {}
for unit_id in sorting.get_unit_ids():
    spike_times = sorting.get_unit_spike_train(unit_id) / fs  # convert to seconds
    duration = recording.get_num_frames() / fs
    firing_rates[unit_id] = len(spike_times) / duration

# Plot firing rate distribution
rates = list(firing_rates.values())
fig, ax = plt.subplots(figsize=(8, 5))
ax.hist(rates, bins=50, edgecolor="k", alpha=0.7, color="steelblue")
ax.set_xlabel("Firing Rate (Hz)")
ax.set_ylabel("Number of Units")
ax.set_title(f"Distribution of Firing Rates (n={len(rates)} units)")
ax.axvline(np.median(rates), color="red", linestyle="--", label=f"Median: {np.median(rates):.1f} Hz")
ax.legend()
plt.tight_layout()
plt.savefig("figures/firing_rate_distribution.pdf", dpi=300)
```

### Peristimulus Time Histogram (PSTH)

```python
import numpy as np
import matplotlib.pyplot as plt
import spikeinterface as si

sorting = si.load_extractor("results/ks25_output/sorting")
fs = recording.get_sampling_frequency()

# Define stimulus event times (e.g., visual stimulus onset)
stimulus_times = np.array([1.2, 2.5, 3.8, 5.1, 6.4, 7.7, 9.0, 10.3, 11.6, 12.9])
pre_window = 0.5   # 500 ms before stimulus
post_window = 1.0  # 1000 ms after stimulus
bin_size = 0.02    # 20 ms bins

unit_id = good_units[0]  # select a well-isolated unit
spike_times = sorting.get_unit_spike_train(unit_id) / fs

# Compute PSTH
bins = np.arange(-pre_window, post_window + bin_size, bin_size)
psth_trials = []

for stim_t in stimulus_times:
    trial_spikes = spike_times[(spike_times >= stim_t - pre_window) &
                                (spike_times < stim_t + post_window)]
    aligned = trial_spikes - stim_t
    counts, _ = np.histogram(aligned, bins=bins)
    psth_trials.append(counts)

psth_mean = np.mean(psth_trials, axis=0)
psth_sem = np.std(psth_trials, axis=0) / np.sqrt(len(psth_trials))
bin_centers = bins[:-1] + bin_size / 2

# Plot PSTH
fig, ax = plt.subplots(figsize=(8, 5))
ax.bar(bin_centers, psth_mean, width=bin_size * 0.9, color="steelblue",
       yerr=psth_sem, capsize=2, edgecolor="k", linewidth=0.5)
ax.axvline(0, color="red", linestyle="--", linewidth=1.5, label="Stimulus Onset")
ax.set_xlabel("Time from Stimulus Onset (s)")
ax.set_ylabel("Firing Rate (Hz)")
ax.set_title(f"PSTH — Unit {unit_id}")
ax.legend()
plt.tight_layout()
plt.savefig("figures/psth_unit.pdf", dpi=300)
```

## Common Academic Workflow: Full Neuropixels Analysis Pipeline

```python
import spikeinterface as si
import spikeinterface.extractors as se
import spikeinterface.sorters as ss
import spikeinterface.postprocessing as spost
import spikeinterface.qualitymetrics as sqm
import numpy as np
import pandas as pd

# 1. Load and preprocess
recording = se.read_spikeglx("data/spikeglx/", stream_id="imec0.AP")
recording = si.bandpass_filter(recording, freq_min=300, freq_max=6000)
recording = si.common_reference(recording, reference="global", operator="median")

# 2. Sort spikes
sorting = ss.run_sorter("kilosort2_5", recording, output_folder="results/ks25/")

# 3. Extract waveforms and compute quality metrics
waveforms = si.extract_waveforms(recording, sorting, "results/waveforms/", max_spikes_per_unit=500)
metrics = sqm.compute_quality_metrics(waveforms)

# 4. Filter good units
good = metrics[(metrics["snr"] > 2.0) & (metrics["isi_violation"] < 0.5)].index
print(f"Quality units: {len(good)}")

# 5. Compute per-unit summary statistics
summary = []
fs = recording.get_sampling_frequency()
duration = recording.get_num_frames() / fs

for uid in good:
    st = sorting.get_unit_spike_train(uid) / fs
    isi = np.diff(st)
    cv = np.std(isi) / np.mean(isi) if len(isi) > 0 else np.nan
    summary.append({
        "unit_id": uid,
        "firing_rate_hz": len(st) / duration,
        "mean_isi_ms": np.mean(isi) * 1000,
        "cv_isi": cv,
        "snr": metrics.loc[uid, "snr"],
    })

summary_df = pd.DataFrame(summary)
summary_df.to_csv("results/unit_summary.csv", index=False)
print(summary_df.describe().round(3))
```

## Best Practices

- **Bandpass filter 300-6000 Hz** for extracellular spike detection — this isolates action potentials from LFP and noise.
- **Use global median reference** to remove common-mode noise across channels.
- **Quality filter units** with SNR > 2.0, ISI violation rate < 0.5, and amplitude cutoff < 0.1.
- **Save intermediate results** (waveforms, sorting) to disk — full pipeline can take hours on large recordings.
- **Report sorting parameters and software versions** (SpikeInterface, Kilosort) in methods sections.

## Common Pitfalls

- **Not removing bad channels**: Dead or saturated channels degrade sorting quality. Always run `remove_bad_channels` first.
- **Incorrect gain/offset**: Neuropixels AP gain is 0.195 uV/LSB for NP1.0. Wrong values produce incorrect spike amplitudes.
- **Probe geometry mismatches**: SpikeInterface needs the correct probe layout. Use `recording.set_probe(probe)` with the right geometry.
- **Memory for waveforms**: Extracting waveforms for thousands of units is memory-intensive. Use `max_spikes_per_unit` to limit.

## Integration with HBE

- Use within `workflows/experiment-design.md` for neuroscience experiment design and analysis planning
- Pair with `references/tools/numpy.md` for efficient array operations on spike trains
- Combine with `references/tools/matplotlib.md` for raster plots, PSTHs, and tuning curve visualizations
- Use alongside `references/tools/scipy.md` for statistical testing of neural responses (e.g., Wilcoxon signed-rank for stimulus response)

## Resources

- SpikeInterface: https://spikeinterface.readthedocs.io/
- Neuropixels: https://www.neuropixels.org/
- SpikeGLX: https://github.com/billkarsh/SpikeGLX
- Kilosort: https://github.com/MouseLand/Kilosort
- Allen Institute ephys resources: https://allensdk.readthedocs.io/
