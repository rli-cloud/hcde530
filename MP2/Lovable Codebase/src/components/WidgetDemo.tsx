import {
  Folder as FolderIcon,
  Play,
  Plus,
  X,
  LayoutGrid,
  LayoutDashboard,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  folderTint,
  saveItems,
  getItems,
  createFolder,
  FOLDER_COLORS,
  type FolderColor,
  type SavedItem,
} from "@/lib/storage";
import { useFolders, useItems } from "@/lib/use-storage";
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

/**
 * The Brain Bank rotary widget.
 */
export function WidgetDemo({
  onOpenDashboard,
  embedded = true,
  onExpandedChange,
}: {
  onOpenDashboard: () => void;
  embedded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const folders = useFolders();
  const items = useItems();

  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    onExpandedChange?.(expanded);
  }, [expanded, onExpandedChange]);
  const [hovered, setHovered] = useState(false);
  const MAX_FAN = 6;
  const HOVER_PREVIEW = 3;
  const previewFolders = folders.slice(0, MAX_FAN);
  const visibleFolderCount = expanded
    ? previewFolders.length
    : hovered
      ? Math.min(HOVER_PREVIEW, previewFolders.length)
      : 0;

  // The first 3 folders (shown on hover) are locked at 90°, 135°, and 180° —
  // directly above, top-left, and directly left of the node. When expanded to
  // the full 6, the remaining 3 fan out starting at 225°, progressing 45° each.
  const HOVER_ANGLES = [90, 135, 180];
  const EXTRA_ANGLES = [225, 270, 315]; // each +45° from 225°
  const buttonSlotAngles = [0, 45]; // dashboard locked at 0°, new folder at 45°

  const getFolderAngle = (i: number) => {
    if (i < HOVER_ANGLES.length) return HOVER_ANGLES[i];
    return EXTRA_ANGLES[i - HOVER_ANGLES.length] ?? 180;
  };

  const getButtonAngle = (i: number) => buttonSlotAngles[i];

  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // New-folder modal state — mirrors the dashboard's New folder flow.
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState<FolderColor>("violet");

  const openFolder = openFolderId
    ? folders.find((f) => f.id === openFolderId) ?? null
    : null;
  const folderItems = openFolder
    ? items.filter((i) => i.folderId === openFolder.id)
    : [];
  const selectedItem = folderItems.find((i) => i.id === selectedItemId) ?? null;

  const closeFolder = () => {
    setOpenFolderId(null);
    setSelectedItemId(null);
  };

  const handleCenterClick = () => {
    setExpanded((v) => !v);
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createFolder(name, newColor);
    setNewName("");
    setNewColor("violet");
    setNewOpen(false);
  };

  // Position tooltip so its near edge sits 4px outside the button edge.
  // Anchor at (buttonRadius 24 + 4px) from button center along the angle,
  // then shift by 50% of the tooltip's own size in the radial direction so
  // its inner edge — not its center — lands on the anchor point.
  const tooltipStyle = (angleDeg: number): React.CSSProperties => {
    const rad = (angleDeg * Math.PI) / 180;
    const offset = 28; // button radius (24) + 4px gap
    const nx = Math.cos(rad);
    const ny = Math.sin(rad);
    const tx = nx * offset;
    const ty = ny * offset;
    return {
      left: "50%",
      top: "50%",
      transform: `translate(${tx}px, ${ty}px) translate(-50%, -50%) translate(${nx * 50}%, ${ny * 50}%)`,
    };
  };

  return (
    <div className={embedded ? "relative h-[320px] w-[320px]" : "relative"}>
      {embedded && (
        <div className="absolute inset-0 rounded-2xl border border-dashed border-border bg-card/40" />
      )}
      <div className={embedded ? "absolute right-6 top-6" : ""}>
        <div
          className="group relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Invisible hover bridge — confined to the bottom-left quadrant
              where the initial 3 folders fan out (90°, 135°, 180°). Keeps
              hover alive as the cursor travels toward those folders, but
              releases (collapsing the fan) the moment the cursor leaves
              that quadrant. */}
          <div
            aria-hidden
            className={`absolute right-1/2 top-1/2 h-[140px] w-[140px] ${
              hovered || expanded ? "" : "pointer-events-none"
            }`}
          />

          {previewFolders.map((f, i) => {
            const angle = getFolderAngle(i);
            const rad = (angle * Math.PI) / 180;
            const distance = 90;
            const x = Math.cos(rad) * distance;
            const y = Math.sin(rad) * distance;
            const tint = folderTint[f.color];
            const isOpen = i < visibleFolderCount;
            // Reveal order when expanded: start at folder 4 (index 3) and
            // continue clockwise through the remaining folders. On hover
            // (only first 3 visible), keep their natural 0/1/2 order.
            const clockwiseOrder = [3, 4, 5, 0, 1, 2];
            const orderIndex = expanded ? clockwiseOrder.indexOf(i) : i;
            // Collapse reverses the reveal: new folder button → dashboard →
            // folders counterclockwise. Total animated slots = folders + 2 buttons.
            const totalSlots = previewFolders.length + 2;
            const delayIndex = expanded
              ? Math.max(0, orderIndex)
              : totalSlots - 1 - Math.max(0, orderIndex);
            return (
              <div
                key={f.id}
                className={`pointer-events-none absolute left-1/2 top-1/2 -ml-6 -mt-6 transition-all duration-500 ease-out ${
                  isOpen ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform: isOpen
                    ? `translate(${x}px, ${y}px)`
                    : "translate(0,0) scale(0.6)",
                  transitionDelay: `${delayIndex * 60}ms`,
                }}
              >
                <div className={`relative h-12 w-12 ${isOpen ? "pointer-events-auto" : ""}`}>
                  <button
                    type="button"
                    aria-label={`Open ${f.name}`}
                    onClick={() => {
                      setSelectedItemId(null);
                      setOpenFolderId(f.id);
                    }}
                    className={`peer flex h-12 w-12 items-center justify-center rounded-full ring-1 ${tint.bg} ${tint.text} ${tint.ring} shadow-sm transition-transform hover:scale-110`}
                  >
                    <FolderIcon className="h-5 w-5" />
                  </button>
                  {/* Name tooltip — radiates outward from the node. */}
                  <span
                    role="tooltip"
                    style={tooltipStyle(angle)}
                    className="pointer-events-none absolute whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-md transition-opacity duration-150 peer-hover:opacity-100"
                  >
                    {f.name}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Right-side action buttons */}
          {[
            {
              key: "dashboard",
              label: "Open dashboard",
              onClick: onOpenDashboard,
              className:
                "bg-foreground text-background ring-foreground/20 hover:opacity-90",
              icon: <LayoutDashboard className="h-5 w-5" />,
            },
            {
              key: "add",
              label: "Add folder",
              onClick: () => setNewOpen(true),
              className:
                "bg-background text-foreground ring-border hover:bg-muted",
              icon: <Plus className="h-5 w-5" />,
            },
          ].map((btn, i) => {
            const angle = getButtonAngle(i);
            const rad = (angle * Math.PI) / 180;
            const distance = 90;
            const x = Math.cos(rad) * distance;
            const y = Math.sin(rad) * distance;
            const isOpen = expanded;
            // Buttons always appear after every folder has animated in.
            const orderIndex = previewFolders.length + i;
            const totalSlots = previewFolders.length + 2;
            const delayIndex = expanded
              ? orderIndex
              : totalSlots - 1 - orderIndex;
            return (
              <div
                key={btn.key}
                className={`pointer-events-none absolute left-1/2 top-1/2 -ml-6 -mt-6 transition-all duration-500 ease-out ${
                  isOpen ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transform: isOpen
                    ? `translate(${x}px, ${y}px)`
                    : "translate(0,0) scale(0.6)",
                  transitionDelay: `${delayIndex * 60}ms`,
                }}
              >
                <div className={`relative h-12 w-12 ${isOpen ? "pointer-events-auto" : ""}`}>
                  <button
                    type="button"
                    aria-label={btn.label}
                    onClick={btn.onClick}
                    className={`peer flex h-12 w-12 items-center justify-center rounded-full ring-1 shadow-sm transition-transform hover:scale-110 ${btn.className}`}
                  >
                    {btn.icon}
                  </button>
                  <span
                    role="tooltip"
                    style={tooltipStyle(angle)}
                    className="pointer-events-none absolute whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-md transition-opacity duration-150 peer-hover:opacity-100"
                  >
                    {btn.label}
                  </span>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={handleCenterClick}
            aria-label={expanded ? "Collapse menu" : "Open Brain Bank dashboard"}
            className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-transform hover:scale-105"
          >
            <span className="h-3 w-3 rounded-full bg-background" />
          </button>
        </div>
      </div>

      {openFolder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeFolder();
          }}
        >
          <div
            className={`flex max-h-[85vh] w-full overflow-hidden rounded-xl border border-border bg-background shadow-2xl ${
              selectedItem ? "max-w-5xl" : "max-w-3xl"
            }`}
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${folderTint[openFolder.color].dot}`}
                  />
                  {openFolder.name}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {folderItems.length} items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderToolbar folderId={openFolder.id} />
                  <button
                    type="button"
                    onClick={closeFolder}
                    aria-label="Close folder"
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {folderItems.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                    Nothing saved here yet. Use Add to upload an image or video.
                  </div>
                ) : (
                  <div className="columns-2 gap-3 md:columns-3 [&>*]:mb-3 [&>*]:break-inside-avoid">
                    {folderItems.map((item) => (
                      <MiniBentoCard
                        key={item.id}
                        item={item}
                        active={item.id === selectedItemId}
                        onClick={() => setSelectedItemId(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            {selectedItem && (
              <div className="w-96 shrink-0">
                <ItemDetailPanel
                  variant="inline"
                  item={selectedItem}
                  onClose={() => setSelectedItemId(null)}
                />
              </div>
            )}
          </div>
        </div>
      )}


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
            <div className="flex flex-wrap gap-2">
              {FOLDER_COLORS.map((c) => {
                const tint = folderTint[c];
                return (
                  <button
                    key={c}
                    type="button"
                    aria-label={c}
                    onClick={() => setNewColor(c)}
                    className={`h-7 w-7 rounded-full ring-2 transition ${tint.dot} ${
                      newColor === c ? "ring-foreground" : "ring-transparent"
                    }`}
                  />
                );
              })}
            </div>
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

function MiniBentoCard({
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
      className={`group relative w-full overflow-hidden rounded-lg border bg-card text-left transition ${
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
      {item.type === "recording" && (
        <div className="absolute left-2 top-2 flex h-6 items-center gap-1 rounded-full bg-foreground/80 px-2 text-[10px] font-medium text-background">
          <Play className="h-2.5 w-2.5 fill-background" /> Rec
        </div>
      )}
    </button>
  );
}

function FolderToolbar({ folderId }: { folderId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="flex h-8 items-center gap-1.5 rounded-md bg-foreground px-2.5 text-xs font-medium text-background transition hover:opacity-90"
        aria-label="Upload images or videos"
      >
        <Plus className="h-3.5 w-3.5" /> Add
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
    </div>
  );
}


// Marker so tree-shaker keeps the icon import even when unused above
void LayoutGrid;
