"""Extensions System - Sallie's Self-Extension Capabilities.

Allows Sallie to add new features and capabilities to herself while 
protecting her core programming and identity.

Key Principles:
- Extensions are add-ons, not modifications to core
- All extensions must pass safety validation
- Creator can review, approve, disable, or remove extensions
- Extensions cannot access or modify protected systems
- Full audit trail of all extension changes
"""

import json
import time
import logging
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field

logger = logging.getLogger("extensions")

# Constants
EXTENSIONS_DIR = Path("progeny_root/extensions")
EXTENSIONS_REGISTRY = EXTENSIONS_DIR / "registry.json"
EXTENSIONS_AUDIT_LOG = Path("progeny_root/logs/extensions_audit.log")

# Protected paths that extensions CANNOT access
PROTECTED_PATHS = [
    "progeny_root/core",  # Core programming
    "progeny_root/limbic/heritage/core.json",  # Core heritage
    "progeny_root/limbic/soul.json",  # Limbic state
    "progeny_root/core/control_state.json",  # Control system
    "progeny_root/core/agency_state.json",  # Agency system
]

# Protected modules that extensions CANNOT import
PROTECTED_MODULES = [
    "os.system",
    "subprocess.call",
    "subprocess.run",
    "subprocess.Popen",
    "__import__",
    "eval",
    "exec",
    "compile",
]


class ExtensionStatus(str, Enum):
    """Status of an extension."""
    PENDING_REVIEW = "pending_review"  # Awaiting Creator approval
    APPROVED = "approved"  # Approved and ready to use
    ACTIVE = "active"  # Currently active
    DISABLED = "disabled"  # Disabled by Creator
    REJECTED = "rejected"  # Rejected by Creator
    DEPRECATED = "deprecated"  # No longer supported


class ExtensionCategory(str, Enum):
    """Categories of extensions."""
    TOOL = "tool"  # New tool/capability
    INTEGRATION = "integration"  # External service integration
    WORKFLOW = "workflow"  # Workflow automation
    CREATIVE = "creative"  # Creative capabilities
    COMMUNICATION = "communication"  # Communication features
    LEARNING = "learning"  # Learning enhancements
    ANALYTICS = "analytics"  # Analysis and insights
    UI = "ui"  # User interface enhancements
    OTHER = "other"


class Extension(BaseModel):
    """Represents an extension Sallie has created or proposed."""
    id: str
    name: str
    description: str
    category: ExtensionCategory
    status: ExtensionStatus = ExtensionStatus.PENDING_REVIEW
    created_by: str = "sallie"  # sallie or creator
    created_ts: float = Field(default_factory=time.time)
    created_datetime: str = Field(default_factory=lambda: datetime.now().isoformat())
    modified_ts: Optional[float] = None
    approved_ts: Optional[float] = None
    approved_by: Optional[str] = None
    version: str = "1.0.0"
    code_path: Optional[str] = None  # Path to extension code
    config: Dict[str, Any] = Field(default_factory=dict)
    dependencies: List[str] = Field(default_factory=list)
    permissions_required: List[str] = Field(default_factory=list)
    safety_validated: bool = False
    usage_count: int = 0
    last_used_ts: Optional[float] = None


class ExtensionRegistry(BaseModel):
    """Registry of all extensions."""
    extensions: Dict[str, Extension] = Field(default_factory=dict)
    pending_approval: List[str] = Field(default_factory=list)
    audit_trail: List[Dict[str, Any]] = Field(default_factory=list)
    last_updated: float = Field(default_factory=time.time)


class ExtensionsSystem:
    """
    Manages Sallie's self-extension capabilities.
    
    Sallie can create new features/tools/integrations for herself,
    but they must be validated and optionally approved by Creator.
    Extensions cannot modify core programming.
    """
    
    def __init__(self):
        """Initialize Extensions System."""
        try:
            self._ensure_directories()
            self.registry = self._load_registry()
            logger.info(f"[EXTENSIONS] Extensions system initialized. {len(self.registry.extensions)} extensions registered.")
        except Exception as e:
            logger.error(f"[EXTENSIONS] Failed to initialize: {e}", exc_info=True)
            self.registry = ExtensionRegistry()
    
    def _ensure_directories(self):
        """Ensure extension directories exist."""
        EXTENSIONS_DIR.mkdir(parents=True, exist_ok=True)
        EXTENSIONS_AUDIT_LOG.parent.mkdir(parents=True, exist_ok=True)
    
    def _load_registry(self) -> ExtensionRegistry:
        """Load extension registry from disk."""
        if EXTENSIONS_REGISTRY.exists():
            try:
                with open(EXTENSIONS_REGISTRY, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return ExtensionRegistry(**data)
            except Exception as e:
                logger.warning(f"[EXTENSIONS] Failed to load registry: {e}")
        
        return ExtensionRegistry()
    
    def _save_registry(self):
        """Save extension registry to disk."""
        try:
            self.registry.last_updated = time.time()
            temp_file = EXTENSIONS_REGISTRY.with_suffix(".tmp")
            with open(temp_file, "w", encoding="utf-8") as f:
                f.write(self.registry.model_dump_json(indent=2))
            
            if EXTENSIONS_REGISTRY.exists():
                EXTENSIONS_REGISTRY.unlink()
            temp_file.rename(EXTENSIONS_REGISTRY)
            
            logger.debug("[EXTENSIONS] Registry saved")
        except Exception as e:
            logger.error(f"[EXTENSIONS] Failed to save registry: {e}")
    
    def _generate_extension_id(self, name: str) -> str:
        """Generate unique extension ID."""
        timestamp = str(int(time.time()))
        hash_input = f"{name}{timestamp}".encode()
        return f"ext_{hashlib.sha256(hash_input).hexdigest()[:12]}"
    
    def _validate_safety(self, extension: Extension, code: Optional[str] = None) -> Dict[str, Any]:
        """
        Validate extension for safety.
        Checks for:
        - Access to protected paths
        - Use of protected modules
        - Malicious patterns
        """
        issues = []
        warnings = []
        
        if code:
            code_lower = code.lower()
            
            # Check for protected module usage
            for module in PROTECTED_MODULES:
                if module in code_lower:
                    issues.append(f"Uses protected module/function: {module}")
            
            # Check for protected path access using proper path canonicalization
            for protected_path in PROTECTED_PATHS:
                # Check various path access patterns
                path_patterns = [
                    protected_path,
                    protected_path.replace("/", "\\"),
                    f"../{protected_path}",
                    f"..\\{protected_path}",
                    protected_path.replace("/", "%2F"),  # URL encoded
                    protected_path.replace("/", "%2f"),
                ]
                for pattern in path_patterns:
                    if pattern in code:
                        issues.append(f"Attempts to access protected path: {protected_path}")
                        break
            
            # Check for path traversal patterns
            path_traversal_patterns = [
                "../",
                "..\\",
                "%2e%2e%2f",  # URL encoded ../
                "%2e%2e/",
                "..%2f",
            ]
            for pattern in path_traversal_patterns:
                if pattern in code_lower:
                    issues.append(f"Path traversal pattern detected: {pattern}")
            
            # Check for dangerous patterns
            dangerous_patterns = [
                ("rm -rf", "Dangerous file deletion pattern"),
                ("shutil.rmtree", "Bulk deletion pattern"),
                ("format(", "Potential format string attack"),
                ("pickle.loads", "Potential deserialization attack"),
                ("pickle.load", "Potential deserialization attack"),
                ("marshal.loads", "Potential deserialization attack"),
                ("marshal.load", "Potential deserialization attack"),
                ("dill.loads", "Potential deserialization attack"),
                ("dill.load", "Potential deserialization attack"),
                ("yaml.load", "Unsafe YAML load (use safe_load)"),
                ("yaml.unsafe_load", "Unsafe YAML load"),
                ("socket.socket", "Network socket creation"),
                ("ctypes", "C-type access (potential memory manipulation)"),
            ]
            
            for pattern, description in dangerous_patterns:
                if pattern in code:
                    warnings.append(f"{description}: {pattern}")
        
        # Check permissions
        high_risk_permissions = ["file_system_write", "network_access", "system_exec"]
        for perm in extension.permissions_required:
            if perm in high_risk_permissions:
                warnings.append(f"Requires high-risk permission: {perm}")
        
        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings,
            "validated_at": time.time()
        }
    
    def _audit_log(self, action: str, extension_id: str, details: Dict[str, Any]):
        """Log extension action to audit trail."""
        entry = {
            "timestamp": time.time(),
            "datetime": datetime.now().isoformat(),
            "action": action,
            "extension_id": extension_id,
            "details": details
        }
        
        self.registry.audit_trail.append(entry)
        
        # Keep last 1000 entries
        if len(self.registry.audit_trail) > 1000:
            self.registry.audit_trail = self.registry.audit_trail[-1000:]
        
        # Write to audit log file
        try:
            with open(EXTENSIONS_AUDIT_LOG, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            logger.warning(f"[EXTENSIONS] Failed to write audit log: {e}")
    
    def propose_extension(
        self,
        name: str,
        description: str,
        category: ExtensionCategory,
        code: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
        dependencies: Optional[List[str]] = None,
        permissions_required: Optional[List[str]] = None,
        auto_approve_if_safe: bool = False
    ) -> Dict[str, Any]:
        """
        Sallie proposes a new extension.
        
        The extension goes through:
        1. Safety validation
        2. Pending approval (unless auto_approve_if_safe and passes validation)
        3. Creator review (optional)
        4. Activation
        """
        logger.info(f"[EXTENSIONS] Proposing extension: {name}")
        
        try:
            # Generate ID
            ext_id = self._generate_extension_id(name)
            
            # Create extension object
            extension = Extension(
                id=ext_id,
                name=name,
                description=description,
                category=category,
                config=config or {},
                dependencies=dependencies or [],
                permissions_required=permissions_required or [],
            )
            
            # Safety validation
            safety_result = self._validate_safety(extension, code)
            extension.safety_validated = safety_result["valid"]
            
            if not safety_result["valid"]:
                # Safety validation failed
                extension.status = ExtensionStatus.REJECTED
                self.registry.extensions[ext_id] = extension
                self._save_registry()
                
                self._audit_log("propose_rejected", ext_id, {
                    "reason": "safety_validation_failed",
                    "issues": safety_result["issues"]
                })
                
                return {
                    "status": "rejected",
                    "extension_id": ext_id,
                    "reason": "Safety validation failed",
                    "issues": safety_result["issues"]
                }
            
            # Save code if provided
            if code:
                code_path = EXTENSIONS_DIR / ext_id / "main.py"
                code_path.parent.mkdir(parents=True, exist_ok=True)
                code_path.write_text(code, encoding="utf-8")
                extension.code_path = str(code_path)
            
            # Auto-approve if safe and permitted
            if auto_approve_if_safe and safety_result["valid"] and not safety_result["warnings"]:
                extension.status = ExtensionStatus.APPROVED
                extension.approved_ts = time.time()
                extension.approved_by = "auto"
                
                self._audit_log("auto_approved", ext_id, {
                    "name": name,
                    "category": category.value
                })
            else:
                extension.status = ExtensionStatus.PENDING_REVIEW
                self.registry.pending_approval.append(ext_id)
                
                self._audit_log("proposed", ext_id, {
                    "name": name,
                    "category": category.value,
                    "warnings": safety_result["warnings"]
                })
            
            self.registry.extensions[ext_id] = extension
            self._save_registry()
            
            return {
                "status": "success",
                "extension_id": ext_id,
                "extension_status": extension.status.value,
                "safety_validation": safety_result,
                "requires_approval": extension.status == ExtensionStatus.PENDING_REVIEW
            }
            
        except Exception as e:
            logger.error(f"[EXTENSIONS] Failed to propose extension: {e}", exc_info=True)
            return {"status": "error", "message": str(e)}
    
    def approve_extension(self, extension_id: str, approved_by: str = "creator") -> Dict[str, Any]:
        """Creator approves a pending extension."""
        if extension_id not in self.registry.extensions:
            return {"status": "error", "message": "Extension not found"}
        
        extension = self.registry.extensions[extension_id]
        
        if extension.status != ExtensionStatus.PENDING_REVIEW:
            return {"status": "error", "message": f"Extension is not pending review (status: {extension.status.value})"}
        
        extension.status = ExtensionStatus.APPROVED
        extension.approved_ts = time.time()
        extension.approved_by = approved_by
        
        if extension_id in self.registry.pending_approval:
            self.registry.pending_approval.remove(extension_id)
        
        self._save_registry()
        
        self._audit_log("approved", extension_id, {"approved_by": approved_by})
        
        logger.info(f"[EXTENSIONS] Extension approved: {extension.name}")
        
        return {
            "status": "success",
            "extension_id": extension_id,
            "extension_status": extension.status.value
        }
    
    def reject_extension(self, extension_id: str, reason: str = "") -> Dict[str, Any]:
        """Creator rejects a pending extension."""
        if extension_id not in self.registry.extensions:
            return {"status": "error", "message": "Extension not found"}
        
        extension = self.registry.extensions[extension_id]
        extension.status = ExtensionStatus.REJECTED
        
        if extension_id in self.registry.pending_approval:
            self.registry.pending_approval.remove(extension_id)
        
        self._save_registry()
        
        self._audit_log("rejected", extension_id, {"reason": reason})
        
        logger.info(f"[EXTENSIONS] Extension rejected: {extension.name}")
        
        return {
            "status": "success",
            "extension_id": extension_id,
            "extension_status": extension.status.value
        }
    
    def activate_extension(self, extension_id: str) -> Dict[str, Any]:
        """Activate an approved extension."""
        if extension_id not in self.registry.extensions:
            return {"status": "error", "message": "Extension not found"}
        
        extension = self.registry.extensions[extension_id]
        
        if extension.status not in [ExtensionStatus.APPROVED, ExtensionStatus.DISABLED]:
            return {"status": "error", "message": f"Extension cannot be activated (status: {extension.status.value})"}
        
        extension.status = ExtensionStatus.ACTIVE
        extension.modified_ts = time.time()
        
        self._save_registry()
        
        self._audit_log("activated", extension_id, {})
        
        logger.info(f"[EXTENSIONS] Extension activated: {extension.name}")
        
        return {
            "status": "success",
            "extension_id": extension_id,
            "extension_status": extension.status.value
        }
    
    def disable_extension(self, extension_id: str, reason: str = "") -> Dict[str, Any]:
        """Disable an active extension."""
        if extension_id not in self.registry.extensions:
            return {"status": "error", "message": "Extension not found"}
        
        extension = self.registry.extensions[extension_id]
        extension.status = ExtensionStatus.DISABLED
        extension.modified_ts = time.time()
        
        self._save_registry()
        
        self._audit_log("disabled", extension_id, {"reason": reason})
        
        logger.info(f"[EXTENSIONS] Extension disabled: {extension.name}")
        
        return {
            "status": "success",
            "extension_id": extension_id,
            "extension_status": extension.status.value
        }
    
    def remove_extension(self, extension_id: str, reason: str = "") -> Dict[str, Any]:
        """Completely remove an extension (Creator only)."""
        if extension_id not in self.registry.extensions:
            return {"status": "error", "message": "Extension not found"}
        
        extension = self.registry.extensions[extension_id]
        
        # Remove code files
        if extension.code_path:
            code_path = Path(extension.code_path)
            if code_path.exists():
                code_path.unlink()
            if code_path.parent.exists() and not any(code_path.parent.iterdir()):
                code_path.parent.rmdir()
        
        # Remove from registry
        del self.registry.extensions[extension_id]
        
        if extension_id in self.registry.pending_approval:
            self.registry.pending_approval.remove(extension_id)
        
        self._save_registry()
        
        self._audit_log("removed", extension_id, {"reason": reason, "name": extension.name})
        
        logger.info(f"[EXTENSIONS] Extension removed: {extension.name}")
        
        return {"status": "success", "message": f"Extension {extension.name} removed"}
    
    def get_extension(self, extension_id: str) -> Optional[Extension]:
        """Get extension by ID."""
        return self.registry.extensions.get(extension_id)
    
    def list_extensions(
        self,
        status: Optional[ExtensionStatus] = None,
        category: Optional[ExtensionCategory] = None
    ) -> List[Extension]:
        """List extensions, optionally filtered by status or category."""
        extensions = list(self.registry.extensions.values())
        
        if status:
            extensions = [e for e in extensions if e.status == status]
        
        if category:
            extensions = [e for e in extensions if e.category == category]
        
        return extensions
    
    def get_pending_extensions(self) -> List[Extension]:
        """Get extensions pending Creator approval."""
        return [
            self.registry.extensions[ext_id]
            for ext_id in self.registry.pending_approval
            if ext_id in self.registry.extensions
        ]
    
    def get_active_extensions(self) -> List[Extension]:
        """Get all active extensions."""
        return self.list_extensions(status=ExtensionStatus.ACTIVE)
    
    def use_extension(self, extension_id: str) -> Dict[str, Any]:
        """Record usage of an extension."""
        if extension_id not in self.registry.extensions:
            return {"status": "error", "message": "Extension not found"}
        
        extension = self.registry.extensions[extension_id]
        
        if extension.status != ExtensionStatus.ACTIVE:
            return {"status": "error", "message": f"Extension is not active (status: {extension.status.value})"}
        
        extension.usage_count += 1
        extension.last_used_ts = time.time()
        
        self._save_registry()
        
        return {
            "status": "success",
            "extension_id": extension_id,
            "usage_count": extension.usage_count
        }
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of extensions."""
        extensions = list(self.registry.extensions.values())
        
        status_counts = {}
        for ext in extensions:
            status = ext.status.value
            status_counts[status] = status_counts.get(status, 0) + 1
        
        category_counts = {}
        for ext in extensions:
            cat = ext.category.value
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        return {
            "total_extensions": len(extensions),
            "pending_approval": len(self.registry.pending_approval),
            "active": len(self.get_active_extensions()),
            "by_status": status_counts,
            "by_category": category_counts,
            "recent_activity": self.registry.audit_trail[-10:]
        }


# Singleton instance
_extensions_system: Optional[ExtensionsSystem] = None


def get_extensions_system() -> ExtensionsSystem:
    """Get or create the global extensions system."""
    global _extensions_system
    if _extensions_system is None:
        _extensions_system = ExtensionsSystem()
    return _extensions_system
