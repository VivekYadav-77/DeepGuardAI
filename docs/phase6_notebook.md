# Phase 6 — Google Colab Training Notebook

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. Create the file `notebooks/DeepGuard_AI_Training.ipynb` locally using Antigravity. The notebook must be runnable top-to-bottom in a fresh Colab environment. Add a task to `vivek.md` to upload and run the notebook.

---

## Objective

Create a complete, self-contained Jupyter notebook at `notebooks/DeepGuard_AI_Training.ipynb`. The notebook must execute all pipeline steps from environment setup to artifact download without requiring anything pre-installed or pre-configured on the Colab runtime.

---

## Entry Condition

- Phases 1–5 must be complete (or planned, since the notebook will be run after planning)
- The notebook can be created locally by Antigravity and then uploaded by Vivek to Colab

---

## Required Notebook Sections

### Cell 1: Title (Markdown)
```
# DeepGuard AI — Training Notebook
Deep Learning-Based Network Intrusion Detection System
B.Tech Academic Project
```

### Cell 2: Environment Inspection
```python
import sys, platform, subprocess
print(f"Python: {sys.version}")
print(f"OS: {platform.system()}")
result = subprocess.run(["nvidia-smi"], capture_output=True, text=True)
print(result.stdout if result.returncode == 0 else "No GPU detected — using CPU")
```

### Cell 3: Dependency Installation
```python
!pip install -q torch torchvision scikit-learn pandas numpy joblib plotly
```

### Cell 4: Dataset Acquisition
- If direct URL: `!wget <URL>` or use `requests`
- If manual upload: clear instruction in markdown: `# MANUAL STEP: Upload your dataset file using the Colab Files panel`

### Cell 5: Dataset Inspection
- Load CSV, print shape, dtypes, missing values, class distribution

### Cell 6: Preprocessing (calls `src/preprocessing.py` functions)

### Cell 7: Train/Val/Test Split + Print sizes and class distributions

### Cell 8: Baseline Model Training + Evaluation

### Cell 9: PyTorch Model Definition (inline or imports from `src/model.py`)

### Cell 10: Training Loop with early stopping, loss tracking

### Cell 11: Training Curve Plot
```python
import matplotlib.pyplot as plt
plt.plot(train_losses, label="Train Loss")
plt.plot(val_losses, label="Val Loss")
plt.legend(); plt.title("Training History"); plt.savefig("model/training_curve.png")
```

### Cell 12: Full Evaluation (MLP + Baseline on test set)

### Cell 13: Confusion Matrix Chart Generation

### Cell 14: Save All Artifacts
```python
# Save model, preprocessor, all JSONs
```

### Cell 15: Artifact Verification (fresh load test)

### Cell 16: Download Artifacts
```python
import shutil
from google.colab import files
shutil.make_archive("deepguard_artifacts", "zip", "model/")
files.download("deepguard_artifacts.zip")
```

---

## Notebook Rules

1. Every cell must have a markdown header describing what it does
2. All random seeds must be set to 42
3. All GPU/CPU decisions must be explicit (`torch.device(...)`)
4. The notebook must run top-to-bottom on a fresh Colab runtime
5. No hardcoded paths that are only valid on Vivek's local machine
6. Dataset source URL or upload instructions must be clearly marked
7. No access tokens or API keys in any cell
8. Use `print()` statements to confirm progress at every major step

---

## Vivek Manual Task

Add to `vivek.md`:
1. Go to https://colab.research.google.com
2. Upload `notebooks/DeepGuard_AI_Training.ipynb`
3. Upload the dataset file (if manual upload needed — see Cell 4)
4. Click Runtime > Run All
5. Monitor training output for errors
6. Download `deepguard_artifacts.zip` when Cell 16 runs
7. Extract to `model/` folder in the local project

---

## Output Checklist

- [ ] `notebooks/DeepGuard_AI_Training.ipynb` created locally
- [ ] All 16+ cells implemented
- [ ] Markdown headers on every cell
- [ ] Dataset acquisition cell clearly written
- [ ] Vivek manual steps added to `vivek.md`
- [ ] Phase 6 marked COMPLETE in `context.md`

---

## Next Phase

After completing Phase 6, proceed to **Phase 7 — Next.js Dashboard** (`phase7_dashboard.md`).
