"""
DeepGuard AI — Validation Unit Tests
===================================
Tests for Phase 7 & 9 CSV Input Validation against the NSL-KDD Feature Schema.
"""

import numpy as np
import pandas as pd
import pytest

from src.preprocessing import FEATURE_NAMES
from src.validation import TrafficValidator


@pytest.fixture
def sample_valid_df():
    """Generates a DataFrame with all 41 required NSL-KDD feature columns."""
    data = {col: [0.0, 1.0] for col in FEATURE_NAMES}
    data["protocol_type"] = ["tcp", "udp"]
    data["service"] = ["http", "private"]
    data["flag"] = ["SF", "S0"]
    return pd.DataFrame(data)


def test_valid_csv_passes(sample_valid_df):
    """Verify that a correctly formatted CSV with 41 features passes validation."""
    validator = TrafficValidator()
    is_valid, cleaned_df, errors, warnings = validator.validate_dataframe(sample_valid_df)

    assert is_valid is True
    assert len(errors) == 0
    assert len(cleaned_df) == 2
    assert list(cleaned_df.columns) == FEATURE_NAMES


def test_missing_columns_rejected(sample_valid_df):
    """Verify that missing required columns return validation failure and error message."""
    validator = TrafficValidator()
    incomplete_df = sample_valid_df.drop(columns=["duration", "src_bytes", "service"])
    is_valid, _, errors, _ = validator.validate_dataframe(incomplete_df)

    assert is_valid is False
    assert len(errors) > 0
    assert "Missing" in errors[0]
    assert "duration" in errors[0] or "src_bytes" in errors[0]


def test_empty_csv_rejected():
    """Verify that an empty CSV with 0 rows is rejected with a clear message."""
    validator = TrafficValidator()
    empty_df = pd.DataFrame(columns=FEATURE_NAMES)
    is_valid, _, errors, _ = validator.validate_dataframe(empty_df)

    assert is_valid is False
    assert len(errors) > 0
    assert "empty" in errors[0].lower()


def test_extra_columns_handled(sample_valid_df):
    """Verify that extra columns do not crash the pipeline and are ignored."""
    validator = TrafficValidator()
    df_with_extra = sample_valid_df.copy()
    df_with_extra["unwanted_column_1"] = [999, 888]
    df_with_extra["attacker_ip"] = ["192.168.1.1", "10.0.0.1"]

    is_valid, cleaned_df, errors, warnings = validator.validate_dataframe(df_with_extra)

    assert is_valid is True
    assert "unwanted_column_1" not in cleaned_df.columns
    assert "attacker_ip" not in cleaned_df.columns
    assert list(cleaned_df.columns) == FEATURE_NAMES
    assert any("extra column" in w.lower() for w in warnings)


def test_target_column_excluded(sample_valid_df):
    """Verify that accidental ground truth labels (label, difficulty_level) are stripped."""
    validator = TrafficValidator()
    df_with_labels = sample_valid_df.copy()
    df_with_labels["label"] = ["normal", "neptune"]
    df_with_labels["difficulty_level"] = [21, 15]

    is_valid, cleaned_df, errors, warnings = validator.validate_dataframe(df_with_labels)

    assert is_valid is True
    assert "label" not in cleaned_df.columns
    assert "difficulty_level" not in cleaned_df.columns
    assert list(cleaned_df.columns) == FEATURE_NAMES
    assert any("label" in w.lower() for w in warnings)


def test_max_rows_enforced(sample_valid_df):
    """Verify that rows exceeding limit are truncated with a warning."""
    validator = TrafficValidator()
    # Repeat the 2 rows to 50,005 rows
    large_df = pd.concat([sample_valid_df] * 25003, ignore_index=True)
    assert len(large_df) > 50000

    is_valid, cleaned_df, errors, warnings = validator.validate_dataframe(large_df, max_rows=50000)

    assert is_valid is True
    assert len(cleaned_df) == 50000
    assert any("truncated" in w.lower() for w in warnings)
