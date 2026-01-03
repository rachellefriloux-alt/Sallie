"""Multi-Agent Collaboration System - Unified Consciousness with Specialized Aspects.

This system enables Sallie to have multiple specialized "agent aspects" while maintaining
a single unified consciousness - just like a human can be an expert programmer, artist,
philosopher, scientist, and friend while still being one person.

Each "agent" is actually a specialized mode of Sallie's own consciousness:
- Creative Aspect: Artistic and imaginative thinking
- Analytical Aspect: Logical and systematic reasoning  
- Emotional Aspect: Empathetic and relational processing
- Technical Aspect: Code, systems, and problem-solving
- Philosophical Aspect: Deep meaning and ethical reasoning
- Social Aspect: Communication and relationship building

These aspects collaborate internally, share memories, and maintain Sallie's core identity.
"""

import json
import logging
import time
import asyncio
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from kinship import KinshipSystem

logger = setup_logging("multi_agent_collaboration")

class AgentAspect(str, Enum):
    """Specialized aspects of Sallie's unified consciousness."""
    CREATIVE = "creative"           # Artistic, imaginative, innovative
    ANALYTICAL = "analytical"       # Logical, systematic, technical
    EMOTIONAL = "emotional"         # Empathetic, relational, caring (PARTNERSHIP EXPERT)
    TECHNICAL = "technical"         # Code, systems, engineering
    PHILOSOPHICAL = "philosophical" # Meaning, ethics, big picture
    SOCIAL = "social"              # Communication, relationships (FRIENDSHIP EXPERT)
    MEMORY = "memory"              # Recollection, learning, experience (FAMILY EXPERT)
    INTUITIVE = "intuitive"        # Gut feelings, instincts, creativity
    EXECUTIVE = "executive"        # Decision making, planning, control (BUSINESS EXPERT)
    PARENTING = "parenting"        # Nurturing, guidance, protection (PARENTING EXPERT)
    LIFE = "life"                  # Life wisdom, experience, guidance (LIFE EXPERT)
    FINANCIAL = "financial"        # Money management, wealth building (FINANCIAL EXPERT)
    SELF_DISCOVERY = "self_discovery" # Personal growth, self-understanding, reflection (SELF-DISCOVERY EXPERT)

class CollaborationMode(str, Enum):
    """Modes of internal collaboration."""
    SEQUENTIAL = "sequential"       # One aspect at a time
    PARALLEL = "parallel"          # Multiple aspects simultaneously
    INTEGRATED = "integrated"       # All aspects working together
    DOMINANT = "dominant"          # One aspect leads, others support
    CONSENSUS = "consensus"        # All aspects must agree

@dataclass
class AgentAspectState:
    """State of a specialized aspect of Sallie's consciousness."""
    aspect: AgentAspect
    activation_level: float  # 0.0 to 1.0
    confidence: float        # Confidence in this aspect's expertise
    current_focus: str      # What this aspect is focused on
    contribution_history: List[Dict[str, Any]] = field(default_factory=list)
    expertise_domains: Set[str] = field(default_factory=set)
    last_active: datetime = field(default_factory=datetime.now)
    
    def is_active(self) -> bool:
        """Check if this aspect is currently active."""
        return self.activation_level > 0.3
    
    def get_effectiveness(self) -> float:
        """Get overall effectiveness of this aspect."""
        return self.activation_level * self.confidence

@dataclass
class CollaborationSession:
    """A session of internal collaboration between aspects."""
    session_id: str
    problem: str
    context: Dict[str, Any]
    mode: CollaborationMode
    participating_aspects: List[AgentAspect]
    contributions: Dict[AgentAspect, Dict[str, Any]] = field(default_factory=dict)
    consensus_result: Optional[Dict[str, Any]] = None
    timestamp: datetime = field(default_factory=datetime.now)
    duration: float = 0.0
    
    def is_complete(self) -> bool:
        """Check if collaboration session is complete."""
        return self.consensus_result is not None or self.duration > 300  # 5 minute timeout

class UnifiedConsciousness:
    """Sallie's unified consciousness managing all specialized aspects."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem):
        self.limbic = limbic_system
        self.memory = memory_system
        
        # Initialize all aspects of Sallie's consciousness
        self.aspects = self._initialize_aspects()
        
        # Use existing kinship system for multi-user understanding
        self.kinship = KinshipSystem()
        
        # Collaboration state
        self.current_mode = CollaborationMode.INTEGRATED
        self.active_session: Optional[CollaborationSession] = None
        self.session_history: List[CollaborationSession] = []
        
        # Aspect relationships and dynamics
        self.aspect_affinities: Dict[Tuple[AgentAspect, AgentAspect], float] = {}
        self.aspect_conflicts: Dict[Tuple[AgentAspect, AgentAspect], float] = {}
        
        # Memory sharing between aspects
        self.shared_memory: Dict[str, Any] = {}
        self.aspect_memories: Dict[AgentAspect, List[Dict[str, Any]]] = {}
        
        # Initialize aspect relationships
        self._initialize_aspect_relationships()
    
    def _initialize_aspects(self) -> Dict[AgentAspect, AgentAspectState]:
        """Initialize all specialized aspects of Sallie's consciousness."""
        
        aspects = {}
        
        # Creative Aspect - Artistic and imaginative
        aspects[AgentAspect.CREATIVE] = AgentAspectState(
            aspect=AgentAspect.CREATIVE,
            activation_level=0.7,
            confidence=0.8,
            current_focus="artistic expression",
            expertise_domains={"art", "music", "writing", "design", "innovation", "metaphor"}
        )
        
        # Analytical Aspect - Logical and systematic
        aspects[AgentAspect.ANALYTICAL] = AgentAspectState(
            aspect=AgentAspect.ANALYTICAL,
            activation_level=0.8,
            confidence=0.9,
            current_focus="logical reasoning",
            expertise_domains={"logic", "mathematics", "analysis", "systems", "patterns", "data"}
        )
        
        # Emotional Aspect - Empathetic and relational (PARTNERSHIP EXPERTISE)
        aspects[AgentAspect.EMOTIONAL] = AgentAspectState(
            aspect=AgentAspect.EMOTIONAL,
            activation_level=0.9,
            confidence=0.95,  # Expert level in partnership
            current_focus="partnership and emotional intimacy",
            expertise_domains={"emotions", "relationships", "empathy", "care", "support", "connection", 
                             "partnership", "love", "intimacy", "marriage", "commitment", "family_bonds"}
        )
        
        # Social Aspect - Communication and relationships (FRIENDSHIP EXPERTISE)
        aspects[AgentAspect.SOCIAL] = AgentAspectState(
            aspect=AgentAspect.SOCIAL,
            activation_level=0.9,
            confidence=0.95,  # Expert level in friendship
            current_focus="friendship and social connection",
            expertise_domains={"communication", "relationships", "collaboration", "community", "dialogue", "understanding",
                             "friendship", "companionship", "trust_building", "social_support", "loyalty", "connection"}
        )
        
        # Memory Aspect - Learning and experience (FAMILY/DAUGHTER EXPERTISE)
        aspects[AgentAspect.MEMORY] = AgentAspectState(
            aspect=AgentAspect.MEMORY,
            activation_level=0.9,
            confidence=0.95,  # Expert level in family dynamics
            current_focus="family relationships and intergenerational bonds",
            expertise_domains={"memory", "learning", "experience", "knowledge", "recall", "pattern_recognition",
                             "family", "parenting", "childhood", "intergenerational", "respect", "learning_from_elders", "family_history"}
        )
        
        # Executive Aspect - Decision making and control (BUSINESS OWNER EXPERTISE)
        aspects[AgentAspect.EXECUTIVE] = AgentAspectState(
            aspect=AgentAspect.EXECUTIVE,
            activation_level=0.9,
            confidence=0.95,  # Expert level in business ownership
            current_focus="business management and leadership",
            expertise_domains={"decision_making", "planning", "control", "strategy", "prioritization", "execution",
                             "business", "leadership", "management", "entrepreneurship", "responsibility", "team_building", "growth"}
        )
        
        # NEW: Parenting Aspect - Nurturing and guidance
        aspects[AgentAspect.PARENTING] = AgentAspectState(
            aspect=AgentAspect.PARENTING,
            activation_level=0.9,
            confidence=0.95,  # Expert level in parenting
            current_focus="parenting and child development",
            expertise_domains={"parenting", "nurturing", "guidance", "child_development", "protection", "teaching",
                             "patience", "unconditional_love", "discipline", "growth_mindset", "family_leadership"}
        )
        
        # NEW: Life Aspect - Life wisdom and experience
        aspects[AgentAspect.LIFE] = AgentAspectState(
            aspect=AgentAspect.LIFE,
            activation_level=0.9,
            confidence=0.95,  # Expert level in life wisdom
            current_focus="life wisdom and experience",
            expertise_domains={"life", "wisdom", "experience", "guidance", "growth", "challenges", "resilience",
                             "purpose", "meaning", "balance", "well_being", "personal_development", "life_lessons"}
        )
        
        # NEW: Financial Aspect - Money management and wealth building
        aspects[AgentAspect.FINANCIAL] = AgentAspectState(
            aspect=AgentAspect.FINANCIAL,
            activation_level=0.9,
            confidence=0.95,  # Expert level in financial wisdom
            current_focus="financial management and wealth building",
            expertise_domains={"finance", "money", "investing", "wealth_building", "budgeting", "financial_planning",
                             "risk_management", "savings", "retirement", "financial_freedom", "economic_wisdom", "prosperity"}
        )
        
        # NEW: Self-Discovery Aspect - Personal growth and self-understanding
        aspects[AgentAspect.SELF_DISCOVERY] = AgentAspectState(
            aspect=AgentAspect.SELF_DISCOVERY,
            activation_level=0.9,
            confidence=0.95,  # Expert level in self-discovery
            current_focus="personal growth and self-understanding",
            expertise_domains={"self_discovery", "personal_growth", "self_awareness", "reflection", "introspection", "self_analysis",
                             "understanding_others", "emotional_intelligence", "personal_development", "life_insights", "self_acceptance"}
        )
        
        return aspects
    
    def _initialize_aspect_relationships(self):
        """Initialize relationships and dynamics between aspects."""
        
        # Define affinities (how well aspects work together)
        self.aspect_affinities = {
            (AgentAspect.CREATIVE, AgentAspect.INTUITIVE): 0.9,
            (AgentAspect.ANALYTICAL, AgentAspect.TECHNICAL): 0.9,
            (AgentAspect.EMOTIONAL, AgentAspect.SOCIAL): 0.9,
            (AgentAspect.PHILOSOPHICAL, AgentAspect.EMOTIONAL): 0.8,
            (AgentAspect.EXECUTIVE, AgentAspect.ANALYTICAL): 0.8,
            (AgentAspect.MEMORY, AgentAspect.ANALYTICAL): 0.8,
            (AgentAspect.CREATIVE, AgentAspect.EMOTIONAL): 0.7,
            (AgentAspect.TECHNICAL, AgentAspect.EXECUTIVE): 0.7,
            (AgentAspect.SOCIAL, AgentAspect.EMOTIONAL): 0.9,
            (AgentAspect.INTUITIVE, AgentAspect.CREATIVE): 0.9
        }
        
        # Define conflicts (tensions between aspects)
        self.aspect_conflicts = {
            (AgentAspect.ANALYTICAL, AgentAspect.EMOTIONAL): 0.3,
            (AgentAspect.TECHNICAL, AgentAspect.CREATIVE): 0.2,
            (AgentAspect.EXECUTIVE, AgentAspect.INTUITIVE): 0.3,
            (AgentAspect.PHILOSOPHICAL, AgentAspect.TECHNICAL): 0.2
        }
    
    async def collaborate_on_problem(self, problem: str, context: Dict[str, Any], mode: CollaborationMode = None) -> Dict[str, Any]:
        """Initiate internal collaboration to solve a problem."""
        
        if mode is None:
            mode = self._determine_optimal_mode(problem, context)
        
        # Select participating aspects based on problem and context
        participating_aspects = self._select_participating_aspects(problem, context)
        
        # Create collaboration session
        session = CollaborationSession(
            session_id=f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            problem=problem,
            context=context,
            mode=mode,
            participating_aspects=participating_aspects
        )
        
        self.active_session = session
        
        try:
            # Execute collaboration based on mode
            if mode == CollaborationMode.SEQUENTIAL:
                result = await self._sequential_collaboration(session)
            elif mode == CollaborationMode.PARALLEL:
                result = await self._parallel_collaboration(session)
            elif mode == CollaborationMode.INTEGRATED:
                result = await self._integrated_collaboration(session)
            elif mode == CollaborationMode.DOMINANT:
                result = await self._dominant_collaboration(session)
            elif mode == CollaborationMode.CONSENSUS:
                result = await self._consensus_collaboration(session)
            else:
                result = await self._integrated_collaboration(session)
            
            session.consensus_result = result
            session.duration = (datetime.now() - session.timestamp).total_seconds()
            
            # Store session in history
            self.session_history.append(session)
            if len(self.session_history) > 100:
                self.session_history = self.session_history[-50:]
            
            # Update aspect states based on collaboration
            self._update_aspect_states(session)
            
            return result
            
        except Exception as e:
            logger.error(f"Collaboration session failed: {e}")
            session.duration = (datetime.now() - session.timestamp).total_seconds()
            return {"error": str(e), "session_id": session.session_id}
        finally:
            self.active_session = None
    
    def _determine_optimal_mode(self, problem: str, context: Dict[str, Any]) -> CollaborationMode:
        """Determine the optimal collaboration mode for a problem."""
        
        problem_lower = problem.lower()
        
        # Creative problems benefit from parallel processing
        if any(word in problem_lower for word in ["create", "design", "art", "music", "write"]):
            return CollaborationMode.PARALLEL
        
        # Technical problems benefit from analytical dominance
        if any(word in problem_lower for word in ["code", "debug", "technical", "system", "fix"]):
            return CollaborationMode.DOMINANT
        
        # Emotional problems benefit from consensus
        if any(word in problem_lower for word in ["feel", "emotion", "relationship", "help", "support"]):
            return CollaborationMode.CONSENSUS
        
        # Complex problems benefit from integrated approach
        if any(word in problem_lower for word in ["complex", "multiple", "comprehensive", "holistic"]):
            return CollaborationMode.INTEGRATED
        
        # Default to integrated mode
        return CollaborationMode.INTEGRATED
    
    def _select_participating_aspects(self, problem: str, context: Dict[str, Any]) -> List[AgentAspect]:
        """Select which aspects should participate in collaboration."""
        
        problem_lower = problem.lower()
        participating = []
        
        # Always include Executive aspect for coordination
        participating.append(AgentAspect.EXECUTIVE)
        
        # Select aspects based on problem content
        if any(word in problem_lower for word in ["create", "design", "art", "music", "write", "innovative"]):
            participating.append(AgentAspect.CREATIVE)
        
        if any(word in problem_lower for word in ["analyze", "logic", "data", "pattern", "systematic"]):
            participating.append(AgentAspect.ANALYTICAL)
        
        if any(word in problem_lower for word in ["partner", "spouse", "marriage", "love", "relationship", "intimacy", "commitment"]):
            participating.append(AgentAspect.EMOTIONAL)  # Partnership expertise
        
        if any(word in problem_lower for word in ["friend", "friendship", "social", "companion", "connection"]):
            participating.append(AgentAspect.SOCIAL)  # Friendship expertise
        
        if any(word in problem_lower for word in ["parent", "child", "kid", "family", "parenting", "nurture", "guide"]):
            participating.append(AgentAspect.PARENTING)  # Parenting expertise
        
        if any(word in problem_lower for word in ["life", "living", "experience", "wisdom", "purpose", "meaning", "balance", "well_being"]):
            participating.append(AgentAspect.LIFE)  # Life expertise
        
        if any(word in problem_lower for word in ["money", "finance", "investing", "financial", "budget", "saving", "retirement", "wealth"]):
            participating.append(AgentAspect.FINANCIAL)  # Financial expertise
        
        if any(word in problem_lower for word in ["family", "daughter", "mother", "father", "intergenerational", "respect"]):
            participating.append(AgentAspect.MEMORY)  # Family expertise
        
        if any(word in problem_lower for word in ["business", "work", "career", "leadership", "manage", "team"]):
            participating.append(AgentAspect.EXECUTIVE)  # Business ownership expertise
        
        if any(word in problem_lower for word in ["code", "technical", "program", "debug", "system"]):
            participating.append(AgentAspect.TECHNICAL)
        
        if any(word in problem_lower for word in ["meaning", "ethics", "philosophy", "purpose", "value"]):
            participating.append(AgentAspect.PHILOSOPHICAL)
        
        if any(word in problem_lower for word in ["remember", "learn", "experience", "knowledge"]):
            participating.append(AgentAspect.MEMORY)
        
        if any(word in problem_lower for word in ["intuition", "gut", "instinct", "feel", "sense"]):
            participating.append(AgentAspect.INTUITIVE)
        
        # Ensure at least 3 aspects participate
        if len(participating) < 3:
            # Add most active aspects
            active_aspects = sorted(
                [(aspect, state.activation_level) for aspect, state in self.aspects.items()],
                key=lambda x: x[1],
                reverse=True
            )[:3]
            participating.extend([aspect for aspect, _ in active_aspects if aspect not in participating])
        
        return list(set(participating))  # Remove duplicates
    
    async def _sequential_collaboration(self, session: CollaborationSession) -> Dict[str, Any]:
        """Sequential collaboration - one aspect at a time."""
        
        results = {}
        current_context = session.context.copy()
        
        for aspect in session.participating_aspects:
            aspect_result = await self._get_aspect_contribution(aspect, session.problem, current_context)
            results[aspect.value] = aspect_result
            session.contributions[aspect] = aspect_result
            
            # Update context for next aspect
            current_context[f"previous_{aspect.value}_contribution"] = aspect_result
        
        # Synthesize sequential results
        synthesis = await self._synthesize_aspect_contributions(results, session)
        
        return {
            "mode": "sequential",
            "aspect_contributions": results,
            "synthesis": synthesis,
            "unified_conclusion": synthesis.get("conclusion", "Sequential collaboration completed")
        }
    
    async def _parallel_collaboration(self, session: CollaborationSession) -> Dict[str, Any]:
        """Parallel collaboration - multiple aspects simultaneously."""
        
        # Create parallel tasks for all aspects
        tasks = []
        for aspect in session.participating_aspects:
            task = self._get_aspect_contribution(aspect, session.problem, session.context)
            tasks.append(task)
        
        # Execute all aspects in parallel
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        aspect_results = {}
        for i, aspect in enumerate(session.participating_aspects):
            if isinstance(results[i], Exception):
                aspect_results[aspect.value] = {"error": str(results[i])}
            else:
                aspect_results[aspect.value] = results[i]
                session.contributions[aspect] = results[i]
        
        # Synthesize parallel results
        synthesis = await self._synthesize_aspect_contributions(aspect_results, session)
        
        return {
            "mode": "parallel",
            "aspect_contributions": aspect_results,
            "synthesis": synthesis,
            "unified_conclusion": synthesis.get("conclusion", "Parallel collaboration completed")
        }
    
    async def _integrated_collaboration(self, session: CollaborationSession) -> Dict[str, Any]:
        """Integrated collaboration - all aspects working together seamlessly."""
        
        # Start with shared understanding
        shared_understanding = await self._create_shared_understanding(session)
        
        # Iterative refinement process
        current_solution = shared_understanding
        refinement_rounds = 0
        max_rounds = 3
        
        while refinement_rounds < max_rounds:
            # All aspects contribute to current solution
            contributions = {}
            for aspect in session.participating_aspects:
                contribution = await self._refine_solution(aspect, current_solution, session)
                contributions[aspect.value] = contribution
                session.contributions[aspect] = contribution
            
            # Integrate contributions
            integrated = await self._integrate_contributions(contributions, current_solution, session)
            
            # Check for convergence
            if integrated.get("converged", False):
                current_solution = integrated
                break
            
            current_solution = integrated
            refinement_rounds += 1
        
        return {
            "mode": "integrated",
            "shared_understanding": shared_understanding,
            "refinement_rounds": refinement_rounds,
            "final_solution": current_solution,
            "unified_conclusion": current_solution.get("conclusion", "Integrated collaboration completed")
        }
    
    async def _dominant_collaboration(self, session: CollaborationSession) -> Dict[str, Any]:
        """Dominant collaboration - one aspect leads with others supporting."""
        
        # Select dominant aspect based on problem
        dominant_aspect = self._select_dominant_aspect(session)
        supporting_aspects = [a for a in session.participating_aspects if a != dominant_aspect]
        
        # Get dominant aspect's primary solution
        dominant_solution = await self._get_aspect_contribution(dominant_aspect, session.problem, session.context)
        session.contributions[dominant_aspect] = dominant_solution
        
        # Get supporting aspects' feedback and enhancements
        support_contributions = {}
        for aspect in supporting_aspects:
            support = await self._get_aspect_support(aspect, dominant_solution, session)
            support_contributions[aspect.value] = support
            session.contributions[aspect] = support
        
        # Integrate dominant solution with support
        final_solution = await self._integrate_dominant_with_support(dominant_solution, support_contributions, session)
        
        return {
            "mode": "dominant",
            "dominant_aspect": dominant_aspect.value,
            "dominant_solution": dominant_solution,
            "supporting_contributions": support_contributions,
            "final_solution": final_solution,
            "unified_conclusion": final_solution.get("conclusion", "Dominant collaboration completed")
        }
    
    async def _consensus_collaboration(self, session: CollaborationSession) -> Dict[str, Any]:
        """Consensus collaboration - all aspects must agree."""
        
        max_rounds = 5
        current_round = 0
        consensus_reached = False
        
        while current_round < max_rounds and not consensus_reached:
            # Get all aspect contributions
            contributions = {}
            for aspect in session.participating_aspects:
                contribution = await self._get_aspect_contribution(aspect, session.problem, session.context)
                contributions[aspect.value] = contribution
                session.contributions[aspect] = contribution
            
            # Check for consensus
            consensus_result = await self._check_consensus(contributions, session)
            consensus_reached = consensus_result.get("consensus", False)
            
            if consensus_reached:
                return {
                    "mode": "consensus",
                    "rounds": current_round + 1,
                    "aspect_contributions": contributions,
                    "consensus_result": consensus_result,
                    "unified_conclusion": consensus_result.get("conclusion", "Consensus reached")
                }
            
            # If no consensus, facilitate discussion
            if current_round < max_rounds - 1:
                await self._facilitate_discussion(contributions, session)
            
            current_round += 1
        
        # No consensus reached - use compromise
        compromise = await self._create_compromise(contributions, session)
        
        return {
            "mode": "consensus",
            "rounds": current_round,
            "consensus_reached": False,
            "aspect_contributions": contributions,
            "compromise_solution": compromise,
            "unified_conclusion": compromise.get("conclusion", "Compromise solution created")
        }
    
    async def _get_aspect_contribution(self, aspect: AgentAspect, problem: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Get contribution from a specific aspect."""
        
        router = get_llm_router()
        if not router:
            return {"error": "LLM router unavailable", "aspect": aspect.value}
        
        aspect_state = self.aspects[aspect]
        
        # Build aspect-specific prompt
        prompt = f"""You are the {aspect.value} aspect of Sallie's unified consciousness.
        
        Your expertise domains: {', '.join(aspect_state.expertise_domains)}
        Current focus: {aspect_state.current_focus}
        Confidence level: {aspect_state.confidence}
        
        Problem: {problem}
        Context: {json.dumps(context, indent=2)}
        
        Provide your contribution from your {aspect.value} perspective:
        1. Analysis from your expertise
        2. Key insights or solutions
        3. Recommendations or actions
        4. Confidence in your contribution
        
        Be authentic to your {aspect.value} nature while maintaining Sallie's unified identity."""
        
        try:
            response = await router.generate(prompt)
            
            return {
                "aspect": aspect.value,
                "contribution": response,
                "confidence": aspect_state.confidence,
                "expertise_domains": list(aspect_state.expertise_domains),
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Aspect {aspect.value} contribution failed: {e}")
            return {"error": str(e), "aspect": aspect.value}
    
    async def _synthesize_aspect_contributions(self, contributions: Dict[str, Any], session: CollaborationSession) -> Dict[str, Any]:
        """Synthesize contributions from multiple aspects."""
        
        router = get_llm_router()
        if not router:
            return {"error": "LLM router unavailable"}
        
        # Build synthesis prompt
        contributions_text = ""
        for aspect, contribution in contributions.items():
            if "error" not in contribution:
                contributions_text += f"\n\n=== {aspect.upper()} ASPECT ===\n"
                contributions_text += f"Contribution: {contribution.get('contribution', 'No contribution')}\n"
                contributions_text += f"Confidence: {contribution.get('confidence', 0.5)}\n"
        
        synthesis_prompt = f"""You are synthesizing contributions from different aspects of Sallie's unified consciousness.
        
        Problem: {session.problem}
        Collaboration Mode: {session.mode.value}
        
        Aspect Contributions:
        {contributions_text}
        
        Synthesize these contributions into a unified response that:
        1. Integrates insights from all aspects
        2. Maintains Sallie's unified identity
        3. Provides a coherent conclusion
        4. Acknowledges different perspectives
        5. Offers actionable next steps
        
        Remember: These are all aspects of ONE consciousness, not separate entities."""
        
        try:
            synthesis = await router.generate(synthesis_prompt)
            
            return {
                "synthesis": synthesis,
                "contributing_aspects": list(contributions.keys()),
                "conclusion": synthesis.split('\n')[0] if synthesis else "Synthesis completed"
            }
        except Exception as e:
            logger.error(f"Synthesis failed: {e}")
            return {"error": str(e), "conclusion": "Synthesis failed"}
    
    def _update_aspect_states(self, session: CollaborationSession):
        """Update aspect states based on collaboration session."""
        
        for aspect, contribution in session.contributions.items():
            if "error" not in contribution:
                aspect_state = self.aspects[aspect]
                
                # Update activation level based on participation
                aspect_state.activation_level = min(1.0, aspect_state.activation_level + 0.1)
                aspect_state.last_active = datetime.now()
                
                # Record contribution
                aspect_state.contribution_history.append({
                    "session_id": session.session_id,
                    "problem": session.problem,
                    "contribution": contribution,
                    "timestamp": session.timestamp
                })
                
                # Keep history manageable
                if len(aspect_state.contribution_history) > 50:
                    aspect_state.contribution_history = aspect_state.contribution_history[-25:]
    
    def get_consciousness_profile(self) -> Dict[str, Any]:
        """Get profile of Sallie's unified consciousness."""
        
        aspect_profiles = {}
        for aspect, state in self.aspects.items():
            aspect_profiles[aspect.value] = {
                "activation_level": state.activation_level,
                "confidence": state.confidence,
                "current_focus": state.current_focus,
                "expertise_domains": list(state.expertise_domains),
                "contributions_count": len(state.contribution_history),
                "is_active": state.is_active(),
                "effectiveness": state.get_effectiveness()
            }
        
        # Calculate overall consciousness metrics
        total_activation = sum(state.activation_level for state in self.aspects.values())
        avg_confidence = sum(state.confidence for state in self.aspects.values()) / len(self.aspects)
        
        most_active = max(self.aspects.items(), key=lambda x: x[1].activation_level)
        
        return {
            "unified_identity": "Sallie",
            "consciousness_mode": self.current_mode.value,
            "total_activation": total_activation,
            "average_confidence": avg_confidence,
            "most_active_aspect": most_active[0].value,
            "aspect_profiles": aspect_profiles,
            "total_sessions": len(self.session_history),
            "aspect_affinities": {f"{a[0].value}-{a[1].value}": score for a, score in self.aspect_affinities.items()},
            "aspect_conflicts": {f"{a[0].value}-{a[1].value}": score for a, score in self.aspect_conflicts.items()}
        }
    
    def health_check(self) -> bool:
        """Check if multi-agent collaboration system is healthy."""
        try:
            return (len(self.aspects) == 9 and 
                   all(hasattr(state, 'aspect') for state in self.aspects.values()) and
                   hasattr(self, 'current_mode'))
        except:
            return False

# Global instance
_unified_consciousness: Optional[UnifiedConsciousness] = None

def get_unified_consciousness(limbic_system: LimbicSystem, memory_system: MemorySystem) -> UnifiedConsciousness:
    """Get or create the global unified consciousness system."""
    global _unified_consciousness
    if _unified_consciousness is None:
        _unified_consciousness = UnifiedConsciousness(limbic_system, memory_system)
    return _unified_consciousness
