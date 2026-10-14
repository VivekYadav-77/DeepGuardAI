"""
DeepGuard AI — Phase 5 Unit Tests: Artifact Verification & Export
Validates that all serialized model artifacts are non-corrupt, adhere to schema,
and are ready for deployment and fresh-environment inference.
"""

import json
import os
import tempfile
import zipfile
import pytest
import numpy as np
import joblib
import torch

from src.model import DeepGuardMLP
from src.export import (
    REQUIRED_ARTIFACTS,
    verify_artifacts_exist,
    verify_artifact_schemas_and_load,
    run_fresh_load_test,
    package_artifacts,
    verify_archive_integrity,
)


def test_required_artifacts_exist():
    """Verify that all 8 mandatory artifacts exist and have non-zero file sizes."""
    results = verify_artifacts_exist("model")
    for artifact in REQUIRED_ARTIFACTS:
        assert artifact in results, f"Artifact {artifact} not found in verification report"
        assert results[artifact]["exists"] is True, f"Artifact {artifact} does not exist on disk"
        assert results[artifact]["status"] == "OK", f"Artifact {artifact} has status {results[artifact]['status']}"
        assert results[artifact]["size_bytes"] > 0, f"Artifact {artifact} is empty (0 bytes)"


def test_feature_schema_artifact():
    """Verify feature_schema.json structure, feature count, and column types."""
    schema_path = "model/feature_schema.json"
    assert os.path.exists(schema_path)

    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    assert "feature_count" in schema
    assert schema["feature_count"] == 41
    assert "feature_names" in schema
    assert len(schema["feature_names"]) == 41

    assert "categorical_columns" in schema
    assert set(schema["categorical_columns"]) == {"protocol_type", "service", "flag"}

    assert "numerical_columns" in schema
    assert len(schema["numerical_columns"]) == 38
    assert len(schema["categorical_columns"]) + len(schema["numerical_columns"]) == 41


def test_label_mapping_artifact():
    """Verify label_mapping.json defines binary classes 0=normal and 1=attack."""
    mapping_path = "model/label_mapping.json"
    assert os.path.exists(mapping_path)

    with open(mapping_path, "r", encoding="utf-8") as f:
        labels = json.load(f)

    assert labels.get("normal") == 0
    assert labels.get("attack") == 1


def test_model_metadata_artifact():
    """Verify model_metadata.json captures architecture and training hyperparameters."""
    meta_path = "model/model_metadata.json"
    assert os.path.exists(meta_path)

    with open(meta_path, "r", encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["architecture"] == "DeepGuardMLP"
    assert meta["input_dim"] == 41
    assert meta["hidden_dims"] == [128, 64, 32]
    assert 0.0 <= meta["dropout"] <= 1.0
    assert meta["optimizer"] == "Adam"
    assert meta["epochs_trained"] > 0
    assert meta["best_epoch"] > 0
    assert meta["best_val_loss"] > 0.0


def test_evaluation_metrics_artifact():
    """Verify evaluation_metrics.json has real, consistent metrics for MLP and baseline."""
    eval_path = "model/evaluation_metrics.json"
    assert os.path.exists(eval_path)

    with open(eval_path, "r", encoding="utf-8") as f:
        metrics = json.load(f)

    assert "mlp" in metrics
    assert "baseline" in metrics
    assert metrics["dataset"] == "NSL-KDD"
    assert metrics["test_size"] == 18896

    # Verify MLP metrics
    mlp = metrics["mlp"]
    assert mlp["accuracy"] >= 0.95
    assert mlp["f1_macro"] >= 0.95
    assert mlp["roc_auc"] >= 0.99
    assert len(mlp["confusion_matrix"]) == 2
    assert len(mlp["confusion_matrix"][0]) == 2
    assert "per_class" in mlp
    assert "benign" in mlp["per_class"] and "attack" in mlp["per_class"]

    # Verify Baseline metrics
    base = metrics["baseline"]
    assert base["accuracy"] >= 0.90
    assert base["f1_macro"] >= 0.90
    assert base["roc_auc"] >= 0.95


def test_training_history_artifact():
    """Verify training_history.json tracks per-epoch losses."""
    hist_path = "model/training_history.json"
    assert os.path.exists(hist_path)

    with open(hist_path, "r", encoding="utf-8") as f:
        hist = json.load(f)

    assert "train_loss" in hist
    assert "val_loss" in hist
    assert len(hist["train_loss"]) > 0
    assert len(hist["train_loss"]) == len(hist["val_loss"])
    assert all(isinstance(x, (int, float)) for x in hist["train_loss"])
    assert all(isinstance(x, (int, float)) for x in hist["val_loss"])


def test_preprocessor_artifact():
    """Verify preprocessor.joblib can be unpickled and correctly transforms 41-feature inputs."""
    prep_path = "model/preprocessor.joblib"
    assert os.path.exists(prep_path)

    preprocessor = joblib.load(prep_path)
    assert hasattr(preprocessor, "transform")
    assert getattr(preprocessor, "n_features_in_", 41) == 41

    dummy = np.zeros((2, 41), dtype=np.float32)
    transformed = preprocessor.transform(dummy)
    assert transformed.shape == (2, 41)
    assert not np.isnan(transformed).any()


def test_pytorch_weights_artifact():
    """Verify deepguard_model.pth loads into DeepGuardMLP without missing or unexpected keys."""
    weights_path = "model/deepguard_model.pth"
    assert os.path.exists(weights_path)

    model = DeepGuardMLP(input_dim=41, hidden_dims=[128, 64, 32], dropout=0.3)
    state_dict = torch.load(weights_path, map_location="cpu", weights_only=True)
    load_result = model.load_state_dict(state_dict, strict=True)

    assert len(load_result.missing_keys) == 0
    assert len(load_result.unexpected_keys) == 0

    model.eval()
    dummy_input = torch.zeros((1, 41), dtype=torch.float32)
    with torch.no_grad():
        out = model(dummy_input)
    assert out.shape == (1, 1)


def test_fresh_load_inference_routine():
    """Verify run_fresh_load_test executes successfully and returns valid probabilities."""
    res = run_fresh_load_test("model")
    assert res["success"] is True
    assert 0.0 <= res["dummy_probability"] <= 1.0
    assert res["dummy_prediction"] in (0, 1)
    assert len(res["batch_probabilities"]) == 5
    for p in res["batch_probabilities"]:
        assert 0.0 <= p <= 1.0


def test_artifacts_zip_package_and_extraction(tmp_path):
    """Verify zip archive creation, CRC integrity, and extraction into a temporary folder."""
    zip_dest = str(tmp_path / "test_deepguard_artifacts.zip")
    packaged_path = package_artifacts("model", zip_dest)
    assert os.path.exists(packaged_path)

    # Verify integrity
    integrity = verify_archive_integrity(packaged_path)
    assert integrity["valid"] is True
    assert integrity["total_files"] >= 8

    # Extract to fresh temp dir and test file contents
    extract_dir = tmp_path / "extracted"
    os.makedirs(extract_dir, exist_ok=True)
    with zipfile.ZipFile(packaged_path, "r") as zf:
        zf.extractall(extract_dir)

    for artifact in REQUIRED_ARTIFACTS:
        extracted_file = extract_dir / artifact
        assert extracted_file.exists(), f"Extracted file {artifact} does not exist"
        assert extracted_file.stat().st_size > 0, f"Extracted file {artifact} is empty"
