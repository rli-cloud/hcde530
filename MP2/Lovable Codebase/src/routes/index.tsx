import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Chrome, Download, Eye, Folder, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Install Brain Bank — pinned inspiration widget for Chrome" },
      {
        name: "description",
        content:
          "Download and install the Brain Bank Chrome extension. A floating rotary widget pinned to every page for saving design inspiration into color-coded folders.",
      },
      { property: "og:title", content: "Install Brain Bank for Chrome" },
      {
        property: "og:description",
        content:
          "A floating rotary widget pinned to every page. Save screenshots, recordings, and references into color-coded folders without ever leaving the tab.",
      },
    ],
  }),
  component: InstallPage,
});

function InstallPage() {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const download = () => {
    setDownloadError(null);
    setDownloading(true);
    fetch("/brain-bank-extension.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "brain-bank-extension.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err: Error) => setDownloadError(err.message))
      .finally(() => setDownloading(false));
  };


  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
            <span className="h-2 w-2 rounded-full bg-background" />
          </div>
          <span className="font-semibold tracking-tight">Brain Bank</span>
        </div>
        <a
          href="https://docs.lovable.dev"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Docs
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-24 pt-12">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          Chrome extension · Manifest V3
        </p>
        <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight">
          Pin Brain Bank to every page in Chrome.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground">
          A floating rotary widget docks in the bottom-left of every tab. Hover
          to fan out folders, click the center node for the dashboard, and save
          screenshots or recordings without ever leaving the page.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {downloading ? "Preparing…" : "Download extension (.zip)"}
          </button>
          <Link
            to="/preview"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            <Eye className="h-4 w-4" /> Preview without installing
          </Link>
        </div>
        {downloadError && (
          <p className="mt-3 text-sm text-destructive">{downloadError}</p>
        )}

        <section className="mt-14">
          <h2 className="text-2xl font-semibold tracking-tight">Install in 4 steps</h2>
          <ol className="mt-6 space-y-5">
            {[
              {
                title: "Unzip the download",
                body: "Double-click brain-bank-extension.zip. You'll get a folder called brain-bank-extension/.",
              },
              {
                title: "Open chrome://extensions",
                body: "Paste chrome://extensions into a new tab. This works in Chrome, Edge, Brave, Arc, and Opera.",
              },
              {
                title: "Enable Developer mode",
                body: "Look in the top-right corner of the chrome://extensions page for the Developer mode toggle and switch it on. New buttons (Load unpacked, Pack extension, Update) will appear in the top-left once it's enabled.",
              },
              {
                title: "Click \u201cLoad unpacked\u201d",
                body: "Pick the unzipped brain-bank-extension folder. Brain Bank will appear pinned to every page you open.",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Chrome,
              title: "Lives in every tab",
              body: "Content script injected on every URL via a Shadow DOM so host CSS can't bleed in.",
            },
            {
              icon: Folder,
              title: "Persistent storage",
              body: "Folders and items sync across tabs via chrome.storage.local — no account required.",
            },
            {
              icon: Sparkles,
              title: "Local-only",
              body: "Everything stays on your machine. No telemetry, no backend, no sign-up.",
            },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-5">
              <f.icon className="h-5 w-5 text-foreground" />
              <p className="mt-3 font-medium">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
