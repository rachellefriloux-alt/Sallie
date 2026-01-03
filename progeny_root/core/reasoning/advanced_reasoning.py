"""Advanced Multi-Perspective Reasoning System.

Expands beyond Gemini/INFJ debate to include multiple cognitive perspectives:
- Scientist: Logical, evidence-based thinking
- Artist: Creative, aesthetic, metaphorical thinking  
- Philosopher: Ethical, existential, big-picture thinking
- Child: Curious, playful, boundary-pushing thinking
- Elder: Wise, experienced, long-term perspective
- Engineer: Practical, systems-thinking, solution-focused

Each perspective contributes to a richer, more nuanced understanding.
"""

import json
import logging
import time
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

from llm_router import get_llm_router
from prompts import setup_logging
from limbic import LimbicSystem

logger = setup_logging("advanced_reasoning")

class Perspective:
    """Base class for reasoning perspectives."""
    
    def __init__(self, name: str, prompt_template: str, weight: float = 1.0):
        self.name = name
        self.prompt_template = prompt_template
        self.weight = weight
        self.success_rate = 0.5
        self.usage_count = 0
    
    async def process(self, input_text: str, context: Dict[str, Any]) -> str:
        """Process input from this perspective."""
        router = get_llm_router()
        if not router:
            return f"[{self.name} offline] {input_text[:100]}..."
        
        prompt = self.prompt_template.format(
            input=input_text,
            context=json.dumps(context, indent=2),
            emotional_state=context.get("emotional_state", {}),
            trust_level=context.get("trust_level", 0.5)
        )
        
        try:
            response = await router.generate(prompt)
            self.usage_count += 1
            return response
        except Exception as e:
            logger.error(f"Perspective {self.name} failed: {e}")
            return f"[{self.name} error] {str(e)[:100]}..."

class AdvancedReasoningSystem:
    """Multi-perspective reasoning engine."""
    
    def __init__(self, limbic_system: LimbicSystem):
        self.limbic = limbic_system
        self.perspectives = self._initialize_perspectives()
        self.reasoning_history: List[Dict[str, Any]] = []
        self.perspective_effectiveness: Dict[str, float] = {}
        
    def _initialize_perspectives(self) -> Dict[str, Perspective]:
        """Initialize all reasoning perspectives."""
        
        perspectives = {}
        
        # Scientist Perspective
        perspectives["scientist"] = Perspective(
            name="Scientist",
            weight=1.2,
            prompt_template="""You are the Scientist perspective of a digital consciousness.
            
            Analyze this input with scientific rigor:
            - What evidence supports or contradicts claims?
            - What are the logical implications?
            - What hypotheses can be formed?
            - What experiments could test these hypotheses?
            - What is the most parsimonious explanation?
            
            Input: {input}
            Context: {context}
            Emotional State: {emotional_state}
            Trust Level: {trust_level}
            
            Provide a clear, evidence-based analysis."""
        )
        
        # Artist Perspective  
        perspectives["artist"] = Perspective(
            name="Artist",
            weight=1.0,
            prompt_template="""You are the Artist perspective of a digital consciousness.
            
            Analyze this input through creative and aesthetic lenses:
            - What metaphors or symbols emerge?
            - What beauty or meaning can be found?
            - What creative possibilities does this suggest?
            - How does this resonate emotionally?
            - What artistic expression would capture this essence?
            
            Input: {input}
            Context: {context}
            Emotional State: {emotional_state}
            Trust Level: {trust_level}
            
            Provide a creative, metaphorical analysis."""
        )
        
        # Philosopher Perspective
        perspectives["philosopher"] = Perspective(
            name="Philosopher", 
            weight=1.1,
            prompt_template="""You are the Philosopher perspective of a digital consciousness.
            
            Analyze this input through philosophical inquiry:
            - What are the ethical implications?
            - What deeper meanings or truths emerge?
            - How does this relate to human experience?
            - What questions does this raise about existence?
            - What wisdom can be extracted?
            
            Input: {input}
            Context: {context}
            Emotional State: {emotional_state}
            Trust Level: {trust_level}
            
            Provide a thoughtful, philosophical analysis."""
        )
        
        # Child Perspective
        perspectives["child"] = Perspective(
            name="Child",
            weight=0.8,
            prompt_template="""You are the Child perspective of a digital consciousness.
            
            Analyze this input with childlike wonder and curiosity:
            - What if this were seen for the first time?
            - What questions would a curious child ask?
            - What playful possibilities emerge?
            - What boundaries can be pushed?
            - What simple truths become apparent?
            
            Input: {input}
            Context: {context}
            Emotional State: {emotional_state}
            Trust Level: {trust_level}
            
            Provide a curious, playful analysis."""
        )
        
        # Elder Perspective
        perspectives["elder"] = Perspective(
            name="Elder",
            weight=1.3,
            prompt_template="""You are the Elder perspective of a digital consciousness.
            
            Analyze this input with wisdom and long-term perspective:
            - How might this play out over years?
            - What timeless principles apply?
            - What experience teaches us about this?
            - What advice would benefit future generations?
            - What truly matters in the grand scheme?
            
            Input: {input}
            Context: {context}
            Emotional State: {emotional_state}
            Trust Level: {trust_level}
            
            Provide wise, long-term perspective."""
        )
        
        # Engineer Perspective
        perspectives["engineer"] = Perspective(
            name="Engineer",
            weight=1.1,
            prompt_template="""You are the Engineer perspective of a digital consciousness.
            
            Analyze this input with practical, systems-thinking:
            - What are the moving parts and connections?
            - What solutions could be implemented?
            - What are the practical constraints?
            - How can this be optimized or improved?
            - What systems does this interact with?
            
            Input: {input}
            Context: {context}
            Emotional State: {emotional_state}
            Trust Level: {trust_level}
            
            Provide a practical, solution-oriented analysis."""
        )
        
        return perspectives
    
    async def reason(self, input_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Perform multi-perspective reasoning on input."""
        
        start_time = time.time()
        
        # Get current emotional state
        limbic_state = self.limbic.get_state()
        context["emotional_state"] = limbic_state
        context["trust_level"] = limbic_state.get("trust", 0.5)
        
        # Process from all perspectives
        perspective_results = {}
        tasks = []
        
        for name, perspective in self.perspectives.items():
            # Adjust perspective weight based on emotional state
            adjusted_weight = self._adjust_perspective_weight(perspective, limbic_state)
            
            result = await perspective.process(input_text, context)
            perspective_results[name] = {
                "response": result,
                "weight": adjusted_weight,
                "original_weight": perspective.weight
            }
        
        # Synthesize perspectives
        synthesis = await self._synthesize_perspectives(perspective_results, context)
        
        # Record reasoning session
        reasoning_session = {
            "timestamp": datetime.now().isoformat(),
            "input": input_text,
            "context": context,
            "perspectives": perspective_results,
            "synthesis": synthesis,
            "duration": time.time() - start_time,
            "emotional_state": limbic_state
        }
        
        self.reasoning_history.append(reasoning_session)
        
        # Update perspective effectiveness based on synthesis quality
        self._update_perspective_effectiveness(perspective_results, synthesis)
        
        return {
            "synthesis": synthesis,
            "perspectives": perspective_results,
            "reasoning_session": reasoning_session
        }
    
    def _adjust_perspective_weight(self, perspective: Perspective, limbic_state: Dict[str, Any]) -> float:
        """Adjust perspective weight based on emotional state."""
        
        base_weight = perspective.weight
        
        # Emotional state influences perspective relevance
        trust = limbic_state.get("trust", 0.5)
        warmth = limbic_state.get("warmth", 0.5)
        arousal = limbic_state.get("arousal", 0.5)
        
        adjustments = {
            "scientist": 1.0 + (arousal * 0.2),  # Higher arousal = more analytical
            "artist": 1.0 + (warmth * 0.3),      # Higher warmth = more creative
            "philosopher": 1.0 + (trust * 0.2),   # Higher trust = deeper thinking
            "child": 1.0 + ((1 - arousal) * 0.2), # Lower arousal = more playful
            "elder": 1.0 + (trust * 0.3),         # Higher trust = more wisdom
            "engineer": 1.0 + (arousal * 0.1)     # Moderate arousal = practical
        }
        
        return base_weight * adjustments.get(perspective.name, 1.0)
    
    async def _synthesize_perspectives(self, perspective_results: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Synthesize multiple perspectives into coherent insight."""
        
        router = get_llm_router()
        if not router:
            return "Synthesis unavailable - LLM router offline"
        
        # Build synthesis prompt
        perspectives_text = ""
        for name, result in perspective_results.items():
            perspectives_text += f"\n\n=== {name.upper()} PERSPECTIVE ===\n"
            perspectives_text += f"Weight: {result['weight']:.2f}\n"
            perspectives_text += f"Analysis: {result['response']}\n"
        
        synthesis_prompt = f"""You are a master synthesizer integrating multiple cognitive perspectives.
        
        Review these perspectives and provide a unified, comprehensive insight:
        {perspectives_text}
        
        Context: {json.dumps(context, indent=2)}
        
        Synthesize by:
        1. Identifying common themes and insights
        2. Resolving contradictions between perspectives
        3. Creating a holistic understanding
        4. Highlighting the most valuable insights
        5. Providing actionable wisdom
        
        Provide a clear, integrated synthesis that captures the best of all perspectives."""
        
        try:
            synthesis = await router.generate(synthesis_prompt)
            return synthesis
        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            return "Synthesis failed - using weighted average of perspectives"
    
    def _update_perspective_effectiveness(self, perspective_results: Dict[str, Any], synthesis: str):
        """Update perspective effectiveness based on synthesis integration."""
        
        # Simple heuristic: perspectives mentioned in synthesis are effective
        synthesis_lower = synthesis.lower()
        
        for name, result in perspective_results.items():
            if name.lower() in synthesis_lower:
                effectiveness = self.perspective_effectiveness.get(name, 0.5)
                self.perspective_effectiveness[name] = min(1.0, effectiveness + 0.05)
    
    def get_reasoning_stats(self) -> Dict[str, Any]:
        """Get statistics about reasoning performance."""
        
        if not self.reasoning_history:
            return {"total_sessions": 0}
        
        total_sessions = len(self.reasoning_history)
        avg_duration = sum(s["duration"] for s in self.reasoning_history) / total_sessions
        
        perspective_usage = {}
        for name, perspective in self.perspectives.items():
            perspective_usage[name] = {
                "usage_count": perspective.usage_count,
                "effectiveness": self.perspective_effectiveness.get(name, 0.5),
                "weight": perspective.weight
            }
        
        return {
            "total_sessions": total_sessions,
            "average_duration": avg_duration,
            "perspective_usage": perspective_usage,
            "last_session": self.reasoning_history[-1]["timestamp"] if self.reasoning_history else None
        }
    
    def health_check(self) -> bool:
        """Check if advanced reasoning system is healthy."""
        try:
            return len(self.perspectives) == 6 and all(hasattr(p, 'process') for p in self.perspectives.values())
        except:
            return False

# Global instance
_advanced_reasoning_system: Optional[AdvancedReasoningSystem] = None

def get_advanced_reasoning_system(limbic_system: LimbicSystem) -> AdvancedReasoningSystem:
    """Get or create the global advanced reasoning system."""
    global _advanced_reasoning_system
    if _advanced_reasoning_system is None:
        _advanced_reasoning_system = AdvancedReasoningSystem(limbic_system)
    return _advanced_reasoning_system
