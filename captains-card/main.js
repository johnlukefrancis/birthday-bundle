// Main JavaScript for the Captain’s Birthday Log
// This module builds the interactive booklet on the fly, manages the
// page‑turn animations via GSAP, handles audio playback and stores
// persistent state in localStorage.

// images are provided on the global window by assets/images.js

document.addEventListener('DOMContentLoaded', () => {
  const landing = document.getElementById('landing');
  const booklet = document.getElementById('booklet');
  const pagesContainer = document.getElementById('pages');
  const audioBtn = document.getElementById('audio-mode-btn');
  const beepSfx = document.getElementById('beep-sfx');
  const turnSfx = document.getElementById('turn-sfx');
  const dunSfx = document.getElementById('dun-sfx');

  // Preload looping background tracks.  Audio files are encoded as
  // low‑bitrate WAVs with .mp3 extension to satisfy the packaging spec.
  const loopNames = ['loopA', 'loopB', 'loopC'];
  const loops = loopNames.map((name) => {
    const audio = new Audio(`assets/audio/${name}.mp3`);
    audio.loop = true;
    audio.volume = 0.4;
    return audio;
  });
  let audioMode = parseInt(localStorage.getItem('audioMode'), 10);
  if (isNaN(audioMode) || audioMode < 0 || audioMode >= loops.length) {
    audioMode = 0;
  }

  // Update the button label and switch loops
  function playLoop() {
    loops.forEach((loop, i) => {
      loop.pause();
      loop.currentTime = 0;
    });
    const selected = loops[audioMode];
    // Some browsers require a user gesture before playing audio; catch errors silently
    selected.play().catch(() => {});
    // Display A/B/C on the button
    audioBtn.textContent = String.fromCharCode(65 + audioMode);
  }

  audioBtn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    audioMode = (audioMode + 1) % loops.length;
    localStorage.setItem('audioMode', audioMode);
    playLoop();
  });

  // Data for each spread.  Each entry contains the index into the
  // images array, alt text for accessibility, a title and the body text.
  const pageData = [
    {
      imageIndex: 0,
      alt: 'Mom at science station on the Starship bridge',
      title: "Captain’s Log",
      text:
        'Stardate 6708.01: To the most radiant star in my galaxy—Mom. Today we celebrate your 67th orbit around the sun. Your curiosity and courage inspire us all. May your journey continue with wonder, laughter and endless love.',
    },
    {
      // Use the heart‑shaped nebula to represent the missing rose case since a direct rose bush image wasn’t generated.
      imageIndex: 3,
      alt: 'Deep‑space nebula shaped like a heart, vintage film grain',
      title: 'The Case of the Missing Rose',
      text:
        'Episode: The Case of the Missing Rose. Scene: Hydroponics Bay. Victim: One perfect bloom, last seen glowing under LED lights. Suspects: A gaggle of mischievous tribbles. Verdict: Mom’s love recovers it and justice is served.',
    },
    {
      imageIndex: 4,
      alt: 'Garden planet surface with tricorder scan overlay',
      title: 'Soul Serenade',
      text:
        'Ain’t no mountain high enough, ain’t no valley low—your love has always been our guiding star. Wishing you funk, flowers and cosmic grooves for your 67th birthday. Keep groovin’, Captain.',
    },
    {
      // Use the stylised portrait of Mom for the final mission log and congratulations
      imageIndex: 8,
      alt: 'Stylised portrait of Mom in Starfleet uniform with rose insignia',
      title: 'Mission Complete',
      text:
        'Captain’s log, supplemental: Mission accomplished. Your compassion and strength make galaxies brighter. The crew sends you infinite hugs and tributes. Happy 67th, Mom! You are loved more than words can say.',
    },
  ];

  // Build the pages based on the data above
  pageData.forEach((data, idx) => {
    const page = document.createElement('div');
    page.classList.add('page');
    page.dataset.index = idx;
    // assign z-index in reverse order so that the first page is on top
    page.style.zIndex = pageData.length - idx;
    // initial transform: first page is visible, others rotated to the back
    page.style.transform = idx === 0 ? 'rotateY(0deg)' : 'rotateY(-180deg)';

    // Left side (image)
    const left = document.createElement('div');
    left.classList.add('left');
    left.style.backgroundImage = `url('${images[data.imageIndex]}')`;
    left.setAttribute('role', 'img');
    left.setAttribute('aria-label', data.alt);
    // Right side (text)
    const right = document.createElement('div');
    right.classList.add('right');
    const h = document.createElement('h2');
    h.textContent = data.title;
    const p = document.createElement('p');
    p.textContent = data.text;
    right.appendChild(h);
    right.appendChild(p);

    page.appendChild(left);
    page.appendChild(right);

    // Hidden easter egg on the second page: tiny transparent button
    if (idx === 1) {
      const egg = document.createElement('button');
      egg.classList.add('easter-egg');
      egg.setAttribute('aria-label', 'Play secret sound');
      egg.style.position = 'absolute';
      egg.style.bottom = '12px';
      egg.style.right = '12px';
      egg.style.width = '32px';
      egg.style.height = '32px';
      egg.style.opacity = '0';
      egg.style.border = 'none';
      egg.style.background = 'transparent';
      egg.addEventListener('click', (ev) => {
        ev.stopPropagation();
        dunSfx.currentTime = 0;
        dunSfx.play().catch(() => {});
        localStorage.setItem('foundEasterEgg', 'true');
      });
      page.appendChild(egg);
    }

    pagesContainer.appendChild(page);
  });

  // Track current page index.  We intentionally start at 0 on each load to
  // provide a consistent entry point.  Page turns will still be persisted
  // to localStorage, but progress is not restored on page refresh to
  // simplify offline caching.
  let currentPage = 0;
  // Initialise page rotations based on current page
  const pageEls = Array.from(pagesContainer.querySelectorAll('.page'));
  pageEls.forEach((page, idx) => {
    if (idx < currentPage) {
      page.style.transform = 'rotateY(-180deg)';
    } else {
      page.style.transform = idx === 0 ? 'rotateY(0deg)' : 'rotateY(-180deg)';
    }
  });

  // Helper functions to flip pages
  function flipNext() {
    if (currentPage >= pageData.length - 1) return;
    // current page that will be turned over
    const curr = pageEls[currentPage];
    // next page to reveal
    const next = pageEls[currentPage + 1];
    currentPage++;
    localStorage.setItem('currentPage', currentPage.toString());
    // play page turn sfx
    turnSfx.currentTime = 0;
    turnSfx.play().catch(() => {});
    // animate current page flipping away
    gsap.to(curr, { duration: 1.1, rotationY: -180, ease: 'power2.inOut' });
    // animate next page flipping into view from back to front
    gsap.to(next, { duration: 1.1, rotationY: 0, ease: 'power2.inOut' });
    if (currentPage === pageData.length - 1) {
      // on final page, trigger confetti after the flip finishes
      setTimeout(() => {
        window.confetti();
        window.confetti();
      }, 1200);
    }
  }
  function flipPrev() {
    if (currentPage <= 0) return;
    // page currently visible that will be closed
    const curr = pageEls[currentPage];
    // page to reveal (previous)
    const prev = pageEls[currentPage - 1];
    currentPage--;
    localStorage.setItem('currentPage', currentPage.toString());
    turnSfx.currentTime = 0;
    turnSfx.play().catch(() => {});
    // animate current page flipping away to the back
    gsap.to(curr, { duration: 1.1, rotationY: -180, ease: 'power2.inOut' });
    // animate previous page flipping back to front
    gsap.to(prev, { duration: 1.1, rotationY: 0, ease: 'power2.inOut' });
  }

  // Keyboard navigation: right/space for next, left for previous
  document.addEventListener('keydown', (ev) => {
    // Avoid triggering while in the landing screen
    if (landing.classList.contains('hidden')) {
      if (ev.key === 'ArrowRight' || ev.key === ' ') {
        flipNext();
      } else if (ev.key === 'ArrowLeft') {
        flipPrev();
      }
    }
  });

  // Click anywhere on the booklet to flip next (avoid clicking audio button)
  pagesContainer.addEventListener('click', (ev) => {
    // Only respond when clicking on the right half of the page and not on a button
    if (
      ev.target.closest('.audio-btn') ||
      ev.target.closest('.easter-egg') ||
      ev.target.closest('#audio-mode-btn')
    ) {
      return;
    }
    const rect = pagesContainer.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    if (x > rect.width / 2) {
      flipNext();
    } else {
      flipPrev();
    }
  });

  // Enter button handler
  document.getElementById('enter-btn').addEventListener('click', () => {
    // Immediately hide landing and reveal booklet
    landing.classList.add('hidden');
    booklet.classList.remove('hidden');
    // Play beep as acknowledgement
    beepSfx.currentTime = 0;
    beepSfx.play().catch(() => {});
    // Begin playing loop according to stored selection
    playLoop();
  });

  // Starfield: simple 3D starfield using canvas.  Stars fly towards the camera.
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  function initStars() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, z: Math.random() * canvas.width });
    }
  }
  function animateStars() {
    // clear
    ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.z -= 2;
      if (s.z <= 0) {
        s.z = canvas.width;
      }
      const k = 128.0 / s.z;
      const px = (s.x - canvas.width / 2) * k + canvas.width / 2;
      const py = (s.y - canvas.height / 2) * k + canvas.height / 2;
      const size = (1 - s.z / canvas.width) * 2;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillRect(px, py, size, size);
    }
    requestAnimationFrame(animateStars);
  }
  initStars();
  animateStars();
  window.addEventListener('resize', initStars);

  // Start with hidden booklet (if user refreshes on a later page) depending on storage
  if (currentPage > 0) {
    landing.classList.add('hidden');
    booklet.classList.remove('hidden');
    playLoop();
  }
});