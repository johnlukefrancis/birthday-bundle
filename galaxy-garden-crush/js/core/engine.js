// Main Game Engine Orchestration for Galaxy Garden Crush
class GameEngineClass {
  constructor() {
    this.initialized = false;
    this.running = false;
    
    // Module references (will be set during initialization)
    this.modules = {};
  }
  
  // Initialize all game modules in proper order
  async initialize() {
    if (this.initialized) return;
    
    console.log('Initializing Galaxy Garden Crush...');
    
    try {
      // Initialize core systems first
      await this.initializeAudioSystem();
      await this.initializeGridSystem();
      await this.initializeInputSystem();
      await this.initializeUISystem();
      await this.initializeScoringSystem();
      await this.initializeTimerSystem();
      
      // Set up event listeners for coordination
      this.setupEventListeners();
      
      // Load game assets
      await this.loadAssets();
      
      // Apply saved settings
      this.applySettings();
      
      // Initialize UI
      EventBus.emit(EVENTS.GAME_INIT);
      
      this.initialized = true;
      console.log('Galaxy Garden Crush initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      throw error;
    }
  }
  
  // Initialize individual systems (placeholder - will be implemented by modules)
  async initializeAudioSystem() {
    // Audio system will handle its own initialization
    console.log('Audio system ready');
  }
  
  async initializeGridSystem() {
    // Grid system will handle board creation and management
    console.log('Grid system ready');
  }
  
  async initializeInputSystem() {
    // Input system will handle mouse/touch/keyboard input
    console.log('Input system ready');
  }
  
  async initializeUISystem() {
    // UI system will handle screen management and HUD
    console.log('UI system ready');
  }
  
  async initializeScoringSystem() {
    // Scoring system will handle score calculation and tracking
    console.log('Scoring system ready');
  }
  
  async initializeTimerSystem() {
    // Timer system will handle countdown timers
    console.log('Timer system ready');
  }
  
  // Set up event listeners for module coordination
  setupEventListeners() {
    // Game lifecycle events
    EventBus.on(EVENTS.GAME_START, () => this.startGame());
    EventBus.on(EVENTS.GAME_PAUSE, () => this.pauseGame());
    EventBus.on(EVENTS.GAME_RESUME, () => this.resumeGame());
    EventBus.on(EVENTS.GAME_OVER, () => this.endGame());
    
    // Level management - removed LEVEL_START to prevent recursion
    EventBus.on(EVENTS.LEVEL_COMPLETE, (data) => this.handleLevelComplete(data));
    
    // Grid events
    EventBus.on(EVENTS.PIECES_SWAPPED, (data) => this.handlePiecesSwapped(data));
    EventBus.on(EVENTS.MATCH_DETECTED, (data) => this.handleMatchDetected(data));
    EventBus.on(EVENTS.SCORE_CHANGED, (data) => this.handleScoreChanged(data));
    EventBus.on(EVENTS.BOARD_SETTLED, () => this.handleBoardSettled());
    
    // State change events
    EventBus.on('state:gamePhaseChanged', (data) => this.handleGamePhaseChanged(data));
  }
  
  // Load game assets
  async loadAssets() {
    console.log('Loading game assets...');
    
    // Emit loading events for UI updates
    EventBus.emit('loading:started');
    
    try {
      // Trigger asset loading in modules
      EventBus.emit('assets:loadRequest');
      
      // Wait for assets to be loaded (modules will update progress)
      await this.waitForAssetLoading();
      
      EventBus.emit('loading:complete');
      GameState.set('assetsLoaded', true);
      
    } catch (error) {
      console.error('Asset loading failed:', error);
      EventBus.emit('loading:error', { error });
      throw error;
    }
  }
  
  // Wait for asset loading completion
  async waitForAssetLoading() {
    return new Promise((resolve) => {
      const checkLoading = () => {
        if (GameState.get('loadProgress') >= 100) {
          resolve();
        } else {
          setTimeout(checkLoading, 100);
        }
      };
      checkLoading();
    });
  }
  
  // Apply saved settings from localStorage
  applySettings() {
    const volume = GameState.get('volume');
    const muted = GameState.get('muted');
    const highContrast = GameState.get('highContrast');
    
    // Emit settings events for modules to handle
    EventBus.emit(EVENTS.AUDIO_VOLUME_CHANGED, { volume });
    EventBus.emit(EVENTS.AUDIO_MUTE_TOGGLED, { muted });
    EventBus.emit('settings:contrastChanged', { highContrast });
    
    console.log('Settings applied');
  }
  
  // Start the game
  startGame() {
    if (!this.initialized) {
      console.error('Cannot start game - not initialized');
      return;
    }
    
    this.running = true;
    GameState.set('gamePhase', 'menu');
    
    // Hide loader, show game
    EventBus.emit(EVENTS.UI_SCREEN_CHANGE, { 
      from: 'loading', 
      to: 'menu' 
    });
    
    console.log('Game started');
  }
  
  // Start a specific level
  startLevel(levelIndex) {
    const level = GameState.levels[levelIndex];
    if (!level) {
      console.error('Invalid level index:', levelIndex);
      return;
    }
    
    console.log('Starting level:', level.name);
    
    // Update state
    GameState.update({
      levelIndex,
      gamePhase: 'playing',
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
    
    // Emit level start event for modules
    EventBus.emit(EVENTS.LEVEL_START, { 
      levelIndex, 
      level,
      state: GameState.getState()
    });
    
    // Start audio for level with your music!
    EventBus.emit(EVENTS.AUDIO_PLAY_MUSIC, { 
      track: level.loop 
    });
    
    // Initialize timer if needed
    if (level.timer) {
      EventBus.emit('timer:start', { 
        duration: level.timer 
      });
    }
  }
  
  // Handle pieces being swapped
  handlePiecesSwapped(data) {
    // This event is emitted when input system requests a swap
    // The grid system will handle validation and emit MATCH_DETECTED for valid moves
  }
  
  // Handle matches being detected
  handleMatchDetected(data) {
    // Use move for valid swaps in move-based levels
    if (data.validMove) {
      const level = GameState.getCurrentLevel();
      if (level && level.goal.type !== 'timed') {
        const currentMoves = GameState.get('movesLeft');
        const movesLeft = currentMoves - 1;
        GameState.set('movesLeft', Math.max(0, movesLeft));
        console.log('Move used:', { currentMoves, newMovesLeft: Math.max(0, movesLeft) });
      }
    }
    
    // Trigger visual effects (if positions are available)
    if (data.positions) {
      EventBus.emit(EVENTS.EFFECT_SPAWN, {
        type: 'match',
        positions: data.positions
      });
    }
  }
  
  // Handle score changes from grid system
  handleScoreChanged(data) {
    // Update game state with new score
    const currentScore = GameState.get('score') || 0;
    const newScore = currentScore + (data.points || 0);
    GameState.set('score', newScore);
    
    console.log('Score changed:', { currentScore, points: data.points, newScore });
    
    // Trigger visual effects if combo data available
    if (data.combo && data.positions) {
      EventBus.emit(EVENTS.EFFECT_SPAWN, {
        type: 'match',
        positions: data.positions,
        combo: data.combo
      });
    }
    
    // Check goal completion after score update
    this.checkGoalCompletion();
  }
  
  // Handle board settling after cascades
  handleBoardSettled() {
    // Check win conditions after all cascades complete
    this.checkGoalCompletion();
    
    // Check lose conditions
    this.checkLoseConditions();
  }
  
  // Check if level goal is met
  checkGoalCompletion() {
    const level = GameState.getCurrentLevel();
    const score = GameState.get('score');
    const collectCount = GameState.get('collectCount');
    const icedRemaining = GameState.get('icedRemaining');
    const specialCounts = GameState.get('specialCounts');
    
    console.log('checkGoalCompletion:', { 
      score, 
      target: level.goal.target, 
      goalType: level.goal.type,
      goalMet: score >= level.goal.target 
    });
    
    let goalMet = false;
    
    switch(level.goal.type) {
      case 'score':
        goalMet = score >= level.goal.target;
        break;
      case 'collect':
        goalMet = collectCount >= level.goal.target;
        break;
      case 'iced':
        goalMet = icedRemaining <= 0;
        break;
      case 'special':
        goalMet = Object.values(specialCounts).every(count => count >= level.goal.target);
        break;
      case 'timed':
        goalMet = score >= level.goal.target;
        break;
    }
    
    if (goalMet) {
      console.log('GOAL MET! Triggering level completion');
      EventBus.emit(EVENTS.LEVEL_COMPLETE, { 
        success: true,
        levelIndex: GameState.get('levelIndex'),
        score: score
      });
    }
  }
  
  // Check lose conditions
  checkLoseConditions() {
    const level = GameState.getCurrentLevel();
    const movesLeft = GameState.get('movesLeft');
    const timerRemaining = GameState.get('timerRemaining');
    
    console.log('checkLoseConditions:', { movesLeft, timerRemaining, levelType: level.goal.type });
    
    let lost = false;
    
    if (level.goal.type === 'timed') {
      lost = timerRemaining <= 0;
    } else {
      lost = movesLeft <= 0;
    }
    
    if (lost) {
      console.log('Game lost!', { movesLeft, timerRemaining, levelType: level.goal.type });
      EventBus.emit(EVENTS.LEVEL_COMPLETE, { 
        success: false,
        levelIndex: GameState.get('levelIndex'),
        score: GameState.get('score')
      });
    }
  }
  
  // Handle level completion
  handleLevelComplete(data) {
    console.log('handleLevelComplete called with:', data);
    
    // Prevent multiple completion triggers
    if (GameState.get('gamePhase') === 'complete' || GameState.get('gamePhase') === 'gameover') {
      console.log('Level already completed, ignoring duplicate trigger');
      return;
    }
    
    GameState.set('gamePhase', data.success ? 'complete' : 'gameover');
    
    // Stop timers and music
    EventBus.emit('timer:stop');
    EventBus.emit(EVENTS.AUDIO_STOP_MUSIC);
    console.log('Stopping music and timers...');
    
    // Play completion sound once
    console.log('Playing completion sound:', data.success ? 'pass' : 'fail');
    EventBus.emit(EVENTS.AUDIO_PLAY_SFX, { 
      sound: data.success ? 'pass' : 'fail' 
    });
    
    // Show completion modal
    EventBus.emit(EVENTS.UI_MODAL_SHOW, {
      type: 'levelComplete',
      success: data.success,
      levelIndex: data.levelIndex,
      score: data.score
    });
  }
  
  // Handle game phase changes
  handleGamePhaseChanged(data) {
    console.log('Game phase changed:', data.oldValue, '→', data.value);
    
    // Coordinate systems based on phase
    switch(data.value) {
      case 'playing':
        GameState.set('gridBusy', false);
        break;
      case 'paused':
        GameState.set('gridBusy', true);
        break;
      case 'complete':
      case 'gameover':
        GameState.set('gridBusy', true);
        break;
    }
  }
  
  // Pause game
  pauseGame() {
    GameState.set('gamePhase', 'paused');
    EventBus.emit('timer:pause');
    EventBus.emit(EVENTS.AUDIO_STOP_MUSIC);
  }
  
  // Resume game
  resumeGame() {
    GameState.set('gamePhase', 'playing');
    EventBus.emit('timer:resume');
    
    const level = GameState.getCurrentLevel();
    if (level && level.loop) {
      EventBus.emit(EVENTS.AUDIO_PLAY_MUSIC, { 
        track: level.loop 
      });
    }
  }
  
  // End game
  endGame() {
    this.running = false;
    GameState.set('gamePhase', 'menu');
    EventBus.emit('timer:stop');
    EventBus.emit(EVENTS.AUDIO_STOP_MUSIC);
  }
  
  // Shutdown and cleanup
  shutdown() {
    this.running = false;
    this.initialized = false;
    
    // Clear all event listeners
    EventBus.clear();
    
    console.log('Game engine shutdown');
  }
}

// Create global engine instance
const GameEngine = new GameEngineClass();

// Export for module usage
window.GameEngine = GameEngine;
