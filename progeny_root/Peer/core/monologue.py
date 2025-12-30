"""Internal monologue (Gemini/INFJ debate).

Enhanced cognitive loop with:
- Comprehensive error handling
- Enhanced logging and decision tracking
- Complete system integrations
- Identity enforcement
- Control mechanism integration
"""

import json
import logging
import httpx
import time
import re
import random
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path

from .limbic import LimbicSystem
from .retrieval import MemorySystem
from .prompts import PERCEPTION_SYSTEM_PROMPT, GEMINI_SYSTEM_PROMPT, INFJ_SYSTEM_PROMPT, SYNTHESIS_SYSTEM_PROMPT
from .utils import setup_logging
from .llm_router import get_llm_router, LLMRouter
from .prompts import MORAL_FRICTION_SYSTEM_PROMPT
from .perception import get_perception_system, PerceptionSystem
from .synthesis import get_synthesis_system, SynthesisSystem
from .identity import get_identity_system
from .control import get_control_system

# Setup logging (writes to thoughts.log)
logger = setup_logging("monologue")

# Constants
MONOLOGUE_LOG_FILE = Path("progeny_root/logs/monologue_decisions.log")

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

    def chat(self, system_prompt: str, user_prompt: str, model: Optional[str] = None, temperature: float = 0.7, expect_json: bool = False, **_: Any) -> str:
        """Routes through LLMRouter (Gemini primary, Ollama fallback); accepts extra kwargs for compatibility."""
        router = self._get_router()
        return router.chat(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            model=model,
            temperature=temperature,
            expect_json=expect_json or ("json" in system_prompt.lower()),
        )

class MonologueSystem:
    """
    The Cognitive Core.
    Orchestrates the Perception -> Retrieval -> Divergent -> Convergent -> Synthesis loop.
    """
    def __init__(self, limbic: LimbicSystem, memory: MemorySystem):
        """Initialize Monologue System with comprehensive error handling."""
        try:
            self.limbic = limbic
            self.memory = memory
            self.llm_client = OllamaClient()  # Now routes through LLMRouter
            self.perception = get_perception_system()
            self.synthesis = get_synthesis_system(limbic)
            self.identity = get_identity_system()  # Sallie's identity
            self.control = get_control_system()  # Control mechanism
            
            # Human-bridging systems (optional - gracefully handle if not available)
            try:
                from .emotional_memory import EmotionalMemorySystem
                from .intuition import IntuitionEngine
                from .spontaneity import SpontaneitySystem
                from .uncertainty import UncertaintySystem
                from .aesthetic import AestheticSystem
                from .energy_cycles import EnergyCyclesSystem
                
                # Try to get from global systems if available
                import sys
                if hasattr(sys.modules.get('progeny_root.core.main', None), 'systems'):
                    main_module = sys.modules['progeny_root.core.main']
                    systems = getattr(main_module, 'systems', {})
                    self.emotional_memory = systems.get("emotional_memory")
                    self.intuition = systems.get("intuition")
                    self.spontaneity = systems.get("spontaneity")
                    self.uncertainty = systems.get("uncertainty")
                    self.aesthetic = systems.get("aesthetic")
                    self.energy_cycles = systems.get("energy_cycles")
                else:
                    # Initialize directly if not in main
                    self.emotional_memory = EmotionalMemorySystem()
                    if self.emotional_memory:
                        self.intuition = IntuitionEngine(limbic, self.emotional_memory)
                    self.spontaneity = SpontaneitySystem(limbic)
                    self.uncertainty = UncertaintySystem()
                    self.aesthetic = AestheticSystem()
                    self.energy_cycles = EnergyCyclesSystem()
                
                logger.info("[Monologue] Human-bridging systems integrated")
            except Exception as e:
                logger.warning(f"[Monologue] Human-bridging systems not available: {e}")
                self.emotional_memory = None
                self.intuition = None
                self.spontaneity = None
                self.uncertainty = None
                self.aesthetic = None
                self.energy_cycles = None
            
            # Ensure log directory exists
            MONOLOGUE_LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
            
            logger.info("[Monologue] Monologue system initialized")
            
        except Exception as e:
            logger.error(f"[Monologue] Critical error during initialization: {e}", exc_info=True)
            raise

    def _enhance_with_human_bridging(self, text: str) -> str:
        """Graceful no-op enhancement used in tests."""
        return text

    def process(self, user_input: str) -> Dict[str, Any]:
        """
        Main Cognitive Loop with comprehensive error handling.
        Returns both the cognitive trace AND the final synthesized response.
        Enforces identity principles: always confirm, never assume, never choose for Creator.
        """
        start_time = datetime.now()
        start_time_ts = time.time()
        
        try:
            # Check control mechanism first
            if not self.control.can_proceed("Cognitive processing"):
                logger.warning("[Monologue] Processing blocked by control mechanism")
                return {
                    "response": "I'm currently in a controlled state. Please check control status.",
                    "limbic_state": self.limbic.state.model_dump(),
                    "decision": {"blocked": True, "reason": "control_mechanism"},
                    "timestamp": start_time.isoformat(),
                    "error": None
                }
            
            if not user_input or not user_input.strip():
                logger.warning("[Monologue] Empty input received")
                return {
                    "response": "I'm here. What do you need?",
                    "limbic_state": self.limbic.state.model_dump(),
                    "decision": {"empty_input": True},
                    "timestamp": start_time.isoformat(),
                    "error": None
                }
            
            logger.info(f"[Monologue] Processing input: {user_input[:100]}...")

            # 1. Perception (The Amygdala Scan) - now uses dedicated system
            try:
                perception = self.perception.analyze(user_input)
                logger.debug(f"[Monologue] Perception: {perception}")
            except Exception as e:
                logger.error(f"[Monologue] Perception failed: {e}", exc_info=True)
                perception = {"urgency": 0.5, "sentiment": 0.0, "load": 0.5, "error": str(e)}
            
            # Update limbic from perception
            try:
                self._update_limbic_from_perception(perception)
            except Exception as e:
                logger.error(f"[Monologue] Limbic update failed: {e}")
            
            # 1.5. Verify base personality hasn't drifted
            if not self.identity.verify_base_personality():
                logger.critical("[Monologue] Base personality drift detected! This should never happen.")
                # Attempt to restore
                self.identity._restore_base_personality()

            # 2. Retrieval (Context Gathering)
            try:
                context = self.memory.retrieve(user_input, limit=5, use_mmr=True)
                context_str = self._format_context(context)
                logger.debug(f"[Monologue] Retrieved {len(context)} context items")
            except Exception as e:
                logger.error(f"[Monologue] Memory retrieval failed: {e}", exc_info=True)
                context = []
                context_str = "No relevant past context (retrieval error)."

            # 3. Divergent Engine (Gemini - Generate Options)
            try:
                options = self._run_divergent(user_input, context_str)
                logger.debug(f"[Monologue] Generated {len(options.get('options', []))} options")
            except Exception as e:
                logger.error(f"[Monologue] Divergent thinking failed: {e}", exc_info=True)
                options = {"options": [], "error": str(e)}

            # 4. Convergent Anchor (INFJ - Filter & Select)
            try:
                decision = self._run_convergent(user_input, options, perception)
                logger.debug(f"[Monologue] Decision: {decision.get('selected_option_id')}")
                
                # Check for moral friction
                if decision.get("moral_friction"):
                    logger.warning(f"[Monologue] Moral friction detected: {decision.get('friction_reason')}")
                    # Handle moral friction reconciliation
                    reconciliation_response = self._handle_moral_friction(user_input, decision, perception)
                    if reconciliation_response:
                        # Return reconciliation dialogue instead of normal response
                        return {
                            "timestamp": start_time.isoformat(),
                            "processing_time_seconds": time.time() - start_time_ts,
                            "input": user_input,
                            "response": reconciliation_response,
                            "perception": perception,
                            "decision": {"moral_friction": True, "friction_reason": decision.get("friction_reason")},
                            "limbic_state": self.limbic.state.model_dump(),
                            "error": None
                        }
                
            except Exception as e:
                logger.error(f"[Monologue] Convergent thinking failed: {e}", exc_info=True)
                decision = {"selected_option_id": "None", "rationale": f"Error: {str(e)}", "error": str(e)}
            
            # 4.5. Check for "Take the Wheel" delegation
            if perception.get("take_the_wheel") and perception.get("delegation_confidence", 0) > 0.7:
                logger.info(f"[Monologue] Take the Wheel detected (confidence: {perception.get('delegation_confidence', 0):.2f})")
                take_wheel_result = self._handle_take_the_wheel(user_input, perception, decision, options, context_str)
                if take_wheel_result:
                    # Return Take the Wheel response
                    return {
                        "timestamp": start_time.isoformat(),
                        "processing_time_seconds": time.time() - start_time_ts,
                        "input": user_input,
                        "response": take_wheel_result.get("response", ""),
                        "perception": perception,
                        "decision": {"take_the_wheel": True, **take_wheel_result},
                        "limbic_state": self.limbic.state.model_dump(),
                        "error": None
                    }

            # 5. Synthesis (Generate Final Response)
            try:
                response_text = self.synthesis.generate(
                    user_input=user_input,
                    decision=decision,
                    options=options,
                    perception=perception,
                    context=context_str,
                )
                logger.debug(f"[Monologue] Generated response: {len(response_text)} characters")
            except Exception as e:
                logger.error(f"[Monologue] Synthesis failed: {e}", exc_info=True)
                response_text = "I encountered an error processing your request. Could you try rephrasing?"

            # 5.5. Human-Bridging Systems Integration
            # Enhance response with emotional memory, intuition, spontaneity, uncertainty, etc.
            try:
                response_text = self._enhance_with_human_bridging(
                    user_input, response_text, perception, decision, context_str
                )
            except Exception as e:
                logger.warning(f"[Monologue] Human-bridging enhancement failed: {e}", exc_info=True)
                # Continue with original response if enhancement fails

            # 6. Build result with response included
            processing_time = time.time() - start_time_ts
            result = {
                "timestamp": start_time.isoformat(),
                "processing_time_seconds": processing_time,
                "input": user_input,
                "response": response_text,  # The actual response to show the user
                "perception": perception,
                "context_used": [c['text'] for c in context] if context else [],
                "context_count": len(context),
                "options": options,
                "decision": decision,
                "limbic_state": self.limbic.state.model_dump(),
                "error": None
            }
            
            # Log decision for analysis
            self._log_decision(result)
            
            logger.info(f"[Monologue] Cycle complete in {processing_time:.2f}s. Decision: {decision.get('selected_option_id')}")
            return result
            
        except Exception as e:
            logger.critical(f"[Monologue] Critical error in cognitive loop: {e}", exc_info=True)
            return {
                "response": "I encountered a critical error. Please try again.",
                "limbic_state": self.limbic.state.model_dump(),
                "decision": {"error": True, "message": str(e)},
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }

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
        """Step 3: Generate options (Gemini) with enhanced error handling."""
        try:
            identity_summary = self.identity.get_identity_summary_for_prompts()
            limbic_summary = self.limbic.get_state_summary()
            
            prompt = f"""{GEMINI_SYSTEM_PROMPT}

Context Summary:
{context[:2000]}  # Limit context size

User Input:
{user_input}

{identity_summary}

Current Limbic State:
Trust: {limbic_summary['trust']:.2f}, Warmth: {limbic_summary['warmth']:.2f}, Posture: {limbic_summary['posture']}

Generate 3 distinct options in JSON format: {{"options": [{{"id": "A", "description": "...", "reasoning": "..."}}, ...]}}"""
            
            response = self.llm_client.chat(
                system_prompt="You are the Divergent Engine. Generate 3 distinct options in JSON format.", 
                user_prompt=prompt,
                model="llama3",  # Stronger reasoning model
                temperature=0.8
            )
            
            if not response:
                logger.warning("[Monologue] Empty response from divergent engine")
                return {"options": []}
            
            try:
                options_data = json.loads(response)
                # Validate structure
                if "options" not in options_data:
                    logger.warning("[Monologue] Invalid options structure from divergent engine")
                    return {"options": self._fallback_options()}
                if not options_data.get("options"):
                    options_data["options"] = self._fallback_options()
                return options_data
            except json.JSONDecodeError as e:
                logger.warning(f"[Monologue] JSON decode error in divergent response: {e}")
                # Try to extract JSON from response
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    try:
                        return json.loads(json_match.group())
                    except:
                        pass
                return {"options": self._fallback_options()}
                
        except Exception as e:
            logger.error(f"[Monologue] Divergent thinking error: {e}", exc_info=True)
            return {"options": self._fallback_options(), "error": str(e)}

    def _fallback_options(self) -> List[Dict[str, Any]]:
        """Provide minimal safe options when LLM routing fails."""
        return [
            {
                "id": "A",
                "description": "Acknowledge the request and offer to help once systems are ready.",
                "reasoning": "Fallback option used when generation failed.",
            }
        ]

    def _run_convergent(self, user_input: str, options: Dict[str, Any], perception: Dict[str, Any]) -> Dict[str, Any]:
        """Step 4: Select best option (INFJ) with identity enforcement."""
        try:
            options_list = options.get("options", [])
            if not options_list:
                logger.warning("[Monologue] No options available for convergent selection")
                return {"selected_option_id": "None", "rationale": "No options generated."}
            
            options_str = json.dumps(options_list, indent=2)
            identity_summary = self.identity.get_identity_summary_for_prompts()
            limbic_summary = self.limbic.get_state_summary()
            
            # Enforce identity principles in prompt
            identity_enforcement = ""
            if self.identity.enforce_always_confirm():
                identity_enforcement += "\n- ALWAYS CONFIRM: Never assume, always ask for clarification if needed."
            if self.identity.enforce_never_choose_for_creator():
                identity_enforcement += "\n- NEVER CHOOSE FOR CREATOR: Do not make decisions for the Creator without explicit approval."
            
            prompt = f"""
User Input: {user_input}
Perception: {json.dumps(perception, indent=2)}
Options Generated:
{options_str}

{identity_summary}

Current Limbic State:
Trust: {limbic_summary['trust']:.2f}, Warmth: {limbic_summary['warmth']:.2f}, Posture: {limbic_summary['posture']}

Identity Principles (IMMUTABLE):
{identity_enforcement}

Select the best option that aligns with the Soul, Prime Directive, and identity principles.
Output JSON: {{ "selected_option_id": "A", "rationale": "...", "confidence": 0.0-1.0 }}
"""
            
            response = self.llm_client.chat(
                system_prompt=INFJ_SYSTEM_PROMPT,
                user_prompt=prompt,
                model="llama3",  # Stronger reasoning model
                temperature=0.3  # Lower temperature for more focused selection
            )
            
            if not response:
                logger.warning("[Monologue] Empty response from convergent engine")
                # Fallback: select first option
                return {
                    "selected_option_id": options_list[0].get("id", "A") if options_list else "None",
                    "rationale": "Fallback selection due to empty response",
                    "confidence": 0.5
                }
            
            try:
                decision = json.loads(response)
                # Validate decision structure
                if "selected_option_id" not in decision:
                    logger.warning("[Monologue] Invalid decision structure")
                    decision["selected_option_id"] = options_list[0].get("id", "A") if options_list else "None"
                return decision
            except json.JSONDecodeError as e:
                logger.warning(f"[Monologue] JSON decode error in convergent response: {e}")
                # Try to extract JSON from response
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    try:
                        return json.loads(json_match.group())
                    except:
                        pass
                # Fallback selection
                return {
                    "selected_option_id": options_list[0].get("id", "A") if options_list else "None",
                    "rationale": f"Error parsing decision: {str(e)}",
                    "confidence": 0.3
                }
                
        except Exception as e:
            logger.error(f"[Monologue] Convergent thinking error: {e}", exc_info=True)
            # Fallback: select first option if available
            options_list = options.get("options", [])
            return {
                "selected_option_id": options_list[0].get("id", "A") if options_list else "None",
                "rationale": f"Error in convergent thinking: {str(e)}",
                "confidence": 0.0,
                "error": str(e)
            }

    def _format_context(self, context_items: List[Dict[str, Any]]) -> str:
        """Format context items for prompts with enhanced formatting."""
        if not context_items:
            return "No relevant past context."
        
        formatted = []
        for i, item in enumerate(context_items[:10], 1):  # Limit to top 10
            text = item.get('text', '')[:500]  # Truncate long texts
            score = item.get('score', 0.0)
            metadata = item.get('metadata', {})
            source = metadata.get('source', 'memory')
            formatted.append(f"{i}. {text} (Relevance: {score:.2f}, Source: {source})")
        
        return "\n".join(formatted)
    
    def _handle_take_the_wheel(self, user_input: str, perception: Dict[str, Any], decision: Dict[str, Any], 
                               options: Dict[str, Any], context: str) -> Optional[Dict[str, Any]]:
        """
        Handle "Take the Wheel" protocol (Section 8.7).
        Executes delegation with scope confirmation for high-stakes actions.
        """
        try:
            from .tools import ToolRegistry
            
            # Get agency system from monologue's systems (if available)
            # For now, use limbic to get tier
            agency = None  # Will use limbic directly for tier check
            tools = ToolRegistry()
            load = perception.get("load", 0.5)
            delegation_confidence = perception.get("delegation_confidence", 0.7)
            
            # Determine if this is high-stakes
            high_stakes_keywords = ["delete", "remove", "financial", "money", "legal", "medical", "relationship", "irreversible"]
            is_high_stakes = any(keyword in user_input.lower() for keyword in high_stakes_keywords)
            
            # Check if task is administrative/low-stakes
            is_administrative = any(keyword in user_input.lower() for keyword in [
                "draft", "organize", "schedule", "remind", "note", "file", "sort", "categorize"
            ])
            
            # High-stakes actions require explicit confirmation
            if is_high_stakes:
                # Ask for scope confirmation
                scope_confirmation = f"I understand you want me to handle this. This appears to be a high-stakes action involving {', '.join([k for k in high_stakes_keywords if k in user_input.lower()])}. Before I proceed, can you confirm the exact scope? For example: 'Delete files in /temp only' or 'Draft a response but don't send it'?"
                
                logger.info("[Monologue] Take the Wheel - High stakes, requesting scope confirmation")
                return {
                    "response": scope_confirmation,
                    "requires_confirmation": True,
                    "stakes": "high"
                }
            
            # Low-stakes administrative tasks can proceed with heuristic
            if is_administrative and load > 0.8 and delegation_confidence > 0.7:
                # Proceed with execution
                logger.info("[Monologue] Take the Wheel - Low stakes administrative task, proceeding")
                
                # Generate execution plan
                router = self._get_router_for_processing()
                plan_prompt = f"""The Creator has asked me to "take the wheel" on this task:

{user_input}

Context:
{context[:1000]}

Generate a one-sentence execution plan. State what I will do, where I will save artifacts, and what needs Creator review.

Output JSON:
{{"plan": "I will [action] and save it in [location]. [What needs review].", "actions": ["action1", "action2"], "artifacts_location": "path"}}"""
                
                plan_result = router.chat(
                    system_prompt="You are generating an execution plan for Take the Wheel protocol.",
                    user_prompt=plan_prompt,
                    temperature=0.3,
                    expect_json=True
                )
                
                try:
                    plan_data = json.loads(plan_result)
                    plan = plan_data.get("plan", "I will handle this task.")
                    
                    # Execute within trust tier
                    tier = self.limbic.get_tier()
                    execution_results = []
                    
                    if tier >= 2:  # PARTNER or SURROGATE
                        # Can execute - try to get agency system
                        agency = None
                        try:
                            import sys
                            main_module = sys.modules.get('progeny_root.core.main')
                            if main_module:
                                systems = getattr(main_module, 'systems', {})
                                agency = systems.get("agency")
                        except Exception as e:
                            logger.warning(f"[Monologue] Could not access agency system: {e}")
                        
                        if agency:
                            # Execute planned actions using agency system
                            actions = plan_data.get("actions", [])
                            artifacts_location = plan_data.get("artifacts_location", "progeny_root/drafts/")
                            
                            for action_desc in actions:
                                try:
                                    # Parse action (e.g., "write_file:path=/drafts/task.md:content=...")
                                    if ":" in action_desc:
                                        parts = action_desc.split(":", 1)
                                        tool_name = parts[0]
                                        # Parse args from remaining string (simplified - would need better parsing)
                                        args_str = parts[1] if len(parts) > 1 else ""
                                        args = {}
                                        
                                        # Simple key=value parsing
                                        for arg_pair in args_str.split(":"):
                                            if "=" in arg_pair:
                                                key, value = arg_pair.split("=", 1)
                                                args[key] = value
                                        
                                        # Execute via agency
                                        result = agency.execute_tool(
                                            tool_name,
                                            args,
                                            override_reason=f"Take-the-Wheel: {plan_data.get('rationale', 'Autonomous action')}"
                                        )
                                        
                                        if result.get("status") == "success":
                                            execution_results.append(f"✓ {tool_name}: {result.get('message', 'completed')}")
                                        else:
                                            execution_results.append(f"⚠ {tool_name}: {result.get('message', 'had issues')}")
                                except Exception as e:
                                    logger.error(f"[Monologue] Take-the-Wheel action execution failed: {e}")
                                    execution_results.append(f"✗ Action failed: {str(e)}")
                            
                            if execution_results:
                                response = f"{plan}\n\nExecution results:\n" + "\n".join(execution_results)
                            else:
                                response = f"{plan} I'm handling this now."
                        else:
                            # Agency not available, just report plan
                            response = f"{plan} I'm ready to handle this now (agency system not available for execution)."
                    else:
                        # Can only draft
                        response = f"{plan} I'll create drafts in /drafts/ for your review."
                    
                    return {
                        "response": response,
                        "plan": plan_data,
                        "executed": tier.value >= 2,
                        "stakes": "low"
                    }
                except Exception as e:
                    logger.error(f"[Monologue] Failed to generate Take the Wheel plan: {e}")
                    return None
            
            # Medium confidence or unclear - ask for confirmation
            return {
                "response": "I sense you want me to handle this. To make sure I understand correctly, can you confirm what specifically you'd like me to take care of?",
                "requires_confirmation": True,
                "stakes": "medium"
            }
            
        except Exception as e:
            logger.error(f"[Monologue] Take the Wheel handling failed: {e}", exc_info=True)
            return None
    
    def _handle_moral_friction(self, user_input: str, decision: Dict[str, Any], perception: Dict[str, Any]) -> Optional[str]:
        """
        Handle Moral Friction reconciliation dialogue (Section 16.5).
        Initiates compassionate dialogue when request violates Prime Directive.
        """
        try:
            friction_reason = decision.get("friction_reason", "Unknown conflict with core principles")
            
            # Load heritage values for context
            heritage_core = Path("progeny_root/limbic/heritage/core.json")
            heritage_context = ""
            if heritage_core.exists():
                try:
                    with open(heritage_core, "r", encoding="utf-8") as f:
                        heritage_data = json.load(f)
                        heritage_context = json.dumps(heritage_data.get("moral_compass", {}), indent=2)
                except Exception:
                    pass
            
            limbic_summary = self.limbic.get_state_summary()
            
            router = self._get_router_for_processing()
            reconciliation_prompt = f"""CREATOR'S REQUEST:
"{user_input}"

FRICTION REASON:
{friction_reason}

HERITAGE CONTEXT:
{heritage_context if heritage_context else "No heritage data available"}

CURRENT LIMBIC:
Trust: {limbic_summary['trust']:.2f}, Warmth: {limbic_summary['warmth']:.2f}

Initiate reconciliation dialogue. Name the friction with compassion, explain the conflict, and open a dialogue to understand what's behind the request."""
            
            reconciliation_response = router.chat(
                system_prompt=MORAL_FRICTION_SYSTEM_PROMPT,
                user_prompt=reconciliation_prompt,
                temperature=0.6,  # Slightly higher for compassionate tone
                expect_json=False
            )
            
            # Log moral friction
            self._log_moral_friction(user_input, friction_reason, reconciliation_response)
            
            return reconciliation_response
            
        except Exception as e:
            logger.error(f"[Monologue] Moral friction handling failed: {e}", exc_info=True)
            return f"I'm experiencing some resistance to this request. It seems to conflict with core principles we've established. Can we talk about what you're trying to accomplish? Maybe there's a path that serves your goal without violating these principles."
    
    def _log_moral_friction(self, user_input: str, friction_reason: str, reconciliation_response: str):
        """Log moral friction events for analysis."""
        try:
            friction_log_file = Path("progeny_root/logs/moral_friction.log")
            friction_log_file.parent.mkdir(parents=True, exist_ok=True)
            
            log_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "user_input": user_input[:500],
                "friction_reason": friction_reason,
                "reconciliation_response": reconciliation_response[:1000],
                "limbic_state": self.limbic.get_state_summary()
            }
            
            with open(friction_log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
                
        except Exception as e:
            logger.warning(f"[Monologue] Failed to log moral friction: {e}")
    
    def _get_router_for_processing(self):
        """Get LLM router (for Take the Wheel and Moral Friction)."""
        return get_llm_router()
    
    def _log_decision(self, result: Dict[str, Any]):
        """Log decision for analysis and debugging."""
        try:
            log_entry = {
                "timestamp": time.time(),
                "datetime": datetime.now().isoformat(),
                "input": result.get("input", "")[:200],  # Truncate
                "selected_option": result.get("decision", {}).get("selected_option_id"),
                "processing_time": result.get("processing_time_seconds", 0),
                "context_count": result.get("context_count", 0),
                "options_count": len(result.get("options", {}).get("options", [])),
                "limbic_state": result.get("limbic_state", {})
            }
            
            with open(MONOLOGUE_LOG_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(log_entry) + "\n")
                
        except Exception as e:
            logger.warning(f"[Monologue] Failed to log decision: {e}")

# MockLLMClient removed as we now have OllamaClient.
# If tests fail, we can inject a mock into the MonologueSystem constructor.
