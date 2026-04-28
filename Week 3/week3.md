# Week 3 - C3 Data Cleaning and File Handling

## Competency Claim: C3 - Data Cleaning and File Handling

**What it means:** Loading messy real-world data with Python, finding what is broken, and fixing it so the script runs cleanly on any valid input. Reading error messages as diagnostic information. Writing scripts that produce consistent, repeatable output.

## My Response

### 1) Loading and Cleaning Messy Data
- In `clean_responses.py`, I load the messy input file (`week3_survey_messy.csv`) with `csv.DictReader` and validate that the expected schema exists before processing.
- I clean key fields by trimming whitespace in `participant_name` and normalizing `role` values to uppercase for consistent downstream analysis.
- I skip invalid records (blank names) instead of letting bad rows propagate into analysis files.

### 2) Finding Breaks and Using Errors Diagnostically
- I traced a `ValueError` and skipped it so the script could continue running but still made sure to flag it in the console log and include it in the average years of experience. 
- This wasn't flagged as a console error, but I also corrected sort behavior to return highest satisfaction scores using descending sort.
- I added explicit checks and meaningful exceptions (`FileNotFoundError`, `ValueError`) so failures are immediate and informative, rather than silent.

### 3) File Handling and Repeatable Outputs
- My scripts use `pathlib.Path` and deterministic read/write steps so they run consistently from valid inputs.
- I write cleaned and analyzed files with fixed headers and stable transformations, producing repeatable artifacts such as:
  - `responses_cleaned.csv`
  - `week3_cleaned_analysis.csv`
- I kept an intentionally incorrect output (`wrong_week3_cleaned_analysis.csv`) as a comparison artifact to verify that later fixes corrected behavior.

### 4) Reflection and Learnings
- I got better at treating errors as debugging clues rather than blockers.
- I learned that when writing scripts, it's important to take a look at the raw data before diving straight into the script. Because there's so many ways someone could respond to a question (ex: strings vs. integers), it's important to know what you're dealing with first so you know what kinds of edge cases to account for in the code. 
- Human review of code outputs is still important, because sometimes the code will run perfectly but still return something you weren't exactly looking for (ex: correcting sort order). 
- I also learned that "clean output" is not enough on its own; repeatability matters, so my process now emphasizes deterministic transformations and consistent output files.
