# Phase 1 — Dataset Selection

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. After completing this phase, update `context.md` (Dataset Info section + Phase Status table) and append required manual tasks to `vivek.md`.

---

## Objective

Select a legitimate, publicly available, labeled network intrusion detection dataset. Document every decision. Do not fabricate any information.

---

## Entry Condition

- Phase 0 (Inspect & Plan) must be complete
- Environment info must be recorded in `context.md`

---

## Steps

### Step 1: Evaluate Dataset Candidates

Evaluate these candidates in order of preference:

| Dataset | URL | Size | Binary Labels | Notes |
|---|---|---|---|---|
| NSL-KDD | https://www.unb.ca/cic/datasets/nsl.html | ~25MB | Yes | Clean, well-studied, good for academic work |
| UNSW-NB15 | https://research.unsw.edu.au/projects/unsw-nb15-dataset | ~100MB | Yes | More modern, 9 attack categories |
| CIC-IDS2017 (subset) | https://www.unb.ca/cic/datasets/ids-2017.html | ~50MB/file | Yes | Use a single day's CSV only |

**Preference:** NSL-KDD first (smallest, cleanest, most academic references, direct download).

### Step 2: Choose the Dataset

Select the best candidate based on:
- Can it be downloaded without a browser login?
- Is it under 100MB?
- Does it have clear binary labels (Benign / Attack)?
- Is it suitable for a supervised MLP?

Document the final choice with justification.

### Step 3: Document the Dataset

Record in `context.md` (Dataset Info section):
- Dataset name
- Source URL
- Access date
- Total record count
- Selected subset (if applicable)
- Target column name
- Positive class label (attack)
- Negative class label (benign)
- Class distribution (approximate %)
- License or attribution requirement
- Known limitations

### Step 4: Dataset Download Decision

Determine whether the dataset can be downloaded automatically in Colab (direct URL) or must be uploaded manually by Vivek.

- If direct URL works: add the `wget` or `requests` download cell to the Colab notebook plan
- If manual upload is needed: add a task to `vivek.md` with exact instructions

---

## Output

- [ ] Dataset selected and documented in `context.md`
- [ ] Download method decided (direct URL or manual upload)
- [ ] Any manual tasks added to `vivek.md`
- [ ] Phase 1 marked COMPLETE in `context.md`

---

## Do NOT Do

- Do not generate synthetic data and call it a real dataset
- Do not use a dataset that requires a paid account
- Do not assume the download will succeed without verifying the URL
- Do not proceed to Phase 2 without a confirmed dataset choice recorded in `context.md`

---

## Next Phase

After completing Phase 1, proceed to **Phase 2 — Data Preprocessing** (`phase2_preprocessing.md`).
