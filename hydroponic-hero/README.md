# Botanical Birthday: Hydroponic Hero

This mini‑game celebrates Mom's 67th birthday with a retro‑futuristic twist.  You are the captain of Hydroponics Deck 7 aboard a star‑cruiser and must keep four strange plants perfectly hydrated for ninety seconds.  Succeed and you'll unlock quirky gardening tips delivered in a Law & Order deadpan voice and snippets of 1970s soul trivia.  Lose focus and your plants will wither to a wah‑wah sting.

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


# 🏗️ Hydroponic Hero - Modular Architecture Guide

## 📂 **Current File Structure**

```
hydroponic-hero/
├── main.js                    # Ultra-lightweight entry point (30 lines)
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
│   │   ├── audio.js           # Audio management
│   │   ├── timer.js           # Timer and countdown
│   │   └── rooms.js           # Room navigation (ready for 4-room expansion)
│   ├── plants/                # 🌱 Plant-specific logic
│   │   ├── manager.js         # Plant state and behavior
│   │   └── renderer.js        # Plant visual representation
│   ├── ui/                    # 🖼️ User interface systems
│   │   ├── screens.js         # Screen management
│   │   └── overlay.js         # Modal and overlay management
│   ├── interactions/          # 🎯 Input and interaction handling
│   │   └── input.js           # Centralized input management
│   ├── rooms/                 # 🏠 Room-specific implementations (READY FOR EXPANSION)
│   └── animations/            # ✨ Animation systems (READY FOR EXPANSION)
└── assets/
    ├── rooms/                 # 🖼️ Room backdrop images (FOR AGENT TO POPULATE)
    ├── plants/                # 🌿 Plant state images (FOR AGENT TO POPULATE)
    ├── ui/                    # 🎨 UI assets (cursors, etc.)
    ├── audio/                 # 🔊 Existing audio files
    └── images/                # 📸 Existing image assets
```

## 🎯 **Agent Enhancement Strategy**

### **✅ Already Prepared**
- **Modular Foundation**: Complete separation of concerns
- **Event System**: Decoupled communication via EventBus
- **Room System**: Base architecture ready for 4-room expansion
- **Asset Structure**: Folders prepared for generated images
- **Plant System**: Designed for room-specific variants

### **🚀 Agent Tasks**
1. **Generate Assets**: Populate `assets/rooms/` and `assets/plants/` with generated images
2. **Extend Room System**: Add room-specific classes in `js/rooms/`
3. **Enhance Interactions**: Implement cursor-based watering
4. **Scale Plant System**: Expand to 16 plants across 4 rooms
5. **Polish & Test**: Validate with play-testing

### **📈 Extensibility Benefits**
- **No Context Explosion**: Each system is self-contained
- **Easy Asset Management**: Organized folder structure
- **Event-Driven**: Systems communicate without tight coupling
- **Configuration-Based**: JSON configs for easy modifications
- **Debug-Friendly**: Global debug API available

## 🔄 **System Communication**

All systems communicate via the EventBus (`js/core/events.js`):
- `PLANT_WATERED` → Updates plant state → Triggers visual update
- `ROOM_ENTER` → Changes game state → Updates UI
- `TIMER_COMPLETE` → Triggers mission end → Shows overlay

This architecture ensures the ChatGPT Agent can enhance individual systems without breaking others.

---

**Ready for 45-minute enhancement with maximum extensibility!** 🚀
