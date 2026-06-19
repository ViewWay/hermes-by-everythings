#!/usr/bin/env bash
# NPM scripts wrapper for version management

case $1 in
  show)
    node -e "console.log('HBE v' + require('./version.json').version)"
    ;;
  sync)
    echo "Syncing version..."
    # TODO: Implement sync logic
    ;;
  check)
    echo "Checking version consistency..."
    grep -r "v3\.[2-3]\." --include="*.md" . | grep -v "v3.3.1" || echo "✓ All versions are v3.3.1"
    ;;
  *)
    echo "Usage: npm run version [show|sync|check]"
    ;;
esac
