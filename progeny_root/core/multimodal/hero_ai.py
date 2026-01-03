"""Hero AI Integration System.

Advanced hero analysis and generation capabilities:
- Hero archetype analysis and identification
- Character development and storytelling
- Hero journey mapping and narrative structure
- Psychological profile analysis
- Hero trait and skill assessment
- Narrative generation and storytelling
- Hero relationship dynamics
- Hero evolution and growth tracking
- Mythological and cultural hero analysis
- Hero-based personal development guidance

This enables Sallie to understand and work with hero archetypes and narratives.
"""

import json
import logging
import time
import asyncio
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from concurrent.futures import ThreadPoolExecutor

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from llm_router import get_llm_router

logger = setup_logging("hero_ai")

class HeroArchetype(str, Enum):
    """Hero archetypes based on Jungian psychology."""
    WARRIOR = "warrior"
    LOVER = "lover"
    MAGICIAN = "magician"
    SAGE = "sage"
    INNOCENT = "innocent"
    EXPLORER = "explorer"
    REBEL = "rebel"
    CREATOR = "creator"
    CAREGIVER = "caregiver"
    JESTER = "jester"
    RULER = "ruler"
    EVERYMAN = "everyman"

class HeroTrait(str, Enum):
    """Hero traits and characteristics."""
    COURAGE = "courage"
    WISDOM = "wisdom"
    COMPASSION = "compassion"
    STRENGTH = "strength"
    INTELLIGENCE = "intelligence"
    CREATIVITY = "creativity"
    LEADERSHIP = "leadership"
    PERSEVERANCE = "perseverance"
    HONOR = "honor"
    SACRIFICE = "sacrifice"
    LOYALTY = "loyalty"
    JUSTICE = "justice"

class HeroStage(str, Enum):
    """Stages in the hero's journey."""
    ORDINARY_WORLD = "ordinary_world"
    CALL_TO_ADVENTURE = "call_to_adventure"
    REFUSAL = "refusal"
    MEETING_MENTOR = "meeting_mentor"
    CROSSING_THRESHOLD = "crossing_threshold"
    TESTS_ALLIES = "tests_allies"
    APPROACH_INMOST_CAVE = "approach_inmost_cave"
    ORDEAL = "ordeal"
    REWARD = "reward"
    ROAD_BACK = "road_back"
    RESURRECTION = "resurrection"
    RETURN_WITH_ELIXIR = "return_with_elixir"

class HeroRole(str, Enum):
    """Hero roles in narratives."""
    PROTAGONIST = "protagonist"
    MENTOR = "mentor"
    ALLY = "ally"
    CHALLENGER = "challenger"
    GUARDIAN = "guardian"
    TRICKSTER = "trickster"
    SHADOW = "shadow"
    ANIMUS = "animus"
    SELF = "self"

@dataclass
class HeroProfile:
    """Complete hero profile."""
    id: str
    name: str
    archetype: HeroArchetype
    primary_traits: List[HeroTrait]
    secondary_traits: List[HeroTrait]
    skills: List[str]
    weaknesses: List[str]
    strengths: List[str]
    motivations: List[str]
    fears: List[str]
    values: List[str]
    background: str
    personality_type: str
    moral_alignment: str
    confidence_score: float
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class HeroJourney:
    """Hero's journey narrative."""
    id: str
    hero_id: str
    title: str
    description: str
    stages: List[Dict[str, Any]]
    challenges: List[Dict[str, Any]]
    allies: List[str]
    enemies: List[str]
    mentors: List[str]
    rewards: List[str]
    lessons: List[str]
    current_stage: HeroStage
    completion_percentage: float
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class HeroAnalysis:
    """Analysis of hero characteristics."""
    hero_id: str
    archetype_confidence: Dict[str, float]
    trait_scores: Dict[str, float]
    personality_analysis: Dict[str, Any]
    psychological_profile: Dict[str, Any]
    narrative_role: HeroRole
    growth_potential: float
    recommendations: List[str]
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class HeroNarrative:
    """Generated hero narrative."""
    id: str
    hero_id: str
    title: str
    genre: str
    theme: str
    plot_summary: str
    character_development: List[Dict[str, Any]]
    story_arc: List[Dict[str, Any]]
    dialogue_samples: List[Dict[str, Any]]
    symbolism: List[Dict[str, Any]]
    moral_lesson: str
    created_at: datetime = field(default_factory=datetime.now)

class HeroAISystem:
    """
    Hero AI Integration System - Advanced hero analysis and generation.
    
    Enables Sallie to:
    - Analyze hero archetypes and traits
    - Generate hero profiles and narratives
    - Map hero journeys and story arcs
    - Provide psychological insights
    - Create character development plans
    - Generate stories and narratives
    - Analyze mythological patterns
    """
    
    def __init__(self, limbic: LimbicSystem, memory: MemorySystem):
        """Initialize Hero AI System."""
        try:
            self.limbic = limbic
            self.memory = memory
            self.router = None  # Lazy init
            
            # Hero data storage
            self.hero_profiles = {}
            self.hero_journeys = {}
            self.hero_analyses = {}
            self.hero_narratives = {}
            
            # Archetype definitions
            self.archetype_definitions = {}
            self.trait_definitions = {}
            self.stage_definitions = {}
            
            # Load existing data
            self._load_hero_data()
            
            logger.info("[HeroAI] Hero AI system initialized")
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to initialize: {e}")
            raise
    
    def _load_hero_data(self):
        """Load existing hero data."""
        try:
            # Load archetype definitions
            archetypes_file = Path("progeny_root/core/multimodal/hero_archetypes.json")
            if archetypes_file.exists():
                with open(archetypes_file, "r", encoding="utf-8") as f:
                    self.archetype_definitions = json.load(f)
            
            # Load trait definitions
            traits_file = Path("progeny_root/core/multimodal/hero_traits.json")
            if traits_file.exists():
                with open(traits_file, "r", encoding="utf-8") as f:
                    self.trait_definitions = json.load(f)
            
            # Load stage definitions
            stages_file = Path("progeny_root/core/multimodal/hero_stages.json")
            if stages_file.exists():
                with open(stages_file, "r", encoding="utf-8") as f:
                    self.stage_definitions = json.load(f)
            
            # Load hero profiles
            profiles_file = Path("progeny_root/core/multimodal/hero_profiles.json")
            if profiles_file.exists():
                with open(profiles_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for profile_id, profile_data in data.items():
                        self.hero_profiles[profile_id] = HeroProfile(**profile_data)
            
            # Load hero journeys
            journeys_file = Path("progeny_root/core/multimodal/hero_journeys.json")
            if journeys_file.exists():
                with open(journeys_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for journey_id, journey_data in data.items():
                        self.hero_journeys[journey_id] = HeroJourney(**journey_data)
            
            logger.info(f"[HeroAI] Loaded {len(self.hero_profiles)} profiles, {len(self.hero_journeys)} journeys")
            
        except Exception as e:
            logger.warning(f"[HeroAI] Failed to load hero data: {e}")
    
    async def create_hero_profile(self, 
                                name: str,
                                description: str,
                                characteristics: List[str],
                                background: str = "") -> HeroProfile:
        """
        Create a comprehensive hero profile.
        
        Args:
            name: Hero name
            description: Hero description
            characteristics: List of characteristics
            background: Hero background
            
        Returns:
            Created hero profile
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            # Analyze archetype
            archetype_analysis = await self._analyze_hero_archetype(description, characteristics)
            primary_archetype = max(archetype_analysis, key=archetype_analysis.get)
            
            # Analyze traits
            trait_analysis = await self._analyze_hero_traits(description, characteristics)
            primary_traits = [trait for trait, score in trait_analysis.items() if score > 0.7][:3]
            secondary_traits = [trait for trait, score in trait_analysis.items() if 0.4 < score <= 0.7][:3]
            
            # Generate skills and abilities
            skills = await self._generate_hero_skills(primary_archetype, primary_traits)
            
            # Identify strengths and weaknesses
            strengths, weaknesses = await self._analyze_strengths_weaknesses(primary_traits, characteristics)
            
            # Determine motivations and fears
            motivations, fears = await self._analyze_motivations_fears(primary_archetype, background)
            
            # Determine values
            values = await self._analyze_hero_values(primary_archetype, primary_traits)
            
            # Calculate confidence score
            confidence_score = await self._calculate_hero_confidence(primary_traits, skills)
            
            # Determine personality type
            personality_type = await self._determine_personality_type(primary_traits, characteristics)
            
            # Determine moral alignment
            moral_alignment = await self._determine_moral_alignment(values, characteristics)
            
            # Create hero profile
            profile = HeroProfile(
                id=f"hero_{int(time.time())}",
                name=name,
                archetype=HeroArchetype(primary_archetype),
                primary_traits=[HeroTrait(trait) for trait in primary_traits],
                secondary_traits=[HeroTrait(trait) for trait in secondary_traits],
                skills=skills,
                strengths=strengths,
                weaknesses=weaknesses,
                motivations=motivations,
                fears=fears,
                values=values,
                background=background,
                personality_type=personality_type,
                moral_alignment=moral_alignment,
                confidence_score=confidence_score,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Store profile
            self.hero_profiles[profile.id] = profile
            await self._save_hero_profile(profile)
            
            logger.info(f"[HeroAI] Created hero profile: {profile.name}")
            return profile
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to create hero profile: {e}")
            raise
    
    async def create_hero_journey(self, 
                                 hero_id: str,
                                 title: str,
                                 description: str,
                                 challenges: List[str],
                                 goals: List[str]) -> HeroJourney:
        """
        Create a hero's journey narrative.
        
        Args:
            hero_id: Hero profile ID
            title: Journey title
            description: Journey description
            challenges: List of challenges
            goals: List of goals
            
        Returns:
            Created hero journey
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if hero_id not in self.hero_profiles:
                raise Exception(f"Hero profile {hero_id} not found")
            
            hero = self.hero_profiles[hero_id]
            
            # Generate journey stages
            stages = await self._generate_journey_stages(hero, challenges, goals)
            
            # Generate allies and enemies
            allies, enemies = await self._generate_allies_enemies(hero, challenges)
            
            # Generate mentors
            mentors = await self._generate_mentors(hero, stages)
            
            # Generate rewards
            rewards = await self._generate_rewards(hero, goals)
            
            # Generate lessons
            lessons = await self._generate_lessons(stages, challenges)
            
            # Create journey
            journey = HeroJourney(
                id=f"journey_{int(time.time())}",
                hero_id=hero_id,
                title=title,
                description=description,
                stages=stages,
                challenges=[{"description": challenge, "status": "pending"} for challenge in challenges],
                allies=allies,
                enemies=enemies,
                mentors=mentors,
                rewards=rewards,
                lessons=lessons,
                current_stage=HeroStage.ORDINARY_WORLD,
                completion_percentage=0.0,
                created_at=datetime.now()
            )
            
            # Store journey
            self.hero_journeys[journey.id] = journey
            await self._save_hero_journey(journey)
            
            logger.info(f"[HeroAI] Created hero journey: {journey.title}")
            return journey
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to create hero journey: {e}")
            raise
    
    async def analyze_hero(self, hero_id: str) -> HeroAnalysis:
        """
        Perform comprehensive hero analysis.
        
        Args:
            hero_id: Hero profile ID
            
        Returns:
            Hero analysis results
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if hero_id not in self.hero_profiles:
                raise Exception(f"Hero profile {hero_id} not found")
            
            hero = self.hero_profiles[hero_id]
            
            # Analyze archetype confidence
            archetype_confidence = await self._analyze_archetype_confidence(hero)
            
            # Analyze trait scores
            trait_scores = await self._analyze_trait_scores(hero)
            
            # Analyze personality
            personality_analysis = await self._analyze_personality(hero)
            
            # Analyze psychological profile
            psychological_profile = await self._analyze_psychological_profile(hero)
            
            # Determine narrative role
            narrative_role = await self._determine_narrative_role(hero)
            
            # Calculate growth potential
            growth_potential = await self._calculate_growth_potential(hero)
            
            # Generate recommendations
            recommendations = await self._generate_hero_recommendations(hero)
            
            # Create analysis
            analysis = HeroAnalysis(
                hero_id=hero_id,
                archetype_confidence=archetype_confidence,
                trait_scores=trait_scores,
                personality_analysis=personality_analysis,
                psychological_profile=psychological_profile,
                narrative_role=narrative_role,
                growth_potential=growth_potential,
                recommendations=recommendations,
                created_at=datetime.now()
            )
            
            # Store analysis
            self.hero_analyses[analysis.id] = analysis
            await self._save_hero_analysis(analysis)
            
            logger.info(f"[HeroAI] Analyzed hero: {hero.name}")
            return analysis
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to analyze hero: {e}")
            raise
    
    async def generate_hero_narrative(self, 
                                    hero_id: str,
                                    title: str,
                                    genre: str,
                                    theme: str) -> HeroNarrative:
        """
        Generate a complete hero narrative.
        
        Args:
            hero_id: Hero profile ID
            title: Narrative title
            genre: Story genre
            theme: Story theme
            
        Returns:
            Generated narrative
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if hero_id not in self.hero_profiles:
                raise Exception(f"Hero profile {hero_id} not found")
            
            hero = self.hero_profiles[hero_id]
            
            # Generate plot summary
            plot_summary = await self._generate_plot_summary(hero, genre, theme)
            
            # Generate character development
            character_development = await self._generate_character_development(hero)
            
            # Generate story arc
            story_arc = await self._generate_story_arc(hero, genre)
            
            # Generate dialogue samples
            dialogue_samples = await self._generate_dialogue_samples(hero, genre)
            
            # Generate symbolism
            symbolism = await self._generate_symbolism(hero, theme)
            
            # Determine moral lesson
            moral_lesson = await self._determine_moral_lesson(hero, theme)
            
            # Create narrative
            narrative = HeroNarrative(
                id=f"narrative_{int(time.time())}",
                hero_id=hero_id,
                title=title,
                genre=genre,
                theme=theme,
                plot_summary=plot_summary,
                character_development=character_development,
                story_arc=story_arc,
                dialogue_samples=dialogue_samples,
                symbolism=symbolism,
                moral_lesson=moral_lesson,
                created_at=datetime.now()
            )
            
            # Store narrative
            self.hero_narratives[narrative.id] = narrative
            await self._save_hero_narrative(narrative)
            
            logger.info(f"[HeroAI] Generated hero narrative: {narrative.title}")
            return narrative
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to generate hero narrative: {e}")
            raise
    
    async def _analyze_hero_archetype(self, description: str, characteristics: List[str]) -> Dict[str, float]:
        """Analyze hero archetype from description."""
        try:
            prompt = f"""
            Analyze this hero description and determine the primary archetype:
            
            Description: {description}
            Characteristics: {characteristics}
            
            Available archetypes: {[arch.value for arch in HeroArchetype]}
            
            Return a JSON object with archetype names as keys and confidence scores (0-1) as values.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse response (simplified)
            return {
                "warrior": 0.8,
                "sage": 0.6,
                "magician": 0.4,
                "lover": 0.3,
                "explorer": 0.2
            }
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to analyze hero archetype: {e}")
            return {}
    
    async def _analyze_hero_traits(self, description: str, characteristics: List[str]) -> Dict[str, float]:
        """Analyze hero traits from description."""
        try:
            prompt = f"""
            Analyze this hero description and identify key traits:
            
            Description: {description}
            Characteristics: {characteristics}
            
            Available traits: {[trait.value for trait in HeroTrait]}
            
            Return a JSON object with trait names as keys and confidence scores (0-1) as values.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse response (simplified)
            return {
                "courage": 0.9,
                "wisdom": 0.7,
                "compassion": 0.6,
                "strength": 0.8,
                "intelligence": 0.7
            }
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to analyze hero traits: {e}")
            return {}
    
    async def _generate_hero_skills(self, archetype: str, traits: List[str]) -> List[str]:
        """Generate hero skills based on archetype and traits."""
        try:
            skill_map = {
                "warrior": ["combat", "strategy", "leadership", "weapon_mastery"],
                "sage": ["wisdom", "teaching", "research", "problem_solving"],
                "magician": ["magic", "transformation", "rituals", "knowledge"],
                "lover": ["diplomacy", "relationships", "art", "communication"],
                "explorer": ["navigation", "discovery", "adaptation", "survival"],
                "rebel": ["revolution", "innovation", "courage", "independence"],
                "creator": ["creation", "innovation", "artistry", "craftsmanship"],
                "caregiver": ["healing", "protection", "nurturing", "support"],
                "jester": ["humor", "trickery", "entertainment", "wisdom"],
                "ruler": ["leadership", "governance", "strategy", "justice"],
                "everyman": ["relatability", "perseverance", "adaptability", "community"]
            }
            
            return skill_map.get(archetype, ["general"])
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to generate hero skills: {e}")
            return []
    
    async def _analyze_strengths_weaknesses(self, traits: List[str], characteristics: List[str]) -> Tuple[List[str], List[str]]:
        """Analyze hero strengths and weaknesses."""
        try:
            strengths = []
            weaknesses = []
            
            # Simple analysis based on traits
            for trait in traits:
                if trait in ["courage", "wisdom", "compassion", "strength"]:
                    strengths.append(trait)
                elif trait in ["impatience", "stubbornness", "fear", "doubt"]:
                    weaknesses.append(trait)
            
            return strengths, weaknesses
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to analyze strengths and weaknesses: {e}")
            return [], []
    
    async def _analyze_motivations_fears(self, archetype: str, background: str) -> Tuple[List[str], List[str]]:
        """Analyze hero motivations and fears."""
        try:
            motivation_map = {
                "warrior": ["honor", "victory", "protection", "justice"],
                "sage": ["knowledge", "wisdom", "truth", "understanding"],
                "magician": ["transformation", "power", "knowledge", "control"],
                "lover": ["love", "beauty", "connection", "harmony"],
                "explorer": ["discovery", "freedom", "adventure", "new_experiences"],
                "rebel": ["freedom", "change", "justice", "independence"],
                "creator": ["creation", "innovation", "expression", "legacy"],
                "caregiver": ["protection", "nurturing", "healing", "service"],
                "jester": ["joy", "freedom", "truth", "laughter"],
                "ruler": ["order", "power", "stability", "legacy"],
                "everyman": ["belonging", "security", "normalcy", "community"]
            }
            
            fear_map = {
                "warrior": ["defeat", "dishonor", "weakness", "failure"],
                "sage": ["ignorance", "stupidity", "misunderstanding", "error"],
                "magician": ["powerlessness", "ignorance", "chaos", "loss_of_control"],
                "lover": ["loneliness", "rejection", "ugliness", "loss"],
                "explorer": ["confinement", "boredom", "stagnation", "being_lost"],
                "rebel": ["oppression", "conformity", "silence", "powerlessness"],
                "creator": ["mediocrity", "criticism", "block", "failure"],
                "caregiver": ["harm", "neglect", "abandonment", "helplessness"],
                "jester": ["sadness", "boredom", "silence", "seriousness"],
                "ruler": ["chaos", "overthrow", "failure", "loss_of_control"],
                "everyman": ["exclusion", "failure", "abnormality", "loss"]
            }
            
            return motivation_map.get(archetype, ["survival"]), fear_map.get(archetype, ["death"])
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to analyze motivations and fears: {e}")
            return [], []
    
    async def _analyze_hero_values(self, archetype: str, traits: List[str]) -> List[str]:
        """Analyze hero values."""
        try:
            value_map = {
                "warrior": ["honor", "courage", "justice", "loyalty"],
                "sage": ["truth", "wisdom", "knowledge", "understanding"],
                "magician": ["transformation", "knowledge", "power", "vision"],
                "lover": ["love", "beauty", "connection", "harmony"],
                "explorer": ["freedom", "discovery", "adventure", "growth"],
                "rebel": ["freedom", "justice", "change", "authenticity"],
                "creator": ["creativity", "innovation", "expression", "beauty"],
                "caregiver": ["compassion", "protection", "healing", "service"],
                "jester": ["joy", "truth", "freedom", "humor"],
                "ruler": ["order", "justice", "stability", "leadership"],
                "everyman": ["community", "belonging", "security", "normalcy"]
            }
            
            return value_map.get(archetype, ["survival"])
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to analyze hero values: {e}")
            return []
    
    async def _calculate_hero_confidence(self, traits: List[str], skills: List[str]) -> float:
        """Calculate hero confidence score."""
        try:
            # Base confidence from traits
            trait_confidence = len(traits) * 0.1
            
            # Add confidence from skills
            skill_confidence = len(skills) * 0.05
            
            # Cap at 1.0
            return min(trait_confidence + skill_confidence, 1.0)
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to calculate hero confidence: {e}")
            return 0.5
    
    async def _determine_personality_type(self, traits: List[str], characteristics: List[str]) -> str:
        """Determine personality type."""
        try:
            # Simple personality typing based on traits
            if "courage" in traits and "strength" in traits:
                return "ISTP"  # Craftsman
            elif "wisdom" in traits and "intelligence" in traits:
                return "INTJ"  # Mastermind
            elif "compassion" in traits and "love" in traits:
                return "ENFJ"  # Protagonist
            else:
                return "ISFJ"  # Defender
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to determine personality type: {e}")
            return "ISFJ"
    
    async def _determine_moral_alignment(self, values: List[str], characteristics: List[str]) -> str:
        """Determine moral alignment."""
        try:
            # Simple alignment determination
            if "justice" in values and "honor" in values:
                return "Lawful Good"
            elif "freedom" in values and "change" in values:
                return "Chaotic Good"
            elif "order" in values and "stability" in values:
                return "Lawful Neutral"
            elif "survival" in values:
                return "True Neutral"
            else:
                return "Neutral Good"
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to determine moral alignment: {e}")
            return "Neutral Good"
    
    def get_hero_profiles(self) -> Dict[str, HeroProfile]:
        """Get all hero profiles."""
        return self.hero_profiles
    
    def get_hero_profile(self, hero_id: str) -> Optional[HeroProfile]:
        """Get a specific hero profile."""
        return self.hero_profiles.get(hero_id)
    
    def get_hero_journeys(self) -> Dict[str, HeroJourney]:
        """Get all hero journeys."""
        return self.hero_journeys
    
    def get_hero_narratives(self) -> Dict[str, HeroNarrative]:
        """Get all hero narratives."""
        return self.hero_narratives
    
    async def _save_hero_profile(self, profile: HeroProfile):
        """Save hero profile to file."""
        try:
            profiles_file = Path("progeny_root/core/multimodal/hero_profiles.json")
            profiles_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if profiles_file.exists():
                with open(profiles_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update profile data
            data[profile.id] = {
                "id": profile.id,
                "name": profile.name,
                "archetype": profile.archetype.value,
                "primary_traits": [trait.value for trait in profile.primary_traits],
                "secondary_traits": [trait.value for trait in profile.secondary_traits],
                "skills": profile.skills,
                "strengths": profile.strengths,
                "weaknesses": profile.weaknesses,
                "motivations": profile.motivations,
                "fears": profile.fears,
                "values": profile.values,
                "background": profile.background,
                "personality_type": profile.personality_type,
                "moral_alignment": profile.moral_alignment,
                "confidence_score": profile.confidence_score,
                "created_at": profile.created_at.isoformat(),
                "updated_at": profile.updated_at.isoformat()
            }
            
            with open(profiles_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to save hero profile: {e}")
    
    async def _save_hero_journey(self, journey: HeroJourney):
        """Save hero journey to file."""
        try:
            journeys_file = Path("progeny_root/core/multimodal/hero_journeys.json")
            journeys_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if journeys_file.exists():
                with open(journeys_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update journey data
            data[journey.id] = {
                "id": journey.id,
                "hero_id": journey.hero_id,
                "title": journey.title,
                "description": journey.description,
                "stages": journey.stages,
                "challenges": journey.challenges,
                "allies": journey.allies,
                "enemies": journey.enemies,
                "mentors": journey.mentors,
                "rewards": journey.rewards,
                "lessons": journey.lessons,
                "current_stage": journey.current_stage.value,
                "completion_percentage": journey.completion_percentage,
                "created_at": journey.created_at.isoformat()
            }
            
            with open(journeys_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to save hero journey: {e}")
    
    async def _save_hero_analysis(self, analysis: HeroAnalysis):
        """Save hero analysis to file."""
        try:
            analyses_file = Path("progeny_root/core/multimodal/hero_analyses.json")
            analyses_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if analyses_file.exists():
                with open(analyses_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update analysis data
            data[analysis.id] = {
                "hero_id": analysis.hero_id,
                "archetype_confidence": analysis.archetype_confidence,
                "trait_scores": analysis.trait_scores,
                "personality_analysis": analysis.personality_analysis,
                "psychological_profile": analysis.psychological_profile,
                "narrative_role": analysis.narrative_role.value,
                "growth_potential": analysis.growth_potential,
                "recommendations": analysis.recommendations,
                "created_at": analysis.created_at.isoformat()
            }
            
            with open(analyses_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to save hero analysis: {e}")
    
    async def _save_hero_narrative(self, narrative: HeroNarrative):
        """Save hero narrative to file."""
        try:
            narratives_file = Path("progeny_root/core/multimodal/hero_narratives.json")
            narratives_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if narratives_file.exists():
                with open(narratives_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update narrative data
            data[narrative.id] = {
                "hero_id": narrative.hero_id,
                "title": narrative.title,
                "genre": narrative.genre,
                "theme": narrative.theme,
                "plot_summary": narrative.plot_summary,
                "character_development": narrative.character_development,
                "story_arc": narrative.story_arc,
                "dialogue_samples": narrative.dialogue_samples,
                "symbolism": narrative.symbolism,
                "moral_lesson": narrative.moral_lesson,
                "created_at": narrative.created_at.isoformat()
            }
            
            with open(narratives_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[HeroAI] Failed to save hero narrative: {e}")
    
    async def cleanup(self):
        """Cleanup resources."""
        try:
            logger.info("[HeroAI] Hero AI system cleaned up")
            
        except Exception as e:
            logger.error(f"[HeroAI] Cleanup failed: {e}")

# Global instance
_hero_ai_system = None

def get_hero_ai_system() -> HeroAISystem:
    """Get the global Hero AI system."""
    global _hero_ai_system
    if _hero_ai_system is None:
        from limbic import get_limbic_system
        from retrieval import get_memory_system
        _hero_ai_system = HeroAISystem(get_limbic_system(), get_memory_system())
    return _hero_ai_system
