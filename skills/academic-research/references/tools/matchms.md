---
name: matchms
description: Python library for mass spectrometry data processing, spectrum similarity, and metabolomics analysis
domain: Chemistry / Metabolomics
install: pip install matchms
---

# matchms — Mass Spectrometry Processing / 质谱数据处理

matchms processes mass spectrometry data: importing spectra from .mzML/.mzXML formats, computing spectrum similarity scores, metadata handling, and spectral library matching for metabolomics.

## When to Use / 适用场景

- Processing LC-MS/MS or GC-MS spectra
- Spectrum similarity scoring (Cosine, Modified Cosine, Neutral Losses)
- Spectral library matching for compound identification
- Building and curating in-house spectral libraries
- Metabolomics data preprocessing pipelines

## Quick Start / 快速开始

```python
from matchms import Spectrum
from matchms.importing import load_from_mzml
from matchms.similarity import CosineGreedy

# Load spectra from file
spectra = list(load_from_mzml("sample.mzML"))

# Create spectrum manually
spectrum = Spectrum(
    mz=np.array([100.0, 150.5, 200.3, 250.1]),
    intensities=np.array([0.5, 1.0, 0.3, 0.8])
)

# Compute similarity
similarity = CosineGreedy(tolerance=0.1)
score = similarity.pair(spectra[0], spectra[1])
print(f"Score: {score['score']:.3f}, Matches: {score['matches']}")
```

## Core Capabilities / 核心能力

### 1. Spectrum Import and Export / 谱图读写

```python
from matchms.importing import load_from_mzml, load_from_mgf, load_from_mzxml
from matchms.exporting import save_as_mgf, save_as_msp

# Load from various formats
spectra_mzml = list(load_from_mzml("data.mzML"))
spectra_mgf = list(load_from_mgf("library.mgf"))
spectra_mzxml = list(load_from_mzxml("data.mzXML"))

# Save
save_as_mgf(spectra_mzml, "output.mgf")
save_as_msp(spectra_mzml, "library.msp")
```

### 2. Spectrum Processing / 谱图处理

```python
from matchms.filtering import (
    default_filters, normalize_intensities,
    select_by_intensity, select_by_mz,
    reduce_to_number_of_peaks, add_losses
)

# Processing pipeline
def process_spectrum(spectrum):
    spectrum = default_filters(spectrum)
    spectrum = normalize_intensities(spectrum)
    spectrum = select_by_mz(spectrum, mz_from=50, mz_to=1000)
    spectrum = select_by_intensity(spectrum, intensity_from=0.01)
    spectrum = reduce_to_number_of_peaks(spectrum, n_max=100)
    return spectrum

# Apply to all spectra
spectra = [process_spectrum(s) for s in spectra if s is not None]
```

### 3. Similarity Scoring / 相似度评分

```python
from matchms.similarity import (
    CosineGreedy, CosineHungarian,
    ModifiedCosine, NeutralLossesCosine,
    MetadataMatch, PrecursorMzMatch
)

# Different similarity metrics
cosine = CosineGreedy(tolerance=0.1)
modified_cosine = ModifiedCosine(tolerance=0.1)
neutral_loss = NeutralLossesCosine(tolerance=0.1)

# Score spectrum against library
score = cosine.pair(query_spectrum, library_spectrum)

# Batch scoring
from matchms import calculate_scores
scores = calculate_scores(
    references=library_spectra,
    queries=query_spectra,
    similarity_function=CosineGreedy(tolerance=0.1)
)

# Get top matches
for i, query in enumerate(query_spectra):
    best_match_idx = scores.scores[i, :, "CosineGreedy_score"].argmax()
    best_score = scores.scores[i, best_match_idx, "CosineGreedy_score"]
    best_library = library_spectra[best_match_idx]
    print(f"Query {i}: Best match = {best_library.get('compound_name')} (score={best_score:.3f})")
```

### 4. Fingerprinting and Molecular Properties / 指纹与分子属性

```python
from matchms.filtering import add_fingerprint
from matchms.similarity import FingerprintSimilarity

# Add molecular fingerprint (requires SMILES or InChI in metadata)
spectrum = add_fingerprint(spectrum, fingerprint_type="daylight", nbits=2048)

# Compare by fingerprint
fp_sim = FingerprintSimilarity(metric="tanimoto")
score = fp_sim.pair(spectrum1, spectrum2)
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Spectral Library Matching / 谱库匹配

```python
from matchms.importing import load_from_mgf, load_from_mzml
from matchms.filtering import default_filters, normalize_intensities
from matchms.similarity import CosineGreedy, ModifiedCosine
from matchms import calculate_scores
import pandas as pd

# Load library and query spectra
library = [default_filters(normalize_intensities(s)) for s in load_from_mgf("gnps_library.mgf") if s is not None]
queries = [default_filters(normalize_intensities(s)) for s in load_from_mzml("sample.mzML") if s is not None]

# Score
scores = calculate_scores(library, queries, CosineGreedy(tolerance=0.5))

# Extract top matches
results = []
for i, query in enumerate(queries):
    scores_row = scores.scores[i, :, "CosineGreedy_score"]
    matches_row = scores.scores[i, :, "CosineGreedy_matches"]
    best_idx = scores_row.argmax()
    results.append({
        "query_mz": query.get("precursor_mz"),
        "match_name": library[best_idx].get("compound_name", "Unknown"),
        "cosine_score": scores_row[best_idx],
        "matched_peaks": matches_row[best_idx]
    })
df = pd.DataFrame(results)
```

## Best Practices / 最佳实践

- Always normalize intensities before similarity scoring
- Use ModifiedCosine for spectral matching with precursor m/z shifts
- Apply m/z and intensity filters to remove noise peaks
- Report tolerance value and similarity metric in methods

## Common Pitfalls / 常见陷阱

- **Tolerance**: Setting tolerance too high inflates scores; too low misses real matches
- **Intensity normalization**: Required before scoring; raw intensities give biased results
- **Metadata keys**: matchms uses specific metadata keys; use `default_filters()` to standardize
- **Missing precursor m/z**: Required for ModifiedCosine; check metadata after loading

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/rdkit.md` for molecular structure from SMILES
- Use with `references/tools/matplotlib.md` for mirror plot visualizations
- Combine with `references/tools/pandas.md` for scoring result tables

## Resources / 资源

- Documentation: https://matchms.readthedocs.io/
- Tutorial: https://matchms.readthedocs.io/en/latest/tutorial/
- GNPS: https://gnps.ucsd.edu/
