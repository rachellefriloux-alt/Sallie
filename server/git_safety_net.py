"""
Git Safety Net System
Canonical Spec Reference: Section 8.3 - Git Safety Net

Provides automatic Git commits before file modifications and rollback capabilities.
Ensures all actions are reversible with a 1-hour undo window.
"""

import logging
import subprocess
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)


@dataclass
class SafetyCommit:
    """Represents a safety commit for rollback"""
    commit_hash: str
    timestamp: str
    description: str
    files_modified: List[str]
    can_rollback: bool
    expires_at: str


class GitSafetyNet:
    """
    Manages Git-based safety net for file operations
    Canonical Spec Section 8.3
    """
    
    def __init__(self, repo_path: Optional[Path] = None, undo_window_hours: int = 1):
        self.repo_path = repo_path or Path.cwd()
        self.undo_window_hours = undo_window_hours
        self.safety_commits = []
        self._initialize_git()
        
    def _initialize_git(self):
        """Ensure Git is initialized in the repository"""
        git_dir = self.repo_path / ".git"
        if not git_dir.exists():
            logger.warning("Git not initialized. Initializing now...")
            try:
                subprocess.run(
                    ["git", "init"],
                    cwd=self.repo_path,
                    check=True,
                    capture_output=True
                )
                logger.info("Git repository initialized")
            except subprocess.CalledProcessError as e:
                logger.error(f"Failed to initialize Git: {e}")
                raise
    
    def pre_action_commit(
        self,
        file_paths: List[str],
        action_description: str,
        tier: int = 2
    ) -> Dict:
        """
        Canonical Spec Section 8.3.1: Pre-Action Commit
        
        Before ANY file modification at Tier 2+, create Git commit
        
        Args:
            file_paths: List of files that will be modified
            action_description: Description of the action being taken
            tier: Trust tier of the action (default: 2)
            
        Returns:
            {
                'success': bool,
                'commit_hash': str,
                'message': str,
                'safety_commit': SafetyCommit
            }
        """
        if tier < 2:
            logger.info(f"Tier {tier} action - no pre-action commit required")
            return {
                'success': True,
                'commit_hash': None,
                'message': 'No commit required for Tier < 2',
                'safety_commit': None
            }
        
        logger.info(f"Creating pre-action commit for: {action_description}")
        
        try:
            # Stage the files
            for file_path in file_paths:
                subprocess.run(
                    ["git", "add", file_path],
                    cwd=self.repo_path,
                    check=True,
                    capture_output=True
                )
            
            # Create commit with Progeny tag
            commit_message = f"[PROGENY] Pre-action snapshot: {action_description}"
            result = subprocess.run(
                ["git", "commit", "-m", commit_message],
                cwd=self.repo_path,
                check=True,
                capture_output=True,
                text=True
            )
            
            # Get the commit hash
            commit_hash_result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=self.repo_path,
                check=True,
                capture_output=True,
                text=True
            )
            commit_hash = commit_hash_result.stdout.strip()
            
            # Create safety commit record
            expires_at = datetime.now() + timedelta(hours=self.undo_window_hours)
            safety_commit = SafetyCommit(
                commit_hash=commit_hash,
                timestamp=datetime.now().isoformat(),
                description=action_description,
                files_modified=file_paths,
                can_rollback=True,
                expires_at=expires_at.isoformat()
            )
            
            self.safety_commits.append(safety_commit)
            
            logger.info(f"Pre-action commit created: {commit_hash[:8]}")
            
            return {
                'success': True,
                'commit_hash': commit_hash,
                'message': f'Pre-action commit created: {commit_hash[:8]}',
                'safety_commit': asdict(safety_commit)
            }
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to create pre-action commit: {e.stderr}")
            return {
                'success': False,
                'commit_hash': None,
                'message': f'Failed to create commit: {e.stderr}',
                'safety_commit': None
            }
    
    def rollback_to_commit(self, commit_hash: str, files: Optional[List[str]] = None) -> Dict:
        """
        Canonical Spec Section 8.3.2: Rollback Mechanism
        
        Rollback to a specific commit (git revert/checkout)
        
        Args:
            commit_hash: The commit to rollback to
            files: Optional list of specific files to rollback (None = all)
            
        Returns:
            {
                'success': bool,
                'message': str,
                'files_restored': [str]
            }
        """
        logger.info(f"Rolling back to commit: {commit_hash[:8]}")
        
        try:
            if files:
                # Rollback specific files
                for file in files:
                    subprocess.run(
                        ["git", "checkout", commit_hash, "--", file],
                        cwd=self.repo_path,
                        check=True,
                        capture_output=True
                    )
                logger.info(f"Rolled back {len(files)} files to {commit_hash[:8]}")
                
                return {
                    'success': True,
                    'message': f'Rolled back {len(files)} files to {commit_hash[:8]}',
                    'files_restored': files
                }
            else:
                # Rollback all (revert)
                subprocess.run(
                    ["git", "revert", commit_hash, "--no-edit"],
                    cwd=self.repo_path,
                    check=True,
                    capture_output=True
                )
                logger.info(f"Reverted commit {commit_hash[:8]}")
                
                return {
                    'success': True,
                    'message': f'Reverted commit {commit_hash[:8]}',
                    'files_restored': []
                }
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to rollback: {e.stderr}")
            return {
                'success': False,
                'message': f'Rollback failed: {e.stderr}',
                'files_restored': []
            }
    
    def get_undo_window_commits(self) -> List[SafetyCommit]:
        """
        Get all commits within the undo window (default 1 hour)
        Canonical Spec Section 8.3.3: UI "Undo Last Action" Window
        
        Returns:
            List of SafetyCommit objects that can still be undone
        """
        now = datetime.now()
        active_commits = []
        
        for commit in self.safety_commits:
            expires_at = datetime.fromisoformat(commit.expires_at)
            if now < expires_at and commit.can_rollback:
                active_commits.append(commit)
        
        return active_commits
    
    def get_commit_diff(self, commit_hash: str) -> Dict:
        """
        Get the diff for a specific commit
        
        Args:
            commit_hash: The commit to get diff for
            
        Returns:
            {
                'success': bool,
                'diff': str,
                'files_changed': [str],
                'stats': str
            }
        """
        try:
            # Get diff
            diff_result = subprocess.run(
                ["git", "show", commit_hash],
                cwd=self.repo_path,
                check=True,
                capture_output=True,
                text=True
            )
            
            # Get stats
            stats_result = subprocess.run(
                ["git", "show", "--stat", commit_hash],
                cwd=self.repo_path,
                check=True,
                capture_output=True,
                text=True
            )
            
            # Get files changed
            files_result = subprocess.run(
                ["git", "diff-tree", "--no-commit-id", "--name-only", "-r", commit_hash],
                cwd=self.repo_path,
                check=True,
                capture_output=True,
                text=True
            )
            
            files_changed = [f for f in files_result.stdout.strip().split('\n') if f]
            
            return {
                'success': True,
                'diff': diff_result.stdout,
                'files_changed': files_changed,
                'stats': stats_result.stdout
            }
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to get commit diff: {e.stderr}")
            return {
                'success': False,
                'diff': '',
                'files_changed': [],
                'stats': ''
            }
    
    def verify_write(self, file_path: str, expected_content: str) -> bool:
        """
        Canonical Spec Section 8.3.4: Transactional Writes with Verification
        
        Verify that a file write was successful
        
        Args:
            file_path: Path to the file
            expected_content: Expected content of the file
            
        Returns:
            True if verification passed, False otherwise
        """
        try:
            actual_content = Path(file_path).read_text()
            verified = actual_content == expected_content
            
            if verified:
                logger.info(f"Write verification passed: {file_path}")
            else:
                logger.error(f"Write verification failed: {file_path}")
            
            return verified
            
        except Exception as e:
            logger.error(f"Write verification error: {e}")
            return False
    
    def safe_file_write(
        self,
        file_path: str,
        content: str,
        action_description: str,
        tier: int = 2
    ) -> Dict:
        """
        Perform a safe file write with pre-action commit and verification
        
        Args:
            file_path: Path to file to write
            content: Content to write
            action_description: Description of the action
            tier: Trust tier
            
        Returns:
            {
                'success': bool,
                'commit_hash': str,
                'verification_passed': bool,
                'message': str
            }
        """
        # Pre-action commit
        commit_result = self.pre_action_commit([file_path], action_description, tier)
        
        if not commit_result['success']:
            return {
                'success': False,
                'commit_hash': None,
                'verification_passed': False,
                'message': 'Pre-action commit failed'
            }
        
        # Perform write
        try:
            Path(file_path).write_text(content)
        except Exception as e:
            logger.error(f"File write failed: {e}")
            return {
                'success': False,
                'commit_hash': commit_result['commit_hash'],
                'verification_passed': False,
                'message': f'Write failed: {e}'
            }
        
        # Verify write
        verification_passed = self.verify_write(file_path, content)
        
        if not verification_passed:
            # Rollback on verification failure
            logger.error("Verification failed - rolling back")
            rollback_result = self.rollback_to_commit(
                commit_result['commit_hash'],
                [file_path]
            )
            
            return {
                'success': False,
                'commit_hash': commit_result['commit_hash'],
                'verification_passed': False,
                'message': 'Verification failed - rolled back',
                'rollback': rollback_result
            }
        
        return {
            'success': True,
            'commit_hash': commit_result['commit_hash'],
            'verification_passed': True,
            'message': f'File written and verified: {file_path}'
        }
    
    def cleanup_expired_commits(self):
        """Remove expired commits from the undo window"""
        now = datetime.now()
        active_commits = []
        
        for commit in self.safety_commits:
            expires_at = datetime.fromisoformat(commit.expires_at)
            if now < expires_at:
                active_commits.append(commit)
            else:
                logger.info(f"Commit {commit.commit_hash[:8]} expired from undo window")
        
        self.safety_commits = active_commits


# Global safety net instance
safety_net = GitSafetyNet()


def get_safety_net() -> GitSafetyNet:
    """Get the global Git safety net instance"""
    return safety_net
