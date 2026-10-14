# Phase 5 — Artifact Export

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. This phase ensures all model artifacts are complete, verified, and ready to be downloaded from Colab and placed into the local `model/` folder. Update the Artifacts table in `context.md` when done.

---

## Objective

Export all artifacts needed for reproducible inference. Package them for download. Verify that a fresh Python environment can load them and produce valid predictions. Tell Vivek exactly what to download and where to put the files.

---

## Entry Condition

- Phase 4 COMPLETE
- All model files and metrics have been generated in Colab

---

## Required Artifacts

| Artifact | Purpose |
|---|---|
| `deepguard_model.pth` | PyTorch MLP weights |
| `preprocessor.joblib` | Fitted StandardScaler |
| `feature_schema.json` | Feature names + count + drop list |
| `label_mapping.json` | Label encoding (0=Benign, 1=Attack) |
| `model_metadata.json` | Architecture + training config |
| `evaluation_metrics.json` | Real test-set metrics |
| `training_history.json` | Per-epoch loss history |
| `confusion_matrix.png` | Confusion matrix visualization |

---

## Steps

### Step 1: Verify All Artifacts Exist in Colab

In the Colab notebook, add a verification cell:

```python
import os
required = [
    "model/deepguard_model.pth",
    "model/preprocessor.joblib",
    "model/feature_schema.json",
    "model/label_mapping.json",
    "model/model_metadata.json",
    "model/evaluation_metrics.json",
    "model/training_history.json",
    "model/confusion_matrix.png"
]
for f in required:
    status = "OK" if os.path.exists(f) else "MISSING"
    print(f"{status}: {f}")
```

All must show "OK" before proceeding.

### Step 2: Load Test in Fresh Colab Cell

In a completely fresh cell (no imported variables), verify:

```python
import torch, json, joblib, numpy as np

# Load schema
schema = json.load(open("model/feature_schema.json"))
feature_count = schema["feature_count"]

# Load model
from src.model import DeepGuardMLP
model = DeepGuardMLP(input_dim=feature_count)
model.load_state_dict(torch.load("model/deepguard_model.pth", map_location="cpu"))
model.eval()

# Load preprocessor
preprocessor = joblib.load("model/preprocessor.joblib")

# Test with dummy input (zeros)
dummy = np.zeros((1, feature_count), dtype=np.float32)
dummy_scaled = preprocessor.transform(dummy)
dummy_tensor = torch.tensor(dummy_scaled, dtype=torch.float32)
with torch.no_grad():
    logit = model(dummy_tensor)
    prob = torch.sigmoid(logit).item()
print(f"Fresh-load test prediction probability: {prob:.4f}")
print("All artifacts verified successfully.")
```

### Step 3: Package Artifacts for Download

In Colab:
```python
import shutil
shutil.make_archive("deepguard_artifacts", "zip", "model/")
print("Archive created: deepguard_artifacts.zip")
```

Then download via:
```python
from google.colab import files
files.download("deepguard_artifacts.zip")
```

### Step 4: Tell Vivek What to Do

Add a task to `vivek.md`:
- Download `deepguard_artifacts.zip` from Colab
- Extract to the local `model/` folder
- Verify all files are present

### Step 5: Update context.md Artifacts Table

Mark each artifact as CREATED with the date in `context.md`.

---

## Output Checklist

- [ ] All 8 required artifacts exist in Colab
- [ ] Fresh-load verification cell passes
- [ ] Artifacts packaged as `deepguard_artifacts.zip`
- [ ] Download instructions added to `vivek.md`
- [ ] Artifacts table in `context.md` updated
- [ ] Phase 5 marked COMPLETE in `context.md`

---

## Do NOT Do

- Do not skip the fresh-load verification
- Do not include training data in the artifacts archive
- Do not include credentials or API keys in any JSON file
- Do not compress model weights with lossy compression

---

## Next Phase

After completing Phase 5, proceed to **Phase 6 — Colab Notebook** (`phase6_notebook.md`).
