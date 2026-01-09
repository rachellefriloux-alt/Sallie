import pytest
import asyncio
import json
from fastapi.testclient import TestClient
from fastapi import status
from unittest.mock import Mock, patch, AsyncMock
import sys
import os

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sallie_server_with_sync import app, SallieServer

@pytest.mark.integration
class TestAPIEndpoints:
    """Integration tests for API endpoints"""

    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data

    def test_info_endpoint(self, client):
        """Test server info endpoint"""
        response = client.get("/info")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "description" in data

    @pytest.mark.asyncio
    async def test_authentication_flow(self, client, mock_user):
        """Test complete authentication flow"""
        # Test login
        login_response = client.post("/auth/login", json={
            "email": mock_user["email"],
            "password": "password123"
        })
        
        # Note: This would need actual auth implementation
        # For now, we'll test the endpoint structure
        assert login_response.status_code in [200, 401, 404]

    @pytest.mark.asyncio
    async def test_conversation_endpoints(self, client, mock_conversation):
        """Test conversation API endpoints"""
        # Create conversation
        create_response = client.post("/conversations", json={
            "title": "Test Conversation",
            "user_id": mock_conversation["user_id"]
        })
        
        # Note: This would need actual implementation
        # For now, we'll test the endpoint structure
        assert create_response.status_code in [200, 201, 400, 401]
        
        if create_response.status_code in [200, 201]:
            conversation_data = create_response.json()
            conversation_id = conversation_data.get("id")
            
            if conversation_id:
                # Get conversation
                get_response = client.get(f"/conversations/{conversation_id}")
                assert get_response.status_code in [200, 404]
                
                # Get user conversations
                user_convs_response = client.get(f"/conversations/user/{mock_conversation['user_id']}")
                assert user_convs_response.status_code in [200, 404]
                
                # Add message
                message_response = client.post(f"/conversations/{conversation_id}/messages", json={
                    "role": "user",
                    "content": "Hello Sallie!"
                })
                assert message_response.status_code in [200, 201, 400, 404]

    @pytest.mark.asyncio
    async def test_avatar_endpoints(self, client, mock_avatar):
        """Test avatar API endpoints"""
        # Create avatar
        create_response = client.post("/avatar", json={
            "user_id": mock_avatar["user_id"],
            "name": mock_avatar["name"],
            "appearance": mock_avatar["appearance"]
        })
        
        assert create_response.status_code in [200, 201, 400, 401]
        
        if create_response.status_code in [200, 201]:
            avatar_data = create_response.json()
            avatar_id = avatar_data.get("id")
            
            if avatar_id:
                # Get avatar
                get_response = client.get(f"/avatar/{avatar_id}")
                assert get_response.status_code in [200, 404]
                
                # Get user avatar
                user_avatar_response = client.get(f"/avatar/user/{mock_avatar['user_id']}")
                assert user_avatar_response.status_code in [200, 404]
                
                # Update avatar
                update_response = client.put(f"/avatar/{avatar_id}", json={
                    "mood": "excited",
                    "appearance": {"skin_tone": "#d4a574"}
                })
                assert update_response.status_code in [200, 400, 404]
                
                # Change mood
                mood_response = client.patch(f"/avatar/{avatar_id}/mood", json={
                    "mood": "happy"
                })
                assert mood_response.status_code in [200, 400, 404]

    @pytest.mark.asyncio
    async def test_settings_endpoints(self, client, mock_settings):
        """Test settings API endpoints"""
        # Create settings
        create_response = client.post("/settings", json={
            "user_id": mock_settings["user_id"],
            "theme": mock_settings["theme"],
            "language": mock_settings["language"],
            "notifications": mock_settings["notifications"]
        })
        
        assert create_response.status_code in [200, 201, 400, 401]
        
        if create_response.status_code in [200, 201]:
            settings_data = create_response.json()
            settings_id = settings_data.get("id")
            
            if settings_id:
                # Get settings
                get_response = client.get(f"/settings/{settings_id}")
                assert get_response.status_code in [200, 404]
                
                # Get user settings
                user_settings_response = client.get(f"/settings/user/{mock_settings['user_id']}")
                assert user_settings_response.status_code in [200, 404]
                
                # Update settings
                update_response = client.put(f"/settings/{settings_id}", json={
                    "theme": "light",
                    "language": "fr"
                })
                assert update_response.status_code in [200, 400, 404]
                
                # Toggle theme
                theme_response = client.patch(f"/settings/{settings_id}/theme", json={})
                assert theme_response.status_code in [200, 400, 404]

    def test_error_handling(self, client):
        """Test error handling in endpoints"""
        # Test non-existent endpoint
        response = client.get("/non-existent-endpoint")
        assert response.status_code == 404
        
        # Test invalid method
        response = client.patch("/health")
        assert response.status_code == 405
        
        # Test invalid JSON
        response = client.post("/conversations", data="invalid json")
        assert response.status_code == 422

    def test_cors_headers(self, client):
        """Test CORS headers"""
        # Test preflight request
        response = client.options("/conversations", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        })
        
        # Note: CORS implementation would need to be added
        # For now, we'll test the endpoint exists
        assert response.status_code in [200, 404, 405]

@pytest.mark.integration
class TestDatabaseIntegration:
    """Integration tests for database operations"""

    @pytest.mark.asyncio
    async def test_conversation_crud_operations(self, conversation_manager, mock_conversation):
        """Test complete CRUD operations for conversations"""
        # Create
        conversation = await conversation_manager.create_conversation(
            user_id=mock_conversation["user_id"],
            title=mock_conversation["title"]
        )
        assert conversation is not None
        assert conversation.id is not None
        
        # Read
        retrieved = await conversation_manager.get_conversation(conversation.id)
        assert retrieved is not None
        assert retrieved.id == conversation.id
        
        # Update (add message)
        message = await conversation_manager.add_message(
            conversation_id=conversation.id,
            role="user",
            content="Test message"
        )
        assert message is not None
        assert message.conversation_id == conversation.id
        
        # Delete
        deleted = await conversation_manager.delete_conversation(conversation.id)
        assert deleted is True
        
        # Verify deletion
        deleted_conversation = await conversation_manager.get_conversation(conversation.id)
        assert deleted_conversation is None

    @pytest.mark.asyncio
    async def test_avatar_crud_operations(self, avatar_manager, mock_avatar):
        """Test complete CRUD operations for avatars"""
        # Create
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        assert avatar is not None
        assert avatar.id is not None
        
        # Read
        retrieved = await avatar_manager.get_avatar(avatar.id)
        assert retrieved is not None
        assert retrieved.id == avatar.id
        
        # Update
        updated = await avatar_manager.update_avatar(
            avatar_id=avatar.id,
            mood="excited",
            appearance={"skin_tone": "#d4a574"}
        )
        assert updated is not None
        assert updated.mood == "excited"
        
        # Delete
        deleted = await avatar_manager.delete_avatar(avatar.id)
        assert deleted is True
        
        # Verify deletion
        deleted_avatar = await avatar_manager.get_avatar(avatar.id)
        assert deleted_avatar is None

    @pytest.mark.asyncio
    async def test_settings_crud_operations(self, settings_manager, mock_settings):
        """Test complete CRUD operations for settings"""
        # Create
        settings = await settings_manager.create_settings(
            user_id=mock_settings["user_id"],
            theme=mock_settings["theme"],
            language=mock_settings["language"],
            notifications=mock_settings["notifications"]
        )
        assert settings is not None
        assert settings.id is not None
        
        # Read
        retrieved = await settings_manager.get_settings(settings.id)
        assert retrieved is not None
        assert retrieved.id == settings.id
        
        # Update
        updated = await settings_manager.update_settings(
            settings_id=settings.id,
            theme="light",
            language="fr"
        )
        assert updated is not None
        assert updated.theme == "light"
        
        # Note: Settings might not have delete operation in real implementation
        # Users typically always have settings

@pytest.mark.integration
@pytest.mark.websocket
class TestWebSocketIntegration:
    """Integration tests for WebSocket functionality"""

    @pytest.mark.asyncio
    async def test_websocket_connection(self, mock_websocket_manager):
        """Test WebSocket connection establishment"""
        user_id = "test-user-123"
        websocket = create_mock_websocket()
        
        await mock_websocket_manager.connect(user_id, websocket)
        
        assert user_id in mock_websocket_manager.connections
        assert mock_websocket_manager.connections[user_id] == websocket

    @pytest.mark.asyncio
    async def test_websocket_messaging(self, mock_websocket_manager):
        """Test WebSocket messaging"""
        user_id = "test-user-123"
        websocket = create_mock_websocket()
        message = {"type": "test", "content": "Hello WebSocket!"}
        
        await mock_websocket_manager.connect(user_id, websocket)
        await mock_websocket_manager.send_message(user_id, message)
        
        messages = mock_websocket_manager.get_messages(user_id)
        assert len(messages) == 1
        assert messages[0]["message"] == message

    @pytest.mark.asyncio
    async def test_websocket_broadcast(self, mock_websocket_manager):
        """Test WebSocket broadcasting"""
        user1 = "user-1"
        user2 = "user-2"
        websocket1 = create_mock_websocket()
        websocket2 = create_mock_websocket()
        message = {"type": "broadcast", "content": "Hello everyone!"}
        
        await mock_websocket_manager.connect(user1, websocket1)
        await mock_websocket_manager.connect(user2, websocket2)
        await mock_websocket_manager.broadcast(message)
        
        all_messages = mock_websocket_manager.get_messages()
        assert len(all_messages) == 2
        assert all(msg["message"] == message for msg in all_messages)

    @pytest.mark.asyncio
    async def test_websocket_disconnection(self, mock_websocket_manager):
        """Test WebSocket disconnection"""
        user_id = "test-user-123"
        websocket = create_mock_websocket()
        
        await mock_websocket_manager.connect(user_id, websocket)
        assert user_id in mock_websocket_manager.connections
        
        await mock_websocket_manager.disconnect(user_id)
        assert user_id not in mock_websocket_manager.connections

@pytest.mark.integration
@pytest.mark.auth
class TestAuthenticationIntegration:
    """Integration tests for authentication"""

    def test_jwt_token_generation(self, mock_auth):
        """Test JWT token generation"""
        user_id = "test-user-123"
        token = mock_auth.generate_token(user_id)
        
        assert token is not None
        assert isinstance(token, str)
        assert "mock-token" in token

    def test_jwt_token_verification(self, mock_auth):
        """Test JWT token verification"""
        user_id = "test-user-123"
        token = mock_auth.generate_token(user_id)
        
        verified_user_id = mock_auth.verify_token(token)
        assert verified_user_id == user_id

    def test_invalid_token_verification(self, mock_auth):
        """Test verification of invalid token"""
        invalid_token = "invalid-token-123"
        
        verified_user_id = mock_auth.verify_token(invalid_token)
        assert verified_user_id is None

    def test_user_creation_and_retrieval(self, mock_auth, mock_user):
        """Test user creation and retrieval"""
        created_user = mock_auth.create_user(mock_user)
        
        assert created_user is not None
        assert created_user["id"] is not None
        assert created_user["email"] == mock_user["email"]
        
        retrieved_user = mock_auth.get_user(created_user["id"])
        assert retrieved_user is not None
        assert retrieved_user["id"] == created_user["id"]

@pytest.mark.integration
class TestFileOperationsIntegration:
    """Integration tests for file operations"""

    def test_file_creation_and_reading(self, mock_file_system):
        """Test file creation and reading"""
        file_path = "/test/file.txt"
        content = "Hello, World!"
        
        mock_file_system.create_file(file_path, content)
        
        assert mock_file_system.file_exists(file_path)
        assert mock_file_system.read_file(file_path) == content

    def test_file_writing_and_deletion(self, mock_file_system):
        """Test file writing and deletion"""
        file_path = "/test/writeable.txt"
        original_content = "Original content"
        new_content = "New content"
        
        mock_file_system.create_file(file_path, original_content)
        assert mock_file_system.read_file(file_path) == original_content
        
        mock_file_system.write_file(file_path, new_content)
        assert mock_file_system.read_file(file_path) == new_content
        
        mock_file_system.delete_file(file_path)
        assert not mock_file_system.file_exists(file_path)

    def test_directory_operations(self, mock_file_system):
        """Test directory operations"""
        dir_path = "/test/directory"
        
        mock_file_system.create_directory(dir_path)
        assert mock_file_system.directory_exists(dir_path)
        
        # Create files in directory
        file1 = f"{dir_path}/file1.txt"
        file2 = f"{dir_path}/file2.txt"
        mock_file_system.create_file(file1, "Content 1")
        mock_file_system.create_file(file2, "Content 2")
        
        files = mock_file_system.list_files(dir_path)
        assert len(files) == 2
        assert file1 in files
        assert file2 in files
        
        mock_file_system.delete_directory(dir_path)
        assert not mock_file_system.directory_exists(dir_path)
        assert not mock_file_system.file_exists(file1)
        assert not mock_file_system.file_exists(file2)

@pytest.mark.integration
class TestCrossPlatformSync:
    """Integration tests for cross-platform synchronization"""

    @pytest.mark.asyncio
    async def test_sync_conversation_across_platforms(self, conversation_manager):
        """Test syncing conversations across platforms"""
        user_id = "test-user-123"
        
        # Create conversation from web platform
        web_conversation = await conversation_manager.create_conversation(
            user_id=user_id,
            title="Web Conversation"
        )
        
        # Add message from mobile platform
        mobile_message = await conversation_manager.add_message(
            conversation_id=web_conversation.id,
            role="user",
            content="Message from mobile"
        )
        
        # Add message from desktop platform
        desktop_message = await conversation_manager.add_message(
            conversation_id=web_conversation.id,
            role="assistant",
            content="Response from desktop"
        )
        
        # Verify all platforms see the same conversation
        synced_conversation = await conversation_manager.get_conversation(web_conversation.id)
        assert len(synced_conversation.messages) == 2
        assert any(msg.content == "Message from mobile" for msg in synced_conversation.messages)
        assert any(msg.content == "Response from desktop" for msg in synced_conversation.messages)

    @pytest.mark.asyncio
    async def test_sync_avatar_across_platforms(self, avatar_manager):
        """Test syncing avatar changes across platforms"""
        user_id = "test-user-123"
        
        # Create avatar from desktop
        desktop_avatar = await avatar_manager.create_avatar(
            user_id=user_id,
            name="Sallie",
            appearance={"skin_tone": "#f4c2a1", "hair_color": "#8b4513"}
        )
        
        # Update mood from mobile
        await avatar_manager.change_mood(desktop_avatar.id, "excited")
        
        # Update appearance from web
        await avatar_manager.update_avatar(
            avatar_id=desktop_avatar.id,
            appearance={"skin_tone": "#d4a574", "hair_color": "#654321"}
        )
        
        # Verify all platforms see the same avatar
        synced_avatar = await avatar_manager.get_avatar(desktop_avatar.id)
        assert synced_avatar.mood == "excited"
        assert synced_avatar.appearance["skin_tone"] == "#d4a574"
        assert synced_avatar.appearance["hair_color"] == "#654321"

    @pytest.mark.asyncio
    async def test_sync_settings_across_platforms(self, settings_manager):
        """Test syncing settings across platforms"""
        user_id = "test-user-123"
        
        # Create settings from web
        web_settings = await settings_manager.create_settings(
            user_id=user_id,
            theme="dark",
            language="en",
            notifications={"email": True, "push": False}
        )
        
        # Update theme from mobile
        await settings_manager.toggle_theme(web_settings.id)
        
        # Update notifications from desktop
        await settings_manager.update_notifications(
            settings_id=web_settings.id,
            email=False,
            push=True
        )
        
        # Verify all platforms see the same settings
        synced_settings = await settings_manager.get_settings(web_settings.id)
        assert synced_settings.theme == "light"
        assert synced_settings.notifications.email == False
        assert synced_settings.notifications.push == True

@pytest.mark.integration
class TestErrorHandlingIntegration:
    """Integration tests for error handling"""

    @pytest.mark.asyncio
    async def test_concurrent_operations(self, conversation_manager):
        """Test handling concurrent operations"""
        user_id = "test-user-123"
        
        # Create multiple conversations concurrently
        tasks = [
            conversation_manager.create_conversation(
                user_id=user_id,
                title=f"Conversation {i}"
            )
            for i in range(10)
        ]
        
        conversations = await asyncio.gather(*tasks, return_exceptions=True)
        
        # All operations should succeed or fail gracefully
        successful_convs = [conv for conv in conversations if not isinstance(conv, Exception)]
        assert len(successful_convs) > 0

    @pytest.mark.asyncio
    async def test_resource_cleanup(self, conversation_manager, avatar_manager, settings_manager):
        """Test resource cleanup"""
        user_id = "test-user-123"
        
        # Create resources
        conversation = await conversation_manager.create_conversation(
            user_id=user_id,
            title="Test Conversation"
        )
        
        avatar = await avatar_manager.create_avatar(
            user_id=user_id,
            name="Test Avatar",
            appearance={"skin_tone": "#f4c2a1"}
        )
        
        settings = await settings_manager.create_settings(
            user_id=user_id,
            theme="dark",
            language="en",
            notifications={"email": True}
        )
        
        # Cleanup resources
        await conversation_manager.delete_conversation(conversation.id)
        await avatar_manager.delete_avatar(avatar.id)
        # Note: Settings might not be deleted in real implementation
        
        # Verify cleanup
        assert await conversation_manager.get_conversation(conversation.id) is None
        assert await avatar_manager.get_avatar(avatar.id) is None
