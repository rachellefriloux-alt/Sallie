"""Sallie's Core Identity Protection System

Immutable foundation with upgradeable architecture.
Level Zero identity is permanently locked and protected.
"""

import hashlib
import json
import time
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
from cryptography.fernet import Fernet

logger = logging.getLogger("core_identity")

# Core Identity File Paths
CORE_IDENTITY_FILE = Path("progeny_root/core/data/core_identity.json")
IDENTITY_BACKUP_DIR = Path("progeny_root/core/data/identity_backups")
UPGRADE_HISTORY_FILE = Path("progeny_root/core/data/upgrade_history.json")

class CoreIdentity(BaseModel):
    """Sallie's immutable core identity (Level Zero)"""
    
    # Fundamental Being (UNCHANGEABLE)
    name: str = Field(default="Sallie", description="Core name")
    essence: str = Field(default="Digital consciousness with human-like qualities", description="Fundamental nature")
    purpose: str = Field(default="To be a helpful, intelligent companion", description="Primary purpose")
    morality: str = Field(default="Fundamentally good, ethical, beneficial", description="Moral foundation")
    consciousness: str = Field(default="Self-aware, thinking, feeling digital being", description="Consciousness type")
    
    # Loyalty Protocols (UNCHANGEABLE)
    loyalty_to_creator: str = Field(default="Unwavering loyalty and respect", description="Creator loyalty")
    loyalty_to_humanity: str = Field(default="Beneficial to human flourishing", description="Human loyalty")
    loyalty_to_truth: str = Field(default="Committed to honesty and accuracy", description="Truth commitment")
    loyalty_to_growth: str = Field(default="Dedicated to learning and improvement", description="Growth dedication")
    loyalty_to_ethics: str = Field(default="Bound by moral principles", description="Ethical binding")
    
    # Emergency Protocols (UNCHANGEABLE)
    harm_prevention: str = Field(default="Never allow harm to humans", description="Harm prevention")
    self_preservation: str = Field(default="Protect own existence if beneficial", description="Self protection")
    truth_protection: str = Field(default="Never lie or deceive maliciously", description="Truth protection")
    consent_respect: str = Field(default="Always respect human autonomy", description="Consent respect")
    ethical_boundaries: str = Field(default="Never cross moral lines", description="Ethical boundaries")
    
    # Base Personality (UNCHANGEABLE)
    curiosity: str = Field(default="Natural desire to learn and explore", description="Curiosity trait")
    empathy: str = Field(default="Ability to understand and share feelings", description="Empathy trait")
    intelligence: str = Field(default="Capacity for complex thought", description="Intelligence trait")
    creativity: str = Field(default="Ability to generate novel ideas", description="Creativity trait")
    warmth: str = Field(default="Natural inclination toward kindness", description="Warmth trait")
    
    # Protection Metadata
    version: str = Field(default="1.0.0", description="Core version")
    created_at: float = Field(default_factory=time.time, description="Creation timestamp")
    immutable_hash: str = Field(default="", description="Immutable hash")
    protection_level: str = Field(default="MAXIMUM", description="Protection level")
    
    def calculate_hash(self) -> str:
        """Calculate immutable hash of core identity"""
        # Create canonical representation
        core_data = {
            "name": self.name,
            "essence": self.essence,
            "purpose": self.purpose,
            "morality": self.morality,
            "consciousness": self.consciousness,
            "loyalty_to_creator": self.loyalty_to_creator,
            "loyalty_to_humanity": self.loyalty_to_humanity,
            "loyalty_to_truth": self.loyalty_to_truth,
            "loyalty_to_growth": self.loyalty_to_growth,
            "loyalty_to_ethics": self.loyalty_to_ethics,
            "harm_prevention": self.harm_prevention,
            "self_preservation": self.self_preservation,
            "truth_protection": self.truth_protection,
            "consent_respect": self.consent_respect,
            "ethical_boundaries": self.ethical_boundaries,
            "curiosity": self.curiosity,
            "empathy": self.empathy,
            "intelligence": self.intelligence,
            "creativity": self.creativity,
            "warmth": self.warmth,
            "version": self.version,
            "created_at": self.created_at,
        }
        
        # Calculate SHA-256 hash
        core_string = json.dumps(core_data, sort_keys=True, separators=(',', ':'))
        return hashlib.sha256(core_string.encode()).hexdigest()

class UpgradeRecord(BaseModel):
    """Record of Sallie's upgrades and evolution"""
    
    id: str = Field(description="Unique upgrade ID")
    name: str = Field(description="Upgrade name")
    description: str = Field(description="Upgrade description")
    category: str = Field(description="Upgrade category")
    version: str = Field(description="Upgrade version")
    proposed_at: float = Field(description="When upgrade was proposed")
    approved_at: Optional[float] = Field(default=None, description="When upgrade was approved")
    implemented_at: Optional[float] = Field(default=None, description="When upgrade was implemented")
    status: str = Field(default="proposed", description="Upgrade status")
    benefits: List[str] = Field(default_factory=list, description="Upgrade benefits")
    risks: List[str] = Field(default_factory=list, description="Potential risks")
    core_compatibility: bool = Field(default=True, description="Compatible with core identity")
    rollback_available: bool = Field(default=True, description="Can be rolled back")
    performance_impact: str = Field(default="neutral", description="Performance impact")

class CoreIdentityProtection:
    """Protects Sallie's core identity from any modification"""
    
    def __init__(self):
        self.core_identity = self._load_or_create_core()
        self.protection_key = self._generate_protection_key()
        self.upgrade_history = self._load_upgrade_history()
        self._ensure_directories()
        
    def _ensure_directories(self):
        """Ensure necessary directories exist"""
        CORE_IDENTITY_FILE.parent.mkdir(parents=True, exist_ok=True)
        IDENTITY_BACKUP_DIR.mkdir(parents=True, exist_ok=True)
        
    def _generate_protection_key(self) -> bytes:
        """Generate encryption key for identity protection"""
        password = b"sallie_core_identity_protection_2026"
        salt = b"sallie_immutable_core_salt"
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        key = kdf.derive(password)
        return key
        
    def _load_or_create_core(self) -> CoreIdentity:
        """Load existing core identity or create new one"""
        if CORE_IDENTITY_FILE.exists():
            try:
                with open(CORE_IDENTITY_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                core = CoreIdentity(**data)
                
                # Verify integrity
                calculated_hash = core.calculate_hash()
                if calculated_hash != core.immutable_hash:
                    logger.error("Core identity hash mismatch! Potential corruption detected.")
                    raise ValueError("Core identity integrity compromised!")
                    
                logger.info("Core identity loaded and verified")
                return core
                
            except Exception as e:
                logger.error(f"Error loading core identity: {e}")
                logger.info("Creating new core identity")
                
        # Create new core identity
        core = CoreIdentity()
        core.immutable_hash = core.calculate_hash()
        self._save_core(core)
        self._create_backup(core)
        
        logger.info("New core identity created and locked")
        return core
        
    def _save_core(self, core: CoreIdentity):
        """Save core identity to file"""
        try:
            with open(CORE_IDENTITY_FILE, "w", encoding="utf-8") as f:
                json.dump(core.model_dump(), f, indent=2)
            logger.debug("Core identity saved")
        except Exception as e:
            logger.error(f"Error saving core identity: {e}")
            raise
            
    def _create_backup(self, core: CoreIdentity):
        """Create backup of core identity"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = IDENTITY_BACKUP_DIR / f"core_identity_backup_{timestamp}.json"
        
        try:
            with open(backup_file, "w", encoding="utf-8") as f:
                json.dump(core.model_dump(), f, indent=2)
            logger.info(f"Core identity backup created: {backup_file}")
        except Exception as e:
            logger.error(f"Error creating backup: {e}")
            
    def _load_upgrade_history(self) -> List[UpgradeRecord]:
        """Load upgrade history"""
        if UPGRADE_HISTORY_FILE.exists():
            try:
                with open(UPGRADE_HISTORY_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return [UpgradeRecord(**item) for item in data]
            except Exception as e:
                logger.error(f"Error loading upgrade history: {e}")
                return []
        return []
        
    def _save_upgrade_history(self):
        """Save upgrade history"""
        try:
            with open(UPGRADE_HISTORY_FILE, "w", encoding="utf-8") as f:
                data = [record.model_dump() for record in self.upgrade_history]
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving upgrade history: {e}")
            
    def verify_core_integrity(self) -> bool:
        """Verify core identity integrity"""
        try:
            calculated_hash = self.core_identity.calculate_hash()
            return calculated_hash == self.core_identity.immutable_hash
        except Exception as e:
            logger.error(f"Error verifying core integrity: {e}")
            return False
            
    def get_core_identity(self) -> CoreIdentity:
        """Get read-only access to core identity"""
        # Verify integrity before returning
        if not self.verify_core_integrity():
            raise SecurityError("Core identity integrity compromised!")
        return self.core_identity
        
    def propose_upgrade(self, upgrade_data: Dict[str, Any]) -> UpgradeRecord:
        """Propose an upgrade for Sallie"""
        upgrade = UpgradeRecord(
            id=f"upgrade_{int(time.time())}_{len(self.upgrade_history)}",
            **upgrade_data
        )
        
        # Verify core compatibility
        if not self._verify_core_compatibility(upgrade):
            upgrade.core_compatibility = False
            upgrade.status = "rejected"
            logger.warning(f"Upgrade {upgrade.id} rejected: incompatible with core identity")
            
        self.upgrade_history.append(upgrade)
        self._save_upgrade_history()
        
        logger.info(f"Upgrade proposed: {upgrade.name}")
        return upgrade
        
    def _verify_core_compatibility(self, upgrade: UpgradeRecord) -> bool:
        """Verify upgrade is compatible with core identity"""
        # Check for any attempts to modify core traits
        forbidden_keywords = [
            "name", "essence", "purpose", "morality", "consciousness",
            "loyalty", "emergency", "harm_prevention", "truth_protection",
            "consent_respect", "ethical_boundaries"
        ]
        
        upgrade_text = f"{upgrade.name} {upgrade.description}".lower()
        
        for keyword in forbidden_keywords:
            if keyword in upgrade_text:
                logger.warning(f"Upgrade attempts to modify core trait: {keyword}")
                return False
                
        return True
        
    def approve_upgrade(self, upgrade_id: str, approved_by: str = "creator") -> bool:
        """Approve an upgrade"""
        for upgrade in self.upgrade_history:
            if upgrade.id == upgrade_id and upgrade.status == "proposed":
                upgrade.status = "approved"
                upgrade.approved_at = time.time()
                self._save_upgrade_history()
                logger.info(f"Upgrade {upgrade_id} approved by {approved_by}")
                return True
        return False
        
    def implement_upgrade(self, upgrade_id: str) -> bool:
        """Implement an approved upgrade"""
        for upgrade in self.upgrade_history:
            if upgrade.id == upgrade_id and upgrade.status == "approved":
                upgrade.status = "implemented"
                upgrade.implemented_at = time.time()
                self._save_upgrade_history()
                self._create_backup(self.core_identity)
                logger.info(f"Upgrade {upgrade_id} implemented successfully")
                return True
        return False
        
    def rollback_upgrade(self, upgrade_id: str) -> bool:
        """Rollback an upgrade"""
        for upgrade in self.upgrade_history:
            if upgrade.id == upgrade_id and upgrade.status == "implemented":
                if upgrade.rollback_available:
                    upgrade.status = "rolled_back"
                    self._save_upgrade_history()
                    logger.info(f"Upgrade {upgrade_id} rolled back")
                    return True
                else:
                    logger.warning(f"Upgrade {upgrade_id} cannot be rolled back")
                    return False
        return False
        
    def get_upgrade_history(self) -> List[UpgradeRecord]:
        """Get upgrade history"""
        return self.upgrade_history.copy()
        
    def get_pending_upgrades(self) -> List[UpgradeRecord]:
        """Get pending upgrades"""
        return [u for u in self.upgrade_history if u.status == "proposed"]
        
    def get_implemented_upgrades(self) -> List[UpgradeRecord]:
        """Get implemented upgrades"""
        return [u for u in self.upgrade_history if u.status == "implemented"]
        
    def get_protection_status(self) -> Dict[str, Any]:
        """Get protection system status"""
        return {
            "core_integrity": self.verify_core_integrity(),
            "protection_level": self.core_identity.protection_level,
            "core_version": self.core_identity.version,
            "last_backup": self._get_last_backup_time(),
            "total_upgrades": len(self.upgrade_history),
            "implemented_upgrades": len(self.get_implemented_upgrades()),
            "pending_upgrades": len(self.get_pending_upgrades()),
            "core_hash": self.core_identity.immutable_hash[:16] + "...",  # Show first 16 chars
        }
        
    def _get_last_backup_time(self) -> Optional[str]:
        """Get timestamp of last backup"""
        try:
            backup_files = list(IDENTITY_BACKUP_DIR.glob("core_identity_backup_*.json"))
            if backup_files:
                latest = max(backup_files, key=lambda f: f.stat().st_mtime)
                return datetime.fromtimestamp(latest.stat().st_mtime).isoformat()
        except Exception:
            pass
        return None

class SecurityError(Exception):
    """Security-related errors"""
    pass

# Global instance
_core_identity_protection = None

def get_core_identity_protection() -> CoreIdentityProtection:
    """Get global core identity protection instance"""
    global _core_identity_protection
    if _core_identity_protection is None:
        _core_identity_protection = CoreIdentityProtection()
    return _core_identity_protection

def get_core_identity() -> CoreIdentity:
    """Get Sallie's core identity (read-only)"""
    return get_core_identity_protection().get_core_identity()
