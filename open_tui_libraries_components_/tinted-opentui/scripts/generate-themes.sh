#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ -n "${TINTED_SCHEMES_DIR:-}" ]]; then
  schemes_dir="$TINTED_SCHEMES_DIR"
elif [[ -d "$HOME/.local/share/tinted-theming/tinty/repos/schemes/base16" ]]; then
  schemes_dir="$HOME/.local/share/tinted-theming/tinty/repos/schemes"
else
  schemes_dir=""
fi

if [[ -n "$schemes_dir" ]]; then
  tinted-builder-rust build --schemes-dir "$schemes_dir" "$repo_root"
else
  tinted-builder-rust build "$repo_root"
fi
