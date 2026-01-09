from typing import List, Dict, Any, Optional
import openai
import anthropic
from transformers import pipeline, AutoTokenizer, AutoModel
import torch
import numpy as np
from datetime import datetime
import uuid
from sqlalchemy.orm import Session

from ..core.config import settings
from ..models.conversation import Conversation, Message, ModelUsage
from ..schemas.conversation import (
    ChatRequest, ChatResponse, CompletionRequest, CompletionResponse,
    EmbeddingRequest, EmbeddingResponse, SentimentRequest, SentimentResponse,
    EntityRequest, EntityResponse, SummaryRequest, SummaryResponse,
    TranslationRequest, TranslationResponse
)

class AIService:
    def __init__(self):
        self._setup_openai()
        self._setup_anthropic()
        self._setup_local_models()
    
    def _setup_openai(self):
        """Setup OpenAI client"""
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
    
    def _setup_anthropic(self):
        """Setup Anthropic client"""
        if settings.ANTHROPIC_API_KEY:
            self.anthropic_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    def _setup_local_models(self):
        """Setup local ML models"""
        self.local_models = {}
        try:
            # Sentiment analysis
            self.local_models['sentiment'] = pipeline(
                "sentiment-analysis",
                model="cardiffnlp/twitter-roberta-base-sentiment-latest"
            )
            
            # Named entity recognition
            self.local_models['ner'] = pipeline(
                "ner",
                model="dbmdz/bert-large-cased-finetuned-conll03-english",
                aggregation_strategy="simple"
            )
            
            # Summarization
            self.local_models['summarization'] = pipeline(
                "summarization",
                model="facebook/bart-large-cnn"
            )
            
            # Translation (example for English to German)
            self.local_models['translation'] = pipeline(
                "translation_en_to_de",
                model="Helsinki-NLP/opus-mt-en-de"
            )
            
        except Exception as e:
            print(f"Warning: Failed to load local models: {e}")
    
    async def chat(self, request: ChatRequest, user_id: str, db: Session) -> ChatResponse:
        """Handle chat completion"""
        start_time = datetime.utcnow()
        
        try:
            # Get or create conversation
            if request.conversation_id:
                conversation = db.query(Conversation).filter(
                    Conversation.id == request.conversation_id,
                    Conversation.user_id == user_id
                ).first()
                if not conversation:
                    raise ValueError("Conversation not found")
            else:
                conversation = Conversation(
                    user_id=user_id,
                    title=request.message[:50] + "..." if len(request.message) > 50 else request.message,
                    model=request.model or settings.DEFAULT_CHAT_MODEL,
                    temperature=request.temperature or settings.TEMPERATURE,
                    max_tokens=request.max_tokens or settings.MAX_TOKENS
                )
                db.add(conversation)
                db.commit()
                db.refresh(conversation)
            
            # Add user message
            user_message = Message(
                conversation_id=conversation.id,
                role="user",
                content=request.message
            )
            db.add(user_message)
            
            # Get conversation history
            messages = db.query(Message).filter(
                Message.conversation_id == conversation.id
            ).order_by(Message.created_at).all()
            
            # Format messages for API
            api_messages = [
                {"role": msg.role, "content": msg.content}
                for msg in messages
            ]
            
            # Call AI model
            response = await self._call_chat_model(
                messages=api_messages,
                model=conversation.model,
                temperature=conversation.temperature,
                max_tokens=conversation.max_tokens
            )
            
            # Add assistant message
            assistant_message = Message(
                conversation_id=conversation.id,
                role="assistant",
                content=response["content"],
                model=conversation.model,
                tokens_used=response["usage"]["total_tokens"],
                cost=self._calculate_cost(conversation.model, response["usage"])
            )
            db.add(assistant_message)
            
            # Update conversation
            conversation.updated_at = datetime.utcnow()
            
            # Record usage
            usage = ModelUsage(
                user_id=user_id,
                model=conversation.model,
                request_type="chat",
                tokens_used=response["usage"]["total_tokens"],
                cost=assistant_message.cost,
                response_time=(datetime.utcnow() - start_time).total_seconds(),
                status="success"
            )
            db.add(usage)
            
            db.commit()
            
            return ChatResponse(
                id=assistant_message.id,
                conversation_id=conversation.id,
                message=response["content"],
                model=conversation.model,
                usage=response["usage"],
                metadata={
                    "processing_time": (datetime.utcnow() - start_time).total_seconds()
                },
                created_at=assistant_message.created_at
            )
            
        except Exception as e:
            # Record error usage
            if 'conversation' in locals():
                usage = ModelUsage(
                    user_id=user_id,
                    model=request.model or settings.DEFAULT_CHAT_MODEL,
                    request_type="chat",
                    tokens_used=0,
                    cost=0.0,
                    response_time=(datetime.utcnow() - start_time).total_seconds(),
                    status="error",
                    error_message=str(e)
                )
                db.add(usage)
                db.commit()
            
            raise e
    
    async def complete(self, request: CompletionRequest, user_id: str, db: Session) -> CompletionResponse:
        """Handle text completion"""
        start_time = datetime.utcnow()
        
        try:
            model = request.model or settings.DEFAULT_CHAT_MODEL
            
            response = await self._call_completion_model(
                prompt=request.prompt,
                model=model,
                temperature=request.temperature,
                max_tokens=request.max_tokens,
                stop=request.stop
            )
            
            # Record usage
            usage = ModelUsage(
                user_id=user_id,
                model=model,
                request_type="completion",
                tokens_used=response["usage"]["total_tokens"],
                cost=self._calculate_cost(model, response["usage"]),
                response_time=(datetime.utcnow() - start_time).total_seconds(),
                status="success"
            )
            db.add(usage)
            db.commit()
            
            return CompletionResponse(
                id=uuid.uuid4(),
                text=response["content"],
                model=model,
                usage=response["usage"],
                metadata={
                    "processing_time": (datetime.utcnow() - start_time).total_seconds()
                },
                created_at=datetime.utcnow()
            )
            
        except Exception as e:
            # Record error usage
            usage = ModelUsage(
                user_id=user_id,
                model=request.model or settings.DEFAULT_CHAT_MODEL,
                request_type="completion",
                tokens_used=0,
                cost=0.0,
                response_time=(datetime.utcnow() - start_time).total_seconds(),
                status="error",
                error_message=str(e)
            )
            db.add(usage)
            db.commit()
            
            raise e
    
    async def embed(self, request: EmbeddingRequest, user_id: str, db: Session) -> EmbeddingResponse:
        """Handle text embedding"""
        start_time = datetime.utcnow()
        
        try:
            model = request.model or settings.DEFAULT_EMBEDDING_MODEL
            
            response = await self._call_embedding_model(
                text=request.text,
                model=model
            )
            
            # Record usage
            usage = ModelUsage(
                user_id=user_id,
                model=model,
                request_type="embedding",
                tokens_used=response["usage"]["total_tokens"],
                cost=self._calculate_cost(model, response["usage"]),
                response_time=(datetime.utcnow() - start_time).total_seconds(),
                status="success"
            )
            db.add(usage)
            db.commit()
            
            return EmbeddingResponse(
                id=uuid.uuid4(),
                text=request.text,
                model=model,
                dimensions=len(response["embedding"]),
                embedding=response["embedding"],
                usage=response["usage"],
                metadata={
                    "processing_time": (datetime.utcnow() - start_time).total_seconds()
                },
                created_at=datetime.utcnow()
            )
            
        except Exception as e:
            # Record error usage
            usage = ModelUsage(
                user_id=user_id,
                model=request.model or settings.DEFAULT_EMBEDDING_MODEL,
                request_type="embedding",
                tokens_used=0,
                cost=0.0,
                response_time=(datetime.utcnow() - start_time).total_seconds(),
                status="error",
                error_message=str(e)
            )
            db.add(usage)
            db.commit()
            
            raise e
    
    async def analyze_sentiment(self, request: SentimentRequest, user_id: str, db: Session) -> SentimentResponse:
        """Handle sentiment analysis"""
        start_time = datetime.utcnow()
        
        try:
            # Use local model for sentiment analysis
            if 'sentiment' in self.local_models:
                result = self.local_models['sentiment'](request.text)[0]
                
                # Map labels to standard format
                label_map = {
                    'LABEL_0': 'negative',
                    'LABEL_1': 'neutral', 
                    'LABEL_2': 'positive'
                }
                
                sentiment = label_map.get(result['label'], 'neutral')
                confidence = result['score']
                
                scores = {
                    'negative': result['score'] if result['label'] == 'LABEL_0' else 0.0,
                    'neutral': result['score'] if result['label'] == 'LABEL_1' else 0.0,
                    'positive': result['score'] if result['label'] == 'LABEL_2' else 0.0,
                }
                
            else:
                # Fallback to OpenAI
                response = await self._call_sentiment_model(request.text)
                sentiment = response['sentiment']
                confidence = response['confidence']
                scores = response['scores']
            
            # Record usage
            usage = ModelUsage(
                user_id=user_id,
                model="local/sentiment",
                request_type="sentiment",
                tokens_used=0,
                cost=0.0,
                response_time=(datetime.utcnow() - start_time).total_seconds(),
                status="success"
            )
            db.add(usage)
            db.commit()
            
            return SentimentResponse(
                id=uuid.uuid4(),
                text=request.text,
                sentiment=sentiment,
                confidence=confidence,
                scores=scores,
                metadata={
                    "processing_time": (datetime.utcnow() - start_time).total_seconds()
                },
                created_at=datetime.utcnow()
            )
            
        except Exception as e:
            raise e
    
    async def extract_entities(self, request: EntityRequest, user_id: str, db: Session) -> EntityResponse:
        """Handle entity extraction"""
        start_time = datetime.utcnow()
        
        try:
            # Use local model for NER
            if 'ner' in self.local_models:
                results = self.local_models['ner'](request.text)
                
                entities = []
                for entity in results:
                    entities.append({
                        'text': entity['word'],
                        'label': entity['entity_group'],
                        'confidence': entity['score'],
                        'start': entity.get('start', 0),
                        'end': entity.get('end', len(entity['word']))
                    })
            else:
                # Fallback to OpenAI
                response = await self._call_entity_model(request.text)
                entities = response['entities']
            
            # Record usage
            usage = ModelUsage(
                user_id=user_id,
                model="local/ner",
                request_type="entity",
                tokens_used=0,
                cost=0.0,
                response_time=(datetime.utcnow() - start_time).total_seconds(),
                status="success"
            )
            db.add(usage)
            db.commit()
            
            return EntityResponse(
                id=uuid.uuid4(),
                text=request.text,
                entities=entities,
                metadata={
                    "processing_time": (datetime.utcnow() - start_time).total_seconds()
                },
                created_at=datetime.utcnow()
            )
            
        except Exception as e:
            raise e
    
    async def summarize(self, request: SummaryRequest, user_id: str, db: Session) -> SummaryResponse:
        """Handle text summarization"""
        start_time = datetime.utcnow()
        
        try:
            # Use local model for summarization
            if 'summarization' in self.local_models:
                result = self.local_models['summarization'](
                    request.text,
                    max_length=request.max_length or 200,
                    do_sample=False
                )[0]
                
                summary = result['summary_text']
            else:
                # Fallback to OpenAI
                response = await self._call_summary_model(request)
                summary = response['summary']
            
            # Record usage
            usage = ModelUsage(
                user_id=user_id,
                model="local/summarization",
                request_type="summary",
                tokens_used=0,
                cost=0.0,
                response_time=(datetime.utcnow() - start_time).total_seconds(),
                status="success"
            )
            db.add(usage)
            db.commit()
            
            return SummaryResponse(
                id=uuid.uuid4(),
                original_text=request.text[:200] + "..." if len(request.text) > 200 else request.text,
                summary=summary,
                model="local/summarization",
                stats={
                    "original_length": len(request.text),
                    "summary_length": len(summary),
                    "compression_ratio": len(summary) / len(request.text)
                },
                usage={"tokens": 0},
                metadata={
                    "processing_time": (datetime.utcnow() - start_time).total_seconds()
                },
                created_at=datetime.utcnow()
            )
            
        except Exception as e:
            raise e
    
    async def translate(self, request: TranslationRequest, user_id: str, db: Session) -> TranslationResponse:
        """Handle text translation"""
        start_time = datetime.utcnow()
        
        try:
            # Use local model for translation (if available for the language pair)
            translation_key = f"translation_{request.source_language}_to_{request.target_language}"
            
            if translation_key in self.local_models:
                result = self.local_models[translation_key](request.text)[0]
                translated_text = result['translation_text']
                confidence = 0.9  # Placeholder
            else:
                # Fallback to OpenAI
                response = await self._call_translation_model(request)
                translated_text = response['translated_text']
                confidence = response.get('confidence', 0.9)
            
            # Record usage
            usage = ModelUsage(
                user_id=user_id,
                model="local/translation",
                request_type="translation",
                tokens_used=0,
                cost=0.0,
                response_time=(datetime.utcnow() - start_time).total_seconds(),
                status="success"
            )
            db.add(usage)
            db.commit()
            
            return TranslationResponse(
                id=uuid.uuid4(),
                original_text=request.text,
                translated_text=translated_text,
                source_language=request.source_language,
                target_language=request.target_language,
                model="local/translation",
                confidence=confidence,
                usage={"tokens": 0},
                metadata={
                    "processing_time": (datetime.utcnow() - start_time).total_seconds()
                },
                created_at=datetime.utcnow()
            )
            
        except Exception as e:
            raise e
    
    async def _call_chat_model(self, messages: List[Dict], model: str, temperature: float, max_tokens: int) -> Dict:
        """Call chat model (OpenAI or Anthropic)"""
        if model.startswith("gpt"):
            response = openai.ChatCompletion.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            return {
                "content": response.choices[0].message.content,
                "usage": response.usage.dict()
            }
        elif model.startswith("claude"):
            # Convert messages to Claude format
            claude_messages = []
            system_message = None
            
            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                elif msg["role"] == "user":
                    claude_messages.append({"role": "user", "content": msg["content"]})
                elif msg["role"] == "assistant":
                    claude_messages.append({"role": "assistant", "content": msg["content"]})
            
            response = self.anthropic_client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_message,
                messages=claude_messages
            )
            
            return {
                "content": response.content[0].text,
                "usage": {
                    "prompt_tokens": response.usage.input_tokens,
                    "completion_tokens": response.usage.output_tokens,
                    "total_tokens": response.usage.input_tokens + response.usage.output_tokens
                }
            }
        else:
            raise ValueError(f"Unsupported model: {model}")
    
    async def _call_completion_model(self, prompt: str, model: str, temperature: float, max_tokens: int, stop: List[str]) -> Dict:
        """Call completion model"""
        response = openai.Completion.create(
            model=model,
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            stop=stop
        )
        
        return {
            "content": response.choices[0].text,
            "usage": response.usage.dict()
        }
    
    async def _call_embedding_model(self, text: str, model: str) -> Dict:
        """Call embedding model"""
        response = openai.Embedding.create(
            model=model,
            input=text
        )
        
        return {
            "embedding": response["data"][0]["embedding"],
            "usage": response["usage"].dict()
        }
    
    async def _call_sentiment_model(self, text: str) -> Dict:
        """Call sentiment analysis model (OpenAI fallback)"""
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Analyze the sentiment of the following text. Respond with JSON: {\"sentiment\": \"positive/negative/neutral\", \"confidence\": 0.0-1.0, \"scores\": {\"positive\": 0.0, \"negative\": 0.0, \"neutral\": 0.0}}"},
                {"role": "user", "content": text}
            ],
            temperature=0
        )
        
        import json
        return json.loads(response.choices[0].message.content)
    
    async def _call_entity_model(self, text: str) -> Dict:
        """Call entity extraction model (OpenAI fallback)"""
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Extract entities from the following text. Respond with JSON: {\"entities\": [{\"text\": \"entity\", \"label\": \"PERSON/LOCATION/ORG\", \"confidence\": 0.0-1.0, \"start\": 0, \"end\": 0}]}"},
                {"role": "user", "content": text}
            ],
            temperature=0
        )
        
        import json
        return json.loads(response.choices[0].message.content)
    
    async def _call_summary_model(self, request: SummaryRequest) -> Dict:
        """Call summarization model (OpenAI fallback)"""
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"Summarize the following text in a {request.style} manner. Maximum length: {request.max_length} characters."},
                {"role": "user", "content": request.text}
            ],
            temperature=0.3
        )
        
        return {
            "summary": response.choices[0].message.content
        }
    
    async def _call_translation_model(self, request: TranslationRequest) -> Dict:
        """Call translation model (OpenAI fallback)"""
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": f"Translate the following text from {request.source_language} to {request.target_language}. Only return the translation."},
                {"role": "user", "content": request.text}
            ],
            temperature=0.1
        )
        
        return {
            "translated_text": response.choices[0].message.content,
            "confidence": 0.9
        }
    
    def _calculate_cost(self, model: str, usage: Dict) -> float:
        """Calculate cost based on model and usage"""
        # Simplified cost calculation - in production, use actual pricing
        pricing = {
            "gpt-3.5-turbo": {"input": 0.0015, "output": 0.002},
            "gpt-4": {"input": 0.03, "output": 0.06},
            "text-embedding-ada-002": {"input": 0.0001, "output": 0.0},
        }
        
        if model in pricing:
            input_cost = usage["prompt_tokens"] * pricing[model]["input"] / 1000
            output_cost = usage["completion_tokens"] * pricing[model]["output"] / 1000
            return input_cost + output_cost
        
        return 0.0

# Global AI service instance
ai_service = AIService()
