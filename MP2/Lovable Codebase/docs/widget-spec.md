# Brain Bank Widget — Handoff Specification

This document is the complete spec for the **Brain Bank interactive widget** and its
two backing routes (`/dashboard` and `/folder/$id`). It is intended for a
backend-focused agent who will wire the widget to a real database / storage
layer without changing its visual or interaction design.

Scope: the widget surface only. Marketing copy, hero sections, and any other
landing-page chrome are explicitly **out of scope**.

---

## 1. Overview

Brain Bank is a rotary-dial widget that lets a user save screenshots and screen
recordings into colored folders. It has four surfaces:

1. **The dial** — a 56 px circular "central node" that, on hover, fans the
   first 3 folder icons in an arc into its bottom-left quadrant. **Clicking
   the central node toggles the fully expanded state**, revealing up to 6
   folders plus two action buttons (Open dashboard, New folder). Clicking
   the node again collapses back to the resting state.
2. **The draggable wrapper** (extension only) — `<ExtensionRoot>` anchors
   the dial in the top-right corner of every page and lets the user drag it
   anywhere via pointer events on the central node. When the user expands
   the dial, the whole widget smoothly translates to the center of the
   viewport; collapsing returns it to its previous (or default) position.
3. **The windowed folder view** — a Pinterest-style masonry modal showing all
   items in one folder, with a toolbar to trigger the OS screenshot tool or
   upload images / videos. Clicking an item slides in a right-hand
   **Item Detail Panel** for editing source URL, notes, and tags.
4. **The dashboard** — the dashboard fan-button opens the dashboard. In the
   web preview at `/dashboard` it is a full route; inside the Chrome
   extension `<ExtensionRoot>` renders `<Dashboard windowed />` as a
   fullscreen overlay instead. Folder cards open `/folder/$id` (preview) or
   an in-place folder view (extension).

The widget mounts in two contexts: inside the web preview at `/preview`
(rendered through `<ExtensionRoot>` so dragging works there too), and as a
Shadow-DOM-isolated injection from `extension/src/content.tsx` on every URL.

---

## 2. Routes & navigation contract

| Route          | Component file                       | Purpose |
| -------------- | ------------------------------------ | ------- |
| `/`            | `src/routes/index.tsx`               | Extension installer landing page |
| `/preview`     | `src/routes/preview.tsx`             | Renders `<ExtensionRoot />` for dev |
| `/dashboard`   | `src/routes/dashboard.tsx`           | All folders, CRUD (web only) |
| `/folder/$id`  | `src/routes/folder.$id.tsx`          | Full-page bento for one folder |

Navigation rules — must be preserved:

- **Center node** → toggles local `expanded` state on `<WidgetDemo>`. It
  does NOT navigate anywhere and is NOT a `<Link>`. It is a `<button>` with
  `aria-label` `"Open Brain Bank dashboard"` when collapsed and
  `"Collapse menu"` when expanded (the dragger keys off these labels).
- **Dashboard action button** (fan slot at 0°) → calls `onOpenDashboard()`.
  Inside `<ExtensionRoot>` this flips state to render `<Dashboard windowed
  onClose={…}>` over the page; on the web preview that callback navigates
  to `/dashboard`.
- **New folder action button** (fan slot at 45°) → opens an inline
  create-folder modal owned by `<WidgetDemo>` (same flow as the dashboard's
  New folder dialog).
- **Fanned folder icon** → opens the modal bento view in-place via local
  state (`openFolderId`). It must NOT navigate to `/folder/$id`.
- **Dashboard folder card** → `<Link to="/folder/$id">` (whole card is a
  link via an absolutely-positioned overlay).
- **"Back to home"** / **"All folders"** links live on `/dashboard` and
  `/folder/$id` respectively.

Routing stack is TanStack Router (file-based). Route IDs match filenames
exactly — see `src/routes/README.md`.

---

## 3. Data model

Mirror of `src/lib/storage.ts`. A backend agent should keep these TypeScript
shapes identical so widget components require no changes.

### 3.1 Types

```ts
export type FolderColor =
  | "rose" | "amber" | "emerald" | "sky"
  | "violet" | "fuchsia" | "slate" | "orange";

export const FOLDER_COLORS: FolderColor[] = [
  "rose", "amber", "emerald", "sky",
  "violet", "fuchsia", "slate", "orange",
];

export interface Folder {
  id: string;          // uid()
  name: string;
  color: FolderColor;
  createdAt: string;   // ISO
}

export interface SavedItem {
  id: string;
  folderId: string;
  type: "screenshot" | "recording";
  imageUrl: string;     // thumbnail / poster; empty string when type === "recording" and no poster
  videoUrl?: string;    // present for recordings
  sourceUrl: string;
  sourceTitle: string;
  notes: string;
  tags: string[];
  width: number;        // intrinsic pixel size, drives masonry aspect-ratio
  height: number;
  createdAt: string;    // ISO
}
```

### 3.2 Seed dataset

On first load the storage layer seeds 5 folders and 12 items so the dial,
modal, and dashboard are never empty.

Folders (in this order, with this id → name → color mapping):

| id | name                 | color    |
| -- | -------------------- | -------- |
| f1 | Landing Pages        | violet   |
| f2 | Typography           | amber    |
| f3 | Dashboards           | sky      |
| f4 | Color & Gradients    | fuchsia  |
| f5 | Micro-interactions   | emerald  |

Items: 12 entries assigned round-robin across folders (`folders[i % 5]`).
Every 5th item (`i % 5 === 0`) is a `recording`, rest are `screenshots`.
Image URLs use picsum seeds: `https://picsum.photos/seed/inspo-${i+1}/${w}/${h}`.
Sizes table (used in order):

```
[600,400] [400,600] [500,500] [600,350]
[400,500] [500,700] [600,600] [450,300]
[500,400] [400,550] [600,450] [500,600]
```

Per-item: `sourceUrl = https://example-${i+1}.com`,
`sourceTitle = "Reference site ${i+1}"`,
`notes` set on every 3rd item to "Love the typography hierarchy here.",
`tags` alternates `["minimal","editorial"]` / `["bold"]`,
`createdAt = now - i*86400000` ms (so newest first).

### 3.3 Persistence (current local-only impl)

- `localStorage` keys: `inspo.folders.v1`, `inspo.items.v1`. The Chrome
  extension additionally mirrors both keys into `chrome.storage.local` so
  data survives across tabs and reloads of the content script.
- `hydrateFromChromeStorage()` is called once from `<ExtensionRoot>` on
  mount; it pulls the latest values from `chrome.storage.local`, writes
  them into `localStorage`, and emits so subscribers re-read.
- Module-level caches: `foldersCache: Folder[] | null`, `itemsCache: SavedItem[] | null`.
  **This is load-bearing.** `useSyncExternalStore` requires snapshot getters
  to return a stable reference between updates. `JSON.parse` on every call
  returned new arrays and caused infinite re-renders. Backend swap MUST
  preserve the stable-snapshot contract (TanStack Query handles this
  naturally).
- Pub/sub: `subscribe(cb) => unsubscribe`; mutators call `emit()` after
  invalidating the cache.

### 3.4 CRUD surface (functions exported from `storage.ts`)

```ts
// Reads (snapshot-stable)
getFolders(): Folder[]
getItems(): SavedItem[]
subscribe(cb: () => void): () => void

// Writes (must invalidate cache + emit)
saveFolders(folders: Folder[]): void
saveItems(items: SavedItem[]): void
createFolder(name: string, color: FolderColor): Folder
updateFolder(id: string, patch: Partial<Folder>): void
deleteFolder(id: string): void        // cascade: also deletes items where folderId === id
updateItem(id: string, patch: Partial<SavedItem>): void
deleteItem(id: string): void
```

Hooks (`src/lib/use-storage.ts`):

```ts
useFolders(): Folder[]   // useSyncExternalStore wrapper around getFolders
useItems(): SavedItem[]  // useSyncExternalStore wrapper around getItems
```

### 3.5 `folderTint` lookup

Every UI tint comes from this table — reproduce verbatim. Keys are
`FolderColor`, values are Tailwind classes:

```ts
export const folderTint: Record<FolderColor,
  { bg: string; text: string; ring: string; dot: string }> = {
  rose:    { bg: "bg-rose-100",    text: "text-rose-700",    ring: "ring-rose-200",    dot: "bg-rose-500"   },
  amber:   { bg: "bg-amber-100",   text: "text-amber-800",   ring: "ring-amber-200",   dot: "bg-amber-500"  },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-200", dot: "bg-emerald-500"},
  sky:     { bg: "bg-sky-100",     text: "text-sky-800",     ring: "ring-sky-200",     dot: "bg-sky-500"    },
  violet:  { bg: "bg-violet-100",  text: "text-violet-800",  ring: "ring-violet-200",  dot: "bg-violet-500" },
  fuchsia: { bg: "bg-fuchsia-100", text: "text-fuchsia-800", ring: "ring-fuchsia-200", dot: "bg-fuchsia-500"},
  slate:   { bg: "bg-slate-200",   text: "text-slate-800",   ring: "ring-slate-300",   dot: "bg-slate-500"  },
  orange:  { bg: "bg-orange-100",  text: "text-orange-800",  ring: "ring-orange-200",  dot: "bg-orange-500" },
};
```

---

## 4. The dial (`WidgetDemo`)

File: `src/components/WidgetDemo.tsx`.

### 4.1 Container

`<WidgetDemo>` accepts `embedded` (default `true`) — when `true` it wraps
itself in a 320×320 dashed frame for documentation/demo use; the extension
passes `embedded={false}` so the dial floats free inside
`<ExtensionRoot>`'s draggable wrapper.

```
<div class="relative">                          (or relative h-[320px] w-[320px] when embedded)
  <div class="group relative"
       onMouseEnter onMouseLeave>
    …6 fanned folder buttons…
    …2 fanned action buttons…
    <button class="center node" onClick={toggleExpanded} />
  </div>
</div>
```

`<WidgetDemo>` also calls `onExpandedChange?.(next)` whenever the expanded
state flips, so `<ExtensionRoot>` can recenter the wrapper.

### 4.2 Center node

- 56 px circle (`h-14 w-14`), `bg-foreground text-background`, `shadow-lg`.
- Inner 12 px dot (`h-3 w-3 rounded-full bg-background`).
- `<button>` (NOT a `<Link>`); `aria-label` toggles between
  `"Open Brain Bank dashboard"` (collapsed) and `"Collapse menu"` (expanded).
- `relative z-10` so it sits above fanned icons.
- Hover: `hover:scale-105` via `transition-transform`.
- Click handler simply flips `expanded`; the dashboard is opened from the
  dashboard action button described in §4.4.

### 4.3 Fan-out slots (folders + action buttons)

Two pools of slots fan out from the central node along fixed angles. All
slots sit on a 90 px radius from the center.

| Pool                 | Indices       | Angles (°)             | Notes |
| -------------------- | ------------- | ---------------------- | ----- |
| Folders (hover)      | 0, 1, 2       | 90, 135, 180           | Shown when `hovered && !expanded` |
| Folders (extra)      | 3, 4, 5       | 225, 270, 315          | Shown only when `expanded` |
| Action: Dashboard    | button slot 0 | 0                      | Shown only when `expanded` |
| Action: New folder   | button slot 1 | 45                     | Shown only when `expanded` |

Constants in the component:

```ts
const MAX_FAN = 6;
const HOVER_PREVIEW = 3;
const HOVER_ANGLES = [90, 135, 180];
const EXTRA_ANGLES = [225, 270, 315];   // each +45° from 225°
const buttonSlotAngles = [0, 45];        // dashboard, then new folder
const distance = 90;                      // px from center for every slot
```

Position math per slot:

```ts
const rad = (angle * Math.PI) / 180;
const x = Math.cos(rad) * distance;
const y = Math.sin(rad) * distance;
```

Each slot is a 48 px circle positioned with `absolute left-1/2 top-1/2 -ml-6 -mt-6`,
then translated via inline `transform: translate(${x}px, ${y}px)`. Folder
slots use `folderTint[f.color]`; the dashboard button uses
`bg-foreground text-background`, and the new-folder button uses
`bg-background text-foreground ring-border`.

### 4.4 Fan-out animation

The fan transitions all six folder slots plus the two action buttons with
`transition-all duration-500 ease-out` and a per-slot
`transitionDelay`. The reveal order on **expand** is clockwise starting at
folder index 3 (i.e. folder slots in order `[3, 4, 5, 0, 1, 2]` followed by
the dashboard then new-folder buttons). The reveal order on **collapse**
is the exact reverse, so the new-folder button retracts first and the
top-of-quadrant folder retracts last.

Closed state: `opacity-0` + `transform: translate(0,0) scale(0.6)`.
Open state: `opacity-100` + `transform: translate(${x}px, ${y}px)`.

There is no `<style>` block or `--tx`/`--ty` CSS variables anymore — the
transform values are computed in JSX and applied directly.

### 4.5 Hover bridge

A small invisible square sits behind the central node
(`absolute right-1/2 top-1/2 h-[140px] w-[140px]`) so the cursor can travel
into the bottom-left quadrant — where the first three folders fan out — without
losing hover. It is `pointer-events: none` when the group is neither hovered
nor expanded.

### 4.6 Radial tooltips

Each fan slot has a peer tooltip (`role="tooltip"`) showing the folder name
or button label. The tooltip is positioned along the slot's angle so its
inner edge sits 4 px outside the button:

```ts
const offset = 28; // button radius (24) + 4 px gap
const nx = Math.cos(rad), ny = Math.sin(rad);
transform: `translate(${nx*offset}px, ${ny*offset}px)
           translate(-50%, -50%)
           translate(${nx*50}%, ${ny*50}%)`;
```

Visible only when the parent button is `:hover` (peer-hover).

### 4.7 Click handlers

```ts
// Folder icon
onClick={() => {
  setSelectedItemId(null);
  setOpenFolderId(f.id);
}}

// Dashboard action button
onClick={onOpenDashboard}

// New folder action button
onClick={() => setNewOpen(true)}

// Center node
onClick={() => setExpanded(v => !v)}
```

---

## 4A. `ExtensionRoot` — draggable wrapper + dashboard host

File: `src/components/ExtensionRoot.tsx`. This is the top-level component
mounted by the Chrome extension content script and by the web `/preview`
route. It owns three responsibilities:

1. **Position the dial.** Defaults to a top-right anchor
   (`top: 24, right: 24`). Once the user drags, switches to absolute
   `top`/`left` viewport coords stored in `pos`. Clamped 4 px inside the
   viewport on every drag tick.
2. **Recenter on expand.** Subscribes to `<WidgetDemo onExpandedChange>`.
   When `expanded` becomes true it computes a `centerPos` and applies it
   instead of `pos`, with a 300 ms `cubic-bezier(0.25, 1, 0.5, 1)` transition
   on `top`/`left`/`right`. Listens to `window.resize` to keep the widget
   centered. On collapse, the wrapper reverts to whatever `pos` is (or the
   default anchor if `pos === null`).
3. **Open the dashboard.** When the fan-out Dashboard button fires
   `onOpenDashboard`, sets `dashboardOpen = true` and hides `<WidgetDemo>`,
   rendering `<Dashboard windowed onClose={() => setDashboardOpen(false)}>`
   as a fullscreen overlay. The widget is restored when the dashboard
   closes.

### Drag mechanics

Pointer-down on the central node (matched via the selector
`'[aria-label="Open Brain Bank dashboard"], [aria-label="Collapse menu"]'`)
arms a drag. A move only "becomes" a drag once the pointer travels more
than `DRAG_THRESHOLD = 4 px` from the start — below that threshold the
gesture is still treated as a click. While dragging:

- `dragging` state is set so the wrapper's CSS `transition` becomes `none`
  (otherwise the widget eases toward the cursor on every move event,
  producing visible choppiness).
- `centerPos` is cleared so a drag mid-expansion breaks out of the
  centered anchor.
- A `pointerup` after movement installs a one-shot capture-phase `click`
  listener that calls `stopPropagation()` + `preventDefault()` on the
  synthetic click, so the central node doesn't toggle expansion at the end
  of a drag.

### Wrapper element

```tsx
<div
  ref={wrapRef}
  onPointerDown={onPointerDown}
  style={style}
  className="pointer-events-auto fixed z-[2147483646] cursor-grab
             active:cursor-grabbing select-none touch-none"
>
  <WidgetDemo embedded={false}
              onOpenDashboard={() => setDashboardOpen(true)}
              onExpandedChange={setExpanded} />
</div>
```

The `z-[2147483646]` keeps the widget above virtually every page element.
`touch-none` disables browser-managed touch panning so drag works on
touch devices.

---

## 5. Windowed folder view (modal bento)

Rendered from `WidgetDemo` as a custom fixed overlay (NOT shadcn `<Dialog>`
— that primitive is no longer used here; the overlay is a plain
`fixed inset-0` div so it works the same inside the extension's Shadow DOM
without portal-targeting weirdness).

### 5.1 Overlay shell

```tsx
{openFolder && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6"
    onClick={(e) => { if (e.target === e.currentTarget) closeFolder(); }}
  >
    <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-border
                    bg-background shadow-2xl">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-center gap-2 text-base font-semibold">
          <span className={`h-2.5 w-2.5 rounded-full ${folderTint[openFolder.color].dot}`} />
          {openFolder.name}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {folderItems.length} items
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FolderToolbar folderId={openFolder.id} />
          <button onClick={closeFolder} aria-label="Close folder"
                  className="rounded-md p-1.5 text-muted-foreground
                             hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-6">
        {/* empty state OR masonry grid */}
      </div>
    </div>
  </div>
)}
```

Backdrop click dismisses, as does the explicit X button. There is no focus
trap — keep this in mind when adding keyboard nav.

### 5.2 Empty state

```tsx
<div className="rounded-xl border border-dashed border-border p-10 text-center
                text-sm text-muted-foreground">
  Nothing saved here yet. Use Add to upload an image or video.
</div>
```

### 5.3 Bento grid (Pinterest-style masonry, CSS-only)

```tsx
<div className="columns-2 gap-3 md:columns-3
                [&>*]:mb-3 [&>*]:break-inside-avoid">
  {folderItems.map((item) => (
    <MiniBentoCard key={item.id} item={item}
      active={item.id === selectedItemId}
      onClick={() => setSelectedItemId(item.id)} />
  ))}
</div>
```

This uses CSS multi-columns — no JS layout library, no `ResizeObserver`. The
`break-inside-avoid` + per-child `mb-3` is what gives the staggered look.

### 5.4 `MiniBentoCard`

Renders a `<video>` for recordings (using `item.videoUrl`) and an `<img>`
for screenshots (using `item.imageUrl`). Both elements receive an inline
`aspectRatio: ${item.width} / ${item.height}` so the masonry packs
correctly before the media has loaded.

```tsx
<button className={`group relative w-full overflow-hidden rounded-lg border
                    bg-card text-left transition ${
  active ? "border-foreground ring-2 ring-foreground/10"
         : "border-border hover:border-foreground/40"
}`}>
  {item.type === "recording" && item.videoUrl ? (
    <video src={item.videoUrl} muted playsInline className="block w-full"
           style={{ aspectRatio: `${item.width} / ${item.height}` }} />
  ) : (
    <img src={item.imageUrl} alt={item.sourceTitle} loading="lazy"
         className="block w-full"
         style={{ aspectRatio: `${item.width} / ${item.height}` }} />
  )}
  {item.type === "recording" && (
    <div className="absolute left-2 top-2 flex h-6 items-center gap-1
                    rounded-full bg-foreground/80 px-2 text-[10px]
                    font-medium text-background">
      <Play className="h-2.5 w-2.5 fill-background" /> Rec
    </div>
  )}
</button>
```

### 5.5 Item selection

Selecting an item (in the modal) sets `selectedItemId`. The detail panel
(`<ItemDetailPanel>`) is rendered next to the overlay by `WidgetDemo`. The
modal stays open behind it; closing the modal also clears the selection.

### 5.6 Inline New-folder modal

`WidgetDemo` also owns a second overlay (`newOpen` state) opened by the
fan-out New folder action button. Same custom `fixed inset-0` pattern —
backdrop click + X button dismiss — with a name `<input autoFocus>` (Enter
submits), an 8-color swatch row, and Cancel / Create footer buttons. On
Create it calls `createFolder(name, color)` and resets local state.

---

## 6. `FolderToolbar`

Appears in the modal header (NOT on `/folder/$id` — that route is read-only
for now). Two buttons: **Camera** and **Add**.

### 6.1 Camera (OS screenshot prompt)

The widget does NOT actually capture a screen — browsers can't trigger the
native OS screenshot UI from JS. Clicking Camera shows a transient
6-second hint that tells the user which OS shortcut to press, then upload
the resulting file via Add.

```ts
const isMac = () =>
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

const triggerCapture = () => {
  const shortcut = isMac()
    ? "Press ⌘ + Shift + 5 to open the macOS screenshot toolbar."
    : "Press Windows + Shift + S (Windows) or use your OS screenshot tool.";
  setHint(shortcut + " After capturing, use Add to upload the file here.");
  window.setTimeout(() => setHint(null), 6000);
};
```

Button styling: `h-8`, `border border-border bg-background`, `text-xs`,
Camera icon (`h-3.5 w-3.5`).

### 6.2 Add (file upload)

Hidden `<input type="file" multiple accept="image/*,video/*">`. Button
triggers `fileInputRef.current?.click()`. Styling: `bg-foreground text-background`.

Per-file flow:

```ts
const onFiles = async (files: FileList | null) => {
  if (!files || files.length === 0) return;
  const existing = getItems();
  const next: SavedItem[] = [];
  for (const file of Array.from(files)) {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo && !file.type.startsWith("image/")) continue;
    const dataUrl = await readFileAsDataUrl(file);
    const dims    = await getMediaDimensions(file, dataUrl);
    next.push({
      id: Math.random().toString(36).slice(2, 10),
      folderId,
      type: isVideo ? "recording" : "screenshot",
      imageUrl: isVideo ? "" : dataUrl,
      videoUrl: isVideo ? dataUrl : undefined,
      sourceUrl: "",
      sourceTitle: file.name,
      notes: "",
      tags: [],
      width: dims.width,
      height: dims.height,
      createdAt: new Date().toISOString(),
    });
  }
  if (next.length) saveItems([...next, ...existing]); // newest first
};
```

Helpers:

```ts
function readFileAsDataUrl(file: File): Promise<string> { /* FileReader */ }

function getMediaDimensions(file, url): Promise<{width:number; height:number}> {
  // For images: new Image() → naturalWidth/Height
  // For videos: <video preload="metadata"> → videoWidth/Height
  // Fallback on error: { width: 600, height: 400 }
}
```

### 6.3 Backend swap note

Storing data-URLs in localStorage **overflows the browser quota** (a known
runtime error already firing). The backend agent MUST:

1. Upload the raw `File` to object storage (Supabase Storage, S3, etc.).
2. Persist only the resulting public/signed URL in `imageUrl` / `videoUrl`.
3. Optionally generate a poster image for recordings server-side so
   `imageUrl` can be populated for them too (the bento card currently
   shows nothing for recordings with empty `imageUrl`).

---

## 7. `ItemDetailPanel`

File: `src/components/ItemDetailPanel.tsx`. Renders on top of any surface
(modal or `/folder/$id`) when an item is selected.

### 7.1 Shell

```tsx
<aside className="fixed right-0 top-0 z-40 flex h-screen w-full max-w-md
                  flex-col border-l border-border bg-background shadow-xl
                  animate-slide-in-right">
  <header>Details + close (X) button</header>
  <div className="flex-1 overflow-y-auto"> … </div>
  <footer>Delete item (destructive ghost button)</footer>
</aside>
```

Animation: `animate-slide-in-right` is defined in `src/styles.css` / Tailwind
config and slides from the right edge.

### 7.2 Sections (top → bottom)

1. **Media preview** — `<img src={item.imageUrl}>` full width on `bg-muted`.
   For recordings, an overlay with a centered 56 px circular Play button
   (`bg-background/90`, `fill-foreground`).
2. **Source** — clickable `<a href={sourceUrl} target="_blank">` showing
   `sourceTitle || sourceUrl` with `ExternalLink` icon; plus an editable
   `<Input>` bound to `sourceUrl` (writes via `updateItem` on every keystroke).
3. **Notes** — `<Textarea>` (min-h 100 px), bound to `notes`, placeholder
   "What do you like about this?".
4. **Tags** — list of `<Badge variant="secondary">` chips with a tiny X
   button per tag. Below: `<Input>` + Add `<Button>`. Tag rules:
   ```ts
   const t = tagDraft.trim().toLowerCase();
   if (!t || item.tags.includes(t)) return; // dedupe + ignore empty
   updateItem(item.id, { tags: [...item.tags, t] });
   ```
5. **Saved date** — `new Date(item.createdAt).toLocaleDateString()`.
6. **Footer** — Delete button. Wraps `deleteItem(item.id)` in
   `confirm("Delete this item?")` then calls `onClose()`.

All edits write through `updateItem` immediately (optimistic). Backend
should debounce server PATCHes — local state can update on every keystroke,
but network calls should coalesce.

---

## 8. `/dashboard`

File: `src/routes/dashboard.tsx`.

### 8.1 Header

- Back link `<Link to="/">` with `ArrowLeft` icon — "Home".
- Centered brand mark: 24 px black circle + "Brain Bank" wordmark
  (`font-semibold tracking-tight`).
- "New folder" `<Button size="sm">` opens a `<Dialog>` with:
  - Name `<Input>` (autoFocus, Enter submits).
  - `<ColorSwatches>` row (8 colors from `FOLDER_COLORS`, rendered as 28 px
    dots; active swatch has `ring-foreground`).
  - Footer: Cancel + Create.

### 8.2 Page heading

```tsx
<h1 className="text-3xl font-semibold tracking-tight">All folders</h1>
<p className="mt-1 text-sm text-muted-foreground">
  {folders.length} folders · {items.length} items
</p>
```

### 8.3 Folder grid

```tsx
<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
  {folders.map(folder => <FolderCardItem … />)}
</div>
```

### 8.4 `FolderCardItem`

- Wrapper: `rounded-2xl border border-border bg-card p-5 hover:shadow-sm`.
- Whole card is a `<Link to="/folder/$id" params={{ id: folder.id }}>`
  rendered as `<div className="absolute inset-0">` overlay.
- Foreground content sits `relative` to stack above the link.
- Top-left: 48 px tinted square (`rounded-xl ${tint.bg} ${tint.text}`) with
  Folder icon.
- Below: folder name. **Click toggles inline rename** (Input that commits
  on blur / Enter; Escape reverts).
- `<p className="text-xs text-muted-foreground">{count} items</p>` where
  `count = items.filter(i => i.folderId === folder.id).length`.
- Hover-revealed top-right controls (`opacity-0 group-hover:opacity-100`,
  `z-10` so they sit above the overlay link):
  - **Color popover** — small circle of the current tint (`tint.dot`). Click
    opens a Popover containing `<ColorSwatches>` bound to `folder.color`.
  - **Actions dropdown** (`MoreHorizontal` icon) with two items:
    - "Rename" → sets inline edit mode.
    - "Delete" (destructive) → `confirm("Delete \"<name>\" and all its
      items?")` then `deleteFolder(folder.id)` (cascades items).

---

## 9. `/folder/$id`

File: `src/routes/folder.$id.tsx`.

- Header: `<Link to="/dashboard">` "All folders", right-aligned color dot
  + folder name.
- Body container shrinks right padding when the detail panel is open:
  `mx-auto max-w-6xl px-6 py-10 transition-[padding] ${selected ? "lg:pr-[28rem]" : ""}`.
- Title: `{folder.name}` + `{count} saved items`.
- Empty state: `rounded-2xl border border-dashed border-border p-16`.
- Grid: same masonry pattern as the modal but with `md:columns-3` and
  `gap-4`. Cards use `rounded-xl` (slightly larger than modal cards) and
  add a hover overlay with `sourceTitle` and tags pulled from the bottom.
- 404: if `folders.length > 0` and no folder matches the id, `throw notFound()`.
  `notFoundComponent` and `errorComponent` are both defined on the route.

Note: there is currently NO `FolderToolbar` on this route — uploads only
happen from the widget modal today. If the backend agent wants parity,
mounting `<FolderToolbar folderId={id} />` near the page heading is enough.

---

## 10. Design tokens & styling

The widget uses Tailwind v4 with the project's semantic tokens declared in
`src/styles.css`. **Do not introduce raw color classes** (`text-white`,
`bg-black`, etc.). Use:

| Token              | Used for                                        |
| ------------------ | ----------------------------------------------- |
| `bg-background`    | page background, drawer background              |
| `text-foreground`  | primary text                                    |
| `bg-foreground`    | center node, primary buttons, recording badges  |
| `text-background`  | text on `bg-foreground` surfaces                |
| `bg-card`          | card / tile surfaces                            |
| `border-border`    | all hairline borders                            |
| `text-muted-foreground` | secondary text                            |
| `bg-muted`         | media preview backdrop                          |
| `text-destructive` | delete actions                                  |

Folder tints come exclusively from the `folderTint` table (§3.5).

### Radii

| Surface                            | Radius        |
| ---------------------------------- | ------------- |
| Dial decorative frame              | `rounded-2xl` |
| Center node + fanned icons         | `rounded-full`|
| Modal card (MiniBentoCard)         | `rounded-lg`  |
| Full-page card (BentoCard)         | `rounded-xl`  |
| Dashboard folder tile icon         | `rounded-xl`  |
| Dashboard folder card              | `rounded-2xl` |
| Empty-state boxes                  | `rounded-xl` / `rounded-2xl` |

### Shadows

| Element             | Class        |
| ------------------- | ------------ |
| Center node         | `shadow-lg`  |
| Fanned folder icons | `shadow-sm`  |
| Detail drawer       | `shadow-xl`  |
| Folder card hover   | `hover:shadow-sm` |

### Animations

- Fan-out: per-slot inline `transform: translate(${x}px, ${y}px)` with a
  60 ms stagger and 500 ms ease-out (`transition-all duration-500 ease-out`).
  Reveal order on expand: folders `[3,4,5,0,1,2]` then dashboard, then
  new-folder button. Collapse is the reverse.
- Widget recentering: when `<WidgetDemo>` flips `expanded` to true,
  `<ExtensionRoot>` animates the wrapper from its current `left`/`top` to
  the viewport center over 300 ms `cubic-bezier(0.25, 1, 0.5, 1)`. During
  pointer drag the transition is set to `none` so the wrapper tracks the
  cursor 1:1; once the pointer is released the easing reattaches. On the
  very first expand the previous `right`-anchored layout is converted to
  explicit `left`/`top` on the current frame, then the center position is
  committed two `requestAnimationFrame` ticks later so the browser has a
  proper "from" value to interpolate from.
- Detail drawer: `animate-slide-in-right` (defined in `styles.css`).
- Popover / Dropdown: default Radix / shadcn animations (used on
  `/dashboard` only — the widget overlays are custom).

---

## 11. State & hooks contract

External state (storage layer):

- `useFolders()` and `useItems()` are `useSyncExternalStore` wrappers.
  Snapshots MUST be reference-stable between mutations. Backend impl should
  use TanStack Query (`useSuspenseQuery`) — its caching gives the same
  guarantee for free.
- `<ExtensionRoot>` calls `hydrateFromChromeStorage()` once on mount so
  `chrome.storage.local` seeds `localStorage` before the first render.

Local component state:

| Component         | State                                                              |
| ----------------- | ------------------------------------------------------------------ |
| `ExtensionRoot`   | `dashboardOpen`, `pos`, `expanded`, `centerPos`, `dragging`        |
| `WidgetDemo`      | `expanded`, `hovered`, `openFolderId`, `selectedItemId`, `newOpen`, `newName`, `newColor` |
| `FolderToolbar`   | `hint` (string \| null), `fileInputRef`                            |
| `MiniBentoCard`   | none (parent owns selection)                                       |
| `ItemDetailPanel` | `tagDraft`                                                         |
| `Dashboard`       | `activeFolderId`, `selectedItemId`, `newOpen`, `newName`, `newColor` |
| `FolderCardItem`  | `editing`, `name`                                                  |
| `FolderPage`      | `selectedId`                                                       |

`WidgetDemo` accepts an `onExpandedChange?: (expanded: boolean) => void`
prop that fires on every expand/collapse so `<ExtensionRoot>` can drive the
recentering animation.

---

## 12. Accessibility

- Every icon-only button has an `aria-label`. Existing labels (preserve them):
  - `Open ${folder.name}` (fan icon)
  - `Open Brain Bank dashboard` (center node)
  - `Close` (drawer)
  - `Capture screenshot or recording` (Camera)
  - `Upload images or videos` (Add)
  - `Folder actions` (kebab)
  - `Change color`
  - `Remove ${tag}`
  - `Open ${folder.name}` (dashboard card link)
- `<img alt={item.sourceTitle}>` on every bento image.
- Dialog / Popover / Dropdown / Tooltip primitives are shadcn (Radix-backed)
  — keyboard navigation and focus traps are handled.
- Inline rename input on the dashboard supports Enter (commit), Escape
  (revert), blur (commit).

---

## 13. Dependencies

Already installed; do not re-add:

- `@tanstack/react-router` — `Link`, `createFileRoute`, `notFound`, `useParams`.
- `lucide-react` icons used by the widget: `Folder`, `Play`, `Camera`,
  `Plus`, `X`, `LayoutDashboard`, `LayoutGrid`, `ArrowLeft`,
  `MoreHorizontal`, `Trash2`, `ExternalLink`.
- shadcn primitives (under `@/components/ui/…`): `popover`,
  `dropdown-menu`, `button`, `input`, `textarea`, `badge`. Note:
  `dialog` is NOT used by the widget anymore — both the folder modal and
  the inline new-folder modal are custom `fixed inset-0` overlays so they
  render correctly inside the extension's Shadow DOM. `/dashboard` still
  uses Radix-backed shadcn primitives for popovers and dropdowns.

---

## 14. Backend handoff checklist

**Goal: replace `src/lib/storage.ts` internals without touching any widget
component.** Keep function signatures + the snapshot-stability guarantee.

Suggested REST contract (or equivalent server functions):

| Verb   | Path                       | Notes                                   |
| ------ | -------------------------- | --------------------------------------- |
| GET    | `/folders`                 | Returns `Folder[]` for the current user |
| POST   | `/folders`                 | Body: `{ name, color }` → `Folder`      |
| PATCH  | `/folders/:id`             | Body: partial `Folder`                  |
| DELETE | `/folders/:id`             | Cascade-deletes items                   |
| GET    | `/items?folderId=`         | Returns `SavedItem[]`                   |
| POST   | `/items`                   | Multipart upload (file + folderId);     |
|        |                            | server returns full `SavedItem` with    |
|        |                            | `imageUrl` / `videoUrl` set             |
| PATCH  | `/items/:id`               | Body: partial `SavedItem`               |
| DELETE | `/items/:id`               |                                         |

Implementation notes:

- Replace localStorage reads in `getFolders()` / `getItems()` with a
  TanStack Query cache (or a single source of truth that exposes a
  reference-stable getter for `useSyncExternalStore`).
- Replace `saveFolders` / `saveItems` with mutations that invalidate the
  relevant query keys; keep `emit()` for components that subscribe directly.
- Scope every query by authenticated user; enforce with RLS if using
  Lovable Cloud / Supabase. Use the `requireSupabaseAuth` middleware
  pattern for any server function that touches user data.
- Upload pipeline (Add button) should:
  1. POST the `File` to `/items` (multipart) along with `folderId`.
  2. Server uploads bytes to object storage, captures dimensions
     server-side (or trusts the client-measured `width`/`height` passed
     alongside), and returns the full `SavedItem`.
  3. Client prepends the returned item to its cache.

---

## 15. Known issues to fix during backend work

1. **`QuotaExceededError` on upload** — items currently embed full
   data-URLs (`imageUrl` / `videoUrl`) and persist into localStorage, which
   blows past the ~5 MB quota after a couple of uploads. Migrating media
   into object storage and storing only URLs eliminates this entirely.
2. **Recordings have no poster** — `MiniBentoCard` and `BentoCard` render
   `item.imageUrl` even when the item is a recording. For uploaded videos
   that field is `""`, so the card looks broken. Generate a poster
   server-side on upload and set `imageUrl` to its URL.
3. **No debouncing on `ItemDetailPanel` edits** — every keystroke calls
   `updateItem`. Local is fine, but server PATCHes should be debounced
   (~300 ms) to avoid hammering the API.
4. **Camera button is informational only** — browsers cannot trigger the
   native OS screenshot UI. Keep this as a UX nudge; do not promise actual
   capture. If real in-browser capture is desired later, use
   `navigator.mediaDevices.getDisplayMedia()` and render the resulting
   stream into a canvas — separate scope.
