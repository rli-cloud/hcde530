// Client-side storage layer for Brain Bank widget data.
// Backed by chrome.storage.local when running as a Chrome extension,
// falls back to localStorage in the website preview / dev environment.
// Same pub/sub + module-level cache pattern in both modes.

export type FolderColor =
  | "rose"
  | "amber"
  | "emerald"
  | "sky"
  | "violet"
  | "fuchsia"
  | "slate"
  | "orange";

export const FOLDER_COLORS: FolderColor[] = [
  "rose",
  "amber",
  "emerald",
  "sky",
  "violet",
  "fuchsia",
  "slate",
  "orange",
];

export interface Folder {
  id: string;
  name: string;
  color: FolderColor;
  createdAt: string;
}

export interface SavedItem {
  id: string;
  folderId: string;
  type: "screenshot" | "recording";
  imageUrl: string;
  videoUrl?: string;
  sourceUrl: string;
  sourceTitle: string;
  notes: string;
  tags: string[];
  width: number;
  height: number;
  createdAt: string;
}

const FOLDERS_KEY = "inspo.folders.v1";
const ITEMS_KEY = "inspo.items.v1";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const isBrowser = () => typeof window !== "undefined";
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------------------------------------------------------------------------
// Backend selection: chrome.storage.local in extension, localStorage otherwise
// ---------------------------------------------------------------------------

type ChromeStorage = {
  local: {
    get(keys: string[]): Promise<Record<string, unknown>>;
    set(items: Record<string, unknown>): Promise<void>;
  };
  onChanged: {
    addListener(
      cb: (changes: Record<string, { newValue?: unknown }>, areaName: string) => void,
    ): void;
  };
};

const chromeStorage: ChromeStorage | null = (() => {
  if (typeof globalThis === "undefined") return null;
  const c = (globalThis as { chrome?: { storage?: ChromeStorage } }).chrome;
  return c?.storage ?? null;
})();

const useChrome = chromeStorage !== null;

// Stable empty references — `useSyncExternalStore` requires `getSnapshot`
// to return the same reference when the underlying data hasn't changed.
const EMPTY_FOLDERS: Folder[] = [];
const EMPTY_ITEMS: SavedItem[] = [];

let foldersCache: Folder[] | null = null;
let itemsCache: SavedItem[] | null = null;
let hydrated = !useChrome; // localStorage is synchronous; chrome.storage needs hydration

function readSync(key: string): string | null {
  if (!isBrowser()) return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeSync(key: string, value: string) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota / privacy mode */
  }
}

function defaultSeed(): { folders: Folder[]; items: SavedItem[] } {
  const folders: Folder[] = [
    { id: "f1", name: "Landing Pages", color: "violet", createdAt: new Date().toISOString() },
    { id: "f2", name: "Typography", color: "amber", createdAt: new Date().toISOString() },
    { id: "f3", name: "Dashboards", color: "sky", createdAt: new Date().toISOString() },
    { id: "f4", name: "Color & Gradients", color: "fuchsia", createdAt: new Date().toISOString() },
    { id: "f5", name: "Micro-interactions", color: "emerald", createdAt: new Date().toISOString() },
  ];

  const sizes: Array<[number, number]> = [
    [600, 400], [400, 600], [500, 500], [600, 350],
    [400, 500], [500, 700], [600, 600], [450, 300],
    [500, 400], [400, 550], [600, 450], [500, 600],
  ];

  const items: SavedItem[] = sizes.map((s, i) => {
    const folder = folders[i % folders.length];
    return {
      id: `i${i + 1}`,
      folderId: folder.id,
      type: i % 5 === 0 ? "recording" : "screenshot",
      imageUrl: `https://picsum.photos/seed/inspo-${i + 1}/${s[0]}/${s[1]}`,
      sourceUrl: `https://example-${i + 1}.com`,
      sourceTitle: `Reference site ${i + 1}`,
      notes: i % 3 === 0 ? "Love the typography hierarchy here." : "",
      tags: i % 2 === 0 ? ["minimal", "editorial"] : ["bold"],
      width: s[0],
      height: s[1],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    };
  });

  return { folders, items };
}

// ---------------------------------------------------------------------------
// localStorage path (synchronous)
// ---------------------------------------------------------------------------

function seedLocal() {
  const { folders, items } = defaultSeed();
  writeSync(FOLDERS_KEY, JSON.stringify(folders));
  writeSync(ITEMS_KEY, JSON.stringify(items));
  foldersCache = null;
  itemsCache = null;
}

function ensureSeededLocal() {
  if (!isBrowser()) return;
  if (!readSync(FOLDERS_KEY)) seedLocal();
}

// ---------------------------------------------------------------------------
// chrome.storage path (async, hydrate-once)
// ---------------------------------------------------------------------------

export async function hydrateFromChromeStorage() {
  if (!useChrome || !chromeStorage) return;
  const res = await chromeStorage.local.get([FOLDERS_KEY, ITEMS_KEY]);
  let folders = res[FOLDERS_KEY] as Folder[] | undefined;
  let items = res[ITEMS_KEY] as SavedItem[] | undefined;
  if (!folders || !items) {
    const seed = defaultSeed();
    folders = seed.folders;
    items = seed.items;
    await chromeStorage.local.set({ [FOLDERS_KEY]: folders, [ITEMS_KEY]: items });
  }
  foldersCache = folders;
  itemsCache = items;
  hydrated = true;
  emit();

  // Keep other tabs in sync.
  chromeStorage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (changes[FOLDERS_KEY]) foldersCache = (changes[FOLDERS_KEY].newValue as Folder[]) ?? [];
    if (changes[ITEMS_KEY]) itemsCache = (changes[ITEMS_KEY].newValue as SavedItem[]) ?? [];
    if (changes[FOLDERS_KEY] || changes[ITEMS_KEY]) emit();
  });
}

// ---------------------------------------------------------------------------
// Public getters / setters (same surface in both modes)
// ---------------------------------------------------------------------------

export function getFolders(): Folder[] {
  if (!isBrowser()) return EMPTY_FOLDERS;
  if (useChrome) return hydrated && foldersCache ? foldersCache : EMPTY_FOLDERS;
  ensureSeededLocal();
  if (foldersCache === null) {
    foldersCache = JSON.parse(readSync(FOLDERS_KEY) || "[]");
  }
  return foldersCache!;
}

export function getItems(): SavedItem[] {
  if (!isBrowser()) return EMPTY_ITEMS;
  if (useChrome) return hydrated && itemsCache ? itemsCache : EMPTY_ITEMS;
  ensureSeededLocal();
  if (itemsCache === null) {
    itemsCache = JSON.parse(readSync(ITEMS_KEY) || "[]");
  }
  return itemsCache!;
}

export function saveFolders(folders: Folder[]) {
  foldersCache = folders;
  if (useChrome && chromeStorage) {
    void chromeStorage.local.set({ [FOLDERS_KEY]: folders });
  } else {
    writeSync(FOLDERS_KEY, JSON.stringify(folders));
  }
  emit();
}

export function saveItems(items: SavedItem[]) {
  itemsCache = items;
  if (useChrome && chromeStorage) {
    void chromeStorage.local.set({ [ITEMS_KEY]: items });
  } else {
    writeSync(ITEMS_KEY, JSON.stringify(items));
  }
  emit();
}

export function createFolder(name: string, color: FolderColor): Folder {
  const folder: Folder = { id: uid(), name, color, createdAt: new Date().toISOString() };
  saveFolders([...getFolders(), folder]);
  return folder;
}

export function updateFolder(id: string, patch: Partial<Folder>) {
  saveFolders(getFolders().map((f) => (f.id === id ? { ...f, ...patch } : f)));
}

export function deleteFolder(id: string) {
  saveFolders(getFolders().filter((f) => f.id !== id));
  saveItems(getItems().filter((i) => i.folderId !== id));
}

export function updateItem(id: string, patch: Partial<SavedItem>) {
  saveItems(getItems().map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export function deleteItem(id: string) {
  saveItems(getItems().filter((i) => i.id !== id));
}

// Tailwind color mapping for folder accents.
export const folderTint: Record<FolderColor, { bg: string; text: string; ring: string; dot: string }> = {
  rose:    { bg: "bg-rose-100",    text: "text-rose-700",    ring: "ring-rose-200",    dot: "bg-rose-500" },
  amber:   { bg: "bg-amber-100",   text: "text-amber-800",   ring: "ring-amber-200",   dot: "bg-amber-500" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-800", ring: "ring-emerald-200", dot: "bg-emerald-500" },
  sky:     { bg: "bg-sky-100",     text: "text-sky-800",     ring: "ring-sky-200",     dot: "bg-sky-500" },
  violet:  { bg: "bg-violet-100",  text: "text-violet-800",  ring: "ring-violet-200",  dot: "bg-violet-500" },
  fuchsia: { bg: "bg-fuchsia-100", text: "text-fuchsia-800", ring: "ring-fuchsia-200", dot: "bg-fuchsia-500" },
  slate:   { bg: "bg-slate-200",   text: "text-slate-800",   ring: "ring-slate-300",   dot: "bg-slate-500" },
  orange:  { bg: "bg-orange-100",  text: "text-orange-800",  ring: "ring-orange-200",  dot: "bg-orange-500" },
};
