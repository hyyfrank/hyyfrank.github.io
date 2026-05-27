#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
THEME_DIR="$ROOT_DIR/themes/PaperMod"

if [[ -d "$THEME_DIR/.git" ]]; then
  echo "PaperMod already installed at themes/PaperMod"
  exit 0
fi

mkdir -p "$ROOT_DIR/themes"
git clone --depth 1 https://github.com/adityatelange/hugo-theme-PaperMod.git "$THEME_DIR"
echo "PaperMod installed. Run: hugo server -D"
