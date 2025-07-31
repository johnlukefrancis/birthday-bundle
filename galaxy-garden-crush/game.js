// Main game logic and UI handling for Galaxy Garden Crush

(function() {
  const gridContainer = document.getElementById('grid-container');
  const loader = document.getElementById('loader');
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('load-progress');
  const gameEl = document.getElementById('game');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalMessage = document.getElementById('modal-message');
  const modalBtn = document.getElementById('modal-close');
  const levelNameEl = document.getElementById('level-name');
  const goalTextEl = document.getElementById('goal-text');
  const scoreTextEl = document.getElementById('score-text');
  const movesTextEl = document.getElementById('moves-text');
  const timerTextEl = document.getElementById('timer-text');
  const contrastToggle = document.getElementById('contrastToggle');
  const volumeSlider = document.getElementById('volumeSlider');
  const muteBtn = document.getElementById('muteBtn');

  // Game state
  let board = [];
  let selected = null;
  let busy = false;
  let levelIndex = 0;
  let score = 0;
  let movesLeft = 0;
  let timer = null;
  let timerRemaining = 0;
  let icedRemaining = 0;
  let specialCounts = {};
  let collectCount = 0;
  let loops = {};
  let sfx = {};
  let currentLoop = null;
  let volume = parseFloat(localStorage.getItem('ggc_volume') || '1');
  let muted = localStorage.getItem('ggc_muted') === 'true';
  let highContrast = localStorage.getItem('ggc_contrast') === 'true';

  // Level definitions
  const levels = [
    {
      name: '1',
      goal: { type: 'score', target: 3000 },
      moves: 30,
      loop: 'A'
    },
    {
      name: '2',
      goal: { type: 'collect', tileType: 0, target: 20 },
      moves: 25,
      loop: 'B'
    },
    {
      name: '3',
      goal: { type: 'iced', target: 10 },
      moves: 30,
      icedCells: 10,
      loop: 'C'
    },
    {
      name: '4',
      goal: { type: 'specials', target: 2 },
      moves: 35,
      loop: 'A'
    },
    {
      name: '5',
      goal: { type: 'timed', target: 6500 },
      time: 90,
      loop: 'B'
    }
  ];

  // Preload audio assets
  async function loadAssets() {
    const audioFiles = [
      { key: 'A', src: 'assets/audio/loops/loopA.mp3' },
      { key: 'B', src: 'assets/audio/loops/loopB.mp3' },
      { key: 'C', src: 'assets/audio/loops/loopC.mp3' },
      { key: 'swap', src: 'assets/audio/sfx/swap.mp3' },
      { key: 'match', src: 'assets/audio/sfx/match.mp3' },
      { key: 'special', src: 'assets/audio/sfx/special.mp3' },
      { key: 'pass', src: 'assets/audio/sfx/pass.mp3' },
      { key: 'fail', src: 'assets/audio/sfx/fail.mp3' },
      { key: 'dundun', src: 'assets/audio/sfx/dundun.mp3' }
    ];
    let loaded = 0;
    const total = audioFiles.length;
    function updateProgress() {
      const percent = Math.round((loaded / total) * 100);
      progressFill.style.width = percent + '%';
      progressText.textContent = percent + '%';
    }
    updateProgress();
    const promises = audioFiles.map(item => {
      return new Promise(resolve => {
        const audio = new Audio();
        audio.src = item.src;
        audio.loop = item.key === 'A' || item.key === 'B' || item.key === 'C';
        audio.addEventListener('canplaythrough', () => {
          loaded++;
          updateProgress();
          resolve();
        });
        audio.addEventListener('error', () => {
          console.warn('Failed to load', item.src);
          loaded++;
          updateProgress();
          resolve();
        });
        if (item.key.length === 1) {
          loops[item.key] = audio;
        } else {
          sfx[item.key] = audio;
        }
      });
    });
    await Promise.all(promises);
  }

  // Apply stored settings
  function applySettings() {
    volumeSlider.value = volume;
    contrastToggle.checked = highContrast;
    if (highContrast) document.body.classList.add('high-contrast');
    muteBtn.textContent = muted ? '🔇' : '🔈';
    setVolume(volume);
  }

  function setVolume(v) {
    volume = v;
    Object.values(loops).forEach(a => { a.volume = muted ? 0 : volume; });
    Object.values(sfx).forEach(a => { a.volume = muted ? 0 : volume; });
    localStorage.setItem('ggc_volume', String(volume));
  }
  function setMuted(m) {
    muted = m;
    muteBtn.textContent = muted ? '🔇' : '🔈';
    Object.values(loops).forEach(a => { a.volume = muted ? 0 : volume; });
    Object.values(sfx).forEach(a => { a.volume = muted ? 0 : volume; });
    localStorage.setItem('ggc_muted', muted ? 'true' : 'false');
  }
  function setContrast(on) {
    highContrast = on;
    if (on) document.body.classList.add('high-contrast');
    else document.body.classList.remove('high-contrast');
    localStorage.setItem('ggc_contrast', on ? 'true' : 'false');
  }

  // Start new game
  async function init() {
    await loadAssets();
    applySettings();
    loader.classList.add('hidden');
    gameEl.classList.remove('hidden');
    buildGrid();
    startLevel(0);
  }

  // Build grid DOM once
  function buildGrid() {
    gridContainer.innerHTML = '';
    for (let r = 0; r < Engine.ROWS; r++) {
      for (let c = 0; c < Engine.COLS; c++) {
        const div = document.createElement('div');
        div.className = 'tile';
        div.dataset.row = r;
        div.dataset.col = c;
        div.addEventListener('click', onTileClick);
        gridContainer.appendChild(div);
      }
    }
  }

  // Start a specific level
  function startLevel(idx) {
    levelIndex = idx;
    score = 0;
    collectCount = 0;
    icedRemaining = 0;
    specialCounts = { 0:0, 1:0, 2:0, 3:0, 4:0 };
    const level = levels[idx];
    if (currentLoop) {
      currentLoop.pause();
      currentLoop.currentTime = 0;
    }
    // Play loop associated with level
    currentLoop = loops[level.loop];
    if (currentLoop) {
      currentLoop.volume = muted ? 0 : volume;
      currentLoop.play().catch(() => {});
    }
    if (level.goal.type === 'score') {
      movesLeft = level.moves;
    } else if (level.goal.type === 'collect') {
      movesLeft = level.moves;
    } else if (level.goal.type === 'iced') {
      movesLeft = level.moves;
    } else if (level.goal.type === 'specials') {
      movesLeft = level.moves;
    } else if (level.goal.type === 'timed') {
      timerRemaining = level.time;
    }
    // Create board
    board = Engine.createBoard();
    // For iced level, assign iced tiles
    if (level.goal.type === 'iced') {
      icedRemaining = level.icedCells || level.goal.target;
      // Random positions for iced cells
      let count = 0;
      while (count < icedRemaining) {
        const r = Math.floor(Math.random() * Engine.ROWS);
        const c = Math.floor(Math.random() * Engine.COLS);
        if (board[r][c].iced === 0) {
          board[r][c].iced = 1;
          count++;
        }
      }
    }
    levelNameEl.textContent = 'Level ' + level.name;
    updateGoalText();
    updateInfoTexts();
    updateGrid();
    // Start timer for timed level
    if (level.goal.type === 'timed') {
      startTimer(level.time);
    }
  }

  function updateGoalText() {
    const level = levels[levelIndex];
    const goal = level.goal;
    let text = '';
    switch(goal.type) {
      case 'score':
        text = 'Reach ' + goal.target + ' points';
        break;
      case 'collect':
        text = 'Collect ' + goal.target + ' Rose buds';
        break;
      case 'iced':
        text = 'Break all iced cells (' + icedRemaining + ' left)';
        break;
      case 'specials':
        text = 'Create 2 of each power-up';
        break;
      case 'timed':
        text = 'Score ' + goal.target + ' in ' + levels[levelIndex].time + 's';
        break;
    }
    goalTextEl.textContent = text;
  }

  function updateInfoTexts() {
    scoreTextEl.textContent = 'Score: ' + score;
    const level = levels[levelIndex];
    if (level.goal.type === 'timed') {
      movesTextEl.textContent = '';
      timerTextEl.textContent = 'Time: ' + formatTime(timerRemaining);
    } else {
      movesTextEl.textContent = 'Moves: ' + movesLeft;
      timerTextEl.textContent = '';
    }
    if (level.goal.type === 'iced') {
      // recalc iced remaining
      let count = 0;
      for (let r = 0; r < Engine.ROWS; r++) {
        for (let c = 0; c < Engine.COLS; c++) {
          if (board[r][c].iced > 0) count++;
        }
      }
      icedRemaining = count;
      goalTextEl.textContent = 'Break all iced cells (' + icedRemaining + ' left)';
    }
    if (level.goal.type === 'collect') {
      const remaining = levels[levelIndex].goal.target - collectCount;
      goalTextEl.textContent = 'Collect ' + levels[levelIndex].goal.target + ' Rose buds (' + remaining + ' left)';
    }
    if (level.goal.type === 'specials') {
      // show counts of specials created
      const arr = [];
      for (let t = 0; t < 5; t++) {
        arr.push(specialCounts[t]);
      }
      goalTextEl.textContent = 'Power-ups: ' + arr.join('/');
    }
  }

  function formatTime(seconds) {
    const s = Math.floor(seconds % 60);
    const m = Math.floor(seconds / 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function startTimer(duration) {
    if (timer) clearInterval(timer);
    timerRemaining = duration;
    timerTextEl.textContent = 'Time: ' + formatTime(timerRemaining);
    timer = setInterval(() => {
      timerRemaining -= 1;
      if (timerRemaining < 0) {
        clearInterval(timer);
        timer = null;
        // time is up
        endLevel(false);
        return;
      }
      updateInfoTexts();
    }, 1000);
  }

  // Update the grid UI to reflect current board state
  function updateGrid() {
    const tiles = gridContainer.children;
    for (let i = 0; i < tiles.length; i++) {
      const r = Math.floor(i / Engine.COLS);
      const c = i % Engine.COLS;
      const cell = board[r][c];
      const div = tiles[i];
      // Set background image based on tile type
      div.style.backgroundImage = 'url(' + sprites[cell.type] + ')';
      div.classList.toggle('selected', selected && selected.r === r && selected.c === c);
      div.classList.toggle('iced', cell.iced > 0);
      // Mark specials with subtle border or glow
      if (cell.special && cell.special !== Engine.SPECIAL.NONE) {
        div.style.boxShadow = '0 0 6px 2px ' + getSpecialColor(cell.special);
      } else {
        div.style.boxShadow = '';
      }
    }
  }

  // Colour for specials effect
  function getSpecialColor(special) {
    switch(special) {
      case Engine.SPECIAL.ROW:
        return 'rgba(233,196,106,0.8)'; // gold
      case Engine.SPECIAL.COL:
        return 'rgba(177,94,76,0.8)'; // rust
      case Engine.SPECIAL.CROSS:
        return 'rgba(0,255,0,0.8)'; // green
      case Engine.SPECIAL.STASIS:
        return 'rgba(255,255,255,0.8)'; // white
      case Engine.SPECIAL.SHOCK:
        return 'rgba(0,150,255,0.8)'; // blue
      default:
        return 'rgba(0,0,0,0)';
    }
  }

  async function onTileClick(ev) {
    if (busy) return;
    const div = ev.currentTarget;
    const r = parseInt(div.dataset.row);
    const c = parseInt(div.dataset.col);
    const cell = board[r][c];
    // ignore clicks on iced-only layer? we allow selecting iced tiles
    if (!selected) {
      selected = { r, c };
      updateGrid();
      return;
    }
    const sr = selected.r;
    const sc = selected.c;
    if (sr === r && sc === c) {
      // deselect
      selected = null;
      updateGrid();
      return;
    }
    if (!Engine.isAdjacent(sr, sc, r, c)) {
      // new selection
      selected = { r, c };
      updateGrid();
      return;
    }
    // Attempt swap
    busy = true;
    sfx.swap && sfx.swap.play().catch(() => {});
    Engine.swap(board, sr, sc, r, c);
    updateGrid();
    await sleep(150);
    let matches = Engine.findMatches(board);
    if (matches.length === 0) {
      // no match, swap back
      Engine.swap(board, sr, sc, r, c);
      updateGrid();
      selected = null;
      busy = false;
      return;
    }
    selected = null;
    // use one move for move-based levels
    const level = levels[levelIndex];
    if (level.goal.type !== 'timed') {
      movesLeft--;
      if (movesLeft < 0) movesLeft = 0;
    }
    await resolveMatchesCascade(matches);
    updateInfoTexts();
    // After cascades, check goal
    if (checkGoalMet()) {
      endLevel(true);
      return;
    }
    // If moves exhausted on non-timed level, fail
    if (level.goal.type !== 'timed' && movesLeft <= 0) {
      endLevel(false);
      return;
    }
    busy = false;
  }

  // Resolve matches and cascades recursively
  async function resolveMatchesCascade(initialMatches) {
    let matches = initialMatches;
    let comboCount = 0;
    while (matches.length > 0) {
      comboCount++;
      // Clear matches and create specials
      // Clone board before clearing to know tile types
      const beforeBoard = Engine.cloneBoard(board);
      const { cleared, createdSpecials } = Engine.clearMatches(board, matches);
      if (cleared.length > 0) {
        sfx.match && sfx.match.play().catch(() => {});
      }
      // Count collected roses (type 0) for level 2
      const currentLevel = levels[levelIndex];
      if (currentLevel.goal.type === 'collect') {
        for (const [rr,cc] of cleared) {
          const cellBefore = beforeBoard[rr][cc];
          if (cellBefore && cellBefore.type === currentLevel.goal.tileType) {
            collectCount++;
          }
        }
      }
      // Record special counts for level 4
      for (const sp of createdSpecials) {
        specialCounts[sp.type] = (specialCounts[sp.type] || 0) + 1;
      }
      // Additional clears from special activations
      let additionalPositions = [];
      let stasisTriggered = false;
      for (const sp of createdSpecials) {
        const { positions, stasis } = Engine.activateSpecial(board, sp.r, sp.c);
        if (stasis) {
          stasisTriggered = true;
        }
        for (const pos of positions) {
          additionalPositions.push(pos);
        }
      }
      // Remove duplicates and process additional positions
      let extras = [];
      if (additionalPositions.length > 0) {
        const unique = {};
        for (const [rr,cc] of additionalPositions) {
          unique[rr + ',' + cc] = true;
        }
        for (const key in unique) {
          const [rr,cc] = key.split(',').map(x=>parseInt(x));
          const cell2 = board[rr][cc];
          if (cell2) {
            if (cell2.iced > 0) {
              cell2.iced = 0;
            } else {
              board[rr][cc] = null;
              extras.push([rr,cc]);
            }
          }
        }
        if (extras.length > 0) {
          sfx.special && sfx.special.play().catch(() => {});
        }
      }
      // If stasis triggered, pause timer for a few seconds
      if (stasisTriggered && levels[levelIndex].goal.type === 'timed' && timer) {
        clearInterval(timer);
        let pauseTime = 3;
        const interval = setInterval(() => {
          pauseTime--;
          if (pauseTime <= 0) {
            clearInterval(interval);
            startTimer(timerRemaining);
          }
        }, 1000);
      }
      // Drop tiles and refill
      Engine.dropTiles(board);
      // Compute removed count (cleared + extras) for scoring
      const removedCount = cleared.length + extras.length;
      score += removedCount * 10 * comboCount;
      // Update collectCount for extras removed (level 2)
      const lvl2 = levels[levelIndex];
      if (lvl2.goal.type === 'collect') {
        for (const [rr,cc] of extras) {
          const cellBefore2 = beforeBoard[rr][cc];
          if (cellBefore2 && cellBefore2.type === lvl2.goal.tileType) {
            collectCount++;
          }
        }
      }
      updateInfoTexts();
      updateGrid();
      // small pause between cascades for visual effect
      await sleep(250);
      // find new matches due to drop
      matches = Engine.findMatches(board);
    }
  }

  function checkGoalMet() {
    const level = levels[levelIndex];
    switch(level.goal.type) {
      case 'score':
        return score >= level.goal.target;
      case 'collect':
        return collectCount >= level.goal.target;
      case 'iced':
        // compute remaining iced
        let count = 0;
        for (let r = 0; r < Engine.ROWS; r++) {
          for (let c = 0; c < Engine.COLS; c++) {
            if (board[r][c].iced > 0) count++;
          }
        }
        icedRemaining = count;
        return count === 0;
      case 'specials':
        // Need at least target of each type
        for (let t = 0; t < 5; t++) {
          if ((specialCounts[t] || 0) < level.goal.target) return false;
        }
        return true;
      case 'timed':
        return score >= level.goal.target;
    }
    return false;
  }

  function endLevel(success) {
    busy = true;
    // stop timer and music
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    if (currentLoop) {
      currentLoop.pause();
    }
    // Play sound
    if (success) {
      sfx.pass && sfx.pass.play().catch(() => {});
    } else {
      sfx.fail && sfx.fail.play().catch(() => {});
    }
    // Show modal
    modalTitle.textContent = success ? 'Level Cleared!' : 'Level Failed';
    if (success) {
      // Provide birthday lore line with a groove snippet note
      const messages = [
        'Mom’s garden glows brighter!',
        'The stars sway to your rhythm.',
        'You watered the cosmos with love.',
        'Brad & Tiffany cheer you on!',
        'Soul grooves echo through space.'
      ];
      modalMessage.textContent = messages[Math.floor(Math.random() * messages.length)];
    } else {
      modalMessage.textContent = 'Don’t worry – try again and keep groovin’!';
    }
    modal.classList.remove('hidden');
    modalBtn.onclick = () => {
      modal.classList.add('hidden');
      // resume music next level
      if (success) {
        const next = levelIndex + 1;
        if (next < levels.length) {
          startLevel(next);
        } else {
          // Game finished
          modalTitle.textContent = 'All Levels Complete!';
          modalMessage.textContent = 'You mastered the Galaxy Garden. Happy Birthday, Mom!';
          modalBtn.textContent = 'Restart';
          modal.classList.remove('hidden');
          modalBtn.onclick = () => {
            modal.classList.add('hidden');
            modalBtn.textContent = 'Continue';
            startLevel(0);
          };
        }
      } else {
        // retry current level
        startLevel(levelIndex);
      }
      busy = false;
    };
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Control event listeners
  volumeSlider.addEventListener('input', (e) => {
    setVolume(parseFloat(e.target.value));
  });
  muteBtn.addEventListener('click', () => {
    setMuted(!muted);
  });
  contrastToggle.addEventListener('change', (e) => {
    setContrast(e.target.checked);
  });

  // Keyboard support: arrow keys move selection; space to select or swap
  document.addEventListener('keydown', (e) => {
    if (busy) return;
    const key = e.key;
    const tiles = gridContainer.children;
    if (!selected && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(key)) {
      // select first tile at top-left if none selected
      selected = { r: 0, c: 0 };
      updateGrid();
      return;
    }
    if (!selected) return;
    let { r, c } = selected;
    if (key === 'ArrowUp') {
      r = Math.max(0, r - 1);
    } else if (key === 'ArrowDown') {
      r = Math.min(Engine.ROWS - 1, r + 1);
    } else if (key === 'ArrowLeft') {
      c = Math.max(0, c - 1);
    } else if (key === 'ArrowRight') {
      c = Math.min(Engine.COLS - 1, c + 1);
    } else if (key === ' ') {
      // confirm selection: will treat as second click same tile to deselect
      onTileClick({ currentTarget: gridContainer.children[selected.r * Engine.COLS + selected.c] });
      return;
    } else {
      return;
    }
    selected = { r, c };
    updateGrid();
    e.preventDefault();
  });

  // Start game when DOM ready
  window.addEventListener('load', () => {
    init();
  });
})();