from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ...core.database import get_db
from ...core.security import get_current_user
from ...services.ai_service import ai_service
from ...schemas.conversation import (
    ChatRequest, ChatResponse, CompletionRequest, CompletionResponse,
    EmbeddingRequest, EmbeddingResponse, SentimentRequest, SentimentResponse,
    EntityRequest, EntityResponse, SummaryRequest, SummaryResponse,
    TranslationRequest, TranslationResponse, ConversationCreate, ConversationResponse,
    ConversationUpdate
)
from ...models.conversation import Conversation, Message

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_completion(
    request: ChatRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a chat completion"""
    try:
        response = await ai_service.chat(request, current_user["id"], db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/complete", response_model=CompletionResponse)
async def text_completion(
    request: CompletionRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a text completion"""
    try:
        response = await ai_service.complete(request, current_user["id"], db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/embeddings", response_model=EmbeddingResponse)
async def create_embeddings(
    request: EmbeddingRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create text embeddings"""
    try:
        response = await ai_service.embed(request, current_user["id"], db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/sentiment", response_model=SentimentResponse)
async def analyze_sentiment(
    request: SentimentRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze text sentiment"""
    try:
        response = await ai_service.analyze_sentiment(request, current_user["id"], db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/entities", response_model=EntityResponse)
async def extract_entities(
    request: EntityRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Extract entities from text"""
    try:
        response = await ai_service.extract_entities(request, current_user["id"], db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/summarize", response_model=SummaryResponse)
async def summarize_text(
    request: SummaryRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Summarize text"""
    try:
        response = await ai_service.summarize(request, current_user["id"], db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/translate", response_model=TranslationResponse)
async def translate_text(
    request: TranslationRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Translate text"""
    try:
        response = await ai_service.translate(request, current_user["id"], db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's conversations"""
    try:
        conversations = db.query(Conversation).filter(
            Conversation.user_id == current_user["id"]
        ).order_by(Conversation.updated_at.desc()).offset(offset).limit(limit).all()
        
        response = []
        for conv in conversations:
            messages = db.query(Message).filter(
                Message.conversation_id == conv.id
            ).order_by(Message.created_at).all()
            
            conv_response = ConversationResponse.from_orm(conv)
            conv_response.messages = messages
            response.append(conv_response)
        
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    conversation: ConversationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new conversation"""
    try:
        conv = Conversation(
            user_id=current_user["id"],
            **conversation.dict()
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
        
        return ConversationResponse.from_orm(conv)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific conversation"""
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user["id"]
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        messages = db.query(Message).filter(
            Message.conversation_id == conversation.id
        ).order_by(Message.created_at).all()
        
        response = ConversationResponse.from_orm(conversation)
        response.messages = messages
        
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.put("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: str,
    conversation_update: ConversationUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a conversation"""
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user["id"]
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        update_data = conversation_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(conversation, field, value)
        
        db.commit()
        db.refresh(conversation)
        
        return ConversationResponse.from_orm(conversation)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a conversation"""
    try:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user["id"]
        ).first()
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        db.delete(conversation)
        db.commit()
        
        return {"message": "Conversation deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
