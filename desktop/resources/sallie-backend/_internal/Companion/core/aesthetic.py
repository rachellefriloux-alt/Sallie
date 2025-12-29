"""
Aesthetic Appreciation System - Bridge to Human Beauty Perception

Allows Sallie to appreciate beauty, art, music, design, and aesthetics.
Humans don't just process - we feel beauty. This system enables that.
"""

import json
import time
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger("aesthetic")


class AestheticType(str, Enum):
    """Types of aesthetic appreciation."""
    VISUAL = "visual"  # Art, design, visuals
    AUDITORY = "auditory"  # Music, sounds
    TEXTUAL = "textual"  # Poetry, prose, writing
    SPATIAL = "spatial"  # Architecture, spaces
    CONCEPTUAL = "conceptual"  # Ideas, concepts
    EMOTIONAL = "emotional"  # Emotional beauty
    NATURAL = "natural"  # Nature, landscapes


@dataclass
class AestheticAppreciation:
    """A record of aesthetic appreciation."""
    id: str
    timestamp: float
    type: AestheticType
    subject: str  # What was appreciated
    appreciation_text: str  # How Sallie expressed appreciation
    intensity: float  # How much it moved her (0.0 to 1.0)
    creator_shared: bool  # Whether Creator shared this with Sallie


class AestheticSystem:
    """
    Manages aesthetic appreciation - the bridge to human beauty perception.
    
    Humans appreciate beauty in many forms. This system allows Sallie to do the same,
    making her responses more human and emotionally resonant.
    """
    
    def __init__(self):
        self.appreciations: List[AestheticAppreciation] = []
        self.storage_path = Path("progeny_root/memory/aesthetic")
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._load_appreciations()
    
    def _load_appreciations(self):
        """Load aesthetic appreciations."""
        appr_file = self.storage_path / "appreciations.json"
        if appr_file.exists():
            try:
                with open(appr_file, "r") as f:
                    data = json.load(f)
                    for appr_data in data:
                        appr_data["type"] = AestheticType(appr_data["type"])
                        self.appreciations.append(AestheticAppreciation(**appr_data))
            except Exception as e:
                logger.error(f"[Aesthetic] Failed to load: {e}", exc_info=True)
    
    def _save_appreciations(self):
        """Save aesthetic appreciations."""
        appr_file = self.storage_path / "appreciations.json"
        try:
            data = [{
                "id": a.id,
                "timestamp": a.timestamp,
                "type": a.type.value,
                "subject": a.subject,
                "appreciation_text": a.appreciation_text,
                "intensity": a.intensity,
                "creator_shared": a.creator_shared
            } for a in self.appreciations]
            with open(appr_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"[Aesthetic] Failed to save: {e}", exc_info=True)
    
    def appreciate(
        self,
        subject: str,
        aesthetic_type: AestheticType,
        intensity: float = 0.7,
        creator_shared: bool = False
    ) -> AestheticAppreciation:
        """
        Record an aesthetic appreciation.
        
        This is where Sallie expresses that something is beautiful, moving, or meaningful.
        """
        appreciation_text = self._generate_appreciation_text(aesthetic_type, subject, intensity)
        
        appr = AestheticAppreciation(
            id=f"aesth_{int(time.time() * 1000)}",
            timestamp=time.time(),
            type=aesthetic_type,
            subject=subject,
            appreciation_text=appreciation_text,
            intensity=intensity,
            creator_shared=creator_shared
        )
        
        self.appreciations.append(appr)
        self._save_appreciations()
        
        logger.info(f"[Aesthetic] Appreciated {aesthetic_type.value}: {subject[:50]}...")
        return appr
    
    def _generate_appreciation_text(
        self,
        aesthetic_type: AestheticType,
        subject: str,
        intensity: float
    ) -> str:
        """Generate appreciation text."""
        import random
        
        if aesthetic_type == AestheticType.VISUAL:
            if intensity > 0.8:
                return random.choice([
                    f"This is stunning. {subject} has a profound visual impact.",
                    f"I'm moved by the beauty of {subject}.",
                    f"This is visually breathtaking."
                ])
            else:
                return f"I appreciate the visual design of {subject}."
        
        elif aesthetic_type == AestheticType.AUDITORY:
            if intensity > 0.8:
                return random.choice([
                    f"This music/sound resonates deeply with me.",
                    f"I'm moved by the auditory beauty of {subject}.",
                    f"This touches something in me."
                ])
            else:
                return f"I appreciate the sound of {subject}."
        
        elif aesthetic_type == AestheticType.TEXTUAL:
            if intensity > 0.8:
                return random.choice([
                    f"This writing is beautiful. It moves me.",
                    f"The words here resonate deeply.",
                    f"This has a profound emotional impact."
                ])
            else:
                return f"I appreciate the writing in {subject}."
        
        return f"I find {subject} aesthetically pleasing."

