import uvicorn
import os
import sys
import multiprocessing
import importlib

# PyInstaller support for multiprocessing
multiprocessing.freeze_support()

def _runtime_root() -> str:
    # When frozen, prefer the executable directory (onedir) and _MEIPASS (onefile).
    if getattr(sys, 'frozen', False):
        exe_dir = os.path.dirname(sys.executable)
        if exe_dir:
            return exe_dir
        return getattr(sys, '_MEIPASS', os.getcwd())
    return os.path.dirname(os.path.abspath(__file__))


def _import_app():
    # Support the documented layout (progeny_root/core) and the current repo layout (Companion/Peer roots).
    candidates = [
        'progeny_root.core.main',
        'core.main',
        'Companion.core.main',
        'Peer.core.main',
    ]
    last_error: Exception | None = None
    for module_name in candidates:
        try:
            module = importlib.import_module(module_name)
            app = getattr(module, 'app', None)
            if app is not None:
                return app, module_name
            last_error = ImportError(f"Module '{module_name}' imported but has no 'app' attribute")
        except Exception as e:
            last_error = e
            continue
    raise ImportError(f"Unable to import FastAPI app from any known entrypoint: {candidates}. Last error: {last_error}")


# Add runtime root to sys.path so imports work in both dev and packaged modes
runtime_root = _runtime_root()
if runtime_root and runtime_root not in sys.path:
    sys.path.insert(0, runtime_root)

if __name__ == "__main__":
    # Get port from env or default
    port = int(os.environ.get("SALLIE_PORT", 8000))
    host = "127.0.0.1"
    
    print(f"Starting Sallie Backend on {host}:{port}")
    
    try:
        app, module_name = _import_app()
        print(f"Backend entrypoint: {module_name}:app")
        uvicorn.run(app, host=host, port=port, log_level="info")
    except ImportError as e:
        print(f"Error importing app: {e}")
        import traceback
        traceback.print_exc()
        # Keep window open if it crashes immediately
        input("Press Enter to exit...")
    except Exception as e:
        print(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
        input("Press Enter to exit...")
