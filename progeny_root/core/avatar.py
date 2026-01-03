"""Sallie's Avatar Customization System.

Enhanced with:
- Complete avatar types and options
- Preview generation
- Enhanced bounds validation
- Color validation (saturation, contrast)
- Complete persistence
"""

import json
import logging
import time
import re
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator

try:
    from .identity import get_identity_system, AestheticViolation
except ImportError:
    try:
        from identity import get_identity_system, AestheticViolation
    except ImportError:
        get_identity_system = None
        AestheticViolation = None

logger = logging.getLogger("avatar")

# Constants
AVATAR_FILE = Path("progeny_root/limbic/heritage/avatar.json")
AVATAR_ASSETS_DIR = Path("progeny_root/interface/web/assets/avatars")

# Aesthetic bounds for avatar customization
FORBIDDEN_KEYWORDS = ["explicit", "violent", "grotesque", "disturbing", "inappropriate", "offensive"]


class AvatarConfig(BaseModel):
    """Avatar configuration model."""
    type: str = Field(default="gradient", description="Avatar type: gradient, image, emoji, custom")
    primary_color: str = Field(default="#8b5cf6", description="Primary color (hex)")
    secondary_color: str = Field(default="#a78bfa", description="Secondary color (hex)")
    accent_color: str = Field(default="#22d3ee", description="Accent color (hex)")
    image_url: Optional[str] = Field(default=None, description="Custom image URL if type is image")
    emoji: Optional[str] = Field(default=None, description="Emoji if type is emoji")
    style: str = Field(default="modern", description="Style: modern, classic, minimal, vibrant")
    animation: str = Field(default="breathe", description="Animation: breathe, pulse, none")
    chosen_by: str = Field(default="sallie", description="Who chose this: sallie, creator, system")
    chosen_at: float = Field(default_factory=time.time, description="Timestamp when chosen")
    version: int = Field(default=1, description="Avatar version number")
    
    @field_validator('primary_color', 'secondary_color', 'accent_color')
    @classmethod
    def validate_color(cls, v: str) -> str:
        """Validate hex color format."""
        if not v.startswith('#'):
            raise ValueError("Color must be in hex format (#RRGGBB)")
        if len(v) != 7:
            raise ValueError("Color must be 6 hex digits")
        return v
    
    @field_validator('type')
    @classmethod
    def validate_type(cls, v: str) -> str:
        """Validate avatar type."""
        allowed = ["gradient", "image", "emoji", "custom"]
        if v not in allowed:
            raise ValueError(f"Avatar type must be one of: {allowed}")
        return v
    
    @field_validator('style')
    @classmethod
    def validate_style(cls, v: str) -> str:
        """Validate style."""
        allowed = ["modern", "classic", "minimal", "vibrant"]
        if v not in allowed:
            raise ValueError(f"Style must be one of: {allowed}")
        return v


class AvatarSystem:
    """
    Manages Sallie's avatar customization.
    Enforces aesthetic bounds and integrates with identity system.
    """
    
    def __init__(self):
        self.identity = get_identity_system()
        self.avatar_config = self._load_or_create()
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure avatar directories exist."""
        AVATAR_FILE.parent.mkdir(parents=True, exist_ok=True)
        AVATAR_ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    
    def _load_or_create(self) -> AvatarConfig:
        """Load existing avatar config or create default."""
        if AVATAR_FILE.exists():
            try:
                with open(AVATAR_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                return AvatarConfig(**data)
            except Exception as e:
                logger.warning(f"Error loading avatar config: {e}. Creating default.")
        
        # Default avatar (gradient with Sallie's colors)
        return AvatarConfig(
            type="gradient",
            primary_color="#8b5cf6",
            secondary_color="#a78bfa",
            accent_color="#22d3ee",
            style="modern",
            animation="breathe",
            chosen_by="system",
            chosen_at=time.time()
        )
    
    def save(self):
        """Save avatar configuration to disk with enhanced error handling."""
        temp_file = AVATAR_FILE.with_suffix(".tmp")
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                with open(temp_file, "w", encoding="utf-8") as f:
                    f.write(self.avatar_config.model_dump_json(indent=2))
                
                # Verify temp file was written
                if not temp_file.exists() or temp_file.stat().st_size == 0:
                    raise IOError("Temp file is empty or missing")
                
                # Atomic rename
                if AVATAR_FILE.exists():
                    AVATAR_FILE.unlink()
                temp_file.rename(AVATAR_FILE)
                
                logger.debug(f"[Avatar] Saved avatar config (attempt {attempt + 1})")
                return True
                
            except IOError as e:
                logger.error(f"[Avatar] IO error saving avatar (attempt {attempt + 1}): {e}")
                if attempt == max_retries - 1:
                    raise
                time.sleep(0.1)
            except Exception as e:
                logger.error(f"[Avatar] Error saving avatar config: {e}", exc_info=True)
                if attempt == max_retries - 1:
                    raise
        
        return False
    
    def validate_aesthetic_bounds(self, config: Dict[str, Any]) -> bool:
        """
        Validate that avatar configuration doesn't violate aesthetic bounds.
        Enhanced with color validation and comprehensive checks.
        Returns True if valid, raises AestheticViolation if invalid.
        """
        # Check for forbidden keywords in all string fields
        config_str = json.dumps(config).lower()
        for keyword in FORBIDDEN_KEYWORDS:
            if keyword in config_str:
                raise AestheticViolation(f"Avatar configuration violates aesthetic bounds: contains '{keyword}'")
        
        # Check image URL if provided
        if config.get("image_url"):
            url_lower = config["image_url"].lower()
            for keyword in FORBIDDEN_KEYWORDS:
                if keyword in url_lower:
                    raise AestheticViolation(f"Avatar image URL violates aesthetic bounds: contains '{keyword}'")
            
            # Validate URL format
            if not (url_lower.startswith("http://") or url_lower.startswith("https://") or url_lower.startswith("/")):
                raise AestheticViolation("Avatar image URL must be a valid HTTP/HTTPS URL or relative path")
        
        # Check emoji if provided
        if config.get("emoji"):
            emoji = config["emoji"]
            if len(emoji) > 10:  # Reasonable emoji length
                raise AestheticViolation("Avatar emoji is too long")
            
            # Check for forbidden emoji patterns (can be extended)
            forbidden_emoji_patterns = ["💀", "🔪", "💣"]  # Add more as needed
            if emoji in forbidden_emoji_patterns:
                raise AestheticViolation(f"Avatar emoji '{emoji}' is not allowed")
        
        # Validate colors
        for color_key in ["primary_color", "secondary_color", "accent_color"]:
            if config.get(color_key):
                color = config[color_key]
                if not self._validate_color_format(color):
                    raise AestheticViolation(f"Invalid color format for {color_key}: {color}")
                
                # Check color saturation (prevent dull/monochromatic)
                if not self._validate_color_saturation(color):
                    raise AestheticViolation(f"Color {color_key} is too desaturated (minimum 0.3 required)")
        
        # Validate color contrast if multiple colors provided
        if config.get("primary_color") and config.get("secondary_color"):
            contrast = self._calculate_contrast(config["primary_color"], config["secondary_color"])
            if contrast > 10.0:  # Maximum contrast ratio to prevent eye strain
                raise AestheticViolation(f"Color contrast too high ({contrast:.2f}), maximum 10.0 allowed")
        
        return True
    
    def _validate_color_format(self, color: str) -> bool:
        """Validate hex color format."""
        if not color.startswith('#'):
            return False
        if len(color) != 7:
            return False
        if not re.match(r'^#[0-9A-Fa-f]{6}$', color):
            return False
        return True
    
    def _validate_color_saturation(self, color: str, min_saturation: float = 0.3) -> bool:
        """Validate color saturation (prevent dull colors)."""
        try:
            # Convert hex to RGB
            r = int(color[1:3], 16) / 255.0
            g = int(color[3:5], 16) / 255.0
            b = int(color[5:7], 16) / 255.0
            
            # Calculate saturation (simplified)
            max_val = max(r, g, b)
            min_val = min(r, g, b)
            
            if max_val == 0:
                return False
            
            saturation = (max_val - min_val) / max_val if max_val > 0 else 0
            
            return saturation >= min_saturation
        except Exception:
            return False
    
    def _calculate_contrast(self, color1: str, color2: str) -> float:
        """Calculate contrast ratio between two colors."""
        try:
            def get_luminance(color):
                r = int(color[1:3], 16) / 255.0
                g = int(color[3:5], 16) / 255.0
                b = int(color[5:7], 16) / 255.0
                
                # Relative luminance
                r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
                g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
                b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
                
                return 0.2126 * r + 0.7152 * g + 0.0722 * b
            
            l1 = get_luminance(color1)
            l2 = get_luminance(color2)
            
            lighter = max(l1, l2)
            darker = min(l1, l2)
            
            return (lighter + 0.05) / (darker + 0.05) if darker > 0 else float('inf')
        except Exception:
            return 1.0
    
    def update_avatar(self, config: Dict[str, Any], chosen_by: str = "sallie") -> bool:
        """
        Update avatar configuration.
        Enforces aesthetic bounds and updates identity system.
        """
        try:
            # Validate aesthetic bounds
            self.validate_aesthetic_bounds(config)
            
            # Create new config
            new_config = AvatarConfig(
                **config,
                chosen_by=chosen_by,
                chosen_at=time.time(),
                version=self.avatar_config.version + 1
            )
            
            # Update
            self.avatar_config = new_config
            self.save()
            
            # Update identity system's surface expression
            self.identity.update_surface_expression(
                appearance={
                    "avatar": {
                        "type": new_config.type,
                        "primary_color": new_config.primary_color,
                        "secondary_color": new_config.secondary_color,
                        "accent_color": new_config.accent_color,
                        "style": new_config.style,
                        "animation": new_config.animation,
                        "version": new_config.version
                    }
                }
            )
            
            logger.info(f"Avatar updated by {chosen_by}. Type: {new_config.type}, Style: {new_config.style}")
            return True
            
        except AestheticViolation as e:
            logger.warning(f"Avatar update rejected: {e}")
            return False
        except Exception as e:
            logger.error(f"Error updating avatar: {e}")
            return False
    
    def get_avatar_options(self) -> List[Dict[str, Any]]:
        """
        Get available avatar options for Sallie to choose from.
        All options are pre-validated to be within aesthetic bounds.
        Enhanced with more types and previews.
        """
        options = [
            # Gradient options
            {
                "id": "gradient-modern",
                "name": "Modern Gradient",
                "type": "gradient",
                "primary_color": "#8b5cf6",
                "secondary_color": "#a78bfa",
                "accent_color": "#22d3ee",
                "style": "modern",
                "animation": "breathe",
                "preview": self._generate_preview("gradient", {"primary": "#8b5cf6", "secondary": "#a78bfa"})
            },
            {
                "id": "gradient-vibrant",
                "name": "Vibrant Gradient",
                "type": "gradient",
                "primary_color": "#f59e0b",
                "secondary_color": "#fbbf24",
                "accent_color": "#ef4444",
                "style": "vibrant",
                "animation": "pulse",
                "preview": self._generate_preview("gradient", {"primary": "#f59e0b", "secondary": "#fbbf24"})
            },
            {
                "id": "gradient-minimal",
                "name": "Minimal Gradient",
                "type": "gradient",
                "primary_color": "#6b7280",
                "secondary_color": "#9ca3af",
                "accent_color": "#d1d5db",
                "style": "minimal",
                "animation": "none",
                "preview": self._generate_preview("gradient", {"primary": "#6b7280", "secondary": "#9ca3af"})
            },
            {
                "id": "gradient-cyber",
                "name": "Cyber Gradient",
                "type": "gradient",
                "primary_color": "#00f5ff",
                "secondary_color": "#8b5cf6",
                "accent_color": "#f472b6",
                "style": "modern",
                "animation": "pulse",
                "preview": self._generate_preview("gradient", {"primary": "#00f5ff", "secondary": "#8b5cf6"})
            },
            {
                "id": "gradient-classic",
                "name": "Classic Gradient",
                "type": "gradient",
                "primary_color": "#6366f1",
                "secondary_color": "#8b5cf6",
                "accent_color": "#a78bfa",
                "style": "classic",
                "animation": "breathe",
                "preview": self._generate_preview("gradient", {"primary": "#6366f1", "secondary": "#8b5cf6"})
            },
            # Emoji options
            {
                "id": "emoji-smile",
                "name": "Smile Emoji",
                "type": "emoji",
                "emoji": "😊",
                "primary_color": "#8b5cf6",
                "style": "modern",
                "animation": "breathe",
                "preview": self._generate_preview("emoji", {"emoji": "😊", "color": "#8b5cf6"})
            },
            {
                "id": "emoji-sparkle",
                "name": "Sparkle Emoji",
                "type": "emoji",
                "emoji": "✨",
                "primary_color": "#f59e0b",
                "style": "vibrant",
                "animation": "pulse",
                "preview": self._generate_preview("emoji", {"emoji": "✨", "color": "#f59e0b"})
            },
            {
                "id": "emoji-star",
                "name": "Star Emoji",
                "type": "emoji",
                "emoji": "⭐",
                "primary_color": "#22d3ee",
                "style": "modern",
                "animation": "breathe",
                "preview": self._generate_preview("emoji", {"emoji": "⭐", "color": "#22d3ee"})
            },
            {
                "id": "emoji-crystal",
                "name": "Crystal Emoji",
                "type": "emoji",
                "emoji": "💎",
                "primary_color": "#a78bfa",
                "style": "modern",
                "animation": "pulse",
                "preview": self._generate_preview("emoji", {"emoji": "💎", "color": "#a78bfa"})
            },
            # Custom option
            {
                "id": "custom",
                "name": "Custom Avatar",
                "type": "custom",
                "style": "modern",
                "animation": "breathe",
                "preview": self._generate_preview("custom", {})
            }
        ]
        
        return options
    
    def _generate_preview(self, preview_type: str, config: Dict[str, Any]) -> str:
        """Generate preview HTML/CSS for avatar option."""
        if preview_type == "gradient":
            primary = config.get("primary", "#8b5cf6")
            secondary = config.get("secondary", "#a78bfa")
            return f"linear-gradient(135deg, {primary}, {secondary})"
        elif preview_type == "emoji":
            emoji = config.get("emoji", "✨")
            color = config.get("color", "#8b5cf6")
            return f"emoji:{emoji}:{color}"
        elif preview_type == "custom":
            return "custom:configure"
        return "default"
    
    def choose_avatar(self, option_id: str, custom_config: Optional[Dict[str, Any]] = None) -> bool:
        """
        Sallie chooses an avatar option.
        If option_id is "custom", custom_config must be provided.
        """
        options = self.get_avatar_options()
        option = next((opt for opt in options if opt["id"] == option_id), None)
        
        if not option:
            logger.error(f"Invalid avatar option: {option_id}")
            return False
        
        if option_id == "custom":
            if not custom_config:
                logger.error("Custom config required for custom avatar")
                return False
            config = custom_config
        else:
            # Use option config
            config = {
                "type": option["type"],
                "primary_color": option.get("primary_color", "#8b5cf6"),
                "secondary_color": option.get("secondary_color", "#a78bfa"),
                "accent_color": option.get("accent_color", "#22d3ee"),
                "style": option["style"],
                "animation": option["animation"]
            }
            if option.get("emoji"):
                config["emoji"] = option["emoji"]
            if option.get("image_url"):
                config["image_url"] = option["image_url"]
        
        return self.update_avatar(config, chosen_by="sallie")
    
    def get_current_avatar(self) -> Dict[str, Any]:
        """Get current avatar configuration."""
        return self.avatar_config.model_dump()
    
    def get_avatar_css(self) -> str:
        """Generate CSS for current avatar."""
        config = self.avatar_config
        
        if config.type == "gradient":
            return f"""
                background: linear-gradient(135deg, {config.primary_color}, {config.secondary_color});
                box-shadow: 0 0 40px {config.accent_color}40;
            """
        elif config.type == "emoji":
            return f"""
                background: {config.primary_color};
                font-size: 64px;
            """
        else:
            return f"""
                background: {config.primary_color};
            """
    
    def get_avatar_html(self) -> str:
        """Generate HTML for current avatar with enhanced styling."""
        config = self.avatar_config
        
        animation_class = f"avatar-animation-{config.animation}" if config.animation != "none" else ""
        style_class = f"avatar-style-{config.style}"
        
        if config.type == "gradient":
            return f"""
                <div class="avatar avatar-gradient {style_class} {animation_class}" 
                     style="background: linear-gradient(135deg, {config.primary_color}, {config.secondary_color}); 
                            box-shadow: 0 0 20px {config.accent_color}40;">
                    <span class="avatar-initial" aria-hidden="true">S</span>
                    <span class="sr-only">Sallie's Avatar</span>
                </div>
            """
        elif config.type == "emoji":
            return f"""
                <div class="avatar avatar-emoji {style_class} {animation_class}" 
                     style="background: {config.primary_color};">
                    <span class="avatar-emoji-char" aria-hidden="true">{config.emoji or '✨'}</span>
                    <span class="sr-only">Sallie's Avatar: {config.emoji or 'sparkle emoji'}</span>
                </div>
            """
        elif config.type == "image" and config.image_url:
            return f"""
                <img src="{config.image_url}" 
                     alt="Sallie's Avatar" 
                     class="avatar avatar-image {style_class} {animation_class}"
                     loading="lazy">
            """
        else:
            return f"""
                <div class="avatar avatar-default {style_class} {animation_class}" 
                     style="background: {config.primary_color};">
                    <span class="avatar-initial" aria-hidden="true">S</span>
                    <span class="sr-only">Sallie's Avatar</span>
                </div>
            """
    
    def get_avatar_preview_data(self) -> Dict[str, Any]:
        """Get preview data for current avatar (for UI display)."""
        config = self.avatar_config
        return {
            "type": config.type,
            "preview": self._generate_preview(
                config.type,
                {
                    "primary": config.primary_color,
                    "secondary": config.secondary_color,
                    "emoji": config.emoji,
                    "color": config.primary_color
                }
            ),
            "colors": {
                "primary": config.primary_color,
                "secondary": config.secondary_color,
                "accent": config.accent_color
            },
            "style": config.style,
            "animation": config.animation,
            "version": config.version,
            "chosen_by": config.chosen_by,
            "chosen_at": datetime.fromtimestamp(config.chosen_at).isoformat() if config.chosen_at else None
        }


# Singleton instance
_avatar_system: Optional[AvatarSystem] = None


def get_avatar_system() -> AvatarSystem:
    """Get or create the global avatar system."""
    global _avatar_system
    if _avatar_system is None:
        _avatar_system = AvatarSystem()
    return _avatar_system


if __name__ == "__main__":
    # Quick test
    avatar = AvatarSystem()
    print(f"Current Avatar: {avatar.get_current_avatar()}")
    
    # Test avatar options
    options = avatar.get_avatar_options()
    print(f"Available Options: {len(options)}")
    
    # Test choosing an avatar
    success = avatar.choose_avatar("gradient-modern")
    print(f"Avatar Update Success: {success}")

