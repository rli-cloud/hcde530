# Week 2 — Competency 2: Code Literacy and Documentation

This note captures how this week’s work meets **Competency 2 (Code Literacy and Documentation)** for HCDE 530.

## What “code literacy” looked like for me this week

- I worked through the Python scripts **block by block**, explaining what each part does (data loading, counting words, printing tables, summary statistics) through inline comments rather than treating the file as a black box.
- I documented those explanations in **`CONTEXT.md`**, which maps sections of `demo_word_count.py` to purpose and includes short code excerpts so an instructor can scan the logic quickly.
- I used **Cursor** (chat and inline help) to clarify lines or patterns I did not fully understand, then folded that understanding back into my own explanations.

## Documentation strategy (primary artifact)

- The main deliverable for showing literacy and documentation is a **written walkthrough in its own file**. This file (`week2.md`) summarizes the competency story; **`CONTEXT.md`** is the detailed section-by-section walkthrough of `demo_word_count.py`, with run instructions and a pointer to the companion `app_review_word_count.py` script.

## Challenge and how I addressed it

- The hardest part was **learning Cursor’s interface** and using **chat** to assemble a coherent reading of the Python script—connecting new syntax to what I already know from **HCDE 524** and prior programming exposure.
- My approach was to alternate: read a block, ask targeted questions when stuck, then document the behavior in plain language so the next reader (including my instructor) does not need to repeat that discovery work.

## Related files in this folder

| File | Role |
|------|------|
| `CONTEXT.md` | Detailed walkthrough of `demo_word_count.py` (+ note on `app_review_word_count.py`) |
| `demo_word_count.py` | CSV-based word counts and console summary |
| `app_review_word_count.py` | Synthetic app reviews; same analysis pattern |
| `dashboard.html` | Optional browser view of CSV-derived summaries |
