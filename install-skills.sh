#!/usr/bin/env bash
# Install/update OpenTUI skills from the tui-ref repo into ~/.agents/skills/.
set -e

SOURCE="$HOME/.tui-ref"
TARGET="$HOME/tui-ref"
SKILLS_TARGET="$HOME/.agents/skills"

# Step 1: expose the repo at ~/tui-ref (move the hidden directory if it still exists)
if [ -d "$SOURCE" ]; then
  if [ -d "$TARGET" ]; then
    echo "Error: $TARGET already exists. Remove or rename it first."
    exit 1
  fi
  mv "$SOURCE" "$TARGET"
  echo "Moved $SOURCE -> $TARGET"
elif [ -d "$TARGET" ]; then
  echo "Using existing $TARGET"
else
  echo "Error: neither $SOURCE nor $TARGET exists."
  exit 1
fi

# Step 2: sync skills into ~/.agents/skills/
mkdir -p "$SKILLS_TARGET"
for skill in "$TARGET"/skills/*/; do
  name=$(basename "$skill")
  echo "Installing skill: $name"
  rsync -a --delete "$skill" "$SKILLS_TARGET/$name/"
done

echo ""
echo "All skills installed/updated in $SKILLS_TARGET"
echo "Main index: $TARGET/INDEX.md"
echo "Skills index: $TARGET/skills/SKILLS_INDEX.md"
