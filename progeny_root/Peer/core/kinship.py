"""Multi-Context Kinship (Section 13).

Single-soul mode: one limbic state shared across all kin, while allowing
per-user behavior profiles (tone, boundaries, preferences) without forking
the soul file. This keeps Sallie consistent yet adaptive.

Enhanced with:
- Multi-user context isolation (behavioral only; single soul)
- Per-user context profiles (tone/permissions/preferences)
- Authentication API
- Context switching
"""

import logging
import os
import json
import time
from typing import Optional, Dict, Any, List
from pathlib import Path
from datetime import datetime

logger = logging.getLogger("kinship")

class KinshipSystem:
    """
    Kinship System - Section 13.
    
    Manages multi-user contexts with isolation while maintaining a single
    shared limbic state (soul). Behavior can vary per user through context
    profiles, but the underlying emotional state is unified.
    """
    
    def __init__(self):
        self.active_user = "creator"  # Default to Creator
        self.active_context = "creator"
        
        # User store (in production, use secure database)
        self.users: Dict[str, Dict[str, Any]] = {
            "creator": {
                "id": "creator",
                "role": "creator",
                "permissions": ["all"],
                "token": os.getenv("PROGENY_CREATOR_TOKEN", "creator_token")
            }
        }
        
        # Context isolation (Section 13.3)
        self.context_states: Dict[str, Any] = {}
        self.memory_partitions: Dict[str, str] = {}

        # Per-user behavioral profiles (tone, posture hints, guardrails)
        self.context_profiles: Dict[str, Dict[str, Any]] = {
            "creator": {"tone": "direct", "warmth_bias": 0.0, "posture": None}
        }
        
        # Session management
        self.sessions: Dict[str, Dict[str, Any]] = {}
        
        logger.info("[Kinship] Kinship system initialized")
    
    def authenticate(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Authenticate user by token (Section 13.4).
        
        Args:
            token: Authentication token
            
        Returns:
            User dict or None if authentication fails
        """
        for user_id, user_data in self.users.items():
            if user_data.get("token") == token:
                logger.info(f"[Kinship] User authenticated: {user_id}")
                return user_data
        
        logger.warning("[Kinship] Authentication failed")
        return None
    
    def register_kin(self, user_id: str, permissions: List[str], token: Optional[str] = None) -> bool:
        """
        Register a new Kin user.
        
        Args:
            user_id: Unique user identifier
            permissions: List of granted permissions
            token: Optional authentication token
            
        Returns:
            True if registration successful
        """
        if user_id in self.users:
            logger.warning(f"[Kinship] User {user_id} already exists")
            return False
        
        self.users[user_id] = {
            "id": user_id,
            "role": "kin",
            "permissions": permissions,
            "token": token or f"{user_id}_token_{int(time.time())}"
        }
        
        # Create separate memory partition
        self.memory_partitions[user_id] = f"memory_{user_id}"
        
        logger.info(f"[Kinship] Registered Kin: {user_id}")
        return True
    
    def switch_context(self, user_id: str, limbic_system=None, memory_system=None):
        """
        Switch active context (Section 13.5).
        
        Args:
            user_id: User to switch to
            limbic_system: LimbicSystem instance (to load user-specific state)
            memory_system: MemorySystem instance (to switch partition)
        """
        if user_id not in self.users:
            logger.error(f"[Kinship] User {user_id} not found")
            return False
        
        previous_context = self.active_context
        self.active_context = user_id
        self.active_user = user_id
        
        # Single-soul policy: always use the shared limbic state
        if limbic_system:
            logger.info("[Kinship] Single-soul mode active; shared limbic state in use")
            profile = self.get_context_profile(user_id)
            # Hint to callers: they can adjust tone/posture transiently without
            # persisting a separate soul file.
            limbic_system.cache.set("active_context_profile", profile) if hasattr(limbic_system, "cache") else None
        
        # Switch memory partition
        if memory_system and user_id in self.memory_partitions:
            partition = self.memory_partitions[user_id]
            # In production, would switch Qdrant collection
            logger.info(f"[Kinship] Switched to memory partition: {partition}")
        
        logger.info(f"[Kinship] Context switched: {previous_context} -> {user_id}")
        return True

    def set_context_profile(self, user_id: str, profile: Dict[str, Any]) -> None:
        """Define or update a user's behavioral profile without forking the soul."""
        self.context_profiles[user_id] = profile

    def get_context_profile(self, user_id: str) -> Dict[str, Any]:
        """Fetch a user's behavioral profile (tone, posture hints, guardrails)."""
        return self.context_profiles.get(user_id, {"tone": "default", "posture": None})
    
    def enforce_boundaries(self, user_id: str, resource: str) -> bool:
        """
        Enforce access boundaries (Section 13.4).
        
        Args:
            user_id: User requesting access
            resource: Resource identifier
            
        Returns:
            True if access allowed
        """
        if user_id == "creator":
            return True  # Creator has full access
        
        user = self.users.get(user_id)
        if not user:
            return False
        
        # Kin cannot access Creator-private logs
        if resource.startswith("creator_private") or resource == "thoughts.log":
            return False
        
        # Check permissions
        permissions = user.get("permissions", [])
        if "all" in permissions:
            return True
        
        # Resource-specific checks would go here
        return True
    
    def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """
        Get context information for a user.
        
        Args:
            user_id: User identifier
            
        Returns:
            Context information
        """
        user = self.users.get(user_id)
        if not user:
            return {}
        
        return {
            "user_id": user_id,
            "role": user.get("role"),
            "permissions": user.get("permissions", []),
            "memory_partition": self.memory_partitions.get(user_id),
            "is_active": user_id == self.active_context
        }
    
    def create_session(self, user_id: str, token: str) -> Optional[str]:
        """
        Create a new session for a user.
        
        Args:
            user_id: User identifier
            token: Authentication token
            
        Returns:
            Session ID or None if failed
        """
        # Verify authentication
        user = self.authenticate(token)
        if not user or user.get("id") != user_id:
            return None
        
        # Create session
        session_id = f"{user_id}_{int(time.time())}"
        self.sessions[session_id] = {
            "user_id": user_id,
            "created_at": time.time(),
            "last_activity": time.time(),
            "token": token
        }
        
        logger.info(f"[Kinship] Created session: {session_id} for {user_id}")
        return session_id
    
    def validate_session(self, session_id: str) -> bool:
        """
        Validate a session.
        
        Args:
            session_id: Session identifier
            
        Returns:
            True if session is valid
        """
        session = self.sessions.get(session_id)
        if not session:
            return False
        
        # Check if session expired (1 hour default)
        if time.time() - session.get("last_activity", 0) > 3600:
            del self.sessions[session_id]
            return False
        
        # Update last activity
        session["last_activity"] = time.time()
        return True
