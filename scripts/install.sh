#!/usr/bin/env bash
#
# HBE Installation Script v3.3.0
#
# Symlinks HBE into ~/.claude/ so ALL projects can use HBE commands,
# even projects without their own .claude/ directory.
#
# Usage:
#   bash scripts/install.sh                # Symlink to ~/.claude/ (recommended)
#   bash scripts/install.sh --project .     # Also symlink into current project
#   bash scripts/install.sh --uninstall
#   bash scripts/install.sh --verify
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

HBE_VERSION="3.3.0"
HBE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HBE_CLAUDE="$HBE_ROOT/.claude"
USER_CLAUDE="$HOME/.claude"
HBE_HOME="$HOME/.hbe"

MODE="install"
TARGET=""

while [[ $# -gt 0 ]]; do
    case "$1" in
        --project) TARGET="$(cd "$2" && pwd)"; shift 2 ;;
        --uninstall) MODE="uninstall"; shift ;;
        --verify) MODE="verify"; shift ;;
        --help|-h)
            echo "HBE v${HBE_VERSION} Installer (Symlink Mode)"
            echo ""
            echo "All commands, rules, and hooks are SYMLINKED from the HBE repo."
            echo "Update HBE repo once -> all projects reflect changes."
            echo ""
            echo "Usage:"
            echo "  bash scripts/install.sh                    Symlink to ~/.claude/ (global)"
            echo "  bash scripts/install.sh --project <path>   Also symlink into a project"
            echo "  bash scripts/install.sh --uninstall         Remove all HBE symlinks"
            echo "  bash scripts/install.sh --verify            Check installation"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

###############################################################################
# UNINSTALL
###############################################################################
do_uninstall() {
    echo -e "${YELLOW}Uninstalling HBE symlinks...${NC}"

    if [ -L "$USER_CLAUDE/skills/hermes-by-everythings" ]; then
        rm "$USER_CLAUDE/skills/hermes-by-everythings"
        echo -e "  ${GREEN}✓${NC} Removed skill symlink"
    elif [ -d "$USER_CLAUDE/skills/hermes-by-everythings" ]; then
        rm -rf "$USER_CLAUDE/skills/hermes-by-everythings"
        echo -e "  ${GREEN}✓${NC} Removed skill directory"
    fi

    local count=0
    for f in "$USER_CLAUDE/commands/hbe-"*.md; do
        [ -L "$f" ] && rm "$f" && ((count++))
        [ -f "$f" ] && ! [ -L "$f" ] && rm "$f" && ((count++))
    done
    [ -L "$USER_CLAUDE/commands/validate.sh" ] && rm "$USER_CLAUDE/commands/validate.sh"
    [ "$count" -gt 0 ] && echo -e "  ${GREEN}✓${NC} Removed ${count} commands"

    for f in "$USER_CLAUDE/rules/hermes-by-everythings-guardrails.md" "$USER_CLAUDE/rules/everything-claude-code-guardrails.md"; do
        [ -L "$f" ] && rm "$f" && echo -e "  ${GREEN}✓${NC} Removed $(basename "$f")"
        [ -f "$f" ] && ! [ -L "$f" ] && rm "$f" && echo -e "  ${GREEN}✓${NC} Removed $(basename "$f")"
    done

    [ -L "$HBE_HOME/scripts/hooks" ] && rm "$HBE_HOME/scripts/hooks" && echo -e "  ${GREEN}✓${NC} Removed hooks symlink"
    [ -d "$HBE_HOME/scripts/hooks" ] && rm -rf "$HBE_HOME/scripts/hooks" && echo -e "  ${GREEN}✓${NC} Removed hooks dir"
    [ -L "$HBE_HOME/scripts/lib" ] && rm "$HBE_HOME/scripts/lib"
    [ -d "$HBE_HOME/scripts/lib" ] && rm -rf "$HBE_HOME/scripts/lib"

    [ -f "$USER_CLAUDE/settings.hbe.json" ] && rm "$USER_CLAUDE/settings.hbe.json" && \
        echo -e "  ${GREEN}✓${NC} Removed settings.hbe.json"

    echo ""
    echo -e "${GREEN}HBE uninstalled.${NC}"
    echo -e "${YELLOW}Remove HBE hook entries from ~/.claude/settings.json manually if merged.${NC}"
}

###############################################################################
# VERIFY
###############################################################################
do_verify() {
    local errors=0

    echo -e "${CYAN}Verifying HBE installation...${NC}"
    echo ""

    if [ -L "$USER_CLAUDE/skills/hermes-by-everythings" ]; then
        echo -e "  ${GREEN}✓${NC} Skill: symlink -> $(readlink "$USER_CLAUDE/skills/hermes-by-everythings")"
    elif [ -d "$USER_CLAUDE/skills/hermes-by-everythings" ]; then
        echo -e "  ${YELLOW}⚠${NC} Skill: directory (not symlink, updates won't propagate)"
    else
        echo -e "  ${RED}✗${NC} Skill: NOT installed"
        ((errors++))
    fi

    local cmd_linked=0 cmd_total=0
    for f in "$USER_CLAUDE/commands/hbe-"*.md; do
        [ -L "$f" ] && ((cmd_linked++))
        [ -f "$f" ] && ((cmd_total++))
    done
    if [ "$cmd_total" -ge 18 ]; then
        echo -e "  ${GREEN}✓${NC} Commands: ${cmd_total}/18 (${cmd_linked} symlinked)"
    else
        echo -e "  ${RED}✗${NC} Commands: ${cmd_total}/18"
        ((errors++))
    fi

    local rule_ok=0
    for f in "$USER_CLAUDE/rules/hermes-by-everythings-guardrails.md" "$USER_CLAUDE/rules/everything-claude-code-guardrails.md"; do
        [ -f "$f" ] && ((rule_ok++))
    done
    if [ "$rule_ok" -ge 2 ]; then
        echo -e "  ${GREEN}✓${NC} Rules: ${rule_ok}/2"
    else
        echo -e "  ${RED}✗${NC} Rules: ${rule_ok}/2"
        ((errors++))
    fi

    if [ -d "$HBE_HOME/scripts/hooks" ] || [ -L "$HBE_HOME/scripts/hooks" ]; then
        local hook_count=$(find "$HBE_HOME/scripts/hooks" -maxdepth 1 -type f -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
        echo -e "  ${GREEN}✓${NC} Hooks: ${hook_count} .js files"
    else
        echo -e "  ${RED}✗${NC} Hooks: NOT found"
        ((errors++))
    fi

    if [ -f "$USER_CLAUDE/settings.json" ] && grep -q "session-start.js" "$USER_CLAUDE/settings.json" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} Settings: HBE hooks active"
    elif [ -f "$USER_CLAUDE/settings.hbe.json" ]; then
        echo -e "  ${YELLOW}⚠${NC} Settings: settings.hbe.json not yet merged"
    else
        echo -e "  ${YELLOW}⚠${NC} Settings: no HBE settings"
    fi

    echo ""
    [ "$errors" -eq 0 ] && echo -e "${GREEN}All checks passed.${NC}" || echo -e "${RED}${errors} error(s).${NC}"
    return $errors
}

###############################################################################
# INSTALL
###############################################################################
do_install() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║   Hermes-by-Everything's v${HBE_VERSION} Installer                  ║"
    echo "║   Symlink Mode — update once, all projects reflect         ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    [ ! -d "$HBE_ROOT/commands" ] && { echo -e "${RED}Error: HBE source not found at ${HBE_ROOT}${NC}"; exit 1; }
    echo -e "${GREEN}✓${NC} HBE source: ${CYAN}${HBE_ROOT}${NC}"

    # --- 1. Skill ---
    echo -e "\n${BLUE}[1/4] Skill${NC}"
    mkdir -p "$USER_CLAUDE/skills"
    [ -L "$USER_CLAUDE/skills/hermes-by-everythings" ] && rm "$USER_CLAUDE/skills/hermes-by-everythings"
    if [ -d "$USER_CLAUDE/skills/hermes-by-everythings" ]; then
        [ -f "$USER_CLAUDE/skills/hermes-by-everythings/SKILL.md" ] && rm -rf "$USER_CLAUDE/skills/hermes-by-everythings"
    fi
    ln -s "$HBE_ROOT" "$USER_CLAUDE/skills/hermes-by-everythings"
    echo -e "  ${GREEN}✓${NC} ~/.claude/skills/hermes-by-everythings -> ${HBE_ROOT}"

    # --- 2. Commands ---
    echo -e "\n${BLUE}[2/4] Commands${NC}"
    mkdir -p "$USER_CLAUDE/commands"
    local cmd_count=0
    for src in "$HBE_ROOT/commands/hbe-"*.md; do
        [ -f "$src" ] || continue
        ln -sf "$src" "$USER_CLAUDE/commands/$(basename "$src")"
        ((cmd_count++))
    done
    echo -e "  ${GREEN}✓${NC} ${cmd_count} commands symlinked"

    # --- 3. Rules ---
    echo -e "\n${BLUE}[3/4] Rules${NC}"
    mkdir -p "$USER_CLAUDE/rules"
    for src in "$HBE_ROOT/.claude/rules/"*.md; do
        [ -f "$src" ] || continue
        ln -sf "$src" "$USER_CLAUDE/rules/$(basename "$src")"
        echo -e "  ${GREEN}✓${NC} $(basename "$src")"
    done

    # --- 4. Hooks + Settings ---
    echo -e "\n${BLUE}[4/4] Hooks${NC}"
    mkdir -p "$HBE_HOME/scripts"
    [ -L "$HBE_HOME/scripts/hooks" ] && rm "$HBE_HOME/scripts/hooks"
    [ -d "$HBE_HOME/scripts/hooks" ] && rm -rf "$HBE_HOME/scripts/hooks"
    [ -L "$HBE_HOME/scripts/lib" ] && rm "$HBE_HOME/scripts/lib"
    [ -d "$HBE_HOME/scripts/lib" ] && rm -rf "$HBE_HOME/scripts/lib"

    ln -s "$HBE_ROOT/scripts/hooks" "$HBE_HOME/scripts/hooks"
    echo -e "  ${GREEN}✓${NC} ~/.hbe/scripts/hooks -> ${HBE_ROOT}/scripts/hooks"

    [ -d "$HBE_ROOT/scripts/lib" ] && ln -s "$HBE_ROOT/scripts/lib" "$HBE_HOME/scripts/lib"

    local HOOKS_DIR="$HBE_HOME/scripts/hooks"
    cat > "$USER_CLAUDE/settings.hbe.json" <<HBESETTINGS
{
  "permissions": {
    "allow": [
      "Bash(node \"$HOOKS_DIR\"/*)",
      "Bash(bash \"$HOOKS_DIR\"/*)",
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
    echo -e "  ${GREEN}✓${NC} ~/.claude/settings.hbe.json generated"

    # Optional: project-level symlinks
    if [ -n "$TARGET" ]; then
        echo -e "\n${BLUE}[Optional] Project symlinks -> ${TARGET}/.claude/${NC}"
        mkdir -p "$TARGET/.claude/commands" "$TARGET/.claude/rules"
        for src in "$HBE_ROOT/commands/hbe-"*.md; do
            [ -f "$src" ] || continue
            ln -sf "$src" "$TARGET/.claude/commands/$(basename "$src")"
        done
        for src in "$HBE_ROOT/.claude/rules/"*.md; do
            [ -f "$src" ] || continue
            ln -sf "$src" "$TARGET/.claude/rules/$(basename "$src")"
        done
        echo -e "  ${GREEN}✓${NC} Symlinked into ${TARGET}/.claude/"
    fi

    # Summary
    echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════╗"
    echo "║                   Installation Complete!                          ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝${NC}"
    echo -e "\n${CYAN}All symlinks -> ${HBE_ROOT}:${NC}"
    echo -e "  ~/.claude/skills/hermes-by-everythings"
    echo -e "  ~/.claude/commands/hbe-*.md (${cmd_count})"
    echo -e "  ~/.claude/rules/*-guardrails.md"
    echo -e "  ~/.hbe/scripts/hooks/"
    echo -e "  ~/.claude/settings.hbe.json"
    echo -e "\n${GREEN}Any project (even without .claude/) can now use /hbe-* commands.${NC}"
    echo -e "${GREEN}Pull updates to HBE repo -> all projects auto-reflect.${NC}"
    echo -e "\n${YELLOW}Merge settings: jq -s '.[0]*.[1]' ~/.claude/settings.json ~/.claude/settings.hbe.json > /tmp/h.json && mv /tmp/h.json ~/.claude/settings.json${NC}"
}

case "$MODE" in
    install) do_install ;;
    uninstall) do_uninstall ;;
    verify) do_verify ;;
esac
