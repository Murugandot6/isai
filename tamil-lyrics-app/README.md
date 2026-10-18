# Isai Padal — Tamil Songs Lyrics Library

Local-first Tamil film lyrics library: **19,080 songs · 3,741 movies · 1,090 singers · 695 lyricists · 871 actors · 1,006 actresses · 375 music directors** — reverse-engineered from the [Tamil Songs Lyrics app](https://play.google.com/store/apps/details?id=com.tamilsongslyrics.android) (REA skill) into JSON, served over localhost, rendered with an Apple DESIGN.md theme.

Live demo (200-song sample, no server needed): enable **GitHub Pages** on `main` → open the site URL.

## Menus

| Menu | What it does |
|------|--------------|
| **Songs** | Browse/search all songs (title, movie, artist). Filters: movie, singer, lyricist. |
| **Lyrics** | Full-text search *inside* lyric lines (`lq` param) — cards show a matching lyric snippet, click opens full lyrics. |
| **Movies** | 3,741 films with posters + song counts — click one to jump to its songs. |
| **Singers / Lyricists / Actors / Actresses / Music Directors** | Entity grids with song counts — click to filter songs. |

## Run locally (full 19,080 songs)

Requires the dataset at `D:\Murugan\songs\` (`songs.json`, `movies.json`, `singers.json`, `lyricists.json`, `actors.json`, `actresses.json`, `music_directors.json`).

```powershell
node D:\Murugan\server.js
# open http://localhost:3000
```

API: `/api/stats` · `/api/songs?q=&lq=&movie=&singer=&lyricist=&actor=&actress=&music_director=&page=&limit=` · `/api/song/:id` · `/api/movies` · `/api/singers` · `/api/lyricists` · `/api/actors` · `/api/actresses` · `/api/music-directors`

Without the server, the site auto-falls back to `sample-data.json` (200 newest songs + derived entities) — search, Lyrics tab, filters and modals all keep working.

## Design

Existing look kept: Apple DESIGN.md system (`DESIGN.md`, `apple.css` layered over `style.css` + `rich.css` + `slim.css`) — Action Blue `#0066cc`, SF Pro stack, pill buttons, parchment/dark-tile cards, frosted slim header, dark-mode toggle. New Lyrics menu reuses the same tab rail, poster cards and pager; lyric matches render as blue-ruled `.lyric-snippet` excerpts.

## Files

`index.html` · `app.js` · `style.css` · `local.css` · `rich.css` · `apple.css` · `slim.css` · `sample-data.json` · `DESIGN.md`
