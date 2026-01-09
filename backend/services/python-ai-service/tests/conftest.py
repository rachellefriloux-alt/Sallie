import pytest
import asyncio
import json
import time
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient
from fastapi import FastAPI
import sys
import os

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sallie_server_with_sync import app, SallieServer, ConversationManager, AvatarManager, SettingsManager

@pytest.fixture
def client():
    """Create a test client for the FastAPI application"""
    return TestClient(app)

@pytest.fixture
def sallie_server():
    """Create a SallieServer instance for testing"""
    return SallieServer()

@pytest.fixture
def conversation_manager():
    """Create a ConversationManager instance for testing"""
    return ConversationManager()

@pytest.fixture
def avatar_manager():
    """Create an AvatarManager instance for testing"""
    return AvatarManager()

@pytest.fixture
def settings_manager():
    """Create a SettingsManager instance for testing"""
    return SettingsManager()

@pytest.fixture
def mock_user():
    """Mock user data for testing"""
    return {
        "id": "test-user-123",
        "email": "test@sallie.com",
        "name": "Test User",
        "created_at": "2024-01-01T00:00:00Z"
    }

@pytest.fixture
def mock_conversation():
    """Mock conversation data for testing"""
    return {
        "id": "conv-123",
        "user_id": "test-user-123",
        "title": "Test Conversation",
        "messages": [
            {
                "id": "msg-1",
                "role": "user",
                "content": "Hello Sallie!",
                "timestamp": "2024-01-01T12:00:00Z"
            },
            {
                "id": "msg-2",
                "role": "assistant",
                "content": "Hello! How can I help you today?",
                "timestamp": "2024-01-01T12:00:01Z"
            }
        ],
        "created_at": "2024-01-01T12:00:00Z",
        "updated_at": "2024-01-01T12:00:01Z"
    }

@pytest.fixture
def mock_avatar():
    """Mock avatar data for testing"""
    return {
        "id": "avatar-123",
        "user_id": "test-user-123",
        "name": "Sallie",
        "appearance": {
            "skin_tone": "#f4c2a1",
            "hair_color": "#8b4513",
            "eye_color": "#4a90e2",
            "outfit": "casual"
        },
        "mood": "happy",
        "personality": "friendly",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }

@pytest.fixture
def mock_settings():
    """Mock settings data for testing"""
    return {
        "user_id": "test-user-123",
        "theme": "dark",
        "language": "en",
        "notifications": {
            "email": True,
            "push": True,
            "desktop": False
        },
        "privacy": {
            "data_collection": False,
            "analytics": True
        },
        "accessibility": {
            "font_size": "medium",
            "high_contrast": False,
            "reduced_motion": False
        }
    }

# Test utilities
def create_mock_request(data):
    """Create a mock request object"""
    mock_request = Mock()
    mock_request.json.return_value = data
    mock_request.headers = {"authorization": "Bearer mock-token"}
    return mock_request

def create_mock_websocket():
    """Create a mock WebSocket connection"""
    mock_ws = Mock()
    mock_ws.send_text = AsyncMock()
    mock_ws.receive_text = AsyncMock()
    mock_ws.close = AsyncMock()
    return mock_ws

async def wait_for_condition(condition, timeout=5.0, interval=0.1):
    """Wait for a condition to become true"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if condition():
            return True
        await asyncio.sleep(interval)
    return False

# Performance testing utilities
def measure_time(func):
    """Decorator to measure execution time"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        return result, end_time - start_time
    return wrapper

async def measure_async_time(func):
    """Decorator to measure async execution time"""
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        end_time = time.time()
        return result, end_time - start_time
    return wrapper

# Database testing utilities
class MockDatabase:
    """Mock database for testing"""
    
    def __init__(self):
        self.data = {}
        self.collections = {
            "users": {},
            "conversations": {},
            "avatars": {},
            "settings": {},
            "messages": {}
        }
    
    async def insert_one(self, collection, document):
        """Insert a document into a collection"""
        if collection not in self.collections:
            self.collections[collection] = {}
        
        doc_id = document.get("id") or f"{collection}_{len(self.collections[collection]) + 1}"
        document["id"] = doc_id
        self.collections[collection][doc_id] = document.copy()
        return document
    
    async def find_one(self, collection, query):
        """Find one document in a collection"""
        if collection not in self.collections:
            return None
        
        for doc in self.collections[collection].values():
            if all(doc.get(k) == v for k, v in query.items()):
                return doc.copy()
        return None
    
    async def find_many(self, collection, query=None):
        """Find many documents in a collection"""
        if collection not in self.collections:
            return []
        
        if query is None:
            return [doc.copy() for doc in self.collections[collection].values()]
        
        results = []
        for doc in self.collections[collection].values():
            if all(doc.get(k) == v for k, v in query.items()):
                results.append(doc.copy())
        return results
    
    async def update_one(self, collection, query, update):
        """Update one document in a collection"""
        if collection not in self.collections:
            return None
        
        for doc_id, doc in self.collections[collection].items():
            if all(doc.get(k) == v for k, v in query.items()):
                doc.update(update)
                return doc.copy()
        return None
    
    async def delete_one(self, collection, query):
        """Delete one document from a collection"""
        if collection not in self.collections:
            return False
        
        for doc_id, doc in list(self.collections[collection].items()):
            if all(doc.get(k) == v for k, v in query.items()):
                del self.collections[collection][doc_id]
                return True
        return False
    
    async def clear_collection(self, collection):
        """Clear all documents from a collection"""
        if collection in self.collections:
            self.collections[collection] = {}
    
    def clear_all(self):
        """Clear all collections"""
        for collection in self.collections:
            self.collections[collection] = {}

# WebSocket testing utilities
class MockWebSocketManager:
    """Mock WebSocket manager for testing"""
    
    def __init__(self):
        self.connections = {}
        self.messages = []
    
    async def connect(self, user_id, websocket):
        """Connect a WebSocket"""
        self.connections[user_id] = websocket
    
    async def disconnect(self, user_id):
        """Disconnect a WebSocket"""
        if user_id in self.connections:
            del self.connections[user_id]
    
    async def send_message(self, user_id, message):
        """Send a message to a user"""
        if user_id in self.connections:
            await self.connections[user_id].send_text(json.dumps(message))
            self.messages.append({"user_id": user_id, "message": message})
    
    async def broadcast(self, message):
        """Broadcast a message to all connected users"""
        for user_id, websocket in self.connections.items():
            await websocket.send_text(json.dumps(message))
            self.messages.append({"user_id": user_id, "message": message})
    
    def get_messages(self, user_id=None):
        """Get messages for a user or all messages"""
        if user_id:
            return [msg for msg in self.messages if msg["user_id"] == user_id]
        return self.messages.copy()
    
    def clear_messages(self):
        """Clear all messages"""
        self.messages = []

# Authentication testing utilities
class MockAuth:
    """Mock authentication for testing"""
    
    def __init__(self):
        self.users = {}
        self.tokens = {}
    
    def create_user(self, user_data):
        """Create a user"""
        user_id = user_data.get("id") or f"user_{len(self.users) + 1}"
        user_data["id"] = user_id
        self.users[user_id] = user_data.copy()
        return user_data
    
    def generate_token(self, user_id):
        """Generate a token for a user"""
        token = f"mock-token-{user_id}-{int(time.time())}"
        self.tokens[token] = user_id
        return token
    
    def verify_token(self, token):
        """Verify a token and return user_id"""
        return self.tokens.get(token)
    
    def get_user(self, user_id):
        """Get user data"""
        return self.users.get(user_id)
    
    def clear_all(self):
        """Clear all users and tokens"""
        self.users = {}
        self.tokens = {}

# File system testing utilities
class MockFileSystem:
    """Mock file system for testing"""
    
    def __init__(self):
        self.files = {}
        self.directories = set()
    
    def create_file(self, path, content=""):
        """Create a file"""
        self.files[path] = content
    
    def read_file(self, path):
        """Read a file"""
        return self.files.get(path)
    
    def write_file(self, path, content):
        """Write to a file"""
        self.files[path] = content
    
    def delete_file(self, path):
        """Delete a file"""
        if path in self.files:
            del self.files[path]
    
    def create_directory(self, path):
        """Create a directory"""
        self.directories.add(path)
    
    def delete_directory(self, path):
        """Delete a directory"""
        if path in self.directories:
            self.directories.remove(path)
            # Also delete all files in this directory
            files_to_delete = [f for f in self.files.keys() if f.startswith(path)]
            for file_path in files_to_delete:
                del self.files[file_path]
    
    def file_exists(self, path):
        """Check if a file exists"""
        return path in self.files
    
    def directory_exists(self, path):
        """Check if a directory exists"""
        return path in self.directories
    
    def list_files(self, path=None):
        """List files"""
        if path:
            return [f for f in self.files.keys() if f.startswith(path)]
        return list(self.files.keys())
    
    def clear_all(self):
        """Clear all files and directories"""
        self.files = {}
        self.directories = set()

# Test configuration
TEST_CONFIG = {
    "database_url": "sqlite:///:memory:",
    "jwt_secret": "test-secret",
    "test_mode": True,
    "debug": True,
    "log_level": "DEBUG"
}

# Test markers
pytest_plugins = []

def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "unit: mark test as a unit test"
    )
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "performance: mark test as a performance test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "websocket: mark test as websocket test"
    )
    config.addinivalue_line(
        "markers", "auth: mark test as authentication test"
    )

# Test hooks
def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers"""
    for item in items:
        # Add unit test marker to tests in unit directory
        if "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)
        # Add integration test marker to tests in integration directory
        elif "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        # Add performance test marker to tests in performance directory
        elif "performance" in str(item.fspath):
            item.add_marker(pytest.mark.performance)
            item.add_marker(pytest.mark.slow)
