# tasks.md — Portfolio Inspiration Widget

A macOS floating widget for saving screenshots and screen recordings into named portfolio inspiration folders.

---

## Phase 1 — Project Foundation
Get the skeleton of the app running with a visible floating panel.

- [ ] **1.1** Create new Xcode project (macOS App, SwiftUI, Swift Package Manager)
- [ ] **1.2** Set `LSUIElement = true` in Info.plist to hide from Dock
- [ ] **1.3** Set up `AppDelegate` with `@NSApplicationDelegateAdaptor` in the SwiftUI App entry point
- [ ] **1.4** Create a borderless, non-activating `NSPanel` that floats above all windows (`NSWindow.Level.floating`)
- [ ] **1.5** Pin the panel to the top-right corner of the main screen on launch
- [ ] **1.6** Add a placeholder menu bar icon (use an SF Symbol) that toggles the widget visible/hidden
- [ ] **1.7** Confirm the panel stays above all windows (including full-screen apps)

---

## Phase 2 — Data Models & Persistence
Define the core data structures before building any real UI.

- [ ] **2.1** Create `Folder` model (`id`, `name`, `path`, `isStarred`, `lastSavedAt`, `createdAt`) — `Codable`
- [ ] **2.2** Create `SavedItem` model (`id`, `folderId`, `filePath`, `type: screenshot|video`, `savedAt`) — `Codable`
- [ ] **2.3** Create `WidgetTheme` struct (`backgroundMaterial`, `accentColor`, `iconStyle`, `cornerRadius`) — `Codable`
- [ ] **2.4** Build `PersistenceService` — save/load folders and items via `UserDefaults`
- [ ] **2.5** Build `FolderViewModel` — CRUD for folders, starring, sorting by recency/starred
- [ ] **2.6** Build `WidgetViewModel` — manages `WidgetState` enum (`resting`, `hovering`, `dialExpanded`, `appOpen`)
- [ ] **2.7** Write basic unit tests for folder sorting logic (starred first, then by `lastSavedAt`)

---

## Phase 3 — Resting Widget & Hover State
The widget's default presence and the first interaction layer.

- [ ] **3.1** Build `RestingCircleView` — small frosted-glass circle in the top-right corner
- [ ] **3.2** Implement hover detection (`onHover`) that transitions `WidgetState` from `.resting` → `.hovering`
- [ ] **3.3** Build `FolderIconView` — single folder represented as an icon with label
- [ ] **3.4** Build `DialView` — lays out up to 3 `FolderIconView`s in a quarter-circle arc around the widget
- [ ] **3.5** Animate the dial fan-out on hover (staggered spring animations per icon)
- [ ] **3.6** Show top 3 folders: starred folders first, then most recently saved-to
- [ ] **3.7** Animate dial collapse when hover ends and no folder was clicked

---

## Phase 4 — Dial Scroll & Full Circle Expansion
Handling more than 3 folders.

- [ ] **4.1** Build `DialScrollControlView` — prev/next buttons styled as rotary dial tick marks
- [ ] **4.2** Implement folder set scrolling: clicking next/prev cycles through folders in groups of 3 with a rotary easing animation
- [ ] **4.3** Show a "stack" indicator when there are more folders beyond the visible 3
- [ ] **4.4** When user clicks the stack indicator: animate widget from corner to screen center
- [ ] **4.5** In expanded state: display all folders in a full 360° circle dial
- [ ] **4.6** On folder selection or ESC/outside click: animate widget back to top-right corner with spring easing
- [ ] **4.7** Ensure return-to-corner animation uses `spring(response: 0.4, dampingFraction: 0.7)`

---

## Phase 5 — Screenshot & Recording Capture Flow
The core capture and file-saving workflow.

- [ ] **5.1** Build `CaptureService` — launches macOS native screenshot toolbar (`Cmd+Shift+5` equivalent via `screencaptureui://` URL or `screencapture` process)
- [ ] **5.2** On folder selection, set that folder as the active destination and trigger `CaptureService`
- [ ] **5.3** Build `FileWatcherService` — uses `DispatchSource` to watch Desktop and Downloads for new `.png`, `.jpg`, `.mov`, `.mp4` files
- [ ] **5.4** When a new file is detected post-capture, move it to the selected folder automatically
- [ ] **5.5** Create a `SavedItem` record and persist it via `PersistenceService`
- [ ] **5.6** Show a brief success toast/confirmation on the widget after save
- [ ] **5.7** Handle edge cases: user cancels capture, file watcher times out after 60s, permission denied

---

## Phase 6 — Expanded App Interface
The full app view when the user wants to manage their folders and inspiration library.

- [ ] **6.1** Build `MainAppView` — opens as a separate window when user clicks "Open App" from the widget
- [ ] **6.2** Build `FolderGridView` — shows all folders as cards with preview thumbnails
- [ ] **6.3** Build folder detail view — shows all saved items in a folder (grid layout)
- [ ] **6.4** Add folder management: create, rename, delete, star/unstar folders
- [ ] **6.5** Add item management: delete items, move items between folders, open in Finder
- [ ] **6.6** Build `SettingsView` — folder default path, theme picker, widget corner preference

---

## Phase 7 — Theming System
Making the visual design swappable without touching individual views.

- [ ] **7.1** Finalize `WidgetTheme` struct with all designable properties
- [ ] **7.2** Inject theme globally via `@EnvironmentObject` from `AppDelegate`
- [ ] **7.3** Audit all views — replace any hardcoded colors/materials with theme values
- [ ] **7.4** Build default "Frosted Glass" theme (`.ultraThinMaterial`, system accent)
- [ ] **7.5** Build a simple theme editor in `SettingsView` (accent color picker, corner radius slider)
- [ ] **7.6** Persist active theme to `UserDefaults`

---

## Phase 8 — Polish & Edge Cases
Making it feel like a real Mac app.

- [ ] **8.1** Add keyboard shortcut to open/close widget (user-configurable in Settings)
- [ ] **8.2** Handle multiple displays — widget should respect which screen the user wants it on
- [ ] **8.3** Handle `NSWorkspace` notifications for sleep/wake — re-pin widget after wake
- [ ] **8.4** Request and handle macOS permissions gracefully: screen recording permission, file access
- [ ] **8.5** Add onboarding flow for first launch: create first folder, grant permissions
- [ ] **8.6** Performance audit: widget should use <1% CPU at rest
- [ ] **8.7** Accessibility: VoiceOver labels for all interactive elements

---

## Backlog / Future Ideas
Not in scope now but worth tracking.

- [ ] Drag-and-drop files directly onto the widget to save to a folder
- [ ] iCloud sync for folders across Macs
- [ ] Tags/search within the app interface
- [ ] Share sheet integration
- [ ] Custom folder icons / colors
- [ ] Export folder as a PDF moodboard

---

## Notes
- **Screenshot tool launch:** Test both `NSWorkspace` URL approach and `Process("/usr/sbin/screencapture")` — the URL approach is cleaner but may require entitlements
- **File watcher timing:** Give the file watcher a 60-second window after capture is triggered; if nothing appears, silently deactivate and notify user
- **Window level:** Test `NSWindow.Level.floating` vs `.statusBar` vs `.screenSaver` — choose the lowest level that reliably stays on top without blocking system UI
