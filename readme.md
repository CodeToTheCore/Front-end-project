# Code To The Core Music Store

Welcome to Code To The Core Music Store, a music-themed website built to showcase my front-end skills. This was my front-end portfolio project in the Pursuit Fellowship (November 2023).

**Live site:** https://codetothecore.github.io/Front-end-project/

## What it does

- **Search any artist.** Results come from the iTunes Search API, with album covers and a 30-second preview of every song.
- **Load Records.** Shows a full album cover for each artist in the Top Artist list. Covers appear as each one loads, so one slow request can't hold up the rest.
- **Album pages.** Click any record to see its big cover and **every song on the album**, each with a preview player and "Play all."
- **My Playlist.** Tap "+ Playlist" on any song. The playlist is saved in your browser and plays straight through, one song after another.
- **Core Music.** A player page for my own tracks as CoreTheProducer.
- **About Core.** My producer page, with animated headings and the studio tools I use.

iTunes only provides 30-second previews, not full songs; that's how Apple licenses its API. Only one preview plays at a time.

## Pages

| Page | File |
| --- | --- |
| Record Store (home) | `index.html` |
| Album (every song) | `record.html?album=<id>` |
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
