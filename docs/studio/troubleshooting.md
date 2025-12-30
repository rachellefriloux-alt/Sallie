# Sallie Studio — Troubleshooting

If something isn’t working, start here.

---

## Backend won’t start

- Check if ports 8000/8010 are free
- Run python --version
- Make sure your virtual environment is activated
- Check backend logs in logs/backend.log

---

## Docker isn’t running

- Open Docker Desktop
- Wait for “Docker Engine is running”
- Run docker ps in the Developer Console

---

## Frontend won’t start

- Make sure Node.js is installed
- Run npm install in your frontend folder
- Check logs/frontend.log

---

## Health Check fails

Open the Developer Console and run:

env
pythonpath
dockerlogs
backendlogs
frontendlogs

---

## Tray icon isn’t showing

- Restart Windows Explorer
- Reopen Sallie Studio
- Make sure Silent Mode is off

---

## Setup Wizard loops

Delete:

config/studio.json

Then relaunch the app.
