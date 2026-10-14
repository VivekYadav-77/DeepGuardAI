"""
DeepGuard AI — PyTorch Multilayer Perceptron (MLP) Architecture
Phase 3 Implementation

Defines the core neural network classifier for binary intrusion detection
(Benign vs. Malicious network traffic). Designed to be lightweight, fast,
and fully CPU-compatible while providing strong generalization.
"""

import json
import os
from typing import Any, Dict, List, Optional, Tuple, Union

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset


class DeepGuardMLP(nn.Module):
    """
    Multilayer Perceptron (MLP) for network intrusion detection.

    Architecture:
      Input (input_dim) -> [Linear -> BatchNorm1d -> ReLU -> Dropout] x N -> Linear(prev_dim, 1)

    Output:
      Single raw logit. Use torch.sigmoid(output) for class 1 probability.
      Loss function: BCEWithLogitsLoss.
    """

    def __init__(
        self,
        input_dim: int,
        hidden_dims: Optional[List[int]] = None,
        dropout: float = 0.3,
    ):
        """
        Initialize the DeepGuardMLP model.

        Args:
            input_dim: Number of input features (matches feature_schema.json).
            hidden_dims: List of hidden layer dimensions. Defaults to [128, 64, 32].
            dropout: Dropout probability between 0.0 and 1.0. Defaults to 0.3.
        """
        super().__init__()
        if hidden_dims is None:
            hidden_dims = [128, 64, 32]

        self.input_dim = input_dim
        self.hidden_dims = list(hidden_dims)
        self.dropout_rate = dropout

        layers: List[nn.Module] = []
        prev_dim = input_dim
        for dim in hidden_dims:
            layers += [
                nn.Linear(prev_dim, dim),
                nn.BatchNorm1d(dim),
                nn.ReLU(),
                nn.Dropout(dropout),
            ]
            prev_dim = dim
        layers.append(nn.Linear(prev_dim, 1))
        self.network = nn.Sequential(*layers)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass through the network.

        Args:
            x: Input tensor of shape (batch_size, input_dim).

        Returns:
            Raw logits tensor of shape (batch_size, 1).
        """
        return self.network(x)

    def predict_proba(self, x: torch.Tensor) -> torch.Tensor:
        """
        Compute attack class probabilities (0.0 to 1.0) using sigmoid.

        Args:
            x: Input tensor of shape (batch_size, input_dim).

        Returns:
            Probability tensor of shape (batch_size, 1).
        """
        self.eval()
        with torch.no_grad():
            logits = self.forward(x)
            return torch.sigmoid(logits)

    def predict(self, x: torch.Tensor, threshold: float = 0.5) -> torch.Tensor:
        """
        Compute binary class predictions (0 = benign, 1 = attack).

        Args:
            x: Input tensor of shape (batch_size, input_dim).
            threshold: Classification threshold. Defaults to 0.5.

        Returns:
            Integer class prediction tensor of shape (batch_size, 1).
        """
        probs = self.predict_proba(x)
        return (probs >= threshold).long()


def create_dataloader(
    X: Union[torch.Tensor, Any],
    y: Optional[Union[torch.Tensor, Any]] = None,
    batch_size: int = 256,
    shuffle: bool = True,
) -> DataLoader:
    """
    Construct a PyTorch DataLoader from numpy arrays or tensors.

    Args:
        X: Feature array or tensor of shape (N, D).
        y: Target label array or tensor of shape (N,) or (N, 1). Optional.
        batch_size: Batch size (default: 256).
        shuffle: Whether to shuffle data (default: True).

    Returns:
        torch.utils.data.DataLoader
    """
    if not isinstance(X, torch.Tensor):
        X = torch.tensor(X, dtype=torch.float32)
    else:
        X = X.float()

    if y is not None:
        if not isinstance(y, torch.Tensor):
            y = torch.tensor(y, dtype=torch.float32).view(-1, 1)
        else:
            y = y.float().view(-1, 1)
        dataset = TensorDataset(X, y)
    else:
        dataset = TensorDataset(X)

    return DataLoader(dataset, batch_size=batch_size, shuffle=shuffle)


def train_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
) -> Tuple[float, float]:
    """
    Execute one training epoch with gradient updates and validity checks.

    Args:
        model: DeepGuardMLP model.
        loader: DataLoader with training pairs (X, y).
        criterion: Loss function (BCEWithLogitsLoss).
        optimizer: Optimizer (e.g. Adam).
        device: Device to run computations on.

    Returns:
        Tuple of (mean_epoch_loss, epoch_accuracy).
    """
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (batch_x, batch_y) in enumerate(loader):
        batch_x = batch_x.to(device)
        batch_y = batch_y.to(device)

        optimizer.zero_grad()
        logits = model(batch_x)
        loss = criterion(logits, batch_y)

        # Step 4 check: verify loss is finite
        if torch.isnan(loss) or torch.isinf(loss):
            raise ValueError(
                f"Non-finite loss detected at batch {batch_idx}: loss={loss.item()}"
            )

        loss.backward()
        optimizer.step()

        running_loss += loss.item() * batch_x.size(0)
        preds = (torch.sigmoid(logits) >= 0.5).float()
        correct += (preds == batch_y).sum().item()
        total += batch_y.size(0)

    epoch_loss = running_loss / max(total, 1)
    epoch_acc = correct / max(total, 1)
    return epoch_loss, epoch_acc


def evaluate_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Tuple[float, float, List[int]]:
    """
    Evaluate model on validation/test DataLoader.

    Args:
        model: DeepGuardMLP model.
        loader: DataLoader with evaluation pairs (X, y).
        criterion: Loss function (BCEWithLogitsLoss).
        device: Device to run computations on.

    Returns:
        Tuple of (validation_loss, validation_accuracy, all_predictions_list).
    """
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    all_preds: List[int] = []

    with torch.no_grad():
        for batch_x, batch_y in loader:
            batch_x = batch_x.to(device)
            batch_y = batch_y.to(device)

            logits = model(batch_x)
            loss = criterion(logits, batch_y)

            if torch.isnan(loss) or torch.isinf(loss):
                raise ValueError(f"Non-finite loss detected during evaluation: {loss.item()}")

            running_loss += loss.item() * batch_x.size(0)
            preds = (torch.sigmoid(logits) >= 0.5).long()
            correct += (preds == batch_y.long()).sum().item()
            total += batch_y.size(0)
            all_preds.extend(preds.view(-1).cpu().tolist())

    val_loss = running_loss / max(total, 1)
    val_acc = correct / max(total, 1)
    return val_loss, val_acc, all_preds


def train_deepguard_model(
    model: DeepGuardMLP,
    train_loader: DataLoader,
    val_loader: DataLoader,
    epochs: int = 50,
    lr: float = 1e-3,
    patience: int = 10,
    device: Optional[torch.device] = None,
    save_model_path: str = "model/deepguard_model.pth",
    save_history_path: str = "model/training_history.json",
    save_metadata_path: str = "model/model_metadata.json",
    verbose: bool = True,
) -> Dict[str, Any]:
    """
    Full training routine for DeepGuardMLP meeting all Phase 3 requirements:
    1. Adam optimizer with lr=1e-3
    2. BCEWithLogitsLoss
    3. Up to specified epochs with validation after every epoch
    4. Early stopping with patience
    5. Saves best validation loss checkpoint
    6. Verifies loss finiteness and prediction diversity
    7. Exports training history and metadata JSON files
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model.to(device)
    criterion = nn.BCEWithLogitsLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    train_losses: List[float] = []
    val_losses: List[float] = []
    train_accuracies: List[float] = []
    val_accuracies: List[float] = []

    best_val_loss = float("inf")
    best_epoch = 0
    patience_counter = 0

    os.makedirs(os.path.dirname(os.path.abspath(save_model_path)), exist_ok=True)

    if verbose:
        print(f"DeepGuard AI — Starting Training on {device}")
        print(f"Architecture: {model.hidden_dims} | Dropout: {model.dropout_rate} | Max Epochs: {epochs} | Patience: {patience}")
        print("-" * 75)

    for epoch in range(1, epochs + 1):
        tr_loss, tr_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        v_loss, v_acc, v_preds = evaluate_epoch(model, val_loader, criterion, device)

        train_losses.append(round(tr_loss, 5))
        val_losses.append(round(v_loss, 5))
        train_accuracies.append(round(tr_acc, 5))
        val_accuracies.append(round(v_acc, 5))

        # Check prediction diversity (Step 4: not all same class)
        unique_preds = set(v_preds)
        if len(unique_preds) < 2 and len(v_preds) > 10:
            if verbose:
                print(f"Warning: Epoch {epoch} produced only 1 class in predictions: {unique_preds}")

        if verbose:
            print(
                f"Epoch {epoch:02d}/{epochs:02d} | "
                f"Train Loss: {tr_loss:.4f} | Val Loss: {v_loss:.4f} | "
                f"Train Acc: {tr_acc * 100:.2f}% | Val Acc: {v_acc * 100:.2f}%"
            )

        # Early stopping logic (best val loss)
        if v_loss < best_val_loss:
            best_val_loss = v_loss
            best_epoch = epoch
            patience_counter = 0
            # Save best checkpoint
            torch.save(model.state_dict(), save_model_path)
            if verbose:
                print(f"  --> Best model checkpoint saved (val_loss={v_loss:.4f} at epoch {epoch})")
        else:
            patience_counter += 1
            if patience_counter >= patience:
                if verbose:
                    print(
                        f"\nEarly stopping triggered after {epoch} epochs "
                        f"(no validation improvement for {patience} epochs). Best epoch was {best_epoch} with val_loss={best_val_loss:.4f}."
                    )
                break

    # Save training history JSON (Step 5)
    history = {
        "train_loss": train_losses,
        "val_loss": val_losses,
        "train_acc": train_accuracies,
        "val_acc": val_accuracies,
        "best_epoch": best_epoch,
        "best_val_loss": round(best_val_loss, 5),
    }
    with open(save_history_path, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

    # Save model metadata JSON (Step 6)
    metadata = {
        "architecture": "DeepGuardMLP",
        "input_dim": model.input_dim,
        "hidden_dims": model.hidden_dims,
        "dropout": model.dropout_rate,
        "optimizer": "Adam",
        "lr": lr,
        "batch_size": train_loader.batch_size,
        "epochs_trained": len(train_losses),
        "early_stopping_patience": patience,
        "best_epoch": best_epoch,
        "best_val_loss": round(best_val_loss, 5),
        "device_used": str(device.type),
        "pytorch_version": torch.__version__,
    }
    with open(save_metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    if verbose:
        print("\nTraining complete!")
        print(f"  Model saved to:    {save_model_path}")
        print(f"  History saved to:  {save_history_path}")
        print(f"  Metadata saved to: {save_metadata_path}")

    return {
        "best_epoch": best_epoch,
        "best_val_loss": best_val_loss,
        "epochs_trained": len(train_losses),
        "history": history,
        "metadata": metadata,
    }


def load_deepguard_model(
    model_path: str = "model/deepguard_model.pth",
    feature_schema_path: str = "model/feature_schema.json",
    device: Optional[torch.device] = None,
) -> DeepGuardMLP:
    """
    Safely load a trained DeepGuardMLP model from disk for inference or evaluation.

    Args:
        model_path: Path to .pth state dict file.
        feature_schema_path: Path to feature_schema.json.
        device: Device to map tensors onto.

    Returns:
        Loaded DeepGuardMLP instance in eval mode.
    """
    if device is None:
        device = torch.device("cpu")

    if not os.path.exists(feature_schema_path):
        raise FileNotFoundError(f"Feature schema not found at: {feature_schema_path}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model weights not found at: {model_path}")

    with open(feature_schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    input_dim = schema.get("feature_count", 41)
    model = DeepGuardMLP(input_dim=input_dim)
    state_dict = torch.load(model_path, map_location=device)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    return model
