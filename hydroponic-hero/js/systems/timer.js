// Timer System - Game timer and countdown management
import { gameState, setState } from '../core/state.js';
import { EventBus, EVENTS } from '../core/events.js';

export class TimerSystem {
  constructor() {
    this.setupEventListeners();
  }
  
  init() {
    console.log('Timer system initialized');
  }
  
  start(duration = 90) {
    gameState.timeRemaining = duration;
    
    if (gameState.countInterval) {
      clearInterval(gameState.countInterval);
    }
    
    gameState.countInterval = setInterval(() => {
      gameState.timeRemaining--;
      this.updateTimerDisplay();
      
      // Special events at specific times
      if (gameState.timeRemaining === 30) {
        EventBus.emit('timer:powerup');
      }
      
      if (gameState.timeRemaining <= 0) {
        this.stop();
        EventBus.emit('timer:complete');
      }
      
      EventBus.emit('timer:tick', gameState.timeRemaining);
    }, 1000);
    
    EventBus.emit('timer:started', duration);
  }
  
  stop() {
    if (gameState.countInterval) {
      clearInterval(gameState.countInterval);
      gameState.countInterval = null;
    }
    EventBus.emit('timer:stopped');
  }
  
  updateTimerDisplay() {
    const timerEl = document.getElementById('timeRemaining');
    if (timerEl) {
      timerEl.textContent = gameState.timeRemaining;
    }
  }
  
  setupEventListeners() {
    EventBus.on(EVENTS.GAME_START, () => this.start());
    EventBus.on(EVENTS.GAME_STOP, () => this.stop());
    EventBus.on(EVENTS.GAME_RESET, () => this.stop());
  }
  
  reset() {
    this.stop();
    gameState.timeRemaining = 90;
    this.updateTimerDisplay();
  }
}
