#!/usr/bin/env bash
set -euo pipefail

# Deploy Hugo site to GitHub Pages gh-pages branch only.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET_BRANCH="gh-pages"
REMOTE_NAME="${REMOTE_NAME:-origin}"
CONFIG_FILES="${CONFIG_FILES:-config.toml,config.production.toml}"
COMMIT_MSG="${COMMIT_MSG:-deploy: update site}"

echo "==> Building site with Hugo"
hugo --environment production --config "$CONFIG_FILES"

if [[ ! -d public ]]; then
  echo "public/ not found after build"
  exit 1
fi

echo "==> Preparing publish commit for branch: $TARGET_BRANCH"
pushd public >/dev/null
git init -q
git add -A
git commit -q -m "$COMMIT_MSG" || echo "No content change, reusing current tree"
git branch -M "$TARGET_BRANCH"
git remote remove "$REMOTE_NAME" >/dev/null 2>&1 || true
git remote add "$REMOTE_NAME" "$(git -C "$ROOT_DIR" remote get-url "$REMOTE_NAME")"

echo "==> Pushing to $REMOTE_NAME/$TARGET_BRANCH"
git push -f "$REMOTE_NAME" "$TARGET_BRANCH"
popd >/dev/null

echo "Done. Verify Pages source branch in GitHub settings."
