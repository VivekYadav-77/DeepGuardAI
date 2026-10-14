"""
DeepGuard AI — Inference Module
===============================
Implementation of Phase 7 Deep Learning Inference Engine for Network Intrusion Detection.

Features:
- Thread-safe loading of PyTorch weights (deepguard_model.pth) and preprocessor (preprocessor.joblib)
- Robust handling of raw DataFrame, NumPy array, or JSON records
- Consistent categorical feature integer-mapping with out-of-vocabulary fallback
- Bounded confidence score computation (strictly in [0.0, 1.0])
- Clean structured output for web dashboards, REST APIs, and CLI batch predictions
- Academic disclaimer embedded in all prediction reports
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict, List, Optional, Tuple, Union

import joblib
import numpy as np
import pandas as pd
import torch

from src.model import DeepGuardMLP
from src.preprocessing import (
    CATEGORICAL_FEATURES,
    DeepGuardPreprocessor,
    FEATURE_NAMES,
)
from src.validation import TrafficValidator


DEFAULT_MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model")


class DeepGuardPredictor:
    """
    Inference orchestrator for the DeepGuard AI Multilayer Perceptron.
    """

    def __init__(
        self,
        model_dir: Optional[str] = None,
        device: Optional[Union[str, torch.device]] = None,
    ) -> None:
        """
        Initialize the predictor by loading artifacts from disk.

        Args:
            model_dir: Directory containing trained model artifacts.
            device: Torch device (defaults to CPU for portability).
        """
        if model_dir is None:
            model_dir = DEFAULT_MODEL_DIR
        self.model_dir = model_dir

        if device is None:
            self.device = torch.device("cpu")
        elif isinstance(device, str):
            self.device = torch.device(device)
        else:
            self.device = device

        self._load_artifacts()

    def _load_artifacts(self) -> None:
        """Load schemas, metadata, preprocessor, and PyTorch model state."""
        # 1. Feature schema
        schema_path = os.path.join(self.model_dir, "feature_schema.json")
        if not os.path.exists(schema_path):
            raise FileNotFoundError(f"Feature schema not found: {schema_path}")
        with open(schema_path, "r", encoding="utf-8") as f:
            self.schema: Dict[str, Any] = json.load(f)
        self.feature_names: List[str] = self.schema.get("feature_names", FEATURE_NAMES)
        self.feature_count: int = self.schema.get("feature_count", len(self.feature_names))

        # 2. Model metadata
        meta_path = os.path.join(self.model_dir, "model_metadata.json")
        hidden_dims = [128, 64, 32]
        dropout = 0.3
        if os.path.exists(meta_path):
            try:
                with open(meta_path, "r", encoding="utf-8") as f:
                    meta = json.load(f)
                    hidden_dims = meta.get("hidden_dims", hidden_dims)
                    dropout = meta.get("dropout", dropout)
            except Exception:
                pass

        # 3. Preprocessor (load via DeepGuardPreprocessor or fallback directly to joblib scaler)
        try:
            self.preprocessor = DeepGuardPreprocessor.load(self.model_dir)
            self._has_pipeline = True
        except Exception:
            prep_path = os.path.join(self.model_dir, "preprocessor.joblib")
            if not os.path.exists(prep_path):
                raise FileNotFoundError(f"Fitted preprocessor not found: {prep_path}")
            self.scaler = joblib.load(prep_path)
            self._has_pipeline = False

        # 4. Neural Network Weights
        weights_path = os.path.join(self.model_dir, "deepguard_model.pth")
        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"Model weights not found: {weights_path}")

        self.model = DeepGuardMLP(
            input_dim=self.feature_count,
            hidden_dims=hidden_dims,
            dropout=dropout,
        )
        state_dict = torch.load(weights_path, map_location=self.device, weights_only=True)
        self.model.load_state_dict(state_dict)
        self.model.to(self.device)
        self.model.eval()

        # 5. Label mapping
        label_path = os.path.join(self.model_dir, "label_mapping.json")
        self.label_mapping = {"0": "Benign", "1": "Suspicious (Attack)"}
        if os.path.exists(label_path):
            try:
                with open(label_path, "r", encoding="utf-8") as f:
                    raw_mapping = json.load(f)
                    self.label_mapping = {
                        "0": raw_mapping.get("0", "Benign"),
                        "1": raw_mapping.get("1", "Suspicious (Attack)"),
                    }
            except Exception:
                pass

    def prepare_features(self, X: Union[pd.DataFrame, np.ndarray, List[Dict[str, Any]]]) -> np.ndarray:
        """
        Normalize input into scaled numerical feature array of shape (N, feature_count).
        """
        if isinstance(X, list):
            df = pd.DataFrame(X)
        elif isinstance(X, np.ndarray):
            if X.ndim == 1:
                X = X.reshape(1, -1)
            if X.shape[1] != self.feature_count:
                raise ValueError(
                    f"Expected input array with {self.feature_count} columns, got {X.shape[1]}"
                )
            if self._has_pipeline:
                df = pd.DataFrame(X, columns=self.feature_names)
                return self.preprocessor.transform(df).astype(np.float32)
            else:
                return self.scaler.transform(X).astype(np.float32)
        elif isinstance(X, pd.DataFrame):
            df = X.copy()
        else:
            raise TypeError("Input must be a DataFrame, NumPy array, or list of dict records.")

        if self._has_pipeline:
            return self.preprocessor.transform(df).astype(np.float32)
        else:
            # Fallback numeric transformation
            df = df[self.feature_names].copy().fillna(0.0)
            X_raw = df.values.astype(np.float32)
            return self.scaler.transform(X_raw).astype(np.float32)

    def predict(
        self,
        X: Union[pd.DataFrame, np.ndarray, List[Dict[str, Any]]],
        batch_size: int = 1024,
    ) -> Dict[str, Any]:
        """
        Execute forward pass and compute predictions, bounded confidence scores,
        and threat classifications.

        Args:
            X: Input dataset.
            batch_size: Batch size for GPU/CPU evaluation.

        Returns:
            Dict containing:
              - predictions: List[int] (0 = Benign, 1 = Attack)
              - confidence_scores: List[float] (score in [0.0, 1.0])
              - labels: List[str] (e.g. 'Benign', 'Suspicious')
              - summary: Aggregated breakdown counts and ratios
        """
        X_scaled = self.prepare_features(X)
        num_samples = X_scaled.shape[0]

        all_probs: List[float] = []

        with torch.no_grad():
            for i in range(0, num_samples, batch_size):
                batch = torch.tensor(
                    X_scaled[i : i + batch_size],
                    dtype=torch.float32,
                    device=self.device,
                )
                logits = self.model(batch)
                probs = torch.sigmoid(logits).squeeze(-1).cpu().numpy()
                if np.ndim(probs) == 0:
                    all_probs.append(float(probs))
                else:
                    all_probs.extend(probs.tolist())

        predictions: List[int] = []
        confidence_scores: List[float] = []
        labels: List[str] = []

        for p in all_probs:
            # Bound strictly between 0 and 1
            clamped_p = max(0.0, min(1.0, float(p)))
            if clamped_p >= 0.5:
                pred_class = 1
                label = "Suspicious"
                conf = clamped_p
            else:
                pred_class = 0
                label = "Benign"
                conf = 1.0 - clamped_p

            predictions.append(pred_class)
            confidence_scores.append(round(conf, 4))
            labels.append(label)

        benign_count = sum(1 for p in predictions if p == 0)
        attack_count = sum(1 for p in predictions if p == 1)
        attack_ratio = round((attack_count / num_samples) * 100.0, 2) if num_samples > 0 else 0.0

        summary = {
            "total_records": num_samples,
            "benign_count": benign_count,
            "suspicious_count": attack_count,
            "attack_ratio_pct": attack_ratio,
            "model_type": "PyTorch Multilayer Perceptron (MLP)",
            "disclaimer": "Academic demonstration only. Predictions indicate statistical alignment with the NSL-KDD benchmark; not real-time network alerts.",
        }

        return {
            "predictions": predictions,
            "confidence_scores": confidence_scores,
            "labels": labels,
            "summary": summary,
        }

    def predict_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Execute prediction on a DataFrame and return an annotated results DataFrame
        with predicted class and confidence score.
        """
        results = self.predict(df)
        out_df = df.copy()
        out_df["Predicted_Class"] = results["labels"]
        out_df["Confidence_Score"] = results["confidence_scores"]
        out_df["Raw_Prediction"] = results["predictions"]
        return out_df


def run_inference_on_csv(
    csv_path: str,
    output_path: Optional[str] = None,
    model_dir: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Run the complete validation + inference pipeline on an input CSV file.
    """
    validator = TrafficValidator(
        schema_path_or_dict=os.path.join(model_dir or DEFAULT_MODEL_DIR, "feature_schema.json")
    )
    df = pd.read_csv(csv_path)
    is_valid, cleaned_df, errors, warnings = validator.validate_dataframe(df)

    if not is_valid:
        return {
            "success": False,
            "errors": errors,
            "warnings": warnings,
        }

    predictor = DeepGuardPredictor(model_dir=model_dir)
    results = predictor.predict(cleaned_df)

    if output_path is not None:
        annotated_df = cleaned_df.copy()
        annotated_df["Predicted_Class"] = results["labels"]
        annotated_df["Confidence_Score"] = results["confidence_scores"]
        annotated_df.to_csv(output_path, index=False)

    return {
        "success": True,
        "results": results,
        "warnings": warnings,
        "row_count": len(cleaned_df),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DeepGuard AI Inference CLI")
    parser.add_argument("--csv", type=str, help="Path to input CSV file")
    parser.add_argument("--out", type=str, default=None, help="Path to save prediction CSV")
    parser.add_argument("--json-input", type=str, default=None, help="Raw JSON string of records")
    args = parser.parse_args()

    if args.json_input:
        records = json.loads(args.json_input)
        predictor = DeepGuardPredictor()
        output = predictor.predict(records)
        print(json.dumps(output, indent=2))
    elif args.csv:
        res = run_inference_on_csv(args.csv, output_path=args.out)
        print(json.dumps(res, indent=2))
    else:
        print("Usage: python -m src.inference --csv <file.csv> OR --json-input '<json>'")
