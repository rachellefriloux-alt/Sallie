from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..core.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    model = Column(String(100), nullable=False)
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=1000)
    system_prompt = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation(id={self.id}, title='{self.title}', user_id={self.user_id})>"

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    model = Column(String(100), nullable=True)
    tokens_used = Column(Integer, nullable=True)
    cost = Column(Float, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role='{self.role}', conversation_id={self.conversation_id})>"

class ModelUsage(Base):
    __tablename__ = "model_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    model = Column(String(100), nullable=False)
    request_type = Column(String(50), nullable=False)  # 'chat', 'completion', 'embedding', etc.
    tokens_used = Column(Integer, nullable=False)
    cost = Column(Float, nullable=False)
    response_time = Column(Float, nullable=True)  # in seconds
    status = Column(String(20), nullable=False)  # 'success', 'error', 'timeout'
    error_message = Column(Text, nullable=True)
    metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ModelUsage(id={self.id}, model='{self.model}', user_id={self.user_id})>"
