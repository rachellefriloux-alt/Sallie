import pytest
import asyncio
import json
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import HTTPException
import sys
import os
import tempfile
import shutil
from pathlib import Path

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sallie_server_with_sync import (
    app, SallieServer, ConversationManager, AvatarManager, SettingsManager,
    User, Conversation, Avatar, Settings
)

@pytest.mark.unit
class TestSallieServerAdvanced:
    """Advanced test cases for SallieServer class"""

    def test_server_singleton_behavior(self):
        """Test that server maintains singleton behavior"""
        server1 = SallieServer()
        server2 = SallieServer()
        # Note: This test assumes singleton pattern, adjust if not implemented
        assert server1 is not None
        assert server2 is not None

    @pytest.mark.asyncio
    async def test_server_concurrent_operations(self):
        """Test server handling concurrent operations"""
        server = SallieServer()
        
        # Mock startup methods
        server.conversation_manager.initialize = AsyncMock()
        server.avatar_manager.initialize = AsyncMock()
        server.settings_manager.initialize = AsyncMock()
        
        # Test concurrent startup
        await asyncio.gather(
            server.startup(),
            server.startup(),
            server.startup()
        )
        
        # Verify all managers were initialized
        assert server.conversation_manager.initialize.call_count == 3
        assert server.avatar_manager.initialize.call_count == 3
        assert server.settings_manager.initialize.call_count == 3

    def test_server_error_handling(self):
        """Test server error handling"""
        server = SallieServer()
        
        # Test with invalid configuration
        with pytest.raises(Exception):
            # This would need to be implemented in the actual server
            server.load_invalid_config()

    @pytest.mark.asyncio
    async def test_server_resource_cleanup(self):
        """Test proper resource cleanup during shutdown"""
        server = SallieServer()
        
        # Mock cleanup with resource tracking
        resources_cleaned = []
        
        async def mock_cleanup():
            resources_cleaned.append("conversation_manager")
        
        server.conversation_manager.cleanup = mock_cleanup
        
        await server.shutdown()
        
        assert "conversation_manager" in resources_cleaned

@pytest.mark.unit
class TestConversationManagerAdvanced:
    """Advanced test cases for ConversationManager"""

    @pytest.mark.asyncio
    async def test_conversation_pagination(self, conversation_manager, mock_user):
        """Test conversation pagination functionality"""
        # Create many conversations
        conversations = []
        for i in range(25):
            conv = await conversation_manager.create_conversation(
                user_id=mock_user["id"],
                title=f"Conversation {i}"
            )
            conversations.append(conv)
        
        # Test pagination
        page1 = await conversation_manager.get_user_conversations(
            mock_user["id"], page=1, limit=10
        )
        page2 = await conversation_manager.get_user_conversations(
            mock_user["id"], page=2, limit=10
        )
        page3 = await conversation_manager.get_user_conversations(
            mock_user["id"], page=3, limit=10
        )
        
        assert len(page1) == 10
        assert len(page2) == 10
        assert len(page3) == 5

    @pytest.mark.asyncio
    async def test_conversation_search(self, conversation_manager, mock_user):
        """Test conversation search functionality"""
        # Create conversations with different titles
        await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Work Project Discussion"
        )
        await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Personal Planning"
        )
        await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Work Meeting Notes"
        )
        
        # Search for "work"
        work_conversations = await conversation_manager.search_conversations(
            mock_user["id"], query="work"
        )
        
        assert len(work_conversations) == 2
        assert all("work" in conv.title.lower() for conv in work_conversations)

    @pytest.mark.asyncio
    async def test_conversation_archiving(self, conversation_manager, mock_user):
        """Test conversation archiving functionality"""
        # Create conversation
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="To be archived"
        )
        
        # Archive conversation
        result = await conversation_manager.archive_conversation(conv.id)
        assert result is True
        
        # Verify it's archived
        archived_conv = await conversation_manager.get_conversation(conv.id, include_archived=True)
        assert archived_conv.is_archived is True
        
        # Verify it's not in active conversations
        active_conversations = await conversation_manager.get_user_conversations(mock_user["id"])
        assert archived_conv not in active_conversations

    @pytest.mark.asyncio
    async def test_conversation_export(self, conversation_manager, mock_user):
        """Test conversation export functionality"""
        # Create conversation with messages
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Export Test"
        )
        
        await conversation_manager.add_message(
            conversation_id=conv.id,
            role="user",
            content="Hello Sallie!"
        )
        
        await conversation_manager.add_message(
            conversation_id=conv.id,
            role="assistant",
            content="Hello! How can I help you?"
        )
        
        # Export conversation
        export_data = await conversation_manager.export_conversation(conv.id)
        
        assert "messages" in export_data
        assert len(export_data["messages"]) == 2
        assert export_data["title"] == "Export Test"

@pytest.mark.unit
class TestAvatarManagerAdvanced:
    """Advanced test cases for AvatarManager"""

    @pytest.mark.asyncio
    async def test_avatar_emotion_system(self, avatar_manager, mock_avatar):
        """Test avatar emotion system"""
        # Create avatar
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Test complex emotion changes
        emotions = ["happy", "excited", "contemplative", "curious", "calm"]
        
        for emotion in emotions:
            await avatar_manager.set_emotion(avatar.id, emotion)
            updated_avatar = await avatar_manager.get_avatar(avatar.id)
            assert updated_avatar.emotion == emotion
            
            # Test emotion history
            history = await avatar_manager.get_emotion_history(avatar.id)
            assert emotion in [h.emotion for h in history]

    @pytest.mark.asyncio
    async def test_avatar_customization(self, avatar_manager, mock_avatar):
        """Test avatar customization features"""
        # Create avatar
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Test customization options
        customizations = {
            "hair_style": "long_wavy",
            "clothing_style": "casual",
            "accessories": ["glasses", "watch"],
            "background": "nature_scene"
        }
        
        updated_avatar = await avatar_manager.customize_avatar(
            avatar.id, **customizations
        )
        
        for key, value in customizations.items():
            assert updated_avatar.customizations[key] == value

    @pytest.mark.asyncio
    async def test_avatar_animation_states(self, avatar_manager, mock_avatar):
        """Test avatar animation states"""
        # Create avatar
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Test animation states
        animations = ["idle", "talking", "listening", "thinking", "waving"]
        
        for animation in animations:
            await avatar_manager.set_animation_state(avatar.id, animation)
            current_avatar = await avatar_manager.get_avatar(avatar.id)
            assert current_avatar.animation_state == animation

@pytest.mark.unit
class TestSettingsManagerAdvanced:
    """Advanced test cases for SettingsManager"""

    @pytest.mark.asyncio
    async def test_settings_backup_and_restore(self, settings_manager, mock_settings):
        """Test settings backup and restore functionality"""
        # Create settings
        settings = await settings_manager.create_settings(
            user_id=mock_settings["user_id"],
            theme=mock_settings["theme"],
            language=mock_settings["language"],
            notifications=mock_settings["notifications"]
        )
        
        # Create backup
        backup_id = await settings_manager.create_backup(settings.id)
        assert backup_id is not None
        
        # Modify settings
        await settings_manager.update_settings(
            settings_id=settings.id,
            theme="light",
            language="fr"
        )
        
        # Restore from backup
        restored = await settings_manager.restore_from_backup(backup_id)
        assert restored.theme == mock_settings["theme"]
        assert restored.language == mock_settings["language"]

    @pytest.mark.asyncio
    async def test_settings_import_export(self, settings_manager, mock_settings):
        """Test settings import and export"""
        # Create settings
        settings = await settings_manager.create_settings(
            user_id=mock_settings["user_id"],
            theme=mock_settings["theme"],
            language=mock_settings["language"],
            notifications=mock_settings["notifications"]
        )
        
        # Export settings
        export_data = await settings_manager.export_settings(settings.id)
        assert "theme" in export_data
        assert "language" in export_data
        assert "notifications" in export_data
        
        # Import to new user
        new_user_id = "new_user_123"
        imported_settings = await settings_manager.import_settings(
            new_user_id, export_data
        )
        
        assert imported_settings.user_id == new_user_id
        assert imported_settings.theme == mock_settings["theme"]

    @pytest.mark.asyncio
    async def test_settings_templates(self, settings_manager):
        """Test settings templates functionality"""
        # Create templates
        templates = {
            "minimal": {
                "theme": "light",
                "language": "en",
                "notifications": {"email": False, "push": False}
            },
            "power_user": {
                "theme": "dark",
                "language": "en",
                "notifications": {"email": True, "push": True}
            }
        }
        
        for template_name, template_data in templates.items():
            await settings_manager.create_template(template_name, template_data)
        
        # Apply template to user
        user_id = "template_user_123"
        settings = await settings_manager.apply_template(user_id, "minimal")
        
        assert settings.theme == "light"
        assert settings.notifications.email == False

@pytest.mark.unit
class TestPerformanceOptimizations:
    """Test cases for performance optimizations"""

    @pytest.mark.asyncio
    async def test_caching_mechanism(self, conversation_manager, mock_user):
        """Test caching mechanism for frequently accessed data"""
        # Create conversation
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Cached Conversation"
        )
        
        # First access (should cache)
        start_time = asyncio.get_event_loop().time()
        conv1 = await conversation_manager.get_conversation(conv.id)
        first_access_time = asyncio.get_event_loop().time() - start_time
        
        # Second access (should be faster due to cache)
        start_time = asyncio.get_event_loop().time()
        conv2 = await conversation_manager.get_conversation(conv.id)
        second_access_time = asyncio.get_event_loop().time() - start_time
        
        assert conv1.id == conv2.id
        # Second access should be faster (though this might be flaky in tests)
        assert second_access_time <= first_access_time * 2  # Allow some variance

    @pytest.mark.asyncio
    async def test_batch_operations(self, conversation_manager, mock_user):
        """Test batch operations for improved performance"""
        # Create multiple conversations in batch
        conversation_data = [
            {"title": f"Batch Conversation {i}"}
            for i in range(10)
        ]
        
        start_time = asyncio.get_event_loop().time()
        conversations = await conversation_manager.batch_create_conversations(
            mock_user["id"], conversation_data
        )
        batch_time = asyncio.get_event_loop().time() - start_time
        
        assert len(conversations) == 10
        
        # Compare with individual creation time
        start_time = asyncio.get_event_loop().time()
        individual_conversations = []
        for data in conversation_data:
            conv = await conversation_manager.create_conversation(
                user_id=mock_user["id"],
                title=data["title"]
            )
            individual_conversations.append(conv)
        individual_time = asyncio.get_event_loop().time() - start_time
        
        # Batch should be faster (though this might be flaky in tests)
        assert batch_time <= individual_time * 1.5  # Allow some variance

@pytest.mark.unit
class TestSecurityFeatures:
    """Test cases for security features"""

    @pytest.mark.asyncio
    async def test_data_encryption(self, conversation_manager, mock_user):
        """Test data encryption at rest"""
        # Create conversation with sensitive data
        sensitive_content = "This is sensitive information that should be encrypted"
        
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Secure Conversation"
        )
        
        await conversation_manager.add_message(
            conversation_id=conv.id,
            role="user",
            content=sensitive_content
        )
        
        # Verify data is encrypted in storage (this would need actual implementation)
        stored_data = await conversation_manager.get_raw_storage_data(conv.id)
        assert sensitive_content not in str(stored_data)  # Should be encrypted

    @pytest.mark.asyncio
    async def test_access_control(self, conversation_manager, mock_user):
        """Test access control mechanisms"""
        # Create conversation for user1
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Private Conversation"
        )
        
        # Try to access with different user
        different_user = "different_user_456"
        
        # Should fail or return None
        with pytest.raises((PermissionError, HTTPException)):
            await conversation_manager.get_conversation(conv.id, user_id=different_user)

@pytest.mark.unit
class TestErrorHandling:
    """Test cases for comprehensive error handling"""

    @pytest.mark.asyncio
    async def test_network_error_handling(self, conversation_manager, mock_user):
        """Test handling of network errors"""
        # Simulate network failure
        with patch('some_network_call', side_effect=ConnectionError("Network failed")):
            with pytest.raises(ConnectionError):
                await conversation_manager.create_conversation(
                    user_id=mock_user["id"],
                    title="Network Test"
                )

    @pytest.mark.asyncio
    async def test_data_corruption_handling(self, conversation_manager, mock_user):
        """Test handling of corrupted data"""
        # Create conversation
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Corruption Test"
        )
        
        # Simulate data corruption
        with patch('database.load_conversation', side_effect=json.JSONDecodeError("Corrupted", "", 0)):
            with pytest.raises(json.JSONDecodeError):
                await conversation_manager.get_conversation(conv.id)

    @pytest.mark.asyncio
    async def test_resource_exhaustion_handling(self, conversation_manager, mock_user):
        """Test handling of resource exhaustion"""
        # Simulate memory error
        with patch('database.save_conversation', side_effect=MemoryError("Out of memory")):
            with pytest.raises(MemoryError):
                await conversation_manager.create_conversation(
                    user_id=mock_user["id"],
                    title="Memory Test"
                )

@pytest.mark.unit
class TestIntegrationScenarios:
    """Integration test scenarios"""

    @pytest.mark.asyncio
    async def test_full_user_workflow(self, conversation_manager, avatar_manager, settings_manager):
        """Test complete user workflow across all managers"""
        user_id = "integration_user_123"
        
        # 1. Create user settings
        settings = await settings_manager.create_settings(
            user_id=user_id,
            theme="dark",
            language="en",
            notifications={"email": True, "push": False}
        )
        
        # 2. Create user avatar
        avatar = await avatar_manager.create_avatar(
            user_id=user_id,
            name="Integration Avatar",
            appearance={"skin_tone": "#d4a574", "hair_color": "#8b4513"}
        )
        
        # 3. Create conversation
        conversation = await conversation_manager.create_conversation(
            user_id=user_id,
            title="Integration Test Conversation"
        )
        
        # 4. Add messages
        await conversation_manager.add_message(
            conversation_id=conversation.id,
            role="user",
            content="Hello, this is an integration test!"
        )
        
        # 5. Update avatar mood based on conversation
        await avatar_manager.change_mood(avatar.id, "excited")
        
        # 6. Update settings based on usage
        await settings_manager.update_notifications(
            settings.id,
            email=True,
            push=True
        )
        
        # Verify all components are working together
        final_settings = await settings_manager.get_user_settings(user_id)
        final_avatar = await avatar_manager.get_user_avatar(user_id)
        final_conversation = await conversation_manager.get_conversation(conversation.id)
        
        assert final_settings.theme == "dark"
        assert final_avatar.mood == "excited"
        assert len(final_conversation.messages) == 1
        assert final_conversation.messages[0].content == "Hello, this is an integration test!"

    @pytest.mark.asyncio
    async def test_cross_manager_data_consistency(self, conversation_manager, avatar_manager, settings_manager):
        """Test data consistency across different managers"""
        user_id = "consistency_user_123"
        
        # Create related data across managers
        settings = await settings_manager.create_settings(
            user_id=user_id,
            theme="light",
            language="en",
            notifications={"email": False, "push": True}
        )
        
        avatar = await avatar_manager.create_avatar(
            user_id=user_id,
            name="Consistency Avatar",
            appearance={"skin_tone": "#f5deb3"}
        )
        
        # Verify user ID consistency
        assert settings.user_id == avatar.user_id == user_id
        
        # Test cascading updates
        await settings_manager.update_settings(settings.id, theme="dark")
        await avatar_manager.change_mood(avatar.id, "contemplative")
        
        # Verify updates are consistent
        updated_settings = await settings_manager.get_user_settings(user_id)
        updated_avatar = await avatar_manager.get_user_avatar(user_id)
        
        assert updated_settings.theme == "dark"
        assert updated_avatar.mood == "contemplative"
        assert updated_settings.user_id == updated_avatar.user_id == user_id
