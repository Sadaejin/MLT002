#!/usr/bin/env bash
set -euo pipefail

MSG="${1:-chore: update MLT001 polyglot build}"

echo "[1/3] Validating JSON & running Python analytics..."
python3 analytics.py > /dev/null

echo "[2/3] Staging all multi-language files..."
git add .

echo "[3/3] Committing and pushing to GitHub..."
git commit -m "$MSG" || echo "Nothing new to commit."
git push -u origin main

echo "Done. GitHub Actions & Pages will update shortly."