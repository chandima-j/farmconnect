# Installing Git on Windows

## Method 1: Download Git for Windows (Recommended)

1. **Download Git**:
   - Go to https://git-scm.com/download/win
   - Click "Download for Windows"
   - The download will start automatically

2. **Install Git**:
   - Run the downloaded `.exe` file
   - Follow the installation wizard:
     - Accept the license
     - Choose installation location (default is fine)
     - Select components (keep defaults)
     - Choose start menu folder
     - **Important**: Choose "Git from the command line and also from 3rd-party software"
     - Choose HTTPS transport backend (default)
     - Configure line ending conversions (default)
     - Configure terminal emulator (default)
     - Choose default behavior for `git pull` (default)
     - Choose credential helper (default)
     - Configure extra options (default)

3. **Verify Installation**:
   - Close and reopen Command Prompt or PowerShell
   - Type: `git --version`
   - You should see something like: `git version 2.x.x.windows.x`

## Method 2: Using Package Manager (Alternative)

If you have Chocolatey installed:
```cmd
choco install git
```

If you have Winget installed:
```cmd
winget install Git.Git
```

## After Installing Git

1. **Configure Git** (replace with your info):
```cmd
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

2. **Navigate to your project folder**:
```cmd
cd path\to\your\farmconnect-project
```

3. **Initialize Git repository**:
```cmd
git init
git add .
git commit -m "Initial commit: FarmConnect marketplace"
```

4. **Create repository on GitHub** (follow previous instructions)

5. **Connect to GitHub**:
```cmd
git remote add origin https://github.com/YOUR_USERNAME/farmconnect-marketplace.git
git branch -M main
git push -u origin main
```

## Troubleshooting

- **Still getting 'git' not recognized**: Restart your computer after installation
- **Permission issues**: Run Command Prompt as Administrator
- **Path issues**: Git should be automatically added to PATH during installation

## Alternative: GitHub Desktop (GUI Option)

If you prefer a graphical interface:
1. Download GitHub Desktop from https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Use "Add an Existing Repository from your Hard Drive"
4. Select your project folder
5. Publish to GitHub directly from the app