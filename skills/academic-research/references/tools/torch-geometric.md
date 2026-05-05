---
name: torch-geometric
description: Graph Neural Network library built on PyTorch — for node classification, link prediction, and graph classification
domain: ML / Graph Neural Networks
install: pip install torch-geometric
---

# PyTorch Geometric — Graph Neural Networks / 图神经网络

PyTorch Geometric (PyG) provides implementations of Graph Neural Networks (GNNs) for research and production: GCN, GAT, GraphSAGE, GIN, and many more. It handles mini-batch training on large graphs via neighbor sampling.

## When to Use / 适用场景

- Node classification, link prediction, graph classification
- Molecular graph property prediction
- Social network analysis, citation networks
- Point cloud processing, mesh analysis
- Any data naturally represented as graphs

## Quick Start / 快速开始

```python
import torch
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv
import torch.nn.functional as F

# Create graph
edge_index = torch.tensor([[0, 1, 1, 2], [1, 0, 2, 1]], dtype=torch.long)
x = torch.randn(3, 16)  # 3 nodes, 16 features
data = Data(x=x, edge_index=edge_index)

# GCN model
class GCN(torch.nn.Module):
    def __init__(self, in_channels, hidden_channels, out_channels):
        super().__init__()
        self.conv1 = GCNConv(in_channels, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, out_channels)
    
    def forward(self, x, edge_index):
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.5, training=self.training)
        x = self.conv2(x, edge_index)
        return x

model = GCN(16, 32, 7)
out = model(data.x, data.edge_index)
```

## Core Capabilities / 核心能力

### 1. Data Handling / 数据处理

```python
from torch_geometric.data import Data, DataLoader

# Node features + edge features + labels
data = Data(
    x=node_features,          # [N, F] node features
    edge_index=edge_index,    # [2, E] edge list (COO format)
    edge_attr=edge_features,  # [E, D] edge features
    y=label,                  # scalar or [N] for node classification
    train_mask=train_mask,    # Boolean mask for training nodes
    test_mask=test_mask
)

# DataLoader for graph classification
loader = DataLoader(dataset, batch_size=32, shuffle=True)
for batch in loader:
    out = model(batch.x, batch.edge_index, batch.batch)
```

### 2. Common GNN Layers / 常用 GNN 层

```python
from torch_geometric.nn import GCNConv, GATConv, SAGEConv, GINConv, global_mean_pool

# Graph Convolutional Network
conv = GCNConv(in_channels, out_channels)

# Graph Attention Network
conv = GATConv(in_channels, out_channels, heads=4)

# GraphSAGE (inductive)
conv = SAGEConv(in_channels, out_channels)

# Graph Isomorphism Network
conv = GINConv(nn=torch.nn.Sequential(
    torch.nn.Linear(in_channels, out_channels),
    torch.nn.ReLU(),
    torch.nn.Linear(out_channels, out_channels)
))

# Graph pooling
pooled = global_mean_pool(node_features, batch)  # [B, F]
```

### 3. Benchmark Datasets / 基准数据集

```python
from torch_geometric.datasets import Planetoid, TUDataset, QM9

# Citation networks (Cora, Citeseer, Pubmed)
dataset = Planetoid(root="data/", name="Cora")
data = dataset[0]

# Graph classification datasets
dataset = TUDataset(root="data/", name="PROTEINS")

# Molecular graphs (QM9 quantum chemistry)
dataset = QM9(root="data/")
```

### 4. Mini-Batch Training on Large Graphs / 大图小批量训练

```python
from torch_geometric.loader import NeighborLoader

# Neighbor sampling for scalable training
loader = NeighborLoader(
    data,
    num_neighbors=[25, 10],  # Sample 25 neighbors at hop 1, 10 at hop 2
    batch_size=256,
    input_nodes=data.train_mask
)

for batch in loader:
    out = model(batch.x, batch.edge_index)
    loss = F.cross_entropy(out[batch.train_mask], batch.y[batch.train_mask])
```

## Common Academic Workflows / 常见学术工作流

### Workflow 1: Node Classification / 节点分类

```python
from torch_geometric.datasets import Planetoid
from torch_geometric.nn import GCNConv
import torch.nn.functional as F
import torch

dataset = Planetoid(root="data/Cora", name="Cora")
data = dataset[0]

class GCN(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = GCNConv(dataset.num_features, 16)
        self.conv2 = GCNConv(16, dataset.num_classes)
    
    def forward(self, data):
        x, edge_index = data.x, data.edge_index
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, training=self.training)
        x = self.conv2(x, edge_index)
        return F.log_softmax(x, dim=1)

model = GCN()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

for epoch in range(200):
    model.train()
    optimizer.zero_grad()
    out = model(data)
    loss = F.nll_loss(out[data.train_mask], data.y[data.train_mask])
    loss.backward()
    optimizer.step()
    
    if epoch % 20 == 0:
        model.eval()
        pred = out.argmax(dim=1)
        acc = (pred[data.test_mask] == data.y[data.test_mask]).float().mean()
        print(f"Epoch {epoch}: Loss={loss:.4f}, Test Acc={acc:.4f}")
```

### Workflow 2: Molecular Property Prediction / 分子性质预测

```python
from torch_geometric.datasets import MoleculeNet
from torch_geometric.nn import GINEConv, global_mean_pool
from torch_geometric.loader import DataLoader
import torch.nn.functional as F
import torch

dataset = MoleculeNet(root="data/", name="ESOL")
train_dataset = dataset[:800]
test_dataset = dataset[800:]
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

class MolecularGNN(torch.nn.Module):
    def __init__(self, num_features, hidden_dim=128):
        super().__init__()
        self.conv1 = GINEConv(torch.nn.Linear(num_features, hidden_dim))
        self.conv2 = GINEConv(torch.nn.Linear(hidden_dim, hidden_dim))
        self.lin = torch.nn.Linear(hidden_dim, 1)
    
    def forward(self, batch):
        x = F.relu(self.conv1(x=batch.x, edge_index=batch.edge_index, edge_attr=batch.edge_attr))
        x = F.relu(self.conv2(x=x, edge_index=batch.edge_index, edge_attr=batch.edge_attr))
        x = global_mean_pool(x, batch.batch)
        return self.lin(x).squeeze(-1)

model = MolecularGNN(dataset.num_features)
optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)

for epoch in range(100):
    model.train()
    for batch in train_loader:
        optimizer.zero_grad()
        pred = model(batch)
        loss = F.mse_loss(pred, batch.y.squeeze())
        loss.backward()
        optimizer.step()
```

## Best Practices / 最佳实践

- Use `DataLoader` for graph classification, `NeighborLoader` for large graphs
- Apply L2 normalization to node features before training
- Use early stopping based on validation loss
- Report mean ± std over multiple random seeds (3-10 runs)

## Common Pitfalls / 常见陷阱

- **COO format**: `edge_index` must be shape [2, E], not [E, 2]
- **Self-loops**: Some layers require self-loops; use `torch_geometric.utils.add_self_loops()`
- **Gradient flow**: Ensure no in-place operations on tensors that need gradients
- **Memory**: Large graphs may need neighbor sampling or subgraph training

## Integration with HBE / 与 HBE 集成

- Pair with `references/tools/rdkit.md` for converting molecules to graphs
- Use with `references/tools/pytorch-lightning.md` for training management
- Combine with `references/tools/matplotlib.md` for training curves and embedding visualization
- Integrate with `references/tools/deepchem.md` for molecular ML baselines

## Resources / 资源

- Documentation: https://pytorch-geometric.readthedocs.io/
- Tutorials: https://pytorch-geometric.readthedocs.io/en/latest/get_started/introduction.html
- Paper: Fey & Lenssen, ICLR 2019
