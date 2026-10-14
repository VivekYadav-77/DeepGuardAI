# DeepGuard AI — Master Plan

> **READ THIS FIRST.** This is the single source of truth for every AI agent working on this project. Before writing any code, read this file completely. Then read `context.md` to understand current progress. Then read the relevant phase file before executing work.

---

## 1. What Is DeepGuard AI?

**DeepGuard AI** is a B.Tech academic capstone project that demonstrates a complete, end-to-end deep learning pipeline for network intrusion detection and threat classification.

**Project Full Title:** Deep Learning-Based Network Intrusion Detection and Threat Classification System

**Core Goal:** Build a real, working ML system — not a demo or mock — that:
1. Trains a PyTorch MLP on labeled network traffic data
2. Evaluates it against a baseline classifier
3. Serves predictions through a professional Next.js dashboard
4. Is deployed on Hugging Face Spaces (free tier)
5. Is accompanied by a full academic report, presentation, and viva prep

**This is NOT:**
- A live packet-capture or real-time monitoring system
- A system that calls any paid external API
- A mock project with fake results or hardcoded metrics

---

## 2. Developer Context

| Item | Detail |
|---|---|
| Developer | Vivek (B.Tech student) |
| Machine | Low-spec local Windows PC |
| Training Environment | Google Colab (free tier, CPU or T4 GPU) |
| Dev Tool | Antigravity IDE |
| Constraint | Free tools only, no paid APIs, no Docker |

---

## 3. Technology Stack (Non-Negotiable)

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| Deep Learning | PyTorch (CPU-compatible) |
| Data | Pandas, NumPy |
| ML Utilities | Scikit-learn |
| Dashboard | Next.js + Plotly |
| Artifact Saving | Joblib, JSON, PyTorch `.pth` |
| Deployment | Hugging Face Spaces (Next.js SDK) |
| Notebook | Google Colab `.ipynb` |

**Do NOT add:** FastAPI, React, PostgreSQL, Redis, Docker, authentication, or any paid service.

---

## 4. Dataset

**Preferred:** NSL-KDD, UNSW-NB15, or a verified subset of CIC-IDS2017.

**Rules:**
- Must be publicly accessible, labeled, and free
- Binary classification target: Benign vs. Malicious
- No synthetic data
- No fabricated download results

The exact dataset chosen will be recorded in `context.md` once Phase 1 is complete.

---

## 5. Project Directory Structure

```
DeepGuard-AI/
├── app.py                          <- Next.js entry point
├── requirements.txt                <- Inference + dashboard dependencies
├── README.md                       <- Full project README
├── .gitignore
├── docs/
│   ├── masterplan.md               <- THIS FILE
│   ├── context.md                  <- Live progress tracker
│   ├── phase1_dataset.md
│   ├── phase2_preprocessing.md
│   ├── phase3_training.md
│   ├── phase4_evaluation.md
│   ├── phase5_artifacts.md
│   ├── phase6_notebook.md
│   ├── phase7_dashboard.md
│   ├── phase8_structure.md
│   ├── phase9_testing.md
│   ├── phase10_deployment.md
│   ├── phase11_report.md
│   ├── phase12_readme.md
│   └── vivek.md                    <- Manual tasks Vivek must do
├── src/
│   ├── __init__.py
│   ├── model.py
│   ├── preprocessing.py
│   ├── inference.py
│   └── validation.py
├── notebooks/
│   └── DeepGuard_AI_Training.ipynb
├── model/
│   ├── deepguard_model.pth
│   ├── preprocessor.joblib
│   ├── feature_schema.json
│   ├── label_mapping.json
│   ├── model_metadata.json
│   ├── evaluation_metrics.json
│   └── training_history.json
├── reports/
│   ├── project_report.md
│   ├── presentation_outline.md
│   └── viva_questions.md
└── tests/
    ├── test_preprocessing.py
    ├── test_inference.py
    └── test_validation.py
```

---

## 6. Phases Overview

| Phase | Name | Where It Runs | Status |
|---|---|---|---|
| Phase 0 | Inspect & Plan | Local / Antigravity | Pending |
| Phase 1 | Dataset Selection | Research / Manual | Pending |
| Phase 2 | Data Preprocessing | Google Colab | Pending |
| Phase 3 | Model Training | Google Colab | Pending |
| Phase 4 | Evaluation | Google Colab | Pending |
| Phase 5 | Artifact Export | Google Colab | Pending |
| Phase 6 | Colab Notebook | Antigravity (write) | Pending |
| Phase 7 | Next.js Dashboard | Antigravity | Pending |
| Phase 8 | Project Structure | Antigravity | Pending |
| Phase 9 | Testing & QA | Antigravity + Local | Pending |
| Phase 10 | Deployment | Manual + Antigravity | Pending |
| Phase 11 | Academic Report | Antigravity | Pending |
| Phase 12 | README | Antigravity | Pending |

---

## 7. Agent Operating Rules

Every AI agent working on this project MUST follow these rules:

### Before Starting Any Phase:
1. Read `context.md` to understand what is done, what is in progress, and what artifacts exist
2. Read the relevant `phaseN_*.md` file for the current phase
3. Never rewrite code already marked complete in `context.md`
4. Never fabricate metrics, test results, or dataset stats

### During Execution:
1. Only implement what the current phase requires
2. Record every file created/modified in `context.md`
3. Record every artifact generated (file path + purpose)
4. Flag all blockers immediately in `context.md`
5. Update the phase status in `context.md` when done

### Handoff Rules:
1. After completing a phase, update `context.md` status
2. Write any required manual tasks to `vivek.md`
3. Do NOT proceed to the next phase if a blocker exists that requires Vivek's input

### What Agents Cannot Do:
- Execute Google Colab notebook cells
- Upload files to Hugging Face manually
- Download datasets that require browser-based login
- Push to GitHub (unless git CLI is configured and authenticated)

---

## 8. Artifact Integrity Rules

- **Never hardcode** any metric (accuracy, F1, etc.) — all values must come from actual execution
- **Never fake** a confusion matrix or training curve
- Model `.pth` file must be loadable in a fresh Python environment
- `evaluation_metrics.json` must match what the notebook actually produced
- If an artifact is missing, the dashboard must show a clear error message — not crash silently

---

## 9. Milestones

| Milestone | Contents | Phase Files |
|---|---|---|
| M1 | Environment + project skeleton | Phase 0, Phase 8 |
| M2 | Colab notebook + training pipeline | Phase 1, 2, 3, 6 |
| M3 | Train models + export artifacts | Phase 3, 4, 5 |
| M4 | Next.js dashboard + inference | Phase 7 |
| M5 | Tests + defect fixes | Phase 9 |
| M6 | Academic report + viva + presentation | Phase 11 |
| M7 | Deployment | Phase 10, 12 |

---

## 10. Definition of Done

The project is COMPLETE only when every item below is honestly checked:

- [ ] Legitimate dataset source documented
- [ ] Preprocessing pipeline implemented
- [ ] Deep learning model actually trained (not faked)
- [ ] Baseline model evaluated
- [ ] Test metrics generated from real execution
- [ ] Model and preprocessing artifacts exported
- [ ] Fresh-runtime model loading verified
- [ ] Next.js dashboard implemented
- [ ] CSV inference implemented and validated
- [ ] Meaningful tests executed and passed
- [ ] README completed
- [ ] Academic report completed with actual results
- [ ] Presentation outline completed
- [ ] Viva answers completed
- [ ] Local application startup verified
- [ ] Deployment attempted
- [ ] Public deployment verified (if successful)
- [ ] Remaining limitations clearly documented

---

## 11. Key Constraints Summary

| Rule | Detail |
|---|---|
| No GPU required | Must run on CPU |
| No paid services | Everything free |
| No synthetic data | Real dataset only |
| No fake results | All metrics from real runs |
| No large architecture | Small MLP only |
| No live packet capture | Static CSV inference only |
| No Docker | Not required |
| No database | Not required |
| No secrets in git | Never commit API keys |
