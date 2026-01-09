import pytest
import asyncio
import json
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import HTTPException
import sys
import os

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sallie_server_with_sync import (
    app, SallieServer, ConversationManager, AvatarManager, SettingsManager,
    User, Conversation, Avatar, Settings
)

@pytest.mark.unit
class TestSallieServer:
    """Test cases for SallieServer class"""

    def test_server_initialization(self):
        """Test server initialization"""
        server = SallieServer()
        assert server is not None
        assert hasattr(server, 'conversation_manager')
        assert hasattr(server, 'avatar_manager')
        assert hasattr(server, 'settings_manager')

    @pytest.mark.asyncio
    async def test_server_startup(self):
        """Test server startup"""
        server = SallieServer()
        # Mock startup methods
        server.conversation_manager.initialize = AsyncMock()
        server.avatar_manager.initialize = AsyncMock()
        server.settings_manager.initialize = AsyncMock()
        
        await server.startup()
        
        server.conversation_manager.initialize.assert_called_once()
        server.avatar_manager.initialize.assert_called_once()
        server.settings_manager.initialize.assert_called_once()

    @pytest.mark.asyncio
    async def test_server_shutdown(self):
        """Test server shutdown"""
        server = SallieServer()
        # Mock shutdown methods
        server.conversation_manager.cleanup = AsyncMock()
        server.avatar_manager.cleanup = AsyncMock()
        server.settings_manager.cleanup = AsyncMock()
        
        await server.shutdown()
        
        server.conversation_manager.cleanup.assert_called_once()
        server.avatar_manager.cleanup.assert_called_once()
        server.settings_manager.cleanup.assert_called_once()

    def test_server_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data
        assert "version" in data

    def test_server_info(self, client):
        """Test server info endpoint"""
        response = client.get("/info")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "description" in data

@pytest.mark.unit
class TestConversationManager:
    """Test cases for ConversationManager class"""

    def test_conversation_manager_initialization(self):
        """Test conversation manager initialization"""
        manager = ConversationManager()
        assert manager is not None
        assert hasattr(manager, 'conversations')
        assert hasattr(manager, 'active_sessions')

    @pytest.mark.asyncio
    async def test_create_conversation(self, conversation_manager, mock_user):
        """Test creating a new conversation"""
        conversation = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Test Conversation"
        )
        
        assert conversation is not None
        assert conversation.user_id == mock_user["id"]
        assert conversation.title == "Test Conversation"
        assert conversation.id is not None
        assert conversation.messages == []

    @pytest.mark.asyncio
    async def test_get_conversation(self, conversation_manager, mock_conversation):
        """Test retrieving a conversation"""
        # First create the conversation
        await conversation_manager.create_conversation(
            user_id=mock_conversation["user_id"],
            title=mock_conversation["title"]
        )
        
        # Then retrieve it
        conversation = await conversation_manager.get_conversation(
            conversation_id=mock_conversation["id"]
        )
        
        assert conversation is not None
        assert conversation.id == mock_conversation["id"]
        assert conversation.user_id == mock_conversation["user_id"]

    @pytest.mark.asyncio
    async def test_get_user_conversations(self, conversation_manager, mock_user):
        """Test getting all conversations for a user"""
        # Create multiple conversations
        conv1 = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Conversation 1"
        )
        conv2 = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Conversation 2"
        )
        
        conversations = await conversation_manager.get_user_conversations(mock_user["id"])
        
        assert len(conversations) == 2
        assert any(c.id == conv1.id for c in conversations)
        assert any(c.id == conv2.id for c in conversations)

    @pytest.mark.asyncio
    async def test_add_message(self, conversation_manager, mock_conversation):
        """Test adding a message to a conversation"""
        # Create conversation first
        conversation = await conversation_manager.create_conversation(
            user_id=mock_conversation["user_id"],
            title=mock_conversation["title"]
        )
        
        # Add a message
        message = await conversation_manager.add_message(
            conversation_id=conversation.id,
            role="user",
            content="Hello Sallie!"
        )
        
        assert message is not None
        assert message.role == "user"
        assert message.content == "Hello Sallie!"
        assert message.conversation_id == conversation.id

    @pytest.mark.asyncio
    async def test_delete_conversation(self, conversation_manager, mock_user):
        """Test deleting a conversation"""
        # Create conversation first
        conversation = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Test Conversation"
        )
        
        # Delete it
        result = await conversation_manager.delete_conversation(conversation.id)
        
        assert result is True
        
        # Verify it's deleted
        deleted_conversation = await conversation_manager.get_conversation(conversation.id)
        assert deleted_conversation is None

    @pytest.mark.asyncio
    async def test_conversation_not_found(self, conversation_manager):
        """Test handling of non-existent conversation"""
        conversation = await conversation_manager.get_conversation("non-existent-id")
        assert conversation is None

    @pytest.mark.asyncio
    async def test_invalid_conversation_creation(self, conversation_manager):
        """Test creating conversation with invalid data"""
        with pytest.raises(ValueError):
            await conversation_manager.create_conversation(
                user_id="",  # Empty user_id
                title="Test"
            )

@pytest.mark.unit
class TestAvatarManager:
    """Test cases for AvatarManager class"""

    def test_avatar_manager_initialization(self):
        """Test avatar manager initialization"""
        manager = AvatarManager()
        assert manager is not None
        assert hasattr(manager, 'avatars')

    @pytest.mark.asyncio
    async def test_create_avatar(self, avatar_manager, mock_avatar):
        """Test creating a new avatar"""
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        assert avatar is not None
        assert avatar.user_id == mock_avatar["user_id"]
        assert avatar.name == mock_avatar["name"]
        assert avatar.appearance == mock_avatar["appearance"]
        assert avatar.id is not None

    @pytest.mark.asyncio
    async def test_get_avatar(self, avatar_manager, mock_avatar):
        """Test retrieving an avatar"""
        # Create avatar first
        created_avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Retrieve it
        avatar = await avatar_manager.get_avatar(created_avatar.id)
        
        assert avatar is not None
        assert avatar.id == created_avatar.id
        assert avatar.user_id == mock_avatar["user_id"]

    @pytest.mark.asyncio
    async def test_get_user_avatar(self, avatar_manager, mock_avatar):
        """Test getting user's avatar"""
        # Create avatar first
        await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Get user avatar
        avatar = await avatar_manager.get_user_avatar(mock_avatar["user_id"])
        
        assert avatar is not None
        assert avatar.user_id == mock_avatar["user_id"]

    @pytest.mark.asyncio
    async def test_update_avatar(self, avatar_manager, mock_avatar):
        """Test updating an avatar"""
        # Create avatar first
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Update it
        updated_avatar = await avatar_manager.update_avatar(
            avatar_id=avatar.id,
            mood="excited",
            appearance={"skin_tone": "#d4a574"}
        )
        
        assert updated_avatar is not None
        assert updated_avatar.mood == "excited"
        assert updated_avatar.appearance["skin_tone"] == "#d4a574"

    @pytest.mark.asyncio
    async def test_change_avatar_mood(self, avatar_manager, mock_avatar):
        """Test changing avatar mood"""
        # Create avatar first
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Change mood
        result = await avatar_manager.change_mood(avatar.id, "excited")
        
        assert result is True
        
        # Verify mood changed
        updated_avatar = await avatar_manager.get_avatar(avatar.id)
        assert updated_avatar.mood == "excited"

    @pytest.mark.asyncio
    async def test_delete_avatar(self, avatar_manager, mock_avatar):
        """Test deleting an avatar"""
        # Create avatar first
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Delete it
        result = await avatar_manager.delete_avatar(avatar.id)
        
        assert result is True
        
        # Verify it's deleted
        deleted_avatar = await avatar_manager.get_avatar(avatar.id)
        assert deleted_avatar is None

    @pytest.mark.asyncio
    async def test_avatar_not_found(self, avatar_manager):
        """Test handling of non-existent avatar"""
        avatar = await avatar_manager.get_avatar("non-existent-id")
        assert avatar is None

@pytest.mark.unit
class TestSettingsManager:
    """Test cases for SettingsManager class"""

    def test_settings_manager_initialization(self):
        """Test settings manager initialization"""
        manager = SettingsManager()
        assert manager is not None
        assert hasattr(manager, 'settings')

    @pytest.mark.asyncio
    async def test_create_settings(self, settings_manager, mock_settings):
        """Test creating new settings"""
        settings = await settings_manager.create_settings(
            user_id=mock_settings["user_id"],
            theme=mock_settings["theme"],
            language=mock_settings["language"],
            notifications=mock_settings["notifications"]
        )
        
        assert settings is not None
        assert settings.user_id == mock_settings["user_id"]
        assert settings.theme == mock_settings["theme"]
        assert settings.language == mock_settings["language"]
        assert settings.notifications == mock_settings["notifications"]

    @pytest.mark.asyncio
    async def test_get_settings(self, settings_manager, mock_settings):
        """Test retrieving settings"""
        # Create settings first
        created_settings = await settings_manager.create_settings(
            user_id=mock_settings["user_id"],
            theme=mock_settings["theme"],
            language=mock_settings["language"],
            notifications=mock_settings["notifications"]
        )
        
        # Retrieve them
        settings = await settings_manager.get_settings(created_settings.id)
        
        assert settings is not None
        assert settings.id == created_settings.id
        assert settings.user_id == mock_settings["user_id"]

    @pytest.mark.asyncio
    async def test_get_user_settings(self, settings_manager, mock_settings):
        """Test getting user's settings"""
        # Create settings first
        await settings_manager.create_settings(
            user_id=mock_settings["user_id"],
            theme=mock_settings["theme"],
            language=mock_settings["language"],
            notifications=mock_settings["notifications"]
        )
        
        # Get user settings
        settings = await settings_manager.get_user_settings(mock_settings["user_id"])
        
        assert settings is not None
        assert settings.user_id == mock_settings["user_id"]

    @pytest.mark.asyncio
    async def test_update_settings(self, settings_manager, mock_settings):
        """Test updating settings"""
        # Create settings first
        settings = await settings_manager.create_settings(
            user_id=mock_settings["user_id"],
            theme=mock_settings["theme"],
            language=mock_settings["language"],
            notifications=mock_settings["notifications"]
        )
        
        # Update them
        updated_settings = await settings_manager.update_settings(
            settings_id=settings.id,
            theme="light",
            language="fr"
        )
        
        assert updated_settings is not None
        assert updated_settings.theme == "light"
        assert updated_settings.language == "fr"

    @pytest.mark.asyncio
    async def test_toggle_theme(self, settings_manager, mock_settings):
        """Test toggling theme"""
        # Create settings first
        settings = await settings_manager.create_settings(
            user_id=mock_settings["user_id"],
            theme="dark",
            language=mock_settings["language"],
            notifications=mock_settings["notifications"]
        )
        
        # Toggle theme
        result = await settings_manager.toggle_theme(settings.id)
        
        assert result is True
        
        # Verify theme changed
        updated_settings = await settings_manager.get_settings(settings.id)
        assert updated_settings.theme == "light"

    @pytest.mark.asyncio
    async def test_update_notifications(self, settings_manager, mock_settings):
        """Test updating notification settings"""
        # Create settings first
        settings = await settings_manager.create_settings(
            user_id=mock_settings["user_id"],
            theme=mock_settings["theme"],
            language=mock_settings["language"],
            notifications=mock_settings["notifications"]
        )
        
        # Update notifications
        result = await settings_manager.update_notifications(
            settings.id,
            email=False,
            push=True
        )
        
        assert result is True
        
        # Verify notifications updated
        updated_settings = await settings_manager.get_settings(settings.id)
        assert updated_settings.notifications.email == False
        assert updated_settings.notifications.push == True

    @pytest.mark.asyncio
    async def test_settings_not_found(self, settings_manager):
        """Test handling of non-existent settings"""
        settings = await settings_manager.get_settings("non-existent-id")
        assert settings is None

@pytest.mark.unit
class TestModels:
    """Test cases for data models"""

    def test_user_model(self, mock_user):
        """Test User model"""
        user = User(**mock_user)
        assert user.id == mock_user["id"]
        assert user.email == mock_user["email"]
        assert user.name == mock_user["name"]

    def test_conversation_model(self, mock_conversation):
        """Test Conversation model"""
        conversation = Conversation(**mock_conversation)
        assert conversation.id == mock_conversation["id"]
        assert conversation.user_id == mock_conversation["user_id"]
        assert conversation.title == mock_conversation["title"]
        assert len(conversation.messages) == len(mock_conversation["messages"])

    def test_avatar_model(self, mock_avatar):
        """Test Avatar model"""
        avatar = Avatar(**mock_avatar)
        assert avatar.id == mock_avatar["id"]
        assert avatar.user_id == mock_avatar["user_id"]
        assert avatar.name == mock_avatar["name"]
        assert avatar.mood == mock_avatar["mood"]

    def test_settings_model(self, mock_settings):
        """Test Settings model"""
        settings = Settings(**mock_settings)
        assert settings.user_id == mock_settings["user_id"]
        assert settings.theme == mock_settings["theme"]
        assert settings.language == mock_settings["language"]
        assert settings.notifications.email == mock_settings["notifications"]["email"]

@pytest.mark.unit
class TestUtilities:
    """Test cases for utility functions"""

    def test_json_serialization(self, mock_conversation):
        """Test JSON serialization of models"""
        conversation = Conversation(**mock_conversation)
        json_str = conversation.json()
        assert json_str is not None
        
        # Test deserialization
        parsed = Conversation.parse_raw(json_str)
        assert parsed.id == conversation.id
        assert parsed.user_id == conversation.user_id

    def test_model_validation(self):
        """Test model validation"""
        # Test invalid user model
        with pytest.raises(ValueError):
            User(id="", email="invalid", name="Test")
        
        # Test invalid conversation model
        with pytest.raises(ValueError):
            Conversation(id="", user_id="test", title="Test", messages=[])

    def test_data_transformation(self, mock_conversation):
        """Test data transformation between models and dicts"""
        conversation = Conversation(**mock_conversation)
        
        # Convert to dict
        conv_dict = conversation.dict()
        assert conv_dict["id"] == conversation.id
        assert conv_dict["user_id"] == conversation.user_id
        
        # Create new model from dict
        new_conversation = Conversation(**conv_dict)
        assert new_conversation.id == conversation.id
        assert new_conversation.user_id == conversation.user_id
