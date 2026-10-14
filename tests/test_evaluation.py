"""
Unit Tests for DeepGuard AI Baseline and Evaluation Pipeline (Phase 4 & Phase 9)
Tests metric computation, baseline classifier training, MLP evaluation,
confusion matrix plotting, and schema validation of saved evaluation artifacts.
"""

import json
import os
import tempfile
import joblib
import numpy as np
import pytest
import torch

from src.evaluate import (
    calculate_metrics,
    evaluate_baseline,
    evaluate_mlp,
    generate_honest_assessment,
    plot_confusion_matrix_chart,
    save_evaluation_metrics,
    train_baseline,
)
from src.model import DeepGuardMLP


def test_calculate_metrics_perfect_predictions():
    """Verify metric calculations for 100% correct binary predictions."""
    y_true = np.array([0, 0, 1, 1])
    y_pred = np.array([0, 0, 1, 1])
    y_probs = np.array([0.1, 0.2, 0.9, 0.8])

    metrics = calculate_metrics(y_true, y_pred, y_probs)
    assert metrics["accuracy"] == 1.0
    assert metrics["precision_macro"] == 1.0
    assert metrics["recall_macro"] == 1.0
    assert metrics["f1_macro"] == 1.0
    assert metrics["roc_auc"] == 1.0
    assert metrics["confusion_matrix"] == [[2, 0], [0, 2]]
    assert metrics["per_class"]["benign"]["precision"] == 1.0
    assert metrics["per_class"]["attack"]["recall"] == 1.0


def test_calculate_metrics_with_errors():
    """Verify metric calculations with known errors and imperfect probabilities."""
    y_true = np.array([0, 0, 1, 1])
    y_pred = np.array([0, 1, 1, 0])
    y_probs = np.array([0.2, 0.7, 0.8, 0.4])

    metrics = calculate_metrics(y_true, y_pred, y_probs)
    assert metrics["accuracy"] == 0.5
    assert metrics["confusion_matrix"] == [[1, 1], [1, 1]]
    assert 0.0 <= metrics["f1_macro"] <= 1.0
    assert 0.0 <= metrics["roc_auc"] <= 1.0


def test_train_baseline_and_predict(tmp_path):
    """Verify LogisticRegression baseline trains, predicts, and serializes to disk."""
    np.random.seed(42)
    X_train = np.random.randn(100, 41)
    y_train = np.random.randint(0, 2, size=100)
    save_file = str(tmp_path / "baseline_test.joblib")

    model = train_baseline(X_train, y_train, max_iter=200, random_state=42, save_path=save_file)
    assert os.path.exists(save_file)

    loaded_model = joblib.load(save_file)
    X_test = np.random.randn(20, 41)
    y_test = np.random.randint(0, 2, size=20)

    metrics, preds, probs = evaluate_baseline(loaded_model, X_test, y_test)
    assert len(preds) == 20
    assert len(probs) == 20
    assert "accuracy" in metrics
    assert "roc_auc" in metrics
    assert metrics["model"] == "LogisticRegression"


def test_evaluate_mlp_synthetic():
    """Verify evaluate_mlp executes inference correctly and outputs expected shapes."""
    torch.manual_seed(42)
    model = DeepGuardMLP(input_dim=41)
    X_test = np.random.randn(30, 41).astype(np.float32)
    y_test = np.random.randint(0, 2, size=30)

    metrics, preds, probs = evaluate_mlp(model, X_test, y_test, device=torch.device("cpu"))
    assert len(preds) == 30
    assert len(probs) == 30
    assert set(np.unique(preds)).issubset({0, 1})
    assert (probs >= 0.0).all() and (probs <= 1.0).all()
    assert 0.0 <= metrics["accuracy"] <= 1.0


def test_plot_confusion_matrix_chart(tmp_path):
    """Verify confusion matrix image generation and saving."""
    y_test = np.array([0, 0, 1, 1, 0, 1])
    y_pred_mlp = np.array([0, 0, 1, 1, 0, 0])
    y_pred_base = np.array([0, 1, 1, 1, 0, 0])

    chart_path = str(tmp_path / "cm_test.png")
    result_path = plot_confusion_matrix_chart(
        y_test=y_test,
        y_pred_mlp=y_pred_mlp,
        y_pred_baseline=y_pred_base,
        save_path=chart_path,
    )

    assert os.path.exists(result_path)
    assert os.path.getsize(result_path) > 1000  # Non-trivial PNG size


def test_saved_evaluation_artifacts_exist_and_conform_to_schema():
    """
    Verify that the Phase 4 output artifacts exist on disk and strictly conform
    to the schema required in docs/phase4_evaluation.md.
    """
    metrics_path = "model/evaluation_metrics.json"
    chart_path = "model/confusion_matrix.png"
    baseline_path = "model/baseline_model.joblib"

    assert os.path.exists(metrics_path), f"Missing {metrics_path}"
    assert os.path.exists(chart_path), f"Missing {chart_path}"
    assert os.path.exists(baseline_path), f"Missing {baseline_path}"

    with open(metrics_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Validate top-level schema
    assert data["dataset"] == "NSL-KDD"
    assert data["test_size"] == 18896
    assert "mlp" in data
    assert "baseline" in data

    # Validate MLP metrics
    mlp = data["mlp"]
    assert 0.95 <= mlp["accuracy"] <= 1.0
    assert 0.95 <= mlp["f1_macro"] <= 1.0
    assert 0.95 <= mlp["roc_auc"] <= 1.0
    assert len(mlp["confusion_matrix"]) == 2
    assert len(mlp["confusion_matrix"][0]) == 2
    assert "per_class" in mlp

    # Validate Baseline metrics
    base = data["baseline"]
    assert base["model"] == "LogisticRegression"
    assert 0.90 <= base["accuracy"] <= 1.0
    assert 0.90 <= base["f1_macro"] <= 1.0
    assert 0.90 <= base["roc_auc"] <= 1.0
    assert len(base["confusion_matrix"]) == 2


def test_baseline_artifact_is_loadable():
    """Verify saved baseline_model.joblib can be loaded and used for predictions."""
    baseline = joblib.load("model/baseline_model.joblib")
    dummy_input = np.random.randn(5, 41)
    preds = baseline.predict(dummy_input)
    probs = baseline.predict_proba(dummy_input)

    assert len(preds) == 5
    assert probs.shape == (5, 2)
    assert set(preds).issubset({0, 1})


def test_honest_assessment_generation():
    """Verify honest assessment text generation includes comparisons and caveats."""
    mlp_metrics = {
        "accuracy": 0.995,
        "f1_macro": 0.995,
        "roc_auc": 0.999,
        "per_class": {
            "benign": {"precision": 0.99, "recall": 0.99},
            "attack": {"precision": 0.99, "recall": 0.99},
        },
    }
    base_metrics = {
        "accuracy": 0.952,
        "f1_macro": 0.952,
        "roc_auc": 0.992,
        "per_class": {
            "benign": {"precision": 0.95, "recall": 0.96},
            "attack": {"precision": 0.96, "recall": 0.94},
        },
    }
    text = generate_honest_assessment(mlp_metrics, base_metrics)
    assert "DeepGuard MLP" in text
    assert "Logistic Regression" in text
    assert "Limitations" in text
