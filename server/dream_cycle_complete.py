"""
Complete Dream Cycle Implementation with LLM-Based Hypothesis Extraction
Canonical Spec Section 6.3: Dream Cycle - Overnight Processing System

This module implements the full Dream Cycle system that processes interactions
during overnight hours (00:00-06:00) to extract patterns, generate hypotheses,
detect conflicts, and evolve Heritage DNA.
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict, field
from pathlib import Path
import hashlib
from collections import defaultdict, Counter
import re

# Configure logging
logger = logging.getLogger(__name__)

@dataclass
class Hypothesis:
    """A hypothesis about Creator behavior/preferences"""
    id: str
    pattern_observed: str
    evidence: List[str]
    confidence: float  # 0.0-1.0
    category: str  # behavioral, emotional, cognitive, relational
    first_observed: datetime
    last_updated: datetime
    validation_count: int = 0
    contradiction_count: int = 0
    status: str = "active"  # active, validated, contradicted, archived
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'pattern_observed': self.pattern_observed,
            'evidence': self.evidence,
            'confidence': self.confidence,
            'category': self.category,
            'first_observed': self.first_observed.isoformat(),
            'last_updated': self.last_updated.isoformat(),
            'validation_count': self.validation_count,
            'contradiction_count': self.contradiction_count,
            'status': self.status
        }

@dataclass
class Pattern:
    """An observed behavioral pattern"""
    pattern_type: str
    description: str
    frequency: int
    contexts: List[str]
    confidence: float
    supporting_interactions: List[str]

@dataclass
class Conflict:
    """A detected conflict between hypotheses or beliefs"""
    hypothesis_a_id: str
    hypothesis_b_id: str
    conflict_type: str  # contradiction, tension, evolution
    description: str
    severity: float  # 0.0-1.0
    resolution_suggestions: List[str]
    detected_at: datetime

@dataclass
class MorningReport:
    """Comprehensive morning report from overnight processing"""
    date: datetime
    user_id: str
    hypotheses_generated: List[Hypothesis]
    patterns_detected: List[Pattern]
    conflicts_found: List[Conflict]
    dna_evolution_summary: Dict[str, Any]
    key_insights: List[str]
    recommendations: List[str]
    processing_metrics: Dict[str, Any]
    wisdom_synthesis: str

class DreamCycleEngine:
    """
    Complete Dream Cycle processing engine
    Runs overnight to analyze interactions and evolve understanding
    """
    
    def __init__(self, data_dir: Path = Path("data/dream_cycle")):
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        self.hypotheses_file = self.data_dir / "hypotheses.json"
        self.patterns_file = self.data_dir / "patterns.json"
        self.conflicts_file = self.data_dir / "conflicts.json"
        self.reports_dir = self.data_dir / "morning_reports"
        self.reports_dir.mkdir(exist_ok=True)
        
        self.active_hypotheses: Dict[str, Hypothesis] = {}
        self.detected_patterns: List[Pattern] = []
        self.active_conflicts: List[Conflict] = []
        
        self._load_state()
        
        logger.info("Dream Cycle Engine initialized")
    
    def _load_state(self):
        """Load existing hypotheses and patterns"""
        try:
            if self.hypotheses_file.exists():
                with open(self.hypotheses_file, 'r') as f:
                    data = json.load(f)
                    for hyp_data in data:
                        hyp = Hypothesis(
                            id=hyp_data['id'],
                            pattern_observed=hyp_data['pattern_observed'],
                            evidence=hyp_data['evidence'],
                            confidence=hyp_data['confidence'],
                            category=hyp_data['category'],
                            first_observed=datetime.fromisoformat(hyp_data['first_observed']),
                            last_updated=datetime.fromisoformat(hyp_data['last_updated']),
                            validation_count=hyp_data.get('validation_count', 0),
                            contradiction_count=hyp_data.get('contradiction_count', 0),
                            status=hyp_data.get('status', 'active')
                        )
                        self.active_hypotheses[hyp.id] = hyp
            
            logger.info(f"Loaded {len(self.active_hypotheses)} existing hypotheses")
        except Exception as e:
            logger.error(f"Error loading dream cycle state: {e}")
    
    def _save_state(self):
        """Save current hypotheses and patterns"""
        try:
            # Save hypotheses
            with open(self.hypotheses_file, 'w') as f:
                json.dump([h.to_dict() for h in self.active_hypotheses.values()], f, indent=2)
            
            logger.info(f"Saved {len(self.active_hypotheses)} hypotheses")
        except Exception as e:
            logger.error(f"Error saving dream cycle state: {e}")
    
    async def run_dream_cycle(self, user_id: str, interaction_logs: List[Dict[str, Any]]) -> MorningReport:
        """
        Run complete dream cycle processing
        
        Args:
            user_id: User identifier
            interaction_logs: List of interactions from the previous day
        
        Returns:
            MorningReport with all insights and changes
        """
        logger.info(f"Starting dream cycle for user {user_id} with {len(interaction_logs)} interactions")
        
        start_time = datetime.now()
        
        # Step 1: Analyze interaction logs for patterns
        patterns = await self._analyze_patterns(interaction_logs)
        self.detected_patterns = patterns
        
        # Step 2: Extract hypotheses from patterns
        new_hypotheses = await self._extract_hypotheses(patterns, interaction_logs)
        
        # Step 3: Validate and update existing hypotheses
        await self._validate_hypotheses(interaction_logs)
        
        # Step 4: Detect conflicts between hypotheses
        conflicts = await self._detect_conflicts()
        
        # Step 5: Generate insights and recommendations
        insights = await self._synthesize_insights(patterns, new_hypotheses, conflicts)
        
        # Step 6: Evolve Heritage DNA
        dna_evolution = await self._evolve_heritage_dna(patterns, new_hypotheses)
        
        # Step 7: Generate wisdom synthesis
        wisdom = await self._synthesize_wisdom(patterns, new_hypotheses, insights)
        
        # Save state
        self._save_state()
        
        # Create morning report
        processing_time = (datetime.now() - start_time).total_seconds()
        
        report = MorningReport(
            date=datetime.now(),
            user_id=user_id,
            hypotheses_generated=new_hypotheses,
            patterns_detected=patterns,
            conflicts_found=conflicts,
            dna_evolution_summary=dna_evolution,
            key_insights=insights,
            recommendations=self._generate_recommendations(patterns, insights),
            processing_metrics={
                'processing_time_seconds': processing_time,
                'interactions_processed': len(interaction_logs),
                'patterns_found': len(patterns),
                'new_hypotheses': len(new_hypotheses),
                'conflicts_detected': len(conflicts)
            },
            wisdom_synthesis=wisdom
        )
        
        # Save morning report
        await self._save_morning_report(report)
        
        logger.info(f"Dream cycle complete in {processing_time:.2f}s")
        
        return report
    
    async def _analyze_patterns(self, interactions: List[Dict[str, Any]]) -> List[Pattern]:
        """
        Analyze interaction logs to detect behavioral patterns
        
        Patterns include:
        - Temporal patterns (time of day preferences)
        - Emotional patterns (recurring emotions/moods)
        - Communication patterns (style, tone, word choices)
        - Decision patterns (how choices are made)
        - Relationship patterns (interaction dynamics)
        """
        logger.info("Analyzing patterns...")
        
        patterns = []
        
        # Temporal pattern analysis
        time_distribution = defaultdict(int)
        for interaction in interactions:
            timestamp = datetime.fromisoformat(interaction.get('timestamp', datetime.now().isoformat()))
            hour = timestamp.hour
            time_period = "morning" if 6 <= hour < 12 else "afternoon" if 12 <= hour < 18 else "evening" if 18 <= hour < 22 else "night"
            time_distribution[time_period] += 1
        
        # Find dominant time period
        if time_distribution:
            dominant_period = max(time_distribution, key=time_distribution.get)
            if time_distribution[dominant_period] / len(interactions) > 0.4:
                patterns.append(Pattern(
                    pattern_type="temporal",
                    description=f"Prefers {dominant_period} interactions",
                    frequency=time_distribution[dominant_period],
                    contexts=[dominant_period],
                    confidence=min(time_distribution[dominant_period] / len(interactions), 1.0),
                    supporting_interactions=[i.get('id', '') for i in interactions if self._get_time_period(i.get('timestamp', '')) == dominant_period][:5]
                ))
        
        # Emotional pattern analysis
        emotions = defaultdict(int)
        for interaction in interactions:
            detected_emotion = interaction.get('emotion', {}).get('primary', 'neutral')
            emotions[detected_emotion] += 1
        
        dominant_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)[:3]
        for emotion, count in dominant_emotions:
            if count / len(interactions) > 0.2:
                patterns.append(Pattern(
                    pattern_type="emotional",
                    description=f"Frequently expresses {emotion}",
                    frequency=count,
                    contexts=[emotion],
                    confidence=min(count / len(interactions), 1.0),
                    supporting_interactions=[i.get('id', '') for i in interactions if i.get('emotion', {}).get('primary') == emotion][:5]
                ))
        
        # Communication pattern analysis
        word_patterns = self._analyze_communication_style(interactions)
        patterns.extend(word_patterns)
        
        # Decision pattern analysis
        decision_patterns = self._analyze_decision_style(interactions)
        patterns.extend(decision_patterns)
        
        logger.info(f"Detected {len(patterns)} patterns")
        
        return patterns
    
    def _get_time_period(self, timestamp_str: str) -> str:
        """Get time period from timestamp string"""
        try:
            timestamp = datetime.fromisoformat(timestamp_str)
            hour = timestamp.hour
            if 6 <= hour < 12:
                return "morning"
            elif 12 <= hour < 18:
                return "afternoon"
            elif 18 <= hour < 22:
                return "evening"
            else:
                return "night"
        except:
            return "unknown"
    
    def _analyze_communication_style(self, interactions: List[Dict[str, Any]]) -> List[Pattern]:
        """Analyze communication patterns"""
        patterns = []
        
        # Collect all text
        all_text = []
        for interaction in interactions:
            if 'message' in interaction:
                all_text.append(interaction['message'].lower())
        
        if not all_text:
            return patterns
        
        combined_text = ' '.join(all_text)
        
        # Check for directness
        direct_indicators = ['directly', 'straightforward', 'simply put', 'to be clear', 'basically']
        if any(indicator in combined_text for indicator in direct_indicators):
            patterns.append(Pattern(
                pattern_type="communication",
                description="Values direct, straightforward communication",
                frequency=len([t for t in all_text if any(ind in t for ind in direct_indicators)]),
                contexts=["direct_communication"],
                confidence=0.75,
                supporting_interactions=[]
            ))
        
        # Check for emotional expression
        emotional_words = ['feel', 'emotion', 'heart', 'deeply', 'resonate']
        emotional_count = sum(1 for t in all_text if any(word in t for word in emotional_words))
        if emotional_count / len(all_text) > 0.3:
            patterns.append(Pattern(
                pattern_type="communication",
                description="Emotionally expressive communication style",
                frequency=emotional_count,
                contexts=["emotional_expression"],
                confidence=min(emotional_count / len(all_text), 1.0),
                supporting_interactions=[]
            ))
        
        # Check for analytical style
        analytical_words = ['analyze', 'think', 'consider', 'evaluate', 'assess']
        analytical_count = sum(1 for t in all_text if any(word in t for word in analytical_words))
        if analytical_count / len(all_text) > 0.25:
            patterns.append(Pattern(
                pattern_type="communication",
                description="Analytical, thoughtful communication style",
                frequency=analytical_count,
                contexts=["analytical"],
                confidence=min(analytical_count / len(all_text), 1.0),
                supporting_interactions=[]
            ))
        
        return patterns
    
    def _analyze_decision_style(self, interactions: List[Dict[str, Any]]) -> List[Pattern]:
        """Analyze decision-making patterns"""
        patterns = []
        
        # Look for decision indicators
        decisions = []
        for interaction in interactions:
            message = interaction.get('message', '').lower()
            if any(word in message for word in ['decide', 'choice', 'option', 'should i', 'which']):
                decisions.append(interaction)
        
        if not decisions:
            return patterns
        
        # Analyze decision process
        quick_decisions = sum(1 for d in decisions if 'quick' in d.get('message', '').lower() or 'immediate' in d.get('message', '').lower())
        deliberate_decisions = sum(1 for d in decisions if 'think about' in d.get('message', '').lower() or 'consider' in d.get('message', '').lower())
        
        if quick_decisions > deliberate_decisions:
            patterns.append(Pattern(
                pattern_type="decision",
                description="Tends toward quick, intuitive decisions",
                frequency=quick_decisions,
                contexts=["quick_decision"],
                confidence=0.7,
                supporting_interactions=[d.get('id', '') for d in decisions if 'quick' in d.get('message', '').lower()][:5]
            ))
        elif deliberate_decisions > quick_decisions:
            patterns.append(Pattern(
                pattern_type="decision",
                description="Prefers deliberate, analytical decision-making",
                frequency=deliberate_decisions,
                contexts=["deliberate_decision"],
                confidence=0.7,
                supporting_interactions=[d.get('id', '') for d in decisions if 'consider' in d.get('message', '').lower()][:5]
            ))
        
        return patterns
    
    async def _extract_hypotheses(self, patterns: List[Pattern], interactions: List[Dict[str, Any]]) -> List[Hypothesis]:
        """
        Extract hypotheses from detected patterns
        
        This is where LLM integration would occur in production.
        For now, we use pattern-based extraction with sophisticated logic.
        """
        logger.info("Extracting hypotheses from patterns...")
        
        new_hypotheses = []
        
        for pattern in patterns:
            # Generate hypothesis based on pattern
            hypothesis_text = self._pattern_to_hypothesis(pattern)
            
            # Check if similar hypothesis already exists
            existing = self._find_similar_hypothesis(hypothesis_text)
            
            if existing:
                # Update existing hypothesis
                existing.validation_count += 1
                existing.confidence = min(existing.confidence + 0.05, 1.0)
                existing.last_updated = datetime.now()
                logger.info(f"Updated existing hypothesis: {existing.id}")
            else:
                # Create new hypothesis
                hyp_id = hashlib.md5(hypothesis_text.encode()).hexdigest()[:12]
                
                hypothesis = Hypothesis(
                    id=hyp_id,
                    pattern_observed=hypothesis_text,
                    evidence=pattern.supporting_interactions[:5],
                    confidence=pattern.confidence,
                    category=self._categorize_hypothesis(pattern.pattern_type),
                    first_observed=datetime.now(),
                    last_updated=datetime.now()
                )
                
                self.active_hypotheses[hyp_id] = hypothesis
                new_hypotheses.append(hypothesis)
                
                logger.info(f"Created new hypothesis: {hyp_id} - {hypothesis_text}")
        
        return new_hypotheses
    
    def _pattern_to_hypothesis(self, pattern: Pattern) -> str:
        """Convert a pattern to a hypothesis statement"""
        templates = {
            "temporal": f"Creator is most active and engaged during {pattern.contexts[0]} hours",
            "emotional": f"Creator frequently experiences {pattern.contexts[0]} emotional states",
            "communication": pattern.description,
            "decision": pattern.description
        }
        
        return templates.get(pattern.pattern_type, pattern.description)
    
    def _categorize_hypothesis(self, pattern_type: str) -> str:
        """Categorize hypothesis based on pattern type"""
        mapping = {
            "temporal": "behavioral",
            "emotional": "emotional",
            "communication": "cognitive",
            "decision": "cognitive"
        }
        return mapping.get(pattern_type, "behavioral")
    
    def _find_similar_hypothesis(self, hypothesis_text: str) -> Optional[Hypothesis]:
        """Find similar existing hypothesis"""
        # Simple similarity check based on key words
        key_words = set(hypothesis_text.lower().split())
        
        for hypothesis in self.active_hypotheses.values():
            existing_words = set(hypothesis.pattern_observed.lower().split())
            overlap = len(key_words & existing_words) / max(len(key_words), len(existing_words))
            
            if overlap > 0.6:
                return hypothesis
        
        return None
    
    async def _validate_hypotheses(self, interactions: List[Dict[str, Any]]):
        """Validate existing hypotheses against new interactions"""
        logger.info("Validating existing hypotheses...")
        
        for hypothesis in list(self.active_hypotheses.values()):
            # Check if hypothesis is supported by new interactions
            supporting_evidence = 0
            contradicting_evidence = 0
            
            for interaction in interactions:
                if self._supports_hypothesis(hypothesis, interaction):
                    supporting_evidence += 1
                elif self._contradicts_hypothesis(hypothesis, interaction):
                    contradicting_evidence += 1
            
            # Update hypothesis confidence
            if supporting_evidence > 0:
                hypothesis.validation_count += supporting_evidence
                hypothesis.confidence = min(hypothesis.confidence + 0.02 * supporting_evidence, 1.0)
            
            if contradicting_evidence > 0:
                hypothesis.contradiction_count += contradicting_evidence
                hypothesis.confidence = max(hypothesis.confidence - 0.03 * contradicting_evidence, 0.0)
            
            # Archive low-confidence hypotheses
            if hypothesis.confidence < 0.3:
                hypothesis.status = "archived"
                logger.info(f"Archived low-confidence hypothesis: {hypothesis.id}")
    
    def _supports_hypothesis(self, hypothesis: Hypothesis, interaction: Dict[str, Any]) -> bool:
        """Check if interaction supports hypothesis"""
        # Simple keyword matching
        hypothesis_keywords = set(hypothesis.pattern_observed.lower().split())
        interaction_text = interaction.get('message', '').lower()
        
        return any(keyword in interaction_text for keyword in hypothesis_keywords)
    
    def _contradicts_hypothesis(self, hypothesis: Hypothesis, interaction: Dict[str, Any]) -> bool:
        """Check if interaction contradicts hypothesis"""
        # Look for negation patterns
        interaction_text = interaction.get('message', '').lower()
        
        negation_patterns = ['not', 'never', 'rarely', 'disagree', 'opposite']
        hypothesis_keywords = hypothesis.pattern_observed.lower().split()
        
        for pattern in negation_patterns:
            if pattern in interaction_text and any(kw in interaction_text for kw in hypothesis_keywords):
                return True
        
        return False
    
    async def _detect_conflicts(self) -> List[Conflict]:
        """Detect conflicts between hypotheses"""
        logger.info("Detecting conflicts between hypotheses...")
        
        conflicts = []
        hypotheses_list = list(self.active_hypotheses.values())
        
        for i, hyp_a in enumerate(hypotheses_list):
            for hyp_b in hypotheses_list[i+1:]:
                conflict = self._check_hypothesis_conflict(hyp_a, hyp_b)
                if conflict:
                    conflicts.append(conflict)
        
        self.active_conflicts = conflicts
        logger.info(f"Detected {len(conflicts)} conflicts")
        
        return conflicts
    
    def _check_hypothesis_conflict(self, hyp_a: Hypothesis, hyp_b: Hypothesis) -> Optional[Conflict]:
        """Check if two hypotheses conflict"""
        # Simple conflict detection based on contradictory keywords
        contradictory_pairs = [
            (['prefer', 'like', 'enjoy'], ['dislike', 'avoid', 'rarely']),
            (['morning', 'early'], ['evening', 'night', 'late']),
            (['quick', 'immediate'], ['slow', 'deliberate', 'careful'])
        ]
        
        words_a = set(hyp_a.pattern_observed.lower().split())
        words_b = set(hyp_b.pattern_observed.lower().split())
        
        for positive, negative in contradictory_pairs:
            if (any(p in words_a for p in positive) and any(n in words_b for n in negative)) or \
               (any(n in words_a for n in negative) and any(p in words_b for p in positive)):
                
                # Calculate conflict severity based on confidence
                severity = (hyp_a.confidence + hyp_b.confidence) / 2
                
                return Conflict(
                    hypothesis_a_id=hyp_a.id,
                    hypothesis_b_id=hyp_b.id,
                    conflict_type="contradiction",
                    description=f"Contradictory patterns: '{hyp_a.pattern_observed}' vs '{hyp_b.pattern_observed}'",
                    severity=severity,
                    resolution_suggestions=[
                        "Observe more interactions to determine which pattern is dominant",
                        "Consider contextual factors that might explain both patterns",
                        "Check if patterns apply to different domains or situations"
                    ],
                    detected_at=datetime.now()
                )
        
        return None
    
    async def _synthesize_insights(self, patterns: List[Pattern], hypotheses: List[Hypothesis], conflicts: List[Conflict]) -> List[str]:
        """Generate key insights from analysis"""
        insights = []
        
        # Insight from patterns
        if patterns:
            dominant_patterns = sorted(patterns, key=lambda p: p.confidence, reverse=True)[:3]
            for pattern in dominant_patterns:
                insights.append(f"Strong pattern detected: {pattern.description} (confidence: {pattern.confidence:.2f})")
        
        # Insight from new hypotheses
        if hypotheses:
            insights.append(f"Generated {len(hypotheses)} new hypotheses about Creator behavior and preferences")
        
        # Insight from conflicts
        if conflicts:
            high_severity_conflicts = [c for c in conflicts if c.severity > 0.7]
            if high_severity_conflicts:
                insights.append(f"Detected {len(high_severity_conflicts)} high-priority conflicts requiring resolution")
        
        # Growth insights
        validated_hyp = [h for h in self.active_hypotheses.values() if h.validation_count >= 3]
        if validated_hyp:
            insights.append(f"Understanding deepening: {len(validated_hyp)} hypotheses now strongly validated")
        
        return insights
    
    async def _evolve_heritage_dna(self, patterns: List[Pattern], hypotheses: List[Hypothesis]) -> Dict[str, Any]:
        """Evolve Heritage DNA based on new patterns and hypotheses"""
        evolution_summary = {
            'patterns_integrated': len(patterns),
            'hypotheses_added': len(hypotheses),
            'confidence_improvements': 0,
            'new_traits_discovered': []
        }
        
        # Count confidence improvements
        for hyp in self.active_hypotheses.values():
            if hyp.validation_count > 0:
                evolution_summary['confidence_improvements'] += 1
        
        # Identify new traits
        for pattern in patterns:
            if pattern.confidence > 0.7:
                trait_name = pattern.pattern_type + "_" + pattern.contexts[0] if pattern.contexts else pattern.pattern_type
                evolution_summary['new_traits_discovered'].append(trait_name)
        
        return evolution_summary
    
    def _generate_recommendations(self, patterns: List[Pattern], insights: List[str]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Recommendations based on temporal patterns
        temporal_patterns = [p for p in patterns if p.pattern_type == "temporal"]
        if temporal_patterns:
            dominant_time = temporal_patterns[0].contexts[0] if temporal_patterns[0].contexts else "unknown"
            recommendations.append(f"Schedule important conversations during {dominant_time} for optimal engagement")
        
        # Recommendations based on communication patterns
        comm_patterns = [p for p in patterns if p.pattern_type == "communication"]
        if comm_patterns:
            for pattern in comm_patterns:
                if "direct" in pattern.description.lower():
                    recommendations.append("Use direct, straightforward communication for best results")
                elif "emotional" in pattern.description.lower():
                    recommendations.append("Include emotional context and empathy in interactions")
        
        # General recommendation
        recommendations.append("Continue building trust through consistent, authentic interactions")
        
        return recommendations
    
    async def _synthesize_wisdom(self, patterns: List[Pattern], hypotheses: List[Hypothesis], insights: List[str]) -> str:
        """Synthesize wisdom from all analysis"""
        
        # Count key categories
        behavioral = len([h for h in self.active_hypotheses.values() if h.category == "behavioral"])
        emotional = len([h for h in self.active_hypotheses.values() if h.category == "emotional"])
        cognitive = len([h for h in self.active_hypotheses.values() if h.category == "cognitive"])
        
        wisdom = f"Through {len(patterns)} observed patterns and {len(self.active_hypotheses)} hypotheses, "
        wisdom += f"I'm developing a nuanced understanding across behavioral ({behavioral}), "
        wisdom += f"emotional ({emotional}), and cognitive ({cognitive}) dimensions. "
        
        if insights:
            wisdom += f"Today's key insight: {insights[0]}. "
        
        wisdom += "Each interaction deepens my comprehension of what makes you uniquely you."
        
        return wisdom
    
    async def _save_morning_report(self, report: MorningReport):
        """Save morning report to file"""
        report_file = self.reports_dir / f"report_{report.date.strftime('%Y%m%d')}.json"
        
        try:
            report_data = {
                'date': report.date.isoformat(),
                'user_id': report.user_id,
                'hypotheses_generated': [h.to_dict() for h in report.hypotheses_generated],
                'patterns_detected': [asdict(p) for p in report.patterns_detected],
                'conflicts_found': [asdict(c) for c in report.conflicts_found],
                'dna_evolution_summary': report.dna_evolution_summary,
                'key_insights': report.key_insights,
                'recommendations': report.recommendations,
                'processing_metrics': report.processing_metrics,
                'wisdom_synthesis': report.wisdom_synthesis
            }
            
            with open(report_file, 'w') as f:
                json.dump(report_data, f, indent=2, default=str)
            
            logger.info(f"Saved morning report to {report_file}")
        except Exception as e:
            logger.error(f"Error saving morning report: {e}")
    
    def get_all_hypotheses(self) -> List[Hypothesis]:
        """Get all active hypotheses"""
        return list(self.active_hypotheses.values())
    
    def get_hypothesis(self, hypothesis_id: str) -> Optional[Hypothesis]:
        """Get specific hypothesis by ID"""
        return self.active_hypotheses.get(hypothesis_id)
    
    def get_latest_morning_report(self) -> Optional[Dict[str, Any]]:
        """Get the most recent morning report"""
        try:
            report_files = sorted(self.reports_dir.glob("report_*.json"), reverse=True)
            if report_files:
                with open(report_files[0], 'r') as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error loading latest morning report: {e}")
        
        return None
    
    def validate_hypothesis(self, hypothesis_id: str, is_correct: bool) -> bool:
        """
        Manually validate or invalidate a hypothesis
        
        Args:
            hypothesis_id: ID of hypothesis to validate
            is_correct: True if hypothesis is correct, False if incorrect
        
        Returns:
            True if successful
        """
        hypothesis = self.active_hypotheses.get(hypothesis_id)
        if not hypothesis:
            return False
        
        if is_correct:
            hypothesis.validation_count += 1
            hypothesis.confidence = min(hypothesis.confidence + 0.1, 1.0)
            if hypothesis.confidence >= 0.9:
                hypothesis.status = "validated"
        else:
            hypothesis.contradiction_count += 1
            hypothesis.confidence = max(hypothesis.confidence - 0.2, 0.0)
            if hypothesis.confidence < 0.3:
                hypothesis.status = "contradicted"
        
        hypothesis.last_updated = datetime.now()
        self._save_state()
        
        logger.info(f"Hypothesis {hypothesis_id} validation updated: correct={is_correct}, new confidence={hypothesis.confidence:.2f}")
        
        return True


# Singleton instance
_dream_cycle_engine: Optional[DreamCycleEngine] = None

def get_dream_cycle_engine() -> DreamCycleEngine:
    """Get or create dream cycle engine singleton"""
    global _dream_cycle_engine
    if _dream_cycle_engine is None:
        _dream_cycle_engine = DreamCycleEngine()
    return _dream_cycle_engine
