#!/usr/bin/env python3
"""
Sallie - Installer Builder
Creates distributable executables for Windows, macOS, and Linux.
"""

import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path

# Get script directory
SCRIPT_DIR = Path(__file__).parent.absolute()
os.chdir(SCRIPT_DIR)

# Colors for terminal output
if platform.system() == 'Windows':
    # Windows doesn't support ANSI by default in older versions
    try:
        os.system('color')
    except:
        pass

class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    """Print a styled header."""
    print(f"\n{Colors.CYAN}{Colors.BOLD}{'=' * 60}")
    print(f"  {text}")
    print(f"{'=' * 60}{Colors.RESET}\n")

def print_success(text):
    """Print success message."""
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")

def print_error(text):
    """Print error message."""
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")

def print_warning(text):
    """Print warning message."""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")

def print_info(text):
    """Print info message."""
    print(f"{Colors.BLUE}→ {text}{Colors.RESET}")

def run_command(command, cwd=None, timeout=600, show_output=False):
    """
    Run a command with proper error handling.
    
    Args:
        command: Command to run (string or list)
        cwd: Working directory
        timeout: Command timeout in seconds
        show_output: Whether to show command output in real-time
    
    Returns:
        tuple: (success: bool, stdout: str, stderr: str)
    """
    try:
        print_info(f"Running: {command if isinstance(command, str) else ' '.join(command)}")
        
        if show_output:
            # Show output in real-time
            process = subprocess.Popen(
                command,
                shell=isinstance(command, str),
                cwd=cwd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
            
            output_lines = []
            for line in process.stdout:
                print(line, end='')
                output_lines.append(line)
            
            process.wait(timeout=timeout)
            output = ''.join(output_lines)
            
            if process.returncode == 0:
                return True, output, ""
            else:
                return False, output, f"Command exited with code {process.returncode}"
        else:
            # Capture output
            result = subprocess.run(
                command,
                shell=isinstance(command, str),
                cwd=cwd,
                capture_output=True,
                text=True,
                timeout=timeout,
                check=False
            )
            
            if result.returncode == 0:
                return True, result.stdout, result.stderr
            else:
                return False, result.stdout, result.stderr
                
    except subprocess.TimeoutExpired:
        error_msg = f"Command timed out after {timeout} seconds"
        print_error(error_msg)
        return False, "", error_msg
    except FileNotFoundError as e:
        error_msg = f"Command not found: {e}"
        print_error(error_msg)
        return False, "", error_msg
    except Exception as e:
        error_msg = f"Unexpected error: {e}"
        print_error(error_msg)
        return False, "", str(e)

def check_python_version():
    """Check Python version."""
    print_info("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 11:
        print_success(f"Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print_error(f"Python {version.major}.{version.minor}.{version.micro} - Need Python 3.11+")
        return False

def install_pyinstaller():
    """Install PyInstaller with proper error handling."""
    print_header("Installing PyInstaller")
    
    # Check if pip is available
    print_info("Checking pip availability...")
    success, stdout, stderr = run_command([sys.executable, '-m', 'pip', '--version'])
    
    if not success:
        print_error("pip is not available or not working properly")
        print_error(f"Error: {stderr}")
        print_info("Please ensure pip is installed and working")
        print_info("Try: python -m ensurepip --upgrade")
        return False
    
    print_success(f"pip is available: {stdout.strip()}")
    
    # Check if pyinstaller is already installed
    print_info("Checking if PyInstaller is already installed...")
    success, stdout, stderr = run_command([sys.executable, '-m', 'pip', 'show', 'pyinstaller'])
    
    if success:
        print_success("PyInstaller is already installed")
        print_info(stdout)
        return True
    
    # Install pyinstaller
    print_info("Installing PyInstaller...")
    print_info("This may take a few minutes...")
    
    # Use --user flag as fallback if main install fails
    install_commands = [
        [sys.executable, '-m', 'pip', 'install', 'pyinstaller'],
        [sys.executable, '-m', 'pip', 'install', '--user', 'pyinstaller'],
        [sys.executable, '-m', 'pip', 'install', '--upgrade', 'pip', 'setuptools', 'wheel'],
    ]
    
    for i, cmd in enumerate(install_commands):
        if i == 2:
            # Try upgrading pip first if previous attempts failed
            print_warning("Previous installation attempts failed")
            print_info("Trying to upgrade pip, setuptools, and wheel first...")
            success, stdout, stderr = run_command(cmd, timeout=300, show_output=True)
            if success:
                print_success("pip, setuptools, and wheel upgraded")
                # Retry pyinstaller installation
                print_info("Retrying PyInstaller installation...")
                success, stdout, stderr = run_command(
                    [sys.executable, '-m', 'pip', 'install', 'pyinstaller'],
                    timeout=300,
                    show_output=True
                )
                if success:
                    print_success("PyInstaller installed successfully!")
                    return True
            continue
        
        success, stdout, stderr = run_command(cmd, timeout=300, show_output=True)
        
        if success:
            print_success("PyInstaller installed successfully!")
            
            # Verify installation
            print_info("Verifying PyInstaller installation...")
            success, stdout, stderr = run_command([sys.executable, '-m', 'PyInstaller', '--version'])
            if success:
                print_success(f"PyInstaller version: {stdout.strip()}")
                return True
            else:
                print_warning("PyInstaller installed but version check failed")
                print_info("This may be okay, continuing...")
                return True
        else:
            if i < len(install_commands) - 1:
                print_warning(f"Installation attempt {i+1} failed, trying alternative method...")
                print_info(f"Error was: {stderr}")
            else:
                print_error("All installation attempts failed")
                print_error(f"Last error: {stderr}")
    
    print_error("Could not install PyInstaller")
    print_info("Please try installing manually:")
    print_info("  1. python -m pip install --upgrade pip")
    print_info("  2. python -m pip install pyinstaller")
    print_info("")
    print_info("If you're behind a proxy, try:")
    print_info("  python -m pip install --proxy=http://your-proxy:port pyinstaller")
    print_info("")
    print_info("If you have permission issues, try:")
    print_info("  python -m pip install --user pyinstaller")
    
    return False

def build_executable():
    """Build the executable using PyInstaller."""
    print_header("Building Sallie Executable")
    
    launcher_file = SCRIPT_DIR / 'launcher.py'
    
    if not launcher_file.exists():
        print_error(f"Launcher file not found: {launcher_file}")
        return False
    
    print_info("Building executable with PyInstaller...")
    print_info("This will take several minutes...")
    print_info("")
    
    # PyInstaller command
    cmd = [
        sys.executable, '-m', 'PyInstaller',
        str(launcher_file),
        '--onefile',
        '--windowed',
        '--name', 'Sallie',
        '--clean',
        '--noconfirm'
    ]
    
    # Add icon if available
    icon_path = SCRIPT_DIR / 'sallie' / 'icon.ico'
    if icon_path.exists():
        cmd.extend(['--icon', str(icon_path)])
        print_info(f"Using icon: {icon_path}")
    
    success, stdout, stderr = run_command(cmd, timeout=600, show_output=True)
    
    if success:
        print_success("Executable built successfully!")
        
        # Find the executable
        dist_dir = SCRIPT_DIR / 'dist'
        if platform.system() == 'Windows':
            exe_path = dist_dir / 'Sallie.exe'
        else:
            exe_path = dist_dir / 'Sallie'
        
        if exe_path.exists():
            file_size = exe_path.stat().st_size / (1024 * 1024)  # MB
            print_success(f"Executable created: {exe_path}")
            print_info(f"Size: {file_size:.2f} MB")
            return True
        else:
            print_warning("Build completed but executable not found at expected location")
            print_info(f"Expected: {exe_path}")
            print_info(f"Check the dist/ directory for the output")
            return False
    else:
        print_error("Build failed")
        print_error(f"Error: {stderr}")
        return False

def clean_build_artifacts():
    """Clean up build artifacts."""
    print_header("Cleaning Up")
    
    artifacts = ['build', 'dist', '__pycache__', '*.spec']
    
    for artifact in artifacts:
        if '*' in artifact:
            # Handle wildcards
            import glob
            for item in glob.glob(str(SCRIPT_DIR / artifact)):
                try:
                    if os.path.isfile(item):
                        os.remove(item)
                        print_info(f"Removed: {item}")
                    elif os.path.isdir(item):
                        shutil.rmtree(item)
                        print_info(f"Removed: {item}")
                except Exception as e:
                    print_warning(f"Could not remove {item}: {e}")
        else:
            path = SCRIPT_DIR / artifact
            if path.exists():
                try:
                    if path.is_file():
                        path.unlink()
                        print_info(f"Removed: {path}")
                    else:
                        shutil.rmtree(path)
                        print_info(f"Removed: {path}")
                except Exception as e:
                    print_warning(f"Could not remove {path}: {e}")
    
    print_success("Cleanup complete")

def main():
    """Main function."""
    print_header("🌟 Sallie Installer Builder 🌟")
    print(f"Platform: {platform.system()} {platform.release()}")
    print()
    
    # Check Python version
    if not check_python_version():
        print_error("Python version check failed")
        sys.exit(1)
    
    # Install PyInstaller
    if not install_pyinstaller():
        print_error("Failed to install PyInstaller")
        print_info("Please resolve the installation issues and try again")
        sys.exit(1)
    
    # Build executable
    if not build_executable():
        print_error("Failed to build executable")
        sys.exit(1)
    
    # Success
    print_header("Build Complete! 🎉")
    print_success("Sallie executable has been created successfully!")
    print()
    print_info("Next steps:")
    print_info("1. Test the executable: ./dist/Sallie (or dist\\Sallie.exe on Windows)")
    print_info("2. Distribute the executable from the dist/ directory")
    print_info("3. Users can run Sallie without installing Python!")
    print()
    print(f"{Colors.CYAN}Thank you for building Sallie! 💜{Colors.RESET}")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Build cancelled by user{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Build failed with error: {e}{Colors.RESET}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
