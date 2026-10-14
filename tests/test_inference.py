"""
DeepGuard AI — Inference Unit Tests
===================================
Tests for Phase 7 & 9 Deep Learning Inference Pipeline.
"""

import numpy as np
import pytest
import torch

from src.inference import DeepGuardPredictor
from src.model import DeepGuardMLP


def test_model_instantiates():
    """Verify DeepGuardMLP instantiates cleanly with input_dim=41."""
    model = DeepGuardMLP(input_dim=41, hidden_dims=[128, 64, 32], dropout=0.3)
    assert model is not None
    assert model.input_dim == 41


def test_weights_load():
    """Verify deepguard_model.pth loads into DeepGuardMLP without error."""
    predictor = DeepGuardPredictor()
    assert predictor.model is not None
    assert isinstance(predictor.model, DeepGuardMLP)


def test_inference_output_shape():
    """Verify single-row input returns exactly 1 prediction and confidence score."""
    predictor = DeepGuardPredictor()
    single_input = np.zeros((1, 41), dtype=np.float32)
    res = predictor.predict(single_input)

    assert len(res["predictions"]) == 1
    assert len(res["confidence_scores"]) == 1
    assert len(res["labels"]) == 1
    assert res["summary"]["total_records"] == 1


def test_batch_inference_output_shape():
    """Verify 100-row batch returns exactly 100 predictions."""
    predictor = DeepGuardPredictor()
    rng = np.random.RandomState(42)
    batch_input = rng.uniform(0.0, 5.0, size=(100, 41)).astype(np.float32)
    res = predictor.predict(batch_input)

    assert len(res["predictions"]) == 100
    assert len(res["confidence_scores"]) == 100
    assert len(res["labels"]) == 100
    assert res["summary"]["total_records"] == 100


def test_predictions_in_valid_range():
    """Verify all confidence scores are strictly bounded within [0.0, 1.0]."""
    predictor = DeepGuardPredictor()
    rng = np.random.RandomState(123)
    test_data = rng.randn(50, 41).astype(np.float32)
    res = predictor.predict(test_data)

    for score in res["confidence_scores"]:
        assert 0.0 <= score <= 1.0, f"Confidence score {score} out of bounds"


def test_predictions_valid_class():
    """Verify all predicted classes are either 0 (Benign) or 1 (Suspicious/Attack)."""
    predictor = DeepGuardPredictor()
    rng = np.random.RandomState(999)
    test_data = rng.randn(30, 41).astype(np.float32)
    res = predictor.predict(test_data)

    for pred, label in zip(res["predictions"], res["labels"]):
        assert pred in (0, 1), f"Unexpected predicted class: {pred}"
        assert label in ("Benign", "Suspicious")
