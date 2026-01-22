# TaskFlow - Step-by-Step Online Deployment Guide

Deploy TaskFlow online so you can access it from anywhere in the world!

---

## PART 1: Install Git (Required)

### Step 1.1: Download Git
1. Go to: **https://git-scm.com/download/win**
2. Click the big download button (it will detect you're on Windows)
3. The download will start automatically

### Step 1.2: Install Git
1. Run the downloaded file (Git-2.x.x-64-bit.exe)
2. Click "Next" through all the screens
3. **IMPORTANT:** When you see "Adjusting your PATH environment":
   - Select: **"Git from the command line and also from 3rd-party software"**
   - This is usually the default, but make sure!
4. Keep clicking "Next" with default settings
5. Click "Install"
6. Wait for installation to finish
7. Click "Finish"

### Step 1.3: Verify Installation
1. Close and reopen your PowerShell/Command Prompt
2. Type: `git --version`
3. You should see something like: `git version 2.x.x`
4. If you see this, Git is installed! ✅

---

## PART 2: Create GitHub Account

### Step 2.1: Sign Up
1. Go to: **https://github.com**
2. Click **"Sign up"** (top right)
3. Enter:
   - Your email address
   - A password (make it strong!)
   - A username (this will be in your URL, choose wisely)
4. Solve the puzzle/verification
5. Click **"Create account"**

### Step 2.2: Verify Email
1. Check your email inbox
2. Click the verification link from GitHub
3. You're now signed in! ✅

---

## PART 3: Create Repository on GitHub

### Step 3.1: Create New Repository
1. While logged into GitHub, click the **"+"** icon (top right corner)
2. Click **"New repository"**

### Step 3.2: Fill in Repository Details
1. **Repository name:** Type `taskflow` (or any name you want)
2. **Description:** (Optional) Type: "TaskFlow - My Productivity Companion"
3. **Visibility:** Make sure **"Public"** is selected (required for free hosting)
4. **DO NOT CHECK ANY BOXES:**
   - ❌ Don't check "Add a README file"
   - ❌ Don't check "Add .gitignore"
   - ❌ Don't check "Choose a license"
5. Click the green **"Create repository"** button

### Step 3.3: Copy Your Repository URL
1. After creating, you'll see a page with setup instructions
2. Look for a section that says "Quick setup"
3. You'll see a URL like: `https://github.com/YOUR-USERNAME/taskflow.git`
4. **Copy this URL** - you'll need it in a moment!

---

## PART 4: Upload Your Files to GitHub

### Step 4.1: Open PowerShell in Your TaskFlow Folder
1. Press `Windows Key + X`
2. Click **"Windows PowerShell"** or **"Terminal"**
3. Type this command and press Enter:
   ```
   cd "C:\Users\erice\Documents\task-manager"
   ```
4. Press Enter
5. You should now be in the task-manager folder

### Step 4.2: Initialize Git
Type these commands one by one, pressing Enter after each:

```powershell
git init
```

You should see: "Initialized empty Git repository..."

### Step 4.3: Add All Files
```powershell
git add .
```

This adds all your files. You won't see output, that's normal.

### Step 4.4: Create First Commit
```powershell
git commit -m "Initial commit - TaskFlow app"
```

You might see a message about configuring user name/email. If so, run these first:
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```
Then run the commit command again.

### Step 4.5: Connect to GitHub
Replace `YOUR-USERNAME` with your actual GitHub username:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/taskflow.git
```

**Example:** If your username is "johnsmith", it would be:
```powershell
git remote add origin https://github.com/johnsmith/taskflow.git
```

### Step 4.6: Rename Branch to Main
```powershell
git branch -M main
```

### Step 4.7: Upload Files
```powershell
git push -u origin main
```

**IMPORTANT:** 
- You'll be asked for your GitHub username - enter it
- You'll be asked for your password - **DON'T enter your regular password!**
- Instead, you need a **Personal Access Token** (see next step)

---

## PART 5: Create Personal Access Token (For Password)

### Step 5.1: Generate Token
1. Go to GitHub.com (make sure you're logged in)
2. Click your profile picture (top right)
3. Click **"Settings"**
4. Scroll down on the left sidebar, click **"Developer settings"**
5. Click **"Personal access tokens"**
6. Click **"Tokens (classic)"**
7. Click **"Generate new token"**
8. Click **"Generate new token (classic)"**

### Step 5.2: Configure Token
1. **Note:** Type "TaskFlow Deployment" (or anything to remember it)
2. **Expiration:** Choose "90 days" or "No expiration" (your choice)
3. **Select scopes:** Check the box **"repo"** (this selects all repo permissions)
4. Scroll down and click **"Generate token"**

### Step 5.3: Copy Token
1. **IMPORTANT:** Copy the token immediately! It looks like: `ghp_xxxxxxxxxxxxxxxxxxxx`
2. You won't be able to see it again!
3. Paste it somewhere safe temporarily

### Step 5.4: Use Token as Password
1. Go back to your PowerShell window
2. Run the push command again if needed:
   ```powershell
   git push -u origin main
   ```
3. **Username:** Enter your GitHub username
4. **Password:** Paste the token you just copied (not your regular password!)
5. Press Enter

You should see upload progress and then "Branch 'main' set up to track..."

**SUCCESS!** Your files are now on GitHub! ✅

---

## PART 6: Enable GitHub Pages (Make It Live!)

### Step 6.1: Go to Repository Settings
1. On GitHub, go to your repository page
2. Click the **"Settings"** tab (top of the page)

### Step 6.2: Enable Pages
1. Scroll down on the left sidebar
2. Click **"Pages"** (under "Code and automation")

### Step 6.3: Configure Pages
1. Under **"Source"**, click the dropdown
2. Select **"Deploy from a branch"**
3. **Branch:** Select `main`
4. **Folder:** Select `/ (root)`
5. Click **"Save"**

### Step 6.4: Wait for Deployment
1. GitHub will show: "Your site is being built from the main branch"
2. Wait 1-2 minutes
3. Refresh the page
4. You'll see a green checkmark and a URL like:
   ```
   https://YOUR-USERNAME.github.io/taskflow/
   ```

### Step 6.5: Access Your Live App!
1. Click the URL shown
2. **TaskFlow is now live on the internet!** 🎉
3. Share this URL with anyone - they can access your app!

---

## PART 7: Updating Your App (When You Make Changes)

Whenever you update TaskFlow files:

1. Open PowerShell in the task-manager folder:
   ```powershell
   cd "C:\Users\erice\Documents\task-manager"
   ```

2. Run these commands:
   ```powershell
   git add .
   git commit -m "Updated TaskFlow"
   git push
   ```

3. Wait 1-2 minutes for GitHub Pages to update
4. Refresh your live site - changes will appear!

---

## TROUBLESHOOTING

### "git is not recognized"
→ Git isn't installed. Go back to PART 1.

### "Authentication failed" when pushing
→ You're using your password instead of a token. Use a Personal Access Token (PART 5).

### "Repository not found"
→ Check your repository URL is correct. Make sure the repository exists on GitHub.

### Pages not showing
→ Wait 2-3 minutes. Check Settings → Pages to see if there are any errors.

### Files not updating
→ Make sure you ran `git add .` and `git commit` before `git push`.

---

## YOUR LIVE URL

Once deployed, your TaskFlow will be at:
```
https://YOUR-USERNAME.github.io/taskflow/
```

Replace `YOUR-USERNAME` with your actual GitHub username!

---

## Need Help?

- GitHub Help: https://docs.github.com
- Git Documentation: https://git-scm.com/doc

**You've got this!** 🚀
