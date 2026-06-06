import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Trash2, Play } from "lucide-react";
import { deleteItem, updateItem, type SavedItem } from "@/lib/storage";

export function ItemDetailPanel({
  item,
  onClose,
  variant = "fixed",
}: {
  item: SavedItem;
  onClose: () => void;
  variant?: "fixed" | "inline";
}) {
  const [tagDraft, setTagDraft] = useState("");

  const addTag = () => {
    const t = tagDraft.trim().toLowerCase();
    if (!t || item.tags.includes(t)) {
      setTagDraft("");
      return;
    }
    updateItem(item.id, { tags: [...item.tags, t] });
    setTagDraft("");
  };

  const removeTag = (t: string) => {
    updateItem(item.id, { tags: item.tags.filter((x) => x !== t) });
  };

  const wrapperClass =
    variant === "fixed"
      ? "fixed right-0 top-0 z-40 flex h-screen w-full max-w-md flex-col border-l border-border bg-background shadow-xl animate-slide-in-right"
      : "flex h-full w-full flex-col border-l border-border bg-background";

  return (
    <aside className={wrapperClass}>

      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-medium">Details</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="relative bg-muted">
          <img
            src={item.imageUrl}
            alt=""
            className="w-full"
          />
          {item.type === "recording" && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/90">
                <Play className="h-6 w-6 fill-foreground text-foreground" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6 p-5">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Source</label>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center gap-2 text-sm font-medium text-foreground hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{item.sourceTitle || item.sourceUrl}</span>
            </a>
            <Input
              className="mt-2 h-8 text-xs"
              value={item.sourceUrl}
              onChange={(e) => updateItem(item.id, { sourceUrl: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Notes</label>
            <Textarea
              className="mt-1 min-h-[100px]"
              placeholder="What do you like about this?"
              value={item.notes}
              onChange={(e) => updateItem(item.id, { notes: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Tags</label>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {t}
                  <button
                    onClick={() => removeTag(t)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
                    aria-label={`Remove ${t}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                className="h-8 text-xs"
                placeholder="Add a tag…"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button size="sm" variant="secondary" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>

          <div className="pt-2 text-xs text-muted-foreground">
            Saved {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="border-t border-border px-5 py-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => {
            if (confirm("Delete this item?")) {
              deleteItem(item.id);
              onClose();
            }
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete item
        </Button>
      </div>
    </aside>
  );
}
