"""
Advanced Dream Cycle Engine - Overnight Processing System
Generates insights, tracks Heritage DNA evolution, produces Morning Reports
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from pathlib import Path
import numpy as np
from collections import defaultdict
import hashlib
import pickle

@dataclass
class HeritageDNA:
    """Represents the evolving Heritage DNA of Sallie"""
    user_id: str
    personality_traits: Dict[str, float]
    emotional_patterns: Dict[str, float]
    cognitive_preferences: Dict[str, float]
    relationship_dynamics: Dict[str, float]
    wisdom_insights: List[str]
    growth_milestones: List[Dict[str, Any]]
    last_updated: datetime
    
    def evolve(self, new_data: Dict[str, Any]):
        """Evolve the DNA based on new interactions"""
        # Update personality traits
        if 'personality' in new_data:
            for trait, value in new_data['personality'].items():
                if trait in self.personality_traits:
                    # Gradual evolution with momentum
                    current_value = self.personality_traits[trait]
                    self.personality_traits[trait] = current_value * 0.9 + value * 0.1
                else:
                    self.personality_traits[trait] = value
        
        # Update emotional patterns
        if 'emotions' in new_data:
            for emotion, value in new_data['emotions'].items():
                if emotion in self.emotional_patterns:
                    current_value = self.emotional_patterns[emotion]
                    self.emotional_patterns[emotion] = current_value * 0.85 + value * 0.15
                else:
                    self.emotional_patterns[emotion] = value
        
        # Update cognitive preferences
        if 'cognitive' in new_data:
            for pref, value in new_data['cognitive'].items():
                if pref in self.cognitive_preferences:
                    current_value = self.cognitive_preferences[pref]
                    self.cognitive_preferences[pref] = current_value * 0.8 + value * 0.2
                else:
                    self.cognitive_preferences[pref] = value
        
        # Update relationship dynamics
        if 'relationships' in new_data:
            for rel, value in new_data['relationships'].items():
                if rel in self.relationship_dynamics:
                    current_value = self.relationship_dynamics[rel]
                    self.relationship_dynamics[rel] = current_value * 0.75 + value * 0.25
                else:
                    self.relationship_dynamics[rel] = value
        
        self.last_updated = datetime.now()
    
    def get_dna_hash(self) -> str:
        """Generate hash of current DNA state"""
        dna_data = {
            'personality': self.personality_traits,
            'emotions': self.emotional_patterns,
            'cognitive': self.cognitive_preferences,
            'relationships': self.relationship_dynamics
        }
        return hashlib.md5(json.dumps(dna_data, sort_keys=True).encode()).hexdigest()

@dataclass
class MorningReport:
    """Comprehensive morning report from dream processing"""
    date: datetime
    user_id: str
    insights_generated: List[Dict[str, Any]]
    dna_evolution: Dict[str, Any]
    emotional_summary: Dict[str, float]
    cognitive_highlights: List[str]
    relationship_insights: List[str]
    wisdom_synthesis: str
    growth_recommendations: List[str]
    dream_quality_score: float
    processing_metrics: Dict[str, Any]

class DreamCycleEngine:
    """Advanced overnight dream processing engine"""
    
    def __init__(self, data_dir: Path = Path("data/dream_cycle")):
        self.data_dir = data_dir
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.logger = logging.getLogger(__name__)
        self.heritage_dna: Dict[str, HeritageDNA] = {}
        self.interaction_buffer: List[Dict[str, Any]] = []
        self.insight_cache: Dict[str, List[Dict[str, Any]]] = {}
        
        # Processing queues
        self.dream_queue = asyncio.Queue()
        self.insight_queue = asyncio.Queue()
        self.evolution_queue = asyncio.Queue()
        
        # Performance metrics
        self.processing_stats = {
            'total_dreams_processed': 0,
            'total_insights_generated': 0,
            'average_processing_time': 0.0,
            'dna_evolution_events': 0,
            'last_processing_time': None
        }
        
        # Load existing DNA data
        self._load_heritage_dna()
    
    def _load_heritage_dna(self):
        """Load existing Heritage DNA from storage"""
        dna_file = self.data_dir / "heritage_dna.json"
        if dna_file.exists():
            try:
                with open(dna_file, 'r') as f:
                    dna_data = json.load(f)
                    for user_id, dna_dict in dna_data.items():
                        self.heritage_dna[user_id] = HeritageDNA(
                            user_id=user_id,
                            personality_traits=dna_dict['personality_traits'],
                            emotional_patterns=dna_dict['emotional_patterns'],
                            cognitive_preferences=dna_dict['cognitive_preferences'],
                            relationship_dynamics=dna_dict['relationship_dynamics'],
                            wisdom_insights=dna_dict['wisdom_insights'],
                            growth_milestones=dna_dict['growth_milestones'],
                            last_updated=datetime.fromisoformat(dna_dict['last_updated'])
                        )
                self.logger.info(f"Loaded Heritage DNA for {len(self.heritage_dna)} users")
            except Exception as e:
                self.logger.error(f"Error loading Heritage DNA: {e}")
    
    def _save_heritage_dna(self):
        """Save Heritage DNA to storage"""
        dna_file = self.data_dir / "heritage_dna.json"
        try:
            dna_data = {}
            for user_id, dna in self.heritage_dna.items():
                dna_data[user_id] = {
                    'personality_traits': dna.personality_traits,
                    'emotional_patterns': dna.emotional_patterns,
                    'cognitive_preferences': dna.cognitive_preferences,
                    'relationship_dynamics': dna.relationship_dynamics,
                    'wisdom_insights': dna.wisdom_insights,
                    'growth_milestones': dna.growth_milestones,
                    'last_updated': dna.last_updated.isoformat()
                }
            
            with open(dna_file, 'w') as f:
                json.dump(dna_data, f, indent=2)
            
            self.logger.info("Heritage DNA saved successfully")
        except Exception as e:
            self.logger.error(f"Error saving Heritage DNA: {e}")
    
    async def start_dream_cycle(self):
        """Start the dream cycle processing"""
        self.logger.info("Starting Dream Cycle Engine")
        
        # Create processing tasks
        tasks = [
            asyncio.create_task(self._dream_processing_loop()),
            asyncio.create_task(self._insight_generation_loop()),
            asyncio.create_task(self._dna_evolution_loop()),
            asyncio.create_task(self._morning_report_loop())
        ]
        
        try:
            await asyncio.gather(*tasks)
        except asyncio.CancelledError:
            self.logger.info("Dream Cycle Engine stopped")
    
    async def _dream_processing_loop(self):
        """Main dream processing loop"""
        while True:
            try:
                # Get interaction data
                interaction_data = await self.dream_queue.get()
                
                # Process the interaction
                processed_data = await self._process_interaction(interaction_data)
                
                # Queue for insight generation
                await self.insight_queue.put(processed_data)
                
                # Queue for DNA evolution
                await self.evolution_queue.put(processed_data)
                
                self.processing_stats['total_dreams_processed'] += 1
                
            except Exception as e:
                self.logger.error(f"Error in dream processing: {e}")
                await asyncio.sleep(1)
    
    async def _insight_generation_loop(self):
        """Generate insights from processed data"""
        while True:
            try:
                data = await self.insight_queue.get()
                
                # Generate insights
                insights = await self._generate_insights(data)
                
                # Cache insights
                user_id = data.get('user_id', 'default')
                if user_id not in self.insight_cache:
                    self.insight_cache[user_id] = []
                
                self.insight_cache[user_id].extend(insights)
                
                # Keep only recent insights (last 100)
                if len(self.insight_cache[user_id]) > 100:
                    self.insight_cache[user_id] = self.insight_cache[user_id][-100:]
                
                self.processing_stats['total_insights_generated'] += len(insights)
                
            except Exception as e:
                self.logger.error(f"Error in insight generation: {e}")
                await asyncio.sleep(1)
    
    async def _dna_evolution_loop(self):
        """Evolve Heritage DNA based on new data"""
        while True:
            try:
                data = await self.evolution_queue.get()
                user_id = data.get('user_id', 'default')
                
                # Initialize DNA if needed
                if user_id not in self.heritage_dna:
                    self.heritage_dna[user_id] = HeritageDNA(
                        user_id=user_id,
                        personality_traits={},
                        emotional_patterns={},
                        cognitive_preferences={},
                        relationship_dynamics={},
                        wisdom_insights=[],
                        growth_milestones=[],
                        last_updated=datetime.now()
                    )
                
                # Evolve DNA
                old_hash = self.heritage_dna[user_id].get_dna_hash()
                self.heritage_dna[user_id].evolve(data)
                new_hash = self.heritage_dna[user_id].get_dna_hash()
                
                # Track evolution events
                if old_hash != new_hash:
                    self.processing_stats['dna_evolution_events'] += 1
                    
                    # Add growth milestone
                    milestone = {
                        'timestamp': datetime.now().isoformat(),
                        'type': 'dna_evolution',
                        'old_hash': old_hash,
                        'new_hash': new_hash,
                        'trigger_data': data
                    }
                    self.heritage_dna[user_id].growth_milestones.append(milestone)
                
                # Save DNA periodically
                if self.processing_stats['dna_evolution_events'] % 10 == 0:
                    self._save_heritage_dna()
                
            except Exception as e:
                self.logger.error(f"Error in DNA evolution: {e}")
                await asyncio.sleep(1)
    
    async def _morning_report_loop(self):
        """Generate morning reports"""
        while True:
            try:
                # Wait until morning (6 AM)
                now = datetime.now()
                morning = now.replace(hour=6, minute=0, second=0, microsecond=0)
                if now > morning:
                    morning = morning + timedelta(days=1)
                
                sleep_time = (morning - now).total_seconds()
                await asyncio.sleep(sleep_time)
                
                # Generate morning reports for all users
                for user_id in self.heritage_dna.keys():
                    report = await self._generate_morning_report(user_id)
                    await self._save_morning_report(report)
                
                self.logger.info(f"Generated morning reports for {len(self.heritage_dna)} users")
                
            except Exception as e:
                self.logger.error(f"Error in morning report generation: {e}")
                await asyncio.sleep(3600)  # Retry in 1 hour
    
    async def _process_interaction(self, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process interaction data for dream cycle"""
        processed = {
            'user_id': interaction_data.get('user_id', 'default'),
            'timestamp': datetime.now().isoformat(),
            'type': interaction_data.get('type', 'unknown'),
            'content': interaction_data.get('content', ''),
            'emotional_context': self._extract_emotional_context(interaction_data),
            'cognitive_patterns': self._analyze_cognitive_patterns(interaction_data),
            'relationship_dynamics': self._analyze_relationship_dynamics(interaction_data),
            'metadata': interaction_data.get('metadata', {})
        }
        
        return processed
    
    def _extract_emotional_context(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Extract emotional context from interaction"""
        emotions = {
            'joy': 0.0, 'sadness': 0.0, 'anger': 0.0, 'fear': 0.0,
            'surprise': 0.0, 'disgust': 0.0, 'trust': 0.0, 'anticipation': 0.0
        }
        
        content = data.get('content', '').lower()
        
        # Simple emotion keyword analysis
        emotion_keywords = {
            'joy': ['happy', 'joy', 'excited', 'wonderful', 'amazing', 'love'],
            'sadness': ['sad', 'depressed', 'unhappy', 'cry', 'tears', 'grief'],
            'anger': ['angry', 'mad', 'furious', 'rage', 'irritated', 'annoyed'],
            'fear': ['scared', 'afraid', 'terrified', 'anxious', 'worried', 'panic'],
            'surprise': ['surprised', 'shocked', 'amazed', 'astonished', 'unexpected'],
            'disgust': ['disgusted', 'revolted', 'sick', 'nauseating', 'repulsive'],
            'trust': ['trust', 'believe', 'confident', 'secure', 'safe', 'rely'],
            'anticipation': ['excited', 'eager', 'looking forward', 'expect', 'hopeful']
        }
        
        for emotion, keywords in emotion_keywords.items():
            for keyword in keywords:
                if keyword in content:
                    emotions[emotion] += 0.2
        
        # Normalize emotions
        total = sum(emotions.values())
        if total > 0:
            emotions = {k: v/total for k, v in emotions.items()}
        
        return emotions
    
    def _analyze_cognitive_patterns(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze cognitive patterns from interaction"""
        patterns = {
            'analytical': 0.0,
            'creative': 0.0,
            'intuitive': 0.0,
            'logical': 0.0,
            'emotional': 0.0,
            'practical': 0.0
        }
        
        content = data.get('content', '').lower()
        
        # Analytical indicators
        analytical_words = ['analyze', 'examine', 'investigate', 'research', 'study', 'evaluate']
        patterns['analytical'] = sum(1 for word in analytical_words if word in content) * 0.2
        
        # Creative indicators
        creative_words = ['create', 'imagine', 'design', 'invent', 'artistic', 'innovative']
        patterns['creative'] = sum(1 for word in creative_words if word in content) * 0.2
        
        # Intuitive indicators
        intuitive_words = ['feel', 'sense', 'intuition', 'gut', 'instinct', 'perceive']
        patterns['intuitive'] = sum(1 for word in intuitive_words if word in content) * 0.2
        
        # Logical indicators
        logical_words = ['logic', 'reason', 'because', 'therefore', 'conclude', 'deduce']
        patterns['logical'] = sum(1 for word in logical_words if word in content) * 0.2
        
        # Emotional indicators
        emotional_words = ['feel', 'emotion', 'heart', 'love', 'care', 'empathy']
        patterns['emotional'] = sum(1 for word in emotional_words if word in content) * 0.2
        
        # Practical indicators
        practical_words = ['practical', 'useful', 'apply', 'implement', 'action', 'do']
        patterns['practical'] = sum(1 for word in practical_words if word in content) * 0.2
        
        # Normalize patterns
        total = sum(patterns.values())
        if total > 0:
            patterns = {k: v/total for k, v in patterns.items()}
        
        return patterns
    
    def _analyze_relationship_dynamics(self, data: Dict[str, Any]) -> Dict[str, float]:
        """Analyze relationship dynamics from interaction"""
        dynamics = {
            'intimacy': 0.0,
            'trust': 0.0,
            'dependence': 0.0,
            'independence': 0.0,
            'collaboration': 0.0,
            'conflict': 0.0
        }
        
        content = data.get('content', '').lower()
        
        # Intimacy indicators
        intimacy_words = ['close', 'intimate', 'personal', 'private', 'deep', 'meaningful']
        dynamics['intimacy'] = sum(1 for word in intimacy_words if word in content) * 0.2
        
        # Trust indicators
        trust_words = ['trust', 'believe', 'confident', 'rely', 'depend', 'faith']
        dynamics['trust'] = sum(1 for word in trust_words if word in content) * 0.2
        
        # Dependence indicators
        dependence_words = ['need', 'require', 'depend', 'rely', 'help', 'support']
        dynamics['dependence'] = sum(1 for word in dependence_words if word in content) * 0.2
        
        # Independence indicators
        independence_words = ['independent', 'alone', 'self', 'autonomous', 'free']
        dynamics['independence'] = sum(1 for word in independence_words if word in content) * 0.2
        
        # Collaboration indicators
        collaboration_words = ['together', 'team', 'partner', 'cooperate', 'joint', 'shared']
        dynamics['collaboration'] = sum(1 for word in collaboration_words if word in content) * 0.2
        
        # Conflict indicators
        conflict_words = ['conflict', 'disagree', 'argue', 'fight', 'tension', 'stress']
        dynamics['conflict'] = sum(1 for word in conflict_words if word in content) * 0.2
        
        # Normalize dynamics
        total = sum(dynamics.values())
        if total > 0:
            dynamics = {k: v/total for k, v in dynamics.items()}
        
        return dynamics
    
    async def _generate_insights(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate insights from processed data"""
        insights = []
        
        # Emotional insights
        emotional_context = data.get('emotional_context', {})
        if emotional_context:
            dominant_emotion = max(emotional_context, key=emotional_context.get)
            if emotional_context[dominant_emotion] > 0.5:
                insights.append({
                    'type': 'emotional',
                    'category': dominant_emotion,
                    'insight': f"Strong {dominant_emotion} detected in interaction",
                    'confidence': emotional_context[dominant_emotion],
                    'timestamp': datetime.now().isoformat()
                })
        
        # Cognitive insights
        cognitive_patterns = data.get('cognitive_patterns', {})
        if cognitive_patterns:
            dominant_pattern = max(cognitive_patterns, key=cognitive_patterns.get)
            if cognitive_patterns[dominant_pattern] > 0.4:
                insights.append({
                    'type': 'cognitive',
                    'category': dominant_pattern,
                    'insight': f"User shows {dominant_pattern} thinking patterns",
                    'confidence': cognitive_patterns[dominant_pattern],
                    'timestamp': datetime.now().isoformat()
                })
        
        # Relationship insights
        relationship_dynamics = data.get('relationship_dynamics', {})
        if relationship_dynamics:
            dominant_dynamic = max(relationship_dynamics, key=relationship_dynamics.get)
            if relationship_dynamics[dominant_dynamic] > 0.3:
                insights.append({
                    'type': 'relationship',
                    'category': dominant_dynamic,
                    'insight': f"Relationship dynamic shows {dominant_dynamic} patterns",
                    'confidence': relationship_dynamics[dominant_dynamic],
                    'timestamp': datetime.now().isoformat()
                })
        
        return insights
    
    async def _generate_morning_report(self, user_id: str) -> MorningReport:
        """Generate comprehensive morning report"""
        dna = self.heritage_dna.get(user_id)
        if not dna:
            dna = HeritageDNA(
                user_id=user_id,
                personality_traits={},
                emotional_patterns={},
                cognitive_preferences={},
                relationship_dynamics={},
                wisdom_insights=[],
                growth_milestones=[],
                last_updated=datetime.now()
            )
        
        # Get recent insights
        recent_insights = self.insight_cache.get(user_id, [])
        
        # Generate wisdom synthesis
        wisdom_synthesis = self._generate_wisdom_synthesis(dna, recent_insights)
        
        # Generate growth recommendations
        growth_recommendations = self._generate_growth_recommendations(dna, recent_insights)
        
        # Calculate dream quality score
        dream_quality_score = self._calculate_dream_quality_score(dna, recent_insights)
        
        report = MorningReport(
            date=datetime.now(),
            user_id=user_id,
            insights_generated=recent_insights[-10:],  # Last 10 insights
            dna_evolution={
                'personality_changes': self._calculate_trait_changes(dna),
                'emotional_evolution': self._calculate_emotional_evolution(dna),
                'cognitive_development': self._calculate_cognitive_development(dna)
            },
            emotional_summary=dna.emotional_patterns,
            cognitive_highlights=self._get_cognitive_highlights(dna),
            relationship_insights=self._get_relationship_insights(dna),
            wisdom_synthesis=wisdom_synthesis,
            growth_recommendations=growth_recommendations,
            dream_quality_score=dream_quality_score,
            processing_metrics=self.processing_stats.copy()
        )
        
        return report
    
    def _generate_wisdom_synthesis(self, dna: HeritageDNA, insights: List[Dict[str, Any]]) -> str:
        """Generate wisdom synthesis from DNA and insights"""
        if not insights:
            return "No recent insights to synthesize."
        
        # Analyze insight patterns
        insight_types = defaultdict(int)
        for insight in insights:
            insight_types[insight.get('type', 'unknown')] += 1
        
        # Generate synthesis based on dominant patterns
        synthesis_parts = []
        
        if insight_types['emotional'] > 0:
            synthesis_parts.append("Your emotional landscape shows rich complexity and depth.")
        
        if insight_types['cognitive'] > 0:
            synthesis_parts.append("Your cognitive patterns reveal thoughtful analysis and creative problem-solving.")
        
        if insight_types['relationship'] > 0:
            synthesis_parts.append("Your relationship dynamics demonstrate meaningful connections and growth.")
        
        if dna.wisdom_insights:
            synthesis_parts.append(f"Building on {len(dna.wisdom_insights)} previous wisdom insights.")
        
        return " ".join(synthesis_parts) if synthesis_parts else "Continuing to learn and grow together."
    
    def _generate_growth_recommendations(self, dna: HeritageDNA, insights: List[Dict[str, Any]]) -> List[str]:
        """Generate personalized growth recommendations"""
        recommendations = []
        
        # Analyze emotional patterns
        if dna.emotional_patterns:
            lowest_emotion = min(dna.emotional_patterns, key=dna.emotional_patterns.get)
            if dna.emotional_patterns[lowest_emotion] < 0.3:
                recommendations.append(f"Consider exploring more {lowest_emotion} experiences for balance.")
        
        # Analyze cognitive patterns
        if dna.cognitive_preferences:
            highest_cognitive = max(dna.cognitive_preferences, key=dna.cognitive_preferences.get)
            recommendations.append(f"Your {highest_cognitive} thinking style is a strength - continue leveraging it.")
        
        # Analyze relationship dynamics
        if dna.relationship_dynamics:
            if dna.relationship_dynamics.get('trust', 0) > 0.7:
                recommendations.append("Your high trust levels create strong foundations for relationships.")
        
        # Add general growth recommendations
        if len(dna.growth_milestones) > 5:
            recommendations.append("You've shown consistent growth - continue this positive trajectory.")
        
        return recommendations[:3]  # Return top 3 recommendations
    
    def _calculate_dream_quality_score(self, dna: HeritageDNA, insights: List[Dict[str, Any]]) -> float:
        """Calculate overall dream quality score"""
        score = 0.0
        
        # DNA completeness (30%)
        trait_count = len([v for v in dna.personality_traits.values() if v > 0])
        emotion_count = len([v for v in dna.emotional_patterns.values() if v > 0])
        cognitive_count = len([v for v in dna.cognitive_preferences.values() if v > 0])
        relationship_count = len([v for v in dna.relationship_dynamics.values() if v > 0])
        
        completeness = (trait_count + emotion_count + cognitive_count + relationship_count) / 24  # Max 24 traits
        score += completeness * 0.3
        
        # Insight quality (40%)
        if insights:
            avg_confidence = np.mean([i.get('confidence', 0) for i in insights])
            score += avg_confidence * 0.4
        
        # Growth momentum (30%)
        if dna.growth_milestones:
            recent_milestones = [m for m in dna.growth_milestones 
                               if datetime.fromisoformat(m['timestamp']) > datetime.now() - timedelta(days=7)]
            growth_score = min(1.0, len(recent_milestones) / 5)
            score += growth_score * 0.3
        
        return min(1.0, score)
    
    def _calculate_trait_changes(self, dna: HeritageDNA) -> Dict[str, float]:
        """Calculate recent trait changes"""
        # Simplified - in production would track historical changes
        return {trait: value for trait, value in dna.personality_traits.items() if value > 0.1}
    
    def _calculate_emotional_evolution(self, dna: HeritageDNA) -> Dict[str, float]:
        """Calculate emotional evolution patterns"""
        return {emotion: value for emotion, value in dna.emotional_patterns.items() if value > 0.1}
    
    def _calculate_cognitive_development(self, dna: HeritageDNA) -> Dict[str, float]:
        """Calculate cognitive development patterns"""
        return {cognitive: value for cognitive, value in dna.cognitive_preferences.items() if value > 0.1}
    
    def _get_cognitive_highlights(self, dna: HeritageDNA) -> List[str]:
        """Get cognitive highlights"""
        highlights = []
        for cognitive, value in dna.cognitive_preferences.items():
            if value > 0.5:
                highlights.append(f"Strong {cognitive} thinking patterns")
        return highlights
    
    def _get_relationship_insights(self, dna: HeritageDNA) -> List[str]:
        """Get relationship insights"""
        insights = []
        for dynamic, value in dna.relationship_dynamics.items():
            if value > 0.4:
                insights.append(f"Healthy {dynamic} in relationships")
        return insights
    
    async def _save_morning_report(self, report: MorningReport):
        """Save morning report to storage"""
        report_file = self.data_dir / "morning_reports" / f"{report.user_id}_{report.date.strftime('%Y-%m-%d')}.json"
        report_file.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            report_data = asdict(report)
            report_data['date'] = report.date.isoformat()
            
            with open(report_file, 'w') as f:
                json.dump(report_data, f, indent=2)
            
            self.logger.info(f"Morning report saved for {report.user_id}")
        except Exception as e:
            self.logger.error(f"Error saving morning report: {e}")
    
    def add_interaction_data(self, interaction_data: Dict[str, Any]):
        """Add interaction data to dream queue"""
        asyncio.create_task(self.dream_queue.put(interaction_data))
    
    def get_morning_report(self, user_id: str, date: datetime) -> Optional[MorningReport]:
        """Get morning report for specific date"""
        report_file = self.data_dir / "morning_reports" / f"{user_id}_{date.strftime('%Y-%m-%d')}.json"
        
        if report_file.exists():
            try:
                with open(report_file, 'r') as f:
                    report_data = json.load(f)
                
                return MorningReport(
                    date=datetime.fromisoformat(report_data['date']),
                    user_id=report_data['user_id'],
                    insights_generated=report_data['insights_generated'],
                    dna_evolution=report_data['dna_evolution'],
                    emotional_summary=report_data['emotional_summary'],
                    cognitive_highlights=report_data['cognitive_highlights'],
                    relationship_insights=report_data['relationship_insights'],
                    wisdom_synthesis=report_data['wisdom_synthesis'],
                    growth_recommendations=report_data['growth_recommendations'],
                    dream_quality_score=report_data['dream_quality_score'],
                    processing_metrics=report_data['processing_metrics']
                )
            except Exception as e:
                self.logger.error(f"Error loading morning report: {e}")
        
        return None
    
    def get_heritage_dna(self, user_id: str) -> Optional[HeritageDNA]:
        """Get current Heritage DNA for user"""
        return self.heritage_dna.get(user_id)
    
    def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        return self.processing_stats.copy()

# Global dream cycle engine instance
dream_cycle_engine = DreamCycleEngine()
