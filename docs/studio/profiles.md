# Sallie Studio — Profiles

Profiles let you switch entire environments with one click.

---

## Available Profiles

### Dev

Your local machine.
Ports: 8000 / 8010

### QA

Your test environment.
Ports: 8200 / 8210

### Demo

Read-only mode for presentations.
Ports: 8500 / 8510

---

## What Profiles Control

- Repo root
- Backend root
- Ports
- Docker compose file
- Read-only mode
- Logging level
- Watcher behavior

---

## Switching Profiles

Go to:

### Settings → Active Profile

Choose:

- Dev
- QA
- Demo

Restart the app to apply changes.

---

## Creating New Profiles

Add them manually to:

config/studio.json

Or use the Setup Wizard on first run.
