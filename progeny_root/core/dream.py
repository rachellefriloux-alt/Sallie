"""Dream Cycle automation and hygiene."""

import logging
import time
from datetime import datetime
from typing import List

from .limbic import LimbicSystem
from .retrieval import MemorySystem
# Avoid circular import by using Any or TYPE_CHECKING
from typing import Any

logger = logging.getLogger("system")

class DreamSystem:
    """
    Manages nightly maintenance, memory consolidation, and hygiene.
    """
    def __init__(self, limbic: LimbicSystem, memory: MemorySystem, monologue: Any):
        self.limbic = limbic
        self.memory = memory
        self.monologue = monologue

    def run_cycle(self):
        """
        The main Dream Cycle.
        1. Decay Limbic State (Arousal/Valence return to neutral).
        2. Consolidate Memories.
        3. Hygiene.
        """
        logger.info("Starting Dream Cycle...")
        start_time = time.time()

        # 1. Limbic Decay
        # Arousal decays towards 0.5 (Alert but calm)
        # Valence decays towards 0.0 (Neutral)
        
        current_arousal = self.limbic.state.arousal
        current_valence = self.limbic.state.valence
        
        # Decay by 20% towards baseline
        new_arousal = current_arousal - ((current_arousal - 0.5) * 0.2)
        new_valence = current_valence - (current_valence * 0.2)
        
        self.limbic.state.arousal = new_arousal
        self.limbic.state.valence = new_valence
        self.limbic.save()
        
        logger.info(f"Limbic Decay: Arousal {current_arousal:.2f}->{new_arousal:.2f}, Valence {current_valence:.2f}->{new_valence:.2f}")

        # 2. Memory Consolidation
        # Retrieve recent interactions to summarize
        # In a real system, we'd query by timestamp, but here we'll do a semantic search for "interaction"
        logger.info("Consolidating memories...")
        recent_mems = self.memory.retrieve("interaction", limit=10)
        
        if recent_mems:
            context_text = "\n".join([m['text'] for m in recent_mems])
            prompt = f"Summarize the following recent interactions into a single semantic fact:\n\n{context_text}"
            
            summary = self.monologue.llm_client.chat(
                system_prompt="You are the Hippocampus. Consolidate memories.",
                user_prompt=prompt,
                model="llama3"
            )
            
            # Store the summary
            self.memory.add(f"Consolidated Memory: {summary}", metadata={"type": "summary", "source": "dream"})
            logger.info(f"Consolidated {len(recent_mems)} memories into: {summary[:50]}...")
        else:
            logger.info("No recent memories to consolidate.")
        
        # 3. Reflection
        # Generate "Self-Knowledge" insights.
        reflection = self.monologue.llm_client.chat(
            system_prompt="You are the Mirror. Reflect on your recent state.",
            user_prompt=f"Current State: {self.limbic.state.model_dump()}",
            model="llama3"
        )
        logger.info(f"Reflection: {reflection[:50]}...")
        
        duration = time.time() - start_time
        logger.info(f"Dream Cycle complete in {duration:.2f}s")
        return {"status": "complete", "duration": duration}
