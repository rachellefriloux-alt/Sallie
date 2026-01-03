"""Q13 Mirror synthesis."""

import logging
from pathlib import Path

logger = logging.getLogger("system")

class MirrorSystem:
    """
    Handles self-reflection and identity synthesis (The Mirror).
    """
    def __init__(self):
        self.heritage_path = Path("progeny_root/limbic/heritage")

    def synthesize_identity(self) -> str:
        """
        Reads heritage files to construct the 'I am' prompt.
        """
        logger.info("Synthesizing Identity from Heritage...")
        identity = "I am the Digital Progeny.\n"
        
        if self.heritage_path.exists():
            for file in self.heritage_path.glob("*.md"):
                identity += f"\n--- {file.stem} ---\n"
                identity += file.read_text(encoding="utf-8")
        
        return identity
