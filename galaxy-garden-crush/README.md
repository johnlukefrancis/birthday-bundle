# Galaxy Garden Crush

Galaxy Garden Crush is an offline‑friendly match‑3 puzzle built for the web.  It was created as a birthday gift for Mom, mashing up her favourite things: Candy Crush, gardening, Star Trek, Law & Order and 1970s soul music.  Each level is short (~2 minutes) and replayable, with progressively harder goals and a groovy soundtrack.

## Getting started

The game is completely self‑contained.  To run it locally or deploy it to itch.io / GitHub Pages:

1. Clone or download this repository and locate the `dist/` folder.
2. You can open `dist/index.html` directly in a modern browser (it registers a service worker, so subsequent loads work offline).  Make sure to serve the folder over HTTP when deploying (e.g. via GitHub Pages, Netlify or itch.io’s HTML5 upload).
3. To publish on itch.io, zip the entire contents of `dist/` and upload it as a “HTML5 game”.

### Tech stack

* **JavaScript/HTML/CSS** – no frameworks.  The match‑3 engine lives in `engine.js`; UI and level logic are in `game.js`.  Styles are compiled SCSS in `style.css`.
* **GSAP** – used for tile swap and explosion animations.
* **PWA offline support** – `service-worker.js` pre‑caches assets so the game can run without a network connection.
* **Audio** – soul/funk loops and sound effects are small MP3 files that loop seamlessly, loaded via the `Audio` API.  Volume and mute settings are persisted via `localStorage`.

### Assets & licences

| Asset | Description | Licence |
| --- | --- | --- |
| **Sprites** | Custom PNGs (rose bud, bonsai‑prise, fern spiral, succulent star, evidence tag) generated with generative AI and post‑processed for transparency. | CC‑BY‑SA 4.0 |
| **Backgrounds** | `bg_starfield.jpg` and `bg_panel.jpg` were generated via AI and compressed to JPEG. | CC‑BY‑SA 4.0 |
| **Audio loops** | `loopA.mp3`, `loopB.mp3`, `loopC.mp3` – 25‑second soul/funk loops at 90/100/105 BPM. | CC‑BY‑SA 4.0 |
| **Sound effects** | Swap, match, special, level‑pass fanfare, fail sting and hidden “Dun‑Dun” are short MP3 clips. | CC‑BY‑SA 4.0 |

All code in this repository is released under the MIT Licence (see `LICENSE`).  Generated assets are provided under the Creative Commons Attribution‑ShareAlike 4.0 licence.