# Wrkshets

Free printable PDF worksheets for autistic adults. Pick an activity, choose a level, and download a PDF — no sign-up, no ads, and nothing leaves your computer (PDFs are made in the browser).

## Levels

Every activity has six levels. Choose the one that feels comfortable rather than one that matches age.

| Level | Roughly matches |
| --- | --- |
| 1 | Pre-K and Kindergarten |
| 2 | Grades 1–2 |
| 3 | Grades 3–4 |
| 4 | Grades 5–6 |
| 5 | Grades 7–8 |
| 6 | High school and adult |

## Activities

| Group | Activity | Level 1 → Level 6 |
| --- | --- | --- |
| Word puzzles | **Word Search** | 7×7 grid, across/down → 18×18, any direction |
| | **Word Scramble** | short words with hints → long words, no word bank |
| | **Code Breaker** | A = 1 number code → cryptogram with one letter given |
| Logic and drawing | **Sudoku** | 4×4 → 6×6 → 9×9 (every puzzle has exactly one solution) |
| | **Maze** | 6×7 → 28×36 |
| | **Connect the Dots** | 15 pictures, ~10 → ~60 dots, numbered or lettered |
| Math and life skills | **Math Practice** | adding within 10 → fractions, decimals, percents, negative numbers, order of operations, equations, exponents and roots |
| | **1 2 3 4** | trace numbers, missing numbers, count shapes |
| | **Telling Time** | read the clock / draw the hands / elapsed time, o'clock → any minute and 24-hour time |
| | **Money** | count coins → change, shopping, tax, discounts, budgets, interest (US, Canadian, Australian dollars, pounds, euros) |
| Reading and writing | **ABC** | trace letters, missing letters, ABC order, match big and small letters |
| | **Spelling Practice** | trace and write short words → long words used in sentences |
| | **Writing Prompts** | sentence starters → paragraphs → essays with a planning section |
| | **Mixed Pack** | six activities chosen to suit the level |

Options: 19 word topics (everyday life plus science, space, the human body, technology, countries and challenge vocabulary) or your own word list, 1–20 pages, answer key pages, large print, Name/Date lines, US Letter or A4.

## Design choices

Worksheets are made for adults, not children: plain, literal instructions; one task per page; lots of white space; no cartoons, timers or scores. The website uses muted colours, no animation, large buttons, and supports dark mode and keyboard use.

## Running it

It's a static site with no build step. Open `index.html` in a browser, or host the folder anywhere (for example GitHub Pages: **Settings → Pages → Deploy from a branch**, choose this branch and `/ (root)`).

## Code

- `js/data.js` – word topics
- `js/shapes.js` – connect-the-dots pictures (outlines in a 100×100 box)
- `js/puzzles.js` – seeded puzzle generators for the original activities (pure logic, no drawing)
- `js/types/*.js` – one file per newer activity (math, time, money, sudoku, maze, cryptogram, spelling, writing); each registers itself with `WS.registerType`
- `js/pdf.js` – draws pages with [jsPDF](https://github.com/parallax/jsPDF) (vendored in `js/vendor/`, MIT licence)
- Preview pages are drawn with [PDF.js](https://github.com/mozilla/pdf.js) (vendored in `js/vendor/`, Apache 2.0 licence), so the preview also works on phones
- `js/app.js` – page controls, preview and download

Test: `node tests/smoke.js` builds every activity at every level and checks the puzzles are valid (sudoku uniqueness, maze paths, arithmetic).
