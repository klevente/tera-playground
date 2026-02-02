#!/bin/bash
# Format changed files based on their location
# Called by Claude Code hooks after Edit/Write operations

FILE_PATH="$CLAUDE_FILE_PATH"

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Get the directory of this script and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT" || exit 1

# Check if the file is in the wasm directory (Rust code)
if [[ "$FILE_PATH" == *"/wasm/"* ]] || [[ "$FILE_PATH" == *"\\wasm\\"* ]]; then
    # Format Rust code
    cd wasm && cargo fmt 2>/dev/null
else
    # Format frontend code with Prettier
    npm run format 2>/dev/null
fi
