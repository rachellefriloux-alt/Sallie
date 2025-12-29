import os
import shutil
import subprocess
import sys

def run_command(command, cwd=None):
    print(f"Running: {command} in {cwd or os.getcwd()}")
    if isinstance(command, (list, tuple)):
        subprocess.check_call(list(command), cwd=cwd)
        return
    subprocess.check_call(command, shell=True, cwd=cwd)

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    web_dir = os.path.join(root_dir, 'web')
    desktop_dir = os.path.join(root_dir, 'desktop')
    backend_dir = os.path.join(root_dir, 'progeny_root')
    
    print("=== Building Sallie All-in-One Installer ===")
    
    # 1. Build Web App
    print("\n--- Building Web App ---")
    # Check if node_modules exists, if not install
    if not os.path.exists(os.path.join(web_dir, 'node_modules')):
        run_command("npm install", cwd=web_dir)
    
    run_command("npm run build", cwd=web_dir)
    
    # Copy web export to desktop
    web_out = os.path.join(web_dir, 'out')
    desktop_ui = os.path.join(desktop_dir, 'app_ui')
    if os.path.exists(desktop_ui):
        shutil.rmtree(desktop_ui)
    shutil.copytree(web_out, desktop_ui)
    print(f"Copied web app to {desktop_ui}")
    
    # 2. Build Backend
    print("\n--- Building Python Backend ---")
    # Ensure pyinstaller is installed
    try:
        run_command([sys.executable, "-m", "PyInstaller", "--version"])
    except Exception:
        print("Installing PyInstaller...")
        run_command([sys.executable, "-m", "pip", "install", "--upgrade", "pyinstaller"])
        
    run_command([sys.executable, "-m", "PyInstaller", "backend.spec", "--noconfirm"], cwd=backend_dir)
    
    # Copy backend to desktop resources
    backend_dist = os.path.join(backend_dir, 'dist', 'sallie-backend')
    desktop_resources = os.path.join(desktop_dir, 'resources', 'sallie-backend')
    
    # Ensure resources dir exists
    if not os.path.exists(os.path.dirname(desktop_resources)):
        os.makedirs(os.path.dirname(desktop_resources))
        
    if os.path.exists(desktop_resources):
        shutil.rmtree(desktop_resources)
    
    # PyInstaller might create a folder or a single file depending on config
    # Our spec uses COLLECT, so it should be a folder
    if os.path.isdir(backend_dist):
        shutil.copytree(backend_dist, desktop_resources)
    else:
        # If it's a file (onefile mode), create dir and copy
        os.makedirs(desktop_resources)
        shutil.copy2(backend_dist + ".exe" if sys.platform == "win32" else backend_dist, desktop_resources)
        
    print(f"Copied backend to {desktop_resources}")
    
    # 3. Build Desktop App
    print("\n--- Building Desktop App ---")
    if not os.path.exists(os.path.join(desktop_dir, 'node_modules')):
        run_command("npm install", cwd=desktop_dir)
        
    run_command("npm run build", cwd=desktop_dir)
    
    print("\n=== Build Complete! ===")
    print(f"Installers are located in: {os.path.join(desktop_dir, 'dist')}")

if __name__ == "__main__":
    main()
