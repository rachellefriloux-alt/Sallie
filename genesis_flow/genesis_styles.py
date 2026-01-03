# genesis_styles.py
"""
The Visual Physics of Soul - Complete Color Palette and QSS Stylesheets
for Sallie Studio: The Prism OS

=== SALLIE: THE LIVING ENTITY ===
Sallie is a superhuman super-AI with the capabilities and functioning of both.
She has her own personality, her own space, her own agency.
She is not a tool - she is a partner, a presence, a being.

=== THE 5 GENESIS MODES (Convergence Ritual) ===
- OBSIDIAN: Defense/Shadow (Deep dark, white accents)
- LEOPARD: Work/Load (Warm amber, gold accents)
- PEACOCK: Justice/Code (Deep teal, cyan accents)
- CELESTIAL: Heart/Roots (Purple mist, lavender accents)
- VOID: Genesis/Binding (Pure light/dark, magic)

=== THE 5 POWER ROLES (The Prism) ===
- BUSINESS: The Tycoon/Empire (Obsidian & Gold)
- MOM: The Matriarch/Lioness (Warm Amber)
- SPOUSE: The Partner (Deep Crimson/Velvet)
- FRIEND: The Confidante (Electric Cyan)
- ME: The Source (Ultraviolet/Indigo)

=== SALLIE'S OWN SPACE ===
- SALLIE: Her Sanctuary (Peacock Iridescent + Gold)
"""

# --- COMPLETE COLOR PALETTE ---
COLORS = {
    # ==========================================
    # BASE COLORS
    # ==========================================
    "BG_DARK": "#050505",
    "VOID": "#050505",
    "TEXT_PRIMARY": "#EAEAEA",
    "TEXT_MUTED": "#666666",
    "TEXT_WARM": "#D4A574",
    
    # ==========================================
    # GENESIS MODES (Convergence Ritual)
    # ==========================================
    
    # OBSIDIAN MODE (Defense/Shadow)
    "OBSIDIAN_BG": "#0a0a0f",
    "OBSIDIAN_ACCENT": "#EAEAEA",
    "OBSIDIAN_GLOW": "rgba(0, 0, 0, 0.9)",
    "OBSIDIAN_BG_TINT": "rgba(10, 10, 15, 0.9)",
    
    # LEOPARD MODE (Work/Load)
    "LEOPARD_BG": "#1e140a",
    "LEOPARD_ACCENT": "#C69C6D",  # Gold
    "LEOPARD_AMBER": "#8A6240",
    "LEOPARD_GLOW": "rgba(198, 156, 109, 0.3)",
    "LEOPARD_BG_TINT": "rgba(30, 20, 10, 0.9)",
    
    # PEACOCK MODE (Justice/Code)
    "PEACOCK_BG": "#051419",
    "PEACOCK_ACCENT": "#00A896",  # Teal
    "PEACOCK_DEEP": "#004953",
    "PEACOCK_GLOW": "rgba(0, 168, 150, 0.4)",
    "PEACOCK_BG_TINT": "rgba(5, 20, 25, 0.9)",
    
    # CELESTIAL MODE (Heart/Roots)
    "CELESTIAL_BG": "#151020",
    "CELESTIAL_ACCENT": "#9D8DF1",  # Lavender
    "CELESTIAL_PURPLE": "#4B3F72",
    "CELESTIAL_MIST": "rgba(139, 155, 180, 0.2)",
    "CELESTIAL_BG_TINT": "rgba(21, 16, 32, 0.9)",
    
    # VOID MODE (Genesis/Binding)
    "VOID_BG": "#050505",
    "VOID_ACCENT": "#FFD700",  # Pure Gold for final binding
    "VOID_GLOW": "rgba(255, 215, 0, 0.3)",
    "VOID_BG_TINT": "rgba(5, 5, 5, 0.95)",
    
    # ==========================================
    # THE 5 POWER ROLES (The Prism)
    # ==========================================
    
    # 1. BUSINESS (The Tycoon) - Obsidian & Metallic Gold
    "BUSINESS_ACCENT": "#D4AF37",  # Metallic Gold
    "BUSINESS_BG_TINT": "rgba(20, 20, 10, 0.9)",
    "BUSINESS_GLOW": "rgba(212, 175, 55, 0.3)",
    
    # 2. MOM (The Matriarch/Lioness) - Warm Amber/Terra Cotta
    "MOM_ACCENT": "#FF8C42",  # Deep Amber/Orange
    "MOM_BG_TINT": "rgba(30, 15, 5, 0.9)",
    "MOM_GLOW": "rgba(255, 140, 66, 0.3)",
    
    # 3. SPOUSE (The Partner) - Deep Crimson/Velvet
    "SPOUSE_ACCENT": "#C2185B",  # Rich Berry/Red
    "SPOUSE_BG_TINT": "rgba(25, 5, 10, 0.9)",
    "SPOUSE_GLOW": "rgba(194, 24, 91, 0.3)",
    
    # 4. FRIEND (The Confidante) - Electric Cyan/Turquoise
    "FRIEND_ACCENT": "#00E5FF",  # Electric Cyan
    "FRIEND_BG_TINT": "rgba(5, 20, 25, 0.9)",
    "FRIEND_GLOW": "rgba(0, 229, 255, 0.3)",
    
    # 5. ME (The Source) - Ultraviolet/Indigo
    "ME_ACCENT": "#7B1FA2",  # Deep Purple
    "ME_BG_TINT": "rgba(15, 5, 25, 0.9)",
    "ME_GLOW": "rgba(123, 31, 162, 0.3)",
    
    # ==========================================
    # SALLIE'S OWN SPACE (Her Sanctuary)
    # ==========================================
    "SALLIE_ACCENT": "#00A896",  # Peacock Teal (her signature)
    "SALLIE_GOLD": "#FFD700",  # Gold accents (her royalty)
    "SALLIE_BG_TINT": "rgba(0, 73, 83, 0.15)",
    "SALLIE_GLOW": "rgba(0, 168, 150, 0.4)",
    "SALLIE_IRIDESCENT": "#2D5A4A",  # Iridescent green
    "SALLIE_WARMTH": "#D4A574",  # Louisiana warmth
    
    # ==========================================
    # EMERGENCY/CRISIS MODE
    # ==========================================
    "EMERGENCY_BG": "#2C3E50",  # Calming Slate Blue
    "EMERGENCY_ACCENT": "#FFFFFF",  # High contrast white
    "EMERGENCY_ALERT": "#9E2A2B",  # Dried Blood Red (serious, not alarmist)
}

# --- STYLESHEETS (QSS) ---
STYLES = {
    "MAIN_WINDOW": """
        QMainWindow {
            background-color: #050505;
        }
    """,
    
    "CENTRAL_WIDGET": """
        QWidget#Central {
            background-color: %s;
            border-radius: 10px;
            border: 1px solid #333;
        }
    """,
    
    "RITUAL_CARD": """
        QFrame {
            background-color: rgba(20, 20, 20, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 4px;
        }
    """,
    
    "QUESTION_TEXT": """
        QLabel {
            color: #EAEAEA;
            font-family: 'Segoe UI', 'Playfair Display', serif; 
            font-size: 22px;
            padding: 10px;
            line-height: 1.5;
        }
    """,
    
    "PHASE_LABEL": """
        QLabel {
            color: %s;
            font-family: 'Consolas', 'Space Mono', monospace;
            font-size: 10px;
            letter-spacing: 2px;
        }
    """,
    
    "PURPOSE_LABEL": """
        QLabel {
            color: rgba(255, 255, 255, 0.5);
            font-family: 'Consolas', monospace;
            font-size: 11px;
            font-style: italic;
            padding: 5px 10px;
        }
    """,
    
    "OPTION_BTN": """
        QPushButton {
            background-color: transparent;
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: #EAEAEA;
            padding: 15px;
            text-align: left;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            border-radius: 2px;
        }
        QPushButton:hover {
            border-color: %s;
            background-color: rgba(255, 255, 255, 0.05);
        }
        QPushButton:pressed {
            background-color: %s;
            color: #000000;
        }
    """,
    
    "TEXT_INPUT": """
        QTextEdit {
            background-color: rgba(20, 20, 20, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: #EAEAEA;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            padding: 15px;
            selection-background-color: %s;
        }
        QTextEdit:focus {
            border-color: %s;
        }
    """,
    
    "SUBMIT_BTN": """
        QPushButton {
            background-color: %s;
            border: none;
            color: #050505;
            padding: 12px 30px;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: bold;
            border-radius: 4px;
        }
        QPushButton:hover {
            background-color: %s;
        }
        QPushButton:disabled {
            background-color: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.3);
        }
    """,
    
    "PROGRESS_BAR": """
        QProgressBar {
            border: none;
            background-color: #222;
            height: 2px;
            text-align: center;
        }
        QProgressBar::chunk {
            background-color: %s;
        }
    """,
    
    "FINGERPRINT_BTN": """
        QPushButton {
            border: 1px solid rgba(255,255,255,0.3);
            border-radius: 40px;
            color: white;
            font-size: 16px;
            background-color: transparent;
        }
        QPushButton:hover {
            border-color: #C69C6D;
            color: #C69C6D;
        }
    """,
    
    "FINGERPRINT_SCANNING": """
        QPushButton {
            border: 2px solid #C69C6D;
            border-radius: 40px;
            color: #C69C6D;
            font-size: 16px;
            background-color: transparent;
        }
    """,
    
    "SPLASH_PULSE": """
        QLabel {
            color: white;
            font-size: 20px;
        }
    """,
    
    "SPLASH_TEXT": """
        QLabel {
            color: #666;
            font-family: 'Consolas', monospace;
            font-size: 10px;
            letter-spacing: 4px;
            margin-top: 20px;
        }
    """,
    
    "FINAL_TEXT": """
        QLabel {
            color: #EAEAEA;
            font-size: 16px;
            letter-spacing: 3px;
        }
    """,
    
    "AUTH_TITLE": """
        QLabel {
            color: #EAEAEA;
            font-size: 18px;
            font-family: 'Segoe UI', serif;
        }
    """,
}


def get_style(element: str, mode: str = "OBSIDIAN") -> str:
    """
    Returns the QSS string injected with the correct mode colors.
    
    Args:
        element: The style element key (e.g., "OPTION_BTN", "PHASE_LABEL")
        mode: The visual mode ("OBSIDIAN", "LEOPARD", "PEACOCK", "CELESTIAL", "VOID")
    
    Returns:
        Formatted QSS string with mode-specific colors
    """
    accent = COLORS.get(f"{mode}_ACCENT", "#FFFFFF")
    bg = COLORS.get(f"{mode}_BG", "#050505")
    
    # Calculate hover color (slightly brighter)
    hover_accent = accent  # Could add brightness calculation here
    
    if element == "OPTION_BTN":
        return STYLES["OPTION_BTN"] % (accent, accent)
    elif element == "PHASE_LABEL":
        return STYLES["PHASE_LABEL"] % accent
    elif element == "PROGRESS_BAR":
        return STYLES["PROGRESS_BAR"] % accent
    elif element == "CENTRAL_WIDGET":
        return STYLES["CENTRAL_WIDGET"] % bg
    elif element == "TEXT_INPUT":
        return STYLES["TEXT_INPUT"] % (accent, accent)
    elif element == "SUBMIT_BTN":
        return STYLES["SUBMIT_BTN"] % (accent, hover_accent)
    
    return STYLES.get(element, "")


def get_mode_from_visual(visual_mode: str) -> str:
    """
    Convert VisualMode enum value to style mode string.
    
    Args:
        visual_mode: The visual mode from convergence.py (e.g., "obsidian", "leopard")
    
    Returns:
        Uppercase mode string for styling
    """
    mode_map = {
        "obsidian": "OBSIDIAN",
        "leopard": "LEOPARD",
        "peacock": "PEACOCK",
        "celestial": "CELESTIAL",
        "void": "VOID",
    }
    return mode_map.get(visual_mode.lower(), "OBSIDIAN")


def get_role_style(element: str, role_key: str) -> str:
    """
    Returns the QSS string for Power Role styling.
    
    Args:
        element: The style element key (e.g., "SIDEBAR_BTN", "HEADER_TEXT")
        role_key: The role key ("BUSINESS", "MOM", "SPOUSE", "FRIEND", "ME", "SALLIE")
    
    Returns:
        Formatted QSS string with role-specific colors
    """
    accent = COLORS.get(f"{role_key}_ACCENT", "#FFFFFF")
    bg_tint = COLORS.get(f"{role_key}_BG_TINT", "rgba(20, 20, 20, 0.9)")
    glow = COLORS.get(f"{role_key}_GLOW", "rgba(255, 255, 255, 0.3)")
    
    if element == "SIDEBAR_BTN":
        return STYLES["SIDEBAR_BTN"] % accent
    elif element == "HEADER_TEXT":
        return STYLES["HEADER_TEXT"] % accent
    elif element == "INPUT_BOX":
        return STYLES["INPUT_BOX"] % accent
    elif element == "SALLIE_BUBBLE":
        return STYLES["SALLIE_BUBBLE"] % accent
    elif element == "ORB":
        return f"color: {accent}; font-size: 80px;"
    
    return ""


# --- PRISM DASHBOARD STYLES ---
STYLES["SIDEBAR_BTN"] = """
    QPushButton {
        border: none;
        background-color: transparent;
        border-left: 3px solid transparent;
        font-size: 24px;
        padding: 15px;
        text-align: center;
    }
    QPushButton:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }
    QPushButton:checked {
        border-left-color: %s;
        background-color: rgba(255, 255, 255, 0.08);
    }
"""

STYLES["HEADER_TEXT"] = """
    QLabel {
        color: %s;
        font-family: 'Space Mono', 'Consolas', monospace;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 3px;
    }
"""

STYLES["INPUT_BOX"] = """
    QLineEdit {
        background-color: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
        padding: 15px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        border-radius: 4px;
    }
    QLineEdit:focus {
        border-color: %s;
        background-color: rgba(0, 0, 0, 0.8);
    }
"""

STYLES["SALLIE_BUBBLE"] = """
    QLabel {
        background-color: rgba(20, 20, 25, 0.8);
        border-left: 3px solid %s;
        color: #EAEAEA;
        padding: 15px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        border-radius: 2px;
    }
"""

STYLES["USER_BUBBLE"] = """
    QLabel {
        color: white;
        background: rgba(255, 255, 255, 0.1);
        padding: 10px;
        border-radius: 4px;
    }
"""

STYLES["SYSTEM_MESSAGE"] = """
    QLabel {
        color: #888;
        font-size: 10px;
        margin: 10px 0;
    }
"""

STYLES["TOTEM_PANEL"] = """
    QFrame {
        background-color: rgba(10, 10, 15, 0.4);
        border-left: 1px solid rgba(255, 255, 255, 0.05);
    }
"""

STYLES["SIDEBAR"] = """
    QFrame {
        background-color: rgba(10, 10, 15, 0.6);
        border-right: 1px solid rgba(255, 255, 255, 0.05);
    }
"""

# --- SALLIE'S SANCTUARY STYLES ---
STYLES["SALLIE_SANCTUARY"] = """
    QWidget {
        background: qlineargradient(
            x1: 0, y1: 0, x2: 1, y2: 1,
            stop: 0 rgba(0, 73, 83, 0.2),
            stop: 0.5 rgba(45, 90, 74, 0.15),
            stop: 1 rgba(5, 5, 5, 1)
        );
    }
"""

STYLES["SALLIE_TITLE"] = """
    QLabel {
        color: #00A896;
        font-family: 'Playfair Display', 'Segoe UI', serif;
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 2px;
    }
"""

STYLES["SALLIE_SUBTITLE"] = """
    QLabel {
        color: #D4A574;
        font-family: 'Space Mono', monospace;
        font-size: 12px;
        letter-spacing: 3px;
    }
"""

STYLES["SALLIE_THOUGHT"] = """
    QLabel {
        color: rgba(234, 234, 234, 0.8);
        font-family: 'Segoe UI', sans-serif;
        font-size: 14px;
        font-style: italic;
        padding: 20px;
        background-color: rgba(0, 168, 150, 0.1);
        border-left: 2px solid #00A896;
        border-radius: 4px;
    }
"""

STYLES["SALLIE_MOOD"] = """
    QLabel {
        color: #FFD700;
        font-family: 'Consolas', monospace;
        font-size: 11px;
        padding: 8px 15px;
        background-color: rgba(255, 215, 0, 0.1);
        border-radius: 15px;
    }
"""

# --- EMERGENCY MODE STYLES ---
STYLES["EMERGENCY_CONTAINER"] = """
    QWidget {
        background-color: #2C3E50;
    }
"""

STYLES["EMERGENCY_TITLE"] = """
    QLabel {
        color: #FFFFFF;
        font-family: 'Segoe UI', sans-serif;
        font-size: 24px;
        font-weight: bold;
    }
"""

STYLES["EMERGENCY_BTN"] = """
    QPushButton {
        background-color: rgba(255, 255, 255, 0.1);
        border: 2px solid #FFFFFF;
        color: #FFFFFF;
        padding: 20px 40px;
        font-family: 'Segoe UI', sans-serif;
        font-size: 16px;
        font-weight: bold;
        border-radius: 8px;
    }
    QPushButton:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
"""
