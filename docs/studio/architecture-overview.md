# Sallie Studio — Architecture Overview

This document explains how Sallie Studio is structured.

---

## 1. High-Level Architecture

Sallie Studio is built on:

- WinUI 3 (Windows App SDK)
- PowerShell scripts
- Python backend
- Docker containers
- Node frontend
- Local config + optional cloud sync

---

## 2. Core Components

### Desktop App
UI, dashboard, settings, plugins, tray mode.

### Script Layer
All operational logic lives in PowerShell scripts.

### Backend
FastAPI/Uvicorn service.

### Docker
Memory agent, brain agent, and any future agents.

### Frontend
Optional web UI.

### Config
Stored in:

config/studio.json

### Logs
Stored in:

logs/

---

## 3. Data Flow

User → UI → ScriptRunner → Scripts → Backend/Docker/Frontend → Dashboard → User

---

## 4. Profiles

Profiles define:

- Ports
- Repo root
- Docker compose
- Read-only mode

---

## 5. Plugins

Plugins extend:

- Commands
- UI panels
- Settings
- Scripts
