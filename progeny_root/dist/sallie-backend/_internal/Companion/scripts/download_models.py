#!/usr/bin/env python3
"""
Model download automation script.
Downloads required models for Digital Progeny.
"""

import subprocess
import sys
import time
from pathlib import Path

def run_command(cmd, description):
    """Run a command and report progress."""
    print(f"\n{description}...")
    print(f"Running: {' '.join(cmd)}")
    
    try:
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Stream output
        for line in process.stdout:
            print(line.rstrip())
        
        process.wait()
        
        if process.returncode == 0:
            print(f"✓ {description} completed successfully")
            return True
        else:
            print(f"✗ {description} failed with exit code {process.returncode}")
            return False
    
    except FileNotFoundError:
        print(f"✗ Command not found: {cmd[0]}")
        print(f"  Please install {cmd[0]} and try again")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def check_ollama():
    """Check if Ollama is installed and running."""
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False

def download_ollama_models():
    """Download required Ollama models."""
    models = [
        "deepseek-v3",  # Primary model
        "llama3",       # Fallback model
        "nomic-embed-text"  # Embedding model
    ]
    
    print("\n" + "=" * 60)
    print("Downloading Ollama Models")
    print("=" * 60)
    
    if not check_ollama():
        print("\n[ERROR] Ollama is not installed or not running")
        print("Install from: https://ollama.ai/")
        print("Then start with: ollama serve")
        return False
    
    all_success = True
    for model in models:
        success = run_command(
            ["ollama", "pull", model],
            f"Downloading {model}"
        )
        if not success:
            all_success = False
            print(f"\n[WARNING] Failed to download {model}")
            print("You can retry later with: ollama pull " + model)
    
    return all_success

def download_whisper_models():
    """Download Whisper models (optional, for local STT)."""
    print("\n" + "=" * 60)
    print("Whisper Models (Optional - for local STT)")
    print("=" * 60)
    print("\nWhisper models are downloaded automatically when first used.")
    print("No manual download needed.")
    print("To use Whisper, ensure 'openai-whisper' is installed:")
    print("  pip install openai-whisper")
    return True

def download_piper_models():
    """Download Piper TTS models (optional, for local TTS)."""
    print("\n" + "=" * 60)
    print("Piper TTS Models (Optional - for local TTS)")
    print("=" * 60)
    print("\nPiper TTS requires manual installation.")
    print("See: https://github.com/rhasspy/piper")
    print("Or use Coqui TTS: pip install TTS")
    return True

def main():
    """Main function."""
    print("=" * 60)
    print("Digital Progeny - Model Download")
    print("=" * 60)
    
    success = True
    
    # Download Ollama models (required)
    if not download_ollama_models():
        success = False
    
    # Whisper models (optional)
    download_whisper_models()
    
    # Piper models (optional)
    download_piper_models()
    
    print("\n" + "=" * 60)
    if success:
        print("✓ Model download complete!")
        print("\nYou can now run the setup wizard or start the system.")
    else:
        print("⚠ Some model downloads failed.")
        print("You can retry individual models later.")
    print("=" * 60)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())

