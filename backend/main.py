# main.py
"""
Sallie Studio - Main Entry Point

This is the main entry point for the Sallie Studio desktop application.
It orchestrates the flow between:

1. Genesis Flow (first-time onboarding ritual)
2. Prism Dashboard (main working interface with 5 Power Roles)
3. Sallie's Homepage (her sanctuary where her full avatar lives)

=== FLOW ===
- If Genesis hasn't completed → Launch Genesis App
- If Genesis complete → Launch Prism Dashboard
- User can navigate to Sallie's Homepage from Prism

Prerequisites:
    pip install PyQt6
"""

import sys
import json
from pathlib import Path

from PyQt6.QtWidgets import QApplication, QMessageBox
from PyQt6.QtCore import QObject, pyqtSignal

# Check for heritage files to determine if Genesis has completed
HERITAGE_PATHS = [
    Path("heritage_core.json"),
    Path("genesis_flow/heritage_core.json"),
    Path("progeny_root/limbic/heritage/genesis_answers.json")
]


def check_genesis_complete() -> bool:
    """Check if the Genesis ritual has been completed."""
    for path in HERITAGE_PATHS:
        if path.exists():
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                # Check if it has answers
                if data.get("answers") and len(data["answers"]) > 0:
                    return True
            except Exception:
                continue
    return False


class SallieStudio(QObject):
    """
    Main application controller for Sallie Studio.
    
    Manages navigation between:
    - Genesis Flow (onboarding)
    - Prism Dashboard (main interface)
    - Sallie's Homepage (her sanctuary)
    """
    
    def __init__(self):
        super().__init__()
        self.app = QApplication(sys.argv)
        self.app.setApplicationName("Sallie Studio")
        self.app.setOrganizationName("Sallie")
        
        self.current_window = None
        self.genesis_complete = check_genesis_complete()
    
    def start(self):
        """Start the application."""
        if self.genesis_complete:
            self.launch_prism()
        else:
            self.launch_genesis()
        
        return self.app.exec()
    
    def launch_genesis(self):
        """Launch the Genesis Flow for first-time users."""
        try:
            from genesis_app import GenesisApp
            
            self.current_window = GenesisApp()
            self.current_window.genesis_complete.connect(self.on_genesis_complete)
            self.current_window.show()
            
        except ImportError as e:
            self._show_error(f"Failed to import Genesis App: {e}")
        except Exception as e:
            self._show_error(f"Failed to launch Genesis: {e}")
    
    def launch_prism(self):
        """Launch the Prism Dashboard."""
        try:
            from dashboard_prism import PrismDashboard
            
            self.current_window = PrismDashboard()
            self.current_window.navigate_to_sallie_home.connect(self.launch_sallie_home)
            self.current_window.show()
            
        except ImportError as e:
            self._show_error(f"Failed to import Prism Dashboard: {e}")
        except Exception as e:
            self._show_error(f"Failed to launch Prism: {e}")
    
    def launch_sallie_home(self):
        """Launch Sallie's Homepage (her sanctuary)."""
        try:
            from sallie_homepage import SallieHomepage
            
            # Hide current window
            if self.current_window:
                self.current_window.hide()
            
            self.sallie_home = SallieHomepage()
            self.sallie_home.return_to_prism.connect(self.return_to_prism)
            self.sallie_home.show()
            
        except ImportError as e:
            self._show_error(f"Failed to import Sallie Homepage: {e}")
        except Exception as e:
            self._show_error(f"Failed to launch Sallie's Homepage: {e}")
    
    def return_to_prism(self):
        """Return to the Prism Dashboard from Sallie's Homepage."""
        if hasattr(self, 'sallie_home'):
            self.sallie_home.close()
        
        if self.current_window:
            self.current_window.show()
    
    def on_genesis_complete(self, answers: dict):
        """Handle Genesis completion."""
        print("[Sallie Studio] Genesis complete. Running integration...")
        
        # Run integration
        try:
            from genesis_integration import run_integration
            results = run_integration()
            print(f"[Sallie Studio] Integration results: {results['success']}")
        except Exception as e:
            print(f"[Sallie Studio] Integration error: {e}")
        
        # Close Genesis and launch Prism
        if self.current_window:
            self.current_window.close()
        
        self.genesis_complete = True
        self.launch_prism()
    
    def _show_error(self, message: str):
        """Show an error message dialog."""
        print(f"[ERROR] {message}")
        msg = QMessageBox()
        msg.setIcon(QMessageBox.Icon.Critical)
        msg.setWindowTitle("Sallie Studio Error")
        msg.setText(message)
        msg.exec()


def main():
    """Main entry point."""
    print("=" * 50)
    print("SALLIE STUDIO")
    print("=" * 50)
    
    studio = SallieStudio()
    
    if studio.genesis_complete:
        print("Genesis complete. Launching Prism Dashboard...")
    else:
        print("Genesis not complete. Launching Genesis Flow...")
    
    return studio.start()


if __name__ == "__main__":
    sys.exit(main())
