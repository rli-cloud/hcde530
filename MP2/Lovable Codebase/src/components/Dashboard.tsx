import { useRef, useState } from "react";
import {
  createFolder,
  deleteFolder,
  FOLDER_COLORS,
  folderTint,
  getItems,
  saveItems,
  updateFolder,
  type Folder,
  type FolderColor,
  type SavedItem,
} from "@/lib/storage";
import { useFolders, useItems } from "@/lib/use-storage";
import { ArrowLeft, Check, Folder as FolderIcon, Palette, Plus, Trash2, X } from "lucide-react";
import { ItemDetailPanel } from "@/components/ItemDetailPanel";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function getMediaDimensions(
  file: File,
  url: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    if (file.type.startsWith("video/")) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () =>
        resolve({ width: v.videoWidth || 600, height: v.videoHeight || 400 });
      v.onerror = () => resolve({ width: 600, height: 400 });
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => resolve({ width: 600, height: 400 });
      img.src = url;
    }
  });
}

async function uploadToFolder(folderId: string, files: FileList | null) {
  if (!files || files.length === 0) return;
  const existing = getItems();
  const next: SavedItem[] = [];
  for (const file of Array.from(files)) {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo && !file.type.startsWith("image/")) continue;
    const dataUrl = await readFileAsDataUrl(file);
    const dims = await getMediaDimensions(file, dataUrl);
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
  if (next.length) saveItems([...next, ...existing]);
}


/**
 * Standalone Brain Bank dashboard — used inside the Chrome extension overlay
 * as well as anywhere we want a portal-free folder browser. Avoids Radix
 * Dialog/Popover/Dropdown so it renders correctly inside a Shadow DOM.
 */
export function Dashboard({
  onClose,
  windowed = false,
}: {
  onClose: () => void;
  windowed?: boolean;
}) {
  const folders = useFolders();
  const items = useItems();

  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<FolderColor>("violet");

  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const activeFolder = folders.find((f) => f.id === activeFolderId) ?? null;
  const folderItems = activeFolder
    ? items.filter((i) => i.folderId === activeFolder.id)
    : [];
  const selectedItem = folderItems.find((i) => i.id === selectedItemId) ?? null;

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createFolder(name, newColor);
    setNewName("");
    setNewColor("violet");
    setNewOpen(false);
  };

  const shellOuter = windowed
    ? "fixed inset-0 z-40 flex items-center justify-center bg-foreground/40 p-6"
    : "fixed inset-0 z-40 overflow-y-auto bg-background";
  const shellInner = windowed
    ? `flex w-full ${selectedItem ? "max-w-6xl" : "max-w-5xl"} max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl`
    : "contents";

  return (
    <div
      className={shellOuter}
      onClick={
        windowed
          ? (e) => {
              if (e.target === e.currentTarget) onClose();
            }
          : undefined
      }
    >
      <div className={shellInner}>

      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <button
            type="button"
            onClick={() => (activeFolderId ? setActiveFolderId(null) : onClose())}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {activeFolderId ? "Folders" : "Close"}
          </button>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-foreground" />
            <span className="font-semibold tracking-tight">Brain Bank</span>
          </div>
          {!activeFolderId ? (
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="inline-flex h-9 items-center gap-1 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> New folder
            </button>
          ) : (
            <FolderAddButton folderId={activeFolderId} />
          )}
        </div>
      </header>

      {!activeFolderId ? (
        <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight">All folders</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {folders.length} folders · {items.length} items
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {folders.map((folder) => (
              <FolderCardItem
                key={folder.id}
                folder={folder}
                count={items.filter((i) => i.folderId === folder.id).length}
                onOpen={() => {
                  setSelectedItemId(null);
                  setActiveFolderId(folder.id);
                }}
              />
            ))}
          </div>
        </main>
      ) : (
        <div className="flex min-h-0 flex-1">
          <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto px-6 py-10">
            <div className="mb-6 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${folderTint[activeFolder!.color].dot}`}
              />
              <h2 className="text-2xl font-semibold tracking-tight">
                {activeFolder!.name}
              </h2>
              <span className="ml-1 text-xs text-muted-foreground">
                {folderItems.length} items
              </span>
            </div>
            {folderItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-16 text-center text-sm text-muted-foreground">
                Nothing saved here yet. Use Add to upload an image or video.
              </div>
            ) : (
              <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
                {folderItems.map((item) => (
                  <ItemThumb
                    key={item.id}
                    item={item}
                    active={item.id === selectedItemId}
                    onClick={() => setSelectedItemId(item.id)}
                  />
                ))}
              </div>
            )}
          </main>
          {selectedItem && (
            <div className="w-96 shrink-0 border-l border-border">
              <ItemDetailPanel
                variant="inline"
                item={selectedItem}
                onClose={() => setSelectedItemId(null)}
              />
            </div>
          )}
        </div>
      )}
      </div>




      {newOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNewOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-background p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold">Create folder</h3>
              <button
                onClick={() => setNewOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              autoFocus
              placeholder="Folder name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="mb-3 h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <ColorSwatches value={newColor} onChange={setNewColor} />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setNewOpen(false)}
                className="h-9 rounded-md px-3 text-sm text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FolderAddButton({ folderId }: { folderId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex h-9 items-center gap-1 rounded-md bg-foreground px-3 text-sm font-medium text-background hover:opacity-90"
      >
        <Plus className="h-4 w-4" /> Add
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void uploadToFolder(folderId, e.target.files).then(() => {
            if (fileInputRef.current) fileInputRef.current.value = "";
          });
        }}
      />
    </>
  );
}


function ColorSwatches({
  value,
  onChange,
}: {
  value: FolderColor;
  onChange: (c: FolderColor) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FOLDER_COLORS.map((c) => {
        const tint = folderTint[c];
        return (
          <button
            key={c}
            type="button"
            aria-label={c}
            onClick={() => onChange(c)}
            className={`h-7 w-7 rounded-full ring-2 transition ${tint.dot} ${
              value === c ? "ring-foreground" : "ring-transparent"
            }`}
          />
        );
      })}
    </div>
  );
}

function FolderCardItem({
  folder,
  count,
  onOpen,
}: {
  folder: Folder;
  count: number;
  onOpen: () => void;
}) {
  const tint = folderTint[folder.color];
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [colorOpen, setColorOpen] = useState(false);

  const commit = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== folder.name) updateFolder(folder.id, { name: trimmed });
    else setName(folder.name);
    setEditing(false);
  };

  return (
    <div className="group relative rounded-2xl border border-border bg-card p-5 transition hover:shadow-sm">
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 rounded-2xl"
        aria-label={`Open ${folder.name}`}
      />
      <div
        className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl ${tint.bg} ${tint.text}`}
      >
        <FolderIcon className="h-6 w-6" />
      </div>
      <div className="relative mt-4">
        {editing ? (
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") {
                setName(folder.name);
                setEditing(false);
              }
            }}
            className="h-7 w-full rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setEditing(true);
            }}
            className="text-left font-medium hover:underline"
          >
            {folder.name}
          </button>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{count} items</p>
      </div>

      <div className="absolute right-3 top-3 z-10 flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          aria-label="Change folder color"
          onClick={(e) => {
            e.preventDefault();
            setColorOpen((v) => !v);
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground hover:text-foreground"
        >
          <Palette className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Delete folder"
          onClick={(e) => {
            e.preventDefault();
            if (confirm(`Delete "${folder.name}" and all its items?`)) {
              deleteFolder(folder.id);
            }
          }}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {colorOpen && (
        <>
          <button
            type="button"
            aria-label="Close color picker"
            onClick={(e) => {
              e.preventDefault();
              setColorOpen(false);
            }}
            className="absolute inset-0 z-10 cursor-default rounded-2xl"
          />
          <div className="absolute right-3 top-12 z-20 rounded-xl border border-border bg-background p-3 shadow-lg">
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((c) => {
                const t = folderTint[c];
                const selected = folder.color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={(e) => {
                      e.preventDefault();
                      updateFolder(folder.id, { color: c });
                      setColorOpen(false);
                    }}
                    className={`flex h-7 w-7 items-center justify-center rounded-full ring-2 transition ${t.dot} ${
                      selected ? "ring-foreground" : "ring-transparent"
                    }`}
                  >
                    {selected && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ItemThumb({
  item,
  active,
  onClick,
}: {
  item: SavedItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative block w-full overflow-hidden rounded-xl border bg-card transition ${
        active
          ? "border-foreground ring-2 ring-foreground/10"
          : "border-border hover:border-foreground/40"
      }`}
    >
      {item.type === "recording" && item.videoUrl ? (
        <video
          src={item.videoUrl}
          muted
          playsInline
          className="block w-full"
          style={{ aspectRatio: `${item.width} / ${item.height}` }}
        />
      ) : (
        <img
          src={item.imageUrl}
          alt={item.sourceTitle}
          loading="lazy"
          className="block w-full"
          style={{ aspectRatio: `${item.width} / ${item.height}` }}
        />
      )}
    </button>
  );
}
