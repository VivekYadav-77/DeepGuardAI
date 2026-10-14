# Phase 4 — Baseline and Evaluation

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. All evaluation results must come from ACTUAL execution — never invent metrics. Update `context.md` (Evaluation Results section) after this phase completes.

---

## Objective

Train a simple baseline classifier. Evaluate both the DeepGuard MLP and the baseline on the same held-out test set. Save real metrics to `model/evaluation_metrics.json`. Generate confusion matrix chart.

---

## Entry Condition

- Phase 3 COMPLETE
- `deepguard_model.pth` saved and verified loadable
- Test split is available and has NOT been used in any training step

---

## Steps

### Step 1: Train the Baseline Classifier

Use Logistic Regression (preferred) or a shallow Decision Tree from scikit-learn:

```python
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

baseline = LogisticRegression(max_iter=1000, random_state=42)
baseline.fit(X_train, y_train)
y_pred_baseline = baseline.predict(X_test)
```

Save the baseline model if needed for the dashboard:
```python
joblib.dump(baseline, "model/baseline_model.joblib")
```

### Step 2: Evaluate the Baseline

Calculate and print:
- Accuracy
- Precision (macro + per-class)
- Recall (macro + per-class)
- F1-score (macro + per-class)
- Confusion matrix

### Step 3: Evaluate the DeepGuard MLP

Load the best saved model and run inference on the test set:

```python
model.load_state_dict(torch.load("model/deepguard_model.pth", map_location="cpu"))
model.eval()
with torch.no_grad():
    logits = model(X_test_tensor).squeeze()
    probs = torch.sigmoid(logits).numpy()
    y_pred_mlp = (probs >= 0.5).astype(int)
```

Calculate same metrics as baseline.

### Step 4: Compute ROC-AUC

```python
from sklearn.metrics import roc_auc_score
roc_auc_mlp = roc_auc_score(y_test, probs)
roc_auc_baseline = roc_auc_score(y_test, baseline.predict_proba(X_test)[:, 1])
```

### Step 5: Generate Confusion Matrix Chart

```python
from sklearn.metrics import ConfusionMatrixDisplay
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(12, 5))
ConfusionMatrixDisplay.from_predictions(y_test, y_pred_mlp, ax=axes[0], display_labels=["Benign", "Attack"])
axes[0].set_title("DeepGuard MLP")
ConfusionMatrixDisplay.from_predictions(y_test, y_pred_baseline, ax=axes[1], display_labels=["Benign", "Attack"])
axes[1].set_title("Baseline (LogReg)")
plt.savefig("model/confusion_matrix.png", dpi=100, bbox_inches="tight")
```

### Step 6: Save Evaluation Metrics

Save `model/evaluation_metrics.json` with REAL values from actual execution:

```json
{
  "dataset": "NSL-KDD",
  "test_size": 25000,
  "mlp": {
    "accuracy": 0.0,
    "precision_macro": 0.0,
    "recall_macro": 0.0,
    "f1_macro": 0.0,
    "roc_auc": 0.0,
    "confusion_matrix": [[0, 0], [0, 0]]
  },
  "baseline": {
    "model": "LogisticRegression",
    "accuracy": 0.0,
    "precision_macro": 0.0,
    "recall_macro": 0.0,
    "f1_macro": 0.0,
    "roc_auc": 0.0
  }
}
```

Replace all 0.0 values with real numbers from execution.

### Step 7: Update context.md

Fill in the Evaluation Results section of `context.md` with the real values.

### Step 8: Honest Assessment

In a notebook markdown cell, write:
- Which model performed better and why
- Any surprising results
- Known limitations of the evaluation
- Do NOT claim superiority if the MLP did not outperform the baseline

---

## Files to Create / Modify

| File | Action |
|---|---|
| `model/evaluation_metrics.json` | Real metrics from execution |
| `model/confusion_matrix.png` | Confusion matrix chart |
| `model/baseline_model.joblib` | Saved baseline (optional) |
| `notebooks/DeepGuard_AI_Training.ipynb` | Evaluation cells added |

---

## Output Checklist

- [ ] Baseline trained and evaluated on test set
- [ ] MLP evaluated on same test set
- [ ] ROC-AUC computed for both models
- [ ] Confusion matrix chart saved
- [ ] `evaluation_metrics.json` saved with REAL values
- [ ] `context.md` Evaluation Results section updated
- [ ] Honest comparison written in notebook
- [ ] Phase 4 marked COMPLETE in `context.md`

---

## Do NOT Do

- Do not invent or guess metrics — use actual computed values only
- Do not evaluate the baseline on a different test split than the MLP
- Do not report validation metrics as test metrics
- Do not use test labels during preprocessing (data leakage)

---

## Next Phase

After completing Phase 4, proceed to **Phase 5 — Artifact Export** (`phase5_artifacts.md`).
