"""
DeepGuard AI — Preprocessing Module
===================================
Implementation of Phase 2 Preprocessing Pipeline for Network Intrusion Detection.
Dataset: NSL-KDD (UNB Canadian Institute for Cybersecurity)

Features:
- NSL-KDD schema definition (41 traffic features, 1 target label, 1 difficulty score)
- Clean mapping of multi-class attack categories to binary: Benign (0) vs Attack (1)
- Feature cleaning, target leakage elimination (drops difficulty_level)
- Handling of missing values and infinite values
- Graceful handling and encoding of categorical features (protocol_type, service, flag)
- Standard scaling with StandardScaler (fit on train split only)
- Stratified Train / Validation / Test data splitting
- Serializing and loading preprocessing artifacts (preprocessor.joblib, feature_schema.json, label_mapping.json)
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List, Optional, Tuple, Union

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# Standard 43 column names for the NSL-KDD dataset
NSL_KDD_COLUMNS: List[str] = [
    "duration",
    "protocol_type",
    "service",
    "flag",
    "src_bytes",
    "dst_bytes",
    "land",
    "wrong_fragment",
    "urgent",
    "hot",
    "num_failed_logins",
    "logged_in",
    "num_compromised",
    "root_shell",
    "su_attempted",
    "num_root",
    "num_file_creations",
    "num_shells",
    "num_access_files",
    "num_outbound_cmds",
    "is_host_login",
    "is_guest_login",
    "count",
    "srv_count",
    "serror_rate",
    "srv_serror_rate",
    "rerror_rate",
    "srv_rerror_rate",
    "same_srv_rate",
    "diff_srv_rate",
    "srv_diff_host_rate",
    "dst_host_count",
    "dst_host_srv_count",
    "dst_host_same_srv_rate",
    "dst_host_diff_srv_rate",
    "dst_host_same_src_port_rate",
    "dst_host_srv_diff_host_rate",
    "dst_host_serror_rate",
    "dst_host_srv_serror_rate",
    "dst_host_rerror_rate",
    "dst_host_srv_rerror_rate",
    "label",
    "difficulty_level",
]

# 41 traffic features input to the neural network
FEATURE_NAMES: List[str] = NSL_KDD_COLUMNS[:41]

# 3 Categorical features in NSL-KDD
CATEGORICAL_FEATURES: List[str] = ["protocol_type", "service", "flag"]

# 38 Numerical features in NSL-KDD
NUMERICAL_FEATURES: List[str] = [
    col for col in FEATURE_NAMES if col not in CATEGORICAL_FEATURES
]

# Target column name
TARGET_COLUMN: str = "label"

# Metadata / leakage column to be dropped from feature space
DROP_COLUMNS: List[str] = ["difficulty_level"]

# Label mapping definitions
LABEL_MAPPING: Dict[str, Any] = {
    "normal": 0,
    "attack": 1,
    "mapping_description": "0 = Benign/Normal, 1 = Attack/Malicious",
}


def get_feature_names() -> List[str]:
    """Return the list of 41 model input feature names."""
    return list(FEATURE_NAMES)


def get_column_names() -> List[str]:
    """Return all 43 raw NSL-KDD column names."""
    return list(NSL_KDD_COLUMNS)


def load_dataset(
    filepath_or_url: str,
    has_header: bool = False,
    nrows: Optional[int] = None,
) -> pd.DataFrame:
    """
    Load NSL-KDD dataset from local path or URL.

    Args:
        filepath_or_url: Path or URL to the dataset file (CSV or TXT).
        has_header: Whether the source file already contains column headers.
        nrows: Optional limit on rows to read (useful for rapid testing).

    Returns:
        pd.DataFrame containing the dataset with proper column headers.
    """
    names = None if has_header else NSL_KDD_COLUMNS
    header = 0 if has_header else None

    df = pd.read_csv(
        filepath_or_url,
        header=header,
        names=names,
        nrows=nrows,
        sep=",",
        skipinitialspace=True,
    )
    return df


def inspect_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Step 1: Inspect dataset statistics and data hygiene.

    Args:
        df: Input DataFrame.

    Returns:
        Dictionary containing shape, missing values, duplicates, and distributions.
    """
    missing_counts = df.isnull().sum().to_dict()
    duplicate_count = int(df.duplicated().sum())

    label_distribution = {}
    if TARGET_COLUMN in df.columns:
        label_distribution = df[TARGET_COLUMN].value_counts().to_dict()

    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    num_summary = {}
    if num_cols:
        summary_df = df[num_cols].agg(["min", "mean", "max"]).T
        num_summary = summary_df.to_dict(orient="index")

    return {
        "shape": list(df.shape),
        "columns": list(df.columns),
        "dtypes": {k: str(v) for k, v in df.dtypes.to_dict().items()},
        "missing_counts": missing_counts,
        "total_missing": int(sum(missing_counts.values())),
        "duplicate_count": duplicate_count,
        "label_distribution": label_distribution,
        "numerical_summary": num_summary,
    }


def prepare_labels(labels: Union[pd.Series, np.ndarray, List[Any]]) -> np.ndarray:
    """
    Step 2: Label Preparation.
    Maps benign ('normal' or 'normal.') to 0, and all other attack classes to 1.

    Args:
        labels: Iterable of label strings.

    Returns:
        np.ndarray of binary integers (0 or 1).
    """
    if isinstance(labels, list):
        labels = pd.Series(labels)
    elif isinstance(labels, np.ndarray):
        labels = pd.Series(labels)

    cleaned_labels = labels.astype(str).str.strip().str.lower().str.rstrip(".")
    binary_labels = (cleaned_labels != "normal").astype(int).values
    return binary_labels


def clean_features(
    df: pd.DataFrame,
    drop_columns: Optional[List[str]] = None,
) -> pd.DataFrame:
    """
    Step 3 & 4: Drop metadata/leakage columns, handle infinite values.

    Args:
        df: Input raw DataFrame.
        drop_columns: Additional columns to drop beyond standard DROP_COLUMNS.

    Returns:
        Cleaned DataFrame with leakage columns dropped and infs replaced with NaN.
    """
    to_drop = list(DROP_COLUMNS)
    if drop_columns:
        for c in drop_columns:
            if c not in to_drop:
                to_drop.append(c)

    existing_drop = [c for c in to_drop if c in df.columns]
    cleaned = df.drop(columns=existing_drop)

    # Replace infinite values with NaN for robust imputation
    cleaned = cleaned.replace([np.inf, -np.inf], np.nan)
    return cleaned


def split_data(
    X: Union[pd.DataFrame, np.ndarray],
    y: Union[pd.Series, np.ndarray],
    test_size: float = 0.15,
    val_size: float = 0.15,
    random_state: int = 42,
) -> Tuple[
    Union[pd.DataFrame, np.ndarray],
    Union[pd.DataFrame, np.ndarray],
    Union[pd.DataFrame, np.ndarray],
    np.ndarray,
    np.ndarray,
    np.ndarray,
]:
    """
    Step 5: Stratified Train / Validation / Test split.
    Default: 70% Train, 15% Validation, 15% Test.

    Args:
        X: Feature dataset.
        y: Binary target labels.
        test_size: Fraction of data for test set (default 0.15).
        val_size: Fraction of data for validation set (default 0.15).
        random_state: Seed for reproducibility (42).

    Returns:
        (X_train, X_val, X_test, y_train, y_val, y_test)
    """
    # First split off the test set
    X_temp, X_test, y_temp, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y,
    )

    # Calculate validation proportion relative to remaining data
    relative_val_size = val_size / (1.0 - test_size)
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp,
        y_temp,
        test_size=relative_val_size,
        random_state=random_state,
        stratify=y_temp,
    )

    return X_train, X_val, X_test, np.array(y_train), np.array(y_val), np.array(y_test)


class DeepGuardPreprocessor:
    """
    End-to-end Preprocessor for DeepGuard AI.
    Handles categorical encoding, missing value imputation, and feature scaling.
    Fitted strictly on training data only to prevent data leakage.
    """

    def __init__(
        self,
        feature_names: Optional[List[str]] = None,
        categorical_features: Optional[List[str]] = None,
        numerical_features: Optional[List[str]] = None,
    ):
        self.feature_names = feature_names or list(FEATURE_NAMES)
        self.categorical_features = categorical_features or list(CATEGORICAL_FEATURES)
        self.numerical_features = numerical_features or [
            col for col in self.feature_names if col not in self.categorical_features
        ]
        self.scaler = StandardScaler()
        self.category_mappings: Dict[str, Dict[str, int]] = {}
        self.numerical_medians: Dict[str, float] = {}
        self.categorical_modes: Dict[str, str] = {}
        self.is_fitted: bool = False

    def _prepare_dataframe(self, X: Union[pd.DataFrame, np.ndarray, Dict[str, Any]]) -> pd.DataFrame:
        """Standardize input into a DataFrame matching expected feature columns."""
        if isinstance(X, dict):
            df = pd.DataFrame([X])
        elif isinstance(X, np.ndarray):
            if X.shape[1] != len(self.feature_names):
                raise ValueError(
                    f"Expected input with {len(self.feature_names)} features, got {X.shape[1]}"
                )
            df = pd.DataFrame(X, columns=self.feature_names)
        elif isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            raise TypeError(f"Unsupported input type: {type(X)}")

        # Ensure all required features are present
        for col in self.feature_names:
            if col not in df.columns:
                raise ValueError(f"Missing required feature column: '{col}'")

        # Select only expected features in the canonical order
        df = df[self.feature_names].copy()
        df = df.replace([np.inf, -np.inf], np.nan)
        return df

    def fit(self, X: Union[pd.DataFrame, np.ndarray]) -> "DeepGuardPreprocessor":
        """
        Fit categorical encoders and numerical scaler on training features ONLY.

        Args:
            X: Training feature matrix.

        Returns:
            Fitted DeepGuardPreprocessor instance.
        """
        df = self._prepare_dataframe(X)

        # 1. Compute numerical medians
        for col in self.numerical_features:
            median_val = float(pd.to_numeric(df[col], errors="coerce").median())
            if np.isnan(median_val):
                median_val = 0.0
            self.numerical_medians[col] = median_val

        # 2. Compute categorical modes and mappings
        self.category_mappings = {}
        self.categorical_modes = {}
        for col in self.categorical_features:
            series_clean = df[col].dropna().astype(str).str.strip().str.lower()
            mode_val = series_clean.mode().iloc[0] if not series_clean.empty else "unknown"
            self.categorical_modes[col] = mode_val

            unique_categories = sorted(series_clean.unique().tolist())
            mapping = {cat: idx for idx, cat in enumerate(unique_categories)}
            # Fallback code for unknown/unseen categories during test/inference
            mapping["__unknown__"] = len(unique_categories)
            self.category_mappings[col] = mapping

        # 3. Transform to numeric array for fitting the scaler
        transformed_numeric = self._encode_and_impute(df)

        # 4. Fit StandardScaler
        self.scaler.fit(transformed_numeric)
        self.is_fitted = True
        return self

    def _encode_and_impute(self, df: pd.DataFrame) -> np.ndarray:
        """Internal helper to impute and encode categoricals to a numeric 2D array."""
        numeric_df = pd.DataFrame(index=df.index)

        for col in self.feature_names:
            if col in self.categorical_features:
                mapping = self.category_mappings[col]
                default_code = mapping["__unknown__"]
                mode_val = self.categorical_modes[col]

                # Impute missing categorical with mode
                col_series = (
                    df[col]
                    .fillna(mode_val)
                    .astype(str)
                    .str.strip()
                    .str.lower()
                )
                numeric_df[col] = col_series.map(lambda val: mapping.get(val, default_code)).astype(float)
            else:
                median_val = self.numerical_medians.get(col, 0.0)
                numeric_df[col] = (
                    pd.to_numeric(df[col], errors="coerce")
                    .fillna(median_val)
                    .astype(float)
                )

        return numeric_df[self.feature_names].to_numpy(dtype=np.float32)

    def transform(self, X: Union[pd.DataFrame, np.ndarray, Dict[str, Any]]) -> np.ndarray:
        """
        Apply fitted imputation, categorical encoding, and scaling.
        Does NOT refit any transformer.

        Args:
            X: Input feature matrix or sample row.

        Returns:
            np.ndarray of shape (N, feature_count) containing scaled float32 features.
        """
        if not self.is_fitted:
            raise RuntimeError("Preprocessor must be fitted before calling transform().")

        df = self._prepare_dataframe(X)
        numeric_arr = self._encode_and_impute(df)
        scaled_arr = self.scaler.transform(numeric_arr)

        # Sanity check: ensure no NaN or Inf in output
        if np.isnan(scaled_arr).any() or np.isinf(scaled_arr).any():
            scaled_arr = np.nan_to_num(scaled_arr, nan=0.0, posinf=0.0, neginf=0.0)

        return scaled_arr.astype(np.float32)

    def fit_transform(self, X: Union[pd.DataFrame, np.ndarray]) -> np.ndarray:
        """Fit on X and return transformed array."""
        return self.fit(X).transform(X)

    def save(self, model_dir: str = "model") -> Dict[str, str]:
        """
        Save preprocessor artifacts:
        - model/preprocessor.joblib (Fitted StandardScaler directly compatible with joblib)
        - model/feature_schema.json (Schema with feature list, counts, drop list, encodings)
        - model/label_mapping.json (Label mapping definition)

        Args:
            model_dir: Directory where artifacts are saved.

        Returns:
            Dictionary of saved artifact file paths.
        """
        if not self.is_fitted:
            raise RuntimeError("Cannot save unfitted preprocessor.")

        os.makedirs(model_dir, exist_ok=True)

        # 1. Save StandardScaler to preprocessor.joblib
        scaler_path = os.path.join(model_dir, "preprocessor.joblib")
        joblib.dump(self.scaler, scaler_path)

        # 2. Save feature_schema.json
        schema_path = os.path.join(model_dir, "feature_schema.json")
        schema_data = {
            "feature_names": self.feature_names,
            "feature_count": len(self.feature_names),
            "categorical_columns": self.categorical_features,
            "numerical_columns": self.numerical_features,
            "target_column": TARGET_COLUMN,
            "drop_columns": DROP_COLUMNS,
            "category_mappings": self.category_mappings,
            "categorical_modes": self.categorical_modes,
            "numerical_medians": self.numerical_medians,
        }
        with open(schema_path, "w", encoding="utf-8") as f:
            json.dump(schema_data, f, indent=2)

        # 3. Save label_mapping.json
        label_map_path = os.path.join(model_dir, "label_mapping.json")
        with open(label_map_path, "w", encoding="utf-8") as f:
            json.dump(LABEL_MAPPING, f, indent=2)

        return {
            "preprocessor": scaler_path,
            "feature_schema": schema_path,
            "label_mapping": label_map_path,
        }

    @classmethod
    def load(cls, model_dir: str = "model") -> "DeepGuardPreprocessor":
        """
        Load preprocessor artifacts from disk.

        Args:
            model_dir: Directory containing preprocessor artifacts.

        Returns:
            Reconstituted and ready-to-infer DeepGuardPreprocessor.
        """
        scaler_path = os.path.join(model_dir, "preprocessor.joblib")
        schema_path = os.path.join(model_dir, "feature_schema.json")

        if not os.path.exists(scaler_path):
            raise FileNotFoundError(f"Scaler artifact not found at: {scaler_path}")
        if not os.path.exists(schema_path):
            raise FileNotFoundError(f"Schema artifact not found at: {schema_path}")

        scaler = joblib.load(scaler_path)
        with open(schema_path, "r", encoding="utf-8") as f:
            schema = json.load(f)

        instance = cls(
            feature_names=schema.get("feature_names", FEATURE_NAMES),
            categorical_features=schema.get("categorical_columns", CATEGORICAL_FEATURES),
            numerical_features=schema.get("numerical_columns", NUMERICAL_FEATURES),
        )
        instance.scaler = scaler
        instance.category_mappings = schema.get("category_mappings", {})
        instance.categorical_modes = schema.get("categorical_modes", {})
        instance.numerical_medians = schema.get("numerical_medians", {})
        instance.is_fitted = True
        return instance


def save_preprocessor_artifacts(
    scaler: StandardScaler,
    feature_names: Optional[List[str]] = None,
    output_dir: str = "model",
    extra_metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, str]:
    """
    Convenience function to save scaler, feature schema, and label mapping.
    Matches Step 8 & Step 9 of Phase 2.
    """
    os.makedirs(output_dir, exist_ok=True)
    features = feature_names or FEATURE_NAMES

    scaler_path = os.path.join(output_dir, "preprocessor.joblib")
    joblib.dump(scaler, scaler_path)

    schema_path = os.path.join(output_dir, "feature_schema.json")
    schema_content = {
        "feature_names": features,
        "feature_count": len(features),
        "target_column": TARGET_COLUMN,
        "drop_columns": DROP_COLUMNS,
    }
    if extra_metadata:
        schema_content.update(extra_metadata)

    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump(schema_content, f, indent=2)

    label_path = os.path.join(output_dir, "label_mapping.json")
    with open(label_path, "w", encoding="utf-8") as f:
        json.dump(LABEL_MAPPING, f, indent=2)

    return {
        "preprocessor": scaler_path,
        "feature_schema": schema_path,
        "label_mapping": label_path,
    }
