# Sallie Studio — Plugin Guide

Plugins let you extend Sallie Studio without modifying the core app.

---

## 1. Plugin Structure

Each plugin lives in:

Extensions/<plugin-id>/

Example:

Extensions/com.sallie.example/
    plugin.json
    plugin.dll
    plugin-icon.png
    hello.ps1

---

## 2. plugin.json Format

{
  "name": "Example Plugin",
  "id": "com.sallie.example",
  "version": "1.0.0",
  "author": "Your Name",
  "description": "Adds example functionality.",
  "entrypoint": "plugin.dll",
  "icon": "plugin-icon.png",
  "commands": [
    {
      "name": "Say Hello",
      "type": "script",
      "script": "hello.ps1"
    }
  ],
  "ui": {
    "panel": "ExamplePanel.xaml"
  },
  "settings": {
    "enabled": true
  }
}

---

## 3. Command Types

- script — runs a PowerShell script
- python — runs a Python script
- dll — calls into a .NET assembly
- ui — injects a panel into the Plugins tab

---

## 4. Sandboxing

Plugins run in isolated processes.
They cannot:

- Access the main app memory
- Modify core files
- Inject code

---

## 5. Distribution

A plugin is just a folder.
Zip it, share it, drop it into Extensions/.

Sallie Studio loads it automatically.
