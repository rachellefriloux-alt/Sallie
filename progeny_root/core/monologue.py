"""Internal monologue (Gemini/INFJ debate)."""

import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from datetime import datetime

from .limbic import LimbicSystem
from .retrieval import MemorySystem
from .prompts import PERCEPTION_SYSTEM_PROMPT, GEMINI_SYSTEM_PROMPT, INFJ_SYSTEM_PROMPT, SYNTHESIS_SYSTEM_PROMPT
from .utils import setup_logging
from .llm_router import get_llm_router, LLMRouter
from .perception import get_perception_system, PerceptionSystem
from .synthesis import get_synthesis_system, SynthesisSystem

# Setup logging (writes to thoughts.log)
logger = setup_logging("monologue")

class OllamaClient:
    """
    Legacy client for Ollama - now deprecated in favor of LLMRouter.
    Kept for backward compatibility.
    """
    def __init__(self, base_url: str = "http://localhost:11434", default_model: str = "phi3:mini"):
        self.base_url = base_url
        self.default_model = default_model
        self._router = None

    def _get_router(self):
        if self._router is None:
            self._router = get_llm_router()
        return self._router

    def chat(self, system_prompt: str, user_prompt: str, model: Optional[str] = None) -> str:
        """Routes through LLMRouter (Gemini primary, Ollama fallback)."""
        router = self._get_router()
        return router.chat(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model,
            expect_json="json" in system_prompt.lower(),
        )

class MonologueSystem:
    """
    The Cognitive Core.
    Orchestrates the Perception -> Retrieval -> Divergent -> Convergent -> Synthesis loop.
    """
    def __init__(self, limbic: LimbicSystem, memory: MemorySystem):
        self.limbic = limbic
        self.memory = memory
        self.llm_client = OllamaClient()  # Now routes through LLMRouter
        self.perception = get_perception_system()
        self.synthesis = get_synthesis_system(limbic)

    def process(self, user_input: str) -> Dict[str, Any]:
        """
        Main Cognitive Loop.
        Returns both the cognitive trace AND the final synthesized response.
        """
        start_time = datetime.now()
        logger.info(f"Input received: {user_input}")

        # 1. Perception (The Amygdala Scan) - now uses dedicated system
        perception = self.perception.analyze(user_input)
        self._update_limbic_from_perception(perception)

        # 2. Retrieval (Context Gathering)
        context = self.memory.retrieve(user_input)
        context_str = self._format_context(context)

        # 3. Divergent Engine (Gemini - Generate Options)
        options = self._run_divergent(user_input, context_str)

        # 4. Convergent Anchor (INFJ - Filter & Select)
        decision = self._run_convergent(user_input, options, perception)

        # 5. Synthesis (Generate Final Response) - NEW!
        response_text = self.synthesis.generate(
            user_input=user_input,
            decision=decision,
            options=options,
            perception=perception,
            context=context_str,
        )

        # 6. Build result with response included
        result = {
            "timestamp": start_time.isoformat(),
            "input": user_input,
            "response": response_text,  # The actual response to show the user
            "perception": perception,
            "context_used": [c['text'] for c in context],
            "options": options,
            "decision": decision,
            "limbic_state": self.limbic.state.model_dump()
        }
        
        logger.info(f"Monologue Cycle Complete. Decision: {decision.get('selected_option_id')}")
        return result

    def _run_perception(self, user_input: str) -> Dict[str, Any]:
        """Step 1: Analyze urgency, load, and sentiment. (Legacy - now uses PerceptionSystem)"""
        return self.perception.analyze(user_input)

    def _update_limbic_from_perception(self, perception: Dict[str, Any]):
        """Updates Limbic System based on perception."""
        # Sentiment affects Valence
        sent = perception.get("sentiment", 0.0)
        # Urgency affects Arousal
        urgency = perception.get("urgency", 0.0)
        
        # Update Limbic State using keyword arguments
        self.limbic.update(
            delta_v=sent * 0.1,  # Small nudge to valence
            delta_a=urgency * 0.2 # Urgency increases arousal
        )

    def _run_divergent(self, user_input: str, context: str) -> Dict[str, Any]:
        """Step 3: Generate options (Gemini)."""
        prompt = GEMINI_SYSTEM_PROMPT.format(
            context_summary=context,
            user_input=user_input
        )
        response = self.llm_client.chat(
            system_prompt="You are the Divergent Engine. Generate 3 distinct options in JSON format.", 
            user_prompt=prompt,
            model="llama3" # Stronger reasoning model
        )
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"options": []}

    def _run_convergent(self, user_input: str, options: Dict[str, Any], perception: Dict[str, Any]) -> Dict[str, Any]:
        """Step 4: Select best option (INFJ)."""
        # We need to format the prompt with the options
        options_str = json.dumps(options.get("options", []), indent=2)
        
        # Note: INFJ_SYSTEM_PROMPT in prompts.py might need formatting placeholders
        # For now, we'll construct a prompt manually if the template isn't ready
        prompt = f"""
        User Input: {user_input}
        Perception: {json.dumps(perception)}
        Options Generated:
        {options_str}
        
        Select the best option that aligns with the Soul and Prime Directive.
        Output JSON: {{ "selected_option_id": "A", "rationale": "..." }}
        """
        
        response = self.llm_client.chat(
            system_prompt=INFJ_SYSTEM_PROMPT,
            user_prompt=prompt,
            model="llama3" # Stronger reasoning model
        )
        try:
            return json.loads(response)
        except json.JSONDecodeError:
            return {"selected_option_id": "None", "rationale": "Error parsing decision."}

    def _format_context(self, context_items: List[Dict[str, Any]]) -> str:
        if not context_items:
            return "No relevant past context."
        return "\n".join([f"- {item['text']} (Score: {item['score']:.2f})" for item in context_items])

# MockLLMClient removed as we now have OllamaClient.
# If tests fail, we can inject a mock into the MonologueSystem constructor.
