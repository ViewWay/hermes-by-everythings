#!/usr/bin/env bash
#
# HBE Installation Script v3.3.0
#
# Deploys Hermes-by-Everything's to a target project.
# Claude Code discovers commands/rules/settings from the PROJECT's .claude/ directory.
#
# Usage:
#   cd ~/github/my-project
#   bash path/to/hermes-by-everythings/scripts/install.sh
#
#   # Or specify target explicitly:
#   bash scripts/install.sh --project ~/github/my-project
#
#   bash scripts/install.sh --project . --link    # Symlink mode (development)
#   bash scripts/install.sh --project . --uninstall
#   bash scripts/install.sh --project . --verify
#   bash scripts/install.sh --global              # Legacy: install to ~/.claude/
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
HBE_COMMANDS="$HBE_CLAUDE/commands"
HBE_RULES="$HBE_CLAUDE/rules"
HBE_HOOKS="$HBE_ROOT/scripts/hooks"
HBE_SKILL="$HBE_CLAUDE/skills/hermes-by-everythings"

MODE="install"
TARGET=""
GLOBAL=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --project) TARGET="$(cd "$2" && pwd)"; shift 2 ;;
        --global)  GLOBAL=true; shift ;;
        --link)    MODE="link"; shift ;;
        --uninstall) MODE="uninstall"; shift ;;
        --verify)  MODE="verify"; shift ;;
        --help|-h)
            echo "HBE v${HBE_VERSION} Installer"
            echo ""
            echo "Deploys HBE to a target project so commands, rules, and hooks work there."
            echo ""
            echo "Usage:"
            echo "  bash scripts/install.sh --project <path>   Deploy to project"
            echo "  bash scripts/install.sh --project <path> --link   Symlink mode"
            echo "  bash scripts/install.sh --project <path> --uninstall"
            echo "  bash scripts/install.sh --project <path> --verify"
            echo "  bash scripts/install.sh --global             Deploy to ~/.claude/ (legacy)"
            echo "  bash scripts/install.sh --help"
            echo ""
            echo "Examples:"
            echo "  # From HBE repo, deploy to a project:"
            echo "  bash scripts/install.sh --project ~/github/my-project"
            echo ""
            echo "  # From inside the target project:"
            echo "  bash ~/.claude/skills/hermes-by-everythings/scripts/install.sh --project ."
            echo ""
            echo "  # Global install (all projects):"
            echo "  bash scripts/install.sh --global"
            exit 0
            ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Default: if no --project and no --global, use PWD
if [ -z "$TARGET" ] && ! $GLOBAL; then
    TARGET="$(pwd)"
fi

# Determine deployment directories
if $GLOBAL; then
    DEPLOY_DIR="$HOME/.claude"
    HOOKS_DEPLOY_DIR="$HOME/.hbe/scripts"
else
    DEPLOY_DIR="$TARGET/.claude"
    HOOKS_DEPLOY_DIR="$TARGET/scripts"
fi

DEPLOY_COMMANDS="$DEPLOY_DIR/commands"
DEPLOY_RULES="$DEPLOY_DIR/rules"
DEPLOY_SETTINGS="$DEPLOY_DIR/settings.json"
DEPLOY_HOOKS="$HOOKS_DEPLOY_DIR/hooks"

count_files() {
    find "$1" -maxdepth 1 -type f -name "$2" 2>/dev/null | wc -l | tr -d ' '
}

###############################################################################
# UNINSTALL
###############################################################################
do_uninstall() {
    echo -e "${YELLOW}Uninstalling HBE from: ${CYAN}${TARGET}${NC}"
    echo ""

    # Remove commands
    local cmd_count=0
    for f in "$DEPLOY_COMMANDS/hbe-"*.md; do
        [ -f "$f" ] && rm "$f" && ((cmd_count++)) || true
    done
    [ -f "$DEPLOY_COMMANDS/validate.sh" ] && rm "$DEPLOY_COMMANDS/validate.sh"
    [ "$cmd_count" -gt 0 ] && echo -e "  ${GREEN}✓${NC} Removed ${cmd_count} command files"

    # Remove rules
    for f in "$DEPLOY_RULES/hermes-by-everythings-guardrails.md" "$DEPLOY_RULES/everything-claude-code-guardrails.md"; do
        [ -f "$f" ] && rm "$f" && echo -e "  ${GREEN}✓${NC} Removed $(basename "$f")"
    done

    # Remove hook scripts (only if we put them there)
    if [ -f "$DEPLOY_HOOKS/session-start.js" ]; then
        for f in "$DEPLOY_HOOKS"/*.js "$DEPLOY_HOOKS"/*.sh; do
            [ -f "$f" ] && rm "$f" 2>/dev/null || true
        done
        echo -e "  ${GREEN}✓${NC} Removed hook scripts"
    fi

    # Remove settings.hbe.json if exists
    [ -f "$DEPLOY_DIR/settings.hbe.json" ] && rm "$DEPLOY_DIR/settings.hbe.json"
    echo -e "  ${GREEN}✓${NC} Removed settings.hbe.json"

    # Remove empty directories
    rmdir "$DEPLOY_COMMANDS" 2>/dev/null || true
    rmdir "$DEPLOY_RULES" 2>/dev/null || true
    rmdir "$DEPLOY_HOOKS" 2>/dev/null || true
    rmdir "$DEPLOY_DIR" 2>/dev/null || true

    echo ""
    echo -e "${GREEN}HBE uninstalled from: ${CYAN}${TARGET}${NC}"
    echo -e "${YELLOW}Note: If you merged settings.hbe.json hooks into settings.json,${NC}"
    echo -e "${YELLOW}      remove those entries manually.${NC}"
}

###############################################################################
# VERIFY
###############################################################################
do_verify() {
    local errors=0
    local scope="project: ${CYAN}${TARGET}${NC}"

    echo -e "${CYAN}Verifying HBE installation...${NC}"
    echo -e "  Scope: $scope"
    echo ""

    # Check skill (global only)
    local skill_path="$HOME/.claude/skills/hermes-by-everythings"
    if [ -d "$skill_path" ] || [ -L "$skill_path" ]; then
        echo -e "  ${GREEN}✓${NC} Skill installed at ~/.claude/skills/hermes-by-everythings"
    else
        echo -e "  ${YELLOW}⚠${NC} Skill NOT at ~/.claude/skills/ (auto-trigger disabled)"
    fi

    # Check commands in target project
    local cmd_count=$(count_files "$DEPLOY_COMMANDS" "hbe-*.md")
    if [ "$cmd_count" -ge 18 ]; then
        echo -e "  ${GREEN}✓${NC} Commands: ${cmd_count}/18 in ${DEPLOY_COMMANDS}/"
    elif [ "$cmd_count" -gt 0 ]; then
        echo -e "  ${YELLOW}⚠${NC} Commands: ${cmd_count}/18 (incomplete) in ${DEPLOY_COMMANDS}/"
        ((errors++))
    else
        echo -e "  ${RED}✗${NC} Commands: 0/18 — NOT found in ${DEPLOY_COMMANDS}/"
        ((errors++))
    fi

    # Check rules in target project
    local rule_count=0
    [ -f "$DEPLOY_RULES/hermes-by-everythings-guardrails.md" ] && ((rule_count++)) || true
    [ -f "$DEPLOY_RULES/everything-claude-code-guardrails.md" ] && ((rule_count++)) || true
    if [ "$rule_count" -ge 2 ]; then
        echo -e "  ${GREEN}✓${NC} Rules: ${rule_count}/2 in ${DEPLOY_RULES}/"
    else
        echo -e "  ${RED}✗${NC} Rules: ${rule_count}/2 — NOT found in ${DEPLOY_RULES}/"
        ((errors++))
    fi

    # Check hooks in target project
    if [ -d "$DEPLOY_HOOKS" ] && [ -f "$DEPLOY_HOOKS/session-start.js" ]; then
        local hook_count=$(find "$DEPLOY_HOOKS" -maxdepth 1 -type f -name "*.js" 2>/dev/null | wc -l | tr -d ' ')
        echo -e "  ${GREEN}✓${NC} Hooks: ${hook_count} .js files in ${DEPLOY_HOOKS}/"
    else
        echo -e "  ${YELLOW}⚠${NC} Hooks: NOT found at ${DEPLOY_HOOKS}/"
    fi

    # Check settings
    if [ -f "$DEPLOY_SETTINGS" ]; then
        if grep -q "session-start.js" "$DEPLOY_SETTINGS" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Settings: hooks registered in ${DEPLOY_SETTINGS}"
        else
            echo -e "  ${YELLOW}⚠${NC} Settings: exists but no HBE hooks found"
        fi
    elif [ -f "$DEPLOY_DIR/settings.hbe.json" ]; then
        echo -e "  ${YELLOW}⚠${NC} Settings: settings.hbe.json exists but NOT merged into settings.json"
    else
        echo -e "  ${YELLOW}⚠${NC} Settings: no HBE settings found"
    fi

    echo ""
    if [ "$errors" -eq 0 ]; then
        echo -e "${GREEN}All checks passed.${NC}"
    else
        echo -e "${RED}${errors} error(s) found. Run: bash scripts/install.sh --project ${TARGET}${NC}"
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
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    # Validate source
    if [ ! -d "$HBE_COMMANDS" ]; then
        echo -e "${RED}Error: HBE commands not found at ${HBE_COMMANDS}${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} HBE source: ${HBE_ROOT}"

    # Validate target
    if $GLOBAL; then
        echo -e "${GREEN}✓${NC} Target: ${CYAN}~/.claude/ (global)${NC}"
    else
        if [ ! -d "$TARGET" ]; then
            echo -e "${RED}Error: Target directory not found: ${TARGET}${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓${NC} Target project: ${CYAN}${TARGET}${NC}"
    fi

    # Backup
    BACKUP_DIR="$TARGET/.hbe-backup-$(date +%Y%m%d-%H%M%S)"
    local needs_backup=false
    [ -d "$DEPLOY_COMMANDS" ] && [ -f "$DEPLOY_COMMANDS/hbe-plan.md" ] && needs_backup=true

    if $needs_backup; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$DEPLOY_COMMANDS" "$BACKUP_DIR/commands" 2>/dev/null || true
        [ -d "$DEPLOY_RULES" ] && cp -r "$DEPLOY_RULES" "$BACKUP_DIR/rules" 2>/dev/null || true
        [ -f "$DEPLOY_SETTINGS" ] && cp "$DEPLOY_SETTINGS" "$BACKUP_DIR/settings.json" 2>/dev/null || true
        echo -e "${YELLOW}⚠${NC} Backup: ${BACKUP_DIR}"
    fi

    # --- 1. Install Skill (global only) ---
    echo ""
    echo -e "${BLUE}[1/4] Installing Skill...${NC}"

    local global_skill="$HOME/.claude/skills/hermes-by-everythings"
    mkdir -p "$(dirname "$global_skill")"

    if [ "$MODE" == "link" ]; then
        [ -L "$global_skill" ] && rm "$global_skill"
        [ -d "$global_skill" ] && rm -rf "$global_skill"
        ln -s "$HBE_ROOT" "$global_skill"
        echo -e "  ${GREEN}✓${NC} Symlinked → ~/.claude/skills/hermes-by-everythings"
    else
        if [ -d "$global_skill" ]; then
            [ -f "$global_skill/SKILL.md" ] && rm -rf "$global_skill" || \
                echo -e "  ${YELLOW}⚠${NC} Skipping: existing dir doesn't look like HBE"
        fi
        [ ! -d "$global_skill" ] && cp -r "$HBE_SKILL" "$global_skill"
        [ -d "$global_skill" ] && echo -e "  ${GREEN}✓${NC} Skill → ~/.claude/skills/hermes-by-everythings/"
    fi

    # --- 2. Deploy Commands to target project ---
    echo ""
    echo -e "${BLUE}[2/4] Deploying Commands to ${DEPLOY_COMMANDS}/...${NC}"
    mkdir -p "$DEPLOY_COMMANDS"

    local cmd_count=0
    for src in "$HBE_COMMANDS/hbe-"*.md; do
        [ -f "$src" ] || continue
        local name=$(basename "$src")
        if [ "$MODE" == "link" ]; then
            ln -sf "$src" "$DEPLOY_COMMANDS/$name"
        else
            cp "$src" "$DEPLOY_COMMANDS/$name"
        fi
        ((cmd_count++))
    done

    if [ -f "$HBE_COMMANDS/validate.sh" ]; then
        if [ "$MODE" == "link" ]; then
            ln -sf "$HBE_COMMANDS/validate.sh" "$DEPLOY_COMMANDS/validate.sh"
        else
            cp "$HBE_COMMANDS/validate.sh" "$DEPLOY_COMMANDS/validate.sh"
            chmod +x "$DEPLOY_COMMANDS/validate.sh"
        fi
    fi

    echo -e "  ${GREEN}✓${NC} ${cmd_count} commands → ${DEPLOY_COMMANDS}/"

    # --- 3. Deploy Rules to target project ---
    echo ""
    echo -e "${BLUE}[3/4] Deploying Rules to ${DEPLOY_RULES}/...${NC}"
    mkdir -p "$DEPLOY_RULES"

    for src in "$HBE_RULES/"*.md; do
        [ -f "$src" ] || continue
        local name=$(basename "$src")
        if [ "$MODE" == "link" ]; then
            ln -sf "$src" "$DEPLOY_RULES/$name"
        else
            cp "$src" "$DEPLOY_RULES/$name"
        fi
        echo -e "  ${GREEN}✓${NC} $name"
    done

    # --- 4. Deploy Hooks + Settings to target project ---
    echo ""
    echo -e "${BLUE}[4/4] Deploying Hooks to ${HOOKS_DEPLOY_DIR}/...${NC}"
    mkdir -p "$DEPLOY_HOOKS"

    if [ -d "$HBE_HOOKS" ]; then
        if [ "$MODE" == "link" ]; then
            rm -rf "$DEPLOY_HOOKS"
            ln -s "$HBE_HOOKS" "$DEPLOY_HOOKS"
            echo -e "  ${GREEN}✓${NC} Symlinked hooks → ${DEPLOY_HOOKS}/"
        else
            cp -r "$HBE_HOOKS/"* "$DEPLOY_HOOKS/"
            chmod +x "$DEPLOY_HOOKS/"*.sh 2>/dev/null || true
            # Copy shared libs
            if [ -d "$HBE_ROOT/scripts/lib" ]; then
                mkdir -p "$HOOKS_DEPLOY_DIR/lib"
                cp -r "$HBE_ROOT/scripts/lib/"* "$HOOKS_DEPLOY_DIR/lib/" 2>/dev/null || true
            fi
            echo -e "  ${GREEN}✓${NC} Copied hooks → ${DEPLOY_HOOKS}/"
        fi
    fi

    # Generate settings with project-relative hook paths
    echo ""
    echo -e "${BLUE}Generating Settings...${NC}"

    # Use relative paths for hooks (Claude Code runs hooks with project root as CWD)
    local HOOK_REL="scripts/hooks"

    cat > "$DEPLOY_DIR/settings.hbe.json" <<HBESETTINGS
{
  "permissions": {
    "allow": [
      "Bash(node scripts/hooks/*)",
      "Bash(bash scripts/hooks/*)",
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
            "command": "node ${HOOK_REL}/session-start.js"
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
            "command": "node ${HOOK_REL}/session-end.js"
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
            "command": "bash ${HOOK_REL}/file-type-detect.sh 2>/dev/null || true"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "node ${HOOK_REL}/post-tool.js 2>/dev/null || true"
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
            "command": "node ${HOOK_REL}/pre-bash-dispatcher.js 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
HBESETTINGS

    echo -e "  ${GREEN}✓${NC} Generated ${DEPLOY_DIR}/settings.hbe.json"

    # --- Summary ---
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗"
    echo "║                   Installation Complete!                          ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${CYAN}Deployed to: ${TARGET}${NC}"
    echo -e "  .claude/commands/hbe-*.md     (${cmd_count} slash commands)"
    echo -e "  .claude/rules/*-guardrails.md  (guardrail rules)"
    echo -e "  scripts/hooks/                 (automation hooks)"
    echo -e "  .claude/settings.hbe.json      (hook registration)"
    echo ""
    echo -e "  ~/.claude/skills/hermes-by-everythings/  (global skill for auto-trigger)"
    echo ""
    echo -e "${YELLOW}Important: Merge settings.hbe.json into your .claude/settings.json${NC}"
    echo ""
    echo -e "  No existing settings.json:"
    echo -e "    ${GREEN}cp .claude/settings.hbe.json .claude/settings.json${NC}"
    echo ""
    echo -e "  Already have one? Merge hooks section:"
    echo -e "    ${GREEN}jq -s '.[0] * .[1]' .claude/settings.json .claude/settings.hbe.json > /tmp/hbe-merged.json${NC}"
    echo -e "    ${GREEN}mv /tmp/hbe-merged.json .claude/settings.json${NC}"
    echo ""
    echo -e "${CYAN}Verify:${NC}  bash scripts/install.sh --project ${TARGET} --verify"
    echo -e "${CYAN}Start:${NC}    Restart Claude Code in ${TARGET}, then ${GREEN}/hbe-review${NC}"
    echo ""
    [ -n "$BACKUP_DIR" ] && echo -e "${YELLOW}Backup: ${BACKUP_DIR}${NC}"
}

###############################################################################
# MAIN
###############################################################################

case "$MODE" in
    install|link) do_install ;;
    uninstall) do_uninstall ;;
    verify) do_verify ;;
esac
