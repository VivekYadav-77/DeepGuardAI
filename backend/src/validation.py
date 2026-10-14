"""
DeepGuard AI — Validation Module
================================
Implementation of Phase 7 CSV Input Validation against the NSL-KDD Feature Schema.

Guarantees:
- Enforces presence of all 41 required features
- Rejects empty CSV uploads gracefully
- Handles and drops accidental target columns (e.g. 'label', 'difficulty_level')
- Gracefully ignores unrecognized extra columns
- Enforces 50,000 maximum row limit with truncation and explicit user warnings
- Preserves exact feature schema order
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional, Tuple, Union

import pandas as pd


DEFAULT_MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model")
MAX_ALLOWED_RECORDS = 50000


class TrafficValidationError(Exception):
    """Raised when CSV validation fails critically."""
    pass


class TrafficValidator:
    """
    Validates uploaded network traffic CSV records against the DeepGuard AI
    NSL-KDD feature schema.
    """

    def __init__(self, schema_path_or_dict: Optional[Union[str, Dict[str, Any]]] = None) -> None:
        """
        Initialize the validator with feature schema metadata.

        Args:
            schema_path_or_dict: Path to feature_schema.json or pre-loaded dictionary.
        """
        if schema_path_or_dict is None:
            schema_path_or_dict = os.path.join(DEFAULT_MODEL_DIR, "feature_schema.json")

        if isinstance(schema_path_or_dict, str):
            if not os.path.exists(schema_path_or_dict):
                raise FileNotFoundError(f"Feature schema not found at: {schema_path_or_dict}")
            with open(schema_path_or_dict, "r", encoding="utf-8") as f:
                self.schema: Dict[str, Any] = json.load(f)
        elif isinstance(schema_path_or_dict, dict):
            self.schema = schema_path_or_dict
        else:
            raise TypeError("schema_path_or_dict must be a file path string or dictionary")

        self.required_features: List[str] = list(self.schema.get("feature_names", []))
        self.feature_count: int = int(self.schema.get("feature_count", len(self.required_features)))
        self.categorical_columns: List[str] = list(self.schema.get("categorical_columns", []))
        self.numerical_columns: List[str] = list(self.schema.get("numerical_columns", []))

        # Known label/target columns that should be cleanly stripped if accidentally included
        self.target_columns_to_strip: List[str] = [
            "label",
            "target",
            "class",
            "attack",
            "difficulty_level",
            "difficulty",
        ]

    def validate_dataframe(
        self,
        df: pd.DataFrame,
        max_rows: int = MAX_ALLOWED_RECORDS,
    ) -> Tuple[bool, pd.DataFrame, List[str], List[str]]:
        """
        Validates an incoming pandas DataFrame against the NSL-KDD schema.

        Args:
            df: Input traffic records DataFrame.
            max_rows: Maximum records allowed before truncation (default 50,000).

        Returns:
            Tuple: (is_valid, cleaned_df, error_messages, warning_messages)
        """
        errors: List[str] = []
        warnings: List[str] = []

        if df is None or not isinstance(df, pd.DataFrame):
            return False, pd.DataFrame(), ["Input must be a valid pandas DataFrame."], []

        # 1. Empty CSV check
        if len(df) == 0:
            return False, df, ["CSV is empty (contains 0 records). Please upload a valid dataset."], []

        working_df = df.copy()

        # 2. Check and exclude target / difficulty leakage columns
        detected_target_cols = [
            col for col in working_df.columns if col.strip().lower() in self.target_columns_to_strip
        ]
        for col in detected_target_cols:
            working_df = working_df.drop(columns=[col])
            warnings.append(
                f"Target/ground-truth column '{col}' was detected and automatically excluded from feature space."
            )

        # Normalize column names (strip whitespace)
        working_df.columns = [str(c).strip() for c in working_df.columns]

        # 3. Check for missing required features
        existing_cols = set(working_df.columns)
        missing_features = [col for col in self.required_features if col not in existing_cols]

        if missing_features:
            sample_missing = missing_features[:8]
            count_more = len(missing_features) - len(sample_missing)
            more_str = f" and {count_more} more" if count_more > 0 else ""
            err_msg = (
                f"Missing {len(missing_features)} required feature column(s): "
                f"{', '.join(sample_missing)}{more_str}. Required: 41 NSL-KDD features."
            )
            return False, working_df, [err_msg], warnings

        # 4. Check for extra unneeded columns
        extra_cols = [col for col in working_df.columns if col not in self.required_features]
        if extra_cols:
            warnings.append(
                f"Uploaded file contains {len(extra_cols)} extra column(s) not in schema "
                f"({', '.join(extra_cols[:5])}{'...' if len(extra_cols) > 5 else ''}). "
                "These will be ignored during inference."
            )

        # 5. Check row limit and truncate if necessary
        initial_row_count = len(working_df)
        if initial_row_count > max_rows:
            working_df = working_df.iloc[:max_rows].copy()
            warnings.append(
                f"Uploaded dataset contains {initial_row_count:,} rows, exceeding the limit of "
                f"{max_rows:,}. Truncated to the first {max_rows:,} records."
            )

        # 6. Re-order DataFrame columns strictly according to feature_schema.json
        working_df = working_df[self.required_features].copy()

        return True, working_df, errors, warnings


def validate_csv(
    file_or_path: Union[str, Any],
    max_rows: int = MAX_ALLOWED_RECORDS,
    schema_path: Optional[str] = None,
) -> Tuple[bool, pd.DataFrame, List[str], List[str]]:
    """
    Convenience function to parse and validate a CSV file (filepath or file buffer).

    Args:
        file_or_path: Path string or uploaded file object (e.g. io.BytesIO, StringIO).
        max_rows: Row limit.
        schema_path: Path to schema JSON.

    Returns:
        Tuple: (is_valid, cleaned_df, error_messages, warning_messages)
    """
    try:
        if isinstance(file_or_path, str):
            if not os.path.exists(file_or_path):
                return False, pd.DataFrame(), [f"File not found: {file_or_path}"], []
            df = pd.read_csv(file_or_path)
        else:
            df = pd.read_csv(file_or_path)
    except Exception as e:
        return False, pd.DataFrame(), [f"Failed to parse CSV file: {str(e)}"], []

    validator = TrafficValidator(schema_path_or_dict=schema_path)
    return validator.validate_dataframe(df, max_rows=max_rows)
