# ChalkTalk — App UX Rules (hard constraints for all coders)

## Native App Feel — No Page Scroll

This is an iPad app, not a website. These rules apply to every page and must never be broken.

### Global CSS (globals.css)
html, body { height: 100%; overflow: hidden; }

### Fixed-screen pages (home, lists, nav screens)
Every top-level page uses: height: 100dvh; overflow: hidden; display: flex; flex-direction: column;

Pages that must NEVER scroll:
- / (home screen)
- /documents (install sheets list)
- /plays (play library list)
- Any nav or modal screen

### Where scrolling IS allowed
- Inside a play list container (list scrolls, not the page)
- Inside a document list container
- Inside an assignment table with many rows
- Inside the canvas drawing area (pan/zoom)

### Fitting content to viewport
If content doesn't fit: reduce padding/gap, NOT add scroll.
Home screen must fit on iPad landscape (1024x768), iPad portrait (768x1024), iPhone (390x844).

## SCA Branding
- Colors: #CC0000 (red), #003087 (navy), white ONLY
- No emojis in rendered UI — SVG icons or text only
- SCA logo (/sca-logo.png) on home screen and document headers
- Isaiah 6:8 in print footers

## General
- iPad-first, touch-friendly (min 44px tap targets)
- Landscape canvas for play drawing
- Print via browser CSS (@media print) — no Puppeteer
