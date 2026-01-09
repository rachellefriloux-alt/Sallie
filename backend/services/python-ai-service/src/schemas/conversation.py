from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class MessageBase(BaseModel):
    role: str = Field(..., description="Message role: 'user', 'assistant', or 'system'")
    content: str = Field(..., description="Message content")

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: UUID
    conversation_id: UUID
    model: Optional[str] = None
    tokens_used: Optional[int] = None
    cost: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    title: str = Field(..., description="Conversation title")
    model: str = Field(..., description="AI model used")
    temperature: Optional[float] = Field(0.7, description="Temperature for generation")
    max_tokens: Optional[int] = Field(1000, description="Maximum tokens to generate")
    system_prompt: Optional[str] = Field(None, description="System prompt for the conversation")

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    system_prompt: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ConversationResponse(ConversationBase):
    id: UUID
    user_id: UUID
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    conversation_id: Optional[UUID] = Field(None, description="Existing conversation ID")
    model: Optional[str] = Field(None, description="AI model to use")
    temperature: Optional[float] = Field(None, description="Temperature for generation")
    max_tokens: Optional[int] = Field(None, description="Maximum tokens to generate")
    stream: Optional[bool] = Field(False, description="Stream response")
    context: Optional[Dict[str, Any]] = Field(None, description="Additional context")

class ChatResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    message: str
    model: str
    usage: Dict[str, int]
    metadata: Dict[str, Any]
    created_at: datetime

class CompletionRequest(BaseModel):
    prompt: str = Field(..., description="Text completion prompt")
    model: Optional[str] = Field(None, description="AI model to use")
    temperature: Optional[float] = Field(None, description="Temperature for generation")
    max_tokens: Optional[int] = Field(None, description="Maximum tokens to generate")
    stop: Optional[List[str]] = Field(None, description="Stop sequences")

class CompletionResponse(BaseModel):
    id: UUID
    text: str
    model: str
    usage: Dict[str, int]
    metadata: Dict[str, Any]
    created_at: datetime

class EmbeddingRequest(BaseModel):
    text: str = Field(..., description="Text to embed")
    model: Optional[str] = Field(None, description="Embedding model to use")

class EmbeddingResponse(BaseModel):
    id: UUID
    text: str
    model: str
    dimensions: int
    embedding: List[float]
    usage: Dict[str, int]
    metadata: Dict[str, Any]
    created_at: datetime

class SentimentRequest(BaseModel):
    text: str = Field(..., description="Text to analyze")
    model: Optional[str] = Field(None, description="AI model to use")

class SentimentResponse(BaseModel):
    id: UUID
    text: str
    sentiment: str
    confidence: float
    scores: Dict[str, float]
    emotions: Optional[Dict[str, float]] = None
    metadata: Dict[str, Any]
    created_at: datetime

class EntityRequest(BaseModel):
    text: str = Field(..., description="Text to extract entities from")
    model: Optional[str] = Field(None, description="AI model to use")

class EntityResponse(BaseModel):
    id: UUID
    text: str
    entities: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    created_at: datetime

class SummaryRequest(BaseModel):
    text: str = Field(..., description="Text to summarize")
    model: Optional[str] = Field(None, description="AI model to use")
    max_length: Optional[int] = Field(200, description="Maximum summary length")
    style: Optional[str] = Field("concise", description="Summary style")

class SummaryResponse(BaseModel):
    id: UUID
    original_text: str
    summary: str
    model: str
    stats: Dict[str, Any]
    usage: Dict[str, int]
    metadata: Dict[str, Any]
    created_at: datetime

class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    source_language: str = Field(..., description="Source language")
    target_language: str = Field(..., description="Target language")
    model: Optional[str] = Field(None, description="AI model to use")

class TranslationResponse(BaseModel):
    id: UUID
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    model: str
    confidence: Optional[float] = None
    usage: Dict[str, int]
    metadata: Dict[str, Any]
    created_at: datetime
