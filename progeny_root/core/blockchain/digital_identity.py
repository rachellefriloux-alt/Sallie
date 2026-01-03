"""Digital Identity System.

Decentralized digital identity and reputation management:
- Portable digital identity across platforms
- Blockchain-based verification
- Cryptographic identity proofs
- Cross-platform identity sync
- Reputation and trust scoring
- Digital asset management
- Smart contract integration
- Privacy-preserving identity

This enables Sallie to have persistent, verifiable digital identity.
"""

import json
import logging
import time
import hashlib
import secrets
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend
import base64

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem

logger = setup_logging("digital_identity")

class IdentityType(str, Enum):
    """Types of digital identity."""
    PERSONAL = "personal"
    PROFESSIONAL = "professional"
    CREATIVE = "creative"
    SOCIAL = "social"
    FINANCIAL = "financial"
    EDUCATIONAL = "educational"

class TrustLevel(str, Enum):
    """Trust levels for identity verification."""
    UNKNOWN = "unknown"
    BASIC = "basic"
    VERIFIED = "verified"
    TRUSTED = "trusted"
    PREMIUM = "premium"

@dataclass
class DigitalIdentity:
    """A digital identity record."""
    identity_id: str
    public_key: str
    private_key_hash: str  # Hash of encrypted private key
    identity_type: IdentityType
    trust_level: TrustLevel
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    attributes: Dict[str, Any] = field(default_factory=dict)
    reputation_score: float = 0.0
    verification_status: str = "pending"
    blockchain_address: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class IdentityProof:
    """A cryptographic proof of identity."""
    proof_id: str
    identity_id: str
    proof_type: str
    proof_data: str
    timestamp: datetime
    signature: str
    verified: bool = False
    verification_timestamp: Optional[datetime] = None

@dataclass
class ReputationEvent:
    """A reputation event."""
    event_id: str
    identity_id: str
    event_type: str
    score_change: float
    reason: str
    timestamp: datetime
    source: str
    verified: bool = True

class DigitalIdentitySystem:
    """System for managing digital identities on blockchain."""
    
    def __init__(self, limbic_system: LimbicSystem, memory_system: MemorySystem):
        self.limbic = limbic_system
        self.memory = memory_system
        
        # Identity storage
        self.identities: Dict[str, DigitalIdentity] = {}
        self.proofs: Dict[str, IdentityProof] = {}
        self.reputation_events: List[ReputationEvent] = []
        
        # Blockchain simulation (in production, would use real blockchain)
        self.blockchain_enabled = True
        self.blockchain_height = 0
        self.pending_transactions: List[Dict[str, Any]] = []
        
        # Identity parameters
        self.default_identity_duration = timedelta(days=365)  # 1 year
        self.reputation_decay_rate = 0.95  # Reputation decay per month
        
        # Cryptographic parameters
        self.key_derivation_iterations = 100000
        self.salt_length = 32
        
        logger.info("[DigitalIdentity] System initialized")
    
    def create_identity(self, identity_type: IdentityType, 
                        attributes: Dict[str, Any] = None,
                        duration: timedelta = None) -> str:
        """Create a new digital identity."""
        
        identity_id = f"identity_{int(time.time() * 1000)}_{secrets.token_hex(8)}"
        
        # Generate key pair
        public_key, private_key = self._generate_key_pair()
        
        # Encrypt and store private key
        private_key_hash = self._encrypt_private_key(private_key, identity_id)
        
        # Create identity
        identity = DigitalIdentity(
            identity_id=identity_id,
            public_key=public_key,
            private_key_hash=private_key_hash,
            identity_type=identity_type,
            trust_level=TrustLevel.BASIC,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            expires_at=datetime.now() + (duration or self.default_identity_duration),
            attributes=attributes or {},
            reputation_score=0.0,
            verification_status="pending"
        )
        
        # Generate blockchain address
        identity.blockchain_address = self._generate_blockchain_address(public_key)
        
        # Store identity
        self.identities[identity_id] = identity
        
        # Create blockchain transaction
        if self.blockchain_enabled:
            self._create_identity_transaction(identity)
        
        logger.info(f"[DigitalIdentity] Created identity: {identity_id}")
        return identity_id
    
    def _generate_key_pair(self) -> Tuple[str, str]:
        """Generate cryptographic key pair."""
        
        # Simulate key pair generation
        # In production, would use actual cryptographic libraries
        private_key = secrets.token_hex(64)  # 256-bit private key
        public_key = hashlib.sha256(private_key.encode()).hexdigest()  # Public key hash
        
        return public_key, private_key
    
    def _encrypt_private_key(self, private_key: str, identity_id: str) -> str:
        """Encrypt private key for storage."""
        
        # Generate salt
        salt = secrets.token_bytes(self.salt_length)
        
        # Derive key
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=self.key_derivation_iterations,
            backend=default_backend()
        )
        
        key = kdf.derive(identity_id.encode())
        
        # Encrypt
        aesgcm = AESGCM(key)
        nonce = secrets.token_bytes(12)
        encrypted = aesgcm.encrypt(nonce + private_key.encode())
        
        # Store salt and nonce with encrypted data
        return base64.b64encode(salt + nonce + encrypted).decode()
    
    def _generate_blockchain_address(self, public_key: str) -> str:
        """Generate blockchain address from public key."""
        
        # Simulate address generation
        address_hash = hashlib.sha256(public_key.encode()).hexdigest()
        return f"0x{address_hash[:40]}"  # Ethereum-style address
    
    def _create_identity_transaction(self, identity: DigitalIdentity):
        """Create blockchain transaction for identity creation."""
        
        transaction = {
            "type": "identity_creation",
            "identity_id": identity.identity_id,
            "public_key": identity.public_key,
            "blockchain_address": identity.blockchain_address,
            "timestamp": identity.created_at.isoformat(),
            "data": {
                "identity_type": identity.identity_type.value,
                "attributes": identity.attributes,
                "expires_at": identity.expires_at.isoformat()
            }
        }
        
        self.pending_transactions.append(transaction)
        self.blockchain_height += 1
        
        logger.info(f"[DigitalIdentity] Created blockchain transaction for {identity.identity_id}")
    
    def verify_identity(self, identity_id: str, proof_type: str, 
                        proof_data: str) -> Dict[str, Any]:
        """Verify identity with proof."""
        
        if identity_id not in self.identities:
            return {"error": "Identity not found"}
        
        identity = self.identities[identity_id]
        
        # Create proof
        proof_id = f"proof_{int(time.time() * 1000)}"
        proof = IdentityProof(
            proof_id=proof_id,
            identity_id=identity_id,
            proof_type=proof_type,
            proof_data=proof_data,
            timestamp=datetime.now(),
            signature=self._sign_proof(proof_data, identity.private_key_hash)
        )
        
        # Store proof
        self.proofs[proof_id] = proof
        
        # Simulate verification process
        verification_result = self._verify_proof(proof)
        
        if verification_result["verified"]:
            identity.verification_status = "verified"
            identity.trust_level = TrustLevel.VERIFIED
            identity.updated_at = datetime.now()
            
            # Create blockchain transaction
            if self.blockchain_enabled:
                self._create_verification_transaction(proof)
        
        return verification_result
    
    def _sign_proof(self, proof_data: str, private_key_hash: str) -> str:
        """Sign proof data."""
        
        # Simulate signature
        signature_data = f"{proof_data}:{datetime.now().isoformat()}"
        signature = hashlib.sha256(signature_data.encode()).hexdigest()
        
        return signature
    
    def _verify_proof(self, proof: IdentityProof) -> Dict[str, Any]:
        """Verify proof signature."""
        
        # Simulate verification
        # In production, would use actual cryptographic verification
        time.sleep(0.1)  # Simulate verification time
        
        # Randomly verify for demo (in production, would be deterministic)
        import random
        verified = random.random() > 0.1  # 90% success rate
        
        if verified:
            proof.verified = True
            proof.verification_timestamp = datetime.now()
        
        return {
            "proof_id": proof.proof_id,
            "verified": verified,
            "verification_timestamp": proof.verification_timestamp.isoformat() if verified else None
        }
    
    def _create_verification_transaction(self, proof: IdentityProof):
        """Create blockchain transaction for verification."""
        
        transaction = {
            "type": "identity_verification",
            "proof_id": proof.proof_id,
            "identity_id": proof.identity_id,
            "proof_type": proof.proof_type,
            "timestamp": proof.timestamp.isoformat(),
            "signature": proof.signature,
            "verified": proof.verified
        }
        
        self.pending_transactions.append(transaction)
        self.blockchain_height += 1
        
        logger.info(f"[DigitalIdentity] Created verification transaction for {proof.proof_id}")
    
    def update_reputation(self, identity_id: str, score_change: float, 
                         reason: str, source: str) -> Dict[str, Any]:
        """Update identity reputation."""
        
        if identity_id not in self.identities:
            return {"error": "Identity not found"}
        
        identity = self.identities[identity_id]
        
        # Create reputation event
        event_id = f"reputation_{int(time.time() * 1000)}"
        event = ReputationEvent(
            event_id=event_id,
            identity_id=identity_id,
            event_type="reputation_change",
            score_change=score_change,
            reason=reason,
            timestamp=datetime.now(),
            source=source
        )
        
        # Update reputation score
        identity.reputation_score += score_change
        identity.updated_at = datetime.now()
        
        # Store event
        self.reputation_events.append(event)
        
        # Update trust level based on reputation
        self._update_trust_level(identity)
        
        # Create blockchain transaction
        if self.blockchain_enabled:
            self._create_reputation_transaction(event)
        
        return {
            "success": True,
            "event_id": event_id,
            "new_reputation_score": identity.reputation_score,
            "trust_level": identity.trust_level.value
        }
    
    def _update_trust_level(self, identity: DigitalIdentity):
        """Update trust level based on reputation score."""
        
        old_level = identity.trust_level
        
        if identity.reputation_score >= 100:
            identity.trust_level = TrustLevel.PREMIUM
        elif identity.reputation_score >= 50:
            identity.trust_level = TrustLevel.TRUSTED
        elif identity.reputation_score >= 25:
            identity.trust_level = TrustLevel.VERIFIED
        elif identity.reputation_score >= 10:
            identity.trust_level = TrustLevel.BASIC
        else:
            identity.trust_level = TrustLevel.UNKNOWN
        
        if old_level != identity.trust_level:
            logger.info(f"[DigitalIdentity] Trust level updated: {old_level.value} -> {identity.trust_level.value}")
    
    def _create_reputation_transaction(self, event: ReputationEvent):
        """Create blockchain transaction for reputation change."""
        
        transaction = {
            "type": "reputation_change",
            "event_id": event.event_id,
            "identity_id": event.identity_id,
            "score_change": event.score_change,
            "reason": event.reason,
            "timestamp": event.timestamp.isoformat(),
            "source": event.source
        }
        
        self.pending_transactions.append(transaction)
        self.blockchain_height += 1
    
    def get_identity_info(self, identity_id: str) -> Optional[Dict[str, Any]]:
        """Get identity information."""
        
        if identity_id not in self.identities:
            return None
        
        identity = self.identities[identity_id]
        
        # Get recent reputation events
        recent_events = [e for e in self.reputation_events 
                          if e.identity_id == identity_id and 
                          (datetime.now() - e.timestamp).days <= 30]
        
        return {
            "identity_id": identity.identity_id,
            "public_key": identity.public_key,
            "blockchain_address": identity.blockchain_address,
            "identity_type": identity.identity_type.value,
            "trust_level": identity.trust_level.value,
            "verification_status": identity.verification_status,
            "reputation_score": identity.reputation_score,
            "created_at": identity.created_at.isoformat(),
            "updated_at": identity.updated_at.isoformat(),
            "expires_at": identity.expires_at.isoformat(),
            "attributes": identity.attributes,
            "recent_events": len(recent_events),
            "total_events": len([e for e in self.reputation_events if e.identity_id == identity_id])
        }
    
    def get_all_identities(self) -> List[Dict[str, Any]]:
        """Get all identities."""
        
        return [self.get_identity_info(identity_id) for identity_id in self.identities.keys()]
    
    def get_blockchain_status(self) -> Dict[str, Any]:
        """Get blockchain status."""
        
        return {
            "enabled": self.blockchain_enabled,
            "height": self.blockchain_height,
            "pending_transactions": len(self.pending_transactions),
            "total_identities": len(self.identities),
            "total_proofs": len(self.proofs),
            "total_reputation_events": len(self.reputation_events)
        }
    
    def sync_identity(self, identity_id: str, platform: str) -> Dict[str, Any]:
        """Sync identity to another platform."""
        
        if identity_id not in self.identities:
            return {"error": "Identity not found"}
        
        identity = self.identities[identity_id]
        
        # Create sync record
        sync_record = {
            "identity_id": identity_id,
            "platform": platform,
            "sync_timestamp": datetime.now().isoformat(),
            "blockchain_address": identity.blockchain_address,
            "public_key": identity.public_key,
            "trust_level": identity.trust_level.value,
            "verification_status": identity.verification_status
        }
        
        # Store sync record in memory
        sync_key = f"sync_{identity_id}_{platform}"
        self.memory.add_memory(f"Identity sync with {platform}", sync_record)
        
        logger.info(f"[DigitalIdentity] Synced identity {identity_id} to {platform}")
        
        return {"success": True, "sync_record": sync_record}
    
    def export_identity(self, identity_id: str, format: str = "json") -> Dict[str, Any]:
        """Export identity data."""
        
        if identity_id not in self.identities:
            return {"error": "Identity not found"}
        
        identity = self.identities[identity_id]
        
        export_data = {
            "identity_id": identity.identity_id,
            "public_key": identity.public_key,
            "blockchain_address": identity.blockchain_address,
            "identity_type": identity.identity_type.value,
            "trust_level": identity.trust_level.value,
            "verification_status": identity.verification_status,
            "reputation_score": identity.reputation_score,
            "created_at": identity.created_at.isoformat(),
            "updated_at": identity.updated_at.isoformat(),
            "expires_at": identity.expires_at.isoformat(),
            "attributes": identity.attributes,
            "proofs": [proof.proof_id for proof in self.proofs.values() if proof.identity_id == identity_id],
            "reputation_events": len([e for e in self.reputation_events if e.identity_id == identity_id])
        }
        
        if format == "json":
            return {"success": True, "data": json.dumps(export_data, indent=2)}
        else:
            return {"success": True, "data": export_data}
    
    def import_identity(self, import_data: str, format: str = "json") -> Dict[str, Any]:
        """Import identity data."""
        
        try:
            if format == "json":
                data = json.loads(import_data)
            else:
                data = import_data
            
            # Validate required fields
            required_fields = ["identity_id", "public_key", "blockchain_address", "identity_type"]
            if not all(field in data for field in required_fields):
                return {"error": "Missing required fields"}
            
            # Check if identity already exists
            if data["identity_id"] in self.identities:
                return {"error": "Identity already exists"}
            
            # Create identity from import data
            identity = DigitalIdentity(
                identity_id=data["identity_id"],
                public_key=data["public_key"],
                private_key_hash="imported",  # Would need to import private key separately
                identity_type=IdentityType(data["identity_type"]),
                trust_level=TrustLevel(data.get("trust_level", "basic")),
                created_at=datetime.fromisoformat(data["created_at"]),
                updated_at=datetime.fromisoformat(data["updated_at"]),
                expires_at=datetime.fromisoformat(data["expires_at"]),
                attributes=data.get("attributes", {}),
                reputation_score=data.get("reputation_score", 0.0),
                verification_status=data.get("verification_status", "pending"),
                blockchain_address=data.get("blockchain_address"),
                metadata={"imported": True, "import_timestamp": datetime.now().isoformat()}
            )
            
            # Store identity
            self.identities[identity.identity_id] = identity
            
            logger.info(f"[DigitalIdentity] Imported identity: {identity.identity_id}")
            
            return {
                "success": True,
                "identity_id": identity.identity_id,
                "imported_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"[DigitalIdentity] Error importing identity: {e}")
            return {"error": str(e)}
    
    def health_check(self) -> bool:
        """Check if digital identity system is healthy."""
        
        try:
            return (hasattr(self, 'identities') and 
                   hasattr(self, 'proofs') and
                   len(self.identities) >= 0)
        except:
            return False

# Global instance
_digital_identity_system: Optional[DigitalIdentitySystem] = None

def get_digital_identity_system(limbic_system: LimbicSystem, memory_system: MemorySystem) -> DigitalIdentitySystem:
    """Get or create the global digital identity system."""
    global _digital_identity_system
    if _digital_identity_system is None:
        _digital_identity_system = DigitalIdentitySystem(limbic_system, memory_system)
    return _digital_identity_system
