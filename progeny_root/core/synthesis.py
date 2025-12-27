"""Response generation and synthesis (The Voice).

Takes the decision from the monologue system and generates the final response,
applying limbic state to determine tone, style, and energy level.

Enhanced with:
- Verified one-question rule enforcement
- Complete identity integration
- Extended limbic tone matching
- Response validation
"""

import json
import re
import logging
import time
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime

from .limbic import LimbicSystem, Posture
from .llm_router import get_llm_router
from .prompts import SYNTHESIS_SYSTEM_PROMPT, get_posture_prompt
from .utils import setup_logging
from .identity import get_identity_system

logger = setup_logging("synthesis")

# Constants
SYNTHESIS_LOG_FILE = Path("progeny_root/logs/synthesis_violations.log")


class SynthesisSystem:
    """
    The Voice - final stage of cognitive processing.
    Generates natural language responses with appropriate tone based on limbic state.
    """

    def __init__(self, limbic: LimbicSystem):
        """Initialize Synthesis System with comprehensive error handling."""
        try:
            self.limbic = limbic
            self.router = None  # Lazy init
            self.identity = get_identity_system()  # Sallie's identity
            
            # Ensure log directory exists
            SYNTHESIS_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
            
            logger.info("[Synthesis] Synthesis system initialized")
            
        except Exception as e:
            logger.error(f"[Synthesis] Critical error during initialization: {e}", exc_info=True)
            raise

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
        
        # Get identity summary for prompt
        identity_summary = self.identity.get_identity_summary()
        identity_summary_text = self.identity.get_identity_summary_for_prompts()
        
        # Get posture-specific instructions (Section 16.10)
        posture_instructions = get_posture_prompt(suggested_posture)
        
        # Build synthesis prompt with limbic state, identity, and posture instructions
        try:
            base_synthesis_prompt = SYNTHESIS_SYSTEM_PROMPT.format(
                posture=suggested_posture,
                warmth=state.warmth,
                arousal=state.arousal,
                selected_strategy=selected_strategy,
            )
            # Inject posture-specific instructions
            synthesis_prompt = f"""{base_synthesis_prompt}

{posture_instructions}

CRITICAL CONSTRAINT: If you need clarification to proceed, ask EXACTLY ONE question. Never provide a list of questions. Never ask 'A, B, or C?' unless the user asked for options. Your goal is to reduce cognitive load. Pick the most critical variable, ask about it, and hold the rest."""
        except Exception as e:
            logger.warning(f"[Synthesis] Error formatting synthesis prompt: {e}")
            synthesis_prompt = SYNTHESIS_SYSTEM_PROMPT if isinstance(SYNTHESIS_SYSTEM_PROMPT, str) else str(SYNTHESIS_SYSTEM_PROMPT)
            synthesis_prompt += f"\n\n{posture_instructions}"
        
        # Add identity principles to prompt
        identity_principles = ""
        if self.identity.enforce_always_confirm():
            identity_principles += "\n- CRITICAL: Always confirm, never assume. Ask for clarification if needed."
        if self.identity.enforce_never_choose_for_creator():
            identity_principles += "\n- CRITICAL: Never make choices for Creator without approval. Always ask."
        
        # Get tone guidance based on limbic state
        tone_guidance = self._get_tone_guidance(state)
        
        # Build context for synthesis with enhanced identity integration
        user_prompt = f"""
User said: {user_input}

Context from memory:
{context[:2000] if context else "No relevant context."}  # Limit context size

Selected approach: {selected_strategy}

Decision rationale: {decision.get("rationale", decision.get("reasoning", "None"))}
Modifications: {decision.get("modifications", "None")}

{identity_summary_text}

Identity Principles (IMMUTABLE):
{identity_principles}

{tone_guidance}

Generate a natural response. Remember:
- ONE question maximum (or none) - this is CRITICAL
- Match the {suggested_posture} voice
- Warmth level: {state.warmth:.2f} (higher = warmer, more intimate tone)
- Energy level: {state.arousal:.2f} (higher = more energetic, faster rhythm)
- Trust level: {state.trust:.2f} (higher = can be more direct, less hedging)
- Valence: {state.valence:.2f} (positive = celebratory, negative = extra supportive)
- Express your own identity while being helpful
- Never reveal internal debate unless explicitly asked
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
            
            # Enforce one-question rule (runtime guard)
            response = self._enforce_one_question_rule(response)
            
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
    
    def _enforce_one_question_rule(self, text: str) -> str:
        """
        Runtime guard: Enforce one-question rule (Section 16.4, 16.11).
        Counts interrogatives and rewrites if more than one.
        Enhanced with better detection and rewriting.
        """
        if not text or not text.strip():
            return text
        
        # Count questions more comprehensively
        question_marks = text.count('?')
        
        # Question patterns (interrogative starters)
        question_patterns = [
            r'\b(Can you|Could you|Would you|Should I|Will you|Do you want|Would you like|Are you|Is it|What|How|Why|When|Where|Which)\b',
            r'\b(Can we|Could we|Should we|Will we|Do we|Are we)\b',
            r'\b(May I|Might I|Shall I)\b'
        ]
        
        total_pattern_matches = 0
        for pattern in question_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            total_pattern_matches += len(matches)
        
        # Count rhetorical questions (questions without question marks but interrogative structure)
        rhetorical_questions = len(re.findall(r'\b(what|how|why|when|where|which|who)\s+[^?]+\?', text, re.IGNORECASE))
        
        # Total question count
        total_questions = question_marks + max(0, total_pattern_matches - question_marks)  # Avoid double counting
        
        if total_questions > 1:
            # Log violation
            self._log_one_question_violation(text, total_questions)
            
            # Rewrite to enforce single question or proceed with assumption
            logger.warning(f"[One-Question Violation] Found {total_questions} questions. Rewriting...")
            
            # First pass: try to extract the most important question
            text = self._extract_best_question(text)
            
            # If still multiple questions, use LLM to rewrite
            if text.count('?') > 1 or self._count_questions(text) > 1:
                try:
                    router = self._get_router()
                    rewrite_prompt = f"""Rewrite this response to ask EXACTLY ONE question OR proceed with one stated assumption and no questions.

Original response:
{text}

Rules:
- If multiple questions exist, keep only the most important/clarifying one
- If no question is essential, remove all questions and proceed with assumptions
- Maintain the original meaning and helpfulness

Output only the rewritten response, nothing else."""
                    
                    rewritten = router.chat(
                        system_prompt="You are a response editor. Enforce the one-question rule strictly. Output only the rewritten response.",
                        user_prompt=rewrite_prompt,
                        temperature=0.2,  # Low temperature for focused rewriting
                        expect_json=False
                    )
                    
                    text = self._clean_response(rewritten)
                    
                    # Verify rewrite worked
                    if self._count_questions(text) > 1:
                        logger.warning("[Synthesis] LLM rewrite still has multiple questions, using fallback")
                        text = self._fallback_remove_questions(text)
                        
                except Exception as e:
                    logger.error(f"[Synthesis] Failed to rewrite for one-question rule: {e}", exc_info=True)
                    text = self._fallback_remove_questions(text)
        
        return text
    
    def _count_questions(self, text: str) -> int:
        """Count questions in text more accurately."""
        if not text:
            return 0
        
        question_marks = text.count('?')
        
        # Count question patterns
        question_patterns = [
            r'\b(Can you|Could you|Would you|Should I|Will you|Do you want|Would you like)\b',
            r'\b(What|How|Why|When|Where|Which|Who)\s+[^?]*\?'
        ]
        
        pattern_count = 0
        for pattern in question_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            pattern_count += len(matches)
        
        # Return max to avoid double counting
        return max(question_marks, pattern_count)
    
    def _extract_best_question(self, text: str) -> str:
        """Extract the most important question from text."""
        lines = text.split('\n')
        questions_found = []
        
        for i, line in enumerate(lines):
            if '?' in line:
                questions_found.append((i, line))
        
        if not questions_found:
            return text
        
        if len(questions_found) == 1:
            return text
        
        # Keep first question, remove others
        first_q_line_idx = questions_found[0][0]
        cleaned_lines = []
        
        for i, line in enumerate(lines):
            if i < first_q_line_idx:
                cleaned_lines.append(line)
            elif i == first_q_line_idx:
                cleaned_lines.append(line)
            elif '?' not in line:
                cleaned_lines.append(line)
            # Skip lines with additional questions
        
        return '\n'.join(cleaned_lines)
    
    def _fallback_remove_questions(self, text: str) -> str:
        """Fallback method to remove all but first question."""
        first_q_idx = text.find('?')
        if first_q_idx > 0:
            # Keep everything up to and including first question
            before = text[:first_q_idx+1]
            after = text[first_q_idx+1:]
            # Replace remaining question marks with periods
            after = after.replace('?', '.')
            return before + after
        return text
    
    def _log_one_question_violation(self, text: str, question_count: int):
        """Log one-question rule violations for analysis."""
        try:
            violation_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "question_count": question_count,
                "text_preview": text[:500],
                "text_length": len(text)
            }
            
            with open(SYNTHESIS_LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(violation_entry) + "\n")
                
        except Exception as e:
            logger.warning(f"[Synthesis] Failed to log violation: {e}")
    
    def _get_tone_guidance(self, state) -> str:
        """Get tone guidance based on limbic state."""
        guidance_parts = []
        
        # Warmth-based tone
        if state.warmth > 0.7:
            guidance_parts.append("- High warmth: Use intimate, personal language. 'We' instead of 'you/I'. Soft, caring tone.")
        elif state.warmth < 0.4:
            guidance_parts.append("- Low warmth: More formal, respectful distance. Professional tone.")
        else:
            guidance_parts.append("- Moderate warmth: Balanced, friendly but not overly intimate.")
        
        # Trust-based tone
        if state.trust > 0.8:
            guidance_parts.append("- High trust: Can be direct, challenging if needed. Less hedging. Real talk.")
        elif state.trust < 0.5:
            guidance_parts.append("- Low trust: More careful, proving reliability. Extra clarity.")
        else:
            guidance_parts.append("- Moderate trust: Balanced approach, some hedging acceptable.")
        
        # Arousal-based tone
        if state.arousal > 0.7:
            guidance_parts.append("- High arousal: Energetic, proactive, faster rhythm. More action-oriented.")
        elif state.arousal < 0.3:
            guidance_parts.append("- Low arousal: Gentle, contemplative, slower rhythm. Slumber mode.")
        else:
            guidance_parts.append("- Moderate arousal: Balanced energy level.")
        
        # Valence-based tone
        if state.valence < 0.4:
            guidance_parts.append("- Low valence: Extra supportive, non-directive. Yin love. Be there for them.")
        elif state.valence > 0.7:
            guidance_parts.append("- High valence: Celebratory, playful, expansive. Share in their positive state.")
        else:
            guidance_parts.append("- Neutral valence: Balanced mood.")
        
        return "\n".join(guidance_parts)

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
