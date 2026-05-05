---
name: pyopenms
description: OpenMS Python bindings — mass spectrometry data processing and proteomics analysis
domain: Chemistry / Proteomics
install: pip install pyopenms
---

# PyOpenMS — OpenMS Python Bindings / 质谱数据分析 Python 接口

PyOpenMS provides Python bindings for the OpenMS C++ library, enabling mass spectrometry data processing, feature detection, peptide identification, quantification, and proteomics workflows. It covers the full pipeline from raw spectral data to protein inference.

## When to Use / 适用场景

- Reading and writing mass spectrometry formats (mzML, mzXML, mzIdentML, idXML)
- Peak picking, noise filtering, and spectrum preprocessing
- Feature detection in LC-MS/MS runs
- Peptide-spectrum matching (database search) and FDR control
- Label-free and isotope-based quantification
- Building reproducible proteomics pipelines in pure Python

## Quick Start / 快速开始

```python
import pyopenms as oms

# Read an mzML file
exp = oms.MSExperiment()
oms.MzMLFile().load("sample.mzML", exp)
print(f"Spectra: {exp.size()}, MS levels: {set(s.getMSLevel() for s in exp)}")

# Access a single spectrum
spectrum = exp[0]
print(f"RT: {spectrum.getRT():.2f} s, Peaks: {spectrum.size()}")
mz_array, intensity_array = spectrum.get_peaks()
print(f"  m/z range: [{mz_array.min():.2f}, {mz_array.max():.2f}]")
print(f"  Max intensity: {intensity_array.max():.0f}")

# Write processed data
oms.MzMLFile().store("output.mzML", exp)
```

## Core Capabilities / 核心能力

### 1. MzML File I/O and Spectrum Processing / 质谱文件读写与谱图处理

```python
import pyopenms as oms
import numpy as np

# Read mzML with metadata
exp = oms.MSExperiment()
fh = oms.MzMLFile()
fh.setOptions(oms.MzMLFile().getOptions())  # default options
fh.load("raw_data.mzML", exp)

# Iterate over MS1 and MS2 spectra
ms1_spectra = [s for s in exp if s.getMSLevel() == 1]
ms2_spectra = [s for s in exp if s.getMSLevel() == 2]
print(f"MS1: {len(ms1_spectra)}, MS2: {len(ms2_spectra)}")

# Peak picking (convert profile to centroided)
pp = oms.PeakPickerHiRes()
pp_params = pp.getParameters()
pp_params.setValue("signal_to_noise", 5.0)
pp.setParameters(pp_params)

centroided = oms.MSExperiment()
pp.pickExperiment(exp, centroided)
print(f"Centroided spectra: {centroided.size()}")

# Spectrum filtering by m/z and intensity
filter = oms.SpectrumFilter()
filtered = oms.MSExperiment()
filter.filterSpectra(exp, filtered, 200.0, 2000.0,  # m/z range
                     1000.0)                          # min intensity
```

### 2. Feature Detection / 特征检测

```python
import pyopenms as oms

# Feature detection from centroided MS1 data
feature_finder = oms.FeatureFinder()
ff_params = oms.FeatureFinder().getParameters("centroided")
ff_params.setValue("mass_tolerance", 10.0)       # ppm
ff_params.setValue("isotope_tolerance", 5.0)     # ppm
ff_params.setValue("min_intensity", 1e4)

# Map MS2 spectra to features for identification
feature_map = oms.FeatureMap()
feature_finder.run("centroided", exp, feature_map, ff_params,
                   oms.FeatureFinderAlgorithmPickedHelper())

print(f"Detected features: {feature_map.size()}")

# Sort features by intensity and inspect top features
feature_map.sortByIntensity(True)
for i, feat in enumerate(feature_map[:5]):
    print(f"  Feature {i}: m/z={feat.getMZ():.4f}, RT={feat.getRT():.2f}s, "
          f"intensity={feat.getIntensity():.0f}, charge={feat.getCharge()}")

# Write feature map
oms.FeatureXMLFile().store("features.featureXML", feature_map)
```

### 3. Peptide Identification and FDR Control / 肽段鉴定与 FDR 控制

```python
import pyopenms as oms

# Database search with Comet (via OpenMS wrapper)
search_engine = oms.CometAdapter()
search_params = search_engine.getParameters()
search_params.setValue("database", "uniprot_human.fasta")
search_params.setValue("precursor_mass_tolerance", 10.0)
search_params.setValue("fragment_mass_tolerance", 0.02)
search_engine.setParameters(search_params)

# Identify peptides
id_data = oms.IdentificationData()
search_engine.identify(exp, id_data, search_params)

# FDR control
fdr = oms.FalseDiscoveryRate()
fdr.apply(id_data, 0.01)  # 1% FDR at peptide level

# Convert to ProteinIdentifications for downstream analysis
protein_ids = []
peptide_ids = []
id_data.exportToProteinsAndPeptides(protein_ids, peptide_ids)

print(f"Proteins identified: {len(protein_ids)}, Peptides: {len(peptide_ids)}")
for pid in protein_ids[:5]:
    hits = pid.getHits()
    print(f"  {hits[0].getAccession()}: score={hits[0].getScore():.2f}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Full Quantitative Proteomics Pipeline / 定量蛋白质组学流程

```python
import pyopenms as oms

# Step 1: Load and preprocess raw data
exp = oms.MSExperiment()
oms.MzMLFile().load("experiment.mzML", exp)

# Step 2: Peak picking
pp = oms.PeakPickerHiRes()
centroided = oms.MSExperiment()
pp.pickExperiment(exp, centroided)

# Step 3: Feature detection
ff = oms.FeatureFinder()
feature_map = oms.FeatureMap()
ff.run("centroided", centroided, feature_map)

# Step 4: Map MS2 to features
fm = oms.IDMapper()
fm.annotate(feature_map, peptide_ids, protein_ids, 10.0, 0.5)

# Step 5: Normalization and alignment (multi-run)
maps = [feature_map]  # List of FeatureMaps from multiple runs
consensus = oms.ConsensusMap()
normalizer = oms.Normalizer()
normalizer.normalizeMaps(maps)
aligner = oms.MapAlignmentAlgorithmPoseClustering()
aligner.align(maps, consensus)

# Step 6: Export results
oms.ConsensusXMLFile().store("quantification.consensusXML", consensus)
print(f"Consensus features: {consensus.size()}")
```

## Best Practices / 最佳实践

1. **Use centroided data**: Most OpenMS algorithms expect centroided spectra; apply PeakPickerHiRes first
2. **Validate search parameters**: Set precursor tolerance based on instrument specs (Orbitrap: 5-10 ppm, TOF: 20-50 ppm)
3. **Control FDR**: Always apply FalseDiscoveryRate at peptide-spectrum-match level before reporting
4. **Batch processing**: Use OpenMS TOPP tools via subprocess for large-scale production runs
5. **Memory management**: Process large files in chunks; `exp.clear()` after each batch to free memory

## Common Pitfalls / 常见陷阱

- **Wrong MS level**: Feature detection operates on MS1; peptide identification uses MS2 -- do not mix them
- **Missing modifications**: Always specify fixed (e.g., carbamidomethyl C) and variable (e.g., oxidation M) modifications in search
- **Decoy database**: FDR estimation requires a decoy database (reverse or shuffled); do not skip it
- **Memory limits**: Large mzML files (>1 GB) may cause OOM; use `MzMLFile().loadChunk()` for partial reads
- **Version compatibility**: OpenMS C++ and PyOpenMS must match; check with `oms.__version__`

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/matchms.md` for spectral similarity and library matching
- Use with `references/tools/pandas.md` for downstream statistical analysis of quantification data
- Combine with `references/tools/matplotlib.md` for extracted ion chromatograms and volcano plots
- Integrate with `workflows/experiment-design.md` for proteomics study design

## Resources / 资源

- Documentation: https://pyopenms.readthedocs.io/
- OpenMS: https://openms.de/
- TOPP tools: https://openms.de/documentation/
- Tutorials: https://abibuilder.informatik.uni-tuebingen.de/archive/openms/Documentation/nightly/html/Tutorial.html
