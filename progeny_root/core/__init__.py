"""Unified core package (single-soul).
Bridges imports to the canonical Companion core implementation.
"""
from __future__ import annotations

from pathlib import Path

_PACKAGE_DIR = Path(__file__).parent
_COMPANION_CORE = (_PACKAGE_DIR.parent / "Companion" / "core").resolve()
_PEER_CORE = (_PACKAGE_DIR.parent / "Peer" / "core").resolve()

__path__ = [
    str(p)
    for p in (_COMPANION_CORE, _PACKAGE_DIR, _PEER_CORE)
    if p.exists()
]
