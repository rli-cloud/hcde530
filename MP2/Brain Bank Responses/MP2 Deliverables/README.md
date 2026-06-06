# MP2: Brain Bank 
## Ruofu Li || HCDE 537 || Spring 2026

### About 
#### What does this tool do?

Brain Bank is a bookmark tool that allows you to save website inspiration across many different websites, pinned on top of all your pages. Gone are the days that are spent cycling through Pinterest, Are.na, and Mobbin, or clicking through massive bookmark folders looking for specific button interactions on specific websites. When you see something you like, take a screenshot or a screen recording and save it to your Brain Bank!

Brain Bank has three surfaces:

1. **The dial** — a 56 px circular "central node" that lives in the corner of every page. Hover to fan out folder icons; click the center node to expand the full menu (folders + dashboard + new-folder buttons). The widget is draggable and smoothly translates to the center of the page on expand.
2. **The windowed folder view** — a Pinterest-style masonry modal showing all items saved in a folder, with toolbar actions to trigger your OS screenshot tool or upload images / videos.
3. **The dashboard** — a full-page view of every folder as a card grid, with create, rename, recolor, and delete. Folder cards link to a full-page bento view.

Items are saved as screenshots or screen recordings, tagged, annotated, and stored locally (the extension uses `chrome.storage.local`; the web preview uses `localStorage`). No backend, no sign-up, no telemetry.

**Features:**
* Convenient access to saved references via a floating rotary dial pinned to every page
* Customizable, color-coded folders with create, rename, recolor, and delete
* Space to annotate references, tag items, and save links
* Pinterest-style masonry folder view and a full dashboard for browsing all folders
* Tucked away until you need it — draggable dial that expands on demand
* Renders inside a Shadow DOM so host-page CSS can't bleed in

#### How do I run it? 

Brain Bank ships as both a **Chrome extension** (Manifest V3) and a **web preview app** built with TanStack Start on Lovable. It requires a download to your system and access to a Chromium-based browser (Chrome, Edge, Brave, Arc, Opera).

**Prerequisites:**
- [Bun](https://bun.sh/) ≥ 1.0
- A Chromium-based browser to load the extension

**Installation Instructions:** 

1. Download `brain-bank-extension.zip` OR the files in `unzipped-brain-bank-extension` OR the `.zip` file for the extension from the home page. 

2. Follow the steps on the home page to load it in your browser:
   - Open `chrome://extensions`
   - Enable **Developer mode** (top-right)
   - Click **Load unpacked**
   - Select the `extension/dist/` folder

Brain Bank now appears pinned to every page you open. 

**Tech stack:** React 19 + TypeScript (strict), TanStack Start, Tailwind CSS v4 + shadcn/ui, Vite 7, Bun (package manager and extension bundler), Chrome Extension Manifest V3 (Shadow DOM content script).

#### Who is it for? 

This widget is for anyone that needs to save design inspiration and is tired of logging into a million different websites to see them. This might include designers of all kinds (UX, graphic, motion, etc.), UX engineers, or design students. 

### Access 

To preview the widget live without installing, select "Preview without installing" or visit the preview URL below.

Widget Home Page: https://muse-hub-widget.lovable.app/ 

Widget Preview: https://muse-hub-widget.lovable.app/preview/ 

The home page includes the extension installer; the preview page renders the live widget in the browser.
