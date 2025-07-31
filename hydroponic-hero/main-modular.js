// Hydroponic Hero - Main Entry Point
// Ultra-modular architecture for maximum extensibility

import { gameEngine } from './js/core/engine.js';
import { AudioSystem } from './js/systems/audio.js';
import { TimerSystem } from './js/systems/timer.js';
import { RoomSystem } from './js/systems/rooms.js';
import { PlantManager } from './js/plants/manager.js';
import { PlantRenderer } from './js/plants/renderer.js';
import { ScreenManager } from './js/ui/screens.js';
import { OverlayManager } from './js/ui/overlay.js';
import { InputHandler } from './js/interactions/input.js';
import { EventBus } from './js/core/events.js';

// Game initialization
async function initGame() {
  try {
    console.log('🚀 Initializing Hydroponic Hero...');
    
    // Register all game systems
    gameEngine.registerSystem('audio', new AudioSystem());
    gameEngine.registerSystem('timer', new TimerSystem());
    gameEngine.registerSystem('rooms', new RoomSystem());
    gameEngine.registerSystem('plants', new PlantManager());
    gameEngine.registerSystem('plantRenderer', new PlantRenderer());
    gameEngine.registerSystem('screens', new ScreenManager());
    gameEngine.registerSystem('overlay', new OverlayManager());
    gameEngine.registerSystem('input', new InputHandler());
    
    // Initialize the game engine
    await gameEngine.init();
    
    // Load saved settings
    const inputSystem = gameEngine.getSystem('input');
    if (inputSystem) {
      inputSystem.loadSettings();
    }
    
    console.log('✅ Hydroponic Hero initialized successfully');
    
    // Setup global debugging (optional)
    setupDebugAPI();
    
  } catch (error) {
    console.error('❌ Failed to initialize game:', error);
  }
}

// Global debug API for development
function setupDebugAPI() {
  if (typeof window !== 'undefined') {
    window.gameDebug = {
      engine: gameEngine,
      events: EventBus,
      getSystem: (name) => gameEngine.getSystem(name),
      waterPlant: (plantId, amount = 20) => {
        const plantManager = gameEngine.getSystem('plants');
        if (plantManager) plantManager.waterPlant(plantId, amount);
      },
      playSfx: (name) => {
        const audioSystem = gameEngine.getSystem('audio');
        if (audioSystem) audioSystem.playSfx(name);
      },
      startGame: () => gameEngine.start(),
      resetGame: () => gameEngine.reset()
    };
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);

// Graceful shutdown on page unload
window.addEventListener('beforeunload', () => {
  gameEngine.stop();
});
