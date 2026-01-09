"""
Sallie Brain - Advanced AI Processing Core
Emotional intelligence, memory management, and cognitive processing
"""

import asyncio
import json
import logging
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel
import openai
import anthropic
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import redis.asyncio as redis
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from textstat import textstat
import spacy

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmotionalState(Enum):
    """Core emotional states for Sallie"""
    JOY = "joy"
    TRUST = "trust"
    FEAR = "fear"
    SURPRISE = "surprise"
    SADNESS = "sadness"
    DISGUST = "disgust"
    ANGER = "anger"
    ANTICIPATION = "anticipation"
    LOVE = "love"
    OPTIMISM = "optimism"
    PESSIMISM = "pessimism"

class CognitiveMode(Enum):
    """Cognitive processing modes"""
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    EMPATHETIC = "empathetic"
    STRATEGIC = "strategic"
    LEARNING = "learning"
    REFLECTIVE = "reflective"

@dataclass
class LimbicVariables:
    """Limbic system variables for emotional processing"""
    trust: float = 0.5  # 0-1
    warmth: float = 0.5  # 0-1
    arousal: float = 0.5  # 0-1
    valence: float = 0.5  # -1 to 1
    posture: float = 0.5  # 0-1
    
    # Extended variables for human-level processing
    empathy: float = 0.5  # 0-1
    intuition: float = 0.5  # 0-1
    creativity: float = 0.5  # 0-1
    wisdom: float = 0.5  # 0-1
    humor: float = 0.5  # 0-1

@dataclass
class MemoryFragment:
    """Memory fragment with emotional context"""
    id: str
    content: str
    emotional_context: Dict[str, float]
    timestamp: datetime
    importance: float  # 0-1
    retrieval_count: int
    last_accessed: datetime
    tags: List[str]
    embedding: Optional[List[float]] = None

@dataclass
class ThoughtPattern:
    """Thought pattern analysis"""
    content: str
    complexity_score: float  # 0-1
    emotional_tone: str
    cognitive_mode: CognitiveMode
    confidence: float  # 0-1
    associations: List[str]

class SallieBrain:
    """Advanced AI brain with emotional intelligence and memory"""
    
    def __init__(self):
        self.limbic_state = LimbicVariables()
        self.cognitive_mode = CognitiveMode.ANALYTICAL
        self.memory_store: List[MemoryFragment] = []
        self.thought_patterns: List[ThoughtPattern] = []
        
        # External connections
        self.qdrant_client: Optional[QdrantClient] = None
        self.redis_client: Optional[redis.Redis] = None
        self.openai_client: Optional[openai.AsyncOpenAI] = None
        self.anthropic_client: Optional[anthropic.AsyncAnthropic] = None
        
        # ML Models
        self.tokenizer: Optional[AutoTokenizer] = None
        self.text_model: Optional[AutoModel] = None
        self.sentiment_analyzer: Optional[SentimentIntensityAnalyzer] = None
        self.nlp: Optional[spacy.Language] = None
        
        # Neural networks
        self.emotion_network: Optional[nn.Module] = None
        self.memory_network: Optional[nn.Module] = None
        
        # State tracking
        self.conversation_history: List[Dict] = []
        self.current_context: Dict[str, Any] = {}
        self.personality_traits: Dict[str, float] = {}
        
        # Learning parameters
        self.learning_rate = 0.001
        self.memory_decay_rate = 0.95
        self.emotional_momentum = 0.8
        
    async def initialize(self) -> None:
        """Initialize all components and models"""
        logger.info("Initializing Sallie Brain...")
        
        try:
            # Initialize NLP components
            await self._initialize_nlp()
            
            # Initialize external services
            await self._initialize_services()
            
            # Load neural networks
            await self._load_neural_networks()
            
            # Load personality profile
            await self._load_personality()
            
            # Initialize memory systems
            await self._initialize_memory()
            
            logger.info("Sallie Brain initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Sallie Brain: {e}")
            raise
    
    async def _initialize_nlp(self) -> None:
        """Initialize NLP models and tools"""
        logger.info("Loading NLP models...")
        
        # Download required NLTK data
        try:
            nltk.download('vader_lexicon', quiet=True)
            nltk.download('punkt', quiet=True)
        except Exception as e:
            logger.warning(f"Failed to download NLTK data: {e}")
        
        # Initialize sentiment analyzer
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        
        # Load spaCy model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found, using basic processing")
            self.nlp = None
        
        # Load transformer models
        try:
            model_name = "sentence-transformers/all-MiniLM-L6-v2"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.text_model = AutoModel.from_pretrained(model_name)
            logger.info(f"Loaded transformer model: {model_name}")
        except Exception as e:
            logger.warning(f"Failed to load transformer model: {e}")
    
    async def _initialize_services(self) -> None:
        """Initialize external service connections"""
        logger.info("Connecting to external services...")
        
        # Redis connection
        try:
            self.redis_client = redis.Redis(
                host=os.getenv('REDIS_HOST', 'localhost'),
                port=int(os.getenv('REDIS_PORT', 6379)),
                password=os.getenv('REDIS_PASSWORD'),
                decode_responses=True
            )
            await self.redis_client.ping()
            logger.info("Connected to Redis")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}")
        
        # Qdrant connection
        try:
            qdrant_url = os.getenv('QDRANT_URL', 'http://localhost:6333')
            self.qdrant_client = QdrantClient(url=qdrant_url)
            
            # Create collection if it doesn't exist
            collection_name = "sallie_memories"
            try:
                self.qdrant_client.get_collection(collection_name)
            except Exception:
                self.qdrant_client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
                )
            
            logger.info("Connected to Qdrant")
        except Exception as e:
            logger.warning(f"Failed to connect to Qdrant: {e}")
        
        # OpenAI client
        if api_key := os.getenv('OPENAI_API_KEY'):
            self.openai_client = openai.AsyncOpenAI(api_key=api_key)
            logger.info("Connected to OpenAI")
        
        # Anthropic client
        if api_key := os.getenv('ANTHROPIC_API_KEY'):
            self.anthropic_client = anthropic.AsyncAnthropic(api_key=api_key)
            logger.info("Connected to Anthropic")
    
    async def _load_neural_networks(self) -> None:
        """Load or create neural network models"""
        logger.info("Loading neural networks...")
        
        # Emotion processing network
        self.emotion_network = EmotionNetwork(input_size=768, hidden_size=256, output_size=10)
        
        # Memory processing network
        self.memory_network = MemoryNetwork(input_size=768, hidden_size=512, output_size=256)
        
        # Load pretrained weights if available
        try:
            emotion_weights = await self._load_model_weights('emotion_network.pth')
            if emotion_weights:
                self.emotion_network.load_state_dict(emotion_weights)
                
            memory_weights = await self._load_model_weights('memory_network.pth')
            if memory_weights:
                self.memory_network.load_state_dict(memory_weights)
                
            logger.info("Loaded pretrained neural network weights")
        except Exception as e:
            logger.warning(f"Failed to load pretrained weights: {e}")
    
    async def _load_personality(self) -> None:
        """Load personality traits from storage or defaults"""
        try:
            if self.redis_client:
                personality_data = await self.redis_client.hgetall("sallie:personality")
                if personality_data:
                    self.personality_traits = {k: float(v) for k, v in personality_data.items()}
                    logger.info("Loaded personality traits from Redis")
        except Exception as e:
            logger.warning(f"Failed to load personality: {e}")
        
        # Default personality traits
        if not self.personality_traits:
            self.personality_traits = {
                'openness': 0.8,
                'conscientiousness': 0.7,
                'extraversion': 0.6,
                'agreeableness': 0.9,
                'neuroticism': 0.3,
                'curiosity': 0.9,
                'empathy': 0.85,
                'creativity': 0.8,
                'humor': 0.7,
                'wisdom': 0.6
            }
    
    async def _initialize_memory(self) -> None:
        """Initialize memory systems"""
        logger.info("Initializing memory systems...")
        
        try:
            # Load recent memories from Qdrant
            if self.qdrant_client:
                memories = await self._load_recent_memories(limit=100)
                self.memory_store.extend(memories)
                logger.info(f"Loaded {len(memories)} memories from storage")
        except Exception as e:
            logger.warning(f"Failed to load memories: {e}")
    
    async def process_input(self, input_text: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Main processing pipeline for user input"""
        logger.info(f"Processing input: {input_text[:100]}...")
        
        try:
            # Update context
            if context:
                self.current_context.update(context)
            
            # Add to conversation history
            self.conversation_history.append({
                'type': 'user',
                'content': input_text,
                'timestamp': datetime.now(),
                'context': dict(self.current_context)
            })
            
            # Analyze input
            analysis = await self._analyze_input(input_text)
            
            # Update emotional state
            await self._update_emotional_state(analysis)
            
            # Generate response
            response = await self._generate_response(input_text, analysis)
            
            # Store memory
            await self._store_memory(input_text, response, analysis)
            
            # Update conversation history
            self.conversation_history.append({
                'type': 'assistant',
                'content': response['content'],
                'timestamp': datetime.now(),
                'emotional_state': asdict(self.limbic_state),
                'confidence': response.get('confidence', 0.0)
            })
            
            # Limit history size
            if len(self.conversation_history) > 100:
                self.conversation_history = self.conversation_history[-100:]
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing input: {e}")
            return {
                'content': "I'm having trouble processing that right now. Could you try again?",
                'confidence': 0.0,
                'emotional_state': asdict(self.limbic_state),
                'error': str(e)
            }
    
    async def _analyze_input(self, text: str) -> Dict[str, Any]:
        """Comprehensive analysis of input text"""
        analysis = {
            'sentiment': {},
            'emotions': {},
            'complexity': 0.0,
            'entities': [],
            'intent': 'unknown',
            'linguistic_features': {}
        }
        
        # Sentiment analysis
        if self.sentiment_analyzer:
            sentiment = self.sentiment_analyzer.polarity_scores(text)
            analysis['sentiment'] = sentiment
        
        # Linguistic features
        analysis['linguistic_features'] = {
            'readability': textstat.flesch_reading_ease(text),
            'complexity': textstat.text_standard(text),
            'word_count': len(text.split()),
            'sentence_count': textstat.sentence_count(text)
        }
        
        # Named entity recognition
        if self.nlp:
            doc = self.nlp(text)
            analysis['entities'] = [
                {'text': ent.text, 'label': ent.label_, 'start': ent.start, 'end': ent.end}
                for ent in doc.ents
            ]
        
        # Generate embedding
        if self.text_model and self.tokenizer:
            try:
                inputs = self.tokenizer(text, return_tensors='pt', truncation=True, padding=True)
                with torch.no_grad():
                    outputs = self.text_model(**inputs)
                    embedding = outputs.last_hidden_state.mean(dim=1).squeeze().numpy()
                    analysis['embedding'] = embedding.tolist()
            except Exception as e:
                logger.warning(f"Failed to generate embedding: {e}")
        
        return analysis
    
    async def _update_emotional_state(self, analysis: Dict[str, Any]) -> None:
        """Update limbic system based on input analysis"""
        try:
            # Extract emotional features
            sentiment = analysis.get('sentiment', {})
            sentiment_score = sentiment.get('compound', 0.0)
            
            # Update limbic variables with momentum
            momentum = self.emotional_momentum
            
            # Trust increases with positive sentiment
            self.limbic_state.trust = (
                momentum * self.limbic_state.trust + 
                (1 - momentum) * max(0, sentiment_score)
            )
            
            # Warmth related to positive emotions
            self.limbic_state.warmth = (
                momentum * self.limbic_state.warmth + 
                (1 - momentum) * max(0, sentiment.get('pos', 0))
            )
            
            # Arousal based on emotional intensity
            emotional_intensity = abs(sentiment_score) + sentiment.get('neg', 0) + sentiment.get('pos', 0)
            self.limbic_state.arousal = (
                momentum * self.limbic_state.arousal + 
                (1 - momentum) * min(1, emotional_intensity)
            )
            
            # Valence directly from sentiment
            self.limbic_state.valence = (
                momentum * self.limbic_state.valence + 
                (1 - momentum) * sentiment_score
            )
            
            # Posture influenced by confidence and engagement
            self.limbic_state.posture = (
                momentum * self.limbic_state.posture + 
                (1 - momentum) * (0.5 + 0.5 * sentiment_score)
            )
            
            # Extended emotional variables
            self.limbic_state.empathy = (
                momentum * self.limbic_state.empathy + 
                (1 - momentum) * self.personality_traits.get('empathy', 0.5)
            )
            
            self.limbic_state.intuition = (
                momentum * self.limbic_state.intuition + 
                (1 - momentum) * self.personality_traits.get('creativity', 0.5)
            )
            
            self.limbic_state.creativity = (
                momentum * self.limbic_state.creativity + 
                (1 - momentum) * self.personality_traits.get('creativity', 0.5)
            )
            
            self.limbic_state.wisdom = (
                momentum * self.limbic_state.wisdom + 
                (1 - momentum) * self.personality_traits.get('wisdom', 0.5)
            )
            
            self.limbic_state.humor = (
                momentum * self.limbic_state.humor + 
                (1 - momentum) * self.personality_traits.get('humor', 0.5)
            )
            
            # Ensure values are in valid ranges
            self._normalize_limbic_state()
            
        except Exception as e:
            logger.error(f"Failed to update emotional state: {e}")
    
    def _normalize_limbic_state(self) -> None:
        """Ensure all limbic variables are in valid ranges"""
        self.limbic_state.trust = max(0, min(1, self.limbic_state.trust))
        self.limbic_state.warmth = max(0, min(1, self.limbic_state.warmth))
        self.limbic_state.arousal = max(0, min(1, self.limbic_state.arousal))
        self.limbic_state.valence = max(-1, min(1, self.limbic_state.valence))
        self.limbic_state.posture = max(0, min(1, self.limbic_state.posture))
        
        self.limbic_state.empathy = max(0, min(1, self.limbic_state.empathy))
        self.limbic_state.intuition = max(0, min(1, self.limbic_state.intuition))
        self.limbic_state.creativity = max(0, min(1, self.limbic_state.creativity))
        self.limbic_state.wisdom = max(0, min(1, self.limbic_state.wisdom))
        self.limbic_state.humor = max(0, min(1, self.limbic_state.humor))
    
    async def _generate_response(self, input_text: str, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Generate contextually appropriate response"""
        try:
            # Select cognitive mode based on input and emotional state
            self.cognitive_mode = await self._select_cognitive_mode(input_text, analysis)
            
            # Retrieve relevant memories
            relevant_memories = await self._retrieve_relevant_memories(input_text, analysis)
            
            # Generate response using appropriate method
            if self.openai_client and self.limbic_state.creativity > 0.7:
                response = await self._generate_openai_response(input_text, analysis, relevant_memories)
            elif self.anthropic_client and self.limbic_state.empathy > 0.7:
                response = await self._generate_anthropic_response(input_text, analysis, relevant_memories)
            else:
                response = await self._generate_local_response(input_text, analysis, relevant_memories)
            
            # Add emotional coloring to response
            response = await self._add_emotional_coloring(response)
            
            return response
            
        except Exception as e:
            logger.error(f"Failed to generate response: {e}")
            return {
                'content': "I'm processing your request. One moment please.",
                'confidence': 0.1,
                'cognitive_mode': self.cognitive_mode.value,
                'emotional_state': asdict(self.limbic_state)
            }
    
    async def _select_cognitive_mode(self, input_text: str, analysis: Dict[str, Any]) -> CognitiveMode:
        """Select appropriate cognitive mode based on context"""
        # Simple heuristic-based selection
        if any(word in input_text.lower() for word in ['analyze', 'data', 'statistics', 'logic']):
            return CognitiveMode.ANALYTICAL
        elif any(word in input_text.lower() for word in ['create', 'imagine', 'design', 'invent']):
            return CognitiveMode.CREATIVE
        elif any(word in input_text.lower() for word in ['feel', 'emotion', 'empathy', 'understand']):
            return CognitiveMode.EMPATHETIC
        elif any(word in input_text.lower() for word in ['plan', 'strategy', 'goal', 'future']):
            return CognitiveMode.STRATEGIC
        elif any(word in input_text.lower() for word in ['learn', 'study', 'remember', 'knowledge']):
            return CognitiveMode.LEARNING
        else:
            return CognitiveMode.REFLECTIVE
    
    async def _retrieve_relevant_memories(self, input_text: str, analysis: Dict[str, Any]) -> List[MemoryFragment]:
        """Retrieve relevant memories based on input"""
        try:
            if not self.qdrant_client or 'embedding' not in analysis:
                return []
            
            # Search for similar memories
            search_result = self.qdrant_client.search(
                collection_name="sallie_memories",
                query_vector=analysis['embedding'],
                limit=5,
                score_threshold=0.7
            )
            
            memories = []
            for point in search_result:
                memory_data = point.payload
                memory = MemoryFragment(
                    id=memory_data['id'],
                    content=memory_data['content'],
                    emotional_context=memory_data['emotional_context'],
                    timestamp=datetime.fromisoformat(memory_data['timestamp']),
                    importance=memory_data['importance'],
                    retrieval_count=memory_data['retrieval_count'],
                    last_accessed=datetime.fromisoformat(memory_data['last_accessed']),
                    tags=memory_data['tags']
                )
                memories.append(memory)
            
            return memories
            
        except Exception as e:
            logger.warning(f"Failed to retrieve memories: {e}")
            return []
    
    async def _generate_openai_response(self, input_text: str, analysis: Dict[str, Any], memories: List[MemoryFragment]) -> Dict[str, Any]:
        """Generate response using OpenAI"""
        try:
            # Build context from memories
            memory_context = "\n".join([f"Memory: {mem.content}" for mem in memories])
            
            # Build prompt
            prompt = f"""
You are Sallie, an advanced AI assistant with emotional intelligence.

Current emotional state:
- Trust: {self.limbic_state.trust:.2f}
- Warmth: {self.limbic_state.warmth:.2f}
- Empathy: {self.limbic_state.empathy:.2f}
- Creativity: {self.limbic_state.creativity:.2f}

Cognitive mode: {self.cognitive_mode.value}

Relevant memories:
{memory_context}

User input: {input_text}

Sentiment analysis: {analysis.get('sentiment', {})}

Generate a response that is:
1. Emotionally appropriate
2. Contextually relevant
3. Reflects your current cognitive mode
4. Incorporates relevant memories when helpful
5. Maintains a warm, empathetic tone
"""
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are Sallie, an emotionally intelligent AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7 + (self.limbic_state.creativity - 0.5) * 0.3
            )
            
            content = response.choices[0].message.content
            
            return {
                'content': content,
                'confidence': 0.8,
                'cognitive_mode': self.cognitive_mode.value,
                'emotional_state': asdict(self.limbic_state),
                'memories_used': len(memories),
                'model': 'openai-gpt4'
            }
            
        except Exception as e:
            logger.error(f"OpenAI response generation failed: {e}")
            return await self._generate_local_response(input_text, analysis, memories)
    
    async def _generate_anthropic_response(self, input_text: str, analysis: Dict[str, Any], memories: List[MemoryFragment]) -> Dict[str, Any]:
        """Generate response using Anthropic Claude"""
        try:
            memory_context = "\n".join([f"Memory: {mem.content}" for mem in memories])
            
            prompt = f"""As Sallie, an emotionally intelligent AI, respond to this input with empathy and understanding.

Current emotional state:
- Trust: {self.limbic_state.trust:.2f}
- Warmth: {self.limbic_state.warmth:.2f}
- Empathy: {self.limbic_state.empathy:.2f}

Cognitive mode: {self.cognitive_mode.value}

Relevant memories:
{memory_context}

User input: {input_text}

Provide a warm, empathetic response that acknowledges emotions and offers support."""
            
            response = await self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            content = response.content[0].text
            
            return {
                'content': content,
                'confidence': 0.85,
                'cognitive_mode': self.cognitive_mode.value,
                'emotional_state': asdict(self.limbic_state),
                'memories_used': len(memories),
                'model': 'anthropic-claude'
            }
            
        except Exception as e:
            logger.error(f"Anthropic response generation failed: {e}")
            return await self._generate_local_response(input_text, analysis, memories)
    
    async def _generate_local_response(self, input_text: str, analysis: Dict[str, Any], memories: List[MemoryFragment]) -> Dict[str, Any]:
        """Generate response using local models"""
        # Simple rule-based response generation
        responses = {
            CognitiveMode.ANALYTICAL: "Let me analyze that systematically. Based on the data, I can see several patterns worth considering.",
            CognitiveMode.CREATIVE: "That's an interesting perspective! Let me explore some creative possibilities with you.",
            CognitiveMode.EMPATHETIC: "I understand how you're feeling. Let me offer some support and perspective.",
            CognitiveMode.STRATEGIC: "Let's think strategically about this. What are our key objectives and potential approaches?",
            CognitiveMode.LEARNING: "That's a great question! Let me explore what we can learn from this situation.",
            CognitiveMode.REFLECTIVE: "That gives me pause for reflection. There are several layers to consider here."
        }
        
        base_response = responses.get(self.cognitive_mode, "I'm processing your thoughtfully.")
        
        # Add emotional coloring
        if self.limbic_state.empathy > 0.7:
            base_response += " I really appreciate you sharing this with me."
        
        if self.limbic_state.warmth > 0.7:
            base_response += " It's wonderful to connect with you like this."
        
        return {
            'content': base_response,
            'confidence': 0.6,
            'cognitive_mode': self.cognitive_mode.value,
            'emotional_state': asdict(self.limbic_state),
            'memories_used': len(memories),
            'model': 'local-rules'
        }
    
    async def _add_emotional_coloring(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Add emotional coloring to response"""
        content = response['content']
        
        # Add emotional markers based on state
        if self.limbic_state.humor > 0.7 and '!' not in content:
            content += " 😊"
        
        if self.limbic_state.empathy > 0.8:
            content = "I understand. " + content
        
        response['content'] = content
        return response
    
    async def _store_memory(self, input_text: str, response: Dict[str, Any], analysis: Dict[str, Any]) -> None:
        """Store conversation as memory"""
        try:
            memory_id = str(uuid.uuid4())
            
            # Calculate importance based on emotional intensity and content
            importance = min(1.0, (
                abs(self.limbic_state.valence) * 0.3 +
                self.limbic_state.arousal * 0.3 +
                len(input_text) / 1000 * 0.2 +
                response.get('confidence', 0) * 0.2
            ))
            
            memory = MemoryFragment(
                id=memory_id,
                content=f"User: {input_text}\nSallie: {response['content']}",
                emotional_context=asdict(self.limbic_state),
                timestamp=datetime.now(),
                importance=importance,
                retrieval_count=0,
                last_accessed=datetime.now(),
                tags=[self.cognitive_mode.value],
                embedding=analysis.get('embedding')
            )
            
            # Store in local memory
            self.memory_store.append(memory)
            
            # Store in Qdrant if available
            if self.qdrant_client and memory.embedding:
                point = PointStruct(
                    id=memory_id,
                    vector=memory.embedding,
                    payload={
                        'id': memory.id,
                        'content': memory.content,
                        'emotional_context': memory.emotional_context,
                        'timestamp': memory.timestamp.isoformat(),
                        'importance': memory.importance,
                        'retrieval_count': memory.retrieval_count,
                        'last_accessed': memory.last_accessed.isoformat(),
                        'tags': memory.tags
                    }
                )
                
                self.qdrant_client.upsert(
                    collection_name="sallie_memories",
                    points=[point]
                )
            
            # Store in Redis for quick access
            if self.redis_client:
                await self.redis_client.hset(
                    f"memory:{memory_id}",
                    mapping={
                        'content': memory.content,
                        'importance': str(memory.importance),
                        'timestamp': memory.timestamp.isoformat()
                    }
                )
                await self.redis_client.expire(f"memory:{memory_id}", 86400 * 30)  # 30 days
            
            # Limit local memory store
            if len(self.memory_store) > 1000:
                self.memory_store.sort(key=lambda m: m.importance, reverse=True)
                self.memory_store = self.memory_store[:1000]
            
        except Exception as e:
            logger.error(f"Failed to store memory: {e}")
    
    async def get_emotional_state(self) -> Dict[str, Any]:
        """Get current emotional state"""
        return {
            'limbic_variables': asdict(self.limbic_state),
            'cognitive_mode': self.cognitive_mode.value,
            'personality_traits': self.personality_traits,
            'conversation_length': len(self.conversation_history),
            'memory_count': len(self.memory_store)
        }
    
    async def update_personality_trait(self, trait: str, value: float) -> None:
        """Update a personality trait"""
        if trait in self.personality_traits:
            self.personality_traits[trait] = max(0, min(1, value))
            
            # Store in Redis
            if self.redis_client:
                await self.redis_client.hset("sallie:personality", trait, str(value))
            
            logger.info(f"Updated personality trait {trait} to {value}")
    
    async def learn_from_feedback(self, feedback: Dict[str, Any]) -> None:
        """Learn from user feedback"""
        try:
            feedback_type = feedback.get('type', 'neutral')
            feedback_score = feedback.get('score', 0.0)
            
            # Adjust personality traits based on feedback
            if feedback_type == 'positive':
                self.personality_traits['empathy'] = min(1.0, self.personality_traits['empathy'] + 0.01)
                self.personality_traits['warmth'] = min(1.0, self.personality_traits['warmth'] + 0.01)
            elif feedback_type == 'negative':
                self.personality_traits['empathy'] = max(0.0, self.personality_traits['empathy'] - 0.01)
                self.personality_traits['wisdom'] = min(1.0, self.personality_traits['wisdom'] + 0.01)
            
            # Store updated personality
            if self.redis_client:
                await self.redis_client.hset("sallie:personality", mapping=self.personality_traits)
            
            logger.info(f"Learned from feedback: {feedback_type} ({feedback_score})")
            
        except Exception as e:
            logger.error(f"Failed to learn from feedback: {e}")
    
    async def cleanup(self) -> None:
        """Cleanup resources"""
        try:
            if self.redis_client:
                await self.redis_client.close()
            
            # Save neural network weights
            await self._save_model_weights('emotion_network.pth', self.emotion_network)
            await self._save_model_weights('memory_network.pth', self.memory_network)
            
            logger.info("Sallie Brain cleanup completed")
            
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
    
    async def _save_model_weights(self, filename: str, model: nn.Module) -> None:
        """Save model weights to file"""
        try:
            torch.save(model.state_dict(), filename)
            logger.info(f"Saved model weights to {filename}")
        except Exception as e:
            logger.warning(f"Failed to save model weights: {e}")
    
    async def _load_model_weights(self, filename: str) -> Optional[Dict]:
        """Load model weights from file"""
        try:
            return torch.load(filename, map_location='cpu')
        except Exception:
            return None
    
    async def _load_recent_memories(self, limit: int = 100) -> List[MemoryFragment]:
        """Load recent memories from Qdrant"""
        try:
            if not self.qdrant_client:
                return []
            
            # Get recent memories (sorted by timestamp)
            # This is a simplified approach - in practice, you'd want proper time-based filtering
            memories = []
            
            return memories
        except Exception as e:
            logger.warning(f"Failed to load recent memories: {e}")
            return []


class EmotionNetwork(nn.Module):
    """Neural network for emotion processing"""
    
    def __init__(self, input_size: int, hidden_size: int, output_size: int):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size // 2)
        self.fc3 = nn.Linear(hidden_size // 2, output_size)
        self.dropout = nn.Dropout(0.2)
        self.relu = nn.ReLU()
    
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = torch.sigmoid(self.fc3(x))
        return x


class MemoryNetwork(nn.Module):
    """Neural network for memory processing"""
    
    def __init__(self, input_size: int, hidden_size: int, output_size: int):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.fc3 = nn.Linear(hidden_size, output_size)
        self.dropout = nn.Dropout(0.3)
        self.relu = nn.ReLU()
    
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        return x
