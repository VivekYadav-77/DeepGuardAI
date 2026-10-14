# Phase 3 — Model Training

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. Model code goes into `src/model.py`. Colab training cells go into `notebooks/DeepGuard_AI_Training.ipynb`. Update `context.md` (Model Info section) after this phase is complete.

---

## Objective

Implement and train a small PyTorch MLP classifier on the preprocessed network traffic data. Save the best model weights. Record every training detail for reproducibility.

---

## Entry Condition

- Phase 2 COMPLETE
- `preprocessor.joblib`, `feature_schema.json`, and `label_mapping.json` exist
- Preprocessed train/val/test arrays are available in memory (or saved to disk)

---

## Steps

### Step 1: Define the Model Architecture (`src/model.py`)

Create the file `src/model.py` with:

```python
import torch
import torch.nn as nn

class DeepGuardMLP(nn.Module):
    def __init__(self, input_dim, hidden_dims=[128, 64, 32], dropout=0.3):
        super().__init__()
        layers = []
        prev_dim = input_dim
        for dim in hidden_dims:
            layers += [nn.Linear(prev_dim, dim), nn.BatchNorm1d(dim), nn.ReLU(), nn.Dropout(dropout)]
            prev_dim = dim
        layers.append(nn.Linear(prev_dim, 1))
        self.network = nn.Sequential(*layers)

    def forward(self, x):
        return self.network(x)
```

Notes:
- Output is a single logit (binary classification with BCEWithLogitsLoss)
- `input_dim` must match `feature_count` from `feature_schema.json`
- Architecture is small intentionally — do NOT make it larger

### Step 2: Implement the Training Loop (Colab Notebook)

The training loop must:
1. Set `torch.manual_seed(42)` for reproducibility
2. Use `DataLoader` with a batch size of 256 (adjust down if memory is tight)
3. Use `BCEWithLogitsLoss` as the loss function
4. Use `Adam` optimizer with `lr=1e-3`
5. Train for up to 50 epochs
6. Validate after every epoch on the validation set
7. Implement early stopping: stop if validation loss does not improve for 10 consecutive epochs
8. Save the model with the best validation loss as `model/deepguard_model.pth`
9. Record training loss and validation loss per epoch in a list
10. Print epoch summary: `Epoch N | Train Loss: X | Val Loss: Y | Val Acc: Z`

### Step 3: Handle Device Correctly

```python
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Training on: {device}")
model = DeepGuardMLP(input_dim=feature_count).to(device)
```

### Step 4: Detect Invalid Training

Add checks:
- After first batch: verify loss is finite (`torch.isnan(loss)` / `torch.isinf(loss)`)
- If loss is non-finite, stop and print the error — do not continue silently
- Verify predictions are not all the same class after each epoch

### Step 5: Save Training History

After training:
```python
import json
with open("model/training_history.json", "w") as f:
    json.dump({"train_loss": train_losses, "val_loss": val_losses}, f)
```

### Step 6: Save Model Metadata

Save `model/model_metadata.json`:
```json
{
  "architecture": "DeepGuardMLP",
  "input_dim": 41,
  "hidden_dims": [128, 64, 32],
  "dropout": 0.3,
  "optimizer": "Adam",
  "lr": 0.001,
  "batch_size": 256,
  "epochs_trained": 38,
  "early_stopping_patience": 10,
  "best_val_loss": 0.123,
  "device_used": "cpu",
  "pytorch_version": "2.x.x"
}
```

### Step 7: Verify Model Save

In a fresh Colab cell:
```python
from src.model import DeepGuardMLP
import torch, json

schema = json.load(open("model/feature_schema.json"))
model = DeepGuardMLP(input_dim=schema["feature_count"])
model.load_state_dict(torch.load("model/deepguard_model.pth", map_location="cpu"))
model.eval()
print("Model loaded successfully")
```

---

## Files to Create / Modify

| File | Action |
|---|---|
| `src/model.py` | PyTorch MLP definition |
| `notebooks/DeepGuard_AI_Training.ipynb` | Training cells added |
| `model/deepguard_model.pth` | Best model weights (after Colab run) |
| `model/training_history.json` | Per-epoch loss history |
| `model/model_metadata.json` | Architecture + training config |

---

## Output Checklist

- [ ] `src/model.py` created with `DeepGuardMLP` class
- [ ] Training loop implemented in notebook
- [ ] Training runs without NaN/Inf loss
- [ ] Early stopping implemented
- [ ] Best model saved to `model/deepguard_model.pth`
- [ ] `training_history.json` saved
- [ ] `model_metadata.json` saved
- [ ] Model verified loadable in fresh cell
- [ ] Model Info section in `context.md` updated
- [ ] Phase 3 marked COMPLETE in `context.md`

---

## Do NOT Do

- Do not train on test data
- Do not use a large architecture (keep to 3 hidden layers max)
- Do not skip early stopping
- Do not report training accuracy as test accuracy

---

## Next Phase

After completing Phase 3, proceed to **Phase 4 — Evaluation** (`phase4_evaluation.md`).
