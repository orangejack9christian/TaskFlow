# TaskFlow - Deployment Guide

Make TaskFlow accessible from any device!

## Option 1: Local Network Access (Easiest)

Access TaskFlow from any device on your Wi-Fi network.

### Windows:
1. Double-click `start-server.bat` (or run `start-server.ps1` in PowerShell)
2. The server will start and show your IP address
3. On other devices (phone, tablet, other computers):
   - Connect to the same Wi-Fi network
   - Open a browser
   - Go to: `http://[YOUR-IP]:8000` (the IP will be shown in the server window)

### Requirements:
- Python 3.x installed (download from python.org if needed)
- All devices on the same Wi-Fi network

## Option 2: Cloud Hosting (Access from Anywhere)

Deploy TaskFlow to the cloud for access from anywhere.

### GitHub Pages (Free & Easy):

1. **Create a GitHub account** (if you don't have one)

2. **Create a new repository:**
   - Go to github.com
   - Click "New repository"
   - Name it "taskflow" (or any name)
   - Make it public
   - Don't initialize with README

3. **Upload your files:**
   ```bash
   # In the task-manager folder, run:
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/taskflow.git
   git push -u origin main
   ```

4. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Save

5. **Access your app:**
   - Your app will be at: `https://YOUR-USERNAME.github.io/taskflow/`
   - Share this URL with anyone!

### Netlify (Alternative - Even Easier):

1. Go to netlify.com and sign up (free)
2. Drag and drop your `task-manager` folder onto Netlify
3. Your app is live instantly!
4. Get a custom domain or use their free subdomain

### Vercel (Another Great Option):

1. Install Vercel CLI: `npm i -g vercel`
2. In your task-manager folder, run: `vercel`
3. Follow the prompts
4. Your app is deployed!

## Option 3: Self-Hosted Server

For more control, you can host on:
- DigitalOcean
- AWS
- Google Cloud
- Your own server

## Important Notes:

⚠️ **Data Storage:**
- Currently, TaskFlow stores data in browser LocalStorage
- Each device/browser will have separate data
- For shared data across devices, you'd need a backend (future enhancement)

✅ **Security:**
- Local network access is safe within your Wi-Fi
- Cloud hosting is public - be aware of this
- No authentication is currently implemented

## Troubleshooting:

**Can't access from other devices?**
- Make sure all devices are on the same Wi-Fi
- Check Windows Firewall - it may block the connection
- Try disabling firewall temporarily to test

**Port already in use?**
- Change PORT in `server.py` to another number (like 8001, 8080, etc.)

**Python not found?**
- Download Python from python.org
- Make sure to check "Add Python to PATH" during installation

## Need Help?

For cloud hosting, GitHub Pages is the easiest free option that works great for static sites like TaskFlow!
