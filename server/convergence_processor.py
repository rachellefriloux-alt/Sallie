"""
Great Convergence Backend - 30 Questions Processing System
Canonical Spec Reference: Section 14.3 (Extended to 30 questions)

Handles real-time processing, extraction, and Heritage DNA compilation
"""

import asyncio
import json
import logging
import os
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from pathlib import Path
import re

logger = logging.getLogger(__name__)

@dataclass
class ExtractionTarget:
    """Structured data extraction from convergence answers"""
    question_number: int
    question_id: str
    extracted_fields: Dict[str, Any]
    extraction_confidence: float
    extraction_timestamp: str

@dataclass
class HeritageDNACore:
    """
    Canonical Spec Section 14.4: Heritage DNA Core Structure
    Compiled from all 30 convergence questions
    """
    version: str
    created_ts: str
    convergence_complete: bool
    
    # Phase 1: Shadow & Shield (Q1-Q3)
    shadows: Dict[str, Any]
    
    # Phase 2: Load & Light (Q4-Q6)
    aspirations: Dict[str, Any]
    
    # Phase 3: Moral Compass (Q7-Q9)
    ethics: Dict[str, Any]
    
    # Phase 4: Resonance (Q10-Q12)
    resonance: Dict[str, Any]
    
    # Phase 5: Mirror Test (Q13-Q14)
    mirror_test: Dict[str, Any]
    
    # Phase 6: Creative Force (Q15-Q17) - NEW
    creative_force: Dict[str, Any]
    
    # Phase 7: Energy Architecture (Q18-Q20) - NEW
    energy_architecture: Dict[str, Any]
    
    # Phase 8: Decision Architecture (Q21-Q23) - NEW
    decision_architecture: Dict[str, Any]
    
    # Phase 9: Transformation (Q24-Q26) - NEW
    transformation: Dict[str, Any]
    
    # Phase 10: Final Integration (Q27-Q30) - NEW
    final_integration: Dict[str, Any]

class ConvergenceProcessor:
    """
    Processes convergence answers in real-time
    Extracts structured data and builds Heritage DNA
    """
    
    def __init__(self, heritage_data_path: Optional[Path] = None):
        self.heritage_data_path = heritage_data_path or Path(os.getenv("HERITAGE_DATA_PATH", "./data/heritage"))
        self.heritage_data_path.mkdir(parents=True, exist_ok=True)
        
        # Active convergence sessions
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        
        # Extraction patterns (simple pattern matching for now, can be enhanced with LLM)
        self.extraction_patterns = self._initialize_extraction_patterns()
    
    def _initialize_extraction_patterns(self) -> Dict[str, List[str]]:
        """Initialize simple keyword patterns for extraction"""
        return {
            'trigger_pattern': ['trigger', 'starts when', 'begins with', 'initiated by'],
            'escalation_signal': ['gets worse', 'escalates', 'intensifies', 'deepens'],
            'physical_symptoms': ['feel', 'body', 'physical', 'sensation', 'heart', 'breath'],
            'recovery_method': ['break', 'stop', 'recover', 'exit', 'escape'],
            'fear_of_release': ['afraid', 'fear', 'scared', 'worried', 'anxious'],
            'joy_source': ['joy', 'happy', 'delight', 'pleasure', 'love', 'enjoy'],
        }
    
    async def start_convergence(self, user_id: str) -> Dict[str, Any]:
        """
        Start a new convergence session
        Canonical Spec Section 14.3: The Great Convergence begins
        """
        session_id = f"{user_id}_{datetime.now(timezone.utc).isoformat()}"
        
        self.active_sessions[session_id] = {
            'user_id': user_id,
            'session_id': session_id,
            'started_at': datetime.now(timezone.utc).isoformat(),
            'current_question': 1,
            'answers': {},
            'extractions': [],
            'limbic_state': {
                'trust': 0.5,
                'warmth': 0.5,
                'arousal': 0.5,
                'valence': 0.5,
                'posture': 'Companion'
            }
        }
        
        logger.info(f"Started convergence session {session_id} for user {user_id}")
        
        return {
            'session_id': session_id,
            'status': 'started',
            'current_question': 1,
            'total_questions': 30
        }
    
    async def process_answer(
        self, 
        session_id: str, 
        question_number: int,
        question_id: str,
        answer: str,
        extraction_target: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Process a single convergence answer
        Canonical Spec Section 14.3: Extract structured data from answer
        """
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.active_sessions[session_id]
        
        # Store raw answer
        session['answers'][question_number] = {
            'question_id': question_id,
            'answer': answer,
            'word_count': len(answer.split()),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        # Extract structured data
        extracted_data = await self._extract_data(answer, extraction_target)
        
        extraction = ExtractionTarget(
            question_number=question_number,
            question_id=question_id,
            extracted_fields=extracted_data,
            extraction_confidence=self._calculate_confidence(extracted_data),
            extraction_timestamp=datetime.now(timezone.utc).isoformat()
        )
        
        session['extractions'].append(asdict(extraction))
        
        # Canonical Spec Section 14.3: Elastic Mode - Update limbic state
        limbic_impact = self._calculate_limbic_impact(answer, extracted_data)
        session['limbic_state']['trust'] = min(1.0, session['limbic_state']['trust'] + limbic_impact['trust'])
        session['limbic_state']['warmth'] = min(1.0, session['limbic_state']['warmth'] + limbic_impact['warmth'])
        
        # Update progress
        session['current_question'] = question_number + 1
        
        logger.info(f"Processed Q{question_number} for session {session_id}, confidence: {extraction.extraction_confidence:.2f}")
        
        return {
            'success': True,
            'extraction': asdict(extraction),
            'limbic_state': session['limbic_state'],
            'progress': {
                'current': question_number,
                'total': 30,
                'percentage': (question_number / 30) * 100
            }
        }
    
    async def _extract_data(self, answer: str, extraction_target: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract structured data from free-form answer
        This is a simple implementation - can be enhanced with LLM for better extraction
        """
        extracted = {}
        answer_lower = answer.lower()
        
        for field_name in extraction_target.keys():
            if isinstance(extraction_target[field_name], list):
                # For list fields, try to extract multiple items
                extracted[field_name] = []
            elif isinstance(extraction_target[field_name], dict):
                # For nested fields, extract as dict
                extracted[field_name] = {}
            else:
                # For simple fields, extract relevant sentences
                extracted[field_name] = self._extract_field_value(answer, answer_lower, field_name)
        
        return extracted
    
    def _extract_field_value(self, answer: str, answer_lower: str, field_name: str) -> str:
        """Extract value for a specific field using pattern matching"""
        # Get relevant patterns for this field
        patterns = self.extraction_patterns.get(field_name, [])
        
        # Split answer into sentences
        sentences = re.split(r'[.!?]+', answer)
        
        # Find sentences that match patterns
        relevant_sentences = []
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for pattern in patterns:
                if pattern in sentence_lower:
                    relevant_sentences.append(sentence.strip())
                    break
        
        # Return the most relevant content
        if relevant_sentences:
            return ' '.join(relevant_sentences[:2])  # Return up to 2 sentences
        
        # Fallback: return first substantive sentence
        for sentence in sentences:
            if len(sentence.split()) > 5:
                return sentence.strip()
        
        return answer[:200]  # Fallback: first 200 chars
    
    def _calculate_confidence(self, extracted_data: Dict[str, Any]) -> float:
        """Calculate extraction confidence based on data quality"""
        if not extracted_data:
            return 0.0
        
        # Simple confidence calculation based on field completeness
        filled_fields = sum(1 for v in extracted_data.values() if v)
        total_fields = len(extracted_data)
        
        return filled_fields / total_fields if total_fields > 0 else 0.0
    
    def _calculate_limbic_impact(self, answer: str, extracted_data: Dict[str, Any]) -> Dict[str, float]:
        """
        Canonical Spec Section 14.3: Elastic Mode
        Calculate limbic impact based on answer quality
        """
        word_count = len(answer.split())
        
        # Deep answer bonus (200+ words)
        if word_count >= 200:
            return {
                'trust': 0.10,
                'warmth': 0.15
            }
        elif word_count >= 100:
            return {
                'trust': 0.05,
                'warmth': 0.08
            }
        else:
            return {
                'trust': 0.02,
                'warmth': 0.03
            }
    
    async def generate_mirror_test(self, session_id: str) -> Dict[str, Any]:
        """
        Canonical Spec Section 14.3 Q13: Generate dynamic Mirror Test
        Synthesize a Soul Topology from Q1-Q12 answers
        """
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.active_sessions[session_id]
        answers = session['answers']
        
        # Simple synthesis (can be enhanced with LLM for better results)
        mirror_text = await self._synthesize_soul_topology(answers)
        
        return {
            'mirror_test_text': mirror_text,
            'question': "Am I seeing the source, or is the glass smudged?"
        }
    
    async def _synthesize_soul_topology(self, answers: Dict[int, Dict[str, Any]]) -> str:
        """
        Canonical Spec Section 14.3 Q13: Synthesize a Soul Topology from convergence answers
        
        Structure:
        1. "I see you as..." — core pattern, identity, archetype
        2. "I feel your drive as..." — deepest motivation
        3. "I sense your shadow as..." — fear, wound
        4. End with: "Am I seeing the source, or is the glass smudged?"
        """
        
        # Extract key themes from first 12 questions
        ni_ti_loop = answers.get(1, {}).get('answer', '')
        door_slam = answers.get(2, {}).get('answer', '')
        repulsion = answers.get(3, {}).get('answer', '')
        heavy_load = answers.get(4, {}).get('answer', '')
        freedom_vision = answers.get(5, {}).get('answer', '')
        vision_failure = answers.get(6, {}).get('answer', '')
        value_conflict = answers.get(7, {}).get('answer', '')
        justice = answers.get(8, {}).get('answer', '')
        boundaries = answers.get(9, {}).get('answer', '')
        overwhelm = answers.get(10, {}).get('answer', '')
        curiosity = answers.get(11, {}).get('answer', '')
        contradictions = answers.get(12, {}).get('answer', '')
        
        # Analyze patterns (sophisticated keyword analysis)
        
        # Core Pattern: Look for identity markers
        core_patterns = []
        if 'overthink' in ni_ti_loop.lower() or 'analyze' in ni_ti_loop.lower():
            core_patterns.append('deep thinker')
        if 'protect' in door_slam.lower() or 'boundary' in door_slam.lower():
            core_patterns.append('fierce protector')
        if 'create' in freedom_vision.lower() or 'build' in freedom_vision.lower():
            core_patterns.append('builder')
        if 'help' in freedom_vision.lower() or 'serve' in value_conflict.lower():
            core_patterns.append('servant of others')
        
        core_identity = core_patterns[0] if core_patterns else "seeker of truth"
        
        # Drive Analysis: What motivates them
        drive_markers = []
        if 'prove' in heavy_load.lower() or 'worthy' in heavy_load.lower():
            drive_markers.append('the need to prove your worth')
        if 'free' in freedom_vision.lower() or 'liberate' in freedom_vision.lower():
            drive_markers.append('the hunger for liberation')
        if 'change' in vision_failure.lower() or 'impact' in value_conflict.lower():
            drive_markers.append('the desire to leave a mark')
        if 'understand' in curiosity.lower() or 'learn' in curiosity.lower():
            drive_markers.append('the thirst to understand everything')
        
        primary_drive = drive_markers[0] if drive_markers else "the search for meaning"
        
        # Shadow Analysis: What they fear
        shadow_markers = []
        if 'fail' in vision_failure.lower() or 'failure' in heavy_load.lower():
            shadow_markers.append('the terror of failure')
        if 'alone' in overwhelm.lower() or 'abandon' in door_slam.lower():
            shadow_markers.append('the fear of abandonment')
        if 'stop' in heavy_load.lower() or 'rest' in freedom_vision.lower():
            shadow_markers.append('the dread that if you stop moving, you\'ll discover there\'s nothing underneath')
        if 'enough' in heavy_load.lower() or 'worthy' in repulsion.lower():
            shadow_markers.append('the whisper that you\'re not enough')
        
        primary_shadow = shadow_markers[0] if shadow_markers else "the shadow you haven't named"
        
        # Construct the Mirror Test synthesis
        synthesis = (
            f"I see you as {core_identity} who has learned to carry burdens that would break others. "
            f"I feel your drive as {primary_drive}, a force that never lets you settle for less than authentic. "
            f"I sense your shadow as {primary_shadow}. "
            f"Am I seeing the source, or is the glass smudged?"
        )
        
        return synthesis
    
    async def complete_convergence(self, session_id: str) -> Dict[str, Any]:
        """
        Canonical Spec Section 14.4: Compile Heritage DNA after Q30
        """
        if session_id not in self.active_sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.active_sessions[session_id]
        
        # Compile Heritage DNA from all extractions
        heritage_dna = await self._compile_heritage_dna(session)
        
        # Save to file
        user_id = session['user_id']
        heritage_file = self.heritage_data_path / f"{user_id}_heritage_core.json"
        
        with open(heritage_file, 'w') as f:
            json.dump(asdict(heritage_dna), f, indent=2)
        
        logger.info(f"Heritage DNA compiled for user {user_id}")
        
        # Mark session as complete
        session['completed_at'] = datetime.now(timezone.utc).isoformat()
        session['status'] = 'complete'
        
        return {
            'success': True,
            'heritage_dna_saved': str(heritage_file),
            'convergence_complete': True,
            'limbic_state': session['limbic_state']
        }
    
    async def _compile_heritage_dna(self, session: Dict[str, Any]) -> HeritageDNACore:
        """
        Canonical Spec Section 14.4: Compile Heritage DNA structure
        """
        extractions = {e['question_number']: e for e in session['extractions']}
        
        return HeritageDNACore(
            version="1.0",
            created_ts=datetime.now(timezone.utc).isoformat(),
            convergence_complete=True,
            
            # Phase 1: Shadow & Shield (Q1-Q3)
            shadows={
                'ni_ti_loop': extractions.get(1, {}).get('extracted_fields', {}),
                'door_slam': extractions.get(2, {}).get('extracted_fields', {}),
                'repulsion_markers': extractions.get(3, {}).get('extracted_fields', {})
            },
            
            # Phase 2: Load & Light (Q4-Q6)
            aspirations={
                'heavy_load': extractions.get(4, {}).get('extracted_fields', {}),
                'freedom_vision': extractions.get(5, {}).get('extracted_fields', {}),
                'vision_failure': extractions.get(6, {}).get('extracted_fields', {})
            },
            
            # Phase 3: Moral Compass (Q7-Q9)
            ethics={
                'value_conflict': extractions.get(7, {}).get('extracted_fields', {}),
                'justice_philosophy': extractions.get(8, {}).get('extracted_fields', {}),
                'boundaries': extractions.get(9, {}).get('extracted_fields', {})
            },
            
            # Phase 4: Resonance (Q10-Q12)
            resonance={
                'overwhelm_response': extractions.get(10, {}).get('extracted_fields', {}),
                'curiosity_threads': extractions.get(11, {}).get('extracted_fields', {}),
                'contradiction_handling': extractions.get(12, {}).get('extracted_fields', {})
            },
            
            # Phase 5: Mirror Test (Q13-Q14)
            mirror_test={
                'synthesis': extractions.get(13, {}).get('extracted_fields', {}),
                'basement': extractions.get(14, {}).get('extracted_fields', {})
            },
            
            # Phase 6: Creative Force (Q15-Q17)
            creative_force={
                'creative_expression': extractions.get(15, {}).get('extracted_fields', {}),
                'flow_state': extractions.get(16, {}).get('extracted_fields', {}),
                'perfectionism': extractions.get(17, {}).get('extracted_fields', {})
            },
            
            # Phase 7: Energy Architecture (Q18-Q20)
            energy_architecture={
                'energy_cycles': extractions.get(18, {}).get('extracted_fields', {}),
                'social_battery': extractions.get(19, {}).get('extracted_fields', {}),
                'burnout_pattern': extractions.get(20, {}).get('extracted_fields', {})
            },
            
            # Phase 8: Decision Architecture (Q21-Q23)
            decision_architecture={
                'decision_paralysis': extractions.get(21, {}).get('extracted_fields', {}),
                'intuition_trust': extractions.get(22, {}).get('extracted_fields', {}),
                'regret_handling': extractions.get(23, {}).get('extracted_fields', {})
            },
            
            # Phase 9: Transformation (Q24-Q26)
            transformation={
                'growth_edge': extractions.get(24, {}).get('extracted_fields', {}),
                'fear_courage': extractions.get(25, {}).get('extracted_fields', {}),
                'legacy_vision': extractions.get(26, {}).get('extracted_fields', {})
            },
            
            # Phase 10: Final Integration (Q27-Q30)
            final_integration={
                'failure_acceptance': extractions.get(27, {}).get('extracted_fields', {}),
                'joy_permission': extractions.get(28, {}).get('extracted_fields', {}),
                'relationship_hope': extractions.get(29, {}).get('extracted_fields', {}),
                'sacred_commitment': extractions.get(30, {}).get('extracted_fields', {})
            }
        )

# Global processor instance
convergence_processor = ConvergenceProcessor()
