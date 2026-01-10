# 🌟 Sallie Setup Guide for Non-Coders

Welcome! This guide will help you set up Sallie on your Windows 11 Pro computer, even if you've never coded before.

## 📋 What You'll Need

- Windows 11 Pro computer
- About 1 hour of time
- Internet connection
- Administrator access to your computer

## 🎯 Step 1: Install Required Software

### 1.1 Install Python 3.11

1. Go to: https://www.python.org/downloads/
2. Click "Download Python 3.11" (get version 3.11.x)
3. **IMPORTANT**: When the installer opens, check ✅ "Add Python to PATH" at the bottom
4. Click "Install Now"
5. Wait for installation to complete
6. Click "Close"

**Test it worked:**
1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Type `python --version` and press Enter
4. You should see "Python 3.11.x"

### 1.2 Install Node.js 20

1. Go to: https://nodejs.org/
2. Download the "20.x LTS" version (left button)
3. Run the installer
4. Click "Next" through all steps (use default settings)
5. Click "Install"
6. Click "Finish"

**Test it worked:**
1. Open a new Command Prompt (Windows Key + R, type `cmd`)
2. Type `node --version` and press Enter
3. You should see "v20.x.x"

### 1.3 Install Docker Desktop (Optional but Recommended)

1. Go to: https://www.docker.com/products/docker-desktop/
2. Click "Download for Windows"
3. Run the installer
4. Click "OK" when asked about WSL 2
5. Click "Close and restart" when done
6. After restart, Docker Desktop will open automatically
7. Accept the service agreement
8. You can skip the tutorial

## 🔐 Step 2: Configure Your Environment

### 2.1 Find Your Sallie Folder

1. Open File Explorer
2. Navigate to where you downloaded/cloned Sallie
   - Probably: `C:\Users\YourName\Sallie` or `C:\Users\YourName\Documents\Sallie`

### 2.2 Create Your Environment File

1. In the Sallie folder, find the file `.env.example`
2. **Right-click** on `.env.example`
3. Select "Open with" → "Notepad"
4. You'll see a template with settings

### 2.3 Generate a Secure JWT Secret

1. Press `Windows Key + R`
2. Type `cmd` and press Enter
3. Type this command exactly:
   ```
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
4. Press Enter
5. You'll see a long string of random letters and numbers - **copy this entire string**
6. Keep this Command Prompt window open

### 2.4 Fill In Your Settings

1. Go back to Notepad with `.env.example` open
2. Find the line that says:
   ```
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ```
3. Replace `your-super-secret-jwt-key-change-this-in-production` with the string you copied
4. Leave the other settings as they are for now (you can change them later)

### 2.5 Save Your Environment File

1. In Notepad, click "File" → "Save As..."
2. In "File name:", type `.env` (including the dot at the start)
3. In "Save as type:", select "All Files (*.*)"
4. Click "Save"
5. Close Notepad

**IMPORTANT**: You now have a `.env` file in your Sallie folder. This file contains secrets - never share it or upload it anywhere!

## 📦 Step 3: Install Dependencies

### 3.1 Install Python Packages

1. Press `Windows Key + R`, type `cmd`, press Enter
2. Navigate to your Sallie folder:
   ```
   cd C:\Users\YourName\Sallie
   ```
   (Replace `YourName` with your actual username)

3. Install Python packages:
   ```
   pip install -r backend\requirements.txt
   ```
4. This will take 5-10 minutes. Wait for it to complete.
5. You'll see lots of text scrolling - this is normal!

### 3.2 Install Web Packages

1. In the same Command Prompt, type:
   ```
   cd web
   ```
2. Install web packages:
   ```
   npm install
   ```
3. This will take 5-10 minutes. Wait for it to complete.

## 🚀 Step 4: Start Sallie

You need to start TWO programs: the backend server and the web interface.

### 4.1 Start the Backend Server

1. Open a **new** Command Prompt (Windows Key + R, type `cmd`)
2. Navigate to Sallie:
   ```
   cd C:\Users\YourName\Sallie
   ```
3. Start the backend:
   ```
   cd server
   python sallie_studio_production_server.py
   ```
4. You should see messages about the server starting
5. **Keep this window open!** Don't close it.

### 4.2 Start the Web Interface

1. Open **another new** Command Prompt
2. Navigate to Sallie:
   ```
   cd C:\Users\YourName\Sallie\web
   ```
3. Start the web interface:
   ```
   npm run dev
   ```
4. You should see "ready - started server on http://localhost:3000"
5. **Keep this window open too!**

### 4.3 Open Sallie in Your Browser

1. Open your web browser (Chrome, Edge, or Firefox)
2. Go to: `http://localhost:3000`
3. You should see Sallie's welcome screen! 🎉

## 🎯 Step 5: Complete The Great Convergence

The first time you use Sallie, you'll go through "The Great Convergence" - 30 deep questions that help Sallie understand you.

**Tips:**
- Take your time (30-90 minutes total)
- Be honest and specific
- Write at least 200 words for deeper questions
- Use voice or text input - your choice!
- You can take breaks between questions

**What to expect:**
- Questions about your thinking patterns
- Questions about your values and boundaries
- Questions about your goals and fears
- A "Mirror Test" where Sallie reflects what it sees in you
- Final question: anything else you need to share

## ⚠️ Troubleshooting

### "Python is not recognized"
- You need to restart your Command Prompt after installing Python
- Make sure you checked "Add Python to PATH" during installation

### "Module not found" errors
- Make sure you ran `pip install -r backend\requirements.txt`
- Try running it again

### "Port 3000 already in use"
- Another program is using that port
- Close other development servers
- Or change the port: `npm run dev -- -p 3001`

### Backend won't start
- Check that your `.env` file exists in the Sallie folder
- Make sure JWT_SECRET is set correctly
- Try running `python --version` to confirm Python is installed

### Can't connect to Sallie in browser
- Make sure both Command Prompt windows are still running
- Try refreshing the browser
- Check the Command Prompts for error messages

## 🎨 Using Windsurf to Preview

If you're using Windsurf to preview changes before running them:

1. Open Windsurf
2. Open the Sallie folder
3. You can see all the code files
4. Changes will show with green/red highlights
5. Review the CHANGES_SUMMARY.md file to understand what changed

## 🔒 Security Best Practices

1. **Never share your `.env` file**
2. **Never commit `.env` to Git**
3. **Change JWT_SECRET if it's ever exposed**
4. **Keep Sallie up to date**
5. **All voice processing happens locally on your computer**
6. **Your data never leaves your machine**

## 📚 Next Steps

Once Sallie is running:

1. Complete The Great Convergence (30 questions)
2. Explore the different pages:
   - Dashboard - Overview of your interaction
   - Limbic - Sallie's emotional state
   - Heritage - Your Heritage DNA
   - Communication - Chat with Sallie
   - Settings - Customize your experience

## 💡 Tips

- **Voice Input**: Click the microphone icon to speak instead of type
- **Posture Modes**: Sallie adapts to your needs (Companion, Co-Pilot, Peer, Expert)
- **Trust Levels**: Sallie gains more capabilities as trust grows
- **Dream Cycle**: Sallie processes insights overnight
- **Git Safety Net**: Sallie commits before modifying files (so you can undo)

## 🆘 Need Help?

If you get stuck:

1. Check the error message in the Command Prompt windows
2. Read the troubleshooting section above
3. Check CHANGES_SUMMARY.md for what changed
4. Review REVIEW_CHECKLIST.md before merging changes

## 📝 Stopping Sallie

When you're done:

1. In each Command Prompt window, press `Ctrl + C`
2. Type `Y` if asked to terminate
3. Close the Command Prompt windows
4. Close your browser

## 🔄 Starting Again Later

To start Sallie again:

1. Follow Step 4 (Start Sallie) again
2. You don't need to reinstall anything
3. Your settings and Heritage DNA are saved

---

**Remember**: Take your time with The Great Convergence. The better Sallie knows you, the better it can help you.

Welcome to your new cognitive partnership! 🌟
