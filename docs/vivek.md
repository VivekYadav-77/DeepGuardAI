# vivek.md — Manual Tasks for Vivek

> **What is this file?**
> Every time an AI agent completes a phase, it writes the manual tasks that ONLY YOU (Vivek) can do — things that require your browser, your Google account, your Hugging Face account, or physical actions like downloading files.
>
> **How to use this file:**
> 1. After the AI agent finishes a phase, come back to this file
> 2. Find the tasks for that phase
> 3. Complete them in order
> 4. Tick each item off as you finish
> 5. Then ask the AI agent to continue to the next phase

---

## TASK GROUP 0 — Initial Setup (Do This First)

**When to do:** Before asking the AI agent to start any phase.

- [ ] Open this project in Antigravity IDE from: `d:\web devfiles\DeepGuard AI`
- [ ] Make sure Python is installed on your Windows PC
  - Check by running in PowerShell: `python --version`
  - If not installed: https://www.python.org/downloads/ (get Python 3.10 or 3.11)
- [ ] Optionally install a virtual environment:
  ```powershell
  cd "d:\web devfiles\DeepGuard AI"
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```
- [ ] Install base dependencies once you have `requirements.txt`:
  ```powershell
  pip install -r requirements.txt
  ```
- [ ] Make sure you have a Google account (for Colab)
- [ ] Make sure you have a Hugging Face account (for deployment): https://huggingface.co

**Done?** Tell the AI agent: *"Task Group 0 complete, start Phase 0"*

---

## TASK GROUP 1 — After Phase 1 (Dataset)

**Status:** Completed by AI Agent (Direct Download configured).

The dataset selected for DeepGuard AI is **NSL-KDD** (from Canadian Institute for Cybersecurity, UNB).

- [x] **Dataset Selected:** NSL-KDD (`KDDTrain+.txt` and `KDDTest+.txt`)
- [x] **Download Strategy:** **Fully automated** inside the training pipeline.
  - The Google Colab notebook will download the files directly via verified public raw mirror links:
    - Train: `https://raw.githubusercontent.com/jmnwong/NSL-KDD-Dataset/master/KDDTrain+.txt`
    - Test: `https://raw.githubusercontent.com/jmnwong/NSL-KDD-Dataset/master/KDDTest+.txt`
- [x] **Phase 2 (Preprocessing) Complete:** `src/preprocessing.py`, `model/preprocessor.joblib`, `model/feature_schema.json`, and `model/label_mapping.json` generated and verified with 9 unit tests passing.
- [x] **Phase 3 (Model Training) Complete:** `DeepGuardMLP` defined in `src/model.py`, full training pipeline executed in `src/train.py`, best weights saved to `model/deepguard_model.pth` (best val loss 0.01526, val acc 99.50%), `model/training_history.json` and `model/model_metadata.json` generated. 18/18 pytest tests passing.
- [x] **Phase 4 (Baseline & Evaluation) Complete:** Logistic Regression baseline trained & saved to `model/baseline_model.joblib`. Evaluated on 18,896 held-out test records: MLP achieved **99.52%** accuracy and **99.52%** F1 (0.9998 ROC-AUC) vs. Baseline **95.30%** accuracy and **95.27%** F1 (0.9920 ROC-AUC). `model/evaluation_metrics.json` and `model/confusion_matrix.png` exported. 26/26 pytest tests passing.
- [x] **Phase 5 (Artifact Export & Verification) Complete:**
  - All 8 required artifacts + 1 baseline model verified in `model/`:
    - `model/deepguard_model.pth` (PyTorch MLP state dict, 74.6 KB)
    - `model/preprocessor.joblib` (Fitted StandardScaler, 1.5 KB)
    - `model/feature_schema.json` (41 features schema, 5.1 KB)
    - `model/label_mapping.json` (0=Normal, 1=Attack, 104 bytes)
    - `model/model_metadata.json` (Architecture & training config, 362 bytes)
    - `model/evaluation_metrics.json` (Real test set metrics, 1.1 KB)
    - `model/training_history.json` (Per-epoch loss trajectory, 2.7 KB)
    - `model/confusion_matrix.png` (Side-by-side visualization, 37.9 KB)
    - `model/baseline_model.joblib` (Logistic Regression baseline, 1.0 KB)
  - Isolated fresh-load inference pipeline implemented and verified (`src/export.py`).
  - Self-contained archive created: `deepguard_artifacts.zip` (100.9 KB).
  - 10 automated unit tests added in `tests/test_artifacts.py` (36/36 tests passing across full suite).
  - Training notebook `notebooks/DeepGuard_AI_Training.ipynb` updated with Phase 5 cells (Sections 20-23) for automated Colab verification and browser download.

**Done?** Tell the AI agent: *"Phase 5 complete, proceed to Phase 6 (Colab Notebook) or Phase 7 (Next.js Dashboard)"*

---

## TASK GROUP 2 — After Phase 6 (Colab Notebook)

**When to do:** After the AI agent creates `notebooks/DeepGuard_AI_Training.ipynb`

### Step 1: Open Google Colab
- [ ] Go to https://colab.research.google.com
- [ ] Sign in with your Google account

### Step 2: Upload the Notebook
- [ ] Click **File > Upload Notebook**
- [ ] Select the file: `d:\web devfiles\DeepGuard AI\notebooks\DeepGuard_AI_Training.ipynb`

### Step 3: Upload Dataset (if required)
> The AI agent will tell you here whether you need to upload the dataset manually or if Colab downloads it automatically.
- [ ] [Check notebook Cell 4 — if it says "MANUAL STEP", upload your dataset file via the Colab Files panel on the left]

### Step 4: Run the Notebook
- [ ] Click **Runtime > Run All** in the Colab menu
- [ ] Monitor the output — each cell prints progress
- [ ] If any cell shows a red error, stop and report the error to the AI agent

### Step 5: Verify Training Completed
- [ ] You should see a line like: `Training complete. Best model saved.`
- [ ] You should see evaluation metrics printed for both MLP and Baseline

### Step 6: Download the Artifacts
- [ ] The last cell will automatically trigger a download of `deepguard_artifacts.zip`
- [ ] If the download doesn't start, run only the last cell manually
- [ ] Save the file to your Downloads folder

### Step 7: Extract Artifacts to the Project
- [ ] Open the downloaded `deepguard_artifacts.zip`
- [ ] Extract ALL files into: `d:\web devfiles\DeepGuard AI\model\`
- [ ] Verify these files now exist:
  - `model/deepguard_model.pth`
  - `model/preprocessor.joblib`
  - `model/feature_schema.json`
  - `model/label_mapping.json`
  - `model/model_metadata.json`
  - `model/evaluation_metrics.json`
  - `model/training_history.json`
  - `model/confusion_matrix.png`

**Done?** Tell the AI agent: *"Colab run complete, artifacts extracted to model/ folder"*

---

## TASK GROUP 3 — After Phase 7 (Dashboard)

**When to do:** After the AI agent implements `app.py`

### Test the Dashboard Locally
- [ ] Open PowerShell
- [ ] Run:
  ```powershell
  cd "d:\web devfiles\DeepGuard AI"
  Next.js run app.py
  ```
- [ ] Open your browser and go to: `http://localhost:8501`
- [ ] Check all 5 tabs load correctly:
  - [ ] Overview tab — shows project info and metric cards
  - [ ] Traffic Analyzer tab — CSV upload works
  - [ ] Model Performance tab — shows confusion matrix and training curve
  - [ ] Threat Analysis tab — shows charts after CSV upload
  - [ ] Model Information tab — shows all system details
- [ ] Upload a sample CSV and verify predictions appear (no crashes)
- [ ] Press `Ctrl+C` in PowerShell to stop the dashboard when done

**Done?** Tell the AI agent: *"Dashboard verified locally, all tabs working"*

---

## TASK GROUP 4 — After Phase 9 (Testing)

**When to do:** After the AI agent creates test files in `tests/`

### Run the Tests
- [ ] Open PowerShell
- [ ] Run:
  ```powershell
  cd "d:\web devfiles\DeepGuard AI"
  pip install pytest
  pytest tests/ -v
  ```
- [ ] Copy the output (all PASSED/FAILED lines) and share it with the AI agent
- [ ] If any tests FAILED, tell the AI agent the exact error message

**Done?** Tell the AI agent: *"Tests run. [X] passed, [Y] failed. Here is the output: [paste output]"*

---

## TASK GROUP 5 — After Phase 10 (Deployment)

**When to do:** After the AI agent prepares the deployment files and tells you to deploy

### Create Your Hugging Face Space
- [ ] Go to https://huggingface.co and sign in
- [ ] Click your profile > **New Space**
- [ ] Fill in:
  - Space name: `deepguard-ai`
  - License: MIT
  - **Space SDK: Next.js** (important!)
  - Visibility: **Public**
- [ ] Click **Create Space**

### Get Your Access Token
- [ ] Go to: https://huggingface.co/settings/tokens
- [ ] Click **New Token**
- [ ] Name it anything (e.g., `deepguard-deploy`)
- [ ] Role: **Write**
- [ ] Copy the token (starts with `hf_...`) — keep it private, never share it

### Upload Project Files
**Option A — Web Interface (easier):**
- [ ] Go to your Space page
- [ ] Click the **Files and Versions** tab
- [ ] Click **Upload files** button
- [ ] Select all files from: `d:\web devfiles\DeepGuard AI\`
  - Upload: `app.py`, `requirements.txt`, `README.md`, the `src/` folder, the `model/` folder

**Option B — Git (if you know how):**
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/deepguard-ai
# Copy all project files into the cloned folder
cd deepguard-ai
git add .
git commit -m "Deploy DeepGuard AI"
git push
```

### Verify Deployment
- [ ] Go to your Space URL: `https://huggingface.co/spaces/YOUR_USERNAME/deepguard-ai`
- [ ] Wait for the build to finish (watch the "Building" spinner — takes 2–5 minutes)
- [ ] Once built, verify all 5 tabs of the dashboard work
- [ ] Upload a sample CSV and verify predictions load
- [ ] Copy the public URL and share it with the AI agent

**Done?** Tell the AI agent: *"Deployment complete. Public URL: [your URL]"*

---

## TASK GROUP 6 — After Phase 11 (Academic Report)

**When to do:** After the AI agent generates the report files in `reports/`

### Fill in Personal Details
Open `reports/project_report.md` and replace all `[FILL IN: ...]` markers:
- [ ] Your full name
- [ ] Your enrollment / roll number
- [ ] Your department name
- [ ] Your institution name
- [ ] Your supervisor's name
- [ ] The academic year (confirm: 2025–2026)

Open `reports/presentation_outline.md` and:
- [ ] Replace your name and institution placeholders in Slide 1

**Done?** Tell the AI agent: *"Report personal details filled in"*

---

## TASK GROUP 7 — After Phase 12 (README)

**When to do:** After the AI agent writes `README.md`

- [ ] Open `README.md` and fill in:
  - `[FILL IN: Institution Name]` — your institution
  - Deployment URL (from Task Group 5)
  - Evaluation results (will be pre-filled from `context.md`)
- [ ] Take a screenshot of the running dashboard (both Overview and Traffic Analyzer tabs)
  - Save screenshots to `reports/` or embed them in `README.md`
- [ ] Do a final check: run `Next.js run app.py` and verify everything works

**Done?** Tell the AI agent: *"README complete, screenshots added, project done"*

---

## Quick Reference — What to Tell the AI Agent at Each Step

| After you do | Tell the agent |
|---|---|
| Task Group 0 | "Task Group 0 complete, start Phase 0 and Phase 8" |
| Phase 1 done (agent) | Do Task Group 1 (dataset download) |
| Colab notebook done | Do Task Group 2 (run Colab, download artifacts) |
| Task Group 2 done | "Artifacts downloaded, tell agent to continue Phase 7" |
| Task Group 3 done | "Dashboard verified locally" |
| Task Group 4 done | "Paste test output to agent" |
| Task Group 5 done | "Deployment URL: [url]" |
| Task Group 6 done | "Report personal details filled in" |
| Task Group 7 done | "Project complete" |
