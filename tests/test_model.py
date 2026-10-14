"""
Unit Tests for DeepGuard AI PyTorch Model (Phase 3)
Tests DeepGuardMLP architecture, forward pass, gradient updates,
state dict saving/loading, and DataLoader construction.
"""

import json
import os
import tempfile
import numpy as np
import pytest
import torch
import torch.nn as nn

from src.model import (
    DeepGuardMLP,
    create_dataloader,
    train_epoch,
    evaluate_epoch,
    load_deepguard_model,
)


def test_deepguard_mlp_initialization():
    """Verify DeepGuardMLP initializes with correct dimensions and layer count."""
    input_dim = 41
    model = DeepGuardMLP(input_dim=input_dim, hidden_dims=[128, 64, 32], dropout=0.3)
    assert model.input_dim == 41
    assert model.hidden_dims == [128, 64, 32]
    assert model.dropout_rate == 0.3

    # Architecture verification: 3 hidden blocks (Linear, BatchNorm, ReLU, Dropout) + 1 final Linear
    # Total modules in sequential: 3 * 4 + 1 = 13
    assert len(model.network) == 13
    assert isinstance(model.network[0], nn.Linear)
    assert model.network[0].in_features == 41
    assert model.network[0].out_features == 128
    assert isinstance(model.network[1], nn.BatchNorm1d)
    assert isinstance(model.network[2], nn.ReLU)
    assert isinstance(model.network[3], nn.Dropout)
    assert isinstance(model.network[-1], nn.Linear)
    assert model.network[-1].out_features == 1


def test_deepguard_mlp_forward_shape():
    """Verify forward pass returns logits with correct shape [batch_size, 1]."""
    model = DeepGuardMLP(input_dim=41)
    batch_size = 16
    x = torch.randn(batch_size, 41)
    logits = model(x)

    assert logits.shape == (batch_size, 1)
    assert not torch.isnan(logits).any()
    assert not torch.isinf(logits).any()


def test_deepguard_mlp_predict_methods():
    """Verify predict_proba gives [0, 1] bounds and predict gives {0, 1}."""
    model = DeepGuardMLP(input_dim=41)
    x = torch.randn(10, 41)

    probs = model.predict_proba(x)
    assert probs.shape == (10, 1)
    assert (probs >= 0.0).all()
    assert (probs <= 1.0).all()

    preds = model.predict(x, threshold=0.5)
    assert preds.shape == (10, 1)
    unique_vals = set(preds.view(-1).tolist())
    assert unique_vals.issubset({0, 1})


def test_gradient_flow_and_optimization():
    """Verify backward pass computes non-zero gradients for trainable parameters."""
    torch.manual_seed(42)
    model = DeepGuardMLP(input_dim=41)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.BCEWithLogitsLoss()

    x = torch.randn(32, 41)
    y = torch.randint(0, 2, (32, 1)).float()

    optimizer.zero_grad()
    logits = model(x)
    loss = criterion(logits, y)
    loss.backward()

    for name, param in model.named_parameters():
        if param.requires_grad:
            assert param.grad is not None, f"Parameter {name} has no gradient"
            assert not torch.isnan(param.grad).any()


def test_dataloader_creation():
    """Verify DataLoader converts numpy arrays and handles batching."""
    X = np.random.randn(100, 41).astype(np.float32)
    y = np.random.randint(0, 2, size=100)

    loader = create_dataloader(X, y, batch_size=25, shuffle=False)
    batches = list(loader)
    assert len(batches) == 4
    batch_x, batch_y = batches[0]
    assert batch_x.shape == (25, 41)
    assert batch_y.shape == (25, 1)


def test_non_finite_loss_detection():
    """Verify training loop catches NaN / Inf loss and raises ValueError."""
    model = DeepGuardMLP(input_dim=4)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    device = torch.device("cpu")

    # Pass inputs with NaN
    x = torch.full((10, 4), float("nan"))
    y = torch.ones((10, 1))
    dataset = torch.utils.data.TensorDataset(x, y)
    loader = torch.utils.data.DataLoader(dataset, batch_size=5)

    with pytest.raises(ValueError, match="Non-finite loss detected"):
        train_epoch(model, loader, criterion, optimizer, device)


def test_model_save_and_load(tmp_path):
    """Verify saving state dict and reloading in a fresh model instance."""
    input_dim = 41
    model = DeepGuardMLP(input_dim=input_dim)
    model_path = tmp_path / "deepguard_model.pth"
    schema_path = tmp_path / "feature_schema.json"

    torch.save(model.state_dict(), str(model_path))
    schema = {"feature_count": input_dim}
    with open(schema_path, "w") as f:
        json.dump(schema, f)

    loaded_model = load_deepguard_model(
        model_path=str(model_path),
        feature_schema_path=str(schema_path),
        device=torch.device("cpu"),
    )

    model.eval()
    test_input = torch.randn(5, input_dim)
    with torch.no_grad():
        original_out = model(test_input)
        loaded_out = loaded_model(test_input)

    assert torch.allclose(original_out, loaded_out, atol=1e-5)


def test_saved_artifacts_exist_and_valid():
    """Verify that Phase 3 trained model artifacts exist on disk and are well-formed."""
    model_path = "model/deepguard_model.pth"
    history_path = "model/training_history.json"
    metadata_path = "model/model_metadata.json"
    schema_path = "model/feature_schema.json"

    assert os.path.exists(model_path), f"Model weights not found at {model_path}"
    assert os.path.exists(history_path), f"Training history not found at {history_path}"
    assert os.path.exists(metadata_path), f"Metadata not found at {metadata_path}"
    assert os.path.exists(schema_path), f"Schema not found at {schema_path}"

    # Verify history JSON
    with open(history_path, "r", encoding="utf-8") as f:
        history = json.load(f)
    assert "train_loss" in history
    assert "val_loss" in history
    assert len(history["train_loss"]) > 0
    assert len(history["train_loss"]) == len(history["val_loss"])
    assert history["best_val_loss"] > 0.0

    # Verify metadata JSON
    with open(metadata_path, "r", encoding="utf-8") as f:
        meta = json.load(f)
    assert meta["architecture"] == "DeepGuardMLP"
    assert meta["input_dim"] == 41
    assert meta["hidden_dims"] == [128, 64, 32]
    assert meta["dropout"] == 0.3
    assert meta["optimizer"] == "Adam"
    assert meta["batch_size"] == 256
    assert meta["early_stopping_patience"] == 10
    assert meta["epochs_trained"] == len(history["train_loss"])


def test_trained_model_inference():
    """Verify that the actual trained model can be loaded and run inference without errors."""
    loaded_model = load_deepguard_model(
        model_path="model/deepguard_model.pth",
        feature_schema_path="model/feature_schema.json",
        device=torch.device("cpu"),
    )
    loaded_model.eval()

    sample_input = torch.randn(10, 41)
    with torch.no_grad():
        probs = loaded_model.predict_proba(sample_input)
        preds = loaded_model.predict(sample_input)

    assert probs.shape == (10, 1)
    assert preds.shape == (10, 1)
    assert (probs >= 0.0).all() and (probs <= 1.0).all()
    assert set(preds.view(-1).tolist()).issubset({0, 1})

