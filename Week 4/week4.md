# Week 4 - C4 APIs and Data Acquisition

## Competency Claim: C4 - APIs and Data Acquisition

**What it means:** Pulling structured data from a web API using Python. Reading API documentation to understand what endpoints exist, what parameters they take, and what the response looks like. Handling API keys safely — not committing them to a public repo.

## How I Did That 
For A4, I generated a script to call the OpenWeather API using an endpoint and an API key provided to me with my free membership. I chose this data set because I wanted to make sure I understood the basics of using API endpoints, fetching data, extracting fields, and printing that data into readable formats by using something familiar, before moving on to APIs with much more complicated data. 

Before writing the script, I made sure to read the API documentation to determine which fields I wanted to extract. The parameters required for the API call to work included something called a "location query string", which dictates the location of the weather information being called, and an API key. After fetching the data from the API, my script extracted the following fields: current temperature, feels like temperature, and cloud coverage, which I selected as a starting point to test if my script worked. I decided to extract additional fields (city name, date, time, timezone), so that the initial fields I extracted had better context for the viewer. 

The results were then automatically printed into an .csv file. Later, I amended the script to include automatic HTML and CSS generation as well, so that the data is represented in a more user friendly way. 

## My Learnings
1. One of my biggest initial issues was using a different API endpoint (the one that requires a subscription) rather than the one provided to me with my free membership (which I didn't discover until after checking my email). I had network and proxy troubles because Cursor couldn’t reach OpenWeather due to the subscription block, but thankfully the script had included error flags so I knew exactly what the problem was.  
2. In my first iteration, temperature was returned in Kelvins, so I adjusted the script to convert and round those numbers into something usable for people to read. My script didn't actually round the numbers until my third iteration of this block... somehow I didn't realize that weather temperatures were more precise than I initially thought. 
3. When I adjusted my script to call for the timezone, I got a deprecation warning in my terminal which I thought was thoughtful of the API provider to note in the terminal. 
4. I had some extra fun by visually representing the data that I got from the API into a user-friendly weather card, which you can see by opening `weather_card.html` in your browser (probably). It was really cool to see how all these backend processes can link to the frontend processes that I'm more familiar with. 

## Accidentally Exposing My API Key
This was a huge point of confusion for me, but I somehow accidentally exposed my .env file (and thus the API key inside it) when I tried committing my changes to Github. I was really confused because I definitely included .env in my .gitignore file last week, but probably forgot to save it (or something... I don't actually know). The problem is, because Github was blocking my commits for exposing this secret, I was now stuck in an infinite loop of commit and pull blocks. I couldn't pull my changes unless I ran a specific sequence of terminal commands that I got from the Cursor agent, which essentially forced me to drop my local commits, reapply my current file changes, unstage and remove my .env file, and finally stage the "safe" files before I was allowed to commit and push again. Overall, it was just a huge headache and took a lot of back and forth with the Cursor agent. I also generated a new API key just in case and ran the script again to make sure it worked. 