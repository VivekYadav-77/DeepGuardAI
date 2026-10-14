# Phase 10 — Deployment

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. Deployment uses a modern decoupled architecture: **Frontend on Vercel** and **Backend on Render (Free Tier)**. Vivek performs manual browser clicks on Vercel and Render dashboards. Your job is to prepare all files, write exact instructions, and add tasks to `vivek.md`. Do NOT claim deployment succeeded until the public URLs have been verified.

---

## Objective

Deploy DeepGuard AI using an industry-standard decoupled architecture:
1. **Frontend**: Next.js 14 Web Dashboard deployed to **Vercel** (Free Hobby Tier).
2. **Backend**: FastAPI REST API serving PyTorch MLP inference deployed to **Render** (Free Web Service).

Both services run 100% on free tiers without requiring an active Colab or local notebook session.

---

## Architecture Overview

```
[ User Browser ]
       │
       ▼
[ Vercel CDN ]  ───>  Next.js 14 Dashboard (Glassmorphic UI)
       │              Deployed from `dashboard/` subfolder
       ▼ (HTTPS REST)
[ Render Web Service ] ───> FastAPI Backend (`src/api.py`)
       │                      ├── PyTorch MLP (`deepguard_model.pth` — 74.6 KB)
       │                      ├── Preprocessor (`preprocessor.joblib` — 1.6 KB)
       │                      └── Metadata & Evaluation Metrics
       │
   (Render Free Tier: 512MB RAM, CPU-only PyTorch, Auto-Deploy on Git Push)
```

---

## Entry Condition

- Phase 9 COMPLETE — all 72 test suite unit tests passing
- `src/api.py` verified with FastAPI endpoints (`/health`, `/metrics`, `/predict`)
- Next.js production build (`npm run build`) passing with zero errors
- Model weights (`deepguard_model.pth`) and preprocessor (`preprocessor.joblib`) present in `model/`
- No credentials or `.env` files in repository

---

## Pre-Deployment Checklist

Before deploying, verify:
- [x] Backend API starts locally: `python app.py --api` or `uvicorn src.api:app --port 8000`
- [x] Frontend builds cleanly: `cd dashboard && npm run build`
- [x] `requirements-render.txt` specifies CPU-only PyTorch wheel to prevent exceeding Render's 512MB RAM limit
- [x] `render.yaml` blueprint configuration is in place
- [x] CORS middleware in `src/api.py` permits requests from Vercel
- [x] Dashboard API routes proxy to `process.env.BACKEND_URL` with local fallback

---

## Deployment Steps (Vivek's Step-by-Step Guide)

Add these exact steps to `vivek.md`:

### Step 1: Push Repository to GitHub
1. Ensure all changes are committed:
   ```bash
   git add .
   git commit -m "Configure Phase 10 Vercel frontend and Render backend deployment"
   ```
2. Push to your GitHub repository (e.g., `git push origin main`).

---

### Step 2: Deploy Backend to Render (Free Web Service)
1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in.
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your `DeepGuard AI` repository.
4. Configure the Web Service settings:
   - **Name:** `deepguard-ai-api`
   - **Region:** Any close region (e.g., *Oregon (US West)* or *Frankfurt*)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / repo root)*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install --no-cache-dir -r requirements-render.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn src.api:app --host 0.0.0.0 --port $PORT
     ```
   - **Instance Type:** `Free` (512 MB RAM, 0.1 CPU)
5. Under **Environment Variables**, add:
   - `PYTHON_VERSION` = `3.12.0`
   - `PYTHONIOENCODING` = `utf-8`
6. Click **Deploy Web Service**.
7. Wait 2–3 minutes for the build to finish. Once live, copy your backend URL:
   `https://deepguard-ai-api.onrender.com`
8. Verify in your browser: `https://deepguard-ai-api.onrender.com/health` returns `{"status":"healthy","model_ready":true}`.

---

### Step 3: Deploy Frontend to Vercel (Free Hobby Tier)
1. Go to [Vercel Dashboard](https://vercel.com/) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Select your `DeepGuard AI` GitHub repository and click **Import**.
4. Configure Project settings:
   - **Project Name:** `deepguard-ai`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click **Edit** and set to `dashboard` (CRITICAL: must point to `dashboard` folder).
5. Expand **Environment Variables** and add:
   - **Name:** `BACKEND_URL`
   - **Value:** `https://deepguard-ai-api.onrender.com` (use your actual Render URL from Step 2)
   - **Name:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://deepguard-ai-api.onrender.com`
6. Click **Deploy**.
7. Vercel will build and deploy the dashboard in ~45 seconds. Copy your live frontend URL:
   `https://deepguard-ai.vercel.app`

---

### Step 4: Verification and Live Testing
1. Open the Vercel URL in your browser: `https://deepguard-ai.vercel.app`.
2. Check that the **System Readiness** card shows `10/10 Verified` and model status is `Ready`.
3. Go to the **Batch Traffic Analyzer** tab.
4. Load sample data (Benign or Attack) or upload a CSV test file.
5. Click **Run Batch Threat Analysis**.
6. Verify that inference executes, predictions show classified labels (Benign vs Suspicious), and risk metrics update dynamically.
7. Record the public URLs in `context.md`.

---

## Free-Tier Operational Notes & Tips

### Render Free Tier Cold Starts
- **Behavior:** Render free web services go to sleep after 15 minutes of inactivity.
- **Waking up:** When a user visits the dashboard after idle time, the first inference request may take 30–50 seconds while Render spins up the container.
- **User Feedback:** The Next.js dashboard includes fallback error handling informing the user that the backend may be warming up.
- **Optional Keep-Alive:** To keep the backend warm during presentations or evaluations, set up a free ping every 14 minutes using [Cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) targeting `https://deepguard-ai-api.onrender.com/health`.

### Memory Management
- `requirements-render.txt` installs the **CPU-only PyTorch wheel** (`--extra-index-url https://download.pytorch.org/whl/cpu`).
- This keeps the entire Python process footprint to **~180–220 MB RAM**, well inside Render's 512 MB free tier quota.

---

## Fallback: Local Run Instructions

If offline or testing locally without deploying:

```powershell
# 1. Run FastAPI Backend (Terminal 1)
python app.py --api
# Or: uvicorn src.api:app --reload --port 8000

# 2. Run Next.js Dashboard (Terminal 2)
cd dashboard
npm run dev
# Dashboard available at http://localhost:3000
```

---

## Output Checklist

- [x] `src/api.py` FastAPI REST service implemented
- [x] `requirements-render.txt` configured with PyTorch CPU wheel
- [x] `render.yaml` blueprint configuration created
- [x] `dashboard/app/api/metrics/route.js` updated with remote backend proxy
- [x] `dashboard/app/api/predict/route.js` updated with remote backend proxy
- [x] Next.js production build (`npm run build`) verified
- [x] All 72 unit tests passing (`pytest`)
- [ ] Vivek deployment steps written to `vivek.md`
- [ ] Deployment attempted by Vivek
- [ ] Public URLs recorded in `context.md`
- [ ] Phase 10 marked COMPLETE in `context.md`

---

## Next Phase

After completing Phase 10, proceed to **Phase 11 — Academic Report** (`phase11_report.md`).
