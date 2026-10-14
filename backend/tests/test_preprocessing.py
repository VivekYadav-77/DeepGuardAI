"""
Unit tests for DeepGuard AI preprocessing pipeline.
Verifies scaler, schema, label mapping, and end-to-end data transformation.
"""

import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import joblib
import numpy as np
import pandas as pd
import pytest
from sklearn.preprocessing import StandardScaler

from src.preprocessing import (
    DeepGuardPreprocessor,
    get_column_names,
    get_feature_names,
    prepare_labels,
    clean_features,
    split_data,
    FEATURE_NAMES,
    TARGET_COLUMN,
    DROP_COLUMNS,
)


MODEL_DIR = "model"
SCALER_PATH = os.path.join(MODEL_DIR, "preprocessor.joblib")
SCHEMA_PATH = os.path.join(MODEL_DIR, "feature_schema.json")
LABEL_MAP_PATH = os.path.join(MODEL_DIR, "label_mapping.json")


def test_scaler_loads():
    """Verify that preprocessor.joblib exists and can be loaded via joblib."""
    assert os.path.exists(SCALER_PATH), f"Scaler file not found at {SCALER_PATH}"
    scaler = joblib.load(SCALER_PATH)
    assert isinstance(scaler, StandardScaler), "Loaded artifact is not a StandardScaler"


def test_schema_loads():
    """Verify that feature_schema.json is valid JSON with required keys."""
    assert os.path.exists(SCHEMA_PATH), f"Schema file not found at {SCHEMA_PATH}"
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    expected_keys = [
        "feature_names",
        "feature_count",
        "target_column",
        "drop_columns",
        "categorical_columns",
        "numerical_columns",
    ]
    for key in expected_keys:
        assert key in schema, f"Missing required key in schema: '{key}'"

    assert schema["feature_count"] == 41
    assert len(schema["feature_names"]) == 41
    assert schema["target_column"] == TARGET_COLUMN
    assert schema["drop_columns"] == DROP_COLUMNS


def test_label_mapping_loads():
    """Verify that label_mapping.json loads and maps normal to 0 and attack to 1."""
    assert os.path.exists(LABEL_MAP_PATH), f"Label map not found at {LABEL_MAP_PATH}"
    with open(LABEL_MAP_PATH, "r", encoding="utf-8") as f:
        mapping = json.load(f)

    assert "normal" in mapping
    assert "attack" in mapping
    assert mapping["normal"] == 0
    assert mapping["attack"] == 1


def test_feature_count_matches():
    """Verify feature count in schema matches scaler's n_features_in_."""
    scaler = joblib.load(SCALER_PATH)
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema = json.load(f)

    assert hasattr(scaler, "n_features_in_"), "Scaler has no n_features_in_ attribute"
    assert scaler.n_features_in_ == schema["feature_count"], (
        f"Scaler features ({scaler.n_features_in_}) != Schema features ({schema['feature_count']})"
    )


def test_scaler_output_shape():
    """Verify scaler transforms a dummy array of 41 features to exact (N, 41) shape."""
    scaler = joblib.load(SCALER_PATH)
    dummy_input = np.random.randn(10, 41)
    transformed = scaler.transform(dummy_input)

    assert transformed.shape == (10, 41), f"Unexpected transformed shape: {transformed.shape}"


def test_no_nan_in_output():
    """Verify scaler output contains no NaN or Inf values."""
    scaler = joblib.load(SCALER_PATH)
    dummy_input = np.zeros((5, 41))
    transformed = scaler.transform(dummy_input)

    assert not np.isnan(transformed).any(), "NaN found in transformed output"
    assert not np.isinf(transformed).any(), "Inf found in transformed output"


def test_prepare_labels_function():
    """Verify prepare_labels maps normal to 0 and all attacks to 1."""
    sample_labels = ["normal", "normal.", "neptune", "smurf", "satan", "Normal", "ipsweep"]
    binary_y = prepare_labels(sample_labels)

    expected = np.array([0, 0, 1, 1, 1, 0, 1])
    np.testing.assert_array_equal(binary_y, expected)


def test_preprocessor_class_with_unseen_categories():
    """Verify DeepGuardPreprocessor handles unseen categories gracefully without raising errors."""
    preprocessor = DeepGuardPreprocessor.load(MODEL_DIR)

    # Create dummy row with unseen protocol or service
    dummy_row = {col: 0.0 for col in FEATURE_NAMES}
    dummy_row["protocol_type"] = "novel_protocol"  # Unseen category
    dummy_row["service"] = "unknown_service"        # Unseen category
    dummy_row["flag"] = "SF"

    transformed = preprocessor.transform(dummy_row)
    assert transformed.shape == (1, 41)
    assert not np.isnan(transformed).any()
    assert not np.isinf(transformed).any()


def test_split_data_proportions():
    """Verify stratified split produces 70/15/15 distribution."""
    N = 1000
    dummy_X = np.random.randn(N, 41)
    dummy_y = np.array([0] * 500 + [1] * 500)

    X_train, X_val, X_test, y_train, y_val, y_test = split_data(
        dummy_X, dummy_y, test_size=0.15, val_size=0.15, random_state=42
    )

    assert len(X_train) == 700
    assert len(X_val) == 150
    assert len(X_test) == 150
    assert len(y_train) == 700
    assert len(y_val) == 150
    assert len(y_test) == 150

    # Check stratification (should be ~50/50 in each split)
    assert np.isclose(y_train.mean(), 0.5, atol=0.02)
    assert np.isclose(y_val.mean(), 0.5, atol=0.02)
    assert np.isclose(y_test.mean(), 0.5, atol=0.02)
