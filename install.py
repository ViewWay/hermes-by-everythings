#!/usr/bin/env python3
"""
Hermes-by-Everything (HBE) Installation Script
Version: 3.3.1
Cross-platform installation support
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path
from datetime import datetime

# Configuration
REPO_URL = "https://github.com/ViewWay/hermes-by-everythings.git"
VERSION = "3.3.1"
INSTALL_DIR = Path.home() / ".claude" / "skills"
TEMP_DIR = Path("/tmp") / "hbe-install"

class Colors:
    """ANSI color codes"""
    BLUE = "\033[0;34m"
    GREEN = "\033[0;32m"
    YELLOW = "\033[1;33m"
    RED = "\033[0;31m"
    NC = "\033[0m"

# Disable colors on Windows
if sys.platform == "win32":
    Colors.BLUE = ""
    Colors.GREEN = ""
    Colors.YELLOW = ""
    Colors.RED = ""
    Colors.NC = ""

def print_banner():
    """Print installation banner"""
    banner = f"""
╔════════════════════════════════════════════════════════════╗
║     Hermes-by-Everything (HBE) Installation Script         ║
║                 Version {VERSION}                              ║
║     37 Agent + 33 Skill + 18 Command + 83 Rules            ║
║     Ralph + Orchestrator 编排系统                           ║
╚════════════════════════════════════════════════════════════╝
"""
    print(f"{Colors.BLUE}{banner}{Colors.NC}")

def log_info(msg):
    print(f"{Colors.BLUE}[INFO]{Colors.NC} {msg}")

def log_success(msg):
    print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {msg}")

def log_warning(msg):
    print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {msg}")

def log_error(msg):
    print(f"{Colors.RED}[ERROR]{Colors.NC} {msg}")

def detect_platform():
    """Detect current platform"""
    if sys.platform == "darwin":
        return "macos"
    elif sys.platform.startswith("linux"):
        return "linux"
    elif sys.platform == "win32":
        return "windows"
    else:
        return "unknown"

def check_dependencies():
    """Check required dependencies"""
    log_info("Checking dependencies...")
    
    if not shutil.which("git"):
        log_error("git is not installed")
        sys.exit(1)
    
    if not shutil.which("claude"):
        log_warning("Claude Code CLI not found in PATH")
    
    log_success("Dependencies OK")

def choose_install_method():
    """Let user choose installation method"""
    print("\nSelect installation method:")
    print("  1) skillhub (Recommended)")
    print("  2) git clone (Standard)")
    print("  3) manual (Symlink existing)")
    print("  4) symlink (Dev mode)")
    print("")
    
    choice = input("Enter choice [1-4]: ").strip()
    
    methods = {"1": "skillhub", "2": "git", "3": "manual", "4": "symlink"}
    
    if choice not in methods:
        log_error("Invalid choice")
        sys.exit(1)
    
    return methods[choice]

def install_via_skillhub():
    """Install using skillhub"""
    log_info("Installing via skillhub...")
    
    if not shutil.which("skillhub"):
        log_error("skillhub not found")
        log_info("Install: npm install -g @anthropics/skillhub")
        sys.exit(1)
    
    subprocess.run(["skillhub", "install", "hermes-by-everythings"], check=True)
    log_success("Installed via skillhub")

def install_via_git():
    """Install using git clone"""
    log_info("Installing via git clone...")
    
    # Cleanup temp
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    
    # Clone
    log_info(f"Cloning from {REPO_URL}...")
    subprocess.run(["git", "clone", REPO_URL, str(TEMP_DIR)], check=True)
    
    # Setup target
    INSTALL_DIR.mkdir(parents=True, exist_ok=True)
    target_path = INSTALL_DIR / "hermes-by-everythings"
    
    if target_path.exists():
        log_warning("Backing up existing installation...")
        backup_path = INSTALL_DIR / f"hermes-by-everythings.backup.{int(datetime.now().timestamp())}"
        shutil.move(str(target_path), str(backup_path))
    
    shutil.move(str(TEMP_DIR), str(target_path))
    
    # Cleanup
    if TEMP_DIR.exists():
        shutil.rmtree(TEMP_DIR)
    
    log_success("Installation complete")

def install_via_manual():
    """Install via manual path"""
    log_info("Manual installation...")
    
    source_path = input("Enter path to hermes-by-everythings: ").strip()
    
    if not Path(source_path).exists():
        log_error(f"Path not found: {source_path}")
        sys.exit(1)
    
    INSTALL_DIR.mkdir(parents=True, exist_ok=True)
    target_path = INSTALL_DIR / "hermes-by-everythings"
    
    if target_path.exists():
        if target_path.is_symlink():
            target_path.unlink()
        else:
            shutil.rmtree(target_path)
    
    target_path.symlink_to(source_path)
    log_success(f"Symlink created: {target_path} -> {source_path}")

def install_via_symlink():
    """Install via symlink (dev mode)"""
    log_info("Dev mode installation...")
    
    current_path = Path.cwd()
    INSTALL_DIR.mkdir(parents=True, exist_ok=True)
    target_path = INSTALL_DIR / "hermes-by-everythings"
    
    if target_path.exists():
        if target_path.is_symlink():
            target_path.unlink()
        else:
            shutil.rmtree(target_path)
    
    target_path.symlink_to(current_path)
    log_success(f"Symlink created: {target_path} -> {current_path}")

def verify_installation():
    """Verify installation"""
    log_info("Verifying installation...")
    
    install_path = INSTALL_DIR / "hermes-by-everythings"
    
    if not install_path.exists():
        log_error(f"Installation not found: {install_path}")
        sys.exit(1)
    
    required_files = [
        "SKILL-INDEX.md",
        "CLAUDE.md",
        "README.md",
        "skills/agents/orchestrator.md"
    ]
    
    for f in required_files:
        if not (install_path / f).exists():
            log_error(f"Missing: {f}")
            sys.exit(1)
    
    agents_dir = install_path / "skills" / "agents"
    if agents_dir.exists():
        agent_count = len(list(agents_dir.glob("*.md")))
        log_success(f"Found {agent_count} agents")
    
    log_success("Installation verified")

def show_post_install():
    """Show post-install info"""
    print("\n" + "=" * 60)
    log_success("Hermes-by-Everything installed successfully!")
    print("\nQuick Start:")
    print("  1. Restart Claude Code")
    print("  2. Verify: /hbe:verify --system")
    print("  3. Try: /hbe:plan 'Add user login'")
    print("\nDocumentation:")
    print("  - docs/guides/quick-start.md")
    print("  - docs/INDEX.md")
    print("")

def main():
    """Main installation flow"""
    print_banner()
    
    log_info(f"Platform: {detect_platform()}")
    check_dependencies()
    
    method = choose_install_method()
    log_info(f"Method: {method}")
    
    if method == "skillhub":
        install_via_skillhub()
    elif method == "git":
        install_via_git()
    elif method == "manual":
        install_via_manual()
    elif method == "symlink":
        install_via_symlink()
    
    verify_installation()
    show_post_install()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        log_warning("\nInstallation cancelled")
        sys.exit(1)
    except Exception as e:
        log_error(f"Installation failed: {e}")
        sys.exit(1)
