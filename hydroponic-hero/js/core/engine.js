// Core Game Engine - Main game loop and initialization
import { gameState } from './state.js';
import { EventBus } from './events.js';

export class GameEngine {
  constructor() {
    this.initialized = false;
    this.systems = new Map();
  }
  
  // Register a game system
  registerSystem(name, system) {
    this.systems.set(name, system);
    if (system.init && typeof system.init === 'function') {
      system.init();
    }
  }
  
  // Get a registered system
  getSystem(name) {
    return this.systems.get(name);
  }
  
  // Initialize the game
  async init() {
    if (this.initialized) return;
    
    EventBus.emit('game:initializing');
    
    // Initialize all systems
    for (const [name, system] of this.systems) {
      if (system.init) {
        await system.init();
      }
    }
    
    this.initialized = true;
    EventBus.emit('game:initialized');
  }
  
  // Start the game
  start() {
    if (!this.initialized) {
      throw new Error('Game must be initialized before starting');
    }
    
    gameState.running = true;
    gameState.lastFrame = null;
    
    EventBus.emit('game:started');
    this.gameLoop();
  }
  
  // Stop the game
  stop() {
    gameState.running = false;
    EventBus.emit('game:stopped');
  }
  
  // Main game loop
  gameLoop(timestamp) {
    if (!gameState.running) return;
    
    if (!gameState.lastFrame) gameState.lastFrame = timestamp;
    const delta = (timestamp - gameState.lastFrame) / 1000;
    gameState.lastFrame = timestamp;
    
    // Update all systems
    for (const [name, system] of this.systems) {
      if (system.update && typeof system.update === 'function') {
        system.update(delta);
      }
    }
    
    requestAnimationFrame((ts) => this.gameLoop(ts));
  }
  
  // Reset the game
  reset() {
    this.stop();
    
    // Reset state
    gameState.timeRemaining = 90;
    gameState.currentRoom = null;
    
    // Reset all systems
    for (const [name, system] of this.systems) {
      if (system.reset && typeof system.reset === 'function') {
        system.reset();
      }
    }
    
    EventBus.emit('game:reset');
  }
}

// Global game engine instance
export const gameEngine = new GameEngine();
