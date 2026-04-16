import csv

# Sort any CSV by primary_tool alphabetically and create new .csv file after sorting 
def sort_by_primary_tool(input_csv: str, output_csv: str) -> None:
    """Read a CSV, sort rows by primary_tool in alphabetical order, and write to a new CSV.
    Arguments:
        primary_tool information in csv file 
    Returns: 
        newly sorted .csv file grouped by primary_tool and organized alphabetically
    """

    # open csv file and read as disctionary
    with open(input_csv, newline="", encoding="utf-8") as infile:
        reader = csv.DictReader(infile)
        fieldnames = reader.fieldnames

        if not fieldnames:
            raise ValueError("CSV file has no header row.")
        if "primary_tool" not in fieldnames:
            raise ValueError("CSV is missing required 'primary_tool' column.")

        rows = list(reader)

# sorts all rows by the "primary_tool" column in alphabetical order 
    rows.sort(key=lambda row: (row.get("primary_tool") or "").strip().lower())

# writes new .csv file, with survey info sorted based on primary tool
    with open(output_csv, "w", newline="", encoding="utf-8") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

def write_cleaned_analysis(input_csv: str) -> None:
    """Sort input CSV by primary_tool and write results to week3_cleaned_analysis.csv."""
    sort_by_primary_tool(input_csv, "week3_cleaned_analysis.csv")

# Load the survey data from a CSV file
filename = "week3_survey_messy.csv"
write_cleaned_analysis(filename)
rows = []

with open(filename, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        rows.append(row)

# Count responses by role
# Normalize role names so "ux researcher" and "UX Researcher" are counted together
role_counts = {}

for row in rows:
    role = row["role"].strip().title()
    if role in role_counts:
        role_counts[role] += 1
    else:
        role_counts[role] = 1

print("Responses by role:")
for role, count in sorted(role_counts.items()):
    print(f"  {role}: {count}")

# Calculate the average years of experience
total_experience = 0
valid_experience_count = 0 #debugging counter

#flag and details for problematic data points, debugging starts here 
has_invalid_experience = False
invalid_experience_rows = []

for i, row in enumerate(rows, start=1):
    try:
     #total_experience += int(row["experience_years"]), original code that was returning ValueError because it was trying to convert a string to an integer
     years = int(row["experience_years"])
     total_experience += years
     valid_experience_count += 1
    except (ValueError, TypeError):
        #bad or missing value: skip, default, or log
        has_invalid_experience = True
        invalid_experience_rows.append({
            "row_number": i,
            "participant_name": row.get("participant_name", ""),
            "raw_value": row.get("experience_years"),
        })
        continue
# flags
if valid_experience_count > 0:
    avg_experience = total_experience / valid_experience_count
else:
    avg_experience = 0
print(f"\nAverage years of experience: {avg_experience:.1f}")
if has_invalid_experience:
    print(f"\nWarning: {len(invalid_experience_rows)} invalid experience value(s) found.")
    for bad in invalid_experience_rows:
        print(
            f"  Row {bad['row_number']} ({bad['participant_name']}): "
            f"experience_years={bad['raw_value']!r}"
        ) #debugging ends here 

avg_experience = total_experience / len(rows)
print(f"\nAverage years of experience: {avg_experience:.1f}")

# Find the top 5 highest satisfaction scores
scored_rows = []
for row in rows:
    if row["satisfaction_score"].strip():
        scored_rows.append((row["participant_name"], int(row["satisfaction_score"])))

scored_rows.sort(key=lambda x: x[1], reverse=True) #adjusted to say that the bottom 5 scores are the highest bc terminal was returning lowest scores
top5 = scored_rows[:5] 

print("\nTop 5 satisfaction scores:")
for name, score in top5:
    print(f"  {name}: {score}")
