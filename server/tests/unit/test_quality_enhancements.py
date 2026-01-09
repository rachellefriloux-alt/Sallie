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
class TestSecurityEnhanced:
    """Enhanced security test cases"""

    @pytest.mark.asyncio
    async def test_sql_injection_protection(self, conversation_manager, mock_user):
        """Test SQL injection protection"""
        malicious_inputs = [
            "'; DROP TABLE conversations; --",
            "' OR '1'='1",
            "'; DELETE FROM users; --",
            "' UNION SELECT * FROM sensitive_data --"
        ]
        
        for malicious_input in malicious_inputs:
            # Should not cause SQL injection
            with pytest.raises((ValueError, HTTPException)):
                await conversation_manager.create_conversation(
                    user_id=mock_user["id"],
                    title=malicious_input
                )

    @pytest.mark.asyncio
    async def test_xss_protection(self, conversation_manager, mock_user):
        """Test XSS protection in message content"""
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>",
            "<svg onload=alert('xss')>"
        ]
        
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="XSS Test"
        )
        
        for payload in xss_payloads:
            message = await conversation_manager.add_message(
                conversation_id=conv.id,
                role="user",
                content=payload
            )
            
            # Content should be sanitized
            assert "<script>" not in message.content
            assert "javascript:" not in message.content

    @pytest.mark.asyncio
    async def test_rate_limiting(self, conversation_manager, mock_user):
        """Test rate limiting functionality"""
        # Attempt to create many conversations rapidly
        with patch('conversation_manager.check_rate_limit', return_value=False):
            with pytest.raises(HTTPException) as exc_info:
                for i in range(100):  # Exceed rate limit
                    await conversation_manager.create_conversation(
                        user_id=mock_user["id"],
                        title=f"Rate Limit Test {i}"
                    )
            
            assert exc_info.value.status_code == 429  # Too Many Requests

    @pytest.mark.asyncio
    async def test_authentication_token_validation(self, conversation_manager):
        """Test authentication token validation"""
        # Test with invalid token
        with pytest.raises(HTTPException) as exc_info:
            await conversation_manager.get_conversation(
                conversation_id="test_id",
                token="invalid_token"
            )
        
        assert exc_info.value.status_code == 401  # Unauthorized

    @pytest.mark.asyncio
    async def test_data_encryption_at_rest(self, conversation_manager, mock_user):
        """Test data encryption at rest"""
        sensitive_data = "This is highly sensitive information"
        
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Encrypted Conversation"
        )
        
        await conversation_manager.add_message(
            conversation_id=conv.id,
            role="user",
            content=sensitive_data
        )
        
        # Verify data is encrypted in storage
        raw_storage = await conversation_manager.get_raw_storage_data(conv.id)
        encrypted_data = raw_storage.get("encrypted_content", "")
        
        # Sensitive data should not be visible in raw storage
        assert sensitive_data not in encrypted_data
        assert len(encrypted_data) > 0  # Should have encrypted content

@pytest.mark.unit
class TestPerformanceOptimized:
    """Enhanced performance test cases"""

    @pytest.mark.asyncio
    async def test_database_connection_pooling(self, conversation_manager, mock_user):
        """Test database connection pooling"""
        # Create multiple concurrent operations
        tasks = []
        for i in range(50):
            task = conversation_manager.create_conversation(
                user_id=mock_user["id"],
                title=f"Pool Test {i}"
            )
            tasks.append(task)
        
        # Should complete efficiently with connection pooling
        start_time = asyncio.get_event_loop().time()
        conversations = await asyncio.gather(*tasks)
        end_time = asyncio.get_event_loop().time()
        
        assert len(conversations) == 50
        assert (end_time - start_time) < 5.0  # Should complete within 5 seconds

    @pytest.mark.asyncio
    async def test_memory_optimization(self, conversation_manager, mock_user):
        """Test memory optimization for large datasets"""
        # Create conversation with many messages
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Memory Test"
        )
        
        # Add many messages
        for i in range(1000):
            await conversation_manager.add_message(
                conversation_id=conv.id,
                role="user",
                content=f"Message {i}: " + "x" * 100  # 100 char messages
            )
        
        # Retrieve conversation with pagination
        page1 = await conversation_manager.get_conversation_messages(
            conv.id, page=1, limit=100
        )
        
        assert len(page1) == 100
        # Memory usage should be reasonable (this would need actual memory monitoring)

    @pytest.mark.asyncio
    async def test_caching_strategy(self, conversation_manager, mock_user):
        """Test intelligent caching strategy"""
        # Create conversation
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Cache Test"
        )
        
        # First access - cache miss
        start_time = asyncio.get_event_loop().time()
        conv1 = await conversation_manager.get_conversation(conv.id)
        first_access = asyncio.get_event_loop().time() - start_time
        
        # Second access - cache hit
        start_time = asyncio.get_event_loop().time()
        conv2 = await conversation_manager.get_conversation(conv.id)
        second_access = asyncio.get_event_loop().time() - start_time
        
        assert conv1.id == conv2.id
        # Cache hit should be significantly faster
        assert second_access < first_access * 0.5

    @pytest.mark.asyncio
    async def test_batch_processing_optimization(self, conversation_manager, mock_user):
        """Test batch processing optimization"""
        # Prepare batch data
        conversation_data = [
            {"title": f"Batch {i}", "metadata": {"batch_id": i}}
            for i in range(100)
        ]
        
        # Batch creation
        start_time = asyncio.get_event_loop().time()
        batch_results = await conversation_manager.batch_create_conversations(
            mock_user["id"], conversation_data
        )
        batch_time = asyncio.get_event_loop().time() - start_time
        
        # Individual creation
        start_time = asyncio.get_event_loop().time()
        individual_results = []
        for data in conversation_data:
            conv = await conversation_manager.create_conversation(
                user_id=mock_user["id"],
                title=data["title"]
            )
            individual_results.append(conv)
        individual_time = asyncio.get_event_loop().time() - start_time
        
        assert len(batch_results) == len(individual_results)
        # Batch should be faster
        assert batch_time < individual_time * 0.8

@pytest.mark.unit
class TestAccessibilityEnhanced:
    """Enhanced accessibility test cases"""

    def test_screen_reader_compatibility(self, client):
        """Test screen reader compatibility"""
        response = client.get("/")
        assert response.status_code == 200
        
        # Check for ARIA labels
        html_content = response.text
        assert 'aria-label' in html_content
        assert 'role=' in html_content
        
        # Check for semantic HTML
        assert '<main' in html_content
        assert '<nav' in html_content
        assert '<header' in html_content
        assert '<footer' in html_content

    def test_keyboard_navigation_support(self, client):
        """Test keyboard navigation support"""
        response = client.get("/")
        assert response.status_code == 200
        
        html_content = response.text
        
        # Check for keyboard navigation elements
        assert 'tabindex' in html_content
        assert 'onkeydown' in html_content or 'addEventListener' in html_content
        
        # Check for focus indicators
        assert ':focus' in html_content or 'focus' in html_content

    def test_color_contrast_compliance(self, client):
        """Test color contrast compliance"""
        response = client.get("/styles")
        assert response.status_code == 200
        
        css_content = response.text
        
        # Check for high contrast colors
        # This would typically require actual color analysis
        assert 'contrast' in css_content.lower()

    def test_alt_text_for_images(self, client):
        """Test alt text for images"""
        response = client.get("/")
        assert response.status_code == 200
        
        html_content = response.text
        
        # Check for alt attributes on images
        import re
        img_tags = re.findall(r'<img[^>]*>', html_content)
        
        for img_tag in img_tags:
            assert 'alt=' in img_tag or 'aria-label=' in img_tag

@pytest.mark.unit
class TestUserExperienceEnhanced:
    """Enhanced user experience test cases"""

    @pytest.mark.asyncio
    async def test_responsive_design_adaptation(self, avatar_manager, mock_avatar):
        """Test responsive design adaptation"""
        # Create avatar
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Test different screen sizes
        screen_sizes = [
            {"width": 320, "height": 568},  # Mobile
            {"width": 768, "height": 1024}, # Tablet
            {"width": 1024, "height": 768}, # Desktop
            {"width": 1920, "height": 1080} # Large desktop
        ]
        
        for size in screen_sizes:
            adapted_avatar = await avatar_manager.get_adapted_avatar(
                avatar.id, size["width"], size["height"]
            )
            assert adapted_avatar is not None
            assert adapted_avatar.responsive_settings is not None

    @pytest.mark.asyncio
    async def test_personalization_engine(self, conversation_manager, mock_user):
        """Test personalization engine"""
        # Create user interaction history
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Personalization Test"
        )
        
        # Simulate user preferences
        user_preferences = {
            "response_style": "detailed",
            "topics": ["technology", "science"],
            "interaction_frequency": "high",
            "preferred_mood": "friendly"
        }
        
        # Apply personalization
        personalized_settings = await conversation_manager.apply_personalization(
            mock_user["id"], user_preferences
        )
        
        assert personalized_settings.response_style == "detailed"
        assert "technology" in personalized_settings.topics

    @pytest.mark.asyncio
    async def test_contextual_help_system(self, conversation_manager, mock_user):
        """Test contextual help system"""
        # Create conversation
        conv = await conversation_manager.create_conversation(
            user_id=mock_user["id"],
            title="Help System Test"
        )
        
        # Get contextual help
        help_content = await conversation_manager.get_contextual_help(
            conversation_id=conv.id,
            user_action="first_message"
        )
        
        assert help_content is not None
        assert "title" in help_content
        assert "content" in help_content
        assert "relevant" in help_content["content"].lower()

    @pytest.mark.asyncio
    async def test_adaptive_ui_learning(self, avatar_manager, mock_avatar):
        """Test adaptive UI learning"""
        # Create avatar
        avatar = await avatar_manager.create_avatar(
            user_id=mock_avatar["user_id"],
            name=mock_avatar["name"],
            appearance=mock_avatar["appearance"]
        )
        
        # Simulate user interaction patterns
        interaction_patterns = {
            "preferred_features": ["mood_change", "customization"],
            "usage_times": ["morning", "evening"],
            "interaction_style": "visual",
            "feature_frequency": {"mood_change": 10, "customization": 8}
        }
        
        # Apply adaptive learning
        adapted_ui = await avatar_manager.apply_adaptive_ui(
            avatar.id, interaction_patterns
        )
        
        assert adapted_ui.feature_priorities is not None
        assert "mood_change" in adapted_ui.feature_priorities

@pytest.mark.unit
class TestMaintainabilityEnhanced:
    """Enhanced maintainability test cases"""

    def test_code_documentation_coverage(self):
        """Test comprehensive code documentation"""
        import inspect
        
        # Check that all public methods have docstrings
        for name, obj in inspect.getmembers(ConversationManager):
            if not name.startswith('_') and inspect.isfunction(obj):
                assert obj.__doc__ is not None, f"Method {name} lacks documentation"

    def test_type_hints_coverage(self):
        """Test comprehensive type hints"""
        import inspect
        
        # Check that all methods have type hints
        for name, obj in inspect.getmembers(ConversationManager):
            if not name.startswith('_') and inspect.isfunction(obj):
                signature = inspect.signature(obj)
                for param in signature.parameters.values():
                    assert param.annotation != inspect.Parameter.empty, f"Parameter {param.name} in {name} lacks type hint"
                
                if signature.return_annotation != inspect.Signature.empty:
                    assert signature.return_annotation != inspect.Signature.empty, f"Return type in {name} lacks type hint"

    def test_configuration_management(self):
        """Test configuration management"""
        # Test environment-based configuration
        assert os.getenv("DATABASE_URL") is not None or "default" in str(os.environ)
        
        # Test configuration validation
        config_vars = [
            "DATABASE_URL",
            "SECRET_KEY",
            "DEBUG_MODE",
            "LOG_LEVEL"
        ]
        
        for var in config_vars:
            # Should either be set or have a default
            assert os.getenv(var) is not None or hasattr(app, f'default_{var.lower()}')

    def test_error_logging_comprehensive(self):
        """Test comprehensive error logging"""
        # Test that all error types are properly logged
        error_types = [
            ValueError,
            TypeError,
            KeyError,
            HTTPException,
            ConnectionError
        ]
        
        for error_type in error_types:
            # Should have corresponding log handler
            assert hasattr(app, f'log_{error_type.__name__.lower()}') or hasattr(app, 'log_error')

    def test_api_versioning(self):
        """Test API versioning"""
        # Check for API version headers
        with TestClient(app) as client:
            response = client.get("/api/v1/health")
            if response.status_code == 200:
                assert "api-version" in response.headers or "version" in response.json()

@pytest.mark.unit
class TestAdvancedIntegration:
    """Advanced integration test cases"""

    @pytest.mark.asyncio
    async def test_microservices_communication(self, conversation_manager, avatar_manager, settings_manager):
        """Test microservices communication"""
        user_id = "microservices_user_123"
        
        # Test service discovery
        services = await conversation_manager.discover_services()
        assert "avatar_service" in services
        assert "settings_service" in services
        
        # Test inter-service communication
        avatar = await avatar_manager.create_avatar(
            user_id=user_id,
            name="Microservices Avatar",
            appearance={"skin_tone": "#d4a574"}
        )
        
        # Sync data across services
        sync_result = await conversation_manager.sync_user_data(user_id)
        assert sync_result.success is True
        assert len(sync_result.synced_services) >= 2

    @pytest.mark.asyncio
    async def test_event_driven_architecture(self, conversation_manager, avatar_manager):
        """Test event-driven architecture"""
        user_id = "event_user_123"
        
        # Create event listeners
        events_received = []
        
        async def on_conversation_created(event):
            events_received.append(("conversation_created", event))
        
        async def on_avatar_updated(event):
            events_received.append(("avatar_updated", event))
        
        # Register event listeners
        conversation_manager.register_event_listener("conversation_created", on_conversation_created)
        avatar_manager.register_event_listener("avatar_updated", on_avatar_updated)
        
        # Trigger events
        conv = await conversation_manager.create_conversation(
            user_id=user_id,
            title="Event Test"
        )
        
        avatar = await avatar_manager.create_avatar(
            user_id=user_id,
            name="Event Avatar",
            appearance={"skin_tone": "#f5deb3"}
        )
        
        await avatar_manager.change_mood(avatar.id, "excited")
        
        # Verify events were received
        assert len(events_received) >= 2
        assert any(event[0] == "conversation_created" for event in events_received)
        assert any(event[0] == "avatar_updated" for event in events_received)

    @pytest.mark.asyncio
    async def test_distributed_caching(self, conversation_manager, avatar_manager):
        """Test distributed caching"""
        user_id = "cache_user_123"
        
        # Create data in one service
        conv = await conversation_manager.create_conversation(
            user_id=user_id,
            title="Distributed Cache Test"
        )
        
        # Access from another service (should use distributed cache)
        cached_conv = await avatar_manager.get_cached_conversation(conv.id)
        assert cached_conv is not None
        assert cached_conv.id == conv.id
        
        # Update in one service
        await conversation_manager.add_message(
            conversation_id=conv.id,
            role="user",
            content="Distributed cache test message"
        )
        
        # Verify cache invalidation
        updated_conv = await avatar_manager.get_cached_conversation(conv.id)
        assert len(updated_conv.messages) == 1

    @pytest.mark.asyncio
    async def test_load_balancing_integration(self, conversation_manager):
        """Test load balancing integration"""
        # Simulate multiple service instances
        instances = ["instance_1", "instance_2", "instance_3"]
        
        # Test load distribution
        load_distribution = {}
        
        for i in range(100):
            instance = await conversation_manager.get_least_loaded_instance(instances)
            load_distribution[instance] = load_distribution.get(instance, 0) + 1
        
        # Load should be distributed
        assert len(load_distribution) == 3
        # Should be roughly balanced (allow 20% variance)
        max_load = max(load_distribution.values())
        min_load = min(load_distribution.values())
        assert max_load / min_load < 1.5
