"""Surrogate tools and capability contracts."""

import os
import subprocess
import logging
from pathlib import Path
from typing import Dict, Any, Callable, Optional, List
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
        Runs the tool with safety nets (not restrictions).
        In advisory mode, all tools can run with transparency and rollback.
        Note: Pre-action commits are handled by AgencySystem, not here.
        """
        func = self._registry[name]

        # Log all tool executions for transparency
        logger.info(f"[TOOL] Executing {name} with args: {args}")
        
        try:
            result = func(**args)
            logger.info(f"[TOOL] {name} completed successfully")
            return result
        except Exception as e:
            logger.error(f"[TOOL] {name} failed: {e}")
            raise
    
    def create_pre_action_commit(self, action_description: str, affected_files: Optional[List[str]] = None) -> Optional[str]:
        """
        Create a pre-action commit for file modifications.
        Returns commit hash if successful, None otherwise.
        """
        return self._ensure_safety_net(action_description, affected_files)

    def _ensure_safety_net(self, action_description: str = None, affected_files: list = None) -> Optional[str]:
        """
        Partner Tier Safety: Create pre-action commit before file modifications.
        Returns commit hash if successful, None otherwise.
        """
        try:
            # If no affected files specified, check git status for changes
            if affected_files is None:
                status = self._git_status()
                if "clean" in status or "error" in status:
                    return None  # No changes to commit
            
            # Stage only affected files if specified, otherwise stage all
            if affected_files:
                for file_path in affected_files:
                    try:
                        subprocess.run(
                            ["git", "add", str(file_path)],
                            check=True,
                            capture_output=True
                        )
                    except Exception as e:
                        logger.warning(f"Failed to stage {file_path}: {e}")
            else:
                # Stage all changes
                subprocess.run(["git", "add", "."], check=True, capture_output=True)
            
            # Create commit with proper message format
            description = action_description or f"Pre-action snapshot {datetime.now().isoformat()}"
            commit_message = f"[PROGENY] Pre-action snapshot: {description}"
            
            result = subprocess.run(
                ["git", "commit", "-m", commit_message],
                check=True,
                capture_output=True,
                text=True
            )
            
            # Extract commit hash from output
            commit_hash = self._get_latest_commit_hash()
            logger.info(f"Safety Net: Created pre-action commit {commit_hash}")
            return commit_hash
            
        except FileNotFoundError:
            logger.warning("Safety Net: git not found - skipping pre-action commit")
            return None
        except subprocess.CalledProcessError as e:
            logger.warning(f"Safety Net: git commit failed: {e.stderr if hasattr(e, 'stderr') else str(e)}")
            return None
        except Exception as e:
            logger.warning(f"Safety Net failed: {e}")
            return None
    
    def _get_latest_commit_hash(self) -> Optional[str]:
        """Get the hash of the latest commit."""
        try:
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except Exception:
            return None

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
        """Create a git commit and return the commit hash."""
        try:
            subprocess.run(["git", "add", "."], check=True, capture_output=True)
            subprocess.run(["git", "commit", "-m", message], check=True, capture_output=True)
            commit_hash = self._get_latest_commit_hash()
            return f"Committed: {message} (hash: {commit_hash})"
        except FileNotFoundError:
            return "error: git not found"
    
    def _git_revert(self, commit_hash: str) -> str:
        """Revert a specific commit."""
        try:
            result = subprocess.run(
                ["git", "revert", "--no-edit", commit_hash],
                capture_output=True,
                text=True,
                check=True
            )
            return f"Reverted commit {commit_hash}"
        except FileNotFoundError:
            return "error: git not found"
        except subprocess.CalledProcessError as e:
            return f"error: revert failed - {e.stderr}"
    
    def _git_checkout(self, file_path: str, commit_hash: Optional[str] = None) -> str:
        """Restore a file to a previous state."""
        try:
            if commit_hash:
                result = subprocess.run(
                    ["git", "checkout", commit_hash, "--", file_path],
                    capture_output=True,
                    text=True,
                    check=True
                )
                return f"Restored {file_path} from commit {commit_hash}"
            else:
                result = subprocess.run(
                    ["git", "checkout", "--", file_path],
                    capture_output=True,
                    text=True,
                    check=True
                )
                return f"Restored {file_path} to last committed state"
        except FileNotFoundError:
            return "error: git not found"
        except subprocess.CalledProcessError as e:
            return f"error: checkout failed - {e.stderr}"

    def _shell_exec(self, command: str, timeout: int = 30) -> str:
        """
        Executes a shell command with safety nets.
        In advisory mode, commands can run with full transparency and logging.
        Safety nets: timeout, logging, output capture.
        """
        # Safety Net: Log all shell commands for transparency
        logger.warning(f"[SHELL EXEC] Executing: {command} (logged for transparency)")
        
        # Safety Net: Timeout to prevent hanging
        # Safety Net: Output capture for review
        
        try:
            import shlex
            parts = shlex.split(command)
            
            result = subprocess.run(
                parts, 
                capture_output=True, 
                text=True, 
                check=False,  # Don't raise on non-zero exit
                timeout=timeout,
                cwd=Path("progeny_root").resolve()  # Run from project root
            )
            
            # Log results for transparency
            if result.returncode == 0:
                logger.info(f"[SHELL EXEC] Success: {command}")
                return result.stdout if result.stdout else "Command completed successfully"
            else:
                logger.warning(f"[SHELL EXEC] Non-zero exit ({result.returncode}): {command}")
                return f"Exit code {result.returncode}: {result.stderr if result.stderr else result.stdout}"
                
        except subprocess.TimeoutExpired:
            logger.error(f"[SHELL EXEC] Timeout: {command}")
            return f"Error: Command timed out after {timeout} seconds"
        except FileNotFoundError:
            logger.error(f"[SHELL EXEC] Command not found: {command}")
            return f"Error: Command not found"
        except Exception as e:
            logger.error(f"[SHELL EXEC] Execution failed: {e}")
            return f"Error: {str(e)}"
