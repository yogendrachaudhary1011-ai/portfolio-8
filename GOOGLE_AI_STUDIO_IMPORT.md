# Google AI Studio — import instructions (design-preserving)

This is a run-ready Node.js project whose original Framer HTML, CSS, JS and local images have been **preserved byte for byte**. It is not an editable Framer/React source conversion.

## Preferred: Import from GitHub (official Build import)

1. Extract this ZIP to a folder on your computer.
2. Upload the contents to a **new GitHub repository** (place `package.json`, `server.mjs`, and `index.html` at repository root; not inside a nested ZIP directory).
3. In [Google AI Studio](https://aistudio.google.com/) select **Build** → **+ Add files** → **Import from GitHub** and select that repository.
4. If asked to start the app, use `npm run dev`. The server binds to `0.0.0.0` and respects the `PORT` environment variable. No `npm install` dependencies are required.
5. If AI Studio offers to regenerate or refactor the UI, do not approve: the page has already been reproduced in its original published form.

AI Studio also has an **Upload ZIP** action in some Code-tab interfaces; when available, upload this ZIP and keep the original project files at the root. Import availability and upload size limits vary by interface. GitHub import is the documented, preferred route.

## Exact prompt to use after import

> Load and run this existing Node.js project exactly as it is. Use `npm run dev` to start the server. It is a published Framer HTML mirror, not a React source project. Do not rebuild the site, replace CSS, change layout, replace imagery, modify responsive behavior, remove Framer CDN scripts, or alter animations or click/scroll/hover interactions. Preserve every original HTML and asset file byte-for-byte. If a preview issue occurs, fix only hosting/runtime configuration. Run `npm run verify`, `npm test`, and `npm run build` before claiming success. External Framer modules, fonts and videos require access to framerusercontent.com.

## Local validation

```bash
node --version
npm run verify
npm test
npm run build
npm run dev
```

Open `http://localhost:3000/`. Case-study pages: `/perro.html`, `/mercore.html`, `/perro-deepdive.html`.

## Why there's no React rewrite

Only published Framer HTML and browser runtime references were present in the uploaded ZIP. Recovering the original source React components/Framer project is not possible from the archive alone. Converting the visible page into new React components would risk changes to DOM layout, responsiveness, state handling and animation timing and violate the fidelity requirement.

## Known original limitations (not introduced by this conversion)

- Framer CDN supplies `.mjs` runtime packages, `.woff2` fonts and `.mp4` video. They aren't included in the source ZIP. A browser must have network access for full fidelity.
- The uploaded mirror already disables previous owner's links and preserves the original author's content. Those behaviors remain unchanged here.
- This package has been validated locally. **Google AI Studio cloud import/runtime behavior has not been tested directly**; cloud/network restrictions may affect externally loaded dependencies.
