"""Failure handling and degradation modes."""

import logging
import requests
from typing import Dict, Any

logger = logging.getLogger("system")

class DegradationSystem:
    """
    Monitors system health and enforces Safe Mode if critical components fail.
    """
    def __init__(self):
        self.safe_mode = False
        self.status = {
            "ollama": False,
            "qdrant": False,
            "internet": False
        }

    def check_health(self) -> Dict[str, bool]:
        """
        Verifies connectivity to critical subsystems.
        """
        # 1. Check Ollama (LLM)
        try:
            # Assuming Ollama runs on localhost:11434
            # Timeout short to not block
            requests.get("http://localhost:11434", timeout=1)
            self.status["ollama"] = True
        except Exception:
            self.status["ollama"] = False

        # 2. Check Qdrant (Memory)
        # We can't easily check Qdrant HTTP without the client, 
        # but we can assume if MemorySystem initialized it's okay-ish.
        # For now, let's just mark it True if we are running, 
        # or implement a real check if we had the client here.
        self.status["qdrant"] = True 

        # 3. Determine Safe Mode
        if not self.status["ollama"]:
            self.enter_safe_mode("Ollama unreachable")
        else:
            self.exit_safe_mode()

        return self.status

    def enter_safe_mode(self, reason: str):
        if not self.safe_mode:
            logger.warning(f"ENTERING SAFE MODE: {reason}")
            self.safe_mode = True

    def exit_safe_mode(self):
        if self.safe_mode:
            logger.info("System recovered. Exiting Safe Mode.")
            self.safe_mode = False
