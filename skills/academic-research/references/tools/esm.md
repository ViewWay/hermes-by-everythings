---
name: esm
description: Protein language models from Meta — ESM-2 embeddings, masked prediction, structure prediction, and contact maps
domain: biology / protein-ai
install: pip install fair-esm
---

# esm (Evolutionary Scale Modeling)

Meta's protein language models pretrained on hundreds of millions of protein sequences. ESM-2 produces state-of-the-art embeddings for downstream tasks (mutation effect prediction, structure prediction, function annotation) without requiring multiple sequence alignments. ESMFold enables fast single-sequence structure prediction.

## When to Use

- Generating protein sequence embeddings for downstream ML tasks
- Predicting the effect of mutations on protein function or stability
- Fast single-sequence protein structure prediction with ESMFold
- Extracting per-residue representations for classification or regression
- Computing attention maps and contact predictions from internal representations

## Quick Start

```python
import torch
import esm

# Load ESM-2 model (650M parameters — good balance of speed and quality)
model, alphabet = esm.pretrained.esm2_t33_650M_UR50D()
batch_converter = alphabet.get_batch_converter()
model.eval()  # Disable dropout for inference

# Prepare sequences
data = [
    ("protein1", "MKVILLFVVAIATVLSVIIFTSEGVGKDRQLNGTVINGTLAPVIKVNGATAEEIV"),
    ("protein2", "MAGLRGHRQRVSQKDSVEMMAAQALDGLLHIQRYIDLSQDQLHAVTWLQDPAGLR"),
]
batch_labels, batch_strs, batch_tokens = batch_converter(data)

# Extract per-residue embeddings
with torch.no_grad():
    results = model(batch_tokens, repr_layers=[33])  # Layer 33 = final layer
    embeddings = results["representations"][33]  # Shape: (batch, seq_len, 1280)

print(f"Embedding shape: {embeddings.shape}")  # (2, max_seq_len, 1280)
```

## Core Capabilities

### 1. Batch Embedding Extraction

```python
import torch
import esm
import numpy as np

model, alphabet = esm.pretrained.esm2_t33_650M_UR50D()
batch_converter = alphabet.get_batch_converter()
model.eval()

# Large batch of sequences
sequences = [
    ("prot_A", "MKVILLFVVAIATVLSVIIFTSEGVGKDRQLNGTVINGTLAPVIKVNGATAEEIV"),
    ("prot_B", "MAGLRGHRQRVSQKDSVEMMAAQALDGLLHIQRYIDLSQDQLHAVTWLQDPAGLR"),
    ("prot_C", "MTYKLILALGAAVALGAGAVAAALSVPVYQVLANEQKLNELFAVTAGHIAALQPD"),
]
batch_labels, batch_strs, batch_tokens = batch_converter(sequences)

with torch.no_grad():
    results = model(batch_tokens, repr_layers=[33], return_contacts=True)
    token_embeddings = results["representations"][33]

# Mean pooling per protein (exclude BOS/EOS tokens)
for i, (label, seq) in enumerate(sequences):
    protein_emb = token_embeddings[i, 1:len(seq)+1].mean(dim=0)  # (1280,)
    print(f"{label}: embedding dim = {protein_emb.shape[0]}")

# Save embeddings as numpy
np.save("protein_embeddings.npy", token_embeddings.cpu().numpy())
```

### 2. Mutation Effect Prediction with ESM-1v

```python
import torch
import esm

# ESM-1v is specifically trained for variant effect prediction
esm1v_model, esm1v_alphabet = esm.pretrained.esm1v_t33_650M_UR90S_1()
esm1v_batch_converter = esm1v_alphabet.get_batch_converter()
esm1v_model.eval()

# Wild-type sequence and mutation
wt_seq = "MKVILLFVVAIATVLSVIIFTSEGVGKDRQLNGTVINGTLAPVIKVNGATAEEIV"
mutation = "V5A"  # Valine at position 5 -> Alanine

# Generate mutant sequence
mut_seq = list(wt_seq)
mut_seq[4] = "A"  # 0-indexed
mut_seq = "".join(mut_seq)

# Score wild-type vs mutant (average logits over 5 ESM-1v models)
wt_tokens = esm1v_batch_converter([("wt", wt_seq)])[2]
mut_tokens = esm1v_batch_converter([("mut", mut_seq)])[2]

with torch.no_grad():
    wt_out = esm1v_model(wt_tokens, repr_layers=[33])
    mut_out = esm1v_model(mut_tokens, repr_layers=[33])

# Delta log-likelihood as proxy for fitness effect
wt_ll = wt_out["logits"][0, 4, esm1v_alphabet.get_idx("A")]  # Position 5, mutant AA
mut_ll = mut_out["logits"][0, 4, esm1v_alphabet.get_idx("V")]  # Position 5, wt AA
print(f"Delta log-likelihood: {(mut_ll - wt_ll).item():.2f}")
```

### 3. Structure Prediction with ESMFold

```python
import torch
import esm

# ESMFold for fast structure prediction (no MSA needed)
esmfold = esm.pretrained.esmfold_v1()
esmfold.eval()  # Important: set to eval mode

sequence = "MKVILLFVVAIATVLSVIIFTSEGVGKDRQLNGTVINGTLAPVIKVNGATAEEIV"

with torch.no_grad():
    output = esmfold.infer_pdb(sequence)

# Save predicted structure
with open("predicted_structure.pdb", "w") as f:
    f.write(output)

# Extract confidence scores (pLDDT)
# pLDDT values are in the B-factor column of the output PDB
print("Structure saved to predicted_structure.pdb")
```

## Common Academic Workflow: Protein Function Prediction from Embeddings

```python
import torch
import esm
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score

# 1. Load ESM-2 and extract embeddings for all sequences
model, alphabet = esm.pretrained.esm2_t33_650M_UR50D()
batch_converter = alphabet.get_batch_converter()
model.eval()

sequences = [("prot_" + str(i), seq) for i, seq in enumerate(protein_sequences)]
batch_labels, batch_strs, batch_tokens = batch_converter(sequences)

with torch.no_grad():
    results = model(batch_tokens, repr_layers=[33])
    embeddings = results["representations"][33].mean(dim=1).cpu().numpy()

# 2. Train classifier on embeddings
clf = RandomForestClassifier(n_estimators=100, random_state=42)
scores = cross_val_score(clf, embeddings, labels, cv=5, scoring="f1_macro")
print(f"5-fold F1: {scores.mean():.3f} +/- {scores.std():.3f}")
```

## Best Practices

1. **Use GPU for batch processing** — ESM-2 650M requires ~2.6GB GPU memory for sequences up to 1024 residues
2. **Choose model size by task** — ESM-2 650M is the sweet spot; use 3B for maximum quality, 150M for speed
3. **Average across ESM-1v checkpoints** — For variant effect prediction, average predictions across all 5 ESM-1v models
4. **Truncate long sequences** — ESM-2 max context is 1024 tokens; split longer proteins and average embeddings

## Common Pitfalls

- **Forgetting model.eval()**: Dropout is ON by default in ESM; always call `model.eval()` for deterministic inference
- **Including padding tokens in embeddings**: Use `1:len(seq)+1` slicing to exclude BOS, EOS, and padding from embeddings
- **GPU memory overflow**: Process in smaller batches (8-16 sequences) for large proteins or the 3B model
- **ESMFold vs AlphaFold2**: ESMFold is faster but less accurate than AlphaFold2 with MSAs. Use ESMFold for high-throughput, AlphaFold2 for high-confidence structures.

## Integration with HBE

- Use with `/hbe:plan` for designing protein engineering study protocols
- Pair with `references/tools/biopython.md` for PDB parsing and structure analysis
- Combine with `references/tools/scikit-learn.md` for downstream classification/regression on embeddings
- See `references/tools/torch-geometric.md` for graph-based protein property prediction

## Resources

- Documentation: https://github.com/facebookresearch/esm
- GitHub: https://github.com/facebookresearch/esm
- Paper: Lin, Z. et al. (2023). Evolutionary-scale prediction of atomic-level protein structure with a language model. Science, 379(6637), 1123-1130.
- ESMFold web server: https://esmatlas.com/
