# Portfolio — Interactive Framer Mirror (GitHub-ready)

This folder was prepared from the **original HTTrack website download**, NOT the earlier static cleanup. It preserves the original Framer JavaScript runtime links, inline animation data, CSS, hover/scroll effects, layout, and video tags.

**Important:** This is a downloaded/published Framer site, *not* an editable React/Vite/Next.js or Framer project. It still runs as HTML + client-side JavaScript. "Non-static" here means the client-side Framer runtime is kept, not that a backend or original source code has been recovered.

## Removed/disabled

- Previous `.git` repository / origin remote / Git history (none is included).
- HTTrack-generated index, cache, and download logs.
- Google Analytics `gtag`/Tag Manager tracking, and Framer analytics tracking loader.
- Outbound social, email, resume, case-study and site links tied to the previous owner. HTML links are inert placeholders (`#`); a small runtime guard also disables owner links injected during Framer hydration. **Internal page and section navigation is preserved.**
- Original owner email is replaced with `your.email@example.com` as a content placeholder.

## Preserved

- All original Framer page scripts except analytics scripts, including the critical `script_main` module loader, inline Framer `animator`, appearance settings, and hydration data.
- Original page CSS, font rules, video elements, and scroll/interactivity scripts.
- All 183 downloaded image files, in their expected local folder.
- The homepage and original project / case study pages.

## External runtime dependencies (cannot be eliminated from this archive)

The supplied ZIP **does not include** Framer's `.mjs` JavaScript bundles, fonts (`.woff2`), or videos (`.mp4`). To keep the real Framer animation and interactions, this version **retains the original CDN references** to `framerusercontent.com`. Those files must remain available online, and browser network access is required for full effects. Fonts are also loaded externally. The animations have **not been reimplemented**, and cannot be fully tested offline.

To create a **fully independent** dynamic source project without the Framer CDN, obtain the original editable Framer project, or the complete assets/JS bundles and their licenses. A downloaded HTML archive alone cannot supply them. Some Framer features may behave differently on a different domain due to original Framer-hosted code.

## Before publishing

1. Replace the previous portfolio author's name and case study text with your own content, and use only images/designs you are entitled to publish. The original author identity is still visible until you change it.
2. Replace social/contact/portfolio links (currently disabled) with yours. **When adding new links, remove their `aria-disabled` and `data-replace-with-your-link` attributes**. The link guard also intentionally disables external links while installed; remove/adjust it once you are ready to enable your own links.
3. To test all interactive effects, run a local server with internet access to load Framer CDN modules:
   `python -m http.server 8000`, then visit http://localhost:8000/.
4. Check console/network requests in your browser; this was a captured site, so end-to-end online hydration was not verifiable in the build environment.

## Push as a NEW independent GitHub repository

Unzip into a **new empty folder** (not the old `Portfolio` folder that already has `.git`). Open PowerShell in that folder and run:

```powershell
git init
git add .
git commit -m "Initial portfolio upload with animations preserved"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Portfolio.git
git push -u origin main
```

Use an **empty** GitHub repository (without a starter README). Replace `YOUR_USERNAME` with your real GitHub username. The ZIP contains no `.git` folder.

**GitHub Pages:** Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

Note that GitHub Pages is static **hosting**, but it can run JavaScript, Framer browser animations, and interactive client-side effects just like any other site. There is no requirement for a Node backend for these effects.
