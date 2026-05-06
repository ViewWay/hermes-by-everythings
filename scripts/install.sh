#!/usr/bin/env bash
#
# HBE Installation Script v3.3.0
#
# Installs Hermes-by-Everything's globally for Claude Code.
# Handles: Skill, Commands, Rules, Hooks, Scripts.
#
# Usage:
#   bash scripts/install.sh          # Full install
#   bash scripts/install.sh --link   # Symlink mode (for development)
#   bash scripts/install.sh --uninstall
#   bash scripts/install.sh --verify
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

HBE_VERSION="3.3.0"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLAUDE_DIR="$HOME/.claude"
HBE_HOME="$HOME/.hbe"

MODE="install"
if [[ "$1" == "--link" ]]; then MODE="link"; fi
if [[ "$1" == "--uninstall" ]]; then MODE="uninstall"; fi
if [[ "$1" == "--verify" ]]; then MODE="verify"; fi
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    echo "HBE v${HBE_VERSION} Installer"
    echo ""
    echo "Usage: bash scripts/install.sh [option]"
    echo ""
    echo "Options:"
    echo "  (none)      Full install (copy files)"
    echo "  --link      Symlink mode (development)"
    echo "  --uninstall Remove HBE from ~/.claude/ and ~/.hbe/"
    echo "  --verify    Check installation integrity"
    echo "  --help      Show this help"
    exit 0
fi

count_files() {
    find "$1" -maxdepth 1 -type f -name "$2" 2>/dev/null | wc -l | tr -d ' '
}

###############################################################################
# UNINSTALL
###############################################################################
do_uninstall() {
    echo -e "${YELLOW}Uninstalling HBE...${NC}"

    if [ -L "$CLAUDE_DIR/skills/hermes-by-everythings" ]; then
        rm "$CLAUDE_DIR/skills/hermes-by-everythings"
        echo -e "  ${GREEN}✓${NC} Removed skill symlink"
    elif [ -d "$CLAUDE_DIR/skills/hermes-by-everythings" ]; then
        rm -rf "$CLAUDE_DIR/skills/hermes-by-everythings"
        echo -e "  ${GREEN}✓${NC} Removed skill directory"
    fi

    local cmd_count=0
    for f in "$CLAUDE_DIR/commands/hbe-"*.md; do
        [ -f "$f" ] && rm "$f" && ((cmd_count++)) || true
    done
    [ -f "$CLAUDE_DIR/commands/validate.sh" ] && rm "$CLAUDE_DIR/commands/validate.sh"
    echo -e "  ${GREEN}✓${NC} Removed ${cmd_count} command files"

    for f in "$CLAUDE_DIR/rules/hermes-by-everythings-guardrails.md" "$CLAUDE_DIR/rules/everything-claude-code-guardrails.md"; do
        [ -f "$f" ] && rm "$f" && echo -e "  ${GREEN}✓${NC} Removed $(basename "$f")"
    done

    if [ -d "$HBE_HOME" ]; then
        rm -rf "$HBE_HOME"
        echo -e "  ${GREEN}✓${NC} Removed ~/.hbe/"
    fi

    if [ -f "$CLAUDE_DIR/settings.hbe.json" ]; then
        rm "$CLAUDE_DIR/settings.hbe.json"
        echo -e "  ${GREEN}✓${NC} Removed settings.hbe.json"
    fi

    echo ""
    echo -e "${GREEN}HBE uninstalled.${NC}"
    echo -e "${YELLOW}Note: If you merged settings.hbe.json into settings.json,${NC}"
    echo -e "${YELLOW}      remove those hook entries manually.${NC}"
}

###############################################################################
# VERIFY
###############################################################################
do_verify() {
    local errors=0

    echo -e "${CYAN}Verifying HBE installation...${NC}"
    echo ""

    if [ -d "$CLAUDE_DIR/skills/hermes-by-everythings" ] || [ -L "$CLAUDE_DIR/skills/hermes-by-everythings" ]; then
        local skill_files=$(find "$CLAUDE_DIR/skills/hermes-by-everythings" -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
        echo -e "  ${GREEN}✓${NC} Skill installed (${skill_files} .md files)"
    else
        echo -e "  ${RED}✗${NC} Skill NOT found at ~/.claude/skills/hermes-by-everythings"
        ((errors++))
    fi

    local cmd_count=$(count_files "$CLAUDE_DIR/commands" "hbe-*.md")
    if [ "$cmd_count" -ge 18 ]; then
        echo -e "  ${GREEN}✓${NC} Commands installed (${cmd_count}/18)"
    else
        echo -e "  ${RED}✗${NC} Commands incomplete (${cmd_count}/18)"
        ((errors++))
    fi

    local rule_count=0
    [ -f "$CLAUDE_DIR/rules/hermes-by-everythings-guardrails.md" ] && ((rule_count++)) || true
    [ -f "$CLAUDE_DIR/rules/everything-claude-code-guardrails.md" ] && ((rule_count++)) || true
    if [ "$rule_count" -ge 2 ]; then
        echo -e "  ${GREEN}✓${NC} Rules installed (${rule_count}/2)"
    else
        echo -e "  ${RED}✗${NC} Rules incomplete (${rule_count}/2)"
        ((errors++))
    fi

    if [ -d "$HBE_HOME/scripts/hooks" ]; then
        local hook_count=$(find "$HBE_HOME/scripts/hooks" -maxdepth 1 -type f -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
        echo -e "  ${GREEN}✓${NC} Hook scripts installed (${hook_count} .js files at ~/.hbe/scripts/hooks/)"
    else
        echo -e "  ${YELLOW}⚠${NC} Hook scripts NOT found at ~/.hbe/scripts/hooks/ (hooks disabled)"
    fi

    if [ -f "$CLAUDE_DIR/settings.hbe.json" ]; then
        echo -e "  ${GREEN}✓${NC} Settings template at ~/.claude/settings.hbe.json"
        echo -e "  ${YELLOW}  Ensure hooks are merged into your active settings.json${NC}"
    else
        echo -e "  ${YELLOW}⚠${NC} No settings.hbe.json found"
    fi

    echo ""
    if [ "$errors" -eq 0 ]; then
        echo -e "${GREEN}All checks passed.${NC}"
    else
        echo -e "${RED}${errors} error(s) found. Run: bash scripts/install.sh${NC}"
    fi
    return $errors
}

###############################################################################
# INSTALL
###############################################################################
do_install() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║   Hermes-by-Everything's v${HBE_VERSION} Installer                  ║"
    echo "║   Multi-platform Coding Enhancement Suite                 ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    if [ ! -d "$CLAUDE_DIR" ]; then
        echo -e "${RED}Error: ~/.claude/ not found. Install Claude Code first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Claude Code detected: $CLAUDE_DIR"

    if [ ! -d "$PROJECT_ROOT/.claude/skills/hermes-by-everythings" ]; then
        echo -e "${RED}Error: HBE skill not found at $PROJECT_ROOT/.claude/skills/hermes-by-everythings${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} HBE source: $PROJECT_ROOT"

    # Backup existing install
    BACKUP_DIR="$HOME/.hbe-backup-$(date +%Y%m%d-%H%M%S)"
    local needs_backup=false
    [ -d "$CLAUDE_DIR/skills/hermes-by-everythings" ] && needs_backup=true
    [ -f "$CLAUDE_DIR/commands/hbe-plan.md" ] && needs_backup=true

    if $needs_backup; then
        mkdir -p "$BACKUP_DIR"
        [ -d "$CLAUDE_DIR/skills/hermes-by-everythings" ] && cp -r "$CLAUDE_DIR/skills/hermes-by-everythings" "$BACKUP_DIR/skill" 2>/dev/null || true
        mkdir -p "$BACKUP_DIR/commands"
        for f in "$CLAUDE_DIR/commands/hbe-"*.md; do
            [ -f "$f" ] && cp "$f" "$BACKUP_DIR/commands/" 2>/dev/null || true
        done
        echo -e "${YELLOW}⚠${NC} Existing install backed up to: $BACKUP_DIR"
    fi

    # --- 1. Install Skill ---
    echo ""
    echo -e "${BLUE}[1/5] Installing Skill...${NC}"
    mkdir -p "$CLAUDE_DIR/skills"

    if [ "$MODE" == "link" ]; then
        [ -L "$CLAUDE_DIR/skills/hermes-by-everythings" ] && rm "$CLAUDE_DIR/skills/hermes-by-everythings"
        [ -d "$CLAUDE_DIR/skills/hermes-by-everythings" ] && rm -rf "$CLAUDE_DIR/skills/hermes-by-everythings"
        ln -s "$PROJECT_ROOT" "$CLAUDE_DIR/skills/hermes-by-everythings"
        echo -e "  ${GREEN}✓${NC} Symlinked: $PROJECT_ROOT → ~/.claude/skills/hermes-by-everythings"
    else
        # Safety: only rm -rf if it looks like an HBE skill install
        if [ -d "$CLAUDE_DIR/skills/hermes-by-everythings" ]; then
            if [ -f "$CLAUDE_DIR/skills/hermes-by-everythings/SKILL.md" ] || [ -f "$CLAUDE_DIR/skills/hermes-by-everythings/skills/INDEX.md" ]; then
                rm -rf "$CLAUDE_DIR/skills/hermes-by-everythings"
            else
                echo -e "  ${YELLOW}⚠${NC} Skipping removal: existing dir doesn't look like HBE (no SKILL.md)"
            fi
        fi
        cp -r "$PROJECT_ROOT/.claude/skills/hermes-by-everythings" "$CLAUDE_DIR/skills/hermes-by-everythings"
        echo -e "  ${GREEN}✓${NC} Copied skill to ~/.claude/skills/hermes-by-everythings/"
    fi

    # --- 2. Install Commands ---
    echo ""
    echo -e "${BLUE}[2/5] Installing Commands (18 slash commands)...${NC}"
    mkdir -p "$CLAUDE_DIR/commands"

    local cmd_count=0
    for src in "$PROJECT_ROOT/.claude/commands/hbe-"*.md; do
        [ -f "$src" ] || continue
        local name=$(basename "$src")
        if [ "$MODE" == "link" ]; then
            ln -sf "$src" "$CLAUDE_DIR/commands/$name"
        else
            cp "$src" "$CLAUDE_DIR/commands/$name"
        fi
        ((cmd_count++))
    done

    if [ -f "$PROJECT_ROOT/.claude/commands/validate.sh" ]; then
        if [ "$MODE" == "link" ]; then
            ln -sf "$PROJECT_ROOT/.claude/commands/validate.sh" "$CLAUDE_DIR/commands/validate.sh"
        else
            cp "$PROJECT_ROOT/.claude/commands/validate.sh" "$CLAUDE_DIR/commands/validate.sh"
            chmod +x "$CLAUDE_DIR/commands/validate.sh"
        fi
    fi

    echo -e "  ${GREEN}✓${NC} Installed ${cmd_count} commands to ~/.claude/commands/"

    # --- 3. Install Rules ---
    echo ""
    echo -e "${BLUE}[3/5] Installing Rules (guardrails)...${NC}"
    mkdir -p "$CLAUDE_DIR/rules"

    for src in "$PROJECT_ROOT/.claude/rules/"*.md; do
        [ -f "$src" ] || continue
        local name=$(basename "$src")
        if [ "$MODE" == "link" ]; then
            ln -sf "$src" "$CLAUDE_DIR/rules/$name"
        else
            cp "$src" "$CLAUDE_DIR/rules/$name"
        fi
        echo -e "  ${GREEN}✓${NC} $name"
    done

    # --- 4. Install Hook Scripts ---
    echo ""
    echo -e "${BLUE}[4/5] Installing Hook Scripts...${NC}"
    mkdir -p "$HBE_HOME/scripts/hooks"

    if [ -d "$PROJECT_ROOT/scripts/hooks" ]; then
        if [ "$MODE" == "link" ]; then
            rm -rf "$HBE_HOME/scripts/hooks"
            ln -s "$PROJECT_ROOT/scripts/hooks" "$HBE_HOME/scripts/hooks"
            echo -e "  ${GREEN}✓${NC} Symlinked hooks to ~/.hbe/scripts/hooks/"
        else
            cp -r "$PROJECT_ROOT/scripts/hooks/"* "$HBE_HOME/scripts/hooks/"
            chmod +x "$HBE_HOME/scripts/hooks/"*.sh 2>/dev/null || true
            if [ -d "$PROJECT_ROOT/scripts/lib" ]; then
                mkdir -p "$HBE_HOME/scripts/lib"
                cp -r "$PROJECT_ROOT/scripts/lib/"* "$HBE_HOME/scripts/lib/" 2>/dev/null || true
            fi
            echo -e "  ${GREEN}✓${NC} Copied hooks to ~/.hbe/scripts/hooks/"
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} No scripts/hooks/ found, skipping"
    fi

    # --- 5. Generate Settings ---
    echo ""
    echo -e "${BLUE}[5/5] Generating Settings...${NC}"

    local HOOKS_DIR="$HBE_HOME/scripts/hooks"

    cat > "$CLAUDE_DIR/settings.hbe.json" <<HBESETTINGS
{
  "permissions": {
    "allow": [
      "Bash(node \"$HOOKS_DIR\"/*)",
      "Read(*)"
    ]
  },
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOOKS_DIR/session-start.js\""
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOOKS_DIR/session-end.js\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$HOOKS_DIR/file-type-detect.sh\" 2>/dev/null || true"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOOKS_DIR/post-tool.js\" 2>/dev/null || true"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node \"$HOOKS_DIR/pre-bash-dispatcher.js\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
HBESETTINGS

    echo -e "  ${GREEN}✓${NC} Generated ~/.claude/settings.hbe.json"

    # --- Summary ---
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗"
    echo "║                   Installation Complete!                          ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}What was installed:${NC}"
    echo -e "  Skill      ~/.claude/skills/hermes-by-everythings/"
    echo -e "  Commands   ~/.claude/commands/hbe-*.md (${cmd_count} files)"
    echo -e "  Rules      ~/.claude/rules/*-guardrails.md"
    echo -e "  Hooks      ~/.hbe/scripts/hooks/"
    echo -e "  Settings   ~/.claude/settings.hbe.json"
    echo ""
    echo -e "${YELLOW}Important: Merge settings.hbe.json into your settings.json${NC}"
    echo ""
    echo -e "  No existing settings.json:"
    echo -e "    ${GREEN}cp ~/.claude/settings.hbe.json ~/.claude/settings.json${NC}"
    echo ""
    echo -e "  Already have one? Merge hooks section:"
    echo -e "    ${GREEN}jq -s '.[0] * .[1]' ~/.claude/settings.json ~/.claude/settings.hbe.json > /tmp/hbe-merged.json${NC}"
    echo -e "    ${GREEN}mv /tmp/hbe-merged.json ~/.claude/settings.json${NC}"
    echo ""
    echo -e "${CYAN}Verify:${NC}  bash scripts/install.sh --verify"
    echo -e "${CYAN}Start:${NC}    Restart Claude Code, then ${GREEN}/hbe-review${NC}"
    echo ""
    [ -n "$BACKUP_DIR" ] && echo -e "${YELLOW}Backup: $BACKUP_DIR${NC}"
}

###############################################################################
# MAIN
###############################################################################

case "$MODE" in
    install|link) do_install ;;
    uninstall) do_uninstall ;;
    verify) do_verify ;;
esac
