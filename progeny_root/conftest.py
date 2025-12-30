"""Pytest configuration for Sallie progeny_root tests.
Adds repo subpackages to sys.path so tests can import project modules.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).parent
# Add repo root so `core` and `progeny_root.core` resolve to unified package
sys.path.insert(0, str(ROOT_DIR))
