// Main game logic for Botanical Birthday: Hydroponic Hero

// Fetch plant configuration and bootstrap the game
async function loadPlants() {
  // When running from the file protocol, fetching a local JSON will fail due to CORS.
  // If an inline script with id="plantData" exists, parse it and return its contents.
  const inline = document.getElementById('plantData');
  if (inline) {
    try {
      const obj = JSON.parse(inline.textContent.trim());
      return obj.plants || obj;
    } catch (err) {
      console.warn('Failed to parse inline plant data', err);
    }
  }
  // Fallback: fetch JSON (works when served over HTTP)
  const res = await fetch('data/plants.json');
  const data = await res.json();
  return data;
}

// Utility to pick a random element from an array
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Global state
const state = {
  plants: [],
  hydros: {},
  failTimers: {},
  running: false,
  timeRemaining: 90,
  countInterval: null,
  lastFrame: null,
  audio: {
    loops: [],
    current: null,
    sfx: {},
    muted: false,
    volume: 0.8
  },
  konamiIndex: 0,
  secretMode: false
};

// Load audio assets
function loadAudio() {
  const loopPaths = [
    'assets/audio/loop1.mp3',
    'assets/audio/loop2.mp3',
    'assets/audio/loop3.mp3'
  ];
  state.audio.loops = loopPaths.map(p => {
    const a = new Audio(p);
    a.loop = true;
    a.volume = state.audio.volume;
    return a;
  });
  const sfxNames = ['door', 'drop', 'alert', 'success', 'fail'];
  sfxNames.forEach(name => {
    const a = new Audio(`assets/audio/sfx/${name}.mp3`);
    a.volume = state.audio.volume;
    state.audio.sfx[name] = a;
  });
}

function playLoop() {
  if (state.audio.current) {
    state.audio.current.pause();
  }
  const choice = Math.floor(Math.random() * state.audio.loops.length);
  state.audio.current = state.audio.loops[choice];
  if (!state.audio.muted) {
    state.audio.current.currentTime = 0;
    state.audio.current.volume = state.audio.volume;
    state.audio.current.play();
  }
}

function playSfx(name) {
  const sound = state.audio.sfx[name];
  if (!sound) return;
  if (state.audio.muted) return;
  sound.currentTime = 0;
  sound.volume = state.audio.volume;
  sound.play();
}

// Build plant cards in DOM
function buildPlantCards(plants) {
  const container = document.getElementById('plantsContainer');
  container.innerHTML = '';
  plants.forEach((plant, index) => {
    const card = document.createElement('div');
    card.className = 'plant-card';
    card.dataset.id = plant.id;

    const img = document.createElement('img');
    img.src = `assets/images/img${index + 1}.jpg`;
    img.alt = plant.name;
    card.appendChild(img);

    const name = document.createElement('div');
    name.className = 'plant-name';
    name.textContent = plant.name;
    card.appendChild(name);

    const barContainer = document.createElement('div');
    barContainer.className = 'bar-container';
    const barFill = document.createElement('div');
    barFill.className = 'bar-fill';
    barFill.style.width = '60%';
    barContainer.appendChild(barFill);
    card.appendChild(barContainer);

    const status = document.createElement('div');
    status.className = 'status-light';
    card.appendChild(status);

    const button = document.createElement('button');
    button.className = 'water-button';
    button.textContent = 'Water';
    button.dataset.id = plant.id;
    card.appendChild(button);

    container.appendChild(card);

    // Initialise hydration state
    state.hydros[plant.id] = 60; // start in the middle
    state.failTimers[plant.id] = 0;
  });
}

// Update UI for each plant
function updateUI(plants) {
  plants.forEach((plant, index) => {
    const id = plant.id;
    const card = document.querySelector(`.plant-card[data-id="${id}"]`);
    const fill = card.querySelector('.bar-fill');
    const light = card.querySelector('.status-light');
    const hydration = state.hydros[id];
    // clamp values
    const pct = Math.max(0, Math.min(100, hydration));
    fill.style.width = `${pct}%`;
    // Determine colour
    let color;
    if (pct > plant.optimal[1]) {
      color = '#4da8a0'; // blue when above
    } else if (pct >= plant.optimal[0]) {
      color = '#2ca58d'; // green zone
    } else if (pct >= plant.optimal[0] - 10) {
      color = '#f4a261'; // yellow warning
    } else {
      color = '#e76f51'; // red critical
    }
    fill.style.backgroundColor = color;
    light.style.backgroundColor = color;
  });
}

// Drain hydration and check fail condition
function updateHydration(plants, delta) {
  let failedPlant = null;
  plants.forEach(plant => {
    const id = plant.id;
    // drain per second
    state.hydros[id] -= plant.drain * delta;
    if (state.hydros[id] < 0) state.hydros[id] = 0;
    // check zone
    const hydration = state.hydros[id];
    if (hydration < plant.optimal[0]) {
      state.failTimers[id] += delta;
    } else {
      state.failTimers[id] = 0;
    }
    if (state.failTimers[id] > 6 && !failedPlant) {
      failedPlant = id;
    }
  });
  return failedPlant;
}

// Main game loop using requestAnimationFrame
function gameLoop(timestamp) {
  if (!state.running) return;
  if (!state.lastFrame) state.lastFrame = timestamp;
  const deltaSec = (timestamp - state.lastFrame) / 1000;
  state.lastFrame = timestamp;
  const failed = updateHydration(state.plants, deltaSec);
  updateUI(state.plants);
  if (failed) {
    missionFail();
    return;
  }
  requestAnimationFrame(gameLoop);
}

function startCountdown() {
  const timerEl = document.getElementById('timeRemaining');
  state.timeRemaining = 90;
  timerEl.textContent = state.timeRemaining;
  state.countInterval = setInterval(() => {
    state.timeRemaining -= 1;
    timerEl.textContent = state.timeRemaining;
    // spawn power up at 60 second mark (after 30s elapsed)
    if (state.timeRemaining === 60) {
      showPowerUp();
    }
    if (state.timeRemaining <= 0) {
      clearInterval(state.countInterval);
      missionSuccess();
    }
  }, 1000);
}

function missionSuccess() {
  state.running = false;
  clearInterval(state.countInterval);
  if (state.audio.current) state.audio.current.pause();
  playSfx('success');
  showOverlay(true);
}

function missionFail() {
  state.running = false;
  clearInterval(state.countInterval);
  if (state.audio.current) state.audio.current.pause();
  playSfx('fail');
  showOverlay(false);
}

// Show overlay with facts (on success) or failure message
function showOverlay(success) {
  const overlay = document.getElementById('overlay');
  const titleEl = document.getElementById('overlayTitle');
  const subEl = document.getElementById('overlaySubtitle');
  const factsEl = document.getElementById('factsCarousel');
  const factsContent = document.getElementById('factsContent');
  const nextBtn = document.getElementById('nextFact');
  let factIndex = 0;
  overlay.classList.remove('hidden');
  if (success) {
    titleEl.textContent = 'Captain, the Garden Thrives!';
    subEl.textContent = 'Happy 67th, Mom!';
    // build facts array: combine plants in random order
    const entries = [];
    state.plants.forEach(plant => {
      const tip = pick(plant.tips);
      const trivia = pick(plant.trivia);
      entries.push(`<strong>${plant.name}</strong><br>${tip}<br><em>${trivia}</em>`);
    });
    factsEl.classList.remove('hidden');
    // display first
    factsContent.innerHTML = entries[factIndex];
    nextBtn.onclick = () => {
      factIndex = (factIndex + 1) % entries.length;
      factsContent.innerHTML = entries[factIndex];
    };
  } else {
    titleEl.textContent = 'Mission Failed';
    subEl.textContent = 'A plant has withered.';
    factsEl.classList.add('hidden');
  }
  // Confetti if success
  if (success) spawnConfetti();
}

// Create confetti pieces and animate with GSAP
function spawnConfetti() {
  const overlay = document.getElementById('overlay');
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    // random color variation
    const colors = ['#e9c46a', '#f4a261', '#2a9d8f', '#e76f51'];
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    overlay.appendChild(piece);
    const x = Math.random() * window.innerWidth;
    const y = -20;
    const delay = Math.random() * 0.5;
    gsap.set(piece, { x: x, y: y, opacity: 1, rotation: Math.random() * 360 });
    gsap.to(piece, {
      duration: 4 + Math.random() * 2,
      y: window.innerHeight + 20,
      x: x + (Math.random() - 0.5) * 200,
      rotation: 360 * (Math.random() > 0.5 ? 1 : -1),
      ease: 'power2.out',
      delay: delay,
      onComplete: () => piece.remove()
    });
  }
}

// Show power-up icon
function showPowerUp() {
  const powerUp = document.getElementById('powerUp');
  powerUp.classList.remove('hidden');
}

// Apply water-all power-up
function usePowerUp() {
  // Add 25 units to each plant
  state.plants.forEach(plant => {
    state.hydros[plant.id] = Math.min(100, state.hydros[plant.id] + 25);
  });
  updateUI(state.plants);
  playSfx('drop');
  const powerUp = document.getElementById('powerUp');
  powerUp.classList.add('hidden');
}

// Handle high contrast toggle
function setupContrastToggle() {
  const btn = document.getElementById('contrastToggle');
  btn.onclick = () => {
    document.body.classList.toggle('high-contrast');
    const enabled = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', enabled ? '1' : '0');
  };
  // Apply saved state
  const saved = localStorage.getItem('highContrast');
  if (saved === '1') {
    document.body.classList.add('high-contrast');
  }
}

// Setup audio controls
function setupAudioControls() {
  const muteBtn = document.getElementById('muteButton');
  const volumeSlider = document.getElementById('volumeSlider');
  // Load saved volume
  const savedVolume = localStorage.getItem('hydroVolume');
  if (savedVolume !== null) {
    state.audio.volume = parseFloat(savedVolume);
    volumeSlider.value = state.audio.volume;
  } else {
    volumeSlider.value = state.audio.volume;
  }
  // Mute toggle
  muteBtn.onclick = () => {
    state.audio.muted = !state.audio.muted;
    muteBtn.textContent = state.audio.muted ? '🔇' : '🔊';
    if (state.audio.muted) {
      if (state.audio.current) state.audio.current.pause();
    } else {
      if (state.running && state.audio.current) state.audio.current.play();
    }
  };
  // Volume change
  volumeSlider.oninput = () => {
    state.audio.volume = parseFloat(volumeSlider.value);
    localStorage.setItem('hydroVolume', state.audio.volume);
    // update volumes
    if (state.audio.current) state.audio.current.volume = state.audio.volume;
    Object.values(state.audio.sfx).forEach(a => {
      a.volume = state.audio.volume;
    });
  };
}

// Handle keyboard input for watering and power-up
function setupKeyboard() {
  window.addEventListener('keydown', (e) => {
    // Konami code detection
    const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
    if (e.key === konami[state.konamiIndex]) {
      state.konamiIndex++;
      if (state.konamiIndex === konami.length) {
        activateSecretMode();
        state.konamiIndex = 0;
      }
    } else {
      state.konamiIndex = 0;
    }
    // Number keys 1-4 for watering
    if (['1','2','3','4'].includes(e.key)) {
      const index = parseInt(e.key, 10) - 1;
      const plant = state.plants[index];
      if (plant && state.running) {
        waterPlant(plant.id);
      }
    }
    // Spacebar for power-up
    if (e.code === 'Space') {
      const powerUpEl = document.getElementById('powerUp');
      if (!powerUpEl.classList.contains('hidden')) {
        usePowerUp();
      }
      e.preventDefault();
    }
  });
}

// Water a single plant
function waterPlant(id) {
  // debounce: ignore if last click < 200ms
  const now = Date.now();
  if (!state._lastWater) state._lastWater = {};
  if (state._lastWater[id] && now - state._lastWater[id] < 200) return;
  state._lastWater[id] = now;
  state.hydros[id] = Math.min(100, state.hydros[id] + 10);
  updateUI(state.plants);
  playSfx('drop');
  // vibrate on mobile
  if (navigator.vibrate) navigator.vibrate(30);
}

// Activate secret disco mode via Konami Code
function activateSecretMode() {
  if (state.secretMode) return;
  state.secretMode = true;
  const gameScreen = document.getElementById('game');
  // Create disco ball element
  const disco = document.createElement('div');
  disco.id = 'discoBall';
  disco.style.position = 'fixed';
  disco.style.top = '10%';
  disco.style.left = '50%';
  disco.style.transform = 'translateX(-50%)';
  disco.style.width = '60px';
  disco.style.height = '60px';
  disco.style.borderRadius = '50%';
  disco.style.background = 'radial-gradient(circle at center, #ffffff 0%, #cccccc 40%, #888888 70%, #444444 100%)';
  disco.style.boxShadow = '0 0 12px rgba(255, 255, 255, 0.8)';
  document.body.appendChild(disco);
  // Spin the disco ball
  gsap.to(disco, { rotation: 360, duration: 5, repeat: -1, ease: 'linear' });
  // Change background music to loop3
  if (state.audio.current) state.audio.current.pause();
  state.audio.current = state.audio.loops[2];
  if (!state.audio.muted) state.audio.current.play();
}

// Initialize game
async function init() {
  state.plants = await loadPlants();
  loadAudio();
  buildPlantCards(state.plants);
  setupContrastToggle();
  setupAudioControls();
  setupKeyboard();
  // Set up button listeners for each plant
  document.getElementById('plantsContainer').addEventListener('click', (e) => {
    if (e.target.matches('.water-button')) {
      const id = e.target.dataset.id;
      if (state.running) {
        waterPlant(id);
      }
    }
  });
  // Start button triggers door animation and game start
  const startBtn = document.getElementById('startButton');
  startBtn.addEventListener('click', () => {
    // door animation
    playSfx('door');
    const left = document.querySelector('.door.left');
    const right = document.querySelector('.door.right');
    gsap.to(left, { duration: 1.2, xPercent: -100, ease: 'power2.inOut' });
    gsap.to(right, { duration: 1.2, xPercent: 100, ease: 'power2.inOut', onComplete: beginGame });
    // disable button
    startBtn.disabled = true;
  });
  // Power-up click
  document.getElementById('powerUp').addEventListener('click', () => {
    usePowerUp();
  });
  // Play again button
  document.getElementById('playAgain').addEventListener('click', () => {
    window.location.reload();
  });
}

function beginGame() {
  // Hide intro, show game screen
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('game').classList.remove('hidden');
  // Randomize facts once
  // Start music
  playLoop();
  // Start countdown and game loop
  state.running = true;
  state.lastFrame = null;
  startCountdown();
  requestAnimationFrame(gameLoop);
}

// When overlay is visible, hide game
function hideGame() {
  document.getElementById('game').classList.add('hidden');
}

// Kick off initialisation when DOM loaded
window.addEventListener('DOMContentLoaded', init);