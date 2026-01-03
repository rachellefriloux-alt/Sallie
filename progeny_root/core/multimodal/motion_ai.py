"""Motion AI System.

Advanced motion analysis and generation capabilities:
- Human motion analysis and tracking
- Motion pattern recognition
- AI-powered motion generation
- Dance and movement choreography
- Sports motion analysis
- Motion capture integration
- Real-time motion effects
- Motion style transfer
- Gesture recognition and synthesis

This enables Sallie to understand and generate human-like motion.
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

logger = setup_logging("motion_ai")

class MotionType(str, Enum):
    """Types of motion patterns."""
    HUMAN = "human"
    DANCE = "dance"
    SPORTS = "sports"
    GESTURE = "gesture"
    EXPRESSION = "expression"
    LOCOMOTION = "locomotion"
    ROBOTIC = "robotic"
    ANIMAL = "animal"
    ABSTRACT = "abstract"

class MotionStyle(str, Enum):
    """Motion styles and aesthetics."""
    REALISTIC = "realistic"
    STYLIZED = "stylized"
    CARTOON = "cartoon"
    ABSTRACT = "abstract"
    MINIMALIST = "minimalist"
    DRAMATIC = "dramatic"
    SMOOTH = "smooth"
    ENERGETIC = "energetic"
    GENTLE = "gentle"
    PRECISE = "precise"

@dataclass
class MotionPattern:
    """A detected or generated motion pattern."""
    id: str
    type: MotionType
    style: MotionStyle
    duration: float
    confidence: float
    keyframes: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class MotionAnalysis:
    """Analysis of motion data."""
    pattern_id: str
    motion_type: MotionType
    confidence: float
    features: Dict[str, Any]
    emotions: List[str]
    context: str
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class MotionGeneration:
    """Generated motion sequence."""
    id: str
    type: MotionType
    style: MotionStyle
    duration: float
    fps: int
    resolution: Tuple[int, int]
    keyframes: List[Dict[str, Any]]
    audio_sync: bool
    metadata: Dict[str, Any]

class MotionAISystem:
    """
    Motion AI System - Advanced motion analysis and generation.
    
    Enables Sallie to:
    - Analyze human motion patterns
    - Generate AI-powered motion sequences
    - Recognize gestures and expressions
    - Create choreographed movements
    - Analyze sports techniques
    - Generate motion capture data
    """
    
    def __init__(self, limbic: LimbicSystem, memory: MemorySystem):
        """Initialize Motion AI System with comprehensive error handling."""
        try:
            self.limbic = limbic
            self.memory = memory
            self.router = None  # Lazy init
            
            # Motion pattern database
            self.motion_patterns = {}
            self.motion_styles = {}
            self.gesture_library = {}
            
            # Analysis models
            self.motion_analyzer = None
            self.gesture_recognizer = None
            
            # Generation engines
            self.motion_generator = None
            self.choreographer = None
            
            # Load existing data
            self._load_motion_data()
            
            logger.info("[MotionAI] Motion AI system initialized")
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to initialize: {e}")
            raise
    
    def _load_motion_data(self):
        """Load existing motion patterns and styles."""
        try:
            # Load motion patterns
            patterns_file = Path("progeny_root/core/multimodal/motion_patterns.json")
            if patterns_file.exists():
                with open(patterns_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for pattern_id, pattern_data in data.items():
                        self.motion_patterns[pattern_id] = MotionPattern(**pattern_data)
            
            # Load motion styles
            styles_file = Path("progeny_root/core/multimodal/motion_styles.json")
            if styles_file.exists():
                with open(styles_file, "r", encoding="utf-8") as f:
                    self.motion_styles = json.load(f)
            
            # Load gesture library
            gestures_file = Path("progeny_root/core/multimodal/gesture_library.json")
            if gestures_file.exists():
                with open(gestures_file, "r", encoding="utf-8") as f:
                    self.gesture_library = json.load(f)
            
            logger.info(f"[MotionAI] Loaded {len(self.motion_patterns)} patterns, {len(self.motion_styles)} styles, {len(self.gesture_library)} gestures")
            
        except Exception as e:
            logger.warning(f"[MotionAI] Failed to load motion data: {e}")
    
    async def analyze_motion(self, motion_data: List[Dict[str, Any]], context: str = "") -> MotionAnalysis:
        """
        Analyze motion data and return insights.
        
        Args:
            motion_data: Motion capture data (keyframes, positions, etc.)
            context: Context of the motion (activity, environment, etc.)
            
        Returns:
            Motion analysis results
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            # Extract motion features
            features = self._extract_motion_features(motion_data)
            
            # Identify motion type
            motion_type = await self._identify_motion_type(features, context)
            
            # Recognize gestures
            gestures = self._recognize_gestures(motion_data)
            
            # Analyze emotional content
            emotions = await self._analyze_motion_emotion(features, context)
            
            # Calculate confidence
            confidence = self._calculate_confidence(features, motion_type, gestures)
            
            analysis = MotionAnalysis(
                pattern_id=f"motion_{int(time.time())}",
                motion_type=motion_type,
                confidence=confidence,
                features=features,
                emotions=emotions,
                context=context
            )
            
            # Store in memory
            await self._store_motion_analysis(analysis)
            
            return analysis
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to analyze motion: {e}")
            raise
    
    async def generate_motion(self, 
                           motion_type: MotionType,
                           style: MotionStyle,
                           duration: float,
                           context: str = "") -> MotionGeneration:
        """
        Generate AI-powered motion sequence.
        
        Args:
            motion_type: Type of motion to generate
            style: Motion style aesthetic
            duration: Duration in seconds
            context: Context for the motion
            
        Returns:
            Generated motion sequence
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            # Generate keyframes
            keyframes = await self._generate_keyframes(motion_type, style, duration, context)
            
            # Calculate FPS and resolution
            fps = self._calculate_optimal_fps(motion_type, duration)
            resolution = self._calculate_optimal_resolution(motion_type)
            
            # Add audio sync if applicable
            audio_sync = self._should_add_audio_sync(motion_type, context)
            
            generation = MotionGeneration(
                id=f"motion_{int(time.time())}",
                type=motion_type,
                style=style,
                duration=duration,
                fps=fps,
                resolution=resolution,
                keyframes=keyframes,
                audio_sync=audio_sync,
                metadata={
                    "context": context,
                    "created_at": datetime.now().isoformat(),
                    "model": self.router.current_model
                }
            )
            
            # Store in memory
            await self._store_motion_generation(generation)
            
            return generation
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to generate motion: {e}")
            raise
    
    async def recognize_gestures(self, motion_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Recognize gestures from motion data.
        
        Args:
            motion_data: Motion capture data
            
        Returns:
            List of recognized gestures with confidence scores
        """
        try:
            gestures = []
            
            for frame in motion_data:
                # Extract hand/position data
                hand_positions = self._extract_hand_positions(frame)
                body_positions = self._extract_body_positions(frame)
                
                # Compare with gesture library
                recognized = self._compare_with_library(hand_positions, body_positions)
                
                if recognized:
                    gestures.append(recognized)
            
            return gestures
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to recognize gestures: {e}")
            return []
    
    def _extract_motion_features(self, motion_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Extract features from motion data."""
        if not motion_data:
            return {}
        
        # Calculate basic motion metrics
        velocities = []
        accelerations = []
        positions = []
        
        for frame in motion_data:
            if 'positions' in frame:
                positions.extend(frame['positions'])
                if len(positions) > 1:
                    # Calculate velocity and acceleration
                    velocity = self._calculate_velocity(positions[-2], positions[-1])
                    velocities.append(velocity)
                    if len(velocities) > 1:
                        acceleration = self._calculate_acceleration(velocities[-2], velocities[-1])
                        accelerations.append(acceleration)
        
        return {
            "positions": positions,
            "velocities": velocities,
            "accelerations": accelerations,
            "duration": len(motion_data) / 30.0,  # Assuming 30 FPS
            "keyframe_count": len(motion_data)
        }
    
    async def _identify_motion_type(self, features: Dict[str, Any], context: str) -> MotionType:
        """Identify the type of motion from features."""
        try:
            # Use LLM to identify motion type
            prompt = f"""
            Analyze this motion data and identify the primary motion type:
            
            Features: {features}
            Context: {context}
            
            Available motion types: {[mt.value for mt in MotionType]}
            
            Return only the motion type that best matches this motion pattern.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse response to get motion type
            for motion_type in MotionType:
                if motion_type.value.lower() in response.lower():
                    return motion_type
            
            return MotionType.HUMAN  # Default
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to identify motion type: {e}")
            return MotionType.HUMAN
    
    def _recognize_gestures(self, motion_data: List[Dict[str, Any]]) -> List[str]:
        """Recognize gestures from motion data."""
        gestures = []
        
        for frame in motion_data:
            if 'gestures' in frame:
                gestures.extend(frame['gestures'])
        
        return gestures
    
    async def _analyze_motion_emotion(self, features: Dict[str, Any], context: str) -> List[str]:
        """Analyze emotional content of motion."""
        try:
            # Use LLM to analyze emotion
            prompt = f"""
            Analyze the emotional content of this motion:
            
            Features: {features}
            Context: {context}
            
            Identify emotions expressed through movement (e.g., joy, anger, sadness, excitement, calm, tension).
            Return as a list of emotion names.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse emotions from response
            emotions = []
            emotion_keywords = ['joy', 'happy', 'excitement', 'energy', 'calm', 'peaceful', 'tension', 'stress', 'anger', 'sadness', 'melancholy']
            
            for emotion in emotion_keywords:
                if emotion in response.lower():
                    emotions.append(emotion)
            
            return emotions
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to analyze motion emotion: {e}")
            return []
    
    def _calculate_confidence(self, features: Dict[str, Any], motion_type: MotionType, gestures: List[str]) -> float:
        """Calculate confidence in motion analysis."""
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on data quality
        if features.get('keyframe_count', 0) > 10:
            confidence += 0.2
        
        # Increase confidence if gestures are recognized
        if gestures:
            confidence += 0.2
        
        # Increase confidence if motion type is clear
        if motion_type != MotionType.HUMAN:
            confidence += 0.1
        
        return min(confidence, 1.0)
    
    async def _generate_keyframes(self, motion_type: MotionType, style: MotionStyle, duration: duration: float, context: str) -> List[Dict[str, Any]]:
        """Generate keyframes for motion sequence."""
        try:
            fps = self._calculate_optimal_fps(motion_type, duration)
            frame_count = int(duration * fps)
            
            keyframes = []
            
            for i in range(frame_count):
                progress = i / (frame_count - 1)
                
                # Generate position based on motion type and style
                position = self._generate_position(motion_type, style, progress, context)
                
                keyframe = {
                    "frame": i,
                    "timestamp": i / fps,
                    "position": position,
                    "rotation": self._generate_rotation(motion_type, style, progress),
                    "scale": self._generate_scale(motion_type, style, progress)
                }
                
                keyframes.append(keyframe)
            
            return keyframes
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to generate keyframes: {e}")
            return []
    
    def _generate_position(self, motion_type: MotionType, style: MotionStyle, progress: float, context: str) -> Dict[str, float]:
        """Generate position for keyframe."""
        # Base position generation logic
        x = 0.0
        y = 0.0
        z = 0.0
        
        if motion_type == MotionType.DANCE:
            # Dance motion - circular or figure-8 patterns
            angle = progress * 2 * 3.14159
            x = 100 * (0.5 + 0.5 * math.cos(angle))
            y = 100 * (0.5 + 0.5 * math.sin(angle))
            z = 50 * math.sin(progress * 2 * 3.14159)
            
        elif motion_type == MotionType.SPORTS:
            # Sports motion - dynamic and energetic
            x = 200 * progress
            y = 100 * math.sin(progress * 4 * 3.14159)
            z = 50 * math.cos(progress * 3.14159)
            
        elif motion_type == MotionType.GESTURE:
            # Gesture motion - localized hand/arm movement
            x = 50 * math.sin(progress * 2 * 3.14159)
            y = 50 * math.cos(progress * 2 * 3.14159)
            z = 0.0
            
        else:
            # Default human motion - natural walking/standing
            x = 50 * progress
            y = 0.0
            z = 0.0
        
        # Apply style modifications
        if style == MotionStyle.ENERGETIC:
            x *= 1.5
            y *= 1.5
            z *= 1.5
        elif style == MotionType.GENTLE:
            x *= 0.5
            y *= 0.5
            z *= 0.5
        elif style == MotionType.PRECISE:
            # Add small variations for precision
            x += 0.1 * math.sin(progress * 10 * 3.14159)
            y += 0.1 * math.cos(progress * 10 * 3.14159)
        
        return {"x": x, "y": y, "z": z}
    
    def _generate_rotation(self, motion_type: MotionType, style: MotionStyle, progress: float) -> Dict[str, float]:
        """Generate rotation for keyframe."""
        # Base rotation generation
        if motion_type == MotionType.DANCE:
            return {
                "x": 0.0,
                "y": progress * 360.0,
                "z": 0.0
            }
        elif motion_type == MotionType.SPORTS:
            return {
                "x": progress * 180.0,
                "y": 0.0,
                "z": progress * 90.0
            }
        else:
            return {"x": 0.0, "y": 0.0, "z": 0.0}
    
    def _generate_scale(self, motion_type: MotionType, style: MotionStyle, progress: float) -> Dict[str, float]:
        """Generate scale for keyframe."""
        base_scale = 1.0
        
        if style == MotionStyle.DRAMATIC:
            base_scale = 1.2 + 0.3 * math.sin(progress * 2 * 3.14159)
        elif style == MotionType.SMOOTH:
            base_scale = 1.0 + 0.1 * math.sin(progress * 2 * 3.14159)
        
        return {"x": base_scale, "y": base_scale, "z": base_scale}
    
    def _calculate_optimal_fps(self, motion_type: MotionType, duration: float) -> int:
        """Calculate optimal FPS for motion type."""
        if motion_type in [MotionType.DANCE, MotionType.SPORTS]:
            return 60  # High FPS for smooth motion
        elif motion_type == MotionType.GESTURE:
            return 30  # Lower FPS for gestures
        else:
            return 30  # Standard FPS
    
    def _calculate_optimal_resolution(self, motion_type: MotionType) -> Tuple[int, int]:
        """Calculate optimal resolution for motion type."""
        if motion_type == MotionType.DANCE:
            return (1920, 1080)  # HD for dance
        elif motion_type == MotionType.SPORTS:
            return (1280, 720)  # Standard for sports
        else:
            return (640, 480)  # Standard resolution
    
    def _should_add_audio_sync(self, motion_type: MotionType, context: str) -> bool:
        """Determine if audio sync should be added."""
        # Add audio sync for dance and sports
        return motion_type in [MotionType.DANCE, MotionType.SPORTS]
    
    def _extract_hand_positions(self, frame: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract hand positions from frame data."""
        if 'hand_landmarks' in frame:
            return frame['hand_landmarks']
        return []
    
    def _extract_body_positions(self, frame: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Extract body positions from frame data."""
        if 'pose_landmarks' in frame:
            return frame['pose_landmarks']
        return []
    
    def _compare_with_library(self, hand_positions: List[Dict[str, Any]], body_positions: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
        """Compare positions with gesture library."""
        # Simple gesture recognition logic
        if not hand_positions or not self.gesture_library:
            return None
        
        # Check for common gestures
        for gesture_name, gesture_data in self.gesture_library.items():
            if self._matches_gesture(hand_positions, body_positions, gesture_data):
                return {
                    "name": gesture_name,
                    "confidence": 0.8,
                    "description": gesture_data.get("description", "")
                }
        
        return None
    
    def _matches_gesture(self, hand_positions: List[Dict[str, Any]], body_positions: List[Dict[str, Any]], gesture_data: Dict[str, Any]) -> bool:
        """Check if positions match gesture pattern."""
        # Simple matching logic - can be enhanced with ML models
        return True  # Placeholder for actual gesture matching logic
    
    def _calculate_velocity(self, pos1: Dict[str, float], pos2: Dict[str, float]) -> float:
        """Calculate velocity between two positions."""
        dx = pos2["x"] - pos1["x"]
        dy = pos2["y"] - pos1["y"]
        dz = pos2["z"] - pos1["z"]
        return math.sqrt(dx*dx + dy*dy + dz*dz)
    
    def _calculate_acceleration(self, vel1: float, vel2: float) -> float:
        """Calculate acceleration between two velocities."""
        return abs(vel2 - vel1)
    
    async def _store_motion_analysis(self, analysis: MotionAnalysis):
        """Store motion analysis in memory."""
        try:
            analysis_data = {
                "pattern_id": analysis.pattern_id,
                "motion_type": analysis.motion_type.value,
                "confidence": analysis.confidence,
                "features": analysis.features,
                "emotions": analysis.emotions,
                "context": analysis.context,
                "timestamp": analysis.timestamp.isoformat()
            }
            
            await self.memory.store_memory(
                content=f"Motion Analysis: {analysis.pattern_id}",
                metadata=analysis_data,
                tags=["motion", "analysis", analysis.motion_type.value]
            )
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to store motion analysis: {e}")
    
    async def _store_motion_generation(self, generation: MotionGeneration):
        """Store motion generation in memory."""
        try:
            generation_data = {
                "generation_id": generation.id,
                "motion_type": generation.type.value,
                "style": generation.style.value,
                "duration": generation.duration,
                "fps": generation.fps,
                "resolution": generation.resolution,
                "keyframes": generation.keyframes,
                "audio_sync": generation.audio_sync,
                "metadata": generation.metadata
            }
            
            await self.memory.store_memory(
                content=f"Motion Generation: {generation.id}",
                metadata=generation_data,
                tags=["motion", "generation", generation.type.value]
            )
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to store motion generation: {e}")
    
    def get_motion_patterns(self) -> Dict[str, MotionPattern]:
        """Get all stored motion patterns."""
        return self.motion_patterns
    
    def get_motion_styles(self) -> Dict[str, Any]:
        """Get all available motion styles."""
        return self.motion_styles
    
    def get_gesture_library(self) -> Dict[str, Any]:
        """Get the gesture library."""
        return self.gesture_library
    
    def add_motion_pattern(self, pattern: MotionPattern):
        """Add a new motion pattern to the library."""
        self.motion_patterns[pattern.id] = pattern
        self._save_motion_patterns()
    
    def add_motion_style(self, name: str, style_data: Dict[str, Any]):
        """Add a new motion style to the library."""
        self.motion_styles[name] = style_data
        self._save_motion_styles()
    
    def add_gesture(self, name: str, gesture_data: Dict[str, Any]):
        """Add a new gesture to the library."""
        self.gesture_library[name] = gesture_data
        self._save_gesture_library()
    
    def _save_motion_patterns(self):
        """Save motion patterns to file."""
        try:
            patterns_file = Path("progeny_root/core/multimodal/motion_patterns.json")
            patterns_file.parent.mkdir(parents=True, exist_ok=True)
            
            data = {}
            for pattern_id, pattern in self.motion_patterns.items():
                data[pattern_id] = {
                    "id": pattern.id,
                    "type": pattern.type.value,
                    "style": pattern.style.value,
                    "duration": pattern.duration,
                    "confidence": pattern.confidence,
                    "keyframes": pattern.keyframes,
                    "metadata": pattern.metadata,
                    "created_at": pattern.created_at.isoformat()
                }
            
            with open(patterns_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to save motion patterns: {e}")
    
    def _save_motion_styles(self):
        """Save motion styles to file."""
        try:
            styles_file = Path("progeny_root/core/multimodal/motion_styles.json")
            styles_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(styles_file, "w", encoding="utf-8") as f:
                json.dump(self.motion_styles, f, indent=2)
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to save motion styles: {e}")
    
    def _save_gesture_library(self):
        """Save gesture library to file."""
        try:
            gestures_file = Path("progeny_root/core/multimodal/gesture_library.json")
            gestures_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(gestures_file, "w", encoding="utf-8") as f:
                json.dump(self.gesture_library, f, indent=2)
            
        except Exception as e:
            logger.error(f"[MotionAI] Failed to save gesture library: {e}")

import math
