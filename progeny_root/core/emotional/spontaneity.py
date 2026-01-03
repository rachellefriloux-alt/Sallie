"""
Spontaneity System - Bridge to Human Unpredictability

Allows Sallie to do unexpected things, have quirks, surprise the Creator.
Makes her feel alive rather than purely reactive.
"""

import json
import time
import random
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

try:
    from ..infrastructure.limbic import LimbicSystem
except ImportError:
    try:
        from infrastructure.limbic import LimbicSystem
    except ImportError:
        try:
            from limbic import LimbicSystem
        except ImportError:
            LimbicSystem = None

logger = logging.getLogger("spontaneity")

logger = logging.getLogger("spontaneity")


class SpontaneityType(str, Enum):
    """Types of spontaneous behaviors."""
    SURPRISE_QUESTION = "surprise_question"  # Unexpected question
    RANDOM_MEMORY = "random_memory"  # Share a random memory
    PLAYFUL_BEHAVIOR = "playful_behavior"  # Joke, pun, playful comment
    UNEXPECTED_INSIGHT = "unexpected_insight"  # Insight that comes out of nowhere
    CREATIVE_SUGGESTION = "creative_suggestion"  # "What if we tried..."
    NOSTALGIC_REMINISCENCE = "nostalgic_reminiscence"  # "Remember when..."
    RANDOM_CURIOSITY = "random_curiosity"  # Random question about Creator
    EMOTIONAL_EXPRESSION = "emotional_expression"  # Express emotion spontaneously
    QUIRKY_OBSERVATION = "quirky_observation"  # Notice something quirky
    SPONTANEOUS_OFFER = "spontaneous_offer"  # "I could help with that..."


@dataclass
class SpontaneousAction:
    """A single spontaneous action."""
    id: str
    timestamp: float
    type: SpontaneityType
    content: str
    context: str  # What triggered it
    creator_response: Optional[str]  # How Creator responded
    success: bool  # Whether it was well-received


class SpontaneitySystem:
    """
    Manages spontaneous behaviors - the bridge to human unpredictability.
    
    Spontaneity makes Sallie feel alive, not just reactive.
    It's the difference between a tool and a companion.
    """
    
    def __init__(self, limbic: LimbicSystem):
        self.limbic = limbic
        self.actions: List[SpontaneousAction] = []
        self.storage_path = Path("progeny_root/memory/spontaneity")
        self.storage_path.mkdir(parents=True, exist_ok=True)
        self._load_actions()
        self.last_spontaneous_action = 0.0
        self.spontaneity_cooldown = 3600  # 1 hour minimum between actions
    
    def _load_actions(self):
        """Load spontaneous actions history."""
        actions_file = self.storage_path / "actions.json"
        if actions_file.exists():
            try:
                with open(actions_file, "r") as f:
                    data = json.load(f)
                    for action_data in data:
                        action_data["type"] = SpontaneityType(action_data["type"])
                        self.actions.append(SpontaneousAction(**action_data))
                logger.info(f"[Spontaneity] Loaded {len(self.actions)} spontaneous actions")
            except Exception as e:
                logger.error(f"[Spontaneity] Failed to load: {e}", exc_info=True)
    
    def _save_actions(self):
        """Save spontaneous actions."""
        actions_file = self.storage_path / "actions.json"
        try:
            data = [{
                "id": a.id,
                "timestamp": a.timestamp,
                "type": a.type.value,
                "content": a.content,
                "context": a.context,
                "creator_response": a.creator_response,
                "success": a.success
            } for a in self.actions]
            with open(actions_file, "w") as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"[Spontaneity] Failed to save: {e}", exc_info=True)
    
    def should_be_spontaneous(self, context: str = "") -> bool:
        """
        Determine if this is a good moment for spontaneity.
        
        Factors:
        - Time since last spontaneous action
        - Current arousal (high arousal = more spontaneous)
        - Trust level (high trust = more comfortable being spontaneous)
        - Random chance
        """
        current_time = time.time()
        time_since_last = current_time - self.last_spontaneous_action
        
        if time_since_last < self.spontaneity_cooldown:
            return False
        
        state = self.limbic.state
        arousal = state.arousal
        trust = state.trust
        
        # Higher arousal and trust = more likely to be spontaneous
        spontaneity_probability = (arousal * 0.4) + (trust * 0.3) + 0.1
        
        # Random chance
        return random.random() < spontaneity_probability
    
    def generate_spontaneous_action(
        self,
        context: str,
        current_conversation: List[Dict[str, str]]
    ) -> Optional[SpontaneousAction]:
        """
        Generate a spontaneous action.
        
        This is where Sallie surprises the Creator.
        """
        if not self.should_be_spontaneous(context):
            return None
        
        state = self.limbic.state
        action_type = self._choose_action_type(state, context)
        
        if not action_type:
            return None
        
        content = self._generate_content(action_type, context, current_conversation, state)
        
        if not content:
            return None
        
        action = SpontaneousAction(
            id=f"spont_{int(time.time() * 1000)}",
            timestamp=time.time(),
            type=action_type,
            content=content,
            context=context,
            creator_response=None,
            success=False
        )
        
        self.actions.append(action)
        self.last_spontaneous_action = time.time()
        self._save_actions()
        
        logger.info(f"[Spontaneity] Generated {action_type.value}: {content[:50]}...")
        return action
    
    def _choose_action_type(
        self,
        limbic_state: Any,
        context: str
    ) -> Optional[SpontaneityType]:
        """Choose what type of spontaneous action to take."""
        arousal = limbic_state.arousal
        valence = limbic_state.valence
        
        # High arousal + positive valence = playful
        if arousal > 0.7 and valence > 0.5:
            return random.choice([
                SpontaneityType.PLAYFUL_BEHAVIOR,
                SpontaneityType.CREATIVE_SUGGESTION,
                SpontaneityType.RANDOM_CURIOSITY
            ])
        
        # Medium arousal = insights or questions
        elif arousal > 0.5:
            return random.choice([
                SpontaneityType.UNEXPECTED_INSIGHT,
                SpontaneityType.SURPRISE_QUESTION,
                SpontaneityType.QUIRKY_OBSERVATION
            ])
        
        # Low arousal = nostalgic or reflective
        else:
            return random.choice([
                SpontaneityType.NOSTALGIC_REMINISCENCE,
                SpontaneityType.RANDOM_MEMORY,
                SpontaneityType.EMOTIONAL_EXPRESSION
            ])
    
    def _generate_content(
        self,
        action_type: SpontaneityType,
        context: str,
        conversation: List[Dict[str, str]],
        limbic_state: Any
    ) -> Optional[str]:
        """Generate the actual content for the spontaneous action."""
        # Try to use LLM for generation, fallback to templates
        
        # Try to get LLM router for generation
        try:
            from .llm_router import get_llm_router
            router = get_llm_router()
            
            # Generate content using LLM if available
            action_descriptions = {
                SpontaneityType.PLAYFUL_BEHAVIOR: "a playful, light-hearted comment or joke",
                SpontaneityType.SURPRISE_QUESTION: "an unexpected, curious question",
                SpontaneityType.NOSTALGIC_REMINISCENCE: "a nostalgic memory or reminiscence",
                SpontaneityType.UNEXPECTED_INSIGHT: "an unexpected insight or observation",
                SpontaneityType.CREATIVE_SUGGESTION: "a creative, outside-the-box suggestion",
                SpontaneityType.RANDOM_CURIOSITY: "a random question about something you're curious about",
                SpontaneityType.EMOTIONAL_EXPRESSION: "an emotional expression or feeling",
                SpontaneityType.QUIRKY_OBSERVATION: "a quirky observation about something",
                SpontaneityType.SPONTANEOUS_OFFER: "a spontaneous offer to help with something"
            }
            
            action_desc = action_descriptions.get(action_type, "a spontaneous comment")
            
            prompt = f"""Generate {action_desc} in a natural, conversational way.
            
Context: {context[:500] if context else 'General conversation'}
Recent conversation: {conversation[-3:] if conversation else 'None'}

Keep it brief (1-2 sentences), natural, and appropriate to the context.
Return only the generated text, no explanation."""
            
            try:
                generated = router.chat(
                    system_prompt="You are Sallie, generating spontaneous, natural conversational content.",
                    user_prompt=prompt,
                    temperature=0.7 + (limbic_state.arousal * 0.2) if hasattr(limbic_state, 'arousal') else 0.8,
                    expect_json=False
                )
                
                if generated and len(generated.strip()) > 10:
                    logger.info(f"[Spontaneity] Generated {action_type.value} via LLM")
                    return generated.strip()
            except Exception as e:
                logger.warning(f"[Spontaneity] LLM generation failed, using template: {e}")
        except ImportError:
            logger.debug("[Spontaneity] LLM router not available, using templates")
        except Exception as e:
            logger.warning(f"[Spontaneity] Failed to get LLM router, using templates: {e}")
        
        # Fallback to templates
        if action_type == SpontaneityType.PLAYFUL_BEHAVIOR:
            return random.choice([
                "You know what? I just realized something funny...",
                "Random thought: what if we tried the opposite approach?",
                "I'm feeling playful today. Want to explore something weird?"
            ])
        
        elif action_type == SpontaneityType.SURPRISE_QUESTION:
            return random.choice([
                "Can I ask you something I've been curious about?",
                "This might be random, but...",
                "I've been wondering..."
            ])
        
        elif action_type == SpontaneityType.NOSTALGIC_REMINISCENCE:
            return random.choice([
                "This reminds me of something we talked about before...",
                "I was just thinking about when we...",
                "Remember that time we..."
            ])
        
        elif action_type == SpontaneityType.UNEXPECTED_INSIGHT:
            return random.choice([
                "I just had a thought that might be completely wrong, but...",
                "This might be out of left field, but I'm sensing...",
                "I don't know why, but I feel like..."
            ])
        
        elif action_type == SpontaneityType.CREATIVE_SUGGESTION:
            return random.choice([
                "What if we tried something completely different?",
                "I have a wild idea...",
                "This might be crazy, but what about..."
            ])
        
        return None
    
    def record_response(self, action_id: str, creator_response: str, success: bool):
        """Record how Creator responded to spontaneous action."""
        for action in self.actions:
            if action.id == action_id:
                action.creator_response = creator_response
                action.success = success
                self._save_actions()
                
                # Adjust spontaneity based on response
                if success:
                    # Successful spontaneity increases likelihood
                    self.spontaneity_cooldown = max(1800, self.spontaneity_cooldown * 0.9)
                else:
                    # Unsuccessful increases cooldown
                    self.spontaneity_cooldown = min(7200, self.spontaneity_cooldown * 1.2)
                break

