# MP2 - Brain Bank Widget

## Competency Claims: 
* C1 - Vibecoding and Rapid Prototyping 
* C7 - Critical Evaluation and Professional Judgement 
* C8 - Building and Deploying a Complete Tool 

--- 

### C1 - Vibecoding and Rapid Prototyping 

**What it means:**

Using Lovable, Bolt, or a similar generative tool to build and deploy working web applications from plain-language descriptions. Iterating on the output. Making judgment calls about what the tool got right and what it got wrong.

**How I did that:**

I created my widget and a live preview of it in Lovable, starting with a comprehensive breakdown of the features that I wanted to see in it and iterating to refine the prototype afterwards. This included testing out different click flows, interactions, and potential features. 

The output I got from Lovable was interesting because the artifact it created was actually a webpage, structured like it was advertising the tool with a live demo embedded in it. However, I wanted the deliverable to be an actual browser extension instead of a webpage, so I made sure to specify that in future iterations, later adding a live preview as I developed the prototype so I wouldn't have to download new files with each iteration. 

While I started creating my prototype with broadly plain-language, switching to more precise language (such as exact pixel adjustments and interaction types) was much more effective at refining what I already had. 

Here's the live preview link of my Lovable prototype: https://muse-hub-widget.lovable.app

**My learnings:** 

I was kind of a Lovable hater when I first used it during our very first class, but it really is a good tool for rapid prototyping. I think it was just having an off day that first time. However, I don't know if I would stay on Lovable once I have a proof-of-concept fleshed out, because while it's really fast at creating the first 80% of a prototype, it starts taking some more time and elbow grease to refine it after that; it really plateaus off. It would be a lot faster to generate a specification file and port it to another tool to manually make adjustments. 

The video that we watched about best practices for prompting AI agents in Week 9 also became really helpful as I kept working. Specific prompts, starting new chats to refresh the context window, and creating `task.md` and `.cursorrules` files were all extremely helpful; I kind of wish we knew about them at the beginning of the quarter too! 

---

### C7 - Critical Evaluation and Professional Judgement 

**What it means:**

Evaluating AI-generated output before acting on it. Deciding what to trust, what to verify, and what to push back on. Being able to explain your confidence level to a stakeholder — not just "the tool said so," but what you checked and why.

**How I did that:**

Because my widget involves storing images and recordings, I wanted to know what storage method Lovable used when it was creating the prototype because I didn't specify it anywhere. It initially told me that all of the image and recording content was stored in Lovable's Cloud, but that didn't make sense to me because the user has to download the files for the widget and run it locally for it to actually work. Upon asking the agent to clarify this again, it apologized for giving a wrong answer; the widget actually uses the browser's localStorage, because it has no Supabase integration, cloud bucket, or server-side storage. 

If I was creating a proof-of-concept for a real product, this is definitely something I'd make sure I had an answer for if I was asked this question during a meeting with a client. If I didn't have the foresight or the technical knowledge to know the difference between cloud storage and local storage (and even what my other options are), I would've assumed that everything was stored in Lovable's Cloud and made engineering decisions based on that assumption. 

Additionally, I also used Lovable's Plan feature prolifically, so that I can review what changes were going to be made based on my prompts. This way, I was able to clarify my intent and adjust any steps as needed. 

**My learnings:**

AI likes to make up a lot of fluff, so it's important to clarify expectations with the agent periodically. This especially applies to aspects of a project that haven't been explicitly dictated, where technical experience gives you the judgement to know what to look for and where to check things. 

---
### C8 - Building and Deploying a Complete Tool 

**What it means:** 

Scoping a project that does something real for a real HCD use case, building it, and shipping it. This is the MP2 domain. "Complete" means deployed and usable, not just working on your machine. The reflection matters as much as the tool — you should be able to explain what you built, what you would do differently, and what the tool actually does for a user.

**How I did that:** 

The evidence for this competency claim can be found in my MP2 submission. My MP2 is a Chrome extension created on Lovable that allows users to aggregate their design inspiration across several different websites into one place, so that less time is spent navigating design references and more time is spent actually designing. The live Lovable preview can be found at https://muse-hub-widget.lovable.app/preview, and an overview of what the widget is and how to use it can be found at https://muse-hub-widget.lovable.app/ with its associated download files. Additionally, more detailed information about this project can be found in `README.md`. 

I actually started this project with the intention of making it a macOS native widget using Cursor and Xcode, but quickly realized that Cursor wasn't going to be able to give me the visual interactions I had in mind. Even though my project has both a backend and a frontend interface, Lovable ended up being the best option because the widget's backend wasn't as intense as I first thought. The biggest issue I ran into on Lovable was refining the dial reveal transition that occurs when you click on the central node of the widget to expand and see all folders. This definitely occurred because my initial prompts were too vague in terms of positioning, reveal order, and transition speed. Even though it took a couple tries, I was able to refine my prototype by using more exact language and working in smaller steps (such as telling the agent to lock the initial 3 folders at 90, 135, and 180 degrees). 

Another issue I encountered was the misalignment of UI and specific interactions with the windowed view of folder contents, because the widget looked different in the Lovable preview than it did when I actually tried to run it on Chrome myself. While the widget is technically still usable, it took some more back-and-forth with the agent to try and troubleshoot why this misalignment was occurring. Because this issue seemed more like a technical one than a visual/design issue, I pivoted to Cursor to resolve it. 

**My learnings:** 

1. I am so grateful for Lovable and Cursor's undo buttons. 
2. Having a clear idea of the features you want to include and your product strategy is everything, not only to save credits but also to be able to prompt with more precise language (which in turn helps the agent perform better). 
2a. Having a clear idea of your features, the structure of the project, and product strategy is also important because it heavily affects what kind of AI tool you'll use too; when I still thought I wanted to make a macOS widget, I chose Cursor because it would be better at helping me write Swift files in Xcode. 
3. Understanding when it's time to switch tools is just as important as having a selecting ther right tool and having a well-fleshed out AI-integrated workflow. When I wasn't sure if Lovable could handle developing the backend of my widget, I was prepared to port everything back to Cursor and built it out there. I did this when I ran into technical issues when my actual widget looked different from its live preview. 

