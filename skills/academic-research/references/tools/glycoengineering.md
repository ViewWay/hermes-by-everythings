---
name: glycoengineering
description: Glycoprotein engineering — glycosylation site prediction, glycan structure analysis, and engineering
domain: Biology / Glycobiology
install: pip install glycresoft  # See documentation for glycoinformatics ecosystem
---

# Glycoengineering — Glycoprotein Engineering / 糖蛋白工程

Glycoengineering encompasses computational tools for predicting N-linked and O-linked glycosylation sites, analyzing glycan structures, and engineering protein glycosylation patterns. These tools combine sequence-based machine learning with structural bioinformatics to modulate therapeutic protein glycosylation for improved efficacy, stability, and safety.

## When to Use / 适用场景

- Predicting N-linked glycosylation sites (Asn-X-Ser/Thr sequons) on therapeutic proteins
- Analyzing glycan microheterogeneity from mass spectrometry data
- Engineering antibody Fc glycosylation for enhanced ADCC or reduced immunogenicity
- Predicting the impact of mutations on glycosylation patterns
- Designing glyco-optimized variants of recombinant proteins
- Assessing glycosylation site occupancy and processing efficiency

## Quick Start / 快速开始

```python
# N-glycosylation site prediction using sequon analysis
def predict_n_glycosylation_sites(protein_sequence):
    """Identify potential N-linked glycosylation sites (N-X-S/T, X != P)."""
    sites = []
    for i in range(len(protein_sequence) - 2):
        tripeptide = protein_sequence[i:i+3]
        if (tripeptide[0] == "N" and tripeptide[1] != "P" and
                tripeptide[2] in ("S", "T")):
            sites.append({
                "position": i + 1,
                "sequon": tripeptide,
                "context": protein_sequence[max(0, i-3):i+6]
            })
    return sites

# Example: Human IgG1 Fc region
fc_sequence = "ASTKGPSVFPLAPCSRSTSESTAALGCLVKDYFPEPVTVSWNSGALTSGVHTFPAVLQSS"
sites = predict_n_glycosylation_sites(fc_sequence)
print(f"N-glycosylation sites found: {len(sites)}")
for s in sites:
    print(f"  Position {s['position']}: {s['sequon']} (context: {s['context']})")
```

## Core Capabilities / 核心能力

### 1. Glycosylation Site Prediction / 糖基化位点预测

```python
import re
from collections import Counter

class GlycosylationPredictor:
    """Predict N-linked and O-linked glycosylation sites with context scoring."""

    N_SITE_PATTERN = re.compile(r"N([A-OQ-Z])([ST])")

    # Position-specific propensities for N-glycosylation
    N_POSITION_PROPS = {
        -2: {"P": -2.0, "D": -0.5, "E": -0.3},
        -1: {"P": -3.0},  # Proline at +1 kills glycosylation
        1: {"P": -3.0, "A": 0.3, "V": 0.2},
        2: {"P": -1.5, "T": 0.2}
    }

    def predict_n_sites(self, sequence):
        """Predict N-glycosylation sites with context-based scoring."""
        predictions = []
        for match in self.N_SITE_PATTERN.finditer(sequence):
            pos = match.start()
            score = 0.0
            for offset, props in self.N_POSITION_PROPS.items():
                idx = pos + offset + 1
                if 0 <= idx < len(sequence):
                    residue = sequence[idx]
                    score += props.get(residue, 0.0)
            # Surface accessibility proxy (charge-based)
            window = sequence[max(0, pos-5):min(len(sequence), pos+8)]
            charge = window.count("K") + window.count("R") - window.count("D") - window.count("E")
            score -= abs(charge) * 0.1
            predictions.append({
                "position": pos + 1,
                "sequon": match.group(),
                "x_residue": match.group(1),
                "score": score,
                "probability": min(1.0, max(0.0, 0.7 + score * 0.1))
            })
        return predictions

    def predict_o_sites(self, sequence, disorder_threshold=0.5):
        """Predict O-glycosylation sites (simplified: Ser/Thr in flexible regions)."""
        predictions = []
        for i, aa in enumerate(sequence):
            if aa in ("S", "T"):
                window = sequence[max(0, i-4):min(len(sequence), i+5)]
                proline_count = window.count("P")
                glycine_count = window.count("G")
                flexibility_score = (glycine_count + proline_count) / len(window)
                if flexibility_score > disorder_threshold:
                    predictions.append({
                        "position": i + 1,
                        "residue": aa,
                        "flexibility": flexibility_score
                    })
        return predictions

# Usage
predictor = GlycosylationPredictor()
protein_seq = "EEQYNSTYRVVSVLTVLHQDWLNGKEYKCKVSNKALPAPIEKTISKAK"
n_sites = predictor.predict_n_sites(protein_seq)
o_sites = predictor.predict_o_sites(protein_seq)
print(f"N-sites: {len(n_sites)}, O-sites: {len(o_sites)}")
for site in n_sites:
    print(f"  N-site at {site['position']}: P={site['probability']:.2f}")
```

### 2. Glycan Structure Representation / 聚糖结构表示

```python
class GlycanStructure:
    """Parse and analyze glycan structures in IUPAC condensed notation."""

    COMMON_GLYCANS = {
        "high_mannose": ["Man5GlcNAc2", "Man6GlcNAc2", "Man7GlcNAc2",
                         "Man8GlcNAc2", "Man9GlcNAc2"],
        "complex": ["G0F", "G1F", "G2F", "G0FN", "G1FN", "G2FN"],
        "hybrid": ["G0F-Hybrid", "G1F-Hybrid"],
        "sialylated": ["A1", "A2", "A1F", "A2F"]
    }

    Fc_GLYCAN_EFFECTS = {
        "afucosylated": {"ADCC": "enhanced", "CDC": "unchanged"},
        "galactosylated": {"ADCC": "unchanged", "CDC": "enhanced"},
        "sialylated": {"anti-inflammatory": "enhanced", "half_life": "reduced"},
        "high_mannose": {"clearance": "increased", "efficacy": "variable"}
    }

    @staticmethod
    def parse_glycan_composition(glycan_name):
        """Extract monosaccharide composition from glycan name."""
        from collections import Counter
        composition = Counter()
        tokens = re.findall(r'([A-Z][a-z]*\d*)', glycan_name)
        for token in tokens:
            match = re.match(r'([A-Z][a-z]*)(\d*)', token)
            if match:
                residue = match.group(1)
                count = int(match.group(2)) if match.group(2) else 1
                composition[residue] = count
        return composition

    @staticmethod
    def classify_fcglycan(glycan_name):
        """Classify Fc glycan and predict functional impact."""
        effects = {}
        name_lower = glycan_name.lower()
        if "f" not in name_lower and "fucose" not in name_lower:
            effects.update({"type": "afucosylated",
                            **GlycanStructure.Fc_GLYCAN_EFFECTS["afucosylated"]})
        if "sia" in name_lower or "neu" in name_lower:
            effects.update({"type": "sialylated",
                            **GlycanStructure.Fc_GLYCAN_EFFECTS["sialylated"]})
        if "gal" in name_lower and name_lower.count("gal") >= 2:
            effects.update({"type": "galactosylated",
                            **GlycanStructure.Fc_GLYCAN_EFFECTS["galactosylated"]})
        return effects

import re
print(GlycanStructure.classify_fcglycan("G0FN"))   # Afucosylated
print(GlycanStructure.classify_fcglycan("G2FS2"))   # Sialylated + galactosylated
```

### 3. Glycosylation Engineering Strategies / 糖基化工程策略

```python
class GlycoEngineer:
    """Design glyco-engineered protein variants."""

    def add_glycosylation_site(self, sequence, position):
        """Introduce an N-glycosylation sequon at a specified position."""
        seq_list = list(sequence)
        if position < 0 or position >= len(seq_list):
            raise ValueError(f"Position {position} out of range")
        # Ensure X != P
        if position + 1 < len(seq_list) and seq_list[position + 1] == "P":
            seq_list[position + 1] = "A"
        # Add N at target, S at position + 2
        seq_list[position] = "N"
        if position + 2 < len(seq_list):
            seq_list[position + 2] = "S"
        return "".join(seq_list)

    def remove_glycosylation_site(self, sequence, position):
        """Remove an N-glycosylation sequon by mutating Asn."""
        seq_list = list(sequence)
        if seq_list[position] == "N":
            seq_list[position] = "Q"  # Asn -> Gln (conservative)
        return "".join(seq_list)

    def optimize_fc_glycosylation(self, antibody_heavy_chain, strategy="enhance_adcc"):
        """Engineer Fc region for specific glycosylation outcomes."""
        optimized = list(antibody_heavy_chain)
        for i in range(len(optimized) - 2):
            if optimized[i] == "N" and optimized[i+2] in ("S", "T"):
                if optimized[i+1] == "P":
                    optimized[i+1] = "A"
                if i > 0 and optimized[i-1] == "P":
                    optimized[i-1] = "A"
        return "".join(optimized)

engineer = GlycoEngineer()
test_seq = "ASTKGPSVFPLAPCSRSTSESTAALGCLVKDYFPEPVTVSWNSGALTSGVHTFPAVLQSS"
engineered = engineer.add_glycosylation_site(test_seq, position=10)
print(f"Original: {test_seq[8:16]}")
print(f"Engineered: {engineered[8:16]}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: Therapeutic Antibody Glycosylation Analysis / 治疗性抗体糖基化分析

```python
from Bio import SeqIO

def analyze_antibody_glycosylation(heavy_chain_fasta):
    """Complete glycosylation analysis pipeline for therapeutic antibodies."""
    record = SeqIO.read(heavy_chain_fasta, "fasta")
    sequence = str(record.seq)

    predictor = GlycosylationPredictor()
    n_sites = predictor.predict_n_sites(sequence)
    o_sites = predictor.predict_o_sites(sequence)

    print(f"=== Glycosylation Analysis: {record.id} ===")
    print(f"Sequence length: {len(sequence)} aa")
    print(f"N-glycosylation sequons: {len(n_sites)}")
    for site in n_sites:
        print(f"  Pos {site['position']:3d}: {site['sequon']} | "
              f"P(glyc) = {site['probability']:.2f}")

    # Check Fc glycosylation (N297 region)
    fc_site = [s for s in n_sites if 280 <= s["position"] <= 310]
    if fc_site:
        print(f"\nFc N297 glycosylation site: {fc_site[0]['position']}")
    else:
        print("\nWARNING: No Fc N297 glycosylation site found!")

    print(f"Potential O-glycosylation sites: {len(o_sites)}")
    print(f"\n=== Engineering Recommendations ===")
    if fc_site and fc_site[0]["probability"] < 0.8:
        print("  Consider optimizing Fc sequon context for improved occupancy")
    if len(n_sites) > 3:
        print("  WARNING: Extra N-glyc sites may cause heterogeneity")
    return {"n_sites": n_sites, "o_sites": o_sites, "fc_site": fc_site}

results = analyze_antibody_glycosylation("antibody_heavy.fasta")
```

## Best Practices / 最佳实践

1. **Validate with MS data**: Confirm computational predictions with mass spectrometry glycoproteomics
2. **Consider sequon context**: Not all N-X-S/T sequons are glycosylated; surface accessibility matters
3. **Fc glycosylation is critical**: N297 glycosylation modulates antibody effector functions
4. **Glycan heterogeneity**: Expect microheterogeneity at each site; use glycoproteomics for profiling
5. **Expression system matters**: CHO, HEK293, and yeast produce different glycoforms

## Common Pitfalls / 常见陷阱

- **Not all sequons are occupied**: N-X-S/T is necessary but not sufficient; ~30% of sequons are unoccupied
- **X = P kills glycosylation**: Proline at the X position prevents N-glycan attachment
- **Structural context matters**: Buried sequons are not glycosylated even if sequence matches
- **Cell line dependency**: Glycan profiles vary dramatically between expression systems
- **Ignoring O-glycosylation**: O-linked glycans are harder to predict but biologically important

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/biopython.md` for protein sequence handling and FASTA parsing
- Use with `references/tools/rdkit.md` for glycan 3D structure and chemical analysis
- Combine with `references/tools/pandas.md` for glycoproteomics data management
- Integrate with `workflows/experiment-design.md` for biopharmaceutical development studies

## Resources / 资源

- GlyGen: https://www.glygen.org/ (glycomics data portal)
- UniCarbKB: https://unicarbkb.org/ (glycan structure database)
- GlyConnect: https://glyconnect.expasy.org/ (glycoproteomics resource)
- GlycoEnzDB: https://www.glycoenzdb.org/ (glycosyltransferase database)
- NetNGlyc: https://services.healthtech.dtu.dk/service.php?NetNGlyc-1.0
