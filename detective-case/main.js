// Main JavaScript for the interactive story
// Handles state transitions, audio playback, confetti animation and music controls.

document.addEventListener('DOMContentLoaded', () => {
  // Grab all section elements
  const sections = document.querySelectorAll('.section');

  /**
   * Show a particular section by id and hide all others.
   * If an ending section is shown, trigger associated effects.
   * @param {string} id
   */
  function showSection(id) {
    sections.forEach((sec) => {
      sec.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
    }
    // Handle end states
    if (id === 'end_recovered' || id === 'end_beamed' || id === 'end_cold') {
      playEnding(id);
    }
  }

  // Audio loop objects
  const loops = {
    marvin: new Audio('assets/marvin_loop.wav'),
    withers: new Audio('assets/withers_loop.wav'),
  };
  loops.marvin.loop = true;
  loops.withers.loop = true;

  // Music control panel references
  const volumeSlider = document.getElementById('volume-slider');
  const musicControls = document.getElementById('music-controls');
  const loopButtons = document.querySelectorAll('.music-toggle');

  // Load persisted settings
  let currentLoop = localStorage.getItem('rose-game-loop') || 'marvin';
  if (!(currentLoop in loops)) {
    currentLoop = 'marvin';
  }
  let savedVol = parseFloat(localStorage.getItem('rose-game-volume'));
  if (isNaN(savedVol)) {
    savedVol = 0.5;
  }
  volumeSlider.value = savedVol;
  setVolume(savedVol);

  // Highlight active loop toggle
  loopButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.loop === currentLoop);
  });

  // Event listeners for loop toggle buttons
  loopButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetLoop = btn.dataset.loop;
      if (targetLoop !== currentLoop) {
        // stop current loop if playing
        loops[currentLoop].pause();
        loops[currentLoop].currentTime = 0;
        currentLoop = targetLoop;
        loops[currentLoop].currentTime = 0;
        loops[currentLoop].play();
        loopButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        localStorage.setItem('rose-game-loop', currentLoop);
      }
    });
  });

  // Volume change handler
  volumeSlider.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    localStorage.setItem('rose-game-volume', vol);
  });

  function setVolume(vol) {
    loops.marvin.volume = vol;
    loops.withers.volume = vol;
  }

  // Hidden Easter egg sounds
  const audioDun = document.getElementById('audio-dun');
  const audioBeep = document.getElementById('audio-beep');
  document.getElementById('easter-dun').addEventListener('click', () => {
    audioDun.currentTime = 0;
    audioDun.play();
  });
  document.getElementById('easter-beep').addEventListener('click', () => {
    audioBeep.currentTime = 0;
    audioBeep.play();
  });

  // Start button leads to first decision
  document.getElementById('btn-start').addEventListener('click', () => {
    // play cold open sting once
    audioDun.currentTime = 0;
    audioDun.play();
    showSection('decision');
  });

  // Attach click events to choice buttons for state transitions
  document.querySelectorAll('.choice[data-next]').forEach((button) => {
    button.addEventListener('click', (e) => {
      const next = e.currentTarget.dataset.next;
      showSection(next);
    });
  });

  // Restart buttons: reset to first decision and stop loops/confetti
  ['restart-recovered', 'restart-beamed', 'restart-cold'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        stopMusic();
        hideAllConfetti();
        showSection('decision');
      });
    }
  });

  /**
   * Stop all music loops.
   */
  function stopMusic() {
    Object.values(loops).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    musicControls.style.display = 'none';
  }

  /**
   * Pause all loops without hiding controls. Used before starting a new loop on endings.
   */
  function pauseAllLoops() {
    Object.values(loops).forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  /**
   * Play the selected loop and show controls when an ending is reached.
   * Optionally trigger confetti for good endings.
   * @param {string} id
   */
  function playEnding(id) {
    // Show music controls
    musicControls.style.display = 'flex';
    // Play selected loop from beginning
    pauseAllLoops();
    loops[currentLoop].currentTime = 0;
    loops[currentLoop].play();
    // Fire confetti for good endings
    if (id === 'end_recovered' || id === 'end_beamed') {
      const canvasId = id === 'end_recovered' ? 'confetti-recovered' : 'confetti-beamed';
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        runConfetti(canvas);
      }
    }
  }

  /**
   * Hide and clear all confetti canvases.
   */
  function hideAllConfetti() {
    document.querySelectorAll('.confetti-canvas').forEach((c) => {
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, c.width, c.height);
      }
      c.style.display = 'none';
    });
  }

  /**
   * Simple confetti animation. Fills the given canvas with animated
   * rectangles of random colours that fall and wrap around. The animation
   * lasts for ~3 seconds.
   * @param {HTMLCanvasElement} canvas
   */
  function runConfetti(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    const pieces = [];
    const numPieces = 120;
    const colors = ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'];
    for (let i = 0; i < numPieces; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: 5 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        velocityX: (Math.random() - 0.5) * 2,
        velocityY: 2 + Math.random() * 4,
        rotation: Math.random() * 2 * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }
    let animationFrame;
    const duration = 3000;
    const start = performance.now();
    function update(time) {
      const elapsed = time - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach((p) => {
        p.x += p.velocityX;
        p.y += p.velocityY;
        p.rotation += p.rotationSpeed;
        // wrap around the bottom
        if (p.y > canvas.height) {
          p.y = -p.size;
          p.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      if (elapsed < duration) {
        animationFrame = requestAnimationFrame(update);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
        cancelAnimationFrame(animationFrame);
      }
    }
    animationFrame = requestAnimationFrame(update);
  }

  // Initially show only the start section
  showSection('start');
});