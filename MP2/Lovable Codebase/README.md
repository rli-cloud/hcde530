# Brain Bank

A floating rotary widget pinned to every page in your browser for saving design inspiration into color-coded folders.

Brain Bank ships as both a **Chrome extension** (Manifest V3) and a **web preview app** built with TanStack Start.

## What it does

Brain Bank has three surfaces:

1. **The dial** — a 56 px circular "central node" that lives in the corner of every page. Hover to fan out folder icons; click the center node to expand the full menu (folders + dashboard + new-folder buttons). The widget is draggable and smoothly translates to the center of the page on expand.
2. **The windowed folder view** — a Pinterest-style masonry modal showing all items saved in a folder, with toolbar actions to trigger your OS screenshot tool or upload images / videos.
3. **The dashboard** — a full-page view of every folder as a card grid, with create, rename, recolor, and delete. Folder cards link to a full-page bento view.

Items are saved as screenshots or screen recordings, tagged, annotated, and stored locally (extension uses `chrome.storage.local`; web preview uses `localStorage`). No backend, no sign-up, no telemetry.

## Tech stack

- **React 19** + **TypeScript** (strict)
- **TanStack Start** (file-based routing under `src/routes/`)
- **Tailwind CSS v4** + **shadcn/ui** components
- **Vite 7** build tooling
- **Bun** as the package manager and extension bundler
- **Chrome Extension Manifest V3** (Shadow DOM content script)

## Prerequisites

- [Bun](https://bun.sh/) ≥ 1.0
- A Chromium-based browser (Chrome, Edge, Brave, Arc, Opera) to load the extension

## Run the web app

```bash
bun install
bun dev
```

Then open the printed local URL (typically `http://localhost:3000`). The landing page (`/`) has the extension installer; `/preview` renders the live widget for development.

Other scripts:

| Command | What it does |
| --- | --- |
| `bun dev` | Start the Vite dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview the production build |
| `bun run lint` | Run ESLint |
| `bun run format` | Run Prettier across the repo |

## Build and install the Chrome extension

1. Build the extension bundle:

   ```bash
   bash scripts/build-extension.sh
   ```

   This bundles `extension/src/content.tsx` and `extension/src/background.ts`, compiles Tailwind, copies the manifest and icons into `extension/dist/`, and zips the result to `public/brain-bank-extension.zip`.

2. Load it in your browser:
   - Open `chrome://extensions`
   - Enable **Developer mode** (top-right)
   - Click **Load unpacked**
   - Select the `extension/dist/` folder

Brain Bank now appears pinned to every page you open. You can also download the prebuilt `.zip` directly from the running web app's home page.

## Project structure

```
.
├── extension/              # Chrome extension source (manifest, content script, background)
│   ├── manifest.json
│   └── src/
├── scripts/
│   └── build-extension.sh  # Bundles + zips the extension
├── src/
│   ├── components/         # WidgetDemo, Dashboard, ItemDetailPanel, ExtensionRoot
│   ├── lib/                # Storage layer, hooks, utilities
│   ├── routes/             # TanStack Start file-based routes
│   └── styles.css          # Tailwind v4 + design tokens
├── docs/
│   └── widget-spec.md      # Full widget specification
└── public/                 # Static assets (including the built extension zip)
```

## Extension permissions

Declared in `extension/manifest.json`:

- `storage` — persist folders and items via `chrome.storage.local`
- `activeTab` — read the current tab's title/URL when saving an item
- Content script matches `<all_urls>` and runs at `document_idle`

## Notes

- The widget renders inside a Shadow DOM so host-page CSS can't bleed in.
- All data is stored locally on the user's machine — there is no remote backend.
- See `docs/widget-spec.md` for the full design and interaction spec.
