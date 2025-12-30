# Sallie Studio — Windows Installation Guide

This guide walks you through installing Sallie Studio on Windows.
My goal is simple: you click, it works, and you don’t have to fight your machine.

---

## 1. System Requirements

You need:

- Windows 10 or 11
- Docker Desktop installed and running
- PowerShell 5+
- Python 3.11+
- Node.js (only if you’re running the frontend)

If you’ve been running the Sallie backend manually, you’re already set.

---

## 2. Install Sallie Studio

1. Download the installer (SallieStudioInstaller.exe).
2. Double-click it.
3. Approve the certificate (local dev cert).
4. Let Windows finish the install.

After installation, Sallie Studio will show up in your Start Menu.

Pin it to your taskbar — you’ll use it often.

---

## 3. First Launch

On first launch, Sallie Studio will:

- Detect your repo
- Detect your backend
- Detect Docker
- Scan ports
- Build your profiles
- Create your config
- Restart cleanly

If anything is missing, the wizard will tell you exactly what to fix.

---

## 4. Updating Sallie Studio

When you install a new version:

- Your config stays
- Your profiles stay
- Your logs stay
- Your scripts stay

You only replace the app itself.

---

## 5. Uninstalling

Use “Add or Remove Programs” in Windows.
Your config and logs remain unless you delete them manually.

---

## 6. Support

If something feels off, open the Developer Console inside the app.
It will tell you exactly what’s happening under the hood.
