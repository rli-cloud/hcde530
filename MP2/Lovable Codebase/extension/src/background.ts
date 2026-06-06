// Brain Bank background service worker.
// Currently a no-op — kept as a stable target so manifest.json doesn't drift,
// and ready to host any future cross-tab orchestration (alarms, sync, etc).
self.addEventListener("install", () => {
  // Activate immediately on update.
  // @ts-expect-error: skipWaiting exists on the SW global
  self.skipWaiting?.();
});

self.addEventListener("activate", () => {
  // Claim open tabs so they get the new content script on next navigation.
  // @ts-expect-error: clients exists on the SW global
  self.clients?.claim?.();
});

// Clicking the toolbar icon could open the dashboard in the active tab.
// For now, the user opens it via the rotary widget on any page.
chrome.action?.onClicked?.addListener?.(async (tab) => {
  if (!tab.id) return;
  await chrome.tabs
    .sendMessage(tab.id, { type: "BRAIN_BANK_OPEN_DASHBOARD" })
    .catch(() => undefined);
});
