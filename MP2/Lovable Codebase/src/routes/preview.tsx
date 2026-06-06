import { createFileRoute } from "@tanstack/react-router";
import { ExtensionRoot } from "@/components/ExtensionRoot";

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "Preview the Brain Bank widget" },
      {
        name: "description",
        content:
          "Live preview of the Brain Bank Chrome extension widget without installing it.",
      },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  return (
    <div className="min-h-screen bg-muted/40">
      {/* Fake page content behind the widget so you can see the overlay effect */}
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          Live preview · simulates the extension on any webpage
        </p>
        <h1 className="text-4xl font-semibold tracking-tight">
          This is a stand-in for the page underneath.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          The Brain Bank widget is pinned to the top-right corner of this view,
          exactly the way it appears once the extension is installed. Hover the
          black dot to fan out folders, or click it to open the dashboard.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl border border-dashed border-border bg-card"
            />
          ))}
        </div>
      </div>

      {/* Same component the Chrome extension content script mounts */}
      <ExtensionRoot />
    </div>
  );
}
