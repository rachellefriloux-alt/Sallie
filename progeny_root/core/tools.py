"""Surrogate tools and capability contracts."""

import os
import subprocess
import logging
from pathlib import Path
from typing import Dict, Any, Callable, Optional
from datetime import datetime

# Setup logging
logger = logging.getLogger("tools")

class ToolRegistry:
    """
    Registry of available tools for the Agency System.
    """
    def __init__(self):
        self._registry: Dict[str, Callable] = {}
        self._register_defaults()

    def _register_defaults(self):
        self.register("read_file", self._read_file)
        self.register("write_file", self._write_file)
        self.register("list_dir", self._list_dir)
        self.register("git_status", self._git_status)
        self.register("git_commit", self._git_commit)
        self.register("shell_exec", self._shell_exec)

    def register(self, name: str, func: Callable):
        self._registry[name] = func

    def has_tool(self, name: str) -> bool:
        return name in self._registry

    def run(self, name: str, args: Dict[str, Any], tier: int) -> Any:
        """
        Runs the tool. The AgencySystem has already checked high-level permissions.
        This method handles tool-specific logic and safety nets.
        """
        func = self._registry[name]
        
        # Safety Net: For Partner tier (2), ensure git state is clean or commit before write
        if name == "write_file" and tier == 2: # Partner
            self._ensure_safety_net()

        return func(**args)

    def _ensure_safety_net(self):
        """
        Partner Tier Safety: Auto-commit before changes to allow rollback.
        """
        try:
            status = self._git_status()
            if "clean" not in status:
                logger.info("Safety Net: Auto-committing before write.")
                self._git_commit(message=f"Safety Net: Pre-write auto-commit {datetime.now().isoformat()}")
        except Exception as e:
            logger.warning(f"Safety Net failed: {e}")

    # --- Tool Implementations ---

    def _read_file(self, path: str) -> str:
        p = Path(path)
        if not p.exists():
            raise FileNotFoundError(f"File not found: {path}")
        return p.read_text(encoding="utf-8")

    def _write_file(self, path: str, content: str) -> str:
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return f"Wrote {len(content)} chars to {path}"

    def _list_dir(self, path: str = ".") -> list:
        p = Path(path)
        if not p.exists():
            return []
        return [f.name for f in p.iterdir()]

    def _git_status(self) -> str:
        try:
            result = subprocess.run(
                ["git", "status", "--porcelain"], 
                capture_output=True, text=True, check=True
            )
            if not result.stdout.strip():
                return "clean"
            return "dirty"
        except FileNotFoundError:
            return "error: git not found"
        except subprocess.CalledProcessError:
            return "error: not a git repo"

    def _git_commit(self, message: str) -> str:
        try:
            subprocess.run(["git", "add", "."], check=True)
            subprocess.run(["git", "commit", "-m", message], check=True)
            return f"Committed: {message}"
        except FileNotFoundError:
            return "error: git not found"

    def _shell_exec(self, command: str) -> str:
        """
        Executes a shell command.
        Strictly limited to the 'safe_scripts' directory for safety.
        """
        # Security check: Ensure command starts with safe_scripts/ or is a known safe command
        # For this implementation, we'll be strict.
        safe_dir = Path("safe_scripts")
        if not safe_dir.exists():
            safe_dir.mkdir()
            
        # Basic sanitization (very simple)
        # We allow running scripts in safe_scripts/
        if not command.startswith("safe_scripts/") and not command.startswith("python safe_scripts/"):
             # Allow simple echo for testing
             if not command.startswith("echo "):
                raise PermissionError("Command must be within safe_scripts/ directory.")

        try:
            # Split command for subprocess (naive splitting)
            import shlex
            parts = shlex.split(command)
            result = subprocess.run(
                parts, 
                capture_output=True, 
                text=True, 
                check=True,
                timeout=10
            )
            return result.stdout
        except subprocess.CalledProcessError as e:
            return f"Error: {e.stderr}"
        except Exception as e:
            return f"Execution failed: {e}"
        except subprocess.CalledProcessError as e:
            return f"Commit failed: {e}"
