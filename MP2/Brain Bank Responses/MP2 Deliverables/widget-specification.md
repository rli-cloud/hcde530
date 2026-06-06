# Brain Bank — Widget Engineering Specification

## Ruofu Li || HCDE 537 || Spring 2026

This document describes the widget as shipped in `public/unzipped-brain-bank-extension/brain-bank-extension/`. The source project lives in `MP2/Brain Bank/` and compiles through `scripts/build-extension.sh` into a loadable Chrome extension (~485 KB zipped).

#### 1. Deployment architecture

Brain Bank is a **Chrome Extension (Manifest V3)** that injects a React widget onto every page. There is no backend, sign-up, or telemetry. All data stays in the browser.

| Layer | Implementation |
| ----- | -------------- |
| Extension shell | MV3 service worker (`background.js`) + content script (`content.js`) |
| UI runtime | React 19 bundle (minified into `content.js`, ~256 KB) |
| Style isolation | Open Shadow DOM host (`#brain-bank-extension-host`) with self-hosted Tailwind CSS (`content.css`, ~85 KB) |
| Typography | Geist Sans (400–700), bundled as four `.woff2` files under `fonts/` |
| Persistence | `chrome.storage.local` in the extension; mirrored to in-memory cache for synchronous reads |
| Cross-tab sync | `chrome.storage.onChanged` listener re-emits to React subscribers |

**Manifest permissions:** `storage`, `activeTab`; `host_permissions: <all_urls>`. The content script runs at `document_idle` on all URLs. Stylesheets and fonts are exposed via `web_accessible_resources` so the Shadow DOM can load them through `chrome.runtime.getURL()`.

#### 2. Shipped package structure

```
brain-bank-extension/
├── manifest.json          # MV3 manifest (v0.1.0)
├── background.js          # Service worker — toolbar icon → dashboard message
├── content.js             # React app bundle (ExtensionRoot + all widget UI)
├── content.css            # Tailwind v4 + design tokens + Shadow DOM fixes
├── icons/icon128.png
└── fonts/                 # geist-latin-{400,500,600,700}-normal.woff2
```

Clicking the toolbar icon sends `{ type: "BRAIN_BANK_OPEN_DASHBOARD" }` to the active tab's content script, which opens the windowed dashboard overlay.

#### 3. UI surfaces

The widget exposes four interaction surfaces inside the extension:

1. **Rotary dial** — A 56 px central node pinned to the viewport (default: top-right, 24 px inset). Hover fans the first three folder icons along a 90 px arc (angles 90°, 135°, 180°). Click toggles an expanded state revealing up to six folders plus two action buttons (Open dashboard at 0°, Add folder at 45°). The dial is draggable via pointer events on the central node (4 px movement threshold before drag supersedes click).

2. **Windowed folder view** — A fixed overlay (`max-w-3xl`, masonry grid via CSS multi-columns) showing all items in one folder. Header includes an upload toolbar and close button. Clicking an item opens the detail panel. Backdrop click dismisses.

3. **Windowed dashboard** — Fullscreen overlay rendered when the dashboard action fires or the toolbar icon is clicked. Folder cards in a responsive grid with create, rename, recolor, and delete. Selecting a folder opens its bento view in-place.

4. **Item detail panel** — Fixed right-side drawer (`max-w-md`) for editing source URL, notes, and tags; deleting the item. Edits write through to storage immediately on each keystroke.

On expand, `ExtensionRoot` animates the dial wrapper to the viewport center over 300 ms (`cubic-bezier(0.25, 1, 0.5, 1)`). On collapse it returns to the user's dragged position or the default anchor. Wrapper z-index is `2147483646`.

#### 4. Interaction contract

| Control | Behavior |
| ------- | -------- |
| Central node click | Toggles `expanded` state (does not navigate) |
| Central node drag | Repositions widget; suppresses click at end of drag |
| Folder fan icon | Opens windowed folder view in-place via `openFolderId` state |
| Dashboard button (0°) | Sets `dashboardOpen = true`, hides dial, renders `<Dashboard windowed />` |
| Add folder button (45°) | Opens inline create-folder modal (name input + 8-color swatch row) |
| Add (upload) | Hidden `<input type="file" multiple accept="image/*,video/*">`; reads files as data URLs |
| Folder card (dashboard) | Opens folder bento inside the dashboard overlay |

Fan-out animation uses `transition-all duration-500 ease-out` with 60 ms stagger per slot. Expand reveal order: folders `[3, 4, 5, 0, 1, 2]`, then dashboard, then add-folder. Collapse is the exact reverse.

An invisible 140×140 px hover bridge sits in the bottom-left quadrant so the cursor can reach fanned folder icons without losing hover.

#### 5. Data model

```ts
interface Folder {
  id: string;          // uid()
  name: string;
  color: FolderColor;  // rose | amber | emerald | sky | violet | fuchsia | slate | orange
  createdAt: string;   // ISO
}

interface SavedItem {
  id: string;
  folderId: string;
  type: "screenshot" | "recording";
  imageUrl: string;     // thumbnail; empty for recordings without poster
  videoUrl?: string;
  sourceUrl: string;    // auto-filled from active tab on upload
  sourceTitle: string;
  notes: string;
  tags: string[];
  width: number;        // intrinsic px — drives masonry aspect-ratio
  height: number;
  createdAt: string;
}
```

**Storage keys:** `inspo.folders.v1`, `inspo.items.v1`.

**Seed data:** On first load, five folders (Landing Pages, Typography, Dashboards, Color & Gradients, Micro-interactions) and twelve demo items (round-robin assignment; every fifth item is a recording).

**CRUD surface:** `getFolders`, `getItems`, `subscribe`, `createFolder`, `updateFolder`, `deleteFolder` (cascades items), `updateItem`, `deleteItem`. React hooks `useFolders()` and `useItems()` wrap these via `useSyncExternalStore` with module-level caches that return stable references between mutations.

#### 6. Upload pipeline

When the user clicks Add in a folder toolbar:

1. File picker accepts images and videos.
2. Each file is read as a data URL via `FileReader`.
3. Dimensions are measured (`Image.naturalWidth/Height` or `video.videoWidth/Height`; fallback 600×400).
4. A `SavedItem` is created with `sourceUrl`/`sourceTitle` pulled from the active tab via `activeTab` permission.
5. New items prepend to the list (newest first) and persist to `chrome.storage.local`.

#### 7. Build pipeline

```bash
bun build extension/src/content.tsx  → content.js   (browser target, minified)
bun build extension/src/background.ts  → background.js
bunx @tailwindcss/cli                  → content.css  (from extension/src/content.css)
cp manifest.json + icons + fonts       → extension/dist/
zip                                    → public/brain-bank-extension.zip
```

The web preview at `/preview` mounts the same `ExtensionRoot` component through an identical Shadow DOM shell, but reads/writes `localStorage` instead of `chrome.storage.local`.

#### 8. Known limitations

- **Storage quota:** Uploaded media is stored as data URLs in `chrome.storage.local`. Large uploads can hit the ~5 MB browser quota (`QuotaExceededError`). A production version would upload bytes to object storage and persist only URLs.
- **No native capture:** The extension cannot trigger the OS screenshot UI. Users capture externally, then upload via Add.
- **Recording thumbnails:** Video items have an empty `imageUrl` unless a poster is generated server-side; bento cards for recordings rely on the `<video>` element directly.
- **Shadow DOM styling:** Host-page CSS cannot bleed in, but Tailwind utility specificity required explicit `:host` border and hover overrides in `content.css` to match the web preview.
