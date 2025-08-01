# Galaxy1. Clone 1. Clone or downloa## Getting started

The game is completely self‑contained.  To run it locally or deploy it to itch.io / GitHub Pages:

1. Clone or download this repository and locate the `galaxy-garden-crush/` folder.
2. You can open `index.html` directly in a modern browser (service worker disabled by default for better loading performance).  Make sure to serve the folder over HTTP when deploying (e.g. via GitHub Pages, Netlify or itch.io's HTML5 upload).
3. To publish on itch.io, zip the entire contents of the folder and upload it as a "HTML5 game".

**Note**: The game now uses MP3 files instead of WAV for music (~20MB total vs previous 74MB) for faster loading, especially on mobile devices and platforms like itch.io.repository and locate the `### Asset Organization

```
assets/
├── audio/
│   └── sfx/        # Sound effects (match.mp3, swap.mp3, pass.mp3, fail.mp3, etc.)
├── music/          # Level background music (MP3 format)
│   ├── song1.mp3   # Level 1 music
│   ├── song2.mp3   # Level 2 music
│   ├── song3.mp3   # Level 3 music
│   ├── song4.mp3   # Level 4 music
│   └── song5.mp3   # Level 5 music
├── sprites/        # Game sprites
│   ├── sprite_bonsai.png
│   ├── sprite_fern.png
│   ├── sprite_rose.png
│   ├── sprite_succulent.png
│   └── sprite_tag.png
└── bg/             # Background images
    ├── bg_starfield.jpg
    └── bg_panel.jpg
```arden-crush/` folder.
2. You can open `index.html` directly in a modern browser (it registers a service worker, so subsequent loads work offline).  Make sure to serve the folder over HTTP when deploying (e.g. via GitHub Pages, Netlify or itch.io's HTML5 upload).
3. To publish on itch.io, zip the entire contents of the folder and upload it as a "HTML5 game".download this repository and locate the `### Assets & licences

| Asset | Description | Licence |
| --- | --- | --- |
| **Sprites** | Custom PNGs (rose bud, bonsai‑prise, fern spiral, succulent star, evidence tag) generated with generative AI and post‑processed for transparency. | CC‑BY‑SA 4.0 |
| **Backgrounds** | `bg_starfield.jpg` and `bg_panel.jpg` were generated via AI and compressed to JPEG. | CC‑BY‑SA 4.0 |
| **Music** | `assets/music/song1-5.mp3` – Custom music tracks for each level (MP3 format for faster loading). | CC‑BY‑SA 4.0 |
| **Sound effects** | `assets/audio/sfx/` – Swap, match, special, level‑pass fanfare, fail sting and hidden "Dun‑Dun" are short MP3 clips. | CC‑BY‑SA 4.0 |arden-crush/` folder.
2. You can open `index.html` directly in a modern browser (it registers a service worker, so subsequent loads work offline).  Make sure to serve the folder over HTTP when deploying (e.g. via GitHub Pages, Netlify or itch.io's HTML5 upload).
3. To publish on itch.io, zip the entire contents of the folder and upload it as a "HTML5 game".rden Crush

Galaxy Garden Crush is an offline‑friendly match‑3 puzzle built for the web.  It was created as a birthday gift for Mom, mashing up her favourite things: Candy Crush, gardening, Star Trek, Law & Order and 1970s soul music.  Each level is short (~2 minutes) and replayable, with progressively harder goals and a groovy soundtrack.

## Getting started

The game is completely self‑contained.  To run it locally or deploy it to itch.io / GitHub Pages:

1. Clone or download this repository and locate the `dist/` folder.
2. You can open `dist/index.html` directly in a modern browser (it registers a service worker, so subsequent loads work offline).  Make sure to serve the folder over HTTP when deploying (e.g. via GitHub Pages, Netlify or itch.io’s HTML5 upload).
3. To publish on itch.io, zip the entire contents of `dist/` and upload it as a “HTML5 game”.

### Tech stack

* **JavaScript/HTML/CSS** – no frameworks, fully modular architecture.  The game uses an event-driven system with separate modules for different concerns:
  - **Core Systems** (`js/core/`) – Event bus, state management, game engine orchestration, and initialization
  - **Game Systems** (`js/systems/`) – Audio, scoring, and timer management
  - **Gameplay** (`js/gameplay/`) – Match-3 grid logic and cascade resolution
  - **UI** (`js/ui/`) – Screen management and modal dialogs
  - **Interactions** (`js/interactions/`) – Mouse, touch, and keyboard input handling
  - **Assets** (`js/assets/`) – Sprite data and asset management
  - **Service Worker** (`js/sw/`) – PWA offline support and caching
* **Event-driven architecture** – All modules communicate via a central event bus for loose coupling and maintainability.
* **PWA offline support** – `js/sw/service-worker.js` pre‑caches assets so the game can run without a network connection.
* **Audio** – Custom music tracks and sound effects loaded via the `Audio` API. Volume and mute settings are persisted via `localStorage`.

### Architecture

The game follows a modular, event-driven architecture for maintainability and extensibility:

```
js/
├── core/           # Core game systems
│   ├── events.js   # Central event bus for module communication
│   ├── state.js    # Centralized game state management
│   ├── engine.js   # Game engine orchestration
│   └── init.js     # System initialization coordination
├── systems/        # Independent game systems
│   ├── audio.js    # Music and sound effects
│   ├── scoring.js  # Score calculation and tracking
│   └── timer.js    # Countdown timers for timed levels
├── gameplay/       # Core game mechanics
│   └── grid.js     # Match-3 logic, cascades, and board management
├── ui/             # User interface
│   └── screens.js  # Screen transitions and modal dialogs
├── interactions/   # Input handling
│   └── input.js    # Mouse, touch, and keyboard controls
├── assets/         # Game assets
│   └── sprites.js  # Embedded sprite data
└── sw/             # Progressive Web App
    └── service-worker.js  # Offline caching
```

**Key Design Principles:**
- **Event-driven communication**: Modules communicate via events, reducing coupling
- **Single responsibility**: Each module handles one specific concern
- **Centralized state**: Game state is managed in one place with reactive updates
- **Progressive enhancement**: Core gameplay works without advanced features

### Assets & licences

| Asset | Description | Licence |
| --- | --- | --- |
| **Sprites** | Custom PNGs (rose bud, bonsai‑prise, fern spiral, succulent star, evidence tag) generated with generative AI and post‑processed for transparency. | CC‑BY‑SA 4.0 |
| **Backgrounds** | `bg_starfield.jpg` and `bg_panel.jpg` were generated via AI and compressed to JPEG. | CC‑BY‑SA 4.0 |
| **Audio loops** | `loopA.mp3`, `loopB.mp3`, `loopC.mp3` – 25‑second soul/funk loops at 90/100/105 BPM. | CC‑BY‑SA 4.0 |
| **Sound effects** | Swap, match, special, level‑pass fanfare, fail sting and hidden “Dun‑Dun” are short MP3 clips. | CC‑BY‑SA 4.0 |

All code in this repository is released under the MIT Licence (see `LICENSE`).  Generated assets are provided under the Creative Commons Attribution‑ShareAlike 4.0 licence.