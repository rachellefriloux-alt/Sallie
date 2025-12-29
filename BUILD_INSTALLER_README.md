# Build Installer Guide

## Overview

The `build_installer.py` script creates distributable executables for the Sallie launcher application using PyInstaller. This allows users to run Sallie without installing Python.

## Features

✅ **Robust Error Handling**: Multiple fallback methods for installing PyInstaller
✅ **User-Friendly Output**: Colored terminal output with clear progress indicators
✅ **Automatic Verification**: Checks Python version, pip availability, and installation success
✅ **Cross-Platform**: Works on Windows, macOS, and Linux

## Prerequisites

- Python 3.11+ installed
- pip package manager available
- Internet connection (for first-time PyInstaller installation)

## Usage

### Basic Usage

Run the script from the repository root:

```bash
python build_installer.py
```

or

```bash
python3 build_installer.py
```

### What the Script Does

1. **Checks Python Version**: Ensures Python 3.11+ is installed
2. **Installs PyInstaller**: Automatically installs PyInstaller with error handling
   - Tries standard installation first
   - Falls back to `--user` installation if needed
   - Can upgrade pip/setuptools if installation fails
3. **Builds Executable**: Creates a single-file executable using PyInstaller
   - Uses `launcher.py` as the entry point
   - Creates `--onefile` executable (no dependencies folder)
   - Uses `--windowed` mode (no console window)
   - Names the executable "Sallie"
   - Cleans previous builds automatically
4. **Verifies Build**: Checks that the executable was created successfully

### Output

The executable will be created in:
- **Windows**: `dist/Sallie.exe`
- **macOS/Linux**: `dist/Sallie`

### Example Output

```
============================================================
  🌟 Sallie Installer Builder 🌟
============================================================

Platform: Windows 11

✓ Python 3.12.3

============================================================
  Installing PyInstaller
============================================================

✓ pip is available: pip 24.0
→ Installing PyInstaller...
✓ PyInstaller installed successfully!
✓ PyInstaller version: 6.17.0

============================================================
  Building Sallie Executable
============================================================

→ Building executable with PyInstaller...
✓ Executable built successfully!
✓ Executable created: C:\Sallie\dist\Sallie.exe
→ Size: 7.66 MB

============================================================
  Build Complete! 🎉
============================================================

✓ Sallie executable has been created successfully!
```

## Troubleshooting

### Error: "pip is not available"

**Solution**: Install or upgrade pip:
```bash
python -m ensurepip --upgrade
```

### Error: "Permission denied" during pip install

**Solution**: The script automatically tries `--user` installation. If that fails:
```bash
# Manual installation
python -m pip install --user pyinstaller
```

### Error: PyInstaller build fails

**Solution**: Check the error message. Common issues:
- Missing dependencies: Install from `progeny_root/requirements.txt`
- File not found: Ensure `launcher.py` exists in the repository root
- Disk space: Ensure you have at least 500 MB free space

### Error: "Command 'pip install pyinstaller' returned non-zero exit status 1"

This error is now **fixed** with the new `build_installer.py` script! The script includes:
- Multiple installation fallback methods
- Automatic pip upgrade if needed
- User installation fallback
- Detailed error messages

## Build Artifacts

The following files/folders are created during the build (already in `.gitignore`):
- `build/` - Temporary build files
- `dist/` - Final executable location
- `Sallie.spec` - PyInstaller specification file

## Distribution

After building:

1. **Test the executable**:
   ```bash
   # Windows
   dist\Sallie.exe
   
   # macOS/Linux
   ./dist/Sallie
   ```

2. **Distribute**: Share the executable from the `dist/` folder
   - Users don't need Python installed
   - Users don't need any dependencies
   - Just run the executable!

## Advanced Options

To customize the build, you can modify `build_installer.py`:

- Change icon: Update the `icon_path` in the `build_executable()` function
- Add data files: Modify the PyInstaller command to include `--add-data`
- Change executable name: Modify the `--name` parameter
- Add version info: Add `--version-file` parameter (Windows only)

## Integration with Other Scripts

The `build_installer.py` script complements:
- `install.py` - Installs dependencies for development
- `launcher.py` - The main application launcher
- `start-sallie.bat/sh` - Quick start scripts for development

## Notes

- The first build takes longer (downloads PyInstaller and builds caches)
- Subsequent builds are faster (uses cached data)
- The executable includes the Python interpreter and all dependencies
- Executable size is typically 5-10 MB depending on dependencies

## Related Documentation

- [BUILD_AND_DOWNLOAD.md](BUILD_AND_DOWNLOAD.md) - General build instructions
- [BUILD_NATIVE_APPS.md](BUILD_NATIVE_APPS.md) - Building mobile and desktop apps
- [INSTALL_README.md](INSTALL_README.md) - Installation guide
- [LAUNCHER_README.md](LAUNCHER_README.md) - Launcher documentation

## Support

If you encounter issues not covered here:
1. Check the error message carefully
2. Ensure Python 3.11+ is installed
3. Try running `python -m pip install --upgrade pip`
4. Check that you have write permissions in the directory
5. Review the detailed error output from the script

## Version History

- **v1.0** (2024-12-29): Initial release with robust error handling
  - Multiple installation fallback methods
  - Comprehensive error messages
  - Cross-platform support
  - Automatic verification
