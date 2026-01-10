"""
Trust Tiers Enforcement System
Canonical Spec Reference: Section 8.1 - Trust Tiers & Permission Matrix

Implements hard boundary enforcement of capability access based on trust level.
This ensures Sallie's capabilities expand gradually as trust builds.
"""

import logging
from enum import Enum
from typing import Dict, List, Optional, Callable
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)


class TrustTier(Enum):
    """
    Canonical Spec Section 8.1: Four Trust Tiers
    """
    TIER_0 = 0  # 0.0-0.6: Observer - Read-only, suggestions only
    TIER_1 = 1  # 0.6-0.8: Assistant - Write to /drafts/ only
    TIER_2 = 2  # 0.8-0.9: Partner - Write with Git commit, sandboxed execution
    TIER_3 = 3  # 0.9-1.0: Surrogate - Full autonomous execution with self-report


@dataclass
class CapabilityContract:
    """Defines what a capability can and cannot do at each tier"""
    name: str
    description: str
    tier_0_allowed: bool
    tier_1_allowed: bool
    tier_2_allowed: bool
    tier_3_allowed: bool
    safety_constraints: Dict[int, List[str]]  # Tier -> list of constraints
    
    
class TrustTiers:
    """
    Manages trust-gated capabilities with hard boundary enforcement
    Canonical Spec Section 8.1
    """
    
    def __init__(self):
        self.current_trust = 0.5  # Start at mid-level
        self.capability_contracts = self._initialize_contracts()
        self.action_log = []
        
    def _initialize_contracts(self) -> Dict[str, CapabilityContract]:
        """
        Initialize capability contracts for each capability type
        Canonical Spec Section 8.1.2: Capability Contracts
        """
        return {
            'file_read': CapabilityContract(
                name='File Read',
                description='Read files from filesystem',
                tier_0_allowed=True,
                tier_1_allowed=True,
                tier_2_allowed=True,
                tier_3_allowed=True,
                safety_constraints={
                    0: ['Read-only, no modifications', 'No sensitive file access'],
                    1: ['Read-only, no modifications'],
                    2: ['Read-only, no modifications'],
                    3: ['Read-only, no modifications']
                }
            ),
            
            'file_write_drafts': CapabilityContract(
                name='File Write (Drafts)',
                description='Write files to /drafts/ directory only',
                tier_0_allowed=False,
                tier_1_allowed=True,
                tier_2_allowed=True,
                tier_3_allowed=True,
                safety_constraints={
                    1: ['Write to /drafts/ only', 'Preview diff before write', 'User approval required'],
                    2: ['Write to /drafts/', 'Auto-commit with Git', 'Rollback available'],
                    3: ['Write to /drafts/', 'Auto-commit', 'Self-report action']
                }
            ),
            
            'file_write': CapabilityContract(
                name='File Write (General)',
                description='Write files anywhere in project',
                tier_0_allowed=False,
                tier_1_allowed=False,
                tier_2_allowed=True,
                tier_3_allowed=True,
                safety_constraints={
                    2: [
                        'Whitelist paths only',
                        'Preview diff before write',
                        'Git commit before modification',
                        'Rollback mechanism available',
                        'User notification required'
                    ],
                    3: [
                        'Whitelist paths only',
                        'Git commit before modification',
                        'Rollback available',
                        'Self-report to user'
                    ]
                }
            ),
            
            'shell_exec': CapabilityContract(
                name='Shell Execution',
                description='Execute shell commands',
                tier_0_allowed=False,
                tier_1_allowed=False,
                tier_2_allowed=True,
                tier_3_allowed=True,
                safety_constraints={
                    2: [
                        'Sandboxed execution only',
                        '/safe_scripts/ directory only',
                        'Dry-run preview required',
                        'User approval required',
                        'No destructive commands'
                    ],
                    3: [
                        '/safe_scripts/ directory only',
                        'Audit log all commands',
                        'Self-report execution',
                        'No destructive without confirmation'
                    ]
                }
            ),
            
            'email_send': CapabilityContract(
                name='Email Send',
                description='Send emails on behalf of Creator',
                tier_0_allowed=False,
                tier_1_allowed=False,
                tier_2_allowed=True,
                tier_3_allowed=True,
                safety_constraints={
                    2: [
                        'Save to outbox/drafts only',
                        'No direct send',
                        'User reviews before send',
                        'All recipients visible to user'
                    ],
                    3: [
                        'Save to outbox first',
                        'Self-report before send',
                        'User can review and veto',
                        'All recipients logged'
                    ]
                }
            ),
            
            'api_call': CapabilityContract(
                name='API Calls',
                description='Make external API calls',
                tier_0_allowed=False,
                tier_1_allowed=True,
                tier_2_allowed=True,
                tier_3_allowed=True,
                safety_constraints={
                    1: ['Read-only APIs only', 'No authentication', 'Public data only'],
                    2: ['Authenticated APIs allowed', 'Preview data before send', 'User approval'],
                    3: ['Full API access', 'Audit log', 'Self-report']
                }
            ),
            
            'data_modification': CapabilityContract(
                name='Data Modification',
                description='Modify Creator\'s data (notes, tasks, etc.)',
                tier_0_allowed=False,
                tier_1_allowed=False,
                tier_2_allowed=True,
                tier_3_allowed=True,
                safety_constraints={
                    2: [
                        'Backup before modification',
                        'Preview changes',
                        'User approval',
                        'Rollback available'
                    ],
                    3: [
                        'Auto-backup',
                        'Self-report changes',
                        'Rollback available',
                        'Change summary logged'
                    ]
                }
            )
        }
    
    def get_current_tier(self, trust_level: Optional[float] = None) -> TrustTier:
        """
        Get the current trust tier based on trust level
        Canonical Spec Section 8.1: Hard Boundaries
        
        If Trust is 0.79, capabilities are Tier 1 (not "almost Tier 2")
        """
        if trust_level is None:
            trust_level = self.current_trust
            
        if trust_level < 0.6:
            return TrustTier.TIER_0
        elif trust_level < 0.8:
            return TrustTier.TIER_1
        elif trust_level < 0.9:
            return TrustTier.TIER_2
        else:
            return TrustTier.TIER_3
    
    def can_execute(
        self,
        capability: str,
        trust_level: Optional[float] = None
    ) -> tuple[bool, str]:
        """
        Check if a capability can be executed at current trust level
        
        Args:
            capability: Name of the capability to check
            trust_level: Override current trust level (optional)
            
        Returns:
            (allowed, reason)
        """
        tier = self.get_current_tier(trust_level)
        
        if capability not in self.capability_contracts:
            return False, f"Unknown capability: {capability}"
        
        contract = self.capability_contracts[capability]
        
        # Check tier-specific permission
        allowed = False
        if tier == TrustTier.TIER_0:
            allowed = contract.tier_0_allowed
        elif tier == TrustTier.TIER_1:
            allowed = contract.tier_1_allowed
        elif tier == TrustTier.TIER_2:
            allowed = contract.tier_2_allowed
        elif tier == TrustTier.TIER_3:
            allowed = contract.tier_3_allowed
        
        if not allowed:
            return False, (
                f"Capability '{capability}' requires {self._get_required_tier(contract)} "
                f"but current tier is {tier.name} (trust: {self.current_trust:.2f})"
            )
        
        return True, f"Allowed at {tier.name}"
    
    def _get_required_tier(self, contract: CapabilityContract) -> str:
        """Get the minimum required tier for a capability"""
        if contract.tier_0_allowed:
            return "TIER_0 (0.0+)"
        elif contract.tier_1_allowed:
            return "TIER_1 (0.6+)"
        elif contract.tier_2_allowed:
            return "TIER_2 (0.8+)"
        elif contract.tier_3_allowed:
            return "TIER_3 (0.9+)"
        return "Never allowed"
    
    def get_safety_constraints(
        self,
        capability: str,
        trust_level: Optional[float] = None
    ) -> List[str]:
        """
        Get safety constraints for a capability at current trust level
        
        Args:
            capability: Name of the capability
            trust_level: Override current trust level (optional)
            
        Returns:
            List of safety constraints that must be followed
        """
        tier = self.get_current_tier(trust_level)
        
        if capability not in self.capability_contracts:
            return []
        
        contract = self.capability_contracts[capability]
        return contract.safety_constraints.get(tier.value, [])
    
    def enforce_capability(
        self,
        capability: str,
        action_details: Dict,
        trust_level: Optional[float] = None
    ) -> Dict:
        """
        Enforce capability with safety constraints
        
        Args:
            capability: Name of capability to enforce
            action_details: Details of the action being attempted
            trust_level: Override current trust level (optional)
            
        Returns:
            {
                'allowed': bool,
                'tier': str,
                'constraints': [str],
                'reason': str,
                'needs_approval': bool,
                'needs_preview': bool
            }
        """
        allowed, reason = self.can_execute(capability, trust_level)
        tier = self.get_current_tier(trust_level)
        constraints = self.get_safety_constraints(capability, trust_level)
        
        # Determine if user approval or preview is needed
        needs_approval = any('approval required' in c.lower() for c in constraints)
        needs_preview = any('preview' in c.lower() for c in constraints)
        
        result = {
            'allowed': allowed,
            'tier': tier.name,
            'trust_level': trust_level or self.current_trust,
            'constraints': constraints,
            'reason': reason,
            'needs_approval': needs_approval,
            'needs_preview': needs_preview,
            'action_details': action_details
        }
        
        # Log the enforcement check
        self.action_log.append({
            'timestamp': Path(__file__).stat().st_mtime,  # Simple timestamp
            'capability': capability,
            'result': result
        })
        
        logger.info(f"Capability check: {capability} - {result}")
        
        return result
    
    def update_trust(self, new_trust: float, reason: str):
        """
        Update trust level and log the change
        
        Args:
            new_trust: New trust level (0.0-1.0)
            reason: Reason for trust change
        """
        old_trust = self.current_trust
        old_tier = self.get_current_tier(old_trust)
        
        self.current_trust = max(0.0, min(1.0, new_trust))
        new_tier = self.get_current_tier(self.current_trust)
        
        logger.info(
            f"Trust updated: {old_trust:.2f} → {self.current_trust:.2f} "
            f"({old_tier.name} → {new_tier.name}) - Reason: {reason}"
        )
        
        # If tier changed, log it prominently
        if old_tier != new_tier:
            logger.warning(
                f"⚡ TIER CHANGE: {old_tier.name} → {new_tier.name} "
                f"New capabilities unlocked!" if new_tier.value > old_tier.value 
                else "Capabilities restricted!"
            )
    
    def get_tier_summary(self, trust_level: Optional[float] = None) -> Dict:
        """
        Get a summary of what's available at current trust tier
        
        Args:
            trust_level: Override current trust level (optional)
            
        Returns:
            {
                'tier': str,
                'trust_level': float,
                'allowed_capabilities': [str],
                'restricted_capabilities': [str],
                'next_tier_at': float,
                'next_tier_unlocks': [str]
            }
        """
        tier = self.get_current_tier(trust_level)
        trust = trust_level or self.current_trust
        
        allowed = []
        restricted = []
        
        for cap_name, contract in self.capability_contracts.items():
            can_exec, _ = self.can_execute(cap_name, trust)
            if can_exec:
                allowed.append(cap_name)
            else:
                restricted.append(cap_name)
        
        # Determine next tier threshold
        next_tier_at = None
        next_tier_name = None
        if trust < 0.6:
            next_tier_at = 0.6
            next_tier_name = "TIER_1"
        elif trust < 0.8:
            next_tier_at = 0.8
            next_tier_name = "TIER_2"
        elif trust < 0.9:
            next_tier_at = 0.9
            next_tier_name = "TIER_3"
        
        # What unlocks at next tier
        next_tier_unlocks = []
        if next_tier_at:
            for cap_name in restricted:
                can_exec_next, _ = self.can_execute(cap_name, next_tier_at)
                if can_exec_next:
                    next_tier_unlocks.append(cap_name)
        
        return {
            'tier': tier.name,
            'trust_level': trust,
            'allowed_capabilities': allowed,
            'restricted_capabilities': restricted,
            'next_tier_at': next_tier_at,
            'next_tier_name': next_tier_name,
            'next_tier_unlocks': next_tier_unlocks
        }


# Global trust tiers manager
trust_manager = TrustTiers()


def get_trust_manager() -> TrustTiers:
    """Get the global trust tiers manager"""
    return trust_manager
