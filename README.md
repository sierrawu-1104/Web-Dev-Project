# Arbitrage Scanner -- Final Project

**Author: Andy Wu**

---

This project is a website that contains a built in sports betting arbitrage scanner; it basically fetches the odds for current and/or upcoming sporting events in real-time from The Odds API and identifies if there are any opportunities to bet on all outcomes across different sportsbooks for a guaranteed profit. If there are available opportunities, they will be rendered in a table that displays each entry's bet, odds, relevant sportsbooks, ROI percentage, and an automatically calculated stake you should invest based on your total bankroll. This tool is helpful for those who might be interested in arbitrage betting because the API is capable of fetching current data much faster than any person could concievably manually check on each individual book. Additionally, many websites/software applications that currently provide this service (or something similar) are incredibly expensive and impractical for someone just curious about how it works.

Ultimately, this site is inteded to be more of an educational tool than a genuine tool for profit, but the concepts are sound and can be applied in a way that does so if the user wanted.  

---

## VIDEO DEMO LINK:

## WEBSITE LINK (if you don't want to go through the trouble of running locally): 

## TEST API KEY: 
`95e9bad34f1ccbb0d32baa89f2b35e1d`

---

## This site contains:

1. Intuitive web design with a multipage structire and a consistent/easy to understand layout (header, hero banners, panels, footer, input boxes, dropdown menu, etc.)
2. Light/Dark theme toggle that remembers the user preference (using localStorage)
3. Accessibility features such as a skip-to-content link for every page, visible focus outlines, keyboard navigability (tabbing), and high-contrast color schemes that are easy to read
4. Integration with a third-party API (The Odds API) for live sports betting data.
5. Automated arbitrage detection and stake calculation – JavaScript scripts fetch live odds (dynamically updates content based on external API response), automatically compare prices across sportsbooks, and render only the profitable opportunities directly into the table. The script also takes user input and automatically calculates the exact stake distribution for each outcome to guarantee equal profit regardless what wins.

---

## Setup Instructions:

**Note** The Odds API rejects requests automatically if the request origin is null. This means that if you try running the site locally by opening the html files directly in browser, you will be able to see all the content and navigate everywhere, but pressing go on any of the tools will not return anything regardless of user input. To ensure API calls succeed, run the site from a deployed environment so that the request includes a valid origin header. I have also included the link to my deployed site above for this very reason.

---

### IF YOU ONLY WANT TO VIEW:
1. Clone or download the repository.
2. Place files into a folder and open index.html in a web browser.

---

### IF YOU WANT ACTUAL FUNCTIONALITY:
1. Clone or download the repository.
2. Place files into a folder.
3. Deploy the site using whatever service you like (aws, vercel, github pages etc.)
4. Obtain a free API key from The Odds API (https://the-odds-api.com/)
5. Visit your deployed site, and input the API key
6. You're all set! Just fill in all other inputs with your desired values and the scripts should take care of the rest.

---

## STRUCTURE:

├── index.html    (Home page)
├── about.html
├── contact.html
├── nba.html
├── nfl.html
├── mlb.html
├── nhl.html
├── epl.html
├── css/
│ └── styles.css  (Global styles and theme)
├── js/
│ ├── app.js      (Odds API integration + arbitrage calculations)
│ ├── page.js     (Page-specific setup—-detects what sport via body data attribute)
│ └── theme.js    (Theme toggle logic)
└── img/          (Hero images and about me photo)

---

## Credits

- The Odds API for providing live sports odds data.
- Northwestern University CS 396 course staff for guidance.

