// Grid Management System for Galaxy Garden Crush
class GridSystemClass {
  constructor() {
    this.ROWS = 8;
    this.COLS = 8;
    this.TYPES = 5; // number of base tile types
    this.gridContainer = null;
    this.sprites = {};
    this.initialized = false;
    
    // Special codes preserved from original engine
    this.SPECIAL = {
      NONE: 0,
      ROW: 1,
      COL: 2,
      CROSS: 3,
      STASIS: 4,
      SHOCK: 5
    };
    
    // Map tile type to special created on 4/5 match
    this.TYPE_TO_SPECIAL = {
      0: this.SPECIAL.ROW,     // Rose Bud => Watering Can (row clear)
      1: this.SPECIAL.COL,     // Bonsai-prise => Photon Burst (column clear)
      2: this.SPECIAL.CROSS,   // Fern Spiral => Hydro Burst (cross explosion)
      3: this.SPECIAL.STASIS,  // Succulent Star => Stasis Field (pause timer)
      4: this.SPECIAL.SHOCK    // Evidence Tag => Shockwave (3x3)
    };
    
    this.setupEventListeners();
  }
  
  // Set up event listeners
  setupEventListeners() {
    EventBus.on(EVENTS.LEVEL_START, (data) => this.initializeLevel(data));
    EventBus.on(EVENTS.PIECES_SWAPPED, (data) => this.handleSwap(data));
    EventBus.on(EVENTS.UI_SCREEN_CHANGE, (data) => this.handleScreenChange(data));
    EventBus.on('grid:update', () => this.updateDisplay());
    EventBus.on('grid:buildDOM', () => this.buildGridDOM());
  }
  
  // Initialize grid system
  initialize() {
    this.gridContainer = document.getElementById('grid-container');
    if (!this.gridContainer) {
      console.error('Grid container not found');
      return;
    }
    
    // Load sprite references from global sprites object
    this.sprites = window.sprites || {};
    
    this.buildGridDOM();
    this.initialized = true;
    console.log('Grid system initialized');
  }
  
  // Build grid DOM structure
  buildGridDOM() {
    if (!this.gridContainer) return;
    
    this.gridContainer.innerHTML = '';
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const div = document.createElement('div');
        div.className = 'tile';
        div.dataset.row = r;
        div.dataset.col = c;
        
        // Add click and touch handlers
        const handleTileInteraction = (ev) => {
          ev.preventDefault(); // Prevent default touch behavior
          EventBus.emit(EVENTS.INPUT_TILE_CLICK, {
            row: r,
            col: c,
            element: div,
            originalEvent: ev
          });
        };
        
        div.addEventListener('click', handleTileInteraction);
        div.addEventListener('touchstart', handleTileInteraction);
        
        // Prevent text selection and zoom on double tap
        div.style.webkitUserSelect = 'none';
        div.style.userSelect = 'none';
        div.style.webkitTouchCallout = 'none';
        div.style.touchAction = 'manipulation';
        
        this.gridContainer.appendChild(div);
      }
    }
    console.log('Grid DOM built');
  }
  
  // Initialize level with new board
  initializeLevel(data) {
    const { level } = data;
    
    // Guard against undefined level
    if (!level) {
      console.error('Grid system: level data is undefined');
      return;
    }
    
    // Create new board
    const board = this.createBoard();
    
    // Add iced tiles for iced levels
    if (level.goal.type === 'iced') {
      this.addIcedTiles(board, level.iced || level.goal.target);
    }
    
    // Update state
    GameState.set('board', board);
    
    // Update display
    this.updateDisplay();
    
    console.log('Level initialized with new board');
  }
  
  // Create a fresh board with no initial matches
  createBoard(options = {}) {
    let board;
    do {
      board = [];
      for (let r = 0; r < this.ROWS; r++) {
        const row = [];
        for (let c = 0; c < this.COLS; c++) {
          row.push(this.randomTile());
        }
        board.push(row);
      }
    } while (this.findMatches(board).length > 0);
    
    return board;
  }
  
  // Return a random tile object
  randomTile() {
    return { 
      type: Math.floor(Math.random() * this.TYPES), 
      special: this.SPECIAL.NONE, 
      iced: 0 
    };
  }
  
  // Add iced tiles to board
  addIcedTiles(board, count) {
    let added = 0;
    while (added < count) {
      const r = Math.floor(Math.random() * this.ROWS);
      const c = Math.floor(Math.random() * this.COLS);
      if (board[r][c].iced === 0) {
        board[r][c].iced = 1;
        added++;
      }
    }
  }
  
  // Handle piece swap request
  handleSwap(data) {
    const { fromRow, fromCol, toRow, toCol } = data;
    const board = GameState.get('board');
    
    if (!this.isValidSwap(board, fromRow, fromCol, toRow, toCol)) {
      EventBus.emit(EVENTS.SWAP_REJECTED, { fromRow, fromCol, toRow, toCol });
      return;
    }
    
    // Perform swap
    this.swap(board, fromRow, fromCol, toRow, toCol);
    GameState.set('board', board);
    
    // Check for matches
    const matches = this.findMatches(board);
    
    if (matches.length === 0) {
      // No matches - swap back
      this.swap(board, fromRow, fromCol, toRow, toCol);
      GameState.set('board', board);
      EventBus.emit(EVENTS.SWAP_REJECTED, { fromRow, fromCol, toRow, toCol });
    } else {
      // Valid move
      EventBus.emit(EVENTS.MATCH_DETECTED, { 
        matches,
        validMove: true
      });
      
      // Trigger cascade resolution
      this.resolveMatchesCascade(matches);
    }
    
    this.updateDisplay();
  }
  
  // Check if swap is valid (adjacent tiles)
  isValidSwap(board, r1, c1, r2, c2) {
    return this.isAdjacent(r1, c1, r2, c2);
  }
  
  // Determine if two positions are adjacent
  isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }
  
  // Swap two positions in board
  swap(board, r1, c1, r2, c2) {
    const tmp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = tmp;
  }
  
  // Deep clone board (for safe operations)
  cloneBoard(board) {
    return board.map(row => row.map(cell => Object.assign({}, cell)));
  }
  
  // Find all matches on the board
  findMatches(board) {
    const marked = [];
    for (let r = 0; r < this.ROWS; r++) {
      marked[r] = Array(this.COLS).fill(false);
    }
    
    // Horizontal matches
    for (let r = 0; r < this.ROWS; r++) {
      let runStart = 0;
      for (let c = 1; c <= this.COLS; c++) {
        const curr = c < this.COLS ? board[r][c] : null;
        const prev = board[r][c - 1];
        if (c < this.COLS && curr && prev && curr.type === prev.type) {
          continue;
        }
        const runEnd = c;
        const runLength = runEnd - runStart;
        if (runLength >= 3) {
          for (let i = runStart; i < runEnd; i++) {
            marked[r][i] = true;
          }
        }
        runStart = c;
      }
    }
    
    // Vertical matches
    for (let c = 0; c < this.COLS; c++) {
      let runStart = 0;
      for (let r = 1; r <= this.ROWS; r++) {
        const curr = r < this.ROWS ? board[r][c] : null;
        const prev = board[r - 1][c];
        if (r < this.ROWS && curr && prev && curr.type === prev.type) {
          continue;
        }
        const runEnd = r;
        const runLength = runEnd - runStart;
        if (runLength >= 3) {
          for (let i = runStart; i < runEnd; i++) {
            marked[i][c] = true;
          }
        }
        runStart = r;
      }
    }
    
    // Convert marked positions to match groups
    const matches = [];
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        if (marked[r][c]) {
          matches.push([r, c]);
        }
      }
    }
    
    return matches;
  }
  
  // Resolve matches and cascades
  async resolveMatchesCascade(initialMatches) {
    let matches = initialMatches;
    let comboCount = 0;
    
    // Set grid busy during cascade processing
    GameState.set('gridBusy', true);
    
    while (matches.length > 0) {
      comboCount++;
      
      // Process matches
      const result = this.processMatches(matches, comboCount);
      
      // Emit events for other systems
      EventBus.emit(EVENTS.SCORE_CHANGED, {
        points: result.points,
        combo: comboCount,
        positions: result.cleared
      });
      
      if (result.specials.length > 0) {
        EventBus.emit(EVENTS.SPECIAL_ACTIVATED, {
          specials: result.specials
        });
      }
      
      // Drop tiles and refill
      this.dropTiles();
      
      // Update display
      this.updateDisplay();
      
      // Wait for visual effect
      await this.sleep(250);
      
      // Find new matches
      const board = GameState.get('board');
      matches = this.findMatches(board);
    }
    
    // All cascades complete - clear busy state
    GameState.set('gridBusy', false);
    EventBus.emit(EVENTS.BOARD_SETTLED);
  }
  
  // Process matches and return results
  processMatches(matches, comboCount) {
    const board = GameState.get('board');
    const beforeBoard = this.cloneBoard(board);
    
    // Clear matched tiles and create specials
    const { cleared, createdSpecials } = this.clearMatches(board, matches);
    
    // Calculate points
    const points = cleared.length * 10 * comboCount;
    
    // Update board state
    GameState.set('board', board);
    
    // Play sound effect
    EventBus.emit(EVENTS.AUDIO_PLAY_SFX, { sound: 'match' });
    
    return {
      cleared,
      specials: createdSpecials,
      points
    };
  }
  
  // Clear matches and create special tiles
  clearMatches(board, matches) {
    const cleared = [];
    const createdSpecials = [];
    
    // Implementation details preserved from original engine
    // This is simplified - full implementation would be more complex
    matches.forEach(([r, c]) => {
      if (board[r][c]) {
        cleared.push([r, c]);
        
        // Clear iced tiles
        if (board[r][c].iced > 0) {
          board[r][c].iced = 0;
        } else {
          board[r][c] = null;
        }
      }
    });
    
    return { cleared, createdSpecials };
  }
  
  // Drop tiles and refill empty spaces
  dropTiles() {
    const board = GameState.get('board');
    
    // Drop existing tiles
    for (let c = 0; c < this.COLS; c++) {
      let writePos = this.ROWS - 1;
      for (let r = this.ROWS - 1; r >= 0; r--) {
        if (board[r][c] !== null) {
          if (r !== writePos) {
            board[writePos][c] = board[r][c];
            board[r][c] = null;
          }
          writePos--;
        }
      }
    }
    
    // Fill empty spaces with new tiles
    for (let c = 0; c < this.COLS; c++) {
      for (let r = 0; r < this.ROWS; r++) {
        if (board[r][c] === null) {
          board[r][c] = this.randomTile();
        }
      }
    }
    
    GameState.set('board', board);
  }
  
  // Update grid display
  updateDisplay() {
    if (!this.gridContainer) return;
    
    const board = GameState.get('board');
    const selectedTile = GameState.get('selectedTile');
    const tiles = this.gridContainer.children;
    
    for (let i = 0; i < tiles.length; i++) {
      const r = Math.floor(i / this.COLS);
      const c = i % this.COLS;
      const cell = board[r][c];
      const div = tiles[i];
      
      if (!cell) continue;
      
      // Set background image based on tile type
      div.style.backgroundImage = `url(${this.sprites[cell.type] || ''})`;
      
      // Update selection state
      div.classList.toggle('selected', 
        selectedTile && selectedTile.row === r && selectedTile.col === c);
      
      // Update iced state
      div.classList.toggle('iced', cell.iced > 0);
      
      // Mark specials with visual effect
      if (cell.special && cell.special !== this.SPECIAL.NONE) {
        div.style.boxShadow = `0 0 6px 2px ${this.getSpecialColor(cell.special)}`;
      } else {
        div.style.boxShadow = '';
      }
    }
  }
  
  // Get special effect color
  getSpecialColor(special) {
    switch(special) {
      case this.SPECIAL.ROW:
        return 'rgba(233,196,106,0.8)'; // gold
      case this.SPECIAL.COL:
        return 'rgba(177,94,76,0.8)'; // rust
      case this.SPECIAL.CROSS:
        return 'rgba(0,255,0,0.8)'; // green
      case this.SPECIAL.STASIS:
        return 'rgba(255,255,255,0.8)'; // white
      case this.SPECIAL.SHOCK:
        return 'rgba(0,150,255,0.8)'; // blue
      default:
        return 'rgba(0,0,0,0)';
    }
  }
  
  // Handle screen changes
  handleScreenChange(data) {
    if (data.to === 'game' || data.to === 'playing') {
      if (!this.initialized) {
        this.initialize();
      }
    }
  }
  
  // Utility sleep function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Get board dimensions
  getDimensions() {
    return { rows: this.ROWS, cols: this.COLS };
  }
  
  // Get tile at position
  getTileAt(row, col) {
    const board = GameState.get('board');
    if (row >= 0 && row < this.ROWS && col >= 0 && col < this.COLS) {
      return board[row][col];
    }
    return null;
  }
}

// Create global grid system instance
const GridSystem = new GridSystemClass();

// Export for module usage
window.GridSystem = GridSystem;
