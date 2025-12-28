"""End-to-end encryption layer for sync data.

Uses AES-256-GCM with key derivation for secure cross-device sync.
"""

import logging
import secrets
import hashlib
from typing import Dict, Any, Optional
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import base64

logger = logging.getLogger("sync.encryption")


class SyncEncryption:
    """
    Handles end-to-end encryption for sync data.
    
    Uses AES-256-GCM for authenticated encryption with key derivation.
    """
    
    def __init__(self, master_key: Optional[bytes] = None):
        """
        Initialize encryption system.
        
        Args:
            master_key: Master encryption key (if None, generates new key)
        """
        if master_key is None:
            # Generate new master key (in production, this would be stored securely)
            self.master_key = secrets.token_bytes(32)
            logger.warning("[SyncEncryption] Generated new master key - store this securely!")
        else:
            self.master_key = master_key
        
        self.backend = default_backend()
    
    def derive_key(self, salt: bytes, info: bytes = b"sync") -> bytes:
        """
        Derive encryption key from master key using PBKDF2.
        
        Args:
            salt: Salt for key derivation
            info: Additional context
            
        Returns:
            Derived encryption key (32 bytes)
        """
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=self.backend
        )
        return kdf.derive(self.master_key + info)
    
    def encrypt(self, plaintext: str, associated_data: Optional[bytes] = None) -> Dict[str, Any]:
        """
        Encrypt plaintext data.
        
        Args:
            plaintext: Data to encrypt (string)
            associated_data: Optional associated data for authentication
            
        Returns:
            Dict with encrypted data, salt, and nonce
        """
        # Generate salt and nonce
        salt = secrets.token_bytes(16)
        nonce = secrets.token_bytes(12)  # 96 bits for GCM
        
        # Derive key
        key = self.derive_key(salt)
        
        # Encrypt
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), associated_data)
        
        return {
            "ciphertext": base64.b64encode(ciphertext).decode('utf-8'),
            "salt": base64.b64encode(salt).decode('utf-8'),
            "nonce": base64.b64encode(nonce).decode('utf-8'),
            "algorithm": "AES-256-GCM"
        }
    
    def decrypt(self, encrypted_data: Dict[str, Any], associated_data: Optional[bytes] = None) -> str:
        """
        Decrypt encrypted data.
        
        Args:
            encrypted_data: Dict with ciphertext, salt, and nonce
            associated_data: Optional associated data for authentication
            
        Returns:
            Decrypted plaintext string
        """
        try:
            ciphertext = base64.b64decode(encrypted_data["ciphertext"])
            salt = base64.b64decode(encrypted_data["salt"])
            nonce = base64.b64decode(encrypted_data["nonce"])
            
            # Derive key
            key = self.derive_key(salt)
            
            # Decrypt
            aesgcm = AESGCM(key)
            plaintext = aesgcm.decrypt(nonce, ciphertext, associated_data)
            
            return plaintext.decode('utf-8')
            
        except Exception as e:
            logger.error(f"[SyncEncryption] Decryption failed: {e}")
            raise ValueError(f"Decryption failed: {e}")
    
    def get_master_key_b64(self) -> str:
        """Get master key as base64 string (for secure storage)."""
        return base64.b64encode(self.master_key).decode('utf-8')
    
    @classmethod
    def from_master_key_b64(cls, key_b64: str) -> 'SyncEncryption':
        """Create encryption instance from base64 master key."""
        master_key = base64.b64decode(key_b64)
        return cls(master_key=master_key)

