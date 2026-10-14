---
title: DeepGuard AI
emoji: 🛡️
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
app_port: 3000
---

# DeepGuard AI 🛡️
**Deep Learning-Based Network Intrusion Detection and Threat Classification System**

[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2014-black?style=flat&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![PyTorch](https://img.shields.io/badge/Model-PyTorch%202.x-EE4C2C?style=flat&logo=pytorch)](https://pytorch.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python)](https://python.org)
[![Tests](https://img.shields.io/badge/Tests-72%2F72%20Passed%20(100%25)-success?style=flat&logo=pytest)](file:///tests/)
[![Dataset](https://img.shields.io/badge/Dataset-NSL--KDD-blueviolet?style=flat)](https://www.unb.ca/cic/datasets/nsl.html)
[![Accuracy](https://img.shields.io/badge/Test%20Accuracy-99.47%25-brightgreen?style=flat)]()
[![ROC--AUC](https://img.shields.io/badge/ROC--AUC-0.9999-brightgreen?style=flat)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](LICENSE)

> 🎓 **B.Tech Academic Capstone Project**  
> **Student Developer:** Vivek — `[FILL IN: Enrollment Number]`  
> **Department:** Department of Computer Science & Engineering  
> **Institution:** `[FILL IN: Institution Name]`  
> **Supervisor / Guide:** `[FILL IN: Guide/Supervisor Name]`  
> **Academic Year:** 2025–2026

---

## 📑 Table of Contents

1. [Overview](#1-overview)
2. [Key Features](#2-key-features)
3. [System Architecture](#3-system-architecture)
4. [Dataset & Preprocessing](#4-dataset--preprocessing)
5. [Tech Stack](#5-tech-stack)
6. [Project Structure](#6-project-structure)
7. [Local Setup & Quickstart](#7-local-setup--quickstart)
8. [Training in Google Colab](#8-training-in-google-colab)
9. [Running the Application](#9-running-the-application)
10. [Automated Testing Suite](#10-automated-testing-suite)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Evaluation Results & Baseline Comparison](#12-evaluation-results--baseline-comparison)
13. [Visualizations & Model Artifacts](#13-visualizations--model-artifacts)
14. [Academic Deliverables](#14-academic-deliverables)
15. [Known Limitations](#15-known-limitations)
16. [References & Citations](#16-references--citations)
17. [License & Disclaimer](#17-license--disclaimer)

---

## 1. Overview

**DeepGuard AI** is an end-to-end deep learning network intrusion detection and threat classification system designed to inspect tabular network flow telemetry and identify anomalous or malicious traffic patterns with high fidelity. Built upon a 41-feature representation of network connection vectors from the benchmark **NSL-KDD** dataset, the system implements a custom Multilayer Perceptron (`DeepGuardMLP`) with Batch Normalization, Dropout regularization, and a calibrated binary classification threshold.

The platform provides a dual-interface architecture: a cloud-native **FastAPI REST API** serving high-throughput tensor inference and an interactive, glassmorphic **Next.js 14 Dashboard** enabling security analysts to upload bulk telemetry CSVs, visualize risk profiles, inspect confusion matrices, and evaluate threat probabilities in real time.

> ⚠️ **Academic Disclaimer:** DeepGuard AI is an academic capstone prototype developed for educational, evaluation, and research purposes. It operates on static flow telemetry records and is **not** a raw packet sniffer or certified for deployment in live, mission-critical enterprise SOC/SIEM production environments.

---

## 2. Key Features

- **High-Accuracy Neural Inference:** Achieves **99.47% test accuracy** and **0.9999 ROC-AUC** across 18,896 held-out test samples, outperforming standard linear baselines (95.30%).
- **Interactive Batch Traffic Analyzer:** Drag-and-drop CSV upload supporting up to 50,000 flow records per batch, with instant one-click Benign and Attack sample telemetry presets.
- **Dynamic Threat Profiling & Confidence Scoring:** Predicts traffic classification (Benign vs. Malicious) with granular confidence probabilities, risk tags (Safe, Suspicious, Critical), and telemetry anomaly flags.
- **Comprehensive Model Performance Tab:** Interactive confusion matrix breakdown, precision-recall metrics, ROC-AUC curve representation, and side-by-side baseline comparison against Logistic Regression.
- **Threat Analytics & Traffic Distribution:** Real-time visual charts decomposing service-level protocols (HTTP, SMTP, FTP, Private, etc.), connection flags, and risk distributions.
- **Architecture & Hyperparameter Inspector:** Transparent view of network topology (41 → 128 → 64 → 32 → 1), activation functions, optimizer configuration, and training loss curves.
- **FastAPI REST Microservice:** Decoupled REST API providing `/health`, `/metrics`, and `/predict` endpoints with OpenAPI documentation (`/docs`) and Pydantic schema validation.
- **Robust Out-of-Vocabulary (OOV) Preprocessing:** Automated data pipeline handling unseen categorical values, missing feature pruning, and feature standardization without data leakage.
- **Glassmorphic Obsidian Design System:** Modern dark and light themes crafted with CSS custom properties, responsive typography (Inter & JetBrains Mono), and zero external UI template bloat.

---

## 3. System Architecture

### 3.1 End-to-End Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEEPGUARD AI PIPELINE                           │
└────────────────────────────────────────────────────────────────────────┘

  [ Network Telemetry / CSV Flow Data ]
                  │
                  ▼
  ┌─────────────────────────────────┐
  │     Input Schema Validator      │ ──> Verifies 41 columns, data types,
  │       (src/validation.py)       │     drops extra labels, enforces row limit
  └─────────────────────────────────┘
                  │
                  ▼
  ┌─────────────────────────────────┐
  │     Preprocessing Engine        │ ──> Fits/Applies StandardScaler
  │     (src/preprocessing.py)      │ ──> Encodes Categoricals (protocol, service, flag)
  │                                 │ ──> OOV Category Fallback Protection
  └─────────────────────────────────┘
                  │ (Fitted 41-Dimensional Tensor)
                  ▼
  ┌─────────────────────────────────┐
  │    DeepGuardMLP Classifier      │ ──> Hidden Layer 1: Linear(41, 128) + BN + ReLU + Dropout(0.3)
  │         (src/model.py)          │ ──> Hidden Layer 2: Linear(128, 64) + BN + ReLU + Dropout(0.3)
  │                                 │ ──> Hidden Layer 3: Linear(64, 32) + BN + ReLU + Dropout(0.3)
  │                                 │ ──> Output Layer:   Linear(32, 1) [Logit]
  └─────────────────────────────────┘
                  │
                  ▼
  ┌─────────────────────────────────┐
  │     Sigmoid & Decision Logic    │ ──> Threat Probability P(Attack) ∈ [0, 1]
  │       (src/inference.py)        │ ──> Decision Threshold: τ = 0.50
  └─────────────────────────────────┘     Label: 0 (Benign) vs. 1 (Malicious)
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────────┐ ┌───────────────────┐
│ Next.js 14 Web   │ │ FastAPI REST API  │
│ Dashboard UI     │ │ (src/api.py)      │
│ (Port 3000)      │ │ (Port 8000)       │
└──────────────────┘ └───────────────────┘
```

### 3.2 Decoupled Cloud Deployment Topology

```
[ User Browser ]
       │
       ▼ (HTTPS)
[ Vercel Edge Network ] ──> Next.js 14 Dashboard (`frontend/` or `dashboard/`)
       │                    • Static Site Generation (SSG) + Server Components
       │                    • Responsive Glassmorphic UI
       ▼ (REST API / JSON)
[ Render Cloud Service ] ──> FastAPI Backend (`backend/` or `src/api.py`)
                            • CPU-Optimized PyTorch 2.x Wheel
                            • Lightweight Memory Footprint (~190 MB RAM)
                            • Self-contained Artifacts (74.6 KB model weights)
```

---

## 4. Dataset & Preprocessing

The system is trained and benchmarked on the curated **NSL-KDD** dataset from the **Canadian Institute for Cybersecurity (CIC)** at the University of New Brunswick (UNB).

| Attribute | Specification |
|---|---|
| **Dataset Source** | [UNB CIC NSL-KDD Official Portal](https://www.unb.ca/cic/datasets/nsl.html) |
| **Direct Mirror** | [KDDTrain+.txt Raw Mirror](https://raw.githubusercontent.com/jmnwong/NSL-KDD-Dataset/master/KDDTrain+.txt) \| [KDDTest+.txt](https://raw.githubusercontent.com/jmnwong/NSL-KDD-Dataset/master/KDDTest+.txt) |
| **Total Records** | **148,517** records (Train: 125,973; Test: 22,544) |
| **Evaluated Held-Out Subset** | **18,896** isolated test records |
| **Total Features** | **41** flow features (38 numerical continuous/discrete, 3 categorical) |
| **Categorical Columns** | `protocol_type` (tcp, udp, icmp), `service` (70 network services), `flag` (11 status codes) |
| **Target Column** | `label` mapped to binary: `0 = Benign (normal)`, `1 = Attack (malicious)` |
| **Training Class Split** | Benign: 67,343 (53.46%) \| Attack: 58,630 (46.54%) — **Balanced** |
| **License** | Free for academic, scientific, and educational research with attribution |

### Preprocessing Methodology
1. **Target Binarization:** Connection records labeled `normal` are encoded as `0` (Benign). All attack types (`neptune`, `smurf`, `ipsweep`, `portsweep`, `satan`, `teardrop`, `guess_passwd`, etc.) are mapped to `1` (Attack).
2. **Categorical Handling:** String identifiers are mapped to integer index encodings based on training vocabulary. Unseen categories at test/inference time are gracefully defaulted to an out-of-vocabulary fallback index (`0`) to prevent runtime failures.
3. **Feature Scaling:** Continuous and count attributes are standardized via `StandardScaler` (`(X - μ) / σ`) fitted strictly on training data to prevent data leakage.
4. **Safety & Zero Leakage:** Preprocessing transformations are serialized into `model/preprocessor.joblib` and re-applied deterministically during batch and single-record inference.

---

## 5. Tech Stack

| Category | Technology | Version | Purpose |
|---|---|---|---|
| **Language** | Python | 3.12.10 | Core machine learning, data engineering, and backend service |
| **Deep Learning** | PyTorch | 2.14.1+cpu | Neural network definition, forward pass, autograd, and serialization |
| **Data Processing** | Pandas & NumPy | 2.x / 1.x | Tabular parsing, matrix operations, and array transformations |
| **Machine Learning** | Scikit-learn | 1.6+ | `StandardScaler`, metrics computation, and Logistic Regression baseline |
| **Backend REST API** | FastAPI & Uvicorn | 0.115+ / 0.34+ | High-performance asynchronous REST endpoints and ASGI web server |
| **Frontend Framework** | Next.js | 14.2.15 | React App Router, Server Components, and responsive dashboard |
| **Frontend Runtime** | React & Node.js | 18.x / 20+ | UI component lifecycle, state management, and modern DOM rendering |
| **Icons & Styling** | Lucide React & Vanilla CSS | Latest | Modern iconography, glassmorphism tokens, and responsive layouts |
| **Testing & QA** | Pytest | 9.x | Comprehensive unit and integration test discovery and execution |
| **Model Serialization** | Joblib & JSON | Standard | Preprocessor and schema persistence with schema verification |

---

## 6. Project Structure

```
DeepGuard-AI/
├── app.py                          # Unified CLI launcher & Streamlit compatibility entrypoint
├── requirements.txt                # Full dependencies (training, evaluation, and dashboard)
├── requirements-render.txt         # Minimal CPU-only dependencies for Render deployment
├── render.yaml                     # Infrastructure-as-code blueprint for Render Web Service
├── README.md                       # Master project documentation and reproducibility guide
├── .gitignore                      # Git exclusion rules for virtualenvs, caches, and raw data
├── pytest.ini                      # Pytest test discovery configuration
├── deepguard_artifacts.zip         # Portable standalone deployment bundle (143.5 KB)
│
├── backend/                        # Standalone Render deployment package
│   ├── main.py                     # Independent FastAPI application entrypoint
│   ├── requirements.txt            # Render backend dependencies (CPU PyTorch wheel)
│   ├── render.yaml                 # Backend blueprint
│   ├── .env.example                # Backend environment template
│   └── model/                      # Packaged model weights, preprocessor, and metadata
│
├── dashboard/                      # Next.js 14 Web Application
│   ├── package.json                # Frontend dependencies
│   ├── next.config.js              # Next.js build and routing configuration
│   └── app/                        # Next.js App Router
│       ├── layout.js               # Root layout with metadata and fonts
│       ├── page.js                 # Unified 5-tab dashboard view
│       ├── globals.css             # Obsidian & slate glassmorphism design system
│       └── api/                    # Server-side API proxies
│           ├── metrics/route.js    # Metric retrieval proxy with local fallback
│           ├── predict/route.js    # Batch inference proxy to remote backend
│           └── sample-data/route.js# Built-in benign and attack telemetry presets
│
├── frontend/                       # Standalone Vercel deployment package
│   ├── package.json                # Vercel deployment dependencies
│   ├── .env.example                # Environment variable template
│   └── app/                        # Self-contained frontend app router files
│
├── src/                            # Modular Python Core Library
│   ├── __init__.py                 # Python package declaration
│   ├── model.py                    # PyTorch DeepGuardMLP architecture definition
│   ├── preprocessing.py            # NSL-KDD data transformation, scaling, and encoding
│   ├── train.py                    # PyTorch training loop with early stopping
│   ├── evaluate.py                 # Evaluation pipeline, baseline model, and metric export
│   ├── export.py                   # Artifact packaging, validation, and zip bundling
│   ├── inference.py                # Single-sample and batch PyTorch inference engine
│   ├── validation.py               # Input CSV validation, schema pruning, and safety checks
│   └── api.py                      # FastAPI REST service (/health, /metrics, /predict)
│
├── notebooks/                      # Google Colab Training Notebooks
│   └── DeepGuard_AI_Training.ipynb # 49-cell reproducible notebook covering all 16 phases
│
├── model/                          # Exported ML & Preprocessor Artifacts
│   ├── deepguard_model.pth         # Serialized PyTorch state_dict (74.6 KB)
│   ├── preprocessor.joblib         # Fitted StandardScaler and categorical index dictionaries
│   ├── feature_schema.json         # Complete 41-feature schema with ordered column names
│   ├── label_mapping.json          # Binary label mappings: {"0": "Benign", "1": "Attack"}
│   ├── model_metadata.json         # Hyperparameters, architecture specifications, and training run info
│   ├── evaluation_metrics.json     # Empirical evaluation metrics for MLP and Baseline
│   ├── training_history.json       # Epoch-by-epoch loss and accuracy progression
│   ├── baseline_model.joblib       # Fitted Logistic Regression baseline model
│   ├── confusion_matrix.png        # Evaluated test set confusion matrix visualization
│   └── training_curve.png          # Train vs. validation loss and accuracy curves
│
├── reports/                        # Academic Deliverables & Defense Prep
│   ├── project_report.md           # Formal academic capstone report (20 sections)
│   ├── presentation_outline.md     # 12-slide presentation structure with speaker notes
│   └── viva_questions.md           # 17 comprehensive viva defense questions & answers
│
├── tests/                          # Automated Pytest Suite (72 Unit Tests)
│   ├── test_preprocessing.py       # Preprocessor scaling, encoding, and OOV tests (9 tests)
│   ├── test_model.py               # PyTorch MLP shapes, gradients, and loss checks (9 tests)
│   ├── test_evaluation.py          # Metric calculations, confusion matrix, and baseline (8 tests)
│   ├── test_artifacts.py           # Artifact integrity, schemas, and fresh-load test (10 tests)
│   ├── test_notebook.py            # Colab notebook cell syntax and reproducibility (7 tests)
│   ├── test_structure.py           # Project layout, stubs, and file existence (8 tests)
│   ├── test_inference.py           # Single/batch inference bounds and outputs (6 tests)
│   ├── test_validation.py          # CSV payload validation and safety limits (6 tests)
│   └── test_api.py                 # FastAPI REST endpoint integration tests (9 tests)
│
└── docs/                           # Architectural Specifications & Progress Logs
    ├── masterplan.md               # Master project plan and technical constraints
    ├── context.md                  # Live progress tracker and empirical metric registry
    ├── vivek.md                    # Developer task delegation log
    ├── phase1_dataset.md           # Phase 1 dataset selection specification
    ├── phase2_preprocessing.md     # Phase 2 preprocessing specification
    ├── phase3_training.md          # Phase 3 training loop specification
    ├── phase4_evaluation.md        # Phase 4 evaluation specification
    ├── phase5_artifacts.md         # Phase 5 artifact export specification
    ├── phase6_notebook.md          # Phase 6 Google Colab notebook specification
    ├── phase7_dashboard.md         # Phase 7 Next.js dashboard specification
    ├── phase8_structure.md         # Phase 8 project structure specification
    ├── phase9_testing.md           # Phase 9 quality assurance specification
    ├── phase10_deployment.md       # Phase 10 cloud deployment specification
    ├── phase11_report.md           # Phase 11 academic documentation specification
    └── phase12_readme.md           # Phase 12 README and reproducibility specification
```

---

## 7. Local Setup & Quickstart

Follow these instructions to set up and run DeepGuard AI locally on your development machine.

### 7.1 Prerequisites
- **Python:** 3.10, 3.11, or 3.12 (Tested on Python 3.12.10)
- **Node.js:** v18.x, v20.x, or v22.x with npm (Tested on Node v24.6.0)
- **Operating System:** Windows 10/11, macOS, or Linux
- **Git**

### 7.2 Clone and Setup Environment

```powershell
# 1. Clone the repository
git clone https://github.com/[FILL IN: your-username]/DeepGuard-AI.git
cd "DeepGuard-AI"

# 2. Create and activate a Python virtual environment
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1

# On Linux / macOS (Bash):
# source .venv/bin/activate

# 3. Upgrade pip and install core dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 8. Training in Google Colab

The entire data ingestion, preprocessing, training, evaluation, and artifact bundling pipeline is fully automated in `notebooks/DeepGuard_AI_Training.ipynb`.

### Reproduction Steps:
1. Open **[Google Colab](https://colab.research.google.com)**.
2. Click **File > Upload Notebook** and select `notebooks/DeepGuard_AI_Training.ipynb` from this repository.
3. Select Runtime: **Runtime > Change runtime type > T4 GPU** (or standard **CPU**; the model trains efficiently on either).
4. Run all cells: **Runtime > Run all** (`Ctrl + F9`).
5. **What happens during execution:**
   - Detects GPU/CPU compute capability.
   - Automatically downloads the NSL-KDD dataset from public raw mirrors.
   - Fits the `StandardScaler` and categorical mappings, saving `preprocessor.joblib`.
   - Trains `DeepGuardMLP` for up to 50 epochs with Early Stopping (patience = 10).
   - Evaluates the trained MLP and a Logistic Regression baseline across 18,896 test samples.
   - Generates `confusion_matrix.png`, `training_curve.png`, and `evaluation_metrics.json`.
   - Packages all 10 core model artifacts into `deepguard_artifacts.zip`.
   - Triggers an automated browser download of the zip file.
6. Extract the downloaded `deepguard_artifacts.zip` into the `model/` directory of your local repository.

---

## 9. Running the Application

DeepGuard AI can be run in two modes: **Full Decoupled Architecture** (FastAPI backend + Next.js frontend) or **Single-Command Unified Entrypoint**.

### Option A: Running Decoupled Architecture (Recommended)

#### Terminal 1 — Start FastAPI Backend:
```powershell
# From project root in your activated virtual environment:
python app.py --api
# Or via uvicorn directly:
# uvicorn src.api:app --reload --port 8000
```
- **Backend URL:** `http://localhost:8000`
- **Interactive OpenAPI Documentation:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/health`

#### Terminal 2 — Start Next.js Dashboard:
```powershell
# From project root:
cd dashboard
npm install
npm run dev
```
- **Frontend Dashboard:** `http://localhost:3000`

---

### Option B: Production Next.js Build

```powershell
cd dashboard
npm run build
npm start
```
The optimized production build compiles all static assets, dynamic API routes, and serves the UI at `http://localhost:3000`.

---

## 10. Automated Testing Suite

DeepGuard AI includes a 72-test automated unit and integration suite using `pytest`. The test suite validates data preprocessing, mathematical bounds, tensor shapes, gradient flow, out-of-vocabulary fallback, artifact serialization, and REST API integrity.

### Run All Tests:
```powershell
# From project root:
pytest tests/ -v
```

### Test Suite Breakdown:

| Test Suite File | Focus Area | Tests | Status |
|---|---|:---:|:---:|
| `tests/test_preprocessing.py` | Scaler loading, schema conformity, label encoding, NaN/Inf checks, out-of-vocabulary handling | 9 | **9 PASSED** |
| `tests/test_model.py` | PyTorch initialization, forward pass dimensions, gradient propagation, DataLoader batching, state_dict persistence | 9 | **9 PASSED** |
| `tests/test_evaluation.py` | Accuracy, Precision, Recall, F1, ROC-AUC calculations, confusion matrix plotting, baseline comparison | 8 | **8 PASSED** |
| `tests/test_artifacts.py` | Existence of all 10 artifacts, schema validation, isolated fresh-load inference, zip extraction | 10 | **10 PASSED** |
| `tests/test_notebook.py` | Colab notebook cell syntax, mandatory 16-phase sections, GPU/CPU awareness, zero hardcoded paths | 7 | **7 PASSED** |
| `tests/test_structure.py` | Repository skeleton, module exports, requirements, .gitignore rules, report stubs | 8 | **8 PASSED** |
| `tests/test_inference.py` | Single and batch inference tensor shapes, output range [0, 1], predicted class validity | 6 | **6 PASSED** |
| `tests/test_validation.py` | CSV validation, missing column rejection, empty file rejection, extra column pruning, 50k row limit | 6 | **6 PASSED** |
| `tests/test_api.py` | FastAPI `/health`, `/metrics`, `/predict` (CSV & JSON payloads), invalid input rejection, model visualization | 9 | **9 PASSED** |
| **Total** | **Comprehensive Quality Assurance Suite** | **72** | **72 PASSED (100%)** |

---

## 11. Deployment Architecture

DeepGuard AI is architected for zero-cost, serverless-friendly cloud deployment using a modern decoupled topology:

| Component | Cloud Platform | Tier | Deployment Folder | Configuration File |
|---|---|---|---|---|
| **Frontend Dashboard** | **Vercel** | Free Hobby | `frontend/` (or `dashboard/`) | `frontend/package.json` |
| **Backend REST API** | **Render** | Free Web Service | `backend/` | `render.yaml` \| `requirements-render.txt` |

### Live Deployment Status:
- **Frontend URL:** `https://deepguard-ai.vercel.app` *(or `[FILL IN: Your Vercel URL]`)*
- **Backend API URL:** `https://deepguard-ai-api.onrender.com` *(or `[FILL IN: Your Render URL]`)*
- **API Health Status:** `https://deepguard-ai-api.onrender.com/health`

> 💡 **Render Free Tier Cold Starts:**  
> Free web services on Render spin down after 15 minutes of inactivity. When a request arrives after being idle, the service spins up in approximately **30–50 seconds**. DeepGuard AI's frontend includes automatic retry and user notification banners acknowledging backend wake-up. For presentations, you can keep the instance active using free ping monitors such as [Cron-job.org](https://cron-job.org) pinging the `/health` endpoint every 14 minutes.

---

## 12. Evaluation Results & Baseline Comparison

Both the `DeepGuardMLP` neural network and a `LogisticRegression` baseline classifier were evaluated against the identical held-out test partition consisting of **18,896 NSL-KDD network flow records**. All metrics below are empirical values extracted directly from `model/evaluation_metrics.json`.

### 12.1 Performance Comparison Table

| Metric | DeepGuard MLP (PyTorch) | Baseline (Logistic Regression) | Δ Performance Gain |
|---|:---:|:---:|:---:|
| **Accuracy** | **99.47%** (0.99465) | 95.30% (0.95295) | **+4.17%** |
| **Precision (Macro)** | **99.47%** (0.99471) | 95.35% (0.95355) | **+4.12%** |
| **Recall (Macro)** | **99.45%** (0.99454) | 95.20% (0.95198) | **+4.25%** |
| **F1-Score (Macro)** | **99.46%** (0.99463) | 95.27% (0.95265) | **+4.19%** |
| **ROC-AUC** | **0.99990** | 0.99201 | **+0.00789** |
| **False Positives (FP)** | **39** | 343 | **-88.6% False Alarms** |
| **False Negatives (FN)** | **62** | 546 | **-88.6% Missed Threats** |

---

### 12.2 Confusion Matrix Breakdown (Test Set: N = 18,896)

#### DeepGuard MLP:
```
                     Predicted Benign       Predicted Attack
Actual Benign            10,062 (TN)               39 (FP)
Actual Attack                62 (FN)            8,733 (TP)
```
- **True Negatives (TN):** 10,062 benign flows correctly recognized.
- **False Positives (FP):** 39 benign flows falsely flagged (Low False Alarm Rate: 0.39%).
- **False Negatives (FN):** 62 attack vectors missed (High Detection Rate: 99.30%).
- **True Positives (TP):** 8,733 attack vectors successfully intercepted.

#### Baseline Classifier (Logistic Regression):
```
                     Predicted Benign       Predicted Attack
Actual Benign             9,758 (TN)              343 (FP)
Actual Attack               546 (FN)            8,249 (TP)
```

---

### 12.3 Per-Class Performance Metrics

| Model | Class | Precision | Recall | F1-Score |
|---|---|:---:|:---:|:---:|
| **DeepGuard MLP** | **Benign (Normal)** | 99.39% | 99.61% | 99.50% |
| | **Attack (Malicious)** | 99.55% | 99.30% | 99.43% |
| **Logistic Regression** | **Benign (Normal)** | 94.70% | 96.60% | 95.64% |
| | **Attack (Malicious)** | 96.01% | 93.79% | 94.89% |

---

## 13. Visualizations & Model Artifacts

All model weights, scalers, and training plots are automatically saved to the `model/` directory:

1. **Confusion Matrix Plot:** `model/confusion_matrix.png`  
   High-resolution Matplotlib heatmap illustrating the exact distribution of True Negatives, False Positives, False Negatives, and True Positives.
2. **Training Progression Curves:** `model/training_curve.png`  
   Dual-panel plot displaying training loss vs. validation loss and training accuracy vs. validation accuracy across all epochs, demonstrating smooth convergence with early stopping at epoch 29 (best validation loss: 0.0172).
3. **Model Weights:** `model/deepguard_model.pth`  
   Clean PyTorch `state_dict` (74.6 KB) containing 16,161 trainable parameters.
4. **Preprocessor Pipeline:** `model/preprocessor.joblib`  
   Scikit-learn `StandardScaler` combined with categorical mappings for `protocol_type`, `service`, and `flag`.
5. **Portable Deployment Archive:** `deepguard_artifacts.zip`  
   All 10 model artifacts packaged in a single 143.5 KB archive for standalone deployments.

---

## 14. Academic Deliverables

As part of the B.Tech academic capstone requirements, complete academic documentation has been produced in the `reports/` directory:

1. **Academic Capstone Report:** [`reports/project_report.md`](file:///reports/project_report.md)  
   Comprehensive 20-section IEEE-style research document covering abstract, problem formulation, mathematical background of MLPs, backpropagation equations, empirical results, and future research directions.
2. **Presentation Slide Outline:** [`reports/presentation_outline.md`](file:///reports/presentation_outline.md)  
   12-slide structured defense presentation with detailed bullet points and 2–4 sentence speaker notes for each slide.
3. **Viva Voce Defense Preparation:** [`reports/viva_questions.md`](file:///reports/viva_questions.md)  
   17 in-depth academic defense questions and answers covering neural architecture decisions, loss functions, overfitting prevention, data leakage, and production limitations.

---

## 15. Known Limitations

In the interest of rigorous scientific and academic honesty, the following limitations are documented:

1. **Flow Telemetry vs. Raw Packet Sniffing:** DeepGuard AI analyzes structured, pre-aggregated 41-dimensional connection records. It does not perform inline deep packet inspection (DPI) or raw PCAP capture on physical network interfaces.
2. **Historical Protocol Distribution:** The NSL-KDD benchmark is derived from legacy DARPA network traces. While it is the accepted academic standard for intrusion detection benchmarking, it does not reflect modern protocol standards such as QUIC, HTTP/3, DNS-over-HTTPS (DoH), or TLS 1.3 encrypted payloads.
3. **Binary Classification Scope:** The current production model distinguishes Benign vs. Malicious traffic. It does not classify granular multi-class sub-attacks (e.g., distinguishing a Neptune SYN flood from a Portsweep or Guess_Passwd attempt).
4. **Static Feature Space Dependency:** Incoming telemetry must conform strictly to the 41-feature schema. Incomplete logs missing critical flow duration or byte count features require imputation.
5. **Cold-Start Latency on Free Cloud Tiers:** On Render Free Web Services, container cold-starts introduce a 30–50 second delay on initial requests after 15 minutes of inactivity.
6. **Susceptibility to Adversarial Perturbation:** Like most feedforward neural networks without explicit adversarial training, the model may be susceptible to subtle feature manipulation crafted to evade detection.
7. **Concept Drift:** Network traffic patterns evolve continuously. Without periodic retraining or continuous learning pipelines, classification accuracy on zero-day attack variations will degrade over time.

---

## 16. References & Citations

1. **NSL-KDD Benchmark:**  
   Tavallaee, M., Bagheri, E., Lu, W., & Ghorbani, A. A. (2009). *A detailed analysis of the KDD CUP 99 data set.* IEEE Symposium on Computational Intelligence for Security and Defense Applications (CISDA), pp. 1-6. DOI: [10.1109/CISDA.2009.5356528](https://doi.org/10.1109/CISDA.2009.5356528).
2. **Canadian Institute for Cybersecurity (CIC):**  
   University of New Brunswick (UNB). *NSL-KDD Dataset Portal.* Available: [https://www.unb.ca/cic/datasets/nsl.html](https://www.unb.ca/cic/datasets/nsl.html).
3. **PyTorch Framework:**  
   Paszke, A., Gross, S., Massa, F., Lerer, A., Bradbury, J., Chanan, G., ... & Chintala, S. (2019). *PyTorch: An Imperative Style, High-Performance Deep Learning Library.* Advances in Neural Information Processing Systems (NeurIPS 32), pp. 8024-8035.
4. **Scikit-learn:**  
   Pedregosa, F., Varoquaux, G., Gramfort, A., Michel, V., Thirion, B., Grisel, O., ... & Duchesnay, É. (2011). *Scikit-learn: Machine Learning in Python.* Journal of Machine Learning Research, 12, pp. 2825-2830.
5. **Next.js & React:**  
   Vercel Inc. *Next.js 14 Documentation and Architecture.* Available: [https://nextjs.org/docs](https://nextjs.org/docs).
6. **FastAPI Framework:**  
   Ramírez, S. (2018). *FastAPI: Modern, Fast (High-Performance), Web Framework for Building APIs with Python.* Available: [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com).

---

## 17. License & Disclaimer

### License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Vivek and DeepGuard AI Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Academic Integrity & Safety Statement
This software was developed solely as an educational engineering project for a Bachelor of Technology degree. It is intended to showcase applied machine learning principles, reproducible research pipelines, and modern web application integration. The authors assume no liability for the deployment, misuse, or operational consequences of using this software in live network environments.
