// Screen Manager - Handle screen transitions and states
import { gameState, setUIState } from '../core/state.js';
import { EventBus, EVENTS } from '../core/events.js';

export class ScreenManager {
  constructor() {
    this.screens = new Map();
    this.setupEventListeners();
  }
  
  init() {
    // Register available screens
    this.registerScreen('intro', document.getElementById('intro'));
    this.registerScreen('game', document.getElementById('game'));
    
    this.showScreen('intro');
    console.log('Screen manager initialized');
  }
  
  registerScreen(id, element) {
    if (element) {
      this.screens.set(id, element);
    }
  }
  
  showScreen(screenId) {
    // Hide all screens
    this.screens.forEach((element, id) => {
      element.classList.add('hidden');
    });
    
    // Show target screen
    const targetScreen = this.screens.get(screenId);
    if (targetScreen) {
      targetScreen.classList.remove('hidden');
      setUIState({ currentScreen: screenId });
      EventBus.emit(EVENTS.UI_SCREEN_CHANGE, screenId);
    }
  }
  
  getCurrentScreen() {
    return gameState.ui.currentScreen;
  }
  
  setupEventListeners() {
    EventBus.on(EVENTS.GAME_START, () => this.showScreen('game'));
    EventBus.on(EVENTS.GAME_RESET, () => this.showScreen('intro'));
  }
}
