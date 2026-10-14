"""
DeepGuard AI — Model Training Pipeline (Phase 3)
Trains the DeepGuardMLP PyTorch classifier on NSL-KDD dataset.
Adheres strictly to docs/phase3_training.md specifications.
"""

import json
import os
import random
import sys
from typing import Any, Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
import torch

from src.model import (
    DeepGuardMLP,
    create_dataloader,
    load_deepguard_model,
    train_deepguard_model,
)
from src.preprocessing import (
    DeepGuardPreprocessor,
    clean_features,
    load_dataset,
    prepare_labels,
    split_data,
)


def set_seed(seed: int = 42) -> None:
    """Set global seeds across Python, NumPy, and PyTorch for full reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def run_training(
    train_data_path: str = "data/KDDTrain+.txt",
    output_model_path: str = "model/deepguard_model.pth",
    output_history_path: str = "model/training_history.json",
    output_metadata_path: str = "model/model_metadata.json",
    preprocessor_path: str = "model/preprocessor.joblib",
    schema_path: str = "model/feature_schema.json",
    epochs: int = 50,
    batch_size: int = 256,
    lr: float = 1e-3,
    patience: int = 10,
    dropout: float = 0.3,
    hidden_dims: Optional[List[int]] = None,
    verbose: bool = True,
) -> Dict[str, Any]:
    """
    Execute full training workflow for DeepGuardMLP on NSL-KDD.

    Steps:
      1. Set seed (42) for reproducibility.
      2. Load raw training data and clean labels / features.
      3. Perform stratified 70/15/15 train/val/test split.
      4. Fit preprocessor on train split only and transform train and val splits.
      5. Construct PyTorch DataLoaders (batch_size=256).
      6. Train DeepGuardMLP with BCEWithLogitsLoss, Adam, early stopping (patience=10).
      7. Save deepguard_model.pth, training_history.json, and model_metadata.json.
      8. Perform fresh-runtime model verification check.

    Returns:
      Dictionary containing training statistics, best validation loss, and metadata.
    """
    if hidden_dims is None:
        hidden_dims = [128, 64, 32]

    set_seed(42)

    if not os.path.exists(train_data_path):
        raise FileNotFoundError(
            f"Training dataset not found at '{train_data_path}'. "
            "Please ensure data has been downloaded into data/ directory."
        )

    if verbose:
        print("=" * 75)
        print("DeepGuard AI — Model Training Pipeline (Phase 3)")
        print(f"Dataset path: {train_data_path}")
        print("=" * 75)

    # 1. Load data
    df = load_dataset(train_data_path)
    if verbose:
        print(f"Loaded raw dataset with shape: {df.shape}")

    # 2. Extract labels and clean features
    y = prepare_labels(df["label"])
    X = clean_features(df, drop_columns=["difficulty_level", "label"])

    # 3. Stratified Train / Val / Test split
    X_train, X_val, X_test, y_train, y_val, y_test = split_data(
        X, y, test_size=0.15, val_size=0.15, random_state=42
    )

    if verbose:
        print(f"Train split: {len(X_train):,} samples (Attack ratio: {y_train.mean():.4f})")
        print(f"Val split:   {len(X_val):,} samples (Attack ratio: {y_val.mean():.4f})")
        print(f"Test split:  {len(X_test):,} samples (Attack ratio: {y_test.mean():.4f})")

    # 4. Preprocess features (fit only on X_train)
    preprocessor = DeepGuardPreprocessor()
    preprocessor.fit(X_train)
    X_train_scaled = preprocessor.transform(X_train)
    X_val_scaled = preprocessor.transform(X_val)

    # Ensure preprocessor artifacts are up to date
    os.makedirs(os.path.dirname(output_model_path), exist_ok=True)
    preprocessor.save(model_dir=os.path.dirname(output_model_path))

    # 5. Create PyTorch DataLoaders
    train_loader = create_dataloader(
        X_train_scaled, y_train, batch_size=batch_size, shuffle=True
    )
    val_loader = create_dataloader(
        X_val_scaled, y_val, batch_size=batch_size, shuffle=False
    )

    # 6. Initialize Model and Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    input_dim = X_train_scaled.shape[1]
    model = DeepGuardMLP(
        input_dim=input_dim, hidden_dims=hidden_dims, dropout=dropout
    )

    # 7. Execute training with early stopping
    result = train_deepguard_model(
        model=model,
        train_loader=train_loader,
        val_loader=val_loader,
        epochs=epochs,
        lr=lr,
        patience=patience,
        device=device,
        save_model_path=output_model_path,
        save_history_path=output_history_path,
        save_metadata_path=output_metadata_path,
        verbose=verbose,
    )

    # 8. Step 7 Verification: Fresh Model Load Test
    if verbose:
        print("\n--- Verifying Model Save & Load ---")
    verified_model = load_deepguard_model(
        model_path=output_model_path,
        feature_schema_path=schema_path,
        device=torch.device("cpu"),
    )
    verified_model.eval()

    test_sample = torch.tensor(X_val_scaled[:5], dtype=torch.float32)
    with torch.no_grad():
        preds = verified_model.predict(test_sample)
        probs = verified_model.predict_proba(test_sample)

    assert preds.shape == (5, 1), f"Unexpected predictions shape: {preds.shape}"
    assert probs.shape == (5, 1), f"Unexpected probabilities shape: {probs.shape}"
    if verbose:
        print("Model loaded successfully from disk.")
        print(f"Sample test probabilities: {probs.squeeze().tolist()}")
        print(f"Sample test predictions:   {preds.squeeze().tolist()}")
        print("Verification PASSED.")

    return result


if __name__ == "__main__":
    run_training()
