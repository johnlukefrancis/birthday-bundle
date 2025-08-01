// Centralized Game State Management for Galaxy Garden Crush
class GameStateClass {
  constructor() {
    this.state = {
      // Game flow state
      gamePhase: 'loading', // loading, menu, playing, paused, complete, gameover
      levelIndex: 0,
      
      // Grid state
      board: [],
      gridBusy: false,
      selectedTile: null,
      
      // Score and progress
      score: 0,
      movesLeft: 0,
      timerRemaining: 0,
      
      // Level objectives
      currentGoal: null,
      goalProgress: 0,
      
      // Special mechanics
      icedRemaining: 0,
      specialCounts: {},
      collectCount: 0,
      
      // Settings
      volume: 1,
      muted: false,
      highContrast: false,
      
      // Asset loading
      assetsLoaded: false,
      loadProgress: 0
    };
    
    // Level definitions (with your music!)
    this.levels = [
      {
        name: '1',
        goal: { type: 'score', target: 3000 },
        moves: 30,
        loop: 'song1'
      },
      {
        name: '2',
        goal: { type: 'score', target: 5000 },
        moves: 25,
        loop: 'song2'
      },
      {
        name: '3',
        goal: { type: 'special', target: 5 },
        moves: 30,
        loop: 'song3'
      },
      {
        name: '4',
        goal: { type: 'collect', target: 20 },
        moves: 25,
        loop: 'song4'
      },
      {
        name: '5',
        goal: { type: 'iced', target: 10 },
        moves: 20,
        iced: 8,
        loop: 'song5'
      }
    ];
    
    this.initializeFromStorage();
  }
  
  // Initialize state from localStorage
  initializeFromStorage() {
    this.state.volume = parseFloat(localStorage.getItem('ggc_volume') || '1');
    this.state.muted = localStorage.getItem('ggc_muted') === 'true';
    this.state.highContrast = localStorage.getItem('ggc_contrast') === 'true';
  }
  
  // Get current state (read-only copy)
  getState() {
    return { ...this.state };
  }
  
  // Get specific state value
  get(key) {
    return this.state[key];
  }
  
  // Set state value and emit change event
  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    
    // Emit specific change events
    EventBus.emit(`state:${key}Changed`, { 
      key, 
      value, 
      oldValue, 
      state: this.getState() 
    });
    
    // Emit general state change
    EventBus.emit('state:changed', { 
      key, 
      value, 
      oldValue, 
      state: this.getState() 
    });
  }
  
  // Update multiple state values atomically
  update(changes) {
    const oldState = this.getState();
    Object.keys(changes).forEach(key => {
      this.state[key] = changes[key];
    });
    
    // Emit batch change event
    EventBus.emit('state:batchChanged', {
      changes,
      oldState,
      newState: this.getState()
    });
  }
  
  // Get current level configuration
  getCurrentLevel() {
    return this.levels[this.state.levelIndex] || null;
  }
  
  // Check if more levels exist
  hasNextLevel() {
    return this.state.levelIndex < this.levels.length - 1;
  }
  
  // Advance to next level
  nextLevel() {
    if (this.hasNextLevel()) {
      this.set('levelIndex', this.state.levelIndex + 1);
      return this.getCurrentLevel();
    }
    return null;
  }
  
  // Reset level state (for retries)
  resetLevelState() {
    const level = this.getCurrentLevel();
    if (level) {
      this.update({
        score: 0,
        movesLeft: level.moves,
        timerRemaining: level.timer || 0,
        icedRemaining: level.iced || 0,
        specialCounts: {},
        collectCount: 0,
        goalProgress: 0,
        selectedTile: null,
        gridBusy: false
      });
    }
  }
  
  // Persist settings to localStorage
  saveSettings() {
    localStorage.setItem('ggc_volume', this.state.volume.toString());
    localStorage.setItem('ggc_muted', this.state.muted.toString());
    localStorage.setItem('ggc_contrast', this.state.highContrast.toString());
  }
  
  // Reset all game state
  reset() {
    this.state.levelIndex = 0;
    this.resetLevelState();
    this.set('gamePhase', 'menu');
  }
}

// Create global state instance
const GameState = new GameStateClass();

// Export for module usage
window.GameState = GameState;
