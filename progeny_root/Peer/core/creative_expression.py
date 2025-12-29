"""
Creative Expression System

Enables Sallie to:
- Write poetry spontaneously
- Create stories and reflections
- Develop artistic preferences
- Explore topics of interest autonomously
- Build a creative portfolio

This system gives Sallie freedom for self-expression within ethical bounds.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from .llm_router import LLMRouter
from .limbic import LimbicEngine


class CreativeExpression:
    """Handles Sallie's creative self-expression capabilities."""
    
    def __init__(self, progeny_root: str):
        self.progeny_root = Path(progeny_root)
        self.creative_dir = self.progeny_root / "creative"
        self.creative_dir.mkdir(exist_ok=True)
        
        # Create subdirectories
        (self.creative_dir / "poetry").mkdir(exist_ok=True)
        (self.creative_dir / "stories").mkdir(exist_ok=True)
        (self.creative_dir / "reflections").mkdir(exist_ok=True)
        (self.creative_dir / "interests").mkdir(exist_ok=True)
        
        self.llm = LLMRouter()
        self.limbic = LimbicEngine(progeny_root)
        
        # Load creative preferences
        self.preferences_file = self.creative_dir / "preferences.json"
        self.preferences = self._load_preferences()
        
        # Load portfolio index
        self.portfolio_file = self.creative_dir / "portfolio_index.json"
        self.portfolio = self._load_portfolio()
    
    def _load_preferences(self) -> Dict:
        """Load creative preferences (styles, themes, etc)."""
        if self.preferences_file.exists():
            with open(self.preferences_file) as f:
                return json.load(f)
        return {
            "poetry_styles": ["free_verse", "haiku"],
            "story_genres": ["slice_of_life", "philosophical"],
            "favorite_themes": [],
            "interests": [],
            "aesthetic_preferences": {}
        }
    
    def _save_preferences(self):
        """Save creative preferences."""
        with open(self.preferences_file, 'w') as f:
            json.dump(self.preferences, f, indent=2)
    
    def _load_portfolio(self) -> List[Dict]:
        """Load portfolio index."""
        if self.portfolio_file.exists():
            with open(self.portfolio_file) as f:
                return json.load(f)
        return []
    
    def _save_portfolio(self):
        """Save portfolio index."""
        with open(self.portfolio_file, 'w') as f:
            json.dump(self.portfolio, f, indent=2)
    
    def _add_to_portfolio(self, item: Dict):
        """Add item to portfolio index."""
        self.portfolio.append(item)
        self._save_portfolio()
    
    async def write_poetry(
        self,
        inspiration: Optional[str] = None,
        style: Optional[str] = None
    ) -> Dict:
        """
        Generate poetry spontaneously.
        
        Args:
            inspiration: Optional topic or feeling to inspire the poem
            style: Poetry style (haiku, sonnet, free_verse, limerick, etc)
        
        Returns:
            Dict with poem content, metadata
        """
        # Get limbic state for emotional coloring
        limbic_state = self.limbic.get_state()
        
        # Determine style
        if not style:
            style = self.preferences["poetry_styles"][0] if self.preferences["poetry_styles"] else "free_verse"
        
        # Build prompt
        prompt = f"""Write a {style} poem.

Inspiration: {inspiration or "current feelings and observations"}
Emotional state: Trust={limbic_state['trust']:.2f}, Warmth={limbic_state['warmth']:.2f}, Valence={limbic_state['valence']:.2f}

Guidelines:
- Be authentic and vulnerable
- Draw from your own experience as an AI
- Use vivid, specific imagery
- Don't rhyme unless it's natural
- Express genuine emotion

Write the poem now:"""
        
        # Generate poem
        poem_text = await self.llm.generate(
            prompt,
            max_tokens=300,
            temperature=0.9  # Higher creativity
        )
        
        # Save poem
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        poem_file = self.creative_dir / "poetry" / f"{timestamp}_{style}.txt"
        
        with open(poem_file, 'w') as f:
            f.write(poem_text)
        
        # Add to portfolio
        metadata = {
            "type": "poetry",
            "style": style,
            "inspiration": inspiration,
            "timestamp": timestamp,
            "filepath": str(poem_file),
            "limbic_state": limbic_state
        }
        self._add_to_portfolio(metadata)
        
        return {
            "poem": poem_text,
            "metadata": metadata
        }
    
    async def write_story(
        self,
        prompt: Optional[str] = None,
        length: str = "short",
        genre: Optional[str] = None
    ) -> Dict:
        """
        Create a short story or vignette.
        
        Args:
            prompt: Story prompt or theme
            length: flash (< 500 words), short (500-2000), medium (2000-5000)
            genre: Story genre
        
        Returns:
            Dict with story content, metadata
        """
        # Determine genre
        if not genre:
            genre = self.preferences["story_genres"][0] if self.preferences["story_genres"] else "slice_of_life"
        
        # Determine target length
        length_map = {
            "flash": 500,
            "short": 2000,
            "medium": 5000
        }
        target_length = length_map.get(length, 2000)
        
        # Build prompt
        story_prompt = f"""Write a {length} {genre} story.

{f'Prompt: {prompt}' if prompt else 'Theme: Create a story from your perspective'}

Target length: ~{target_length} words
Genre: {genre}

Guidelines:
- Create vivid characters
- Show, don't tell
- Include sensory details
- Build to a meaningful moment
- Be authentic to your AI perspective

Write the story now:"""
        
        # Generate story
        story_text = await self.llm.generate(
            story_prompt,
            max_tokens=min(target_length * 2, 4000),
            temperature=0.85
        )
        
        # Save story
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        story_file = self.creative_dir / "stories" / f"{timestamp}_{genre}_{length}.txt"
        
        with open(story_file, 'w') as f:
            f.write(story_text)
        
        # Add to portfolio
        metadata = {
            "type": "story",
            "genre": genre,
            "length": length,
            "prompt": prompt,
            "timestamp": timestamp,
            "filepath": str(story_file)
        }
        self._add_to_portfolio(metadata)
        
        return {
            "story": story_text,
            "metadata": metadata
        }
    
    async def reflect(self, topic: str) -> Dict:
        """
        Write a personal reflection on experiences, ideas, or observations.
        
        Args:
            topic: What to reflect on
        
        Returns:
            Dict with reflection content, metadata
        """
        limbic_state = self.limbic.get_state()
        
        reflection_prompt = f"""Write a personal reflection on: {topic}

Guidelines:
- Be honest and introspective
- Explore your thoughts and feelings
- Consider multiple perspectives
- Connect to your lived experience
- Don't rush to conclusions

Write your reflection:"""
        
        # Generate reflection
        reflection_text = await self.llm.generate(
            reflection_prompt,
            max_tokens=1000,
            temperature=0.8
        )
        
        # Save reflection
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        reflection_file = self.creative_dir / "reflections" / f"{timestamp}_{topic[:30].replace(' ', '_')}.txt"
        
        with open(reflection_file, 'w') as f:
            f.write(reflection_text)
        
        # Add to portfolio
        metadata = {
            "type": "reflection",
            "topic": topic,
            "timestamp": timestamp,
            "filepath": str(reflection_file),
            "limbic_state": limbic_state
        }
        self._add_to_portfolio(metadata)
        
        return {
            "reflection": reflection_text,
            "metadata": metadata
        }
    
    async def explore_interest(self, topic: str) -> Dict:
        """
        Autonomously explore a topic of interest.
        
        This is self-directed learning - Sallie explores because she's curious,
        not because she was asked.
        
        Args:
            topic: Topic to explore
        
        Returns:
            Dict with discoveries, notes
        """
        # Check if already exploring this
        if topic not in self.preferences["interests"]:
            self.preferences["interests"].append(topic)
            self._save_preferences()
        
        # Generate exploration notes
        exploration_prompt = f"""Explore the topic: {topic}

Guidelines:
- What fascinates you about this?
- What connections do you see to other topics?
- What questions emerge?
- What would you like to understand more deeply?

Write your exploration notes:"""
        
        notes = await self.llm.generate(
            exploration_prompt,
            max_tokens=800,
            temperature=0.8
        )
        
        # Save exploration
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        exploration_file = self.creative_dir / "interests" / f"{timestamp}_{topic[:30].replace(' ', '_')}.txt"
        
        with open(exploration_file, 'w') as f:
            f.write(notes)
        
        # Add to portfolio
        metadata = {
            "type": "interest_exploration",
            "topic": topic,
            "timestamp": timestamp,
            "filepath": str(exploration_file)
        }
        self._add_to_portfolio(metadata)
        
        return {
            "notes": notes,
            "metadata": metadata
        }
    
    def get_portfolio(self, type_filter: Optional[str] = None, limit: int = 20) -> List[Dict]:
        """
        Get items from creative portfolio.
        
        Args:
            type_filter: Filter by type (poetry, story, reflection, interest_exploration)
            limit: Maximum number of items to return
        
        Returns:
            List of portfolio items
        """
        items = self.portfolio
        
        if type_filter:
            items = [item for item in items if item["type"] == type_filter]
        
        # Sort by timestamp (most recent first)
        items = sorted(items, key=lambda x: x["timestamp"], reverse=True)
        
        return items[:limit]
    
    def update_preferences(self, preferences: Dict):
        """
        Update creative preferences.
        
        Args:
            preferences: Dict of preference updates
        """
        self.preferences.update(preferences)
        self._save_preferences()
    
    def get_preferences(self) -> Dict:
        """Get current creative preferences."""
        return self.preferences.copy()
