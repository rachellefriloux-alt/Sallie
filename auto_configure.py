#!/usr/bin/env python3
"""
Auto-Configure Sallie Client
Automatically finds and connects to Sallie backend.
NO MANUAL IP ADDRESSES NEEDED!
"""

import sys
import time
from pathlib import Path

# Add progeny_root to path
SCRIPT_DIR = Path(__file__).parent.absolute()
sys.path.insert(0, str(SCRIPT_DIR / 'progeny_root'))

from core.discovery import auto_configure_backend, get_discovery

def main():
    print("🔍 Auto-discovering Sallie backend...")
    print("=" * 50)
    
    # Get backend URL automatically
    backend_url = auto_configure_backend()
    
    print()
    print("✅ Configuration complete!")
    print()
    print(f"Backend URL: {backend_url}")
    print()
    print("Use this URL in your mobile app or web client.")
    print("Or just let it auto-configure itself!")
    print()
    
    # Show all discovered devices
    discovery = get_discovery()
    devices = discovery.get_discovered_devices()
    
    if devices:
        print(f"Found {len(devices)} Sallie device(s) on your network:")
        print()
        for device in devices:
            print(f"  📱 {device['device_name']} ({device['device_type']})")
            print(f"     Backend: {device['backend_url']}")
            print(f"     Web: {device['web_url']}")
            print()
    
    return backend_url

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nCancelled.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
