# Python Script Walkthrough (Week 2)

This document explains `demo_word_count.py` section by section and also notes the companion script `app_review_word_count.py`.

## 1) File Header and Script Intent

- **Where:**
```python
# This script counts the number of words in each response in the CSV file
# Usage:
# python demo_word_count.py
```
- **Purpose:** state what the script does (counts words in CSV responses) and how to run it.
- **Why it matters:** sets context before reading implementation details.

## 2) Import

- **Where:**
```python
import csv
```
- **Purpose:** uses Python's built-in CSV module (no external dependencies).
- **Why it matters:** supports the "easy to run" requirement for class evaluation.

## 3) Input Setup

- **Where:**
```python
filename = "demo_responses.csv"
responses = []
```
- **Purpose:** defines source file and prepares a container for loaded rows.
- **Why it matters:** keeps file path explicit and data flow easy to follow.

## 4) CSV Loading Block

- **Where:**
```python
with open(filename, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        responses.append(row)
```
- **Purpose:** opens the CSV with UTF-8 encoding, reads rows using `csv.DictReader`, and stores each row as a dictionary.
- **Why it matters:** dictionary keys (`participant_id`, `role`, `response`) make later code more readable than index-based access.

## 5) Word Count Function

- **Where:**
```python
def count_words(response):
    return len(response.split())
```
- **Purpose:** encapsulates word-count logic in a reusable function.
- **Why it matters:** separates processing logic from printing logic and improves clarity.

## 6) Output Header

- **Where:**
```python
print(f"{'ID':<6} {'Role':<22} {'Words':<6} {'Response (first 60 chars)'}")
print("-" * 75)
```
- **Purpose:** prints aligned column labels and a separator line.
- **Why it matters:** makes console output scannable during grading.

## 7) Summary Data Container

- **Where:**
```python
word_counts = []
```
- **Purpose:** stores each response's count for later aggregate statistics.
- **Why it matters:** enables min/max/average calculations after row processing.

## 8) Row-by-Row Processing Loop

- **Where:**
```python
for row in responses:
    participant = row["participant_id"]
    role = row["role"]
    response = row["response"]
    count = count_words(response)
    word_counts.append(count)
```
- **Purpose:** processes each response record in sequence.
- **What happens inside:**
  - extracts `participant_id`, `role`, and `response`
  - computes `count = count_words(response)`
  - appends `count` to `word_counts`
  - truncates long responses to a 60-character preview for clean display
  - prints one formatted line per participant
- **Why it matters:** this is the core transformation from raw text data to interpretable output.

## 9) Final Summary Statistics

- **Where:**
```python
print("── Summary ─────────────────────────────────")
print(f"  Total responses : {len(word_counts)}")
print(f"  Shortest        : {min(word_counts)} words")
print(f"  Longest         : {max(word_counts)} words")
print(f"  Average         : {sum(word_counts) / len(word_counts):.1f} words")
```
- **Purpose:** reports total responses, shortest response, longest response, and average response length.
- **Why it matters:** provides quick, high-level insights beyond individual rows.

## Run Instructions

- In `Week 2/`, run: `python3 demo_word_count.py`
- Expected result: table-style row output followed by a summary section.

## Additional Script: app_review_word_count.py

- **Purpose:** provides a standalone example with 50 made-up app reviews, per-review word counts, and summary statistics.
- **Why included:** demonstrates the same analysis pattern on synthetic review data for assignment extension/practice.
- **Run:** `python3 app_review_word_count.py`
