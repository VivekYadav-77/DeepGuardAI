"""
DeepGuard AI — Unit Tests for Google Colab Notebook (Phase 6)
Validates notebooks/DeepGuard_AI_Training.ipynb structure, syntax, and compliance
with docs/phase6_notebook.md rules.
"""

import ast
import json
import os
import pytest


@pytest.fixture(scope="module")
def notebook_data():
    nb_path = "notebooks/DeepGuard_AI_Training.ipynb"
    assert os.path.exists(nb_path), f"Notebook file not found at {nb_path}"
    with open(nb_path, "r", encoding="utf-8") as f:
        nb = json.load(f)
    return nb


def test_notebook_format_and_version(notebook_data):
    """Verify that notebook conforms to nbformat v4."""
    assert notebook_data.get("nbformat") == 4
    assert "cells" in notebook_data
    assert len(notebook_data["cells"]) >= 16


def test_notebook_contains_required_sections(notebook_data):
    """Verify that notebook contains all core logical steps specified in Phase 6."""
    full_text = " ".join(
        "".join(cell.get("source", [])) for cell in notebook_data["cells"]
    )
    
    # Required Phase 6 components
    assert "DeepGuard AI" in full_text
    assert "nvidia-smi" in full_text
    assert "pip install" in full_text
    assert "KDDTrain+.txt" in full_text
    assert "difficulty_level" in full_text
    assert "StandardScaler" in full_text
    assert "DeepGuardMLP" in full_text
    assert "LogisticRegression" in full_text
    assert "training_curve.png" in full_text
    assert "confusion_matrix.png" in full_text
    assert "evaluation_metrics.json" in full_text
    assert "deepguard_artifacts.zip" in full_text


def test_notebook_no_hardcoded_local_paths(notebook_data):
    """Ensure no hardcoded developer absolute paths are present in code cells."""
    for i, cell in enumerate(notebook_data["cells"]):
        if cell["cell_type"] == "code":
            cell_code = "".join(cell["source"])
            assert "C:\\Users\\" not in cell_code, f"Found local user path in cell {i}"
            assert "D:\\web devfiles\\" not in cell_code, f"Found local project drive path in cell {i}"


def test_notebook_code_cells_syntax(notebook_data):
    """Verify all Python code cells parse without syntax errors."""
    for i, cell in enumerate(notebook_data["cells"]):
        if cell["cell_type"] == "code":
            code_lines = [
                line for line in cell["source"]
                if not line.strip().startswith("!") and not line.strip().startswith("%")
            ]
            code = "".join(code_lines)
            if code.strip():
                try:
                    ast.parse(code)
                except SyntaxError as e:
                    pytest.fail(f"Syntax error in notebook code cell {i}: {e}")


def test_notebook_random_seeds_set(notebook_data):
    """Verify that random seeds are set to 42 for reproducibility."""
    full_code = " ".join(
        "".join(cell.get("source", []))
        for cell in notebook_data["cells"]
        if cell["cell_type"] == "code"
    )
    assert "random_state=42" in full_code or "random_state = 42" in full_code
    assert "seed(42)" in full_code or "manual_seed(42)" in full_code


def test_notebook_explicit_device_handling(notebook_data):
    """Verify that PyTorch device configuration is explicit."""
    full_code = " ".join(
        "".join(cell.get("source", []))
        for cell in notebook_data["cells"]
        if cell["cell_type"] == "code"
    )
    assert 'torch.device("cuda" if torch.cuda.is_available() else "cpu")' in full_code


def test_notebook_has_markdown_descriptions(notebook_data):
    """Verify that code cells are preceded or accompanied by markdown explanations."""
    markdown_cells = [
        c for c in notebook_data["cells"] if c["cell_type"] == "markdown"
    ]
    code_cells = [
        c for c in notebook_data["cells"] if c["cell_type"] == "code"
    ]
    assert len(markdown_cells) >= 15
    assert len(code_cells) >= 15
