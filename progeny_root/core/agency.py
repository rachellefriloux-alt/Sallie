"""Permission matrix and agency enforcement."""

import logging
from enum import IntEnum
from pathlib import Path
from typing import Optional, List, Dict, Any

from .limbic import LimbicSystem
from .tools import ToolRegistry

# Setup logging
logger = logging.getLogger("agency")

class TrustTier(IntEnum):
    STRANGER = 0  # Trust 0.0 - 0.6
    ASSOCIATE = 1 # Trust 0.6 - 0.8
    PARTNER = 2   # Trust 0.8 - 0.9
    SURROGATE = 3 # Trust 0.9 - 1.0

class AgencySystem:
    """
    Manages permissions, trust tiers, and tool execution safety.
    """
    def __init__(self, limbic: LimbicSystem):
        self.limbic = limbic
        self.tools = ToolRegistry()
        self.whitelist = [
            Path("progeny_root/drafts"),
            Path("progeny_root/working"),
            Path("progeny_root/outbox")
        ]
        # Partner+ can access more, but these are the safe defaults

    def get_tier(self) -> TrustTier:
        """Calculates the current Agency Tier based on Trust."""
        t = self.limbic.state.trust
        if t < 0.6: return TrustTier.STRANGER
        if t < 0.8: return TrustTier.ASSOCIATE
        if t < 0.9: return TrustTier.PARTNER
        return TrustTier.SURROGATE

    def check_permission(self, action_type: str, target_path: Optional[str] = None) -> bool:
        """
        Determines if an action is allowed based on current Tier.
        """
        tier = self.get_tier()
        path_obj = Path(target_path) if target_path else None

        # Tier 0: Stranger (Read-only, Suggestion only)
        if tier == TrustTier.STRANGER:
            if action_type == "read": return True
            return False

        # Tier 1: Associate (Write to drafts only)
        if tier == TrustTier.ASSOCIATE:
            if action_type == "read": return True
            if action_type == "write":
                if path_obj and self._is_in_whitelist(path_obj):
                    return True
            return False

        # Tier 2: Partner (Write with Git Commit)
        if tier == TrustTier.PARTNER:
            if action_type in ["read", "write", "git_commit"]: return True
            # Allow shell execution, but the tool itself enforces 'safe_scripts/' restriction
            if action_type == "shell_exec": return True
            return False

        # Tier 3: Surrogate (Full Autonomy)
        if tier == TrustTier.SURROGATE:
            return True

        return False

    def _is_in_whitelist(self, path: Path) -> bool:
        """Checks if path is within allowed directories."""
        try:
            abs_path = path.resolve()
            for allowed in self.whitelist:
                if str(abs_path).startswith(str(allowed.resolve())):
                    return True
        except Exception:
            pass
        return False

    def execute_tool(self, tool_name: str, args: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a tool if permitted by the current Trust Tier.
        """
        tier = self.get_tier()
        logger.info(f"Requesting tool: {tool_name} at Tier: {tier.name}")

        # 1. Check if tool exists
        if not self.tools.has_tool(tool_name):
            return {"status": "error", "message": f"Tool '{tool_name}' not found."}

        # 2. Check Permissions (High-level)
        # Specific path checks happen inside the tool or check_permission helper
        if tool_name.startswith("write_") and not self.check_permission("write", args.get("path")):
             return {"status": "denied", "message": f"Write permission denied at Tier {tier.name}."}
        
        if tool_name == "shell_exec" and tier < TrustTier.SURROGATE:
             return {"status": "denied", "message": "Shell execution requires SURROGATE tier."}

        # 3. Execute
        try:
            result = self.tools.run(tool_name, args, tier)
            return {"status": "success", "result": result}
        except Exception as e:
            logger.error(f"Tool execution failed: {e}")
            return {"status": "error", "message": str(e)}
