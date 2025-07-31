# Botanical Birthday: Hydroponic Hero

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