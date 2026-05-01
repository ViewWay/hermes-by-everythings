# Hermes-by-Everything (HBE) Installation Script
# Version: 3.2.0
# Platform: Windows (PowerShell)

$ErrorActionPreference = "Stop"

# Configuration
$REPO_URL = "https://github.com/ViewWay/hermes-by-everythings.git"
$VERSION = "3.2.0"
$INSTALL_DIR = "$env:USERPROFILE\.claude\skills"
$TEMP_DIR = "$env:TEMP\hbe-install"

# Functions
function Print-Banner {
    Write-Host @"

╔════════════════════════════════════════════════════════════╗
║     Hermes-by-Everything (HBE) Installation Script         ║
║                 Version 3.2.0                              ║
║     10 Agent + 13 Skill + 15 Command + 8 Rules             ║
║     Ralph + Orchestrator 编排系统                           ║
╚════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Dependencies {
    Write-Info "Checking dependencies..."

    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "git is not installed. Please install git first."
        exit 1
    }

    if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
        Write-Warning "Claude Code CLI is not found in PATH"
    }

    Write-Success "Dependencies check passed"
}

function Show-InstallMenu {
    Write-Host ""
    Write-Host "Select installation method:"
    Write-Host "  1) skillhub (Recommended - if skillhub is installed)"
    Write-Host "  2) git clone (Standard method)"
    Write-Host "  3) manual (Already downloaded, just link)"
    Write-Host "  4) symlink (Development mode)"
    Write-Host ""

    $choice = Read-Host "Enter choice [1-4]"

    switch ($choice) {
        "1" { $global:INSTALL_METHOD = "skillhub" }
        "2" { $global:INSTALL_METHOD = "git" }
        "3" { $global:INSTALL_METHOD = "manual" }
        "4" { $global:INSTALL_METHOD = "symlink" }
        default {
            Write-Error "Invalid choice"
            exit 1
        }
    }

    Write-Info "Selected method: $global:INSTALL_METHOD"
}

function Install-ViaSkillhub {
    Write-Info "Installing via skillhub..."

    if (-not (Get-Command skillhub -ErrorAction SilentlyContinue)) {
        Write-Error "skillhub is not installed"
        Write-Info "Install skillhub first: npm install -g @anthropics/skillhub"
        exit 1
    }

    skillhub install hermes-by-everythings
    Write-Success "Installed via skillhub"
}

function Install-ViaGit {
    Write-Info "Installing via git clone..."

    if (Test-Path $TEMP_DIR) {
        Remove-Item -Path $TEMP_DIR -Recurse -Force
    }
    New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null

    Write-Info "Cloning from $REPO_URL..."
    git clone $REPO_URL $TEMP_DIR

    New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null

    $targetPath = "$INSTALL_DIR\hermes-by-everythings"
    Write-Info "Installing to $targetPath..."

    if (Test-Path $targetPath) {
        Write-Warning "Existing installation found, backing up..."
        $backupPath = "$targetPath.backup.$(Get-Date -Format 'yyyyMMddHHmmss')"
        Move-Item -Path $targetPath -Destination $backupPath
    }

    Move-Item -Path $TEMP_DIR -Destination $targetPath

    if (Test-Path $TEMP_DIR) {
        Remove-Item -Path $TEMP_DIR -Recurse -Force
    }

    Write-Success "Installation via git complete"
}

function Install-ViaManual {
    Write-Info "Manual installation (symlink)..."

    $sourcePath = Read-Host "Enter path to hermes-by-everythings"

    if (-not (Test-Path $sourcePath)) {
        Write-Error "Directory not found: $sourcePath"
        exit 1
    }

    New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
    $targetPath = "$INSTALL_DIR\hermes-by-everythings"

    if (Test-Path $targetPath) {
        Write-Warning "Removing existing symlink..."
        Remove-Item -Path $targetPath -Force
    }

    New-Item -ItemType SymbolicLink -Path $targetPath -Target $sourcePath
    Write-Success "Symlink created: $targetPath -> $sourcePath"
}

function Test-Installation {
    Write-Info "Verifying installation..."

    $installPath = "$INSTALL_DIR\hermes-by-everythings"

    if (-not (Test-Path $installPath)) {
        Write-Error "Installation directory not found: $installPath"
        exit 1
    }

    $requiredFiles = @(
        "SKILL-INDEX.md",
        "CLAUDE.md",
        "README.md",
        "skills\agents\orchestrator.md",
        "skills\agents\planner.md"
    )

    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        $fullPath = Join-Path $installPath $file
        if (-not (Test-Path $fullPath)) {
            $missingFiles += $file
        }
    }

    if ($missingFiles.Count -gt 0) {
        Write-Error "Missing required files:"
        foreach ($file in $missingFiles) {
            Write-Error "  - $file"
        }
        exit 1
    }

    $agentCount = (Get-ChildItem -Path "$installPath\skills\agents" -Filter "*.md" -File | Measure-Object).Count
    Write-Success "Found $agentCount agents"

    Write-Success "Installation verification passed"
}

function Show-PostInstall {
    Write-Host ""
    Write-Success "Hermes-by-Everything installed successfully!"
    Write-Host ""
    Write-Host "Quick Start:"
    Write-Host "  1. Restart Claude Code"
    Write-Host "  2. Verify installation: /hbe:verify --system"
    Write-Host "  3. Try a command: /hbe:plan 'Add user login feature'"
    Write-Host ""
    Write-Host "Documentation:"
    Write-Host "  - Quick Start: docs\guides\quick-start.md"
    Write-Host "  - Full Index: docs\INDEX.md"
    Write-Host ""
    Write-Host "For help: https://github.com/ViewWay/hermes-by-everythings"
    Write-Host ""
}

function Main {
    Print-Banner
    Test-Dependencies
    Show-InstallMenu

    switch ($global:INSTALL_METHOD) {
        "skillhub" { Install-ViaSkillhub }
        "git" { Install-ViaGit }
        "manual" { Install-ViaManual }
        "symlink" {
            Write-Info "Development mode - creating symlink from current directory..."
            $currentPath = Get-Location
            New-Item -ItemType Directory -Path $INSTALL_DIR -Force | Out-Null
            $targetPath = "$INSTALL_DIR\hermes-by-everythings"
            if (Test-Path $targetPath) { Remove-Item -Path $targetPath -Force }
            New-Item -ItemType SymbolicLink -Path $targetPath -Target $currentPath
        }
    }

    Test-Installation
    Show-PostInstall
}

Main
