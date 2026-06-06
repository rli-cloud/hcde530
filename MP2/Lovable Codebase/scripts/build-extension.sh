#!/usr/bin/env bash
# Build the Brain Bank Chrome extension and package it as public/brain-bank-extension.zip.
# Run with: bash scripts/build-extension.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EXT_SRC="$ROOT/extension"
EXT_OUT="$ROOT/extension/dist"
PUBLIC_DIR="$ROOT/public"
ZIP_PATH="$PUBLIC_DIR/brain-bank-extension.zip"

echo "→ Cleaning $EXT_OUT"
rm -rf "$EXT_OUT"
mkdir -p "$EXT_OUT/icons"

echo "→ Building content + background scripts with bun"
cd "$ROOT"
bun build "$EXT_SRC/src/content.tsx" \
  --outfile "$EXT_OUT/content.js" \
  --target browser \
  --minify \
  --define process.env.NODE_ENV='"production"'

bun build "$EXT_SRC/src/background.ts" \
  --outfile "$EXT_OUT/background.js" \
  --target browser \
  --minify \
  --define process.env.NODE_ENV='"production"'

echo "→ Building Tailwind CSS"
bunx @tailwindcss/cli \
  -i "$EXT_SRC/src/content.css" \
  -o "$EXT_OUT/content.css" \
  --minify

echo "→ Copying manifest and icons"
cp "$EXT_SRC/manifest.json" "$EXT_OUT/manifest.json"
cp "$EXT_SRC/icons/"*.png "$EXT_OUT/icons/" 2>/dev/null || true

echo "→ Zipping to $ZIP_PATH"
mkdir -p "$PUBLIC_DIR"
rm -f "$ZIP_PATH"
STAGE="$(mktemp -d)"
cp -r "$EXT_OUT" "$STAGE/brain-bank-extension"
cd "$STAGE"
nix run nixpkgs#zip -- -r "$ZIP_PATH" brain-bank-extension >/dev/null
rm -rf "$STAGE"

echo "✓ Built $(du -h "$ZIP_PATH" | cut -f1) at $ZIP_PATH"
