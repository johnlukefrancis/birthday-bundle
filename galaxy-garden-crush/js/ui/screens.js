// UI Management System for Galaxy Garden Crush
class UISystemClass {
  constructor() {
    this.elements = {};
    this.initialized = false;
    
    this.setupEventListeners();
  }
  
  // Set up event listeners
  setupEventListeners() {
    EventBus.on(EVENTS.GAME_INIT, () => this.initialize());
    EventBus.on(EVENTS.UI_SCREEN_CHANGE, (data) => this.handleScreenChange(data));
    EventBus.on(EVENTS.UI_MODAL_SHOW, (data) => this.showModal(data));
    EventBus.on(EVENTS.UI_MODAL_HIDE, () => this.hideModal());
    EventBus.on(EVENTS.UI_HUD_UPDATE, (data) => this.updateHUD(data));
    
    // State change listeners for HUD updates
    EventBus.on('state:scoreChanged', (data) => this.updateScore(data.value));
    EventBus.on('state:movesLeftChanged', (data) => this.updateMoves(data.value));
    EventBus.on('state:timerRemainingChanged', (data) => this.updateTimer(data.value));
    EventBus.on('state:levelIndexChanged', (data) => this.updateLevel(data.value));
    EventBus.on('state:gamePhaseChanged', (data) => this.handleGamePhaseChange(data));
    
    // Settings UI updates
    EventBus.on('ui:volumeChanged', (data) => this.updateVolumeSlider(data.volume));
    EventBus.on('ui:muteChanged', (data) => this.updateMuteButton(data.muted));
    EventBus.on('settings:contrastChanged', (data) => this.updateContrast(data.highContrast));
    
    // Loading progress
    EventBus.on('loading:started', () => this.showLoader());
    EventBus.on('loading:complete', () => this.hideLoader());
    EventBus.on('loading:progress', (data) => this.updateLoadProgress(data));
  }
  
  // Initialize UI system
  initialize() {
    this.cacheElements();
    this.setupControls();
    this.updateHUDFromState();
    
    this.initialized = true;
    console.log('UI system initialized');
  }
  
  // Cache DOM elements
  cacheElements() {
    this.elements = {
      // Main containers
      loader: document.getElementById('loader'),
      game: document.getElementById('game'),
      gridContainer: document.getElementById('grid-container'),
      modal: document.getElementById('modal'),
      
      // Loader elements
      loadProgress: document.getElementById('load-progress'),
      progressFill: document.getElementById('progress-fill'),
      
      // HUD elements
      levelName: document.getElementById('level-name'),
      goalText: document.getElementById('goal-text'),
      scoreText: document.getElementById('score-text'),
      movesText: document.getElementById('moves-text'),
      timerText: document.getElementById('timer-text'),
      
      // Modal elements
      modalTitle: document.getElementById('modal-title'),
      modalMessage: document.getElementById('modal-message'),
      modalBtn: document.getElementById('modal-close'),
      
      // Control elements
      contrastToggle: document.getElementById('contrastToggle'),
      volumeSlider: document.getElementById('volumeSlider'),
      muteBtn: document.getElementById('muteBtn')
    };
    
    // Verify all elements exist
    for (const [name, element] of Object.entries(this.elements)) {
      if (!element) {
        console.error(`UI element not found: ${name}`);
      }
    }
  }
  
  // Set up control event handlers
  setupControls() {
    // Volume slider
    if (this.elements.volumeSlider) {
      this.elements.volumeSlider.addEventListener('input', (e) => {
        const volume = parseFloat(e.target.value);
        EventBus.emit(EVENTS.AUDIO_VOLUME_CHANGED, { volume });
      });
    }
    
    // Mute button
    if (this.elements.muteBtn) {
      this.elements.muteBtn.addEventListener('click', () => {
        const muted = !GameState.get('muted');
        EventBus.emit(EVENTS.AUDIO_MUTE_TOGGLED, { muted });
      });
    }
    
    // Contrast toggle
    if (this.elements.contrastToggle) {
      this.elements.contrastToggle.addEventListener('change', (e) => {
        const highContrast = e.target.checked;
        GameState.set('highContrast', highContrast);
        GameState.saveSettings();
        this.updateContrast(highContrast);
      });
    }
    
    // Modal close button
    if (this.elements.modalBtn) {
      this.elements.modalBtn.addEventListener('click', () => {
        EventBus.emit('modal:close');
      });
    }
  }
  
  // Handle screen transitions
  handleScreenChange(data) {
    const { from, to } = data;
    
    switch(to) {
      case 'menu':
        this.showGame();
        break;
      case 'playing':
        this.showGame();
        break;
      case 'loading':
        this.showLoader();
        break;
    }
    
    console.log(`Screen change: ${from} → ${to}`);
  }
  
  // Show loader screen
  showLoader() {
    if (this.elements.loader) {
      this.elements.loader.classList.remove('hidden');
    }
    if (this.elements.game) {
      this.elements.game.classList.add('hidden');
    }
  }
  
  // Hide loader screen
  hideLoader() {
    if (this.elements.loader) {
      this.elements.loader.classList.add('hidden');
    }
    if (this.elements.game) {
      this.elements.game.classList.remove('hidden');
    }
  }
  
  // Show game screen
  showGame() {
    this.hideLoader();
    if (this.elements.game) {
      this.elements.game.classList.remove('hidden');
    }
  }
  
  // Update loading progress
  updateLoadProgress(data) {
    const progress = Math.min(100, Math.max(0, data.progress || 0));
    
    console.log(`Loading progress: ${data.system} - ${progress}%`);
    
    if (this.elements.loadProgress) {
      this.elements.loadProgress.textContent = `${Math.round(progress)}%`;
    }
    
    if (this.elements.progressFill) {
      this.elements.progressFill.style.width = `${progress}%`;
    }
    
    // Update global progress
    GameState.set('loadProgress', progress);
    
    // If loading seems stuck at 0% for too long, provide feedback
    if (progress === 0 && !this.loadingStuckWarning) {
      setTimeout(() => {
        const currentProgress = GameState.get('loadProgress') || 0;
        if (currentProgress === 0) {
          this.loadingStuckWarning = true;
          console.warn('Loading appears stuck - this may be due to large audio files');
          if (this.elements.loadProgress) {
            this.elements.loadProgress.textContent = 'Loading large files...';
          }
        }
      }, 5000); // 5 second delay
    }
  }
  
  // Update HUD from current state
  updateHUDFromState() {
    const state = GameState.getState();
    
    this.updateLevel(state.levelIndex);
    this.updateScore(state.score);
    this.updateMoves(state.movesLeft);
    this.updateTimer(state.timerRemaining);
    this.updateGoalText();
    
    // Update controls
    this.updateVolumeSlider(state.volume);
    this.updateMuteButton(state.muted);
    this.updateContrast(state.highContrast);
  }
  
  // Update level display
  updateLevel(levelIndex) {
    console.log('updateLevel called with:', levelIndex);
    const level = GameState.levels[levelIndex];
    console.log('Level data:', level);
    
    if (level && this.elements.levelName) {
      const levelText = `Level ${parseInt(levelIndex) + 1}`;
      console.log('Setting level text to:', levelText);
      this.elements.levelName.textContent = levelText;
    }
    this.updateGoalText();
  }
  
  // Update score display
  updateScore(score) {
    if (this.elements.scoreText) {
      this.elements.scoreText.textContent = `Score: ${score}`;
    }
  }
  
  // Update moves display
  updateMoves(movesLeft) {
    const level = GameState.getCurrentLevel();
    if (level && level.goal.type !== 'timed' && this.elements.movesText) {
      this.elements.movesText.textContent = `Moves: ${movesLeft}`;
    } else if (this.elements.movesText) {
      this.elements.movesText.textContent = '';
    }
  }
  
  // Update timer display
  updateTimer(timerRemaining) {
    const level = GameState.getCurrentLevel();
    if (level && level.goal.type === 'timed' && this.elements.timerText) {
      this.elements.timerText.textContent = `Time: ${this.formatTime(timerRemaining)}`;
    } else if (this.elements.timerText) {
      this.elements.timerText.textContent = '';
    }
  }
  
  // Update goal text based on current level and progress
  updateGoalText() {
    const level = GameState.getCurrentLevel();
    if (!level || !this.elements.goalText) return;
    
    const state = GameState.getState();
    let text = '';
    
    switch(level.goal.type) {
      case 'score':
        text = `Reach ${level.goal.target} points`;
        break;
      case 'collect':
        const remaining = level.goal.target - state.collectCount;
        text = `Collect ${level.goal.target} Rose buds (${remaining} left)`;
        break;
      case 'iced':
        text = `Break all iced cells (${state.icedRemaining} left)`;
        break;
      case 'special':
        text = `Create ${level.goal.target} of each power-up`;
        break;
      case 'timed':
        text = `Score ${level.goal.target} in ${level.time}s`;
        break;
    }
    
    this.elements.goalText.textContent = text;
  }
  
  // Format time for display
  formatTime(seconds) {
    const s = Math.floor(seconds % 60);
    const m = Math.floor(seconds / 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
  
  // Show modal dialog
  showModal(data) {
    console.log('showModal called with:', data);
    
    if (!this.elements.modal) {
      console.error('Modal element not found!');
      return;
    }
    
    const { type, success, levelIndex, score } = data;
    
    if (type === 'levelComplete') {
      console.log('Showing level complete modal');
      this.elements.modalTitle.textContent = success ? 'Level Cleared!' : 'Level Failed';
      
      if (success) {
        const messages = [
          'Mom\'s garden glows brighter!',
          'The stars sway to your rhythm.',
          'You watered the cosmos with love.',
          'Brad & Tiffany cheer you on!',
          'Soul grooves echo through space.'
        ];
        this.elements.modalMessage.textContent = 
          messages[Math.floor(Math.random() * messages.length)];
      } else {
        this.elements.modalMessage.textContent = 
          'Don\'t worry – try again and keep groovin\'!';
      }
      
      this.elements.modalBtn.textContent = 'Continue';
      
      // Set up modal close handler
      const closeHandler = () => {
        console.log('Modal continue button clicked');
        this.hideModal();
        this.handleLevelCompleteClose(success, levelIndex);
      };
      
      this.elements.modalBtn.onclick = closeHandler;
    }
    
    this.elements.modal.classList.remove('hidden');
    console.log('Modal should now be visible');
  }
  
  // Hide modal dialog
  hideModal() {
    if (this.elements.modal) {
      this.elements.modal.classList.add('hidden');
    }
  }
  
  // Handle level complete modal close
  handleLevelCompleteClose(success, levelIndex) {
    if (success) {
      // Check if there's a next level
      if (GameState.hasNextLevel()) {
        const nextLevel = levelIndex + 1;
        if (window.GameEngine) {
          GameEngine.startLevel(nextLevel);
        }
      } else {
        // Game completed
        this.showGameCompleteModal();
      }
    } else {
      // Retry current level using engine method
      if (window.GameEngine) {
        GameEngine.startLevel(levelIndex);
      }
    }
  }
  
  // Show game complete modal
  showGameCompleteModal() {
    if (!this.elements.modal) return;
    
    this.elements.modalTitle.textContent = 'All Levels Complete!';
    this.elements.modalMessage.textContent = 
      'You mastered the Galaxy Garden. Happy Birthday, Mom!';
    this.elements.modalBtn.textContent = 'Restart';
    
    this.elements.modalBtn.onclick = () => {
      this.hideModal();
      GameState.reset();
      if (window.GameEngine) {
        GameEngine.startLevel(0);
      }
    };
    
    this.elements.modal.classList.remove('hidden');
  }
  
  // Update volume slider
  updateVolumeSlider(volume) {
    if (this.elements.volumeSlider) {
      this.elements.volumeSlider.value = volume;
    }
  }
  
  // Update mute button
  updateMuteButton(muted) {
    if (this.elements.muteBtn) {
      this.elements.muteBtn.textContent = muted ? '🔇' : '🔈';
    }
  }
  
  // Update contrast setting
  updateContrast(highContrast) {
    if (this.elements.contrastToggle) {
      this.elements.contrastToggle.checked = highContrast;
    }
    
    // Apply contrast class to body
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }
  
  // Handle game phase changes
  handleGamePhaseChange(data) {
    const { value: phase } = data;
    
    // Update UI based on game phase
    switch(phase) {
      case 'playing':
        // Ensure game UI is visible
        this.showGame();
        break;
      case 'paused':
        // Could show pause overlay here
        break;
      case 'complete':
      case 'gameover':
        // Modal is already shown by level complete event
        break;
    }
  }
  
  // Get UI element reference
  getElement(name) {
    return this.elements[name];
  }
  
  // Check if UI is initialized
  isInitialized() {
    return this.initialized;
  }
}

// Create global UI system instance
const UISystem = new UISystemClass();

// Additional event listeners
EventBus.on('modal:close', () => UISystem.hideModal());
EventBus.on('state:collectCountChanged', () => UISystem.updateGoalText());
EventBus.on('state:icedRemainingChanged', () => UISystem.updateGoalText());
EventBus.on('state:specialCountsChanged', () => UISystem.updateGoalText());

// Export for module usage
window.UISystem = UISystem;
