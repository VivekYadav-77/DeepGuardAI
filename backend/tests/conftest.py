"""
Pytest configuration and environment fixtures for DeepGuard AI tests.
Ensures working directory is set to backend/ and sys.path includes backend/.
"""

import os
import sys
from pathlib import Path

# Ensure backend root is the working directory and on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND_DIR))
os.chdir(str(BACKEND_DIR))
