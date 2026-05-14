# Week 6 - C5 Data Visualization

## Competency Claim: C6- Data Visualization

**What it means:** Building charts that make a specific argument clearly. Choosing a chart type that fits the data structure and the question. Publishing the analysis as a Jupyter notebook on GitHub so someone else can read it and follow the reasoning.

**What counts as evidence:**

At least one chart generated in Python (matplotlib, seaborn, or pandas .plot())
A written justification for why you chose that chart type for that data
A Jupyter notebook published on GitHub with code, output, and markdown cells that explain what you found

## How I Did That 

In `week6_mp1_starter.ipynb`, I fulfilled C6 by building three Python charts with Plotly that each support a specific analytical finding from my League of Legends Support pick dataset (`support_picks.csv`). Every chart is tied to a research question, uses a title that states the finding rather than just the variable names, and includes labeled axes.

For **Question 1** (most played Support champion), I used a **vertical bar chart** (`px.bar`) with champions on the x-axis and pick count on the y-axis, sorted from most to least picked. I chose this chart type because pick popularity is a categorical comparison, and bar height makes differences in pick rate easy to scan. The chart argues that **Lux is the most picked Support in Bronze IV ranked games** in my sample.

For **Question 2** (win rate among the top 3 most-picked Supports), I used a **horizontal bar chart** with win rate (%) on the x-axis and the three champions on the y-axis, scaled from 0–100%. I chose a horizontal layout because there are only three values to compare, and a list-style layout helps the reader quickly see that **Morgana has the highest win rate among the top 3**, even though Lux is picked more often.

For **Question 3** (highest Support win rate overall), I first tried a bar chart of win rates alone, but revised it to a **scatter plot** (`px.scatter`) after realizing it hid sample size. The final chart plots **games played** on the x-axis and **win rate (%)** on the y-axis, with one point per champion that met a 30+ pick threshold. I chose this chart type because win rate alone can be misleading without context; the scatter plot lets the reader see both **which champion has the highest win rate (Pyke)** and **how many games that estimate is based on**.

Below each chart, I wrote a markdown **Chart rationale** explaining why I chose that chart type and what I want the reader to take away. The notebook also includes the pandas code that prepares each dataset, the rendered chart output, and markdown interpretation cells in Sections 3–5 that connect the visuals back to my research questions and limitations. The completed notebook is published in my GitHub repository as the readable artifact for this assignment.

## My Learnings
1. The first draft of my analytical questions from my initial MP1 proposal were very ambitious... I had a vague idea of what kinds of analysis I would be able to do with my returned data, but didn't realize that practical limitations like API call limits, the time it takes to fetch that data, and storage limitations would be as big of a constraint as they were.
2. You can't just make everything a bar graph! I believe a reliable data visualization should be able to convey the context of how those analytical findings came to be, which is what I tried to do with my third scatter plot. The first iteration of this specific visualization was actually a line graph, but I realized quickly that those kinds of graph are really only effective when you plot them against time (which wasn't a very significant data point for my analytical questions). TLDR; Different graphs are good for different things, and you'll know you picked the wrong one if they look funny! 
