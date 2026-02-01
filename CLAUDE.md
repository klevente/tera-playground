# Tera Playground

A Svelte 5 web application for experimenting with Tera templates. The app loads Tera as a WASM module and provides a
live template editor.

## Tech Stack

- **Frontend:** SvelteKit + TypeScript + Tailwind CSS v4
- **WASM:** Rust with wasm-bindgen
- **Tools:** Prettier, ESLint

## Project Structure

```
tera-playground/
├── wasm/                      # Rust WASM module
│   ├── Cargo.toml
│   └── src/lib.rs             # Tera wrapper with render function
├── src/
│   ├── routes/
│   │   ├── +page.svelte       # Main playground UI
│   │   └── +layout.svelte     # Root layout & Theme selector
│   ├── lib/
│   │   ├── tera.ts            # WASM bindings & TypeScript types
│   │   └── wasm/              # Generated WASM output (gitignored)
│   ├── app.html
│   └── app.css
├── static/
├── vite.config.ts
├── svelte.config.js
├── tsconfig.json
├── eslint.config.js
├── prettier.config.js
└── package.json
```

## Development Commands

```bash
# Install dependencies
npm install

# Build WASM module (requires wasm-pack)
npm run wasm:build

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run check

# Linting
npm run lint

# Formatting
npm run format

# WASM package linting (from wasm/ directory)
cargo clippy --all-targets -- -D warnings

# WASM package formatting (from wasm/ directory)
cargo fmt
```

## Prerequisites

- Node.js 24 (check `.nvmrc`)
- Rust toolchain (check `wasm/rust-toolchain.toml`)
- wasm-pack (`cargo install wasm-pack`)

## How It Works

1. The Rust WASM module wraps Tera's `one_off()` function for single template rendering
2. The Svelte frontend loads the WASM module dynamically in `onMount()`
3. Users enter a Tera template and JSON context
4. Rendering happens automatically with 300ms debounce, or on button click
5. Errors are displayed inline with red styling
6. Users can import/export their experiments in JSON format containing both the template and context using the
   respective buttons
