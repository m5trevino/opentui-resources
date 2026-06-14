#!/usr/bin/env bash
#
# release.sh - Semantic versioning release automation
# Handles version bumps, tagging, and GitHub releases
#
# Usage:
#   ./release.sh [major|minor|patch]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${BLUE}[RELEASE]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }

# Read current version
CURRENT_VERSION=$(cat VERSION)
log "Current version: $CURRENT_VERSION"

# Parse version parts
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Determine bump type
BUMP_TYPE="${1:-patch}"

case "$BUMP_TYPE" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
  *)
    error "Invalid bump type: $BUMP_TYPE (use: major, minor, patch)"
    exit 1
    ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
log "New version: $NEW_VERSION"

# Confirm
read -p "Release v${NEW_VERSION}? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  error "Release cancelled"
  exit 1
fi

# Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
  warn "Uncommitted changes detected"
  git status --short
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "Release cancelled"
    exit 1
  fi
fi

# Update VERSION file
echo "$NEW_VERSION" > VERSION
log "Updated VERSION file"

# Update SKILL.md version
if [[ -f SKILL.md ]]; then
  sed -i.bak "s/^version: .*/version: $NEW_VERSION/" SKILL.md
  rm -f SKILL.md.bak
  log "Updated SKILL.md"
fi

# Update .install-manifest.json
if [[ -f .install-manifest.json ]]; then
  if command -v jq &>/dev/null; then
    jq --arg ver "$NEW_VERSION" '.version = $ver' .install-manifest.json > .install-manifest.json.tmp
    mv .install-manifest.json.tmp .install-manifest.json
    log "Updated .install-manifest.json"
  else
    warn "jq not found - .install-manifest.json not updated"
  fi
fi

# Update script versions
for script in bin/*.sh; do
  if [[ -f "$script" ]]; then
    sed -i.bak "s/^VERSION=.*/VERSION=\"$NEW_VERSION\"/" "$script"
    rm -f "${script}.bak"
  fi
done
log "Updated script versions"

# Git operations
git add VERSION SKILL.md .install-manifest.json bin/*.sh
git commit -m "chore(release): bump version to v${NEW_VERSION}"
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

success "Version bumped to v${NEW_VERSION}"
log "Tagged commit with v${NEW_VERSION}"

# Push to remote
read -p "Push to origin? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  git push origin main
  git push origin "v${NEW_VERSION}"
  success "Pushed to origin"

  # Create GitHub release (if gh CLI is available)
  if command -v gh &>/dev/null; then
    log "Creating GitHub release..."
    gh release create "v${NEW_VERSION}" \
      --title "v${NEW_VERSION}" \
      --notes "Release v${NEW_VERSION}" \
      --latest

    success "GitHub release created"
  else
    warn "gh CLI not found - create GitHub release manually"
    log "Visit: https://github.com/AIntelligentTech/opentui-screenshot-verify/releases/new"
  fi
fi

success "Release complete: v${NEW_VERSION}"
