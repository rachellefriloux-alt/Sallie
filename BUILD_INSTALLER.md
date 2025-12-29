# Building the Sallie Standalone Installer

This guide explains how to build the standalone desktop installer for Sallie, which includes the Python backend and the Web UI in a single executable.

## Prerequisites

1. **Node.js**: Ensure Node.js (v18+) is installed.
2. **Python**: Ensure Python (3.10+) is installed.
3. **Dependencies**:
    * Install Python dependencies:

        ```bash
        pip install -r progeny_root/requirements.txt
        pip install pyinstaller
        ```

    * Install Node dependencies (handled by the build script, but good to have):

        ```bash
        cd web && npm install
        cd ../desktop && npm install
        ```

## Building the Installer

To build the installer for your current platform (Windows, Mac, or Linux), simply run the build script from the root directory:

```bash
python build_installer.py
```

This script will:

1. **Build the Web App**: Compiles the Next.js frontend into a static site.
2. **Build the Backend**: Packages the Python FastAPI backend into a standalone executable using PyInstaller.
3. **Bundle Desktop App**: Uses Electron Builder to package everything into a setup file (e.g., `.exe`, `.dmg`).

## Output

The generated installers will be located in:
`desktop/dist/`

* **Windows**: `Sallie-Setup-5.4.2.exe`
* **Mac**: `Sallie-5.4.2.dmg`
* **Linux**: `Sallie-5.4.2.AppImage`

## Installation

1. Double-click the generated installer.
2. Follow the installation prompts.
3. Launch "Sallie" from your desktop or start menu.
4. The app will automatically start the backend services and launch the interface.

## Troubleshooting

* **Backend fails to start**: Check the logs in the developer console (Ctrl+Shift+I) or look for `backend.log` if configured.
* **PyInstaller errors**: Ensure all python requirements are installed in your current environment.
