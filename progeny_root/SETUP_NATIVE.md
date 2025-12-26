# Native Setup Guide (No Docker)

You have chosen the **Native Path**. This runs the Progeny directly on your Windows machine, just like any other application.

## 1. Install the Brain (Ollama)

The Progeny needs a "Brain" to think. We use **Ollama**, which is a simple app that runs AI models locally.

1. **Download Ollama**: Go to [https://ollama.com/download/windows](https://ollama.com/download/windows) and download the installer.
2. **Install**: Run the `.exe` file.
3. **Verify**: Open a new PowerShell or Command Prompt window and type:

    ```powershell
    ollama run llama3
    ```

    *If it starts chatting with you, it works! Type `/bye` to exit.*

## 2. Install Python Dependencies

We need to install the Python libraries that power the Progeny's logic.

1. Open a terminal in the `c:\Sallie\progeny_root` folder.
2. Run:

    ```powershell
    pip install -r requirements.txt
    ```

## 3. Launch

Double-click `start_progeny_native.bat` in the `c:\Sallie` folder.

---
**Note on Memory**:
In this mode, the Progeny uses "Embedded Memory". It stores its long-term memories in a folder on your disk (`progeny_root/memory/qdrant_local`) instead of a database server. This is simpler but just as powerful for a single user.
