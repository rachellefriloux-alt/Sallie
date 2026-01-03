#!/usr/bin/env python3
"""
Install Zeroconf for Auto-Discovery
Installs the zeroconf package to enable automatic device discovery on local networks.
"""

import sys
import subprocess
import platform

def print_header():
    """Print script header."""
    print("=" * 60)
    print("  Sallie - Install Zeroconf for Auto-Discovery")
    print("=" * 60)
    print()

def check_python_version():
    """Check if Python version is compatible."""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print(f"❌ Python 3.8+ required, found {version.major}.{version.minor}")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro}")
    return True

def install_zeroconf():
    """Install zeroconf package using pip."""
    print("\nInstalling zeroconf package...")
    print("This enables automatic device discovery without manual IP addresses!")
    print()
    
    try:
        # Try to import pip
        import pip
    except ImportError:
        print("❌ pip is not installed. Please install pip first.")
        return False
    
    # Determine pip command
    pip_cmd = [sys.executable, "-m", "pip", "install", "zeroconf"]
    
    print(f"Running: {' '.join(pip_cmd)}")
    print()
    
    try:
        result = subprocess.run(
            pip_cmd,
            capture_output=False,
            text=True,
            check=True
        )
        
        print()
        print("✓ Zeroconf installed successfully!")
        return True
        
    except subprocess.CalledProcessError as e:
        print()
        print(f"❌ Installation failed with error code {e.returncode}")
        return False
    except Exception as e:
        print()
        print(f"❌ Installation failed: {e}")
        return False

def verify_installation():
    """Verify that zeroconf was installed correctly."""
    print("\nVerifying installation...")
    
    try:
        from zeroconf import Zeroconf, ServiceInfo
        print("✓ Zeroconf module imported successfully!")
        
        # Try to create an instance
        zc = Zeroconf()
        print("✓ Zeroconf instance created successfully!")
        zc.close()
        
        return True
        
    except ImportError as e:
        print(f"❌ Could not import zeroconf: {e}")
        return False
    except Exception as e:
        print(f"❌ Verification failed: {e}")
        return False

def main():
    """Main entry point."""
    print_header()
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install zeroconf
    if not install_zeroconf():
        print()
        print("=" * 60)
        print("Installation failed. Please try manually:")
        print(f"  {sys.executable} -m pip install zeroconf")
        print("=" * 60)
        sys.exit(1)
    
    # Verify installation
    if not verify_installation():
        print()
        print("=" * 60)
        print("Installation completed but verification failed.")
        print("The package may still work. Try running Sallie to test.")
        print("=" * 60)
        sys.exit(1)
    
    # Success!
    print()
    print("=" * 60)
    print("✨ Installation Complete! ✨")
    print()
    print("Auto-discovery is now enabled!")
    print("Your devices will automatically find each other on the network.")
    print("No manual IP addresses needed!")
    print()
    print("You can now run:")
    print("  python launcher.py")
    print("  or")
    print("  ./start-sallie.sh")
    print("=" * 60)
    
    return 0

if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n\nInstallation cancelled by user.")
        sys.exit(1)
