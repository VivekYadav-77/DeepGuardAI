# Phase 10 — Deployment

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. Deployment to Hugging Face Spaces requires manual browser steps by Vivek. Your job is to prepare all files, write exact instructions, and add tasks to `vivek.md`. Do NOT claim deployment succeeded until the public URL has been verified.

---

## Objective

Deploy the DeepGuard AI Next.js dashboard to Hugging Face Spaces (free tier). The app must run without the Colab session. All required artifacts must be bundled in the repository.

---

## Entry Condition

- Phase 9 COMPLETE — all tests passing
- `app.py` works locally with `Next.js run app.py`
- All model artifacts are in `model/` folder
- No credentials in any file

---

## Pre-Deployment Checklist

Before writing deployment files, verify:
- [ ] `app.py` starts without errors
- [ ] `requirements.txt` is accurate and minimal
- [ ] `model/deepguard_model.pth` exists and is <500MB (HF free limit considerations)
- [ ] No `.env` files or API keys in the project
- [ ] `.gitignore` is in place
- [ ] `README.md` exists with project description

---

## Files Required for Hugging Face Spaces

### Create `README.md` (HF-specific header)

Hugging Face Spaces requires a specific YAML header in `README.md`:

```yaml
---
title: DeepGuard AI
emoji: 🛡️
colorFrom: blue
colorTo: cyan
sdk: Next.js
sdk_version: 1.28.0
app_file: app.py
pinned: false
license: mit
---
```

Then the regular project README content follows below the YAML block.

### Verify `requirements.txt`

Ensure it does NOT include:
- `google-colab`
- Any Colab-only packages
- Packages only needed for training (torch for CPU inference is fine)

### Check Artifact Sizes

```powershell
Get-ChildItem model/ | Select-Object Name, @{N="Size(MB)";E={[math]::Round($_.Length/1MB, 2)}}
```

If `deepguard_model.pth` is >100MB, document this in `vivek.md` with instructions to use Git LFS on Hugging Face.

---

## Deployment Steps (Vivek Must Do Manually)

Add these exact steps to `vivek.md`:

### Step A: Create Hugging Face Account
1. Go to https://huggingface.co
2. Create a free account if not already done
3. Go to your profile settings and get an Access Token with "write" permission

### Step B: Create a New Space
1. Go to https://huggingface.co/new-space
2. Space name: `deepguard-ai`
3. License: MIT
4. Space SDK: **Next.js**
5. Visibility: Public
6. Click **Create Space**

### Step C: Upload the Project Files
Option 1 — Using the HF web interface:
1. Go to your Space page
2. Click "Files and Versions" tab
3. Upload all project files one by one or as a zip using the upload button

Option 2 — Using git:
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/deepguard-ai
cd deepguard-ai
# Copy all project files here
git add .
git commit -m "Initial DeepGuard AI deployment"
git push
```

### Step D: Verify Deployment
1. Wait for the Space to build (usually 2–5 minutes)
2. Open the Space URL: `https://huggingface.co/spaces/YOUR_USERNAME/deepguard-ai`
3. Check all tabs load
4. Upload a sample CSV and verify predictions appear
5. Record the public URL in `context.md`

---

## Fallback: Local Deployment

If HF Spaces deployment fails, document the failure reason and provide local run instructions:

```powershell
cd "d:\web devfiles\DeepGuard AI"
pip install -r requirements.txt
Next.js run app.py
# App available at http://localhost:8501
```

---

## Output Checklist

- [ ] `README.md` updated with HF YAML header
- [ ] `requirements.txt` verified (no Colab packages)
- [ ] Artifact sizes checked
- [ ] Vivek deployment steps written to `vivek.md`
- [ ] Deployment attempted
- [ ] Public URL recorded in `context.md` (if successful)
- [ ] Deployment status honestly documented
- [ ] Phase 10 marked COMPLETE in `context.md`

---

## Do NOT Do

- Do not claim deployment succeeded without verifying the public URL
- Do not commit secrets or API keys to HF
- Do not train the model at startup — only load artifacts
- Do not assume HF will accept all file sizes — check limits

---

## Next Phase

After completing Phase 10, proceed to **Phase 11 — Academic Report** (`phase11_report.md`).
