# DeepGuard AI — Context & Progress Tracker

> **AGENT INSTRUCTION:** This file is your primary context checkpoint. Read it at the START of every session before touching any code. Update it at the END of every session before stopping. This file prevents redundant work and lost progress.

---

## Project Status: IN PROGRESS — Milestone M4 / M5 (Phases 0–8 Complete)

**Last Updated:** 2026-10-14
**Current Milestone:** M4/M5 (Phases 0, 1, 2, 3, 4, 5, 6, 7, 8 Complete -> Next: Phase 9 QA / Phase 10 Deployment)
**Current Phase:** Phase 8 (COMPLETE) -> Next: Phase 9 (Testing & QA)
**Blocker:** None

---

## Phase Completion Status

| Phase | Name | Status | Completed On | Agent Notes |
|---|---|---|---|---|
| Phase 0 | Inspect & Plan | COMPLETE | 2026-10-14 | Verified Python 3.12.10, Windows 11, 421GB free disk on D:. |
| Phase 1 | Dataset Selection | COMPLETE | 2026-10-14 | NSL-KDD selected. Direct URLs verified (HTTP 200). Binary mapping defined. |
| Phase 2 | Data Preprocessing | COMPLETE | 2026-10-14 | src/preprocessing.py implemented, 41 features, StandardScaler + category encoding, artifacts exported, 9/9 pytest passed. |
| Phase 3 | Model Training | COMPLETE | 2026-10-14 | DeepGuardMLP trained for 47 epochs (early stopping patience 10, best epoch 37, val loss 0.01526, val acc 99.50%), deepguard_model.pth, training_history.json, model_metadata.json saved. 18/18 pytest passed. |
| Phase 4 | Evaluation | COMPLETE | 2026-10-14 | Logistic Regression baseline trained & saved. Both models evaluated on 18,896 held-out test samples. MLP: 99.52% acc, 99.52% F1, 0.9998 ROC-AUC vs Baseline: 95.30% acc, 95.27% F1, 0.9920 ROC-AUC. evaluation_metrics.json & confusion_matrix.png generated. 26/26 pytest passed. |
| Phase 5 | Artifact Export | COMPLETE | 2026-10-14 | All 8 required artifacts + baseline verified in model/. src/export.py created with isolated fresh-load inference test. deepguard_artifacts.zip (100.9KB) packaged. tests/test_artifacts.py added (10/10 passed, 36/36 overall). |
| Phase 7 | Next.js Dashboard | COMPLETE | 2026-10-14 | Built Next.js web application with 5 tabs, custom CSS dark/light theme, 3-color palette, Inter/JetBrains Mono fonts, src/validation.py, src/inference.py, app.py, and 12/12 new unit tests (55/55 overall). |
| Phase 8 | Project Structure | COMPLETE | 2026-10-14 | Full directory skeleton verified (src, notebooks, model, reports, tests, docs), requirements.txt, .gitignore, stubs, and tests/test_structure.py created (8/8 passed). |
| Phase 9 | Testing & QA | IN PROGRESS | — | tests/test_preprocessing.py, test_model.py, test_evaluation.py, test_artifacts.py, test_notebook.py, test_inference.py, test_validation.py, test_structure.py verified (63 passed). |
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
| Architecture | PyTorch MLP (`DeepGuardMLP`) |
| Input Features | 41 |
| Hidden Layers | [128, 64, 32] |
| Activation | ReLU with BatchNorm1d and Dropout (0.3) |
| Output Layer | Linear(32, 1) [single logit] |
| Loss Function | BCEWithLogitsLoss |
| Optimizer | Adam (lr=0.001) |
| Batch Size | 256 |
| Epochs Trained | 47 (Best Epoch: 37) |
| Best Validation Metric | Val Loss: 0.01526 \| Val Acc: 99.50% |
| Early Stopping | Triggered at Epoch 47 (patience=10) |

---

## Evaluation Results

> Values computed directly from actual execution on 18,896 held-out test samples.

### Neural Network (DeepGuard MLP)
| Metric | Value |
|---|---|
| Accuracy | 99.52% (0.99524) |
| Precision (Macro) | 99.54% (0.99537) \| Benign: 99.36%, Attack: 99.71% |
| Recall (Macro) | 99.51% (0.99507) \| Benign: 99.75%, Attack: 99.26% |
| F1-Score (Macro) | 99.52% (0.99521) \| Benign: 99.56%, Attack: 99.49% |
| ROC-AUC | 0.99983 |
| Confusion Matrix | TN: 10,076 \| FP: 25 \| FN: 65 \| TP: 8,730 (Total: 18,896) |

### Baseline Classifier (Logistic Regression)
| Metric | Value |
|---|---|
| Model Type | LogisticRegression (lbfgs, max_iter=1000, random_state=42) |
| Accuracy | 95.30% (0.95295) |
| Precision (Macro) | 95.35% (0.95353) \| Benign: 94.71%, Attack: 96.00% |
| Recall (Macro) | 95.20% (0.95199) \| Benign: 96.59%, Attack: 93.80% |
| F1-Score (Macro) | 95.27% (0.95265) \| Benign: 95.64%, Attack: 94.89% |
| ROC-AUC | 0.99203 |
| Confusion Matrix | TN: 9,757 \| FP: 344 \| FN: 545 \| TP: 8,250 (Total: 18,896) |

---

## Artifacts

> Update this table every time an artifact is created or verified.

| Artifact | Path | Status | Created On |
|---|---|---|---|
| deepguard_model.pth | model/deepguard_model.pth | CREATED & VERIFIED | 2026-10-14 |
| preprocessor.joblib | model/preprocessor.joblib | CREATED & VERIFIED | 2026-10-14 |
| feature_schema.json | model/feature_schema.json | CREATED & VERIFIED | 2026-10-14 |
| label_mapping.json | model/label_mapping.json | CREATED & VERIFIED | 2026-10-14 |
| model_metadata.json | model/model_metadata.json | CREATED & VERIFIED | 2026-10-14 |
| baseline_model.joblib | model/baseline_model.joblib | CREATED & VERIFIED | 2026-10-14 |
| evaluation_metrics.json | model/evaluation_metrics.json | CREATED & VERIFIED | 2026-10-14 |
| training_history.json | model/training_history.json | CREATED & VERIFIED | 2026-10-14 |
| confusion_matrix.png | model/confusion_matrix.png | CREATED & VERIFIED | 2026-10-14 |
| training_curve.png | model/training_curve.png | CREATED & VERIFIED | 2026-10-14 |
| DeepGuard_AI_Training.ipynb | notebooks/ | CREATED & VERIFIED | 2026-10-14 |
| deepguard_artifacts.zip | / | CREATED & VERIFIED (143.5 KB) | 2026-10-14 |
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
| 2026-10-14 | src/model.py | Implemented | Phase 3 |
| 2026-10-14 | src/train.py | Created | Phase 3 |
| 2026-10-14 | tests/test_model.py | Created | Phase 3 & 9 |
| 2026-10-14 | model/deepguard_model.pth | Created & Verified | Phase 3 |
| 2026-10-14 | model/training_history.json | Created & Verified | Phase 3 |
| 2026-10-14 | model/model_metadata.json | Created & Verified | Phase 3 |
| 2026-10-14 | notebooks/DeepGuard_AI_Training.ipynb | Modified (Phase 3 cells added) | Phase 3 & 6 |
| 2026-10-14 | docs/context.md | Modified | Phase 3 Complete |
| 2026-10-14 | src/evaluate.py | Created | Phase 4 |
| 2026-10-14 | model/baseline_model.joblib | Created & Verified | Phase 4 |
| 2026-10-14 | model/evaluation_metrics.json | Created & Verified | Phase 4 |
| 2026-10-14 | model/confusion_matrix.png | Created & Verified | Phase 4 |
| 2026-10-14 | tests/test_evaluation.py | Created (8 unit tests) | Phase 4 & 9 |
| 2026-10-14 | notebooks/DeepGuard_AI_Training.ipynb | Modified (Phase 4 cells added) | Phase 4 & 6 |
| 2026-10-14 | docs/context.md | Modified | Phase 4 Complete |
| 2026-10-14 | src/export.py | Created | Phase 5 |
| 2026-10-14 | deepguard_artifacts.zip | Created (100.9 KB) | Phase 5 |
| 2026-10-14 | tests/test_artifacts.py | Created (10 unit tests) | Phase 5 & 9 |
| 2026-10-14 | notebooks/DeepGuard_AI_Training.ipynb | Modified (Phase 5 cells added) | Phase 5 & 6 |
| 2026-10-14 | docs/vivek.md | Modified (Phase 5 details added) | Phase 5 |
| 2026-10-14 | docs/context.md | Modified | Phase 5 Complete |
| 2026-10-14 | model/training_curve.png | Created & Verified | Phase 6 |
| 2026-10-14 | notebooks/DeepGuard_AI_Training.ipynb | Completed (49 cells covering all 16 required Phase 6 sections) | Phase 6 |
| 2026-10-14 | tests/test_notebook.py | Created (7 unit tests) | Phase 6 & 9 |
| 2026-10-14 | src/export.py | Modified (added training_curve.png to optional artifacts) | Phase 5 & 6 |
| 2026-10-14 | deepguard_artifacts.zip | Updated & Verified (143.52 KB, 10 files packaged) | Phase 5 & 6 |
| 2026-10-14 | docs/vivek.md | Modified (Phase 6 Colab execution guide) | Phase 6 |
| 2026-10-14 | src/validation.py | Created | Phase 7 |
| 2026-10-14 | src/inference.py | Created | Phase 7 |
| 2026-10-14 | tests/test_inference.py | Created (6 unit tests) | Phase 7 & 9 |
| 2026-10-14 | tests/test_validation.py | Created (6 unit tests) | Phase 7 & 9 |
| 2026-10-14 | dashboard/package.json | Created | Phase 7 |
| 2026-10-14 | dashboard/next.config.js | Created | Phase 7 |
| 2026-10-14 | dashboard/app/layout.js | Created | Phase 7 |
| 2026-10-14 | dashboard/app/globals.css | Created | Phase 7 |
| 2026-10-14 | dashboard/app/page.js | Created | Phase 7 |
| 2026-10-14 | dashboard/app/api/metrics/route.js | Created | Phase 7 |
| 2026-10-14 | dashboard/app/api/predict/route.js | Created | Phase 7 |
| 2026-10-14 | dashboard/app/api/sample-data/route.js | Created | Phase 7 |
| 2026-10-14 | app.py | Modified (Streamlit & CLI entrypoint) | Phase 7 |
| 2026-10-14 | requirements.txt | Modified (fixed Next.js string to streamlit>=1.28.0) | Phase 7 |
| 2026-10-14 | .gitignore | Modified (added .Next.js/secrets.toml) | Phase 8 |
| 2026-10-14 | docs/phase8_structure.md | Modified (all checklist items marked complete) | Phase 8 |
| 2026-10-14 | tests/test_structure.py | Created (8 unit tests for directory layout & stubs) | Phase 8 & 9 |
| 2026-10-14 | docs/context.md | Modified | Phase 8 Complete |

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
| 2026-10-14 | pip install torch --index-url https://download.pytorch.org/whl/cpu | Successfully installed torch 2.14.1+cpu in .venv | Phase 3 |
| 2026-10-14 | python -m src.train | Model trained (47 epochs, best val loss 0.01526 at epoch 37) | Phase 3 |
| 2026-10-14 | pytest -v | 18 passed in 10.64s | Phase 3 / 9 |
| 2026-10-14 | pip install matplotlib | Successfully installed matplotlib 3.11.2 | Phase 4 |
| 2026-10-14 | python -m src.evaluate | Real evaluation completed (MLP: 99.52% acc vs Base: 95.30% acc) | Phase 4 |
| 2026-10-14 | pytest tests/test_evaluation.py -v | 8 passed in 8.50s | Phase 4 / 9 |
| 2026-10-14 | pytest -v | 26 passed in 13.97s across full test suite | Phase 4 / 9 |
| 2026-10-14 | .venv\Scripts\python.exe -m src.export | All 8 required artifacts verified, fresh load tested, deepguard_artifacts.zip created | Phase 5 |
| 2026-10-14 | pytest tests/test_artifacts.py -v | 10 passed in 6.61s | Phase 5 / 9 |
| 2026-10-14 | pytest -v | 36 passed in 16.94s across full test suite | Phase 5 / 9 |
| 2026-10-14 | .venv\Scripts\python.exe -c "...plt.savefig('model/training_curve.png')..." | model/training_curve.png generated | Phase 6 |
| 2026-10-14 | .venv\Scripts\python.exe build_notebook.py | Generated notebooks/DeepGuard_AI_Training.ipynb (49 cells) | Phase 6 |
| 2026-10-14 | .venv\Scripts\pytest.exe tests/test_notebook.py -v | 7 passed in 0.09s | Phase 6 & 9 |
| 2026-10-14 | .venv\Scripts\pytest.exe -v | 43 passed in 12.27s across full test suite | Phase 6 & 9 |
| 2026-10-14 | .venv\Scripts\python.exe -m src.export | deepguard_artifacts.zip re-packaged with 10 files (143.52 KB) | Phase 5 & 6 |
| 2026-10-14 | pytest tests/test_inference.py tests/test_validation.py -v | 12 passed in 18.89s | Phase 7 & 9 |
| 2026-10-14 | npm.cmd run build (in dashboard/) | Next.js production build compiled cleanly (7 static pages) | Phase 7 |
| 2026-10-14 | .venv\Scripts\pytest.exe -v | All 55 tests passed in 38.76s across full project suite | Phase 7 & 9 |
| 2026-10-14 | .venv\Scripts\pytest.exe tests/test_structure.py -v | 8 passed in 0.15s (100% Phase 8 structure verified) | Phase 8 & 9 |

---

## Environment Info

| Item | Value |
|---|---|
| Python Version | Python 3.12.10 |
| PyTorch Version | 2.14.1+cpu |
| Next.js Version | Next.js 14.2.15 (Node v24.6.0) |
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
| 2026-10-14 | Completed Phase 3 (Model Training). Implemented DeepGuardMLP in src/model.py, src/train.py, trained PyTorch model for 47 epochs (val loss 0.01526, val acc 99.50%), exported deepguard_model.pth, training_history.json, model_metadata.json, updated notebook, and verified with 18/18 passing pytest tests. |
| 2026-10-14 | Completed Phase 4 (Baseline & Evaluation). Trained LogisticRegression baseline, evaluated MLP and baseline on 18,896 held-out test records, exported evaluation_metrics.json, baseline_model.joblib, and confusion_matrix.png. Added tests/test_evaluation.py (26/26 total tests passing). Updated notebook with Phase 4 evaluation pipeline & honest assessment. |
| 2026-10-14 | Completed Phase 5 (Artifact Export). Created src/export.py, verified all 8 required model artifacts + baseline, validated schemas, performed isolated fresh-load inference test, packaged deepguard_artifacts.zip (100.9KB), updated DeepGuard_AI_Training.ipynb with Sections 20-23, created tests/test_artifacts.py (10/10 passed), and verified full test suite (36/36 passed). |
| 2026-10-14 | Completed Phase 6 (Google Colab Training Notebook). Fully finalized notebooks/DeepGuard_AI_Training.ipynb with 49 self-contained cells covering all 16 pipeline requirements. Implemented nvidia-smi GPU/CPU detection, automated NSL-KDD download with Colab manual fallback, training curve plotting (model/training_curve.png), side-by-side confusion matrix, fresh load testing, and google.colab automatic browser download. Created tests/test_notebook.py (7/7 passed, 43/43 overall). Re-packaged deepguard_artifacts.zip (143.52 KB). Updated docs/vivek.md with Task Group 2 instructions. Ready for Phase 7 (Next.js Dashboard). |
| 2026-10-14 | Completed Phase 7 (Next.js Dashboard). Implemented Next.js web application with 5 complete tabs, bespoke dark & light themes, 3-color palette (Obsidian/Slate, Precision Cobalt, Semantic Emerald/Crimson), Inter & JetBrains Mono typography, zero AI clichés. Built src/validation.py, src/inference.py, app.py, API routes (/api/metrics, /api/predict, /api/sample-data), tests/test_inference.py and tests/test_validation.py (55/55 pytest unit tests passing). Browser verified all tabs, theme toggling, and batch prediction. |
| 2026-10-14 | Phase 8 (Project Structure) audited, formalized, and verified. Validated complete directory layout (src/, notebooks/, model/, reports/, tests/, docs/), confirmed module exports and stub files, verified .gitignore and requirements.txt, marked phase8_structure.md checklist complete, and added tests/test_structure.py with 8 automated unit tests (8/8 passed). |


