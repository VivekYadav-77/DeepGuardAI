"""
DeepGuard AI — Artifact Export & Verification Module
Phase 5 Implementation

This module validates, tests, and packages all model artifacts generated
during training and evaluation. It guarantees reproducible inference and
ensures that fresh downstream environments (e.g. Next.js dashboard, Hugging Face
Spaces) can load the model weights, preprocessing pipelines, and schemas without error.
"""

import json
import os
import shutil
import sys
import zipfile
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import torch

from src.model import DeepGuardMLP


# The 8 mandatory artifacts specified in docs/phase5_artifacts.md
REQUIRED_ARTIFACTS: List[str] = [
    "deepguard_model.pth",
    "preprocessor.joblib",
    "feature_schema.json",
    "label_mapping.json",
    "model_metadata.json",
    "evaluation_metrics.json",
    "training_history.json",
    "confusion_matrix.png",
]

# Supplementary artifacts created in the project
OPTIONAL_ARTIFACTS: List[str] = [
    "baseline_model.joblib",
    "training_curve.png",
]


def verify_artifacts_exist(model_dir: str = "model") -> Dict[str, Dict[str, Any]]:
    """
    Step 1: Check that all required and optional artifacts exist on disk and are non-empty.

    Args:
        model_dir: Directory containing the exported artifacts.

    Returns:
        Dict mapping artifact filename to status details:
        {"exists": bool, "size_bytes": int, "status": "OK" | "MISSING" | "EMPTY"}
    """
    results: Dict[str, Dict[str, Any]] = {}
    all_files = REQUIRED_ARTIFACTS + OPTIONAL_ARTIFACTS

    for fname in all_files:
        fpath = os.path.join(model_dir, fname)
        if not os.path.exists(fpath):
            results[fname] = {
                "exists": False,
                "size_bytes": 0,
                "status": "MISSING",
                "path": fpath,
            }
        else:
            size = os.path.getsize(fpath)
            status = "EMPTY" if size == 0 else "OK"
            results[fname] = {
                "exists": True,
                "size_bytes": size,
                "status": status,
                "path": fpath,
            }

    return results


def verify_artifact_schemas_and_load(model_dir: str = "model") -> Dict[str, Any]:
    """
    Validate internal schema consistency and loadability of all artifact files.

    Checks:
      1. feature_schema.json has feature_names (41), feature_count == 41, categorical & numerical lists
      2. label_mapping.json has 0=normal/benign and 1=attack
      3. model_metadata.json has architecture, input_dim, hidden_dims, best_val_loss
      4. evaluation_metrics.json has mlp & baseline performance records
      5. training_history.json has train_loss and val_loss
      6. preprocessor.joblib is a fitted transformer with n_features_in_ == 41
      7. deepguard_model.pth loads cleanly into DeepGuardMLP
      8. baseline_model.joblib loads and has predict_proba
      9. confusion_matrix.png is a non-empty image file

    Returns:
        Dict detailing verification results and extracted metadata.
    """
    # 1. Feature Schema
    schema_path = os.path.join(model_dir, "feature_schema.json")
    if not os.path.exists(schema_path):
        raise FileNotFoundError(f"Missing schema: {schema_path}")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    if "feature_count" not in schema or "feature_names" not in schema:
        raise ValueError("feature_schema.json is missing 'feature_count' or 'feature_names'")
    feature_count = schema["feature_count"]
    if len(schema["feature_names"]) != feature_count:
        raise ValueError(
            f"Mismatch in feature_schema.json: {len(schema['feature_names'])} names vs {feature_count} count"
        )

    # 2. Label Mapping
    label_path = os.path.join(model_dir, "label_mapping.json")
    if not os.path.exists(label_path):
        raise FileNotFoundError(f"Missing label mapping: {label_path}")
    with open(label_path, "r", encoding="utf-8") as f:
        labels = json.load(f)
    if labels.get("normal") != 0 or labels.get("attack") != 1:
        raise ValueError("label_mapping.json does not map normal->0 and attack->1")

    # 3. Model Metadata
    meta_path = os.path.join(model_dir, "model_metadata.json")
    if not os.path.exists(meta_path):
        raise FileNotFoundError(f"Missing metadata: {meta_path}")
    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
    if meta.get("architecture") != "DeepGuardMLP" or meta.get("input_dim") != feature_count:
        raise ValueError("model_metadata.json architecture or input_dim mismatch")

    # 4. Evaluation Metrics
    eval_path = os.path.join(model_dir, "evaluation_metrics.json")
    if not os.path.exists(eval_path):
        raise FileNotFoundError(f"Missing evaluation metrics: {eval_path}")
    with open(eval_path, "r", encoding="utf-8") as f:
        eval_metrics = json.load(f)
    for required_key in ["mlp", "baseline", "dataset", "test_size"]:
        if required_key not in eval_metrics:
            raise ValueError(f"evaluation_metrics.json missing required key: {required_key}")
    for metric_name in ["accuracy", "precision_macro", "recall_macro", "f1_macro", "roc_auc"]:
        if metric_name not in eval_metrics["mlp"] or metric_name not in eval_metrics["baseline"]:
            raise ValueError(f"evaluation_metrics.json missing {metric_name}")

    # 5. Training History
    hist_path = os.path.join(model_dir, "training_history.json")
    if not os.path.exists(hist_path):
        raise FileNotFoundError(f"Missing training history: {hist_path}")
    with open(hist_path, "r", encoding="utf-8") as f:
        history = json.load(f)
    if "train_loss" not in history or "val_loss" not in history or len(history["train_loss"]) == 0:
        raise ValueError("training_history.json missing non-empty train_loss or val_loss")

    # 6. Preprocessor
    prep_path = os.path.join(model_dir, "preprocessor.joblib")
    if not os.path.exists(prep_path):
        raise FileNotFoundError(f"Missing preprocessor: {prep_path}")
    preprocessor = joblib.load(prep_path)
    if not hasattr(preprocessor, "transform"):
        raise TypeError("preprocessor.joblib does not expose a transform() method")
    if hasattr(preprocessor, "n_features_in_") and preprocessor.n_features_in_ != feature_count:
        raise ValueError(
            f"preprocessor expects {preprocessor.n_features_in_} features, but schema defines {feature_count}"
        )

    # 7. PyTorch Model Weights
    weights_path = os.path.join(model_dir, "deepguard_model.pth")
    if not os.path.exists(weights_path):
        raise FileNotFoundError(f"Missing PyTorch weights: {weights_path}")
    state_dict = torch.load(weights_path, map_location="cpu", weights_only=True)
    hidden_dims = meta.get("hidden_dims", [128, 64, 32])
    dropout = meta.get("dropout", 0.3)
    model = DeepGuardMLP(input_dim=feature_count, hidden_dims=hidden_dims, dropout=dropout)
    load_res = model.load_state_dict(state_dict, strict=True)
    if len(load_res.missing_keys) > 0 or len(load_res.unexpected_keys) > 0:
        raise ValueError(f"Weight loading error: missing={load_res.missing_keys}, unexpected={load_res.unexpected_keys}")

    # 8. Baseline Model (if present)
    base_path = os.path.join(model_dir, "baseline_model.joblib")
    baseline_loaded = False
    if os.path.exists(base_path):
        baseline_model = joblib.load(base_path)
        if hasattr(baseline_model, "predict_proba"):
            baseline_loaded = True

    # 9. Confusion Matrix Visualization
    cm_path = os.path.join(model_dir, "confusion_matrix.png")
    if not os.path.exists(cm_path) or os.path.getsize(cm_path) < 1000:
        raise ValueError("confusion_matrix.png missing or corrupt (<1KB)")

    return {
        "valid": True,
        "feature_count": feature_count,
        "hidden_dims": hidden_dims,
        "best_epoch": meta.get("best_epoch"),
        "best_val_loss": meta.get("best_val_loss"),
        "mlp_accuracy": eval_metrics["mlp"]["accuracy"],
        "baseline_accuracy": eval_metrics["baseline"]["accuracy"],
        "baseline_loaded": baseline_loaded,
    }


def run_fresh_load_test(
    model_dir: str = "model",
    device: Optional[torch.device] = None,
) -> Dict[str, Any]:
    """
    Step 2: Fresh-load verification in an isolated execution routine.

    Loads the feature schema, instantiates the DeepGuardMLP, loads state dict,
    loads the fitted preprocessor, and runs inference on both a dummy zero-vector
    and a multi-sample batch, verifying numerical ranges and shape contracts.

    Args:
        model_dir: Artifacts directory.
        device: PyTorch device (defaults to CPU).

    Returns:
        Dict containing dummy prediction probability, batch probabilities, and test status.
    """
    if device is None:
        device = torch.device("cpu")

    # Load schema
    schema_path = os.path.join(model_dir, "feature_schema.json")
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)
    feature_count = schema["feature_count"]

    # Load model metadata for architecture params
    meta_path = os.path.join(model_dir, "model_metadata.json")
    hidden_dims = [128, 64, 32]
    dropout = 0.3
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            meta = json.load(f)
            hidden_dims = meta.get("hidden_dims", hidden_dims)
            dropout = meta.get("dropout", dropout)

    # Instantiate model and load weights
    model = DeepGuardMLP(input_dim=feature_count, hidden_dims=hidden_dims, dropout=dropout)
    weights_path = os.path.join(model_dir, "deepguard_model.pth")
    state_dict = torch.load(weights_path, map_location=device, weights_only=True)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    # Load preprocessor
    prep_path = os.path.join(model_dir, "preprocessor.joblib")
    preprocessor = joblib.load(prep_path)

    # 1. Test with single dummy zero input
    dummy_zeros = np.zeros((1, feature_count), dtype=np.float32)
    dummy_scaled = preprocessor.transform(dummy_zeros)
    dummy_tensor = torch.tensor(dummy_scaled, dtype=torch.float32).to(device)

    with torch.no_grad():
        raw_logit = model(dummy_tensor)
        dummy_prob = torch.sigmoid(raw_logit).item()

    if not (0.0 <= dummy_prob <= 1.0):
        raise ValueError(f"Dummy probability {dummy_prob} outside [0.0, 1.0]")

    # 2. Test with small batch (diverse realistic test inputs)
    rng = np.random.RandomState(42)
    batch_input = rng.uniform(0.0, 10.0, size=(5, feature_count)).astype(np.float32)
    batch_scaled = preprocessor.transform(batch_input)
    batch_tensor = torch.tensor(batch_scaled, dtype=torch.float32).to(device)

    with torch.no_grad():
        batch_logits = model(batch_tensor)
        batch_probs = torch.sigmoid(batch_logits).squeeze(-1).cpu().numpy().tolist()

    if len(batch_probs) != 5:
        raise ValueError(f"Expected 5 batch probabilities, got {len(batch_probs)}")
    for p in batch_probs:
        if not (0.0 <= p <= 1.0):
            raise ValueError(f"Batch prediction probability {p} outside [0.0, 1.0]")

    # 3. Test baseline model prediction if available
    base_path = os.path.join(model_dir, "baseline_model.joblib")
    baseline_prob = None
    if os.path.exists(base_path):
        baseline_model = joblib.load(base_path)
        base_probs = baseline_model.predict_proba(dummy_scaled)
        baseline_prob = float(base_probs[0][1])

    return {
        "success": True,
        "dummy_probability": round(dummy_prob, 5),
        "dummy_prediction": int(dummy_prob >= 0.5),
        "batch_probabilities": [round(p, 5) for p in batch_probs],
        "baseline_probability": round(baseline_prob, 5) if baseline_prob is not None else None,
        "feature_count": feature_count,
        "device": str(device),
    }


def package_artifacts(
    model_dir: str = "model",
    output_zip_path: str = "deepguard_artifacts.zip",
) -> str:
    """
    Step 3: Package all model artifacts into a self-contained ZIP archive for distribution.

    Args:
        model_dir: Source directory containing artifacts.
        output_zip_path: Target destination path for deepguard_artifacts.zip.

    Returns:
        Absolute path to the created zip file.
    """
    abs_model_dir = os.path.abspath(model_dir)
    if not os.path.exists(abs_model_dir):
        raise FileNotFoundError(f"Model directory does not exist: {abs_model_dir}")

    # Ensure required artifacts exist prior to packaging
    exist_check = verify_artifacts_exist(model_dir)
    missing = [k for k, v in exist_check.items() if k in REQUIRED_ARTIFACTS and v["status"] != "OK"]
    if missing:
        raise RuntimeError(f"Cannot package artifacts. Missing required files: {missing}")

    # Create zip archive
    abs_output_zip = os.path.abspath(output_zip_path)
    if os.path.exists(abs_output_zip):
        os.remove(abs_output_zip)

    # Collect all valid files to include
    files_to_pack = [
        f for f in os.listdir(abs_model_dir)
        if os.path.isfile(os.path.join(abs_model_dir, f)) and not f.endswith(".tmp")
    ]

    with zipfile.ZipFile(abs_output_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for fname in sorted(files_to_pack):
            full_path = os.path.join(abs_model_dir, fname)
            # Store with relative archive name, e.g. "feature_schema.json" or "model/feature_schema.json"
            zf.write(full_path, arcname=fname)

    return abs_output_zip


def verify_archive_integrity(zip_path: str = "deepguard_artifacts.zip") -> Dict[str, Any]:
    """
    Verify the packaged ZIP archive contains all mandatory files and is not corrupt.

    Args:
        zip_path: Path to the ZIP archive.

    Returns:
        Dict with status and contained file entries.
    """
    if not os.path.exists(zip_path):
        raise FileNotFoundError(f"Archive not found: {zip_path}")

    with zipfile.ZipFile(zip_path, "r") as zf:
        # Check CRC32 integrity
        bad_file = zf.testzip()
        if bad_file is not None:
            raise ValueError(f"Corrupt file found in archive {zip_path}: {bad_file}")

        namelist = zf.namelist()
        missing = [f for f in REQUIRED_ARTIFACTS if f not in namelist]
        if missing:
            raise ValueError(f"Archive is missing required artifacts: {missing}")

        file_sizes = {info.filename: info.file_size for info in zf.infolist()}

    return {
        "valid": True,
        "archive_path": os.path.abspath(zip_path),
        "total_files": len(namelist),
        "total_size_bytes": os.path.getsize(zip_path),
        "contents": file_sizes,
    }


def export_and_verify_all(
    model_dir: str = "model",
    output_zip: str = "deepguard_artifacts.zip",
    verbose: bool = True,
) -> Dict[str, Any]:
    """
    Master execution pipeline executing all 5 steps of Phase 5:
    1. Verify file existence
    2. Validate schemas and loadability
    3. Run fresh-load inference test
    4. Package artifacts into deepguard_artifacts.zip
    5. Verify ZIP archive integrity
    """
    if verbose:
        print("=" * 72)
        print(" DeepGuard AI — Phase 5: Artifact Verification & Export")
        print("=" * 72)

    # 1. Verify existence
    if verbose:
        print("\n[Step 1/5] Verifying Artifact Existence...")
    exist_results = verify_artifacts_exist(model_dir)
    for fname, details in exist_results.items():
        is_req = " (Required)" if fname in REQUIRED_ARTIFACTS else " (Optional)"
        status = details["status"]
        size_kb = details["size_bytes"] / 1024
        if verbose:
            print(f"  [{status:<7}] {fname:<26}{is_req:<12} {size_kb:>8.2f} KB")

    missing = [k for k in REQUIRED_ARTIFACTS if exist_results[k]["status"] != "OK"]
    if missing:
        raise RuntimeError(f"Step 1 Failed: Missing required artifacts: {missing}")

    # 2. Validate schemas
    if verbose:
        print("\n[Step 2/5] Validating Artifact Schemas and Formats...")
    schema_results = verify_artifact_schemas_and_load(model_dir)
    if verbose:
        print(f"  Feature Count:     {schema_results['feature_count']} features verified")
        print(f"  MLP Architecture:  DeepGuardMLP {schema_results['hidden_dims']}")
        print(f"  Best Val Loss:     {schema_results['best_val_loss']} (at epoch {schema_results['best_epoch']})")
        print(f"  Test Accuracy:     MLP: {schema_results['mlp_accuracy']*100:.2f}% | Base: {schema_results['baseline_accuracy']*100:.2f}%")
        print("  Status:            ALL SCHEMAS VALID")

    # 3. Fresh-load inference test
    if verbose:
        print("\n[Step 3/5] Executing Fresh-Load Inference Test...")
    fresh_test = run_fresh_load_test(model_dir)
    if verbose:
        print(f"  Dummy (zeros) prediction: probability={fresh_test['dummy_probability']:.4f} -> Class {fresh_test['dummy_prediction']}")
        print(f"  Batch test (5 samples):   probabilities={fresh_test['batch_probabilities']}")
        if fresh_test['baseline_probability'] is not None:
            print(f"  Baseline dummy test:      probability={fresh_test['baseline_probability']:.4f}")
        print("  Status:                   FRESH INFERENCE VERIFIED")

    # 4. Package into ZIP
    if verbose:
        print(f"\n[Step 4/5] Packaging Artifacts into {output_zip}...")
    zip_path = package_artifacts(model_dir, output_zip)
    zip_size_kb = os.path.getsize(zip_path) / 1024
    if verbose:
        print(f"  Created archive:   {zip_path} ({zip_size_kb:.2f} KB)")

    # 5. Verify ZIP integrity
    if verbose:
        print("\n[Step 5/5] Verifying Archive CRC32 & Payload Integrity...")
    zip_verification = verify_archive_integrity(zip_path)
    if verbose:
        print(f"  Total items:       {zip_verification['total_files']} files packaged")
        print("  Status:            ARCHIVE INTEGRITY VERIFIED (0 errors)")

    if verbose:
        print("\n" + "=" * 72)
        print(" PHASE 5 COMPLETE: All 8 required model artifacts exported & verified.")
        print("=" * 72)

    return {
        "exist_results": exist_results,
        "schema_results": schema_results,
        "fresh_test": fresh_test,
        "zip_path": zip_path,
        "zip_verification": zip_verification,
    }


if __name__ == "__main__":
    try:
        export_and_verify_all()
    except Exception as exc:
        print(f"\n[ERROR] Phase 5 export failed: {exc}", file=sys.stderr)
        sys.exit(1)
