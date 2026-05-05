---
name: transformers
description: HuggingFace Transformers for NLP and beyond. Use for pretrained language models, tokenizers, text classification, generation, embedding, and fine-tuning.
domain: cs
install: pip install transformers
---

# Transformers: Pretrained Language Models

## Overview

HuggingFace Transformers provides access to 500K+ pretrained models (BERT, GPT, T5, LLaMA, Mistral, etc.) for NLP tasks — classification, generation, translation, summarization, QA, and more.

## When to Use

- Text classification / sentiment analysis
- Named entity recognition
- Question answering
- Text generation / summarization
- Feature extraction (embeddings)
- Fine-tuning pretrained models
- Any NLP task

## Quick Start

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

# Pipeline (quick inference)
classifier = pipeline('text-classification', model='distilbert-base-uncased-finetuned-sst-2-english')
result = classifier("This paper presents a novel approach.")

# Tokenizer + Model (for training)
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
model = AutoModelForSequenceClassification.from_pretrained('bert-base-uncased', num_labels=2)

inputs = tokenizer("This is a great paper.", return_tensors='pt', padding=True, truncation=True)
outputs = model(**inputs)
logits = outputs.logits
```

## Core Capabilities

### 1. Fine-Tuning

```python
from transformers import Trainer, TrainingArguments
from datasets import Dataset

# Prepare dataset
def tokenize(batch): return tokenizer(batch['text'], padding='max_length', truncation=True, max_length=512)
tokenized = dataset.map(tokenize, batched=True)

# Training arguments
training_args = TrainingArguments(
    output_dir='./results', num_train_epochs=3, per_device_train_batch_size=16,
    per_device_eval_batch_size=32, warmup_steps=500, weight_decay=0.01,
    evaluation_strategy='epoch', save_strategy='epoch', load_best_model_at_end=True,
    metric_for_best_model='f1', logging_dir='./logs', report_to='wandb',
)

trainer = Trainer(model=model, args=training_args, train_dataset=train_ds,
                  eval_dataset=val_ds, compute_metrics=compute_metrics)
trainer.train()
```

### 2. Text Generation

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained('gpt2')
model = AutoModelForCausalLM.from_pretrained('gpt2')

inputs = tokenizer("The key contribution of this work is", return_tensors='pt')
outputs = model.generate(**inputs, max_length=100, num_return_sequences=3,
                          temperature=0.7, top_p=0.9, do_sample=True)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

### 3. Embeddings for Research

```python
from transformers import AutoModel
import torch

model = AutoModel.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')
tokenizer = AutoTokenizer.from_pretrained('sentence-transformers/all-MiniLM-L6-v2')

def get_embeddings(texts):
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors='pt', max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :]  # [CLS] token embedding

embs = get_embeddings(["Paper about neural networks", "Paper about genetics"])
cosine_sim = torch.nn.functional.cosine_similarity(embs[0:1], embs[1:2])
```

## Best Practices

1. **Use `sentence-transformers`** for embeddings: Better than raw model outputs
2. **Set `truncation=True`**: Prevent OOM from long sequences
3. **Use `fp16` for training**: `TrainingArguments(fp16=True)` halves GPU memory
4. **Gradient checkpointing**: For large models, `model.gradient_checkpointing_enable()`
5. **Batch tokenization**: `tokenizer(texts, ...)` is faster than looping

## Common Pitfalls

1. **Padding token**: Some models lack `pad_token` → set `tokenizer.pad_token = tokenizer.eos_token`
2. **Max length**: Default 512 for BERT; check model-specific limits
3. **Memory**: Large models need `device_map='auto'` with `accelerate`
4. **Tokenization mismatch**: Always use the same tokenizer as the pretrained model

## Integration with HBE

- Primary NLP tool in `references/tool-registry.md`
- Supports `workflows/experiment-design.md` for NLP experiments
- Works with `references/tools/pytorch-lightning.md` for training
- See `references/tools/shap.md` for model interpretation

## Resources

- Documentation: https://huggingface.co/docs/transformers/
- Model Hub: https://huggingface.co/models
- Wolf et al. (2020) "HuggingFace's Transformers" — JMLR paper
