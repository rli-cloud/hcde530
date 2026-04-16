# Week 3 - C2 Code Literacy and Documentation

## Competency Claim: C2 - Code Literacy and Documentation

**What it means:** Reading code well enough to explain what it does, change it when needed, and document it so someone else (or future you) can follow it. This includes inline comments, docstrings, commit messages, and README content.

## My Response

### 1) Reading and Explaining Code
- I practiced reading Python scripts line by line and explaining what each block does in plain language.
- I learned what a docstring is and used it to formalize the comments I was making for myself throughout my code. This way, it's easier for other people to read and understand my functions. 

### 2) Debugging and Changing Code
- I identified and fixed path-related file errors (`No such file or directory`) by checking working directory and relative paths.
- I traced a `ValueError` caused by converting a non-numeric string (`"fifteen"`) with `int(...)`.
- I updated exception handling with `try/except (ValueError, TypeError)` to prevent crashes and flag invalid data points.
- I corrected sort behavior to return highest satisfaction scores using descending sort.

### 3) Evidence From This Week
- Updated analysis code to handle invalid numeric values without failing.
- Added reusable functions to sort CSV data by columns like `age_range` and `primary_tool`.
- Generated cleaned output files (for example, `responses_cleaned.csv` and `week3_cleaned_analysis.csv`).

### 4) Reflection and Learnings
- I can now read unfamiliar code and explain it in smaller logical pieces.
- I improved at debugging data-quality issues in CSV workflows.
- I learned to document code changes so they are easier for others to understand and reuse.
- I learned how to better stage and commit my code so that commit messages are more applicable to specific files. 
- I realized that it's still important to be familiar with the data that you're writing the script for. I ran into trouble with an initial script I had written to sort the survey responses based on age group, but didn't realize that the age groupings weren't uniform and several overlapped with each other (ex: 25-44 vs. 24-31). I forgot to commit this iteration before changing it, but will be sure to do it next time. 
