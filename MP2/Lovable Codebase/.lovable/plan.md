## Goals

Fix the four discrepancies between the Lovable preview and the locally-installed extension, and rebrand from Inspo to Brain Bank.

## 1. Rebrand Inspo → Brain Bank

Update every user-visible "Inspo" string and the packaging:

- `extension/manifest.json` — `name`, `description`, `action.default_title`.
- `extension/src/content.tsx` — `HOST_ID` → `brain-bank-extension-host`.
- `src/routes/index.tsx` — header brand, h1, meta/OG title + description, button label, install-step copy.
- `src/routes/preview.tsx` — meta title/description and on-page copy.
- `src/components/Dashboard.tsx` — brand label in header (line 84).
- `src/components/WidgetDemo.tsx` — any remaining Inspo strings.
- `README.md` and `docs/widget-spec.md` — rename throughout.
- `scripts/build-extension.sh` — output `public/brain-bank-extension.zip`; update the fetch path and download filename in `src/routes/index.tsx` to match. Delete the old `public/inspo-extension.zip`.

## 2. Switch all fonts to Geist

- Add `<link>` tags for Geist (and Geist Mono) in `src/routes/__root.tsx` `head()` so the marketing site, `/dashboard`, and `/preview` load it.
- `src/styles.css` `body { font-family: "Geist", system-ui, sans-serif }`.
- `extension/src/shadow-base.css` `:host { font-family: "Geist", system-ui, sans-serif }`.
- Because the Shadow DOM can't reach the host page's `<link>`, add `@import url("https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap");` at the top of `extension/src/content.css` so the bundled CSS pulls Geist itself.

## 3. Restore borders inside the extension

Tailwind v4 makes bare `border` resolve to `currentColor`. The `@layer base { * { border-color: var(--color-border) } }` rule in `src/styles.css` does not reliably win inside the Shadow DOM, so cards, inputs, and dashed sections render with invisible/white borders in the extension.

Add a shadow-scoped baseline to `extension/src/shadow-base.css`:

```css
:host *, :host *::before, :host *::after {
  border-color: var(--color-border, var(--border));
  border-style: solid;
  border-width: 0;
}
```

Utilities like `border` and `border-border` still set their own widths; this just gives them a visible default color and style.

## 4. Folder recolor on /dashboard

`FolderCardItem` in `src/components/Dashboard.tsx` exposes rename + delete but no color edit. Add a small color-dot button next to the trash icon that toggles an inline `ColorSwatches` popover anchored inside the card. Selecting a color calls `updateFolder(folder.id, { color })` and closes the popover. Click-outside closes it. No Radix — plain conditional render, same shadow-DOM-safe pattern as the existing "New folder" modal. `ColorSwatches` already exists and is reused as-is.

## 5. Rebuild + verify

- Run `bash scripts/build-extension.sh` to produce the renamed zip.
- On `/` and `/preview`: confirm Geist and Brain Bank branding.
- Locally load `extension/dist/` in `chrome://extensions`: confirm visible borders on cards/inputs, working folder recolor on `/dashboard`, and Geist rendering everywhere in the widget.

## Out of scope

No data-model changes (folder color enum unchanged), no backend, no new npm dependencies.
