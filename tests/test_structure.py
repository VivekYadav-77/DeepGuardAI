"""
DeepGuard AI — Phase 8 Structure Unit Tests
===========================================
Tests project directory layout, stub/implementation files, .gitignore,
requirements.txt, and reports placeholders according to docs/phase8_structure.md.
"""

from pathlib import Path
import pytest

ROOT_DIR = Path(__file__).resolve().parent.parent


def test_root_directories_exist():
    """Verify that all required root directories exist."""
    required_dirs = ["src", "notebooks", "model", "reports", "tests", "docs"]
    for dirname in required_dirs:
        dir_path = ROOT_DIR / dirname
        assert dir_path.exists(), f"Required directory missing: {dirname}"
        assert dir_path.is_dir(), f"Path should be a directory: {dirname}"


def test_src_package_structure():
    """Verify that src is a Python package containing all expected modules."""
    src_dir = ROOT_DIR / "src"
    assert (src_dir / "__init__.py").exists(), "src/__init__.py is missing"
    
    required_modules = ["model.py", "preprocessing.py", "inference.py", "validation.py"]
    for module in required_modules:
        mod_path = src_dir / module
        assert mod_path.exists(), f"src/{module} is missing"
        assert mod_path.stat().st_size > 0, f"src/{module} is empty"


def test_reports_placeholders_exist():
    """Verify that reports placeholder files exist."""
    reports_dir = ROOT_DIR / "reports"
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
    """Verify that requirements.txt exists and contains core ML and app packages."""
    req_file = ROOT_DIR / "requirements.txt"
    assert req_file.exists(), "requirements.txt is missing"
    content = req_file.read_text(encoding="utf-8").lower()
    
    expected_packages = [
        "torch",
        "pandas",
        "numpy",
        "scikit-learn",
        "joblib",
        "matplotlib",
    ]
    for pkg in expected_packages:
        assert pkg in content, f"Expected package '{pkg}' missing from requirements.txt"


def test_gitignore_rules():
    """Verify that .gitignore exists and contains critical ignore rules."""
    gitignore_file = ROOT_DIR / ".gitignore"
    assert gitignore_file.exists(), ".gitignore is missing"
    content = gitignore_file.read_text(encoding="utf-8")
    
    required_patterns = [
        "__pycache__",
        ".venv",
        "data/",
        "*.csv",
        "model/*.pth",
        "model/*.joblib",
        ".env",
    ]
    for pattern in required_patterns:
        assert pattern in content, f"Pattern '{pattern}' missing from .gitignore"


def test_pytest_configuration():
    """Verify that pytest.ini exists and configures test discovery."""
    ini_file = ROOT_DIR / "pytest.ini"
    assert ini_file.exists(), "pytest.ini is missing"
    content = ini_file.read_text(encoding="utf-8")
    assert "[pytest]" in content
    assert "testpaths = tests" in content


def test_app_entrypoint_exists():
    """Verify that app.py root entry point exists."""
    app_file = ROOT_DIR / "app.py"
    assert app_file.exists(), "app.py is missing"
    assert app_file.stat().st_size > 0, "app.py is empty"


def test_all_phase_docs_exist():
    """Verify that all phase documentation files exist in docs/."""
    docs_dir = ROOT_DIR / "docs"
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
