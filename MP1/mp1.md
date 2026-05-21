# Mini Project 1 — Competency Claims (C3–C7)

Evidence for competencies C3 through C7 comes from `MP1_analysis.ipynb`, with data acquisition and cleaning documented in `MP1_dataset_prep.ipynb` where the analysis notebook points to that work.

---

## C3 — Data Cleaning and File Handling

### Competency Claim: C3 — Data Cleaning and File Handling

**What it means:** Loading messy real-world data with Python, finding what is broken, and fixing it so the script runs cleanly on any valid input. Reading error messages as diagnostic information. Writing scripts that produce consistent, repeatable output.

### How I Did That

In `MP1_analysis.ipynb`, I load the cleaned dataset from disk rather than embedding rows in the notebook. Section 2 uses `pd.read_csv` on `support_picks.csv` (9,631 Support-pick rows, 8 columns), then profiles the file with `df.info()`, `df.head()`, `df.tail()`, `df.describe()`, and `df.isnull().sum()` so I can confirm types, row count, and missing values before any analysis runs.

The notebook is explicit that cleaning happened upstream: `support_picks.csv` is the output of a multi-step pipeline (three Riot APIs, Support-only filter, memory-conscious subsetting). In Section 2 I document a concrete data problem I found while building that file—**four Match IDs returned empty JSON objects** from the Match Data API, so those matches were skipped instead of written into the CSV (see section 8ai in `MP1_dataset_prep.ipynb`). That is repeatable handling of bad API responses, not silent failure.

I also used `df.tail()` deliberately to verify I was analyzing the correct artifact (first and last rows match the shape reported by `df.info()`). In Section 3, chart cells guard against out-of-order execution with `RuntimeError` messages (“Run the cell above first…”) so a partial rerun does not produce misleading plots. Section 5 summarizes the full cleaning pipeline: fetch PUUIDs → fetch Match IDs → fetch Match Data → filter to Support picks → save CSV.

### My Learnings

1. Clean data once, analyze many times—profiling in the analysis notebook (`isnull().sum()`, `head`/`tail`) is faster when the heavy fixes already live in the prep notebook.
2. Empty API payloads are a normal failure mode; skipping them and documenting the count is better than writing corrupt rows into a CSV.
3. Template code (`df.describe()`) is not always appropriate—I noted that identifier columns here do not answer my research questions, which is part of reading output critically rather than running cells blindly.
4. When you start reaching data limits, it's time to adjust the code so that more steps in the data fetching/cleaning/storing process are streamlined in the script, rather than saving a new JSON or .csv file for each step. (ex: fetching all Match ID data and filtering it down to just Support picks to store in the .csv, rather than storing ALL match data that was fetched). 

---

## C4 — APIs and Data Acquisition

### Competency Claim: C4 — APIs and Data Acquisition

**What it means:** Pulling structured data from a web API using Python. Reading API documentation to understand what endpoints exist, what parameters they take, and what the response looks like. Handling API keys safely — not committing them to a public repo.

### How I Did That

`MP1_analysis.ipynb` frames the entire project around the **Riot Developer API**, not a class demo dataset. Section 1 states that the analysis rests on three endpoints in sequence: Summoner/League entries (PUUIDs for Bronze IV Solo/Duo), Match IDs by PUUID, and Match Details by Match ID. Section 5 lists the same four-step workflow and points to `MP1_dataset_prep.ipynb` for the implementation.

The HTTP work lives in the prep notebook: `urllib` requests with `X-Riot-Token`, JSON parsed into Python structures, paginated league fetches, and downstream match extraction. The API key is loaded from `Week 5/.env` via a small `load_env` helper (`RIOT_API_KEY` is read from the environment and raises a clear error if missing), so the key is not hardcoded in the notebook. I also documented real API constraints in Section 4—**rate limits**, **~3–4 hours** of fetching for this sample, and a **static snapshot from May 6, 2026**—which explains what the endpoints return and what I chose to keep for analysis.

I revised my research plan when the API could not support it: an early question about cosmetic skin pick rates was dropped because that field is not exposed in the Riot match payload (noted in the dataset prep introduction and reflected in the narrowed questions in Section 1).

### My Learnings

1. API design drives research questions—I changed what I asked based on what the endpoints actually return.
2. Acquisition cost (time, rate limits, storage) is part of the dataset story; the analysis notebook’s limitations section is as important as the charts.
3. Keys belong in `.env`/environment variables, with explicit failure when they are missing, so public repos stay safe.

---

## C5 — Data Analysis with Pandas

### Competency Claim: C5 — Data Analysis with Pandas

**What it means:** Using pandas to answer a real question about a dataset. Filtering rows, grouping, aggregating, handling missing values. Choosing the right pandas operation for what you are trying to find out, and interpreting the result.

### How I Did That

Section 3 of `MP1_analysis.ipynb` answers three defined questions about Bronze IV Support picks using pandas throughout:

| Question | Pandas operations | Finding (interpreted in markdown) |
|----------|-------------------|-----------------------------------|
| **Q1** — Most played Support | `groupby`, `agg` (count), `sort_values`, `nlargest`, `head` | **Lux** is most picked (805), then Morgana and Seraphine; compared to an earlier ~500-match run, rankings held but margins and 4th/5th place shifted (Nami, Leona). |
| **Q2** — Win rate for top 3 picks | `groupby`, `agg` (count + `win` mean), `head`, `sort_values` | Among the top three by volume, win rates cluster near 50%; **Lux** leads slightly (~50.6%) after the larger sample, stabilizing vs. a smaller earlier sample where Morgana looked stronger. |
| **Q3** — Highest win rate with enough games | `groupby`, `agg`, `query` (`pick_count > 20` / `>= 30`), `sort_values`, `assign` | Popularity ≠ performance: **Leona** leads among the top 10 by picks; widening to 20+ or 30+ picks surfaces **tank/off-meta** champions (e.g., Swain, Veigar) with high win rates but lower pick counts. |

Section 2 already uses `read_csv`, `info`, `isnull().sum`, and `describe` to characterize the table. Every question cell is followed by an **Interpretation** markdown cell that explains what the table or chart means for gameplay and for the original hypotheses—not just the numeric output.

### My Learnings

1. `groupby` + `agg` is the right core pattern for “how often” and “how often they win” on the same grouping key (`championName`).
2. `query` on `pick_count` is necessary for fair win-rate comparisons; rare picks swing percentages wildly.
3. Interpretation should reference sample size changes—I explicitly compared this run to the smaller Match ID batch to see whether conclusions were stable.

---

## C6 — Data Visualization

### Competency Claim: C6 — Data Visualization

**What it means:** Building charts that make a specific argument clearly. Choosing a chart type that fits the data structure and the question. Publishing the analysis as a Jupyter notebook on GitHub so someone else can read it and follow the reasoning.

**What counts as evidence:**

- At least one chart generated in Python (matplotlib, seaborn, or pandas `.plot()`)
- A written justification for why you chose that chart type for that data
- A Jupyter notebook published on GitHub with code, output, and markdown cells that explain what you found

### How I Did That

In `MP1_analysis.ipynb`, I built **four Plotly Express charts** (`px.bar`, `px.scatter`), each tied to a research question and titled with the takeaway (not only axis labels):

1. **Question 1 — vertical bar chart** (`px.bar`): top 10 Support pick counts, sorted descending. I chose bars for categorical comparison so the Lux–Morgana gap is easy to see. Interpretation explains off-meta picks in the long tail and notes a future filter (e.g., 20+ picks).

2. **Question 2 — horizontal bar chart** (`px.bar`, `orientation="h"`): win rate (%) for the three most-picked champions. Three categories fit a list-style layout for quick scanning; x-axis fixed to 0–100%.

3. **Question 3 (part 1) — scatter plot** (`px.scatter`): win rate vs. games played for champions with 20+ picks among the popular set. I **replaced an initial bar chart** because win-rate differences were subtle and bars hid **pick count**; the scatter shows champion name, win rate, and volume together (Leona vs. Lux/Morgana story).

4. **Question 3 (part 2) — scatter plot** with `pick_count >= 30`: same rationale—win rate without sample size is misleading; hover/text carry champion labels.

Each chart has a matching **Interpretation** cell describing chart choice and reader takeaway. Sections 1–4 add overview, data profile, analysis, conclusions, and process; the notebook is the published GitHub artifact with code, rendered Plotly output, and markdown narrative.

### My Learnings

1. The first chart type that comes to mind (bar for everything) is not always honest— making sure that the data has been contextualized properly is just as important as picking the right type of chart for your analysis. 
2. Titles should state the finding (“Lux is the most picked…”) so the visualization argues, not just displays.
3. Pair every chart with markdown interpretation and limitations (API snapshot, sample size) so a stakeholder (such as myself) can follow the reasoning without running cells.

---

## C7 — Critical Evaluation and Professional Judgment

### Competency Claim: C7 — Critical Evaluation and Professional Judgment

**What it means:** Evaluating AI-generated output before acting on it. Deciding what to trust, what to verify, and what to push back on. Being able to explain your confidence level to a stakeholder — not just “the tool said so,” but what you checked and why.

### How I Did That

`MP1_analysis.ipynb` shows judgment calls on **tools, templates, and my own earlier outputs**, not blind acceptance:

- **Chart iteration (Question 3):** I generated a bar chart similar to Question 1, saw that win-rate differences were visually flat and that **pick count was missing**, and switched to a scatter plot. I documented that override in the interpretation (“initial iteration… second iteration”).

- **Sample-size skepticism:** For Question 1 and 2, I compared results to a **~500 Match ID** run and explained where rankings stabilized vs. shifted—so conclusions are tied to evidence at two scales, not a single pass.

- **Scope vs. proposal:** Section 1 and Section 5 record that analytical questions were **adjusted** after discovering fetch time, storage, and API limits; “if time allows” items (cross-rank distribution, bot lane pairings) are explicitly deferred with reasons.

- **API feasibility:** The skin-pick question was removed because the Riot payload does not include that field—verifying documentation instead of forcing an unanswerable query.

- **Template pushback:** I kept `df.describe()` from a starter template but wrote that it is **inapplicable** here because meaningful fields are strings/booleans, not the numeric summaries `describe` emphasizes.

- **Execution guards:** Chart cells raise `RuntimeError` if upstream aggregates were not run—avoiding publishing a pretty figure built on stale or empty variables.

- **Honest limitations:** Section 4 states confidence bounds: static May 6 snapshot, Bronze IV only, long fetch time, and hypotheses (smurfs, off-meta) labeled as hypotheses—not facts from the API.

I would not present the win-rate chart titles alone to a stakeholder without checking the printed dataframes: interpretations are anchored to table output (e.g., Lux’s mean win rate vs. Morgana’s in Question 2).

### My Learnings

1. Visual defaults from tools (or from an earlier question’s chart type) can mislead; checking the plotted data against the table is mandatory.
2. Professional judgment includes **what not to ship**—deferred questions and labeled limitations are part of the deliverable.
3. Comparing iterations (small vs. full sample) is a practical way to state confidence without claiming more than the data supports.
