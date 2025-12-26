"""Response generation and synthesis (The Voice).

Takes the decision from the monologue system and generates the final response,
applying limbic state to determine tone, style, and energy level.
"""

import json
from typing import Dict, Any, Optional

from .limbic import LimbicSystem, Posture
from .llm_router import get_llm_router
from .prompts import SYNTHESIS_SYSTEM_PROMPT
from .utils import setup_logging

logger = setup_logging("synthesis")


class SynthesisSystem:
    """
    The Voice - final stage of cognitive processing.
    Generates natural language responses with appropriate tone based on limbic state.
    """

    def __init__(self, limbic: LimbicSystem):
        self.limbic = limbic
        self.router = None  # Lazy init

    def _get_router(self):
        """Lazy initialization of LLM router."""
        if self.router is None:
            self.router = get_llm_router()
        return self.router

    def generate(
        self,
        user_input: str,
        decision: Dict[str, Any],
        options: Dict[str, Any],
        perception: Dict[str, Any],
        context: str = "",
    ) -> str:
        """
        Generate the final response based on the cognitive loop output.
        
        Args:
            user_input: Original user message
            decision: Selected option from convergent anchor
            options: All generated options from divergent engine
            perception: Analysis from perception system
            context: Retrieved memory context
            
        Returns:
            Natural language response string
        """
        router = self._get_router()
        state = self.limbic.state
        
        # Determine posture (use perception suggestion or current state)
        suggested_posture = perception.get("suggested_posture", state.posture.value)
        
        # Get the selected strategy content
        selected_id = decision.get("selected_option_id", "A")
        selected_strategy = ""
        
        options_list = options.get("options", [])
        for opt in options_list:
            if opt.get("id") == selected_id:
                selected_strategy = opt.get("content", "")
                break
        
        # If no strategy found, use the rationale
        if not selected_strategy:
            selected_strategy = decision.get("rationale", decision.get("reasoning", "Respond helpfully."))
        
        # Build synthesis prompt with limbic state
        synthesis_prompt = SYNTHESIS_SYSTEM_PROMPT.format(
            posture=suggested_posture,
            warmth=state.warmth,
            arousal=state.arousal,
            selected_strategy=selected_strategy,
        )
        
        # Build context for synthesis
        user_prompt = f"""
User said: {user_input}

Context from memory:
{context if context else "No relevant context."}

Selected approach: {selected_strategy}

Modifications: {decision.get("modifications", "None")}

Generate a natural response. Remember:
- ONE question maximum (or none)
- Match the {suggested_posture} voice
- Warmth level: {state.warmth:.2f} (higher = warmer tone)
- Energy level: {state.arousal:.2f} (higher = more energetic)
"""
        
        try:
            response = router.chat(
                system_prompt=synthesis_prompt,
                user_prompt=user_prompt,
                temperature=0.7 + (state.arousal * 0.2),  # More creative when aroused
                expect_json=False,  # Natural language output
            )
            
            # Clean up any formatting issues
            response = self._clean_response(response)
            
            logger.info(f"Synthesis complete: {len(response)} chars, posture={suggested_posture}")
            
            return response
            
        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            # Fallback: return the strategy directly
            return selected_strategy if selected_strategy else "I'm here. What do you need?"

    def _clean_response(self, text: str) -> str:
        """Clean up response text."""
        # Remove any JSON artifacts
        text = text.strip()
        
        # Remove markdown code blocks if present
        if text.startswith("```"):
            lines = text.split("\n")
            lines = [l for l in lines if not l.startswith("```")]
            text = "\n".join(lines)
        
        # Remove quotes if the whole response is quoted
        if text.startswith('"') and text.endswith('"'):
            text = text[1:-1]
        
        return text.strip()

    def quick_response(self, template: str, **kwargs) -> str:
        """
        Generate a quick response without full LLM call.
        Used for system messages and acknowledgments.
        """
        state = self.limbic.state
        
        # Adjust template based on warmth
        if state.warmth > 0.7:
            # Add warmth markers
            template = template.replace(".", "! ")
        elif state.warmth < 0.3:
            # More formal
            template = template.replace("!", ".")
        
        return template.format(**kwargs) if kwargs else template


# Singleton instance
_synthesis: Optional[SynthesisSystem] = None


def get_synthesis_system(limbic: Optional[LimbicSystem] = None) -> SynthesisSystem:
    """Get or create the global synthesis system."""
    global _synthesis
    if _synthesis is None:
        if limbic is None:
            limbic = LimbicSystem()
        _synthesis = SynthesisSystem(limbic)
    return _synthesis
