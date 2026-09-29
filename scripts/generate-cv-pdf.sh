#!/usr/bin/env bash
# Regenerates public/Fernando-Gomez-Graciani-CV.pdf from the /cv page's print styles.
# Usage: yarn build && yarn start -p 3456 & ./scripts/generate-cv-pdf.sh [http://localhost:3456]
set -euo pipefail
BASE_URL="${1:-http://localhost:3456}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/Fernando-Gomez-Graciani-CV.pdf"

"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=5000 --print-to-pdf="$OUT" "$BASE_URL/cv" 2>/dev/null
echo "Wrote $OUT"
