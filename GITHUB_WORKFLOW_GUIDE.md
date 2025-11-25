# GitHub Workflow Guide for TankFindr

This guide explains how to manage your TankFindr codebase with GitHub, including pushing updates, managing branches, and collaborating with your team.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Daily Workflow](#daily-workflow)
3. [Pushing Updates to GitHub](#pushing-updates-to-github)
4. [Working with Branches](#working-with-branches)
5. [Cursor Integration](#cursor-integration)
6. [Common Git Commands](#common-git-commands)
7. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Verify GitHub CLI is Configured

The GitHub CLI (`gh`) is already authenticated and ready to use:

```bash
# Check authentication status
gh auth status

# View your repositories
gh repo list
```

### Clone Repository (if needed)

If you're starting fresh on a new machine:

```bash
# Clone your repository
gh repo clone cljackson1279/tankfindr

# Navigate into the directory
cd tankfindr

# Install dependencies
npm install
```

---

## Daily Workflow

### 1. Check Current Status

Before making changes, check what's been modified:

```bash
cd /home/ubuntu/tankfindr
git status
```

### 2. Pull Latest Changes

Always pull the latest changes before starting work:

```bash
git pull origin main
```

### 3. Make Your Changes

Edit files in Cursor or any editor, then check what changed:

```bash
git status
git diff
```

### 4. Stage Your Changes

Add files you want to commit:

```bash
# Add specific files
git add scripts/import-new-mexico-statewide.js
git add IMPORT_SCRIPTS_GUIDE.md

# Or add all changed files
git add .
```

### 5. Commit Your Changes

Create a commit with a descriptive message:

```bash
git commit -m "Add import scripts for NM, VA, and CA data sources"
```

### 6. Push to GitHub

Push your commits to GitHub:

```bash
git push origin main
```

---

## Pushing Updates to GitHub

### Quick Push (All New Files)

```bash
cd /home/ubuntu/tankfindr

# Stage all new and modified files
git add .

# Commit with a message
git commit -m "Your commit message here"

# Push to GitHub
git push origin main
```

### Push Specific Files

```bash
# Add only specific files
git add scripts/import-new-mexico-statewide.js
git add scripts/import-fairfax-county-va.js
git add IMPORT_SCRIPTS_GUIDE.md

# Commit
git commit -m "Add priority data source import scripts"

# Push
git push origin main
```

### Push Current Import Scripts

For the scripts we just created:

```bash
cd /home/ubuntu/tankfindr

# Add the new import scripts
git add scripts/import-new-mexico-statewide.js
git add scripts/import-fairfax-county-va.js
git add scripts/import-sonoma-county-ca.js
git add scripts/import-all-priority-sources.js
git add IMPORT_SCRIPTS_GUIDE.md
git add GITHUB_WORKFLOW_GUIDE.md

# Commit
git commit -m "Add import scripts for NM, VA, CA and comprehensive documentation"

# Push to GitHub
git push origin main
```

---

## Working with Branches

### Why Use Branches?

Branches let you work on features without affecting the main codebase.

### Create a New Branch

```bash
# Create and switch to a new branch
git checkout -b feature/new-import-scripts

# Or create without switching
git branch feature/new-import-scripts
```

### Switch Between Branches

```bash
# Switch to main branch
git checkout main

# Switch to feature branch
git checkout feature/new-import-scripts

# List all branches
git branch -a
```

### Merge a Branch

```bash
# Switch to main
git checkout main

# Merge your feature branch
git merge feature/new-import-scripts

# Push the merged changes
git push origin main
```

### Delete a Branch

```bash
# Delete local branch
git branch -d feature/new-import-scripts

# Delete remote branch
git push origin --delete feature/new-import-scripts
```

---

## Cursor Integration

### Using Git in Cursor

Cursor has built-in Git support:

1. **View Changes**: Click the Source Control icon (left sidebar)
2. **Stage Files**: Click the `+` icon next to files
3. **Commit**: Enter a message and click the checkmark
4. **Push**: Click the `...` menu → Push

### Cursor Terminal

You can also use Git commands in Cursor's terminal:

1. Open terminal: `` Ctrl+` `` (backtick)
2. Run any Git command
3. Changes sync with the GUI

### Recommended Cursor Extensions

- **GitLens**: Enhanced Git visualization
- **Git Graph**: Visual commit history
- **Git History**: View file history

---

## Common Git Commands

### Viewing History

```bash
# View commit history
git log

# View compact history
git log --oneline

# View last 5 commits
git log -5

# View changes in a commit
git show <commit-hash>
```

### Undoing Changes

```bash
# Discard changes to a file (before staging)
git checkout -- filename.js

# Unstage a file (keep changes)
git reset HEAD filename.js

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1
```

### Viewing Differences

```bash
# View unstaged changes
git diff

# View staged changes
git diff --cached

# Compare branches
git diff main feature/new-feature
```

### Remote Management

```bash
# View remote repositories
git remote -v

# Add a remote
git remote add origin https://github.com/cljackson1279/tankfindr.git

# Change remote URL
git remote set-url origin https://github.com/cljackson1279/tankfindr.git
```

---

## Troubleshooting

### Error: "Your branch is behind 'origin/main'"

**Solution**: Pull the latest changes:

```bash
git pull origin main
```

If you have local changes:

```bash
# Stash your changes
git stash

# Pull latest
git pull origin main

# Reapply your changes
git stash pop
```

### Error: "Merge conflict"

**Solution**: Resolve conflicts manually:

1. Open the conflicted file
2. Look for conflict markers: `<<<<<<<`, `=======`, `>>>>>>>`
3. Edit the file to resolve conflicts
4. Stage the resolved file: `git add filename.js`
5. Commit: `git commit -m "Resolve merge conflict"`

### Error: "Permission denied (publickey)"

**Solution**: Re-authenticate GitHub CLI:

```bash
gh auth login
```

### Error: "fatal: not a git repository"

**Solution**: You're not in the repository directory:

```bash
cd /home/ubuntu/tankfindr
```

### Accidentally Committed Secrets

**Solution**: Remove from history (⚠️ Use with caution):

```bash
# Remove file from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ This rewrites history)
git push origin --force --all
```

**Better approach**: Use `.gitignore` to prevent committing secrets.

---

## Best Practices

### Commit Messages

Use clear, descriptive commit messages:

✅ **Good:**
- `Add import script for New Mexico statewide data`
- `Fix polygon centroid calculation in Fairfax import`
- `Update documentation with Vercel deployment steps`

❌ **Bad:**
- `Update`
- `Fix bug`
- `Changes`

### Commit Frequency

- Commit often (every logical change)
- Don't commit broken code to main
- Use branches for experimental features

### What to Commit

✅ **Commit:**
- Source code
- Documentation
- Configuration files (without secrets)
- Scripts

❌ **Don't Commit:**
- `.env.local` (secrets)
- `node_modules/` (dependencies)
- `.next/` (build artifacts)
- Log files
- Personal notes

### .gitignore

Your `.gitignore` should include:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Build output
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.production.local
.env.development.local
.env.test.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
```

---

## GitHub CLI Commands

### Repository Management

```bash
# View repository info
gh repo view

# Open repository in browser
gh repo view --web

# Create a new repository
gh repo create tankfindr --public

# Clone a repository
gh repo clone cljackson1279/tankfindr
```

### Pull Requests

```bash
# Create a pull request
gh pr create --title "Add import scripts" --body "Description"

# List pull requests
gh pr list

# View a pull request
gh pr view 123

# Merge a pull request
gh pr merge 123
```

### Issues

```bash
# Create an issue
gh issue create --title "Bug: Import fails for large datasets"

# List issues
gh issue list

# View an issue
gh issue view 456

# Close an issue
gh issue close 456
```

---

## Automated Workflows

### GitHub Actions

Create `.github/workflows/deploy.yml` for automated deployment:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Quick Reference

### Essential Commands

| Command | Description |
|---------|-------------|
| `git status` | Check current status |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Commit changes |
| `git push origin main` | Push to GitHub |
| `git pull origin main` | Pull latest changes |
| `git log` | View commit history |
| `git diff` | View changes |
| `gh repo view --web` | Open repo in browser |

### Workflow Shortcuts

```bash
# Quick commit and push
git add . && git commit -m "Your message" && git push origin main

# Pull, commit, push
git pull origin main && git add . && git commit -m "Your message" && git push origin main

# View status and diff
git status && git diff
```

---

## Next Steps

1. **Push the new import scripts** to GitHub
2. **Set up Vercel deployment** (see VERCEL_DEPLOYMENT_GUIDE.md)
3. **Configure environment variables** in Vercel
4. **Test the deployment** with real data

---

**Last Updated**: November 25, 2025  
**Maintainer**: TankFindr Development Team
