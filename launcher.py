#!/usr/bin/env python3
"""
Sallie - One-Click Launcher
Simple GUI application to launch all Sallie services with a single click.
"""

import os
import sys
import time
import subprocess
import threading
import webbrowser
import signal
from pathlib import Path
from typing import Optional, Dict
import tkinter as tk
from tkinter import ttk, messagebox, scrolledtext
import platform

# Get the directory where the script is located
SCRIPT_DIR = Path(__file__).parent.absolute()
os.chdir(SCRIPT_DIR)

class SallieLauncher:
    """Main launcher GUI for Sallie."""
    
    def __init__(self, root):
        self.root = root
        self.root.title("Sallie Launcher")
        self.root.geometry("600x700")
        self.root.resizable(True, True)
        
        # Process tracking
        self.processes: Dict[str, Optional[subprocess.Popen]] = {
            'docker': None,
            'backend': None,
            'web': None
        }
        self.running = False
        self.is_windows = platform.system() == 'Windows'
        
        # Setup UI
        self.setup_ui()
        
        # Check initial status
        self.check_prerequisites()
        
    def setup_ui(self):
        """Create the user interface."""
        # Header
        header_frame = tk.Frame(self.root, bg='#2C3E50', height=100)
        header_frame.pack(fill=tk.X, pady=0)
        header_frame.pack_propagate(False)
        
        title = tk.Label(
            header_frame,
            text="🌟 Sallie",
            font=("Arial", 32, "bold"),
            fg='#ECF0F1',
            bg='#2C3E50'
        )
        title.pack(pady=10)
        
        subtitle = tk.Label(
            header_frame,
            text="Your AI Cognitive Partner",
            font=("Arial", 12),
            fg='#BDC3C7',
            bg='#2C3E50'
        )
        subtitle.pack()
        
        # Main content
        content_frame = tk.Frame(self.root, padx=20, pady=20)
        content_frame.pack(fill=tk.BOTH, expand=True)
        
        # Status section
        status_frame = tk.LabelFrame(content_frame, text="System Status", padx=10, pady=10)
        status_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.status_labels = {}
        services = ['Docker', 'Backend API', 'Web Interface']
        for service in services:
            row = tk.Frame(status_frame)
            row.pack(fill=tk.X, pady=2)
            
            label = tk.Label(row, text=f"{service}:", width=15, anchor='w')
            label.pack(side=tk.LEFT)
            
            status = tk.Label(row, text="⚫ Not Running", fg='gray', width=20, anchor='w')
            status.pack(side=tk.LEFT)
            
            self.status_labels[service] = status
        
        # Control buttons
        button_frame = tk.Frame(content_frame)
        button_frame.pack(fill=tk.X, pady=10)
        
        self.start_button = tk.Button(
            button_frame,
            text="🚀 START SALLIE",
            command=self.start_sallie,
            bg='#27AE60',
            fg='white',
            font=("Arial", 14, "bold"),
            height=2,
            cursor='hand2'
        )
        self.start_button.pack(fill=tk.X, pady=5)
        
        self.stop_button = tk.Button(
            button_frame,
            text="⏹ STOP SALLIE",
            command=self.stop_sallie,
            bg='#E74C3C',
            fg='white',
            font=("Arial", 14, "bold"),
            height=2,
            cursor='hand2',
            state=tk.DISABLED
        )
        self.stop_button.pack(fill=tk.X, pady=5)
        
        self.web_button = tk.Button(
            button_frame,
            text="🌐 Open Web Interface",
            command=lambda: webbrowser.open('http://localhost:3000'),
            bg='#3498DB',
            fg='white',
            font=("Arial", 12),
            cursor='hand2',
            state=tk.DISABLED
        )
        self.web_button.pack(fill=tk.X, pady=5)
        
        # Log output
        log_frame = tk.LabelFrame(content_frame, text="Log Output", padx=5, pady=5)
        log_frame.pack(fill=tk.BOTH, expand=True, pady=10)
        
        self.log_text = scrolledtext.ScrolledText(
            log_frame,
            height=15,
            wrap=tk.WORD,
            font=("Courier", 9),
            bg='#1E1E1E',
            fg='#D4D4D4'
        )
        self.log_text.pack(fill=tk.BOTH, expand=True)
        
        # Footer
        footer = tk.Label(
            content_frame,
            text="Version 5.4.2 | © 2025",
            font=("Arial", 8),
            fg='gray'
        )
        footer.pack(pady=5)
        
    def log(self, message: str, level: str = 'INFO'):
        """Add a message to the log."""
        timestamp = time.strftime('%H:%M:%S')
        color_map = {
            'INFO': '#87CEEB',
            'SUCCESS': '#90EE90',
            'WARNING': '#FFD700',
            'ERROR': '#FF6B6B'
        }
        
        self.log_text.insert(tk.END, f"[{timestamp}] ", 'timestamp')
        self.log_text.insert(tk.END, f"{message}\n", level.lower())
        
        # Configure tags for colors
        self.log_text.tag_config('timestamp', foreground='#808080')
        self.log_text.tag_config('info', foreground=color_map.get('INFO', '#D4D4D4'))
        self.log_text.tag_config('success', foreground=color_map.get('SUCCESS', '#90EE90'))
        self.log_text.tag_config('warning', foreground=color_map.get('WARNING', '#FFD700'))
        self.log_text.tag_config('error', foreground=color_map.get('ERROR', '#FF6B6B'))
        
        self.log_text.see(tk.END)
        self.root.update()
        
    def update_status(self, service: str, status: str, color: str):
        """Update service status."""
        if service in self.status_labels:
            symbol = {'running': '🟢', 'stopped': '⚫', 'starting': '🟡', 'error': '🔴'}
            self.status_labels[service].config(
                text=f"{symbol.get(status, '⚫')} {status.title()}",
                fg=color
            )
            self.root.update()
    
    def check_prerequisites(self):
        """Check if required software is installed."""
        self.log("Checking prerequisites...", 'INFO')
        
        # Check Python
        python_version = sys.version.split()[0]
        self.log(f"✓ Python {python_version}", 'SUCCESS')
        
        # Check Docker
        try:
            result = subprocess.run(
                ['docker', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                self.log(f"✓ {result.stdout.strip()}", 'SUCCESS')
            else:
                self.log("✗ Docker not found", 'ERROR')
                self.update_status('Docker', 'error', 'red')
        except (subprocess.SubprocessError, FileNotFoundError):
            self.log("✗ Docker not installed or not in PATH", 'ERROR')
            self.update_status('Docker', 'error', 'red')
        
        # Check Node.js
        try:
            result = subprocess.run(
                ['node', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                self.log(f"✓ Node.js {result.stdout.strip()}", 'SUCCESS')
            else:
                self.log("✗ Node.js not found", 'WARNING')
        except (subprocess.SubprocessError, FileNotFoundError):
            self.log("✗ Node.js not installed or not in PATH", 'WARNING')
        
        self.log("Prerequisites check complete", 'INFO')
    
    def start_sallie(self):
        """Start all Sallie services."""
        self.running = True
        self.start_button.config(state=tk.DISABLED)
        self.stop_button.config(state=tk.NORMAL)
        
        # Start in a separate thread to keep UI responsive
        thread = threading.Thread(target=self._start_services, daemon=True)
        thread.start()
    
    def _start_services(self):
        """Internal method to start services."""
        try:
            # Step 1: Start Docker services
            self.log("=" * 50, 'INFO')
            self.log("Starting Sallie Services...", 'INFO')
            self.log("=" * 50, 'INFO')
            
            # Start auto-discovery FIRST
            self.log("[0/3] Starting auto-discovery...", 'INFO')
            try:
                sys.path.insert(0, str(SCRIPT_DIR / 'progeny_root' / 'Peer'))
                from core.discovery import get_discovery
                
                discovery = get_discovery()
                discovery.start_broadcast()
                discovery.start_discovery()
                
                self.log("✓ Auto-discovery started - devices will find each other automatically!", 'SUCCESS')
                self.log("  No manual IP addresses needed!", 'INFO')
            except Exception as e:
                self.log(f"⚠ Auto-discovery failed: {e}", 'WARNING')
                self.log("  Install zeroconf: pip install zeroconf", 'INFO')
            
            self.log("[1/3] Starting Docker services...", 'INFO')
            self.update_status('Docker', 'starting', 'orange')
            
            os.chdir(SCRIPT_DIR / 'progeny_root')
            
            # Check if Docker is running
            try:
                subprocess.run(
                    ['docker', 'info'],
                    capture_output=True,
                    timeout=5,
                    check=True
                )
            except subprocess.CalledProcessError:
                self.log("✗ Docker is not running. Please start Docker Desktop first.", 'ERROR')
                self.update_status('Docker', 'error', 'red')
                self.running = False
                self.start_button.config(state=tk.NORMAL)
                self.stop_button.config(state=tk.DISABLED)
                return
            
            # Start docker-compose
            docker_cmd = ['docker-compose', 'up', '-d']
            result = subprocess.run(
                docker_cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            if result.returncode == 0:
                self.log("✓ Docker services started", 'SUCCESS')
                self.update_status('Docker', 'running', 'green')
            else:
                self.log(f"⚠ Docker services may already be running", 'WARNING')
                self.update_status('Docker', 'running', 'green')
            
            # Wait for services to be ready
            self.log("Waiting for services to initialize...", 'INFO')
            time.sleep(5)
            
            # Step 2: Start Backend
            self.log("[2/3] Starting backend API...", 'INFO')
            self.update_status('Backend API', 'starting', 'orange')
            
            os.chdir(SCRIPT_DIR / 'progeny_root')
            
            # Start backend
            backend_cmd = [
                sys.executable, '-m', 'uvicorn',
                'core.main:app',
                '--host', '127.0.0.1',
                '--port', '8000'
            ]
            
            # Redirect output to log files
            backend_log = open(SCRIPT_DIR / 'backend.log', 'w')
            
            if self.is_windows:
                self.processes['backend'] = subprocess.Popen(
                    backend_cmd,
                    stdout=backend_log,
                    stderr=subprocess.STDOUT,
                    creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
                )
            else:
                self.processes['backend'] = subprocess.Popen(
                    backend_cmd,
                    stdout=backend_log,
                    stderr=subprocess.STDOUT,
                    preexec_fn=os.setsid
                )
            
            # Wait for backend to be ready
            max_retries = 30
            for i in range(max_retries):
                try:
                    import urllib.request
                    urllib.request.urlopen('http://localhost:8000/health', timeout=1)
                    self.log("✓ Backend API is running", 'SUCCESS')
                    self.update_status('Backend API', 'running', 'green')
                    break
                except:
                    time.sleep(1)
                    if i == max_retries - 1:
                        self.log("⚠ Backend starting (may need more time)", 'WARNING')
                        self.update_status('Backend API', 'starting', 'orange')
            
            # Step 3: Start Web Interface
            self.log("[3/3] Starting web interface...", 'INFO')
            self.update_status('Web Interface', 'starting', 'orange')
            
            os.chdir(SCRIPT_DIR / 'web')
            
            # Check if node_modules exists
            if not (SCRIPT_DIR / 'web' / 'node_modules').exists():
                self.log("Installing dependencies (first time only)...", 'INFO')
                try:
                    npm_install = subprocess.run(
                        ['npm', 'install'],
                        capture_output=True,
                        text=True,
                        timeout=300
                    )
                    if npm_install.returncode != 0:
                        self.log(f"✗ npm install failed: {npm_install.stderr}", 'ERROR')
                        raise Exception("npm install failed")
                except (FileNotFoundError, subprocess.SubprocessError) as e:
                    self.log(f"✗ npm not found or failed: {e}", 'ERROR')
                    raise Exception("npm not found - please install Node.js")
            
            # Start web interface
            web_cmd = ['npm', 'run', 'dev']
            web_log = open(SCRIPT_DIR / 'web.log', 'w')
            
            try:
                if self.is_windows:
                    self.processes['web'] = subprocess.Popen(
                        web_cmd,
                        stdout=web_log,
                        stderr=subprocess.STDOUT,
                        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
                    )
                else:
                    self.processes['web'] = subprocess.Popen(
                        web_cmd,
                        stdout=web_log,
                        stderr=subprocess.STDOUT,
                        preexec_fn=os.setsid
                    )
            except (FileNotFoundError, subprocess.SubprocessError) as e:
                self.log(f"✗ Failed to start web interface: {e}", 'ERROR')
                raise Exception("npm not found - please install Node.js")
            
            # Wait for web to be ready
            time.sleep(8)
            
            self.log("✓ Web interface is running", 'SUCCESS')
            self.update_status('Web Interface', 'running', 'green')
            
            # Success!
            self.log("=" * 50, 'SUCCESS')
            self.log("✨ Sallie is running! ✨", 'SUCCESS')
            self.log("=" * 50, 'SUCCESS')
            self.log("", 'INFO')
            self.log("🌐 Web Interface: http://localhost:3000", 'INFO')
            self.log("📱 Backend API: http://localhost:8000", 'INFO')
            self.log("", 'INFO')
            self.log("Click 'Open Web Interface' to start using Sallie!", 'INFO')
            
            # Enable web button
            self.web_button.config(state=tk.NORMAL)
            
            # Auto-open browser
            time.sleep(2)
            webbrowser.open('http://localhost:3000')
            
        except Exception as e:
            self.log(f"✗ Error starting services: {str(e)}", 'ERROR')
            self.running = False
            self.start_button.config(state=tk.NORMAL)
            self.stop_button.config(state=tk.DISABLED)
    
    def stop_sallie(self):
        """Stop all Sallie services."""
        self.log("=" * 50, 'INFO')
        self.log("Stopping Sallie Services...", 'INFO')
        self.log("=" * 50, 'INFO')
        
        # Stop web
        if self.processes['web']:
            self.log("Stopping web interface...", 'INFO')
            try:
                if self.is_windows:
                    self.processes['web'].send_signal(signal.CTRL_BREAK_EVENT)
                    time.sleep(2)
                    self.processes['web'].terminate()
                else:
                    os.killpg(os.getpgid(self.processes['web'].pid), signal.SIGTERM)
                self.processes['web'].wait(timeout=5)
                self.log("✓ Web interface stopped", 'SUCCESS')
            except:
                try:
                    self.processes['web'].kill()
                except:
                    pass
            self.update_status('Web Interface', 'stopped', 'gray')
        
        # Stop backend
        if self.processes['backend']:
            self.log("Stopping backend API...", 'INFO')
            try:
                if self.is_windows:
                    self.processes['backend'].send_signal(signal.CTRL_BREAK_EVENT)
                    time.sleep(2)
                    self.processes['backend'].terminate()
                else:
                    os.killpg(os.getpgid(self.processes['backend'].pid), signal.SIGTERM)
                self.processes['backend'].wait(timeout=5)
                self.log("✓ Backend API stopped", 'SUCCESS')
            except:
                try:
                    self.processes['backend'].kill()
                except:
                    pass
            self.update_status('Backend API', 'stopped', 'gray')
        
        # Optionally stop Docker
        response = messagebox.askyesno(
            "Stop Docker Services?",
            "Do you want to stop Docker services (Ollama & Qdrant)?\n\n"
            "Choose 'No' if you want to keep them running for next time."
        )
        
        if response:
            self.log("Stopping Docker services...", 'INFO')
            os.chdir(SCRIPT_DIR / 'progeny_root')
            try:
                subprocess.run(
                    ['docker-compose', 'stop'],
                    capture_output=True,
                    timeout=30
                )
                self.log("✓ Docker services stopped", 'SUCCESS')
                self.update_status('Docker', 'stopped', 'gray')
            except:
                self.log("⚠ Failed to stop Docker services", 'WARNING')
        
        self.log("Sallie stopped. Goodbye! 💜", 'INFO')
        
        self.running = False
        self.start_button.config(state=tk.NORMAL)
        self.stop_button.config(state=tk.DISABLED)
        self.web_button.config(state=tk.DISABLED)
    
    def on_closing(self):
        """Handle window close event."""
        if self.running:
            if messagebox.askokcancel("Quit", "Sallie is still running. Stop services and quit?"):
                self.stop_sallie()
                self.root.destroy()
        else:
            self.root.destroy()


def main():
    """Main entry point."""
    root = tk.Tk()
    app = SallieLauncher(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()


if __name__ == '__main__':
    main()
