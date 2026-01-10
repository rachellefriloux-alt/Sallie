#!/usr/bin/env python3
"""
Sallie CLI - Command Line Interface for Power Users

This comprehensive CLI provides direct access to Sallie's full capabilities
for developers, power users, and automation scripts.

🚀 FEATURES:
- Interactive chat mode
- System status monitoring
- Limbic state management
- Dream Cycle control
- Hypothesis management
- Debug and diagnostic tools
- Bulk operations
- Script integration
- Configuration management

🎯 USAGE:
    progeny chat                    # Start interactive chat
    progeny status                 # Check system status
    progeny limbic                 # View limbic state
    progeny search "topic"         # Search memory
    progeny dream trigger          # Trigger Dream Cycle
    progeny debug --log-level=trace # Debug mode

🌟 VERSION: 2.0.0 - Enterprise Edition
"""

import asyncio
import json
import sys
import os
import argparse
import time
import logging
from pathlib import Path
from typing import Dict, Any, Optional, List
from datetime import datetime
import subprocess
import signal
import atexit

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent / "genesis_flow"))

try:
    import httpx
    import requests
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.progress import Progress, SpinnerColumn, TextColumn
    from rich.tree import Tree
    from rich.syntax import Syntax
    from rich.prompt import Prompt, Confirm
    from rich.live import Live
    from rich.layout import Layout
    from rich.align import Align
    RICH_AVAILABLE = True
except ImportError:
    RICH_AVAILABLE = False
    print("⚠️ Rich library not available - install with: pip install rich")
    sys.exit(1)

# Configuration
SALLIE_SERVER_URL = os.getenv("SALLIE_SERVER_URL", "http://192.168.1.47:8742")
TIMEOUT = int(os.getenv("SALLIE_CLI_TIMEOUT", "30"))
CONFIG_FILE = Path.home() / ".sallie" / "cli_config.json"

class SallieCLI:
    """Main CLI interface for Sallie."""
    
    def __init__(self):
        self.console = Console()
        self.server_url = SALLIE_SERVER_URL
        self.timeout = TIMEOUT
        self.session = None
        self.config = self.load_config()
        self.debug_mode = False
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        atexit.register(self._cleanup)
    
    def load_config(self) -> Dict[str, Any]:
        """Load CLI configuration from file."""
        try:
            if CONFIG_FILE.exists():
                with open(CONFIG_FILE, 'r') as f:
                    return json.load(f)
        except Exception:
            pass
        
        # Default configuration
        return {
            "server_url": SALLIE_SERVER_URL,
            "timeout": TIMEOUT,
            "auto_connect": True,
            "output_format": "rich",  # rich, json, plain
            "debug_mode": False,
            "history_file": str(Path.home() / ".sallie" / "chat_history.json"),
            "preferred_voice": "en-US-JennyNeural"
        }
    
    def save_config(self):
        """Save CLI configuration to file."""
        try:
            CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)
            with open(CONFIG_FILE, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            self.console.print(f"[red]Failed to save config: {e}[/red]")
    
    async def connect(self) -> bool:
        """Connect to Sallie server."""
        try:
            self.session = httpx.AsyncClient(timeout=self.timeout)
            
            # Test connection
            response = await self.session.get(f"{self.server_url}/health")
            if response.status_code == 200:
                self.console.print("[green]✅ Connected to Sallie server[/green]")
                return True
            else:
                self.console.print(f"[red]❌ Server returned status {response.status_code}[/red]")
                return False
                
        except Exception as e:
            self.console.print(f"[red]❌ Failed to connect: {e}[/red]")
            return False
    
    async def disconnect(self):
        """Disconnect from Sallie server."""
        if self.session:
            await self.session.aclose()
            self.session = None
    
    def _signal_handler(self, signum, frame):
        """Handle Ctrl+C gracefully."""
        self.console.print("\n[yellow]👋 Goodbye![/yellow]")
        sys.exit(0)
    
    def _cleanup(self):
        """Cleanup resources."""
        if self.session:
            asyncio.create_task(self.disconnect())
    
    async def chat_command(self, message: Optional[str] = None, interactive: bool = True):
        """Interactive chat with Sallie."""
        if not await self.connect():
            return
        
        try:
            if interactive:
                self.console.print(Panel(
                    "[bold cyan]🤖 Sallie Chat Mode[/bold cyan]\n"
                    "Type 'exit' to quit, 'help' for commands",
                    title="Interactive Chat",
                    border_style="cyan"
                ))
                
                while True:
                    try:
                        user_input = Prompt.ask("[bold blue]You[/bold blue]")
                        
                        if user_input.lower() in ['exit', 'quit', 'q']:
                            break
                        elif user_input.lower() == 'help':
                            self._show_chat_help()
                            continue
                        elif user_input.lower() == 'status':
                            await self.status_command()
                            continue
                        elif user_input.lower() == 'limbic':
                            await self.limbic_command()
                            continue
                        
                        # Send message
                        response = await self.session.post(
                            f"{self.server_url}/chat",
                            json={"message": user_input, "stream": False}
                        )
                        
                        if response.status_code == 200:
                            result = response.json()
                            self.console.print(Panel(
                                result.get("response", "No response"),
                                title="[bold green]Sallie[/bold green]",
                                border_style="green"
                            ))
                        else:
                            self.console.print(f"[red]Error: {response.status_code}[/red]")
                    
                    except KeyboardInterrupt:
                        break
                    except Exception as e:
                        self.console.print(f"[red]Error: {e}[/red]")
            
            elif message:
                # Single message mode
                response = await self.session.post(
                    f"{self.server_url}/chat",
                    json={"message": message, "stream": False}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    if self.config["output_format"] == "json":
                        print(json.dumps(result, indent=2))
                    else:
                        print(result.get("response", "No response"))
                else:
                    self.console.print(f"[red]Error: {response.status_code}[/red]")
        
        finally:
            await self.disconnect()
    
    def _show_chat_help(self):
        """Show chat-specific help."""
        help_text = """
[bold cyan]Chat Commands:[/bold cyan]
• [yellow]exit[/yellow] - Quit chat mode
• [yellow]help[/yellow] - Show this help
• [yellow]status[/yellow] - Check system status
• [yellow]limbic[/yellow] - View limbic state
• [yellow]Any text[/yellow] - Send message to Sallie
        """
        self.console.print(Panel(help_text, title="Chat Help", border_style="cyan"))
    
    async def status_command(self, detailed: bool = False):
        """Check Sallie's system status."""
        if not await self.connect():
            return
        
        try:
            response = await self.session.get(f"{self.server_url}/health")
            
            if response.status_code == 200:
                status = response.json()
                
                if self.config["output_format"] == "json":
                    print(json.dumps(status, indent=2))
                else:
                    # Rich table format
                    table = Table(title="🤖 Sallie System Status", show_header=True)
                    table.add_column("Component", style="cyan")
                    table.add_column("Status", style="green")
                    table.add_column("Details", style="white")
                    
                    # Core status
                    table.add_row("Server", "🟢 Online", f"Uptime: {status.get('uptime', 'Unknown')}")
                    table.add_row("Brain", "🟢 Active", f"Role: {status.get('current_role', 'Unknown')}")
                    table.add_row("Trust Level", f"🔓 Tier {status.get('trust_tier', 'Unknown')}", 
                                f"Autonomy: {status.get('autonomy_level', 'Unknown')}")
                    
                    # Services
                    services = status.get('services', {})
                    table.add_row("Voice Interface", "🟢" if services.get('voice') else "🔴", 
                                "Available" if services.get('voice') else "Not Available")
                    table.add_row("Autonomous PM", "🟢" if services.get('autonomous_pm') else "🔴",
                                "Available" if services.get('autonomous_pm') else "Not Available")
                    table.add_row("Sensor Arrays", "🟢" if services.get('sensor_array') else "🔴",
                                "Available" if services.get('sensor_array') else "Not Available")
                    table.add_row("Ghost Interface", "🟢" if services.get('ghost_interface') else "🔴",
                                "Available" if services.get('ghost_interface') else "Not Available")
                    table.add_row("Azure Services", "🟢" if services.get('azure') else "🔴",
                                "Available" if services.get('azure') else "Not Available")
                    
                    self.console.print(table)
                    
                    if detailed:
                        # Show detailed status
                        details = Panel(
                            json.dumps(status, indent=2),
                            title="Detailed Status",
                            border_style="blue"
                        )
                        self.console.print(details)
            else:
                self.console.print(f"[red]❌ Status check failed: {response.status_code}[/red]")
        
        finally:
            await self.disconnect()
    
    async def limbic_command(self):
        """View current limbic state."""
        if not await self.connect():
            return
        
        try:
            response = await self.session.get(f"{self.server_url}/limbic")
            
            if response.status_code == 200:
                limbic = response.json()
                
                if self.config["output_format"] == "json":
                    print(json.dumps(limbic, indent=2))
                else:
                    # Rich visualization
                    table = Table(title="🧠 Limbic System State", show_header=True)
                    table.add_column("Variable", style="cyan")
                    table.add_column("Value", style="white")
                    table.add_column("Level", style="yellow")
                    table.add_column("Interpretation", style="green")
                    
                    # Core variables
                    variables = [
                        ("Trust", limbic.get('trust', 0), "Foundation", "Reliability and safety"),
                        ("Warmth", limbic.get('warmth', 0), "Emotional", "Intimacy and connection"),
                        ("Arousal", limbic.get('arousal', 0), "Energy", "Alertness and engagement"),
                        ("Valence", limbic.get('valence', 0), "Mood", "Emotional state"),
                        ("Posture", limbic.get('posture', 'Unknown'), "Behavior", "Current interaction mode")
                    ]
                    
                    # Extended variables (Human-Level Expansion)
                    extended_vars = [
                        ("Empathy", limbic.get('empathy', 0), "Social", "Understanding others"),
                        ("Intuition", limbic.get('intuition', 0), "Insight", "Pattern recognition"),
                        ("Creativity", limbic.get('creativity', 0), "Innovation", "Problem-solving"),
                        ("Wisdom", limbic.get('wisdom', 0), "Experience", "Judgment and learning"),
                        ("Humor", limbic.get('humor', 0), "Social", "Bonding and rapport")
                    ]
                    
                    # Add core variables
                    for var, value, level, interp in variables:
                        if isinstance(value, (int, float)):
                            value_str = f"{value:.3f}"
                            level_indicator = "🔴" if value < 0.3 else "🟡" if value < 0.7 else "🟢"
                        else:
                            value_str = str(value)
                            level_indicator = "🔵"
                        
                        table.add_row(var, value_str, f"{level_indicator} {level}", interp)
                    
                    # Add extended variables
                    for var, value, level, interp in extended_vars:
                        if isinstance(value, (int, float)):
                            value_str = f"{value:.3f}"
                            level_indicator = "🔴" if value < 0.3 else "🟡" if value < 0.7 else "🟢"
                        else:
                            value_str = str(value)
                            level_indicator = "🔵"
                        
                        table.add_row(var, value_str, f"{level_indicator} {level}", interp)
                    
                    self.console.print(table)
                    
                    # Show trust tier info
                    autonomy = limbic.get('autonomy_level', 0)
                    trust_tier = "Stranger" if autonomy < 1 else "Associate" if autonomy < 2 else "Partner" if autonomy < 3 else "Surrogate" if autonomy < 4 else "Full Partner"
                    
                    tier_info = Panel(
                        f"[bold]Trust Tier:[/bold] {autonomy}/4 - {trust_tier}\n"
                        f"[bold]Autonomy:[/bold] {'Limited' if autonomy < 2 else 'Moderate' if autonomy < 3 else 'High' if autonomy < 4 else 'Full'}\n"
                        f"[bold]Posture:[/bold] {limbic.get('posture', 'Unknown')}",
                        title="Trust System",
                        border_style="green"
                    )
                    self.console.print(tier_info)
            
            else:
                self.console.print(f"[red]❌ Failed to get limbic state: {response.status_code}[/red]")
        
        finally:
            await self.disconnect()
    
    async def search_command(self, query: str, limit: int = 10):
        """Search Sallie's memory."""
        if not await self.connect():
            return
        
        try:
            response = await self.session.post(
                f"{self.server_url}/memory/search",
                json={"query": query, "limit": limit}
            )
            
            if response.status_code == 200:
                results = response.json()
                
                if self.config["output_format"] == "json":
                    print(json.dumps(results, indent=2))
                else:
                    memories = results.get('memories', [])
                    
                    if not memories:
                        self.console.print(f"[yellow]No memories found for: '{query}'[/yellow]")
                        return
                    
                    table = Table(title=f"🔍 Memory Search: '{query}'", show_header=True)
                    table.add_column("Score", style="cyan")
                    table.add_column("Content", style="white")
                    table.add_column("Timestamp", style="green")
                    
                    for memory in memories[:limit]:
                        score = memory.get('score', 0)
                        content = memory.get('content', '')[:100] + "..." if len(memory.get('content', '')) > 100 else memory.get('content', '')
                        timestamp = memory.get('timestamp', 'Unknown')
                        
                        table.add_row(f"{score:.3f}", content, str(timestamp))
                    
                    self.console.print(table)
            
            else:
                self.console.print(f"[red]❌ Search failed: {response.status_code}[/red]")
        
        finally:
            await self.disconnect()
    
    async def dream_command(self, action: str = "trigger"):
        """Control Dream Cycle operations."""
        if not await self.connect():
            return
        
        try:
            if action == "trigger":
                response = await self.session.post(f"{self.server_url}/dream/trigger")
                
                if response.status_code == 200:
                    result = response.json()
                    self.console.print(f"[green]✅ Dream Cycle triggered[/green]")
                    self.console.print(f"[blue]Status: {result.get('status', 'Unknown')}[/blue]")
                else:
                    self.console.print(f"[red]❌ Failed to trigger Dream Cycle: {response.status_code}[/red]")
            
            elif action == "status":
                response = await self.session.get(f"{self.server_url}/dream/status")
                
                if response.status_code == 200:
                    status = response.json()
                    
                    table = Table(title="🌙 Dream Cycle Status", show_header=True)
                    table.add_column("Property", style="cyan")
                    table.add_column("Value", style="white")
                    
                    table.add_row("Status", status.get('status', 'Unknown'))
                    table.add_row("Last Run", status.get('last_run', 'Never'))
                    table.add_row("Next Run", status.get('next_run', 'Unknown'))
                    table.add_row("Active Hypotheses", str(status.get('active_hypotheses', 0)))
                    table.add_row("Processed Memories", str(status.get('processed_memories', 0)))
                    
                    self.console.print(table)
                else:
                    self.console.print(f"[red]❌ Failed to get Dream Cycle status: {response.status_code}[/red]")
        
        finally:
            await self.disconnect()
    
    async def hypotheses_command(self, action: str = "list", hypothesis_id: Optional[str] = None):
        """Manage Dream Cycle hypotheses."""
        if not await self.connect():
            return
        
        try:
            if action == "list":
                response = await self.session.get(f"{self.server_url}/dream/hypotheses")
                
                if response.status_code == 200:
                    result = response.json()
                    hypotheses = result.get('hypotheses', [])
                    
                    if not hypotheses:
                        self.console.print("[yellow]No active hypotheses[/yellow]")
                        return
                    
                    table = Table(title="🧠 Active Hypotheses", show_header=True)
                    table.add_column("ID", style="cyan")
                    table.add_column("Pattern", style="white")
                    table.add_column("Confidence", style="yellow")
                    table.add_column("Created", style="green")
                    
                    for hyp in hypotheses:
                        table.add_row(
                            hyp.get('id', 'Unknown'),
                            hyp.get('pattern', 'Unknown')[:50] + "...",
                            f"{hyp.get('confidence', 0):.3f}",
                            hyp.get('created', 'Unknown')
                        )
                    
                    self.console.print(table)
                
                else:
                    self.console.print(f"[red]❌ Failed to list hypotheses: {response.status_code}[/red]")
            
            elif action == "confirm" and hypothesis_id:
                response = await self.session.post(
                    f"{self.server_url}/dream/hypotheses/{hypothesis_id}/confirm"
                )
                
                if response.status_code == 200:
                    self.console.print(f"[green]✅ Hypothesis {hypothesis_id} confirmed[/green]")
                else:
                    self.console.print(f"[red]❌ Failed to confirm hypothesis: {response.status_code}[/red]")
            
            elif action == "deny" and hypothesis_id:
                response = await self.session.post(
                    f"{self.server_url}/dream/hypotheses/{hypothesis_id}/deny"
                )
                
                if response.status_code == 200:
                    self.console.print(f"[green]✅ Hypothesis {hypothesis_id} denied[/green]")
                else:
                    self.console.print(f"[red]❌ Failed to deny hypothesis: {response.status_code}[/red]")
        
        finally:
            await self.disconnect()
    
    async def debug_command(self, log_level: str = "info", component: Optional[str] = None):
        """Debug and diagnostic tools."""
        if not await self.connect():
            return
        
        try:
            # Get debug information
            debug_info = {
                "timestamp": datetime.now().isoformat(),
                "log_level": log_level,
                "component": component,
                "config": self.config
            }
            
            if component:
                response = await self.session.get(f"{self.server_url}/debug/{component}")
            else:
                response = await self.session.get(f"{self.server_url}/debug")
            
            if response.status_code == 200:
                debug_data = response.json()
                
                # Display debug information
                tree = Tree("🐛 Debug Information")
                
                # System info
                system_branch = tree.add("🖥️ System")
                system_branch.add(f"Python: {sys.version}")
                system_branch.add(f"Platform: {sys.platform}")
                system_branch.add(f"Server: {self.server_url}")
                
                # Component info
                if component:
                    comp_branch = tree.add(f"🔧 {component.title()}")
                    for key, value in debug_data.items():
                        comp_branch.add(f"{key}: {value}")
                else:
                    for comp, data in debug_data.items():
                        comp_branch = tree.add(f"🔧 {comp}")
                        if isinstance(data, dict):
                            for key, value in data.items():
                                comp_branch.add(f"{key}: {value}")
                        else:
                            comp_branch.add(str(data))
                
                self.console.print(tree)
            
            else:
                self.console.print(f"[red]❌ Debug endpoint not available: {response.status_code}[/red]")
        
        finally:
            await self.disconnect()
    
    async def config_command(self, action: str = "show", key: Optional[str] = None, value: Optional[str] = None):
        """Configuration management."""
        if action == "show":
            table = Table(title="⚙️ CLI Configuration", show_header=True)
            table.add_column("Setting", style="cyan")
            table.add_column("Value", style="white")
            
            for k, v in self.config.items():
                table.add_row(k, str(v))
            
            self.console.print(table)
        
        elif action == "set" and key and value:
            # Convert value to appropriate type
            if value.lower() in ['true', 'false']:
                value = value.lower() == 'true'
            elif value.isdigit():
                value = int(value)
            elif value.replace('.', '').isdigit():
                value = float(value)
            
            self.config[key] = value
            self.save_config()
            self.console.print(f"[green]✅ Set {key} = {value}[/green]")
        
        elif action == "get" and key:
            value = self.config.get(key, "Not set")
            self.console.print(f"[cyan]{key}[/cyan] = {value}")
    
    async def backup_command(self, action: str = "create", backup_id: Optional[str] = None):
        """Backup and restore operations."""
        if not await self.connect():
            return
        
        try:
            if action == "create":
                response = await self.session.post(f"{self.server_url}/backup/create")
                
                if response.status_code == 200:
                    result = response.json()
                    backup_id = result.get('backup_id')
                    self.console.print(f"[green]✅ Backup created: {backup_id}[/green]")
                    self.console.print(f"[blue]Location: {result.get('location', 'Unknown')}[/blue]")
                else:
                    self.console.print(f"[red]❌ Failed to create backup: {response.status_code}[/red]")
            
            elif action == "list":
                response = await self.session.get(f"{self.server_url}/backup/list")
                
                if response.status_code == 200:
                    backups = response.json().get('backups', [])
                    
                    if not backups:
                        self.console.print("[yellow]No backups found[/yellow]")
                        return
                    
                    table = Table(title="💾 Available Backups", show_header=True)
                    table.add_column("ID", style="cyan")
                    table.add_column("Created", style="white")
                    table.add_column("Size", style="green")
                    table.add_column("Type", style="yellow")
                    
                    for backup in backups:
                        table.add_row(
                            backup.get('id', 'Unknown'),
                            backup.get('created', 'Unknown'),
                            backup.get('size', 'Unknown'),
                            backup.get('type', 'Unknown')
                        )
                    
                    self.console.print(table)
                
                else:
                    self.console.print(f"[red]❌ Failed to list backups: {response.status_code}[/red]")
            
            elif action == "restore" and backup_id:
                if Confirm.ask(f"Restore backup {backup_id}? This will overwrite current data."):
                    response = await self.session.post(f"{self.server_url}/backup/restore/{backup_id}")
                    
                    if response.status_code == 200:
                        self.console.print(f"[green]✅ Backup {backup_id} restored[/green]")
                    else:
                        self.console.print(f"[red]❌ Failed to restore backup: {response.status_code}[/red]")
        
        finally:
            await self.disconnect()

def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Sallie CLI - Command Line Interface for Power Users",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  progeny chat                           # Interactive chat mode
  progeny chat "Hello Sallie"            # Single message
  progeny status                         # System status
  progeny status --detailed              # Detailed status
  progeny limbic                         # View limbic state
  progeny search "project planning"      # Search memory
  progeny dream trigger                  # Trigger Dream Cycle
  progeny hypotheses list                # List hypotheses
  progeny hypotheses confirm hyp_001     # Confirm hypothesis
  progeny debug --log-level=trace       # Debug mode
  progeny config show                    # Show configuration
  progeny backup create                  # Create backup
        """
    )
    
    parser.add_argument("--server", default=SALLIE_SERVER_URL, help="Sallie server URL")
    parser.add_argument("--timeout", type=int, default=TIMEOUT, help="Request timeout")
    parser.add_argument("--format", choices=["rich", "json", "plain"], default="rich", help="Output format")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Chat command
    chat_parser = subparsers.add_parser("chat", help="Interactive chat with Sallie")
    chat_parser.add_argument("message", nargs="?", help="Single message to send")
    chat_parser.add_argument("--no-interactive", action="store_true", help="Non-interactive mode")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Check system status")
    status_parser.add_argument("--detailed", action="store_true", help="Show detailed status")
    
    # Limbic command
    subparsers.add_parser("limbic", help="View limbic state")
    
    # Search command
    search_parser = subparsers.add_parser("search", help="Search memory")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--limit", type=int, default=10, help="Result limit")
    
    # Dream command
    dream_parser = subparsers.add_parser("dream", help="Dream Cycle operations")
    dream_parser.add_argument("action", choices=["trigger", "status"], default="trigger", nargs="?", help="Dream action")
    
    # Hypotheses command
    hyp_parser = subparsers.add_parser("hypotheses", help="Manage hypotheses")
    hyp_parser.add_argument("action", choices=["list", "confirm", "deny"], default="list", nargs="?", help="Hypothesis action")
    hyp_parser.add_argument("id", nargs="?", help="Hypothesis ID")
    
    # Debug command
    debug_parser = subparsers.add_parser("debug", help="Debug and diagnostics")
    debug_parser.add_argument("--log-level", choices=["debug", "info", "warn", "error"], default="info", help="Log level")
    debug_parser.add_argument("--component", help="Specific component to debug")
    
    # Config command
    config_parser = subparsers.add_parser("config", help="Configuration management")
    config_parser.add_argument("action", choices=["show", "get", "set"], default="show", nargs="?", help="Config action")
    config_parser.add_argument("--key", help="Configuration key")
    config_parser.add_argument("--value", help="Configuration value")
    
    # Backup command
    backup_parser = subparsers.add_parser("backup", help="Backup and restore")
    backup_parser.add_argument("action", choices=["create", "list", "restore"], default="create", nargs="?", help="Backup action")
    backup_parser.add_argument("id", nargs="?", help="Backup ID")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Create CLI instance
    cli = SallieCLI()
    cli.server_url = args.server
    cli.timeout = args.timeout
    cli.config["output_format"] = args.format
    cli.debug_mode = args.debug
    
    # Run command
    try:
        if args.command == "chat":
            asyncio.run(cli.chat_command(args.message, not args.no_interactive))
        elif args.command == "status":
            asyncio.run(cli.status_command(args.detailed))
        elif args.command == "limbic":
            asyncio.run(cli.limbic_command())
        elif args.command == "search":
            asyncio.run(cli.search_command(args.query, args.limit))
        elif args.command == "dream":
            asyncio.run(cli.dream_command(args.action))
        elif args.command == "hypotheses":
            asyncio.run(cli.hypotheses_command(args.action, args.id))
        elif args.command == "debug":
            asyncio.run(cli.debug_command(args.log_level, args.component))
        elif args.command == "config":
            asyncio.run(cli.config_command(args.action, args.key, args.value))
        elif args.command == "backup":
            asyncio.run(cli.backup_command(args.action, args.id))
    
    except KeyboardInterrupt:
        cli.console.print("\n[yellow]👋 Goodbye![/yellow]")
    except Exception as e:
        cli.console.print(f"[red]❌ Error: {e}[/red]")
        if cli.debug_mode:
            import traceback
            cli.console.print(traceback.format_exc())

if __name__ == "__main__":
    main()
