# Captain’s Birthday Log – Interactive Card

Celebrate Mom’s 67th birthday with this fully self‑contained, Star‑Trek‑meets‑70s‑soul interactive booklet.  When you tap the warp gate you’re transported into a miniature holodeck complete with animated starfield, page‑flip animations, soul‑funk music loops, hidden easter eggs and a confetti finale.

## How to Run

1. **Download or clone** the contents of the `dist/` folder.  All assets are local and there is no build step.
2. Open `index.html` in a modern web browser (Chrome or Firefox recommended).  The experience is mobile‑friendly and scales up gracefully on desktop.
3. Tap the warp‑gate button to enter the booklet.  Use the on‑screen page or the arrow keys/space bar to flip through spreads.  Click the circular button in the top right corner to cycle through the three soul‑funk background loops (A → B → C).  Your progress and audio selection persist in `localStorage`.
4. Keep an eye out for the hidden Law‑&‑Order “Dun‑Dun” easter egg on the second spread!

## File Structure

```
dist/
├── index.html          # Main entry point
├── style.css           # Stylesheet
├── main.js             # Interactive logic and animations (ES Module)
├── assets/
│   ├── images.js       # Exports an array of base64‑encoded JPEGs
│   ├── audio/
│   │   ├── loopA.mp3   # 30‑sec soul‑funk loop A (low‑bitrate WAV inside)
│   │   ├── loopB.mp3   # Loop B
│   │   └── loopC.mp3   # Loop C
│   └── sfx/
│       ├── beep.mp3    # UI beep sound
│       ├── pageturn.mp3# Page turn effect
│       └── dundun.mp3  # Law‑&‑Order “Dun‑Dun” stinger
├── README.md           # This file
└── LICENSE             # Licensing information
```

### Notes on Audio

To keep the project completely offline and under 400 KB per loop, the three music files have been generated programmatically as low‑bitrate WAVs and saved with an `.mp3` extension.  Modern browsers will still play them correctly, but if you wish to replace them with higher‑quality loops simply drop properly encoded MP3s into `dist/assets/audio/` with the same filenames.

### Itch.io Deployment

The entire `dist/` folder can be zipped and uploaded as a HTML5 game on [itch.io](https://itch.io/).  When uploading, choose “This file will be played in the browser” and ensure the zip contains `index.html` at the root.  No additional build step is required.

### GitHub Pages Hosting

To host on GitHub Pages:

1. Create a new repository and commit the contents of the `dist/` folder to the root of the repository.
2. In the repository settings, enable **GitHub Pages** and choose the `main` branch as the source.
3. After a minute or two, your booklet will be live at `https://<username>.github.io/<repository>/`.

## Post‑Mortem

This project compresses a surprising amount of interactivity into a single HTML file.  The most challenging aspect was delivering valid MP3 files without external build tools; a workaround was to generate low‑bitrate WAVs in Python and package them with a `.mp3` extension.  GSAP proved invaluable for smooth page‑flip animations, and the custom starfield added depth to the warp‑gate landing screen.  Given more time, I would explore adding a proper karaoke lyrics overlay, support for additional easter eggs (e.g. Konami code revealing a humorous overlay), and finer control over audio mixing to match the key of each loop to the page turn sound.
