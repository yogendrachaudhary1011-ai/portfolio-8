# Preservation instructions for Google AI Studio / coding agents

This repository is an exported, published Framer website mirror, **not original editable source**. Its design, animations, layout and interactions must stay unchanged unless the owner gives explicit permission.

## Non-negotiable requirements

1. **DO NOT** rewrite any existing `*.html` page, inline CSS, Framer runtime/animation/interaction JavaScript, or data attributes. Preserve all original bytes. **DO NOT** regenerate the website from screenshots or translate it to React, Tailwind, or another framework as a routine setup step.
2. **DO NOT** delete, rename, optimize, compress, recompress or replace `framerusercontent.com/images/**` files.
3. **DO NOT** remove Framer `.mjs` CDN imports, externally loaded web fonts, videos, or scripts. These are essential to fidelity, although their availability cannot be guaranteed offline.
4. Leave the original `README.md`, internal href routes, responsive breakpoints, transitions, scroll effects and links exactly as delivered.
5. The new Node.js server (`server.mjs`) only serves existing files, and intentionally does not change their markup. Only change server/build scripts if a runtime compatibility issue requires it.
6. Before and after any necessary changes, run `npm run verify`, `npm test`, and `npm run build`. The `SOURCE_SHA256.json` manifest represents the uploaded source, not generated code.
7. Do not invent or re-enable disabled contact/social/resume links. The uploaded project intentionally has placeholder links.

## Run

- `npm run dev` — binds to `0.0.0.0:$PORT` (defaults to 3000)
- `npm run verify` — checks all original file SHA-256 hashes
- `npm test` — smoke-tests page routes and byte-for-byte responses
- `npm run build` — produces `dist/` with unchanged static pages/assets

## Critical limitation

This is a published Framer mirror. The Framer module bundles, fonts, and videos are loaded from Framer's external CDN, not bundled here. Do not claim a full source conversion or offline/zero-dependency animation reproduction.
