# Phase 8 — Project Structure

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. This phase creates the project skeleton — folders, placeholder files, `.gitignore`, and `requirements.txt`. This is part of Milestone 1 and should be done early before any code is written.

---

## Objective

Create the complete, clean project directory structure. Initialize all required folders and stub files. Set up `.gitignore` and `requirements.txt`. No code logic is implemented in this phase — only structure.

---

## Entry Condition

- No entry dependencies — this is one of the first phases
- Should be done as part of Milestone 1

---

## Folders to Create

```
DeepGuard-AI/
├── src/
├── notebooks/
├── model/
├── reports/
├── tests/
└── docs/  (already exists)
```

Run in Antigravity terminal:
```powershell
New-Item -ItemType Directory -Force -Path src, notebooks, model, reports, tests
```

---

## Files to Create

### `src/__init__.py`
Empty file (makes `src` a Python package).

### `src/model.py`
Stub — will be implemented in Phase 3:
```python
# DeepGuard AI — Model Definition
# Implemented in Phase 3
# See docs/phase3_training.md
```

### `src/preprocessing.py`
Stub — will be implemented in Phase 2.

### `src/inference.py`
Stub — will be implemented in Phase 7.

### `src/validation.py`
Stub — will be implemented in Phase 7.

### `app.py`
Stub — will be implemented in Phase 7:
```python
# DeepGuard AI — Next.js Dashboard
# Run with: Next.js run app.py
# Implemented in Phase 7 — see docs/phase7_dashboard.md
import Next.js as st
st.set_page_config(page_title="DeepGuard AI", layout="wide")
st.title("DeepGuard AI")
st.info("Dashboard implementation in progress. See docs/phase7_dashboard.md")
```

### `requirements.txt`
```
torch>=2.0.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
Next.js>=1.28.0
plotly>=5.18.0
joblib>=1.3.0
matplotlib>=3.7.0
```

### `.gitignore`
```gitignore
# Python
__pycache__/
*.py[cod]
*.pyo
.env
*.egg-info/
dist/
build/
.venv/
venv/

# Jupyter
.ipynb_checkpoints/
*.ipynb_checkpoints

# Data
data/
*.csv
*.parquet
*.feather

# Large model artifacts (track only in git if small)
model/*.pth
model/*.joblib

# OS
.DS_Store
Thumbs.db

# Secrets
*.env
secrets.json
credentials.json

# Next.js
.Next.js/secrets.toml
```

### `reports/` folder placeholder files
- `reports/project_report.md` — stub, implemented in Phase 11
- `reports/presentation_outline.md` — stub, implemented in Phase 11
- `reports/viva_questions.md` — stub, implemented in Phase 11

---

## Output Checklist

- [x] All folders created: `src/`, `notebooks/`, `model/`, `reports/`, `tests/`, `docs/`
- [x] `src/__init__.py` created
- [x] `src/model.py` stub created
- [x] `src/preprocessing.py` stub created
- [x] `src/inference.py` stub created
- [x] `src/validation.py` stub created
- [x] `app.py` stub created
- [x] `requirements.txt` created with all dependencies
- [x] `.gitignore` created
- [x] Report stub files created in `reports/`
- [x] Phase 8 marked COMPLETE in `context.md`

---

## Do NOT Do

- Do not implement any ML logic in this phase
- Do not install packages in this phase — only create the requirements file
- Do not commit model artifacts or CSV files

---

## Next Phase

After completing Phase 8, proceed to **Phase 9 — Testing & QA** (`phase9_testing.md`), or circle back to implement phases 1–7 first.
