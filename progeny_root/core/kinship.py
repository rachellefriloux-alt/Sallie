"""Multi-user context and authentication (Kinship)."""

import logging
import os
from typing import Optional, Dict

logger = logging.getLogger("system")

class KinshipSystem:
    """
    Manages user identity, authentication, and context switching.
    """
    def __init__(self):
        self.active_user = "creator" # Default to Creator
        # Simple in-memory user store. In production, use a DB or secure file.
        self.users: Dict[str, str] = {
            "creator_token": "creator",
            "guest_token": "guest"
        }
        
        # Load from env if available
        env_token = os.getenv("PROGENY_CREATOR_TOKEN")
        if env_token:
            self.users[env_token] = "creator"

    def authenticate(self, token: str) -> str:
        """
        Identifies the user based on token.
        """
        user = self.users.get(token)
        if user:
            logger.info(f"User authenticated: {user}")
            return user
        logger.warning("Authentication failed.")
        return "anonymous"

    def switch_context(self, user_id: str):
        """
        Swaps the active LimbicState and Memory partition.
        """
        logger.info(f"Switching context to user: {user_id}")
        self.active_user = user_id
        # In a real impl, this would load a different soul.json
        # For now, we just track the active user ID.

    def enforce_boundaries(self, user_id: str) -> bool:
        """
        Ensures Kin cannot access Creator-private logs.
        """
        if user_id == "creator":
            return True
        return False
