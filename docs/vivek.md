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

## TASK GROUP 2 — Phase 6: Google Colab Training Notebook

**Status:** Completed by AI Agent (`notebooks/DeepGuard_AI_Training.ipynb` created, verified, and unit tested).

> **Note:** All model training and artifact generation has already been completed and verified locally in `model/`. Running the Colab notebook is **optional** if you want independent verification in Google Cloud or need to train with GPU acceleration.

### Step 1: Open Google Colab
- [ ] Go to https://colab.research.google.com
- [ ] Sign in with your Google account

### Step 2: Upload the Notebook
- [ ] Click **File > Upload Notebook**
- [ ] Select the file: `d:\web devfiles\DeepGuard AI\notebooks\DeepGuard_AI_Training.ipynb`

### Step 3: Dataset Acquisition
- [x] **Automated:** Cell 7 automatically downloads `KDDTrain+.txt` and `KDDTest+.txt` from public mirrors into `data/`.
- [ ] **Manual Fallback (only if download fails):**
  - Download `KDDTrain+.txt` and `KDDTest+.txt` manually from `https://raw.githubusercontent.com/jmnwong/NSL-KDD-Dataset/master/`
  - Click the **Files** icon on the Colab sidebar, create a `data` folder, and upload both files.

### Step 4: Run the Notebook
- [ ] Click **Runtime > Run All** (or press `Ctrl + F9`)
- [ ] Runtime will inspect hardware via `nvidia-smi`, preprocess features, train MLP and Baseline, evaluate metrics, and plot figures.

### Step 5: Verify Outputs
- [ ] Training curve plotted and saved to `model/training_curve.png`
- [ ] Confusion matrix comparison displayed and saved to `model/confusion_matrix.png`
- [ ] Test comparison printed: MLP (~99.52% acc) vs Baseline (~95.30% acc)
- [ ] Fresh-load test printed: `Fresh-load test PASSED: Model and preprocessor are 100% reproducible and isolated.`

### Step 6: Download Artifacts (if re-training on Colab)
- [ ] Cell 48 automatically triggers a browser download of `deepguard_artifacts.zip`
- [ ] If downloaded, extract all files into: `d:\web devfiles\DeepGuard AI\model\`
- [ ] Confirm all artifacts exist in `model/`:
  - `model/deepguard_model.pth`
  - `model/preprocessor.joblib`
  - `model/feature_schema.json`
  - `model/label_mapping.json`
  - `model/model_metadata.json`
  - `model/evaluation_metrics.json`
  - `model/training_history.json`
  - `model/confusion_matrix.png`
  - `model/training_curve.png`
  - `model/baseline_model.joblib`

**Done?** Tell the AI agent: *"Phase 6 verified, proceed to Phase 7 (Next.js Dashboard)"*

---

## TASK GROUP 3 — After Phase 7 (Dashboard)

**When to do:** After the AI agent implements `app.py`

### Test the Dashboard Locally
- [ ] Open PowerShell
- [ ] Run the Next.js Web Dashboard:
  ```powershell
  cd "d:\web devfiles\DeepGuard AI\dashboard"
  npm run dev
  ```
- [ ] Open your browser and go to: `http://localhost:3000`
- [ ] Check all 5 tabs load correctly:
  - [ ] Overview tab — shows project info and metric cards
  - [ ] Traffic Analyzer tab — CSV upload works
  - [ ] Model Performance tab — shows confusion matrix and training curve
  - [ ] Threat Analysis tab — shows charts after CSV upload
  - [ ] Model Information tab — shows all system details
- [ ] Upload a sample CSV and verify predictions appear (no crashes)
- [ ] Press `Ctrl+C` in PowerShell to stop the dashboard when done
- [ ] *(Optional fallback)*: Python runner also supported via `streamlit run app.py` on `http://localhost:8501`.

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

## TASK GROUP 5 — Phase 10: Vercel & Render Deployment

**When to do:** Now that the AI agent has prepared `src/api.py`, `render.yaml`, `requirements-render.txt`, and the Next.js production build.

### Part 1: Push Code to GitHub
- [ ] Open PowerShell or terminal in `d:\web devfiles\DeepGuard AI`
- [ ] Check git status and commit all changes:
  ```bash
  git add .
  git commit -m "Configure Vercel frontend and Render backend deployment"
  git push origin main
  ```

---

### Part 2: Deploy Backend on Render (Free Web Service)
- [ ] Go to https://dashboard.render.com and sign in with GitHub
- [ ] Click **New +** (top right) and select **Web Service**
- [ ] Click **Build and deploy from a Git repository** and connect your `DeepGuard AI` repo
- [ ] Configure the settings:
  - **Name:** `deepguard-ai-api`
  - **Region:** Any region (e.g., *Oregon (US West)* or *Frankfurt*)
  - **Branch:** `main`
  - **Root Directory:** `backend` *(CRITICAL: type or select the backend folder)*
  - **Runtime:** `Python 3`
  - **Build Command:**
    ```bash
    pip install --no-cache-dir -r requirements.txt
    ```
  - **Start Command:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port $PORT
    ```
  - **Instance Type:** `Free` (512 MB RAM, 0.1 CPU)
- [ ] Under **Environment Variables**, add:
  - `PYTHON_VERSION` = `3.12.0`
  - `PYTHONIOENCODING` = `utf-8`
- [ ] Click **Deploy Web Service**
- [ ] Wait 2–3 minutes for the build to finish. Once live, test:
  - Open `https://deepguard-ai-api.onrender.com/health` in your browser
  - Confirm it returns: `{"status":"healthy","model_ready":true}`
- [ ] Copy your Render backend URL: `https://deepguard-ai-api.onrender.com`

---

### Part 3: Deploy Frontend on Vercel (Free Hobby Tier)
- [ ] Go to https://vercel.com and sign in with GitHub
- [ ] Click **Add New... > Project**
- [ ] Find and **Import** your `DeepGuard AI` repository
- [ ] Configure the project:
  - **Framework Preset:** `Next.js`
  - **Root Directory:** Click **Edit** and choose `frontend` *(CRITICAL: select the frontend folder)*
- [ ] Expand **Environment Variables** and add:
  - Key: `BACKEND_URL` | Value: `https://deepguard-ai-api.onrender.com` (your Render URL from Part 2)
  - Key: `NEXT_PUBLIC_API_URL` | Value: `https://deepguard-ai-api.onrender.com`
- [ ] Click **Deploy**
- [ ] Wait ~45 seconds for Vercel to build and publish your dashboard
- [ ] Copy your Vercel URL: `https://deepguard-ai.vercel.app` (or similar)

---

### Part 4: Verify Live Dashboard
- [ ] Open your live Vercel URL
- [ ] Verify that the **System Readiness** shows `10/10 Verified` and `Ready`
- [ ] Go to **Batch Traffic Analyzer**, load benign or attack sample data, and click **Run Batch Threat Analysis**
- [ ] Verify predictions and threat risk distributions render in real time
- [ ] Note: If the backend was inactive for >15 minutes, the first request may take ~30-40 seconds for Render's free tier container to wake up.

**Done?** Tell the AI agent: *"Deployment complete. Vercel URL: [url], Render URL: [url]"*

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
