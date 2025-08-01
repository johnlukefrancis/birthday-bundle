// Galaxy Garden Crush - Modular Game Initialization
// This replaces the old monolithic game.js structure

(function() {
  'use strict';
  
  // Game initialization function
  async function initializeGame() {
    console.log('Initializing Galaxy Garden Crush (Modular)...');
    
    try {
      // Initialize all systems
      await GameEngine.initialize();
      
      // Start the game and first level
      EventBus.emit(EVENTS.GAME_START);
      
      // Start level 1 immediately using the engine's method
      setTimeout(() => {
        if (window.GameEngine) {
          GameEngine.startLevel(0);
        }
      }, 100);
      
      console.log('Galaxy Garden Crush initialized successfully');
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      
      // Show error to user
      const loader = document.getElementById('loader');
      if (loader) {
        const content = loader.querySelector('.loader-content p');
        if (content) {
          content.textContent = 'Failed to load game. Please refresh the page.';
        }
      }
    }
  }
  
  // Enhanced asset loading coordination
  let loadedSystems = 0;
  const totalSystems = 6; // audio, sprites, ui, grid, input, timer
  
  function updateSystemLoadProgress() {
    loadedSystems++;
    const progress = (loadedSystems / totalSystems) * 100;
    
    EventBus.emit('loading:progress', {
      system: 'global',
      progress: progress
    });
    
    if (loadedSystems >= totalSystems) {
      console.log('All systems loaded');
    }
  }
  
  // Set up loading progress tracking
  EventBus.on('system:loaded', updateSystemLoadProgress);
  
  // Override engine initialization methods to connect with actual modules
  GameEngine.initializeAudioSystem = async function() {
    if (AudioSystem.initialize) {
      AudioSystem.initialize();
    }
    console.log('Audio system ready');
  };
  
  GameEngine.initializeGridSystem = async function() {
    if (GridSystem.initialize) {
      GridSystem.initialize();
    }
    console.log('Grid system ready');
  };
  
  GameEngine.initializeInputSystem = async function() {
    if (InputSystem.initialize) {
      InputSystem.initialize();
    }
    console.log('Input system ready');
  };
  
  GameEngine.initializeUISystem = async function() {
    // UI system initializes automatically via GAME_INIT event
    console.log('UI system ready');
  };
  
  GameEngine.initializeScoringSystem = async function() {
    if (ScoringSystem.initialize) {
      ScoringSystem.initialize();
    }
    console.log('Scoring system ready');
  };
  
  GameEngine.initializeTimerSystem = async function() {
    if (TimerSystem.initialize) {
      TimerSystem.initialize();
    }
    console.log('Timer system ready');
  };
  
  // Enhanced asset loading with progress tracking
  GameEngine.loadAssets = async function() {
    console.log('Loading game assets...');
    
    const loadPromises = [];
    let loadedCount = 0;
    const totalAssets = AudioSystem.audioAssets.length + Object.keys(sprites).length;
    
    function updateProgress() {
      loadedCount++;
      const progress = (loadedCount / totalAssets) * 100;
      EventBus.emit('loading:progress', {
        system: 'assets',
        progress: progress
      });
      
      // Update global progress
      GameState.set('loadProgress', progress);
    }
    
    // Load audio assets
    loadPromises.push(
      AudioSystem.loadAudioAssets().then(() => {
        EventBus.emit('system:loaded', { system: 'audio' });
      })
    );
    
    // Sprites are already loaded via sprites.js
    // Just mark as complete
    setTimeout(() => {
      EventBus.emit('system:loaded', { system: 'sprites' });
    }, 100);
    
    // Wait for all assets
    await Promise.all(loadPromises);
    
    // Final progress update
    GameState.set('loadProgress', 100);
    console.log('Assets loaded successfully');
  };
  
  // Wait for DOM and sprites to be ready
  function waitForDependencies() {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (document.readyState === 'complete' && 
            window.sprites && 
            window.EventBus && 
            window.GameState) {
          resolve();
        } else {
          setTimeout(checkReady, 50);
        }
      };
      checkReady();
    });
  }
  
  // Start game when ready
  waitForDependencies().then(() => {
    initializeGame();
  });
  
  // Global error handling
  window.addEventListener('error', (event) => {
    console.error('Game error:', event.error);
    
    // Try to show error to user
    const errorMessage = 'A game error occurred. Please refresh the page.';
    
    // Show in modal if available
    if (window.UISystem && UISystem.isInitialized()) {
      EventBus.emit(EVENTS.UI_MODAL_SHOW, {
        type: 'error',
        title: 'Error',
        message: errorMessage
      });
    } else {
      // Fallback to alert
      alert(errorMessage);
    }
  });
  
  // Export initialization function for debugging
  window.reinitializeGame = initializeGame;
  
})();
