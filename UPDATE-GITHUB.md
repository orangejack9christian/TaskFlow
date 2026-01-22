# How to Update Your GitHub Repository

## Option 1: Using Git Command Line (Recommended)

### Step 1: Open Git Bash or PowerShell
- If you have Git installed, open **Git Bash** (search for it in Start menu)
- Or restart your PowerShell/terminal after installing Git

### Step 2: Navigate to your project folder
```bash
cd C:\Users\erice\Documents\task-manager
```

### Step 3: Check what files have changed
```bash
git status
```

### Step 4: Add all changed files
```bash
git add .
```

Or add specific files:
```bash
git add index.html styles.css app.js
```

### Step 5: Commit your changes
```bash
git commit -m "Update TaskFlow: Simplified UI and added all major features"
```

### Step 6: Push to GitHub
```bash
git push origin main
```

(If your default branch is `master` instead of `main`, use: `git push origin master`)

---

## Option 2: Using GitHub Desktop (Easiest)

1. **Open GitHub Desktop**
2. **Click "File" → "Add Local Repository"** (if not already added)
3. **Select your folder**: `C:\Users\erice\Documents\task-manager`
4. **Review changes** in the left panel
5. **Write a commit message** at the bottom (e.g., "Update TaskFlow: Simplified UI and added all major features")
6. **Click "Commit to main"** (or "Commit to master")
7. **Click "Push origin"** button at the top

---

## Option 3: Using GitHub Website (Manual Upload)

1. Go to your GitHub repository page
2. Click **"Add file"** → **"Upload files"**
3. Drag and drop all your changed files:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `calendar.js`
   - `themes.js`
   - `undo-redo.js`
   - `projects.js`
   - `templates.js`
   - `recurrence.js`
   - `time-tracking.js`
   - `statistics.js`
   - `notifications.js`
   - `sounds.js`
   - `focus-mode.js`
   - Any other new files
4. Scroll down and write a commit message
5. Click **"Commit changes"**

---

## Troubleshooting

### If Git says "not a git repository":
```bash
git init
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git add .
git commit -m "Initial commit"
git push -u origin main
```

### If you get authentication errors:
- Use a **Personal Access Token** instead of password
- Or use **GitHub Desktop** which handles authentication automatically

### If you need to check your remote URL:
```bash
git remote -v
```

### To update the remote URL:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

---

## Quick Summary (Command Line)

```bash
cd C:\Users\erice\Documents\task-manager
git add .
git commit -m "Update TaskFlow: Simplified UI and added all major features"
git push origin main
```

That's it! Your changes will be live on GitHub.
