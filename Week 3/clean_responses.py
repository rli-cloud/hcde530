import csv
from pathlib import Path #knows how to deal with files that work in the local operating system

#variables with values as file paths
INPUT_FILE = Path("week3_survey_messy.csv")
OUTPUT_FILE = Path("responses_cleaned.csv")

#function that actually cleans the file and writes the cleaned file to the output path
def clean_csv(input_path: Path, output_path: Path) -> None: #-> None is a type hint that says the function returns nothing
    #checks if the input file exists
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    #opens the input file and reads it into a dictionary
    with input_path.open("r", newline="", encoding="utf-8") as infile: #infile is a variable that is the input file, only exists within with functions and part of Python syntax
        #reads the file into a dictionary
        reader = csv.DictReader(infile)
        #gets the fieldnames from the dictionary, DictReader a data structure that reads the csv file into a dictionary
        fieldnames = reader.fieldnames

        if not fieldnames:
            raise ValueError("CSV file has no header row.")
        if "participant_name" not in fieldnames:
            raise ValueError("CSV is missing required 'participant_name' column.")
        if "role" not in fieldnames:
            raise ValueError("CSV is missing required 'role' column.")

        cleaned_rows = []
        for row in reader:
            name = (row.get("participant_name") or "").strip()
            if not name:
                continue

            row["participant_name"] = name
            row["role"] = (row.get("role") or "").upper()
            cleaned_rows.append(row)

    with output_path.open("w", newline="", encoding="utf-8") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cleaned_rows)

    print(f"Cleaned {len(cleaned_rows)} rows -> {output_path}")


if __name__ == "__main__":
    clean_csv(INPUT_FILE, OUTPUT_FILE)
