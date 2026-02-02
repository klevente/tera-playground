#!/bin/bash
# Run all CI checks locally
# Mirrors the checks in .github/workflows/ci.yml

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "=== Checking Rust formatting ==="
(cd wasm && cargo fmt --check)

echo "=== Running Clippy ==="
(cd wasm && cargo clippy --all-targets -- -D warnings)

echo "=== Checking JS/TS formatting ==="
npm run format:check

echo "=== Running ESLint ==="
npm run lint

echo "=== Building WASM ==="
npm run wasm:build

echo "=== Running Svelte check ==="
npm run check

echo "=== All checks passed ==="
