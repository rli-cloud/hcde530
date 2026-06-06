// Inspo content script entry point.
// Mounts the React widget into a Shadow DOM attached to <html>, so the
// host page's CSS never touches the widget and vice versa. The widget
// uses position:fixed at z-index 2147483646 so it sits above everything.

import { createRoot } from "react-dom/client";
import { ExtensionRoot } from "@/components/ExtensionRoot";
import { StrictMode } from "react";

const HOST_ID = "brain-bank-extension-host";

function mount() {
  if (document.getElementById(HOST_ID)) return;

  const host = document.createElement("div");
  host.id = HOST_ID;
  // Reset every inheritable style from the host page.
  host.style.all = "initial";
  host.style.position = "fixed";
  host.style.inset = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.pointerEvents = "none";
  host.style.zIndex = "2147483646";
  document.documentElement.appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });

  // Inject the bundled Tailwind CSS.
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = chrome.runtime.getURL("content.css");
  shadow.appendChild(style);

  // Mount React inside a wrapper that re-enables pointer events for the widget.
  const mountPoint = document.createElement("div");
  mountPoint.style.pointerEvents = "auto";
  shadow.appendChild(mountPoint);

  createRoot(mountPoint).render(
    <StrictMode>
      <ExtensionRoot />
    </StrictMode>,
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}
