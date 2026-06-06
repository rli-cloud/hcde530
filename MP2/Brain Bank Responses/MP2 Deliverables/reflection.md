# MP2 Reflection
## Ruofu Li || HCDE 537 || Spring 2026

### What did I build? 

Brain Bank is a bookmark and inspiration-capture tool for designers who collect references across the web. It ships as a Chrome extension (Manifest V3) and a live web preview, both built in Lovable. On every page, a small circular dial sits pinned in the corner. Mouse hover fans out color-coded folder icons; click the center node and the widget expands into a full menu with folders, a dashboard link, and a new-folder action. Saved items are screenshots or screen recordings, tagged and annotated, browsable in a Pinterest-style masonry folder view or a full dashboard of folder cards. 

Everything stays local—`chrome.storage.local` in the extension, `localStorage` in the preview—with no backend, sign-up, or telemetry. The content script renders inside a Shadow DOM so host-page styles cannot break the UI.

A more detailed description of this widget can be found in `README.md`. 

--- 

### What decisions did I make? 

I originally scoped MP2 as a native macOS widget in Cursor and Xcode, but switched to Lovable when I realized Cursor could not give me the dial reveal and hover interactions I had in mind. The widget’s backend was lighter than I expected, so a browser extension fit better than a desktop app. 

Lovable’s first output was a webpage that marketed the features of the widget with an embedded demo, but without actually creating a downloadable widget. In future iterations, I clarified my intent for a real extension deliverable added a live preview so I could iterate without re-downloading files each time.

Aside from switching from a macOS native widget to a Chrome extension, the scope of the features included largely stayed the same. Most of the iterations adjustments I made had to do with making click flows more ergonomic and refining micro-interactions for a smoother user experience. 

Additionally, while I decided to switch from Cursor to Lovable to better create the visual interactions I had in mind, I returned to pivot when it became clear that Lovable was unable to resolve the technical issues I had with discrepancies between its live preview and the way the widget actually looked when it was run locally. 

---

### What would I do differently? 

Before jumping right into my AI-powered prototyping tool of choice, I wish I started out with a concrete information architecture and user flow of my tool, including a description of all the major features I wanted to include. I spent a lot of time at the beginning going back-and-forth with the agent, trying to get a feel for what I actually wanted, and much of that time (and those tokens) could've been saved if I just took an extra 10 minutes to write everything out on paper before prompting it. 

While I'm pretty satisfied with what I have now, I also wish I could've added live integrations to my widget that connected it to popular inspiration websites like Pinterest, Mobbin, Are.na, and Dribbble, so that users can truly see all their saved references in one place rather than relying on pure user-input. 

---

### What does this work demonstrate? 

This project maps to the three competency domains from my claims in `mp2.md`, of which are abridged below: 

**C1 (Vibecoding and Rapid Prototyping):** 

I built and deployed a working widget in Lovable from plain-language specs, iterated on click flows and interactions, and learned that precise prompts (angles, speeds, layout) beat broad ones—especially for the dial reveal. 

Evidence:
* Built the widget and live preview in Lovable from a feature breakdown, then iterated on click flows, interactions, and candidate features.
* Redirected the deliverable from a webpage with an embedded demo to a downloadable Chrome extension, and added a live preview so iterations did not require re-downloading files.
* Refined the dial reveal by shifting from broad prompts to precise ones—pixel adjustments, interaction types, and locking folder angles (e.g. 90°, 135°, 180°).
* Shipped a working prototype at [muse-hub-widget.lovable.app](https://muse-hub-widget.lovable.app).

**C7 (Critical Evaluation and Professional Judgement):** 

I did not accept the agent’s claim that media lived in Lovable Cloud; I verified it used browser local storage, which matters for privacy and for any real client conversation about data handling.

Evidence: 
* Proactively asked how images and recordings were stored because I had not specified storage anywhere in the project.
* Questioned the agent’s initial answer (Lovable Cloud) because the extension runs locally after download, then re-asked and confirmed the actual implementation: browser `localStorage`, with no Supabase, cloud bucket, or server-side storage.
* Used Lovable’s Plan feature to review proposed changes before applying them, so I could clarify intent and adjust steps as needed.

**C8 (Building and Deploying a Complete Tool):** 

Brain Bank is deployed and usable as a loadable Chrome extension plus live preview at muse-hub-widget.lovable.app, and not as a mockup on my machine alone. The dial, folder modal, and dashboard together solve a real HCD workflow: less tab-hopping through Pinterest, Are.na, and Mobbin, more time designing with references at hand.

Evidence: 
* Scoped and shipped a Chrome extension that aggregates design inspiration across websites, with a live preview ([/preview](https://muse-hub-widget.lovable.app/preview)), home page, download files, and documentation in `README.md`.
* Pivoted from a planned macOS/Xcode widget to Lovable when the backend proved lighter and visual interactions mattered more than native desktop APIs.
* Refined the central-node dial reveal through smaller, explicit iteration steps after vague prompts failed on positioning, reveal order, and transition speed.
* Troubleshot a preview-vs-Chrome UI misalignment in the windowed folder view by switching to Cursor when the issue looked technical rather than visual.

You can read a more detailed version of these competency claims in `mp2.md`. 