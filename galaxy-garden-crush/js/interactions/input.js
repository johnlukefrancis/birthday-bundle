// Input Handling System for Galaxy Garden Crush
class InputSystemClass {
  constructor() {
    this.selectedTile = null;
    this.initialized = false;
    this.gridContainer = null;
    
    this.setupEventListeners();
  }
  
  // Set up event listeners
  setupEventListeners() {
    EventBus.on(EVENTS.INPUT_TILE_CLICK, (data) => this.handleTileClick(data));
    EventBus.on(EVENTS.UI_SCREEN_CHANGE, (data) => this.handleScreenChange(data));
    EventBus.on('state:gridBusyChanged', (data) => this.handleBusyState(data));
  }
  
  // Initialize input system
  initialize() {
    this.gridContainer = document.getElementById('grid-container');
    if (!this.gridContainer) {
      console.error('Grid container not found for input system');
      return;
    }
    
    // Set up keyboard controls
    this.setupKeyboardControls();
    
    this.initialized = true;
    console.log('Input system initialized');
  }
  
  // Set up keyboard controls
  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }
  
  // Handle tile click events
  handleTileClick(data) {
    // Check if grid is busy
    if (GameState.get('gridBusy')) {
      return;
    }
    
    // Check if game is in playing state
    if (GameState.get('gamePhase') !== 'playing') {
      return;
    }
    
    const { row, col } = data;
    
    if (!this.selectedTile) {
      // First selection
      this.selectTile(row, col);
    } else {
      const { row: selectedRow, col: selectedCol } = this.selectedTile;
      
      if (selectedRow === row && selectedCol === col) {
        // Clicking same tile - deselect
        this.deselectTile();
      } else if (this.isAdjacent(selectedRow, selectedCol, row, col)) {
        // Adjacent tile - attempt swap
        this.attemptSwap(selectedRow, selectedCol, row, col);
      } else {
        // Non-adjacent tile - new selection
        this.selectTile(row, col);
      }
    }
  }
  
  // Select a tile
  selectTile(row, col) {
    this.selectedTile = { row, col };
    GameState.set('selectedTile', this.selectedTile);
    
    // Play selection sound effect
    EventBus.emit(EVENTS.AUDIO_PLAY_SFX, { sound: 'swap' });
    
    console.log('Tile selected:', row, col);
  }
  
  // Deselect current tile
  deselectTile() {
    this.selectedTile = null;
    GameState.set('selectedTile', null);
    
    console.log('Tile deselected');
  }
  
  // Attempt to swap two tiles
  attemptSwap(fromRow, fromCol, toRow, toCol) {
    // Clear selection immediately
    this.deselectTile();
    
    // Set grid busy to prevent further input
    GameState.set('gridBusy', true);
    
    // Emit swap event for grid system to handle
    EventBus.emit(EVENTS.PIECES_SWAPPED, {
      fromRow,
      fromCol,
      toRow,
      toCol
    });
    
    console.log('Swap attempted:', fromRow, fromCol, '→', toRow, toCol);
  }
  
  // Check if two positions are adjacent
  isAdjacent(r1, c1, r2, c2) {
    return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
  }
  
  // Handle keyboard input
  handleKeyDown(event) {
    // Only handle keyboard input when game is playing
    if (GameState.get('gamePhase') !== 'playing') {
      return;
    }
    
    // Don't handle input if grid is busy
    if (GameState.get('gridBusy')) {
      return;
    }
    
    const key = event.key;
    const { rows, cols } = GridSystem.getDimensions();
    
    // Initialize selection if none exists
    if (!this.selectedTile && this.isNavigationKey(key)) {
      this.selectTile(0, 0);
      event.preventDefault();
      return;
    }
    
    if (!this.selectedTile) return;
    
    let { row, col } = this.selectedTile;
    
    switch(key) {
      case 'ArrowUp':
        row = Math.max(0, row - 1);
        this.selectTile(row, col);
        event.preventDefault();
        break;
        
      case 'ArrowDown':
        row = Math.min(rows - 1, row + 1);
        this.selectTile(row, col);
        event.preventDefault();
        break;
        
      case 'ArrowLeft':
        col = Math.max(0, col - 1);
        this.selectTile(row, col);
        event.preventDefault();
        break;
        
      case 'ArrowRight':
        col = Math.min(cols - 1, col + 1);
        this.selectTile(row, col);
        event.preventDefault();
        break;
        
      case ' ':
      case 'Enter':
        // Confirm selection (deselect)
        this.deselectTile();
        event.preventDefault();
        break;
        
      case 'Escape':
        // Cancel selection
        this.deselectTile();
        event.preventDefault();
        break;
    }
  }
  
  // Check if key is a navigation key
  isNavigationKey(key) {
    return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(key);
  }
  
  // Handle screen changes
  handleScreenChange(data) {
    if (data.to === 'game' || data.to === 'playing') {
      if (!this.initialized) {
        this.initialize();
      }
    } else {
      // Clear selection when leaving game
      this.deselectTile();
    }
  }
  
  // Handle grid busy state changes
  handleBusyState(data) {
    if (data.value && this.selectedTile) {
      // Grid became busy - clear selection for clarity
      this.deselectTile();
    }
  }
  
  // Handle swap rejection
  handleSwapRejected() {
    // Re-enable input after failed swap
    GameState.set('gridBusy', false);
    
    console.log('Swap rejected - input re-enabled');
  }
  
  // Handle successful swap completion
  handleSwapComplete() {
    // Grid system will handle re-enabling input after cascades
    console.log('Swap completed');
  }
  
  // Get current selection
  getSelection() {
    return this.selectedTile;
  }
  
  // Force clear selection (for external use)
  clearSelection() {
    this.deselectTile();
  }
  
  // Check if input is currently enabled
  isInputEnabled() {
    return (
      this.initialized &&
      GameState.get('gamePhase') === 'playing' &&
      !GameState.get('gridBusy')
    );
  }
  
  // Disable input temporarily
  disableInput() {
    GameState.set('gridBusy', true);
  }
  
  // Enable input
  enableInput() {
    GameState.set('gridBusy', false);
  }
  
  // Cleanup
  destroy() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    
    this.selectedTile = null;
    this.initialized = false;
    this.gridContainer = null;
  }
}

// Create global input system instance
const InputSystem = new InputSystemClass();

// Set up additional event listeners for swap results
EventBus.on(EVENTS.SWAP_REJECTED, () => InputSystem.handleSwapRejected());
EventBus.on(EVENTS.BOARD_SETTLED, () => InputSystem.handleSwapComplete());

// Export for module usage
window.InputSystem = InputSystem;
