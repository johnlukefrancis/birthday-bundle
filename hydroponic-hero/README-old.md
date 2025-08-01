# Botanical Birthday: Hydroponic Hero

This mini‑game celebrates Mom's 67th birthday with a retro‑futuristic twist.  You are the captain of Hydroponics Deck 7 aboard a star‑cruiser and must keep four strange plants perfectly hydrated for ninety seconds.  Succeed and you'll unlock quirky gardening tips delivered in a Law & Order deadpan voice and snippets of 1970s soul trivia.  Lose focus and your plants will wither to a wah‑wah sting.

## 🏗️ Ultra-Modular Architecture

The game has been completely refactored into an **ultra-modular, event-driven architecture** that enables easy extensibility, room-based gameplay expansion, and clean separation of concerns.

### 📂 File Structure
```
hydroponic-hero/
├── main.js                    # Ultra-lightweight entry point (77 lines)
├── index.html                 # Game HTML structure
├── style.css                  # Game styling
├── config/
│   └── game.json              # Game configuration parameters
├── js/
│   ├── core/                  # 🔧 Core engine systems
│   │   ├── engine.js          # Game engine & system orchestration
│   │   ├── state.js           # Centralized state management
│   │   └── events.js          # Event bus (decoupled communication)
│   ├── systems/               # 🎮 Game systems
│   │   ├── audio.js           # Audio management and playback
│   │   ├── timer.js           # Game timer and countdown logic
│   │   └── rooms.js           # Room navigation (ready for expansion)
│   ├── plants/                # 🌱 Plant-specific logic
│   │   ├── manager.js         # Plant logic, watering, health tracking
│   │   └── renderer.js        # Plant visual updates and animations
│   ├── ui/                    # 🖼️ User interface systems
│   │   ├── screens.js         # Screen transitions and management
│   │   └── overlay.js         # UI overlays and HUD elements
│   ├── interactions/          # 🎯 Input and interaction handling
│   │   └── input.js           # Mouse, keyboard, and touch input
│   ├── rooms/                 # 🏠 Room-specific implementations (ready for expansion)
│   └── animations/            # ✨ Animation systems (ready for expansion)
└── assets/
    ├── rooms/                 # 🖼️ Room backdrop images (for agent to populate)
    ├── plants/                # 🌿 Plant state images (for agent to populate)
    ├── ui/                    # 🎨 UI assets (cursors, etc.)
    ├── audio/                 # 🔊 Existing audio files
    └── images/                # 📸 Existing image assets
```

### 🔄 Event-Driven Communication
The modular architecture uses an EventBus for decoupled communication:
- `PLANT_WATERED` → Triggers plant manager → Emits `PLANT_STATE_CHANGE` → Updates visuals
- `AUDIO_PLAY_SFX` → Audio system plays sound effects  
- `GAME_START/STOP` → Coordinates all systems
- `ROOM_ENTER/EXIT` → Manages room transitions
- `TIMER_TICK` → Updates countdown and triggers events

### 🎯 Extensibility Benefits
- **No Context Explosion**: Each system is self-contained
- **Easy Asset Management**: Organized folder structure for generated images
- **Event-Driven**: Systems communicate without tight coupling
- **Configuration-Based**: JSON configs for easy modifications
- **Debug-Friendly**: Global debug API available
- **Room-Ready**: Foundation prepared for multi-room expansion

## Architecture

The game has been completely refactored into an **ultra-modular architecture** using an event-driven design pattern. This enables easy extensibility, room-based gameplay expansion, and clean separation of concerns.

### Folder Structure
```
js/
├── core/           # Core engine systems
│   ├── engine.js   # Main game engine orchestration
│   ├── state.js    # Centralized game state management
│   └── events.js   # Event bus for decoupled communication
├── systems/        # Game systems
│   ├── audio.js    # Audio management and playback
│   ├── timer.js    # Game timer and countdown logic
│   └── rooms.js    # Room management (future expansion)
├── plants/         # Plant-specific logic
│   ├── manager.js  # Plant logic, watering, health tracking
│   └── renderer.js # Plant visual updates and animations
├── ui/             # User interface
│   ├── screens.js  # Screen transitions and management
│   └── overlay.js  # UI overlays and HUD elements
└── interactions/   # User input handling
    └── input.js    # Mouse, keyboard, and touch input
```

### Event-Driven Communication
The modular architecture uses an EventBus for decoupled communication:
- `PLANT_WATERED` → Triggers plant manager → Emits `PLANT_STATE_CHANGE` → Updates visuals
- `AUDIO_PLAY_SFX` → Audio system plays sound effects
- `GAME_START/STOP` → Coordinates all systems

This design makes the codebase highly extensible for future enhancements like room-based gameplay.otanical Birthday: Hydroponic Hero

This mini‑game celebrates Mom’s 67th birthday with a retro‑futuristic twist.  You are the captain of Hydroponics Deck 7 aboard a star‑cruiser and must keep four strange plants perfectly hydrated for ninety seconds.  Succeed and you’ll unlock quirky gardening tips delivered in a Law & Order deadpan voice and snippets of 1970s soul trivia.  Lose focus and your plants will wither to a wah‑wah sting.

## Gameplay

* Click **Begin Watering Duty, Captain!** to open the sliding doors and enter Hydroponics Deck 7.
* Each plant drains water at a different rate.  Click the **Water** button or press number keys **1–4** to add water to a plant.  Keep each hydration bar in its green zone.
* If a plant stays in the red zone for more than six seconds, the mission fails.
* After 30 seconds a power‑up icon appears.  Click it or press **Space** to give all plants a boost.
* Finish all ninety seconds to unlock the **Facts Carousel** with gardening tips and soul trivia.  Click **Next** to cycle through facts.  Click **Play Again** to replay.

## Controls

| Action                | Key/Mouse          |
|----------------------|--------------------|
| Water plant 1–4      | **1**, **2**, **3**, **4** or on‑screen button |
| Use water‑all power‑up| **Space** or click 💧 icon |
| Toggle mute          | Click speaker icon |
| Adjust volume        | Slide the volume control |
| Toggle high contrast | Click **High Contrast** |
| Konami code (secret) | ↑ ↑ ↓ ↓ ← → ← → B A |

## Installation & Deployment

The game is self‑contained and works offline once loaded.  To deploy locally or to a static host, copy or upload the `dist/` folder.

### Itch.io (HTML5)

1. Zip the contents of the `dist/` folder (do **not** zip the folder itself).
2. Create a new “HTML5 game” on itch.io and upload the zip file.
3. Ensure **Run in fullscreen** is enabled in itch’s project settings.  The game will load its assets from the zip bundle.

### GitHub Pages

1. Create a new repository (e.g. `hydroponic‑hero`).
2. Copy the contents of the `dist/` folder into the repository root and commit.
3. Enable **GitHub Pages** from the repository settings (branch `main`, folder `/`).
4. Visit the published URL to play.

Because a service worker caches assets on first load, the game remains playable without a network connection.

## Assets & Credits

All source code and configuration files are licensed under the **Creative Commons CC‑BY‑4.0** license.  Generated images and audio loops/SFX are released under **CC‑BY‑SA‑4.0** to match the sharing requirements of AI‑generated artwork and sound.

Images were generated from the prompts listed in the design brief and processed down to small JPEGs.  Audio loops and sound effects were synthesized programmatically.

Fonts used:

* **Orbitron** and **IBM Plex Sans** from Google Fonts.

## Running Locally

You can test the game locally without a server.  Open `index.html` in a browser; the service worker will cache assets on first play.  To develop or inspect, consider disabling the service worker via developer tools.

## Development

The modular architecture makes development straightforward:

- **Add new systems**: Create modules in appropriate `js/` folders
- **Extend plant behavior**: Modify `js/plants/manager.js` and `js/plants/renderer.js`
- **Add room types**: Create room classes in `js/rooms/`
- **Enhance interactions**: Extend `js/interactions/input.js`
- **Debug tools**: Use global `window.game` debug API

All systems communicate via EventBus - emit events to trigger actions, listen to events to respond to changes.

---

**Ready for enhancement with maximum extensibility!** 🚀
