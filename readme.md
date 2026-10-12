# Code To The Core Music Store

Welcome to Code To The Core Music Store, a music-themed website built to showcase my front-end skills. This was my front-end portfolio project in the Pursuit Fellowship (November 2023).

**Live site:** https://codetothecore.github.io/Front-end-project/

## What it does

- **Search any artist.** Results come from the iTunes Search API and show as record cards with cover art.
- **Load Records.** Pulls one album for each artist in the Top Artist list.
- **Record details.** Click "View details" on any card to see the artist, album, genre, year, and a 30-second preview.
- **Core Music.** A player page for my own tracks as CoreTheProducer.
- **About Core.** My producer page, with animated headings and the studio tools I use.

## Pages

| Page | File |
| --- | --- |
| Record Store (home) | `index.html` |
| Record Details | `record.html` |
| Core Music | `Music.html` |
| About Core | `Core.html` |

## Built with

HTML, CSS (Grid, Flexbox, `:hover` effects, animations), JavaScript (DOM events, `fetch`, Promises), and the [iTunes Search API](https://performance-partners.apple.com/search-api).

## Setup instructions

1. Clone the repo:
   ```bash
   git clone https://github.com/CodeToTheCore/Front-end-project.git
   cd Front-end-project
   ```
2. Open `index.html` in your browser, or serve the folder locally:
   ```bash
   python3 -m http.server
   ```
   Then go to http://localhost:8000.

No API key is needed.

See [proposal.md](proposal.md) for the user stories.
