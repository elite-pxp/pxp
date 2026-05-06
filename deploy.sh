#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/elite-pxp/pxp.git"
BRANCH="main"

cd "$(dirname "$0")"

if [ ! -d .git ]; then
  git init
  git checkout -b "$BRANCH"
  git remote add origin "$REPO_URL"
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "$BRANCH")"
if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
  git checkout "$BRANCH" || git checkout -b "$BRANCH"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  git remote add origin "$REPO_URL"
fi

git add .

if git diff --cached --quiet; then
  echo "No changes to deploy."
  exit 0
fi

MSG="update site $(date +%Y-%m-%d_%H-%M-%S)"
git commit -m "$MSG"
git push -u origin "$BRANCH"

echo "Deploy pushed. Wait 1-2 minutes, then open:"
echo "https://tuesdaylive.poweredxprayers.com/?t=$(date +%s)"
