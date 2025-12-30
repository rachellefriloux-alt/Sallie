# Sallie Studio — Release Process

This is how you ship new versions of Sallie Studio.

---

## 1. Update Version Numbers

Update:

SallieStudioApp.csproj
manifest.json

---

## 2. Build Installer

In Visual Studio:

Build → Publish → Create App Packages

Choose:

- Self-signed certificate
- MSIX bundle

---

## 3. Upload Manifest + Installer

Upload:

- manifest.json
- SallieStudioInstaller.exe

To:

- GitHub
- S3
- Your server
- Local network share

---

## 4. Test Auto-Update

Open Settings → Check for Updates.

---

## 5. Tag Release

Use:

v1.0.0

---

## 6. Announce Release

Include:

- What’s new
- Fixes
- Known issues
