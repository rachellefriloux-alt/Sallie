"""Unified core package under progeny_root.
Delegates to canonical Companion core implementation (single-soul).
"""
from __future__ import annotations

from pathlib import Path

_PACKAGE_DIR = Path(__file__).parent
_ROOT = _PACKAGE_DIR.parent
_COMPANION_CORE = (_ROOT / "Companion" / "core").resolve()
_PEER_CORE = (_ROOT / "Peer" / "core").resolve()

__path__ = [
    str(p)
    for p in (_COMPANION_CORE, _PACKAGE_DIR, _PEER_CORE)
    if p.exists()
]
