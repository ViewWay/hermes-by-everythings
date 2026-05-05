# Paper Reproduction Guide / 论文复现指南

Systematic methodology for reproducing and verifying published research.
系统化的已发表研究复现与验证方法论。

## When to Use / 适用场景

- Verifying a baseline implementation before comparison
- Reproducing results for a systematic review
- Building on existing work (extend after reproduction)
- Learning a method by implementing from scratch
- 验证基线实现
- 系统综述中的结果复现
- 在现有工作基础上扩展
- 从头实现学习新方法

## Six-Phase Reproduction Workflow / 六阶段复现工作流

### Phase 1: Paper Parsing / 论文解析

```
Extract all implementable details from the paper.
从论文中提取所有可实现细节。

□ Read the paper end-to-end, highlight:
  - Algorithm descriptions
  - Architecture details (layers, dimensions, activations)
  - Hyperparameters (learning rate, batch size, epochs, seeds)
  - Data preprocessing steps
  - Evaluation protocol (metrics, splits, aggregation)
  - Computational requirements (GPU, memory, time)
  
□ Identify ambiguities:
  - Missing details → note for author communication
  - Underspecified choices → flag for sensitivity analysis
  - Implicit assumptions → list explicitly

□ Collect supplementary materials:
  - Appendix details
  - Code repository (if available)
  - Dataset links
```

### Phase 2: Prioritized Implementation / 分优先级实现

```
Implementation order (highest impact first):

1. Core algorithm / model architecture
   核心算法/模型架构
2. Data loading and preprocessing
   数据加载和预处理
3. Training loop and optimization
   训练循环和优化
4. Evaluation metrics
   评估指标
5. Auxiliary components (regularization, augmentation)
   辅助组件（正则化、增强）
6. Inference pipeline
   推理流水线
```

### Phase 3: Component Testing / 组件测试

```
Test each component independently before integration.
集成前独立测试每个组件。

□ Unit tests for each module:
  - Input/output shape verification
  - Gradient flow check (for neural networks)
  - Deterministic output for fixed seed
  - Numerical correctness (compare with known values)

□ Integration tests:
  - One forward pass completes without error
  - One backward pass completes without NaN
  - One training step produces valid loss
  - Checkpoint save/load works correctly
```

```python
# Component test template
def test_component():
    # Setup
    component = MyComponent(config)
    input_data = create_test_input()
    
    # Forward
    output = component(input_data)
    
    # Verify shape
    assert output.shape == expected_shape, f"Shape mismatch: {output.shape} vs {expected_shape}"
    
    # Verify range
    assert not torch.isnan(output).any(), "NaN detected"
    assert not torch.isinf(output).any(), "Inf detected"
    
    # Verify gradient
    loss = output.sum()
    loss.backward()
    for name, param in component.named_parameters():
        assert param.grad is not None, f"No gradient for {name}"
```

### Phase 4: Debugging Protocol / 调试协议

```
When results don't match the paper:
当结果与论文不符时：

Level 1: Infrastructure
  □ Correct library versions (PyTorch, CUDA, etc.)
  □ Deterministic mode enabled (torch.manual_seed + deterministic algorithms)
  □ Same hardware class (GPU generation matters for numerical precision)

Level 2: Data
  □ Same dataset version and preprocessing
  □ Same train/val/test split
  □ Same data augmentation pipeline
  □ Verify with sample inspection (visualize 10 random samples)

Level 3: Model
  □ Architecture matches paper description
  □ Weight initialization matches
  □ Compare layer-by-layer output with paper's (if available)

Level 4: Training
  □ Same optimizer and hyperparameters
  □ Same learning rate schedule
  □ Same batch size (or effective batch size with accumulation)
  □ Same regularization (dropout, weight decay, label smoothing)

Level 5: Evaluation
  □ Same metric computation
  □ Same aggregation (mean of seeds? best checkpoint?)
  □ Same post-processing steps
```

### Phase 5: Sensitivity Analysis / 敏感性分析

```
When exact reproduction fails, determine what matters.
当精确复现失败时，确定关键因素。

□ Vary each hyperparameter ±10% and measure impact
□ Test different random seeds (report mean ± std)
□ Compare: paper-reported vs. your best vs. your worst
□ Identify which components are fragile vs. robust
```

| Factor | Expected Impact | Your Finding |
|--------|----------------|-------------|
| Learning rate | High | ? |
| Batch size | Medium | ? |
| Random seed | Low-Medium | ? |
| Data augmentation | Medium | ? |
| Weight initialization | Low | ? |
| GPU precision (fp32 vs fp16) | Low | ? |

### Phase 6: Documentation & Report / 文档与报告

```
Document everything for reproducibility of the reproduction.
文档化一切以确保复现的复现性。

□ Reproduction report structure:
  1. Paper summary (key claims, reported results)
  2. Implementation details (what matched, what didn't)
  3. Results comparison table
  4. Sensitivity analysis findings
  5. Identified ambiguities / missing details
  6. Recommendations for future work
```

## Results Comparison Template / 结果对比模板

```markdown
## Reproduction Results / 复现结果

| Metric | Paper | Ours | Δ | Match? |
|--------|-------|------|---|--------|
| Accuracy | 92.1 ± 0.3 | 91.8 ± 0.4 | -0.3 | ✅ |
| F1 | 89.5 ± 0.5 | 88.9 ± 0.6 | -0.6 | ✅ |
| Speed | 100ms/sample | 105ms/sample | +5% | ✅ |

**Verdict**: [Exact Match / Close Match / Partial Match / Failed]
**Notes**: [Any discrepancies and explanations]
```

## Cross-Discipline Reproduction / 跨学科复现

| Discipline | Reproduction Focus | Common Challenges |
|-----------|-------------------|------------------|
| CS/AI | Code + hyperparameters + seeds | Undocumented tricks, GPU-dependent |
| Physics | Simulation parameters + initial conditions | Numerical precision, software versions |
| Medicine | Statistical analysis + patient cohort | Data access restrictions, privacy |
| Social Science | Data cleaning + statistical model | Survey design details, sample weights |
| Economics | Model specification + data sources | Data licensing, structural assumptions |
| Biology | Experimental protocol + reagents | Biological variability, lab-specific conditions |

## When to Contact Authors / 何时联系作者

Contact authors when:
1. **Code is not available** and the paper describes a novel method
2. **Results cannot be reproduced within ±5%** after careful implementation
3. **Critical details are missing** from the paper (not in supplementary either)
4. **Dataset access requires permission**

**Email Template**:
```
Subject: Reproduction question regarding [Paper Title]

Dear [Author],

I am writing to ask about a detail in your paper "[Title]" ([Venue] [Year]).

I am trying to reproduce your results and have a question about [specific detail].

[Your specific question, as precise as possible]

I have already checked the paper and supplementary materials carefully.

Thank you for your time.

Best regards,
[Your name]
```

## Integration / 集成

- Supports `workflows/experiment-design.md` (baseline verification)
- Feeds `references/research-integrity-guide.md` (result verification)
- Complements `references/pre-submission-review.md` (quality check)
- Works with `references/systematic-review-methodology.md` (systematic review reproduction)

## Recommended Tools / 推荐工具

See `references/tool-registry.md` for the full curated list.

| Task | Tool | Install |
|------|------|---------|
| Environment isolation | conda / venv | `pip install conda` |
| Package management | pip + requirements.txt | built-in |
| Experiment tracking | wandb / mlflow | `pip install wandb` |
| GPU monitoring | nvidia-smi / gpustat | `pip install gpustat` |
| Result comparison | pandas | `pip install pandas` |
| Statistical verification | scipy + statsmodels | `pip install scipy statsmodels` |
| Container reproduction | Docker | https://docker.com |
