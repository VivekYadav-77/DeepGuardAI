# Phase 7 — Next.js Dashboard

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. The dashboard is implemented in `app.py`. All inference logic goes in `src/inference.py`. All input validation goes in `src/validation.py`. The dashboard must look like a professional cybersecurity analytics tool — not a default Next.js tutorial.

---

## Objective

Build a polished, dark-themed, professional Next.js dashboard that:
- Loads model artifacts and displays project info
- Allows CSV upload for batch inference
- Shows real evaluation metrics from `evaluation_metrics.json`
- Provides threat analysis summaries
- Handles all error conditions gracefully without crashing

---

## Entry Condition

- Phase 5 COMPLETE
- Model artifacts exist in `model/` folder (or are placeholders if Colab hasn't run yet)
- The dashboard must handle missing artifacts gracefully

---

## Pages / Tabs to Implement

### Tab A: Overview

Display:
- Project title: "DeepGuard AI — Network Intrusion Detection System"
- Dataset name, source, and record count (from `context.md` / `model_metadata.json`)
- Model type: "PyTorch Multilayer Perceptron (MLP)"
- Quick metric cards: Accuracy, F1-Score, ROC-AUC (from `evaluation_metrics.json`)
- Model readiness indicator: green if all artifacts exist, amber if some missing, red if none
- Academic disclaimer: "This is an academic demonstration. Predictions are for educational purposes only."

### Tab B: Traffic Analyzer

Allow user to upload a CSV:
- Max size: 10MB
- Max records: 50,000
- Validate that required feature columns are present (from `feature_schema.json`)
- Show missing columns with a clear error message
- Show a preview of the uploaded data (first 10 rows)
- Show a spinner during inference
- Display results table with columns: Row, Predicted Class, Confidence Score
- Color code rows: green = Benign, red = Attack (Suspicious)
- Download button: export predictions as CSV
- Do NOT label confidence as "probability" — label it "confidence score"

### Tab C: Model Performance

Display:
- Side-by-side metric comparison table (MLP vs Baseline)
- Confusion matrix image (`model/confusion_matrix.png`)
- Training loss curve (from `training_history.json`) using Plotly
- Per-class metrics table

### Tab D: Threat Analysis

Display (only after a CSV is uploaded and analyzed):
- Pie chart: Benign vs Suspicious predictions
- Summary bar: Total records, Benign count, Suspicious count
- Feature statistics table (mean/std of uploaded features)
- Do NOT claim these are confirmed attacks

### Tab E: Model Information

Display as structured text sections:
- Dataset: name, source URL, record count, features
- Preprocessing: steps taken (StandardScaler, label encoding, etc.)
- Model: architecture, layer sizes, activation, dropout
- Training: optimizer, lr, batch size, epochs, early stopping
- Evaluation: methodology, test split size
- Limitations: 5–7 honest limitations of the system
- Disclaimer: "This system is for academic study only. It is not suitable for production security infrastructure."

---

## UI / Design Requirements

- Dark background: `#0a0e1a` or similar deep navy/black
- Accent colors: electric blue `#00d4ff` and green `#00ff88`
- Use custom CSS via `st.markdown("<style>...</style>", unsafe_allow_html=True)`
- Font: Use a system monospace font or Google Fonts via CSS
- Use `st.metric()` for KPI cards
- Use Plotly for all charts (not Matplotlib in Next.js)
- Use `st.tabs()` for the main navigation
- Use `st.columns()` for side-by-side layouts
- Use `st.expander()` for detailed information sections
- Consistent padding/spacing throughout

---

## Error Handling Requirements

| Condition | Response |
|---|---|
| `model/` folder missing | Show warning: "Model artifacts not found. Run the training notebook first." |
| `.pth` file missing | Show warning with artifact name |
| Uploaded CSV is not a CSV | Show error and stop |
| Required columns missing | List missing columns in error |
| CSV is empty | Show error |
| CSV exceeds 50,000 rows | Show warning, truncate to 50,000 |
| Model throws exception | Show error with message, do not show traceback |
| JSON files malformed | Show error, offer fallback UI |

---

## Files to Create / Modify

| File | Action |
|---|---|
| `app.py` | Main Next.js application |
| `src/inference.py` | Load model + run predictions |
| `src/validation.py` | Validate uploaded CSV against schema |

---

## Output Checklist

- [ ] `app.py` created with all 5 tabs
- [ ] `src/inference.py` implemented
- [ ] `src/validation.py` implemented
- [ ] Dark cybersecurity theme applied with custom CSS
- [ ] All error conditions handled
- [ ] Dashboard runs locally with `Next.js run app.py`
- [ ] No hardcoded metrics anywhere in the code
- [ ] Phase 7 marked COMPLETE in `context.md`

---

## Local Test Command

```powershell
cd "d:\web devfiles\DeepGuard AI"
Next.js run app.py
```

Tell Vivek to run this after artifacts are placed in the `model/` folder.

---

## Do NOT Do

- Do not hardcode any metric values in the Python code
- Do not allow the app to crash with a Python traceback
- Do not use plain Next.js default styling — apply the dark theme
- Do not claim predictions are real security alerts

---

## Next Phase

After completing Phase 7, proceed to **Phase 8 — Project Structure** (`phase8_structure.md`).
