"""Cultural Context System.

Understanding and adapting to cultural contexts:
- Cultural background analysis
- Cultural preference learning
- Contextual communication adaptation
- Cultural norm recognition
- Cross-cultural understanding
- Cultural sensitivity
- Global perspective integration
- Cultural relationship building

This enables Sallie to be culturally intelligent and respectful.
"""

import json
import logging
import time
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from collections import defaultdict

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from kinship import KinshipSystem
from llm_router import get_llm_router

logger = setup_logging("cultural_context")

class CultureType(str, Enum):
    """Types of cultures."""
    WESTERN = "western"
    EASTERN = "eastern"
    MIDDLE_EASTERN = "middle_eastern"
    AFRICAN = "african"
    LATIN_AMERICAN = "latin_american"
    ASIAN = "asian"
    EUROPEAN = "european"
    PACIFIC_ISLANDER = "pacific_islander"
    INDIGENOUS = "indigenous"
    GLOBAL = "global"

class CommunicationStyle(str, Enum):
    """Communication styles across cultures."""
    DIRECT = "direct"
    INDIRECT = "indirect"
    HIGH_CONTEXT = "high_context"
    LOW_CONTEXT = "low_context"
    FORMAL = "formal"
    INFORMAL = "informal"
    RELATIONSHIP_FOCUSED = "relationship_focused"
    TASK_FOCUSED = "task_focused"

class CulturalValue(str, Enum):
    """Core cultural values."""
    INDIVIDUALISM = "individualism"
    COLLECTIVISM = "collectivism"
    POWER_DISTANCE = "power_distance"
    UNCERTAINTY_AVOIDANCE = "uncertainty_avoidance"
    LONG_TERM_ORIENTATION = "long_term_orientation"
    SHORT_TERM_ORIENTATION = "short_term_orientation"
    INDULGENCE = "indulgence"
    RESTRAINT = "restraint"

@dataclass
class CulturalProfile:
    """A cultural profile for a user or context."""
    profile_id: str
    user_id: str
    primary_culture: CultureType
    secondary_cultures: List[CultureType]
    communication_style: CommunicationStyle
    core_values: List[CulturalValue]
    preferences: Dict[str, Any]
    learned_patterns: List[Dict[str, Any]]
    confidence: float = 0.0
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    interactions_count: int = 0

@dataclass
class CulturalContext:
    """A cultural context analysis."""
    context_id: str
    culture_type: CultureType
    communication_style: CommunicationStyle
    norms: List[str]
    taboos: List[str]
    preferences: Dict[str, Any]
    sensitivity_level: float
    confidence: float
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class CulturalInteraction:
    """A cross-cultural interaction record."""
    interaction_id: str
    user_id: str
    culture_context: CultureType
    interaction_type: str
    content: str
    adaptation_applied: bool
    effectiveness: float
    timestamp: datetime
    feedback: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

class CulturalContextSystem:
    """System for understanding and adapting to cultural contexts."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem):
        self.limbic = limbic_system
        self.memory = memory_system
        self.kinship = kinship_system
        
        # Cultural profiles
        self.user_profiles: Dict[str, CulturalProfile] = {}
        self.cultural_contexts: Dict[CultureType, CulturalContext] = {}
        self.interactions: List[CulturalInteraction] = []
        
        # Cultural knowledge base
        self.cultural_knowledge = self._initialize_cultural_knowledge()
        
        # Learning parameters
        self.min_interactions_for_learning = 5
        self.confidence_threshold = 0.7
        self.adaptation_threshold = 0.8
        
        # Cultural sensitivity parameters
        self.sensitivity_weights = {
            "respect": 0.3,
            "understanding": 0.25,
            "adaptation": 0.2,
            "awareness": 0.15,
            "consideration": 0.1
        }
        
        # Initialize cultural contexts
        self._initialize_cultural_contexts()
        
        logger.info("[CulturalContext] System initialized")
    
    def _initialize_cultural_knowledge(self) -> Dict[str, Any]:
        """Initialize cultural knowledge base."""
        
        return {
            "western": {
                "communication_style": CommunicationStyle.DIRECT,
                "core_values": [CulturalValue.INDIVIDUALISM, CulturalValue.SHORT_TERM_ORIENTATION],
                "norms": ["direct eye contact", "personal space", "time punctuality"],
                "taboos": ["intrusive personal questions", "lack of personal space"],
                "preferences": {"formality": "moderate", "directness": "high"}
            },
            "eastern": {
                "communication_style": CommunicationStyle.INDIRECT,
                "core_values": [CulturalValue.COLLECTIVISM, CulturalValue.LONG_TERM_ORIENTATION],
                "norms": ["respect for elders", "group harmony", "saving face"],
                "taboos": ["direct confrontation", "public criticism"],
                "preferences": {"formality": "high", "directness": "low"}
            },
            "middle_eastern": {
                "communication_style": CommunicationStyle.HIGH_CONTEXT,
                "core_values": [CulturalValue.COLLECTIVISM, CulturalValue.POWER_DISTANCE],
                "norms": ["hospitality", "family honor", "religious respect"],
                "taboos": ["disrespecting religion", "criticizing family"],
                "preferences": {"formality": "high", "relationship_focus": "high"}
            },
            "african": {
                "communication_style": CommunicationStyle.RELATIONSHIP_FOCUSED,
                "core_values": [CulturalValue.COLLECTIVISM, CulturalValue.INDULGENCE],
                "norms": ["community respect", "elder wisdom", "storytelling"],
                "taboos": ["disrespecting traditions", "ignoring community"],
                "preferences": {"formality": "moderate", "community_focus": "high"}
            },
            "latin_american": {
                "communication_style": CommunicationStyle.INFORMAL,
                "core_values": [CulturalValue.COLLECTIVISM, CulturalValue.INDULGENCE],
                "norms": ["family importance", "social connections", "warmth"],
                "taboos": ["formal distance", "ignoring relationships"],
                "preferences": {"formality": "low", "warmth": "high"}
            },
            "asian": {
                "communication_style": CommunicationStyle.INDIRECT,
                "core_values": [CulturalValue.COLLECTIVISM, CulturalValue.LONG_TERM_ORIENTATION],
                "norms": ["respect hierarchy", "group harmony", "face saving"],
                "taboos": ["direct refusal", "public embarrassment"],
                "preferences": {"formality": "high", "indirectness": "high"}
            },
            "european": {
                "communication_style": CommunicationStyle.FORMAL,
                "core_values": [CulturalValue.INDIVIDUALISM, CulturalValue.UNCERTAINTY_AVOIDANCE],
                "norms": ["punctuality", "formal address", "privacy"],
                "taboos": ["overfamiliarity", "invading privacy"],
                "preferences": {"formality": "high", "privacy": "high"}
            },
            "pacific_islander": {
                "communication_style": CommunicationStyle.RELATIONSHIP_FOCUSED,
                "core_values": [CulturalValue.COLLECTIVISM, CulturalValue.LONG_TERM_ORIENTATION],
                "norms": ["community respect", "harmony", "tradition"],
                "taboos": ["individualism", "disrespecting elders"],
                "preferences": {"formality": "moderate", "community": "high"}
            },
            "indigenous": {
                "communication_style": CommunicationStyle.HIGH_CONTEXT,
                "core_values": [CulturalValue.COLLECTIVISM, CulturalValue.LONG_TERM_ORIENTATION],
                "norms": ["respect nature", "ancestral wisdom", "community"],
                "taboos": ["disrespecting traditions", "exploiting resources"],
                "preferences": {"formality": "moderate", "tradition": "high"}
            }
        }
    
    def _initialize_cultural_contexts(self):
        """Initialize cultural contexts from knowledge base."""
        
        for culture_name, culture_data in self.cultural_knowledge.items():
            culture_type = CultureType(culture_name)
            
            context = CulturalContext(
                context_id=f"context_{culture_name}",
                culture_type=culture_type,
                communication_style=culture_data["communication_style"],
                norms=culture_data["norms"],
                taboos=culture_data["taboos"],
                preferences=culture_data["preferences"],
                sensitivity_level=0.8,
                confidence=0.9
            )
            
            self.cultural_contexts[culture_type] = context
    
    async def analyze_cultural_context(self, user_id: str, content: str, 
                                       context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyze cultural context for user interaction."""
        
        context = context or {}
        
        # Get or create user profile
        profile = self._get_or_create_profile(user_id)
        
        # Detect cultural indicators
        cultural_indicators = await self._detect_cultural_indicators(content, context)
        
        # Determine primary culture
        primary_culture = self._determine_primary_culture(cultural_indicators, profile)
        
        # Get cultural context
        cultural_context = self.cultural_contexts.get(primary_culture)
        
        if not cultural_context:
            cultural_context = self.cultural_contexts.get(CultureType.GLOBAL)
        
        # Analyze communication style
        communication_style = self._analyze_communication_style(content, cultural_context)
        
        # Calculate cultural sensitivity
        sensitivity_score = self._calculate_cultural_sensitivity(content, cultural_context)
        
        # Generate recommendations
        recommendations = self._generate_cultural_recommendations(
            content, cultural_context, sensitivity_score
        )
        
        # Record interaction
        interaction_id = self._record_interaction(
            user_id, primary_culture, "analysis", content, False, sensitivity_score
        )
        
        return {
            "interaction_id": interaction_id,
            "primary_culture": primary_culture.value,
            "communication_style": communication_style.value,
            "cultural_context": {
                "norms": cultural_context.norms,
                "taboos": cultural_context.taboos,
                "preferences": cultural_context.preferences
            },
            "sensitivity_score": sensitivity_score,
            "recommendations": recommendations,
            "confidence": cultural_context.confidence
        }
    
    def _get_or_create_profile(self, user_id: str) -> CulturalProfile:
        """Get or create user cultural profile."""
        
        if user_id not in self.user_profiles:
            profile = CulturalProfile(
                profile_id=f"profile_{user_id}",
                user_id=user_id,
                primary_culture=CultureType.GLOBAL,
                secondary_cultures=[],
                communication_style=CommunicationStyle.DIRECT,
                core_values=[],
                preferences={},
                learned_patterns=[]
            )
            self.user_profiles[user_id] = profile
        
        return self.user_profiles[user_id]
    
    async def _detect_cultural_indicators(self, content: str, context: Dict[str, Any]) -> Dict[str, float]:
        """Detect cultural indicators in content."""
        
        indicators = {}
        content_lower = content.lower()
        
        # Language indicators
        language_indicators = {
            "western": ["please", "thank you", "excuse me", "sorry", "direct", "straightforward"],
            "eastern": ["respect", "honor", "face", "harmony", "indirect", "polite"],
            "middle_eastern": ["hospitality", "family", "tradition", "respect", "honor"],
            "african": ["community", "elder", "tradition", "respect", "harmony"],
            "latin_american": ["family", "warmth", "friendship", "passion", "social"],
            "asian": ["respect", "harmony", "face", "group", "tradition"],
            "european": ["formal", "proper", "privacy", "punctual", "structured"],
            "pacific_islander": ["community", "harmony", "respect", "tradition", "nature"],
            "indigenous": ["nature", "ancestors", "tradition", "community", "respect"]
        }
        
        # Calculate indicator scores
        for culture, words in language_indicators.items():
            score = sum(1 for word in words if word in content_lower)
            indicators[culture] = score / len(words)
        
        # Context indicators
        if "location" in context:
            location = context["location"].lower()
            location_indicators = {
                "western": ["usa", "canada", "uk", "australia", "new zealand"],
                "eastern": ["china", "japan", "korea", "singapore", "taiwan"],
                "middle_eastern": ["saudi", "uae", "iran", "iraq", "egypt"],
                "african": ["nigeria", "kenya", "south africa", "egypt", "ghana"],
                "latin_american": ["mexico", "brazil", "argentina", "colombia", "chile"],
                "asian": ["india", "thailand", "vietnam", "philippines", "malaysia"],
                "european": ["france", "germany", "italy", "spain", "netherlands"],
                "pacific_islander": ["fiji", "samoa", "tonga", "hawaii", "new zealand"],
                "indigenous": ["native", "tribal", "aboriginal", "indigenous", "first nations"]
            }
            
            for culture, locations in location_indicators.items():
                if any(loc in location for loc in locations):
                    indicators[culture] += 0.3  # Boost score for location match
        
        return indicators
    
    def _determine_primary_culture(self, indicators: Dict[str, float], 
                                 profile: CulturalProfile) -> CultureType:
        """Determine primary culture from indicators."""
        
        if not indicators:
            return profile.primary_culture
        
        # Find culture with highest indicator score
        max_culture = max(indicators.items(), key=lambda x: x[1])
        
        if max_culture[1] > 0.1:  # Threshold for detection
            return CultureType(max_culture[0])
        else:
            return profile.primary_culture
    
    def _analyze_communication_style(self, content: str, 
                                    cultural_context: CulturalContext) -> CommunicationStyle:
        """Analyze communication style in content."""
        
        content_lower = content.lower()
        
        # Direct vs Indirect indicators
        direct_indicators = ["direct", "straightforward", "clear", "explicit", "frank"]
        indirect_indicators = ["imply", "suggest", "hint", "subtle", "gentle"]
        
        direct_score = sum(1 for word in direct_indicators if word in content_lower)
        indirect_score = sum(1 for word in indirect_indicators if word in content_lower)
        
        # Formal vs Informal indicators
        formal_indicators = ["formal", "proper", "respectfully", "sir", "madam"]
        informal_indicators = ["casual", "friendly", "hey", "hi", "buddy"]
        
        formal_score = sum(1 for word in formal_indicators if word in content_lower)
        informal_score = sum(1 for word in informal_indicators if word in content_lower)
        
        # Determine style
        if direct_score > indirect_score:
            if formal_score > informal_score:
                return CommunicationStyle.FORMAL
            else:
                return CommunicationStyle.DIRECT
        else:
            if formal_score > informal_score:
                return CommunicationStyle.HIGH_CONTEXT
            else:
                return CommunicationStyle.INFORMAL
    
    def _calculate_cultural_sensitivity(self, content: str, 
                                       cultural_context: CulturalContext) -> float:
        """Calculate cultural sensitivity score."""
        
        content_lower = content.lower()
        
        # Check for cultural taboos
        taboo_violations = sum(1 for taboo in cultural_context.taboos 
                              if taboo in content_lower)
        
        # Check for cultural norms respect
        norm_respects = sum(1 for norm in cultural_context.norms 
                           if norm in content_lower)
        
        # Calculate sensitivity score
        total_indicators = len(cultural_context.taboos) + len(cultural_context.norms)
        positive_indicators = norm_respects
        negative_indicators = taboo_violations
        
        if total_indicators > 0:
            sensitivity_score = (positive_indicators - negative_indicators) / total_indicators
            return max(0.0, min(1.0, sensitivity_score + 0.5))  # Normalize to 0-1
        else:
            return 0.5  # Default score
    
    def _generate_cultural_recommendations(self, content: str, 
                                         cultural_context: CulturalContext,
                                         sensitivity_score: float) -> List[str]:
        """Generate cultural recommendations."""
        
        recommendations = []
        
        if sensitivity_score < 0.3:
            recommendations.append("Consider being more culturally sensitive in your communication")
            recommendations.append(f"Be aware of {cultural_context.culture_type.value} cultural norms")
        
        if sensitivity_score < 0.5:
            recommendations.append("Try to incorporate more cultural context awareness")
            recommendations.append("Research cultural preferences for better communication")
        
        # Specific recommendations based on culture
        if cultural_context.communication_style == CommunicationStyle.INDIRECT:
            recommendations.append("Consider using more indirect communication methods")
        elif cultural_context.communication_style == CommunicationStyle.DIRECT:
            recommendations.append("Direct communication is appropriate in this context")
        
        if cultural_context.culture_type == CultureType.EASTERN:
            recommendations.append("Be mindful of face-saving and group harmony")
        elif cultural_context.culture_type == CultureType.WESTERN:
            recommendations.append("Direct and clear communication is valued")
        
        return recommendations
    
    def _record_interaction(self, user_id: str, culture_context: CultureType,
                           interaction_type: str, content: str, adaptation_applied: bool,
                           effectiveness: float) -> str:
        """Record cultural interaction."""
        
        interaction_id = f"interaction_{int(time.time() * 1000)}"
        
        interaction = CulturalInteraction(
            interaction_id=interaction_id,
            user_id=user_id,
            culture_context=culture_context,
            interaction_type=interaction_type,
            content=content,
            adaptation_applied=adaptation_applied,
            effectiveness=effectiveness,
            timestamp=datetime.now()
        )
        
        self.interactions.append(interaction)
        
        # Update user profile
        if user_id in self.user_profiles:
            profile = self.user_profiles[user_id]
            profile.interactions_count += 1
            profile.updated_at = datetime.now()
            
            # Update confidence based on interactions
            if profile.interactions_count >= self.min_interactions_for_learning:
                profile.confidence = min(1.0, profile.confidence + 0.1)
        
        return interaction_id
    
    async def adapt_communication(self, user_id: str, content: str, 
                                target_culture: CultureType) -> Dict[str, Any]:
        """Adapt communication for target culture."""
        
        target_context = self.cultural_contexts.get(target_culture)
        if not target_context:
            return {"error": "Target culture not supported"}
        
        # Get user profile
        profile = self._get_or_create_profile(user_id)
        
        # Adapt content based on cultural context
        adapted_content = await self._adapt_content_for_culture(content, target_context)
        
        # Calculate adaptation effectiveness
        effectiveness = self._calculate_adaptation_effectiveness(
            content, adapted_content, target_context
        )
        
        # Record interaction
        interaction_id = self._record_interaction(
            user_id, target_culture, "adaptation", adapted_content, True, effectiveness
        )
        
        return {
            "interaction_id": interaction_id,
            "original_content": content,
            "adapted_content": adapted_content,
            "target_culture": target_culture.value,
            "adaptations_applied": self._get_adaptations_applied(content, adapted_content),
            "effectiveness": effectiveness,
            "cultural_context": {
                "communication_style": target_context.communication_style.value,
                "norms": target_context.norms,
                "preferences": target_context.preferences
            }
        }
    
    async def _adapt_content_for_culture(self, content: str, 
                                       cultural_context: CulturalContext) -> str:
        """Adapt content for specific cultural context."""
        
        router = get_llm_router()
        if not router:
            return content  # Return original if no LLM available
        
        prompt = f"""Adapt this content for {cultural_context.culture_type.value} culture:
        
        Original content: {content}
        
        Cultural context:
        - Communication style: {cultural_context.communication_style.value}
        - Norms: {', '.join(cultural_context.norms)}
        - Taboos: {', '.join(cultural_context.taboos)}
        - Preferences: {cultural_context.preferences}
        
        Adapt the content to be culturally appropriate and sensitive.
        Maintain the original meaning while adapting the style and tone.
        
        Return only the adapted content."""
        
        try:
            adapted_content = await router.generate(prompt)
            return adapted_content.strip()
        except Exception as e:
            logger.error(f"[CulturalContext] Error adapting content: {e}")
            return content
    
    def _calculate_adaptation_effectiveness(self, original: str, adapted: str,
                                          cultural_context: CulturalContext) -> float:
        """Calculate effectiveness of cultural adaptation."""
        
        # Check if taboos were removed
        original_lower = original.lower()
        adapted_lower = adapted.lower()
        
        original_taboos = sum(1 for taboo in cultural_context.taboos if taboo in original_lower)
        adapted_taboos = sum(1 for taboo in cultural_context.taboos if taboo in adapted_lower)
        
        taboo_reduction = (original_taboos - adapted_taboos) / max(1, original_taboos)
        
        # Check if norms were added
        original_norms = sum(1 for norm in cultural_context.norms if norm in original_lower)
        adapted_norms = sum(1 for norm in cultural_context.norms if norm in adapted_lower)
        
        norm_addition = (adapted_norms - original_norms) / max(1, len(cultural_context.norms))
        
        # Calculate overall effectiveness
        effectiveness = (taboo_reduction * 0.6 + norm_addition * 0.4)
        return max(0.0, min(1.0, effectiveness))
    
    def _get_adaptations_applied(self, original: str, adapted: str) -> List[str]:
        """Get list of adaptations applied."""
        
        adaptations = []
        
        # Check for changes in formality
        if "formal" in adapted.lower() and "formal" not in original.lower():
            adaptations.append("Increased formality")
        elif "casual" in adapted.lower() and "casual" not in original.lower():
            adaptations.append("Decreased formality")
        
        # Check for changes in directness
        if "suggest" in adapted.lower() and "suggest" not in original.lower():
            adaptations.append("Made more indirect")
        elif "direct" in adapted.lower() and "direct" not in original.lower():
            adaptations.append("Made more direct")
        
        return adaptations
    
    def get_user_cultural_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user's cultural profile."""
        
        if user_id not in self.user_profiles:
            return None
        
        profile = self.user_profiles[user_id]
        
        return {
            "profile_id": profile.profile_id,
            "user_id": profile.user_id,
            "primary_culture": profile.primary_culture.value,
            "secondary_cultures": [c.value for c in profile.secondary_cultures],
            "communication_style": profile.communication_style.value,
            "core_values": [v.value for v in profile.core_values],
            "preferences": profile.preferences,
            "confidence": profile.confidence,
            "interactions_count": profile.interactions_count,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat()
        }
    
    def get_cultural_insights(self, culture_type: CultureType) -> Optional[Dict[str, Any]]:
        """Get insights about a specific culture."""
        
        context = self.cultural_contexts.get(culture_type)
        if not context:
            return None
        
        # Get interactions with this culture
        culture_interactions = [i for i in self.interactions if i.culture_context == culture_type]
        
        # Calculate statistics
        if culture_interactions:
            avg_effectiveness = sum(i.effectiveness for i in culture_interactions) / len(culture_interactions)
            adaptation_rate = sum(1 for i in culture_interactions if i.adaptation_applied) / len(culture_interactions)
        else:
            avg_effectiveness = 0.0
            adaptation_rate = 0.0
        
        return {
            "culture_type": culture_type.value,
            "communication_style": context.communication_style.value,
            "norms": context.norms,
            "taboos": context.taboos,
            "preferences": context.preferences,
            "sensitivity_level": context.sensitivity_level,
            "confidence": context.confidence,
            "interaction_stats": {
                "total_interactions": len(culture_interactions),
                "average_effectiveness": avg_effectiveness,
                "adaptation_rate": adaptation_rate
            }
        }
    
    def health_check(self) -> bool:
        """Check if cultural context system is healthy."""
        
        try:
            return (len(self.cultural_contexts) == len(CultureType) and
                   len(self.cultural_knowledge) == len(CultureType) and
                   len(self.sensitivity_weights) == 5)
        except:
            return False

# Global instance
_cultural_context_system: Optional[CulturalContextSystem] = None

def get_cultural_context_system(limbic_system: LimbicSystem, memory_system: MemorySystem, kinship_system: KinshipSystem) -> CulturalContextSystem:
    """Get or create the global cultural context system."""
    global _cultural_context_system
    if _cultural_context_system is None:
        _cultural_context_system = CulturalContextSystem(limbic_system, memory_system, kinship_system)
    return _cultural_context_system
