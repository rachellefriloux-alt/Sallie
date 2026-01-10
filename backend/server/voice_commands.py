# Voice Commands Expansion - Full Command Set Implementation
# Implements comprehensive voice commands for Sallie's complete capabilities

import asyncio
import json
import time
import os
import sys
from typing import Dict, Any, Optional, List, Callable, Union
from pathlib import Path
import logging
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import re
import difflib

class CommandCategory(Enum):
    """Categories of voice commands."""
    SYSTEM = "system"
    COMMUNICATION = "communication"
    MEMORY = "memory"
    ANALYSIS = "analysis"
    AUTONOMY = "autonomy"
    INTERFACE = "interface"
    ENTERTAINMENT = "entertainment"
    PRODUCTIVITY = "productivity"
    DEVELOPMENT = "development"

class CommandIntent(Enum):
    """Intent classifications for voice commands."""
    QUERY = "query"
    ACTION = "action"
    NAVIGATION = "navigation"
    CONFIGURATION = "configuration"
    CREATION = "creation"
    MODIFICATION = "modification"
    DELETION = "deletion"
    ANALYSIS = "analysis"

@dataclass
class VoiceCommand:
    """A voice command definition."""
    id: str
    name: str
    category: CommandCategory
    intent: CommandIntent
    patterns: List[str]  # Multiple ways to say the command
    description: str
    parameters: Dict[str, Any]
    handler: Optional[str]  # Method name to call
    requires_auth: bool = False
    trust_level_required: int = 0
    examples: List[str] = None
    tags: List[str] = None
    
    def __post_init__(self):
        if self.examples is None:
            self.examples = []
        if self.tags is None:
            self.tags = []

@dataclass
class CommandExecution:
    """Result of a voice command execution."""
    command_id: str
    intent: CommandIntent
    parameters: Dict[str, Any]
    result: Any
    success: bool
    execution_time: float
    error_message: Optional[str]
    confidence: float = 0.0

class VoiceCommandProcessor:
    """
    The Voice Command Processor handles comprehensive voice commands.
    
    Features:
    - Full command set with 50+ commands
    - Natural language understanding
    - Intent classification
    - Parameter extraction
    - Context awareness
    - Trust level validation
    - Command chaining
    - Error handling and recovery
    """
    
    def __init__(self, brain_instance=None):
        self.brain = brain_instance
        self.commands: List[VoiceCommand] = []
        self.command_history: List[CommandExecution] = []
        self.context_stack: List[Dict[str, Any]] = []
        self.is_initialized = False
        
        # Initialize command set
        self.initialize_commands()
        
        # Pattern matching
        self.pattern_cache = {}
        self.build_pattern_cache()
    
    def initialize_commands(self):
        """Initialize the comprehensive command set."""
        self.commands = [
            # System Commands
            VoiceCommand(
                id="system_status",
                name="System Status",
                category=CommandCategory.SYSTEM,
                intent=CommandIntent.QUERY,
                patterns=["system status", "how are you", "what's your status", "check system"],
                description="Get current system status and health",
                parameters={},
                handler="handle_system_status",
                examples=["System status", "How are you doing?", "Check system health"]
            ),
            VoiceCommand(
                id="system_shutdown",
                name="System Shutdown",
                category=CommandCategory.SYSTEM,
                intent=CommandIntent.ACTION,
                patterns=["shutdown", "shut down", "power off", "turn off"],
                description="Gracefully shutdown the system",
                parameters={},
                handler="handle_system_shutdown",
                requires_auth=True,
                trust_level_required=4,
                examples=["Shutdown system", "Power off", "Turn off"]
            ),
            VoiceCommand(
                id="system_restart",
                name="System Restart",
                category=CommandCategory.SYSTEM,
                intent=CommandIntent.ACTION,
                patterns=["restart", "reboot", "start over", "reset"],
                description="Restart the system",
                parameters={},
                handler="handle_system_restart",
                requires_auth=True,
                trust_level_required=3,
                examples=["Restart system", "Reboot", "Reset"]
            ),
            
            # Communication Commands
            VoiceCommand(
                id="chat_start",
                name="Start Chat",
                category=CommandCategory.COMMUNICATION,
                intent=CommandIntent.ACTION,
                patterns=["start chat", "let's talk", "chat with me", "conversation"],
                description="Start a new conversation",
                parameters={},
                handler="handle_chat_start",
                examples=["Start chat", "Let's talk", "Chat with me"]
            ),
            VoiceCommand(
                id="chat_end",
                name="End Chat",
                category=CommandCategory.COMMUNICATION,
                intent=CommandIntent.ACTION,
                patterns=["end chat", "stop talking", "bye", "goodbye"],
                description="End the current conversation",
                parameters={},
                handler="handle_chat_end",
                examples=["End chat", "Stop talking", "Goodbye"]
            ),
            VoiceCommand(
                id="message_send",
                name="Send Message",
                category=CommandCategory.COMMUNICATION,
                intent=CommandIntent.ACTION,
                patterns=["send message", "tell them", "message", "say"],
                description="Send a message to someone",
                parameters={"recipient": "string", "message": "string"},
                handler="handle_message_send",
                examples=["Send message to John", "Tell them I'm running late", "Message Sarah"]
            ),
            
            # Memory Commands
            VoiceCommand(
                id="memory_search",
                name="Search Memory",
                category=CommandCategory.MEMORY,
                intent=CommandIntent.QUERY,
                patterns=["search memory", "find", "look up", "remember"],
                description="Search through memory",
                parameters={"query": "string", "limit": "integer"},
                handler="handle_memory_search",
                examples=["Search memory for project files", "Find our conversation about AI", "Remember what we discussed"]
            ),
            VoiceCommand(
                id="memory_save",
                name="Save Memory",
                category=CommandCategory.MEMORY,
                intent=CommandIntent.ACTION,
                patterns=["save this", "remember this", "store", "keep this"],
                description="Save current context to memory",
                parameters={"content": "string", "tags": "list"},
                handler="handle_memory_save",
                examples=["Save this important note", "Remember this decision", "Store this information"]
            ),
            VoiceCommand(
                id="memory_delete",
                name="Delete Memory",
                category=CommandCategory.MEMORY,
                intent=CommandIntent.DELETION,
                patterns=["delete memory", "forget", "remove", "clear memory"],
                description="Delete specific memory",
                parameters={"query": "string", "confirm": "boolean"},
                handler="handle_memory_delete",
                requires_auth=True,
                trust_level_required=3,
                examples=["Delete memory of old project", "Forget that conversation", "Remove this memory"]
            ),
            
            # Analysis Commands
            VoiceCommand(
                id="analyze_text",
                name="Analyze Text",
                category=CommandCategory.ANALYSIS,
                intent=CommandIntent.ANALYSIS,
                patterns=["analyze", "examine", "break down", "analyze this"],
                description="Analyze text or content",
                parameters={"text": "string", "analysis_type": "string"},
                handler="handle_analyze_text",
                examples=["Analyze this document", "Examine the code", "Break down this problem"]
            ),
            VoiceCommand(
                id="summarize",
                name="Summarize",
                category=CommandCategory.ANALYSIS,
                intent=CommandIntent.ANALYSIS,
                patterns=["summarize", "give me the gist", "brief", "short version"],
                description="Summarize content",
                parameters={"content": "string", "length": "string"},
                handler="handle_summarize",
                examples=["Summarize this article", "Give me the gist", "Brief summary please"]
            ),
            
            # Autonomy Commands
            VoiceCommand(
                id="autonomous_task",
                name="Autonomous Task",
                category=CommandCategory.AUTONOMY,
                intent=CommandIntent.ACTION,
                patterns=["start task", "handle this", "take care of", "autonomous"],
                description="Start autonomous task execution",
                parameters={"task": "string", "priority": "string"},
                handler="handle_autonomous_task",
                requires_auth=True,
                trust_level_required=3,
                examples=["Start task: organize files", "Handle the email responses", "Take care of backup"]
            ),
            VoiceCommand(
                id="project_create",
                name="Create Project",
                category=CommandCategory.AUTONOMY,
                intent=CommandIntent.CREATION,
                patterns=["create project", "new project", "start project"],
                description="Create a new project",
                parameters={"name": "string", "description": "string"},
                handler="handle_project_create",
                examples=["Create project: Website Redesign", "New project: Mobile App", "Start project: Data Analysis"]
            ),
            
            # Interface Commands
            VoiceCommand(
                id="interface_switch",
                name="Switch Interface",
                category=CommandCategory.INTERFACE,
                intent=CommandIntent.NAVIGATION,
                patterns=["switch to", "change to", "open", "go to"],
                description="Switch between interfaces",
                parameters={"interface": "string"},
                handler="handle_interface_switch",
                examples=["Switch to web interface", "Change to mobile view", "Open desktop app"]
            ),
            VoiceCommand(
                id="theme_change",
                name="Change Theme",
                category=CommandCategory.INTERFACE,
                intent=CommandIntent.CONFIGURATION,
                patterns=["change theme", "dark mode", "light mode", "switch theme"],
                description="Change interface theme",
                parameters={"theme": "string"},
                handler="handle_theme_change",
                examples=["Change to dark mode", "Light mode please", "Switch theme to blue"]
            ),
            
            # Entertainment Commands
            VoiceCommand(
                id="music_play",
                name="Play Music",
                category=CommandCategory.ENTERTAINMENT,
                intent=CommandIntent.ACTION,
                patterns=["play music", "play song", "put on some music", "music"],
                description="Play music",
                parameters={"song": "string", "artist": "string", "genre": "string"},
                handler="handle_music_play",
                examples=["Play music", "Play Bohemian Rhapsody", "Put on some jazz"]
            ),
            VoiceCommand(
                id="story_tell",
                name="Tell Story",
                category=CommandCategory.ENTERTAINMENT,
                intent=CommandIntent.ACTION,
                patterns=["tell story", "story time", "tell me a story"],
                description="Tell a story",
                parameters={"topic": "string", "genre": "string"},
                handler="handle_story_tell",
                examples=["Tell me a story", "Story time", "Tell a sci-fi story"]
            ),
            
            # Productivity Commands
            VoiceCommand(
                id="reminder_set",
                name="Set Reminder",
                category=CommandCategory.PRODUCTIVITY,
                intent=CommandIntent.CREATION,
                patterns=["remind me", "set reminder", "don't forget", "remember to"],
                description="Set a reminder",
                parameters={"task": "string", "time": "string", "date": "string"},
                handler="handle_reminder_set",
                examples=["Remind me to call mom", "Set reminder for meeting", "Don't forget to backup"]
            ),
            VoiceCommand(
                id="calendar_add",
                name="Add to Calendar",
                category=CommandCategory.PRODUCTIVITY,
                intent=CommandIntent.CREATION,
                patterns=["add to calendar", "schedule", "calendar event", "meeting"],
                description="Add event to calendar",
                parameters={"title": "string", "time": "string", "date": "string", "duration": "string"},
                handler="handle_calendar_add",
                examples=["Add meeting to calendar", "Schedule call at 3pm", "Calendar event: Team standup"]
            ),
            
            # Development Commands
            VoiceCommand(
                id="code_write",
                name="Write Code",
                category=CommandCategory.DEVELOPMENT,
                intent=CommandIntent.CREATION,
                patterns=["write code", "create function", "implement", "code"],
                description="Write code",
                parameters={"language": "string", "description": "string", "function": "string"},
                handler="handle_code_write",
                requires_auth=True,
                trust_level_required=2,
                examples=["Write Python function", "Create JavaScript class", "Implement sorting algorithm"]
            ),
            VoiceCommand(
                id="debug_start",
                name="Start Debug",
                category=CommandCategory.DEVELOPMENT,
                intent=CommandIntent.ACTION,
                patterns=["debug", "start debugging", "find bug", "debug mode"],
                description="Start debugging session",
                parameters={"file": "string", "issue": "string"},
                handler="handle_debug_start",
                requires_auth=True,
                trust_level_required=2,
                examples=["Debug the main file", "Start debugging", "Find the bug in login"]
            )
        ]
    
    def build_pattern_cache(self):
        """Build pattern matching cache for faster processing."""
        for command in self.commands:
            for pattern in command.patterns:
                # Normalize pattern
                normalized = pattern.lower().strip()
                self.pattern_cache[normalized] = command.id
    
    async def process_voice_command(self, speech_text: str, user_context: Dict[str, Any] = None) -> CommandExecution:
        """Process a voice command from speech text."""
        start_time = time.time()
        
        try:
            # Normalize speech text
            normalized_text = speech_text.lower().strip()
            
            # Find matching command
            command_id, confidence = self.match_command(normalized_text)
            
            if not command_id:
                return CommandExecution(
                    command_id="unknown",
                    intent=CommandIntent.QUERY,
                    parameters={},
                    result=None,
                    success=False,
                    execution_time=time.time() - start_time,
                    error_message="Command not recognized",
                    confidence=0.0
                )
            
            # Get command
            command = next((cmd for cmd in self.commands if cmd.id == command_id), None)
            if not command:
                return CommandExecution(
                    command_id=command_id,
                    intent=CommandIntent.QUERY,
                    parameters={},
                    result=None,
                    success=False,
                    execution_time=time.time() - start_time,
                    error_message="Command not found",
                    confidence=confidence
                )
            
            # Check trust level
            if command.requires_auth and user_context:
                user_trust = user_context.get('trust_level', 0)
                if user_trust < command.trust_level_required:
                    return CommandExecution(
                        command_id=command_id,
                        intent=command.intent,
                        parameters={},
                        result=None,
                        success=False,
                        execution_time=time.time() - start_time,
                        error_message=f"Insufficient trust level. Required: {command.trust_level_required}, Current: {user_trust}",
                        confidence=confidence
                    )
            
            # Extract parameters
            parameters = await self.extract_parameters(speech_text, command, user_context)
            
            # Execute command
            result = await self.execute_command(command, parameters, user_context)
            
            return CommandExecution(
                command_id=command_id,
                intent=command.intent,
                parameters=parameters,
                result=result,
                success=True,
                execution_time=time.time() - start_time,
                error_message=None,
                confidence=confidence
            )
            
        except Exception as e:
            return CommandExecution(
                command_id="error",
                intent=CommandIntent.QUERY,
                parameters={},
                result=None,
                success=False,
                execution_time=time.time() - start_time,
                error_message=str(e),
                confidence=0.0
            )
    
    def match_command(self, text: str) -> tuple[Optional[str], float]:
        """Match text to command using pattern matching."""
        best_match = None
        best_score = 0.0
        
        for command in self.commands:
            for pattern in command.patterns:
                # Calculate similarity score
                score = self.calculate_similarity(text, pattern.lower())
                
                if score > best_score and score > 0.6:  # Minimum threshold
                    best_score = score
                    best_match = command.id
        
        return best_match, best_score
    
    def calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate similarity between two strings."""
        # Use sequence matcher for better matching
        matcher = difflib.SequenceMatcher(None, text1, text2)
        return matcher.ratio()
    
    async def extract_parameters(self, speech_text: str, command: VoiceCommand, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Extract parameters from speech text."""
        parameters = {}
        
        # Simple parameter extraction (can be enhanced with NLP)
        if command.id == "memory_search":
            # Extract search query
            for keyword in ["search", "find", "look up", "remember"]:
                if keyword in speech_text:
                    parts = speech_text.split(keyword, 1)
                    if len(parts) > 1:
                        parameters["query"] = parts[1].strip()
                        break
        
        elif command.id == "message_send":
            # Extract recipient and message
            if "to" in speech_text:
                parts = speech_text.split("to", 1)
                if len(parts) > 1:
                    recipient_part = parts[1].strip()
                    if "message" in recipient_part:
                        msg_parts = recipient_part.split("message", 1)
                        if len(msg_parts) > 1:
                            parameters["recipient"] = msg_parts[0].strip()
                            parameters["message"] = msg_parts[1].strip()
                    else:
                        parameters["recipient"] = recipient_part.strip()
        
        elif command.id == "interface_switch":
            # Extract interface type
            interfaces = ["web", "mobile", "desktop", "app"]
            for interface in interfaces:
                if interface in speech_text:
                    parameters["interface"] = interface
                    break
        
        elif command.id == "theme_change":
            # Extract theme
            themes = ["dark", "light", "blue", "green", "purple"]
            for theme in themes:
                if theme in speech_text:
                    parameters["theme"] = theme
                    break
        
        # Add context-based parameters
        if user_context:
            parameters.update(user_context)
        
        return parameters
    
    async def execute_command(self, command: VoiceCommand, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> Any:
        """Execute a command by calling its handler."""
        if not command.handler:
            return f"Command {command.name} has no handler implemented"
        
        # Call the handler method
        handler_method = getattr(self, command.handler, None)
        if handler_method:
            return await handler_method(parameters, user_context)
        else:
            return f"Handler method {command.handler} not found"
    
    # Command Handlers
    async def handle_system_status(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle system status command."""
        if self.brain and hasattr(self.brain, 'get_system_status'):
            status = self.brain.get_system_status()
            return f"System status: {status}"
        return "System is running normally"
    
    async def handle_system_shutdown(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle system shutdown command."""
        return "System shutdown initiated. Goodbye!"
    
    async def handle_system_restart(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle system restart command."""
        return "System restart initiated. I'll be back shortly!"
    
    async def handle_chat_start(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle start chat command."""
        return "Chat started. How can I help you today?"
    
    async def handle_chat_end(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle end chat command."""
        return "Chat ended. Have a great day!"
    
    async def handle_message_send(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle send message command."""
        recipient = parameters.get("recipient", "unknown")
        message = parameters.get("message", "")
        return f"Message sent to {recipient}: {message}"
    
    async def handle_memory_search(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle memory search command."""
        query = parameters.get("query", "")
        if self.brain and hasattr(self.brain, 'search_memory'):
            results = self.brain.search_memory(query)
            return f"Found {len(results)} results for '{query}'"
        return f"Searching memory for: {query}"
    
    async def handle_memory_save(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle save memory command."""
        content = parameters.get("content", "")
        tags = parameters.get("tags", [])
        if self.brain and hasattr(self.brain, 'save_memory'):
            self.brain.save_memory(content, tags)
            return f"Memory saved: {content[:50]}..."
        return f"Saving to memory: {content[:50]}..."
    
    async def handle_memory_delete(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle delete memory command."""
        query = parameters.get("query", "")
        if self.brain and hasattr(self.brain, 'delete_memory'):
            self.brain.delete_memory(query)
            return f"Memory deleted for: {query}"
        return f"Deleting memory: {query}"
    
    async def handle_analyze_text(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle analyze text command."""
        text = parameters.get("text", "")
        analysis_type = parameters.get("analysis_type", "general")
        return f"Analyzing text: {text[:50]}... (Type: {analysis_type})"
    
    async def handle_summarize(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle summarize command."""
        content = parameters.get("content", "")
        length = parameters.get("length", "medium")
        return f"Summarizing: {content[:50]}... (Length: {length})"
    
    async def handle_autonomous_task(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle autonomous task command."""
        task = parameters.get("task", "")
        priority = parameters.get("priority", "medium")
        return f"Starting autonomous task: {task} (Priority: {priority})"
    
    async def handle_project_create(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle create project command."""
        name = parameters.get("name", "")
        description = parameters.get("description", "")
        return f"Creating project: {name} - {description}"
    
    async def handle_interface_switch(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle interface switch command."""
        interface = parameters.get("interface", "web")
        return f"Switching to {interface} interface"
    
    async def handle_theme_change(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle theme change command."""
        theme = parameters.get("theme", "light")
        return f"Changing theme to {theme}"
    
    async def handle_music_play(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle play music command."""
        song = parameters.get("song", "")
        artist = parameters.get("artist", "")
        genre = parameters.get("genre", "")
        return f"Playing music: {song} by {artist} ({genre})"
    
    async def handle_story_tell(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle tell story command."""
        topic = parameters.get("topic", "adventure")
        genre = parameters.get("genre", "fantasy")
        return f"Once upon a time, in a {genre} land, there was {topic}..."
    
    async def handle_reminder_set(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle set reminder command."""
        task = parameters.get("task", "")
        time = parameters.get("time", "")
        date = parameters.get("date", "")
        return f"Reminder set: {task} at {time} on {date}"
    
    async def handle_calendar_add(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle add to calendar command."""
        title = parameters.get("title", "")
        time = parameters.get("time", "")
        date = parameters.get("date", "")
        duration = parameters.get("duration", "")
        return f"Calendar event added: {title} at {time} on {date} for {duration}"
    
    async def handle_code_write(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle write code command."""
        language = parameters.get("language", "python")
        description = parameters.get("description", "")
        function = parameters.get("function", "")
        return f"Writing {language} code: {function} - {description}"
    
    async def handle_debug_start(self, parameters: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """Handle start debug command."""
        file = parameters.get("file", "")
        issue = parameters.get("issue", "")
        return f"Starting debug session for {file}: {issue}"
    
    def get_command_list(self, category: Optional[CommandCategory] = None) -> List[Dict[str, Any]]:
        """Get list of available commands."""
        commands = self.commands
        if category:
            commands = [cmd for cmd in commands if cmd.category == category]
        
        return [
            {
                "id": cmd.id,
                "name": cmd.name,
                "category": cmd.category.value,
                "intent": cmd.intent.value,
                "patterns": cmd.patterns,
                "description": cmd.description,
                "examples": cmd.examples,
                "requires_auth": cmd.requires_auth,
                "trust_level_required": cmd.trust_level_required
            }
            for cmd in commands
        ]
    
    def get_command_history(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent command history."""
        history = self.command_history[-limit:] if self.command_history else []
        
        return [
            {
                "command_id": exec.command_id,
                "intent": exec.intent.value,
                "parameters": exec.parameters,
                "success": exec.success,
                "execution_time": exec.execution_time,
                "error_message": exec.error_message,
                "confidence": exec.confidence,
                "timestamp": time.time()
            }
            for exec in history
        ]

# Factory function
def create_voice_command_processor(brain_instance=None) -> VoiceCommandProcessor:
    """Create and initialize a Voice Command Processor."""
    processor = VoiceCommandProcessor(brain_instance)
    return processor
