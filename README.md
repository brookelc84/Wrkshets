# Wrkshets

Free printable PDF worksheets for autistic adults. Pick an activity, choose a level, and download a PDF — no sign-up, no ads, and nothing leaves your computer (PDFs are made in the browser).

## Activities

| Activity | What it makes |
| --- | --- |
| **Word Search** | Hidden words in a letter grid. Easy = across/down only, Medium adds slants, Hard allows any direction. |
| **Word Scramble** | Mixed-up words to unscramble. Easy shows "starts with" hints and a word bank. |
| **ABC** | Trace the letters · Fill in missing letters · Put words in ABC order · Match big and small letters |
| **1 2 3 4** | Trace the numbers · Fill in missing numbers · Count the shapes · Add and subtract |
| **Connect the Dots** | 15 pictures (house, cat, mug, sailboat, …) with numbered (1 2 3) or lettered (A B C) dots. |
| **Mixed Pack** | One page of each activity. |

Options: 13 everyday word topics (kitchen, grocery store, jobs, getting around, feelings, money, …) or your own word list, Easy/Medium/Hard, 1–20 pages, answer key pages, large print, Name/Date lines, US Letter or A4.

## Design choices

Worksheets are made for adults, not children: plain, literal instructions; one task per page; lots of white space; no cartoons, timers or scores. The website uses muted colours, no animation, large buttons, and supports dark mode and keyboard use.

## Running it

It's a static site with no build step. Open `index.html` in a browser, or host the folder anywhere (for example GitHub Pages: **Settings → Pages → Deploy from a branch**, choose this branch and `/ (root)`).

## Code

- `js/data.js` – word topics
- `js/shapes.js` – connect-the-dots pictures (outlines in a 100×100 box)
- `js/puzzles.js` – seeded puzzle generators (pure logic, no drawing)
- `js/pdf.js` – draws pages with [jsPDF](https://github.com/parallax/jsPDF) (vendored in `js/vendor/`, MIT licence)
- `js/app.js` – page controls, preview and download

Test: `node tests/smoke.js` builds every combination and checks the puzzles are valid.
