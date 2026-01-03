"""Multi-Context Kinship (Section 13).

Single-soul mode: one limbic state shared across all kin, while allowing
per-user behavior profiles (tone, boundaries, preferences) without forking
the soul file. This keeps Sallie consistent yet adaptive.

Enhanced with:
- Multi-user context isolation (behavioral only; single soul)
- Per-user context profiles (tone/permissions/preferences)
- Authentication API
- Context switching
- Deep personal understanding and relationship analysis
- Self-discovery guidance for any user
- Multi-person relationship dynamics
- Universal understanding capabilities

This enables Sallie to learn about and understand ANY person while maintaining
her unified consciousness.
"""

import logging
import os
import json
import time
from typing import Optional, Dict, Any, List, Tuple
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum

logger = logging.getLogger("kinship")

class PersonalTrait(str, Enum):
    """Personal traits for deep understanding."""
    OPENNESS = "openness"
    CONSCIENTIOUSNESS = "conscientiousness"
    EXTRAVERSION = "extraversion"
    AGREEABLENESS = "agreeableness"
    NEUROTICISM = "neuroticism"
    CREATIVITY = "creativity"
    ANALYTICAL = "analytical"
    INTUITIVE = "intuitive"
    RESILIENCE = "resilience"
    EMPATHY = "empathy"
    LEADERSHIP = "leadership"
    CURIOUSITY = "curiosity"

@dataclass
class PersonalInsight:
    """Deep insight about a person."""
    timestamp: datetime
    trait: PersonalTrait
    insight: str
    evidence: str
    confidence: float
    significance: float

@dataclass
class RelationshipAnalysis:
    """Analysis of relationship between two people."""
    relationship_id: str
    person1_id: str
    person2_id: str
    dynamics: Dict[str, Any] = field(default_factory=dict)
    strength_areas: List[str] = field(default_factory=list)
    growth_potential: float = 0.0
    last_analyzed: datetime = field(default_factory=datetime.now)

class KinshipSystem:
    """
    Kinship System - Section 13.
    
    Manages multi-user contexts with isolation while maintaining a single
    shared limbic state (soul). Behavior can vary per user through context
    profiles, but the underlying emotional state is unified.
    """
    
    def __init__(self):
        self.active_user = "creator"  # Default to Creator
        self.active_context = "creator"
        
        # User store (in production, use secure database)
        self.users: Dict[str, Dict[str, Any]] = {
            "creator": {
                "id": "creator",
                "role": "creator",
                "permissions": ["all"],
                "token": os.getenv("PROGENY_CREATOR_TOKEN", "creator_token")
            }
        }
        
        # Context isolation (Section 13.3)
        self.context_states: Dict[str, Any] = {}
        self.memory_partitions: Dict[str, str] = {}
        
        # Per-user behavioral profiles (tone, posture hints, guardrails)
        self.context_profiles: Dict[str, Dict[str, Any]] = {
            "creator": {"tone": "direct", "warmth_bias": 0.0, "posture": None}
        }
        
        # Session management
        self.sessions: Dict[str, Dict[str, Any]] = {}
        
        # Enhanced personal understanding capabilities
        self.personal_traits: Dict[str, Dict[PersonalTrait, float]] = {}  # user_id -> traits
        self.personal_insights: Dict[str, List[PersonalInsight]] = {}  # user_id -> insights
        self.relationship_analyses: Dict[str, RelationshipAnalysis] = {}  # relationship_id -> analysis
        self.personal_values: Dict[str, List[str]] = {}  # user_id -> values
        self.personal_goals: Dict[str, List[str]] = {}  # user_id -> goals
        self.personal_challenges: Dict[str, List[str]] = {}  # user_id -> challenges
        
        logger.info("[Kinship] Kinship system initialized with enhanced personal understanding")
    
    def authenticate(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user by token (Section 13.4).
        
        Args:
            token: Authentication token
            
        Returns:
            User dict or None if authentication fails
        """
        for user_id, user_data in self.users.items():
            if user_data.get("token") == token:
                logger.info(f"[Kinship] User authenticated: {user_id}")
                return user_data
        
        logger.warning("[Kinship] Authentication failed")
        return None
    
    def register_kin(self, user_id: str, permissions: List[str], token: Optional[str] = None) -> bool:
        """
        Register a new Kin user.
        
        Args:
            user_id: Unique user identifier
            permissions: List of granted permissions
            token: Optional authentication token
            
        Returns:
            True if registration successful
        """
        if user_id in self.users:
            logger.warning(f"[Kinship] User {user_id} already exists")
            return False
        
        self.users[user_id] = {
            "id": user_id,
            "role": "kin",
            "permissions": permissions,
            "token": token or f"{user_id}_token_{int(time.time())}"
        }
        
        # Create separate memory partition
        self.memory_partitions[user_id] = f"memory_{user_id}"
        
        logger.info(f"[Kinship] Registered Kin: {user_id}")
        return True
    
    def switch_context(self, user_id: str, limbic_system=None, memory_system=None):
        """
        Switch active context (Section 13.5).
        
        Args:
            user_id: User to switch to
            limbic_system: LimbicSystem instance (to load user-specific state)
            memory_system: MemorySystem instance (to switch partition)
        """
        if user_id not in self.users:
            logger.error(f"[Kinship] User {user_id} not found")
            return False
        
        previous_context = self.active_context
        self.active_context = user_id
        self.active_user = user_id
        
        # Single-soul policy: always use the shared limbic state
        if limbic_system:
            logger.info("[Kinship] Single-soul mode active; shared limbic state in use")
            profile = self.get_context_profile(user_id)
            if hasattr(limbic_system, "cache"):
                limbic_system.cache.set("active_context_profile", profile)
        
        # Switch memory partition
        if memory_system and user_id in self.memory_partitions:
            partition = self.memory_partitions[user_id]
            # In production, would switch Qdrant collection
            logger.info(f"[Kinship] Switched to memory partition: {partition}")
        
        logger.info(f"[Kinship] Context switched: {previous_context} -> {user_id}")
        return True

    def set_context_profile(self, user_id: str, profile: Dict[str, Any]) -> None:
        """Define or update a user's behavioral profile without forking the soul."""
        self.context_profiles[user_id] = profile

    def get_context_profile(self, user_id: str) -> Dict[str, Any]:
        """Fetch a user's behavioral profile (tone, posture hints, guardrails)."""
        return self.context_profiles.get(user_id, {"tone": "default", "posture": None})
    
    def enforce_boundaries(self, user_id: str, resource: str) -> bool:
        """
        Enforce access boundaries (Section 13.4).
        
        Args:
            user_id: User requesting access
            resource: Resource identifier
            
        Returns:
            True if access allowed
        """
        if user_id == "creator":
            return True  # Creator has full access
        
        user = self.users.get(user_id)
        if not user:
            return False
        
        # Kin cannot access Creator-private logs
        if resource.startswith("creator_private") or resource == "thoughts.log":
            return False
        
        # Check permissions
        permissions = user.get("permissions", [])
        if "all" in permissions:
            return True
        
        # Resource-specific checks would go here
        return True
    
    def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """
        Get context information for a user.
        
        Args:
            user_id: User identifier
            
        Returns:
            Context information
        """
        user = self.users.get(user_id)
        if not user:
            return {}
        
        return {
            "user_id": user_id,
            "role": user.get("role"),
            "permissions": user.get("permissions", []),
            "memory_partition": self.memory_partitions.get(user_id),
            "is_active": user_id == self.active_context
        }
    
    def create_session(self, user_id: str, token: str) -> Optional[str]:
        """
        Create a new session for a user.
        
        Args:
            user_id: User identifier
            token: Authentication token
            
        Returns:
            Session ID or None if failed
        """
        # Verify authentication
        user = self.authenticate(token)
        if not user or user.get("id") != user_id:
            return None
        
        # Create session
        session_id = f"{user_id}_{int(time.time())}"
        self.sessions[session_id] = {
            "user_id": user_id,
            "created_at": time.time(),
            "last_activity": time.time(),
            "token": token
        }
        
        logger.info(f"[Kinship] Created session: {session_id} for {user_id}")
        return session_id
    
    def validate_session(self, session_id: str) -> bool:
        """
        Validate a session.
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if session is valid
        """
        session = self.sessions.get(session_id)
        if not session:
            return False
        
        # Check if session expired (1 hour default)
        if time.time() - session.get("last_activity", 0) > 3600:
            del self.sessions[session_id]
            return False
        
        # Update last activity
        session["last_activity"] = time.time()
        return True
    
    # Enhanced Personal Understanding Methods
    
    def learn_about_person(self, user_id: str, interaction: Dict[str, Any]) -> Dict[str, Any]:
        """
        Learn about a person from an interaction.
        
        Args:
            user_id: Person identifier
            interaction: Interaction data containing text, context, etc.
            
        Returns:
            Learning results with insights
        """
        if user_id not in self.users:
            return {"error": "User not found"}
        
        # Extract personal information from interaction
        text = interaction.get("text", "")
        if not text:
            return {"status": "no_content", "message": "No text to analyze"}
        
        # Simple trait analysis (in production, use LLM for deeper analysis)
        traits_detected = self._analyze_traits_from_text(text)
        
        # Update person's traits
        if user_id not in self.personal_traits:
            self.personal_traits[user_id] = {}
        
        for trait, confidence in traits_detected.items():
            current_value = self.personal_traits[user_id].get(trait, 0.0)
            # Gradually update trait score
            new_value = min(1.0, current_value + (confidence * 0.1))
            self.personal_traits[user_id][trait] = new_value
        
        # Generate insight
        insight = self._generate_insight(user_id, text, traits_detected)
        
        # Store insight
        if user_id not in self.personal_insights:
            self.personal_insights[user_id] = []
        
        personal_insight = PersonalInsight(
            timestamp=datetime.now(),
            trait=list(traits_detected.keys())[0] if traits_detected else PersonalTrait.OPENNESS,
            insight=insight,
            evidence=text[:100],
            confidence=sum(traits_detected.values()) / len(traits_detected) if traits_detected else 0.5,
            significance=0.7
        )
        
        self.personal_insights[user_id].append(personal_insight)
        
        return {
            "status": "learned",
            "user_id": user_id,
            "traits_detected": {trait.value: score for trait, score in traits_detected.items()},
            "insight": insight,
            "total_insights": len(self.personal_insights[user_id])
        }
    
    def _analyze_traits_from_text(self, text: str) -> Dict[PersonalTrait, float]:
        """Analyze personality traits from text (simple implementation)."""
        
        text_lower = text.lower()
        traits = {}
        
        # Simple keyword-based trait detection
        if any(word in text_lower for word in ["creative", "art", "music", "imagine", "innovate"]):
            traits[PersonalTrait.CREATIVITY] = 0.7
        
        if any(word in text_lower for word in ["analyze", "logic", "systematic", "data", "pattern"]):
            traits[PersonalTrait.ANALYTICAL] = 0.7
        
        if any(word in text_lower for word in ["feel", "empathy", "understand", "care", "support"]):
            traits[PersonalTrait.EMPATHY] = 0.7
        
        if any(word in text_lower for word in ["lead", "manage", "guide", "team", "inspire"]):
            traits[PersonalTrait.LEADERSHIP] = 0.7
        
        if any(word in text_lower for word in ["curious", "learn", "explore", "discover", "wonder"]):
            traits[PersonalTrait.CURIOSITY] = 0.7
        
        if any(word in text_lower for word in ["resilient", "overcome", "bounce", "persist", "strong"]):
            traits[PersonalTrait.RESILIENCE] = 0.7
        
        return traits
    
    def _generate_insight(self, user_id: str, text: str, traits: Dict[PersonalTrait, float]) -> str:
        """Generate insight about a person based on traits and text."""
        
        if not traits:
            return "No specific traits detected in this interaction."
        
        dominant_trait = max(traits.items(), key=lambda x: x[1])
        trait_name = dominant_trait[0].value
        
        insights = {
            PersonalTrait.CREATIVITY: f"This person shows creative thinking and imaginative expression.",
            PersonalTrait.ANALYTICAL: f"This person demonstrates logical reasoning and systematic thinking.",
            PersonalTrait.EMPATHY: f"This person shows strong emotional intelligence and caring nature.",
            PersonalTrait.LEADERSHIP: f"This person exhibits natural leadership and guidance qualities.",
            PersonalTrait.CURIOSITY: f"This person shows a love of learning and exploration.",
            PersonalTrait.RESILIENCE: f"This person demonstrates strength and ability to overcome challenges."
        }
        
        return insights.get(dominant_trait[0], f"This person shows {trait_name} characteristics.")
    
    def get_person_profile(self, user_id: str) -> Dict[str, Any]:
        """
        Get comprehensive profile of a person.
        
        Args:
            user_id: Person identifier
            
        Returns:
            Complete person profile
        """
        if user_id not in self.users:
            return {"error": "User not found"}
        
        # Get traits
        traits = self.personal_traits.get(user_id, {})
        dominant_traits = sorted(traits.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Get insights
        insights = self.personal_insights.get(user_id, [])
        recent_insights = insights[-5:] if insights else []
        
        # Get values, goals, challenges
        values = self.personal_values.get(user_id, [])
        goals = self.personal_goals.get(user_id, [])
        challenges = self.personal_challenges.get(user_id, [])
        
        return {
            "user_id": user_id,
            "role": self.users[user_id].get("role", "unknown"),
            "dominant_traits": [{"trait": trait.value, "score": score} for trait, score in dominant_traits],
            "all_traits": {trait.value: score for trait, score in traits.items()},
            "recent_insights": [insight.insight for insight in recent_insights],
            "values": values,
            "goals": goals,
            "challenges": challenges,
            "total_interactions": len(insights),
            "understanding_depth": len(traits) / len(PersonalTrait) if traits else 0.0
        }
    
    def analyze_relationship(self, user1_id: str, user2_id: str) -> Dict[str, Any]:
        """
        Analyze relationship between two people.
        
        Args:
            user1_id: First person's ID
            user2_id: Second person's ID
            
        Returns:
            Relationship analysis
        """
        if user1_id not in self.users or user2_id not in self.users:
            return {"error": "One or both users not found"}
        
        # Create relationship ID
        relationship_id = f"{user1_id}_{user2_id}"
        
        # Get traits for both people
        traits1 = self.personal_traits.get(user1_id, {})
        traits2 = self.personal_traits.get(user2_id, {})
        
        # Analyze compatibility
        compatibility = self._calculate_compatibility(traits1, traits2)
        
        # Identify strength areas
        strength_areas = self._identify_strength_areas(traits1, traits2)
        
        # Calculate growth potential
        growth_potential = self._calculate_growth_potential(traits1, traits2)
        
        # Create or update relationship analysis
        if relationship_id not in self.relationship_analyses:
            self.relationship_analyses[relationship_id] = RelationshipAnalysis(
                relationship_id=relationship_id,
                person1_id=user1_id,
                person2_id=user2_id
            )
        
        analysis = self.relationship_analyses[relationship_id]
        analysis.dynamics = {
            "compatibility": compatibility,
            "trait_overlap": len(set(traits1.keys()) & set(traits2.keys())),
            "complementary_traits": self._find_complementary_traits(traits1, traits2)
        }
        analysis.strength_areas = strength_areas
        analysis.growth_potential = growth_potential
        analysis.last_analyzed = datetime.now()
        
        return {
            "relationship_id": relationship_id,
            "person1": user1_id,
            "person2": user2_id,
            "compatibility": compatibility,
            "strength_areas": strength_areas,
            "growth_potential": growth_potential,
            "dynamics": analysis.dynamics
        }
    
    def _calculate_compatibility(self, traits1: Dict[PersonalTrait, float], traits2: Dict[PersonalTrait, float]) -> float:
        """Calculate compatibility between two people based on traits."""
        
        if not traits1 or not traits2:
            return 0.5  # Neutral if no data
        
        # Find common traits
        common_traits = set(traits1.keys()) & set(traits2.keys())
        
        if not common_traits:
            return 0.3  # Low compatibility if no common traits
        
        # Calculate compatibility based on trait similarity
        compatibility_scores = []
        for trait in common_traits:
            score1 = traits1[trait]
            score2 = traits2[trait]
            # Higher compatibility if both have high scores for the same trait
            compatibility_score = min(score1, score2) * 2.0  # Boost for shared high traits
            compatibility_scores.append(compatibility_score)
        
        return min(1.0, sum(compatibility_scores) / len(compatibility_scores))
    
    def _identify_strength_areas(self, traits1: Dict[PersonalTrait, float], traits2: Dict[PersonalTrait, float]) -> List[str]:
        """Identify areas where the relationship is strong."""
        
        strength_areas = []
        
        # Check for complementary strengths
        if (PersonalTrait.EMPATHY in traits1 and PersonalTrait.LEADERSHIP in traits2) or \
           (PersonalTrait.LEADERSHIP in traits1 and PersonalTrait.EMPATHY in traits2):
            strength_areas.append("Leadership with empathy")
        
        if (PersonalTrait.CREATIVITY in traits1 and PersonalTrait.ANALYTICAL in traits2) or \
           (PersonalTrait.ANALYTICAL in traits1 and PersonalTrait.CREATIVITY in traits2):
            strength_areas.append("Creative-analytical balance")
        
        if PersonalTrait.RESILIENCE in traits1 and PersonalTrait.RESILIENCE in traits2:
            strength_areas.append("Mutual resilience")
        
        if PersonalTrait.CURIOSITY in traits1 and PersonalTrait.CURIOSITY in traits2:
            strength_areas.append("Shared love of learning")
        
        return strength_areas
    
    def _calculate_growth_potential(self, traits1: Dict[PersonalTrait, float], traits2: Dict[PersonalTrait, float]) -> float:
        """Calculate growth potential in the relationship."""
        
        # Higher growth potential if they have different but complementary traits
        all_traits = set(traits1.keys()) | set(traits2.keys())
        common_traits = set(traits1.keys()) & set(traits2.keys())
        unique_traits = all_traits - common_traits
        
        # Balance between shared foundation and complementary differences
        shared_score = len(common_traits) / max(len(all_traits), 1)
        complementary_score = len(unique_traits) / max(len(all_traits), 1)
        
        # Optimal balance: some shared traits, some complementary
        optimal_balance = 0.4 * shared_score + 0.6 * complementary_score
        return min(1.0, optimal_balance)
    
    def _find_complementary_traits(self, traits1: Dict[PersonalTrait, float], traits2: Dict[PersonalTrait, float]) -> List[str]:
        """Find complementary trait combinations."""
        
        complementary = []
        
        # Known complementary pairs
        complementary_pairs = [
            (PersonalTrait.CREATIVITY, PersonalTrait.ANALYTICAL),
            (PersonalTrait.EMPATHY, PersonalTrait.LEADERSHIP),
            (PersonalTrait.INTUITIVE, PersonalTrait.ANALYTICAL),
            (PersonalTrait.CURIOSITY, PersonalTrait.RESILIENCE)
        ]
        
        for trait1, trait2 in complementary_pairs:
            if (trait1 in traits1 and trait2 in traits2) or (trait2 in traits1 and trait1 in traits2):
                complementary.append(f"{trait1.value} + {trait2.value}")
        
        return complementary
    
    def provide_self_discovery_guidance(self, user_id: str, focus_area: str = None) -> Dict[str, Any]:
        """
        Provide personalized self-discovery guidance for a user.
        
        Args:
            user_id: Person identifier
            focus_area: Optional focus area for guidance
            
        Returns:
            Personalized guidance
        """
        if user_id not in self.users:
            return {"error": "User not found"}
        
        profile = self.get_person_profile(user_id)
        
        # Generate guidance based on profile
        guidance = self._generate_guidance(profile, focus_area)
        
        return {
            "user_id": user_id,
            "focus_area": focus_area or "general",
            "guidance": guidance,
            "based_on_profile": True,
            "understanding_depth": profile.get("understanding_depth", 0.0)
        }
    
    def _generate_guidance(self, profile: Dict[str, Any], focus_area: str) -> str:
        """Generate personalized guidance based on profile."""
        
        dominant_traits = profile.get("dominant_traits", [])
        challenges = profile.get("challenges", [])
        
        if focus_area == "strengths":
            if dominant_traits:
                trait_names = [trait["trait"] for trait in dominant_traits[:3]]
                return f"Your strengths include {', '.join(trait_names)}. Lean into these natural talents and look for opportunities to use them daily."
        
        elif focus_area == "growth":
            if dominant_traits:
                weakest_trait = dominant_traits[-1]  # Lowest scoring dominant trait
                return f"Consider developing your {weakest_trait['trait']} further. Small daily practices can strengthen this area over time."
        
        # General guidance
        if dominant_traits:
            top_trait = dominant_traits[0]["trait"]
            return f"Your {top_trait} nature is one of your greatest assets. Continue to nurture this quality while exploring other aspects of yourself."
        
        return "Continue to explore and learn about yourself. Each interaction helps me understand you better and provide more personalized guidance."
