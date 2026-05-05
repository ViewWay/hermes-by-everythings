---
name: torchdrug
description: Drug discovery with PyTorch — molecular graph representation, property prediction, and model training
domain: Chemistry / Drug Discovery
install: pip install torchdrug
---

# TorchDrug — Drug Discovery with PyTorch / PyTorch 药物发现框架

TorchDrug provides a comprehensive PyTorch-based platform for drug discovery tasks including molecular property prediction, molecule generation, protein-ligand interaction, and knowledge graph reasoning. It offers graph neural network layers, pretrained models, and built-in molecular datasets.

## When to Use / 适用场景

- Building GNN-based models for molecular property prediction (logP, toxicity, solubility)
- Molecular graph representation learning with message-passing neural networks
- Protein-ligand binding affinity prediction
- Knowledge graph reasoning for drug-drug or drug-disease interactions
- Pretraining on large molecular corpora for transfer learning

## Quick Start / 快速开始

```python
from torchdrug import data, models, tasks
from torchdrug.layers import MeanReadout

# Load a molecular dataset
dataset = data.MoleculeNet("tox21", atom_feature="default", bond_feature="default",
                           transform=data.FeatureParser(
                               atom_feature=["default", "protein"],
                               bond_feature=["default"],
                               with_hydrogen=False
                           ))

train_set, valid_set, test_set = dataset.split()
print(f"Train: {len(train_set)}, Valid: {len(valid_set)}, Test: {len(test_set)}")

# Build a GNN model
model = models.GIN(
    input_dim=dataset.node_feature_dim,
    hidden_dims=[256, 256, 256],
    short_cut=True,
    batch_norm=True,
    concat_hidden=True
)

# Wrap with a property prediction task
task = tasks.PropertyPrediction(
    model, task=dataset.tasks, criterion="bce", metric=("auc", "auprc"),
    num_mlp_layer=3
)

# Train
optimizer = torch.optim.Adam(task.parameters(), lr=1e-3)
solver = tasks.Solver(task, train_set, valid_set, test_set, optimizer)
solver.train(num_epoch=30)
solver.evaluate("test")
```

## Core Capabilities / 核心能力

### 1. Molecule Construction and Graph Representation / 分子图构建

```python
from torchdrug import data
from rdkit import Chem

# Build molecules from SMILES
smiles_list = ["CCO", "c1ccccc1", "CC(=O)Oc1ccccc1C(=O)O", "CN1C=NC2=C1C(=O)N(C(=O)N2C)C"]
molecules = [data.Molecule.from_smiles(s, with_hydrogen=False) for s in smiles_list]

for mol in molecules:
    print(f"SMILES: {mol.smiles}")
    print(f"  Atoms: {mol.num_atom}, Bonds: {mol.num_bond}")
    print(f"  Node shape: {mol.node_feature.shape}, Edge shape: {mol.edge_feature.shape}")

# Batch molecules for parallel processing
batch = data.Molecule.pack(molecules)
print(f"Batch: {batch.num_graph} molecules, {batch.num_node} total nodes")

# Convert from RDKit mol object
rdkit_mol = Chem.MolFromSmiles("CC(=O)O")
torch_mol = data.Molecule.from_rdkit(rdkkit_mol)
```

### 2. GNN Layers and Model Architectures / 图神经网络层

```python
from torchdrug import models

# Graph Isomorphism Network (GIN)
gin = models.GIN(input_dim=127, hidden_dims=[256, 256], short_cut=True)

# Graph Attention Network (GAT)
gat = models.GAT(input_dim=127, hidden_dims=[256, 256, 256], num_heads=4)

# Graph Convolutional Network (GCN)
gcn = models.GCN(input_dim=127, hidden_dims=[256, 256, 256])

# SchNet (for 3D molecular properties)
schnet = models.SchNet(input_dim=127, hidden_dim=128, num_layers=6)

# Pretrained models
pretrained_gnn = models.GIN(
    input_dim=127, hidden_dims=[512, 512, 512, 512, 512],
    short_cut=True, batch_norm=True, concat_hidden=True
)
# Load pretrained weights (e.g., trained on ChEMBL)
# pretrained_gnn.load_state_dict(torch.load("pretrained_gin.pth"))
```

### 3. Property Prediction Pipeline / 性质预测流水线

```python
from torchdrug import data, models, tasks, core

# Load multiple datasets
datasets = {
    "hiv": data.MoleculeNet("hiv", atom_feature="default", bond_feature="default"),
    "bace": data.MoleculeNet("bace", atom_feature="default", bond_feature="default"),
    "bbbp": data.MoleculeNet("bbbp", atom_feature="default", bond_feature="default"),
}

# Unified evaluation across datasets
for name, dataset in datasets.items():
    train_set, valid_set, test_set = dataset.split()

    model = models.GIN(
        input_dim=dataset.node_feature_dim,
        hidden_dims=[256, 256, 256],
        short_cut=True, batch_norm=True
    )

    task = tasks.PropertyPrediction(
        model, task=dataset.tasks, criterion="bce",
        metric=("auc", "auprc", "f1"), num_mlp_layer=2
    )

    optimizer = torch.optim.Adam(task.parameters(), lr=1e-3, weight_decay=1e-5)
    solver = core.Engine(task, train_set, valid_set, test_set, optimizer,
                         max_epoch=30, batch_size=128)
    solver.train()
    result = solver.evaluate("test")
    print(f"{name}: AUC = {result['auc']:.3f}")
```

## Common Academic Workflows / 常见学术工作流

### Workflow: End-to-End QSAR with Cross-Validation / QSAR 交叉验证

```python
from torchdrug import data, models, tasks, core
import numpy as np

# Load dataset with scaffold split
dataset = data.MoleculeNet("tox21", atom_feature="default", bond_feature="default")
train_set, valid_set, test_set = dataset.split_by_scaffold()

# Define model
model = models.GIN(
    input_dim=dataset.node_feature_dim,
    hidden_dims=[256, 256, 256, 256],
    short_cut=True, batch_norm=True, concat_hidden=True
)

task = tasks.PropertyPrediction(
    model, task=dataset.tasks, criterion="bce",
    metric=("auc", "auprc"), num_mlp_layer=3
)

# Training with early stopping and checkpointing
optimizer = torch.optim.Adam(task.parameters(), lr=1e-3, weight_decay=1e-5)
solver = core.Engine(
    task, train_set, valid_set, test_set, optimizer,
    max_epoch=100, batch_size=256,
    scheduler="linear warmup linear decay",
    early_stop_patience=10
)
solver.train()
metrics = solver.evaluate("test")

# Per-task results
for task_name, auc_val in zip(dataset.tasks, metrics["auc"]):
    print(f"  {task_name}: AUC = {auc_val:.3f}")
```

## Best Practices / 最佳实践

1. **Use scaffold split**: Always use `split_by_scaffold()` for realistic QSAR evaluation
2. **Batch normalization**: Enable `batch_norm=True` and `short_cut=True` for deeper GNNs
3. **Pretrained weights**: Use pretrained GNN backbones when fine-tuning on small datasets
4. **Hidden dimensions**: Start with [256, 256, 256]; increase for larger datasets
5. **Learning rate**: 1e-3 with Adam works well; use warmup + decay for stability

## Common Pitfalls / 常见陷阱

- **Feature dimension mismatch**: Ensure `input_dim` matches `dataset.node_feature_dim`; check with `print(dataset.node_feature_dim)`
- **Invalid SMILES**: TorchDrug silently skips invalid molecules; verify `len(dataset)` after loading
- **CUDA OOM**: Reduce `batch_size` or `hidden_dims` for GPU memory issues
- **Overfitting on small datasets**: Use dropout, weight decay, and early stopping; consider pretrained models
- **Multi-task imbalance**: Some Tox21 tasks have very few positives; handle with weighted loss

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/rdkit.md` for SMILES generation and molecular manipulation
- Use with `references/tools/deepchem.md` for cross-framework benchmarking
- Combine with `references/tools/torch-geometric.md` for custom GNN architectures
- Integrate with `workflows/experiment-design.md` for drug discovery pipelines

## Resources / 资源

- Documentation: https://torchdrug.ai/
- Repository: https://github.com/DeepGraphLearning/torchdrug
- Tutorials: https://torchdrug.ai/docs/tutorial/start.html
- Paper: Hu et al., "TorchDrug: A Powerful and Flexible Machine Learning Platform for Drug Discovery," ICLR 2022
