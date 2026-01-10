#!/usr/bin/env python3
"""
Sallie CLI Installation Script

This script sets up the Sallie CLI for power user access.
It creates the necessary directories, configuration files, and command-line shortcuts.
"""

import os
import sys
import json
import shutil
from pathlib import Path

def install_cli():
    """Install the Sallie CLI."""
    print("🚀 Installing Sallie CLI...")
    
    # Get the directory where this script is located
    script_dir = Path(__file__).parent
    cli_script = script_dir / "progeny_cli.py"
    
    if not cli_script.exists():
        print(f"❌ CLI script not found at {cli_script}")
        return False
    
    # Create .sallie directory
    sallie_dir = Path.home() / ".sallie"
    sallie_dir.mkdir(exist_ok=True)
    
    # Create default config
    config_file = sallie_dir / "cli_config.json"
    if not config_file.exists():
        default_config = {
            "server_url": "http://192.168.1.47:8742",
            "timeout": 30,
            "auto_connect": True,
            "output_format": "rich",
            "debug_mode": False,
            "history_file": str(sallie_dir / "chat_history.json"),
            "preferred_voice": "en-US-JennyNeural"
        }
        
        with open(config_file, 'w') as f:
            json.dump(default_config, f, indent=2)
        
        print(f"✅ Created config file: {config_file}")
    
    # Make CLI script executable
    if os.name != 'nt':  # Unix-like systems
        os.chmod(cli_script, 0o755)
    
    # Create command-line shortcut
    if os.name == 'nt':  # Windows
        # Create a batch file
        batch_file = Path.home() / "sallie-cli.bat"
        with open(batch_file, 'w') as f:
            f.write(f'@echo off\npython "{cli_script}" %*\n')
        
        print(f"✅ Created Windows shortcut: {batch_file}")
        print(f"   Run 'sallie-cli' from command prompt")
    
    else:  # Unix-like systems
        # Create a shell script
        shell_file = Path.home() / "sallie-cli"
        with open(shell_file, 'w') as f:
            f.write(f'#!/bin/bash\npython "{cli_script}" "$@"\n')
        
        os.chmod(shell_file, 0o755)
        print(f"✅ Created Unix shortcut: {shell_file}")
        print(f"   Run 'sallie-cli' from terminal")
    
    # Add to PATH if possible
    if os.name == 'nt':  # Windows
        # Instructions for Windows
        print("\n📝 To use from anywhere:")
        print("   1. Add the directory containing sallie-cli.bat to your PATH")
        print("   2. Or run the full path: %USERPROFILE%\\sallie-cli.bat")
    else:  # Unix-like systems
        # Instructions for Unix
        bin_dir = Path.home() / "bin"
        if bin_dir.exists():
            shell_file = bin_dir / "progeny"
            shutil.copy(Path.home() / "sallie-cli", shell_file)
            print(f"✅ Copied to {shell_file}")
            print("   Make sure ~/bin is in your PATH")
    
    print("\n🎉 Sallie CLI installation complete!")
    print("\n📚 Quick start:")
    print("   progeny chat                    # Start interactive chat")
    print("   progeny status                 # Check system status")
    print("   progeny limbic                 # View limbic state")
    print("   progeny search 'topic'         # Search memory")
    print("   progeny --help                 # Show all commands")
    
    return True

def main():
    """Main installation function."""
    try:
        if install_cli():
            print("\n✅ Installation successful!")
        else:
            print("\n❌ Installation failed!")
            sys.exit(1)
    except Exception as e:
        print(f"\n❌ Installation error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
