# Phase 2 — Data Preprocessing

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. All preprocessing code goes into `src/preprocessing.py`. The Colab notebook cells for preprocessing go into `notebooks/DeepGuard_AI_Training.ipynb`. Update `context.md` after completing this phase.

---

## Objective

Implement a reproducible preprocessing pipeline that transforms raw dataset CSV into clean, scaled feature arrays ready for model training. Save all fitted transformers as artifacts for inference use.

---

## Entry Condition

- Phase 1 COMPLETE — dataset chosen and documented in `context.md`
- Dataset is either downloadable directly or Vivek has confirmed manual upload steps

---

## Steps

### Step 1: Load and Inspect the Dataset

In the Colab notebook, implement a cell that:
1. Loads the raw CSV into a Pandas DataFrame
2. Prints: shape, dtypes, first 5 rows
3. Prints: missing value counts per column
4. Prints: duplicate row count
5. Prints: value counts for the target label column
6. Prints: min/max/mean of numerical columns

Record any anomalies found in `context.md`.

### Step 2: Label Preparation

1. Identify the target column (e.g., `label`, `class`, `attack_cat`)
2. For datasets with multi-class labels, map all attack types to a single "Attack" label
3. Map: Benign → 0, Attack → 1
4. Save the mapping to `model/label_mapping.json`
5. Print class distribution after mapping

### Step 3: Feature Selection

1. Drop identifier columns (IPs, ports if not relevant, timestamps, row IDs)
2. Drop any column that constitutes direct target leakage
3. Drop columns with >50% missing values
4. Document every dropped column and the reason in the Colab notebook as a markdown cell

### Step 4: Handle Missing and Infinite Values

1. Replace `np.inf` and `-np.inf` with `np.nan`
2. Fill remaining `np.nan` in numerical columns with the column median (computed on training data only)
3. For categorical columns: fill with mode or "UNKNOWN"

### Step 5: Train / Validation / Test Split

- Use an 70/15/15 split by default
- Set `random_state=42` for reproducibility
- If the dataset has session-based grouping or temporal ordering, document this and use an appropriate split strategy
- Print split sizes and class distributions for each split

### Step 6: Feature Scaling

1. Fit a `StandardScaler` on training features ONLY
2. Apply the fitted scaler to validation and test features
3. Do NOT refit on validation or test data

### Step 7: Categorical Encoding (if applicable)

1. Fit a `LabelEncoder` or `OneHotEncoder` on training data only
2. Apply to validation and test data
3. Handle unseen categories gracefully

### Step 8: Save the Feature Schema

Save `model/feature_schema.json`:
```json
{
  "feature_names": ["col1", "col2", ...],
  "feature_count": 41,
  "target_column": "label",
  "drop_columns": ["col_a", "col_b"]
}
```

### Step 9: Save the Preprocessing Pipeline

```python
import joblib
joblib.dump(scaler, "model/preprocessor.joblib")
```

### Step 10: Verify Preprocessing

1. Load the saved `preprocessor.joblib` in a fresh cell
2. Apply it to a sample row
3. Verify the output shape matches `feature_count`
4. Confirm no NaN or Inf values in processed arrays

---

## Files to Create / Modify

| File | Action |
|---|---|
| `src/preprocessing.py` | Preprocessing functions (reusable for inference) |
| `notebooks/DeepGuard_AI_Training.ipynb` | Add preprocessing cells |
| `model/preprocessor.joblib` | Saved scaler (after Colab run) |
| `model/feature_schema.json` | Feature names + count |
| `model/label_mapping.json` | Label encoding map |

---

## Output Checklist

- [ ] Raw data loaded and inspected
- [ ] Labels mapped to binary (0/1)
- [ ] Features cleaned and selected
- [ ] Train/val/test split done with documented strategy
- [ ] Scaler fitted on train only, applied to all splits
- [ ] `preprocessor.joblib` saved
- [ ] `feature_schema.json` saved
- [ ] `label_mapping.json` saved
- [ ] Preprocessing verified in a fresh cell
- [ ] Phase 2 marked COMPLETE in `context.md`

---

## Do NOT Do

- Do not fit the scaler on the entire dataset before splitting
- Do not silently drop attack classes to improve accuracy
- Do not include the target column in the feature array
- Do not use test data statistics during training preprocessing

---

## Next Phase

After completing Phase 2, proceed to **Phase 3 — Model Training** (`phase3_training.md`).
