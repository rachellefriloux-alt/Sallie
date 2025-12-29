"""Smart home integration for Sallie.

Provides integrations for:
- Home Assistant (hub)
- Alexa
- Google Home
- Apple HomeKit
- Microsoft Copilot
"""

from .home_assistant import HomeAssistantHub
from .platforms import AlexaIntegration, GoogleHomeIntegration, AppleHomeKitIntegration, MicrosoftCopilotIntegration
from .smart_home_api import SmartHomeAPI

__all__ = [
    "HomeAssistantHub",
    "AlexaIntegration",
    "GoogleHomeIntegration",
    "AppleHomeKitIntegration",
    "MicrosoftCopilotIntegration",
    "SmartHomeAPI",
]

