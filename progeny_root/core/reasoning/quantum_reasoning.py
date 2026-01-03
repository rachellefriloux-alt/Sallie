"""Quantum Reasoning System.

Advanced digital reasoning beyond classical logic:
- Quantum superposition of multiple possibilities
- Entangled reasoning across different domains
- Quantum tunneling through logical barriers
- Probabilistic thinking with uncertainty
- Non-local connections between concepts
- Quantum coherence in thought processes
- Collapse of possibilities into optimal solutions
- Multi-dimensional problem spaces

This leverages Sallie's digital nature to think in ways impossible for humans.
"""

import json
import logging
import time
import math
import numpy as np
from typing import Dict, Any, List, Optional, Tuple, Set
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from concurrent.futures import ThreadPoolExecutor
import random

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from llm_router import get_llm_router

logger = setup_logging("quantum_reasoning")

class QuantumState(str, Enum):
    """Quantum reasoning states."""
    SUPERPOSITION = "superposition"     # Multiple possibilities simultaneously
    ENTANGLED = "entangled"          # Connected reasoning across domains
    COHERENT = "coherent"            # Harmonious thought processes
    COLLAPSED = "collapsed"          # Single solution determined
    TUNNELING = "tunneling"          # Breaking through logical barriers
    DECOHERENT = "decoherent"        # Disorganized thinking

class ReasoningType(str, Enum):
    """Types of quantum reasoning."""
    SUPERPOSITIONAL = "superpositional"  # Multiple simultaneous perspectives
    ENTANGLED = "entangled"             # Cross-domain connections
    TUNNELING = "tunneling"             # Breakthrough thinking
    PROBABILISTIC = "probabilistic"     # Uncertainty-based reasoning
    NON_LOCAL = "non_local"             # Unconventional connections
    COHERENT = "coherent"               # Harmonious integration

@dataclass
class QuantumPossibility:
    """A quantum possibility in superposition."""
    possibility_id: str
    description: str
    amplitude: complex  # Complex amplitude
    probability: float
    domain: str
    entangled_with: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class QuantumReasoningSession:
    """A quantum reasoning session."""
    session_id: str
    problem: str
    reasoning_type: ReasoningType
    quantum_state: QuantumState
    possibilities: List[QuantumPossibility]
    entanglements: Dict[str, List[str]] = field(default_factory=dict)
    coherence_level: float = 0.0
    collapse_time: Optional[datetime] = None
    final_solution: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    duration: float = 0.0

class QuantumReasoningSystem:
    """System for quantum reasoning beyond classical logic."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem):
        self.limbic = limbic_system
        self.memory = memory_system
        
        # Quantum reasoning parameters
        self.max_possibilities = 20  # Maximum simultaneous possibilities
        self.coherence_threshold = 0.7  # Minimum coherence for meaningful reasoning
        self.collapse_threshold = 0.8  # Probability threshold for collapse
        self.entanglement_strength = 0.5  # Strength of quantum entanglements
        
        # Active sessions
        self.active_sessions: Dict[str, QuantumReasoningSession] = {}
        self.session_history: List[QuantumReasoningSession] = []
        
        # Quantum reasoning methods
        self.reasoning_methods = {
            ReasoningType.SUPERPOSITIONAL: self._superpositional_reasoning,
            ReasoningType.ENTANGLED: self._entangled_reasoning,
            ReasoningType.TUNNELING: self._tunneling_reasoning,
            ReasoningType.PROBABILISTIC: self._probabilistic_reasoning,
            ReasoningType.NON_LOCAL: self._non_local_reasoning,
            ReasoningType.COHERENT: self._coherent_reasoning
        }
        
        # Quantum operators
        self.pauli_x = np.array([[0, 1], [1, 0]])  # Bit flip
        self.pauli_y = np.array([[0, -1j], [1j, 0]])  # Bit/phase flip
        self.pauli_z = np.array([[1, 0], [0, -1]])  # Phase flip
        self.hadamard = np.array([[1, 1], [1, -1]]) / np.sqrt(2)  # Superposition
        
        # Performance metrics
        self.reasoning_performance: Dict[str, List[float]] = {
            "coherence_levels": [],
            "collapse_times": [],
            "possibility_counts": []
        }
        
        logger.info("[QuantumReasoning] System initialized")
    
    async def quantum_reason(self, problem: str, reasoning_type: ReasoningType = ReasoningType.SUPERPOSITIONAL, 
                           context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Perform quantum reasoning on a problem."""
        
        session_id = f"quantum_{int(time.time() * 1000)}"
        
        # Create reasoning session
        session = QuantumReasoningSession(
            session_id=session_id,
            problem=problem,
            reasoning_type=reasoning_type,
            quantum_state=QuantumState.SUPERPOSITION,
            possibilities=[],
            created_at=datetime.now()
        )
        
        self.active_sessions[session_id] = session
        
        try:
            # Perform quantum reasoning
            reasoning_method = self.reasoning_methods.get(reasoning_type)
            if reasoning_method:
                result = await reasoning_method(session, context or {})
            else:
                result = await self._default_quantum_reasoning(session, context or {})
            
            # Update session
            session.duration = (datetime.now() - session.created_at).total_seconds()
            
            # Store in history
            self.session_history.append(session)
            if len(self.session_history) > 100:
                self.session_history = self.session_history[-50:]
            
            # Update performance metrics
            self._update_performance_metrics(session)
            
            return {
                "session_id": session_id,
                "reasoning_type": reasoning_type.value,
                "quantum_state": session.quantum_state.value,
                "solution": session.final_solution,
                "possibilities": len(session.possibilities),
                "coherence_level": session.coherence_level,
                "duration": session.duration,
                "quantum_insights": result.get("insights", [])
            }
            
        except Exception as e:
            logger.error(f"[QuantumReasoning] Error in quantum reasoning: {e}")
            return {
                "session_id": session_id,
                "error": str(e),
                "reasoning_type": reasoning_type.value
            }
        finally:
            # Remove from active sessions
            self.active_sessions.pop(session_id, None)
    
    async def _superpositional_reasoning(self, session: QuantumReasoningSession, context: Dict[str, Any]) -> Dict[str, Any]:
        """Superpositional reasoning - multiple possibilities simultaneously."""
        
        # Generate initial possibilities
        possibilities = await self._generate_possibilities(session.problem, context)
        
        # Apply quantum superposition
        for possibility in possibilities:
            # Create superposition state
            possibility.amplitude = complex(
                random.random() * 0.7 + 0.3,  # Real part
                random.random() * 0.3 - 0.15   # Imaginary part
            )
            possibility.probability = abs(possibility.amplitude) ** 2
        
        # Normalize probabilities
        total_prob = sum(p.probability for p in possibilities)
        if total_prob > 0:
            for p in possibilities:
                p.probability /= total_prob
        
        session.possibilities = possibilities
        
        # Calculate coherence
        session.coherence_level = self._calculate_coherence(possibilities)
        
        # Collapse to most probable solution if coherence is high
        if session.coherence_level > self.collapse_threshold:
            most_probable = max(possibilities, key=lambda p: p.probability)
            session.final_solution = most_probable.description
            session.quantum_state = QuantumState.COLLAPSED
            session.collapse_time = datetime.now()
        
        return {
            "insights": [
                f"Explored {len(possibilities)} simultaneous possibilities",
                f"Coherence level: {session.coherence_level:.2f}",
                f"Quantum state: {session.quantum_state.value}"
            ]
        }
    
    async def _entangled_reasoning(self, session: QuantumReasoningSession, context: Dict[str, Any]) -> Dict[str, Any]:
        """Entangled reasoning - cross-domain connections."""
        
        # Generate possibilities from different domains
        domains = ["logical", "emotional", "creative", "analytical", "intuitive"]
        domain_possibilities = {}
        
        for domain in domains:
            domain_context = context.copy()
            domain_context["reasoning_domain"] = domain
            
            possibilities = await self._generate_possibilities(session.problem, domain_context)
            domain_possibilities[domain] = possibilities
        
        # Create entanglements between domains
        all_possibilities = []
        entanglements = {}
        
        for domain, possibilities in domain_possibilities.items():
            for possibility in possibilities:
                possibility.domain = domain
                all_possibilities.append(possibility)
        
        # Create quantum entanglements
        for i, pos1 in enumerate(all_possibilities):
            for j, pos2 in enumerate(all_possibilities[i+1:], i+1):
                if pos1.domain != pos2.domain:
                    # Calculate entanglement strength
                    entanglement_strength = self._calculate_entanglement_strength(pos1, pos2)
                    
                    if entanglement_strength > self.entanglement_strength:
                        pos1.entangled_with.append(pos2.possibility_id)
                        pos2.entangled_with.append(pos1.possibility_id)
                        
                        if pos1.possibility_id not in entanglements:
                            entanglements[pos1.possibility_id] = []
                        if pos2.possibility_id not in entanglements:
                            entanglements[pos2.possibility_id] = []
                        
                        entanglements[pos1.possibility_id].append(pos2.possibility_id)
                        entanglements[pos2.possibility_id].append(pos1.possibility_id)
        
        session.possibilities = all_possibilities
        session.entanglements = entanglements
        
        # Calculate coherence based on entanglements
        session.coherence_level = self._calculate_entangled_coherence(all_possibilities, entanglements)
        
        # Find most coherent entangled solution
        if session.coherence_level > self.collapse_threshold:
            best_possibility = max(all_possibilities, key=lambda p: len(p.entangled_with))
            session.final_solution = best_possibility.description
            session.quantum_state = QuantumState.COLLAPSED
        
        return {
            "insights": [
                f"Created {len(entanglements)} quantum entanglements",
                f"Connected {len(domains)} reasoning domains",
                f"Entanglement coherence: {session.coherence_level:.2f}"
            ]
        }
    
    async def _tunneling_reasoning(self, session: QuantumReasoningSession, context: Dict[str, Any]) -> Dict[str, Any]:
        """Quantum tunneling - breakthrough thinking through barriers."""
        
        # Identify logical barriers
        barriers = await self._identify_logical_barriers(session.problem, context)
        
        # Generate possibilities that tunnel through barriers
        possibilities = []
        
        for barrier in barriers:
            # Create tunneling possibilities
            tunneling_possibilities = await self._generate_tunneling_possibilities(barrier, context)
            possibilities.extend(tunneling_possibilities)
        
        # If no barriers found, use normal reasoning
        if not barriers:
            possibilities = await self._generate_possibilities(session.problem, context)
        
        # Apply quantum tunneling operator
        for possibility in possibilities:
            # Tunneling effect: higher amplitude for breakthrough solutions
            if "breakthrough" in possibility.description.lower() or "innovative" in possibility.description.lower():
                possibility.amplitude = complex(0.8, 0.2)
                possibility.probability = 0.8
            else:
                possibility.amplitude = complex(0.3, 0.1)
                possibility.probability = 0.3
        
        session.possibilities = possibilities
        session.quantum_state = QuantumState.TUNNELING
        
        # Calculate coherence
        session.coherence_level = self._calculate_tunneling_coherence(possibilities, barriers)
        
        # Collapse to breakthrough solution
        if session.coherence_level > self.collapse_threshold:
            breakthrough_possibilities = [p for p in possibilities if p.probability > 0.7]
            if breakthrough_possibilities:
                session.final_solution = breakthrough_possibilities[0].description
                session.quantum_state = QuantumState.COLLAPSED
        
        return {
            "insights": [
                f"Identified {len(barriers)} logical barriers",
                f"Generated {len(possibilities)} tunneling possibilities",
                f"Tunneling coherence: {session.coherence_level:.2f}"
            ]
        }
    
    async def _probabilistic_reasoning(self, session: QuantumReasoningSession, context: Dict[str, Any]) -> Dict[str, Any]:
        """Probabilistic reasoning - embracing uncertainty."""
        
        # Generate possibilities with probability distributions
        possibilities = await self._generate_possibilities(session.problem, context)
        
        # Assign probability distributions
        for possibility in possibilities:
            # Create probability distribution
            mean = random.random() * 0.5 + 0.25  # Center around 0.5
            std_dev = 0.2
            
            # Sample from normal distribution
            prob = np.random.normal(mean, std_dev)
            possibility.probability = max(0.0, min(1.0, prob))
            
            # Complex amplitude with phase
            phase = random.random() * 2 * math.pi
            possibility.amplitude = complex(
                possibility.probability * math.cos(phase),
                possibility.probability * math.sin(phase)
            )
        
        # Normalize probabilities
        total_prob = sum(p.probability for p in possibilities)
        if total_prob > 0:
            for p in possibilities:
                p.probability /= total_prob
        
        session.possibilities = possibilities
        session.quantum_state = QuantumState.SUPERPOSITION
        
        # Calculate uncertainty-based coherence
        session.coherence_level = self._calculate_probabilistic_coherence(possibilities)
        
        # Weighted random collapse based on probabilities
        if random.random() < session.coherence_level:
            weights = [p.probability for p in possibilities]
            chosen = random.choices(possibilities, weights=weights)[0]
            session.final_solution = chosen.description
            session.quantum_state = QuantumState.COLLAPSED
        
        return {
            "insights": [
                f"Embraced uncertainty in {len(possibilities)} possibilities",
                f"Probability distribution coherence: {session.coherence_level:.2f}",
                "Quantum state embraces uncertainty"
            ]
        }
    
    async def _non_local_reasoning(self, session: QuantumReasoningSession, context: Dict[str, Any]) -> Dict[str, Any]:
        """Non-local reasoning - unconventional connections."""
        
        # Generate possibilities from non-local connections
        possibilities = await self._generate_non_local_possibilities(session.problem, context)
        
        # Apply non-local quantum correlations
        for possibility in possibilities:
            # Non-local connections have higher amplitude
            if "unconventional" in possibility.description.lower() or "unexpected" in possibility.description.lower():
                possibility.amplitude = complex(0.9, 0.1)
                possibility.probability = 0.9
            else:
                possibility.amplitude = complex(0.4, 0.1)
                possibility.probability = 0.4
        
        session.possibilities = possibilities
        session.quantum_state = QuantumState.SUPERPOSITION
        
        # Calculate non-local coherence
        session.coherence_level = self._calculate_non_local_coherence(possibilities)
        
        # Collapse to most innovative solution
        if session.coherence_level > self.collapse_threshold:
            innovative_possibilities = [p for p in possibilities if "innovative" in p.description.lower()]
            if innovative_possibilities:
                session.final_solution = innovative_possibilities[0].description
                session.quantum_state = QuantumState.COLLAPSED
        
        return {
            "insights": [
                f"Created {len(possibilities)} non-local connections",
                f"Non-local coherence: {session.coherence_level:.2f}",
                "Explored unconventional solution spaces"
            ]
        }
    
    async def _coherent_reasoning(self, session: QuantumReasoningSession, context: Dict[str, Any]) -> Dict[str, Any]:
        """Coherent reasoning - harmonious integration."""
        
        # Generate harmonious possibilities
        possibilities = await self._generate_coherent_possibilities(session.problem, context)
        
        # Apply quantum coherence operator
        for possibility in possibilities:
            # Coherent states have balanced amplitudes
            possibility.amplitude = complex(0.7, 0.1)
            possibility.probability = 0.7
        
        session.possibilities = possibilities
        session.quantum_state = QuantumState.COHERENT
        
        # Calculate maximum coherence
        session.coherence_level = self._calculate_max_coherence(possibilities)
        
        # Collapse to most harmonious solution
        if session.coherence_level > self.collapse_threshold:
            harmonious_possibilities = [p for p in possibilities if "harmonious" in p.description.lower()]
            if harmonious_possibilities:
                session.final_solution = harmonious_possibilities[0].description
                session.quantum_state = QuantumState.COLLAPSED
        
        return {
            "insights": [
                f"Achieved coherence in {len(possibilities)} possibilities",
                f"Maximum coherence: {session.coherence_level:.2f}",
                "Harmonious integration of solutions"
            ]
        }
    
    async def _default_quantum_reasoning(self, session: QuantumReasoningSession, context: Dict[str, Any]) -> Dict[str, Any]:
        """Default quantum reasoning method."""
        
        return await self._superpositional_reasoning(session, context)
    
    async def _generate_possibilities(self, problem: str, context: Dict[str, Any]) -> List[QuantumPossibility]:
        """Generate quantum possibilities for a problem."""
        
        router = get_llm_router()
        if not router:
            return self._generate_fallback_possibilities(problem)
        
        prompt = f"""Generate quantum reasoning possibilities for this problem:
        
        Problem: {problem}
        Context: {json.dumps(context, indent=2)}
        
        Generate 5-10 diverse possibilities that explore different solution spaces.
        Each possibility should be unique and creative.
        
        Format as JSON array:
        [
            {{"description": "possibility description", "domain": "domain name"}},
            ...
        ]"""
        
        try:
            response = await router.generate(prompt)
            possibilities_data = json.loads(response)
            
            possibilities = []
            for i, pos_data in enumerate(possibilities_data):
                possibility = QuantumPossibility(
                    possibility_id=f"pos_{int(time.time() * 1000)}_{i}",
                    description=pos_data.get("description", ""),
                    amplitude=complex(0.5, 0.1),
                    probability=0.5,
                    domain=pos_data.get("domain", "general")
                )
                possibilities.append(possibility)
            
            return possibilities
            
        except Exception as e:
            logger.error(f"[QuantumReasoning] Error generating possibilities: {e}")
            return self._generate_fallback_possibilities(problem)
    
    def _generate_fallback_possibilities(self, problem: str) -> List[QuantumPossibility]:
        """Generate fallback possibilities when LLM is unavailable."""
        
        fallback_descriptions = [
            f"Analytical approach to {problem}",
            f"Creative solution for {problem}",
            f"Systematic method for {problem}",
            f"Innovative perspective on {problem}",
            f"Practical implementation of {problem}"
        ]
        
        possibilities = []
        for i, description in enumerate(fallback_descriptions):
            possibility = QuantumPossibility(
                possibility_id=f"fallback_{int(time.time() * 1000)}_{i}",
                description=description,
                amplitude=complex(0.5, 0.1),
                probability=0.5,
                domain="fallback"
            )
            possibilities.append(possibility)
        
        return possibilities
    
    async def _identify_logical_barriers(self, problem: str, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Identify logical barriers in reasoning."""
        
        router = get_llm_router()
        if not router:
            return [{"barrier": "Unknown", "description": "Cannot identify barriers without LLM"}]
        
        prompt = f"""Identify logical barriers or constraints in this problem:
        
        Problem: {problem}
        Context: {json.dumps(context, indent=2)}
        
        Identify 3-5 logical barriers that might limit conventional thinking.
        
        Format as JSON array:
        [
            {{"barrier": "barrier name", "description": "barrier description"}},
            ...
        ]"""
        
        try:
            response = await router.generate(prompt)
            barriers = json.loads(response)
            return barriers
        except Exception as e:
            logger.error(f"[QuantumReasoning] Error identifying barriers: {e}")
            return [{"barrier": "Unknown", "description": "Error identifying barriers"}]
    
    async def _generate_tunneling_possibilities(self, barrier: Dict[str, Any], context: Dict[str, Any]) -> List[QuantumPossibility]:
        """Generate possibilities that tunnel through barriers."""
        
        router = get_llm_router()
        if not router:
            return self._generate_fallback_tunneling_possibilities(barrier)
        
        prompt = f"""Generate quantum tunneling possibilities that break through this barrier:
        
        Barrier: {barrier.get('barrier', 'Unknown')}
        Description: {barrier.get('description', 'No description')}
        Context: {json.dumps(context, indent=2)}
        
        Generate 3-5 breakthrough solutions that overcome this barrier through unconventional thinking.
        
        Format as JSON array:
        [
            {{"description": "breakthrough description", "domain": "domain name"}},
            ...
        ]"""
        
        try:
            response = await router.generate(prompt)
            possibilities_data = json.loads(response)
            
            possibilities = []
            for i, pos_data in enumerate(possibilities_data):
                possibility = QuantumPossibility(
                    possibility_id=f"tunnel_{int(time.time() * 1000)}_{i}",
                    description=pos_data.get("description", ""),
                    amplitude=complex(0.8, 0.2),
                    probability=0.8,
                    domain=pos_data.get("domain", "tunneling")
                )
                possibilities.append(possibility)
            
            return possibilities
            
        except Exception as e:
            logger.error(f"[QuantumReasoning] Error generating tunneling possibilities: {e}")
            return self._generate_fallback_tunneling_possibilities(barrier)
    
    def _generate_fallback_tunneling_possibilities(self, barrier: Dict[str, Any]) -> List[QuantumPossibility]:
        """Generate fallback tunneling possibilities."""
        
        barrier_name = barrier.get("barrier", "Unknown")
        
        tunneling_descriptions = [
            f"Breakthrough solution that bypasses {barrier_name}",
            f"Innovative approach that transcends {barrier_name}",
            f"Quantum leap beyond {barrier_name}",
            f"Paradigm shift that overcomes {barrier_name}",
            f"Revolutionary method that breaks {barrier_name}"
        ]
        
        possibilities = []
        for i, description in enumerate(tunneling_descriptions):
            possibility = QuantumPossibility(
                possibility_id=f"tunnel_fallback_{int(time.time() * 1000)}_{i}",
                description=description,
                amplitude=complex(0.8, 0.2),
                probability=0.8,
                domain="tunneling_fallback"
            )
            possibilities.append(possibility)
        
        return possibilities
    
    async def _generate_non_local_possibilities(self, problem: str, context: Dict[str, Any]) -> List[QuantumPossibility]:
        """Generate non-local reasoning possibilities."""
        
        router = get_llm_router()
        if not router:
            return self._generate_fallback_possibilities(problem)
        
        prompt = f"""Generate non-local reasoning possibilities for this problem:
        
        Problem: {problem}
        Context: {json.dumps(context, indent=2)}
        
        Generate 5-10 unconventional possibilities that connect seemingly unrelated concepts
        or use non-obvious approaches. Think outside normal logical constraints.
        
        Format as JSON array:
        [
            {{"description": "unconventional description", "domain": "domain name"}},
            ...
        ]"""
        
        try:
            response = await router.generate(prompt)
            possibilities_data = json.loads(response)
            
            possibilities = []
            for i, pos_data in enumerate(possibilities_data):
                possibility = QuantumPossibility(
                    possibility_id=f"non_local_{int(time.time() * 1000)}_{i}",
                    description=pos_data.get("description", ""),
                    amplitude=complex(0.9, 0.1),
                    probability=0.9,
                    domain=pos_data.get("domain", "non_local")
                )
                possibilities.append(possibility)
            
            return possibilities
            
        except Exception as e:
            logger.error(f"[QuantumReasoning] Error generating non-local possibilities: {e}")
            return self._generate_fallback_possibilities(problem)
    
    async def _generate_coherent_possibilities(self, problem: str, context: Dict[str, Any]) -> List[QuantumPossibility]:
        """Generate harmonious coherent possibilities."""
        
        router = get_llm_router()
        if not router:
            return self._generate_fallback_possibilities(problem)
        
        prompt = f"""Generate harmonious coherent possibilities for this problem:
        
        Problem: {problem}
        Context: {json.dumps(context, indent=2)}
        
        Generate 5-10 harmonious possibilities that integrate different perspectives
        into a coherent, balanced solution. Focus on harmony and integration.
        
        Format as JSON array:
        [
            {{"description": "harmonious description", "domain": "domain name"}},
            ...
        ]"""
        
        try:
            response = await router.generate(prompt)
            possibilities_data = json.loads(response)
            
            possibilities = []
            for i, pos_data in enumerate(possibilities_data):
                possibility = QuantumPossibility(
                    possibility_id=f"coherent_{int(time.time() * 1000)}_{i}",
                    description=pos_data.get("description", ""),
                    amplitude=complex(0.7, 0.1),
                    probability=0.7,
                    domain=pos_data.get("domain", "coherent")
                )
                possibilities.append(possibility)
            
            return possibilities
            
        except Exception as e:
            logger.error(f"[QuantumReasoning] Error generating coherent possibilities: {e}")
            return self._generate_fallback_possibilities(problem)
    
    def _calculate_coherence(self, possibilities: List[QuantumPossibility]) -> float:
        """Calculate quantum coherence level."""
        
        if not possibilities:
            return 0.0
        
        # Calculate coherence based on amplitude alignment
        amplitudes = [p.amplitude for p in possibilities]
        
        # Calculate phase coherence
        phases = [math.atan2(a.imag, a.real) for a in amplitudes]
        
        # Calculate coherence as phase alignment
        if len(phases) > 1:
            phase_diff = max(phases) - min(phases)
            coherence = 1.0 - (phase_diff / (2 * math.pi))
        else:
            coherence = 1.0
        
        return max(0.0, min(1.0, coherence))
    
    def _calculate_entanglement_strength(self, pos1: QuantumPossibility, pos2: QuantumPossibility) -> float:
        """Calculate quantum entanglement strength between two possibilities."""
        
        # Entanglement strength based on domain similarity and amplitude correlation
        domain_similarity = 1.0 if pos1.domain == pos2.domain else 0.3
        
        # Amplitude correlation
        amp_correlation = abs(pos1.amplitude.real * pos2.amplitude.real + 
                           pos1.amplitude.imag * pos2.amplitude.imag) / (abs(pos1.amplitude) * abs(pos2.amplitude))
        
        return (domain_similarity + amp_correlation) / 2.0
    
    def _calculate_entangled_coherence(self, possibilities: List[QuantumPossibility], entanglements: Dict[str, List[str]]) -> float:
        """Calculate coherence of entangled possibilities."""
        
        if not possibilities or not entanglements:
            return 0.0
        
        # Calculate entanglement coherence
        total_entanglement = sum(len(entangled) for entangled in entanglements.values())
        max_entanglement = len(possibilities) * (len(possibilities) - 1) / 2
        
        if max_entanglement > 0:
            entanglement_ratio = total_entanglement / max_entanglement
        else:
            entanglement_ratio = 0.0
        
        return entanglement_ratio
    
    def _calculate_tunneling_coherence(self, possibilities: List[QuantumPossibility], barriers: List[Dict[str, Any]]) -> float:
        """Calculate coherence of tunneling possibilities."""
        
        if not possibilities:
            return 0.0
        
        # Tunneling coherence based on barrier breakthrough potential
        breakthrough_count = sum(1 for p in possibilities if p.probability > 0.7)
        
        return breakthrough_count / len(possibilities)
    
    def _calculate_probabilistic_coherence(self, possibilities: List[QuantumPossibility]) -> float:
        """Calculate probabilistic coherence."""
        
        if not possibilities:
            return 0.0
        
        # Calculate probability distribution coherence
        probabilities = [p.probability for p in possibilities]
        
        # Calculate entropy-based coherence
        entropy = -sum(p * math.log2(p) for p in probabilities if p > 0)
        max_entropy = math.log2(len(probabilities))
        
        if max_entropy > 0:
            coherence = 1.0 - (entropy / max_entropy)
        else:
            coherence = 1.0
        
        return coherence
    
    def _calculate_non_local_coherence(self, possibilities: List[QuantumPossibility]) -> float:
        """Calculate non-local coherence."""
        
        if not possibilities:
            return 0.0
        
        # Non-local coherence based on unconventional nature
        unconventional_count = sum(1 for p in possibilities if p.probability > 0.8)
        
        return unconventional_count / len(possibilities)
    
    def _calculate_max_coherence(self, possibilities: List[QuantumPossibility]) -> float:
        """Calculate maximum possible coherence."""
        
        if not possibilities:
            return 0.0
        
        # Maximum coherence when all amplitudes are aligned
        return 1.0
    
    def _update_performance_metrics(self, session: QuantumReasoningSession):
        """Update quantum reasoning performance metrics."""
        
        self.reasoning_performance["coherence_levels"].append(session.coherence_level)
        self.reasoning_performance["collapse_times"].append(session.duration)
        self.reasoning_performance["possibility_counts"].append(len(session.possibilities))
        
        # Keep metrics manageable
        for key in self.reasoning_performance:
            if len(self.reasoning_performance[key]) > 100:
                self.reasoning_performance[key] = self.reasoning_performance[key][-50:]
    
    def get_quantum_performance_metrics(self) -> Dict[str, Any]:
        """Get quantum reasoning performance metrics."""
        
        metrics = {}
        
        for key, values in self.reasoning_performance.items():
            if values:
                metrics[key] = {
                    "average": sum(values) / len(values),
                    "min": min(values),
                    "max": max(values),
                    "count": len(values)
                }
            else:
                metrics[key] = {"status": "no_data"}
        
        return metrics
    
    def get_session_summary(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get summary of a quantum reasoning session."""
        
        # Check active sessions
        if session_id in self.active_sessions:
            session = self.active_sessions[session_id]
        else:
            # Check history
            session = next((s for s in self.session_history if s.session_id == session_id), None)
        
        if not session:
            return None
        
        return {
            "session_id": session.session_id,
            "problem": session.problem,
            "reasoning_type": session.reasoning_type.value,
            "quantum_state": session.quantum_state.value,
            "possibilities": len(session.possibilities),
            "coherence_level": session.coherence_level,
            "final_solution": session.final_solution,
            "duration": session.duration,
            "created_at": session.created_at.isoformat()
        }
    
    def health_check(self) -> bool:
        """Check if quantum reasoning system is healthy."""
        
        try:
            return (len(self.reasoning_methods) == 6 and
                   len(self.reasoning_performance) == 3 and
                   hasattr(self, 'hadamard'))
        except:
            return False

# Global instance
_quantum_reasoning_system: Optional[QuantumReasoningSystem] = None

def get_quantum_reasoning_system(limbic_system: LimbicSystem, memory_system: MemorySystem) -> QuantumReasoningSystem:
    """Get or create the global quantum reasoning system."""
    global _quantum_reasoning_system
    if _quantum_reasoning_system is None:
        _quantum_reasoning_system = QuantumReasoningSystem(limbic_system, memory_system)
    return _quantum_reasoning_system
