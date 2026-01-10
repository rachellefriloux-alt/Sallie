# Voice Commands Integration for Sallie Server
# Adds comprehensive voice command processing and endpoints

import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from voice_commands import VoiceCommandProcessor, CommandCategory, CommandIntent

class VoiceCommandsManager:
    """Manages the Voice Commands System integration with the main server."""
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.voice_processor: Optional[VoiceCommandProcessor] = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialize the Voice Commands System."""
        try:
            self.voice_processor = VoiceCommandProcessor(self.brain)
            self.is_initialized = True
            logging.info("Voice Commands System initialized successfully")
            
        except Exception as e:
            logging.error(f"Failed to initialize Voice Commands System: {e}")
            raise
    
    async def process_voice_command(self, speech_text: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a voice command from speech text."""
        if not self.voice_processor or not self.is_initialized:
            return {"error": "Voice Commands System not initialized"}
        
        try:
            execution = await self.voice_processor.process_voice_command(speech_text, user_context)
            
            return {
                "command_id": execution.command_id,
                "intent": execution.intent.value,
                "parameters": execution.parameters,
                "result": execution.result,
                "success": execution.success,
                "execution_time": execution.execution_time,
                "error_message": execution.error_message,
                "confidence": execution.confidence,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logging.error(f"Failed to process voice command: {e}")
            return {"error": str(e)}
    
    def get_available_commands(self, category: Optional[str] = None) -> Dict[str, Any]:
        """Get list of available voice commands."""
        if not self.voice_processor or not self.is_initialized:
            return {"error": "Voice Commands System not initialized"}
        
        try:
            if category:
                try:
                    cat = CommandCategory(category)
                    commands = self.voice_processor.get_command_list(cat)
                except ValueError:
                    return {"error": f"Invalid category: {category}"}
            else:
                commands = self.voice_processor.get_command_list()
            
            return {
                "commands": commands,
                "count": len(commands),
                "categories": list(set([cmd["category"] for cmd in commands]))
            }
            
        except Exception as e:
            logging.error(f"Failed to get available commands: {e}")
            return {"error": str(e)}
    
    def get_command_history(self, limit: int = 10) -> Dict[str, Any]:
        """Get recent command execution history."""
        if not self.voice_processor or not self.is_initialized:
            return {"error": "Voice Commands System not initialized"}
        
        try:
            history = self.voice_processor.get_command_history(limit)
            
            return {
                "history": history,
                "count": len(history)
            }
            
        except Exception as e:
            logging.error(f"Failed to get command history: {e}")
            return {"error": str(e)}
    
    def get_command_categories(self) -> Dict[str, Any]:
        """Get all command categories with descriptions."""
        if not self.voice_processor or not self.is_initialized:
            return {"error": "Voice Commands System not initialized"}
        
        try:
            categories = {}
            for category in CommandCategory:
                commands = self.voice_processor.get_command_list(category)
                categories[category.value] = {
                    "name": category.value.title(),
                    "description": self._get_category_description(category),
                    "command_count": len(commands),
                    "commands": [cmd["name"] for cmd in commands]
                }
            
            return {
                "categories": categories,
                "total_categories": len(categories)
            }
            
        except Exception as e:
            logging.error(f"Failed to get command categories: {e}")
            return {"error": str(e)}
    
    def _get_category_description(self, category: CommandCategory) -> str:
        """Get description for a command category."""
        descriptions = {
            CommandCategory.SYSTEM: "System control and status commands",
            CommandCategory.COMMUNICATION: "Chat, messaging, and communication commands",
            CommandCategory.MEMORY: "Memory search, save, and management commands",
            CommandCategory.ANALYSIS: "Text analysis, summarization, and insight commands",
            CommandCategory.AUTONOMY: "Autonomous task and project management commands",
            CommandCategory.INTERFACE: "UI navigation and configuration commands",
            CommandCategory.ENTERTAINMENT: "Music, stories, and entertainment commands",
            CommandCategory.PRODUCTIVITY: "Reminders, calendar, and productivity commands",
            CommandCategory.DEVELOPMENT: "Code writing, debugging, and development commands"
        }
        return descriptions.get(category, "Commands for " + category.value)
    
    async def get_command_suggestions(self, partial_text: str, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get command suggestions based on partial text."""
        if not self.voice_processor or not self.is_initialized:
            return {"error": "Voice Commands System not initialized"}
        
        try:
            # Get all commands
            all_commands = self.voice_processor.get_command_list()
            
            # Find matching commands
            suggestions = []
            partial_lower = partial_text.lower()
            
            for command in all_commands:
                # Check if any pattern matches partial text
                for pattern in command["patterns"]:
                    if partial_lower in pattern or pattern in partial_lower:
                        suggestions.append({
                            "command_id": command["id"],
                            "name": command["name"],
                            "category": command["category"],
                            "description": command["description"],
                            "pattern": pattern,
                            "examples": command["examples"],
                            "requires_auth": command["requires_auth"],
                            "trust_level_required": command["trust_level_required"]
                        })
                        break
            
            # Sort by relevance (simple heuristic)
            suggestions.sort(key=lambda x: len(x["pattern"]), reverse=True)
            
            return {
                "suggestions": suggestions[:10],  # Limit to 10 suggestions
                "partial_text": partial_text,
                "count": len(suggestions)
            }
            
        except Exception as e:
            logging.error(f"Failed to get command suggestions: {e}")
            return {"error": str(e)}
    
    async def validate_command_permissions(self, command_id: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Validate if user has permissions for a command."""
        if not self.voice_processor or not self.is_initialized:
            return {"error": "Voice Commands System not initialized"}
        
        try:
            # Find the command
            command = next((cmd for cmd in self.voice_processor.commands if cmd.id == command_id), None)
            if not command:
                return {"valid": False, "reason": "Command not found"}
            
            # Check trust level requirement
            user_trust = user_context.get('trust_level', 0)
            if command.requires_auth and user_trust < command.trust_level_required:
                return {
                    "valid": False,
                    "reason": f"Insufficient trust level. Required: {command.trust_level_required}, Current: {user_trust}",
                    "requires_auth": command.requires_auth,
                    "trust_level_required": command.trust_level_required
                }
            
            return {
                "valid": True,
                "requires_auth": command.requires_auth,
                "trust_level_required": command.trust_level_required
            }
            
        except Exception as e:
            logging.error(f"Failed to validate command permissions: {e}")
            return {"error": str(e)}
    
    def get_voice_command_statistics(self) -> Dict[str, Any]:
        """Get voice command usage statistics."""
        if not self.voice_processor or not self.is_initialized:
            return {"error": "Voice Commands System not initialized"}
        
        try:
            history = self.voice_processor.get_command_history(100)  # Last 100 commands
            
            # Calculate statistics
            total_commands = len(history)
            successful_commands = len([cmd for cmd in history if cmd["success"]])
            success_rate = successful_commands / total_commands if total_commands > 0 else 0.0
            
            # Command frequency
            command_frequency = {}
            for cmd in history:
                cmd_id = cmd["command_id"]
                command_frequency[cmd_id] = command_frequency.get(cmd_id, 0) + 1
            
            # Most used commands
            most_used = sorted(command_frequency.items(), key=lambda x: x[1], reverse=True)[:10]
            
            # Category distribution
            category_distribution = {}
            for cmd in history:
                command_id = cmd["command_id"]
                command = next((c for c in self.voice_processor.commands if c.id == command_id), None)
                if command:
                    category = command.category.value
                    category_distribution[category] = category_distribution.get(category, 0) + 1
            
            # Average confidence
            avg_confidence = sum(cmd["confidence"] for cmd in history) / len(history) if history else 0.0
            
            return {
                "total_commands": total_commands,
                "successful_commands": successful_commands,
                "success_rate": success_rate,
                "average_confidence": avg_confidence,
                "most_used_commands": most_used,
                "category_distribution": category_distribution,
                "available_commands": len(self.voice_processor.commands)
            }
            
        except Exception as e:
            logging.error(f"Failed to get voice command statistics: {e}")
            return {"error": str(e)}
    
    async def run(self):
        """Run the Voice Commands System."""
        try:
            # The voice commands system is event-driven
            # It doesn't need a continuous run loop
            while True:
                await asyncio.sleep(60)  # Check every minute
                
                # Could perform periodic maintenance here
                pass
                
        except Exception as e:
            logging.error(f"Voice Commands System runtime error: {e}")
    
    async def shutdown(self):
        """Gracefully shutdown the Voice Commands System."""
        try:
            logging.info("Voice Commands System shutdown complete")
            
        except Exception as e:
            logging.error(f"Failed to shutdown Voice Commands System: {e}")

# Global instance
voice_commands_manager: Optional[VoiceCommandsManager] = None

async def initialize_voice_commands_system(brain_instance=None):
    """Initialize the global Voice Commands Manager."""
    global voice_commands_manager
    try:
        voice_commands_manager = VoiceCommandsManager(brain_instance)
        await voice_commands_manager.initialize()
        return voice_commands_manager
    
    except Exception as e:
        logging.error(f"Failed to initialize Voice Commands System: {e}")
        return None

def get_voice_commands_manager() -> Optional[VoiceCommandsManager]:
    """Get the global Voice Commands Manager."""
    return voice_commands_manager
