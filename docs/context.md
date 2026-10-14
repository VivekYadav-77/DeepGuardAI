# DeepGuard AI — Context & Progress Tracker

> **AGENT INSTRUCTION:** This file is your primary context checkpoint. Read it at the START of every session before touching any code. Update it at the END of every session before stopping. This file prevents redundant work and lost progress.

---

## Project Status: IN PROGRESS — Milestone M2 (Phase 2 Complete)

**Last Updated:** 2026-10-14
**Current Milestone:** M2 (Phase 0, 1, 2, 8 Complete -> Next: Phase 3 Model Training)
**Current Phase:** Phase 2 (COMPLETE) -> Next: Phase 3 (Model Training)
**Blocker:** None

---

## Phase Completion Status

| Phase | Name | Status | Completed On | Agent Notes |
|---|---|---|---|---|
| Phase 0 | Inspect & Plan | COMPLETE | 2026-10-14 | Verified Python 3.12.10, Windows 11, 421GB free disk on D:. |
| Phase 1 | Dataset Selection | COMPLETE | 2026-10-14 | NSL-KDD selected. Direct URLs verified (HTTP 200). Binary mapping defined. |
| Phase 2 | Data Preprocessing | COMPLETE | 2026-10-14 | src/preprocessing.py implemented, 41 features, StandardScaler + category encoding, artifacts exported, 9/9 pytest passed. |
| Phase 3 | Model Training | NOT STARTED | — | — |
| Phase 4 | Evaluation | NOT STARTED | — | — |
| Phase 5 | Artifact Export | NOT STARTED | — | — |
| Phase 6 | Colab Notebook | IN PROGRESS | — | DeepGuard_AI_Training.ipynb initialized with Phases 0-2 cells. |
| Phase 7 | Next.js Dashboard | NOT STARTED | — | — |
| Phase 8 | Project Structure | COMPLETE | 2026-10-14 | Skeleton created (src, notebooks, model, reports, tests), requirements.txt, stubs, and pytest.ini configured. |
| Phase 9 | Testing & QA | IN PROGRESS | — | tests/test_preprocessing.py verified (9 passed). |
| Phase 10 | Deployment | NOT STARTED | — | — |
| Phase 11 | Academic Report | NOT STARTED | — | — |
| Phase 12 | README | NOT STARTED | — | — |

---

## Dataset Info

| Field | Value |
|---|---|
| Dataset Name | NSL-KDD (Canadian Institute for Cybersecurity) |
| Source URL | https://www.unb.ca/cic/datasets/nsl.html (Direct raw mirror: https://raw.githubusercontent.com/jmnwong/NSL-KDD-Dataset/master/KDDTrain+.txt) |
| Access Date | 2026-10-14 |
| Total Records | 148,517 (KDDTrain+: 125,973 records; KDDTest+: 22,544 records) |
| Selected Subset | Full KDDTrain+ (125,973) and KDDTest+ (22,544) |
| Target Column | `label` (column 42 in raw text) |
| Positive Class (attack) | 1 (`neptune`, `smurf`, `ipsweep`, `portsweep`, `satan`, `teardrop`, `guess_passwd`, etc.) |
| Negative Class (benign) | 0 (`normal`) |
| Class Distribution | Train: 67,343 Normal (53.46%), 58,630 Attack (46.54%) — Balanced |
| License | Free for academic and research use with UNB CIC citation |
| Limitations | Inherited synthetic background traffic from DARPA/KDD99; outdated protocols relative to TLS 1.3/modern traffic; standard academic benchmark |

---

## Model Info

> Fill this in after Phase 3 is complete.

| Field | Value |
|---|---|
| Architecture | PyTorch MLP |
| Input Features | TBD |
| Hidden Layers | TBD |
| Activation | TBD |
| Output Layer | TBD |
| Loss Function | TBD |
| Optimizer | TBD |
| Batch Size | TBD |
| Epochs Trained | TBD |
| Best Validation Metric | TBD |
| Early Stopping | TBD |

---

## Evaluation Results

> Fill this in after Phase 4 is complete. Do NOT invent these values.

### Neural Network (DeepGuard MLP)
| Metric | Value |
|---|---|
| Accuracy | TBD |
| Precision | TBD |
| Recall | TBD |
| F1-Score | TBD |
| ROC-AUC | TBD |

### Baseline Classifier
| Metric | Value |
|---|---|
| Model Type | TBD |
| Accuracy | TBD |
| Precision | TBD |
| Recall | TBD |
| F1-Score | TBD |

---

## Artifacts

> Update this table every time an artifact is created or verified.

| Artifact | Path | Status | Created On |
|---|---|---|---|
| deepguard_model.pth | model/deepguard_model.pth | NOT CREATED | — |
| preprocessor.joblib | model/preprocessor.joblib | CREATED & VERIFIED | 2026-10-14 |
| feature_schema.json | model/feature_schema.json | CREATED & VERIFIED | 2026-10-14 |
| label_mapping.json | model/label_mapping.json | CREATED & VERIFIED | 2026-10-14 |
| model_metadata.json | model/model_metadata.json | NOT CREATED | — |
| evaluation_metrics.json | model/evaluation_metrics.json | NOT CREATED | — |
| training_history.json | model/training_history.json | NOT CREATED | — |
| confusion_matrix.png | model/confusion_matrix.png | NOT CREATED | — |
| DeepGuard_AI_Training.ipynb | notebooks/ | CREATED (Phases 0-2) | 2026-10-14 |
| app.py | / | CREATED (stub) | 2026-10-14 |
| requirements.txt | / | CREATED | 2026-10-14 |
| README.md | / | NOT CREATED | — |
| project_report.md | reports/ | CREATED (stub) | 2026-10-14 |
| presentation_outline.md | reports/ | CREATED (stub) | 2026-10-14 |
| viva_questions.md | reports/ | CREATED (stub) | 2026-10-14 |

---

## Files Created / Modified

> Append to this list every time the agent creates or modifies a file.

| Date | File | Action | Phase |
|---|---|---|---|
| 2026-10-14 | docs/masterplan.md | Created | Setup |
| 2026-10-14 | docs/context.md | Created | Setup |
| 2026-10-14 | docs/phase1_dataset.md | Created | Setup |
| 2026-10-14 | docs/phase2_preprocessing.md | Created | Setup |
| 2026-10-14 | docs/phase3_training.md | Created | Setup |
| 2026-10-14 | docs/phase4_evaluation.md | Created | Setup |
| 2026-10-14 | docs/phase5_artifacts.md | Created | Setup |
| 2026-10-14 | docs/phase6_notebook.md | Created | Setup |
| 2026-10-14 | docs/phase7_dashboard.md | Created | Setup |
| 2026-10-14 | docs/phase8_structure.md | Created | Setup |
| 2026-10-14 | docs/phase9_testing.md | Created | Setup |
| 2026-10-14 | docs/phase10_deployment.md | Created | Setup |
| 2026-10-14 | docs/phase11_report.md | Created | Setup |
| 2026-10-14 | docs/phase12_readme.md | Created | Setup |
| 2026-10-14 | docs/vivek.md | Created | Setup |
| 2026-10-14 | docs/context.md | Modified | Phase 0 & 1 (Env & Dataset Info) |
| 2026-10-14 | docs/vivek.md | Modified | Phase 1 (Task Group 1 instructions) |
| 2026-10-14 | .gitignore | Created | Phase 8 / Setup |
| 2026-10-14 | src/__init__.py | Created | Phase 8 |
| 2026-10-14 | requirements.txt | Created | Phase 8 |
| 2026-10-14 | src/model.py | Created (stub) | Phase 8 |
| 2026-10-14 | src/inference.py | Created (stub) | Phase 8 |
| 2026-10-14 | src/validation.py | Created (stub) | Phase 8 |
| 2026-10-14 | app.py | Created (stub) | Phase 8 |
| 2026-10-14 | reports/project_report.md | Created (stub) | Phase 8 |
| 2026-10-14 | reports/presentation_outline.md | Created (stub) | Phase 8 |
| 2026-10-14 | reports/viva_questions.md | Created (stub) | Phase 8 |
| 2026-10-14 | src/preprocessing.py | Created | Phase 2 |
| 2026-10-14 | notebooks/DeepGuard_AI_Training.ipynb | Created | Phase 2 & 6 |
| 2026-10-14 | model/preprocessor.joblib | Created | Phase 2 |
| 2026-10-14 | model/feature_schema.json | Created | Phase 2 |
| 2026-10-14 | model/label_mapping.json | Created | Phase 2 |
| 2026-10-14 | pytest.ini | Created | Phase 9 |
| 2026-10-14 | tests/test_preprocessing.py | Created | Phase 2 & 9 |
| 2026-10-14 | docs/context.md | Modified | Phase 2 Complete |

---

## Active Blockers

> List blockers here. Remove them once resolved.

| Blocker | Phase | Resolution Needed From | Added On |
|---|---|---|---|
| None currently | — | — | — |

---

## Commands Run

> Log every terminal command executed and its result.

| Date | Command | Result | Phase |
|---|---|---|---|
| 2026-10-14 | python --version | Python 3.12.10 | Phase 0 |
| 2026-10-14 | Get-PSDrive -PSProvider FileSystem | Drive D: 421 GB Free, C: 79 GB Free | Phase 0 |
| 2026-10-14 | curl.exe -I https://raw.githubusercontent.com/jmnwong/NSL-KDD-Dataset/master/KDDTrain+.txt | HTTP 200 OK (19,109,424 bytes) | Phase 1 |
| 2026-10-14 | curl.exe -I https://raw.githubusercontent.com/jmnwong/NSL-KDD-Dataset/master/KDDTest+.txt | HTTP 200 OK (3,441,513 bytes) | Phase 1 |
| 2026-10-14 | pip install pandas numpy scikit-learn joblib pytest | Successfully installed in .venv | Phase 2 / 8 |
| 2026-10-14 | curl.exe -s -o data\KDDTrain+.txt & KDDTest+.txt | Datasets downloaded locally (19MB & 3.4MB) | Phase 2 |
| 2026-10-14 | pytest tests/test_preprocessing.py -v | 9 passed in 3.23s | Phase 2 / 9 |

---

## Environment Info

| Item | Value |
|---|---|
| Python Version | Python 3.12.10 |
| PyTorch Version | CPU-compatible PyTorch (to be configured in requirements.txt) |
| Next.js Version | Next.js (Dashboard frontend) |
| OS | Windows 11 (local) |
| Colab GPU Available | Free tier (CPU or T4 GPU) |
| Local Disk Free | 421.08 GB free on D:\ |

---

## Agent Session Log

> Every agent session should append a one-line summary here.

| Date | Summary |
|---|---|
| 2026-10-14 | Project documentation initialized. All phase files, context.md, masterplan.md, and vivek.md created. Ready to begin Phase 0. |
| 2026-10-14 | Completed Phase 0 (Environment inspection) & Phase 1 (NSL-KDD dataset selected, verified direct download URLs, updated context.md & vivek.md). |
| 2026-10-14 | Completed Phase 2 (Data Preprocessing) & Phase 8 (Project Skeleton). Built src/preprocessing.py, notebooks/DeepGuard_AI_Training.ipynb, fitted artifacts in model/, and verified with 9/9 passing pytest unit tests. |
