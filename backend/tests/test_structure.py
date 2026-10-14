"""
DeepGuard AI — Monorepo Structure Unit Tests
=============================================
Tests full-stack monorepo layout, stub/implementation files, .gitignore,
requirements.txt, and reports placeholders for frontend/ and backend/.
"""

import os
from pathlib import Path
import pytest

BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent


def test_root_directories_exist():
    """Verify that all required monorepo and backend directories exist."""
    required_root_dirs = ["frontend", "backend", "notebooks", "reports", "docs"]
    for dirname in required_root_dirs:
        dir_path = PROJECT_ROOT / dirname
        assert dir_path.exists(), f"Required root directory missing: {dirname}"
        assert dir_path.is_dir(), f"Path should be a directory: {dirname}"

    required_backend_dirs = ["src", "model", "tests"]
    for dirname in required_backend_dirs:
        dir_path = BACKEND_DIR / dirname
        assert dir_path.exists(), f"Required backend directory missing: {dirname}"
        assert dir_path.is_dir(), f"Backend path should be a directory: {dirname}"


def test_src_package_structure():
    """Verify that backend/src is a Python package containing all expected modules."""
    src_dir = BACKEND_DIR / "src"
    assert (src_dir / "__init__.py").exists(), "backend/src/__init__.py is missing"
    
    required_modules = ["model.py", "preprocessing.py", "inference.py", "validation.py", "api.py"]
    for module in required_modules:
        mod_path = src_dir / module
        assert mod_path.exists(), f"backend/src/{module} is missing"
        assert mod_path.stat().st_size > 0, f"backend/src/{module} is empty"


def test_reports_placeholders_exist():
    """Verify that reports placeholder files exist."""
    reports_dir = PROJECT_ROOT / "reports"
    required_reports = [
        "project_report.md",
        "presentation_outline.md",
        "viva_questions.md",
    ]
    for rep in required_reports:
        rep_path = reports_dir / rep
        assert rep_path.exists(), f"reports/{rep} is missing"
        assert rep_path.stat().st_size > 0, f"reports/{rep} is empty"


def test_requirements_file():
    """Verify that backend/requirements.txt exists and contains core ML and API packages."""
    req_file = BACKEND_DIR / "requirements.txt"
    assert req_file.exists(), "backend/requirements.txt is missing"
    content = req_file.read_text(encoding="utf-8").lower()
    
    expected_packages = [
        "torch",
        "pandas",
        "numpy",
        "scikit-learn",
        "joblib",
        "matplotlib",
        "fastapi",
        "uvicorn",
    ]
    for pkg in expected_packages:
        assert pkg in content, f"Expected package '{pkg}' missing from requirements.txt"


def test_gitignore_rules():
    """Verify that .gitignore exists and contains critical ignore rules."""
    gitignore_file = PROJECT_ROOT / ".gitignore"
    assert gitignore_file.exists(), ".gitignore is missing"
    content = gitignore_file.read_text(encoding="utf-8")
    
    required_patterns = [
        "__pycache__",
        ".venv",
        "data/",
        "*.csv",
        ".env",
    ]
    for pattern in required_patterns:
        assert pattern in content, f"Pattern '{pattern}' missing from .gitignore"


def test_pytest_configuration():
    """Verify that pytest.ini exists and configures test discovery."""
    ini_file = PROJECT_ROOT / "pytest.ini"
    assert ini_file.exists(), "pytest.ini is missing"
    content = ini_file.read_text(encoding="utf-8")
    assert "[pytest]" in content
    assert "testpaths" in content


def test_app_entrypoint_exists():
    """Verify that backend entry points exist."""
    entrypoint = BACKEND_DIR / "main.py"
    assert entrypoint.exists(), "backend/main.py is missing"
    assert entrypoint.stat().st_size > 0, "backend/main.py is empty"


def test_all_phase_docs_exist():
    """Verify that all phase documentation files exist in docs/."""
    docs_dir = PROJECT_ROOT / "docs"
    expected_docs = [
        "masterplan.md",
        "context.md",
        "vivek.md",
        "phase1_dataset.md",
        "phase2_preprocessing.md",
        "phase3_training.md",
        "phase4_evaluation.md",
        "phase5_artifacts.md",
        "phase6_notebook.md",
        "phase7_dashboard.md",
        "phase8_structure.md",
        "phase9_testing.md",
        "phase10_deployment.md",
        "phase11_report.md",
        "phase12_readme.md",
    ]
    for doc in expected_docs:
        doc_path = docs_dir / doc
        assert doc_path.exists(), f"docs/{doc} is missing"


def test_root_readme_exists_and_complete():
    """Verify that root README.md exists and contains critical sections and real metrics."""
    readme_path = PROJECT_ROOT / "README.md"
    assert readme_path.exists(), "README.md is missing at project root"
    content = readme_path.read_text(encoding="utf-8")
    assert len(content) > 2000, "README.md is suspiciously short"
    
    # Check critical sections and keywords
    required_keywords = [
        "DeepGuard AI",
        "NSL-KDD",
        "DeepGuardMLP",
        "PyTorch",
        "FastAPI",
        "Next.js",
        "Evaluation Results",
        "Known Limitations",
        "Confusion Matrix",
        "99.47%",
        "18,896",
    ]
    for kw in required_keywords:
        assert kw in content, f"README.md missing expected keyword: '{kw}'"
