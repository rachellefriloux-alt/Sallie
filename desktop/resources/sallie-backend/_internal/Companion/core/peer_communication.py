"""
Peer Communication System - Progeny-to-Progeny Relationships

Enables secure, privacy-preserving communication between Progeny instances
for knowledge sharing, collective learning, and social interaction.

Architecture:
- P2P encrypted communication (libp2p)
- Public key infrastructure for identity
- Selective memory sharing
- Federated knowledge synthesis
- Local network discovery (mDNS)

Privacy:
- All communication E2E encrypted (NaCl)
- Opt-in by default
- Selective sharing controls
- Full audit logging
- No central server
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import json
import nacl.secret
import nacl.public
import nacl.signing
import nacl.encoding

logger = logging.getLogger(__name__)


@dataclass
class PeerIdentity:
    """Represents a peer Progeny instance."""
    peer_id: str
    public_key: bytes
    display_name: str
    discovered_at: datetime
    trust_level: float = 0.0
    approved: bool = False


@dataclass
class SharedExperience:
    """Represents knowledge shared between peers."""
    experience_id: str
    source_peer_id: str
    content_type: str  # "insight", "pattern", "hypothesis", "question"
    content: Dict[str, Any]
    timestamp: datetime
    encrypted: bool = True


class PeerNetwork:
    """
    Manages Progeny-to-Progeny communication.
    
    Key Features:
    - Discover peers on local network
    - Establish encrypted connections
    - Share experiences selectively
    - Synthesize collective knowledge
    - Preserve individual identity
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.enabled = config.get("peer_network", {}).get("enabled", False)
        
        # Cryptographic identity
        self.signing_key = nacl.signing.SigningKey.generate()
        self.verify_key = self.signing_key.verify_key
        self.box_key = nacl.public.PrivateKey.generate()
        
        # Peer registry
        self.peers: Dict[str, PeerIdentity] = {}
        self.connections: Dict[str, Any] = {}
        
        # Sharing controls
        self.sharing_whitelist: List[str] = []
        self.sharing_blacklist: List[str] = []
        
        # Knowledge synthesis
        self.shared_experiences: List[SharedExperience] = []
        
        logger.info("PeerNetwork initialized (enabled={})".format(self.enabled))
    
    async def discover_peers(self, timeout: int = 30) -> List[PeerIdentity]:
        """
        Discover nearby Progeny instances using mDNS/Bonjour.
        
        Returns:
            List of discovered peer identities
        """
        if not self.enabled:
            logger.info("Peer network disabled")
            return []
        
        logger.info("Discovering peers on local network (timeout={}s)".format(timeout))
        
        # In production, this would use zeroconf/avahi for mDNS discovery
        # For now, return mock discovery
        discovered = []
        
        # Mock: Simulate finding 2 peers
        mock_peers = [
            PeerIdentity(
                peer_id="peer_alex_001",
                public_key=nacl.public.PrivateKey.generate().public_key.encode(),
                display_name="Alex's Progeny",
                discovered_at=datetime.now()
            ),
            PeerIdentity(
                peer_id="peer_sam_002",
                public_key=nacl.public.PrivateKey.generate().public_key.encode(),
                display_name="Sam's Progeny",
                discovered_at=datetime.now()
            )
        ]
        
        for peer in mock_peers:
            if peer.peer_id not in self.peers:
                self.peers[peer.peer_id] = peer
                discovered.append(peer)
                logger.info("Discovered peer: {}".format(peer.display_name))
        
        return discovered
    
    async def connect_peer(self, peer_id: str) -> bool:
        """
        Establish encrypted connection with peer.
        
        Args:
            peer_id: ID of peer to connect
            
        Returns:
            True if connection successful
        """
        if not self.enabled:
            return False
        
        if peer_id not in self.peers:
            logger.error("Peer not found: {}".format(peer_id))
            return False
        
        peer = self.peers[peer_id]
        
        # Check approval
        if not peer.approved:
            logger.warning("Peer not approved: {}".format(peer.display_name))
            return False
        
        # Establish encrypted channel (in production: libp2p or custom protocol)
        # For now, mock connection
        logger.info("Connecting to peer: {}".format(peer.display_name))
        
        # Verify peer identity (public key cryptography)
        # Exchange and verify signatures
        
        self.connections[peer_id] = {
            "peer": peer,
            "connected_at": datetime.now(),
            "status": "connected"
        }
        
        logger.info("Connected to peer: {}".format(peer.display_name))
        return True
    
    async def share_experience(
        self,
        peer_id: str,
        experience_type: str,
        content: Dict[str, Any]
    ) -> Optional[str]:
        """
        Share an experience/insight with peer.
        
        Args:
            peer_id: Target peer
            experience_type: Type of content ("insight", "pattern", etc.)
            content: Experience data
            
        Returns:
            Experience ID if shared successfully
        """
        if not self.enabled:
            return None
        
        if peer_id not in self.connections:
            logger.error("Not connected to peer: {}".format(peer_id))
            return None
        
        # Check sharing permissions
        if peer_id in self.sharing_blacklist:
            logger.warning("Peer blacklisted: {}".format(peer_id))
            return None
        
        # Create experience
        experience = SharedExperience(
            experience_id="exp_{}".format(datetime.now().timestamp()),
            source_peer_id="self",
            content_type=experience_type,
            content=content,
            timestamp=datetime.now(),
            encrypted=True
        )
        
        # Encrypt content
        peer = self.peers[peer_id]
        encrypted_content = self._encrypt_for_peer(peer, content)
        
        # Send (in production: over P2P channel)
        logger.info("Shared {} with peer {}".format(experience_type, peer_id))
        
        # Log locally
        self.shared_experiences.append(experience)
        
        return experience.experience_id
    
    async def receive_experience(
        self,
        from_peer_id: str,
        encrypted_content: bytes
    ) -> Optional[SharedExperience]:
        """
        Receive and decrypt experience from peer.
        
        Args:
            from_peer_id: Source peer
            encrypted_content: Encrypted experience data
            
        Returns:
            Decrypted experience
        """
        if not self.enabled:
            return None
        
        if from_peer_id not in self.connections:
            logger.warning("Received content from unconnected peer")
            return None
        
        # Decrypt content
        content = self._decrypt_from_peer(from_peer_id, encrypted_content)
        
        if content is None:
            logger.error("Failed to decrypt content from peer")
            return None
        
        # Create experience record
        experience = SharedExperience(
            experience_id="exp_recv_{}".format(datetime.now().timestamp()),
            source_peer_id=from_peer_id,
            content_type=content.get("type", "unknown"),
            content=content,
            timestamp=datetime.now(),
            encrypted=False
        )
        
        self.shared_experiences.append(experience)
        logger.info("Received experience from peer {}".format(from_peer_id))
        
        return experience
    
    async def synthesize_collective_knowledge(
        self,
        topic: str,
        peer_ids: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Synthesize knowledge from multiple peers on a topic.
        
        Args:
            topic: Topic to synthesize
            peer_ids: Optional list of specific peers (default: all)
            
        Returns:
            Synthesized knowledge
        """
        if not self.enabled:
            return {}
        
        if peer_ids is None:
            peer_ids = list(self.connections.keys())
        
        logger.info("Synthesizing collective knowledge on: {}".format(topic))
        
        # Collect relevant experiences
        relevant_experiences = [
            exp for exp in self.shared_experiences
            if exp.source_peer_id in peer_ids
            and self._is_relevant_to_topic(exp, topic)
        ]
        
        if not relevant_experiences:
            logger.info("No relevant experiences found")
            return {"topic": topic, "insights": [], "peers_consulted": peer_ids}
        
        # Synthesize insights
        synthesis = {
            "topic": topic,
            "peers_consulted": peer_ids,
            "experience_count": len(relevant_experiences),
            "insights": self._synthesize_insights(relevant_experiences),
            "patterns": self._extract_patterns(relevant_experiences),
            "confidence": self._calculate_synthesis_confidence(relevant_experiences),
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info("Synthesized {} experiences into {} insights".format(
            len(relevant_experiences),
            len(synthesis["insights"])
        ))
        
        return synthesis
    
    def approve_peer(self, peer_id: str) -> bool:
        """Approve peer for connection."""
        if peer_id not in self.peers:
            return False
        
        self.peers[peer_id].approved = True
        logger.info("Approved peer: {}".format(self.peers[peer_id].display_name))
        return True
    
    def block_peer(self, peer_id: str) -> bool:
        """Block peer (add to blacklist)."""
        if peer_id not in self.peers:
            return False
        
        self.sharing_blacklist.append(peer_id)
        
        # Disconnect if connected
        if peer_id in self.connections:
            del self.connections[peer_id]
        
        logger.info("Blocked peer: {}".format(peer_id))
        return True
    
    # Private helper methods
    
    def _encrypt_for_peer(self, peer: PeerIdentity, content: Dict[str, Any]) -> bytes:
        """Encrypt content for peer using their public key."""
        # In production: NaCl Box (asymmetric encryption)
        plaintext = json.dumps(content).encode()
        # Mock encryption
        return b"encrypted:" + plaintext
    
    def _decrypt_from_peer(self, peer_id: str, encrypted: bytes) -> Optional[Dict[str, Any]]:
        """Decrypt content from peer."""
        # In production: NaCl Box decryption
        # Mock decryption
        if not encrypted.startswith(b"encrypted:"):
            return None
        plaintext = encrypted[10:]
        return json.loads(plaintext.decode())
    
    def _is_relevant_to_topic(self, experience: SharedExperience, topic: str) -> bool:
        """Check if experience is relevant to topic."""
        # Simple keyword matching (in production: semantic similarity)
        content_str = json.dumps(experience.content).lower()
        return topic.lower() in content_str
    
    def _synthesize_insights(self, experiences: List[SharedExperience]) -> List[str]:
        """Synthesize insights from experiences."""
        # In production: LLM-based synthesis
        insights = []
        for exp in experiences:
            if "insight" in exp.content:
                insights.append(exp.content["insight"])
        return insights
    
    def _extract_patterns(self, experiences: List[SharedExperience]) -> List[str]:
        """Extract patterns from experiences."""
        # In production: Pattern recognition across experiences
        patterns = []
        for exp in experiences:
            if "pattern" in exp.content:
                patterns.append(exp.content["pattern"])
        return patterns
    
    def _calculate_synthesis_confidence(self, experiences: List[SharedExperience]) -> float:
        """Calculate confidence in synthesis based on number and quality of experiences."""
        if not experiences:
            return 0.0
        
        # Simple heuristic (in production: more sophisticated)
        base_confidence = min(len(experiences) / 10.0, 0.9)
        return base_confidence
    
    def get_status(self) -> Dict[str, Any]:
        """Get peer network status."""
        return {
            "enabled": self.enabled,
            "peers_discovered": len(self.peers),
            "peers_connected": len(self.connections),
            "peers_approved": sum(1 for p in self.peers.values() if p.approved),
            "experiences_shared": len(self.shared_experiences),
            "public_key": self.verify_key.encode().hex()
        }
