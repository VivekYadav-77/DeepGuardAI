# Phase 9 — Testing and Quality Assurance

> **AGENT INSTRUCTION:** Read `masterplan.md` and `context.md` before starting. Write tests in `tests/`. Run them locally with `pytest`. Do NOT report any test as passed unless you actually ran it and saw the result. If a test cannot run (missing artifact), document WHY and provide the exact command for Vivek to run later.

---

## Objective

Write and execute meaningful tests to verify that the preprocessing pipeline, model inference, and input validation work correctly. Catch defects before deployment.

---

## Entry Condition

- Phase 7 COMPLETE (dashboard and inference code exist)
- Model artifacts in `model/` folder
- `requirements.txt` exists and dependencies are installed

---

## Test Files to Create

### `tests/test_preprocessing.py`

Tests to implement:
1. `test_scaler_loads` — `preprocessor.joblib` can be loaded with joblib
2. `test_schema_loads` — `feature_schema.json` is valid JSON with expected keys
3. `test_label_mapping_loads` — `label_mapping.json` loads and has correct keys
4. `test_scaler_output_shape` — scaler transforms a dummy array to correct shape
5. `test_no_nan_in_output` — scaler output contains no NaN or Inf values
6. `test_feature_count_matches` — feature count in schema matches scaler's `n_features_in_`

### `tests/test_inference.py`

Tests to implement:
1. `test_model_instantiates` — `DeepGuardMLP` can be instantiated with correct input_dim
2. `test_weights_load` — `deepguard_model.pth` loads into model without error
3. `test_inference_output_shape` — single-row input returns exactly 1 prediction
4. `test_batch_inference_output_shape` — 100-row input returns exactly 100 predictions
5. `test_predictions_in_valid_range` — all confidence scores are between 0 and 1
6. `test_predictions_valid_class` — all predicted labels are either 0 or 1

### `tests/test_validation.py`

Tests to implement:
1. `test_valid_csv_passes` — a correctly formatted CSV passes validation
2. `test_missing_columns_rejected` — CSV with missing required columns returns error message
3. `test_empty_csv_rejected` — empty CSV (0 rows) is rejected with a message
4. `test_extra_columns_handled` — CSV with extra columns does not crash
5. `test_target_column_excluded` — if target column accidentally included, validation removes it
6. `test_max_rows_enforced` — uploading 60,000 rows truncates to 50,000 with a warning

---

## Running Tests

```powershell
cd "d:\web devfiles\DeepGuard AI"
pip install pytest
pytest tests/ -v
```

Expected output: all tests PASSED. If any fail, fix the implementation before proceeding.

---

## Dashboard Startup Test

```powershell
Next.js run app.py &
# Wait 5 seconds, then check the URL opens
```

Or Vivek can manually open `http://localhost:8501` after running the command.

---

## Test Results Documentation

After running, update `context.md` with:
- Which tests passed
- Which tests failed (and why)
- Any tests that could not run (missing artifacts, environment issues)

---

## Output Checklist

- [x] `tests/test_preprocessing.py` created with 6 tests (9 total implemented)
- [x] `tests/test_inference.py` created with 6 tests
- [x] `tests/test_validation.py` created with 6 tests
- [x] `pytest tests/ -v` run and output captured (63 passed in 55.70s)
- [x] All tests passing (0 failures, 100% pass rate)
- [x] Dashboard startup verified manually (Next.js running on port 3000, HTTP 200 OK)
- [x] Test results added to `context.md`
- [x] Phase 9 marked COMPLETE in `context.md`

---

## Do NOT Do

- Do not mark tests as "passed" without running them
- Do not write tests that always pass regardless of implementation
- Do not skip the inference tests even if artifacts are missing — mock the artifacts for unit tests

---

## Next Phase

After completing Phase 9, proceed to **Phase 10 — Deployment** (`phase10_deployment.md`).
